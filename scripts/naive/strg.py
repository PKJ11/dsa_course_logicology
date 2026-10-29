# Naive STRG solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def find_all(text, pat):
    # stops one place too early
    n, m = len(text), len(pat)
    return [i for i in range(n - m) if all(p == "?" or p == c for p, c in zip(pat, text[i:i + m]))]
''', [0, 3, 5, 6, 11]),
    2: ('''
def find_every(text, pat):
    # a loop of find calls
    out = []
    i = text.find(pat)
    while i != -1:
        out.append(i)
        i = text.find(pat, i + 1)
    return out
''', [8, 9]),
    3: ('''
def fits(text, pat):
    out = []
    for i in range(len(text)):
        k = 0
        while k < len(pat) and i + k < len(text) and text[i + k] == pat[k]:
            k += 1
        out.append(k)
    return out
''', [6, 7]),
    4: ('''
def longest_repeat(s):
    # binary search on the length, with a set of slices
    n = len(s)
    def first(L):
        seen = {}
        best = -1
        for i in range(n - L + 1):
            p = s[i:i + L]
            if p in seen:
                if best == -1 or seen[p] < best:
                    best = seen[p]
            else:
                seen[p] = i
        return best
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if first(mid) >= 0:
            lo = mid
        else:
            hi = mid - 1
    if lo == 0:
        return ""
    i = first(lo)
    return s[i:i + lo]
''', [10]),
    5: ('''
from functools import cmp_to_key
def suffix_lcp(s):
    # compare suffixes letter by letter (no copies), then lcp from scratch
    n = len(s)
    def cmp(a, b):
        while a < n and b < n:
            if s[a] != s[b]:
                return -1 if s[a] < s[b] else 1
            a += 1
            b += 1
        return -1 if a == n else 1
    sa = sorted(range(n), key=cmp_to_key(cmp))
    lcp = [0] * n
    for r in range(1, n):
        a, b = sa[r - 1], sa[r]
        k = 0
        while a + k < n and b + k < n and s[a + k] == s[b + k]:
            k += 1
        lcp[r] = k
    return sa, lcp
''', [6, 9]),
    6: ('''
def palindromes(s):
    # grow every palindrome from its centre
    n = len(s)
    count, best = 0, (0, 0)
    for c in range(2 * n - 1):
        a, b = c // 2, (c + 1) // 2
        while a >= 0 and b < n and s[a] == s[b]:
            count += 1
            if b - a + 1 > best[0] or (b - a + 1 == best[0] and a < best[1]):
                best = (b - a + 1, a)
            a -= 1
            b += 1
    return count, s[best[1]:best[1] + best[0]]
''', [7, 8]),
}

# Wrong or slow versions run by hand (not by check-problems.py): name -> (problem, code).
EXTRA = {
    "P1 non-overlapping (jump by m after a match)": (1, '''
def find_all(text, pat):
    n, m = len(text), len(pat)
    out = []
    i = 0
    while i <= n - m:
        if all(p == "?" or p == c for p, c in zip(pat, text[i:i + m])):
            out.append(i)
            i += m
        else:
            i += 1
    return out
'''),
    "P1 str.find ignoring blanks": (1, '''
def find_all(text, pat):
    out = []
    i = text.find(pat)
    while i != -1:
        out.append(i)
        i = text.find(pat, i + 1)
    return out
'''),
    "P2 slice at every place": (2, '''
def find_every(text, pat):
    m = len(pat)
    return [i for i in range(len(text) - m + 1) if text[i:i + m] == pat]
'''),
    "P2 KMP that resets j to 0 after a match": (2, '''
def find_every(text, pat):
    m = len(pat)
    pi = [0] * m
    k = 0
    for i in range(1, m):
        while k and pat[i] != pat[k]:
            k = pi[k - 1]
        if pat[i] == pat[k]:
            k += 1
        pi[i] = k
    out = []
    j = 0
    for i, ch in enumerate(text):
        while j and ch != pat[j]:
            j = pi[j - 1]
        if ch == pat[j]:
            j += 1
            if j == m:
                out.append(i - m + 1)
                j = 0
    return out
'''),
    "P3 Z without a separator": (3, '''
def fits(text, pat):
    s = pat + text
    n = len(s)
    z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z[len(pat):]
'''),
    "P4 hash modulo 2**64 with no check": (4, '''
def longest_repeat(s):
    n = len(s)
    M = 1 << 64
    B = 131
    H = [0] * (n + 1)
    P = [1] * (n + 1)
    for k in range(n):
        H[k + 1] = (H[k] * B + ord(s[k])) % M
        P[k + 1] = P[k] * B % M
    def first(L):
        seen = {}
        best = -1
        for i in range(n - L + 1):
            h = (H[i + L] - H[i] * P[L]) % M
            if h in seen:
                if best == -1 or seen[h] < best:
                    best = seen[h]
            else:
                seen[h] = i
        return best
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if first(mid) >= 0:
            lo = mid
        else:
            hi = mid - 1
    if lo == 0:
        return ""
    i = first(lo)
    return s[i:i + lo]
'''),
    "P4 every length from the longest down, with slices": (4, '''
def longest_repeat(s):
    n = len(s)
    for L in range(n - 1, 0, -1):
        seen = {}
        best = -1
        for i in range(n - L + 1):
            p = s[i:i + L]
            if p in seen:
                if best == -1 or seen[p] < best:
                    best = seen[p]
            else:
                seen[p] = i
        if best >= 0:
            return s[best:best + L]
    return ""
'''),
    "P4 alphabetical tie rule": (4, '''
def longest_repeat(s):
    n = len(s)
    for L in range(n - 1, 0, -1):
        seen = set()
        reps = set()
        for i in range(n - L + 1):
            p = s[i:i + L]
            if p in seen:
                reps.add(p)
            seen.add(p)
        if reps:
            return min(reps)
    return ""
'''),
    "P5 sorted with slices as keys (browser: memory)": (5, '''
def suffix_lcp(s):
    n = len(s)
    sa = sorted(range(n), key=lambda i: s[i:])
    rank = [0] * n
    for r, i in enumerate(sa):
        rank[i] = r
    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] == 0:
            h = 0
            continue
        j = sa[rank[i] - 1]
        while i + h < n and j + h < n and s[i + h] == s[j + h]:
            h += 1
        lcp[rank[i]] = h
        if h:
            h -= 1
    return sa, lcp
'''),
    "P5 lesson code: tuple keys (should pass)": (5, '''
def suffix_lcp(s):
    n = len(s)
    sa = list(range(n))
    rank = [ord(ch) for ch in s]
    k = 1
    while n > 1:
        key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
        sa.sort(key=key)
        new = [0] * n
        for r in range(1, n):
            new[sa[r]] = new[sa[r - 1]] + (key(sa[r - 1]) != key(sa[r]))
        rank = new
        if rank[sa[-1]] == n - 1:
            break
        k *= 2
    rank = [0] * n
    for r, i in enumerate(sa):
        rank[i] = r
    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] == 0:
            h = 0
            continue
        j = sa[rank[i] - 1]
        while i + h < n and j + h < n and s[i + h] == s[j + h]:
            h += 1
        lcp[rank[i]] = h
        if h > 0:
            h -= 1
    return sa, lcp
'''),
    "P6 even mirror off by one": (6, '''
def palindromes(s):
    n = len(s)
    d1 = [0] * n
    l, r = 0, -1
    for i in range(n):
        k = 1 if i > r else min(d1[l + r - i], r - i + 1)
        while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:
            k += 1
        d1[i] = k
        if i + k - 1 > r:
            l, r = i - k + 1, i + k - 1
    d2 = [0] * n
    l, r = 0, -1
    for i in range(n):
        k = 0 if i > r else min(d2[l + r - i], r - i + 1)
        while i - k - 1 >= 0 and i + k < n and s[i - k - 1] == s[i + k]:
            k += 1
        d2[i] = k
        if i + k - 1 > r:
            l, r = i - k, i + k - 1
    count = sum(d1) + sum(d2)
    best_len, best_at = 0, 0
    for i in range(n):
        for length, start in ((2 * d1[i] - 1, i - d1[i] + 1), (2 * d2[i], i - d2[i])):
            if length > best_len or (length == best_len and start < best_at):
                best_len, best_at = length, start
    return count, s[best_at:best_at + best_len]
'''),
    "P6 distinct palindromes instead of by position": (6, '''
def palindromes(s):
    seen = set()
    best = ""
    n = len(s)
    for c in range(2 * n - 1):
        a, b = c // 2, (c + 1) // 2
        while a >= 0 and b < n and s[a] == s[b]:
            seen.add(s[a:b + 1])
            if b - a + 1 > len(best):
                best = s[a:b + 1]
            a -= 1
            b += 1
    return len(seen), best
'''),
}
