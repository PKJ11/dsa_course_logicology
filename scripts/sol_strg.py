from solgen import write_station

write_station("strg", 6, {
    1: ('''def find_all(text, pat):
    n, m = len(text), len(pat)
    found = []
    for i in range(n - m + 1):         # every place, including n - m
        j = 0
        while j < m and (pat[j] == "?" or text[i + j] == pat[j]):
            j += 1
        if j == m:                     # every letter matched or was a blank
            found.append(i)
    return found                       # move on by 1, so overlaps are found
''', [
        "The naive method from lesson 1, with one change: a ? in the pattern matches whatever letter is under it. Only the pattern's ? is a blank; a ? in the text is an ordinary letter.",
        "range(n - m + 1) tries the last place, n − m. When the pattern is longer than the text, the range is empty and the answer is [].",
        "After a match, the loop simply goes on to i + 1, so overlapping matches are reported.",
        "Cost: at most m comparisons per place, O(n · m) in all, which is fine for these sizes. A regular expression with a lookahead does the same job in C: [m.start() for m in re.finditer('(?=' + pat.replace('?', '.') + ')', text)].",
        "KMP and the Z-algorithm do not handle blanks directly, because a border of a pattern with blanks is not well defined. Faster methods for blanks exist (splitting the pattern at the blanks, or the fast Fourier transform), but they are beyond this lesson.",
    ]),
    2: ('''def find_every(text, pat):
    m = len(pat)
    # pi[i]: length of the longest border of pat[0..i]
    pi = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pat[i] != pat[k]:
            k = pi[k - 1]              # the next shorter border
        if pat[i] == pat[k]:
            k += 1
        pi[i] = k
    found = []
    j = 0                              # letters of pat matched so far
    for i, ch in enumerate(text):
        while j > 0 and ch != pat[j]:
            j = pi[j - 1]              # slide pat; i stays
        if ch == pat[j]:
            j += 1
            if j == m:                 # pat ends at place i
                found.append(i - m + 1)
                j = pi[m - 1]          # keep the longest border matched
    return found
''', [
        "First the border table π of the pattern (lesson 2), in O(m): k is the border being grown, and on a mismatch it drops to the next shorter border, π[k − 1].",
        "Then one pass over the text. j counts the letters of the pattern matched so far. On a mismatch the pattern slides so that its longest border lines up (j = π[j − 1]); the place i in the text never moves back.",
        "After a full match, j = π[m − 1] keeps the longest border matched, so the next match can start inside this one: overlapping places are all found.",
        "Each letter of the text is matched at most once, and each slide moves the pattern right, so the whole search makes at most 2n + 2m comparisons: O(n + m).",
        "Why not a loop of text.find(pat, i + 1)? Each call is fast, but each one checks all m letters of the match again. With 500,001 matches of 500,000 letters that is about 250 billion letter checks.",
    ]),
    3: ('''def fits(text, pat):
    s = pat + "\\0" + text            # "\\0" is in neither string
    n = len(s)
    z = [0] * n
    l = r = 0                          # the box [l, r)
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    m = len(pat)
    return z[m + 1:]                   # one value per place of text
''', [
        "Z[i] of the joined string pat + separator + text is the length of the longest start of the joined string that begins at place i. For a place of the text, that start can never run across the separator, so it is a start of the pattern: exactly what is asked.",
        "The separator must be a character that occurs in neither string; the problem uses lower-case letters, so '\\0' (the character with code 0) is safe. Without it, a match could run from the end of the pattern into the text.",
        "The box [l, r) is the match found so far that reaches furthest right. Inside it, the answer at i starts from the answer at i − l (lesson 3), so each letter is compared successfully at most once: O(n + m) in all.",
        "The answer at place i is never more than the letters left in the text, len(text) − i; the end of the joined string stops the while loop.",
    ]),
    4: ('''def longest_repeat(s):
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
''', [
        "If some piece of length L occurs twice, its first L − 1 letters also occur twice. So 'is there a repeat of length L?' is true up to the answer and false after it, and binary search on L (BSRC-4) finds the answer with about log₂ n checks.",
        "Each check hashes every piece of length L in O(1) from the prefix hashes, H[i + L] − H[i] · B^L (lesson 4), and looks for a hash that came up before. A dict from hash to first start gives, for each repeated piece, the place where it first occurs; the smallest of those is the tie rule's answer.",
        "When two hashes are equal, the slices are compared. Two equal pieces always pass. If they differ, it is a collision, which the modulus 2⁶¹ − 1 makes very unlikely, and the pair is simply skipped. Comparing costs O(L), but it runs only when a real repeat (or a rare collision) is found.",
        "Cost: O(n) to build the hashes, then about log₂ n checks of O(n) each: O(n log n). A suffix array (lesson 5) gives the same answer as the largest lcp value.",
        "The Thue–Morse test catches a hash computed modulo 2⁶⁴ with no check: many different pieces of that string get the same such hash.",
    ]),
    5: ('''def suffix_lcp(s):
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
''', [
        "Prefix doubling (lesson 5): after the round with step k, rank[i] orders the suffixes by their first 2k letters. The next round sorts by the pair (rank[i], rank[i + k]); a suffix that runs out of letters gets 0 there, smaller than any real rank.",
        "The pair is packed into one whole number, rank[i] · w + second, with w bigger than any second value. Sorting plain numbers is faster in Python than sorting tuples. sort() runs in C, so each round is a fast O(n log n).",
        "The loop stops as soon as every rank is different, which on ordinary text happens after a few rounds. In the worst case ('aaaa…') it takes about log₂ n rounds: O(n log² n) in all.",
        "Kasai's method then fills the lcp array in O(n): going from suffix i to suffix i + 1 the answer drops by at most 1, so h is carried over instead of starting from 0.",
        "Sorting with key=lambda i: s[i:] is correct but copies every suffix: n²/2 letters, 5 billion for 100,000 letters of 'a'.",
    ]),
    6: ('''def palindromes(s):
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
''', [
        "Manacher's method (lesson 6), once for odd lengths (d₁) and once for even lengths (d₂). Inside the box, the mirror centre gives a starting radius; only letters past the box are compared, so each pass is O(n).",
        "d₁[i] is the number of odd palindromes centred on letter i and d₂[i] the number of even ones centred just before it, so their sums count every palindrome by position.",
        "The longest palindrome with centre i has 2·d₁[i] − 1 letters starting at i − d₁[i] + 1, or 2·d₂[i] letters starting at i − d₂[i]. Keeping the earliest start on ties gives the answer the problem asks for.",
        "The count can be about n²/2 (20 billion for 200,000 letters of 'a'), but it is found as a sum of n numbers. Python's whole numbers do not overflow.",
        "Growing every palindrome from its centre gives the same answers, but costs about n²/4 comparisons on 'aaaa…'.",
    ]),
})
