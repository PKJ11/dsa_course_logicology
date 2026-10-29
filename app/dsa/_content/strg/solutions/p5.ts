// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def suffix_lcp(s):
    n = len(s)
    sa = list(range(n))
    rank = [ord(c) for c in s]         # round 1 ranks: the first letter
    k = 1
    while n > 1:
        # first 2k letters = (first k of i, first k of i + k)
        w = max(rank) + 2
        key = [rank[i] * w + (rank[i + k] + 1 if i + k < n else 0)
               for i in range(n)]
        sa.sort(key=key.__getitem__)
        new = [0] * n
        for r in range(1, n):          # equal keys share a rank
            new[sa[r]] = new[sa[r - 1]] + (key[sa[r]] != key[sa[r - 1]])
        rank = new
        if rank[sa[-1]] == n - 1:      # all ranks differ: done
            break
        k *= 2
    # Kasai: visit suffixes in text order, keeping h
    rank = [0] * n
    for r, i in enumerate(sa):
        rank[i] = r
    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] == 0:
            h = 0
            continue
        j = sa[rank[i] - 1]            # the suffix in the row above
        while i + h < n and j + h < n and s[i + h] == s[j + h]:
            h += 1
        lcp[rank[i]] = h
        if h > 0:
            h -= 1
    return sa, lcp
`;

export const notes = [
  "Prefix doubling (lesson 5): after the round with step k, rank[i] orders the suffixes by their first 2k letters. The next round sorts by the pair (rank[i], rank[i + k]); a suffix that runs out of letters gets 0 there, smaller than any real rank.",
  "The pair is packed into one whole number, rank[i] · w + second, with w bigger than any second value. Sorting plain numbers is faster in Python than sorting tuples. sort() runs in C, so each round is a fast O(n log n).",
  "The loop stops as soon as every rank is different, which on ordinary text happens after a few rounds. In the worst case ('aaaa…') it takes about log₂ n rounds: O(n log² n) in all.",
  "Kasai's method then fills the lcp array in O(n): going from suffix i to suffix i + 1 the answer drops by at most 1, so h is carried over instead of starting from 0.",
  "Sorting with key=lambda i: s[i:] is correct but copies every suffix: n²/2 letters, 5 billion for 100,000 letters of 'a'.",
];
