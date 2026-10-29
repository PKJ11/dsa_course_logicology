// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def connect_points(points):
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
`;

export const notes = [
  "Every pair of points can be joined, so the graph has n(n − 1)/2 lines: about 2 million for 2,000 points. A method that lists and sorts all the lines does O(n² log n) work and needs memory for all of them.",
  "Prim's method grows one tree. `best[v]` is the cheapest line from the tree to v. Each step takes the point outside the tree with the smallest `best`, adds it, and updates `best` for the others using the new point: O(n) per step, O(n²) in all, and only O(n) memory. For a dense graph that is the best possible, because every pair may matter.",
  "The cut property (lesson 4) makes this right: the cheapest line from the tree to the rest crosses the cut between them, so some cheapest tree contains it.",
  "A heap version of Prim also works, but on a dense graph it pushes up to n² entries, so it has no advantage here. The Manhattan distance is a whole number, so there is no rounding.",
];
