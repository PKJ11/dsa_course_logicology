// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def mst(n, edges):
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
`;

export const notes = [
  "Kruskal's method: take the lines from cheapest to most expensive, and keep each line that does not close a loop with the lines kept so far. The cut property (lesson 4) shows each kept line belongs to some cheapest tree, so the result is a cheapest tree.",
  "Union-find answers 'are u and v joined already?' in nearly O(1) steps, and joins two groups in one step. Relabelling every station of one group on each join is right but slow: on a chain listed in order it costs about n²/2 steps.",
  "Sorting costs O(E log E), which is the largest part. `sorted(edges, key=...)` leaves the input list alone. Stopping at n − 1 kept lines saves time when the most expensive lines are many.",
  "If fewer than n − 1 lines are kept, some stations are never joined: the network is not connected, and there is no spanning tree. With n = 1 the answer is an empty list.",
];
