# Naive and buggy RECR solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def power_mod(x, n, m):
    r = 1 % m
    for _ in range(n):
        r = r * x % m
    return r
''', [6, 7]),
    2: ('''
def count_ways(n):
    if n < 0:
        return 0
    if n == 0:
        return 1
    return count_ways(n - 1) + count_ways(n - 2) + count_ways(n - 3)
''', [3, 4]),
    3: ('''
def subsets(items):
    out = []
    chosen = []
    def go(i):
        if i == len(items):
            out.append(chosen)
            return
        chosen.append(items[i])
        go(i + 1)
        chosen.pop()
        go(i + 1)
    go(0)
    return out
''', [0, 2]),
    4: ('''
def orders(items):
    out = []
    def go(chosen):
        if len(chosen) == len(items):
            out.append(chosen[:])
            return
        for x in items:
            go(chosen + [x])
    go([])
    return out
''', [0, 3]),
    5: ('''
import itertools
def n_queens(n):
    count = 0
    for cols in itertools.product(range(n), repeat=n):
        ok = True
        for r1 in range(n):
            for r2 in range(r1 + 1, n):
                if cols[r1] == cols[r2] or abs(cols[r1] - cols[r2]) == r2 - r1:
                    ok = False
        if ok:
            count += 1
    return count
''', [4]),
    6: ('''
def depth_sum(nested, d=1):
    total = 0
    for v in nested:
        if isinstance(v, list):
            total += depth_sum(v, d + 1)
        else:
            total += v * d
    return total
''', [5]),
}

# More wrong versions, run by hand: each must fail the tests named.
EXTRA = {
    "p6_no_depth": ('''
def depth_sum(nested):
    # adds the numbers but forgets their depth
    total = 0
    stack = [nested]
    while stack:
        v = stack.pop()
        if isinstance(v, list):
            stack.extend(v)
        else:
            total += v
    return total
''', "fails 'Nested parcels', 'Empty inner lists', 'Input not changed', '2,000 levels deep' and '100,000 numbers'"),
}
