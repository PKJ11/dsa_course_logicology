"""Trusted BITS solutions, shared by build_bits.py and the brute-force cross-check (cross_bits.py)."""

WRAP = """
def wrap(x, w):
    x &= (1 << w) - 1              # keep the lowest w bits
    if x >> (w - 1):               # the top bit is worth -2**(w-1)
        x -= 1 << w
    return x
"""

WRAP_BRUTE = """
def wrap(x, w):
    r = x % (2 ** w)
    bits = []
    for _ in range(w):
        bits.append(r % 2)
        r //= 2
    total = 0
    for k, b in enumerate(bits):
        worth = 2 ** k if k < w - 1 else -(2 ** k)
        total += b * worth
    return total
"""

GRAY = """
def from_gray(g):
    n = g
    s = 1
    while s < g.bit_length():
        n ^= n >> s
        s *= 2
    return n
"""

GRAY_BRUTE = """
def from_gray(g):
    n = 0
    while n ^ (n >> 1) != g:
        n += 1
    return n
"""

NEXT = """
def next_same_ones(x):
    low = x & -x                   # the lowest 1 bit
    up = x + low                   # carry through the lowest run of 1s
    ones = (x ^ up) >> (low.bit_length() + 1)
    return up | ones
"""

NEXT_BRUTE = """
def next_same_ones(x):
    c = bin(x).count("1")
    y = x + 1
    while bin(y).count("1") != c:
        y += 1
    return y
"""

ONES = """
def ones_upto(n):
    total = 0
    k = 0
    while (1 << k) <= n:
        cycle = 1 << (k + 1)       # bit k: 2**k zeros, then 2**k ones, again and again
        total += (n + 1) // cycle * (1 << k)
        total += max(0, (n + 1) % cycle - (1 << k))
        k += 1
    return total
"""

ONES_BRUTE = """
def ones_upto(n):
    return sum(bin(i).count("1") for i in range(n + 1))
"""

CLOSEST = """
from bisect import bisect_left

def closest_sum(a, target):
    def all_sums(part):
        sums = [0]
        for v in part:
            sums += [s + v for s in sums]
        return sums
    half = len(a) // 2
    left = all_sums(a[:half])
    right = sorted(all_sums(a[half:]))
    best = abs(target)
    for s in left:
        i = bisect_left(right, target - s)
        if i < len(right):
            best = min(best, right[i] + s - target)
        if i > 0:
            best = min(best, target - s - right[i - 1])
    return best
"""

CLOSEST_BRUTE = """
def closest_sum(a, target):
    n = len(a)
    best = None
    for mask in range(1 << n):
        s = sum(a[i] for i in range(n) if mask >> i & 1)
        d = abs(s - target)
        if best is None or d < best:
            best = d
    return best
"""
