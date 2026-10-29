// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def meet(a, b, c, d):
    def cross(o, p, q):            # > 0: q is left of o -> p
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])

    def within(p, q, r):           # r lies in the box with corners p, q
        return (min(p[0], q[0]) <= r[0] <= max(p[0], q[0])
                and min(p[1], q[1]) <= r[1] <= max(p[1], q[1]))

    if a == b and c == d:          # two single points
        return 1 if a == c else 0
    if a == b:                     # a single point and a piece
        return 1 if cross(c, d, a) == 0 and within(c, d, a) else 0
    if c == d:
        return 1 if cross(a, b, c) == 0 and within(a, b, c) else 0
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if d1 == 0 and d2 == 0:        # all four points on one line
        key = (lambda p: p[0]) if a[0] != b[0] else (lambda p: p[1])
        lo = max(min(key(a), key(b)), min(key(c), key(d)))
        hi = min(max(key(a), key(b)), max(key(c), key(d)))
        if lo > hi:
            return 0
        return 1 if lo == hi else 2
    # not on one line: at most one common point
    if ((d1 > 0 and d2 < 0) or (d1 < 0 and d2 > 0)) and \\
       ((d3 > 0 and d4 < 0) or (d3 < 0 and d4 > 0)):
        return 1                   # a proper crossing
    if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or \\
       (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
        return 1                   # an end touches the other piece
    return 0
`;

export const notes = [
  "First the cases where a piece is a single point: a point is on a piece when its orientation is 0 and it lies in the piece's box.",
  "If the four points are all on one line (both orientations against AB are 0), the pieces can overlap along a stretch. Measure them along the line, by x, or by y when the line is upright, and compare the two ranges: empty means 0, a single value means 1, longer means 2.",
  "Otherwise the pieces share at most one point. They cross properly when each piece has its two ends strictly on opposite sides of the other's line. They also meet when an end of one lies on the other (orientation 0 and inside the box): a T shape, or a shared end.",
  "Only whole-number multiplication is used, so the answer is exact even for coordinates near 10¹⁷, where floats round two different products to the same value.",
];
