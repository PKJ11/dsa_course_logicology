// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def any_crossing(segs):
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])

    def meets(i, j):
        a, b = segs[i]
        c, d = segs[j]
        d1, d2, d3, d4 = cross(a, b, c), cross(a, b, d), cross(c, d, a), cross(c, d, b)
        if ((d1 > 0 > d2) or (d1 < 0 < d2)) and ((d3 > 0 > d4) or (d3 < 0 < d4)):
            return True
        return ((d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d))
                or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)))

    left = [min(s) for s in segs]          # the end with smaller x (then smaller y)
    right = [max(s) for s in segs]
    events = []
    for i in range(len(segs)):
        events.append((left[i][0], 0, left[i][1], i))     # 0: a piece starts
        events.append((right[i][0], 1, right[i][1], i))   # 1: a piece ends
    events.sort()

    def below(p, t):
        """Is point p below piece t, at p's x? None if p is on t."""
        a, b = left[t], right[t]
        if a[0] == b[0]:                    # an upright piece: compare with its y range
            if p[1] < a[1]:
                return True
            if p[1] > b[1]:
                return False
            return None
        c = cross(a, b, p)
        if c == 0:
            return None
        return c < 0

    active = []                             # pieces crossing the sweep line, lowest first
    for x, kind, y, i in events:
        if kind == 0:
            p = left[i]
            lo, hi = 0, len(active)
            while lo < hi:
                mid = (lo + hi) // 2
                r = below(p, active[mid])
                if r is None:
                    return (min(i, active[mid]), max(i, active[mid]))
                if r:
                    hi = mid
                else:
                    lo = mid + 1
            active.insert(lo, i)
            for k in (lo - 1, lo + 1):
                if 0 <= k < len(active) and meets(i, active[k]):
                    return (min(i, active[k]), max(i, active[k]))
        else:
            # find piece i by binary search on its right end
            p = right[i]
            lo, hi = 0, len(active)
            k = -1
            while lo < hi:
                mid = (lo + hi) // 2
                t = active[mid]
                if t == i:
                    k = mid
                    break
                r = below(p, t)
                if r is None:               # another piece passes through p
                    return (min(i, t), max(i, t))
                if r:
                    hi = mid
                else:
                    lo = mid + 1
            if k == -1:
                k = active.index(i)
            active.pop(k)
            if 1 <= k < len(active) and meets(active[k - 1], active[k]):
                a, b = active[k - 1], active[k]
                return (min(a, b), max(a, b))
    return None
`;

export const notes = [
  "The Shamos–Hoey sweep (lesson 4). Events are the left and right ends of the pieces, sorted by x, with starts before ends at equal x, so pieces that touch at a shared end are in the list together.",
  "active lists the pieces the sweep line crosses, from the lowest up. The place of a new piece is found by binary search on its left end, comparing heights with the cross product (an upright piece by its y range). If the left end lies on a piece in the list, those two meet.",
  "After an insert the new piece is checked against its two neighbours; after a removal the two pieces that become neighbours are checked. The lesson proves that if any two pieces meet, some check finds a pair that meets.",
  "A removal finds its piece by the same binary search on the right end. active.index(i) would also work, but it costs O(n) per removal.",
  "Cost: O(n log n) comparisons, plus the list's insert and pop, which move references in C and are fast for these sizes.",
];
