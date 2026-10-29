// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def push(a, x):
    a.append(x)
    i = len(a) - 1
    while i > 0:
        p = (i - 1) // 2
        if a[i] < a[p]:
            a[i], a[p] = a[p], a[i]
            i = p
        else:
            return


def pop(a):
    last = a.pop()
    if not a:
        return last
    top = a[0]
    a[0] = last
    i, n = 0, len(a)
    while True:
        l = 2 * i + 1
        if l >= n:
            return top
        c = l + 1 if l + 1 < n and a[l + 1] < a[l] else l
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return top


class MedianFinder:
    def __init__(self):
        self.low = []        # the smaller half, as a max-heap of negated values
        self.high = []       # the larger half, as a min-heap

    def add(self, x):
        if not self.low or x <= -self.low[0]:
            push(self.low, -x)
        else:
            push(self.high, x)
        # keep the sizes equal, or low one bigger
        if len(self.low) > len(self.high) + 1:
            push(self.high, -pop(self.low))
        elif len(self.high) > len(self.low):
            push(self.low, -pop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
`;

export const notes = [
  "Two halves: `low` holds the smaller values and `high` the larger ones. Every value in low is at most every value in high, and low has the same size as high or one more.",
  "Then the median is at the tops: the top of low when the count is odd, or the average of the two tops when it is even. `median` is O(1).",
  "There is only a min-heap here, so low stores negated values: the smallest of the negated values is the largest of the real ones. In Python 3.14 the heapq module also has `heappush_max` and `heappop_max` for this.",
  "`add` puts the value in the correct half (one comparison with low's top), then moves at most one value across to fix the sizes. That is a constant number of pushes and pops: O(log n).",
];
