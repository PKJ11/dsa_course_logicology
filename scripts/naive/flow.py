# Naive FLOW solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def flow_value(n, lines, flow, s, t):
    # for every station, go through every line to add up what comes in and goes out
    if len(flow) != len(lines):
        return None
    for (u, v, c), f in zip(lines, flow):
        if f < 0 or f > c:
            return None
    for x in range(n):
        if x == s or x == t:
            continue
        inflow = sum(f for (u, v, c), f in zip(lines, flow) if v == x)
        outflow = sum(f for (u, v, c), f in zip(lines, flow) if u == x)
        if inflow != outflow:
            return None
    return sum(f for (u, v, c), f in zip(lines, flow) if u == s) - sum(f for (u, v, c), f in zip(lines, flow) if v == s)
''', [9, 10]),
    2: ('''
def max_flow(n, lines, s, t):
    # find paths in the network itself (depth-first, lines in list order), never sending flow back
    left = [c for u, v, c in lines]
    out = [[] for _ in range(n)]
    for i, (u, v, c) in enumerate(lines):
        out[u].append(i)
    total = 0
    while True:
        via = [-1] * n
        via[s] = -2
        stack = [(s, iter(out[s]))]
        while stack and via[t] == -1:
            u, it = stack[-1]
            for i in it:
                v = lines[i][1]
                if left[i] > 0 and via[v] == -1:
                    via[v] = i
                    stack.append((v, iter(out[v])))
                    break
            else:
                stack.pop()
        if via[t] == -1:
            return total
        path = []
        v = t
        while v != s:
            path.append(via[v])
            v = lines[via[v]][0]
        push = min(left[i] for i in path)
        for i in path:
            left[i] -= push
        total += push
''', [1]),
    3: ('''
def flow_plan(n, lines, s, t):
    # Ford-Fulkerson with a depth-first search for each path
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        seen = [False] * n
        seen[s] = True
        via = [-1] * n
        stack = [(s, iter(adj[s]))]
        while stack and not seen[t]:
            u, it = stack[-1]
            for e in it:
                if cap[e] > 0 and not seen[to[e]]:
                    seen[to[e]] = True
                    via[to[e]] = e
                    stack.append((to[e], iter(adj[to[e]])))
                    break
            else:
                stack.pop()
        if not seen[t]:
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
        total += push
    return total, [cap[2 * i + 1] for i in range(len(lines))]
''', [4, 5]),
    4: ('''
def min_cut(n, lines, s, t):
    # try every side
    others = [v for v in range(n) if v != s and v != t]
    best, side = None, None
    for m in range(2 ** len(others)):
        S = {s} | {others[k] for k in range(len(others)) if m >> k & 1}
        c = sum(w for u, v, w in lines if u in S and v not in S)
        if best is None or c < best:
            best, side = c, sorted(S)
    return side
''', [5, 6]),
    5: ('''
def matching(nl, nr, pairs):
    # one recursive search for an augmenting path from each driver
    adj = [[] for _ in range(nl)]
    for u, v in pairs:
        adj[u].append(v)
    mate_r = [-1] * nr
    def try_driver(u, seen):
        for v in adj[u]:
            if v not in seen:
                seen.add(v)
                if mate_r[v] == -1 or try_driver(mate_r[v], seen):
                    mate_r[v] = u
                    return True
        return False
    for u in range(nl):
        try_driver(u, set())
    return [(mate_r[v], v) for v in range(nr) if mate_r[v] != -1]
''', [6, 8]),
}

# Wrong or slow versions run by hand (not by check-problems.py): {name: (problem, code, tests that must catch it)}.
EXTRA = {
    "P1 checks capacities only": (1, '''
def flow_value(n, lines, flow, s, t):
    if len(flow) != len(lines):
        return None
    for (u, v, c), f in zip(lines, flow):
        if f < 0 or f > c:
            return None
    return sum(f for (u, v, c), f in zip(lines, flow) if u == s) - sum(f for (u, v, c), f in zip(lines, flow) if v == s)
''', [2, 10]),
    "P1 value counts only flow out of the source": (1, '''
def flow_value(n, lines, flow, s, t):
    if len(flow) != len(lines):
        return None
    net = [0] * n
    for (u, v, c), f in zip(lines, flow):
        if f < 0 or f > c:
            return None
        net[u] += f
        net[v] -= f
    if any(net[v] for v in range(n) if v != s and v != t):
        return None
    return sum(f for (u, v, c), f in zip(lines, flow) if u == s)
''', [5]),
    "P3 Edmonds-Karp (shortest paths, one BFS per path)": (3, '''
from collections import deque
def flow_plan(n, lines, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:
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
        total += push
    return total, [cap[2 * i + 1] for i in range(len(lines))]
''', [6]),
    "P2 greedy paths found with a stack, never sending flow back": (2, '''
def max_flow(n, lines, s, t):
    left = [c for u, v, c in lines]
    out = [[] for _ in range(n)]
    for i, (u, v, c) in enumerate(lines):
        out[u].append(i)
    total = 0
    while True:
        via = [-1] * n
        via[s] = -2
        stack = [s]
        while stack:
            u = stack.pop()
            for i in out[u]:
                v = lines[i][1]
                if left[i] > 0 and via[v] == -1:
                    via[v] = i
                    stack.append(v)
        if via[t] == -1:
            return total
        path = []
        v = t
        while v != s:
            path.append(via[v])
            v = lines[via[v]][0]
        push = min(left[i] for i in path)
        for i in path:
            left[i] -= push
        total += push
''', [7]),
    "P5 greedy: each driver takes the first free job": (5, '''
def matching(nl, nr, pairs):
    taken = set()
    used = set()
    out = []
    for u, v in pairs:
        if u not in used and v not in taken:
            used.add(u)
            taken.add(v)
            out.append((u, v))
    return out
''', [1]),
    "P5 one iterative search per free driver (no Hopcroft-Karp)": (5, '''
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
''', [8]),
}
