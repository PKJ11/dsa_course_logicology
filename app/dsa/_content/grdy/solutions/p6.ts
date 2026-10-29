// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def first_failure(coins):
    coins = sorted(coins)
    if len(coins) < 2:
        return None
    big = coins[::-1]                 # largest first, for the greedy count
    limit = coins[-1] + coins[-2]     # any failure shows up below this
    fewest = [0] * limit
    for x in range(1, limit):
        best = x                      # x coins of 1 always work
        for c in coins:
            if c > x:
                break
            if fewest[x - c] < best:
                best = fewest[x - c]
        fewest[x] = best + 1          # the last coin c, plus the best for x - c
        g, y = 0, x                   # how many coins greedy uses
        for c in big:
            g += y // c
            y %= c
        if g > fewest[x]:
            return x
    return None
`;

export const notes = [
  "Kozen and Zaks (1994): if the largest-coin-first method fails for any amount, the smallest such amount is below the sum of the two largest coins. So only amounts below `limit` need checking.",
  "`fewest[x]` is built from smaller amounts: the best way to pay x ends with some coin c, and before it is the best way to pay x − c. This is dynamic programming (DYNP).",
  "The greedy count takes as many of each coin as fit, from the largest down: `y // c` coins of value c, leaving `y % c`.",
  "The first amount where greedy uses more coins is the answer, because amounts are checked in increasing order. O(limit × k) time and O(limit) memory. Pearson (1994) found an O(k³) test that needs no table at all.",
];
