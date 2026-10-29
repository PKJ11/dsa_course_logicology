// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def pair_with_sum(a, target):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        s = a[lo] + a[hi]
        if s == target:
            return [lo, hi]
        if s > target:
            hi -= 1        # a[hi] is too big for any partner left
        else:
            lo += 1        # a[lo] is too small for any partner left
    return []
`;

export const notes = [
  "Invariant: if a pair exists, both of its indices are in lo..hi. Each move drops a value that cannot be in any pair, as lesson 2 proves, so the invariant holds.",
  "Smallest i: let (i, j) be the pair with the smallest i. lo cannot pass i while hi >= j, because then a[i] + a[hi] >= target, so a[i] is never too small. And hi cannot pass j while lo <= i, because then a[lo] + a[j] <= target, so a[j] is never too big. So the pointers meet the pair (i, j) before any other.",
  "Because values are all different, each i has at most one partner j, so the answer is unique.",
  "Each pass moves one pointer, so there are at most n − 1 passes: O(n) time, O(1) extra space. A set also works in O(n) time, but it uses O(n) space and finds the pair with the smallest j first, not the smallest i.",
];
