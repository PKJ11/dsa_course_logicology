"""Cross-check the trusted HARD solutions and the new harness helpers against brute force."""
import random
import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import harness as H
import trusted_hard as T


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


f1 = load(T.P1, "find_assignment")
f2 = load(T.P2, "colouring_formula")
f3 = load(T.P3, "best_value")
f4 = load(T.P4, "schedule")
f5 = load(T.P5, "is_prime")
rng = random.Random(29)
only = set(sys.argv[1:])


def want(k):
    return __name__ == "__main__" and (not only or str(k) in only)


if want(1):
    c = 0
    for _ in range(3000):
        n = rng.randint(1, 9)
        cl = [[rng.choice([1, -1]) * rng.randint(1, n) for _ in range(rng.randint(1, 3))] for _ in range(rng.randint(0, 14))]
        bf = T.brute_sat(n, cl)
        s = H._cnf_solve(cl)
        assert (s is None) == (bf is None), (n, cl)
        if s is not None:
            vals = [s.get(k, False) for k in range(1, n + 1)]
            assert H.cnf_check(n, cl, vals) == "satisfied"
        got = H.oracle_check(f1, n, cl)
        assert got == (["satisfied", True] if bf is not None else ["no assignment", True]), (n, cl, got)
        c += 1
    print("P1 and the solver ok", c)

if want(2):
    c = 0
    for _ in range(1500):
        n = rng.randint(1, 7)
        edges = list({tuple(sorted(rng.sample(range(n), 2))) for _ in range(rng.randint(0, 12))} if n > 1 else set())
        col = T.brute_colourable(n, edges)
        rep = H.colour_cnf_report(n, edges, f2(n, edges))
        assert rep == (["colouring"] if col else ["no colouring"]), (n, edges, rep)
        if col:
            rep = H.colour_cnf_report(n, edges, f2(n, edges), col)
            assert rep == ["planted colouring passes", "clashes caught", "missing colours caught", True], rep
            # a formula without the edge clauses must be caught
            weak = [[3 * v + 1, 3 * v + 2, 3 * v + 3] for v in range(n)]
            if edges:
                assert H.colour_cnf_report(n, edges, weak, col)[1] != "clashes caught"
        c += 1
    print("P2 ok", c)

if want(3):
    c = 0
    for _ in range(3000):
        n = rng.randint(0, 12)
        items = [(rng.randint(1, 30), rng.randint(0, 40)) for _ in range(n)]
        cap = rng.randint(0, 100)
        assert f3(items, cap) == T.brute_knap(items, cap), (items, cap)
        c += 1
    print("P3 ok", c)

if want(4):
    c = 0
    for _ in range(1500):
        m = rng.randint(1, 4)
        jobs = [rng.randint(1, 20) for _ in range(rng.randint(0, 7))]
        a = f4(list(jobs), m)
        span = H.makespan(jobs, m, a)
        opt = T.brute_makespan(jobs, m)
        assert 3 * m * span <= (4 * m - 1) * opt, (jobs, m, span, opt)   # Graham: (4/3 - 1/(3m)) OPT
        c += 1
    print("P4 ok", c)

if want(5):
    c = 0
    sieve = bytearray([1]) * 1_000_001
    sieve[0] = sieve[1] = 0
    for i in range(2, 1001):
        if sieve[i]:
            sieve[i * i::i] = bytearray(len(sieve[i * i::i]))
    for x in range(1_000_001):
        assert f5(x) == bool(sieve[x]), x
        c += 1
    for _ in range(3000):
        x = rng.randint(10 ** 6, 10 ** 12)
        assert f5(x) == T.brute_prime(x), x
        c += 1
    for x in [2047, 1373653, 25326001, 3215031751, 2152302898747, 3474749660383, 341550071728321, 3825123056546413051,
              318665857834031151167461, 561, 1105, 1729, 41041, 825265]:
        assert not f5(x), x
        c += 1
    for x in [2 ** 61 - 1, 10 ** 18 + 9, 2 ** 89 - 1, 10 ** 24 + 7]:
        assert f5(x), x
        c += 1
    print("P5 ok", c)
