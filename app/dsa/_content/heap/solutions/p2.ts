// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def sift_down(a, i, n):
    while True:
        l = 2 * i + 1
        if l >= n:
            return
        c = l
        if l + 1 < n and a[l + 1] < a[l]:
            c = l + 1
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return


def heapify(a):
    # positions n // 2 .. n - 1 are leaves: already heaps of one value
    for i in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, i, len(a))
`;

export const notes = [
  "Work from the last parent back to the root. When `sift_down(a, i, n)` runs, both children of i are already the roots of heaps, so pushing a[i] down to its place makes the subtree at i a heap too.",
  "Most nodes are near the bottom, where a sift-down is short. Half the nodes are leaves (no work), a quarter sift down at most one level, an eighth at most two, and so on. The total is less than n swaps and less than 2n comparisons: O(n).",
  "Pushing the values one by one sifts each new value up, and on a decreasing list every value moves up to the root: O(n log n).",
  "The list is changed in place and nothing is returned, the same as `heapq.heapify`.",
];
