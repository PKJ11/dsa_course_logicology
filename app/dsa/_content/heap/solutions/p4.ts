// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def sift_down(h, i, n):
    while True:
        l = 2 * i + 1
        if l >= n:
            return
        c = l
        if l + 1 < n and h[l + 1] < h[l]:
            c = l + 1
        if h[c] < h[i]:
            h[i], h[c] = h[c], h[i]
            i = c
        else:
            return


def top_k(nums, k):
    if k == 0:
        return []
    h = list(nums[:k])                       # a min-heap of the k largest so far
    for i in range(k // 2 - 1, -1, -1):
        sift_down(h, i, k)
    for x in nums[k:]:
        if x > h[0]:                         # bigger than the smallest of them
            h[0] = x
            sift_down(h, 0, k)
    out = []
    n = k
    while n:                                 # pop smallest first ...
        out.append(h[0])
        n -= 1
        h[0] = h[n]
        sift_down(h, 0, n)
    out.reverse()                            # ... then reverse: largest first
    return out
`;

export const notes = [
  "Keep the k largest values seen so far in a min-heap. Its root is the smallest of them: the value to beat.",
  "A new value that is not bigger than the root cannot be among the k largest, and costs one comparison. A bigger value replaces the root and sifts down: O(log k).",
  "For values in a random order, replacements become rare as the scan goes on, so the total is close to n comparisons. In the worst case (increasing input) it is O(n log k). Space is O(k), so this also works on a stream too big to keep.",
  "At the end, popping the heap gives the k values smallest first; reversing gives largest first. With heapq this whole function is `heapq.nlargest(k, nums)`.",
];
