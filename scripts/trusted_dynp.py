"""Trusted DYNP solutions, shared by build_dynp.py and the brute-force cross-check (cross_dynp.py)."""

SHAPES = """
def shapes(n):
    count = [1] * (n + 1)
    for m in range(2, n + 1):
        count[m] = sum(count[i] * count[m - 1 - i] for i in range(m))
    return count[n]
"""

SHAPES_BRUTE = """
def shapes(n):
    # build every tree shape over n keys and count them
    def all_shapes(lo, hi):
        if lo > hi:
            return [None]
        out = []
        for root in range(lo, hi + 1):
            for l in all_shapes(lo, root - 1):
                for r in all_shapes(root + 1, hi):
                    out.append((root, l, r))
        return out
    return len(all_shapes(1, n))
"""

EXCHANGE = """
def exchange(n):
    memo = {}
    def best(m):
        if m < 12:
            return m
        if m not in memo:
            memo[m] = max(m, best(m // 2) + best(m // 3) + best(m // 4))
        return memo[m]
    return best(n)
"""

EXCHANGE_BRUTE = """
def exchange(n):
    best = [0] * (n + 1)
    for m in range(1, n + 1):
        best[m] = max(m, best[m // 2] + best[m // 3] + best[m // 4])
    return best[n]
"""

DECODE = """
def decode_ways(s):
    MOD = 1_000_000_007
    before, cur = 1, 1          # ways for s[:i-1] and s[:i], starting with i = 0
    for i in range(1, len(s) + 1):
        ways = cur if s[i - 1] != "0" else 0
        if i >= 2 and (s[i - 2] == "1" or (s[i - 2] == "2" and s[i - 1] <= "6")):
            ways += before
        before, cur = cur, ways % MOD
    return cur
"""

DECODE_BRUTE = """
def decode_ways(s):
    def go(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        total = go(i + 1)
        if i + 1 < len(s) and 10 <= int(s[i:i + 2]) <= 26:
            total += go(i + 2)
        return total
    return go(0) % 1_000_000_007
"""

TICKETS = """
import bisect

def season_tickets(days, passes):
    n = len(days)
    best = [0] * (n + 1)        # best[i]: cheapest cover for trips i, i + 1, ..., n - 1
    for i in range(n - 1, -1, -1):
        cheapest = None
        for length, price in passes:
            j = bisect.bisect_left(days, days[i] + length, i)
            cost = price + best[j]
            if cheapest is None or cost < cheapest:
                cheapest = cost
        best[i] = cheapest
    return best[0]
"""

TICKETS_BRUTE = """
def season_tickets(days, passes):
    from functools import lru_cache
    @lru_cache(maxsize=None)
    def go(i):
        if i == len(days):
            return 0
        out = None
        for length, price in passes:
            j = i
            while j < len(days) and days[j] < days[i] + length:
                j += 1
            c = price + go(j)
            out = c if out is None else min(out, c)
        return out
    return go(0)
"""

SQUARE = """
def largest_square(rows):
    if not rows:
        return 0
    w = len(rows[0])
    prev = [0] * (w + 1)
    best = 0
    for line in rows:
        cur = [0] * (w + 1)
        for c in range(w):
            if line[c] == ".":
                s = 1 + min(prev[c], prev[c + 1], cur[c])
                cur[c + 1] = s
                if s > best:
                    best = s
        prev = cur
    return best
"""

SQUARE_BRUTE = """
def largest_square(rows):
    best = 0
    h = len(rows)
    w = len(rows[0]) if rows else 0
    for r in range(h):
        for c in range(w):
            k = 1
            while r + k <= h and c + k <= w and all(rows[rr][cc] == "." for rr in range(r, r + k) for cc in range(c, c + k)):
                best = max(best, k)
                k += 1
    return best
"""

NEST = """
import bisect

def nest(boxes):
    order = sorted(boxes, key=lambda b: (b[0], -b[1]))
    tails = []
    for w, h in order:
        k = bisect.bisect_left(tails, h)
        if k == len(tails):
            tails.append(h)
        else:
            tails[k] = h
    return len(tails)
"""

NEST_BRUTE = """
def nest(boxes):
    n = len(boxes)
    order = sorted(range(n), key=lambda i: boxes[i])
    best = [1] * n
    for a in range(n):
        for b in range(a):
            i, j = order[b], order[a]
            if boxes[i][0] < boxes[j][0] and boxes[i][1] < boxes[j][1]:
                best[a] = max(best[a], best[b] + 1)
    return max(best, default=0)
"""

EDIT = """
def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        x = a[i - 1]
        for j in range(1, len(b) + 1):
            if x == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                d = prev[j - 1]
                if prev[j] < d:
                    d = prev[j]
                if cur[j - 1] < d:
                    d = cur[j - 1]
                cur[j] = d + 1
        prev = cur
    return prev[len(b)]
"""

EDIT_BRUTE = """
def edit_distance(a, b):
    def go(i, j):
        if i == len(a):
            return len(b) - j
        if j == len(b):
            return len(a) - i
        if a[i] == b[j]:
            return go(i + 1, j + 1)
        return 1 + min(go(i + 1, j), go(i, j + 1), go(i + 1, j + 1))
    return go(0, 0)
"""

WAYS = """
def ways_to_pay(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for x in range(c, amount + 1):
            ways[x] += ways[x - c]
    return ways[amount]
"""

WAYS_BRUTE = """
def ways_to_pay(amount, coins):
    def go(k, left):
        if left == 0:
            return 1
        if k == len(coins):
            return 0
        total = 0
        use = 0
        while use * coins[k] <= left:
            total += go(k + 1, left - use * coins[k])
            use += 1
        return total
    return go(0, amount)
"""

PACK = """
def pack(items, cap):
    n = len(items)
    best = [[0] * (cap + 1)]
    for w, v in items:
        prev = best[-1]
        row = prev[:]
        for x in range(w, cap + 1):
            t = prev[x - w] + v
            if t > row[x]:
                row[x] = t
        best.append(row)
    chosen = []
    x = cap
    for i in range(n, 0, -1):
        if best[i][x] != best[i - 1][x]:
            chosen.append(i - 1)
            x -= items[i - 1][0]
    return chosen[::-1]
"""

PACK_BRUTE = """
def pack_value(items, cap):
    best = 0
    n = len(items)
    for mask in range(1 << n):
        w = v = 0
        for i in range(n):
            if mask >> i & 1:
                w += items[i][0]
                v += items[i][1]
        if w <= cap and v > best:
            best = v
    return best
"""
