# Naive DVCQ solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def max_min(values):
    # two separate scans: 2n - 2 comparisons
    return (max(values), min(values))
''', [6, 7, 8]),
    2: ('''
def skyline(buildings):
    # check every building at every edge: O(n^2)
    xs = sorted({x for l, r, h in buildings for x in (l, r)})
    out = []
    for x in xs:
        h = max([b[2] for b in buildings if b[0] <= x < b[1]], default=0)
        if not out or out[-1][1] != h:
            out.append((x, h))
    return out
''', [10, 11]),
    3: ('''
def smaller_after(values):
    # a sorted list of the values seen, from the right: list.insert shifts O(n)
    import bisect
    seen, out = [], []
    for v in reversed(values):
        p = bisect.bisect_left(seen, v)
        out.append(p)
        seen.insert(p, v)
    return out[::-1]
''', [6]),
    4: ('''
def closest_pair(points):
    # sort by x and compare while x is close: O(n^2) when many x are equal
    order = sorted(range(len(points)), key=lambda i: points[i][0])
    best, pair = float("inf"), (0, 1)
    for a in range(len(order)):
        xa, ya = points[order[a]]
        for b in range(a + 1, len(order)):
            xb, yb = points[order[b]]
            dx = xb - xa
            if dx * dx >= best:
                break
            d = dx * dx + (yb - ya) ** 2
            if d < best:
                best, pair = d, (order[a], order[b])
    return pair
''', [8]),
    5: ('''
def multiply(x, y):
    # the schoolbook method: O(n^2)
    a, b = x[::-1], y[::-1]
    res = [0] * (len(a) + len(b))
    for i, d in enumerate(a):
        if d:
            for j, e in enumerate(b):
                res[i + j] += d * e
    out, carry = [], 0
    for v in res:
        carry, d = divmod(v + carry, 10)
        out.append(d)
    while len(out) > 1 and out[-1] == 0:
        out.pop()
    return out[::-1]
''', [9]),
    6: ('''
def select(values, k):
    # quickselect with the first value as the pivot: O(n^2) on sorted lists
    values = list(values)
    while True:
        p = values[0]
        lo = [x for x in values if x < p]
        eq = [x for x in values if x == p]
        hi = [x for x in values if x > p]
        if k < len(lo):
            values = lo
        elif k < len(lo) + len(eq):
            return p
        else:
            k -= len(lo) + len(eq)
            values = hi
''', [6, 7]),
}
