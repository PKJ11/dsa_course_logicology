// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from math import gcd

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
`;

export const notes = [
  "The shoelace formula (lesson 1) gives twice the area as a whole number. Its sign depends on the direction of the corners, so take the absolute value.",
  "An edge with steps dx and dy passes through gcd(|dx|, |dy|) + 1 whole-number points, counting both ends. Counting each corner once, the edges together hold the sum of the gcds. A corner that lies on a straight edge does not upset this: the two half-edges add up to the gcd of the whole edge.",
  "Pick's theorem, A = I + B/2 − 1, then gives I = (2A − B + 2) / 2, which is always a whole number for a polygon with whole-number corners.",
  "Everything stays a whole number. A float area would lose the last digits for coordinates near 10⁹, where 2A is about 10¹⁸. Cost: O(n).",
];
