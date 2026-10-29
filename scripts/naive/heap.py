# Naive HEAP solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
class MinHeap:
    # a plain list: min() and remove() on every pop
    def __init__(self):
        self.a = []
    def __len__(self):
        return len(self.a)
    def peek(self):
        return min(self.a)
    def push(self, x):
        self.a.append(x)
    def pop(self):
        m = min(self.a)
        self.a.remove(m)
        return m
''', [6]),
    2: ('''
def heapify(a):
    # push the values one at a time: sift each one up
    for k in range(1, len(a)):
        i = k
        while i > 0 and a[i] < a[(i - 1) // 2]:
            p = (i - 1) // 2
            a[i], a[p] = a[p], a[i]
            i = p
''', [6]),
    3: ('''
class TaskQueue:
    # a dict of task -> (priority, count); pop scans for the smallest
    def __init__(self):
        self.d = {}
        self.count = 0
    def add(self, task, priority):
        self.d[task] = (priority, self.count)
        self.count += 1
    def remove(self, task):
        return self.d.pop(task, None) is not None
    def pop(self):
        if not self.d:
            return None
        t = min(self.d, key=self.d.get)
        del self.d[t]
        return t
    def __len__(self):
        return len(self.d)
''', [6]),
    4: ('''
def top_k(nums, k):
    # sort everything
    return sorted(nums, reverse=True)[:k]
''', [6]),
    5: ('''
def merge_k(lists):
    # scan every list's front value to find the smallest
    pos = [0] * len(lists)
    out = []
    while True:
        best = None
        for i, l in enumerate(lists):
            if pos[i] < len(l) and (best is None or l[pos[i]] < lists[best][pos[best]]):
                best = i
        if best is None:
            return out
        out.append(lists[best][pos[best]])
        pos[best] += 1
''', [6]),
    6: ('''
class MedianFinder:
    # one sorted list, kept sorted by a scan from the end
    def __init__(self):
        self.a = []
    def add(self, x):
        a = self.a
        a.append(x)
        i = len(a) - 1
        while i > 0 and a[i - 1] > a[i]:
            a[i - 1], a[i] = a[i], a[i - 1]
            i -= 1
    def median(self):
        a, n = self.a, len(self.a)
        if n % 2:
            return float(a[n // 2])
        return (a[n // 2 - 1] + a[n // 2]) / 2
''', [6]),
}
