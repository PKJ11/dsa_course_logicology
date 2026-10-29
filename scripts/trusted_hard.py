"""Trusted HARD solutions (as source strings, for tb.build) and brute forces for cross_hard.py."""

# ---------- P1: an assignment from a yes/no helper (search from decision) ----------
P1 = '''
def find_assignment(n, clauses, sat):
    if not sat(clauses):               # no assignment at all
        return None
    fixed = [list(c) for c in clauses]
    answer = []
    for x in range(1, n + 1):
        if sat(fixed + [[x]]):         # can x be True, with the choices so far?
            fixed.append([x])
            answer.append(True)
        else:                          # then it must be False
            fixed.append([-x])
            answer.append(False)
    return answer
'''

# ---------- P2: three groups as a formula (3-colouring to SAT) ----------
P2 = '''
def colouring_formula(n, edges):
    def x(v, c):                       # "vertex v has colour c"
        return 3 * v + c + 1
    formula = [[x(v, 0), x(v, 1), x(v, 2)] for v in range(n)]   # at least one colour
    for u, v in edges:
        for c in range(3):
            formula.append([-x(u, c), -x(v, c)])                 # not both colour c
    return formula
'''

# ---------- P3: the most valuable load, by branch and bound ----------
P3 = '''
from fractions import Fraction

def best_value(items, cap):
    # best value per kilogram first: the bound below is then easy to work out
    its = sorted(items, key=lambda t: Fraction(t[1], t[0]), reverse=True)
    n = len(its)
    best = 0

    def bound(k, room, value):         # fill the room greedily, the last item cut
        for w, v in its[k:]:
            if w <= room:
                room -= w
                value += v
            else:
                return value + v * room // w
        return value

    def go(k, room, value):
        nonlocal best
        if value > best:
            best = value
        if k == n or bound(k, room, value) <= best:
            return                     # nothing below here can do better
        w, v = its[k]
        if w <= room:
            go(k + 1, room - w, value + v)     # take item k
        go(k + 1, room, value)                 # leave it

    go(0, cap, 0)
    return best
'''

# ---------- P4: balancing the load (largest job first, onto the least loaded machine) ----------
P4 = '''
import heapq

def schedule(jobs, m):
    order = sorted(range(len(jobs)), key=lambda j: jobs[j], reverse=True)
    machines = [(0, k) for k in range(m)]          # (load, machine), least loaded first
    answer = [0] * len(jobs)
    for j in order:
        load, k = heapq.heappop(machines)
        answer[j] = k
        heapq.heappush(machines, (load + jobs[j], k))
    return answer
'''

# ---------- P5: prime or not (Miller-Rabin with fixed bases) ----------
P5 = '''
BASES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]

def is_prime(n):
    if n < 2:
        return False
    for p in BASES:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:                  # n - 1 = d * 2**s with d odd
        d //= 2
        s += 1
    for a in BASES:
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue                   # a does not prove anything
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False               # a is a witness: n is composite
    return True
'''


# ---------------- brute forces ----------------

def brute_sat(n, clauses):
    from itertools import product
    for vals in product([False, True], repeat=n):
        if all(any(vals[l - 1] if l > 0 else not vals[-l - 1] for l in c) for c in clauses):
            return list(vals)
    return None


def brute_colourable(n, edges):
    from itertools import product
    for col in product(range(3), repeat=n):
        if all(col[u] != col[v] for u, v in edges):
            return list(col)
    return None


def brute_knap(items, cap):
    best = 0
    n = len(items)
    for m in range(1 << n):
        w = sum(items[i][0] for i in range(n) if m >> i & 1)
        if w <= cap:
            best = max(best, sum(items[i][1] for i in range(n) if m >> i & 1))
    return best


def brute_makespan(jobs, m):
    from itertools import product
    best = None
    for a in product(range(m), repeat=len(jobs)):
        load = [0] * m
        for j, k in enumerate(a):
            load[k] += jobs[j]
        best = max(load) if best is None else min(best, max(load))
    return best if best is not None else 0


def brute_prime(n):
    if n < 2:
        return False
    k = 2
    while k * k <= n:
        if n % k == 0:
            return False
        k += 1
    return True
