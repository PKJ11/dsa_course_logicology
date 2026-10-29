"""Cross-check the trusted BITS solutions against brute force on random small inputs. Run from scripts/."""
import random
import sys

import trusted_bits as T


def load(src):
    ns = {}
    exec(src, ns)
    return ns


R = random.Random(19)
N = 3000

a, b = load(T.WRAP), load(T.WRAP_BRUTE)
for _ in range(N):
    w = R.randint(1, 70)
    x = R.randint(-(1 << 80), 1 << 80) if R.random() < 0.5 else R.randint(-300, 300)
    assert a["wrap"](x, w) == b["wrap"](x, w), (x, w)

a, b = load(T.GRAY), load(T.GRAY_BRUTE)
for n in range(0, 5000):
    g = n ^ (n >> 1)
    assert a["from_gray"](g) == n == b["from_gray"](g), n
for _ in range(N):
    n = R.getrandbits(R.randint(1, 400))
    assert a["from_gray"](n ^ (n >> 1)) == n

a, b = load(T.NEXT), load(T.NEXT_BRUTE)
for x in range(1, 5000):
    assert a["next_same_ones"](x) == b["next_same_ones"](x), x
for _ in range(N):
    x = R.getrandbits(R.randint(1, 18)) or 1
    assert a["next_same_ones"](x) == b["next_same_ones"](x), x

a, b = load(T.ONES), load(T.ONES_BRUTE)
for n in range(0, 3000):
    assert a["ones_upto"](n) == b["ones_upto"](n), n
for _ in range(300):
    n = R.randint(0, 200_000)
    assert a["ones_upto"](n) == b["ones_upto"](n), n

a, b = load(T.CLOSEST), load(T.CLOSEST_BRUTE)
for _ in range(N):
    n = R.randint(0, 12)
    big = R.choice([5, 50, 10 ** 6])
    arr = [R.randint(-big, big) for _ in range(n)]
    t = R.randint(-3 * big, 3 * big)
    assert a["closest_sum"](arr, t) == b["closest_sum"](arr, t), (arr, t)

print("BITS cross-check: all agree")
