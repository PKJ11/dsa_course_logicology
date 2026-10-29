import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_flow import CHECK, CUT, DINIC, MATCH

S = "flow"
A = 6364136223846793005
B = 3935559000370003845
M = 1_000_000_007


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rand_net(n, m, cmax, seed):
    """m random lines u -> v with capacities 1 .. cmax; the source is 0 and the sink 1."""
    return f"[((x >> 8) % {n}, (x >> 32) % {n}, (x >> 2) % {cmax} + 1) for k in range({m}) {mix('k', seed)}]"


def layered(L, W, cmax, seed):
    """Source 0, sink 1, then L layers of W stations; each station has 3 lines to random stations of the next layer."""
    first = f"[(0, 2 + j, {cmax * 3}) for j in range({W})]"
    mid = (f"[(2 + l * {W} + j, 2 + (l + 1) * {W} + (x >> 8) % {W}, (x >> 2) % {cmax} + 1) "
           f"for l in range({L - 1}) for j in range({W}) for r in range(3) {mix(f'(l * {W} + j) * 3 + r', seed)}]")
    last = f"[(2 + {L - 1} * {W} + j, 1, {cmax * 3}) for j in range({W})]"
    return f"{first} + {mid} + {last}", 2 + L * W


NET = "[(0, 1, 10), (0, 2, 10), (1, 2, 2), (1, 3, 4), (1, 4, 8), (2, 4, 9), (4, 3, 6), (3, 5, 10), (4, 5, 10)]"
NET_FLOW = "[10, 9, 0, 4, 6, 9, 5, 9, 10]"
DIAMOND = "[(0, 1, 1), (0, 2, 1), (1, 2, 1), (1, 3, 1), (2, 3, 1)]"

# ---------- P1: check a flow ----------

PLANT = ("(lambda E: (100_000, [e[:3] for e in E], [e[3] for e in E], 0, 99_999))("
         # 1,000 paths of 100 stations from 0 to 99999, path i carrying i % 7 + 1 on lines of capacity 9
         "[(0 if j == 0 else 1 + i * 99 + j - 1, 99_999 if j == 99 else 1 + i * 99 + j, 9, i % 7 + 1) for i in range(1_000) for j in range(100)]"
         # 1,000 loops of 3 stations among the path stations, each carrying 2 round the loop
         " + [(1 + (k * 3 + d) * 33 % 99_000, 1 + (k * 3 + (d + 1) % 3) * 33 % 99_000, 5, 2) for k in range(1_000) for d in range(3)]"
         f" + [((x >> 8) % 100_000, (x >> 32) % 100_000, (x >> 2) % 50, 0) for k in range(97_000) {mix('k', 3)}])")

PLANT_BAD = PLANT.replace("i % 7 + 1) for i in range(1_000)", "i % 7 + 1 + (i == 777 and j == 50)) for i in range(1_000)")


def p1(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 1, "flow_value", [
    p1("The example", f"(6, {NET}, {NET_FLOW}, 0, 5)", f"flow_value(6, lines, {NET_FLOW}, 0, 5)",
       "19. Every line carries between 0 and its capacity, and at stations 1 to 4 the flow in equals the flow out. 10 + 9 leave the source."),
    p1("Over capacity", f"(6, {NET}, [10, 9, 0, 4, 6, 9, 5, 9, 11], 0, 5)", f"flow_value(6, lines, [10, 9, 0, 4, 6, 9, 5, 9, 11], 0, 5)",
       "None. The last line, 4 → 5, has capacity 10 but carries 11."),
    p1("Flow lost at a station", f"(6, {NET}, [10, 9, 0, 4, 6, 9, 5, 9, 9], 0, 5)", f"flow_value(6, lines, [10, 9, 0, 4, 6, 9, 5, 9, 9], 0, 5)",
       "None. Station 4 takes in 6 + 9 = 15 but sends out 5 + 9 = 14. Every number is within its capacity, so only the conservation check catches this."),
    p1("A negative flow", "(3, [(0, 1, 5), (1, 2, 5)], [-2, -2], 0, 2)", "flow_value(3, [(0, 1, 5), (1, 2, 5)], [-2, -2], 0, 2)",
       "None. A flow is never below 0 on a line. Flow backwards would need a line the other way."),
    p1("The empty flow", f"(6, {NET}, [0] * 9, 0, 5)", "flow_value(6, lines, [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 5)",
       "0: nothing moves, and that is a valid flow."),
    p1("Flow into the source", "(3, [(0, 1, 4), (1, 0, 4), (1, 2, 4)], [3, 1, 2], 0, 2)", "flow_value(3, [(0, 1, 4), (1, 0, 4), (1, 2, 4)], [3, 1, 2], 0, 2)",
       "2. The value is the flow out of the source minus the flow into it: 3 − 1. The sink receives 2, the same number."),
    p1("A loop of flow", "(4, [(0, 3, 5), (1, 2, 3), (2, 1, 3)], [5, 3, 3], 0, 3)", "flow_value(4, [(0, 3, 5), (1, 2, 3), (2, 1, 3)], [5, 3, 3], 0, 3)",
       "5. The flow going round 1 → 2 → 1 keeps every rule; it simply adds nothing to the value."),
    p1("Repeated lines and a line to itself", "(3, [(0, 1, 2), (0, 1, 2), (1, 1, 7), (1, 2, 4)], [2, 2, 7, 4], 0, 2)",
       "flow_value(3, [(0, 1, 2), (0, 1, 2), (1, 1, 7), (1, 2, 4)], [2, 2, 7, 4], 0, 2)",
       "4. Each line is checked on its own. A line from station 1 to itself adds 7 in and 7 out."),
    p1("Wrong number of values", "(3, [(0, 1, 2), (1, 2, 2)], [1], 0, 2)", "flow_value(3, [(0, 1, 2), (1, 2, 2)], [1], 0, 2)",
       "None: the flow must give one number per line."),
    p1("100,000 stations", PLANT, "1,000 paths of flow, 1,000 loops of flow, 97,000 empty lines",
       "3997: the paths carry 1, 2, …, 7 in turn. Add up flow in and out for every station in one pass over the lines: O(V + E). Going through every line once for each station is O(V · E).", 3000),
    p1("100,000 stations, one wrong number", PLANT_BAD, "the same, with one line in the middle of a path carrying 1 more",
       "None: two stations on path 777 break conservation, and the capacity rule still holds.", 3000),
], trusted=CHECK)


# ---------- P2: the most flow (small networks) ----------

build(S, 2, "max_flow", [
    {"name": "The example", "args": f"(6, {NET}, 0, 5)", "show": f"max_flow(6, {NET}, 0, 5)",
     "why": "19. One maximum flow is the one in P1. The cut {0, 1, 2} against {3, 4, 5} has capacity 4 + 8 + 9 = 21, and {0, 1, 2, 4} against {3, 5} has 4 + 6 + 10 = 20. The least cut is 19 (lesson 4)."},
    {"name": "The diamond", "args": f"(4, {DIAMOND}, 0, 3)", "show": f"max_flow(4, {DIAMOND}, 0, 3)",
     "why": "2. If the first path is 0 → 1 → 2 → 3, no path is left in the network itself. The residual graph has the line 2 → 1 going back, so 0 → 2 → 1 → 3 sends a second unit (lesson 2)."},
    {"name": "No way through", "args": "(4, [(0, 1, 5), (2, 3, 5), (3, 2, 1)], 0, 3)", "show": "max_flow(4, [(0, 1, 5), (2, 3, 5), (3, 2, 1)], 0, 3)", "why": "0."},
    {"name": "Repeated lines", "args": "(2, [(0, 1, 3), (0, 1, 4), (1, 0, 9)], 0, 1)", "show": "max_flow(2, [(0, 1, 3), (0, 1, 4), (1, 0, 9)], 0, 1)",
     "why": "7. Two lines from 0 to 1 add up. The line back from 1 to 0 does not help."},
    {"name": "Lines both ways", "args": "(4, [(0, 1, 5), (0, 2, 5), (1, 2, 4), (2, 1, 4), (1, 3, 2), (2, 3, 8)], 0, 3)",
     "show": "max_flow(4, [(0, 1, 5), (0, 2, 5), (1, 2, 4), (2, 1, 4), (1, 3, 2), (2, 3, 8)], 0, 3)",
     "why": "10. Lines 1 → 2 and 2 → 1 are two different lines, each with its own capacity and its own back edge in the residual graph."},
    {"name": "Lines of capacity 0 and loops", "args": "(3, [(0, 1, 0), (0, 0, 5), (0, 2, 3), (2, 1, 6), (1, 1, 2)], 0, 1)",
     "show": "max_flow(3, [(0, 1, 0), (0, 0, 5), (0, 2, 3), (2, 1, 6), (1, 1, 2)], 0, 1)", "why": "3: the line 0 → 1 has capacity 0 and the loops 0 → 0 and 1 → 1 lead nowhere, so the only way is 0 → 2 → 1, which carries 3."},
    {"name": "Sink is not the last station", "args": "(5, [(3, 0, 4), (3, 4, 2), (4, 0, 3), (0, 2, 1)], 3, 0)",
     "show": "max_flow(5, [(3, 0, 4), (3, 4, 2), (4, 0, 3), (0, 2, 1)], 3, 0)", "why": "6: the source is 3 and the sink is 0."},
    {"name": "A path that blocks another", "args": "(7, [(2, 5, 2), (5, 4, 1), (3, 6, 1), (0, 4, 2), (2, 3, 1), (0, 2, 1), (5, 6, 1), (4, 3, 2)], 0, 6)",
     "show": "max_flow(7, [(2, 5, 2), (5, 4, 1), (3, 6, 1), (0, 4, 2), (2, 3, 1), (0, 2, 1), (5, 6, 1), (4, 3, 2)], 0, 6)",
     "why": "2: one train 0 → 2 → 5 → 6 and one 0 → 4 → 3 → 6. If the first path is 0 → 2 → 3 → 6, it takes the line 3 → 6, the only way on for station 4. Only the back arc 3 → 2 in the residual graph can free it."},
    {"name": "50 stations", "args": f"(50, {rand_net(50, 300, 100, 3)}, 0, 1)", "show": "50 stations, 300 random lines, capacities 1 to 100",
     "why": "Any method that finds paths in the residual graph until none is left gets the right answer here."},
], trusted=DINIC.replace("return total, [cap[2 * i + 1] for i in range(len(edges))]", "return total"))


# ---------- P3: a maximum flow, fast ----------

CHECK3 = "(lambda r: [r[0], flow_check(args[0], args[1], list(r[1]), args[2], args[3])])(flow_plan(args[0], list(args[1]), args[2], args[3]))"


def p3(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CHECK3, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


LAY, LAY_N = layered(160, 30, 10 ** 9, 9)

build(S, 3, "flow_plan", [
    p3("The example", f"(6, {NET}, 0, 5)", f"flow_plan(6, {NET}, 0, 5)",
       "[19, 19]: [the value you return, the value of the flow on your lines]. The tests check your flow line by line: capacities, conservation, and its value."),
    p3("The diamond", f"(4, {DIAMOND}, 0, 3)", f"flow_plan(4, {DIAMOND}, 0, 3)",
       "[2, 2]. The only maximum flow is [1, 1, 0, 1, 1]: the middle line ends with 0, even if your method sent a unit across it and later back."),
    p3("Nothing to send", "(3, [(1, 2, 5)], 0, 2)", "flow_plan(3, [(1, 2, 5)], 0, 2)", "[0, 0]: the flow is [0]."),
    p3("Two ways round", "(4, [(0, 1, 1000), (0, 2, 1000), (1, 2, 1), (1, 3, 1000), (2, 3, 1000)], 0, 3)",
       "flow_plan(4, [(0, 1, 1000), (0, 2, 1000), (1, 2, 1), (1, 3, 1000), (2, 3, 1000)], 0, 3)",
       "[2000, 2000]. Lesson 2's example: badly chosen paths would send 1 at a time, back and forth across the middle line, 2,000 times."),
    p3("2,000 stations, large capacities", f"(2_000, {rand_net(2_000, 10_000, 10 ** 6, 5)}, 0, 1)",
       "2,000 stations, 10,000 random lines, capacities up to 1,000,000",
       "Paths found by depth-first search are long, and their smallest capacity is usually small, so that method sends a little at a time, for hours. Shortest paths (Edmonds-Karp) need at most V · E / 2 rounds whatever the capacities.", 4000),
    p3("10,000 stations, capacities up to 10⁹", f"(10_000, {rand_net(10_000, 50_000, 10 ** 9, 7)}, 0, 1)",
       "10,000 stations, 50,000 random lines, capacities up to 1,000,000,000 (10⁹)",
       "Edmonds-Karp or Dinic. The number of rounds does not depend on the capacities.", 4000),
    p3("160 layers of 30", f"({LAY_N}, {LAY}, 0, 1)", "4,802 stations in 160 layers of 30, three lines from each station to the next layer",
       "Every path from the source to the sink is about 160 lines long. Edmonds-Karp runs one breadth-first search per path, and there are thousands of paths: about 13 seconds even in desktop Python, longer in the browser. Dinic finds all the shortest paths of one length in one phase, with one search and pointers that never go back (lesson 3).", 5000),
], trusted=DINIC.replace("def max_flow(", "def flow_plan("))


# ---------- P4: a minimum cut ----------

CHECK4 = "cut_check(args[0], args[1], min_cut(args[0], list(args[1]), args[2], args[3]), args[2], args[3])"


def p4(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CHECK4, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


build(S, 4, "min_cut", [
    p4("The example", f"(6, {NET}, 0, 5)", f"min_cut(6, {NET}, 0, 5)",
       "19: [the capacity of your cut]. The side [0, 1, 2] cuts 21 and [0, 1, 2, 4] cuts 20. The side [0, 2] cuts 0 → 1 and 2 → 4: 10 + 9 = 19, the same as the most flow. It is what the source can still reach in the residual graph after a maximum flow (lesson 4)."),
    p4("Two cuts of the same size", "(3, [(0, 1, 4), (1, 2, 4)], 0, 2)", "min_cut(3, [(0, 1, 4), (1, 2, 4)], 0, 2)",
       "4: [0] and [0, 1] both cut 4. Either is accepted."),
    p4("Nothing gets through", "(4, [(1, 2, 7), (2, 3, 7), (3, 0, 2)], 0, 3)", "min_cut(4, [(1, 2, 7), (2, 3, 7), (3, 0, 2)], 0, 3)",
       "0: [0] alone. Lines into the source side do not count."),
    p4("Lines back across the cut", "(4, [(0, 1, 3), (1, 0, 50), (1, 2, 1), (2, 1, 50), (2, 3, 3)], 0, 3)",
       "min_cut(4, [(0, 1, 3), (1, 0, 50), (1, 2, 1), (2, 1, 50), (2, 3, 3)], 0, 3)",
       "1: [0, 1]. The lines 1 → 0 and 2 → 1 have large capacities, but they go from the sink side to the source side, so they are not counted."),
    p4("The diamond", f"(4, {DIAMOND}, 0, 3)", f"min_cut(4, {DIAMOND}, 0, 3)", "2: the side [0] is cut by the two lines out of 0, capacity 1 each, the same as the most flow."),
    p4("2,000 stations", f"(2_000, {rand_net(2_000, 10_000, 10 ** 6, 11)}, 0, 1)", "2,000 stations, 10,000 random lines",
       "After a maximum flow, one search in the residual graph from the source gives the side. Trying sides one by one is out of the question: there are 2¹⁹⁹⁸ of them.", 4000),
    p4("10,000 stations", f"(10_000, {rand_net(10_000, 50_000, 10 ** 9, 13)}, 0, 1)", "10,000 stations, 50,000 random lines, capacities up to 10⁹",
       "Edmonds-Karp or Dinic, then one more search.", 4000),
], trusted=CUT)


# ---------- P5: the largest matching ----------

CHECK5 = "match_check(args[0], args[1], args[2], matching(args[0], args[1], list(args[2])))"


def p5(name, args, show, why, timeout=None):
    t = {"name": name, "args": args, "expr": CHECK5, "show": show, "why": why}
    if timeout:
        t["timeout"] = timeout
    return t


def rand_pairs(nl, nr, m, seed):
    return f"[((x >> 8) % {nl}, (x >> 32) % {nr}) for k in range({m}) {mix('k', seed)}]"


EX5 = "[(0, 0), (0, 1), (1, 0), (2, 1), (2, 2), (3, 2), (3, 3)]"

build(S, 5, "matching", [
    p5("The example", f"(4, 4, {EX5})", f"matching(4, 4, {EX5})",
       "4: [how many pairs]. Every worker gets a job: (0, 1), (1, 0), (2, 2), (3, 3). Your pairs are checked: each must be an allowed pair, and no worker or job may be used twice."),
    p5("Greedy is not enough", "(3, 3, [(0, 0), (0, 1), (1, 0), (2, 1), (2, 2)])", "matching(3, 3, [(0, 0), (0, 1), (1, 0), (2, 1), (2, 2)])",
       "3. Giving worker 0 job 0 first leaves worker 1 with nothing, unless an augmenting path moves worker 0 to job 1 (lesson 5)."),
    p5("More jobs than workers", "(2, 5, [(0, 4), (1, 4), (0, 2)])", "matching(2, 5, [(0, 4), (1, 4), (0, 2)])", "2: (0, 2) and (1, 4)."),
    p5("A worker with no jobs", "(3, 2, [(0, 0), (2, 0), (2, 1)])", "matching(3, 2, [(0, 0), (2, 0), (2, 1)])", "2: worker 1 has no jobs, so at most the other two can be matched: (0, 0) and (2, 1)."),
    p5("Repeated pairs", "(2, 2, [(0, 0), (0, 0), (1, 0), (1, 0)])", "matching(2, 2, [(0, 0), (0, 0), (1, 0), (1, 0)])",
       "1: both workers want only job 0."),
    p5("No pairs", "(3, 3, [])", "matching(3, 3, [])", "0: the answer is []."),
    p5("A long chain", "(5_000, 5_000, [(i, i + 1) for i in range(4_999)] + [(i, i) for i in range(5_000)])",
       "worker i may take job i + 1 or job i (listed in that order)",
       "5000. If each worker first takes job i + 1, the last worker finds its only job taken, and the augmenting path runs back through all 5,000 workers. A recursive search goes 5,000 calls deep: use your own stack.", 3000),
    p5("60,000 workers, 120,000 pairs", f"(60_000, 60_000, {rand_pairs(60_000, 60_000, 120_000, 3)})",
       "60,000 workers, 60,000 jobs, 120,000 random allowed pairs",
       "Augmenting paths from each free worker (lesson 5), after a quick greedy start, are fast enough here.", 4000),
    p5("30,000 workers, 90,000 pairs", f"(30_000, 30_000, {rand_pairs(30_000, 30_000, 90_000, 5)})",
       "30,000 workers, 30,000 jobs, 90,000 random allowed pairs",
       "Nearly everyone can be matched, so late augmenting paths are long and one search per free worker costs O(V · E): about 9 seconds even in desktop Python, longer in the browser. Hopcroft-Karp finds many shortest augmenting paths in each phase, and needs only about √V phases (lesson 5).", 4000),
], trusted=MATCH)
