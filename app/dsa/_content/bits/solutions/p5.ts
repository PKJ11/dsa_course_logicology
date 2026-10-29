// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from bisect import bisect_left

def closest_sum(a, target):
    def all_sums(part):
        sums = [0]
        for v in part:
            sums += [s + v for s in sums]    # every old subset, with v added
        return sums

    half = len(a) // 2
    left = all_sums(a[:half])
    right = sorted(all_sums(a[half:]))
    best = abs(target)                       # the empty choice
    for s in left:
        i = bisect_left(right, target - s)   # first sum >= target - s
        if i < len(right):
            best = min(best, s + right[i] - target)
        if i > 0:
            best = min(best, target - s - right[i - 1])
    return best
`;

export const notes = [
  "Every choice of items is a choice from the first half plus a choice from the second half. Each half has at most 18 items, so at most 2¹⁸ = 262,144 subset sums. Listing them is fast; 2³⁶ would not be.",
  "`all_sums` doubles the list for each item: the old sums without the item, then the old sums with it. After all the items it holds every subset sum, in the same order as the masks 0 to 2ᵏ − 1.",
  "For a sum s from the left half, the best partner from the right half is the one nearest to `target - s`. In the sorted list it is either the first sum that is at least `target - s` (position i) or the one just before it. Both are checked; position i may be past the end.",
  "Cost: O(2ⁿᐟ² · n) for sorting and the binary searches, where 2ⁿᐟ² means 2 to the power n/2. Sorting both halves and walking them with two pointers, one from each end, also works and drops the binary searches.",
  "This is meeting in the middle: the work of 2ⁿ becomes about 2 · 2ⁿᐟ², paid for with the memory for the sums.",
];
