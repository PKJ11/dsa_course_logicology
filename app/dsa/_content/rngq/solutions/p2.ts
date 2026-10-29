// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def range_min(a, queries):
    t = [list(a)]                # row 0: blocks of length 1
    k = 1
    while (1 << k) <= len(a):
        prev, h = t[-1], 1 << (k - 1)
        # a block of length 2**k is two blocks of length h
        t.append([min(prev[i], prev[i + h])
                  for i in range(len(a) - (1 << k) + 1)])
        k += 1
    out = []
    for l, r in queries:
        j = (r - l).bit_length() - 1      # largest 2**j <= r - l
        row = t[j]
        out.append(min(row[l], row[r - (1 << j)]))
    return out
`;

export const notes = [
  "Row k of the table holds the minimum of every block of length 2ᵏ; each entry is the smaller of two entries of the row below it, so the build makes at most n comparisons per row and about n log₂ n in all.",
  "For a query, `(r - l).bit_length() - 1` is the position of the highest 1 bit of the length: the largest power of two that fits.",
  "One block starts at l and one ends at r − 1. Together they cover the range; where they overlap, a value is seen twice, which cannot change a minimum. So each query is one comparison.",
  "`1 << k` is 2ᵏ. The table cannot be updated cheaply, which is fine here because the list never changes.",
];
