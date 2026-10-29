"""Cross-check the trusted SPAN solutions against brute force on many small random inputs.
Run from scripts/: python cross_span.py"""
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import harness  # noqa: E402
import trusted_span as T  # noqa: E402


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


rng = random.Random(5)


def rand_tree(n, lo, hi):
    return [(rng.randrange(i), i, rng.randint(lo, hi)) for i in range(1, n)]


# P1
fast, brute = load(T.SWAP, "cheaper_tree"), load(T.SWAP_BRUTE, "cheaper_tree")
for _ in range(5000):
    n = rng.randint(1, 9)
    perm = list(range(n))
    rng.shuffle(perm)
    tree = [(perm[u], perm[v], w) for u, v, w in rand_tree(n, -5, 9)]
    extra = (rng.randrange(n), rng.randrange(n), rng.randint(-5, 9))
    assert fast(n, tree, extra) == brute(n, tree, extra), (n, tree, extra)
print("P1 cheaper_tree: 5000 cases ok")

# P2: the answer must be a spanning tree (checked by the harness helper) of the least weight
fast, best = load(T.KRUSKAL, "mst"), load(T.MST_BRUTE, "best_tree")
nones = 0
for _ in range(3000):
    n = rng.randint(1, 6)
    edges = [(rng.randrange(n), rng.randrange(n), rng.randint(-3, 6)) for _ in range(rng.randint(0, 9))]
    t, b = fast(n, edges), best(n, edges)
    if b is None:
        assert t is None, (n, edges)
        nones += 1
    else:
        assert harness.tree_cost(n, edges, t) == b, (n, edges, t, b)
print(f"P2 mst: 3000 cases ok ({nones} not connected)")

# P3
fast, brute = load(T.POINTS, "connect_points"), load(T.POINTS_BRUTE, "connect_points")
for _ in range(3000):
    pts = [(rng.randint(-6, 6), rng.randint(-6, 6)) for _ in range(rng.randint(0, 9))]
    assert fast(pts) == brute(pts), pts
print("P3 connect_points: 3000 cases ok")

# P4
fast, brute = load(T.SOME, "in_some_mst"), load(T.SOME_BRUTE, "in_some_mst")
for _ in range(3000):
    n = rng.randint(1, 6)
    edges = [(rng.randrange(n), rng.randrange(n), rng.randint(1, 3)) for _ in range(rng.randint(0, 8))]
    assert fast(n, edges) == brute(n, edges), (n, edges)
print("P4 in_some_mst: 3000 cases ok")
