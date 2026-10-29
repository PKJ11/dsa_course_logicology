// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def total_distance(n, roads):
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    parent = [-1] * n
    up = [0] * n                       # length of the road to the parent
    order = [0]                        # BFS order from station 0
    seen = [False] * n
    seen[0] = True
    for v in order:
        for u, w in adj[v]:
            if not seen[u]:
                seen[u] = True
                parent[u] = v
                up[u] = w
                order.append(u)
    size = [1] * n                     # stations in the subtree
    down = [0] * n                     # total distance from v to its subtree
    for v in reversed(order):          # children before parents
        p = parent[v]
        if p >= 0:
            size[p] += size[v]
            down[p] += down[v] + up[v] * size[v]
    total = [0] * n
    total[0] = down[0]
    for v in order[1:]:                # parents before children
        total[v] = total[parent[v]] + up[v] * (n - 2 * size[v])
    return total
`;

export const notes = [
  "Rerooting (lesson 1), with roads of any length. The tree is rooted at station 0 and listed in BFS order, so each station comes after its parent; up[v] is the length of the road from v to its parent.",
  "Pass 1 runs through the list backwards, so every child is finished before its parent. size[v] counts the stations in v's subtree, and down[v] is their total distance from v: a child c adds down[c] (distances from c) plus up[c] once for each of its size[c] stations.",
  "Pass 2 runs forwards. total[0] = down[0]. Moving the start from p to its child c, the size[c] stations in c's subtree come up[c] closer and the other n − size[c] go up[c] further, so total[c] = total[p] + up[c] · (n − 2 · size[c]).",
  "Neither pass uses recursion, so a line of 100,000 stations is fine. Cost: O(n) time and memory.",
];
