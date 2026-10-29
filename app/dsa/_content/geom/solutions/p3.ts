// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        out = pts
    else:
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        lower = []
        for p in pts:
            while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
                lower.pop()
            lower.append(p)
        upper = []
        for p in reversed(pts):
            while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
                upper.pop()
            upper.append(p)
        out = lower[:-1] + upper[:-1]
    if not out:
        return []
    k = min(range(len(out)), key=lambda i: (out[i][1], out[i][0]))
    return out[k:] + out[:k]
`;

export const notes = [
  "Andrew's monotone chain (lesson 3): sort the points by x and then y (set() removes repeats), build the lower hull left to right and the upper hull right to left with a stack.",
  "A point is popped when the last two points and the new one do not turn left: cross ≤ 0. Using ≤ rather than < also removes points that lie on an edge, which the problem leaves out.",
  "lower[:-1] + upper[:-1] joins the two chains without repeating the leftmost and rightmost points. With two different points the result is just those two; with all points on one line, the walks leave only the two ends.",
  "The chain starts at the leftmost point; the problem asks to start at the lowest (then leftmost) one, so the list is rotated to start there. The order stays counterclockwise.",
  "Cost: O(n log n) for the sort, O(n) for the walks. Gift wrapping is O(n · h), and on the test where every point is a corner it is O(n²).",
];
