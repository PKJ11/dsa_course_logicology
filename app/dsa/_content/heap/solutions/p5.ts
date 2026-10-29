// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def merge_k(lists):
    # heap entries (value, list number, position in that list)
    h = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    n = len(h)

    def down(i):
        while True:
            l = 2 * i + 1
            if l >= n:
                return
            c = l + 1 if l + 1 < n and h[l + 1] < h[l] else l
            if h[c] < h[i]:
                h[i], h[c] = h[c], h[i]
                i = c
            else:
                return

    for i in range(n // 2 - 1, -1, -1):
        down(i)
    out = []
    while n:
        v, li, j = h[0]
        out.append(v)
        if j + 1 < len(lists[li]):
            h[0] = (lists[li][j + 1], li, j + 1)   # the next value from that list
        else:
            n -= 1                                 # that list is used up
            h[0] = h[n]
            h.pop()
        down(0)
    return out
`;

export const notes = [
  "The heap holds one entry per list that still has values: its front value, plus where it came from. The smallest of all the front values is always at the root.",
  "Take the root, then replace it with the next value from the same list and sift down. When a list runs out, move the last entry into the root instead and shrink the heap.",
  "Entries are tuples, so equal values are ordered by list number and the comparison never needs anything else. n values each cost O(log k): O(n log k) in total, with O(k) extra space besides the output.",
  "`heapq.merge(*lists)` does the same job lazily: it returns an iterator, so it can merge files too big for memory.",
];
