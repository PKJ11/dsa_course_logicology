"""Cross-check the trusted GEOM solutions against brute force on many small random cases."""
import random
from math import gcd
import trusted_geom as T


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


f1 = load(T.P1, "inside_points")
f2 = load(T.P2, "meet")
f3 = load(T.P3, "hull")
f4 = load(T.P4, "any_crossing")
rng = random.Random(11)


def pt(r):
    return (rng.randint(0, r), rng.randint(0, r))


def simple_polygon(k, r):
    """A random simple polygon with k corners, or None."""
    pts = list({pt(r) for _ in range(k)})
    if len(pts) < 3:
        return None
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    import math
    pts.sort(key=lambda p: (math.atan2(p[1] - cy, p[0] - cx), (p[0] - cx) ** 2 + (p[1] - cy) ** 2))
    n = len(pts)
    edges = [(pts[i], pts[(i + 1) % n]) for i in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            c = T.common_points(*edges[i], *edges[j])
            adjacent = j == i + 1 or (i == 0 and j == n - 1)
            if adjacent and (c != 1 or n == 3 and False):
                if c != 1:
                    return None
            if not adjacent and c:
                return None
    # no zero area
    a = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    if a == 0:
        return None
    if rng.random() < 0.5:
        pts.reverse()
    return pts


cases = [0, 0, 0, 0]
while cases[0] < 1500:
    poly = simple_polygon(rng.randint(3, 8), rng.choice([4, 6, 9]))
    if poly is None:
        continue
    assert f1(poly) == T.brute_inside(poly), poly
    cases[0] += 1
for _ in range(40000):
    r = rng.choice([2, 3, 5])
    a, b, c, d = pt(r), pt(r), pt(r), pt(r)
    assert f2(a, b, c, d) == T.common_points(a, b, c, d), (a, b, c, d)
    assert f2(a, b, c, d) == f2(c, d, a, b) == f2(b, a, d, c)
    cases[1] += 1
for _ in range(5000):
    r = rng.choice([2, 3, 6, 20])
    pts = [pt(r) for _ in range(rng.randint(1, 9))]
    assert f3(pts) == T.brute_hull(pts), (pts, f3(pts), T.brute_hull(pts))
    cases[2] += 1
for _ in range(60000):
    r = rng.choice([2, 3, 4, 6, 10])
    segs = []
    for _ in range(rng.randint(1, 7)):
        a = pt(r)
        b = pt(r)
        if rng.random() < 0.15:
            b = (a[0], b[1])            # upright pieces
        if a != b:
            segs.append((a, b) if rng.random() < 0.5 else (b, a))
    if not segs:
        continue
    got = f4(segs)
    want = T.brute_any(segs)
    if got is None:
        assert not want, segs
    else:
        i, j = got
        assert i < j and T.common_points(*segs[i], *segs[j]), (segs, got)
    cases[3] += 1
print("ok", cases)
