// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)        # t[0] is not used

    def add(self, i, v):
        i += 1                        # the tree counts from 1
        t, n = self.t, self.n
        while i <= n:
            t[i] += v
            i += i & -i               # the next bar that covers i

    def prefix(self, i):              # positions 0 .. i - 1
        t = self.t
        s = 0
        while i > 0:                  # tree positions 1 .. i
            s += t[i]
            i -= i & -i               # drop the lowest 1 bit
        return s

    def total(self, l, r):
        return self.prefix(r) - self.prefix(l)
`;

export const notes = [
  "t[i] holds the total of the `i & -i` positions that end at tree position i. Position i of the list is tree position i + 1.",
  "`add` moves up by adding the lowest 1 bit, which visits exactly the bars that cover the changed position: one per power of two, so O(log n).",
  "`prefix(i)` wants the list's positions 0 to i − 1, which are tree positions 1 to i, so it starts at i unchanged. Each step adds one bar and drops the lowest 1 bit; the bars join with no gap and no overlap.",
  "A range total is the difference of two prefix totals. Every operation is O(log n), and the whole structure is one list.",
];
