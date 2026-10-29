"""Trusted DVCQ solutions, shared by build_dvcq.py and the brute-force cross-check (cross_dvcq.py)."""

MAXMIN = """
def max_min(values):
    n = len(values)
    if n % 2:
        big = small = values[0]
        start = 1
    else:
        if values[0] < values[1]:
            small, big = values[0], values[1]
        else:
            small, big = values[1], values[0]
        start = 2
    for i in range(start, n - 1, 2):
        a, b = values[i], values[i + 1]
        if a < b:
            if a < small:
                small = a
            if b > big:
                big = b
        else:
            if b < small:
                small = b
            if a > big:
                big = a
    return (big, small)
"""

SKY = """
def skyline(buildings):
    def merge(p, q):
        out = []
        i = j = 0
        hp = hq = 0
        while i < len(p) or j < len(q):
            if j >= len(q) or (i < len(p) and p[i][0] < q[j][0]):
                x, hp = p[i]
                i += 1
            elif i >= len(p) or q[j][0] < p[i][0]:
                x, hq = q[j]
                j += 1
            else:
                x, hp = p[i]
                hq = q[j][1]
                i += 1
                j += 1
            h = max(hp, hq)
            if not out or out[-1][1] != h:
                out.append((x, h))
        return out

    def solve(lo, hi):
        if hi - lo == 1:
            l, r, h = buildings[lo]
            return [(l, h), (r, 0)]
        mid = (lo + hi) // 2
        return merge(solve(lo, mid), solve(mid, hi))

    return solve(0, len(buildings)) if buildings else []
"""

SKY_BRUTE = """
def skyline(buildings):
    xs = sorted({x for l, r, h in buildings for x in (l, r)})
    out = []
    for x in xs:
        h = max([b[2] for b in buildings if b[0] <= x < b[1]], default=0)
        if not out or out[-1][1] != h:
            out.append((x, h))
    return out
"""

SMALLER = """
def smaller_after(values):
    n = len(values)
    counts = [0] * n
    idx = list(range(n))
    tmp = [0] * n
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if values[idx[j]] < values[idx[i]]:
                    tmp[k] = idx[j]
                    j += 1
                else:
                    counts[idx[i]] += j - mid
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
"""

PAIR = """
def closest_pair(points):
    n = len(points)
    order = sorted(range(n), key=lambda i: points[i])
    xs = [points[i][0] for i in order]
    ys = [points[i][1] for i in order]
    best = [float("inf"), 0, 1]

    def solve(lo, hi):
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
        merged = []
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
                    break
                d = (xs[q] - xs[p]) ** 2 + dy * dy
                if d < best[0]:
                    best[:] = [d, p, q]
        return merged

    solve(0, n)
    return (order[best[1]], order[best[2]])
"""

MULT = """
def multiply(x, y):
    def school(a, b):
        res = [0] * (len(a) + len(b) - 1)
        for i, d in enumerate(a):
            if d:
                for j, e in enumerate(b):
                    res[i + j] += d * e
        return res

    def kara(a, b):
        n = len(a)
        if n <= 32:
            return school(a, b)
        m = n // 2
        a0, a1, b0, b1 = a[:m], a[m:], b[:m], b[m:]
        z0 = kara(a0, b0)
        z2 = kara(a1, b1)
        s = [u + v for u, v in zip(a1, a0 + [0])]
        t = [u + v for u, v in zip(b1, b0 + [0])]
        z1 = kara(s, t)
        for k, v in enumerate(z0):
            z1[k] -= v
        for k, v in enumerate(z2):
            z1[k] -= v
        res = [0] * (2 * n - 1)
        for k, v in enumerate(z0):
            res[k] += v
        for k, v in enumerate(z1):
            res[k + m] += v
        for k, v in enumerate(z2):
            res[k + 2 * m] += v
        return res

    a = x[::-1]
    b = y[::-1]
    n = max(len(a), len(b))
    a += [0] * (n - len(a))
    b += [0] * (n - len(b))
    out = []
    carry = 0
    for v in kara(a, b):
        carry, d = divmod(v + carry, 10)
        out.append(d)
    while carry:
        carry, d = divmod(carry, 10)
        out.append(d)
    while len(out) > 1 and out[-1] == 0:
        out.pop()
    return out[::-1]
"""

SELECT = """
def select(values, k):
    def sort_small(g):
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
        meds = [sort_small(values[i:i + 5])[(min(5, n - i) - 1) // 2] for i in range(0, n, 5)]
        p = select(meds, (len(meds) - 1) // 2)
        lo, hi, eq = [], [], 0
        for x in values:
            if x < p:
                lo.append(x)
            elif x == p:
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
"""
