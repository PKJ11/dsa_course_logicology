from solgen import write_station

write_station("span", 4, {
    1: ('''from collections import deque

def cheaper_tree(n, tree, extra):
    adj = [[] for _ in range(n)]
    total = 0
    for u, v, w in tree:
        adj[u].append((v, w))
        adj[v].append((u, w))
        total += w
    a, b, w = extra
    if a == b:
        return total                       # a loop joins nothing new
    # heaviest[x]: the most expensive line on the tree path from a to x
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
''', [
        "The new line a–b closes exactly one loop: the tree path from a to b, plus the new line. Any spanning tree of these n lines leaves out exactly one line of that loop, because leaving out a line elsewhere would leave the loop whole, or cut the tree in two.",
        "So the cheapest choice leaves out the most expensive line of the loop. If that is the new line, the old tree stays; otherwise swap the most expensive tree line on the path for the new one. This is the cycle property of lesson 1.",
        "In a tree there is only one path between two stations, so any search from a finds it. Carrying the most expensive line seen so far along the search gives the answer for b directly, without rebuilding the path. Each station is reached once: O(n).",
        "The search uses a queue, not recursion, because the path can be 100,000 stations long. A depth-first search with your own stack works just as well.",
    ]),
    2: ('''def mst(n, edges):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path halving (DSUF-3)
            x = parent[x]
        return x
    chosen = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        a, b = find(u), find(v)
        if a == b:
            continue                       # u and v are joined already: a loop
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a                      # union by size (DSUF-2)
        size[a] += size[b]
        chosen.append((u, v, w))
        if len(chosen) == n - 1:
            break                          # a spanning tree is complete
    return chosen if len(chosen) == n - 1 else None
''', [
        "Kruskal's method: take the lines from cheapest to most expensive, and keep each line that does not close a loop with the lines kept so far. The cut property (lesson 4) shows each kept line belongs to some cheapest tree, so the result is a cheapest tree.",
        "Union-find answers 'are u and v joined already?' in nearly O(1) steps, and joins two groups in one step. Relabelling every station of one group on each join is right but slow: on a chain listed in order it costs about n²/2 steps.",
        "Sorting costs O(E log E), which is the largest part. `sorted(edges, key=...)` leaves the input list alone. Stopping at n − 1 kept lines saves time when the most expensive lines are many.",
        "If fewer than n − 1 lines are kept, some stations are never joined: the network is not connected, and there is no spanning tree. With n = 1 the answer is an empty list.",
    ]),
    3: ('''def connect_points(points):
    n = len(points)
    if n <= 1:
        return 0
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    # best[v]: the cheapest line from the tree to v (the tree starts as point 0)
    best = [abs(x - xs[0]) + abs(y - ys[0]) for x, y in zip(xs, ys)]
    left = list(range(1, n))               # points not yet in the tree
    total = 0
    while left:
        k = min(range(len(left)), key=lambda i: best[left[i]])
        u = left[k]
        left[k] = left[-1]                 # remove u in O(1)
        left.pop()
        total += best[u]
        ux, uy = xs[u], ys[u]
        for v in left:                     # u is in the tree now
            d = abs(xs[v] - ux) + abs(ys[v] - uy)
            if d < best[v]:
                best[v] = d
    return total
''', [
        "Every pair of points can be joined, so the graph has n(n − 1)/2 lines: about 2 million for 2,000 points. A method that lists and sorts all the lines does O(n² log n) work and needs memory for all of them.",
        "Prim's method grows one tree. `best[v]` is the cheapest line from the tree to v. Each step takes the point outside the tree with the smallest `best`, adds it, and updates `best` for the others using the new point: O(n) per step, O(n²) in all, and only O(n) memory. For a dense graph that is the best possible, because every pair may matter.",
        "The cut property (lesson 4) makes this right: the cheapest line from the tree to the rest crosses the cut between them, so some cheapest tree contains it.",
        "A heap version of Prim also works, but on a dense graph it pushes up to n² entries, so it has no advantage here. The Manhattan distance is a whole number, so there is no rounding.",
    ]),
    4: ('''def in_some_mst(n, edges):
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
        group = order[i:j]                 # every line of cost w
        for k in group:                    # joined by cheaper lines already?
            u, v, _ = edges[k]
            ans[k] = find(u) != find(v)
        for k in group:                    # then add the whole group
            u, v, _ = edges[k]
            a, b = find(u), find(v)
            if a != b:
                parent[a] = b
        i = j
    return ans
''', [
        "A line u–v of cost w is in some cheapest tree exactly when u and v are not joined by lines that are all cheaper than w. If they are, the line is the most expensive on a loop, and strictly more expensive than the rest of it, so by the cycle property no cheapest tree uses it.",
        "If they are not, look at the cut between the stations joined to u by cheaper lines and all the others. No cheaper line crosses it, so u–v is a cheapest line across that cut, and by the cut property some cheapest tree contains it (lesson 4).",
        "So sort the lines and handle them one cost at a time. First ask about every line of the group, with union-find holding only the cheaper lines; only then add the group. Adding each line before asking about the next line of the same cost gets ties wrong (a triangle of equal lines).",
        "The work is one sort and one union-find pass: O(E log E). A line from a station to itself is never in a tree: `find(u) == find(v)` is True for it.",
    ]),
})
