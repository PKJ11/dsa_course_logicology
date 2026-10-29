// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import bisect

def season_tickets(days, passes):
    n = len(days)
    # best[i] = cheapest way to cover trips i, i + 1, ..., n - 1
    best = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        cheapest = None
        for length, price in passes:
            # a pass bought on days[i] covers up to
            # days[i] + length - 1; j is the first trip after it
            j = bisect.bisect_left(days, days[i] + length, i)
            cost = price + best[j]
            if cheapest is None or cost < cheapest:
                cheapest = cost
        best[i] = cheapest
    return best[0]
`;

export const notes = [
  "Some ticket must cover the first trip that is not yet covered, and it is never worse to buy it on that trip's day. So the state is a trip number i: the cheapest way to cover trips i to the end. One entry per trip, not per calendar day.",
  "For each pass, the first trip it does not cover is the first day ≥ `days[i] + length`. `bisect_left` finds it in O(log n), searching only from i onwards. In all O(n · p · log n) for p passes.",
  "The table is filled from the last trip backwards, because each entry needs later ones. A forward version also works: cheapest[i] = the cheapest way to cover the first i trips.",
  "A pointer per pass that only moves forward also works in O(n · p) in all: as i goes down, the end of each pass moves down too.",
];
