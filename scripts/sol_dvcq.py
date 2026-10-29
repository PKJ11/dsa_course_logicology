from solgen import write_station

write_station("dvcq", 6, {
    1: ('''def max_min(values):
    n = len(values)
    if n % 2:                       # odd: the first value starts both
        big = small = values[0]
        start = 1
    else:                           # even: the first two are a pair
        if values[0] < values[1]:
            small, big = values[0], values[1]
        else:
            small, big = values[1], values[0]
        start = 2
    for i in range(start, n - 1, 2):
        a, b = values[i], values[i + 1]
        if a < b:                   # 1 comparison inside the pair
            a, b = b, a             # now a >= b
        if a > big:                 # the larger can only be the largest
            big = a
        if b < small:               # the smaller can only be the smallest
            small = b
    return (big, small)
''', [
        "Each pair costs 3 comparisons: one inside the pair, then its larger value against `big` and its smaller value against `small`. The larger value of a pair can never be the smallest overall, so it is never compared with `small`, and the other way round.",
        "With an odd n the first value starts as both `big` and `small` and the rest pair up: 3(n − 1)/2 comparisons. With an even n the first pair costs 1, and the other (n − 2)/2 pairs cost 3 each: 3n/2 − 2. Both are within `3 * n // 2`.",
        "This is the divide and conquer bound written as a loop: each pair is a part of 2 values, solved with 1 comparison, and joining it to the rest costs 2. It is known that no method can use fewer than about 3n/2 − 2 comparisons in the worst case.",
        "A recursive split into halves gives the same count only when every part has an even size: a part of 3 values costs 3 comparisons, the same as a pair plus a single value, and those losses add up (about 1.65n on 100,000 values).",
    ]),
    2: ('''def skyline(buildings):
    def merge(p, q):
        out = []
        i = j = 0
        hp = hq = 0                 # current height of each outline
        while i < len(p) or j < len(q):
            if j >= len(q) or (i < len(p) and p[i][0] < q[j][0]):
                x, hp = p[i]
                i += 1
            elif i >= len(p) or q[j][0] < p[i][0]:
                x, hq = q[j]
                j += 1
            else:                   # both change at the same x
                x, hp = p[i]
                hq = q[j][1]
                i += 1
                j += 1
            h = max(hp, hq)
            if not out or out[-1][1] != h:
                out.append((x, h))
        return out

    def solve(lo, hi):              # the outline of buildings[lo:hi]
        if hi - lo == 1:
            left, right, h = buildings[lo]
            return [(left, h), (right, 0)]
        mid = (lo + hi) // 2
        return merge(solve(lo, mid), solve(mid, hi))

    return solve(0, len(buildings)) if buildings else []
''', [
        "Divide: split the list of buildings in half. Conquer: the outline of each half, by recursion; one building is the base case. Combine: merge the two outlines.",
        "The merge walks both outlines from left to right, like the merge in merge sort. At any x the merged height is the larger of the two outlines' current heights, so it is enough to remember `hp` and `hq` and update whichever outline has a point at x.",
        "Taking both points when their x values are equal gives one point per x. Adding a point only when the height changes keeps neighbouring points different, which also merges touching buildings of the same height.",
        "Each merge is O(n), so T(n) = 2 T(n/2) + O(n) = O(n log n). The recursion is about log₂ n calls deep. A sweep over the 2n edges with a heap of the buildings that are still standing (with lazy removal, HEAP-4) is also O(n log n).",
    ]),
    3: ('''def smaller_after(values):
    n = len(values)
    counts = [0] * n
    idx = list(range(n))            # positions, merge sorted by value
    tmp = [0] * n
    width = 1
    while width < n:                # bottom-up merge sort: runs of 1, 2, 4, ...
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if values[idx[j]] < values[idx[i]]:
                    tmp[k] = idx[j]           # a smaller value from the right
                    j += 1
                else:
                    counts[idx[i]] += j - mid  # right values placed so far
                    tmp[k] = idx[i]
                    i += 1
                k += 1
            while i < mid:
                counts[idx[i]] += j - mid
                tmp[k] = idx[i]
                i += 1
                k += 1
            while j < hi:
                tmp[k] = idx[j]
                j += 1
                k += 1
        idx, tmp = tmp, idx
        width *= 2
    return counts
''', [
        "Merge sort the positions instead of the values, so every count stays with its own position. `idx` holds positions; their values are compared through `values[...]`.",
        "In a merge, every position in the left run came before every position in the right run. When a left position is placed, the `j - mid` right positions already placed hold smaller values and came later: they are exactly the smaller values after it in this part. Each smaller value after a position is counted at exactly one merge.",
        "On a tie the left position is placed first, so an equal value on the right is not counted as smaller.",
        "Bottom-up merging (runs of 1, 2, 4, …) needs no recursion and swaps `idx` and `tmp` instead of copying. O(n log n) on any order. A Fenwick tree over the ranks of the values, filled from right to left, is also O(n log n) (RNGQ-3).",
    ]),
    4: ('''def closest_pair(points):
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
''', [
        "The points are sorted once by x (then y), and the recursion works on places in that order; `order` turns a place back into the position the answer needs. Splitting by place gives each side exactly half the points, even when many share the same x.",
        "Each call returns its places sorted by y, merged from its two halves as in merge sort. So the strip is already in y order, and the work outside the calls is O(n): T(n) = 2 T(n/2) + O(n) = O(n log n).",
        "`best` is shared by every call, so later calls prune with the best distance found anywhere so far. Everything is squared: the strip test `(x - line)² < best` and the stop test `dy² >= best` compare squared distances, with no square roots and no rounding.",
        "Lesson 4's box argument shows that each point in the strip needs at most the next 7 points in y order; the `break` usually stops sooner. Points with equal coordinates give distance 0, and since a and b are different places, the two positions returned are always different.",
    ]),
    5: ('''def multiply(x, y):
    def school(a, b):               # the O(n²) method, for short parts
        res = [0] * (len(a) + len(b) - 1)
        for i, d in enumerate(a):
            if d:
                for j, e in enumerate(b):
                    res[i + j] += d * e
        return res

    def kara(a, b):                 # same length; lowest digit first; no carries
        n = len(a)
        if n <= 32:
            return school(a, b)
        m = n // 2
        a0, a1, b0, b1 = a[:m], a[m:], b[:m], b[m:]
        z0 = kara(a0, b0)           # low × low
        z2 = kara(a1, b1)           # high × high
        s = [u + v for u, v in zip(a1, a0 + [0])]   # a1 may be one longer
        t = [u + v for u, v in zip(b1, b0 + [0])]
        z1 = kara(s, t)             # (low + high)(low + high)
        for k, v in enumerate(z0):
            z1[k] -= v
        for k, v in enumerate(z2):
            z1[k] -= v              # now the middle part: a0·b1 + a1·b0
        res = [0] * (2 * n - 1)
        for k, v in enumerate(z0):
            res[k] += v
        for k, v in enumerate(z1):
            res[k + m] += v
        for k, v in enumerate(z2):
            res[k + 2 * m] += v
        return res

    a = x[::-1]                     # position k is worth 10 ** k
    b = y[::-1]
    n = max(len(a), len(b))
    a += [0] * (n - len(a))
    b += [0] * (n - len(b))
    out = []
    carry = 0
    for v in kara(a, b):            # carry once, at the end
        carry, d = divmod(v + carry, 10)
        out.append(d)
    while carry:
        carry, d = divmod(carry, 10)
        out.append(d)
    while len(out) > 1 and out[-1] == 0:
        out.pop()
    return out[::-1]
''', [
        "Reversed, a digit list is the list of coefficients of a polynomial in 10: entry k is worth 10ᵏ. Multiplying the polynomials and carrying once at the end gives the product. Entries in between may be far above 9; Python integers do not overflow.",
        "With halves a0, a1 and b0, b1 (low parts first), Karatsuba's three products are z0 = a0·b0, z2 = a1·b1 and z1 = (a0 + a1)(b0 + b1) − z0 − z2, which equals a0·b1 + a1·b0. They go in at positions 0, m and 2m, because the high halves are worth 10ᵐ. No carrying inside the recursion means the subtraction never needs to borrow.",
        "When n is odd, the high half is one longer; padding the low half with one 0 lets the sums be added position by position. The parts stay the same length, so the recursion never has to pad again.",
        "Below 32 digits the schoolbook loop is faster than more recursion, because each call has a fixed cost. With this cutoff, two 12,000-digit numbers take about 10 million digit products instead of 144 million. T(n) = 3 T(n/2) + O(n) = O(n to the power log₂ 3), about n¹·⁵⁸⁵.",
    ]),
    6: ('''def select(values, k):
    def sort_small(g):              # insertion sort, for 5 values or fewer
        g = list(g)
        for i in range(1, len(g)):
            x = g[i]
            j = i - 1
            while j >= 0 and x < g[j]:
                g[j + 1] = g[j]
                j -= 1
            g[j + 1] = x
        return g

    values = list(values)
    while True:
        n = len(values)
        if n <= 5:
            return sort_small(values)[k]
        # the median of each group of 5 (the last group may be shorter)
        meds = [sort_small(values[i:i + 5])[(min(5, n - i) - 1) // 2]
                for i in range(0, n, 5)]
        p = select(meds, (len(meds) - 1) // 2)   # the median of medians
        lo, hi, eq = [], [], 0
        for x in values:            # one counted comparison per value
            if x < p:
                lo.append(x)
            elif x == p:            # == is not counted
                eq += 1
            else:
                hi.append(x)
        if k < len(lo):
            values = lo
        elif k < len(lo) + eq:
            return p
        else:
            k -= len(lo) + eq
            values = hi
''', [
        "The pivot is the median of the groups' medians. At least half of the groups have a median no larger than the pivot, and each of those groups has 3 values no larger than it, so at least about 3n/10 values are on each side, and a round keeps at most about 7n/10 (lesson 6).",
        "So T(n) ≤ T(n/5) + T(7n/10) + O(n). The two calls get 9/10 of n together, so the levels of the recursion tree shrink by 9/10 and the total is O(n) (lesson 2).",
        "The three-way partition handles repeats: when k falls among the values equal to the pivot, the answer is the pivot itself, so a list of equal values finishes in one round. Testing `x < p` first and then `x == p` costs one counted comparison per value, because `==` is not counted.",
        "The kept side is handled by the `while` loop rather than a recursive call, so the only recursion is on the medians, n/5 at a time: a few levels deep. On the tests this makes about 8 comparisons per value, whatever the order of the list; sorting makes about log₂ n per value.",
    ]),
})
