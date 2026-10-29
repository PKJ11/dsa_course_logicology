"""Trusted SPAN solutions, shared by build_span.py and the brute-force cross-check (cross_span.py)."""

# P1: one new line joins a spanning tree; the cheapest tree of the n edges (cycle property).
SWAP = """
from collections import deque

def cheaper_tree(n, tree, extra):
    adj = [[] for _ in range(n)]
    total = 0
    for u, v, w in tree:
        adj[u].append((v, w))
        adj[v].append((u, w))
        total += w
    a, b, w = extra
    if a == b:
        return total
    # breadth-first search from a; heaviest[x] = heaviest edge on the tree path from a to x
    heaviest = [None] * n
    heaviest[a] = float('-inf')
    q = deque([a])
    while q:
        u = q.popleft()
        if u == b:
            break
        for v, c in adj[u]:
            if heaviest[v] is None:
                heaviest[v] = max(heaviest[u], c)
                q.append(v)
    h = heaviest[b]
    return total - h + w if w < h else total
"""

SWAP_BRUTE = """
def cheaper_tree(n, tree, extra):
    edges = sorted(list(tree) + [tuple(extra)], key=lambda e: e[2])
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    total = 0
    for u, v, w in edges:
        a, b = find(u), find(v)
        if a != b:
            parent[a] = b
            total += w
    return total
"""

# P2: Kruskal with union-find; None if the network is not connected.
KRUSKAL = """
def mst(n, edges):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    chosen = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        a, b = find(u), find(v)
        if a == b:
            continue
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        chosen.append((u, v, w))
        if len(chosen) == n - 1:
            break
    return chosen if len(chosen) == n - 1 else None
"""

# brute force: the cheapest set of n - 1 edges that joins everything, over all subsets (small graphs only)
MST_BRUTE = """
from itertools import combinations

def best_tree(n, edges):
    best = None
    for pick in combinations(range(len(edges)), n - 1):
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x
        ok = True
        for i in pick:
            u, v, w = edges[i]
            a, b = find(u), find(v)
            if a == b:
                ok = False
                break
            parent[a] = b
        if ok:
            t = sum(edges[i][2] for i in pick)
            if best is None or t < best:
                best = t
    return best
"""

# P3: Prim's method in O(n^2) for points joined by Manhattan distances.
POINTS = """
def connect_points(points):
    n = len(points)
    if n <= 1:
        return 0
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    inf = float('inf')
    best = [inf] * n              # cheapest line from the tree to each point
    left = list(range(1, n))      # points not yet in the tree
    total = 0
    x0, y0 = xs[0], ys[0]
    best = [abs(x - x0) + abs(y - y0) for x, y in zip(xs, ys)]
    while left:
        # the nearest point not in the tree
        k = min(range(len(left)), key=lambda i: best[left[i]])
        u = left[k]
        left[k] = left[-1]
        left.pop()
        total += best[u]
        ux, uy = xs[u], ys[u]
        for v in left:
            d = abs(xs[v] - ux) + abs(ys[v] - uy)
            if d < best[v]:
                best[v] = d
    return total
"""

POINTS_BRUTE = """
def connect_points(points):
    n = len(points)
    edges = sorted((abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j) for i in range(n) for j in range(i + 1, n))
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    total = 0
    for w, i, j in edges:
        a, b = find(i), find(j)
        if a != b:
            parent[a] = b
            total += w
    return total
"""

# P4: which edges belong to at least one minimum spanning tree (or forest)?
SOME = """
def in_some_mst(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    order = sorted(range(len(edges)), key=lambda i: edges[i][2])
    ans = [False] * len(edges)
    i = 0
    while i < len(order):
        j = i
        w = edges[order[i]][2]
        while j < len(order) and edges[order[j]][2] == w:
            j += 1
        group = order[i:j]
        for k in group:                  # joined by lighter edges already?
            u, v, _ = edges[k]
            ans[k] = find(u) != find(v)
        for k in group:                  # now add the whole group
            u, v, _ = edges[k]
            a, b = find(u), find(v)
            if a != b:
                parent[a] = b
        i = j
    return ans
"""

# brute force: every minimum spanning forest, by trying all subsets of the right size
SOME_BRUTE = """
from itertools import combinations

def in_some_mst(n, edges):
    def parts(pick):
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x
        for i in pick:
            u, v, w = edges[i]
            a, b = find(u), find(v)
            if a == b:
                return None
            parent[a] = b
        return len({find(x) for x in range(n)})
    # the number of edges in a spanning forest: n minus the number of connected parts of the whole graph
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for u, v, w in edges:
        a, b = find(u), find(v)
        if a != b:
            parent[a] = b
    k = n - len({find(x) for x in range(n)})
    best, forests = None, []
    for pick in combinations(range(len(edges)), k):
        if parts(pick) is not None:
            t = sum(edges[i][2] for i in pick)
            forests.append((t, pick))
            if best is None or t < best:
                best = t
    ans = [False] * len(edges)
    for t, pick in forests:
        if t == best:
            for i in pick:
                ans[i] = True
    return ans
"""
