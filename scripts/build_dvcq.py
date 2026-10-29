import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_dvcq import MAXMIN, MULT, PAIR, SELECT, SKY, SMALLER

S = "dvcq"

# Pseudo-random numbers built inside a test's args (no random module, so CPython and Pyodide agree).
def nums(n, m, mod, add=0, seed=13):
    return f"[(k * k * {m} + k * 104729 + {seed}) % {mod} + {add} for k in range({n})]"


# ---------- P1: largest and smallest with at most 3n/2 comparisons ----------

MM = "(lambda v: (lambda r: [plain(list(r)), comparisons() <= 3 * len(v) // 2])(max_min(counted(v))))(args[0])"
MM_SHOW = "[(largest, smallest), at most 3n/2 comparisons?]"
build(S, 1, "max_min", [
    {"name": "The example", "args": "([3, 7, 1, 9, 4],)", "expr": MM, "show": f"max_min([3, 7, 1, 9, 4]): {MM_SHOW}",
     "why": "[[9, 1], True]: 5 values allow 7 comparisons. Pairs: start with 3 as both, then (7, 1) and (9, 4) cost 3 each, 6 in all."},
    {"name": "One value", "args": "([5],)", "expr": MM, "show": f"max_min([5]): {MM_SHOW}",
     "why": "[[5, 5], True]: one value is both the largest and the smallest, with no comparisons at all."},
    {"name": "Two values", "args": "([8, 2],)", "expr": MM, "show": f"max_min([8, 2]): {MM_SHOW}",
     "why": "[[8, 2], True]: one comparison decides both. Comparing each value with both the largest and the smallest so far uses too many."},
    {"name": "All equal", "args": "([4, 4, 4, 4, 4, 4],)", "expr": MM, "show": f"max_min([4, 4, 4, 4, 4, 4]): {MM_SHOW}",
     "why": "[[4, 4], True]."},
    {"name": "Negative values", "args": "([-3, -10, 0, -7],)", "expr": MM, "show": f"max_min([-3, -10, 0, -7]): {MM_SHOW}",
     "why": "[[0, -10], True]. Do not start the largest at 0 or the smallest at a big number; start from the values themselves."},
    {"name": "Six values", "args": "([6, 1, 5, 2, 4, 3],)", "expr": MM, "show": f"max_min([6, 1, 5, 2, 4, 3]): {MM_SHOW}",
     "why": "[[6, 1], True]: 9 comparisons are allowed. Pairs need 1 + 3 + 3 = 7."},
    {"name": "Falling, 100,000 values", "args": "(list(range(100_000, 0, -1)),)", "expr": MM, "timeout": 3000,
     "show": f"max_min([100000, 99999, ..., 1]): {MM_SHOW}",
     "why": "At most 150,000 comparisons. Testing each value with `if x > big: ... elif x < small:` costs 2 comparisons per value on a falling list (the first test always fails). Take the values in pairs: 3 comparisons per 2 values."},
    {"name": "Random, 100,000 values", "args": f"({nums(100_000, 7919, 1_000_003)},)", "expr": MM, "timeout": 3000,
     "show": f"max_min(100,000 values in a scattered order): {MM_SHOW}",
     "why": "At most 150,000 comparisons. Two separate scans (or max() and min()) use 199,998. Splitting into halves of any size uses about 165,000 here: a part with an odd number of values wastes comparisons. Use pairs, or make the left part's size even."},
    {"name": "Random, 99,999 values", "args": f"({nums(99_999, 104723, 999_983, -500_000)},)", "expr": MM, "timeout": 3000,
     "show": f"max_min(99,999 values in a scattered order): {MM_SHOW}",
     "why": "At most 149,998 comparisons. With an odd count, start with the first value as both the largest and the smallest, then take the rest in pairs."},
], trusted=MAXMIN)


# ---------- P2: the skyline ----------

BIG_SKY = ("[(l, l + (k * 31337 + 5) % 3000 + 1, (k * 104729 + 7) % 1000 + 1) for k, l in enumerate(" + nums(50_000, 7919, 1_000_000) + ")]")
NEST = "[(k, 100_000 - k, k + 1) for k in range(50_000)]"
SKY_SUM = "(lambda r: [len(r), [list(p) for p in r[:3]], [list(p) for p in r[-3:]], sum(p[0] % 1000 * p[1] for p in r) % 1_000_003])(skyline(args[0]))"
build(S, 2, "skyline", [
    {"name": "The example", "args": "([(2, 9, 10), (3, 7, 15), (5, 12, 12), (15, 20, 10), (19, 24, 8)],)",
     "show": "skyline([(2, 9, 10), (3, 7, 15), (5, 12, 12), (15, 20, 10), (19, 24, 8)])",
     "why": "Seven points. At 7 the 15-high building ends and the 12-high one (5 to 12) is the tallest left; at 12 nothing is left, so the height drops to 0 until 15."},
    {"name": "No buildings", "args": "([],)", "show": "skyline([])", "why": "[]: no buildings, no outline."},
    {"name": "One building", "args": "([(1, 5, 3)],)", "show": "skyline([(1, 5, 3)])", "why": "[(1, 3), (5, 0)]: up to 3 at its left edge, down to 0 at its right edge."},
    {"name": "Touching, same height", "args": "([(0, 2, 3), (2, 5, 3)],)", "show": "skyline([(0, 2, 3), (2, 5, 3)])",
     "why": "[(0, 3), (5, 0)]: at 2 the height stays 3, so there is no point there. Never output two neighbouring points with the same height."},
    {"name": "Touching, different heights", "args": "([(0, 2, 3), (2, 5, 4)],)", "show": "skyline([(0, 2, 3), (2, 5, 4)])",
     "why": "[(0, 3), (2, 4), (5, 0)]: at 2 one building ends and the next starts. Output one point for x = 2, with the new height 4, not (2, 0) and then (2, 4)."},
    {"name": "One inside another", "args": "([(1, 10, 5), (3, 6, 8)],)", "show": "skyline([(1, 10, 5), (3, 6, 8)])",
     "why": "[(1, 5), (3, 8), (6, 5), (10, 0)]: when the tall building ends at 6, the height falls back to the lower building, not to 0."},
    {"name": "Same left edge", "args": "([(0, 4, 2), (0, 2, 5), (0, 3, 3)],)", "show": "skyline([(0, 4, 2), (0, 2, 5), (0, 3, 3)])",
     "why": "[(0, 5), (2, 3), (3, 2), (4, 0)]: three buildings start together, so x = 0 gets one point, with the tallest height."},
    {"name": "Same right edge", "args": "([(0, 5, 2), (3, 5, 4)],)", "show": "skyline([(0, 5, 2), (3, 5, 4)])",
     "why": "[(0, 2), (3, 4), (5, 0)]: both end at 5, so the height falls straight to 0, with one point."},
    {"name": "A hidden building", "args": "([(0, 10, 9), (2, 4, 3)],)", "show": "skyline([(0, 10, 9), (2, 4, 3)])",
     "why": "[(0, 9), (10, 0)]: the small building is hidden behind the tall one and adds no points."},
    {"name": "Not in order", "args": "([(19, 24, 8), (5, 12, 12), (2, 9, 10), (15, 20, 10), (3, 7, 15)],)",
     "show": "skyline([(19, 24, 8), (5, 12, 12), (2, 9, 10), (15, 20, 10), (3, 7, 15)])",
     "why": "The same seven points as the example: the buildings may come in any order, and the outline is still sorted by x."},
    {"name": "50,000 scattered buildings", "args": f"({BIG_SKY},)", "expr": SKY_SUM, "timeout": 3000,
     "show": "skyline(50,000 buildings over 0 to 1,000,000): [how many points, first 3, last 3, a checksum]",
     "why": "Split the buildings, find each half's outline, and merge the two outlines in one pass: O(n log n). Checking every building at every edge is O(n²), about 5 billion steps here."},
    {"name": "50,000 nested buildings", "args": f"({NEST},)", "expr": SKY_SUM, "timeout": 3000,
     "show": "skyline([(0, 100000, 1), (1, 99999, 2), ..., (49999, 50001, 50000)]): [how many points, first 3, last 3, a checksum]",
     "why": "Each building sits inside the one before and is 1 taller, so the outline goes up 50,000 times and down 50,000 times: 100,000 points. The merge must keep both current heights as it walks."},
], trusted=SKY)


# ---------- P3: smaller values to the right ----------

SA_SUM = "(lambda r: [len(r), sum(r), r[:5], r[-5:]])(smaller_after(args[0]))"
build(S, 3, "smaller_after", [
    {"name": "The example", "args": "([5, 2, 6, 1],)", "show": "smaller_after([5, 2, 6, 1])",
     "why": "[2, 1, 1, 0]: after 5 come 2 and 1; after 2 comes 1; after 6 comes 1; nothing comes after the last value."},
    {"name": "No values", "args": "([],)", "show": "smaller_after([])", "why": "[]."},
    {"name": "One value", "args": "([7],)", "show": "smaller_after([7])", "why": "[0]."},
    {"name": "All equal", "args": "([3, 3, 3],)", "show": "smaller_after([3, 3, 3])",
     "why": "[0, 0, 0]: equal values are not smaller. In the merge, take the left value first on a tie."},
    {"name": "Falling", "args": "([4, 3, 2, 1],)", "show": "smaller_after([4, 3, 2, 1])", "why": "[3, 2, 1, 0]: every later value is smaller."},
    {"name": "Repeats and negatives", "args": "([-1, -1, 2, -5, 2, 0],)", "show": "smaller_after([-1, -1, 2, -5, 2, 0])",
     "why": "Each count belongs to its own position, even when two positions hold the same value. Sort positions, not values, and keep the counts in a list indexed by position."},
    {"name": "Already in order, 200,000 values", "args": "(list(range(200_000)),)", "expr": SA_SUM, "timeout": 5000,
     "show": "smaller_after([0, 1, 2, ..., 199999]): [length, total, first 5, last 5]",
     "why": "All zeros. Keeping a sorted list of the values seen and using bisect plus list.insert puts every new value at the front here, so each insert shifts the whole list: O(n²). Merge sort on positions is O(n log n) on any order."},
    {"name": "120,000 scattered values", "args": f"({nums(120_000, 7919, 1_000_003)},)", "expr": SA_SUM, "timeout": 5000,
     "show": "smaller_after(120,000 values in a scattered order): [length, total, first 5, last 5]",
     "why": "The total is the number of inversions, about 3.6 billion. Checking every later value for every position is O(n²), about 7 billion steps. Count during a merge sort of positions, or with a Fenwick tree over ranks."},
], trusted=SMALLER)


# ---------- P4: the closest pair ----------

CP = ("(lambda p: (lambda r: (lambda ok: [ok, (p[r[0]][0] - p[r[1]][0]) ** 2 + (p[r[0]][1] - p[r[1]][1]) ** 2 if ok else None])"
      "(len(r) == 2 and all(isinstance(i, int) and 0 <= i < len(p) for i in r) and r[0] != r[1]))(tuple(closest_pair(list(p)))))(args[0])")
CP_SHOW = "[two different positions?, their squared distance]"
FIG = "[(1, 7), (2, 2), (3, 9), (4, 5), (6, 8), (7, 3), (8, 4), (10, 8), (12, 2), (13, 6), (15, 9), (14, 3)]"
RAND_PTS = f"list(zip({nums(40_000, 7919, 1_000_003)}, {nums(40_000, 104723, 999_983, 0, 5)}))"
LINE_PTS = f"[(0, y) for y in {nums(30_000, 7919, 50_000_017)}]"
build(S, 4, "closest_pair", [
    {"name": "The example", "args": f"({FIG},)", "expr": CP, "show": f"closest_pair(the 12 points of the lesson's figure): {CP_SHOW}",
     "why": "[True, 2]: positions 5 and 6, the points (7, 3) and (8, 4), one on each side of the middle. Each half's best pair is further apart (8 and 5), so the strip around the dividing line is needed."},
    {"name": "Two points", "args": "([(0, 0), (3, 4)],)", "expr": CP, "show": f"closest_pair([(0, 0), (3, 4)]): {CP_SHOW}",
     "why": "[True, 25]: the only pair, (0, 1) or (1, 0)."},
    {"name": "The same point twice", "args": "([(1, 1), (5, 5), (1, 1)],)", "expr": CP, "show": f"closest_pair([(1, 1), (5, 5), (1, 1)]): {CP_SHOW}",
     "why": "[True, 0]: positions 0 and 2 hold the same point, so their distance is 0. Return two different positions, not the same one twice."},
    {"name": "On a horizontal line", "args": "([(0, 0), (10, 0), (3, 0), (7, 0)],)", "expr": CP, "show": f"closest_pair([(0, 0), (10, 0), (3, 0), (7, 0)]): {CP_SHOW}",
     "why": "[True, 9]: (0, 0) and (3, 0), or (7, 0) and (10, 0). Either pair is accepted."},
    {"name": "Negative coordinates", "args": "([(-5, -5), (4, 4), (-2, -1), (3, 9), (-3, -3)],)", "expr": CP,
     "show": f"closest_pair([(-5, -5), (4, 4), (-2, -1), (3, 9), (-3, -3)]): {CP_SHOW}",
     "why": "[True, 5]: (-2, -1) and (-3, -3). Square the differences; do not take absolute values of the coordinates."},
    {"name": "Across the middle", "args": "([(0, 0), (0, 10), (0, 20), (9, 5), (10, 5), (19, 0), (19, 10), (19, 20)],)", "expr": CP,
     "show": f"closest_pair([(0, 0), (0, 10), (0, 20), (9, 5), (10, 5), (19, 0), (19, 10), (19, 20)]): {CP_SHOW}",
     "why": "[True, 1]: (9, 5) and (10, 5) end up in different halves. A method that only solves the two halves misses them."},
    {"name": "A grid and one more point", "args": "([(3 * i, 3 * j) for i in range(30) for j in range(30)] + [(44, 46)],)", "expr": CP,
     "show": f"closest_pair(a 30 × 30 grid with gaps of 3, plus (44, 46)): {CP_SHOW}",
     "why": "[True, 2]: (44, 46) is 1 across and 1 up from (45, 45). Every grid pair is 9 apart, and there are many ties among them."},
    {"name": "40,000 scattered points", "args": f"({RAND_PTS},)", "expr": CP, "timeout": 3000,
     "show": f"closest_pair(40,000 points in a 1,000,000 square): {CP_SHOW}",
     "why": "Checking all pairs is 800 million distances. Divide and conquer with the strip is O(n log n)."},
    {"name": "30,000 points on a vertical line", "args": f"({LINE_PTS},)", "expr": CP, "timeout": 3000,
     "show": f"closest_pair(30,000 points that all have x = 0): {CP_SHOW}",
     "why": "A sweep that sorts by x and compares each point with the following ones while their x is close never stops early here, because every x is the same: O(n²). The strip, sorted by y, with at most 7 comparisons per point, stays O(n log n)."},
], trusted=PAIR)


# ---------- P5: multiplying digit lists ----------

def digits(n, m, seed, first):
    return f"[{first}] + [(k * {m} + {seed}) % 10 for k in range({n - 1})]"

MU_SUM = "(lambda r: [len(r), r[:8], r[-8:], sum(r)])(multiply(*args))"
build(S, 5, "multiply", [
    {"name": "The example", "args": "([1, 3, 2, 1], [2, 2, 1, 3])", "show": "multiply([1, 3, 2, 1], [2, 2, 1, 3])",
     "why": "[2, 9, 2, 3, 3, 7, 3]: 1321 × 2213 = 2,923,373, the lesson's example."},
    {"name": "Times zero", "args": "([0], [4, 5])", "show": "multiply([0], [4, 5])",
     "why": "[0]: the product is 0, written as one digit. Remove leading zeros, but keep one digit."},
    {"name": "One digit each", "args": "([7], [8])", "show": "multiply([7], [8])", "why": "[5, 6]: 7 × 8 = 56, so the carry makes a new digit."},
    {"name": "Different lengths", "args": "([9, 9, 9, 9, 9], [9])", "show": "multiply([9, 9, 9, 9, 9], [9])",
     "why": "[8, 9, 9, 9, 9, 1]: 99,999 × 9 = 899,991. Pad the shorter number with zeros, or handle the lengths separately."},
    {"name": "Many carries", "args": "([9] * 20, [9] * 20)", "show": "multiply([9] * 20, [9] * 20)",
     "why": "(10²⁰ − 1)² = 10⁴⁰ − 2 × 10²⁰ + 1: nineteen 9s, an 8, nineteen 0s and a 1. Carries can run along many digits."},
    {"name": "Powers of ten", "args": "([1, 0, 0, 0], [1, 0, 0])", "show": "multiply([1, 0, 0, 0], [1, 0, 0])", "why": "[1, 0, 0, 0, 0, 0]: zeros at the end are kept."},
    {"name": "100 digits by 3 digits", "args": f"({digits(100, 7, 3, 8)}, [4, 0, 7])", "show": "multiply(a 100-digit number, [4, 0, 7])",
     "why": "A long number times a short one: the split must work when one half is all zeros or the lengths differ a lot."},
    {"name": "300 digits each", "args": f"({digits(300, 7919, 13, 7)}, {digits(300, 104729, 7, 3)})", "show": "multiply(two 300-digit numbers)",
     "why": "Long enough for several levels of Karatsuba above a cutoff of about 32 digits. If this fails but the small tests pass, check how the middle product (a + b)(c + d) − ac − bd is added in, at m places."},
    {"name": "4,000 digits each", "args": f"({digits(4000, 7919, 13, 7)}, {digits(4000, 104729, 7, 3)})", "expr": MU_SUM, "timeout": 4000,
     "show": "multiply(two 4,000-digit numbers): [how many digits, first 8, last 8, sum of digits]",
     "why": "A size where both methods still finish. If this fails by time, recursion is going too deep: switch to the schoolbook method below about 32 digits."},
    {"name": "12,000 digits each", "args": f"({digits(12000, 7919, 13, 7)}, {digits(12000, 104729, 7, 3)})", "expr": MU_SUM, "timeout": 8500,
     "show": "multiply(two 12,000-digit numbers): [how many digits, first 8, last 8, sum of digits]",
     "why": "The schoolbook method makes 144 million digit products here. Karatsuba with a cutoff of about 32 digits makes about 10 million, because each halving needs three products, not four."},
], trusted=MULT)


# ---------- P6: select in linear time, counting comparisons ----------

SEL = "(lambda v, k: (lambda r: [plain([r])[0], comparisons() <= 20 * len(v)])(select(NoSortList(counted(v)), k)))(*args)"
SEL_SHOW = "[the value, at most 20n comparisons?]"
GROW = ("(lambda a, b: (lambda r1, c1: (lambda r2, c2: [plain([r1, r2]), c2 / len(b) <= 1.25 * c1 / len(a)])"
        "(select(NoSortList(counted(b)), len(b) // 2), comparisons()))(select(NoSortList(counted(a)), len(a) // 2), comparisons()))(*args)")
KILLER = "(lambda n: (lambda rem, val: [[val.__setitem__(rem.pop(len(rem) // 2), t) for t in range(n)], val][1])(list(range(n)), [0] * n))(4000)"
build(S, 6, "select", [
    {"name": "The example", "args": "([7, 2, 9, 4, 1], 2)", "show": "select([7, 2, 9, 4, 1], 2)", "why": "4: sorted, the list is [1, 2, 4, 7, 9], and position 2 holds 4."},
    {"name": "The smallest", "args": "([7, 2, 9, 4, 1], 0)", "show": "select([7, 2, 9, 4, 1], 0)", "why": "1: k = 0 is the smallest."},
    {"name": "The largest", "args": "([7, 2, 9, 4, 1], 4)", "show": "select([7, 2, 9, 4, 1], 4)", "why": "9: k = n − 1 is the largest."},
    {"name": "Repeats", "args": "([5, 1, 5, 1, 5, 3], 3)", "show": "select([5, 1, 5, 1, 5, 3], 3)",
     "why": "5: sorted, [1, 1, 3, 5, 5, 5]. When k falls among the values equal to the pivot, the pivot is the answer."},
    {"name": "One value", "args": "([42], 0)", "show": "select([42], 0)", "why": "42."},
    {"name": "Negatives, 13 values", "args": "([3, -8, 0, 12, -1, 7, -8, 5, 2, 9, -3, 4, 6], 6)", "show": "select([3, -8, 0, 12, -1, 7, -8, 5, 2, 9, -3, 4, 6], 6)",
     "why": "3. With 13 values there are 3 groups, the last one with 3 values: take the middle of a short group too."},
    {"name": "20,000 in order", "args": "(list(range(20_000)), 10_000)", "expr": SEL, "timeout": 4000, "show": f"select([0, 1, ..., 19999], 10000): {SEL_SHOW}",
     "why": "10000 with at most 400,000 comparisons. The first value as pivot drops one value per round here: about 150 million comparisons."},
    {"name": "20,000 in reverse order", "args": "(list(range(20_000, 0, -1)), 10_000)", "expr": SEL, "timeout": 4000, "show": f"select([20000, 19999, ..., 1], 10000): {SEL_SHOW}",
     "why": "10001. On a reversed list both the first value and the last value are the worst possible pivots: each round drops one value."},
    {"name": "20,000 equal values", "args": "([7] * 20_000, 7_000)", "expr": SEL, "timeout": 4000, "show": f"select([7] * 20000, 7000): {SEL_SHOW}",
     "why": "7. A partition into only two sides puts every equal value on one side, so each round drops just the pivot. Keep a third group for values equal to the pivot."},
    {"name": "Built against the middle pivot", "args": f"({KILLER}, 3_999)", "expr": SEL, "timeout": 4000,
     "show": f"select(4,000 values arranged so that the middle value is always the smallest left, 3999): {SEL_SHOW}",
     "why": "3999 with at most 80,000 comparisons. The value at the middle position, used as the pivot with a partition that keeps the order, is always the smallest value left, so every round drops only one value: 8 million comparisons."},
    {"name": "20,000 scattered values", "args": f"({nums(20_000, 7919, 1_000_003)}, 5_000)", "expr": SEL, "timeout": 4000, "show": f"select(20,000 values in a scattered order, 5000): {SEL_SHOW}",
     "why": "At most 400,000 comparisons. Median of medians makes about 8 to 12 per value."},
    {"name": "Comparisons per value stay flat", "args": f"({nums(2_000, 7919, 1_000_003, 0, 3)}, {nums(64_000, 7919, 1_000_003, 0, 11)})", "expr": GROW, "timeout": 5000,
     "show": "select the medians of 2,000 and of 64,000 scattered values: [both answers, comparisons per value grow by at most 25%?]",
     "why": "A linear method makes about the same number of comparisons per value on both lists (median of medians: about 7.7 and 8.2). Sorting makes about log₂ n per value: about 10 and 15, so 50% more on the longer list. This test catches sorting a copy of the list."},
], trusted=SELECT)
