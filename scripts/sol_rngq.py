from solgen import write_station

write_station("rngq", 6, {
    1: ('''def after_adds(n, adds, queries):
    d = [0] * (n + 1)            # the difference list
    for l, r, v in adds:
        d[l] += v                # from l on, v more
        d[r] -= v                # from r on, v less again
    p = [0] * (n + 1)            # prefix sums of the final list
    run = 0
    for k in range(n):
        run += d[k]              # run is now a[k]
        p[k + 1] = p[k] + run
    return [p[r] - p[l] for l, r in queries]
''', [
        "Each add changes only two cells of the difference list d. The running total of d at position k is the sum of every add that has started and not yet ended there, which is exactly the final a[k].",
        "The same loop builds the prefix sums p of the final list, so every query is p[r] − p[l], the first r values minus the first l.",
        "An add that runs to the end changes d[n], which the loop never reads. An empty range changes d[l] and d[l] back again.",
        "O(1) per add, one O(n) pass, O(1) per query. `itertools.accumulate` can do both running totals in C, which is faster still.",
    ]),
    2: ('''def range_min(a, queries):
    t = [list(a)]                # row 0: blocks of length 1
    k = 1
    while (1 << k) <= len(a):
        prev, h = t[-1], 1 << (k - 1)
        # a block of length 2**k is two blocks of length h
        t.append([min(prev[i], prev[i + h])
                  for i in range(len(a) - (1 << k) + 1)])
        k += 1
    out = []
    for l, r in queries:
        j = (r - l).bit_length() - 1      # largest 2**j <= r - l
        row = t[j]
        out.append(min(row[l], row[r - (1 << j)]))
    return out
''', [
        "Row k of the table holds the minimum of every block of length 2ᵏ; each entry is the smaller of two entries of the row below it, so the build makes at most n comparisons per row and about n log₂ n in all.",
        "For a query, `(r - l).bit_length() - 1` is the position of the highest 1 bit of the length: the largest power of two that fits.",
        "One block starts at l and one ends at r − 1. Together they cover the range; where they overlap, a value is seen twice, which cannot change a minimum. So each query is one comparison.",
        "`1 << k` is 2ᵏ. The table cannot be updated cheaply, which is fine here because the list never changes.",
    ]),
    3: ('''class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)        # t[0] is not used

    def add(self, i, v):
        i += 1                        # the tree counts from 1
        t, n = self.t, self.n
        while i <= n:
            t[i] += v
            i += i & -i               # the next bar that covers i

    def prefix(self, i):              # positions 0 .. i - 1
        t = self.t
        s = 0
        while i > 0:                  # tree positions 1 .. i
            s += t[i]
            i -= i & -i               # drop the lowest 1 bit
        return s

    def total(self, l, r):
        return self.prefix(r) - self.prefix(l)
''', [
        "t[i] holds the total of the `i & -i` positions that end at tree position i. Position i of the list is tree position i + 1.",
        "`add` moves up by adding the lowest 1 bit, which visits exactly the bars that cover the changed position: one per power of two, so O(log n).",
        "`prefix(i)` wants the list's positions 0 to i − 1, which are tree positions 1 to i, so it starts at i unchanged. Each step adds one bar and drops the lowest 1 bit; the bars join with no gap and no overlap.",
        "A range total is the difference of two prefix totals. Every operation is O(log n), and the whole structure is one list.",
    ]),
    4: ('''class MinTree:
    def __init__(self, a):
        n = self.n = len(a)
        t = self.t = [None] * n + list(a)     # leaves at n .. 2n - 1
        for k in range(n - 1, 0, -1):
            t[k] = min(t[2 * k], t[2 * k + 1])

    def set(self, i, v):
        t = self.t
        k = i + self.n
        t[k] = v
        while k > 1:                          # fix the path to the root
            k //= 2
            t[k] = min(t[2 * k], t[2 * k + 1])

    def smallest(self, l, r):
        t = self.t
        best = None
        l += self.n
        r += self.n
        while l < r:
            if l & 1:                         # l is a right child
                if best is None or t[l] < best:
                    best = t[l]
                l += 1
            if r & 1:                         # r - 1 is a left child
                r -= 1
                if best is None or t[r] < best:
                    best = t[r]
            l //= 2
            r //= 2
        return best
''', [
        "The tree lives in one list: the leaves are the values at positions n to 2n − 1, and node k sits above its children 2k and 2k + 1. Node k stores the smaller of its children, so every node holds the minimum of its range. This works for any n.",
        "`set` changes a leaf and recomputes each node on the path to the root from both children. Recomputing, rather than keeping the smaller of old and new, is what makes a value that goes up work too.",
        "`smallest` moves the two ends of the range up one level at a time. When an end is the wrong kind of child, its parent would reach outside the range, so that node is taken on its own and the end steps inwards.",
        "Each operation compares O(log n) values: one or two per level.",
    ]),
    5: ('''class RangeTree:
    def __init__(self, n):
        self.n = n
        self.s = [0] * (4 * n)       # sums
        self.tg = [0] * (4 * n)      # adds not yet passed to children

    def _apply(self, k, length, v):
        self.s[k] += v * length
        self.tg[k] += v

    def _push(self, k, lo, mid, hi):
        if self.tg[k]:
            self._apply(2 * k, mid - lo, self.tg[k])
            self._apply(2 * k + 1, hi - mid, self.tg[k])
            self.tg[k] = 0

    def add(self, l, r, v, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n               # node k covers a[lo:hi]
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
        return (self.total(l, r, 2 * k, lo, mid)
                + self.total(l, r, 2 * k + 1, mid, hi))
''', [
        "Every node stores the sum of its range and a tag: an amount still owed to every position below it. A node's sum is always correct; its children are correct once its tag has been pushed.",
        "An add that covers a node completely changes only that node: its sum grows by v times its length, and v joins its tag. That is why an add touches O(log n) nodes, however wide the range.",
        "Before either operation goes below a node, `_push` hands the tag to both children (each by its own length) and clears it. Clearing is essential: a tag that stayed would be added again later.",
        "The recursion is about log₂ n deep. 4n places are always enough for the numbering when n is not a power of two.",
    ]),
    6: ('''class Blocks:
    def __init__(self, a):
        self.a = list(a)                       # stored values
        n = len(a)
        self.b = b = max(1, int(n ** 0.5))     # block size, about sqrt(n)
        self.tag = [0] * ((n + b - 1) // b)    # an add owed to a whole block
        self.top = [max(self.a[i:i + b]) for i in range(0, n, b)]

    def _fix(self, k):                         # recompute block k's top
        if 0 <= k < len(self.top):
            b = self.b
            self.top[k] = max(self.a[k * b:(k + 1) * b])

    def add(self, l, r, v):
        b, a = self.b, self.a
        if l >= r:
            return
        k0 = l // b
        while l < r and l % b:                 # the start, cell by cell
            a[l] += v
            l += 1
        self._fix(k0)
        while l + b <= r:                      # whole blocks: the tag
            self.tag[l // b] += v
            l += b
        k1 = l // b
        while l < r:                           # the end, cell by cell
            a[l] += v
            l += 1
        self._fix(k1)

    def largest(self, l, r):
        b, a, tag = self.b, self.a, self.tag
        best = None
        while l < r and l % b:
            x = a[l] + tag[l // b]
            if best is None or x > best:
                best = x
            l += 1
        while l + b <= r:
            x = self.top[l // b] + tag[l // b]
            if best is None or x > best:
                best = x
            l += b
        while l < r:
            x = a[l] + tag[l // b]
            if best is None or x > best:
                best = x
            l += 1
        return best
''', [
        "The list is cut into blocks of b ≈ √n values. Each block keeps `top`, the largest of its stored values, and `tag`, an add that applies to all of it. A value's true size is its stored value plus its block's tag.",
        "`add` changes the partial pieces at the ends cell by cell and recomputes those two blocks' tops (a value may have gone down). Whole blocks in the middle only get a larger tag, which raises their true largest by v without touching their cells.",
        "`largest` reads the partial cells and the whole blocks' `top + tag` in the same three parts.",
        "Each operation does at most about 2b cell steps, n / b block steps and two recomputes of b values: O(√n). A lazy segment tree gives O(log n), but blocks are simpler and bend to many other questions.",
    ]),
})
