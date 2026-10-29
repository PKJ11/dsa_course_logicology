"""Trusted STRG solutions (as source strings, for tb.build) and brute forces for cross_strg.py."""

# ---------- P1: patterns with blanks ----------
P1 = '''
def find_all(text, pat):
    n, m = len(text), len(pat)
    out = []
    for i in range(n - m + 1):
        j = 0
        while j < m and (pat[j] == "?" or text[i + j] == pat[j]):
            j += 1
        if j == m:
            out.append(i)
    return out
'''

# ---------- P2: every place, fast (KMP) ----------
P2 = '''
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
                j = pi[j - 1]
    return out
'''

# ---------- P3: how much of the pattern fits (Z) ----------
P3 = '''
def fits(text, pat):
    s = pat + "\\0" + text
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
    m = len(pat)
    return z[m + 1:]
'''

# ---------- P4: the longest repeated piece (binary search + rolling hash, checked) ----------
P4 = '''
def longest_repeat(s):
    n = len(s)
    M = (1 << 61) - 1
    B = 911382323
    H = [0] * (n + 1)
    P = [1] * (n + 1)
    for k in range(n):
        H[k + 1] = (H[k] * B + ord(s[k])) % M
        P[k + 1] = P[k] * B % M

    def first_repeat(L):
        # smallest start i such that s[i:i+L] occurs again somewhere, or -1
        if L == 0:
            return 0
        seen = {}
        best = -1
        pl = P[L]
        for i in range(n - L + 1):
            h = (H[i + L] - H[i] * pl) % M
            j = seen.get(h)
            if j is None:
                seen[h] = i
            elif s[j:j + L] == s[i:i + L]:
                if best == -1 or j < best:
                    best = j
            # a true collision (different pieces, same hash) is ignored here; with this modulus it is unlikely
        return best

    lo, hi = 0, n - 1          # the answer length lies in [lo, hi]; length lo always works
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if first_repeat(mid) >= 0:
            lo = mid
        else:
            hi = mid - 1
    if lo == 0:
        return ""
    i = first_repeat(lo)
    return s[i:i + lo]
'''

# suffix-array version, used as a second trusted method on the big tests
P4_SA = '''
def longest_repeat(s):
    n = len(s)
    if n < 2:
        return ""
    sa = list(range(n))
    rank = [ord(c) for c in s]
    k = 1
    while True:
        w = max(rank) + 2
        key = [rank[i] * w + (rank[i + k] + 1 if i + k < n else 0) for i in range(n)]
        sa.sort(key=key.__getitem__)
        new = [0] * n
        for r in range(1, n):
            new[sa[r]] = new[sa[r - 1]] + (key[sa[r]] != key[sa[r - 1]])
        rank = new
        if rank[sa[-1]] == n - 1:
            break
        k *= 2
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
    L = max(lcp)
    if L == 0:
        return ""
    best = min(min(sa[r], sa[r - 1]) for r in range(1, n) if lcp[r] == L)
    return s[best:best + L]
'''

# ---------- P5: suffix array and lcp ----------
P5 = '''
def suffix_lcp(s):
    n = len(s)
    if n == 0:
        return [], []
    sa = list(range(n))
    rank = [ord(c) for c in s]
    k = 1
    while n > 1:
        w = max(rank) + 2
        key = [rank[i] * w + (rank[i + k] + 1 if i + k < n else 0) for i in range(n)]
        sa.sort(key=key.__getitem__)
        new = [0] * n
        for r in range(1, n):
            new[sa[r]] = new[sa[r - 1]] + (key[sa[r]] != key[sa[r - 1]])
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
        if h:
            h -= 1
    return sa, lcp
'''

# ---------- P6: palindromes (Manacher) ----------
P6 = '''
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
        k = 0 if i > r else min(d2[l + r - i + 1], r - i + 1)
        while i - k - 1 >= 0 and i + k < n and s[i - k - 1] == s[i + k]:
            k += 1
        d2[i] = k
        if i + k - 1 > r:
            l, r = i - k, i + k - 1
    count = sum(d1) + sum(d2)
    best_len, best_at = 0, 0
    for i in range(n):
        L = 2 * d1[i] - 1
        a = i - d1[i] + 1
        if L > best_len or (L == best_len and a < best_at):
            best_len, best_at = L, a
        L = 2 * d2[i]
        a = i - d2[i]
        if L > best_len or (L == best_len and a < best_at):
            best_len, best_at = L, a
    return count, s[best_at:best_at + best_len]
'''


# ---------- brute forces ----------
def brute_p1(text, pat):
    m = len(pat)
    return [i for i in range(len(text) - m + 1) if all(p == "?" or p == c for p, c in zip(pat, text[i:i + m]))]


def brute_p2(text, pat):
    return [i for i in range(len(text) - len(pat) + 1) if text[i:i + len(pat)] == pat]


def brute_p3(text, pat):
    out = []
    for i in range(len(text)):
        k = 0
        while k < len(pat) and i + k < len(text) and text[i + k] == pat[k]:
            k += 1
        out.append(k)
    return out


def brute_p4(s):
    n = len(s)
    for L in range(n - 1, 0, -1):
        starts = {}
        for i in range(n - L + 1):
            starts.setdefault(s[i:i + L], []).append(i)
        reps = [v[0] for v in starts.values() if len(v) > 1]
        if reps:
            i = min(reps)
            return s[i:i + L]
    return ""


def brute_p5(s):
    sa = sorted(range(len(s)), key=lambda i: s[i:])
    lcp = [0] * len(s)
    for r in range(1, len(s)):
        a, b = s[sa[r - 1]:], s[sa[r]:]
        k = 0
        while k < min(len(a), len(b)) and a[k] == b[k]:
            k += 1
        lcp[r] = k
    return sa, lcp


def brute_p6(s):
    n = len(s)
    count = 0
    best = ""
    for a in range(n):
        for b in range(a + 1, n + 1):
            t = s[a:b]
            if t == t[::-1]:
                count += 1
                if len(t) > len(best):
                    best = t
    return count, best
