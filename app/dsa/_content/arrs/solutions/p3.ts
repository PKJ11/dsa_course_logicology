// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def section_loads(n, trips):
    d = [0] * (n + 1)          # one extra slot for r = n - 1
    for l, r, k in trips:
        d[l] += k              # the group gets on at l
        d[r + 1] -= k          # and is gone after r
    out = []
    s = 0
    for i in range(n):
        s += d[i]
        out.append(s)
    return out
`;

export const notes = [
  "The running total of d up to i adds every +k with l <= i and every −k with r + 1 <= i. A trip counts exactly when l <= i <= r, which is the load on section i.",
  "d has n + 1 slots so that a trip ending at the last section can still write its −k. That slot is never read.",
  "Cost: O(1) per trip, then one pass of O(n). In total O(n + t) for t trips, instead of O(n × t) when each trip is added section by section.",
  "`itertools.accumulate(d)` computes the same running totals in one line.",
];
