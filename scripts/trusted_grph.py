"""Trusted GRPH solutions, shared by build_grph.py and the brute-force cross-check (cross_grph.py)."""

LINES = """
def direct_lines(n, edges, queries):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    return [v in adj[u] for u, v in queries]
"""

LINES_BRUTE = """
def direct_lines(n, edges, queries):
    return [any((a == u and b == v) or (a == v and b == u) for a, b in edges) for u, v in queries]
"""

ROUTE = """
from collections import deque

def route(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    parent[s] = s
    q = deque([s])
    while q:
        u = q.popleft()
        if u == t:
            break
        for v in adj[u]:
            if parent[v] == -1:
                parent[v] = u
                q.append(v)
    if parent[t] == -1:
        return None
    path = [t]
    while path[-1] != s:
        path.append(parent[path[-1]])
    return path[::-1]
"""

# distances by repeated relaxation: no queue at all, so it cannot share a bug with BFS
ROUTE_BRUTE = """
def route_len(n, edges, s, t):
    INF = float('inf')
    d = [INF] * n
    d[s] = 0
    for _ in range(n):
        for u, v in edges:
            if d[u] + 1 < d[v]:
                d[v] = d[u] + 1
            if d[v] + 1 < d[u]:
                d[u] = d[v] + 1
    return None if d[t] == INF else d[t]
"""

FINISH = """
def finish_order(adj):
    n = len(adj)
    seen = [False] * n
    out = []
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(adj[v])))
                    break
            else:
                stack.pop()
                out.append(u)
    return out
"""

FINISH_BRUTE = """
import sys
sys.setrecursionlimit(10000)

def finish_order(adj):
    n = len(adj)
    seen = [False] * n
    out = []
    def go(u):
        seen[u] = True
        for v in adj[u]:
            if not seen[v]:
                go(v)
        out.append(u)
    for s in range(n):
        if not seen[s]:
            go(s)
    return out
"""

CYCLE = """
def find_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    state = [0] * n          # 0 not reached, 1 on the current path, 2 finished
    parent = [-1] * n
    for s in range(n):
        if state[s]:
            continue
        state[s] = 1
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if state[v] == 0:
                    state[v] = 1
                    parent[v] = u
                    stack.append((v, iter(adj[v])))
                    break
                if state[v] == 1:
                    # u -> v closes a cycle: walk back from u to v
                    cyc = [u]
                    while cyc[-1] != v:
                        cyc.append(parent[cyc[-1]])
                    return cyc[::-1]
            else:
                stack.pop()
                state[u] = 2
    return None
"""

# a directed graph has a cycle exactly when no order of the vertices puts every edge forward
CYCLE_BRUTE = """
from itertools import permutations

def has_cycle(n, edges):
    for p in permutations(range(n)):
        pos = {v: i for i, v in enumerate(p)}
        if all(pos[u] < pos[v] for u, v in edges):
            return False
    return True
"""

SMALLEST = """
import heapq

def smallest_order(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    ready = [v for v in range(n) if indeg[v] == 0]
    heapq.heapify(ready)
    out = []
    while ready:
        u = heapq.heappop(ready)
        out.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(ready, v)
    return out if len(out) == n else None
"""

SMALLEST_BRUTE = """
from itertools import permutations

def smallest_order(n, edges):
    for p in permutations(range(n)):      # permutations come in increasing order
        pos = {v: i for i, v in enumerate(p)}
        if all(pos[u] < pos[v] for u, v in edges):
            return list(p)
    return None
"""

TEAMS = """
from collections import deque

def two_teams(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    side = [-1] * n
    parent = [-1] * n
    depth = [0] * n
    for s in range(n):
        if side[s] != -1:
            continue
        side[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if side[v] == -1:
                    side[v] = 1 - side[u]
                    parent[v] = u
                    depth[v] = depth[u] + 1
                    q.append(v)
                elif side[v] == side[u]:
                    # same side: u and v are on the same level; climb to where their paths meet
                    a, b = [u], [v]
                    while a[-1] != b[-1]:
                        a.append(parent[a[-1]])
                        b.append(parent[b[-1]])
                    return (False, a + b[-2::-1])
    return (True, side)
"""

# every split of the vertices into two teams
TEAMS_BRUTE = """
def bipartite(n, edges):
    for mask in range(1 << n):
        if all((mask >> u & 1) != (mask >> v & 1) for u, v in edges):
            return True
    return False
"""

MOVES = """
from collections import deque

def fewest_moves(grid, k):
    R, C = len(grid), len(grid[0])
    # least[r][c]: the fewest walls used by any visit to (r, c) so far. A later visit (never fewer moves, because
    # the queue is in order of moves) is only useful if it has used fewer walls.
    least = [[k + 1] * C for _ in range(R)]
    least[0][0] = 0
    q = deque([(0, 0, 0)])
    moves = 0
    while q:
        for _ in range(len(q)):
            r, c, used = q.popleft()
            if r == R - 1 and c == C - 1:
                return moves
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < R and 0 <= nc < C:
                    w = used + (grid[nr][nc] == '#')
                    if w < least[nr][nc]:
                        least[nr][nc] = w
                        q.append((nr, nc, w))
        moves += 1
    return -1
"""

# try every set of at most k walls to remove, and run a plain search on each grid
MOVES_BRUTE = """
from collections import deque
from itertools import combinations

def fewest_moves(grid, k):
    R, C = len(grid), len(grid[0])
    walls = [(r, c) for r in range(R) for c in range(C) if grid[r][c] == '#']
    best = -1
    for size in range(0, min(k, len(walls)) + 1):
        for gone in combinations(walls, size):
            gone = set(gone)
            dist = {(0, 0): 0}
            q = deque([(0, 0)])
            while q:
                r, c = q.popleft()
                for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                    if 0 <= nr < R and 0 <= nc < C and (nr, nc) not in dist and (grid[nr][nc] == '.' or (nr, nc) in gone):
                        dist[(nr, nc)] = dist[(r, c)] + 1
                        q.append((nr, nc))
            d = dist.get((R - 1, C - 1))
            if d is not None and (best == -1 or d < best):
                best = d
    return best
"""
