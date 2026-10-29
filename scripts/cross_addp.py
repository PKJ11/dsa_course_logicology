"""Cross-check the trusted ADDP solutions against brute force on many small random cases."""
import random
import sys
import trusted_addp as T


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


f1 = load(T.P1, "total_distance")
f2 = load(T.P2, "most_collected")
f3 = load(T.P3, "cheapest_cuts")
f4 = load(T.P4, "fewest_wagons")
f5 = load(T.P5, "count_no_repeat")
f5m = load(T.P5_MEMO, "count_no_repeat")
f6 = load(T.P6, "cheapest_trip")
rng = random.Random(28)
only = set(sys.argv[1:])


def want(k):
    return not only or str(k) in only


def rand_tree(n, wmax):
    roads = []
    for v in range(1, n):
        roads.append((rng.randrange(v), v, rng.randint(0, wmax)))
    perm = list(range(n))
    rng.shuffle(perm)
    roads = [(perm[a], perm[b], w) if rng.random() < 0.5 else (perm[b], perm[a], w) for a, b, w in roads]
    rng.shuffle(roads)
    return roads


if __name__ == "__main__" and want(1):
    c = 0
    for _ in range(3000):
        n = rng.randint(1, 12)
        roads = rand_tree(n, rng.choice([1, 5, 1000]))
        assert f1(n, roads) == T.brute1(n, roads), (n, roads)
        c += 1
    print("P1 ok", c)

if __name__ == "__main__" and want(2):
    c = 0
    for _ in range(3000):
        n = rng.randint(1, 8)
        m = rng.randint(0, n * 3)
        streets = [(rng.randrange(n), rng.randrange(n)) for _ in range(m)]
        value = [rng.randint(0, 9) for _ in range(n)]
        s = rng.randrange(n)
        assert f2(n, streets, value, s) == T.brute2(n, streets, value, s), (n, streets, value, s)
        c += 1
    print("P2 ok", c)

if __name__ == "__main__" and want(3):
    c = 0
    for _ in range(2000):
        L = rng.randint(2, 40)
        k = rng.randint(0, min(L - 1, 7))
        marks = rng.sample(range(1, L), k)
        assert f3(L, marks) == T.brute3(L, marks), (L, marks)
        c += 1
    print("P3 ok", c)

if __name__ == "__main__" and want(4):
    c = 0
    for _ in range(3000):
        n = rng.randint(0, 9)
        cap = rng.randint(1, 20)
        w = [rng.randint(1, cap) for _ in range(n)]
        assert f4(w, cap) == T.brute4(w, cap), (w, cap)
        c += 1
    print("P4 ok", c)

if __name__ == "__main__" and want(5):
    c = 0
    for x in range(0, 3000):
        assert f5(0, x) == T.brute5(0, x) == f5m(0, x), x
        c += 1
    for _ in range(3000):
        a = rng.randint(0, 200000)
        b = a + rng.randint(0, 3000)
        assert f5(a, b) == T.brute5(a, b) == f5m(a, b), (a, b)
        c += 1
    for _ in range(2000):
        a = rng.randint(0, 10 ** 18)
        b = rng.randint(a, 10 ** 18)
        assert f5(a, b) == f5m(a, b), (a, b)
        c += 1
    print("P5 ok", c)

if __name__ == "__main__" and want(6):
    c = 0
    for _ in range(3000):
        n = rng.randint(1, 30)
        xs = sorted(rng.sample(range(0, rng.choice([40, 1000, 10 ** 6])), n))
        cc = rng.choice([0, 1, 7, 100, 10 ** 6])
        assert f6(xs, cc) == T.brute6(xs, cc), (xs, cc)
        c += 1
    print("P6 ok", c)
