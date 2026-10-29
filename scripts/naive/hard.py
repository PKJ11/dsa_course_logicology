# Naive HARD solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
from itertools import product

def find_assignment(n, clauses, sat):
    # try every assignment, without the helper
    for vals in product([False, True], repeat=n):
        if all(any(vals[l - 1] if l > 0 else not vals[-l - 1] for l in c) for c in clauses):
            return list(vals)
    return None
''', [9, 10]),
    2: ('''
from itertools import product

def colouring_formula(n, edges):
    # solve the colouring first, then write the answer down
    for col in product(range(3), repeat=n):
        if all(col[u] != col[v] for u, v in edges):
            return [[3 * v + col[v] + 1] for v in range(n)]
    return [[1], [-1]]
''', [7, 8]),
    3: ('''
def best_value(items, cap):
    # every subset
    n = len(items)
    best = 0
    for m in range(1 << n):
        w = v = 0
        for i in range(n):
            if m >> i & 1:
                w += items[i][0]
                v += items[i][1]
        if w <= cap and v > best:
            best = v
    return best
''', [7, 8, 9, 10]),
    4: ('''
from itertools import product

def schedule(jobs, m):
    # the best of every assignment
    best, pick = None, None
    for a in product(range(m), repeat=len(jobs)):
        load = [0] * m
        for j, k in enumerate(a):
            load[k] += jobs[j]
        if best is None or max(load) < best:
            best, pick = max(load), list(a)
    return pick if pick is not None else []
''', [7, 8]),
    5: ('''
def is_prime(n):
    # trial division
    if n < 2:
        return False
    k = 2
    while k * k <= n:
        if n % k == 0:
            return False
        k += 1
    return True
''', [7, 8, 9, 10, 11]),
}

# Wrong versions run by hand (not by check-problems.py): each must fail the tests listed.
EXTRA = {
    "1 both values asked": (1, '''
def find_assignment(n, clauses, sat):
    if not sat(clauses):
        return None
    fixed = list(clauses)
    answer = []
    for x in range(1, n + 1):
        t, f = sat(fixed + [[x]]), sat(fixed + [[-x]])
        fixed.append([x] if t else [-x])
        answer.append(t)
    return answer
''', [0, 1, 3, 4, 5, 7, 8, 9]),
    "1 choices forgotten": (1, '''
def find_assignment(n, clauses, sat):
    if not sat(clauses):
        return None
    return [sat(clauses + [[x]]) for x in range(1, n + 1)]
''', [7]),
    "1 no first question": (1, '''
def find_assignment(n, clauses, sat):
    fixed = list(clauses)
    answer = []
    for x in range(1, n + 1):
        if sat(fixed + [[x]]):
            fixed.append([x])
            answer.append(True)
        else:
            fixed.append([-x])
            answer.append(False)
    return answer
''', [2, 6, 10]),
    "2 no edge clauses": (2, '''
def colouring_formula(n, edges):
    return [[3 * v + 1, 3 * v + 2, 3 * v + 3] for v in range(n)]
''', [2, 3, 7, 8]),
    "2 no group needed": (2, '''
def colouring_formula(n, edges):
    f = []
    for u, v in edges:
        for c in range(3):
            f.append([-(3 * u + c + 1), -(3 * v + c + 1)])
    return f
''', [0, 7, 8]),
    "3 greedy by value per kg": (3, '''
def best_value(items, cap):
    total = 0
    for w, v in sorted(items, key=lambda t: t[1] / t[0], reverse=True):
        if w <= cap:
            cap -= w
            total += v
    return total
''', [3, 4]),
    "3 weak bound": (3, '''
def best_value(items, cap):
    its = sorted(items, key=lambda t: t[1] / t[0], reverse=True)
    n = len(its)
    rest = [0] * (n + 1)
    for k in range(n - 1, -1, -1):
        rest[k] = rest[k + 1] + its[k][1]
    best = 0
    def go(k, room, value):
        nonlocal best
        best = max(best, value)
        if k == n or value + rest[k] <= best:
            return
        w, v = its[k]
        if w <= room:
            go(k + 1, room - w, value + v)
        go(k + 1, room, value)
    go(0, cap, 0)
    return best
''', [8, 9, 10]),
    "4 given order": (4, '''
def schedule(jobs, m):
    load = [0] * m
    out = []
    for x in jobs:
        k = load.index(min(load))
        load[k] += x
        out.append(k)
    return out
''', [2]),
    "4 scan every machine": (4, '''
def schedule(jobs, m):
    load = [0] * m
    out = [0] * len(jobs)
    for j in sorted(range(len(jobs)), key=lambda j: -jobs[j]):
        k = load.index(min(load))
        load[k] += jobs[j]
        out[j] = k
    return out
''', [7]),
    "5 Fermat base 2": (5, '''
def is_prime(n):
    if n < 4:
        return n in (2, 3)
    return pow(2, n - 1, n) == 1
''', [1, 2]),
    "5 base 2 only": (5, '''
def is_prime(n):
    if n < 4:
        return n in (2, 3)
    if n % 2 == 0:
        return False
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    x = pow(2, d, n)
    if x in (1, n - 1):
        return True
    for _ in range(s - 1):
        x = x * x % n
        if x == n - 1:
            return True
    return False
''', [3, 4, 5, 6]),
    "5 twelve bases": (5, '''
BASES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

def is_prime(n):
    if n < 2:
        return False
    for p in BASES:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in BASES:
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True
''', [6]),
}
