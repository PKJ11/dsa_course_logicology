"""Cross-check the trusted STRG solutions against brute force on many small random strings."""
import random
import trusted_strg as T


def load(src, name):
    ns = {}
    exec(src, ns)
    return ns[name]


f1 = load(T.P1, "find_all")
f2 = load(T.P2, "find_every")
f3 = load(T.P3, "fits")
f4 = load(T.P4, "longest_repeat")
f4b = load(T.P4_SA, "longest_repeat")
f5 = load(T.P5, "suffix_lcp")
f6 = load(T.P6, "palindromes")

rng = random.Random(7)
cases = 0
for trial in range(6000):
    k = rng.choice([1, 2, 2, 3, 4])
    alpha = "abcd"[:k]
    n = rng.randint(0, 14)
    t = "".join(rng.choice(alpha) for _ in range(n))
    m = rng.randint(1, 6)
    p = "".join(rng.choice(alpha) for _ in range(m))
    pq = "".join(c if rng.random() < 0.6 else "?" for c in p)
    assert f1(t, pq) == T.brute_p1(t, pq), (t, pq)
    assert f2(t, p) == T.brute_p2(t, p), (t, p)
    assert f3(t, p) == T.brute_p3(t, p), (t, p)
    # pattern taken from the text, so matches happen
    if n:
        a = rng.randrange(n)
        b = rng.randint(a + 1, n)
        q = t[a:b]
        assert f2(t, q) == T.brute_p2(t, q), (t, q)
        assert f3(t, q) == T.brute_p3(t, q), (t, q)
    assert f4(t) == T.brute_p4(t) == f4b(t), (t, f4(t), T.brute_p4(t), f4b(t))
    assert f5(t) == (T.brute_p5(t) if n else ([], [])), t
    assert f6(t) == T.brute_p6(t), (t, f6(t), T.brute_p6(t))
    cases += 1
# periodic strings
for unit in ["a", "ab", "aab", "abc", "abab", "abaab"]:
    for reps in range(1, 8):
        t = unit * reps + unit[: reps % len(unit)]
        assert f4(t) == T.brute_p4(t) == f4b(t), t
        assert f5(t) == T.brute_p5(t), t
        assert f6(t) == T.brute_p6(t), t
        for m in range(1, len(t) + 1):
            assert f2(t, t[:m]) == T.brute_p2(t, t[:m])
            assert f3(t, t[:m]) == T.brute_p3(t, t[:m])
        cases += 1
print("ok", cases)
