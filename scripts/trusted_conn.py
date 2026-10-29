"""Trusted CONN solutions, shared by build_conn.py and the brute-force cross-check (cross_conn.py)."""

# P1: the group (strongly connected component) of one junction: reached from s and reaching s.
GROUP = """
def group_of(n, streets, s):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)

    def reach(adj):
        seen = [False] * n
        seen[s] = True
        stack = [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
        return seen

    f = reach(out)
    b = reach(back)
    return [v for v in range(n) if f[v] and b[v]]
"""

GROUP_BRUTE = """
def group_of(n, streets, s):
    r = [[i == j for j in range(n)] for i in range(n)]
    for u, v in streets:
        r[u][v] = True
    for k in range(n):
        for i in range(n):
            if r[i][k]:
                for j in range(n):
                    if r[k][j]:
                        r[i][j] = True
    return [v for v in range(n) if r[s][v] and r[v][s]]
"""

# P2: every group, numbered in an order where every street goes from a group to the same or a later one.
SCC = """
def scc(n, streets):
    adj = [[] for _ in range(n)]
    for u, v in streets:
        adj[u].append(v)
    index = [0] * n          # discovery number, 1, 2, ...; 0 means not reached
    low = [0] * n
    on = [False] * n
    comp = [-1] * n
    stack = []               # Tarjan's stack of vertices
    t = 0
    count = 0
    for s in range(n):
        if index[s]:
            continue
        t += 1
        index[s] = low[s] = t
        stack.append(s)
        on[s] = True
        path = [(s, iter(adj[s]))]
        while path:
            u, it = path[-1]
            for v in it:
                if not index[v]:
                    t += 1
                    index[v] = low[v] = t
                    stack.append(v)
                    on[v] = True
                    path.append((v, iter(adj[v])))
                    break
                if on[v] and index[v] < low[u]:
                    low[u] = index[v]
            else:
                path.pop()
                if path:
                    p = path[-1][0]
                    if low[u] < low[p]:
                        low[p] = low[u]
                if low[u] == index[u]:
                    while True:
                        x = stack.pop()
                        on[x] = False
                        comp[x] = count
                        if x == u:
                            break
                    count += 1
    # Tarjan finishes groups in reverse topological order
    return [count - 1 - c for c in comp]
"""

SCC_BRUTE = """
def scc(n, streets):
    r = [[i == j for j in range(n)] for i in range(n)]
    for u, v in streets:
        r[u][v] = True
    for k in range(n):
        for i in range(n):
            if r[i][k]:
                for j in range(n):
                    if r[k][j]:
                        r[i][j] = True
    return [frozenset(v for v in range(n) if r[u][v] and r[v][u]) for u in range(n)]
"""

# P3: bridges (edge positions) and cut vertices of an undirected graph, in one search.
WEAK = """
def weak_points(n, edges):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        if u != v:
            adj[u].append((v, i))
            adj[v].append((u, i))
    disc = [0] * n
    low = [0] * n
    cut = [False] * n
    bridges = []
    t = 0
    for s in range(n):
        if disc[s]:
            continue
        t += 1
        disc[s] = low[s] = t
        children = 0
        stack = [(s, -1, iter(adj[s]))]
        while stack:
            u, pe, it = stack[-1]
            for v, i in it:
                if i == pe:
                    continue
                if disc[v]:
                    if disc[v] < low[u]:
                        low[u] = disc[v]
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, i, iter(adj[v])))
                    break
            else:
                stack.pop()
                if stack:
                    p = stack[-1][0]
                    if low[u] < low[p]:
                        low[p] = low[u]
                    if low[u] > disc[p]:
                        bridges.append(pe)
                    if p == s:
                        children += 1
                    elif low[u] >= disc[p]:
                        cut[p] = True
        if children >= 2:
            cut[s] = True
    bridges.sort()
    return bridges, [v for v in range(n) if cut[v]]
"""

WEAK_BRUTE = """
def weak_points(n, edges):
    def parts(skip_edge=-1, skip_vertex=-1):
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x
        for i, (u, v) in enumerate(edges):
            if i == skip_edge or u == skip_vertex or v == skip_vertex:
                continue
            parent[find(u)] = find(v)
        return len({find(x) for x in range(n) if x != skip_vertex})
    base = parts()
    bridges = [i for i in range(len(edges)) if parts(skip_edge=i) > base]
    cuts = [v for v in range(n) if parts(skip_vertex=v) > base]
    return bridges, cuts
"""

# P4: 2-SAT with the implication graph; None when no assignment works.
SAT = """
def two_sat(n, clauses):
    N = 2 * n
    node = lambda lit: 2 * (lit - 1) if lit > 0 else 2 * (-lit - 1) + 1
    adj = [[] for _ in range(N)]
    for a, b in clauses:
        x, y = node(a), node(b)
        adj[x ^ 1].append(y)          # not a -> b
        adj[y ^ 1].append(x)          # not b -> a
    index = [0] * N
    low = [0] * N
    on = [False] * N
    comp = [-1] * N
    stack = []
    t = 0
    count = 0
    for s in range(N):
        if index[s]:
            continue
        t += 1
        index[s] = low[s] = t
        stack.append(s)
        on[s] = True
        path = [(s, iter(adj[s]))]
        while path:
            u, it = path[-1]
            for v in it:
                if not index[v]:
                    t += 1
                    index[v] = low[v] = t
                    stack.append(v)
                    on[v] = True
                    path.append((v, iter(adj[v])))
                    break
                if on[v] and index[v] < low[u]:
                    low[u] = index[v]
            else:
                path.pop()
                if path:
                    p = path[-1][0]
                    if low[u] < low[p]:
                        low[p] = low[u]
                if low[u] == index[u]:
                    while True:
                        x = stack.pop()
                        on[x] = False
                        comp[x] = count
                        if x == u:
                            break
                    count += 1
    ans = []
    for k in range(n):
        if comp[2 * k] == comp[2 * k + 1]:
            return None
        ans.append(comp[2 * k] < comp[2 * k + 1])   # Tarjan numbers later groups first
    return ans
"""

SAT_BRUTE = """
def two_sat(n, clauses):
    for m in range(2 ** n):
        val = [(m >> k) & 1 == 1 for k in range(n)]
        lit = lambda a: val[a - 1] if a > 0 else not val[-a - 1]
        if all(lit(a) or lit(b) for a, b in clauses):
            return val
    return None
"""
