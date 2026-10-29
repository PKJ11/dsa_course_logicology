// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def select(values, k):
    def sort_small(g):              # insertion sort, for 5 values or fewer
        g = list(g)
        for i in range(1, len(g)):
            x = g[i]
            j = i - 1
            while j >= 0 and x < g[j]:
                g[j + 1] = g[j]
                j -= 1
            g[j + 1] = x
        return g

    values = list(values)
    while True:
        n = len(values)
        if n <= 5:
            return sort_small(values)[k]
        # the median of each group of 5 (the last group may be shorter)
        meds = [sort_small(values[i:i + 5])[(min(5, n - i) - 1) // 2]
                for i in range(0, n, 5)]
        p = select(meds, (len(meds) - 1) // 2)   # the median of medians
        lo, hi, eq = [], [], 0
        for x in values:            # one counted comparison per value
            if x < p:
                lo.append(x)
            elif x == p:            # == is not counted
                eq += 1
            else:
                hi.append(x)
        if k < len(lo):
            values = lo
        elif k < len(lo) + eq:
            return p
        else:
            k -= len(lo) + eq
            values = hi
`;

export const notes = [
  "The pivot is the median of the groups' medians. At least half of the groups have a median no larger than the pivot, and each of those groups has 3 values no larger than it, so at least about 3n/10 values are on each side, and a round keeps at most about 7n/10 (lesson 6).",
  "So T(n) ≤ T(n/5) + T(7n/10) + O(n). The two calls get 9/10 of n together, so the levels of the recursion tree shrink by 9/10 and the total is O(n) (lesson 2).",
  "The three-way partition handles repeats: when k falls among the values equal to the pivot, the answer is the pivot itself, so a list of equal values finishes in one round. Testing `x < p` first and then `x == p` costs one counted comparison per value, because `==` is not counted.",
  "The kept side is handled by the `while` loop rather than a recursive call, so the only recursion is on the medians, n/5 at a time: a few levels deep. On the tests this makes about 8 comparisons per value, whatever the order of the list; sorting makes about log₂ n per value.",
];
