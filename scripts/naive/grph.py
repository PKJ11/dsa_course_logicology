# Naive GRPH solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def direct_lines(n, edges, queries):
    # neighbours in lists: "in" scans the whole list
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return [v in adj[u] for u, v in queries]
''', [7]),
    2: ('''
def route(n, edges, s, t):
    # breadth-first, but the queue is a list and pop(0) moves every item left
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    parent[s] = s
    q = [s]
    while q:
        u = q.pop(0)
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
''', [8]),
    3: ('''
def finish_order(adj):
    # recursive: Python stops at about 1,000 nested calls
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
''', [8, 10]),
    4: ('''
def find_cycle(n, edges):
    # recursive, with three states
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    state = [0] * n
    parent = [-1] * n
    def go(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 0:
                parent[v] = u
                c = go(v)
                if c:
                    return c
            elif state[v] == 1:
                cyc = [u]
                while cyc[-1] != v:
                    cyc.append(parent[cyc[-1]])
                return cyc[::-1]
        state[u] = 2
        return None
    for s in range(n):
        if state[s] == 0:
            c = go(s)
            if c:
                return c
    return None
''', [8]),
    5: ('''
def smallest_order(n, edges):
    # look through every vertex for the smallest ready one, at every step
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    done = [False] * n
    out = []
    for _ in range(n):
        u = next((v for v in range(n) if not done[v] and indeg[v] == 0), None)
        if u is None:
            return None
        done[u] = True
        out.append(u)
        for v in adj[u]:
            indeg[v] -= 1
    return out
''', [8, 9]),
    6: ('''
def two_teams(n, edges):
    # recursive colouring
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    side = [-1] * n
    parent = [-1] * n
    def go(u):
        for v in adj[u]:
            if side[v] == -1:
                side[v] = 1 - side[u]
                parent[v] = u
                c = go(v)
                if c:
                    return c
            elif side[v] == side[u]:
                cyc = [u]
                while cyc[-1] != v:
                    cyc.append(parent[cyc[-1]])
                return cyc
        return None
    for s in range(n):
        if side[s] == -1:
            side[s] = 0
            c = go(s)
            if c:
                return (False, c)
    return (True, side)
''', [8, 9]),
    7: ('''
from collections import deque

def fewest_moves(grid, k):
    # one visit per square, whatever was used to get there
    R, C = len(grid), len(grid[0])
    seen = [[False] * C for _ in range(R)]
    seen[0][0] = True
    q = deque([(0, 0, 0, 0)])
    while q:
        r, c, used, d = q.popleft()
        if (r, c) == (R - 1, C - 1):
            return d
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= nr < R and 0 <= nc < C and not seen[nr][nc]:
                w = used + (grid[nr][nc] == '#')
                if w <= k:
                    seen[nr][nc] = True
                    q.append((nr, nc, w, d + 1))
    return -1
''', [5]),
}

# Wrong versions run by hand (not by check-problems.py): python -c "..." with codecheck, or in the browser.
EXTRA = {
    2: ('''
def route(n, edges, s, t):
    # depth-first: finds a route, not the shortest one
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    parent[s] = s
    stack = [s]
    while stack:
        u = stack.pop()
        for v in adj[u]:
            if parent[v] == -1:
                parent[v] = u
                stack.append(v)
    if parent[t] == -1:
        return None
    path = [t]
    while path[-1] != s:
        path.append(parent[path[-1]])
    return path[::-1]
''', "fails the tests where the first way found is the long way round"),
    3: ('''
def finish_order(adj):
    # push every neighbour, pop one: a different order, and no finish times
    n = len(adj)
    seen = [False] * n
    out = []
    for s in range(n):
        if seen[s]:
            continue
        stack = [s]
        while stack:
            u = stack.pop()
            if seen[u]:
                continue
            seen[u] = True
            out.append(u)
            for v in reversed(adj[u]):
                if not seen[v]:
                    stack.append(v)
    return out[::-1]
''', "wrong order on the small tests"),
    4: ('''
def find_cycle(n, edges):
    # a vertex seen before counts as a cycle (wrong: two routes can meet without a cycle)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    seen = [False] * n
    parent = [-1] * n
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if seen[v]:
                    cyc = [u]
                    while cyc[-1] != v and parent[cyc[-1]] != -1:
                        cyc.append(parent[cyc[-1]])
                    return cyc[::-1]
                seen[v] = True
                parent[v] = u
                stack.append(v)
    return None
''', "fails the diamond and the big acyclic graphs"),
    5: ('''
from collections import deque

def smallest_order(n, edges):
    # Kahn's method with a plain queue: a correct order, not the smallest
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    q = deque(v for v in range(n) if indeg[v] == 0)
    out = []
    while q:
        u = q.popleft()
        out.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return out if len(out) == n else None
''', "fails 'A small vertex freed late'"),
    6: ('''
from collections import deque

def two_teams(n, edges):
    # colours only the part of the graph that 0 can reach
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    side = [0] * n
    seen = [False] * n
    seen[0] = True
    q = deque([0])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                side[v] = 1 - side[u]
                q.append(v)
            elif side[v] == side[u]:
                return (False, [u, v])
    return (True, side)
''', "fails 'Two parts' and the odd-cycle tests (its cycle is not a cycle)"),
    7: ('''
import heapq

def fewest_moves(grid, k):
    # fewest walls first, then fewest moves: the wrong thing to make smallest
    R, C = len(grid), len(grid[0])
    best = {(0, 0): (0, 0)}
    h = [(0, 0, 0, 0)]
    while h:
        w, d, r, c = heapq.heappop(h)
        if (r, c) == (R - 1, C - 1):
            return d if w <= k else -1
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= nr < R and 0 <= nc < C:
                nw = w + (grid[nr][nc] == '#')
                if (nr, nc) not in best or (nw, d + 1) < best[(nr, nc)]:
                    best[(nr, nc)] = (nw, d + 1)
                    heapq.heappush(h, (nw, d + 1, nr, nc))
    return -1
''', "fails when one wall saves many moves"),
}
