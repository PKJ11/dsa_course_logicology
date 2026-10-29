# Naive SPAN solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def cheaper_tree(n, tree, extra):
    # finds the tree path with a recursive search: Python stops at about 1,000 nested calls
    adj = [[] for _ in range(n)]
    total = 0
    for u, v, w in tree:
        adj[u].append((v, w))
        adj[v].append((u, w))
        total += w
    a, b, w = extra
    if a == b:
        return total
    def go(u, came, best):
        if u == b:
            return best
        for v, c in adj[u]:
            if v != came:
                r = go(v, u, max(best, c))
                if r is not None:
                    return r
        return None
    h = go(a, -1, float('-inf'))
    return total - h + w if w < h else total
''', [8]),
    2: ('''
def mst(n, edges):
    # Kruskal, but joining two groups relabels every station of the first group
    label = list(range(n))
    members = [[i] for i in range(n)]
    chosen = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        a, b = label[u], label[v]
        if a == b:
            continue
        for x in members[a]:
            label[x] = b
        members[b] += members[a]
        members[a] = []
        chosen.append((u, v, w))
    return chosen if len(chosen) == n - 1 else None
''', [8]),
    3: ('''
def connect_points(points):
    # Kruskal over every pair of points
    n = len(points)
    lines = sorted((abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j)
                   for i in range(n) for j in range(i + 1, n))
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = 0
    for w, i, j in lines:
        a, b = find(i), find(j)
        if a != b:
            parent[a] = b
            total += w
    return total
''', [6]),
    4: ('''
def in_some_mst(n, edges):
    # reports the lines that one run of Kruskal picks
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    ans = [False] * len(edges)
    for i in sorted(range(len(edges)), key=lambda i: edges[i][2]):
        u, v, w = edges[i]
        a, b = find(u), find(v)
        if a != b:
            parent[a] = b
            ans[i] = True
    return ans
''', [0, 1]),
}

# Wrong or slow versions run by hand (not by check-problems.py): {name: (problem, code, tests that must catch it)}.
EXTRA = {
    "P1 swap out the dearest line of the whole tree": (1, '''
def cheaper_tree(n, tree, extra):
    total = sum(w for u, v, w in tree)
    a, b, w = extra
    if a == b or not tree:
        return total
    h = max(c for u, v, c in tree)
    return total - h + w if w < h else total
''', [2]),
    "P2 a search for a loop before every line": (2, '''
def mst(n, edges):
    adj = [[] for _ in range(n)]
    chosen = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        seen = {u}
        stack = [u]
        while stack:
            x = stack.pop()
            for y in adj[x]:
                if y not in seen:
                    seen.add(y)
                    stack.append(y)
        if v in seen:
            continue
        adj[u].append(v)
        adj[v].append(u)
        chosen.append((u, v, w))
    return chosen if len(chosen) == n - 1 else None
''', [7, 8]),
    "P4 a fresh search over cheaper lines for every line": (4, '''
def in_some_mst(n, edges):
    ans = []
    for u, v, w in edges:
        if u == v:
            ans.append(False)
            continue
        adj = {}
        for a, b, c in edges:
            if c < w:
                adj.setdefault(a, []).append(b)
                adj.setdefault(b, []).append(a)
        seen = {u}
        stack = [u]
        while stack:
            x = stack.pop()
            for y in adj.get(x, []):
                if y not in seen:
                    seen.add(y)
                    stack.append(y)
        ans.append(v not in seen)
    return ans
''', [7, 8]),
}
