// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def pairs_to_multiple(a, k):
    count = {}
    for v in a:
        r = v % k                      # 0 to k - 1, even for negative v
        count[r] = count.get(r, 0) + 1
    total = 0
    for r, c in count.items():
        s = (k - r) % k                # the remainder that completes r
        if r < s:
            total += c * count.get(s, 0)
        elif r == s:                   # r is 0, or k/2 when k is even
            total += c * (c - 1) // 2
    return total
`;

export const notes = [
  "a[i] + a[j] is a multiple of k exactly when their remainders add up to 0 or k (lesson 2). So only the count of numbers with each remainder matters: one pass to count, then one pass over at most k remainders.",
  "Remainder r pairs with s = (k − r) % k. For r < s, every number of class r pairs with every number of class s: c_r · c_s pairs. The test `r < s` counts each pair of classes once; when r > s the pair was already counted from s.",
  "When r == s (remainder 0, or k/2 for even k), the numbers pair among themselves: c · (c − 1) / 2 pairs, which never pairs a number with itself.",
  "`collections.Counter(v % k for v in a)` builds the same dict in one line. O(n) time and O(min(n, k)) memory, against O(n²) for checking every pair.",
];
