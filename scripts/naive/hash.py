# Naive and buggy HASH solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
class ChainMap:
    # never grows: 8 buckets for ever
    def __init__(self):
        self.m = 8
        self.b = [[] for _ in range(8)]
        self.n = 0
    def put(self, key, value):
        bucket = self.b[hash(key) % self.m]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])
        self.n += 1
    def get(self, key, default=None):
        for k, v in self.b[hash(key) % self.m]:
            if k == key:
                return v
        return default
    def remove(self, key):
        bucket = self.b[hash(key) % self.m]
        for i, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(i)
                self.n -= 1
                return True
        return False
    def __len__(self):
        return self.n
    def buckets(self):
        return [[k for k, _ in c] for c in self.b]
''', [5, 7, 8]),
    2: ('''
class ProbeTable:
    # removes by emptying the slot, and inserts into the first free slot without checking further
    def __init__(self, m):
        self.s = [None] * m
    def insert(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            if self.s[i] is None:
                self.s[i] = key
                return i
            if self.s[i] == key:
                return i
            i = (i + 1) % m
        return -1
    def contains(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            if self.s[i] is None:
                return False
            if self.s[i] == key:
                return True
            i = (i + 1) % m
        return False
    def remove(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            if self.s[i] is None:
                return False
            if self.s[i] == key:
                self.s[i] = None
                return True
            i = (i + 1) % m
        return False
    def slots(self):
        return list(self.s)
''', [4, 6, 7]),
    3: ('''
def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        y = x
        while y + 1 in s:
            y += 1
        best = max(best, y - x + 1)
    return best
''', [7]),
    4: ('''
def count_sums(a, k):
    count = 0
    for i in range(len(a)):
        total = 0
        for j in range(i, len(a)):
            total += a[j]
            if total == k:
                count += 1
    return count
''', [7]),
    5: ('''
class LRUCache:
    # a list of keys in order of use: every refresh is list.remove, O(capacity)
    def __init__(self, capacity):
        self.cap = capacity
        self.d = {}
        self.order = []
    def get(self, key):
        if key not in self.d:
            return -1
        self.order.remove(key)
        self.order.append(key)
        return self.d[key]
    def put(self, key, value):
        if key in self.d:
            self.order.remove(key)
        elif len(self.d) == self.cap:
            del self.d[self.order.pop(0)]
        self.d[key] = value
        self.order.append(key)
''', [6]),
    6: ('''
import math

class Bloom:
    # stores the words: never a false positive, which is not what a Bloom filter does
    def __init__(self, m, k):
        self.m, self.k = m, k
        self.words = set()
    def add(self, word):
        self.words.add(word)
    def might_contain(self, word):
        return word in self.words
    def bits(self):
        return []
    def false_rate(self, n):
        return (1 - math.exp(-self.k * n / self.m)) ** self.k
''', [0, 1, 6]),
}
