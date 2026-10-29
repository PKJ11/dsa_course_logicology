# Naive BITS solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def wrap(x, w):
    # keeps the lowest w bits, but forgets that the top bit is negative
    return x & ((1 << w) - 1)
''', [0, 2, 3]),
    2: ('''
def from_gray(g):
    # one shift per bit: O(B) shifts of a B-bit number
    n = 0
    while g:
        n ^= g
        g >>= 1
    return n
''', [8, 9]),
    3: ('''
def next_same_ones(x):
    # try every number above x
    c = bin(x).count("1")
    y = x + 1
    while bin(y).count("1") != c:
        y += 1
    return y
''', [7, 8]),
    4: ('''
def ones_upto(n):
    # count the bits of every number
    return sum(i.bit_count() for i in range(n + 1))
''', [8, 9, 10]),
    5: ('''
def closest_sum(a, target):
    # every subset, one mask at a time
    n = len(a)
    best = abs(target)
    for mask in range(1, 1 << n):
        s = 0
        for i in range(n):
            if mask >> i & 1:
                s += a[i]
        best = min(best, abs(s - target))
    return best
''', [6, 9, 10, 11]),
}

# Extra wrong versions, run by hand (not by check-problems.py).
EXTRA = {
    "p1_fixed_mask": ('''
def wrap(x, w):
    # a fixed 32-bit mask: wrong for other widths
    u = x & 0xFFFFFFFF
    if u >> (w - 1) & 1:
        u -= 1 << w
    return u
''', "fails the 8-bit tests with bits above the width, and the 200-bit test"),
    "p3_lowest_one_only": ('''
def next_same_ones(x):
    # moves only the lowest 1 up: wrong when the lowest run is longer than 1
    low = x & -x
    return x + low if not (x & (low << 1)) else x + low + 1
''', "fails 7, 12, 156"),
    "p5_greedy": ('''
def closest_sum(a, target):
    # biggest first while it gets closer
    s = 0
    for v in sorted(a, reverse=True):
        if abs(s + v - target) < abs(s - target):
            s += v
    return abs(s - target)
''', "fails the random tests"),
}
