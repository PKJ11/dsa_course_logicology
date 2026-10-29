# Naive and buggy BIGO solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def has_pair_sum(a, target):
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            if a[i] + a[j] == target:
                return True
    return False
''', [6]),
    2: ('''
def count_steps(n):
    count = 0
    for i in range(n):
        for j in range(i, n):
            count += 1
    for k in range(n):
        count += 2
    return count
''', [5]),
    3: ('''
def dedupe(codes):
    out = []
    for c in codes:
        if c not in out:
            out.append(c)
    return out
''', [5]),
    4: ('''
class DynArray:
    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.copies = 0
        self.slots = [None]
    def append(self, x):
        if self.size == self.capacity:
            new = [None] * (self.capacity + 1)
            for i in range(self.size):
                new[i] = self.slots[i]
            self.copies += self.size
            self.slots = new
            self.capacity += 1
        self.slots[self.size] = x
        self.size += 1
    def get(self, i):
        return self.slots[i]
''', [1, 6]),
    5: ('''
import math
def master(a, b, d):
    p = math.log(a, b)
    if p < d:
        return (d, 0)
    if p == d:
        return (d, 1)
    return (round(p, 3), 0)
''', [7]),
}
