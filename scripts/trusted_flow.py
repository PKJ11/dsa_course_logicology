"""Trusted FLOW solutions, shared by build_flow.py and the brute-force cross-check (cross_flow.py)."""

# P1: check a flow; its value, or None if a rule is broken.
CHECK = """
def flow_value(n, edges, flow, s, t):
    if len(flow) != len(edges):
        return None
    net = [0] * n                      # flow out minus flow in, per vertex
    for (u, v, c), f in zip(edges, flow):
        if f < 0 or f > c:
            return None
        net[u] += f
        net[v] -= f
    for v in range(n):
        if v != s and v != t and net[v] != 0:
            return None
    return net[s]
"""

# Ford-Fulkerson with a depth-first search for each path (fine for small total flow).
FF_DFS = """
def max_flow(n, edges, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in edges:
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        seen = [False] * n
        seen[s] = True
        stack = [(s, iter(adj[s]))]
        via = [-1] * n
        while stack and not seen[t]:
            u, it = stack[-1]
            for e in it:
                v = to[e]
                if cap[e] > 0 and not seen[v]:
                    seen[v] = True
                    via[v] = e
                    stack.append((v, iter(adj[v])))
                    break
            else:
                stack.pop()
        if not seen[t]:
            return total
        push = float('inf')
        v = t
        while v != s:
            e = via[v]
            push = min(push, cap[e])
            v = to[e ^ 1]
        v = t
        while v != s:
            e = via[v]
            cap[e] -= push
            cap[e ^ 1] += push
            v = to[e ^ 1]
        total += push
"""

# Edmonds-Karp: shortest augmenting paths by BFS. Returns the value and the flow on every edge.
EK = """
from collections import deque

def max_flow(n, edges, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in edges:
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        via = [-1] * n
        via[s] = -2
        q = deque([s])
        while q and via[t] == -1:
            u = q.popleft()
            for e in adj[u]:
                v = to[e]
                if cap[e] > 0 and via[v] == -1:
                    via[v] = e
                    q.append(v)
        if via[t] == -1:
            break
        push = None
        v = t
        while v != s:
            e = via[v]
            if push is None or cap[e] < push:
                push = cap[e]
            v = to[e ^ 1]
        v = t
        while v != s:
            e = via[v]
            cap[e] -= push
            cap[e ^ 1] += push
            v = to[e ^ 1]
        total += push
    return total, [cap[2 * i + 1] for i in range(len(edges))]
"""

# Dinic: BFS levels, then a blocking flow by DFS with a pointer per vertex.
DINIC = """
from collections import deque

def max_flow(n, edges, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in edges:
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        level = [-1] * n
        level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for e in adj[u]:
                if cap[e] > 0 and level[to[e]] < 0:
                    level[to[e]] = level[u] + 1
                    q.append(to[e])
        if level[t] < 0:
            break
        ptr = [0] * n
        while True:
            # one path along the level graph, with dead ends cut off by the pointers
            path = []
            u = s
            while u != t:
                while ptr[u] < len(adj[u]):
                    e = adj[u][ptr[u]]
                    if cap[e] > 0 and level[to[e]] == level[u] + 1:
                        break
                    ptr[u] += 1
                if ptr[u] == len(adj[u]):
                    if u == s:
                        break
                    level[u] = -1          # a dead end: never enter it again this phase
                    e = path.pop()
                    u = to[e ^ 1]
                    ptr[u] += 1
                    continue
                e = adj[u][ptr[u]]
                path.append(e)
                u = to[e]
            if u != t:
                break
            push = min(cap[e] for e in path)
            for e in path:
                cap[e] -= push
                cap[e ^ 1] += push
            total += push
    return total, [cap[2 * i + 1] for i in range(len(edges))]
"""

# Brute force for small networks: the smallest capacity over every s-t cut (max-flow min-cut).
CUT_BRUTE = """
def min_cut(n, edges, s, t):
    best = None
    others = [v for v in range(n) if v != s and v != t]
    for m in range(2 ** len(others)):
        S = {s} | {others[k] for k in range(len(others)) if m >> k & 1}
        c = sum(w for u, v, w in edges if u in S and v not in S)
        if best is None or c < best:
            best = c
    return best
"""

# P4: a minimum cut: the vertices reachable from s in the residual graph after a maximum flow.
CUT = """
from collections import deque

def min_cut(n, edges, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in edges:
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    while True:
        via = [-1] * n
        via[s] = -2
        q = deque([s])
        while q and via[t] == -1:
            u = q.popleft()
            for e in adj[u]:
                if cap[e] > 0 and via[to[e]] == -1:
                    via[to[e]] = e
                    q.append(to[e])
        if via[t] == -1:
            break
        push = None
        v = t
        while v != s:
            e = via[v]
            push = cap[e] if push is None else min(push, cap[e])
            v = to[e ^ 1]
        v = t
        while v != s:
            e = via[v]
            cap[e] -= push
            cap[e ^ 1] += push
            v = to[e ^ 1]
    return sorted(v for v in range(n) if via[v] != -1)
"""

# P5: a largest matching, with augmenting paths from each left vertex (Kuhn), iterative.
MATCH = """
def matching(nl, nr, edges):
    adj = [[] for _ in range(nl)]
    for u, v in edges:
        adj[u].append(v)
    mate_l = [-1] * nl
    mate_r = [-1] * nr
    for u in range(nl):                    # a quick greedy start
        for v in adj[u]:
            if mate_r[v] == -1:
                mate_l[u] = v
                mate_r[v] = u
                break
    stamp = [0] * nr
    rnd = 0
    for root in range(nl):
        if mate_l[root] != -1:
            continue
        rnd += 1
        stack = [(root, iter(adj[root]))]
        via = {}
        end = -1
        while stack and end < 0:
            u, it = stack[-1]
            for v in it:
                if stamp[v] == rnd:
                    continue
                stamp[v] = rnd
                via[v] = u
                if mate_r[v] == -1:
                    end = v
                else:
                    w = mate_r[v]
                    stack.append((w, iter(adj[w])))
                break
            else:
                stack.pop()
        v = end
        while v != -1:                     # flip the path
            u = via[v]
            nxt = mate_l[u]
            mate_l[u] = v
            mate_r[v] = u
            v = nxt
    return [(u, mate_l[u]) for u in range(nl) if mate_l[u] != -1]
"""

MATCH_BRUTE = """
def best(nl, nr, edges):
    es = sorted(set(edges))
    best = 0
    def go(i, used_l, used_r, k):
        nonlocal best
        if k + (len(es) - i) <= best:
            return
        if i == len(es):
            best = max(best, k)
            return
        u, v = es[i]
        if not used_l >> u & 1 and not used_r >> v & 1:
            go(i + 1, used_l | 1 << u, used_r | 1 << v, k + 1)
        go(i + 1, used_l, used_r, k)
    go(0, 0, 0, 0)
    return best
"""

# P5 reference: Hopcroft-Karp (phases of shortest augmenting paths), iterative.
MATCH_HK = """
from collections import deque
def matching(nl, nr, edges):
    adj = [[] for _ in range(nl)]
    for u, v in edges:
        adj[u].append(v)
    mate_l = [-1] * nl
    mate_r = [-1] * nr
    for u in range(nl):                    # a quick greedy start
        for v in adj[u]:
            if mate_r[v] == -1:
                mate_l[u] = v
                mate_r[v] = u
                break
    INF = 1 << 60
    while True:
        dist = [INF] * nl
        q = deque()
        for u in range(nl):
            if mate_l[u] == -1:
                dist[u] = 0
                q.append(u)
        found = False
        while q:
            u = q.popleft()
            for v in adj[u]:
                w = mate_r[v]
                if w == -1:
                    found = True
                elif dist[w] == INF:
                    dist[w] = dist[u] + 1
                    q.append(w)
        if not found:
            break
        ptr = [0] * nl
        for root in range(nl):
            if mate_l[root] != -1:
                continue
            path = [root]
            while path:
                u = path[-1]
                if ptr[u] == len(adj[u]):
                    dist[u] = INF
                    path.pop()
                    continue
                v = adj[u][ptr[u]]
                ptr[u] += 1
                w = mate_r[v]
                if w == -1:
                    # flip along the path
                    for k in range(len(path) - 1, -1, -1):
                        x = path[k]
                        nv = mate_l[x]
                        mate_l[x] = v
                        mate_r[v] = x
                        v = nv
                    break
                if dist[w] == dist[u] + 1:
                    path.append(w)
    return [(u, mate_l[u]) for u in range(nl) if mate_l[u] != -1]
"""
