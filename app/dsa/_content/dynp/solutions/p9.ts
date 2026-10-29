// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def pack(items, cap):
    n = len(items)
    # best[i][x] = best value from the first i items
    # in a bag that holds x kilograms
    best = [[0] * (cap + 1)]
    for w, v in items:
        prev = best[-1]
        row = prev[:]                  # skip the item
        for x in range(w, cap + 1):
            if prev[x - w] + v > row[x]:
                row[x] = prev[x - w] + v   # take it
        best.append(row)
    # walk back from the last row
    chosen = []
    x = cap
    for i in range(n, 0, -1):
        if best[i][x] != best[i - 1][x]:   # item i - 1 taken
            chosen.append(i - 1)
            x -= items[i - 1][0]
    return chosen[::-1]
`;

export const notes = [
  "The forward pass is the 0/1 knapsack table of lesson 8, but every row is kept. The one-row version gives the best value, not the choice.",
  "Walking back: at row i with x kilograms left, if `best[i][x]` equals `best[i - 1][x]`, the best value is reachable without item i − 1, so skip it. Otherwise the item must have been taken: add it and move to x − its weight.",
  "Each step of the walk is O(1), so rebuilding costs O(n) after the O(n × cap) table. The table holds (n + 1) × (cap + 1) numbers; to save memory, store one bit per cell for \"taken\" instead.",
  "When skipping and taking give the same value, this walk skips. Any best choice is accepted, so the tests check the facts (positions, weight, value) rather than one list.",
];
