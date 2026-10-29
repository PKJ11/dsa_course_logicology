import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "rngq"

# Pseudo-random ranges [l, r) with l < r inside a list of length n, built inside the test's args.
def ranges(n, q, m1=7919, m2=104729, lo=0):
    return f"[(lambda x, y: (min(x, y), max(x, y) + 1))((k * {m1} + 13) % {n}, (k * {m2} + 7) % {n}) for k in range({lo}, {lo} + {q})]"

AFTER = """
def after_adds(n, adds, queries):
    d = [0] * (n + 1)
    for l, r, v in adds:
        d[l] += v
        d[r] -= v
    p = [0] * (n + 1)
    run = 0
    for k in range(n):
        run += d[k]
        p[k + 1] = p[k] + run
    return [p[r] - p[l] for l, r in queries]
"""

SUMMARY = "(lambda res: [len(res), sum(res), res[:3], res[-1]])"
build(S, 1, "after_adds", [
    {"name": "The example", "args": "(7, [(1, 4, 2), (3, 7, 5), (0, 2, 1)], [(0, 7), (2, 5), (3, 4), (6, 7)])", "show": "after_adds(7, [(1, 4, 2), (3, 7, 5), (0, 2, 1)], [(0, 7), (2, 5), (3, 4), (6, 7)])",
     "why": "After the adds the list is [1, 3, 2, 7, 5, 5, 5]: [28, 14, 7, 5]. Each add covers a[l:r], up to but not including r."},
    {"name": "No adds", "args": "(5, [], [(0, 5), (1, 3)])", "show": "after_adds(5, [], [(0, 5), (1, 3)])", "why": "[0, 0]: the list starts as zeros."},
    {"name": "Whole list", "args": "(4, [(0, 4, 3), (0, 4, -1)], [(0, 4), (0, 1), (3, 4)])", "show": "after_adds(4, [(0, 4, 3), (0, 4, -1)], [(0, 4), (0, 1), (3, 4)])",
     "why": "[8, 2, 2]. An add that runs to the end changes d[n], the extra cell, which is never part of the list."},
    {"name": "Empty ranges", "args": "(3, [(1, 1, 9), (0, 3, 1)], [(2, 2), (0, 3)])", "show": "after_adds(3, [(1, 1, 9), (0, 3, 1)], [(2, 2), (0, 3)])",
     "why": "[0, 3]. a[1:1] is empty, so adding to it changes nothing, and an empty range sums to 0."},
    {"name": "One cell", "args": "(1, [(0, 1, 5), (0, 1, 5)], [(0, 1)])", "show": "after_adds(1, [(0, 1, 5), (0, 1, 5)], [(0, 1)])", "why": "[10]."},
    {"name": "Negative values", "args": "(6, [(0, 3, -4), (2, 6, 7), (5, 6, -10)], [(0, 6), (2, 3), (4, 6)])", "show": "after_adds(6, [(0, 3, -4), (2, 6, 7), (5, 6, -10)], [(0, 6), (2, 3), (4, 6)])",
     "why": "The list is [-4, -4, 3, 7, 7, -3]: [6, 3, 4]."},
    {"name": "100,000 adds and questions", "args": f"(200_000, [(l, r, (k % 11) - 5) for k, (l, r) in enumerate({ranges(200_000, 100_000)})], {ranges(200_000, 100_000, 31337, 65537)})",
     "expr": f"{SUMMARY}(after_adds(*args))", "timeout": 4000,
     "show": "a list of 200,000, 100,000 adds over mixed ranges, then 100,000 range sums: [answers, their total, the first three, the last]",
     "why": "Each add must be O(1) (the difference list) and each question O(1) (prefix sums). A loop over the range, or sum(a[l:r]), costs up to 200,000 steps each time."},
], trusted=AFTER)

SPARSE = """
def range_min(a, queries):
    t = [list(a)]
    k = 1
    while (1 << k) <= len(a):
        prev, h = t[-1], 1 << (k - 1)
        t.append([min(prev[i], prev[i + h]) for i in range(len(a) - (1 << k) + 1)])
        k += 1
    out = []
    for l, r in queries:
        j = (r - l).bit_length() - 1
        row = t[j]
        out.append(min(row[l], row[r - (1 << j)]))
    return out
"""

RCNT = ("(lambda c: (lambda res: [comparisons() <= len(c) * __import__('math').log2(len(c)) + 2 * len(args[1]),"
        " plain(res) == [min(args[0][l:r]) for l, r in args[1]]])(range_min(c, args[1])))(counted(args[0]))")
build(S, 2, "range_min", [
    {"name": "The example", "args": "([5, 2, 7, 4, 6, 1, 8, 3], [(1, 7), (2, 5), (0, 1), (6, 8), (0, 8)])", "show": "range_min([5, 2, 7, 4, 6, 1, 8, 3], [(1, 7), (2, 5), (0, 1), (6, 8), (0, 8)])",
     "why": "[1, 4, 5, 3, 1]. Each question (l, r) asks for min(a[l:r]): positions l up to but not including r."},
    {"name": "Length one", "args": "([4, 9, 2], [(0, 1), (1, 2), (2, 3)])", "show": "range_min([4, 9, 2], [(0, 1), (1, 2), (2, 3)])", "why": "[4, 9, 2]: a range of length 1 is a single value (row 0 of the table)."},
    {"name": "Lengths that are not powers of two", "args": "([9, 8, 7, 6, 5, 4, 3], [(0, 3), (0, 5), (0, 6), (1, 7), (2, 7)])", "show": "range_min([9, 8, 7, 6, 5, 4, 3], [(0, 3), (0, 5), (0, 6), (1, 7), (2, 7)])",
     "why": "[7, 5, 4, 3, 3]. The second block must end at r − 1: it starts at r − 2ᵏ, not at l + 2ᵏ."},
    {"name": "Repeated and negative", "args": "([0, -3, -3, 2, -3, 5], [(0, 6), (3, 4), (3, 6), (0, 2)])", "show": "range_min([0, -3, -3, 2, -3, 5], [(0, 6), (3, 4), (3, 6), (0, 2)])", "why": "[-3, 2, -3, -3]."},
    {"name": "One value", "args": "([7], [(0, 1), (0, 1)])", "show": "range_min([7], [(0, 1), (0, 1)])", "why": "[7, 7]."},
    {"name": "Comparisons", "args": f"([(k * 7919) % 1009 for k in range(1024)], {ranges(1024, 20_000)})", "expr": RCNT, "timeout": 4000,
     "show": "1,024 values and 20,000 questions, with numbers that count their comparisons: [at most n log₂ n + 2q comparisons?, all answers right?]",
     "why": "A sparse table makes about n log₂ n comparisons to build and one per question. A segment tree uses about 2 log₂ n per question (400,000 here), and min(a[l:r]) uses about r − l."},
    {"name": "100,000 values", "args": f"([(k * 7919) % 100_003 for k in range(100_000)], {ranges(100_000, 100_000)})", "expr": f"{SUMMARY}(range_min(*args))", "timeout": 4000,
     "show": "100,000 values and 100,000 questions: [answers, their total, the first three, the last]",
     "why": "min(a[l:r]) reads the whole range every time: billions of steps here. Build the table once, then answer each question with two reads."},
], trusted=SPARSE)

FEN = """
class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, v):
        i += 1
        t, n = self.t, self.n
        while i <= n:
            t[i] += v
            i += i & -i

    def prefix(self, i):
        t = self.t
        s = 0
        while i > 0:
            s += t[i]
            i -= i & -i
        return s

    def total(self, l, r):
        return self.prefix(r) - self.prefix(l)
"""

FOPS = "(lambda F: [getattr(F, op[0])(*op[1:]) for op in args[1]])(Fenwick(args[0]))"
FBIG = ("(lambda F: (lambda res: [len(res), sum(res), res[:3], res[-1]])([F.add(op[1], op[2]) if op[0] == 'add' else F.total(op[1], op[2]) for op in args[1]][1::2]))(Fenwick(args[0]))")
build(S, 3, "Fenwick", [
    {"name": "The example", "args": "(8, [('add', 0, 5), ('add', 2, 7), ('add', 5, 1), ('prefix', 3), ('total', 2, 6), ('add', 2, 5), ('total', 0, 8), ('prefix', 0)])", "expr": FOPS,
     "show": "Fenwick(8); add(0, 5), add(2, 7), add(5, 1); prefix(3); total(2, 6); add(2, 5); total(0, 8); prefix(0)",
     "why": "[None, None, None, 12, 8, None, 18, 0]. Positions count from 0 here: prefix(i) is the total of positions 0 to i − 1, and total(l, r) of positions l to r − 1. A Fenwick tree counts from 1, so shift by one inside your class."},
    {"name": "Last position", "args": "(5, [('add', 4, 3), ('prefix', 5), ('prefix', 4), ('total', 4, 5)])", "expr": FOPS,
     "show": "Fenwick(5); add(4, 3); prefix(5); prefix(4); total(4, 5)", "why": "[None, 3, 0, 3]. The last position, n − 1, must be inside your list."},
    {"name": "Adds pile up", "args": "(3, [('add', 1, 2), ('add', 1, 2), ('add', 1, -1), ('total', 1, 2), ('total', 0, 3)])", "expr": FOPS,
     "show": "Fenwick(3); add(1, 2) twice, add(1, -1); total(1, 2); total(0, 3)", "why": "[None, None, None, 3, 3]. add adds to the value; it does not replace it."},
    {"name": "Empty range", "args": "(4, [('add', 2, 9), ('total', 2, 2), ('prefix', 0)])", "expr": FOPS, "show": "Fenwick(4); add(2, 9); total(2, 2); prefix(0)", "why": "[None, 0, 0]."},
    {"name": "Every position", "args": "(16, [('add', i, i + 1) for i in range(16)] + [('prefix', i) for i in range(17)])", "expr": FOPS,
     "show": "Fenwick(16); add(i, i + 1) for every i; then prefix(0) … prefix(16)",
     "why": "The prefix totals are 0, 1, 3, 6, 10, …, 136. If only some are wrong, check the loops: add moves up with i += i & -i, prefix descends with i -= i & -i, both on positions counted from 1."},
    {"name": "100,000 operations", "args": "(100_000, [('add', (k * 7919) % 100_000, (k % 13) - 6) if k % 2 == 0 else ('total', *(lambda x, y: (min(x, y), max(x, y)))((k * 104729) % 100_001, (k * 31337) % 100_001)) for k in range(100_000)])",
     "expr": FBIG, "timeout": 4000,
     "show": "Fenwick(100,000); 50,000 adds and 50,000 totals, one after the other: [totals, their sum, the first three, the last]",
     "why": "Each operation should be O(log n). sum over a slice of a plain list costs O(n) per total; rebuilding prefix sums costs O(n) per add."},
], trusted=FEN)

MIN = """
class MinTree:
    def __init__(self, a):
        n = self.n = len(a)
        t = self.t = [None] * n + list(a)
        for k in range(n - 1, 0, -1):
            t[k] = min(t[2 * k], t[2 * k + 1])

    def set(self, i, v):
        t = self.t
        k = i + self.n
        t[k] = v
        while k > 1:
            k //= 2
            t[k] = min(t[2 * k], t[2 * k + 1])

    def smallest(self, l, r):
        t = self.t
        best = None
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                if best is None or t[l] < best:
                    best = t[l]
                l += 1
            if r & 1:
                r -= 1
                if best is None or t[r] < best:
                    best = t[r]
            l //= 2
            r //= 2
        return best
"""

MOPS = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[1]])(MinTree(args[0]))"
# counted: build from counted values, set with Num values; check the count first, then the answers against a plain simulation
MCNT = ("(lambda c: (lambda T: (lambda res: [comparisons() <= 2 * len(c) + len(args[1]) * 4 * __import__('math').log2(len(c)),"
        " plain(res[1::2]) == (lambda a: [a.__setitem__(op[1], op[2]) if op[0] == 'set' else min(a[op[1]:op[2]]) for op in args[1]])(list(args[0]))[1::2]])"
        "([T.set(op[1], Num(op[2])) if op[0] == 'set' else T.smallest(op[1], op[2]) for op in args[1]]))(MinTree(c)))(counted(args[0]))")
MBIG = "(lambda T: (lambda res: [len(res), sum(res), res[:3], res[-1]])([T.set(op[1], op[2]) if op[0] == 'set' else T.smallest(op[1], op[2]) for op in args[1]][1::2]))(MinTree(args[0]))"

def mixed(n, q, mod):
    return (f"[('set', (k * 7919) % {n}, (k * 31337) % {mod}) if k % 2 == 0 else ('smallest', *(lambda x, y: (min(x, y), max(x, y) + 1))((k * 104729) % {n}, (k * 65537) % {n})) for k in range({q})]")

build(S, 4, "MinTree", [
    {"name": "The example", "args": "([5, 2, 7, 4, 6, 1, 8, 3], [('smallest', 0, 8), ('smallest', 2, 5), ('set', 5, 9), ('smallest', 2, 8), ('set', 3, 0), ('smallest', 0, 4)])", "expr": MOPS,
     "show": "MinTree([5, 2, 7, 4, 6, 1, 8, 3]); smallest(0, 8); smallest(2, 5); set(5, 9); smallest(2, 8); set(3, 0); smallest(0, 4)",
     "why": "[1, 4, None, 3, None, 0]. After set(5, 9) the 1 is gone, so the smallest of a[2:8] is 3. set must fix every node above the changed leaf."},
    {"name": "Length one", "args": "([3, 1, 2], [('smallest', 0, 1), ('smallest', 1, 2), ('smallest', 2, 3)])", "expr": MOPS, "show": "MinTree([3, 1, 2]); smallest(0, 1), (1, 2), (2, 3)", "why": "[3, 1, 2]."},
    {"name": "Not a power of two", "args": "([9, 4, 7, 1, 8, 6, 5, 3, 2, 0, 11], [('smallest', 0, 11), ('smallest', 0, 9), ('smallest', 4, 8), ('smallest', 10, 11), ('set', 9, 12), ('smallest', 8, 11)])", "expr": MOPS,
     "show": "MinTree of 11 values; smallest(0, 11), (0, 9), (4, 8), (10, 11); set(9, 12); smallest(8, 11)",
     "why": "[0, 1, 3, 11, None, 2]. The tree must work for any length, not only 8 or 16."},
    {"name": "Larger after set", "args": "([1, 1, 1, 1], [('set', 0, 5), ('set', 1, 5), ('smallest', 0, 2), ('smallest', 0, 4)])", "expr": MOPS,
     "show": "MinTree([1, 1, 1, 1]); set(0, 5); set(1, 5); smallest(0, 2); smallest(0, 4)",
     "why": "[None, None, 5, 1]. A value can also go up: recompute each node from both children, rather than keeping the smaller of old and new."},
    {"name": "One value", "args": "([4], [('smallest', 0, 1), ('set', 0, -2), ('smallest', 0, 1)])", "expr": MOPS, "show": "MinTree([4]); smallest(0, 1); set(0, -2); smallest(0, 1)", "why": "[4, None, -2]."},
    {"name": "Comparisons", "args": f"([(k * 7919) % 1009 for k in range(4096)], {mixed(4096, 4096, 1009)})", "expr": MCNT, "timeout": 4000,
     "show": "4,096 values; 2,048 sets and 2,048 questions, with numbers that count their comparisons: [at most 2n + 4 log₂ n per operation?, all answers right?]",
     "why": "A segment tree compares O(log n) values per set or question. Blocks of √n use about 3√n per question (about 190 here), and min(a[l:r]) about r − l."},
    {"name": "60,000 operations", "args": f"([(k * 7919) % 100_003 for k in range(100_000)], {mixed(100_000, 60_000, 100_003)})", "expr": MBIG, "timeout": 4000,
     "show": "100,000 values; 30,000 sets and 30,000 questions: [answers, their total, the first three, the last]",
     "why": "Each operation should be O(log n). min over a slice reads the whole range each time."},
], trusted=MIN)

LAZY = """
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
            self.tg[k] = 0

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
"""

LOPS = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[1]])(RangeTree(args[0]))"
LBIG = "(lambda T: (lambda res: [len(res), sum(res), res[:3], res[-1]])([T.add(*op[1:]) if op[0] == 'add' else T.total(*op[1:]) for op in args[1]][1::2]))(RangeTree(args[0]))"

def lmixed(n, q):
    return (f"[('add', *(lambda x, y: (min(x, y), max(x, y) + 1))((k * 7919) % {n}, (k * 31337) % {n}), (k % 9) - 3) if k % 2 == 0"
            f" else ('total', *(lambda x, y: (min(x, y), max(x, y) + 1))((k * 104729) % {n}, (k * 65537) % {n})) for k in range({q})]")

def lwide(n, q):
    # both ends near the ends of the list, so a loop over the range is long
    return (f"[('add', (k * 7919) % ({n} // 8), {n} - (k * 31337) % ({n} // 8), (k % 9) - 4) if k % 2 == 0"
            f" else ('total', (k * 104729) % ({n} // 8), {n} - (k * 65537) % ({n} // 8)) for k in range({q})]")

build(S, 5, "RangeTree", [
    {"name": "The example", "args": "(8, [('add', 1, 7, 3), ('total', 0, 8), ('total', 5, 7), ('add', 0, 4, 1), ('total', 3, 5), ('total', 0, 1)])", "expr": LOPS,
     "show": "RangeTree(8); add(1, 7, 3); total(0, 8); total(5, 7); add(0, 4, 1); total(3, 5); total(0, 1)",
     "why": "[None, 18, 6, None, 7, 1]. All values start at 0. add(l, r, v) adds v to positions l to r − 1."},
    {"name": "Overlapping adds", "args": "(6, [('add', 0, 4, 2), ('add', 2, 6, 5), ('total', 0, 6), ('total', 2, 4), ('total', 1, 2), ('total', 4, 6)])", "expr": LOPS,
     "show": "RangeTree(6); add(0, 4, 2); add(2, 6, 5); total(0, 6), (2, 4), (1, 2), (4, 6)",
     "why": "The values are [2, 2, 7, 7, 5, 5]: [None, None, 28, 14, 2, 10]. When a later operation goes below a node with a pending add, pass the add down first."},
    {"name": "Single positions", "args": "(5, [('add', 0, 5, 1), ('add', 2, 3, 10), ('total', 2, 3), ('total', 3, 4), ('total', 0, 5)])", "expr": LOPS,
     "show": "RangeTree(5); add(0, 5, 1); add(2, 3, 10); total(2, 3); total(3, 4); total(0, 5)", "why": "[None, None, 11, 1, 15]."},
    {"name": "Negative and empty", "args": "(4, [('add', 0, 4, 5), ('add', 1, 3, -7), ('add', 2, 2, 100), ('total', 0, 4), ('total', 2, 2), ('total', 1, 2)])", "expr": LOPS,
     "show": "RangeTree(4); add(0, 4, 5); add(1, 3, -7); add(2, 2, 100); total(0, 4); total(2, 2); total(1, 2)",
     "why": "[None, None, None, 6, 0, -2]. An empty range (l equal to r) adds nothing and totals 0."},
    {"name": "Not a power of two", "args": "(7, [('add', 0, 7, 1), ('add', 3, 6, 2), ('total', 0, 7), ('total', 6, 7), ('total', 5, 6)])", "expr": LOPS,
     "show": "RangeTree(7); add(0, 7, 1); add(3, 6, 2); total(0, 7); total(6, 7); total(5, 6)",
     "why": "[None, None, 13, 1, 3]. When a node's halves have different lengths, each child's sum grows by the add times its own length."},
    {"name": "Many small checks", "args": f"(37, {lmixed(37, 400)})", "expr": "(lambda T: [T.add(*op[1:]) if op[0] == 'add' else T.total(*op[1:]) for op in args[1]][1::2])(RangeTree(args[0]))",
     "show": "RangeTree(37); 200 adds and 200 totals over mixed ranges: every total",
     "why": "Compared with a plain list doing the same adds. If only some totals are wrong, a tag may be lost or applied twice: check that a pushed tag is cleared."},
    {"name": "4,000 operations", "args": f"(200_000, {lwide(200_000, 4_000)})", "expr": LBIG, "timeout": 4000,
     "show": "RangeTree(200,000); 2,000 adds and 2,000 totals over wide ranges: [totals, their sum, the first three, the last]",
     "why": "Each operation should be O(log n). A loop over the range costs about 150,000 steps per add."},
], trusted=LAZY)

BLOCKS = """
class Blocks:
    def __init__(self, a):
        self.a = list(a)
        n = len(a)
        self.b = b = max(1, int(n ** 0.5))
        self.tag = [0] * ((n + b - 1) // b)
        self.top = [max(self.a[i:i + b]) for i in range(0, n, b)]

    def _fix(self, k):
        if 0 <= k < len(self.top):
            b = self.b
            self.top[k] = max(self.a[k * b:(k + 1) * b])

    def add(self, l, r, v):
        b, a = self.b, self.a
        if l >= r:
            return
        k0 = l // b
        while l < r and l % b:
            a[l] += v
            l += 1
        self._fix(k0)
        while l + b <= r:
            self.tag[l // b] += v
            l += b
        k1 = l // b
        while l < r:
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
"""

BOPS = "(lambda B: [getattr(B, op[0])(*op[1:]) for op in args[1]])(Blocks(args[0]))"
BBIG = "(lambda B: (lambda res: [len(res), sum(res), res[:3], res[-1]])([B.add(*op[1:]) if op[0] == 'add' else B.largest(*op[1:]) for op in args[1]][1::2]))(Blocks(args[0]))"

def bmixed(n, q):
    # wide ranges: both ends near the ends of the list
    return (f"[('add', (k * 7919) % ({n} // 8), {n} - (k * 31337) % ({n} // 8), (k % 9) - 4) if k % 2 == 0"
            f" else ('largest', (k * 104729) % ({n} // 8), {n} - (k * 65537) % ({n} // 8)) for k in range({q})]")

build(S, 6, "Blocks", [
    {"name": "The example", "args": "([5, 2, 7, 4, 6, 1, 8, 3], [('largest', 0, 8), ('add', 1, 7, 3), ('largest', 0, 2), ('largest', 3, 6), ('add', 6, 7, -20), ('largest', 4, 8)])", "expr": BOPS,
     "show": "Blocks([5, 2, 7, 4, 6, 1, 8, 3]); largest(0, 8); add(1, 7, 3); largest(0, 2); largest(3, 6); add(6, 7, -20); largest(4, 8)",
     "why": "[8, None, 5, 9, None, 9]. After add(1, 7, 3) the list is [5, 5, 10, 7, 9, 4, 11, 3]; then cell 6 drops to -9."},
    {"name": "Inside one block", "args": "([1, 2, 3, 4, 5, 6, 7, 8, 9], [('add', 4, 5, 10), ('largest', 3, 6), ('largest', 4, 5), ('largest', 5, 6)])", "expr": BOPS,
     "show": "Blocks of 1 to 9; add(4, 5, 10); largest(3, 6), (4, 5), (5, 6)",
     "why": "[None, 15, 15, 6]. A range inside a single block has no whole blocks: only cells."},
    {"name": "Whole blocks", "args": "([1, 2, 3, 4, 5, 6, 7, 8, 9], [('add', 0, 9, 1), ('add', 3, 6, -10), ('largest', 0, 9), ('largest', 3, 6), ('largest', 2, 7)])", "expr": BOPS,
     "show": "Blocks of 1 to 9 (blocks of 3); add(0, 9, 1); add(3, 6, -10); largest(0, 9), (3, 6), (2, 7)",
     "why": "[None, None, 10, -3, 8]. A value is its stored number plus its block's tag. Add the tag both when reading a cell and when reading a block's top."},
    {"name": "Values go down", "args": "([4, 4, 4, 4], [('add', 0, 2, -1), ('largest', 0, 2), ('largest', 0, 4), ('add', 2, 4, -9), ('largest', 0, 4)])", "expr": BOPS,
     "show": "Blocks([4, 4, 4, 4]); add(0, 2, -1); largest(0, 2); largest(0, 4); add(2, 4, -9); largest(0, 4)",
     "why": "[None, 3, 4, None, 3]. When cells change one by one, recompute that block's top: the old top may no longer be there."},
    {"name": "Odd length", "args": "([3, 9, 1, 7, 5, 2, 8, 6, 4, 0, 11], [('largest', 8, 11), ('add', 9, 11, 5), ('largest', 9, 11), ('largest', 0, 11)])", "expr": BOPS,
     "show": "Blocks of 11 values; largest(8, 11); add(9, 11, 5); largest(9, 11); largest(0, 11)",
     "why": "[11, None, 16, 16]. The last block can be shorter than the others."},
    {"name": "Many small checks", "args": f"([(k * 37) % 23 - 11 for k in range(50)], [('add', *(lambda x, y: (min(x, y), max(x, y) + 1))((k * 7) % 50, (k * 13) % 50), (k % 7) - 3) if k % 2 == 0 else ('largest', *(lambda x, y: (min(x, y), max(x, y) + 1))((k * 11) % 50, (k * 17) % 50)) for k in range(400)])",
     "expr": "(lambda B: [B.add(*op[1:]) if op[0] == 'add' else B.largest(*op[1:]) for op in args[1]][1::2])(Blocks(args[0]))",
     "show": "Blocks of 50 values; 200 adds and 200 questions over mixed ranges: every answer",
     "why": "Compared with a plain list doing the same adds."},
    {"name": "160,000 values", "args": f"([(k * 7919) % 160_009 for k in range(160_000)], {bmixed(160_000, 2_000)})", "expr": BBIG, "timeout": 4000,
     "show": "160,000 values; 1,000 adds and 1,000 questions over wide ranges: [answers, their total, the first three, the last]",
     "why": "A loop over the whole range costs about 140,000 steps per add. With blocks of 400, an add touches at most two partial blocks and about 400 tags."},
], trusted=BLOCKS)
