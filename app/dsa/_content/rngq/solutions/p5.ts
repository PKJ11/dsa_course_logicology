// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class RangeTree:
    def __init__(self, n):
        self.n = n
        self.s = [0] * (4 * n)       # sums
        self.tg = [0] * (4 * n)      # adds not yet passed to children

    def _apply(self, k, length, v):
        self.s[k] += v * length
        self.tg[k] += v

    def _push(self, k, lo, mid, hi):
        if self.tg[k]:
            self._apply(2 * k, mid - lo, self.tg[k])
            self._apply(2 * k + 1, hi - mid, self.tg[k])
            self.tg[k] = 0

    def add(self, l, r, v, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n               # node k covers a[lo:hi]
        if r <= lo or hi <= l or l >= r:
            return
        if l <= lo and hi <= r:
            self._apply(k, hi - lo, v)
            return
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        self.add(l, r, v, 2 * k, lo, mid)
        self.add(l, r, v, 2 * k + 1, mid, hi)
        self.s[k] = self.s[2 * k] + self.s[2 * k + 1]

    def total(self, l, r, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n
        if r <= lo or hi <= l or l >= r:
            return 0
        if l <= lo and hi <= r:
            return self.s[k]
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        return (self.total(l, r, 2 * k, lo, mid)
                + self.total(l, r, 2 * k + 1, mid, hi))
`;

export const notes = [
  "Every node stores the sum of its range and a tag: an amount still owed to every position below it. A node's sum is always correct; its children are correct once its tag has been pushed.",
  "An add that covers a node completely changes only that node: its sum grows by v times its length, and v joins its tag. That is why an add touches O(log n) nodes, however wide the range.",
  "Before either operation goes below a node, `_push` hands the tag to both children (each by its own length) and clears it. Clearing is essential: a tag that stayed would be added again later.",
  "The recursion is about log₂ n deep. 4n places are always enough for the numbering when n is not a power of two.",
];
