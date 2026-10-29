// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def shapes(n):
    # count[m] = the number of shapes with m keys
    count = [1] * (n + 1)          # 0 keys and 1 key: one shape
    for m in range(2, n + 1):
        total = 0
        for left in range(m):      # keys in the left subtree
            right = m - 1 - left   # the root takes one key
            total += count[left] * count[right]
        count[m] = total
    return count[n]
`;

export const notes = [
  "The state is the number of keys, m. Which keys they are does not matter: any m keys in order make the same shapes as the keys 1 to m. So there are only n + 1 different questions.",
  "Choosing the root splits the other m − 1 keys into a left part and a right part. Every left shape can go with every right shape, so a root with `left` keys on its left gives `count[left] * count[right]` shapes. Add over all roots.",
  "The list is filled from small m to large m, so every count the loop needs is already there. That is O(n²) multiplications. The numbers grow to hundreds of digits; Python's whole numbers hold them exactly.",
  "These are the Catalan numbers: 1, 1, 2, 5, 14, 42, … They also count correctly nested brackets and the ways to cut a polygon into triangles. The closed form `comb(2n, n) // (n + 1)` exists, which is why `math.comb` is switched off here.",
];
