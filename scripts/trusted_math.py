"""Trusted MATH solutions, shared by build_math.py and the brute-force cross-check (cross_math.py)."""

PAY = """
def pay_ways(a, b, amount):
    # extended Euclid: g = gcd(a, b) = a*x + b*y
    r0, r1, x0, x1 = a, b, 1, 0
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        x0, x1 = x1, x0 - q * x1
    g, x = r0, x0
    if amount % g:
        return 0
    a, b, amount = a // g, b // g, amount // g
    # a*x = amount (mod b): the smallest x >= 0
    first = x * amount % b
    if a * first > amount:
        return 0
    return (amount - a * first) // (a * b) + 1
"""

PAY_BRUTE = """
def pay_ways(a, b, amount):
    return sum(1 for x in range(amount // a + 1) if (amount - a * x) % b == 0)
"""

PAIRS = """
def pairs_to_multiple(a, k):
    count = {}
    for v in a:
        r = v % k
        count[r] = count.get(r, 0) + 1
    total = 0
    for r, c in count.items():
        s = (k - r) % k
        if r < s:
            total += c * count.get(s, 0)
        elif r == s:
            total += c * (c - 1) // 2
    return total
"""

PAIRS_BRUTE = """
def pairs_to_multiple(a, k):
    n = len(a)
    return sum(1 for i in range(n) for j in range(i + 1, n) if (a[i] + a[j]) % k == 0)
"""

CLIMB = """
def ways_mod(n, steps, m):
    k = max(steps)
    # row 0 makes the next count from the last k counts; the other rows shift them along
    M = [[0] * k for _ in range(k)]
    for s in steps:
        M[0][s - 1] = 1
    for i in range(1, k):
        M[i][i - 1] = 1

    def mul(A, B):
        return [[sum(A[i][t] * B[t][j] for t in range(k)) % m for j in range(k)] for i in range(k)]

    R = [[int(i == j) % m for j in range(k)] for i in range(k)]
    while n:
        if n & 1:
            R = mul(R, M)
        M = mul(M, M)
        n >>= 1
    # the counts for n, n-1, ..., n-k+1 are R times the counts for 0, -1, ..., -k+1 = (1, 0, ..., 0)
    return R[0][0] % m
"""

CLIMB_BRUTE = """
def ways_mod(n, steps, m):
    ways = [1] + [0] * n
    for i in range(1, n + 1):
        ways[i] = sum(ways[i - s] for s in steps if s <= i)
    return ways[n] % m
"""

PRIMES = """
from itertools import compress
from math import isqrt

def primes_between(lo, hi):
    lo = max(lo, 2)
    if hi < lo:
        return []
    r = isqrt(hi)
    small = bytearray([1]) * (r + 1)
    small[0:2] = b"\\x00\\x00"
    for p in range(2, isqrt(r) + 1):
        if small[p]:
            small[p * p::p] = bytes(len(range(p * p, r + 1, p)))
    window = bytearray([1]) * (hi - lo + 1)
    for p in compress(range(r + 1), small):
        start = max(p * p, (lo + p - 1) // p * p)
        if start <= hi:
            window[start - lo::p] = bytes(len(range(start, hi + 1, p)))
    return list(compress(range(lo, hi + 1), window))
"""

PRIMES_BRUTE = """
def primes_between(lo, hi):
    def prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True
    return [x for x in range(lo, hi + 1) if prime(x)]
"""

CRT = """
from math import gcd

def crt(rems, mods):
    x, m = 0, 1                   # every answer so far is x, x + m, x + 2m, ...
    for r, n in zip(rems, mods):
        g = gcd(m, n)
        if (r - x) % g:
            return None
        n2 = n // g
        # x + m*t = r (mod n)  ->  (m/g) * t = (r - x)/g (mod n/g)
        t = (r - x) // g * pow(m // g, -1, n2) % n2 if n2 > 1 else 0
        x += m * t
        m *= n2
        x %= m
    return x
"""

CRT_BRUTE = """
from math import lcm

def crt(rems, mods):
    L = lcm(*mods) if mods else 1
    for x in range(L):
        if all(x % n == r for r, n in zip(rems, mods)):
            return x
    return None
"""

COMB = """
def comb_mod(queries, p):
    top = max([n for n, k in queries], default=0)
    fact = [1] * (top + 1)
    for i in range(1, top + 1):
        fact[i] = fact[i - 1] * i % p
    inv = [1] * (top + 1)
    inv[top] = pow(fact[top], p - 2, p)
    for i in range(top, 0, -1):
        inv[i - 1] = inv[i] * i % p
    out = []
    for n, k in queries:
        if k < 0 or k > n:
            out.append(0)
        else:
            out.append(fact[n] * inv[k] % p * inv[n - k] % p)
    return out
"""

COMB_BRUTE = """
from math import comb

def comb_mod(queries, p):
    return [comb(n, k) % p if 0 <= k <= n else 0 for n, k in queries]
"""

SAMPLE = """
def sample(stream, k, rand):
    kept = []
    for i, item in enumerate(stream):
        if i < k:
            kept.append(item)
        else:
            j = rand(i + 1)        # 0 to i, each equally likely
            if j < k:
                kept[j] = item
    return kept
"""

# The brute force: the same rule written differently (a list of slots and an explicit count).
SAMPLE_BRUTE = """
def sample(stream, k, rand):
    slots = [None] * k
    seen = 0
    for item in stream:
        seen += 1
        if seen <= k:
            slots[seen - 1] = item
        else:
            j = rand(seen)
            if j < k:
                slots[j] = item
    return slots[:min(seen, k)]
"""
