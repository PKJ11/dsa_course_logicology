# Naive and buggy ARRS solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def pair_with_sum(a, target):
    seen = {}
    for j, x in enumerate(a):
        if target - x in seen:
            return [seen[target - x], j]
        seen[x] = j
    return []
''', [2]),
    2: ('''
def longest_unique(s):
    best = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                break
            seen.add(s[j])
        best = max(best, len(seen))
    return best
''', [7]),
    3: ('''
def section_loads(n, trips):
    out = [0] * n
    for l, r, k in trips:
        for i in range(l, r + 1):
            out[i] += k
    return out
''', [5]),
    4: ('''
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
        for c in range(right, left - 1, -1):
            out.append(grid[bottom][c])
        bottom -= 1
        for r in range(bottom, top - 1, -1):
            out.append(grid[r][left])
        left += 1
    return out
''', [1, 3]),
    5: ('''
def almost_palindrome(s):
    if s == s[::-1]:
        return True
    for i in range(len(s)):
        t = s[:i] + s[i + 1:]
        if t == t[::-1]:
            return True
    return False
''', [7, 8]),
}
