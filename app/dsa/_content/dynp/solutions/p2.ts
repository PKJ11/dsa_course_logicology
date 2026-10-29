// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def exchange(n):
    memo = {}                      # a new memo for each call

    def best(m):
        if m == 0:
            return 0
        if m not in memo:
            swap = best(m // 2) + best(m // 3) + best(m // 4)
            memo[m] = max(m, swap)  # sell, or exchange
        return memo[m]

    return best(n)
`;

export const notes = [
  "The value of a coin depends only on its number, so `best(m)` is the state. The choice is to sell it (m rupees) or to exchange it and take the best value of the three new coins.",
  "A table from 0 to n is impossible for n = 10¹²: it would need a million million entries. The recursion only reaches numbers of the form n // 2ᵃ // 3ᵇ // 4ᶜ, which are a few thousand at most. Memoisation stores just those.",
  "The recursion is shallow: every call divides m by at least 2, so the depth is about log₂ n, 60 for n = 10¹⁸. The recursion limit is no problem here.",
  "`functools.cache` on an inner function does the same as the dict. A module-level cache also works for this problem, because the answer depends on n alone and nothing else changes between calls.",
  "For every m below 12, selling is at least as good as exchanging (11 gives 5 + 3 + 2 = 10). The first coin worth exchanging is 12.",
];
