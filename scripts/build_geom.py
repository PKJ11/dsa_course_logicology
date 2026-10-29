import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_geom import P1, P2, P3, P4

S = "geom"
A = 6364136223846793005
B = 3935559000370003845
M = 1_000_000_007


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


# ---------- P1: whole-number points inside ----------

SQ = "[(0, 0), (4, 0), (4, 4), (0, 4)]"
build(S, 1, "inside_points", [
    {"name": "A square", "args": f"({SQ},)", "show": f"inside_points({SQ})",
     "why": "9: the points (1..3, 1..3). Twice the area is 32, and 16 whole-number points lie on the edges: (32 − 16 + 2) / 2 = 9."},
    {"name": "Clockwise", "args": "([(0, 4), (4, 4), (4, 0), (0, 0)],)", "show": "inside_points([(0, 4), (4, 4), (4, 0), (0, 0)])",
     "why": "9 again. Going round the other way makes the shoelace sum negative: take its absolute value."},
    {"name": "A triangle", "args": "([(0, 0), (5, 0), (0, 5)],)", "show": "inside_points([(0, 0), (5, 0), (0, 5)])",
     "why": "6. The slanted edge from (5, 0) to (0, 5) passes through 6 whole-number points, counting both ends. Each edge adds gcd(|dx|, |dy|) to the count of points on the boundary."},
    {"name": "Slanted edges", "args": "([(0, 0), (3, 1), (1, 3)],)", "show": "inside_points([(0, 0), (3, 1), (1, 3)])",
     "why": "3. Twice the area is 8. The edges hold gcd(3, 1) + gcd(2, 2) + gcd(1, 3) = 4 points (counting each corner once), so (8 − 4 + 2) / 2 = 3."},
    {"name": "Too thin", "args": "([(0, 0), (1, 0), (0, 1)],)", "show": "inside_points([(0, 0), (1, 0), (0, 1)])",
     "why": "0. The smallest triangle holds no point inside."},
    {"name": "Negative coordinates", "args": "([(-3, -2), (1, -2), (1, 2), (-3, 2)],)", "show": "inside_points([(-3, -2), (1, -2), (1, 2), (-3, 2)])",
     "why": "9: the square of the first test, moved. Nothing depends on where the polygon is."},
    {"name": "A corner on a straight edge", "args": "([(0, 0), (2, 0), (4, 0), (4, 4), (0, 4)],)",
     "show": "inside_points([(0, 0), (2, 0), (4, 0), (4, 4), (0, 4)])",
     "why": "9. The corner (2, 0) lies on a straight edge; the edge counts are still right, because each edge adds its gcd."},
    {"name": "An L shape", "args": "([(0, 0), (6, 0), (6, 2), (2, 2), (2, 6), (0, 6)],)",
     "show": "inside_points([(0, 0), (6, 0), (6, 2), (2, 2), (2, 6), (0, 6)])",
     "why": "9. The shoelace formula and Pick's theorem work for any simple polygon, not only convex ones."},
    {"name": "A huge triangle", "args": "([(0, 0), (10 ** 9, 0), (0, 10 ** 9)],)", "show": "inside_points([(0, 0), (10**9, 0), (0, 10**9)])",
     "why": "499,999,998,500,000,001. Trying every point of the box is impossible here, and a float area loses the last digits (it has only about 16)."},
    {"name": "100,000 corners", "timeout": 3000,
     "args": "([(k, k * k) for k in range(100_000)] + [(0, 99_999 ** 2)],)",
     "show": "the corners (k, k²) for k = 0 .. 99999, then (0, 99999²)",
     "why": "One pass over the corners is enough: O(n)."},
], P1)

# ---------- P2: do two pieces meet? ----------

def t2(name, a, b, c, d, why):
    return {"name": name, "args": f"({a}, {b}, {c}, {d})", "show": f"meet({a}, {b}, {c}, {d})", "why": why}


build(S, 2, "meet", [
    t2("A crossing", (0, 0), (4, 4), (0, 4), (4, 0), "1: they cross at (2, 2). C and D are on opposite sides of AB, and A and B on opposite sides of CD."),
    t2("Apart", (0, 0), (1, 1), (3, 0), (4, 3), "0. C and D are on the same side of AB."),
    t2("The lines cross, the pieces do not", (0, 0), (1, 1), (3, 0), (2, 1),
       "0. The two lines meet at (1.5, 1.5), past the end of both pieces. A and B are on the same side of CD."),
    t2("Parallel", (0, 0), (4, 0), (0, 1), (4, 1), "0: the pieces are parallel, 1 apart. C and D are on the same side of AB."),
    t2("Touching ends", (0, 0), (2, 2), (2, 2), (4, 0), "1: they share the end (2, 2). An orientation of 0 needs the extra check that the point lies on the other piece."),
    t2("An end on the middle", (0, 0), (4, 0), (2, 0), (2, 3), "1: the piece CD stands on AB at (2, 0)."),
    t2("Almost touching", (0, 0), (4, 0), (2, 1), (2, 3), "0. C is 1 above AB, so its orientation is not 0, and the piece CD does not reach down to AB."),
    t2("On one line, apart", (0, 0), (1, 1), (2, 2), (3, 3), "0. All four orientations are 0, but the pieces do not overlap. An answer that says 'all on one line, so they meet' fails here."),
    t2("On one line, end to end", (0, 0), (2, 2), (2, 2), (5, 5), "1: only the point (2, 2) is shared."),
    t2("On one line, overlapping", (0, 0), (3, 3), (1, 1), (5, 5), "2: they share the whole piece from (1, 1) to (3, 3)."),
    t2("One inside the other", (0, 0), (6, 0), (2, 0), (3, 0), "2: the piece from (2, 0) to (3, 0) lies inside the other, so they share all of it."),
    t2("Upright and overlapping", (2, 0), (2, 5), (2, 3), (2, 8), "2. On an upright line all x are equal, so compare the y values."),
    t2("Upright and apart", (2, 0), (2, 1), (2, 3), (2, 8), "0. Comparing only the x values would say they overlap."),
    t2("A single point on a piece", (1, 1), (1, 1), (0, 0), (2, 2), "1. A piece may be a single point (both ends equal)."),
    t2("Two single points", (1, 1), (1, 1), (1, 1), (1, 1), "1."),
    t2("A point off the line", (1, 2), (1, 2), (0, 0), (2, 3), "0: the single point (1, 2) is not on the line through (0, 0) and (2, 3): its cross product is 2 × 2 − 3 × 1 = 1, not 0."),
    t2("Far from floats", (0, 0), (10 ** 17, 10 ** 17 + 1), (10 ** 17 - 1, 10 ** 17), (10 ** 17 - 1, 10 ** 17),
       "0. The point is 1 part in 10³⁴ off the line: its cross product is exactly 1. With floats both products round to 10³⁴ and the point seems to lie on the piece. Python's whole numbers are exact."),
], P2)

# ---------- P3: convex hull ----------

HSUM = f"(lambda r: [len(r), r[:3], r[-3:], sum(x * 31 + y for x, y in r) % {M}])(hull(list(args[0])))"


def t3(name, pts, why, **kw):
    return {"name": name, "args": f"({pts},)", "show": f"hull({pts})", "why": why, **kw}


build(S, 3, "hull", [
    t3("A square and a point inside", [(0, 0), (2, 0), (2, 2), (0, 2), (1, 1)], "[(0, 0), (2, 0), (2, 2), (0, 2)]: counterclockwise, from the lowest point."),
    t3("Points on an edge", [(0, 0), (1, 0), (2, 0), (2, 2), (0, 2), (1, 2)],
       "[(0, 0), (2, 0), (2, 2), (0, 2)]. (1, 0) and (1, 2) lie on edges, not at corners, so they are left out: pop when the cross product is ≤ 0, not only < 0."),
    t3("Repeated points", [(1, 1), (0, 0), (3, 0), (0, 0), (1, 1), (3, 0), (0, 3)], "[(0, 0), (3, 0), (0, 3)]. Each corner once."),
    t3("The lowest, then the leftmost", [(3, 0), (5, 2), (0, 1), (1, 0), (2, 4)],
       "[(1, 0), (3, 0), (5, 2), (2, 4), (0, 1)]. Two points have the lowest y, 0; the answer starts at the left one, (1, 0)."),
    t3("All on one line", [(2, 2), (0, 0), (5, 5), (3, 3)], "[(0, 0), (5, 5)]: only the two ends are corners."),
    t3("One upright line", [(4, 1), (4, 9), (4, 5)], "[(4, 1), (4, 9)]."),
    t3("One point", [(7, 7), (7, 7)], "[(7, 7)]."),
    t3("Two points", [(5, 1), (2, 3)], "[(5, 1), (2, 3)]: the lower one first."),
    t3("Negative coordinates", [(-5, -5), (5, -5), (0, 5), (0, 0), (-1, -4)], "[(-5, -5), (5, -5), (0, 5)]."),
    t3("A triangle full of points", [(x, y) for x in range(5) for y in range(5) if x + y <= 4],
       "[(0, 0), (4, 0), (0, 4)]: many points inside and on the edges, three corners."),
    {"name": "100,000 points, all corners", "timeout": 5000,
     "args": f"([(x, x * x) for k in range(100_000) for x in [(k * 7_919) % 100_000 - 50_000]],)",
     "expr": HSUM, "show": "the points (x, x²) for x = −50000 .. 49999, in a scrambled order",
     "why": "[how many, first three, last three, a check number]. Every point is a corner. Gift wrapping costs O(n · h), about 10 billion steps here; the monotone chain is O(n log n)."},
    {"name": "200,000 random points", "timeout": 5000,
     "args": f"([((x >> 8) % 1_000_000_000, (x >> 34) % 1_000_000_000) for k in range(200_000) {mix('k', 5)}],)",
     "expr": HSUM, "show": "200,000 random points in a square of side 10⁹",
     "why": "Few corners, many points. Sorting dominates: O(n log n)."},
], P3)

# ---------- P4: any two pieces meet? ----------

CSUM = "crossing_check(args[0], any_crossing(list(args[0])))"


def bands(n, seed, extra=""):
    """n slanted pieces, piece k in its own band of height 10 (scrambled), long and overlapping in x: no two meet."""
    return (f"[(((x >> 40) % 1_000_000, 10 * b), ((x >> 40) % 1_000_000 + 1 + (x >> 8) % 1_000_000, 10 * b + 9)) "
            f"for k in range({n}) for b in [k * 7919 % {n}] {mix('k', seed)}]{extra}")


def t4(name, segs, why, **kw):
    return {"name": name, "args": f"({segs},)", "expr": CSUM, "show": f"any_crossing({segs})", "why": why, **kw}


build(S, 4, "any_crossing", [
    t4("An X", [((0, 0), (4, 4)), ((0, 4), (4, 0))], "'meet': return (0, 1). The test checks that the two pieces you name really share a point."),
    t4("Apart", [((0, 0), (1, 0)), ((2, 0), (3, 0))], "'none': return None."),
    t4("One piece", [((0, 0), (5, 5))], "'none'."),
    t4("Touching ends", [((0, 0), (2, 2)), ((2, 2), (4, 0))], "'meet'. Sharing only an end counts. At the same x, add new pieces before removing finished ones, so both are on the line together."),
    t4("Neighbours after a removal", [((0, 0), (10, 10)), ((0, 5), (2, 5)), ((1, 10), (10, 0))],
       "'meet': pieces 0 and 2 cross at about (5.3, 5.3). While piece 1 lies between them they are not neighbours; when piece 1 ends at x = 2, they become neighbours. Check the two new neighbours after every removal, not only after an insert."),
    t4("An upright piece", [((0, 3), (4, 3)), ((2, 0), (2, 5))], "'meet': the upright piece crosses the flat one at (2, 3)."),
    t4("Upright pieces on one line", [((1, 0), (1, 2)), ((1, 3), (1, 5))], "'none'. Same x, but a gap from y = 2 to y = 3."),
    t4("Upright pieces that touch", [((1, 0), (1, 3)), ((1, 3), (1, 5))], "'meet' at (1, 3)."),
    t4("A shared start", [((0, 0), (5, 1)), ((0, 0), (5, -1))], "'meet' at (0, 0)."),
    t4("Stacked, no crossing", [((0, 0), (6, 2)), ((1, 3), (7, 5)), ((2, 6), (5, 7)), ((3, 2), (4, 2))],
       "'none'. Four pieces that overlap in x; none of them meet."),
    t4("Overlapping on one line", [((0, 0), (4, 2)), ((2, 1), (6, 3)), ((10, 0), (11, 0))], "'meet': pieces 0 and 1 share the piece from (2, 1) to (4, 2)."),
    {"name": "20,000 pieces, none meet", "timeout": 4000, "args": f"({bands(20_000, 1)},)", "expr": CSUM,
     "show": "20,000 long slanted pieces in separate bands",
     "why": "'none'. Checking every pair is 200 million pair checks. The sweep keeps the pieces that cross the line in order and checks only neighbours: O(n log n) comparisons (plus list moves)."},
    {"name": "A crossing at the far end", "timeout": 4000,
     "args": f"({bands(20_000, 2, ' + [((3_000_000, 5), (3_000_010, 15)), ((3_000_000, 15), (3_000_010, 5))]')},)", "expr": CSUM,
     "show": "the same 20,000 pieces, then two that cross, far to the right",
     "why": "'meet': the last two pieces (20000 and 20001). The sweep reaches them only at the end."},
], P4)
