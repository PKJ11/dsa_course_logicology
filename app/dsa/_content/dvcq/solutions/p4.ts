// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def closest_pair(points):
    n = len(points)
    order = sorted(range(n), key=lambda i: points[i])   # by x, then y
    xs = [points[i][0] for i in order]
    ys = [points[i][1] for i in order]
    best = [float("inf"), 0, 1]     # squared distance, two places in order

    def solve(lo, hi):              # returns places lo..hi-1 sorted by y
        if hi - lo <= 3:
            for a in range(lo, hi):
                for b in range(a + 1, hi):
                    d = (xs[a] - xs[b]) ** 2 + (ys[a] - ys[b]) ** 2
                    if d < best[0]:
                        best[:] = [d, a, b]
            return sorted(range(lo, hi), key=lambda k: ys[k])
        mid = (lo + hi) // 2
        line = xs[mid]
        left = solve(lo, mid)
        right = solve(mid, hi)
        merged = []                 # merge the two halves by y
        i = j = 0
        while i < len(left) and j < len(right):
            if ys[left[i]] <= ys[right[j]]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        merged += left[i:]
        merged += right[j:]
        strip = [k for k in merged if (xs[k] - line) ** 2 < best[0]]
        for a in range(len(strip)):
            p = strip[a]
            for b in range(a + 1, min(a + 8, len(strip))):
                q = strip[b]
                dy = ys[q] - ys[p]
                if dy * dy >= best[0]:
                    break           # every later point is higher still
                d = (xs[q] - xs[p]) ** 2 + dy * dy
                if d < best[0]:
                    best[:] = [d, p, q]
        return merged

    solve(0, n)
    return (order[best[1]], order[best[2]])
`;

export const notes = [
  "The points are sorted once by x (then y), and the recursion works on places in that order; `order` turns a place back into the position the answer needs. Splitting by place gives each side exactly half the points, even when many share the same x.",
  "Each call returns its places sorted by y, merged from its two halves as in merge sort. So the strip is already in y order, and the work outside the calls is O(n): T(n) = 2 T(n/2) + O(n) = O(n log n).",
  "`best` is shared by every call, so later calls prune with the best distance found anywhere so far. Everything is squared: the strip test `(x - line)² < best` and the stop test `dy² >= best` compare squared distances, with no square roots and no rounding.",
  "Lesson 4's box argument shows that each point in the strip needs at most the next 7 points in y order; the `break` usually stops sooner. Points with equal coordinates give distance 0, and since a and b are different places, the two positions returned are always different.",
];
