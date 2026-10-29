"""Trusted GEOM solutions (as source strings, for tb.build) and brute forces for cross_geom.py."""
from fractions import Fraction
from math import gcd

# ---------- P1: whole-number points inside a polygon (shoelace + Pick) ----------
P1 = '''
from math import gcd

def inside_points(poly):
    n = len(poly)
    twice_area = 0
    boundary = 0
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]
        twice_area += x1 * y2 - x2 * y1
        boundary += gcd(abs(x2 - x1), abs(y2 - y1))
    twice_area = abs(twice_area)
    return (twice_area - boundary + 2) // 2
'''

# ---------- P2: do two segments meet? 0 no, 1 one point, 2 more than one point ----------
# A plainer version, used as the solution text.
P2 = '''
def meet(a, b, c, d):
    def cross(o, p, q):            # > 0: q is left of o -> p
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])

    def within(p, q, r):           # r lies in the box with corners p, q
        return (min(p[0], q[0]) <= r[0] <= max(p[0], q[0])
                and min(p[1], q[1]) <= r[1] <= max(p[1], q[1]))

    if a == b and c == d:          # two single points
        return 1 if a == c else 0
    if a == b:                     # a single point and a piece
        return 1 if cross(c, d, a) == 0 and within(c, d, a) else 0
    if c == d:
        return 1 if cross(a, b, c) == 0 and within(a, b, c) else 0
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 == 0 and d2 == 0:        # all four points on one line
        key = (lambda p: p[0]) if a[0] != b[0] else (lambda p: p[1])
        lo = max(min(key(a), key(b)), min(key(c), key(d)))
        hi = min(max(key(a), key(b)), max(key(c), key(d)))
        if lo > hi:
            return 0
        return 1 if lo == hi else 2
    # not on one line: at most one common point
    if ((d1 > 0 and d2 < 0) or (d1 < 0 and d2 > 0)) and \\
       ((d3 > 0 and d4 < 0) or (d3 < 0 and d4 > 0)):
        return 1                   # a proper crossing
    if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or \\
       (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
        return 1                   # an end touches the other piece
    return 0
'''

# ---------- P3: convex hull ----------
P3 = '''
def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        out = pts
    else:
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
        out = lower[:-1] + upper[:-1]
    if not out:
        return []
    k = min(range(len(out)), key=lambda i: (out[i][1], out[i][0]))
    return out[k:] + out[:k]
'''

# ---------- P4: do any two segments meet? (Shamos-Hoey sweep) ----------
P4 = '''
def any_crossing(segs):
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
'''


# ---------- brute forces (Fractions, a different method) ----------
def _sub(p, q):
    return (p[0] - q[0], p[1] - q[1])


def _cr(u, v):
    return u[0] * v[1] - u[1] * v[0]


def common_points(a, b, c, d):
    """0, 1 or 2 (more than one), by solving with fractions."""
    r, s = _sub(b, a), _sub(d, c)
    den = _cr(r, s)
    if a == b and c == d:
        return 1 if a == c else 0
    if den != 0:
        t = Fraction(_cr(_sub(c, a), s), den)
        u = Fraction(_cr(_sub(c, a), r), den)
        return 1 if 0 <= t <= 1 and 0 <= u <= 1 else 0
    # parallel, or a point: parametrise everything along the longer direction
    if a == b:
        a, b, c, d = c, d, a, b
        r = _sub(b, a)
    if _cr(r, _sub(c, a)) != 0:
        return 0                        # parallel lines, or the point is off the line
    rr = r[0] * r[0] + r[1] * r[1]
    t0 = Fraction(r[0] * (c[0] - a[0]) + r[1] * (c[1] - a[1]), rr)
    t1 = Fraction(r[0] * (d[0] - a[0]) + r[1] * (d[1] - a[1]), rr)
    lo, hi = max(0, min(t0, t1)), min(1, max(t0, t1))
    if lo > hi:
        return 0
    return 1 if lo == hi else 2


def brute_inside(poly):
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    n = len(poly)
    count = 0
    for x in range(min(xs), max(xs) + 1):
        for y in range(min(ys), max(ys) + 1):
            on_edge = any(common_points(poly[k], poly[(k + 1) % n], (x, y), (x, y)) for k in range(n))
            if on_edge:
                continue
            # winding number with exact arithmetic
            w = 0
            for k in range(n):
                (x1, y1), (x2, y2) = poly[k], poly[(k + 1) % n]
                if y1 <= y < y2 and _cr((x2 - x1, y2 - y1), (x - x1, y - y1)) > 0:
                    w += 1
                elif y2 <= y < y1 and _cr((x2 - x1, y2 - y1), (x - x1, y - y1)) < 0:
                    w -= 1
            if w != 0:
                count += 1
    return count


def brute_hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        out = pts
    else:
        nxt = {}
        for i in pts:
            for j in pts:
                if i == j:
                    continue
                ok = True
                for k in pts:
                    if k in (i, j):
                        continue
                    c = _cr(_sub(j, i), _sub(k, i))
                    if c < 0 or (c == 0 and not (min(i[0], j[0]) <= k[0] <= max(i[0], j[0]) and min(i[1], j[1]) <= k[1] <= max(i[1], j[1]))):
                        ok = False
                        break
                if ok:
                    nxt[i] = j
        if not nxt:                     # all on one line
            out = [pts[0], pts[-1]]
        else:
            start = min(nxt)
            out = [start]
            while nxt[out[-1]] != start:
                out.append(nxt[out[-1]])
    if not out:
        return []
    k = min(range(len(out)), key=lambda i: (out[i][1], out[i][0]))
    return out[k:] + out[:k]


def brute_any(segs):
    """All pairs: does any pair share a point?"""
    for i in range(len(segs)):
        for j in range(i + 1, len(segs)):
            if common_points(*segs[i], *segs[j]):
                return True
    return False
