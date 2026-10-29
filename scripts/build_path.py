import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_path import ALLPAIRS, ASTAR, CHECK, CHEAPEST, DAG, FASTEST, REVERSE, ROUTES

S = "path"
A = 6364136223846793005
B = 3935559000370003845
M = 1_000_000_007


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rand_edges(n, m, seed, lo, hi):
    """m random edges (u, v, w), u != v, lo <= w <= hi."""
    return f"[(u, v, {lo} + (x >> 50) % {hi - lo + 1}) for k in range({m}) {mix('k', seed)} for u, v in [((x >> 8) % {n}, (x >> 30) % {n})] if u != v]"


# ---------- P1: are these the shortest distances? ----------

# A planted answer for 100,000 stations: rank r (0 is the start) belongs to station P(r) = r * 77,777 % 100,000
# and has distance D(r) = 7r + r*r % 5, which rises with r. Each rank r >= 1 gets a tight line from one of the
# three ranks before it, so the tree of tight lines is tens of thousands of lines deep, and these lines are listed
# from the far end. Extra lines never make anything shorter, so D is exactly the list of shortest distances.
P = "({r} * 77_777 % 100_000)"
D = "(7 * {r} + {r} * {r} % 5)"
INV = 85713  # 77,777 * 85,713 = 1 (mod 100,000): the rank of station v is v * 85,713 % 100,000


def p(r):
    return P.format(r=r)


def dd(r):
    return D.format(r=r)


def planted(cut, seed, extra):
    """Lines for the planted network; ranks >= cut get no tight line, so they cannot be reached."""
    tree = f"[({p('q')}, {p('r')}, {dd('r')} - {dd('q')}) for r in range({cut} - 1, 0, -1) {mix('r', seed)} for q in [r - 1 - (x >> 8) % min(r, 3)]]"
    more = (f"[({p('a')}, {p('b')}, max(0, {dd('b')} - {dd('a')}) + (x >> 50) % 20) for k in range({extra}) {mix('k', seed + 1)} "
            f"for a, b in [((x >> 8) % 100_000, (x >> 30) % 100_000)] if a != b and (b < {cut} or a >= {cut})]")
    return tree, more


def dist_list(cut, change=None):
    """The planted distances; `change` = (rank, amount) shifts one of them."""
    r = f"(v * {INV} % 100_000)"
    base = f"({dd(r)} if {r} < {cut} else None)"
    if change:
        base = f"({base} + ({change[1]} if {r} == {change[0]} else 0) if {r} < {cut} else None)"
    return f"[{base} for v in range(100_000)]"


T1, X1 = planted(100_000, 3, 50_000)
T2, X2 = planted(90_000, 5, 50_000)
CALL1 = "are_shortest(args[0], list(args[1]), args[2], list(args[3]))"

build(S, 1, "are_shortest", [
    {"name": "The example", "args": "(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, [0, 3, 1, 4, 7])",
     "show": "are_shortest(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, [0, 3, 1, 4, 7])",
     "why": "True. No line gives a shorter way to anywhere (for example 2 → 1 gives 1 + 2 = 3, which is not less than 3), and every station is reached by a chain of tight lines from 0: 0 → 2 → 1 → 3 → 4."},
    {"name": "A value too big", "args": "(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, [0, 4, 1, 5, 8])",
     "show": "the same lines, d = [0, 4, 1, 5, 8]",
     "why": "False. The line 2 → 1 takes 2 minutes, so 1 can be reached in 1 + 2 = 3, less than the claimed 4. One line that gives a shorter way is enough to say no."},
    {"name": "A value too small", "args": "(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, [0, 3, 1, 4, 6])",
     "show": "the same lines, d = [0, 3, 1, 4, 6]",
     "why": "False. No line gives a shorter way to 4, but no line explains the 6 either: the only line into 4 gives 4 + 3 = 7. Every claimed value except the start's must be made by some line, d[v] == d[u] + w."},
    {"name": "The start is not 0", "args": "(2, [(0, 1, 5)], 0, [1, 6])", "show": "are_shortest(2, [(0, 1, 5)], 0, [1, 6])",
     "why": "False. The start is 0 minutes from itself."},
    {"name": "None for a station that can be reached", "args": "(3, [(0, 1, 2), (1, 2, 2)], 0, [0, 2, None])",
     "show": "are_shortest(3, [(0, 1, 2), (1, 2, 2)], 0, [0, 2, None])",
     "why": "False. 2 can be reached in 4 minutes through 1. A finite value at the start of a line means the end of the line is reachable too."},
    {"name": "A number for a station that cannot be reached", "args": "(4, [(0, 1, 2), (2, 3, 1)], 0, [0, 2, 5, 6])",
     "show": "are_shortest(4, [(0, 1, 2), (2, 3, 1)], 0, [0, 2, 5, 6])",
     "why": "False. Nothing leads to 2, so it cannot be reached and its entry must be None. The line 2 → 3 fits the claimed values (5 + 1 = 6), but it does not start from the start."},
    {"name": "Unreachable stations marked None", "args": "(5, [(0, 1, 3), (1, 2, 0), (3, 4, 2), (4, 0, 1)], 0, [0, 3, 3, None, None])",
     "show": "are_shortest(5, [(0, 1, 3), (1, 2, 0), (3, 4, 2), (4, 0, 1)], 0, [0, 3, 3, None, None])",
     "why": "True. 3 and 4 lead to 0, but nothing leads from 0 to them. Lines that start at an unreachable station are not checked."},
    {"name": "Zero-minute lines in a loop", "args": "(4, [(0, 1, 5), (1, 2, 1), (2, 3, 0), (3, 2, 0)], 0, [0, 5, 2, 2])",
     "show": "are_shortest(4, [(0, 1, 5), (1, 2, 1), (2, 3, 0), (3, 2, 0)], 0, [0, 5, 2, 2])",
     "why": "False: 2 and 3 are really 6 minutes away. No line gives a shorter way, and each of 2 and 3 has a tight line into it, but those tight lines only go round the loop 2 → 3 → 2. Follow tight lines forward from the start, and check that they reach every station with a number (lesson 1)."},
    {"name": "Ties and zero-minute lines", "args": "(4, [(0, 1, 0), (1, 0, 0), (1, 2, 3), (0, 2, 3), (2, 3, 0)], 0, [0, 0, 3, 3])",
     "show": "are_shortest(4, [(0, 1, 0), (1, 0, 0), (1, 2, 3), (0, 2, 3), (2, 3, 0)], 0, [0, 0, 3, 3])",
     "why": "True. Two lines are tight into 2, and that is fine. A loop of zero-minute lines that does start from the start is fine too."},
    {"name": "100,000 stations, right", "timeout": 3000, "args": f"(100_000, {T1} + {X1}, 0, {dist_list(100_000)})",
     "expr": CALL1, "show": "100,000 stations, about 150,000 lines, the true distances",
     "why": "True. Each line is looked at once, and a search along tight lines visits each station once: O(V + E). Running Dijkstra's method again also works here. Repeating rounds over all lines until nothing changes is far too slow: the shortest routes are tens of thousands of lines long, and the lines are listed from the far end."},
    {"name": "100,000 stations, one value too big", "timeout": 3000, "args": f"(100_000, {T1} + {X1}, 0, {dist_list(100_000, (77_000, 3))})",
     "expr": CALL1, "show": "the same network, one value 3 minutes too big",
     "why": "False. The tight line into that station now gives a shorter way than its claimed value."},
    {"name": "100,000 stations, a tenth cannot be reached", "timeout": 3000, "args": f"(100_000, {T2} + {X2}, 0, {dist_list(90_000)})",
     "expr": CALL1, "show": "100,000 stations; 10,000 of them have no way in from the start, and their entries are None",
     "why": "True. Lines out of unreachable stations may lead anywhere; lines out of reachable stations never lead to an unreachable one."},
], trusted=CHECK)


# ---------- P2: fewest lines to reverse ----------


def toward0(n, m, seed):
    """m one-way lines between random stations; 7 in 8 point from the larger number to the smaller one, so a route
    from 0 to n - 1 needs reversals."""
    return (f"[((a, b) if (x >> 60) % 8 else (b, a)) for k in range({m}) {mix('k', seed)} "
            f"for u, v in [((x >> 8) % {n}, (x >> 30) % {n})] if u != v for a, b in [(max(u, v), min(u, v))]]")


build(S, 2, "fewest_reversals", [
    {"name": "The example", "args": "(5, [(0, 1), (2, 1), (2, 3), (4, 3)], 0, 4)", "show": "fewest_reversals(5, [(0, 1), (2, 1), (2, 3), (4, 3)], 0, 4)",
     "why": "2: go 0 → 1 along the line, 1 → 2 against it (reverse 2 → 1), 2 → 3 along, 3 → 4 against (reverse 4 → 3)."},
    {"name": "Already a route", "args": "(3, [(0, 1), (1, 2)], 0, 2)", "show": "fewest_reversals(3, [(0, 1), (1, 2)], 0, 2)", "why": "0: no line needs turning."},
    {"name": "The start is the end", "args": "(3, [(1, 0)], 2, 2)", "show": "fewest_reversals(3, [(1, 0)], 2, 2)", "why": "0."},
    {"name": "Not joined at all", "args": "(4, [(0, 1), (2, 3)], 0, 3)", "show": "fewest_reversals(4, [(0, 1), (2, 3)], 0, 3)",
     "why": "-1. Even with every line reversed, 0 and 3 are not joined."},
    {"name": "The long way is free", "args": "(4, [(1, 0), (0, 2), (2, 3), (3, 1)], 0, 1)", "show": "fewest_reversals(4, [(1, 0), (0, 2), (2, 3), (3, 1)], 0, 1)",
     "why": "0: 0 → 2 → 3 → 1 uses three lines in their own direction. Reversing 1 → 0 would cost 1. A plain breadth-first search reaches 1 first through the reversed line and keeps that. Moves that cost 0 go to the front of the deque, so they are handled before moves that cost 1 (lesson 2)."},
    {"name": "Front, not back", "args": "(6, [(1, 0), (0, 2), (2, 3), (3, 4), (4, 1), (1, 5)], 0, 5)",
     "show": "fewest_reversals(6, [(1, 0), (0, 2), (2, 3), (3, 4), (4, 1), (1, 5)], 0, 5)",
     "why": "0. If free moves are put at the back of the queue, 1 is taken out with the value 1 before the free way round reaches it. With 0-1 BFS a vertex's value can still go down after it was first reached, as in Dijkstra's method."},
    {"name": "A loop and a line given twice", "args": "(3, [(0, 0), (2, 1), (2, 1), (1, 1)], 0, 2)", "show": "fewest_reversals(3, [(0, 0), (2, 1), (2, 1), (1, 1)], 0, 2)",
     "why": "-1: 0 has only a line to itself."},
    {"name": "Every line the wrong way", "args": "(6, [(i + 1, i) for i in range(5)], 0, 5)", "show": "fewest_reversals(6, [(1, 0), (2, 1), (3, 2), (4, 3), (5, 4)], 0, 5)",
     "why": "5: every line on the only way must be reversed."},
    {"name": "1,000 stations", "args": f"(1000, {toward0(1000, 2000, 3)}, 0, 999)",
     "show": "1,000 stations, 2,000 random one-way lines, most pointing towards smaller numbers", "why": "A small random network: any correct method passes."},
    {"name": "100,000 stations, 200,000 lines", "timeout": 4000, "args": f"(100_000, {toward0(100_000, 200_000, 7)}, 0, 99_999)",
     "show": "100,000 stations, 200,000 random one-way lines, most pointing towards smaller numbers",
     "why": "Each station is taken from the deque at most twice, so 0-1 BFS is O(V + E). A heap (Dijkstra) also passes."},
    {"name": "A chain of 100,000, every line backwards", "timeout": 4000, "args": "(100_000, [(i + 1, i) for i in range(99_998, -1, -1)], 0, 99_999)",
     "show": "100,000 stations in a row, every line pointing back towards 0",
     "why": "99999. Going over all the lines again and again until nothing changes takes one pass per station here, because the lines are listed from the far end: 100,000 passes of 100,000 lines."},
    {"name": "Two halves", "timeout": 4000, "args": f"(100_000, [(2 * u, 2 * v) for u, v, w in {rand_edges(50_000, 100_000, 11, 0, 0)}] + [(2 * u + 1, 2 * v + 1) for u, v, w in {rand_edges(50_000, 100_000, 13, 0, 0)}], 0, 99_999)",
     "show": "even stations joined only to even ones, odd to odd", "why": "-1. The search visits all of 0's half and stops."},
], trusted=REVERSE)


# ---------- P3: the fastest journey ----------

FAST = "(lambda r: None if r is None else [r[0], route_cost(args[0], args[1], r[1], args[2], args[3])])(fastest(args[0], list(args[1]), args[2], args[3]))"
K = 2000


def fast_test(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": FAST, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


STALE = (f"({K + 2 + 100_000}, [(0, i, i) for i in range(1, {K + 1})] + [(i, {K + 1}, {2 * K + 1} - 2 * i) for i in range(1, {K + 1})]"
         f" + [({K + 1}, v, 10_000) for v in range({K + 2}, {K + 2 + 100_000})], 0, {K + 1 + 100_000})")

build(S, 3, "fastest", [
    fast_test("The example", "(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, 4)",
              "fastest(5, [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)], 0, 4)",
              "[7, 7]: [your time, the time of your route]. The route is 0 → 2 → 1 → 3 → 4: 1 + 2 + 1 + 3 = 7."),
    fast_test("The start is the end", "(3, [(0, 1, 2)], 1, 1)", "fastest(3, [(0, 1, 2)], 1, 1)", "[0, 0]: the answer is (0, [1])."),
    fast_test("No route", "(4, [(0, 1, 2), (2, 3, 1), (3, 0, 4)], 0, 3)", "fastest(4, [(0, 1, 2), (2, 3, 1), (3, 0, 4)], 0, 3)",
              "None. Lines are one-way: 3 leads to 0, but nothing leads from 0 to 3."),
    fast_test("More lines, less time", "(4, [(0, 3, 10), (0, 1, 3), (1, 2, 3), (2, 3, 3)], 0, 3)", "fastest(4, [(0, 3, 10), (0, 1, 3), (1, 2, 3), (2, 3, 3)], 0, 3)",
              "[9, 9]. The direct line takes 10; three lines take 9. Counting lines (breadth-first search) gives the wrong route."),
    fast_test("A line given twice", "(2, [(0, 1, 9), (0, 1, 4)], 0, 1)", "fastest(2, [(0, 1, 9), (0, 1, 4)], 0, 1)",
              "[4, 4]: the faster of the two lines between the same stations."),
    fast_test("Zero-minute lines", "(5, [(0, 1, 0), (1, 2, 0), (2, 3, 5), (0, 3, 6), (3, 4, 0)], 0, 4)",
              "fastest(5, [(0, 1, 0), (1, 2, 0), (2, 3, 5), (0, 3, 6), (3, 4, 0)], 0, 4)", "[5, 5]. Lines can take 0 minutes; Dijkstra's method is still right, because no time is negative."),
    fast_test("A value that goes down later", "(5, [(0, 1, 1), (0, 2, 7), (1, 3, 1), (3, 2, 1), (2, 4, 1)], 0, 4)",
              "fastest(5, [(0, 1, 1), (0, 2, 7), (1, 3, 1), (3, 2, 1), (2, 4, 1)], 0, 4)",
              "[4, 4]. 2 is first reached in 7 minutes, then in 3 through 1 and 3. A station's time is final only when it is taken out of the heap, not when it is first reached."),
    fast_test("1,000 stations", f"(1000, {rand_edges(1000, 5000, 3, 1, 100)}, 0, 999)", "1,000 stations, 5,000 random lines of 1 to 100 minutes",
              "Any fastest route is accepted. The check adds up the times of your route's lines."),
    fast_test("100,000 stations, 200,000 lines", f"(100_000, {rand_edges(100_000, 200_000, 5, 1, 1000)}, 0, 99_999)",
              "100,000 stations, 200,000 random lines", "Dijkstra's method with a heap: O((V + E) log V).", 4000),
    fast_test("100,000 stations, the end cannot be reached", f"(100_000, {rand_edges(99_999, 200_000, 7, 1, 1000)}, 0, 99_999)",
              "100,000 stations; no line leads to 99999",
              "None. The search settles every station it can reach first. Finding the nearest unsettled station by looking through all of them costs O(V) per station, 10¹⁰ steps here; a heap finds it in O(log V) (lesson 3).", 4000),
    fast_test("2,000 better offers for one busy station", STALE,
              "station 2001 is offered a better time 2,000 times; it has 100,000 lines out",
              "[12001, 12001]. Each better offer pushes a new entry for station 2001, so the heap holds 1,999 old entries for it. An old entry must be skipped when it comes out (its time is more than the station's best). Handling it again reads all 100,000 lines each time: 200 million steps (lesson 3).", 3000),
], trusted=FASTEST)


# ---------- P4: cheapest fares, with refunds ----------

NORM = "[('-inf' if x == float('-inf') else x) for x in cheapest(args[0], list(args[1]), args[2])]"
BIG4 = f"(lambda o: [len(o), o.count(None), o.count('-inf'), sum(x for x in o if type(x) is int) % {M}, o[:6]])({NORM})"


def ch(name, args, show, why, big=False, timeout=None):
    t = {"name": name, "args": args, "expr": BIG4 if big else NORM, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


# 1,000 stations with fares w = p[v] - p[u] + extra: no negative cycle, many negative fares (README: potentials).
POT = "((x >> 40) % 1000)"


def fares(n, m, seed):
    return (f"[(u, v, ((v * 7919) % 997) - ((u * 7919) % 997) + (x >> 52) % 30) for k in range({m}) {mix('k', seed)} "
            f"for u, v in [((x >> 8) % {n}, (x >> 30) % {n})] if u != v]")


CHAIN = "[(i, i + 1, ((i + 1) * 7919 % 997) - (i * 7919 % 997)) for i in range(998, -1, -1)]"

build(S, 4, "cheapest", [
    ch("The example", "(5, [(0, 1, 4), (0, 2, 2), (2, 1, -1), (1, 3, 3), (2, 3, 6), (3, 4, -2)], 0)",
       "cheapest(5, [(0, 1, 4), (0, 2, 2), (2, 1, -1), (1, 3, 3), (2, 3, 6), (3, 4, -2)], 0)",
       "[0, 1, 2, 4, 2]. The refund on 2 → 1 makes 0 → 2 → 1 cost 2 − 1 = 1, less than the direct 4."),
    ch("Dijkstra's method is wrong here", "(4, [(0, 1, 2), (0, 2, 3), (2, 1, -2), (1, 3, 1)], 0)", "cheapest(4, [(0, 1, 2), (0, 2, 3), (2, 1, -2), (1, 3, 1)], 0)",
       "[0, 1, 3, 2]. Dijkstra's method settles 1 at 2 (the nearest), then 3 at 3, and only then finds 0 → 2 → 1 for 1. Its answers for 1 and 3 are too big (lesson 3)."),
    ch("Stations that cannot be reached", "(4, [(0, 1, 5), (2, 3, -1), (3, 0, 1)], 0)", "cheapest(4, [(0, 1, 5), (2, 3, -1), (3, 0, 1)], 0)",
       "[0, 5, None, None]: nothing leads from 0 to 2 or 3."),
    ch("A loop of refunds", "(5, [(0, 1, 1), (1, 2, -1), (2, 1, -1), (2, 3, 4)], 0)", "cheapest(5, [(0, 1, 1), (1, 2, -1), (2, 1, -1), (2, 3, 4)], 0)",
       "[0, '-inf', '-inf', '-inf', None]. The loop 1 → 2 → 1 costs −2 each time round, so 1, 2 and everything after them can be made as cheap as you like: -math.inf (shown here as '-inf'). 4 cannot be reached at all."),
    ch("A loop of refunds that cannot be reached", "(5, [(0, 1, 3), (1, 2, 1), (3, 4, -5), (4, 3, 1), (4, 2, 0)], 0)",
       "cheapest(5, [(0, 1, 3), (1, 2, 1), (3, 4, -5), (4, 3, 1), (4, 2, 0)], 0)",
       "[0, 3, 4, None, None]. The loop 3 → 4 → 3 costs −4, but the start cannot reach it, so it changes nothing."),
    ch("A cheap way that a loop beats later", "(6, [(0, 5, -50), (0, 1, 1), (1, 2, -2), (2, 1, 1), (2, 3, 0), (3, 4, 0), (4, 5, 0)], 0)",
       "cheapest(6, [(0, 5, -50), (0, 1, 1), (1, 2, -2), (2, 1, 1), (2, 3, 0), (3, 4, 0), (4, 5, 0)], 0)",
       "[0, '-inf', '-inf', '-inf', '-inf', '-inf']. After n − 1 rounds, 5 still has −50 from the direct line, and the extra round does not lower it: the loop has not gone round often enough yet. But the loop can be used again and again, so 5 has no lowest fare either. Mark the stations that still improve in the extra round, then everything they can reach (lesson 4)."),
    ch("The start is on the loop", "(3, [(0, 1, 1), (1, 0, -3), (1, 2, 5)], 0)", "cheapest(3, [(0, 1, 1), (1, 0, -3), (1, 2, 5)], 0)",
       "['-inf', '-inf', '-inf']: even the start can be reached for less and less."),
    ch("A loop that costs exactly 0", "(4, [(0, 1, 2), (1, 2, -3), (2, 1, 3), (2, 3, 1)], 0)", "cheapest(4, [(0, 1, 2), (1, 2, -3), (2, 1, 3), (2, 3, 1)], 0)",
       "[0, 2, -1, 0]. Going round 1 → 2 → 1 costs 0, which saves nothing. Only loops that cost less than 0 make fares fall without limit."),
    ch("1,000 stations, 3,000 fares and a chain", f"(1000, {fares(900, 3000, 3)} + {CHAIN}, 0)",
       "1,000 stations, 3,000 random fares among the first 900 (many negative, no loop below 0), plus a chain 0 → 1 → … → 999 listed from the far end",
       "[how many, how many None, how many '-inf', a check number, the first six]. The chain is listed backwards, so each round moves its fares on by one station: about 1,000 rounds of 4,000 fares. Stop early when a round changes nothing.", True, 6000),
    ch("The same with a loop of refunds", f"(1000, {fares(900, 3000, 3)} + {CHAIN} + [(950, 951, -100), (951, 950, 0)], 0)",
       "the network above, plus a loop 950 → 951 → 950 on the chain that costs −100",
       "[how many, how many None, how many '-inf', a check number, the first six]. Stations 950 to 999 have no lowest fare: the loop can reach them. The loop cannot reach the others, so they keep their fares.", True, 6000),
], trusted=CHEAPEST)


# ---------- P5: a cheapest route for each asked pair ----------

# Each answer is checked, not compared with one route (README rule 11): any cheapest route passes.
CHECK5 = ("(lambda r, q, best: r if r is None else "
          "('the answer must be None or a list with one entry per question' if not isinstance(r, list) or len(r) != len(q) else "
          "[('no route' if p is None else "
          "(lambda c: 'not a route along the lines' if c is None else c)("
          "None if not isinstance(p, (list, tuple)) or not p or p[0] != i or p[-1] != j or "
          "any((a, b) not in best for a, b in zip(p, p[1:])) else sum(best[(a, b)] for a, b in zip(p, p[1:])))) "
          "for p, (i, j) in zip(r, q)]))"
          "(cheapest_routes(args[0], list(args[1]), list(args[2])), args[2], "
          "{(u, v): w for u, v, w in sorted(args[1], key=lambda t: -t[2])})")
BIG5 = (f"(lambda L: L if not isinstance(L, list) else next((x for x in L if x == 'not a route along the lines'), None) or "
        f"[len(L), L.count('no route'), sum(x for x in L if isinstance(x, int)) % {M}, L[:4]])({CHECK5})")


def ap(name, n, edges, queries, show, why, big=False, timeout=None):
    t = {"name": name, "args": f"({n}, {edges}, {queries})", "expr": BIG5 if big else CHECK5, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


def allq(n):
    return f"[(i, j) for i in range({n}) for j in range({n})]"


def pot_edges(n, m, seed):
    return (f"[(u, v, (v * 7919 % 211) - (u * 7919 % 211) + 30 + (x >> 52) % 40) for k in range({m}) {mix('k', seed)} "
            f"for u, v in [((x >> 8) % {n}, (x >> 30) % {n})] if u != v]")


# A chain 149 -> 148 -> ... -> 0 whose lines cost exactly the difference in p, so it is the cheapest way down; it
# is listed from 1 -> 0 upwards, so rounds over the lines move along it one station per round.
CHAIN5 = "[(i + 1, i, (i * 7919 % 211) - ((i + 1) * 7919 % 211)) for i in range(149)]"
Q5 = f"[((x >> 8) % 150, (x >> 30) % 150) for k in range(300) {mix('k', 9)}]"
EX = "[(0, 1, 6), (0, 3, 3), (1, 2, -3), (1, 3, 7), (2, 3, 3), (3, 0, 7)]"

build(S, 5, "cheapest_routes", [
    ap("The example", 4, EX, allq(4), f"cheapest_routes(4, {EX}, every pair (i, j))",
       "Each test reports, for each question, the cost of your route (or 'no route'). Every pair here has a route. From 1 to 0 the cheapest is 1 → 2 → 3 → 0, costing −3 + 3 + 7 = 7: it passes two stations on the way. If the loop over k is not the outer loop, the costs come out wrong (lesson 5)."),
    ap("No lines", 3, "[]", allq(3), "cheapest_routes(3, [], every pair (i, j))",
       "Each station's route to itself is just [i], costing 0; every other pair has no route, so its answer is None."),
    ap("Lines given twice, and a loop", 2, "[(0, 1, 5), (0, 1, 2), (1, 1, 4)]", allq(2), "cheapest_routes(2, [(0, 1, 5), (0, 1, 2), (1, 1, 4)], every pair)",
       "From 0 to 1 the route [0, 1] uses the cheaper line, 2. A line from a station to itself never beats staying put, so 1 to 1 is [1]."),
    ap("A refund", 3, "[(0, 1, 4), (0, 2, 5), (2, 1, -3)]", allq(3), "cheapest_routes(3, [(0, 1, 4), (0, 2, 5), (2, 1, -3)], every pair)",
       "From 0 to 1 the cheapest route is [0, 2, 1], costing 5 − 3 = 2, not the direct line (4). Dijkstra's method from every station settles 1 too early here."),
    ap("A loop below 0", 3, "[(0, 1, 1), (1, 2, -2), (2, 0, 0)]", "[(0, 2)]", "cheapest_routes(3, [(0, 1, 1), (1, 2, -2), (2, 0, 0)], [(0, 2)])",
       "None. Going round 0 → 1 → 2 → 0 costs −1, so there is no cheapest route. After the loops, some d[i][i] is below 0."),
    ap("A refund from a station to itself", 2, "[(0, 1, 3), (1, 1, -1)]", "[(0, 1)]", "cheapest_routes(2, [(0, 1, 3), (1, 1, -1)], [(0, 1)])",
       "None: a one-line loop below 0."),
    ap("A route through every station", 6, "[(5, 4, 1), (4, 3, 1), (3, 2, 1), (2, 1, 1), (1, 0, 1)]", "[(5, 0), (0, 5), (3, 1)]",
       "cheapest_routes(6, [(5, 4, 1), (4, 3, 1), (3, 2, 1), (2, 1, 1), (1, 0, 1)], [(5, 0), (0, 5), (3, 1)])",
       "[5, 4, 3, 2, 1, 0] costs 5; 0 cannot reach 5 (None); [3, 2, 1] costs 2. Following the first step of each route (nxt) one station at a time rebuilds the whole route."),
    ap("Free lines both ways", 3, "[(0, 1, 0), (1, 0, 0), (1, 2, 0), (0, 2, 5)]", allq(3), "cheapest_routes(3, [(0, 1, 0), (1, 0, 0), (1, 2, 0), (0, 2, 5)], every pair)",
       "From 0 to 2 the cheapest route is [0, 1, 2], costing 0, not the line of 5; 2 reaches nothing. A loop that costs exactly 0 (0 → 1 → 0) is allowed. A rebuild that follows 'any line that keeps the cost' can go from 1 back to 0 and round for ever; the table of first steps cannot."),
    ap("150 stations, 10,000 lines", 150, f"{pot_edges(150, 10_000, 3)} + {CHAIN5}", Q5,
       "150 stations, 10,000 random lines, many with refunds, no loop below 0, and a cheap chain from 149 down to 0; 300 asked pairs",
       "[how many answers, how many 'no route', a check number from the costs, the first four costs]. n³ = 3,375,000 steps of the inner loop. Running Bellman–Ford from every station needs many rounds here (the cheapest routes run along the chain, listed against it).", True, 5000),
    ap("150 stations, every pair joined", 150,
       f"[(u, v, (v * 7919 % 211) - (u * 7919 % 211) + 30 + (u * 31 + v * 17) % 50) for u in range(150) for v in range(150) if u != v] + {CHAIN5}", Q5,
       "150 stations, a line between every ordered pair (22,350 lines), plus the cheap chain; 300 asked pairs",
       "A dense network: Floyd–Warshall's three loops do not care how many lines there are.", True, 5000),
    ap("150 stations with one bad loop", 150, f"{pot_edges(150, 10_000, 3)} + {CHAIN5} + [(70, 71, -500), (71, 70, 0)]", Q5,
       "the network above, plus a loop 70 → 71 → 70 that costs −500; 300 asked pairs",
       "None: going round the loop again and again makes routes cheaper without end, so there is no cheapest route.", True, 5000),
], trusted=ROUTES)


# ---------- P6: routes in a DAG ----------

DAGB = f"(lambda r: [len(r[0]), r[0].count(None), sum(x for x in r[0] if x is not None) % {M}, sum(r[1]) % {M}, r[0][-3:], r[1][-3:]])(dag_routes(args[0], list(args[1]), args[2]))"
LAY = "[(2 * i + a, 2 * i + 2 + b, 1) for i in range(39) for a in range(2) for b in range(2)]"
SCR = "(k * 77_777 % 100_000)"


def dg(name, args, show, why, big=False, timeout=None):
    t = {"name": name, "args": args, "show": show, "why": why}
    if big:
        t["expr"] = DAGB
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 6, "dag_routes", [
    dg("The example", "(6, [(0, 1, 2), (0, 2, 5), (1, 2, 3), (1, 3, 4), (2, 3, -1), (2, 4, 1), (3, 5, 2), (4, 5, 3)], 0)",
       "dag_routes(6, [(0, 1, 2), (0, 2, 5), (1, 2, 3), (1, 3, 4), (2, 3, -1), (2, 4, 1), (3, 5, 2), (4, 5, 3)], 0)",
       "([0, 2, 5, 4, 6, 6], [1, 1, 2, 2, 2, 2]). Two routes reach 2 for 5 minutes: 0 → 2 and 0 → 1 → 2. Both go on to 3 (5 − 1 = 4), to 4 and to 5, so those have 2 cheapest routes too. 0 → 1 → 3 costs 6, more than 4, so it is not counted."),
    dg("Refunds", "(4, [(0, 1, 2), (0, 2, 3), (2, 1, -2), (1, 3, 1)], 0)", "dag_routes(4, [(0, 1, 2), (0, 2, 3), (2, 1, -2), (1, 3, 1)], 0)",
       "([0, 1, 3, 2], [1, 1, 1, 1]). Negative times are fine in a DAG; Dijkstra's method gets 1 and 3 wrong here."),
    dg("Stations before the start", "(5, [(3, 0, 1), (0, 1, 1), (4, 1, 1), (1, 2, 1)], 0)", "dag_routes(5, [(3, 0, 1), (0, 1, 1), (4, 1, 1), (1, 2, 1)], 0)",
       "([0, 1, 2, None, None], [1, 1, 1, 0, 0]). 3 and 4 come before 0 in the order, and no route from 0 reaches them."),
    dg("Ties count together", "(4, [(0, 1, 1), (0, 2, 1), (1, 3, 1), (2, 3, 1), (0, 3, 3)], 0)", "dag_routes(4, [(0, 1, 1), (0, 2, 1), (1, 3, 1), (2, 3, 1), (0, 3, 3)], 0)",
       "([0, 1, 1, 2], [1, 1, 1, 2]). The direct line costs 3, more than 2, so it is not counted."),
    dg("A cheaper way replaces the count", "(4, [(0, 1, 5), (0, 2, 1), (1, 3, 0), (2, 3, 1), (0, 3, 9)], 0)", "dag_routes(4, [(0, 1, 5), (0, 2, 1), (1, 3, 0), (2, 3, 1), (0, 3, 9)], 0)",
       "([0, 5, 1, 2], [1, 1, 1, 1]). When a cheaper way is found, the count starts again from that way's count; it does not add to the old one."),
    dg("A line given twice", "(2, [(0, 1, 4), (0, 1, 4)], 0)", "dag_routes(2, [(0, 1, 4), (0, 1, 4)], 0)", "([0, 4], [1, 2]): two different lines, so two routes."),
    dg("40 layers of two", f"(80, [(0, 1, 0)] + {LAY}, 0)", "40 layers of 2 stations, each joined to both stations of the next layer by lines of 1 minute",
       f"The last stations have 2³⁹ cheapest routes each, shown modulo 1,000,000,007. Listing routes one by one never ends.", True),
    dg("A chain of 100,000, listed backwards", "(100_000, [(i + 1, i, (i * 7919) % 11 - 5) for i in range(99_999)], 99_999)",
       "99999 → 99998 → … → 0 with times from −5 to 5, the lines listed from the far end (1 → 0 first)",
       "Recursion goes 100,000 calls deep and fails. Rounds over all lines until nothing changes (Bellman–Ford) need 100,000 rounds here. Put the stations in topological order once (GRPH-5) and go through them in that order.", True, 4000),
    dg("100,000 stations, 250,000 lines", f"(100_000, [({SCR.replace('k', 'i')}, {SCR.replace('k', 'j')}, (x >> 50) % 7 - 3) for k in range(150_000) {mix('k', 61)} for i in [(x >> 8) % 99_990] for j in [i + 1 + (x >> 40) % 9]] + [({SCR.replace('k', 'r')}, {SCR.replace('k', '(r + 1)')}, 3) for r in range(99_999)], 0)",
       "100,000 stations; every line goes forward in a hidden order; times from −3 to 3, plus a line of 3 minutes from each station to the next in that order",
       "Many ties, so many counts above 1. O(V + E) with Kahn's method.", True, 4000),
], trusted=DAG)


# ---------- P7: across an endless grid ----------

build(S, 7, "moves_needed", [
    {"name": "The example", "args": "((0, 0), (4, 0), [(2, -1), (2, 0), (2, 1)])", "show": "moves_needed((0, 0), (4, 0), [(2, -1), (2, 0), (2, 1)])",
     "why": "8: up two rows, across, and back down (or the same below). A wall of three squares sits in the way."},
    {"name": "The start is the goal", "args": "((5, -3), (5, -3), [])", "show": "moves_needed((5, -3), (5, -3), [])", "why": "0."},
    {"name": "No walls", "args": "((-2, 7), (3, 1), [])", "show": "moves_needed((-2, 7), (3, 1), [])", "why": "11: 5 across and 6 down. With no walls the answer is the Manhattan distance."},
    {"name": "Into a pocket", "args": "((0, 0), (6, 0), [(3, y) for y in range(-3, 4)] + [(x, 3) for x in range(0, 3)] + [(x, -3) for x in range(0, 3)])",
     "show": "a wall at x = 3 from y = −3 to 3, with arms back towards the start",
     "why": "16. The start sits in a pocket that opens away from the goal. The guess h is too low for every square inside the pocket, so A* fills the pocket before it goes round, and still finds the shortest way."},
    {"name": "A gap in a long wall", "args": "((0, 0), (10, 0), [(5, y) for y in range(-40, 41) if y != 30])",
     "show": "a wall at x = 5 from y = −40 to 40, with one gap at y = 30", "why": "70: up to the gap at y = 30, through, and back down."},
    {"name": "A guess must never be too high", "args": "((0, 0), (10, -1), [(4, -2), (4, -1)])", "show": "moves_needed((0, 0), (10, -1), [(4, -2), (4, -1)])",
     "why": "11: the wall of two squares can be passed just above it, at y = 0, for no extra moves. A guess that is sometimes too high (for example twice the Manhattan distance) rushes towards the goal, meets the wall, and goes round it the long way: 13. The guess must never be more than the true number of moves left (lesson 7)."},
    {"name": "3,000 squares in a straight line", "timeout": 3000, "args": "((0, 0), (3000, 0), [])", "show": "moves_needed((0, 0), (3000, 0), [])",
     "why": "3000. Breadth-first search (or Dijkstra's method) looks at every square closer than 3,000 moves: about 18 million squares. A* with the Manhattan distance looks at only the squares on the line (lesson 7)."},
    {"name": "Across a diagonal", "timeout": 3000, "args": "((0, 0), (1200, 1200), [])", "show": "moves_needed((0, 0), (1200, 1200), [])",
     "why": "2400. Here every square in the 1,200 × 1,200 box between start and goal has the same f = g + h = 2400. If ties are broken by the smaller g (or by the order squares were added), A* looks at all 1.44 million of them. Break ties towards the larger g, the square nearer the goal, and it walks straight there (lesson 7)."},
    {"name": "A wall of 301 squares", "timeout": 3000, "args": "((0, 0), (800, 0), [(400, y) for y in range(-150, 151)])",
     "show": "a wall at x = 400 from y = −150 to 150, goal 800 squares away", "why": "1102: round the end of the wall. A* looks at squares in front of the wall before it goes round, but far fewer than a full search."},
    {"name": "Far below zero", "timeout": 3000, "args": "((-500, -500), (-2500, -900), [(-1000, y) for y in range(-700, -300)])",
     "show": "moves_needed((-500, -500), (-2500, -900), a wall at x = −1000 from y = −700 to −301)", "why": "2400: the way round the bottom end of the wall is on the way to the goal anyway, so the answer is the Manhattan distance. Negative places work like any others."},
], trusted=ASTAR)
