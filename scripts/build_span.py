import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_span import KRUSKAL, POINTS, SOME, SWAP

S = "span"
A = 6364136223846793005
B = 3935559000370003845
M = 1_000_000_007


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rand_tree(n, seed, wmax, scramble=True):
    """A random spanning tree of n vertices: vertex i joins a vertex below it; labels scrambled by 77,777 (n = 100,000)."""
    lab = (lambda e: f"({e} * 77_777 % 100_000)") if scramble else (lambda e: e)
    return f"[({lab('(x >> 8) % i')}, {lab('i')}, (x >> 40) % {wmax}) for i in range(1, {n}) {mix('i', seed)}]"


def rand_edges(n, m, seed, wmax):
    return f"[(u, v, (x >> 50) % {wmax}) for k in range({m}) {mix('k', seed)} for u, v in [((x >> 8) % {n}, (x >> 30) % {n})]]"


# ---------- P1: a cheaper line ----------

EX_TREE = "[(0, 1, 4), (1, 2, 2), (1, 3, 7), (3, 4, 1)]"

build(S, 1, "cheaper_tree", [
    {"name": "The example", "args": f"(5, {EX_TREE}, (2, 3, 3))", "show": f"cheaper_tree(5, {EX_TREE}, (2, 3, 3))",
     "why": "10. The tree's lines cost 14 in all. The new line 2–3 closes the loop 2–1–3–2, whose most expensive line is 1–3 (7). Swap it for the new line: 14 − 7 + 3 = 10."},
    {"name": "The new line is too expensive", "args": f"(5, {EX_TREE}, (0, 4, 9))", "show": f"cheaper_tree(5, {EX_TREE}, (0, 4, 9))",
     "why": "14. The loop 0–1–3–4–0 has 7 as its most expensive tree line, and the new line costs 9. Keeping the tree is cheapest."},
    {"name": "The most expensive line is elsewhere", "args": f"(5, {EX_TREE}, (0, 2, 3))", "show": f"cheaper_tree(5, {EX_TREE}, (0, 2, 3))",
     "why": "13. The loop is 0–1–2–0, whose most expensive tree line is 0–1 (4): 14 − 4 + 3. The tree's most expensive line, 1–3 (7), is not on this loop, so it must stay: without it, 3 and 4 would be cut off."},
    {"name": "Exactly as expensive", "args": f"(5, {EX_TREE}, (2, 3, 7))", "show": f"cheaper_tree(5, {EX_TREE}, (2, 3, 7))",
     "why": "14: swapping 7 for 7 changes nothing."},
    {"name": "A line from a station to itself", "args": f"(5, {EX_TREE}, (2, 2, 0))", "show": f"cheaper_tree(5, {EX_TREE}, (2, 2, 0))",
     "why": "14. A line from 2 to 2 joins nothing new; it can never be in a spanning tree."},
    {"name": "Beside a tree line", "args": f"(5, {EX_TREE}, (1, 2, 1))", "show": f"cheaper_tree(5, {EX_TREE}, (1, 2, 1))",
     "why": "13. The loop is just the two lines between 1 and 2. Keep the cheaper one: 14 − 2 + 1."},
    {"name": "Negative costs", "args": "(4, [(0, 1, -3), (1, 2, -1), (2, 3, 5)], (0, 3, -2))", "show": "cheaper_tree(4, [(0, 1, -3), (1, 2, -1), (2, 3, 5)], (0, 3, -2))",
     "why": "-6. The loop 0–1–2–3–0 has 5 as its most expensive line: 1 − 5 + (−2) = −6. Costs below 0 change nothing in the method."},
    {"name": "One station", "args": "(1, [], (0, 0, 3))", "show": "cheaper_tree(1, [], (0, 0, 3))", "why": "0: a tree of one station has no lines."},
    {"name": "A path of 100,000", "timeout": 3000, "args": "(100_000, [(i, i + 1, i * 7919 % 1000) for i in range(99_999)], (0, 99_999, 5))",
     "show": "a path 0–1–…–99999, new line from 0 to 99999 costing 5",
     "why": "The loop is the whole path, 100,000 stations long. A recursive search for the path goes 100,000 calls deep and fails; walk the tree with a queue or your own stack."},
    {"name": "A random tree of 100,000", "timeout": 3000, "args": f"(100_000, {rand_tree(100_000, 3, 1000)}, (12_345, 67_890, 40))",
     "show": "100,000 stations in a random tree, one new line", "why": "One search of the tree, O(n)."},
    {"name": "Many lines at the same cost", "timeout": 3000, "args": f"(100_000, {rand_tree(100_000, 5, 3)}, (99_999, 3, 1))",
     "show": "100,000 stations, every line costs 0, 1 or 2", "why": "Only the most expensive line on the loop matters, and several may share that cost; any one of them can go."},
], trusted=SWAP)


# ---------- P2: Kruskal ----------

TREE2 = "(lambda t: None if t is None else tree_cost(args[0], args[1], t))(mst(args[0], list(args[1])))"


def k(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": TREE2, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


EX2 = "[(0, 1, 4), (0, 3, 2), (1, 3, 5), (1, 2, 6), (1, 4, 3), (3, 4, 7), (2, 4, 8), (2, 5, 1), (4, 5, 9), (2, 6, 5), (5, 6, 7)]"

build(S, 2, "mst", [
    k("The example", f"(7, {EX2})", f"mst(7, {EX2})",
      "21: [the total cost of your tree]. Your edges were checked: 6 of them, all from the list, no loop. Kruskal takes 2–5 (1), 0–3 (2), 1–4 (3), 0–1 (4), 2–6 (5) and 1–2 (6), and skips the rest."),
    k("Ties", "(4, [(0, 1, 1), (1, 2, 1), (2, 0, 1), (2, 3, 2), (0, 3, 2)])", "mst(4, [(0, 1, 1), (1, 2, 1), (2, 0, 1), (2, 3, 2), (0, 3, 2)])",
      "4. Any two lines of the triangle and either line to 3: several trees cost 4, and any of them is accepted."),
    k("Not connected", "(4, [(0, 1, 3), (2, 3, 1)])", "mst(4, [(0, 1, 3), (2, 3, 1)])", "None: no set of lines joins 0 to 2."),
    k("One station", "(1, [])", "mst(1, [])", "0: the answer is []. A tree of one station has no lines."),
    k("Loops and repeated lines", "(3, [(0, 0, -5), (0, 1, 4), (0, 1, 2), (1, 2, 3), (2, 2, 0)])", "mst(3, [(0, 0, -5), (0, 1, 4), (0, 1, 2), (1, 2, 3), (2, 2, 0)])",
      "5. A line from a station to itself always closes a loop, however cheap. Of two lines between 0 and 1, take the cheaper."),
    k("Negative costs", "(4, [(0, 1, -2), (1, 2, -7), (2, 3, 4), (0, 3, -1), (0, 2, 0)])", "mst(4, [(0, 1, -2), (1, 2, -7), (2, 3, 4), (0, 3, -1), (0, 2, 0)])",
      "-10. Costs below 0 are fine: only their order matters."),
    k("1,000 stations", f"(1000, {rand_tree(1000, 7, 50, False)} + {rand_edges(1000, 4000, 9, 50)})", "1,000 stations, about 5,000 random lines",
      "Any cheapest tree is accepted."),
    k("100,000 stations, 250,000 lines", f"(100_000, {rand_tree(100_000, 11, 1_000_000)} + {rand_edges(100_000, 150_000, 13, 1_000_000)})",
      "100,000 stations, 250,000 random lines", "Sorting is O(E log E) and union-find is nearly O(1) per line (DSUF-4).", 4000),
    k("A chain of 100,000, in order", "(100_000, [(i, i + 1, 1) for i in range(99_999)] + [(0, 99_999, 2)])",
      "0–1–2–…–99999, each line costing 1, listed in order",
      "99999. Each line joins the group holding 0, 1, …, i to the single station i + 1. If joining two groups means relabelling every station of the first group, that is 1 + 2 + … + 99,999: about 5 billion steps. Union-find joins two groups in one step (DSUF-2), and relabelling only the smaller group also works.", 4000),
], trusted=KRUSKAL)


# ---------- P3: connect the points ----------

def pts(n, seed, span):
    return f"[((x >> 8) % {2 * span + 1} - {span}, (x >> 36) % {2 * span + 1} - {span}) for k in range({n}) {mix('k', seed)}]"


build(S, 3, "connect_points", [
    {"name": "The example", "args": "([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)],)", "show": "connect_points([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)])",
     "why": "20: lines 0–1 (4), 1–3 (3), 3–4 (4) and 1–2 (9)."},
    {"name": "One point", "args": "([(5, -5)],)", "show": "connect_points([(5, -5)])", "why": "0: nothing to join."},
    {"name": "Two points", "args": "([(-3, 4), (2, -1)],)", "show": "connect_points([(-3, 4), (2, -1)])", "why": "10: |−3 − 2| + |4 − (−1)| = 5 + 5."},
    {"name": "The same place twice", "args": "([(1, 1), (1, 1), (4, 5)],)", "show": "connect_points([(1, 1), (1, 1), (4, 5)])",
     "why": "7. Two points at the same place are joined for 0."},
    {"name": "In a row", "args": "([(9, 0), (0, 0), (4, 0), (2, 0), (7, 0)],)", "show": "connect_points([(9, 0), (0, 0), (4, 0), (2, 0), (7, 0)])",
     "why": "9: neighbours along the row, 2 + 2 + 3 + 2."},
    {"name": "300 points", "args": f"({pts(300, 3, 1000)},)", "show": "300 random points, x and y from −1,000 to 1,000", "why": "Any correct method passes here."},
    {"name": "2,000 points", "timeout": 3000, "args": f"({pts(2000, 5, 1_000_000)},)", "show": "2,000 random points, x and y from −1,000,000 to 1,000,000",
     "why": "Every pair of points can be joined: 1,999,000 possible lines. Making and sorting all of them (Kruskal) takes several seconds and a lot of memory. Prim's method with a plain list of best costs takes n steps of O(n) each: about 4 million steps, with no list of lines at all (lesson 3)."},
    {"name": "2,000 points, many ties", "timeout": 3000, "args": f"({pts(2000, 7, 20)},)", "show": "2,000 points on a small grid from −20 to 20",
     "why": "Many points share a place or a distance, so many trees are cheapest; the cost is the same for all of them."},
], trusted=POINTS)


# ---------- P4: lines in some cheapest tree ----------

SUM4 = "(lambda r: [len(r), sum(r), sum(i for i, x in enumerate(r) if x) % 1_000_000_007])(in_some_mst(args[0], list(args[1])))"

build(S, 4, "in_some_mst", [
    {"name": "The example", "args": "(4, [(0, 1, 1), (1, 2, 2), (0, 2, 2), (2, 3, 3), (1, 3, 5)])",
     "show": "in_some_mst(4, [(0, 1, 1), (1, 2, 2), (0, 2, 2), (2, 3, 3), (1, 3, 5)])",
     "why": "[True, True, True, True, False]. 1–2 and 0–2 both cost 2 and close the same loop with 0–1, so either can be in a cheapest tree. 1–3 is the most expensive line on the loop 1–2–3–1, and more expensive than the others, so no cheapest tree uses it (lesson 4)."},
    {"name": "A triangle of equal lines", "args": "(3, [(0, 1, 4), (1, 2, 4), (2, 0, 4)])", "show": "in_some_mst(3, [(0, 1, 4), (1, 2, 4), (2, 0, 4)])",
     "why": "[True, True, True]: any two of them make a cheapest tree. A method that reports only the lines one run of Kruskal picks gets one of these wrong."},
    {"name": "A triangle of different lines", "args": "(3, [(0, 1, 1), (1, 2, 2), (2, 0, 3)])", "show": "in_some_mst(3, [(0, 1, 1), (1, 2, 2), (2, 0, 3)])",
     "why": "[True, True, False]: 2–0 is the most expensive line on the only loop."},
    {"name": "A loop and repeated lines", "args": "(2, [(0, 0, 1), (0, 1, 5), (0, 1, 5), (1, 0, 6)])", "show": "in_some_mst(2, [(0, 0, 1), (0, 1, 5), (0, 1, 5), (1, 0, 6)])",
     "why": "[False, True, True, False]. A line from a station to itself is in no tree. The two lines costing 5 can each be the tree; the one costing 6 never is."},
    {"name": "Two separate parts", "args": "(5, [(0, 1, 2), (1, 2, 2), (0, 2, 1), (3, 4, 9)])", "show": "in_some_mst(5, [(0, 1, 2), (1, 2, 2), (0, 2, 1), (3, 4, 9)])",
     "why": "[True, True, True, True]. The network is not connected, so the question is about cheapest spanning forests: a cheapest tree for each part. 3–4 is the only way to join 3 and 4."},
    {"name": "Equal, but joined by cheaper lines", "args": "(4, [(0, 1, 1), (1, 2, 1), (0, 2, 2), (2, 3, 2)])", "show": "in_some_mst(4, [(0, 1, 1), (1, 2, 1), (0, 2, 2), (2, 3, 2)])",
     "why": "[True, True, False, True]. 0–2 and 2–3 both cost 2, but 0 and 2 are already joined by lines costing 1. Ask about each line before adding any line of the same cost."},
    {"name": "Order of the list does not matter", "args": "(4, [(2, 3, 2), (0, 2, 2), (1, 2, 1), (0, 1, 1)])", "show": "in_some_mst(4, [(2, 3, 2), (0, 2, 2), (1, 2, 1), (0, 1, 1)])",
     "why": "[True, False, True, True]: the same network listed the other way round."},
    {"name": "100,000 stations, few different costs", "timeout": 4000, "args": f"(100_000, {rand_tree(100_000, 3, 5)} + {rand_edges(100_000, 100_000, 5, 5)})",
     "expr": SUM4, "show": "100,000 stations, about 200,000 lines, each costing 0 to 4",
     "why": "[how many lines, how many True, a check number]. Thousands of lines share each cost. Sort once, take the lines one cost at a time, and ask union-find about each: O(E log E). Trying each line on its own with a fresh search is O(E · (V + E))."},
    {"name": "100,000 stations, all costs different", "timeout": 4000,
     "args": f"(100_000, [(u, v, k) for k, (u, v, w) in enumerate({rand_tree(100_000, 7, 2)} + {rand_edges(100_000, 100_000, 9, 2)})])",
     "expr": SUM4, "show": "100,000 stations, about 200,000 lines, every cost different",
     "why": "With all costs different there is exactly one cheapest tree, so exactly 99,999 lines are True."},
], trusted=SOME)
