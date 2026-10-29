"""Cross-check the trusted MATH solutions against brute force on random small inputs. Run from scripts/."""
import itertools
import random

import trusted_math as T


def load(src):
    ns = {}
    exec(src, ns)
    return ns


R = random.Random(20)
N = 3000

a, b = load(T.PAY), load(T.PAY_BRUTE)
for _ in range(N):
    x, y = R.randint(1, 40), R.randint(1, 40)
    c = R.randint(0, 600)
    assert a["pay_ways"](x, y, c) == b["pay_ways"](x, y, c), (x, y, c)

a, b = load(T.PAIRS), load(T.PAIRS_BRUTE)
for _ in range(N):
    k = R.randint(1, 12)
    arr = [R.randint(-50, 50) for _ in range(R.randint(0, 25))]
    assert a["pairs_to_multiple"](arr, k) == b["pairs_to_multiple"](arr, k), (arr, k)

a, b = load(T.CLIMB), load(T.CLIMB_BRUTE)
for _ in range(N):
    steps = sorted(R.sample(range(1, 8), R.randint(1, 4)))
    n, m = R.randint(0, 120), R.randint(1, 10 ** 9)
    assert a["climb_mod"](n, steps, m) == b["climb_mod"](n, steps, m), (n, steps, m)

a, b = load(T.PRIMES), load(T.PRIMES_BRUTE)
for _ in range(N):
    lo = R.randint(-5, 3000)
    hi = lo + R.randint(-3, 400)
    assert a["primes_between"](lo, hi) == b["primes_between"](lo, hi), (lo, hi)
for lo in range(0, 60):
    for hi in range(0, 60):
        assert a["primes_between"](lo, hi) == b["primes_between"](lo, hi), (lo, hi)

a, b = load(T.CRT), load(T.CRT_BRUTE)
for _ in range(N):
    mods = [R.randint(1, 30) for _ in range(R.randint(0, 4))]
    if R.random() < 0.5:
        x = R.randint(0, 10 ** 6)
        rems = [x % n for n in mods]
    else:
        rems = [R.randint(0, n - 1) for n in mods]
    assert a["crt"](rems, mods) == b["crt"](rems, mods), (rems, mods)

a, b = load(T.COMB), load(T.COMB_BRUTE)
for _ in range(N):
    p = R.choice([1_000_000_007, 998_244_353, 101, 1009])
    top = R.randint(0, min(60, p - 1))
    qs = [(R.randint(0, top), R.randint(-2, top + 2)) for _ in range(R.randint(0, 8))]
    assert a["comb_mod"](qs, p) == b["comb_mod"](qs, p), (qs, p)

a, b = load(T.SAMPLE), load(T.SAMPLE_BRUTE)
for _ in range(N):
    n, k = R.randint(0, 12), R.randint(0, 5)
    seq = [R.randint(0, 10 ** 6) for _ in range(n)]
    picks = [R.randint(0, 10 ** 6) for _ in range(n)]
    def rand_from(ps):
        it = iter(ps)
        return lambda m: next(it) % m
    assert a["sample"](iter(range(n)), k, rand_from(picks)) == b["sample"](iter(range(n)), k, rand_from(picks))
# every outcome equally likely: n = 5, k = 2 gives each pair 6 times out of 60
from collections import Counter
c = Counter()
for seq in itertools.product(range(3), range(4), range(5)):
    it = iter(seq)
    c[frozenset(load(T.SAMPLE)["sample"]("abcde", 2, lambda m: next(it)))] += 1
assert sorted(c.values()) == [6] * 10, c

print("MATH cross-check: all agree")
