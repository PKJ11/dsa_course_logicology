# Naive PATH solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def are_shortest(n, edges, s, d):
    # checks that no line gives a shorter way and that every value has a tight line into it,
    # but not that the tight lines start from the start
    if d[s] != 0:
        return False
    tight = [False] * n
    tight[s] = True
    for u, v, w in edges:
        if d[u] is None:
            continue
        if d[v] is None or d[u] + w < d[v]:
            return False
        if d[u] + w == d[v]:
            tight[v] = True
    return all(tight[v] or d[v] is None for v in range(n))
''', [7]),
    2: ('''
from collections import deque

def fewest_reversals(n, edges, s, t):
    # plain breadth-first search: a station keeps the value it was first reached with
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append((v, 0))
        adj[v].append((u, 1))
    dist = [-1] * n
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + w
                q.append(v)
    return dist[t]
''', [4, 5]),
    3: ('''
def fastest(n, edges, s, t):
    # Dijkstra without a heap: look through every station for the nearest unsettled one
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    parent = [-1] * n
    done = [False] * n
    dist[s] = 0
    while True:
        u, best = -1, INF
        for v in range(n):
            if not done[v] and dist[v] < best:
                u, best = v, dist[v]
        if u == -1 or u == t:
            break
        done[u] = True
        for v, w in adj[u]:
            if best + w < dist[v]:
                dist[v] = best + w
                parent[v] = u
    if dist[t] == INF:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    return (dist[t], route[::-1])
''', [9]),
    4: ('''
import heapq, math

def cheapest(n, edges, s):
    # Dijkstra's method, with settled stations never looked at again
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [math.inf] * n
    dist[s] = 0
    done = [False] * n
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if done[u]:
            continue
        done[u] = True
        for v, w in adj[u]:
            if not done[v] and d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (d + w, v))
    return [None if x == math.inf else x for x in dist]
''', [1]),
    5: ('''
import math

def cheapest_routes(n, edges, queries):
    # Floyd-Warshall with k as the inner loop
    d = [[math.inf] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
        nxt[i][i] = i
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w
            nxt[u][v] = v
    for i in range(n):
        for j in range(n):
            for k in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
                    nxt[i][j] = nxt[i][k]
    if any(d[i][i] < 0 for i in range(n)):
        return None
    out = []
    for i, j in queries:
        if d[i][j] == math.inf:
            out.append(None)
            continue
        r = [i]
        while r[-1] != j and len(r) <= n:
            r.append(nxt[r[-1]][j])
        out.append(r)
    return out
''', [0]),
    6: ('''
def dag_routes(n, edges, s):
    # recursion with a memo: best(v) asks every line coming into v
    M = 1_000_000_007
    into = [[] for _ in range(n)]
    for u, v, w in edges:
        into[v].append((u, w))
    memo = {}
    def best(v):
        if v in memo:
            return memo[v]
        if v == s:
            memo[v] = (0, 1)
            return memo[v]
        d, c = None, 0
        for u, w in into[v]:
            du, cu = best(u)
            if du is None:
                continue
            if d is None or du + w < d:
                d, c = du + w, cu
            elif du + w == d:
                c = (c + cu) % M
        memo[v] = (d, c)
        return memo[v]
    res = [best(v) for v in range(n)]
    return ([r[0] for r in res], [r[1] for r in res])
''', [7]),
    7: ('''
from collections import deque

def moves_needed(start, goal, walls):
    # breadth-first search: looks at every square closer than the goal
    blocked = set(map(tuple, walls))
    start, goal = tuple(start), tuple(goal)
    dist = {start: 0}
    q = deque([start])
    while q:
        p = q.popleft()
        if p == goal:
            return dist[p]
        x, y = p
        for r in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if r not in blocked and r not in dist:
                dist[r] = dist[p] + 1
                q.append(r)
    return -1
''', [6, 7]),
}

# Wrong or slow versions run by hand (not by check-problems.py): {name: (problem, code, tests that must catch it)}.
EXTRA = {
    "P1 recompute with rounds over every line": (1, '''
def are_shortest(n, edges, s, d):
    INF = float('inf')
    t = [INF] * n
    t[s] = 0
    changed = True
    while changed:
        changed = False
        for u, v, w in edges:
            if t[u] + w < t[v]:
                t[v] = t[u] + w
                changed = True
    return [None if x == INF else x for x in t] == list(d)
''', [9, 10, 11]),
    "P2 mark when added": (2, '''
from collections import deque

def fewest_reversals(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append((v, 0))
        adj[v].append((u, 1))
    dist = [-1] * n
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + w
                if w == 0:
                    q.appendleft(v)
                else:
                    q.append(v)
    return dist[t]
''', [4]),
    "P2 rounds until nothing changes": (2, '''
def fewest_reversals(n, edges, s, t):
    INF = float('inf')
    d = [INF] * n
    d[s] = 0
    changed = True
    while changed:
        changed = False
        for u, v in edges:
            if d[u] < d[v]:
                d[v] = d[u]; changed = True
            if d[v] + 1 < d[u]:
                d[u] = d[v] + 1; changed = True
    return -1 if d[t] == INF else d[t]
''', [10]),
    "P3 old heap entries handled again": (3, '''
import heapq

def fastest(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    parent = [-1] * n
    dist[s] = 0
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if u == t:
            break
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                heapq.heappush(heap, (dist[v], v))
    if dist[t] == INF:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    return (dist[t], route[::-1])
''', [10]),
    "P3 fewest lines (breadth-first)": (3, '''
from collections import deque

def fastest(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    parent = [-1] * n
    parent[s] = s
    q = deque([s])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if parent[v] == -1:
                parent[v] = u
                q.append(v)
    if parent[t] == -1:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    route.reverse()
    best = {}
    for u, v, w in edges:
        best[(u, v)] = min(best.get((u, v), w), w)
    return (sum(best[(route[i], route[i + 1])] for i in range(len(route) - 1)), route)
''', [0, 3]),
    "P4 only the stations that change in the extra round": (4, '''
import math

def cheapest(n, edges, s):
    d = [math.inf] * n
    d[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if d[u] + w < d[v]:
                d[v] = d[u] + w
    bad = set()
    for u, v, w in edges:
        if d[u] + w < d[v]:
            bad.add(v)
    return [-math.inf if v in bad else (None if d[v] == math.inf else d[v]) for v in range(n)]
''', [5]),
    "P4 n - 1 rounds and nothing else": (4, '''
import math

def cheapest(n, edges, s):
    d = [math.inf] * n
    d[s] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if d[u] + w < d[v]:
                d[v] = d[u] + w
    return [None if x == math.inf else x for x in d]
''', [3, 5, 6]),
    "P5 Bellman-Ford from every asked start": (5, '''
import math

def cheapest_routes(n, edges, queries):
    cache = {}
    for s in {i for i, _ in queries} | {0}:
        d = [math.inf] * n
        par = [None] * n
        d[s] = 0
        for _ in range(n - 1):
            changed = False
            for u, v, w in edges:
                if d[u] + w < d[v]:
                    d[v] = d[u] + w
                    par[v] = u
                    changed = True
            if not changed:
                break
        for u, v, w in edges:
            if d[u] + w < d[v]:
                return None
        cache[s] = (d, par)
    out = []
    for i, j in queries:
        d, par = cache[i]
        if d[j] == math.inf:
            out.append(None)
            continue
        r = [j]
        while r[-1] != i:
            r.append(par[r[-1]])
        out.append(r[::-1])
    return out
''', [8, 9]),
    "P5 follow any line that keeps the cost": (5, '''
import math

def cheapest_routes(n, edges, queries):
    d = [[math.inf] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
    best = {}
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w
        if (u, v) not in best or w < best[(u, v)]:
            best[(u, v)] = w
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    if any(d[i][i] < 0 for i in range(n)):
        return None
    out = []
    for i, j in queries:
        if d[i][j] == math.inf:
            out.append(None)
            continue
        r = [i]
        while r[-1] != j:
            u = r[-1]
            r.append(next(v for (a, v), w in best.items() if a == u and w + d[v][j] == d[u][j]))
        out.append(r)
    return out
''', [7]),
    "P6 Dijkstra with counts": (6, '''
import heapq

def dag_routes(n, edges, s):
    M = 1_000_000_007
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [None] * n
    ways = [0] * n
    done = [False] * n
    dist[s], ways[s] = 0, 1
    h = [(0, s)]
    while h:
        d, u = heapq.heappop(h)
        if done[u]:
            continue
        done[u] = True
        for v, w in adj[u]:
            if dist[v] is None or d + w < dist[v]:
                dist[v], ways[v] = d + w, ways[u]
                heapq.heappush(h, (d + w, v))
            elif d + w == dist[v]:
                ways[v] = (ways[v] + ways[u]) % M
    return (dist, ways)
''', [1]),
    "P7 A* with ties broken by the smaller g": (7, '''
import heapq

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    gx, gy = goal
    start = tuple(start)
    g = {start: 0}
    heap = [(abs(start[0] - gx) + abs(start[1] - gy), 0, start)]
    while heap:
        f, d, p = heapq.heappop(heap)
        if d > g[p]:
            continue
        if p == (gx, gy):
            return d
        x, y = p
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q not in blocked and d + 1 < g.get(q, d + 2):
                g[q] = d + 1
                heapq.heappush(heap, (d + 1 + abs(q[0] - gx) + abs(q[1] - gy), d + 1, q))
    return -1
''', [7]),
    "P7 a guess that is too high (twice the Manhattan distance)": (7, '''
import heapq

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    gx, gy = goal
    start = tuple(start)
    g = {start: 0}
    heap = [(0, 0, start)]
    while heap:
        f, neg, p = heapq.heappop(heap)
        d = -neg
        if d > g[p]:
            continue
        if p == (gx, gy):
            return d
        x, y = p
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q not in blocked and d + 1 < g.get(q, d + 2):
                g[q] = d + 1
                heapq.heappush(heap, (d + 1 + 2 * (abs(q[0] - gx) + abs(q[1] - gy)), -(d + 1), q))
    return -1
''', [5]),
}
