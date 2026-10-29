from solgen import write_station
from trusted_geom import P2, P3, P4

write_station("geom", 4, {
    1: ('''from math import gcd

def inside_points(poly):
    n = len(poly)
    twice_area = 0                     # the shoelace sum
    boundary = 0                       # whole-number points on the edges
    for k in range(n):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % n]     # the last edge closes the loop
        twice_area += x1 * y2 - x2 * y1
        boundary += gcd(abs(x2 - x1), abs(y2 - y1))
    twice_area = abs(twice_area)       # clockwise corners give a minus
    # Pick: A = I + B/2 - 1, so I = (2A - B + 2) / 2
    return (twice_area - boundary + 2) // 2
''', [
        "The shoelace formula (lesson 1) gives twice the area as a whole number. Its sign depends on the direction of the corners, so take the absolute value.",
        "An edge with steps dx and dy passes through gcd(|dx|, |dy|) + 1 whole-number points, counting both ends. Counting each corner once, the edges together hold the sum of the gcds. A corner that lies on a straight edge does not upset this: the two half-edges add up to the gcd of the whole edge.",
        "Pick's theorem, A = I + B/2 − 1, then gives I = (2A − B + 2) / 2, which is always a whole number for a polygon with whole-number corners.",
        "Everything stays a whole number. A float area would lose the last digits for coordinates near 10⁹, where 2A is about 10¹⁸. Cost: O(n).",
    ]),
    2: (P2.lstrip("\n"), [
        "First the cases where a piece is a single point: a point is on a piece when its orientation is 0 and it lies in the piece's box.",
        "If the four points are all on one line (both orientations against AB are 0), the pieces can overlap along a stretch. Measure them along the line, by x, or by y when the line is upright, and compare the two ranges: empty means 0, a single value means 1, longer means 2.",
        "Otherwise the pieces share at most one point. They cross properly when each piece has its two ends strictly on opposite sides of the other's line. They also meet when an end of one lies on the other (orientation 0 and inside the box): a T shape, or a shared end.",
        "Only whole-number multiplication is used, so the answer is exact even for coordinates near 10¹⁷, where floats round two different products to the same value.",
    ]),
    3: (P3.lstrip("\n"), [
        "Andrew's monotone chain (lesson 3): sort the points by x and then y (set() removes repeats), build the lower hull left to right and the upper hull right to left with a stack.",
        "A point is popped when the last two points and the new one do not turn left: cross ≤ 0. Using ≤ rather than < also removes points that lie on an edge, which the problem leaves out.",
        "lower[:-1] + upper[:-1] joins the two chains without repeating the leftmost and rightmost points. With two different points the result is just those two; with all points on one line, the walks leave only the two ends.",
        "The chain starts at the leftmost point; the problem asks to start at the lowest (then leftmost) one, so the list is rotated to start there. The order stays counterclockwise.",
        "Cost: O(n log n) for the sort, O(n) for the walks. Gift wrapping is O(n · h), and on the test where every point is a corner it is O(n²).",
    ]),
    4: (P4.lstrip("\n"), [
        "The Shamos–Hoey sweep (lesson 4). Events are the left and right ends of the pieces, sorted by x, with starts before ends at equal x, so pieces that touch at a shared end are in the list together.",
        "active lists the pieces the sweep line crosses, from the lowest up. The place of a new piece is found by binary search on its left end, comparing heights with the cross product (an upright piece by its y range). If the left end lies on a piece in the list, those two meet.",
        "After an insert the new piece is checked against its two neighbours; after a removal the two pieces that become neighbours are checked. The lesson proves that if any two pieces meet, some check finds a pair that meets.",
        "A removal finds its piece by the same binary search on the right end. active.index(i) would also work, but it costs O(n) per removal.",
        "Cost: O(n log n) comparisons, plus the list's insert and pop, which move references in C and are fast for these sizes.",
    ]),
})
