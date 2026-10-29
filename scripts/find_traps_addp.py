"""Search small inputs that catch wrong ADDP methods (scratch helper for build_addp.py)."""
import random
import trusted_addp as T
from cross_addp import load

rng = random.Random(9)
f3 = load(T.P3, "cheapest_cuts")


def middle_first(length, marks):
    # greedy: always cut the mark nearest the middle of the piece
    def go(a, b, ms):
        if not ms:
            return 0
        mid = (a + b) / 2
        c = min(ms, key=lambda m: (abs(m - mid), m))
        return b - a + go(a, c, [m for m in ms if m < c]) + go(c, b, [m for m in ms if m > c])
    return go(0, length, sorted(marks))


for _ in range(100000):
    L = rng.randint(5, 20)
    k = rng.randint(2, 4)
    marks = sorted(rng.sample(range(1, L), k))
    if middle_first(L, marks) != f3(L, marks):
        print("P3 middle-first fails:", L, marks, middle_first(L, marks), f3(L, marks))
        break

f4 = load(T.P4, "fewest_wagons")


def ffd(w, cap):
    loads = []
    for x in sorted(w, reverse=True):
        for k in range(len(loads)):
            if loads[k] + x <= cap:
                loads[k] += x
                break
        else:
            loads.append(x)
    return len(loads)


def in_order(w, cap):
    t, load = 1, 0
    for x in w:
        if load + x <= cap:
            load += x
        else:
            t, load = t + 1, x
    return t if w else 0


found = 0
for _ in range(200000):
    n = rng.randint(4, 9)
    cap = rng.randint(8, 12)
    w = [rng.randint(1, cap) for _ in range(n)]
    if ffd(w, cap) != f4(w, cap):
        print("P4 FFD fails:", w, cap, ffd(w, cap), f4(w, cap))
        found += 1
        if found > 3:
            break
