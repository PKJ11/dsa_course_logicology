from solgen import write_station

write_station("math", 7, {
    1: ('''def pay_ways(a, b, amount):
    # extended Euclid: r0 = gcd(a, b) = a*x0 + b*(something)
    r0, r1, x0, x1 = a, b, 1, 0
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        x0, x1 = x1, x0 - q * x1
    g = r0
    if amount % g:
        return 0                       # every a*x + b*y is a multiple of g
    a, b, amount = a // g, b // g, amount // g
    first = x0 * amount % b            # smallest x >= 0 that works
    if a * first > amount:
        return 0                       # even that x leaves y below 0
    return (amount - a * first) // (a * b) + 1
''', [
        "Every a·x + b·y is a multiple of g = gcd(a, b), so if g does not divide the amount there is no way at all. Otherwise divide everything by g; the ways do not change.",
        "Now gcd(a, b) = 1, and the extended algorithm gave a · x0 + b · y0 = 1. So a · x0 leaves remainder 1 when divided by b, and a · (x0 · amount) leaves the same remainder as the amount. That means x = x0 · amount works modulo b, and `x0 * amount % b` is the smallest such x that is 0 or more (Python's % is never negative here).",
        "The other good x are first + b, first + 2b, … (lesson 1). Each needs y = (amount − a·x) / b ≥ 0, that is, a·x ≤ amount. Going from one to the next uses a·b more of the amount, so the count is `(amount - a*first) // (a*b) + 1`.",
        "Only the x part of the extended algorithm is needed, so y is not tracked. The loop makes O(log min(a, b)) steps: about 80 for two Fibonacci numbers near 10¹⁷.",
    ]),
    2: ('''def pairs_to_multiple(a, k):
    count = {}
    for v in a:
        r = v % k                      # 0 to k - 1, even for negative v
        count[r] = count.get(r, 0) + 1
    total = 0
    for r, c in count.items():
        s = (k - r) % k                # the remainder that completes r
        if r < s:
            total += c * count.get(s, 0)
        elif r == s:                   # r is 0, or k/2 when k is even
            total += c * (c - 1) // 2
    return total
''', [
        "a[i] + a[j] is a multiple of k exactly when their remainders add up to 0 or k (lesson 2). So only the count of numbers with each remainder matters: one pass to count, then one pass over at most k remainders.",
        "Remainder r pairs with s = (k − r) % k. For r < s, every number of class r pairs with every number of class s: c_r · c_s pairs. The test `r < s` counts each pair of classes once; when r > s the pair was already counted from s.",
        "When r == s (remainder 0, or k/2 for even k), the numbers pair among themselves: c · (c − 1) / 2 pairs, which never pairs a number with itself.",
        "`collections.Counter(v % k for v in a)` builds the same dict in one line. O(n) time and O(min(n, k)) memory, against O(n²) for checking every pair.",
    ]),
    3: ('''def ways_mod(n, steps, m):
    k = max(steps)
    # The column (w(n), w(n-1), ..., w(n-k+1)) times M gives the next one.
    M = [[0] * k for _ in range(k)]
    for s in steps:
        M[0][s - 1] = 1                # w(n+1) adds w(n+1-s) for each move s
    for i in range(1, k):
        M[i][i - 1] = 1                # shift the other values down

    def mul(A, B):
        return [[sum(A[i][t] * B[t][j] for t in range(k)) % m
                 for j in range(k)] for i in range(k)]

    R = [[int(i == j) for j in range(k)] for i in range(k)]
    while n:
        if n & 1:
            R = mul(R, M)
        M = mul(M, M)
        n >>= 1
    # start column for n = 0 is (1, 0, ..., 0), so w(n) is the top-left entry
    return R[0][0] % m
''', [
        "w(n) = the sum of w(n − s) over the allowed moves s: the last move of a way up is one of them, and before it the way up reached n − s. With w(0) = 1 and w of a negative number 0, this is a linear rule over the last k = max(steps) values.",
        "The k × k matrix's top row makes the next value from the last k; the other rows copy the values one place down. So Mⁿ times the starting column (1, 0, …, 0) gives (w(n), …), and w(n) is entry [0][0] of Mⁿ.",
        "Raising M to the power n by squaring takes about log₂ n squarings and as many products: 60 each for n = 10¹⁸, each costing k³ ≤ 1,000 multiplications. Taking % m after every product keeps the entries below m.",
        "`% m` at the end handles n = 0 with m = 1, where the identity matrix is returned unreduced. A plain loop over n would need 10¹⁸ steps.",
    ]),
    4: ('''from itertools import compress
from math import isqrt

def primes_between(lo, hi):
    lo = max(lo, 2)
    if hi < lo:
        return []
    r = isqrt(hi)
    small = bytearray([1]) * (r + 1)   # plain sieve up to sqrt(hi)
    small[0] = small[1] = 0
    for p in range(2, isqrt(r) + 1):
        if small[p]:
            small[p * p::p] = bytes(len(range(p * p, r + 1, p)))
    mark = bytearray([1]) * (hi - lo + 1)   # mark[i] is for lo + i
    for p in compress(range(r + 1), small):
        start = max(p * p, (lo + p - 1) // p * p)
        if start <= hi:
            mark[start - lo::p] = bytes(len(range(start, hi + 1, p)))
    return list(compress(range(lo, hi + 1), mark))
''', [
        "A composite number up to hi has a prime factor at most √hi (lesson 4), so the primes up to `isqrt(hi)`, at most 10⁶, are enough to cross out every composite in the window. They come from a plain sieve.",
        "For each small prime p, the first multiple to cross out is lo rounded up to a multiple of p, `(lo + p - 1) // p * p`, but never below p·p: smaller multiples have a smaller factor, and starting below p·p could cross out p itself.",
        "Each crossing-out is one slice assignment in C. For most of the 78,498 small primes the window holds no multiple or one, so the work is about one division per small prime plus the window's own sieve.",
        "`itertools.compress(range(...), mark)` keeps the numbers whose mark is 1, also in C. Memory is about √hi + (hi − lo) bytes instead of hi bytes.",
    ]),
    5: ('''from math import gcd

def crt(rems, mods):
    x, L = 0, 1             # every x + t*L meets the conditions so far
    for r, n in zip(rems, mods):
        g = gcd(L, n)
        if (r - x) % g:
            return None     # the conditions disagree modulo g
        n2 = n // g
        # x + L*t = r (mod n)  ->  (L/g) * t = (r - x)/g (mod n/g)
        t = (r - x) // g * pow(L // g, -1, n2) % n2 if n2 > 1 else 0
        x += L * t
        L *= n2             # L is now lcm of the moduli so far
        x %= L
    return x
''', [
        "After some conditions, the numbers meeting all of them are x, x + L, x + 2L, …, where L is their lcm. With no conditions, x = 0 and L = 1. Each new condition (r, n) picks out some of those numbers.",
        "We need t with L·t ≡ r − x (mod n). If g = gcd(L, n) does not divide r − x, no t exists, because L·t − (r − x) would have to be a multiple of n, hence of g. Otherwise divide by g: L/g and n/g have no common factor, so L/g has an inverse modulo n/g (lesson 5).",
        "Then x + L·t meets the new condition, and the answers repeat every L·(n/g) = lcm(L, n). `x %= L` keeps the smallest one. When n/g is 1, the new condition adds nothing, and t = 0.",
        "If the moduli were assumed to have no common factor, `pow(L, -1, n)` would raise ValueError on the tests whose moduli share factors. The numbers grow to thousands of digits, but there are only 2,000 rounds of a few big-number operations.",
    ]),
    6: ('''def comb_mod(queries, p):
    top = max((n for n, k in queries), default=0)
    fact = [1] * (top + 1)
    for i in range(1, top + 1):
        fact[i] = fact[i - 1] * i % p
    inv = [1] * (top + 1)              # inv[i] = 1 / i! modulo p
    inv[top] = pow(fact[top], p - 2, p)
    for i in range(top, 0, -1):
        inv[i - 1] = inv[i] * i % p    # 1/(i-1)! = i / i!
    out = []
    for n, k in queries:
        if k < 0 or k > n:
            out.append(0)
        else:
            out.append(fact[n] * inv[k] % p * inv[n - k] % p)
    return out
''', [
        "C(n, k) = n! / (k! · (n − k)!). Modulo a prime p bigger than n, none of these factorials is a multiple of p, so each has an inverse, and dividing means multiplying by it (lesson 5).",
        "The factorials up to the largest n take one loop. For the inverses, one `pow(fact[top], p - 2, p)` gives 1/top! by Fermat's rule, and each smaller one follows from 1/(i − 1)! = i · (1/i!). So all the inverses cost one fast power plus one multiplication each.",
        "After that, each query is two multiplications: O(N + q) in all, about 0.3 seconds for N = 10⁶ and 100,000 queries. Computing each C(n, k) from scratch could take up to 600,000 steps per query.",
        "The prime is an argument, so nothing is fixed to 1,000,000,007. If p could be at most n, Lucas's theorem (lesson 6) would be needed instead.",
    ]),
    7: ('''def sample(stream, k, rand):
    kept = []
    for i, item in enumerate(stream):
        if i < k:
            kept.append(item)          # the first k items fill the slots
        else:
            j = rand(i + 1)            # 0 to i, each equally likely
            if j < k:
                kept[j] = item         # replace slot j
    return kept
''', [
        "The stream is read once, with O(1) work per item and only k items stored, so it works for streams that do not fit in memory and for generators with no length.",
        "Item i (counting from 0) is kept with chance k / (i + 1): j is one of i + 1 equally likely values, and k of them are below k. Lesson 7 proves by induction that, after the whole stream of n items, every item is in the sample with chance k / n.",
        "The tests check the exact sample for fixed answers from `rand`, which works only if rand is called exactly once per item after the first k, always with i + 1. Two tests try every possible run of answers and count the samples: each set of k items comes out equally often.",
        "Python's `random.sample(population, k)` does the same job for a list whose length is known. For a stream, this method is the standard one (Vitter's Algorithm R).",
    ]),
})
