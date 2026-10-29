import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_hard import P1, P2, P3, P4, P5, brute_makespan

S = "hard"
A = 6364136223846793005
B = 3935559000370003845


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def mixed(k, seed):
    y = (k + seed * 10_000_019) * A % 2 ** 64
    return (y ^ y >> 29) * B % 2 ** 64


# ---------- P1: an assignment from a yes/no helper ----------

def groups_formula(groups, size, seed, unsat_group=None):
    """Independent groups of `size` variables, each with clauses of 3 literals that a planted assignment
    satisfies. If unsat_group is set, that group gets every clause on its first 3 variables (no answer)."""
    clauses = []
    k = 0
    for g in range(groups):
        base = g * size
        plant = [mixed(base + i, seed) >> 20 & 1 for i in range(size)]
        if g == unsat_group:
            for signs in range(8):
                clauses.append([(base + i + 1) * (1 if signs >> i & 1 else -1) for i in range(3)])
            continue
        for _ in range(4 * size):
            x = mixed(k, seed + 1)
            k += 1
            vs = []
            while len(vs) < 3:
                v = (x >> (8 + 4 * len(vs) + len(vs))) % size
                x = x * 31 + 7
                if v not in vs:
                    vs.append(v)
            lits = [(base + v + 1) * (1 if (x >> (40 + j)) & 1 else -1) for j, v in enumerate(vs)]
            if not any((l > 0) == bool(plant[abs(l) - base - 1]) for l in lits):
                lits[0] = -lits[0]          # make the planted assignment satisfy it
            clauses.append(lits)
    return clauses


ORACLE = "oracle_check(find_assignment, *args)"


def t1(name, n, clauses, why, show=None, **kw):
    return {"name": name, "args": f"({n}, {clauses})", "expr": ORACLE,
            "show": show or f"find_assignment({n}, {clauses}, sat)", "why": why, **kw}


FIG = [[1, 2], [-1, 3], [-2, -3], [3, 4], [-4, -1]]
build(S, 1, "find_assignment", [
    t1("One variable", 1, [[1]], "['satisfied', True]: the answer [True], with at most 2 calls to sat. Each test reports [is the answer right?, at most n + 1 calls?]."),
    t1("It must be False", 1, [[-1]], "['satisfied', True]: [False]. If sat says x1 = True is impossible, x1 must be False."),
    t1("No answer", 1, [[1], [-1]], "['no assignment', True]: return None. Ask first whether the whole formula has an answer."),
    t1("No clauses", 3, [], "['satisfied', True]: anything works, for example [True, True, True]."),
    t1("A chain of rules", 4, [[-1, 2], [-2, 3], [-3, 4], [1]],
       "['satisfied', True]: only [True, True, True, True]. Each choice must be kept when asking about the next variable."),
    t1("The figure's formula", 4, FIG, "['satisfied', True], for example [True, False, True, False] as in the figure of lesson 1."),
    t1("Every clause on three variables", 3, [[a * 1, b * 2, c * 3] for a in (1, -1) for b in (1, -1) for c in (1, -1)],
       "['no assignment', True]: each of the 8 assignments breaks one clause."),
    t1("Choices that depend on each other", 5, [[1, 2], [-1, -2], [2, 3], [-2, -3], [3, 4], [-3, -4], [4, 5], [-4, -5]],
       "['satisfied', True]: the values must alternate. Asking about each variable on its own, without the earlier choices, can mix two different answers."),
    t1("Twenty variables", 20, groups_formula(4, 5, 11), "['satisfied', True] with at most 21 calls.", show="20 variables in 4 groups of 5, 80 clauses of 3"),
    t1("Sixty variables", 60, groups_formula(12, 5, 12),
       "['satisfied', True]. Trying all 2⁶⁰ assignments is impossible; 61 questions to sat are enough.", show="60 variables in 12 groups of 5, 240 clauses of 3"),
    t1("Sixty variables, no answer", 60, groups_formula(12, 5, 13, unsat_group=7),
       "['no assignment', True]: one group has no answer, so neither has the whole formula. One question settles it.",
       show="60 variables in 12 groups; one group has every clause on its first 3 variables"),
], P1)

# ---------- P2: three groups as a formula ----------

SMALL = "colour_cnf_report(args[0], args[1], colouring_formula(args[0], list(args[1])))"


def t2(name, n, edges, why, show=None):
    return {"name": name, "args": f"({n}, {edges})", "expr": SMALL, "show": show or f"colouring_formula({n}, {edges})", "why": why}


def wheel(k):
    return [(0, i) for i in range(1, k + 1)] + [(i, i % k + 1) for i in range(1, k + 1)]


PETERSEN = [(i, (i + 1) % 5) for i in range(5)] + [(i, i + 5) for i in range(5)] + [(5 + i, 5 + (i + 2) % 5) for i in range(5)]


def planted(name, n, m, seed, why, timeout=3000):
    edges = f"[(u, v) for k in range({m}) {mix('k', seed)} for u in [(x >> 8) % {n}] for v in [(x >> 36) % {n}] if u % 3 != v % 3]"
    return {"name": name, "timeout": timeout, "args": f"({n}, {edges})",
            "expr": f"colour_cnf_report(args[0], args[1], colouring_formula(args[0], list(args[1])), [v % 3 for v in range({n})])",
            "show": f"{n:,} vertices and about {m * 2 // 3:,} random edges, made so that a colouring exists", "why": why}


build(S, 2, "colouring_formula", [
    t2("One vertex", 1, [], "['colouring']. Small graphs are checked by solving your formula and reading a colour for each vertex from it."),
    t2("A triangle", 3, [(0, 1), (1, 2), (0, 2)], "['colouring']: three different colours."),
    t2("Four, all joined", 4, [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)],
       "['no colouring']: four vertices that all touch need four colours, so the formula must have no solution. Without the edge clauses it would have one."),
    t2("An odd wheel", 6, wheel(5), "['no colouring']: the rim, a cycle of 5, needs all three colours, and the hub touches all of them."),
    t2("An even wheel", 7, wheel(6), "['colouring']: the rim of 6 alternates two colours and the hub takes the third."),
    t2("The Petersen graph", 10, PETERSEN, "['colouring']: this famous graph of 10 vertices needs exactly three colours."),
    t2("A path with no edges at one end", 5, [(0, 1), (1, 2)],
       "['colouring']. Vertices 3 and 4 have no edges, but they still need a colour: every vertex needs its clause 'at least one colour'."),
    planted("300 vertices", 300, 1200, 21,
            "Four facts are checked: a proper colouring satisfies every clause, giving two neighbours one colour breaks a clause, a vertex with no colour breaks a clause, and there are at most 4n + 3E clauses. If this test runs out of time, the formula is probably built by solving the colouring first: trying every colouring of 300 vertices is 3³⁰⁰ tries (300 threes multiplied together). Write the clauses straight from the vertices and edges instead."),
    planted("3,000 vertices", 3000, 13500, 22,
            "The same four facts. Solving the colouring yourself and writing the answer as a formula cannot work here: the reduction must not depend on the answer."),
], P2)

# ---------- P3: the most valuable load ----------


def t3(name, items, cap, why, show=None, **kw):
    return {"name": name, "args": f"({items}, {cap})", "show": show or f"best_value({items}, {cap})", "why": why, **kw}


def items_expr(n, seed, style):
    w = "(x >> 8) % 900_000_000 + 100_000_000"
    if style == "free":
        v = "(x >> 36) % 900_000_000 + 100_000_000"
    elif style == "near":
        v = f"{w} + (x >> 36) % 200_000_000 - 100_000_000"
    else:
        v = f"{w} + 100_000_000"
    return f"[({w}, {v}) for k in range({n}) {mix('k', seed)}]"


def big3(name, n, seed, style, why, show):
    its = items_expr(n, seed, style)
    return {"name": name, "args": f"({its}, sum(w for w, v in {its}) // 2)", "show": show, "why": why}


build(S, 3, "best_value", [
    t3("No items", [], 10, "0."),
    t3("Nothing fits", [(5, 10)], 4, "0: the only item weighs 5."),
    t3("One item", [(3, 7)], 3, "7: an item that fills the bag exactly fits."),
    t3("Best value per kilogram goes wrong", [(1, 2), (10, 15)], 10,
       "15. The small item has the better value per kilogram (2 against 1.5), but taking it leaves no room for the big one."),
    t3("Two of the second best", [(6, 30), (5, 24), (5, 24)], 10, "48: both 5s. Greedy by value per kilogram takes the 6 first and stops at 30."),
    t3("Items worth nothing", [(2, 0), (3, 0), (4, 9)], 6, "9: only the item worth 9 counts. Items worth 0 never change the best value."),
    t3("Everything fits", [(1, 1), (2, 2), (3, 3)], 100, "6: the bag holds every item, so take them all."),
    t3("Thirty items", [(mixed(k, 31) % 1000 + 1, mixed(k, 32) % 1000 + 1) for k in range(30)], 7000,
       "Trying all 2³⁰ choices, about a billion, is too slow. With the bound, about a hundred nodes are enough.", show="30 random items of weight and value 1 to 1,000, a bag of 7,000"),
    big3("100 items, values unrelated to weights", 100, 33, "free",
         "Weights and values up to 10⁹, so a table by weight or by value is far too big. A bound that adds up every item left prunes almost nothing; the fractional bound needs under a thousand nodes.",
         "100 items with random weights and values from 10⁸ to 10⁹; the bag holds half the total weight"),
    big3("100 items, values near the weights", 100, 34, "near",
         "Values within 10⁸ of the weights. The fractional bound still prunes well.",
         "100 items whose values differ from their weights by up to 10⁸; the bag holds half the total weight"),
    big3("60 items, every value 10⁸ above its weight", 60, 43, "strong",
         "A hard kind of instance for branch and bound: every item has almost the same value per kilogram, so bounds are close to each other. About 5,600 nodes here; some such instances need millions, which is why branch and bound has no fast guarantee.",
         "60 items with value = weight + 10⁸; the bag holds half the total weight"),
], P3)

# ---------- P4: balancing the load ----------


def check4(opt):
    return f"(lambda s: s if isinstance(s, str) else 3 * s <= 4 * {opt})(makespan(args[0], args[1], schedule(list(args[0]), args[1])))"


def t4(name, jobs, m, why, opt=None):
    opt = brute_makespan(jobs, m) if opt is None else opt
    return {"name": name, "args": f"({jobs}, {m})", "expr": check4(opt), "show": f"schedule({jobs}, {m})",
            "why": f"True: the busiest machine has at most 4/3 of the best possible, {opt}. " + why}


def planted4(name, m, parts, seed, why, timeout=3000):
    T = 10 ** 6
    jobs = (f"[b - a for i in range({m}) for cs in [sorted({{(x >> 8) % {T} for k in range({parts - 1}) {mix(f'i * {parts} + k', seed)}}} | {{0, {T}}})] "
            f"for a, b in zip(cs, cs[1:])]")
    return {"name": name, "timeout": timeout, "args": f"({jobs}, {m})", "expr": check4(T),
            "show": f"{m:,} machines; jobs made by cutting {m:,} blocks of 1,000,000 into about {parts} pieces each, so the best possible is 1,000,000",
            "why": why}


build(S, 4, "schedule", [
    t4("One machine", [3, 1, 2], 1, "Every job goes on machine 0."),
    t4("More machines than jobs", [5, 3], 4, "One job per machine."),
    t4("In the given order is not enough", [1, 1, 1, 1, 1, 1, 3], 3,
       "Placing the jobs in the given order onto the least loaded machine ends with loads 2, 2, 2 and then 5 for the last job. Taking the longest job first gives 3, 3, 3."),
    t4("Two machines", [3, 3, 2, 2, 2], 2, "Longest first gives 7 against the best 6 (3 + 3 and 2 + 2 + 2): not the best, but within 4/3."),
    t4("Graham's example", [5, 5, 4, 4, 3, 3, 3], 3, "Longest first gives 11 against the best 9 (5 + 4, 5 + 4, 3 + 3 + 3): within 4/3, as the guarantee promises."),
    t4("Random jobs", [mixed(k, 41) % 50 + 1 for k in range(8)], 3, "Checked against the best of all 3⁸ assignments."),
    t4("Equal jobs", [7] * 10, 4, "Three machines get 3 jobs and one gets 1, or 3, 3, 2, 2: the busiest has 21."),
    planted4("200,000 jobs on 10,000 machines", 10_000, 20, 42,
             "Looking through all 10,000 machines for the least loaded one, for each of 200,000 jobs, is 2 × 10⁹ steps: too slow, even with min() running in C. A heap of machines by load does it in O(n log m).",
             timeout=5000),
    planted4("Few machines, many jobs", 4, 5000, 43, "20,000 jobs on 4 machines."),
], P4)

# ---------- P5: prime or not ----------


def t5(name, n, why, show=None):
    return {"name": name, "args": f"({n},)", "show": show or f"is_prime({n})", "why": why}


def t5e(name, expr, show, why, **kw):
    return {"name": name, "args": "()", "expr": expr, "show": show, "why": why, **kw}


build(S, 5, "is_prime", [
    t5e("Small numbers", "[k for k in range(60) if is_prime(k)]", "the k below 60 with is_prime(k)",
        "The primes below 60. 0 and 1 are not prime; 2 is."),
    t5("A Carmichael number", 561, "False: 561 = 3 · 11 · 17. Fermat's test with any base that shares no factor with 561 says 'maybe prime' (MATH-5). Miller–Rabin with base 2 finds a square root of 1 that is not ±1."),
    t5e("More Carmichael numbers", "[is_prime(k) for k in [1105, 1729, 2465, 41041, 825265, 321197185]]",
        "is_prime of 1105, 1729, 2465, 41041, 825265 and 321197185", "All False. Each is a Carmichael number: it passes Fermat's test for every base with no common factor, but the strong test finds a witness."),
    t5("Fools base 2", 2047, "False: 2047 = 23 · 89 passes the strong test with base 2. A second base catches it."),
    t5("Fools bases 2, 3, 5 and 7", 3215031751, "False: 3,215,031,751 = 151 · 751 · 28351 passes the strong test for the four smallest prime bases."),
    t5("Fools the first nine primes", 3825123056546413051, "False: it passes the strong test for every base from 2 to 23."),
    t5("Fools the first twelve primes", 318665857834031151167461,
       "False: the smallest number that passes the strong test for all twelve bases 2 to 37. Base 41 catches it, which is why the lesson uses 13 bases."),
    t5("A big prime", 2 ** 61 - 1, "True: 2⁶¹ − 1. Trial division would need about 1.5 × 10⁹ steps."),
    t5("A square of a big prime", (10 ** 9 + 7) ** 2, "False: (10⁹ + 7)². No small factor, and trial division would need 10⁹ steps."),
    t5("Two prime factors near 10¹²", 1000000000039 * 1000000000061, "False: the product of two primes just above 10¹²."),
    t5("Near 10²⁴", 10 ** 24 + 7, "True: 10²⁴ + 7 is prime. pow(a, d, n) works with numbers this size directly."),
    t5e("Primes near 10¹⁸", "sum(1 for k in range(10 ** 18, 10 ** 18 + 20_000) if is_prime(k))", "how many k from 10¹⁸ to 10¹⁸ + 19,999 have is_prime(k)",
        "About 1 in 41 numbers near 10¹⁸ is prime (1 / ln 10¹⁸). Each test is a few modular powers."),
    t5e("Primes below 200,000", "sum(1 for k in range(200_000) if is_prime(k))", "how many k below 200,000 have is_prime(k)",
        "17,984. Most numbers are thrown out by the small prime factors; each of the rest needs a few powers."),
], P5)
