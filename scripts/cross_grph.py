"""Cross-check the trusted GRPH solutions against brute force on random small graphs. Run from scripts/."""
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import harness  # noqa: E402
import trusted_grph as T  # noqa: E402


def load(src):
    ns = {}
    exec(src, ns)
    return ns


R = random.Random(21)
N = 3000


def rand_edges(n, m, directed=True, loops=False):
    out = []
    for _ in range(m):
        u, v = R.randrange(n), R.randrange(n)
        if u == v and not loops:
            continue
        out.append((u, v))
    return out


a, b = load(T.LINES), load(T.LINES_BRUTE)
for _ in range(N):
    n = R.randint(1, 8)
    e = rand_edges(n, R.randint(0, 12))
    qs = [(R.randrange(n), R.randrange(n)) for _ in range(10)]
    assert a["direct_lines"](n, e, qs) == b["direct_lines"](n, e, qs), (n, e, qs)

a, b = load(T.ROUTE), load(T.ROUTE_BRUTE)
for _ in range(N):
    n = R.randint(1, 9)
    e = rand_edges(n, R.randint(0, 12))
    s, t = R.randrange(n), R.randrange(n)
    p = a["route"](n, list(e), s, t)
    d = b["route_len"](n, e, s, t)
    if d is None:
        assert p is None, (n, e, s, t, p)
    else:
        assert harness.is_route(n, e, p, s, t) and len(p) - 1 == d, (n, e, s, t, p, d)

a, b = load(T.FINISH), load(T.FINISH_BRUTE)
for _ in range(N):
    n = R.randint(1, 9)
    adj = [[] for _ in range(n)]
    for u, v in rand_edges(n, R.randint(0, 16), loops=True):
        adj[u].append(v)
    assert a["finish_order"](adj) == b["finish_order"](adj), adj

a, b = load(T.CYCLE), load(T.CYCLE_BRUTE)
for _ in range(N):
    n = R.randint(1, 7)
    e = rand_edges(n, R.randint(0, 10), loops=R.random() < 0.2)
    c = a["find_cycle"](n, list(e))
    if b["has_cycle"](n, e):
        assert c is not None and harness.is_cycle(n, e, c), (n, e, c)
    else:
        assert c is None, (n, e, c)

a, b = load(T.SMALLEST), load(T.SMALLEST_BRUTE)
for _ in range(N):
    n = R.randint(1, 7)
    # mostly acyclic: edges from a lower to a higher place in a random order, sometimes one edge back
    perm = list(range(n))
    R.shuffle(perm)
    e = []
    for _ in range(R.randint(0, 10)):
        i, j = sorted(R.sample(range(n), 2)) if n > 1 else (0, 0)
        if i != j:
            e.append((perm[i], perm[j]))
    if e and R.random() < 0.25:
        u, v = R.choice(e)
        e.append((v, u))
    assert a["smallest_order"](n, list(e)) == b["smallest_order"](n, e), (n, e)

a, b = load(T.TEAMS), load(T.TEAMS_BRUTE)
for _ in range(N):
    n = R.randint(1, 10)
    e = rand_edges(n, R.randint(0, 12))
    ans = a["two_teams"](n, list(e))
    want = "two teams" if b["bipartite"](n, e) else "odd cycle"
    assert harness.teams_check(n, e, ans) == want, (n, e, ans, want)

a, b = load(T.MOVES), load(T.MOVES_BRUTE)
for _ in range(1500):
    rows, cols = R.randint(1, 5), R.randint(1, 5)
    p = R.random() * 0.6
    g = [[("#" if R.random() < p else ".") for _ in range(cols)] for _ in range(rows)]
    g[0][0] = "."
    g[-1][-1] = "."
    g = ["".join(r) for r in g]
    k = R.randint(0, 3)
    assert a["fewest_moves"](g, k) == b["fewest_moves"](g, k), (g, k)

print("GRPH cross-check: all trusted solutions agree with brute force")
