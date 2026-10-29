# Naive CONN solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def group_of(n, streets, s):
    # one fresh search from every junction s reaches, to see if it gets back to s
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    def reach(a):
        seen = {a}
        stack = [a]
        while stack:
            u = stack.pop()
            for v in out[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        return seen
    return sorted(v for v in reach(s) if s in reach(v))
''', [6, 7, 8]),
    2: ('''
def scc(n, streets):
    # Tarjan's method with recursion, numbers turned round
    import sys
    sys.setrecursionlimit(10_000)
    adj = [[] for _ in range(n)]
    for u, v in streets:
        adj[u].append(v)
    index = [0] * n
    low = [0] * n
    on = [False] * n
    comp = [-1] * n
    stack = []
    t = 0
    count = 0
    def visit(u):
        nonlocal t, count
        t += 1
        index[u] = low[u] = t
        stack.append(u)
        on[u] = True
        for v in adj[u]:
            if not index[v]:
                visit(v)
                low[u] = min(low[u], low[v])
            elif on[v]:
                low[u] = min(low[u], index[v])
        if low[u] == index[u]:
            while True:
                x = stack.pop()
                on[x] = False
                comp[x] = count
                if x == u:
                    break
            count += 1
    for s in range(n):
        if not index[s]:
            visit(s)
    return [count - 1 - c for c in comp]
''', [7, 8]),
    3: ('''
def weak_points(n, lines):
    # close each line (and each station) in turn and count the parts again
    def parts(skip_line=-1, skip_station=-1):
        adj = [[] for _ in range(n)]
        for i, (u, v) in enumerate(lines):
            if i != skip_line and u != skip_station and v != skip_station:
                adj[u].append(v)
                adj[v].append(u)
        seen = [False] * n
        c = 0
        for s in range(n):
            if s == skip_station or seen[s]:
                continue
            c += 1
            seen[s] = True
            stack = [s]
            while stack:
                u = stack.pop()
                for v in adj[u]:
                    if not seen[v]:
                        seen[v] = True
                        stack.append(v)
        return c
    base = parts()
    bridges = [i for i in range(len(lines)) if parts(skip_line=i) > base]
    cuts = [v for v in range(n) if parts(skip_station=v) > base]
    return bridges, cuts
''', [8, 9, 10]),
    4: ('''
def two_sat(n, rules):
    # try every list of answers
    from itertools import product
    for val in product([False, True], repeat=n):
        ok = True
        for a, b in rules:
            va = val[a - 1] if a > 0 else not val[-a - 1]
            vb = val[b - 1] if b > 0 else not val[-b - 1]
            if not (va or vb):
                ok = False
                break
        if ok:
            return list(val)
    return None
''', [8, 9, 10, 11]),
}

# Wrong or slow versions run by hand (not by check-problems.py): {name: (problem, code, tests that must catch it)}.
EXTRA = {
    "P1 only the junctions s can reach": (1, '''
def group_of(n, streets, s):
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    seen = [False] * n
    seen[s] = True
    stack = [s]
    while stack:
        u = stack.pop()
        for v in out[u]:
            if not seen[v]:
                seen[v] = True
                stack.append(v)
    return [v for v in range(n) if seen[v]]
''', [0, 1, 8, 9]),
    "P2 Tarjan's numbers not turned round": (2, '''
def scc(n, streets):
    adj = [[] for _ in range(n)]
    for u, v in streets:
        adj[u].append(v)
    index = [0] * n
    low = [0] * n
    on = [False] * n
    comp = [-1] * n
    stack = []
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
                if on[v]:
                    low[u] = min(low[u], index[v])
            else:
                path.pop()
                if path:
                    p = path[-1][0]
                    low[p] = min(low[p], low[u])
                if low[u] == index[u]:
                    while True:
                        x = stack.pop()
                        on[x] = False
                        comp[x] = count
                        if x == u:
                            break
                    count += 1
    return comp
''', [0, 1, 7]),
    "P2 Tarjan that lowers low through finished groups": (2, '''
def scc(n, streets):
    adj = [[] for _ in range(n)]
    for u, v in streets:
        adj[u].append(v)
    index = [0] * n
    low = [0] * n
    comp = [-1] * n
    stack = []
    t = 0
    count = 0
    for s in range(n):
        if index[s]:
            continue
        t += 1
        index[s] = low[s] = t
        stack.append(s)
        path = [(s, iter(adj[s]))]
        while path:
            u, it = path[-1]
            for v in it:
                if not index[v]:
                    t += 1
                    index[v] = low[v] = t
                    stack.append(v)
                    path.append((v, iter(adj[v])))
                    break
                low[u] = min(low[u], index[v])     # forgets to ask: is v still on the stack?
            else:
                path.pop()
                if path:
                    p = path[-1][0]
                    low[p] = min(low[p], low[u])
                if low[u] == index[u]:
                    while True:
                        x = stack.pop()
                        comp[x] = count
                        if x == u:
                            break
                    count += 1
    return [count - 1 - c for c in comp]
''', [6]),
    "P2 Kosaraju's second pass in the wrong order": (2, '''
def scc(n, streets):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)
    seen = [False] * n
    order = []
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(out[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(out[v])))
                    break
            else:
                stack.pop()
                order.append(u)
    group = [-1] * n
    c = 0
    for s in order:                         # earliest finish first: wrong
        if group[s] != -1:
            continue
        group[s] = c
        stack = [s]
        while stack:
            u = stack.pop()
            for v in back[u]:
                if group[v] == -1:
                    group[v] = c
                    stack.append(v)
        c += 1
    return group
''', [0]),
    "P3 skips every line back to the parent station": (3, '''
def weak_points(n, lines):
    adj = [[] for _ in range(n)]
    for u, v in lines:
        if u != v:
            adj[u].append(v)
            adj[v].append(u)
    disc = [0] * n
    low = [0] * n
    cut = [False] * n
    bridges = set()
    t = 0
    for s in range(n):
        if disc[s]:
            continue
        t += 1
        disc[s] = low[s] = t
        children = 0
        stack = [(s, -1, iter(adj[s]))]
        while stack:
            u, par, it = stack[-1]
            for v in it:
                if v == par:
                    continue
                if disc[v]:
                    low[u] = min(low[u], disc[v])
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, u, iter(adj[v])))
                    break
            else:
                stack.pop()
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        bridges.add((min(p, u), max(p, u)))
                    if p == s:
                        children += 1
                    elif low[u] >= disc[p]:
                        cut[p] = True
        if children >= 2:
            cut[s] = True
    return [i for i, (u, v) in enumerate(lines) if (min(u, v), max(u, v)) in bridges], [v for v in range(n) if cut[v]]
''', [1, 10]),
    "P3 the start is never a cut station": (3, '''
def weak_points(n, lines):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(lines):
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
        stack = [(s, -1, iter(adj[s]))]
        while stack:
            u, came, it = stack[-1]
            for v, i in it:
                if i == came:
                    continue
                if disc[v]:
                    low[u] = min(low[u], disc[v])
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, i, iter(adj[v])))
                    break
            else:
                stack.pop()
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        bridges.append(came)
                    if p != s and low[u] >= disc[p]:
                        cut[p] = True
    return sorted(bridges), [v for v in range(n) if cut[v]]
''', [3, 10]),
    "P3 the start is a cut station like any other": (3, '''
def weak_points(n, lines):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(lines):
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
        stack = [(s, -1, iter(adj[s]))]
        while stack:
            u, came, it = stack[-1]
            for v, i in it:
                if i == came:
                    continue
                if disc[v]:
                    low[u] = min(low[u], disc[v])
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, i, iter(adj[v])))
                    break
            else:
                stack.pop()
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        bridges.append(came)
                    if low[u] >= disc[p]:
                        cut[p] = True
    return sorted(bridges), [v for v in range(n) if cut[v]]
''', [0, 4]),
    "P4 guess yes, follow what it forces, never take it back": (4, '''
def two_sat(n, rules):
    val = [None] * (n + 1)
    def holds(x):
        v = val[abs(x)]
        return None if v is None else (v if x > 0 else not v)
    for k in range(1, n + 1):
        if val[k] is None:
            val[k] = True
            changed = True
            while changed:
                changed = False
                for a, b in rules:
                    ha, hb = holds(a), holds(b)
                    if ha is False and hb is None:
                        val[abs(b)] = b > 0
                        changed = True
                    elif hb is False and ha is None:
                        val[abs(a)] = a > 0
                        changed = True
    for a, b in rules:
        if not (holds(a) or holds(b)):
            return None
    return val[1:]
''', [6]),
    "P4 propagation with one retry per question (correct, O(n * m))": (4, '''
def two_sat(n, rules):
    occurs = [[] for _ in range(n + 1)]
    for i, (a, b) in enumerate(rules):
        occurs[abs(a)].append(i)
        occurs[abs(b)].append(i)
    val = [None] * (n + 1)
    def lit(x):
        v = val[abs(x)]
        return None if v is None else (v if x > 0 else not v)
    def try_set(k, v):
        trail = [k]
        val[k] = v
        q = [k]
        while q:
            j = q.pop()
            for i in occurs[j]:
                a, b = rules[i]
                la, lb = lit(a), lit(b)
                if la is False and lb is False:
                    for t in trail:
                        val[t] = None
                    return False
                if la is False and lb is None:
                    val[abs(b)] = b > 0
                    trail.append(abs(b))
                    q.append(abs(b))
                elif lb is False and la is None:
                    val[abs(a)] = a > 0
                    trail.append(abs(a))
                    q.append(abs(a))
        return True
    for k in range(1, n + 1):
        if val[k] is None and not try_set(k, True) and not try_set(k, False):
            return None
    return val[1:]
''', [12]),
}
