# Naive ADDP solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def total_distance(n, roads):
    # a search from every station: O(n^2)
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    out = []
    for s in range(n):
        dist = [-1] * n
        dist[s] = 0
        stack = [s]
        total = 0
        while stack:
            v = stack.pop()
            total += dist[v]
            for u, w in adj[v]:
                if dist[u] < 0:
                    dist[u] = dist[v] + w
                    stack.append(u)
        out.append(total)
    return out
''', [8, 9, 10]),
    2: ('''
def most_collected(n, streets, value, s):
    # every (junction, set of junctions visited) state
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    start = (s, 1 << s)
    seen = {start}
    stack = [start]
    best = 0
    while stack:
        v, m = stack.pop()
        best = max(best, sum(value[i] for i in range(n) if m >> i & 1))
        for u in out[v]:
            t = (u, m | 1 << u)
            if t not in seen:
                seen.add(t)
                stack.append(t)
    return best
''', [12, 13, 14, 15, 16]),
    3: ('''
from itertools import permutations

def cheapest_cuts(length, marks):
    # try every order of the cuts
    best = None
    for order in permutations(marks):
        pieces = [(0, length)]
        cost = 0
        for c in order:
            for k, (a, b) in enumerate(pieces):
                if a < c < b:
                    cost += b - a
                    pieces[k:k + 1] = [(a, c), (c, b)]
                    break
        best = cost if best is None else min(best, cost)
    return best if best is not None else 0
''', [7, 8, 9, 10]),
    4: ('''
from itertools import permutations

def fewest_wagons(weights, cap):
    # every loading order, each wagon filled in turn
    if not weights:
        return 0
    best = len(weights)
    for order in permutations(weights):
        t, load = 1, 0
        for w in order:
            if load + w <= cap:
                load += w
            else:
                t, load = t + 1, w
        best = min(best, t)
    return best
''', [8, 9, 10]),
    5: ('''
def count_no_repeat(a, b):
    # look at every number
    count = 0
    for x in range(a, b + 1):
        s = str(x)
        if all(s[k] != s[k + 1] for k in range(len(s) - 1)):
            count += 1
    return count
''', [8, 9, 10, 11]),
    6: ('''
def cheapest_trip(x, c):
    # try every earlier stop: O(n^2)
    n = len(x)
    best = [0] * n
    for j in range(1, n):
        best[j] = min(best[i] + (x[j] - x[i]) ** 2 + c for i in range(j))
    return best[-1]
''', [8, 9, 10]),
}

# Wrong versions run by hand (not by check-problems.py): each must fail the tests listed.
EXTRA = {
    "1 recursive": (1, '''
def total_distance(n, roads):
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    size = [1] * n
    down = [0] * n
    total = [0] * n
    def up(v, p):
        for u, w in adj[v]:
            if u != p:
                up(u, v)
                size[v] += size[u]
                down[v] += down[u] + w * size[u]
    def dn(v, p):
        for u, w in adj[v]:
            if u != p:
                total[u] = total[v] + w * (n - 2 * size[u])
                dn(u, v)
    up(0, -1)
    total[0] = down[0]
    dn(0, -1)
    return total
''', [8, 10]),
    "1 lengths ignored": (1, '''
def total_distance(n, roads):
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    order = [0]
    seen = [False] * n
    seen[0] = True
    for v in order:
        for u in adj[v]:
            if not seen[u]:
                seen[u] = True
                parent[u] = v
                order.append(u)
    size = [1] * n
    down = [0] * n
    for v in reversed(order):
        p = parent[v]
        if p >= 0:
            size[p] += size[v]
            down[p] += down[v] + size[v]
    total = [0] * n
    total[0] = down[0]
    for v in order[1:]:
        total[v] = total[parent[v]] + n - 2 * size[v]
    return total
''', [1, 3, 5, 6, 8, 9, 10]),
    "2 simple paths only": (2, '''
def most_collected(n, streets, value, s):
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    best = 0
    on = [False] * n
    def go(v, tot):
        nonlocal best
        best = max(best, tot)
        for u in out[v]:
            if not on[u]:
                on[u] = True
                go(u, tot + value[u])
                on[u] = False
    on[s] = True
    go(s, value[s])
    return best
''', [4, 12, 13, 14, 15, 16]),
    "2 greedy richest next": (2, '''
def most_collected(n, streets, value, s):
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    got = {s}
    v = s
    while True:
        new = [u for u in out[v] if u not in got]
        if not new:
            break
        v = max(new, key=lambda u: value[u])
        got.add(v)
    return sum(value[u] for u in got)
''', [9]),
    "3 middle first": (3, '''
def cheapest_cuts(length, marks):
    def go(a, b, ms):
        if not ms:
            return 0
        mid = (a + b) / 2
        c = min(ms, key=lambda m: (abs(m - mid), m))
        return b - a + go(a, c, [m for m in ms if m < c]) + go(c, b, [m for m in ms if m > c])
    return go(0, length, sorted(marks))
''', [5]),
    "3 no memo": (3, '''
def cheapest_cuts(length, marks):
    p = [0] + sorted(marks) + [length]
    def go(i, j):
        if j - i < 2:
            return 0
        return p[j] - p[i] + min(go(i, k) + go(k, j) for k in range(i + 1, j))
    return go(0, len(p) - 1)
''', [8, 9, 10]),
    "3 rows top down": (3, '''
def cheapest_cuts(length, marks):
    p = [0] + sorted(marks) + [length]
    m = len(p)
    best = [[0] * m for _ in range(m)]
    for i in range(m):
        for j in range(i + 2, m):
            best[i][j] = p[j] - p[i] + min(best[i][k] + best[k][j] for k in range(i + 1, j))
    return best[0][m - 1]
''', [3, 4, 5, 7, 8, 9, 10]),
    "4 largest first": (4, '''
def fewest_wagons(weights, cap):
    loads = []
    for x in sorted(weights, reverse=True):
        for k in range(len(loads)):
            if loads[k] + x <= cap:
                loads[k] += x
                break
        else:
            loads.append(x)
    return len(loads)
''', [5]),
    "4 submasks 3^n": (4, '''
def fewest_wagons(weights, cap):
    n = len(weights)
    if n == 0:
        return 0
    tot = [0] * (1 << n)
    for m in range(1, 1 << n):
        low = (m & -m).bit_length() - 1
        tot[m] = tot[m & (m - 1)] + weights[low]
    best = [0] + [n + 1] * ((1 << n) - 1)
    for mask in range(1, 1 << n):
        low = mask & -mask
        sub = mask
        while sub:
            if sub & low and tot[sub] <= cap:
                best[mask] = min(best[mask], best[mask ^ sub] + 1)
            sub = (sub - 1) & mask
    return best[-1]
''', [9, 10]),
    "5 zeros as digits": (5, '''
from functools import cache

def count_no_repeat(a, b):
    def upto(x):
        if x < 0:
            return 0
        s = str(x).zfill(19)
        @cache
        def go(i, prev, tight):
            if i == len(s):
                return 1
            top = int(s[i]) if tight else 9
            return sum(go(i + 1, d, tight and d == top) for d in range(top + 1) if d != prev)
        return go(0, -1, True)
    return upto(b) - upto(a - 1)
''', [1, 2, 6, 8]),
    "5 minus f(a)": (5, '''
from functools import cache

def count_no_repeat(a, b):
    def upto(x):
        if x < 0:
            return 0
        s = str(x)
        @cache
        def go(i, prev, tight, started):
            if i == len(s):
                return 1
            top = int(s[i]) if tight else 9
            total = 0
            for d in range(top + 1):
                if started and d == prev:
                    continue
                now = started or d != 0
                total += go(i + 1, d if now else -1, tight and d == top, now)
            return total
        return go(0, -1, True, False)
    return upto(b) - upto(a)
''', [0, 1, 3, 5, 7]),
    "6 look back 100": (6, '''
def cheapest_trip(x, c):
    n = len(x)
    best = [0] * n
    for j in range(1, n):
        best[j] = min(best[i] + (x[j] - x[i]) ** 2 + c for i in range(max(0, j - 100), j))
    return best[-1]
''', [10]),
}
