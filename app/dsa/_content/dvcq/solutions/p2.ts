// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def skyline(buildings):
    def merge(p, q):
        out = []
        i = j = 0
        hp = hq = 0                 # current height of each outline
        while i < len(p) or j < len(q):
            if j >= len(q) or (i < len(p) and p[i][0] < q[j][0]):
                x, hp = p[i]
                i += 1
            elif i >= len(p) or q[j][0] < p[i][0]:
                x, hq = q[j]
                j += 1
            else:                   # both change at the same x
                x, hp = p[i]
                hq = q[j][1]
                i += 1
                j += 1
            h = max(hp, hq)
            if not out or out[-1][1] != h:
                out.append((x, h))
        return out

    def solve(lo, hi):              # the outline of buildings[lo:hi]
        if hi - lo == 1:
            left, right, h = buildings[lo]
            return [(left, h), (right, 0)]
        mid = (lo + hi) // 2
        return merge(solve(lo, mid), solve(mid, hi))

    return solve(0, len(buildings)) if buildings else []
`;

export const notes = [
  "Divide: split the list of buildings in half. Conquer: the outline of each half, by recursion; one building is the base case. Combine: merge the two outlines.",
  "The merge walks both outlines from left to right, like the merge in merge sort. At any x the merged height is the larger of the two outlines' current heights, so it is enough to remember `hp` and `hq` and update whichever outline has a point at x.",
  "Taking both points when their x values are equal gives one point per x. Adding a point only when the height changes keeps neighbouring points different, which also merges touching buildings of the same height.",
  "Each merge is O(n), so T(n) = 2 T(n/2) + O(n) = O(n log n). The recursion is about log₂ n calls deep. A sweep over the 2n edges with a heap of the buildings that are still standing (with lazy removal, HEAP-4) is also O(n log n).",
];
