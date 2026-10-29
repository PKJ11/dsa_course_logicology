# Naive DYNP solutions and the tests (0-based) that must catch them.
# Tables sized by a huge number (exchange up to n, tickets by calendar day) are not run here:
# allocating billions of entries could swap the machine instead of failing.
NAIVE = {
    1: ('''
def shapes(n):
    # plain recursion: about 3^n calls
    if n <= 1:
        return 1
    return sum(shapes(i) * shapes(n - 1 - i) for i in range(n))
''', [6, 7, 8]),
    2: ('''
def exchange(n):
    # plain recursion, no memo
    if n == 0:
        return 0
    return max(n, exchange(n // 2) + exchange(n // 3) + exchange(n // 4))
''', [6, 7, 8]),
    3: ('''
def decode_ways(s):
    # plain recursion: Fibonacci-many calls
    def go(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        total = go(i + 1)
        if i + 1 < len(s) and (s[i] == "1" or (s[i] == "2" and s[i + 1] <= "6")):
            total += go(i + 2)
        return total
    return go(0) % 1_000_000_007
''', [8, 9, 10]),
    4: ('''
def season_tickets(days, passes):
    # the right table, but each pass's end is found by walking forward one trip at a time
    n = len(days)
    best = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        out = None
        for length, price in passes:
            j = i
            while j < n and days[j] < days[i] + length:
                j += 1
            c = price + best[j]
            out = c if out is None else min(out, c)
        best[i] = out
    return best[0]
''', [7]),
    5: ('''
def largest_square(rows):
    # grow a square from every cell, checking only the new row and column: O(n^3)
    h = len(rows)
    w = len(rows[0]) if rows else 0
    best = 0
    for r in range(h):
        for c in range(w):
            k = 0
            while r + k < h and c + k < w:
                if any(rows[r + k][cc] != "." for cc in range(c, c + k + 1)):
                    break
                if any(rows[rr][c + k] != "." for rr in range(r, r + k)):
                    break
                k += 1
            best = max(best, k)
    return best
''', [7]),
    6: ('''
def nest(boxes):
    # the O(n^2) table
    order = sorted(boxes)
    best = [1] * len(order)
    for i in range(len(order)):
        for j in range(i):
            if order[j][0] < order[i][0] and order[j][1] < order[i][1] and best[j] + 1 > best[i]:
                best[i] = best[j] + 1
    return max(best, default=0)
''', [8, 9]),
    7: ('''
def edit_distance(a, b):
    # plain recursion: three choices at every mismatch
    def go(i, j):
        if i == len(a):
            return len(b) - j
        if j == len(b):
            return len(a) - i
        if a[i] == b[j]:
            return go(i + 1, j + 1)
        return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))
    return go(0, 0)
''', [7, 8, 9]),
    8: ('''
def ways_to_pay(amount, coins):
    # amounts on the outside: counts orders (1+2 and 2+1 twice)
    ways = [1] + [0] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x:
                ways[x] += ways[x - c]
    return ways[amount]
''', [0, 1, 5, 6]),
    9: ('''
def pack(items, cap):
    # greedy: best value per kilogram first
    order = sorted(range(len(items)), key=lambda i: items[i][1] / items[i][0], reverse=True)
    chosen, room = [], cap
    for i in order:
        if items[i][0] <= room:
            chosen.append(i)
            room -= items[i][0]
    return chosen
''', [4]),
}

# Extra wrong versions, run by hand (python check-problems.py does not run these):
EXTRA = {
    3: ('''
from functools import cache
def decode_ways(s):
    @cache
    def go(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        total = go(i + 1)
        if i + 1 < len(s) and (s[i] == "1" or (s[i] == "2" and s[i + 1] <= "6")):
            total += go(i + 2)
        return total % 1_000_000_007
    return go(0)
''', [9, 10]),
    4: ('''
import bisect
def season_tickets(days, passes):
    # a pass covers one day too many
    n = len(days)
    best = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        best[i] = min(p + best[bisect.bisect_right(days, days[i] + l, i)] for l, p in passes)
    return best[0]
''', [4]),
    6: ('''
import bisect
def nest(boxes):
    # sorts equal widths by height rising
    tails = []
    for w, h in sorted(boxes):
        k = bisect.bisect_left(tails, h)
        if k == len(tails):
            tails.append(h)
        else:
            tails[k] = h
    return len(tails)
''', [1]),
    7: ('''
from functools import cache
def edit_distance(a, b):
    @cache
    def go(i, j):
        if i == len(a):
            return len(b) - j
        if j == len(b):
            return len(a) - i
        if a[i] == b[j]:
            return go(i + 1, j + 1)
        return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))
    return go(0, 0)
''', [8, 9]),
    8: ('''
from functools import cache
def ways_to_pay(amount, coins):
    @cache
    def go(k, left):
        if left == 0:
            return 1
        if k == len(coins) or left < 0:
            return 0
        return go(k, left - coins[k]) + go(k + 1, left)
    return go(0, amount)
''', [7, 8]),
    9: ('''
def pack(items, cap):
    # brute force over all subsets
    best, choice = -1, []
    n = len(items)
    for mask in range(1 << n):
        pick = [i for i in range(n) if mask >> i & 1]
        if sum(items[i][0] for i in pick) <= cap:
            v = sum(items[i][1] for i in pick)
            if v > best:
                best, choice = v, pick
    return choice
''', [7, 8]),
}
