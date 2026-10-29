"""Cross-check the trusted PATH solutions against brute force on many small random inputs.
Run from scripts/: python cross_path.py"""
import random
import sys

import trusted_path as T

sys.setrecursionlimit(10000)


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


def rand_graph(rng, n, m, lo, hi, directed=True):
    return [(rng.randrange(n), rng.randrange(n), rng.randint(lo, hi)) for _ in range(m)]


def check(label, cases):
    print(f"{label}: {cases} cases ok")


rng = random.Random(7)

# P1
fast = load(T.CHECK, "are_shortest")
ns = {}
exec(T.CHECK_BRUTE, ns)
truth, brute = ns["true_dist"], ns["are_shortest"]
yes = 0
for k in range(4000):
    n = rng.randint(1, 7)
    e = rand_graph(rng, n, rng.randint(0, 12), 0, 4)
    s = rng.randrange(n)
    d = truth(n, e, s)
    if rng.random() < 0.7:
        d = list(d)
        i = rng.randrange(n)
        r = rng.random()
        if r < 0.3:
            d[i] = None if d[i] is not None else rng.randint(0, 6)
        elif d[i] is not None:
            d[i] = max(0, d[i] + rng.choice([-2, -1, 1, 2]))
    # also try fake distances that use zero-weight loops
    assert fast(n, e, s, d) == brute(n, e, s, d), (n, e, s, d)
    yes += brute(n, e, s, d)
for k in range(3000):  # every claim with small values on tiny graphs
    n = rng.randint(1, 4)
    e = rand_graph(rng, n, rng.randint(0, 6), 0, 2)
    s = rng.randrange(n)
    d = [rng.choice([None, 0, 1, 2, 3]) for _ in range(n)]
    assert fast(n, e, s, d) == brute(n, e, s, d), (n, e, s, d)
check(f"P1 are_shortest ({yes} true)", 7000)

# P2
fast = load(T.REVERSE, "fewest_reversals")
brute = load(T.REVERSE_BRUTE, "fewest_reversals")
for k in range(4000):
    n = rng.randint(1, 9)
    e = [(rng.randrange(n), rng.randrange(n)) for _ in range(rng.randint(0, 14))]
    s, t = rng.randrange(n), rng.randrange(n)
    assert fast(n, e, s, t) == brute(n, e, s, t), (n, e, s, t)
check("P2 fewest_reversals", 4000)

# P3
fast = load(T.FASTEST, "fastest")
best = load(T.FASTEST_BRUTE, "best_time")
for k in range(4000):
    n = rng.randint(1, 9)
    e = rand_graph(rng, n, rng.randint(0, 16), 0, 9)
    s, t = rng.randrange(n), rng.randrange(n)
    r = fast(n, e, s, t)
    b = best(n, e, s, t)
    if b is None:
        assert r is None
    else:
        tm, route = r
        assert tm == b and route[0] == s and route[-1] == t
        es = {}
        for u, v, w in e:
            es[(u, v)] = min(es.get((u, v), 10 ** 9), w)
        assert sum(es[(route[i], route[i + 1])] for i in range(len(route) - 1)) == b
check("P3 fastest", 4000)

# P4
fast = load(T.CHEAPEST, "cheapest")
brute = load(T.CHEAPEST_BRUTE, "cheapest")
negs = 0
for k in range(3000):
    n = rng.randint(1, 7)
    e = rand_graph(rng, n, rng.randint(0, 11), -4, 9)
    s = rng.randrange(n)
    a, b = fast(n, e, s), brute(n, e, s)
    assert a == b, (n, e, s, a, b)
    negs += any(x == float("-inf") for x in a)
check(f"P4 cheapest ({negs} with -inf)", 3000)

# P5
fast = load(T.ALLPAIRS, "all_pairs")
brute = load(T.ALLPAIRS_BRUTE, "all_pairs")
nones = 0
for k in range(3000):
    n = rng.randint(1, 7)
    e = rand_graph(rng, n, rng.randint(0, 14), -3, 9)
    a, b = fast(n, e), brute(n, e)
    assert a == b, (n, e, a, b)
    nones += a is None
check(f"P5 all_pairs ({nones} with a negative cycle)", 3000)

# P6
fast = load(T.DAG, "dag_routes")
brute = load(T.DAG_BRUTE, "dag_routes")
for k in range(3000):
    n = rng.randint(1, 8)
    order = list(range(n))
    rng.shuffle(order)
    e = []
    for _ in range(rng.randint(0, 16)):
        i, j = sorted(rng.sample(range(n), 2)) if n > 1 else (0, 0)
        if i != j:
            e.append((order[i], order[j], rng.randint(-3, 3)))
    s = rng.randrange(n)
    assert fast(n, e, s) == brute(n, e, s), (n, e, s)
check("P6 dag_routes", 3000)

# P7
fast = load(T.ASTAR, "moves_needed")
brute = load(T.ASTAR_BRUTE, "moves_needed")
for k in range(2500):
    w = rng.randint(1, 8)
    walls = [(rng.randint(-3, 5), rng.randint(-3, 5)) for _ in range(rng.randint(0, w * 4))]
    free = [(x, y) for x in range(-4, 7) for y in range(-4, 7) if (x, y) not in set(walls)]
    s, g = rng.choice(free), rng.choice(free)
    b = brute(s, g, walls)
    if b == -1:
        continue  # the problem promises a route exists
    assert fast(s, g, walls) == b, (s, g, walls)
check("P7 moves_needed", 2500)
