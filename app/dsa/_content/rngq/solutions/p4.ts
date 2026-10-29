// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class MinTree:
    def __init__(self, a):
        n = self.n = len(a)
        t = self.t = [None] * n + list(a)     # leaves at n .. 2n - 1
        for k in range(n - 1, 0, -1):
            t[k] = min(t[2 * k], t[2 * k + 1])

    def set(self, i, v):
        t = self.t
        k = i + self.n
        t[k] = v
        while k > 1:                          # fix the path to the root
            k //= 2
            t[k] = min(t[2 * k], t[2 * k + 1])

    def smallest(self, l, r):
        t = self.t
        best = None
        l += self.n
        r += self.n
        while l < r:
            if l & 1:                         # l is a right child
                if best is None or t[l] < best:
                    best = t[l]
                l += 1
            if r & 1:                         # r - 1 is a left child
                r -= 1
                if best is None or t[r] < best:
                    best = t[r]
            l //= 2
            r //= 2
        return best
`;

export const notes = [
  "The tree lives in one list: the leaves are the values at positions n to 2n − 1, and node k sits above its children 2k and 2k + 1. Node k stores the smaller of its children, so every node holds the minimum of its range. This works for any n.",
  "`set` changes a leaf and recomputes each node on the path to the root from both children. Recomputing, rather than keeping the smaller of old and new, is what makes a value that goes up work too.",
  "`smallest` moves the two ends of the range up one level at a time. When an end is the wrong kind of child, its parent would reach outside the range, so that node is taken on its own and the end steps inwards.",
  "Each operation compares O(log n) values: one or two per level.",
];
