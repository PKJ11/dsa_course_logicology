import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_grph import CYCLE, FINISH, LINES, MOVES, ROUTE, SMALLEST, TEAMS

S = "grph"
A = 6364136223846793005
B = 3935559000370003845


def rnd(var, mod, seed=1, mult=A):
    """A pseudo-random number from 0 to mod - 1, made from the loop variable. Multiplying alone (README rule 15)
    gives values that rise by the same step each time, which draws stripes in a grid and links the two ends of an
    edge; the xor with a shifted copy and a second multiply mix the bits (README rule 16)."""
    return f"(lambda y: ((y ^ y >> 29) * {B if mult == A else A} % 2 ** 64 >> 24) % {mod})(({var} + {seed}) * {mult} % 2 ** 64)"


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from the loop variable `var`. Read
    numbers from different bits of x: (x >> 8) % n, (x >> 36) % n. One mix per item is cheap; building a test's
    input counts towards its time (README rule 10)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rand_edges(n, m, seed):
    """m random edges u-v with u != v, as a list expression (no random module, so CPython and Pyodide agree)."""
    return f"[(u, v) for k in range({m}) {mix('k', seed)} for u, v in [((x >> 8) % {n}, (x >> 36) % {n})] if u != v]"


SUMMARY = "(lambda o: [len(o), o[:5], o[-5:], sum(i * v for i, v in enumerate(o)) % 1_000_000_007])"


# ---------- P1: is there a direct line? ----------

LINES_SUM = "(lambda r: [len(r), sum(r), sum(i for i, x in enumerate(r) if x)])"

build(S, 1, "direct_lines", [
    {"name": "The example", "args": "(5, [(0, 1), (1, 2), (2, 3), (3, 0), (1, 3)], [(0, 1), (1, 0), (0, 2), (4, 1), (1, 3)])",
     "show": "direct_lines(5, [(0, 1), (1, 2), (2, 3), (3, 0), (1, 3)], [(0, 1), (1, 0), (0, 2), (4, 1), (1, 3)])",
     "why": "[True, True, False, False, True]. Lines go both ways, so (1, 0) is a line because (0, 1) is. 0 and 2 are two lines apart, but not joined directly. 4 has no lines at all."},
    {"name": "No lines", "args": "(3, [], [(0, 1), (2, 1)])", "show": "direct_lines(3, [], [(0, 1), (2, 1)])",
     "why": "[False, False]. With no edges, every list of neighbours is empty."},
    {"name": "A vertex and itself", "args": "(3, [(0, 1), (1, 2)], [(1, 1), (0, 0)])", "show": "direct_lines(3, [(0, 1), (1, 2)], [(1, 1), (0, 0)])",
     "why": "[False, False]. No line joins a vertex to itself here, so asking about (1, 1) gives False."},
    {"name": "A line given twice", "args": "(2, [(0, 1), (1, 0), (0, 1)], [(0, 1), (1, 0)])", "show": "direct_lines(2, [(0, 1), (1, 0), (0, 1)], [(0, 1), (1, 0)])",
     "why": "[True, True]. The same line can appear more than once in the list. A set of neighbours keeps it once."},
    {"name": "No questions", "args": "(4, [(0, 1)], [])", "show": "direct_lines(4, [(0, 1)], [])", "why": "[]: an empty list of answers."},
    {"name": "Both directions, many times", "args": "(6, [(0, 5), (5, 4), (4, 3), (3, 2), (2, 1)], [(a, b) for a in range(6) for b in range(6)])",
     "expr": f"{LINES_SUM}(direct_lines(args[0], list(args[1]), list(args[2])))", "show": "every pair (a, b) on a path 0–5–4–3–2–1",
     "why": "[36, 10, …]: [how many answers, how many True, a check number made from the positions of the True answers]. Each of the 5 lines is found from both ends."},
    {"name": "1,000 vertices", "args": f"(1000, (e := {rand_edges(1000, 3000, 3)}), [e[{rnd('k', 2900, 5)}] if k % 2 else ({rnd('k', 1000, 7)}, {rnd('k', 1000, 9, B)}) for k in range(3000)])",
     "expr": f"{LINES_SUM}(direct_lines(args[0], list(args[1]), list(args[2])))", "show": "1,000 vertices, 3,000 lines, 3,000 questions",
     "why": "[how many answers, how many True, a check number]. A small random network: any correct method passes."},
    {"name": "A hub with 200,000 lines", "timeout": 3000,
     "args": f"(200_001, [(0, v) for v in range(1, 200_001)], [((0, a) if k % 3 == 0 else (a, 0) if k % 3 == 1 else (a, b)) for k in range(200_000) {mix('k', 11)} for a, b in [(1 + (x >> 8) % 200_000, 1 + (x >> 36) % 200_000)]])",
     "expr": f"{LINES_SUM}(direct_lines(args[0], list(args[1]), list(args[2])))", "show": "vertex 0 joined to 200,000 others; 200,000 questions",
     "why": "[how many answers, how many True, a check number]. Vertex 0 has 200,000 neighbours. If they are kept in a list, `v in adj[0]` reads the whole list for each question: billions of steps. Keep each vertex's neighbours in a set, so each question takes about the same time whatever the degree (lesson 1)."},
    {"name": "100,000 vertices, 200,000 lines", "timeout": 3000,
     "args": f"(100_000, (e := {rand_edges(100_000, 200_000, 23)}), [e[(x >> 8) % 190_000] if k % 2 else ((x >> 8) % 100_000, (x >> 36) % 100_000) for k in range(100_000) {mix('k', 29)}])",
     "expr": f"{LINES_SUM}(direct_lines(args[0], list(args[1]), list(args[2])))", "show": "100,000 vertices, 200,000 random lines, 100,000 questions",
     "why": "[how many answers, how many True, a check number]. Half the questions ask about real lines. An adjacency matrix would need 10¹⁰ entries here; adjacency sets need only about 400,000."},
], trusted=LINES)


# ---------- P2: a shortest route ----------

ROUTE_EXPR = "(lambda p: None if p is None else [is_route(args[0], args[1], p, args[2], args[3]), len(p) - 1])(route(args[0], list(args[1]), args[2], args[3]))"

def route_test(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": ROUTE_EXPR, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


def explain2(tests):
    """Each note starts by saying what the expected pair means, not only the pair (C/D finish review)."""
    import re
    for t in tests[1:]:
        w = t["why"]
        m = re.match(r"\[True, (\d+)\][:.] ", w)
        if m:
            k = int(m.group(1))
            rest = w[m.end():]
            t["why"] = f"Expected [True, {k}]: a real route with {k} {'edge' if k == 1 else 'edges'}. " + rest[:1].upper() + rest[1:]
        elif w.startswith("[True, the number of edges]. "):
            t["why"] = "Expected [True, the number of edges]: a real route, as short as possible. " + w[len("[True, the number of edges]. "):]
        elif w.startswith("None. "):
            t["why"] = "Expected None: there is no route. " + w[len("None. "):]
    return tests


build(S, 2, "route", explain2([
    route_test("The example", "(7, [(0, 5), (5, 6), (0, 1), (1, 2), (2, 3), (3, 4), (4, 6)], 0, 6)",
               "route(7, [(0, 5), (5, 6), (0, 1), (1, 2), (2, 3), (3, 4), (4, 6)], 0, 6)",
               "[True, 2]: [is it a route from 0 to 6?, how many edges]. The shortest route is [0, 5, 6]. A depth-first search can find 0, 1, 2, 3, 4, 6 first, which is a route but 5 edges long."),
    route_test("Start is the end", "(3, [(0, 1), (1, 2)], 1, 1)", "route(3, [(0, 1), (1, 2)], 1, 1)",
               "[True, 0]: the route is just [1]. It has no edges."),
    route_test("No route", "(5, [(0, 1), (1, 2), (3, 4)], 0, 4)", "route(5, [(0, 1), (1, 2), (3, 4)], 0, 4)",
               "None. 4 is in a different part of the network from 0. The search ends with 4 never reached."),
    route_test("A direct line listed last", "(6, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0)], 0, 5)",
               "route(6, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0)], 0, 5)",
               "[True, 1]: 0 and 5 are joined directly. Going round the ring takes 5 edges."),
    route_test("Lines both ways and twice", "(4, [(1, 0), (2, 1), (1, 2), (3, 2), (0, 1)], 0, 3)", "route(4, [(1, 0), (2, 1), (1, 2), (3, 2), (0, 1)], 0, 3)",
               "[True, 3]: [0, 1, 2, 3]. Lines go both ways, so (1, 0) is also a line from 0 to 1."),
    route_test("A ladder", "(12, [(i, i + 1) for i in range(5)] + [(i, i + 1) for i in range(6, 11)] + [(i, i + 6) for i in range(0, 6, 5)], 0, 11)",
               "a ladder: two rails of 6, joined at both ends",
               "[True, 6]: down one rail and across, either way round. Both routes have 6 edges; either is accepted."),
    route_test("Endless rings", "(50, [(i, (i + 1) % 10 + 10 * (i // 10)) for i in range(50)] + [(10 * k + 5, 10 * k + 10) for k in range(4)], 0, 45)",
               "five rings of 10, each joined to the next",
               "[True, 29]. The network has many cycles, so a vertex can be reached again and again. Mark a vertex when it is first reached, and never add it to the queue twice."),
    route_test("A path of 100,000", "(100_000, [(i, i + 1) for i in range(99_999)], 0, 99_999)", "route(100000, a path 0–1–…–99999, 0, 99999)",
               "[True, 99999]. A recursive search would go 100,000 calls deep, and Python stops at about 1,000. Breadth-first search uses a queue and no recursion.", 3000),
    route_test("500,000 stops one step away", "(500_002, [(0, v) for v in range(1, 500_001)] + [(500_000, 500_001)], 0, 500_001)",
               "0 joined to 500,000 vertices; only the last one leads on",
               "[True, 2]. The queue holds 500,000 vertices at once. `list.pop(0)` moves every item left, so emptying the queue that way takes about 125 billion moves. `collections.deque` takes from the front in one step (lesson 2).", 4000),
    route_test("100,000 random lines", f"(60_000, {rand_edges(60_000, 100_000, 41)}, 0, 59_999)",
               "60,000 vertices, 100,000 random lines, from 0 to 59999",
               "[True, the number of edges]. Any route with the fewest edges is accepted; the check walks your route along the lines.", 3000),
    route_test("Two separate halves", f"(100_000, [(2 * u, 2 * v) for u, v in {rand_edges(50_000, 60_000, 43)}] + [(2 * u + 1, 2 * v + 1) for u, v in {rand_edges(50_000, 60_000, 47)}], 0, 99_999)",
               "even vertices joined only to even ones, odd to odd",
               "None. Every line joins two even vertices or two odd ones, so no route leads from 0 to 99999. The search must visit all of 0's half and then stop.", 3000),
]), trusted=ROUTE)


# ---------- P3: the finish order of depth-first search ----------

FIN = f"{SUMMARY}(finish_order([list(a) for a in args[0]]))"

build(S, 3, "finish_order", [
    {"name": "The example", "args": "([[1, 2], [3], [3], []],)", "show": "finish_order([[1, 2], [3], [3], []])",
     "why": "[3, 1, 2, 0]. 0 goes to 1, 1 goes to 3; 3 has nowhere to go and finishes, then 1. Back at 0, the next neighbour is 2; 3 is already visited, so 2 finishes, then 0."},
    {"name": "Neighbour order matters", "args": "([[2, 1], [3], [3], []],)", "show": "finish_order([[2, 1], [3], [3], []])",
     "why": "[3, 2, 1, 0]. 0 tries 2 before 1, because 2 comes first in adj[0]."},
    {"name": "Several starts", "args": "([[1], [], [0], []],)", "show": "finish_order([[1], [], [0], []])",
     "why": "[1, 0, 2, 3]. The search from 0 reaches only 0 and 1. Then it starts again from 2 (whose neighbour 0 is already visited), then from 3."},
    {"name": "A cycle", "args": "([[1], [2], [0]],)", "show": "finish_order([[1], [2], [0]])",
     "why": "[2, 1, 0]. 2 leads back to 0, which is already on the path, so 2 finishes first."},
    {"name": "A loop and a repeated edge", "args": "([[0, 1, 1], []],)", "show": "finish_order([[0, 1, 1], []])",
     "why": "[1, 0]. The edge from 0 to itself and the second edge to 1 both lead to visited vertices."},
    {"name": "No edges", "args": "([[], [], [], []],)", "show": "finish_order([[], [], [], []])", "why": "[0, 1, 2, 3]: each vertex starts and finishes on its own."},
    {"name": "Finishing is not visiting", "args": "([[1, 4], [2, 3], [], [2], [3, 5], []],)", "show": "finish_order([[1, 4], [2, 3], [], [2], [3, 5], []])",
     "why": "[2, 3, 1, 5, 4, 0]. The visiting order is 0, 1, 2, 3, 4, 5, but a vertex finishes only when everything it leads to is done. Pushing every neighbour on a stack and popping one at a time gives the right visits in a different order, and no finish times."},
    {"name": "1,000 vertices", "args": f"([[(x >> b) % 1000 for b in (8, 26, 44)] for i in range(1000) {mix('i', 3)}],)", "expr": FIN,
     "show": "1,000 vertices, 3 random edges each",
     "why": "[how many, first five, last five, a check number made from the whole order]. Any correct depth-first search passes."},
    {"name": "A path of 100,000", "timeout": 3000, "args": "([[i + 1] for i in range(99_999)] + [[]],)", "expr": FIN,
     "show": "0 → 1 → 2 → … → 99999",
     "why": "The path is 100,000 vertices deep, so a recursive search fails: Python stops at about 1,000 nested calls, and the browser may stop sooner. Keep your own stack of (vertex, iterator over its neighbours) pairs (lesson 3)."},
    {"name": "100,000 vertices, 300,000 edges", "timeout": 3000,
     "args": f"([[(x >> b) % 100_000 for b in (8, 26, 44)] for i in range(100_000) {mix('i', 5)}],)", "expr": FIN,
     "show": "100,000 vertices, 3 random edges each",
     "why": "A random graph like this has long paths, thousands of vertices deep. It also checks that each edge is looked at once: an iterator per vertex remembers where its list was left."},
    {"name": "A long cycle with branches", "timeout": 3000,
     "args": "([[(i + 1) % 50_000, (i * 7) % 50_000] for i in range(50_000)],)", "expr": FIN,
     "show": "a cycle of 50,000, each vertex with one extra edge",
     "why": "50,000 deep again. Every vertex is reached once, and the order shows the stack was handled exactly like the recursion."},
], trusted=FINISH)


# ---------- P4: find a cycle ----------

CYC = "(lambda c: None if c is None else is_cycle(args[0], args[1], c))(find_cycle(args[0], list(args[1])))"

def cyc_test(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CYC, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


LAYERS = "[(2 * i + a, 2 * i + 2 + b) for i in range(39) for a in range(2) for b in range(2)]"

build(S, 4, "find_cycle", [
    cyc_test("The example", "(5, [(0, 1), (1, 2), (2, 3), (3, 1), (3, 4)], )", "find_cycle(5, [(0, 1), (1, 2), (2, 3), (3, 1), (3, 4)])",
             "True: your cycle is right. The only cycle is [1, 2, 3] (or [2, 3, 1], or [3, 1, 2]: any starting point is accepted)."),
    cyc_test("No cycle", "(4, [(0, 1), (1, 2), (0, 2), (2, 3)])", "find_cycle(4, [(0, 1), (1, 2), (0, 2), (2, 3)])",
             "None. Every edge goes from a smaller number to a bigger one, so no route can come back."),
    cyc_test("Two ways to one place", "(4, [(0, 1), (0, 2), (1, 3), (2, 3)])", "find_cycle(4, [(0, 1), (0, 2), (1, 3), (2, 3)])",
             "None. 3 is reached twice, from 1 and from 2, but that is not a cycle. Only an edge back to a vertex still on the current path closes a cycle; 3 is already finished (lesson 4)."),
    cyc_test("An edge to itself", "(2, [(0, 1), (1, 1)])", "find_cycle(2, [(0, 1), (1, 1)])", "True: [1] is a cycle of one edge, from 1 to 1."),
    cyc_test("There and back", "(3, [(0, 2), (2, 0)])", "find_cycle(3, [(0, 2), (2, 0)])", "True: [0, 2]. In a directed graph, two edges in opposite directions make a cycle."),
    cyc_test("A cycle 0 cannot reach", "(5, [(0, 1), (1, 2), (3, 4), (4, 3)])", "find_cycle(5, [(0, 1), (1, 2), (3, 4), (4, 3)])",
             "True: [3, 4]. Start a search from every vertex that is not yet visited, not only from 0."),
    cyc_test("A cycle after a finished part", "(6, [(0, 1), (1, 2), (0, 3), (3, 2), (3, 4), (4, 5), (5, 3)])",
             "find_cycle(6, [(0, 1), (1, 2), (0, 3), (3, 2), (3, 4), (4, 5), (5, 3)])",
             "True: [3, 4, 5]. The search first finishes 2 and 1; reaching 2 again from 3 is not a cycle, but 5 → 3 is."),
    cyc_test("1,000 vertices", f"(1000, {rand_edges(1000, 1500, 51)})", "1,000 vertices, 1,500 random edges",
             "True: a random graph with this many edges almost surely has a cycle. Any cycle is accepted."),
    cyc_test("A path of 100,000 with an edge back", "(100_000, [(i, i + 1) for i in range(99_999)] + [(99_999, 50_000)])",
             "0 → 1 → … → 99999, then 99999 → 50000",
             "True: the cycle 50000 … 99999 has 50,000 vertices. A recursive search goes 100,000 calls deep and fails; keep your own stack (lesson 3).", 3000),
    cyc_test("40 layers of two", f"(80, {LAYERS})", "40 layers of 2 vertices, every vertex joined to both in the next layer",
             "None. There are 2⁴⁰ different paths from the top to the bottom. A search that forgets finished vertices walks all of them; with three states each vertex is finished once (lesson 4)."),
    cyc_test("100,000 vertices, no cycle", f"(100_000, [(u, v) if u < v else (v, u) for u, v in {rand_edges(100_000, 200_000, 53)}])",
             "100,000 vertices, 200,000 edges, each from a smaller number to a bigger one",
             "None: every edge goes up, so there is no cycle. Each vertex and each edge must be handled once.", 3000),
    cyc_test("100,000 vertices with cycles", f"(100_000, {rand_edges(100_000, 200_000, 57)})", "100,000 vertices, 200,000 random edges",
             "True. Any cycle is accepted; the check follows your cycle's edges.", 3000),
], trusted=CYCLE)


# ---------- P5: the smallest topological order ----------

ORD = f"(lambda o: None if o is None else {SUMMARY}(o))(smallest_order(args[0], list(args[1])))"
P = "(k * 77_777 % 100_000)"  # a scrambled order of 0 .. 99999 (77,777 shares no factor with 100,000)

build(S, 5, "smallest_order", [
    {"name": "The example", "args": "(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)])", "show": "smallest_order(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)])",
     "why": "[4, 5, 0, 2, 3, 1]. At the start only 4 and 5 have no edges coming in, and 4 is smaller. Taking 4 does not free 0 (5 → 0 is left), so 5 comes next, then 0 and 2 are both ready, and 0 is smaller."},
    {"name": "No edges", "args": "(4, [])", "show": "smallest_order(4, [])", "why": "[0, 1, 2, 3]: every order is allowed, and this one is the smallest."},
    {"name": "A cycle", "args": "(3, [(0, 1), (1, 2), (2, 0)])", "show": "smallest_order(3, [(0, 1), (1, 2), (2, 0)])",
     "why": "None. In a cycle, each vertex must come before the next one, all the way round: impossible. Kahn's method gets stuck with vertices left over (lesson 5)."},
    {"name": "A cycle in one corner", "args": "(6, [(0, 1), (1, 2), (3, 4), (4, 5), (5, 4)])", "show": "smallest_order(6, [(0, 1), (1, 2), (3, 4), (4, 5), (5, 4)])",
     "why": "None. 0, 1, 2 and 3 can be placed, but 4 and 5 wait for each other. Compare the number of vertices placed with n."},
    {"name": "An edge given twice", "args": "(2, [(1, 0), (1, 0)])", "show": "smallest_order(2, [(1, 0), (1, 0)])",
     "why": "[1, 0]. The in-degree of 0 is 2, and both copies of the edge are removed when 1 is placed."},
    {"name": "A chain", "args": "(3, [(2, 1), (1, 0)])", "show": "smallest_order(3, [(2, 1), (1, 0)])", "why": "[2, 1, 0]: the only order allowed."},
    {"name": "A small vertex freed late", "args": "(3, [(1, 0)])", "show": "smallest_order(3, [(1, 0)])",
     "why": "[1, 0, 2]. 1 and 2 are ready at the start. After 1, vertex 0 becomes ready, and 0 is smaller than 2. A plain first-in, first-out queue gives [1, 2, 0]; keep the ready vertices in a heap (HEAP)."},
    {"name": "Many ready at once", "args": "(8, [(7, 0), (6, 1), (5, 2), (4, 3), (0, 3)])", "show": "smallest_order(8, [(7, 0), (6, 1), (5, 2), (4, 3), (0, 3)])",
     "why": "[4, 5, 2, 6, 1, 7, 0, 3]. At every step, take the smallest vertex that has no edges left coming in."},
    {"name": "A chain of 100,000", "timeout": 3000, "args": "(100_000, [(i + 1, i) for i in range(99_999)])", "expr": ORD,
     "show": "99999 → 99998 → … → 0",
     "why": "[how many, first five, last five, a check number]. Only one vertex is ready at a time, so looking through all n vertices for the smallest ready one at every step costs n² = 10¹⁰ steps. Track in-degrees and keep a heap of ready vertices: O((V + E) log V)."},
    {"name": "100,000 vertices, 200,000 edges", "timeout": 3000,
     "args": f"(100_000, [(i * 77_777 % 100_000, j * 77_777 % 100_000) for k in range(200_000) {mix('k', 61)} for i in [(x >> 8) % 99_990] for j in [i + 1 + (x >> 40) % 9]])",
     "expr": ORD, "show": "100,000 vertices; each edge goes forward in a scrambled order",
     "why": "[how many, first five, last five, a check number]. The graph has no cycle, because every edge goes forward in one hidden order. Many vertices are ready at once, and the heap picks the smallest each time."},
    {"name": "The same, with one edge back", "timeout": 3000,
     "args": f"(100_000, [(i * 77_777 % 100_000, j * 77_777 % 100_000) for k in range(200_000) {mix('k', 61)} for i in [(x >> 8) % 99_990] for j in [i + 1 + (x >> 40) % 9]] + [(i * 77_777 % 100_000, (i + 1) * 77_777 % 100_000) for i in range(5_000, 5_010)] + [(5_010 * 77_777 % 100_000, 5_000 * 77_777 % 100_000)])",
     "expr": ORD, "show": "the graph above, plus a run of 10 edges forward in the hidden order and one edge back to its start",
     "why": "None: the extra edges close a cycle of 11 vertices, so no order is possible, even though most vertices can still be placed."},
], trusted=SMALLEST)


# ---------- P6: two teams, or an odd cycle ----------

TEAM = "teams_check(args[0], args[1], two_teams(args[0], list(args[1])))"

def team_test(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": TEAM, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 6, "two_teams", [
    team_test("The example", "(5, [(0, 1), (1, 2), (2, 3), (3, 0), (3, 4)])", "two_teams(5, [(0, 1), (1, 2), (2, 3), (3, 0), (3, 4)])",
              "'two teams': your answer was checked. For example (True, [0, 1, 0, 1, 0]): every edge joins a 0 to a 1."),
    team_test("A triangle", "(3, [(0, 1), (1, 2), (2, 0)])", "two_teams(3, [(0, 1), (1, 2), (2, 0)])",
              "'odd cycle': (False, [0, 1, 2]) in any order round the triangle. Going round, the teams must change 3 times and end where they started: impossible."),
    team_test("A ring of 5", "(5, [(i, (i + 1) % 5) for i in range(5)])", "a ring 0–1–2–3–4–0",
              "'odd cycle': the whole ring, 5 vertices."),
    team_test("A ring of 6", "(6, [(i, (i + 1) % 6) for i in range(6)])", "a ring 0–1–…–5–0", "'two teams': even and odd vertices."),
    team_test("No edges", "(3, [])", "two_teams(3, [])", "'two teams': any split works, for example [0, 0, 0]."),
    team_test("Two parts", "(7, [(0, 1), (1, 2), (3, 4), (4, 5), (5, 3), (5, 6)])", "two_teams(7, [(0, 1), (1, 2), (3, 4), (4, 5), (5, 3), (5, 6)])",
              "'odd cycle': [3, 4, 5]. The part with 0 splits into two teams, but the triangle in the other part does not. Start a search from every vertex not yet given a team."),
    team_test("An edge given twice", "(3, [(0, 1), (1, 0), (1, 2), (1, 2)])", "two_teams(3, [(0, 1), (1, 0), (1, 2), (1, 2)])",
              "'two teams': [0, 1, 0]. A repeated edge is not a cycle of odd length."),
    team_test("The odd cycle is far away", "(12, [(i, i + 1) for i in range(8)] + [(8, 9), (9, 10), (10, 11), (11, 8), (9, 11)])",
              "a path 0–…–8, then a square 8–9–10–11 with a cross edge 9–11",
              "'odd cycle': [9, 10, 11] or [8, 9, 11]. The answer must be a real cycle: only the vertices where the two routes meet, not the path that led there."),
    team_test("A ring of 100,001", "(100_001, [(i, (i + 1) % 100_001) for i in range(100_001)])", "a ring of 100,001 vertices",
              "'odd cycle': the whole ring. A recursive search goes about 100,000 calls deep and fails. A breadth-first search finds the clash halfway round; walk back from both ends to where the two routes meet (lesson 6).", 3000),
    team_test("A path of 100,000", "(100_000, [(i, i + 1) for i in range(99_999)])", "a path 0–1–…–99999",
              "'two teams': even and odd places. Again too deep for recursion.", 3000),
    team_test("170,000 edges across", f"(100_000, [(2 * u, 2 * v + 1) for u, v in {rand_edges(50_000, 120_000, 71)}] + [(2 * u, 2 * u + 1) for u in range(50_000)])",
              "100,000 vertices; every edge joins an even vertex to an odd one",
              "'two teams'. The graph is one big part, and your teams are checked edge by edge.", 3000),
    team_test("One edge spoils it", f"(100_000, [(2 * u, 2 * v + 1) for u, v in {rand_edges(50_000, 120_000, 71)}] + [(2 * u, 2 * u + 1) for u in range(50_000)] + [(10, 99_998)])",
              "the graph above, plus one edge between two even vertices",
              "'odd cycle'. One edge inside a team makes an odd cycle through it. The check follows your cycle edge by edge.", 3000),
], trusted=TEAMS)


# ---------- P7: through the walls ----------

def maze(rows, cols, pct, seed):
    return (f"[''.join('.' if (r, c) in ((0, 0), ({rows - 1}, {cols - 1})) or {rnd(f'r * {cols} + c', 100, seed)} >= {pct} else '#' "
            f"for c in range({cols})) for r in range({rows})]")


build(S, 7, "fewest_moves", [
    {"name": "The example", "args": "(['..#.', '#.#.', '..#.', '.##.'], 1)", "show": "fewest_moves(['..#.', '#.#.', '..#.', '.##.'], 1)",
     "why": "6: right, down, down, then through the one wall in the bottom row, then right, right... any route of 6 moves that passes through at most 1 wall."},
    {"name": "No walls to break", "args": "(['..#.', '#.#.', '..#.', '.##.'], 0)", "show": "fewest_moves(['..#.', '#.#.', '..#.', '.##.'], 0)",
     "why": "-1. With k = 0 this is a plain maze, and the right-hand column cannot be reached."},
    {"name": "One square", "args": "(['.'], 0)", "show": "fewest_moves(['.'], 0)", "why": "0: the start is the end."},
    {"name": "A row of walls", "args": "(['.#.#.'], 2)", "show": "fewest_moves(['.#.#.'], 2)", "why": "4: straight along the row, through both walls."},
    {"name": "Not enough breaks", "args": "(['.#.#.'], 1)", "show": "fewest_moves(['.#.#.'], 1)", "why": "-1: there are 2 walls in the way and no way round."},
    {"name": "One visit per square is not enough", "args": "(['..#', '#.#', '.#.'], 1)", "show": "fewest_moves(['..#', '#.#', '.#.'], 1)",
     "why": "4: right, down, down through the wall, right. The middle square is first reached through the wall on the left, with the one break used up. The free way reaches it at the same time with the break unused, and only that visit can go on. Keep a visit per (square, walls used), not per square (lesson 7)."},
    {"name": "A wall saves many moves", "args": "(['.....', '####.', '.....', '.####', '.....'], 1)", "show": "fewest_moves(['.....', '####.', '.....', '.####', '.....'], 1)",
     "why": "8: through one wall of the snake. Without breaking, the way round takes 16 moves. Using the fewest walls is not the goal: fewest moves is."},
    {"name": "Breaks to spare", "args": "(['.##', '###', '##.'], 5)", "show": "fewest_moves(['.##', '###', '##.'], 5)", "why": "4: three walls in the way, with breaks to spare."},
    {"name": "40 × 40", "args": f"({maze(40, 40, 35, 3)}, 2)", "show": "a 40 × 40 grid, about 35% walls, k = 2",
     "why": "Any search that keeps one visit per (square, walls used) passes."},
    {"name": "200 × 200, k = 0", "timeout": 3000, "args": f"({maze(200, 200, 30, 5)}, 0)", "show": "a 200 × 200 grid, about 30% walls, k = 0",
     "why": "A plain maze: 40,000 squares. Breadth-first search reaches each square once."},
    {"name": "200 × 200, k = 3", "timeout": 4000, "args": f"({maze(200, 200, 40, 9)}, 3)", "show": "a 200 × 200 grid, about 40% walls, k = 3",
     "why": "584. With k = 0 or 1 there is no way through; with 3 breaks there is, but it winds. Up to 160,000 states (square, walls used), each reached at most once: O(R · C · (k + 1))."},
    {"name": "Walls everywhere", "timeout": 4000, "args": "(['.' + '#' * 199] + ['#' * 200] * 198 + ['#' * 199 + '.'], 400)",
     "show": "200 × 200, every square a wall except the corners, k = 400",
     "why": "398: straight across and down, breaking 397 walls. A depth-first search that tries every route never ends here."},
], trusted=MOVES)
