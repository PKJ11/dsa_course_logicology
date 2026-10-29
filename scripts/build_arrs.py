from tb import build

S = "arrs"

# P1 pair_with_sum on a sorted list of different values
build(S, 1, "pair_with_sum", [
    {"name": "One pair", "args": "([2, 5, 8, 12, 16, 23, 38, 45], 31)", "show": "a = [2, 5, 8, 12, 16, 23, 38, 45], target = 31", "trace": [2, 5, 8, 12, 16, 23, 38, 45],
     "why": "8 + 23 = 31, at indices 2 and 5. If you got a different pair of indices, check that you return indices, not values."},
    {"name": "No pair", "args": "([2, 5, 8, 12, 16, 23, 38, 45], 33)", "show": "a = [2, 5, 8, 12, 16, 23, 38, 45], target = 33",
     "why": "No two values add up to 33, so return []. If you got an IndexError or an endless loop, check that the loop stops when lo meets hi."},
    {"name": "Several pairs: smallest i", "args": "([1, 2, 3, 4, 5, 6], 7)", "show": "a = [1, 2, 3, 4, 5, 6], target = 7",
     "why": "(0, 5), (1, 4) and (2, 3) all add up to 7. The answer is the one with the smallest i: [0, 5]. Two pointers from the ends find it first. A set used from left to right finds [2, 3] first."},
    {"name": "A value cannot pair with itself", "args": "([1, 4, 9], 8)", "show": "a = [1, 4, 9], target = 8",
     "why": "4 + 4 = 8, but there is only one 4. Return []. Make sure lo < hi, not lo <= hi."},
    {"name": "Negative values", "args": "([-10, -3, 0, 4, 13], 1)", "show": "a = [-10, -3, 0, 4, 13], target = 1",
     "why": "-3 + 4 = 1. Sorted order is what matters, not the sign, so the same moves work."},
    {"name": "Fewer than two values", "args": "()", "expr": "[pair_with_sum([], 5), pair_with_sum([5], 10)]", "expect": "[[], []]", "show": "pair_with_sum([], 5) and pair_with_sum([5], 10)",
     "why": "With fewer than two values there is no pair. Setting hi = len(a) - 1 gives -1 for an empty list, so the loop must not run."},
    {"name": "200,000 values, no pair", "args": "(list(range(1, 400_000, 2)), 2)", "expect": "[]", "timeout": 4000, "show": "a = [1, 3, 5, …, 399999], target = 2",
     "why": "Every value is odd and different, so no pair adds up to 2. Trying every pair is 20 billion additions. Two pointers take at most n - 1 moves."},
    {"name": "200,000 values, pair in the middle", "args": "(list(range(0, 400_000, 2)), 399_998)", "timeout": 4000, "show": "a = [0, 2, 4, …, 399998], target = 399998",
     "why": "0 + 399998 works, at indices 0 and 199999. If this timed out, the code compares pairs one by one."},
], trusted="""
def pair_with_sum(a, target):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        s = a[lo] + a[hi]
        if s == target:
            return [lo, hi]
        if s > target:
            hi -= 1
        else:
            lo += 1
    return []
""")

# P2 longest_unique
build(S, 2, "longest_unique", [
    {"name": "Repeats spread out", "args": "('abcabcbb',)", "show": "s = 'abcabcbb'", "trace": list("abcabcbb"),
     "why": "The longest run with no repeated code is 'abc', length 3. If you got 8, the code does not check for repeats inside the window."},
    {"name": "All the same", "args": "('bbbbb',)", "show": "s = 'bbbbb'", "why": "Every run longer than 1 has a repeat, so the answer is 1. If you got 0 or 5, the window does not move its left end past the earlier b, or the length is counted before the repeat is removed."},
    {"name": "Empty", "args": "('',)", "show": "s = ''", "why": "An empty string has no runs: 0. If this failed, the code reads s[0] or sets best to 1 before checking that the string has any characters."},
    {"name": "The answer is in the middle", "args": "('pwwkew',)", "show": "s = 'pwwkew'", "trace": list("pwwkew"),
     "why": "'wke' has length 3. 'pwke' is not a run of neighbours, so it does not count."},
    {"name": "The left end must not move back", "args": "('abba',)", "show": "s = 'abba'", "trace": list("abba"),
     "why": "At the last 'a', the earlier 'a' is at index 0, but the window already starts at 2 (after the second 'b'). Moving lo to 0 + 1 = 1 would move it backwards and give 3. Use lo = max(lo, last[ch] + 1)."},
    {"name": "Repeat right after the start", "args": "('dvdf',)", "show": "s = 'dvdf'",
     "why": "'vdf' has length 3. If you got 2, the code restarts the window after the repeat itself, not after the earlier copy of it."},
    {"name": "One code", "args": "('x',)", "show": "s = 'x'", "why": "One character is a run of length 1. If you got 0, the length is only counted when a repeat is found, so a run that reaches the end is never counted."},
    {"name": "50,000 different codes", "args": "(''.join(chr(0x4E00 + i) for i in range(50_000)),)", "timeout": 4000, "show": "s = 50,000 different characters",
     "why": "No character repeats, so the answer is 50,000. Starting again from every position and walking forward is about n² / 2 steps (n times n, halved): over a billion here. Keep one window, and move each end only forwards."},
    {"name": "200,000 letters", "args": "(''.join(chr(97 + (i * i) % 26) for i in range(200_000)),)", "timeout": 4000, "show": "s = 200,000 lower-case letters",
     "why": "A sliding window is O(n), so its time grows in step with n: each end moves at most n times. If this timed out, look for a slice or a 'ch in window_string' check inside the loop, which costs O(window) each time."},
], trusted="""
def longest_unique(s):
    last = {}
    lo = 0
    best = 0
    for hi, ch in enumerate(s):
        if ch in last and last[ch] >= lo:
            lo = last[ch] + 1
        last[ch] = hi
        best = max(best, hi - lo + 1)
    return best
""")

# P3 section_loads (difference array)
build(S, 3, "section_loads", [
    {"name": "Three trips", "args": "(6, [[1, 3, 4], [2, 5, 2], [0, 1, 1]])", "show": "n = 6, trips = [[1, 3, 4], [2, 5, 2], [0, 1, 1]]",
     "why": "Section 0: 1. Section 1: 4 + 1 = 5. Sections 2 and 3: 4 + 2 = 6. Sections 4 and 5: 2. So [1, 5, 6, 6, 2, 2]. If the ends are off by one, check that both l and r are included."},
    {"name": "No trips", "args": "(4, [])", "show": "n = 4, trips = []", "why": "Nobody travels: [0, 0, 0, 0]. If you got [] or an error, the answer list is built from the trips instead of from n."},
    {"name": "A trip to the last section", "args": "(3, [[0, 2, 5]])", "show": "n = 3, trips = [[0, 2, 5]]",
     "why": "r = n - 1, so the -5 goes into d[n]. If you got an IndexError, make the difference list one longer than n: [0] * (n + 1)."},
    {"name": "One section", "args": "(5, [[3, 3, 7]])", "show": "n = 5, trips = [[3, 3, 7]]", "why": "l = r = 3: only section 3 gets 7. If section 4 also got 7, or none did, the end of the range is off by one: subtract at r + 1, not at r."},
    {"name": "Overlapping trips", "args": "(5, [[0, 4, 1], [0, 4, 1], [2, 2, 10]])", "show": "n = 5, trips = [[0, 4, 1], [0, 4, 1], [2, 2, 10]]",
     "why": "Updates add up: [2, 2, 12, 2, 2]. Use += on the difference list, not =."},
    {"name": "200,000 long trips", "args": "(200_000, [[i % 1000, 199_999 - i % 1000, 1 + i % 3] for i in range(200_000)])", "expr": "(lambda out: [len(out), out[:3], out[500], out[100_000], out[-1], sum(out)])(section_loads(*args))", "timeout": 5000,
     "show": "n = 200,000 sections, 200,000 trips that each cover most of the line; checks the length, some sections and the total",
     "why": "Adding each trip section by section is about 40 billion additions. With a difference list each trip is two writes, then one running total: O(n + trips)."},
], trusted="""
def section_loads(n, trips):
    d = [0] * (n + 1)
    for l, r, k in trips:
        d[l] += k
        d[r + 1] -= k
    out = []
    s = 0
    for i in range(n):
        s += d[i]
        out.append(s)
    return out
""")

# P4 spiral
build(S, 4, "spiral", [
    {"name": "3 by 3", "args": "([[1, 2, 3], [4, 5, 6], [7, 8, 9]],)", "show": "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
     "why": "Round the outside: 1 2 3 6 9 8 7 4, then the middle 5. If 5 is missing or doubled, check the loop condition: keep going while top <= bottom and left <= right."},
    {"name": "3 by 4", "args": "([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],)", "show": "grid = 3 rows, 4 columns",
     "why": "The middle is one row, 6 7. If you see 6 or 7 twice, the bottom row was walked again after top passed bottom. Check top <= bottom before the bottom row."},
    {"name": "4 by 3", "args": "([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]],)", "show": "grid = 4 rows, 3 columns",
     "why": "The middle is one column, 5 8. If you see them twice, check left <= right before walking up the left column. A square grid would never show this bug."},
    {"name": "One row", "args": "([[1, 2, 3, 4]],)", "show": "grid = [[1, 2, 3, 4]]",
     "why": "Just the row, once: [1, 2, 3, 4]. If it comes back reversed as well, the two checks in the middle of the loop are missing."},
    {"name": "One column", "args": "([[1], [2], [3]],)", "show": "grid = [[1], [2], [3]]", "why": "Down the column, once: [1, 2, 3]. If a value comes twice, the walk back up the left side runs without checking that left is still at most right."},
    {"name": "One cell", "args": "([[7]],)", "show": "grid = [[7]]", "why": "The single value, once: [7]. If you got [7, 7] or [], the loop visits the cell twice or stops before it: check the limits after each side."},
    {"name": "Empty grid", "args": "([],)", "show": "grid = []", "why": "No rows: return []. grid[0] does not exist here, so check for an empty grid before reading len(grid[0])."},
    {"name": "Grid not changed", "args": "([[1, 2], [3, 4]],)", "expr": "(lambda g: [spiral(g), g])(args[0])", "show": "g = [[1, 2], [3, 4]]; returns [spiral(g), g]",
     "why": "Read the grid without changing it. Removing rows with pop() gives the right order but destroys the input, and pop(0) is O(n) each time."},
    {"name": "500 by 400", "args": "([[r * 400 + c for c in range(400)] for r in range(500)],)", "expr": "(lambda out: [len(out), out[:5], out[-3:], sorted(out) == list(range(200_000))])(spiral(args[0]))", "timeout": 4000,
     "show": "a 500 × 400 grid; checks the length, the ends, and that every cell appears once",
     "why": "Every cell must appear exactly once. If the length is wrong, some side is walked twice or skipped."},
], trusted="""
def spiral(grid):
    if not grid:
        return []
    out = []
    top, bottom, left, right = 0, len(grid) - 1, 0, len(grid[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(grid[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(grid[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(grid[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(grid[r][left])
            left += 1
    return out
""")

# P5 almost_palindrome
build(S, 5, "almost_palindrome", [
    {"name": "Delete one", "args": "('abca',)", "show": "s = 'abca'", "trace": list("abca"),
     "why": "Delete 'b' or 'c' and the rest reads the same both ways. If you got False, the code gives up at the first mismatch instead of trying a deletion."},
    {"name": "Already a palindrome", "args": "('racecar',)", "show": "s = 'racecar'", "why": "No deletion needed. 'At most one' includes zero."},
    {"name": "Needs two deletions", "args": "('abcda',)", "show": "s = 'abcda'",
     "why": "'b' and 'd' differ. Deleting either still leaves 'cd' or 'bc', which are not palindromes. So the answer is False. If you got True, the code may allow a second deletion."},
    {"name": "Only the right deletion works", "args": "('abbca',)", "show": "s = 'abbca'", "trace": list("abbca"),
     "why": "At the mismatch, 'b' (left) and 'c' (right) differ. Deleting the left one leaves 'bc'; deleting the right one leaves 'bb'. You must try both."},
    {"name": "Only the left deletion works", "args": "('acbba',)", "show": "s = 'acbba'",
     "why": "The mirror case: here deleting the left character works and the right one does not. Try both sides, and return True if either works."},
    {"name": "Short strings", "args": "()", "expr": "[almost_palindrome(''), almost_palindrome('a'), almost_palindrome('ab')]", "expect": "[True, True, True]", "show": "'', 'a' and 'ab'",
     "why": "Each of these is a palindrome after at most one deletion. 'ab' becomes 'a'."},
    {"name": "Delete at the very end", "args": "('eeeed',)", "show": "s = 'eeeed'", "why": "Delete the 'd' and 'eeee' is left. Check that the inner check covers the ends of the string too."},
    {"name": "200,000 letters, True", "args": "('a' * 99_999 + 'b' + 'a' * 100_000,)", "timeout": 4000, "show": "s = 99,999 a's, then b, then 100,000 a's",
     "why": "Deleting the last 'a' makes it a palindrome. Trying every deletion and checking the rest is about n² steps (n times n: 40 billion here). Two pointers find the only place where a deletion can help, and then try just two options."},
    {"name": "200,000 letters, False", "args": "('a' * 100_000 + 'bc' + 'a' * 99_998,)", "timeout": 4000, "show": "s = 100,000 a's, then 'bc', then 99,998 a's",
     "why": "No single deletion works. At the first mismatch, try the two deletions once each and stop. If this timed out, the code tries every position, or keeps trying after a failed check."},
], trusted="""
def almost_palindrome(s):
    def pal(lo, hi):
        while lo < hi:
            if s[lo] != s[hi]:
                return False
            lo += 1
            hi -= 1
        return True
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if s[lo] != s[hi]:
            return pal(lo + 1, hi) or pal(lo, hi - 1)
        lo += 1
        hi -= 1
    return True
""")
