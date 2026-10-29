// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def smaller_after(values):
    n = len(values)
    counts = [0] * n
    idx = list(range(n))            # positions, merge sorted by value
    tmp = [0] * n
    width = 1
    while width < n:                # bottom-up merge sort: runs of 1, 2, 4, ...
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if values[idx[j]] < values[idx[i]]:
                    tmp[k] = idx[j]           # a smaller value from the right
                    j += 1
                else:
                    counts[idx[i]] += j - mid  # right values placed so far
                    tmp[k] = idx[i]
                    i += 1
                k += 1
            while i < mid:
                counts[idx[i]] += j - mid
                tmp[k] = idx[i]
                i += 1
                k += 1
            while j < hi:
                tmp[k] = idx[j]
                j += 1
                k += 1
        idx, tmp = tmp, idx
        width *= 2
    return counts
`;

export const notes = [
  "Merge sort the positions instead of the values, so every count stays with its own position. `idx` holds positions; their values are compared through `values[...]`.",
  "In a merge, every position in the left run came before every position in the right run. When a left position is placed, the `j - mid` right positions already placed hold smaller values and came later: they are exactly the smaller values after it in this part. Each smaller value after a position is counted at exactly one merge.",
  "On a tie the left position is placed first, so an equal value on the right is not counted as smaller.",
  "Bottom-up merging (runs of 1, 2, 4, …) needs no recursion and swaps `idx` and `tmp` instead of copying. O(n log n) on any order. A Fenwick tree over the ranks of the values, filled from right to left, is also O(n log n) (RNGQ-3).",
];
