// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def palindromes(s):
    n = len(s)
    d1 = [0] * n                       # odd lengths, centred on letter i
    l, r = 0, -1                       # the box [l, r]
    for i in range(n):
        k = 1 if i > r else min(d1[l + r - i], r - i + 1)
        while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:
            k += 1
        d1[i] = k
        if i + k - 1 > r:
            l, r = i - k + 1, i + k - 1
    d2 = [0] * n                       # even lengths, centred before i
    l, r = 0, -1
    for i in range(n):
        k = 0 if i > r else min(d2[l + r - i + 1], r - i + 1)
        while i - k - 1 >= 0 and i + k < n and s[i - k - 1] == s[i + k]:
            k += 1
        d2[i] = k
        if i + k - 1 > r:
            l, r = i - k, i + k - 1
    count = sum(d1) + sum(d2)
    best_len, best_at = 0, 0
    for i in range(n):
        for length, start in ((2 * d1[i] - 1, i - d1[i] + 1),
                              (2 * d2[i], i - d2[i])):
            if length > best_len or (length == best_len and start < best_at):
                best_len, best_at = length, start
    return count, s[best_at:best_at + best_len]
`;

export const notes = [
  "Manacher's method (lesson 6), once for odd lengths (d₁) and once for even lengths (d₂). Inside the box, the mirror centre gives a starting radius; only letters past the box are compared, so each pass is O(n).",
  "d₁[i] is the number of odd palindromes centred on letter i and d₂[i] the number of even ones centred just before it, so their sums count every palindrome by position.",
  "The longest palindrome with centre i has 2·d₁[i] − 1 letters starting at i − d₁[i] + 1, or 2·d₂[i] letters starting at i − d₂[i]. Keeping the earliest start on ties gives the answer the problem asks for.",
  "The count can be about n²/2 (20 billion for 200,000 letters of 'a'), but it is found as a sum of n numbers. Python's whole numbers do not overflow.",
  "Growing every palindrome from its centre gives the same answers, but costs about n²/4 comparisons on 'aaaa…'.",
];
