# Naive GEOM solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def inside_points(poly):
    # try every whole-number point of the bounding box
    n = len(poly)
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    count = 0
    for x in range(min(xs), max(xs) + 1):
        for y in range(min(ys), max(ys) + 1):
            inside = False
            on = False
            for k in range(n):
                a, b = poly[k], poly[(k + 1) % n]
                if cross(a, b, (x, y)) == 0 and min(a[0], b[0]) <= x <= max(a[0], b[0]) and min(a[1], b[1]) <= y <= max(a[1], b[1]):
                    on = True
                    break
                if (a[1] > y) != (b[1] > y):
                    c = cross(a, b, (x, y))
                    if (c > 0) == (b[1] > a[1]):
                        inside = not inside
            if inside and not on:
                count += 1
    return count
''', [8, 9]),
    2: ('''
def meet(a, b, c, d):
    # only proper crossings, and one-line overlaps by x
    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 * d2 < 0 and d3 * d4 < 0:
        return 1
    return 0
''', [4, 5, 8, 9, 10, 11, 13, 14]),
    3: ('''
def hull(points):
    # gift wrapping
    pts = list(set(points))
    if len(pts) <= 2:
        return sorted(pts, key=lambda p: (p[1], p[0]))
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def d2(a, b):
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    start = min(pts, key=lambda p: (p[1], p[0]))
    out = [start]
    while True:
        cur = out[-1]
        nxt = pts[0] if pts[0] != cur else pts[1]
        for p in pts:
            if p == cur:
                continue
            c = cross(cur, nxt, p)
            if c < 0 or (c == 0 and d2(cur, p) > d2(cur, nxt)):
                nxt = p
        if nxt == start:
            break
        out.append(nxt)
        if len(out) > len(pts):
            break
    return out
''', [10]),
    4: ('''
def any_crossing(segs):
    # every pair
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])
    n = len(segs)
    for i in range(n):
        a, b = segs[i]
        for j in range(i + 1, n):
            c, d = segs[j]
            d1, d2, d3, d4 = cross(a, b, c), cross(a, b, d), cross(c, d, a), cross(c, d, b)
            if d1 * d2 < 0 and d3 * d4 < 0:
                return (i, j)
            if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
                return (i, j)
    return None
''', [11, 12]),
}

EXTRA = {
    "P1 no absolute value": (1, '''
from math import gcd
def inside_points(poly):
    n = len(poly)
    s = b = 0
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]
        s += x1 * y2 - x2 * y1
        b += gcd(abs(x2 - x1), abs(y2 - y1))
    return (s - b + 2) // 2
'''),
    "P1 corners only on the boundary": (1, '''
def inside_points(poly):
    n = len(poly)
    s = 0
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]
        s += x1 * y2 - x2 * y1
    return (abs(s) - n + 2) // 2
'''),
    "P1 float area": (1, '''
from math import gcd
def inside_points(poly):
    n = len(poly)
    s = 0.0
    b = 0
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]
        s += float(x1) * y2 - float(x2) * y1
        b += gcd(abs(x2 - x1), abs(y2 - y1))
    return int(abs(s) / 2 - b / 2 + 1)
'''),
    "P2 one line means they meet": (2, '''
def meet(a, b, c, d):
    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 == 0 and d2 == 0:
        return 2
    if d1 * d2 <= 0 and d3 * d4 <= 0:
        return 1
    return 0
'''),
    "P2 floats": (2, '''
def meet(a, b, c, d):
    def cross(o, p, q):
        return float(p[0] - o[0]) * float(q[1] - o[1]) - float(p[1] - o[1]) * float(q[0] - o[0])
    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])
    if a == b and c == d:
        return 1 if a == c else 0
    if a == b:
        return 1 if cross(c, d, a) == 0 and within(c, d, a) else 0
    if c == d:
        return 1 if cross(a, b, c) == 0 and within(a, b, c) else 0
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 == 0 and d2 == 0:
        key = (lambda p: p[0]) if a[0] != b[0] else (lambda p: p[1])
        lo = max(min(key(a), key(b)), min(key(c), key(d)))
        hi = min(max(key(a), key(b)), max(key(c), key(d)))
        return 0 if lo > hi else (1 if lo == hi else 2)
    if d1 * d2 < 0 and d3 * d4 < 0:
        return 1
    if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
        return 1
    return 0
'''),
    "P2 overlap compared by x only": (2, '''
def meet(a, b, c, d):
    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])
    if a == b and c == d:
        return 1 if a == c else 0
    if a == b:
        return 1 if cross(c, d, a) == 0 and within(c, d, a) else 0
    if c == d:
        return 1 if cross(a, b, c) == 0 and within(a, b, c) else 0
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 == 0 and d2 == 0:
        lo = max(min(a[0], b[0]), min(c[0], d[0]))
        hi = min(max(a[0], b[0]), max(c[0], d[0]))
        return 0 if lo > hi else (1 if lo == hi else 2)
    if d1 * d2 < 0 and d3 * d4 < 0:
        return 1
    if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
        return 1
    return 0
'''),
    "P3 keeps points on edges (< 0)": (3, '''
def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        out = pts
    else:
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        lower = []
        for p in pts:
            while len(lower) >= 2 and cross(lower[-2], lower[-1], p) < 0:
                lower.pop()
            lower.append(p)
        upper = []
        for p in reversed(pts):
            while len(upper) >= 2 and cross(upper[-2], upper[-1], p) < 0:
                upper.pop()
            upper.append(p)
        out = lower[:-1] + upper[:-1]
    k = min(range(len(out)), key=lambda i: (out[i][1], out[i][0]))
    return out[k:] + out[:k]
'''),
    "P3 starts at the leftmost point": (3, '''
def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]
'''),
    "P4 no check after a removal": (4, '''
def any_crossing(segs):
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])
    def meets(i, j):
        a, b = segs[i]
        c, d = segs[j]
        d1, d2, d3, d4 = cross(a, b, c), cross(a, b, d), cross(c, d, a), cross(c, d, b)
        if d1 * d2 < 0 and d3 * d4 < 0:
            return True
        return (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b))
    left = [min(s) for s in segs]
    right = [max(s) for s in segs]
    ev = sorted([(left[i][0], 0, left[i][1], i) for i in range(len(segs))] + [(right[i][0], 1, right[i][1], i) for i in range(len(segs))])
    def below(p, t):
        a, b = left[t], right[t]
        if a[0] == b[0]:
            return True if p[1] < a[1] else (False if p[1] > b[1] else None)
        c = cross(a, b, p)
        return None if c == 0 else c < 0
    active = []
    for x, kind, y, i in ev:
        if kind == 0:
            lo, hi = 0, len(active)
            while lo < hi:
                mid = (lo + hi) // 2
                r = below(left[i], active[mid])
                if r is None:
                    return (i, active[mid])
                if r:
                    hi = mid
                else:
                    lo = mid + 1
            active.insert(lo, i)
            for k in (lo - 1, lo + 1):
                if 0 <= k < len(active) and meets(i, active[k]):
                    return (i, active[k])
        else:
            active.remove(i)
    return None
'''),
}
