"""Cross-check the trusted FLOW solutions against brute force on many small random inputs.
Run from scripts/: python cross_flow.py"""
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import harness  # noqa: E402
import trusted_flow as T  # noqa: E402


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


rng = random.Random(11)
check = load(T.CHECK, "flow_value")
ff, ek, dinic = load(T.FF_DFS, "max_flow"), load(T.EK, "max_flow"), load(T.DINIC, "max_flow")
cut_brute, cut = load(T.CUT_BRUTE, "min_cut"), load(T.CUT, "min_cut")

cases = 0
for _ in range(4000):
    n = rng.randint(2, 8)
    s, t = rng.sample(range(n), 2)
    edges = [(rng.randrange(n), rng.randrange(n), rng.randint(0, 9)) for _ in range(rng.randint(0, 16))]
    best = cut_brute(n, edges, s, t)
    a = ff(n, edges, s, t)
    b, fb = ek(n, edges, s, t)
    c, fc = dinic(n, edges, s, t)
    assert a == b == c == best, (n, edges, s, t, a, b, c, best)
    # the flows returned are valid and have the right value, by the trusted checker and the harness helper
    assert check(n, edges, fb, s, t) == best and check(n, edges, fc, s, t) == best, (n, edges, s, t)
    assert harness.flow_check(n, edges, fb, s, t) == best, (n, edges)
    S = cut(n, edges, s, t)
    assert s in S and t not in S
    assert sum(w for u, v, w in edges if u in S and v not in S) == best
    assert harness.cut_check(n, edges, S, s, t) == best
    # a broken flow is rejected by both checkers
    if edges:
        k = rng.randrange(len(edges))
        bad = list(fb)
        bad[k] += rng.choice((1, -1, edges[k][2] + 1))
        u, v, w = edges[k]
        if u != v and not ({u, v} <= {s, t}) or bad[k] < 0 or bad[k] > w:
            assert check(n, edges, bad, s, t) is None, (n, edges, s, t, bad)
            assert not isinstance(harness.flow_check(n, edges, bad, s, t), int), (n, edges, s, t, bad)
    cases += 1
print(f"max flow (DFS, Edmonds-Karp, Dinic), flows, min cut: {cases} cases ok")

match, hk, mbrute = load(T.MATCH, "matching"), load(T.MATCH_HK, "matching"), load(T.MATCH_BRUTE, "best")
for _ in range(4000):
    nl, nr = rng.randint(1, 7), rng.randint(1, 7)
    edges = [(rng.randrange(nl), rng.randrange(nr)) for _ in range(rng.randint(0, 14))]
    m = match(nl, nr, edges)
    h = hk(nl, nr, edges)
    assert harness.match_check(nl, nr, edges, m) == len(m) == mbrute(nl, nr, edges), (nl, nr, edges, m)
    assert harness.match_check(nl, nr, edges, h) == len(h) == len(m), (nl, nr, edges, h)
print("matching (augmenting paths, Hopcroft-Karp): 4000 cases ok")
