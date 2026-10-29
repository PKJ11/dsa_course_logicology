# Naive RNGQ solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def after_adds(n, adds, queries):
    # loop over every range
    a = [0] * n
    for l, r, v in adds:
        for i in range(l, r):
            a[i] += v
    return [sum(a[l:r]) for l, r in queries]
''', [6]),
    2: ('''
def range_min(a, queries):
    # read the whole range every time
    return [min(a[l:r]) for l, r in queries]
''', [5, 6]),
    3: ('''
class Fenwick:
    # a plain list: sum over a slice for every total
    def __init__(self, n):
        self.a = [0] * n
    def add(self, i, v):
        self.a[i] += v
    def prefix(self, i):
        return sum(self.a[:i])
    def total(self, l, r):
        return sum(self.a[l:r])
''', [5]),
    4: ('''
class MinTree:
    # blocks of about sqrt(n): O(sqrt n) per question
    def __init__(self, a):
        self.a = list(a)
        self.b = b = max(1, int(len(a) ** 0.5))
        self.top = [min(self.a[i:i + b]) for i in range(0, len(a), b)]
    def set(self, i, v):
        self.a[i] = v
        k = i // self.b
        self.top[k] = min(self.a[k * self.b:(k + 1) * self.b])
    def smallest(self, l, r):
        b, a = self.b, self.a
        best = None
        while l < r and l % b:
            if best is None or a[l] < best:
                best = a[l]
            l += 1
        while l + b <= r:
            if best is None or self.top[l // b] < best:
                best = self.top[l // b]
            l += b
        while l < r:
            if best is None or a[l] < best:
                best = a[l]
            l += 1
        return best
''', [5]),
    5: ('''
class RangeTree:
    # a plain list: loop over every range
    def __init__(self, n):
        self.a = [0] * n
    def add(self, l, r, v):
        for i in range(l, r):
            self.a[i] += v
    def total(self, l, r):
        return sum(self.a[l:r])
''', [6]),
    6: ('''
class Blocks:
    # a plain list: loop over every range
    def __init__(self, a):
        self.a = list(a)
    def add(self, l, r, v):
        a = self.a
        for i in range(l, r):
            a[i] += v
    def largest(self, l, r):
        return max(self.a[l:r])
''', [6]),
}

# Run by hand: a segment tree for RNGQ-P2 (O(log n) per question) must fail the comparison test only.
NAIVE_P2_SEG = '''
def range_min(a, queries):
    n = len(a)
    t = [None] * n + list(a)
    for k in range(n - 1, 0, -1):
        t[k] = min(t[2 * k], t[2 * k + 1])
    out = []
    for l, r in queries:
        best = None
        l += n; r += n
        while l < r:
            if l & 1:
                best = t[l] if best is None else min(best, t[l]); l += 1
            if r & 1:
                r -= 1; best = t[r] if best is None else min(best, t[r])
            l //= 2; r //= 2
        out.append(best)
    return out
'''

# Run by hand: a lazy-tag bug for RNGQ-P5 (the tag is pushed but never cleared).
NAIVE_P5_STICKY = '''
class RangeTree:
    def __init__(self, n):
        self.n = n
        self.s = [0] * (4 * n)
        self.tg = [0] * (4 * n)
    def _apply(self, k, length, v):
        self.s[k] += v * length
        self.tg[k] += v
    def _push(self, k, lo, mid, hi):
        if self.tg[k]:
            self._apply(2 * k, mid - lo, self.tg[k])
            self._apply(2 * k + 1, hi - mid, self.tg[k])
    def add(self, l, r, v, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n
        if r <= lo or hi <= l or l >= r:
            return
        if l <= lo and hi <= r:
            self._apply(k, hi - lo, v)
            return
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        self.add(l, r, v, 2 * k, lo, mid)
        self.add(l, r, v, 2 * k + 1, mid, hi)
        self.s[k] = self.s[2 * k] + self.s[2 * k + 1]
    def total(self, l, r, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n
        if r <= lo or hi <= l or l >= r:
            return 0
        if l <= lo and hi <= r:
            return self.s[k]
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        return self.total(l, r, 2 * k, lo, mid) + self.total(l, r, 2 * k + 1, mid, hi)
'''
