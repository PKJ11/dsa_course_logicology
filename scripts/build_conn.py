import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_conn import GROUP, SAT, SCC, WEAK

S = "conn"
A = 6364136223846793005
B = 3935559000370003845


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rand_arcs(n, m, seed):
    """m random one-way edges u -> v (u may equal v), as a list expression."""
    return f"[((x >> 8) % {n}, (x >> 36) % {n}) for k in range({m}) {mix('k', seed)}]"


def rings(groups, size, seed, extra):
    """`groups` rings of `size` vertices each, scrambled labels, plus `extra` edges that only go from a ring to a
    later ring (so the rings are exactly the groups), listed before the rings."""
    n = groups * size
    lab = f"(({{}}) * 7_919 % {n})"  # vertex i is called i * 7919 % n (7919 is prime and does not divide n)
    ring = f"[({lab.format('g * ' + str(size) + ' + j')}, {lab.format('g * ' + str(size) + ' + (j + 1) % ' + str(size))}) for g in range({groups}) for j in range({size})]"
    fwd = (f"[({lab.format('a')}, {lab.format('b')}) for k in range({extra}) {mix('k', seed)} "
           f"for a, b in [((x >> 8) % {n}, (x >> 36) % {n})] if a // {size} < b // {size}]")
    return f"{fwd} + {ring}"


FIG = "[(0, 1), (1, 4), (4, 0), (5, 4), (5, 6), (1, 2), (2, 3), (3, 7), (7, 6), (6, 2)]"
M = 1_000_000_007

# ---------- P1: the group of one junction ----------

SUM1 = f"(lambda g: [len(g), g[:3], g[-3:], sum(g) % {M}])(group_of(args[0], list(args[1]), args[2]))"

build(S, 1, "group_of", [
    {"name": "The example", "args": f"(8, {FIG}, 0)", "show": f"group_of(8, {FIG}, 0)",
     "why": "[0, 1, 4]. From 0 you can reach every junction except 5. Only 1 and 4 can also get back to 0, so the group is 0, 1 and 4."},
    {"name": "Nobody comes back", "args": f"(8, {FIG}, 5)", "show": f"group_of(8, {FIG}, 5)",
     "why": "[5]. Junction 5 reaches everything else, but no street leads into 5. A junction is always in its own group."},
    {"name": "The last group", "args": f"(8, {FIG}, 6)", "show": f"group_of(8, {FIG}, 6)",
     "why": "[2, 3, 6, 7]: the loop 2 → 3 → 7 → 6 → 2. Junction 6 cannot reach 0, 1, 4 or 5, so they are not in its group even though they reach 6."},
    {"name": "Loops and repeated streets", "args": "(3, [(0, 0), (0, 1), (0, 1), (1, 0), (2, 2)], 0)",
     "show": "group_of(3, [(0, 0), (0, 1), (0, 1), (1, 0), (2, 2)], 0)",
     "why": "[0, 1]. A street from a junction to itself changes nothing, and two streets 0 → 1 count like one."},
    {"name": "One junction", "args": "(1, [], 0)", "show": "group_of(1, [], 0)", "why": "[0]."},
    {"name": "Sorted answer", "args": "(5, [(4, 2), (2, 0), (0, 4), (3, 1)], 2)", "show": "group_of(5, [(4, 2), (2, 0), (0, 4), (3, 1)], 2)",
     "why": "[0, 2, 4], in increasing order, whatever order your search reached them in."},
    {"name": "A ring of 100,000", "timeout": 3000, "args": "(100_000, [(i, (i + 1) % 100_000) for i in range(100_000)], 0)",
     "expr": SUM1, "show": "streets 0 → 1 → 2 → … → 99999 → 0, s = 0",
     "why": "[how many, first three, last three, a check number]. Every junction is in the group. A recursive search goes 100,000 calls deep here and fails: keep your own stack, or use a queue."},
    {"name": "A long one-way chain", "timeout": 3000, "args": "(100_000, [(i, i + 1) for i in range(99_999)] + [(99_999, 50_000)], 60_000)",
     "expr": SUM1, "show": "0 → 1 → … → 99999, plus 99999 → 50000; s = 60000",
     "why": "50,000 junctions: 50000 to 99999. Junctions below 50000 reach 60000, but 60000 cannot reach them."},
    {"name": "100,000 random streets", "timeout": 3000, "args": f"(100_000, {rand_arcs(100_000, 200_000, 3)}, 17)",
     "expr": SUM1, "show": "100,000 junctions, 200,000 random one-way streets, s = 17",
     "why": "Two searches, one along the streets and one against them, then keep what both reached: O(V + E). Checking every junction on its own with a fresh search is O(V · (V + E)), billions of steps here."},
    {"name": "20,000 small groups", "timeout": 3000, "args": f"(100_000, {rings(20_000, 5, 5, 100_000)}, 31_675)",
     "expr": SUM1, "show": "20,000 rings of 5 junctions, with 100,000 streets that only go from a ring to a later ring",
     "why": "Junction 31675 reaches many rings, but only its own ring leads back to it: the answer has 5 junctions."},
], trusted=GROUP)


# ---------- P2: every group, in order ----------

CHECK2 = "(lambda L: [scc_check(args[0], args[1], L), len(set(L)) if isinstance(L, (list, tuple)) else None])(scc(args[0], list(args[1])))"


def g2(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CHECK2, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 2, "scc", [
    g2("The example", f"(8, {FIG})", f"scc(8, {FIG})",
       "['ok', 3]: [the check of your numbers, how many groups]. One right answer is [1, 1, 2, 2, 1, 0, 2, 2]: junction 5 is group 0, then 0, 1, 4 are group 1, then 2, 3, 6, 7 are group 2. Every street goes to the same group or a later one."),
    g2("A one-way chain", "(4, [(2, 3), (0, 1), (1, 2)])", "scc(4, [(2, 3), (0, 1), (1, 2)])",
       "['ok', 4]: the only right answer is [0, 1, 2, 3]. Tarjan's method finishes the groups from the last to the first, so its numbers must be turned round (lesson 2)."),
    g2("No streets", "(4, [])", "scc(4, [])", "['ok', 4]: four groups of one, in any order."),
    g2("One junction", "(1, [])", "scc(1, [])", "['ok', 1]: [0]."),
    g2("Loops and repeated streets", "(3, [(0, 0), (1, 2), (1, 2), (2, 2)])", "scc(3, [(0, 0), (1, 2), (1, 2), (2, 2)])",
       "['ok', 3]. A street from a junction to itself does not join it to anything else."),
    g2("Two loops joined both ways", "(6, [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3), (2, 3), (5, 0)])",
       "scc(6, [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3), (2, 3), (5, 0)])",
       "['ok', 1]. 2 → 3 and 5 → 0 join the two loops into one group."),
    g2("A cross street to a finished group", "(5, [(0, 1), (1, 0), (0, 2), (2, 3), (3, 2), (1, 3), (4, 3)])",
       "scc(5, [(0, 1), (1, 0), (0, 2), (2, 3), (3, 2), (1, 3), (4, 3)])",
       "['ok', 3]. When the search from 0 is over, 4 starts a new search and finds the street 4 → 3. Junction 3 is in a group that is already finished, so that street must not lower 4's low-link number."),
    g2("A chain of 100,000", "(100_000, [(i, i + 1) for i in range(99_999)])", "0 → 1 → 2 → … → 99999",
       "100,000 groups of one, and the only right numbering is 0, 1, 2, …. The search goes 100,000 levels deep: keep your own stack of (vertex, iterator) pairs.", 4000),
    g2("A ring of 100,000", "(100_000, [(i, (i + 1) % 100_000) for i in range(100_000)])", "0 → 1 → … → 99999 → 0",
       "One group, 100,000 levels deep.", 4000),
    g2("80,000 random streets", f"(80_000, {rand_arcs(80_000, 160_000, 7)})", "80,000 junctions, 160,000 random one-way streets",
       "One large group and many small ones. O(V + E) with either Kosaraju's or Tarjan's method.", 4000),
    g2("20,000 small groups", f"(100_000, {rings(20_000, 5, 9, 100_000)})",
       "20,000 rings of 5, with 100,000 streets that only go from a ring to a later ring, listed in a mixed order",
       "20,000 groups that must be numbered in an order that every street respects: a topological order of the graph of groups (GRPH-5).", 4000),
], trusted=SCC)


# ---------- P3: weak points ----------

FIG3 = "[(0, 1), (0, 2), (1, 2), (2, 3), (3, 4), (3, 5), (4, 5), (4, 6)]"
EXACT3 = "(lambda r: [sorted(r[0]), sorted(r[1])])(weak_points(args[0], list(args[1])))"
SUM3 = f"(lambda r: [len(r[0]), sum(r[0]) % {M}, len(r[1]), sum(r[1]) % {M}])(weak_points(args[0], list(args[1])))"


def w3(name, args, show, why, timeout=None, big=False):
    t = {"name": name, "args": args, "expr": SUM3 if big else EXACT3, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 3, "weak_points", [
    w3("The example", f"(7, {FIG3})", f"weak_points(7, {FIG3})",
       "[[3, 7], [2, 3, 4]]. Lines 3 (2–3) and 7 (4–6) are bridges. Stations 2, 3 and 4 are cut stations: closing any of them splits the network."),
    w3("Two lines between the same stations", f"(7, {FIG3} + [(3, 2)])", f"weak_points(7, {FIG3} + [(3, 2)])",
       "[[7], [2, 3, 4]]. With a second line between 2 and 3, neither line is a bridge. Skip only the line you came along (by its position), not every line back to the parent station. Stations 2 and 3 are still cut stations: closing a station closes all its lines."),
    w3("One line", "(2, [(0, 1)])", "weak_points(2, [(0, 1)])", "[[0], []]. The line is a bridge. Neither station is a cut station: closing one leaves the other on its own, still one part."),
    w3("A star", "(5, [(0, 1), (0, 2), (0, 3), (0, 4)])", "weak_points(5, [(0, 1), (0, 2), (0, 3), (0, 4)])",
       "[[0, 1, 2, 3], [0]]. The search starts at 0, which has four children in the search tree: the start is a cut station exactly when it has two or more children."),
    w3("Start with one child", "(3, [(0, 1), (1, 2)])", "weak_points(3, [(0, 1), (1, 2)])",
       "[[0, 1], [1]]. Station 0 starts the search and has one child, so it is not a cut station, even though low[1] ≥ disc[0]."),
    w3("A ring", "(5, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0)])", "weak_points(5, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 0)])",
       "[[], []]: every line is on a loop, and closing any one station leaves a path."),
    w3("Two parts, a loop line, a lone station", "(6, [(0, 1), (1, 2), (2, 0), (3, 3), (3, 4)])",
       "weak_points(6, [(0, 1), (1, 2), (2, 0), (3, 3), (3, 4)])",
       "[[4], []]. A line from 3 to itself is never a bridge. Station 5 has no lines. The network has three parts to begin with; a bridge or cut station is one that makes more parts."),
    w3("Two triangles sharing a station", "(5, [(0, 1), (1, 2), (2, 0), (2, 3), (3, 4), (4, 2)])",
       "weak_points(5, [(0, 1), (1, 2), (2, 0), (2, 3), (3, 4), (4, 2)])",
       "[[], [2]]. No line is a bridge, but closing station 2 splits the network: a cut station need not touch a bridge."),
    w3("A path of 100,000", "(100_000, [(i, i + 1) for i in range(99_999)])", "0 – 1 – 2 – … – 99999",
       "[99999 bridges, their check number, 99998 cut stations, their check number]. Every line is a bridge and every station but the two ends is a cut station. The search goes 100,000 levels deep: a recursive version fails here.", 4000, True),
    w3("100,000 random lines", f"(100_000, {rand_arcs(100_000, 120_000, 11)})", "100,000 stations, 120,000 random lines",
       "A sparse random network has many trees hanging off its loops, so many bridges and cut stations. Removing each line and counting parts again is O(E · (V + E)); one search is O(V + E).", 4000, True),
    w3("A ring with a double line", "(100_000, [(i, (i + 1) % 99_999) for i in range(99_999)] + [(99_999, 0), (0, 99_999)])",
       "a ring 0 – 1 – … – 99998 – 0, and two lines between 0 and 99999",
       "[0, 0, 1, 0]: no bridges, and one cut station, 0. Station 99999 hangs off 0 by two lines, so neither line is a bridge. But closing station 0 cuts 99999 off, and the search from 0 has two children: the ring, and 99999. The ring is 99,999 levels deep.", 4000, True),
], trusted=WEAK)


# ---------- P4: 2-SAT ----------

CHECK4 = "sat_check(args[0], args[1], two_sat(args[0], [tuple(c) for c in args[1]]))"


def s4(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CHECK4, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


def planted(n, m, seed):
    """m random rules over n questions, each made true by a hidden choice (question j is yes when bit 13 of
    j * 2654435761 is 1): if neither half of a rule holds for the hidden choice, its first half is turned round."""
    h = "((({}) * 2654435761 >> 13) & 1 == 1)"
    return (f"[(a if t else -a, b) for k in range({m}) {mix('k', seed)} "
            f"for u, v in [((x >> 8) % {n} + 1, (x >> 36) % {n} + 1)] "
            f"for a, b in [(u if x >> 60 & 1 else -u, v if x >> 61 & 1 else -v)] "
            f"for t in [((a > 0) == {h.format('u')}) or ((b > 0) == {h.format('v')})]]")


EX4 = "[(1, 2), (-1, 3), (-2, -3), (1, -2)]"

build(S, 4, "two_sat", [
    s4("The example", f"(3, {EX4})", f"two_sat(3, {EX4})",
       "'satisfied': [True, False, True] is the only answer. Each test checks your list against every rule, so any list that keeps every rule passes."),
    s4("No answer", f"(3, {EX4} + [(-1, 2)])", f"two_sat(3, {EX4} + [(-1, 2)])",
       "'no assignment': return None. In the implication graph, question 1's yes and no are in the same group: each forces the other."),
    s4("A rule with one condition twice", "(2, [(1, 1), (-1, 2)])", "two_sat(2, [(1, 1), (-1, 2)])",
       "'satisfied': (1, 1) means question 1 must be yes; then (-1, 2) makes question 2 yes."),
    s4("Forced both ways", "(1, [(1, 1), (-1, -1)])", "two_sat(1, [(1, 1), (-1, -1)])", "'no assignment': Question 1 must be yes and must be no."),
    s4("Always true", "(1, [(1, -1)])", "two_sat(1, [(1, -1)])", "'satisfied': 'question 1 is yes or question 1 is no' holds whatever you choose."),
    s4("No rules", "(3, [])", "two_sat(3, [])", "'satisfied': any list of 3 values True or False."),
    s4("Yes is the wrong first guess", "(2, [(-1, 2), (-1, -2)])", "two_sat(2, [(-1, 2), (-1, -2)])",
       "'satisfied' with question 1 answered no. If question 1 were yes, question 2 would have to be yes and no. A method that guesses yes and never takes a guess back returns None here."),
    s4("A chain that forces everything", "(10, [(1, 1)] + [(-i, i + 1) for i in range(1, 10)] + [(-10, -10)])",
       "two_sat(10, [(1, 1), (-1, 2), (-2, 3), …, (-9, 10), (-10, -10)])",
       "'no assignment'. Question 1 must be yes, each yes forces the next, and question 10 must be no."),
    s4("40 questions", f"(40, {planted(40, 120, 3)})", "40 questions, 120 rules that some choice keeps",
       "'satisfied'. Trying every choice means 2⁴⁰ (about a million million) lists: far too many. The implication graph has 80 vertices."),
    s4("50,000 questions, 100,000 rules", f"(50_000, {planted(50_000, 100_000, 5)})", "50,000 questions, 100,000 random rules that some choice keeps",
       "'satisfied'. The implication graph has 100,000 vertices and 200,000 edges; one search for groups, O(n + m).", 4000),
    s4("A forced chain of 50,000", "(50_000, [(1, 1)] + [(-i, i + 1) for i in range(1, 50_000)])", "(1, 1), (-1, 2), (-2, 3), …, (-49999, 50000)",
       "'satisfied': every question is forced to yes. The implication graph is a path 100,000 vertices long, so the search must not use recursion.", 4000),
    s4("A chain of 50,000 that closes", "(50_000, [(1, 1)] + [(-i, i + 1) for i in range(1, 50_000)] + [(-50_000, -50_000)])",
       "the same chain, plus (-50000, -50000)",
       "'no assignment'. Now every vertex of the implication graph is in one group of 100,000, so question 1's yes and no are in the same group.", 4000),
    s4("A chain that forbids the last", "(50_000, [(-i, i + 1) for i in range(1, 50_000)] + [(-50_000, -50_000)])",
       "(-1, 2), (-2, 3), …, (-49999, 50000), (-50000, -50000)",
       "'satisfied': every question answered no. A method that tries yes for question 1, follows what it forces to the end of the chain, finds the clash and starts again for question 2, and so on, does about n²/2 = 1,250,000,000 steps. The implication graph does one search.", 4000),
], trusted=SAT)
