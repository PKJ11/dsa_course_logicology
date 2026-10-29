"""Trusted ADDP solutions (as source strings, for tb.build) and brute forces for cross_addp.py."""

# ---------- P1: total distance from every station (rerooting, weighted, no recursion) ----------
P1 = '''
def total_distance(n, roads):
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    parent = [-1] * n
    up = [0] * n                       # length of the road to the parent
    order = [0]                        # BFS order from station 0
    seen = [False] * n
    seen[0] = True
    for v in order:
        for u, w in adj[v]:
            if not seen[u]:
                seen[u] = True
                parent[u] = v
                up[u] = w
                order.append(u)
    size = [1] * n                     # stations in the subtree
    down = [0] * n                     # total distance from v to its subtree
    for v in reversed(order):          # children before parents
        p = parent[v]
        if p >= 0:
            size[p] += size[v]
            down[p] += down[v] + up[v] * size[v]
    total = [0] * n
    total[0] = down[0]
    for v in order[1:]:                # parents before children
        total[v] = total[parent[v]] + up[v] * (n - 2 * size[v])
    return total
'''

# ---------- P2: the most value collected from s (groups, then DP on the DAG of groups) ----------
P2 = '''
def most_collected(n, streets, value, s):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)
    # Pass 1 (Kosaraju): finish order of a search from s, without recursion.
    seen = [False] * n
    finish = []
    seen[s] = True
    stack = [(s, 0)]
    while stack:
        v, i = stack[-1]
        if i < len(out[v]):
            stack[-1] = (v, i + 1)
            u = out[v][i]
            if not seen[u]:
                seen[u] = True
                stack.append((u, 0))
        else:
            stack.pop()
            finish.append(v)
    # Pass 2: reversed streets, latest finish first; groups come out in topological order.
    group = [-1] * n
    k = 0
    for v in reversed(finish):
        if group[v] != -1:
            continue
        group[v] = k
        todo = [v]
        while todo:
            x = todo.pop()
            for u in back[x]:
                if seen[u] and group[u] == -1:
                    group[u] = k
                    todo.append(u)
        k += 1
    worth = [0] * k                    # total value inside each group
    members = [[] for _ in range(k)]
    for v in finish:
        worth[group[v]] += value[v]
        members[group[v]].append(v)
    best = [0] * k                     # best[g]: the most collected from group g on
    # every street goes to the same group or a later one, so fill from the last group back
    for g in range(k - 1, -1, -1):
        m = 0
        for v in members[g]:
            for u in out[v]:
                h = group[u]
                if h != g and best[h] > m:
                    m = best[h]
        best[g] = worth[g] + m
    return best[group[s]]
'''

# ---------- P3: cheapest way to cut a rail (interval DP by length) ----------
P3 = '''
def cheapest_cuts(length, marks):
    p = [0] + sorted(marks) + [length]
    m = len(p)
    best = [[0] * m for _ in range(m)]       # best[i][j]: cut the piece p[i]..p[j] at every mark inside
    for gap in range(2, m):                  # shorter pieces first
        for i in range(m - gap):
            j = i + gap
            best[i][j] = p[j] - p[i] + min(best[i][k] + best[k][j] for k in range(i + 1, j))
    return best[0][m - 1]
'''

# ---------- P4: fewest wagons (bitmask DP over the parcels loaded so far) ----------
P4 = '''
def fewest_wagons(weights, cap):
    n = len(weights)
    if n == 0:
        return 0
    full = 1 << n
    best = [(n + 1, 0)] * full          # (wagons used, load of the last wagon)
    best[0] = (1, 0)
    for mask in range(full):
        t, load = best[mask]
        for i in range(n):
            if not mask >> i & 1:
                w = weights[i]
                c = (t, load + w) if load + w <= cap else (t + 1, w)
                if c < best[mask | 1 << i]:
                    best[mask | 1 << i] = c
    return best[full - 1][0]
'''

# ---------- P5: count numbers with no two equal neighbouring digits ----------
P5 = '''
def count_no_repeat(a, b):
    def upto(x):                       # how many of 0, 1, ..., x
        if x < 0:
            return 0
        if x < 10:
            return x + 1
        s = str(x)
        L = len(s)
        total = 1                      # the number 0
        for k in range(1, L):          # every number with k digits
            total += 9 ** k
        prev = -1
        for i, ch in enumerate(s):     # L digits, at most x
            c = int(ch)
            for d in range(1 if i == 0 else 0, c):
                if d != prev:
                    total += 9 ** (L - 1 - i)
            if c == prev:
                return total           # x itself and everything after this place repeats
            prev = c
        return total + 1               # x itself
    return upto(b) - upto(a - 1)
'''

# A second, general digit DP (memo over position, previous digit, tight, started), for the cross-check.
P5_MEMO = '''
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
    return upto(b) - upto(a - 1)
'''

# ---------- P6: cheapest trip (lines on a lower hull, a deque) ----------
P6 = '''
def cheapest_trip(x, c):
    n = len(x)
    best = [0] * n
    ms = [-2 * x[0]]                   # line k: y = ms[k] * X + bs[k]
    bs = [x[0] * x[0]]
    head = 0
    for j in range(1, n):
        X = x[j]
        # queries move right: drop lines from the front once the next one is lower
        while head + 1 < len(ms) and ms[head + 1] * X + bs[head + 1] <= ms[head] * X + bs[head]:
            head += 1
        best[j] = ms[head] * X + bs[head] + X * X + c
        m, b = -2 * X, best[j] + X * X
        # slopes fall: the last line is never lowest if the new one passes under it
        # before it passes under the line before it
        while len(ms) - head >= 2 and (b - bs[-2]) * (ms[-2] - ms[-1]) <= (bs[-1] - bs[-2]) * (ms[-2] - m):
            ms.pop()
            bs.pop()
        ms.append(m)
        bs.append(b)
    return best[n - 1]
'''


# ---------------- brute forces ----------------

def brute1(n, roads):
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    out = []
    for s in range(n):
        dist = {s: 0}
        st = [s]
        while st:
            v = st.pop()
            for u, w in adj[v]:
                if u not in dist:
                    dist[u] = dist[v] + w
                    st.append(u)
        out.append(sum(dist.values()))
    return out


def brute2(n, streets, value, s):
    """Every (vertex, set of visited vertices) state reachable from s."""
    out = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
    start = (s, 1 << s)
    seen = {start}
    st = [start]
    best = 0
    while st:
        v, m = st.pop()
        best = max(best, sum(value[i] for i in range(n) if m >> i & 1))
        for u in out[v]:
            t = (u, m | 1 << u)
            if t not in seen:
                seen.add(t)
                st.append(t)
    return best


def brute3(length, marks):
    from itertools import permutations
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


def brute4(weights, cap):
    """Every way to split the parcels into groups (set partitions)."""
    n = len(weights)
    if n == 0:
        return 0
    best = n

    def go(i, loads):
        nonlocal best
        if len(loads) >= best:
            return
        if i == n:
            best = len(loads)
            return
        for k in range(len(loads)):
            if loads[k] + weights[i] <= cap:
                loads[k] += weights[i]
                go(i + 1, loads)
                loads[k] -= weights[i]
        loads.append(weights[i])
        go(i + 1, loads)
        loads.pop()
    go(0, [])
    return best


def brute5(a, b):
    return sum(1 for x in range(a, b + 1) if all(p != q for p, q in zip(str(x), str(x)[1:])))


def brute6(x, c):
    n = len(x)
    best = [0] + [None] * (n - 1)
    for j in range(1, n):
        best[j] = min(best[i] + (x[j] - x[i]) ** 2 + c for i in range(j))
    return best[-1]
