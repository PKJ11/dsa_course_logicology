from solgen import write_station

H = '''def h1(word):
    total = 0
    for ch in word:
        total = (total * 31 + ord(ch)) % 2**32
    return total


def h2(word):
    total = 0
    for ch in word:
        total = (total * 37 + ord(ch)) % 2**32
    return total | 1

'''

write_station("hash", 8, {
    1: ('''class ChainMap:
    def __init__(self):
        self.m = 8
        self.b = [[] for _ in range(self.m)]
        self.n = 0

    def put(self, key, value):
        bucket = self.b[hash(key) % self.m]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value          # key is there: replace the value
                return
        bucket.append([key, value])
        self.n += 1
        if self.n > self.m:
            self._grow()

    def _grow(self):
        old = self.b
        self.m *= 2
        self.b = [[] for _ in range(self.m)]
        for chain in old:                # old buckets in order,
            for pair in chain:           # each chain front to back
                self.b[hash(pair[0]) % self.m].append(pair)

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
        return [[k for k, _ in chain] for chain in self.b]
''', [
        "Every method starts by choosing one bucket with `hash(key) % self.m`, then walks only that chain. The hash decides where to look; `==` decides whether a key matches.",
        "Pairs are stored as two-item lists, so `put` can change a value in place without rebuilding the chain.",
        "The table doubles when n > m, so the load factor n / m stays at most 1. With a good hash the expected chain length is then at most about 2, and each job is O(1) on average.",
        "Growing moves all n keys, which is O(n). But it happens only when n doubles, so over a run of puts the moving adds O(1) per put on average (amortised, as in BIGO-7).",
        "`remove` uses `pop(i)` on a short chain. The chain is about 1 long on average, so this is O(1) on average.",
    ]),
    2: ('''class ProbeTable:
    def __init__(self, m):
        self.s = [None] * m

    def _find(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            v = self.s[i]
            if v is None:
                return -1                # an empty slot ends the search
            if v != 'DEL' and v == key:
                return i
            i = (i + 1) % m              # markers are skipped
        return -1

    def insert(self, key):
        m = len(self.s)
        i = key % m
        free = -1                        # first marker or empty slot seen
        for _ in range(m):
            v = self.s[i]
            if v is None:
                if free < 0:
                    free = i
                break                    # key is surely not in the table
            if v == 'DEL':
                if free < 0:
                    free = i
            elif v == key:
                return i                 # already there
            i = (i + 1) % m
        if free >= 0:
            self.s[free] = key
        return free

    def contains(self, key):
        return self._find(key) >= 0

    def remove(self, key):
        i = self._find(key)
        if i < 0:
            return False
        self.s[i] = 'DEL'
        return True

    def slots(self):
        return list(self.s)
''', [
        "All three methods follow the same probe path: `key % m`, then one slot on, wrapping with `% m`. A key is always somewhere on its own path, before the first empty slot.",
        "That is why `remove` writes a marker instead of None. An empty slot would cut the path, and keys further along it could no longer be found.",
        "`insert` remembers the first marker but keeps going until an empty slot: only then is it sure the key is not already stored further on. Then it reuses the marker, so markers do not pile up.",
        "Every loop runs at most m times, so a full table cannot make it loop for ever. In Python `key % m` is never negative, even for negative keys.",
        "With load factor α (the fraction of slots in use, markers included), linear probing takes about (1 + 1/(1 − α)²) / 2 probes for a miss. At α = 0.76 that is about 9: still O(1), but it grows quickly as the table fills.",
    ]),
    3: ('''def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:           # x starts a run
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best
''', [
        "The set removes repeats and makes every `in` check O(1) on average.",
        "A run is counted only from its smallest number, the one whose `x - 1` is missing. So the inner `while` loop visits each number at most once over the whole run of the function.",
        "In total: n steps to build the set, n checks of `x - 1`, and at most n steps of counting. That is O(n) on average.",
        "Without the start check, a run of 200,000 numbers is counted from each of its numbers: about 20 billion steps.",
    ]),
    4: ('''def count_sums(a, k):
    seen = {0: 1}          # prefix sum -> how many times it has appeared
    total = count = 0
    for x in a:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
''', [
        "Write p for the running total. The stretch after place i up to place j adds up to p[j] − p[i]. It equals k exactly when p[i] = p[j] − k.",
        "So at each place j, the number of good stretches ending there is the number of earlier totals equal to `total - k`. The dict holds those counts.",
        "`{0: 1}` stands for the total before the first value, so stretches that start at place 0 are counted. Looking up before storing makes sure a stretch has at least one value.",
        "One pass with O(1) dict work per value: O(n) time on average and O(n) extra space. This works with negative values, where a sliding window does not.",
    ]),
    5: ('''class _Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                    # key -> node
        self.front = _Node()             # sentinel: most recent side
        self.back = _Node()              # sentinel: least recent side
        self.front.next = self.back
        self.back.prev = self.front

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, node):
        node.prev = self.front
        node.next = self.front.next
        self.front.next.prev = node
        self.front.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)               # a use: move to the front
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self.map.get(key)
        if node is not None:
            node.value = value
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) == self.cap:
            old = self.back.prev         # least recently used
            self._unlink(old)
            del self.map[old.key]
        node = _Node(key, value)
        self.map[key] = node
        self._push_front(node)
''', [
        "The dict finds a key's node in O(1). The two-way list keeps the order of use: just after `front` is the most recent, just before `back` the least recent.",
        "Removing a node you hold takes O(1) in a two-way list: its two neighbours point past it. The sentinels mean there is always a neighbour on both sides, so there are no special cases for an empty cache or for the ends.",
        "Each node stores its key, so the node thrown out at the back can also be deleted from the dict.",
        "`self.map.get(key)` returns None for a missing key, and a node is never None, so values like 0 or None are still found correctly.",
        "Every call does one dict lookup and a fixed number of reference changes: O(1) on average. In real code, `functools.lru_cache` or `OrderedDict.move_to_end` do this for you.",
    ]),
    6: ('''import math

''' + H + '''
class Bloom:
    def __init__(self, m, k):
        self.m = m
        self.k = k
        self.b = bytearray(m)            # m bits, stored one per byte

    def _positions(self, word):
        a, b = h1(word), h2(word)
        return [(a + i * b) % self.m for i in range(self.k)]

    def add(self, word):
        for p in self._positions(word):
            self.b[p] = 1

    def might_contain(self, word):
        return all(self.b[p] for p in self._positions(word))

    def bits(self):
        return [i for i in range(self.m) if self.b[i]]

    def false_rate(self, n):
        return (1 - math.exp(-self.k * n / self.m)) ** self.k
''', [
        "`h1` and `h2` are computed once per word. Double hashing turns them into k positions: a, a + b, a + 2b, … taken `% m`. `h2` is odd, which keeps the positions apart when m is a power of 2.",
        "A word that was added always gets True: its own bits were set and bits never go back to 0. False comes only when some bit is 0, so a False is always right.",
        "True can be wrong: other words may have set all k bits. That is the cost of storing m bits instead of the words.",
        "After n adds, one bit is still 0 with chance about `math.exp(-k * n / m)`: the number e (about 2.718) raised to the power −k·n/m. A missing word gets True when all k of its bits are 1, which happens with chance about `(1 - math.exp(-k * n / m)) ** k`.",
        "`add` and `might_contain` are O(k), whatever the number of words. A bytearray uses one byte per bit; a real filter packs 8 bits per byte with bit operations (BITS station).",
    ]),
})
