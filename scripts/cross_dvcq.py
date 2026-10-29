"""Cross-check the trusted DVCQ solutions against brute force on random small inputs. Run from scripts/."""
import itertools
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from harness import comparisons, counted, plain  # noqa: E402
from trusted_dvcq import MAXMIN, MULT, PAIR, SELECT, SKY, SKY_BRUTE, SMALLER  # noqa: E402

ns, brute = {}, {}
for src in (MAXMIN, SKY, SMALLER, PAIR, MULT, SELECT):
    exec(src, ns)
exec(SKY_BRUTE, brute)


def d2(p, q):
    return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2


R = random.Random(5)
for _ in range(3000):
    n = R.randint(1, 40)
    v = [R.randint(-20, 20) for _ in range(n)]
    r = ns["max_min"](counted(v))
    c = comparisons()
    assert plain(list(r)) == [max(v), min(v)] and c <= 3 * n // 2, (v, r, c)

    bl = [(l, l + R.randint(1, 8), R.randint(1, 6)) for l in (R.randint(0, 20) for _ in range(R.randint(0, 9)))]
    assert ns["skyline"](bl) == brute["skyline"](bl), bl

    w = [R.randint(-5, 5) for _ in range(R.randint(0, 30))]
    assert ns["smaller_after"](w) == [sum(1 for y in w[i + 1:] if y < w[i]) for i in range(len(w))], w

    pts = [(R.randint(-6, 6), R.randint(-6, 6)) for _ in range(R.randint(2, 30))]
    i, j = ns["closest_pair"](pts)
    assert i != j and d2(pts[i], pts[j]) == min(d2(p, q) for p, q in itertools.combinations(pts, 2)), pts

    x = [R.randint(1, 9)] + [R.randint(0, 9) for _ in range(R.randint(0, 80))]
    y = [R.randint(1, 9)] + [R.randint(0, 9) for _ in range(R.randint(0, 80))]
    if R.random() < 0.05:
        x = [0]
    want = list(map(int, str(int("".join(map(str, x))) * int("".join(map(str, y))))))
    assert ns["multiply"](x, y) == want, (x, y)

    s = [R.randint(0, 15) for _ in range(R.randint(1, 60))]
    k = R.randrange(len(s))
    assert ns["select"](s, k) == sorted(s)[k], (s, k)
print("all DVCQ cross-checks pass (3,000 random cases per problem)")
