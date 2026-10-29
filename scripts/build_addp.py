import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_addp import P1, P2, P3, P4, P5, P6

S = "addp"
A = 6364136223846793005
B = 3935559000370003845


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


# ---------- P1: total distance from every station ----------

SUM1 = "(lambda r: [len(r), sum(r), max(r), min(r), r[0], r[-1]])(total_distance(*args))"


def t1(name, n, roads, why, **kw):
    return {"name": name, "args": f"({n}, {roads})", "show": f"total_distance({n}, {roads})", "why": why, **kw}


build(S, 1, "total_distance", [
    t1("One station", 1, [], "[0]: no other station, so the total is 0."),
    t1("Two stations", 2, [(0, 1, 5)], "[5, 5]: each is 5 from the other."),
    t1("A line of four", 4, [(0, 1, 1), (1, 2, 1), (2, 3, 1)],
       "[6, 4, 4, 6]: from station 0 the distances are 1, 2 and 3; from station 1 they are 1, 1 and 2."),
    t1("Lengths matter", 3, [(0, 1, 2), (1, 2, 10)],
       "[14, 12, 22]. Each road counts with its length: moving from 1 to 2 adds the road's length 10 for the 2 stations left behind and takes it off for the 1 below. A solution that counts roads instead of lengths gives [3, 2, 3]."),
    t1("A star", 5, [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 4, 1)],
       "[4, 7, 7, 7, 7]: the centre is 1 from each; a leaf is 1 from the centre and 2 from the other three leaves."),
    t1("Roads listed the other way round", 5, [(1, 0, 3), (2, 1, 1), (1, 3, 4), (4, 3, 2)],
       "[23, 14, 17, 18, 24]. Roads are not listed parent first, and station 0 is a leaf here. Build the tree by a search from one station; do not assume the first number of a road is the parent."),
    t1("A road of length 0", 3, [(0, 1, 0), (1, 2, 7)],
       "[7, 7, 14]: stations 0 and 1 are at the same place, 7 from station 2. A road of length 0 still joins two stations."),
    t1("The figure's tree, with lengths", 8,
       [(0, 1, 1), (0, 2, 1), (0, 3, 1), (1, 4, 1), (1, 5, 1), (2, 6, 1), (3, 7, 1)],
       "[11, 13, 15, 15, 19, 19, 21, 21], as in the figure of lesson 1 (A to H are 0 to 7)."),
    {"name": "A long line", "timeout": 5000, "args": "(100_000, [(k, k + 1, k % 7 + 1) for k in range(99_999)])", "expr": SUM1,
     "show": "100,000 stations in a row; road k joins k and k + 1 and is k % 7 + 1 long",
     "why": "The answer is checked as [n, sum, largest, smallest, first, last]. Station 0 is 99,999 roads from the far end: a recursive search stops at about 1,000 levels, and a search from every station is about 10¹⁰ steps. Use a BFS order and two passes."},
    {"name": "100,000 stations, random", "timeout": 5000,
     "args": f"(100_000, [((v, (x >> 8) % v, (x >> 40) % 1000 + 1) if x & 1 else ((x >> 8) % v, v, (x >> 40) % 1000 + 1)) for v in range(1, 100_000) {mix('v', 1)}])",
     "expr": SUM1,
     "show": "100,000 stations; road v joins v to a random earlier station, with a length from 1 to 1,000, written either way round",
     "why": "A search from every station costs n² = 10¹⁰ steps. Rerooting is O(n)."},
    {"name": "A broom", "timeout": 5000,
     "args": "(100_000, [(k, k + 1, 3) for k in range(49_999)] + [(49_999, k, 1) for k in range(50_000, 100_000)])",
     "expr": SUM1,
     "show": "a line of 50,000 stations with 50,000 more all joined to its far end",
     "why": "Deep (50,000 levels) and wide at once. Recursion fails here; so does anything quadratic."},
], P1)

# ---------- P2: the most parcels collected ----------


def t2(name, n, streets, value, s, why, **kw):
    return {"name": name, "args": f"({n}, {streets}, {value}, {s})", "show": f"most_collected({n}, {streets}, {value}, {s})", "why": why, **kw}


build(S, 2, "most_collected", [
    t2("Just the start", 1, [], [5], 0, "5: the van collects at its own junction."),
    t2("One street", 2, [(0, 1)], [3, 4], 0, "7: the van drives from 0 to 1."),
    t2("No way back", 2, [(0, 1)], [3, 4], 1, "4: the street is one-way, so from 1 the van cannot reach 0."),
    t2("A loop", 3, [(0, 1), (1, 2), (2, 0)], [1, 2, 3], 0, "6: the van goes round and collects every junction once."),
    t2("Into a loop and out again", 3, [(0, 1), (1, 0), (0, 2)], [0, 5, 7], 0,
       "12: go to 1, come back to 0, then go to 2. A search that never visits a junction twice finds only 7."),
    t2("Choose the better branch", 4, [(0, 1), (0, 2), (1, 3), (2, 3)], [1, 5, 2, 10], 0, "16: 0 → 1 → 3. The two branches cannot both be taken."),
    t2("Each junction counts once", 3, [(0, 1), (1, 0), (1, 2), (2, 1)], [2, 3, 4], 0,
       "9. Going round a loop again collects nothing more. A rule that adds values along a walk never stops here."),
    t2("Out of reach", 4, [(0, 1), (2, 3), (3, 0)], [1, 1, 100, 100], 0, "2: junctions 2 and 3 lead to 0, but 0 cannot reach them."),
    t2("Repeated streets and a street to itself", 3, [(0, 0), (0, 1), (0, 1), (1, 2), (1, 2)], [1, 2, 3], 0, "6. Repeats change nothing."),
    t2("Greedy goes wrong", 6, [(0, 1), (0, 2), (2, 3), (3, 4), (4, 5)], [0, 9, 3, 3, 3, 3], 0,
       "12: the long way 0 → 2 → 3 → 4 → 5 beats the single 9. Picking the richest next junction fails."),
    t2("Two loops joined", 6, [(0, 1), (1, 0), (1, 2), (2, 3), (3, 4), (4, 2), (1, 5)], [1, 1, 2, 2, 2, 50], 0,
       "52: from the first loop, the street to 5 is worth more than the second loop (6). Each loop is one group, worth its total."),
    t2("A loop with two exits", 5, [(0, 1), (1, 2), (2, 0), (2, 3), (0, 4)], [1, 1, 1, 5, 7], 1,
       "10: starting inside the loop, collect it all (3), then leave by the better exit, 4 (7)."),
    {"name": "A tangle of 30", "args": f"(30, [((x >> 8) % 30, (x >> 20) % 30) for k in range(90) {mix('k', 2)}], [(k * 37) % 11 for k in range(30)], 0)",
     "show": "30 junctions, 90 random streets", "why": "Trying every walk, or every set of visited junctions, is far too slow even here. Group the loops first."},
    {"name": "A one-way chain of 100,000", "timeout": 5000,
     "args": "(100_000, [(k, k + 1) for k in range(99_999)], [1] * 100_000, 0)",
     "show": "streets k → k + 1 for k up to 99,998, every value 1",
     "why": "100,000. The search is 100,000 levels deep: a recursive search stops at about 1,000."},
    {"name": "A ring of 100,000", "timeout": 5000,
     "args": f"(100_000, [(k, (k + 1) % 100_000) for k in range(100_000)], [(x >> 8) % 1000 for k in range(100_000) {mix('k', 3)}], 0)",
     "show": "a one-way ring of 100,000 junctions with random values",
     "why": "One group holds every junction, so the answer is the sum of all values. A recursive group search fails; so does any rule that walks the ring again and again."},
    {"name": "A chain of 30,000 loops", "timeout": 5000,
     "args": f"(90_000, [e for g in range(30_000) for e in ((3 * g, 3 * g + 1), (3 * g + 1, 3 * g + 2), (3 * g + 2, 3 * g), (3 * g + 1, min(3 * g + 3, 89_999)), (3 * g + 2, min(3 * g + 6, 89_999)))], [(x >> 8) % 100 for k in range(90_000) {mix('k', 4)}], 0)",
     "show": "30,000 loops of three junctions, each leading on to the next loop and to the one after it",
     "why": "Each loop is one group and the groups form a long DAG. Collapse the loops, then one pass over the groups in topological order."},
    {"name": "60,000 junctions, random", "timeout": 5000,
     "args": f"(60_000, [((x >> 8) % 60_000, (x >> 30) % 60_000) for k in range(120_000) {mix('k', 5)}], [(x >> 12) % 1000 for k in range(60_000) {mix('k', 6)}], 0)",
     "show": "60,000 junctions and 120,000 random one-way streets",
     "why": "One big group and many small ones. Group search, then the DAG pass: O(V + E)."},
], P2)

# ---------- P3: cutting a rail ----------


def t3(name, length, marks, why, **kw):
    return {"name": name, "args": f"({length}, {marks})", "show": f"cheapest_cuts({length}, {marks})", "why": why, **kw}


build(S, 3, "cheapest_cuts", [
    t3("No marks", 10, [], "0: nothing to cut."),
    t3("One mark", 10, [4], "10: the one cut is made on the whole rail of length 10."),
    t3("Two marks", 10, [2, 8], "18: either cut first costs 10, and the second cut is on a piece of 8."),
    t3("The order matters", 7, [1, 3, 4, 5], "16: cut at 3 first (7), then 1 on the piece 0–3 (3), then 5 on 3–7 (4), then 4 on 3–5 (2)."),
    t3("Marks out of order", 9, [5, 6, 1, 4, 2], "22. Sort the marks first: the stretches are between neighbouring marks."),
    t3("Middle first is not best", 12, [2, 4, 5, 7], "26. Always cutting the mark nearest the middle of the piece gives 27."),
    t3("Marks near the ends", 100, [1, 99], "199: whichever goes first costs 100, the second 99."),
    t3("Twelve marks", 30, [2, 3, 5, 8, 11, 13, 16, 19, 21, 24, 26, 29],
       "Trying every order of 12 cuts is 479,001,600 orders: far too slow. The table of stretches has 14 × 13 / 2 cells."),
    t3("Twenty marks", 1000, [37, 74, 150, 151, 152, 300, 333, 401, 450, 500, 512, 600, 640, 700, 777, 800, 850, 900, 950, 999],
       "Recursion without a memo solves the same stretches again and again: about 3²⁰ calls here."),
    {"name": "150 marks", "timeout": 3000,
     "args": f"(10 ** 9, sorted({{(x >> 8) % (10 ** 9 - 1) + 1 for k in range(150) {mix('k', 7)}}}))",
     "show": "150 random marks on a rail of length 10⁹",
     "why": "About 150³/6, half a million split checks: under a second. Memoised recursion is also fine: it is at most 150 calls deep."},
    {"name": "150 evenly spaced marks", "timeout": 3000,
     "args": "(151, list(range(1, 151)))", "show": "cheapest_cuts(151, [1, 2, ..., 150])",
     "why": "Many splits tie here; any of them gives the same total."},
], P3)

# ---------- P4: the fewest wagons ----------


def t4(name, w, cap, why, **kw):
    return {"name": name, "args": f"({w}, {cap})", "show": f"fewest_wagons({w}, {cap})", "why": why, **kw}


build(S, 4, "fewest_wagons", [
    t4("No parcels", [], 10, "0 wagons."),
    t4("One parcel", [5], 10, "1."),
    t4("All in one wagon", [2, 3, 4], 10, "1: 2 + 3 + 4 = 9 fits."),
    t4("Each on its own", [6, 6, 6], 10, "3: no two fit together."),
    t4("Two wagons", [2, 3, 3, 5, 6], 10, "2: for example 2 + 3 + 5 and 3 + 6."),
    t4("Largest first is not best", [6, 5, 4, 3, 3, 10, 3], 12,
       "3: 10 alone, 6 + 3 + 3 and 5 + 4 + 3. Placing the largest parcels first, each into the first wagon with room, needs 4."),
    t4("In the given order is not best", [3, 7, 3, 7], 10, "2: 3 + 7 twice. Filling wagons in the given order needs 3."),
    t4("Exactly full", [5, 5, 5, 5, 5, 5], 10, "3: a parcel that fills the wagon exactly still fits."),
    t4("Eleven parcels", [3, 8, 2, 7, 5, 5, 4, 6, 1, 9, 10], 20,
       "Trying every order of 11 parcels is about 40 million orders: too slow. The state is the set loaded so far."),
    {"name": "Sixteen parcels", "timeout": 4000,
     "args": f"([(x >> 8) % 70 + 1 for k in range(16) {mix('k', 8)}], 100)",
     "show": "16 random parcels from 1 to 70, wagons of 100",
     "why": "2¹⁶ sets × 16 parcels is about a million steps. Trying every order (16!, about 2 × 10¹³) or every split into groups by submasks (3¹⁶, about 43 million) is too slow in Python."},
    {"name": "Sixteen that fill four wagons", "timeout": 4000,
     "args": "([123, 377, 250, 250, 401, 99, 300, 200, 455, 45, 280, 220, 333, 167, 111, 389], 1000)",
     "show": "16 parcels that fill 4 wagons of 1,000 exactly",
     "why": "4. Each wagon must be filled exactly, which simple rules rarely find."},
], P4)

# ---------- P5: no digit twice in a row ----------


def t5(name, a, b, why, **kw):
    return {"name": name, "args": f"({a}, {b})", "show": f"count_no_repeat({a}, {b})", "why": why, **kw}


build(S, 5, "count_no_repeat", [
    t5("One to nine", 1, 9, "9: one digit cannot repeat."),
    t5("Zero", 0, 0, "1: the number 0 has the single digit 0."),
    t5("Up to 100", 0, 100, "91: 0 to 9 (10), then 10 to 99 without 11, 22, …, 99 (81). 100 has two zeros side by side."),
    t5("From 10 to 20", 10, 20, "10: every number but 11."),
    t5("A single bad number", 1223, 1223, "0: the 2s are neighbours."),
    t5("A single good number", 1213, 1213, "1."),
    t5("Leading zeros are not digits", 1, 1000, "819. Written as 0007, the number 7 would seem to repeat its zeros. Zeros in front of a number are not digits of it."),
    t5("Counting from a", 123, 456, "Count up to b, minus the count up to a − 1. Taking away the count up to a loses 123 itself."),
    t5("Up to 10¹⁸", 0, 10 ** 18, "Counting one by one is impossible. The answer is 1 (for 0) plus 9 + 9² + … + 9¹⁸: a k-digit number has 9 choices for each place."),
    t5("A big range", 123456789012345678, 987654321098765432, "A digit DP works on the 18 places of each end."),
    t5("A tight path that breaks early", 1100000000, 1199999999, "0: every number here starts with 11."),
    t5("From ten nines to 10¹¹", 9999999999, 10 ** 11, "9¹¹ = 31,381,059,609: both ends repeat a digit, and every number between has 11 digits."),
    {"name": "Many ranges", "args": "()", "expr": "[count_no_repeat(a, b) for a, b in [(0, 9), (5, 5), (10, 10), (11, 11), (98, 102), (1, 10 ** 6), (999, 1001), (10 ** 17, 10 ** 17 + 50)]]",
     "show": "count_no_repeat(a, b) for (0, 9), (5, 5), (10, 10), (11, 11), (98, 102), (1, 10⁶), (999, 1001), (10¹⁷, 10¹⁷ + 50)",
     "why": "Small ranges at the edges: single numbers, a range that crosses 100, and a range that starts at a power of 10."},
], P5)

# ---------- P6: the cheapest trip ----------


def t6(name, x, c, why, **kw):
    return {"name": name, "args": f"({x}, {c})", "show": f"cheapest_trip({x}, {c})", "why": why, **kw}


build(S, 6, "cheapest_trip", [
    t6("One station", [5], 10, "0: the trip is already over."),
    t6("Two stations", [0, 3], 1, "10: one run of 3, costing 3² + 1."),
    t6("Stopping helps", [0, 1, 2], 1, "4: two runs of 1 cost (1 + 1) + (1 + 1); one run of 2 costs 4 + 1 = 5."),
    t6("Stopping costs too much", [0, 1, 2], 10, "14: one run, 4 + 10. Two runs would cost 22."),
    t6("Free stops", [0, 2, 3, 7, 8], 0, "22: with c = 0, stopping everywhere is best: 4 + 1 + 16 + 1."),
    t6("Five stations", [1, 2, 3, 4, 5], 6, "20: stop at 3; each run is 2 long, costing 4 + 6."),
    t6("Far apart", [1, 1_000_000], 1_000_000, "999,999² + 1,000,000 = 999,999,000,001. The numbers grow large: Python's whole numbers hold them exactly."),
    t6("Eight stations", [1, 3, 4, 5, 10, 11, 12, 13], 5, "62: stop at 3, 5 and 10. The runs of 2, 2, 5 and 3 cost (4 + 5) + (4 + 5) + (25 + 5) + (9 + 5)."),
    {"name": "150,000 stations", "timeout": 5000,
     "args": f"([k * 5000 + (x >> 8) % 5000 for k in range(150_000) {mix('k', 9)}], 10 ** 9)",
     "expr": "cheapest_trip(*args)",
     "show": "150,000 stations at random rising positions up to 7.5 × 10⁸, c = 10⁹",
     "why": "Trying every earlier stop is about 10¹⁰ steps. Lines in a deque take O(n)."},
    {"name": "Even spacing", "timeout": 5000,
     "args": "([k * 7 for k in range(150_000)], 1000)", "expr": "cheapest_trip(*args)",
     "show": "150,000 stations 7 apart, c = 1,000",
     "why": "Evenly spaced stops make many crossing points equal. Remove a line when the new one passes under at the same place or earlier (≤), and compare with whole numbers."},
    {"name": "Long runs between stops", "timeout": 5000,
     "args": f"([k * 3 + (x >> 8) % 3 for k in range(150_000) {mix('k', 10)}], 10 ** 9)", "expr": "cheapest_trip(*args)",
     "show": "150,000 stations about 3 apart, c = 10⁹",
     "why": "Stops are expensive, so the best runs are about 31,600 long, over 10,000 stations each. Looking back only a fixed number of stations fails here."},
], P6)
