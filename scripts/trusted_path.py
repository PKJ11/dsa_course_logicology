"""Trusted PATH solutions, shared by build_path.py and the brute-force cross-check (cross_path.py)."""

# P1: are these the shortest distances? O(V + E), no search by distance.
CHECK = """
from collections import deque

def are_shortest(n, edges, s, d):
    if d[s] != 0:
        return False
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        if d[u] is None:
            continue
        if d[v] is None or d[u] + w < d[v]:
            return False          # this edge gives a shorter way to v
        if d[u] + w == d[v]:
            adj[u].append(v)      # a tight edge
    seen = [False] * n
    seen[s] = True
    q = deque([s])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                q.append(v)
    return all(seen[v] == (d[v] is not None) for v in range(n))
"""

CHECK_BRUTE = """
import heapq

def true_dist(n, edges, s):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    dist[s] = 0
    h = [(0, s)]
    while h:
        d, u = heapq.heappop(h)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(h, (d + w, v))
    return [None if x == INF else x for x in dist]

def are_shortest(n, edges, s, d):
    return true_dist(n, edges, s) == list(d)
"""

# P2: fewest one-way lines to reverse (0-1 BFS).
REVERSE = """
from collections import deque

def fewest_reversals(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append((v, 0))     # along the line: free
        adj[v].append((u, 1))     # against it: one reversal
    INF = float('inf')
    dist = [INF] * n
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        d = dist[u]
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                if w == 0:
                    q.appendleft(v)
                else:
                    q.append(v)
    return -1 if dist[t] == INF else dist[t]
"""

REVERSE_BRUTE = """
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
"""

# P3: the fastest journey and its route (Dijkstra with a heap and lazy removal).
FASTEST = """
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
        if d > dist[u]:
            continue
        if u == t:
            break
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (d + w, v))
    if dist[t] == INF:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    return (dist[t], route[::-1])
"""

FASTEST_BRUTE = """
def best_time(n, edges, s, t):
    INF = float('inf')
    d = [INF] * n
    d[s] = 0
    for _ in range(n):
        for u, v, w in edges:
            if d[u] + w < d[v]:
                d[v] = d[u] + w
    return None if d[t] == INF else d[t]
"""

# P4: Bellman-Ford, with -inf for every vertex a negative cycle can reach.
CHEAPEST = """
import math
from collections import deque

def cheapest(n, edges, s):
    d = [math.inf] * n
    d[s] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if d[u] + w < d[v]:
                d[v] = d[u] + w
                changed = True
        if not changed:
            break
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append(v)
    q = deque()
    for u, v, w in edges:
        if d[u] + w < d[v] and d[v] != -math.inf:
            d[v] = -math.inf          # still improving after n - 1 rounds
            q.append(v)
    while q:
        u = q.popleft()
        for v in adj[u]:
            if d[v] != -math.inf:
                d[v] = -math.inf
                q.append(v)
    return [None if x == math.inf else x for x in d]
"""

# brute force: all simple paths give the finite answers; a vertex is -inf when a negative cycle (found by
# trying every simple cycle) can be reached from s and can reach it.
CHEAPEST_BRUTE = """
import math

def cheapest(n, edges, s):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    reach = [[False] * n for _ in range(n)]
    for a in range(n):
        st = [a]; reach[a][a] = True
        while st:
            u = st.pop()
            for v, w in adj[u]:
                if not reach[a][v]:
                    reach[a][v] = True; st.append(v)
    neg = set()
    def cyc(start, u, total, used):
        for v, w in adj[u]:
            if v == start and total + w < 0:
                neg.add(start)
            elif v > start and v not in used:
                used.add(v); cyc(start, v, total + w, used); used.discard(v)
    for a in range(n):
        cyc(a, a, 0, {a})
    best = [math.inf] * n
    def walk(u, total, used):
        if total < best[u]:
            best[u] = total
        for v, w in adj[u]:
            if v not in used:
                used.add(v); walk(v, total + w, used); used.discard(v)
    walk(s, 0, {s})
    out = []
    for v in range(n):
        if not reach[s][v]:
            out.append(None)
        elif any(reach[s][c] and reach[c][v] for c in neg):
            out.append(-math.inf)
        else:
            out.append(best[v])
    return out
"""

# P5: Floyd-Warshall; None in the matrix for no route, None overall for a negative cycle.
ALLPAIRS = """
import math

def all_pairs(n, edges):
    d = [[math.inf] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w
    for k in range(n):
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == math.inf:
                continue
            row = d[i]
            d[i] = [a if a <= dik + b else dik + b for a, b in zip(row, dk)]
    if any(d[i][i] < 0 for i in range(n)):
        return None
    return [[None if x == math.inf else x for x in row] for row in d]
"""

ROUTES = """
import math

def cheapest_routes(n, edges, queries):
    d = [[math.inf] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
        nxt[i][i] = i
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w
            nxt[u][v] = v
    for k in range(n):
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == math.inf:
                continue
            row = d[i]
            new = [dik + b if dik + b < a else a for a, b in zip(row, dk)]
            if new != row:
                nik = nxt[i][k]
                nxt[i] = [x if c == a else nik for a, c, x in zip(row, new, nxt[i])]
                d[i] = new
    if any(d[i][i] < 0 for i in range(n)):
        return None
    out = []
    for i, j in queries:
        if d[i][j] == math.inf:
            out.append(None)
            continue
        route = [i]
        while route[-1] != j:
            route.append(nxt[route[-1]][j])
        out.append(route)
    return out
"""

ALLPAIRS_BRUTE = """
import math

def all_pairs(n, edges):
    out = []
    for s in range(n):
        d = [math.inf] * n
        d[s] = 0
        for _ in range(n - 1):
            for u, v, w in edges:
                if d[u] + w < d[v]:
                    d[v] = d[u] + w
        for u, v, w in edges:
            if d[u] + w < d[v]:
                return None
        out.append([None if x == math.inf else x for x in d])
    return out
"""

# P6: shortest routes in a DAG, and how many cheapest routes (modulo 1,000,000,007).
DAG = """
from collections import deque

def dag_routes(n, edges, s):
    M = 1_000_000_007
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indeg[v] += 1
    order = []
    q = deque(v for v in range(n) if indeg[v] == 0)
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    dist = [None] * n
    ways = [0] * n
    dist[s] = 0
    ways[s] = 1
    for u in order:
        if dist[u] is None:
            continue
        for v, w in adj[u]:
            nd = dist[u] + w
            if dist[v] is None or nd < dist[v]:
                dist[v] = nd
                ways[v] = ways[u]
            elif nd == dist[v]:
                ways[v] = (ways[v] + ways[u]) % M
    return (dist, ways)
"""

DAG_BRUTE = """
def dag_routes(n, edges, s):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    totals = [[] for _ in range(n)]
    def walk(u, t):
        totals[u].append(t)
        for v, w in adj[u]:
            walk(v, t + w)
    walk(s, 0)
    dist = [min(x) if x else None for x in totals]
    ways = [x.count(min(x)) % 1_000_000_007 if x else 0 for x in totals]
    return (dist, ways)
"""

# P7: fewest moves on an endless grid (A* with the Manhattan distance, ties to the larger g).
ASTAR = """
import heapq

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    gx, gy = goal
    def h(x, y):
        return abs(x - gx) + abs(y - gy)
    g = {tuple(start): 0}
    heap = [(h(*start), 0, tuple(start))]
    while heap:
        f, neg, p = heapq.heappop(heap)
        x, y = p
        d = -neg
        if d > g[p]:
            continue
        if p == (gx, gy):
            return d
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q in blocked:
                continue
            if d + 1 < g.get(q, d + 2):
                g[q] = d + 1
                heapq.heappush(heap, (d + 1 + h(*q), -(d + 1), q))
    return -1
"""

ASTAR_BRUTE = """
from collections import deque

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    pts = list(blocked) + [tuple(start), tuple(goal)]
    x0 = min(p[0] for p in pts) - 1; x1 = max(p[0] for p in pts) + 1
    y0 = min(p[1] for p in pts) - 1; y1 = max(p[1] for p in pts) + 1
    dist = {tuple(start): 0}
    q = deque([tuple(start)])
    while q:
        p = q.popleft()
        if p == tuple(goal):
            return dist[p]
        x, y = p
        for r in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if x0 <= r[0] <= x1 and y0 <= r[1] <= y1 and r not in blocked and r not in dist:
                dist[r] = dist[p] + 1
                q.append(r)
    return -1
"""
