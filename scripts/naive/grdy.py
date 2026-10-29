# Naive GRDY solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def how_much(capacity, items):
    # most valuable first: the wrong greedy rule
    take = [0] * len(items)
    for i in sorted(range(len(items)), key=lambda i: items[i][1], reverse=True):
        take[i] = min(items[i][0], capacity)
        capacity -= take[i]
    return take
''', [0, 5]),
    2: ('''
def least_lateness(jobs):
    # least slack first (deadline minus length): the wrong rule
    t = worst = 0
    for length, due in sorted(jobs, key=lambda j: j[1] - j[0]):
        t += length
        worst = max(worst, t - due)
    return worst
''', [5]),
    3: ('''
def most_bookings(bookings):
    # starts first: the wrong rule
    order = sorted(range(len(bookings)), key=lambda i: bookings[i][0])
    out, free = [], float("-inf")
    for i in order:
        s, e = bookings[i]
        if s >= free:
            out.append(i)
            free = e
    return out
''', [0, 3]),
    4: ('''
def platforms(trains):
    # for every train, count the trains in at its arrival: O(n^2)
    best = 0
    for a, d in trains:
        best = max(best, sum(1 for b, e in trains if b <= a < e))
    return best
''', [7]),
    5: ('''
def huffman(counts):
    # sort again after every join: O(k^2 log k)
    trees = [(w, s) for s, w in counts.items()]
    if len(trees) == 1:
        return {trees[0][1]: "0"}
    while len(trees) > 1:
        trees.sort(key=lambda t: t[0])
        (wa, a), (wb, b) = trees[0], trees[1]
        trees = trees[2:] + [(wa + wb, (a, b))]
    codes = {}
    stack = [(trees[0][1], "")]
    while stack:
        t, c = stack.pop()
        if isinstance(t, tuple):
            stack.append((t[0], c + "0"))
            stack.append((t[1], c + "1"))
        else:
            codes[t] = c
    return codes
''', [7]),
    6: ('''
def first_failure(coins):
    # only checks amounts up to the largest coin
    coins = sorted(coins)
    top = coins[-1]
    fewest = [0] * (top + 1)
    for x in range(1, top + 1):
        fewest[x] = 1 + min(fewest[x - c] for c in coins if c <= x)
        g, y = 0, x
        for c in reversed(coins):
            g += y // c
            y %= c
        if g > fewest[x]:
            return x
    return None
''', [2, 8]),
}

# More wrong versions, run by hand (not part of check-problems.py):
EXTRA = {
    1: ('''
def how_much(capacity, items):
    # lightest first
    take = [0] * len(items)
    for i in sorted(range(len(items)), key=lambda i: items[i][0]):
        take[i] = min(items[i][0], capacity)
        capacity -= take[i]
    return take
''', [0, 6]),
    1.5: ('''
def how_much(capacity, items):
    # right rule, but picks the best remaining item with a scan: O(n^2)
    left = list(range(len(items)))
    take = [0] * len(items)
    while capacity > 0 and left:
        k = max(range(len(left)), key=lambda j: items[left[j]][1] / items[left[j]][0])
        i = left.pop(k)
        take[i] = min(items[i][0], capacity)
        capacity -= take[i]
    return take
''', [9]),
    2: ('''
def least_lateness(jobs):
    # shortest first
    t = worst = 0
    for length, due in sorted(jobs):
        t += length
        worst = max(worst, t - due)
    return worst
''', [4]),
    3: ('''
def most_bookings(bookings):
    # shortest first
    order = sorted(range(len(bookings)), key=lambda i: bookings[i][1] - bookings[i][0])
    chosen = []
    for i in order:
        s, e = bookings[i]
        if all(e <= bookings[j][0] or bookings[j][1] <= s for j in chosen):
            chosen.append(i)
    return sorted(chosen, key=lambda i: bookings[i][0])
''', [0, 4]),
    4: ('''
def platforms(trains):
    # a departure and an arrival at the same time are counted together
    import heapq
    busy = []
    for a, d in sorted(trains):
        if busy and busy[0] < a:
            heapq.heapreplace(busy, d)
        else:
            heapq.heappush(busy, d)
    return len(busy)
''', [3]),
    6: ('''
def first_failure(coins):
    # no table: fewest coins found by plain recursion
    coins = sorted(coins)
    def fewest(x):
        if x == 0:
            return 0
        return 1 + min(fewest(x - c) for c in coins if c <= x)
    if len(coins) < 2:
        return None
    for x in range(1, coins[-1] + coins[-2]):
        g, y = 0, x
        for c in reversed(coins):
            g += y // c
            y %= c
        if g > fewest(x):
            return x
    return None
''', [1, 8, 9]),
}
