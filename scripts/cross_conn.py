"""Cross-check the trusted CONN solutions against brute force on many small random inputs.
Run from scripts/: python cross_conn.py"""
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import harness  # noqa: E402
import trusted_conn as T  # noqa: E402


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


rng = random.Random(7)


def rand_graph(nmax, mmax):
    n = rng.randint(1, nmax)
    m = rng.randint(0, mmax)
    return n, [(rng.randrange(n), rng.randrange(n)) for _ in range(m)]


# P1
fast, brute = load(T.GROUP, "group_of"), load(T.GROUP_BRUTE, "group_of")
for _ in range(4000):
    n, e = rand_graph(9, 16)
    s = rng.randrange(n)
    assert fast(n, e, s) == brute(n, e, s), (n, e, s)
print("P1 group_of: 4000 cases ok")

# P2: same groups as all-pairs reachability, numbered in a topological order, and the checker agrees
fast, brute = load(T.SCC, "scc"), load(T.SCC_BRUTE, "scc")
for _ in range(4000):
    n, e = rand_graph(9, 16)
    lab, groups = fast(n, e), brute(n, e)
    for u in range(n):
        assert frozenset(v for v in range(n) if lab[v] == lab[u]) == groups[u], (n, e, lab)
    assert harness.scc_check(n, e, lab) == "ok", (n, e, lab)
    # the checker must reject wrong labellings: reversed numbers, merged groups, split groups
    k = max(lab) + 1
    rev = [k - 1 - x for x in lab]
    if any(lab[u] != lab[v] for u, v in e):
        assert harness.scc_check(n, e, rev) != "ok", (n, e, rev)
    big = [g for g in set(groups) if len(g) >= 2]
    if big:
        x0 = min(big[0])                   # move one vertex of a real group into a group of its own
        split = [x if x <= lab[x0] else x + 1 for x in lab]
        split[x0] = lab[x0] + 1
        assert harness.scc_check(n, e, split) != "ok", (n, e, split)
print("P2 scc: 4000 cases ok (labels and checker)")

# the checker against brute force: a random labelling is 'ok' exactly when it is a right answer
ok_count = 0
for _ in range(20000):
    n, e = rand_graph(5, 7)
    lab = [rng.randrange(n) for _ in range(n)]
    groups = brute(n, e)
    k = max(lab) + 1
    right = set(lab) == set(range(k)) and all(lab[u] <= lab[v] for u, v in e) and all(
        (lab[u] == lab[v]) == (groups[u] == groups[v]) for u in range(n) for v in range(n))
    ok_count += right
    assert (harness.scc_check(n, e, lab) == "ok") == right, (n, e, lab)
print(f"scc_check: 20000 random labellings ok ({ok_count} right ones)")

# P3
fast, brute = load(T.WEAK, "weak_points"), load(T.WEAK_BRUTE, "weak_points")
for _ in range(4000):
    n, e = rand_graph(9, 12)
    got = fast(n, e)
    assert (list(got[0]), list(got[1])) == brute(n, e), (n, e, got, brute(n, e))
print("P3 weak_points: 4000 cases ok")

# P4
fast, brute = load(T.SAT, "two_sat"), load(T.SAT_BRUTE, "two_sat")
sats = 0
for _ in range(4000):
    n = rng.randint(1, 7)
    lit = lambda: rng.randint(1, n) * rng.choice((1, -1))
    cl = [(lit(), lit()) for _ in range(rng.randint(0, 3 * n))]
    a, b = fast(n, cl), brute(n, cl)
    assert (a is None) == (b is None), (n, cl, a, b)
    if a is not None:
        sats += 1
        assert harness.sat_check(n, cl, a) == "satisfied", (n, cl, a)
print(f"P4 two_sat: 4000 cases ok ({sats} satisfiable)")
