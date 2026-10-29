# Naive MATH solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def pay_ways(a, b, amount):
    # try every number of a-coins
    return sum(1 for x in range(amount // a + 1) if (amount - a * x) % b == 0)
''', [8, 9, 10, 11]),
    2: ('''
def pairs_to_multiple(a, k):
    # check every pair
    n = len(a)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            if (a[i] + a[j]) % k == 0:
                count += 1
    return count
''', [9, 10, 11]),
    3: ('''
def ways_mod(n, steps, m):
    # a loop over every step, keeping the last values
    k = max(steps)
    w = [0] * (k - 1) + [1]       # w(-k+1) .. w(0)
    for _ in range(n):
        w = w[1:] + [sum(w[-s] for s in steps) % m]
    return w[-1] % m
''', [9, 10, 11, 12]),
    4: ('''
def primes_between(lo, hi):
    # trial division for every number
    out = []
    for x in range(max(lo, 2), hi + 1):
        d = 2
        while d * d <= x:
            if x % d == 0:
                break
            d += 1
        else:
            out.append(x)
    return out
''', [8, 9, 10]),
    5: ('''
def crt(rems, mods):
    # step through x = r0, r0 + m0, r0 + 2*m0, ... until every rule holds
    if not mods:
        return 0
    x, step = rems[0], mods[0]
    from math import lcm
    limit = lcm(*mods)
    while x < limit:
        if all(x % n == r for r, n in zip(rems, mods)):
            return x
        x += step
    return None
''', [9, 10, 11]),
    6: ('''
def comb_mod(queries, p):
    # each answer from scratch: k multiplications and one inverse
    out = []
    for n, k in queries:
        if k < 0 or k > n:
            out.append(0)
            continue
        top, bottom = 1, 1
        for i in range(k):
            top = top * (n - i) % p
            bottom = bottom * (i + 1) % p
        out.append(top * pow(bottom, p - 2, p) % p)
    return out
''', [8]),
    7: ('''
def sample(stream, k, rand):
    # off by one: rand(i) instead of rand(i + 1)
    kept = []
    for i, item in enumerate(stream):
        if i < k:
            kept.append(item)
        else:
            j = rand(i)
            if j < k:
                kept[j] = item
    return kept
''', [3, 4, 5]),
}

# Extra wrong versions, run by hand (not by check-problems.py).
EXTRA = {
    "p2_forgets_self_pairs": ('''
def pairs_to_multiple(a, k):
    # counts the class pairs, but pairs remainder 0 and k/2 as c*c
    from collections import Counter
    c = Counter(v % k for v in a)
    return sum(c[r] * c[(k - r) % k] for r in c if r <= (k - r) % k)
''', "fails the remainder-0 and k/2 tests"),
    "p5_coprime_only": ('''
def crt(rems, mods):
    # assumes the moduli have no common factor
    x, L = 0, 1
    for r, n in zip(rems, mods):
        t = (r - x) * pow(L, -1, n) % n
        x += L * t
        L *= n
    return x % L
''', "fails the tests whose moduli share factors"),
    "p7_rand_every_item": ('''
def sample(stream, k, rand):
    # calls rand for the first k items too
    kept = []
    for i, item in enumerate(stream):
        j = rand(i + 1)
        if i < k:
            kept.append(item)
        elif j < k:
            kept[j] = item
    return kept
''', "fails the exact-output and every-outcome tests"),
}
