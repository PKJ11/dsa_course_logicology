// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def longest_repeat(s):
    n = len(s)
    M = (1 << 61) - 1                  # a large prime
    B = 911382323
    H = [0] * (n + 1)                  # H[k]: hash of s[:k]
    P = [1] * (n + 1)                  # P[k]: B to the power k, mod M
    for k in range(n):
        H[k + 1] = (H[k] * B + ord(s[k])) % M
        P[k + 1] = P[k] * B % M

    def first_repeat(L):
        """Smallest start of a piece of length L that occurs again, or -1."""
        first = {}                     # hash -> first start with that hash
        best = -1
        for i in range(n - L + 1):
            h = (H[i + L] - H[i] * P[L]) % M
            j = first.get(h)
            if j is None:
                first[h] = i
            elif s[j:j + L] == s[i:i + L]:     # check: not a collision
                if best == -1 or j < best:
                    best = j
        return best

    lo, hi = 0, n - 1                  # the answer's length is in [lo, hi]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if first_repeat(mid) >= 0:
            lo = mid                   # a repeat of length mid exists
        else:
            hi = mid - 1
    if lo == 0:
        return ""
    i = first_repeat(lo)
    return s[i:i + lo]
`;

export const notes = [
  "If some piece of length L occurs twice, its first L − 1 letters also occur twice. So 'is there a repeat of length L?' is true up to the answer and false after it, and binary search on L (BSRC-4) finds the answer with about log₂ n checks.",
  "Each check hashes every piece of length L in O(1) from the prefix hashes, H[i + L] − H[i] · B^L (lesson 4), and looks for a hash that came up before. A dict from hash to first start gives, for each repeated piece, the place where it first occurs; the smallest of those is the tie rule's answer.",
  "When two hashes are equal, the slices are compared. Two equal pieces always pass. If they differ, it is a collision, which the modulus 2⁶¹ − 1 makes very unlikely, and the pair is simply skipped. Comparing costs O(L), but it runs only when a real repeat (or a rare collision) is found.",
  "Cost: O(n) to build the hashes, then about log₂ n checks of O(n) each: O(n log n). A suffix array (lesson 5) gives the same answer as the largest lcp value.",
  "The Thue–Morse test catches a hash computed modulo 2⁶⁴ with no check: many different pieces of that string get the same such hash.",
];
