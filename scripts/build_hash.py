from tb import build

S = "hash"

# P1 a hash table with chaining that grows
OPS = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[0]])(ChainMap())"
LAYOUT = "(lambda T: [[T.put(k, str(k)) for k in args[0]], T.buckets()][1])(ChainMap())"
BIG = ("(lambda T: [[T.put(k * 7919 % 1_000_003, k) for k in range(100_000)], len(T), len(T.buckets()), "
       "sum(T.get(k * 7919 % 1_000_003) for k in range(0, 100_000, 3)), T.get(-5)][1:])(ChainMap())")
build(S, 1, "ChainMap", [
    {"name": "Put and get", "args": "([['put', 'NDLS', 1], ['put', 'BCT', 2], ['get', 'NDLS'], ['get', 'BCT'], ['__len__']],)", "expr": OPS,
     "show": "put('NDLS', 1), put('BCT', 2), get('NDLS'), get('BCT'), len()",
     "why": "put returns None; the two gets return 1 and 2; len() is 2. If get returns None, it looks in a different bucket from the one put used: both must use hash(key) % m with the same m."},
    {"name": "Put the same key twice", "args": "([['put', 'HWH', 1], ['put', 'HWH', 5], ['get', 'HWH'], ['__len__']],)", "expr": OPS,
     "show": "put('HWH', 1), put('HWH', 5), get('HWH'), len()",
     "why": "The second put replaces the value, so get gives 5 and len() stays 1. If len() is 2, put added a second pair without first searching the bucket for the key."},
    {"name": "Missing key", "args": "([['get', 'MAS'], ['put', 'MAS', 0], ['get', 'MAS'], ['get', 'SBC']],)", "expr": OPS,
     "show": "get('MAS') on an empty table, put('MAS', 0), get('MAS'), get('SBC')",
     "why": "A missing key gives None. Careful with the value 0: get('MAS') must return 0, not None. Test 'is None', not truth."},
    {"name": "Remove", "args": "([['put', 1, 'a'], ['put', 9, 'b'], ['remove', 1], ['remove', 1], ['get', 1], ['get', 9], ['__len__']],)", "expr": OPS,
     "show": "put 1 and 9 (same bucket), remove(1) twice, get(1), get(9), len()",
     "why": "remove returns True the first time and False the second. 9 shares bucket 1 with 1 and must survive. len() drops to 1."},
    {"name": "Where the keys go", "args": "([3, 11, 19, 4],)", "expr": LAYOUT,
     "show": "put 3, 11, 19, 4 into a new table, then buckets()",
     "why": "With 8 buckets, 3, 11 and 19 all go to bucket 3, in the order they were added, and 4 goes to bucket 4. A new table starts with 8 buckets, and new keys go at the end of their chain."},
    {"name": "The table grows", "args": "([1, 9, 17, 25, 33, 41, 49, 57, 65],)", "expr": "(lambda T: [[T.put(k, 0) for k in args[0]], (lambda b: [len(b), b[1], b[9]])(T.buckets())][1])(ChainMap())",
     "show": "put 1, 9, 17, …, 65 (nine keys, all bucket 1 of 8), then [number of buckets, bucket 1, bucket 9]",
     "why": "The ninth key makes n = 9 bigger than m = 8, so the table doubles to 16 buckets and every key moves to hash(k) % 16. If you see 8 buckets, the table never grows. If the order inside a bucket is wrong, move the keys bucket by bucket, each chain from front to back."},
    {"name": "Tuple keys", "args": "([['put', (2, 3), 'x'], ['put', (3, 2), 'y'], ['get', (2, 3)], ['get', (3, 2)], ['get', (2, 2)]],)", "expr": OPS,
     "show": "keys (2, 3) and (3, 2)",
     "why": "Tuples are hashable, and (2, 3) and (3, 2) are different keys. Compare keys with ==, after the hash picks the bucket."},
    {"name": "Grows twice, then removes", "args": "()", "expr": "(lambda T: [[T.put(k, k) for k in range(40)], [T.remove(k) for k in range(0, 40, 2)], len(T), len(T.buckets()), T.get(39), T.get(38)][2:])(ChainMap())",
     "show": "put 0 … 39, remove the even keys: [len, number of buckets, get(39), get(38)]",
     "why": "40 keys need 64 buckets (8 → 16 → 32 → 64). The table does not shrink when keys are removed. 20 keys are left; get(38) is None."},
    {"name": "100,000 keys", "args": "()", "expr": BIG, "timeout": 5000,
     "show": "put 100,000 keys, then get a third of them: [len, number of buckets, sum of the values, get(-5)]",
     "why": "With growth, chains stay about 1 long, so each job is O(1) on average. If this timed out, the table may never grow: 8 buckets hold 12,500 keys each, and every put walks a whole chain."},
], trusted="""
class ChainMap:
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
        if self.n > self.m:
            old = self.b
            self.m *= 2
            self.b = [[] for _ in range(self.m)]
            for chain in old:
                for pair in chain:
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
""")

# P2 linear probing with deleted markers
POPS = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[1]] + [T.slots()])(ProbeTable(args[0]))"
FIG = "['insert', 23], ['insert', 43], ['insert', 13], ['insert', 27], ['insert', 37]"
BIGP = ("(lambda T: [sum(T.insert(k * 2654435761 % 1_000_000_007) >= 0 for k in range(100_000)), "
        "sum(T.contains(k * 2654435761 % 1_000_000_007) for k in range(100_000)), "
        "sum(T.contains(k * 2654435761 % 1_000_000_007 + 1) for k in range(100_000)), "
        "sum(T.remove(k * 2654435761 % 1_000_000_007) for k in range(0, 100_000, 2)), "
        "sum(T.contains(k * 2654435761 % 1_000_000_007) for k in range(100_000))])(ProbeTable(1 << 17))")
build(S, 2, "ProbeTable", [
    {"name": "The figure's inserts", "args": f"(10, [{FIG}])", "expr": POPS,
     "show": "10 slots; insert 23, 43, 13, 27, 37; then slots()",
     "why": "insert returns the slot used: 3, 4, 5, 7, 8. 43 and 13 find slot 3 taken and move on one slot at a time. If 37 went to 7, the code did not check that slot 7 was taken."},
    {"name": "Find", "args": f"(10, [{FIG}, ['contains', 13], ['contains', 33], ['contains', 27], ['contains', 0]])", "expr": POPS,
     "show": "the same table; contains 13, 33, 27, 0",
     "why": "13 is found after 3 probes; 33 is not there (the search stops at the empty slot 6). A search starts at key % m and stops at the key or at an empty slot (None)."},
    {"name": "Insert a key twice", "args": f"(10, [{FIG}, ['insert', 13], ['insert', 23]])", "expr": POPS,
     "show": "the same table; insert 13 and 23 again",
     "why": "A key that is already there is not added again: insert returns the slot that holds it (5, then 3), and slots() is unchanged."},
    {"name": "Wrap around the end", "args": "(5, [['insert', 4], ['insert', 9], ['insert', 14], ['contains', 14]])", "expr": POPS,
     "show": "5 slots; insert 4, 9, 14 (all home slot 4)",
     "why": "After the last slot comes slot 0: use (i + 1) % m. 9 goes to 0 and 14 to 1. An IndexError means the probe ran off the end."},
    {"name": "Remove leaves a marker", "args": f"(10, [{FIG}, ['remove', 43], ['contains', 13], ['contains', 43]])", "expr": POPS,
     "show": "the same table; remove 43; contains 13 and 43; slots()",
     "why": "Slot 4 must become 'DEL', not None. If contains(13) is False, removing 43 emptied the slot and broke the run that leads to 13 (the last variant of the figure)."},
    {"name": "Insert reuses a marker", "args": f"(10, [{FIG}, ['remove', 43], ['insert', 53], ['contains', 53]])", "expr": POPS,
     "show": "the same table; remove 43, then insert 53 (home slot 3)",
     "why": "53 is not in the table, so it takes the first marker on its path: slot 4. If it went to slot 6, the code ignored the marker."},
    {"name": "No copy after a marker", "args": f"(10, [{FIG}, ['remove', 43], ['insert', 13], ['contains', 13], ['remove', 13], ['contains', 13]])", "expr": POPS,
     "show": "the same table; remove 43, then insert 13 again, then remove 13",
     "why": "13 is already in slot 5, past the marker. insert must keep probing to an empty slot before it uses the marker; otherwise 13 is stored twice (slots 4 and 5), and removing it once leaves a copy behind."},
    {"name": "Remove a missing key", "args": f"(10, [{FIG}, ['remove', 33], ['remove', 27], ['remove', 27]])", "expr": POPS,
     "show": "the same table; remove 33, then 27 twice",
     "why": "remove returns False for a key that is not there, True when it removes one. Removing 27 a second time is False."},
    {"name": "A full table", "args": "(3, [['insert', 0], ['insert', 1], ['insert', 2], ['insert', 5], ['contains', 5], ['remove', 1], ['insert', 5], ['contains', 5]])", "expr": POPS,
     "show": "3 slots; insert 0, 1, 2; insert 5 into the full table; contains(5); remove 1; insert 5",
     "why": "With no empty slot, a probe must stop after m slots: insert returns -1 and contains returns False. If the test timed out, a loop never stopped. After remove(1) the marker in slot 1 can take 5."},
    {"name": "Negative keys", "args": "(7, [['insert', -1], ['insert', -8], ['contains', -8], ['contains', 6]])", "expr": POPS,
     "show": "7 slots; insert -1 and -8",
     "why": "In Python, -1 % 7 is 6, so -1 goes to slot 6, and -8 % 7 is also 6, so -8 wraps round to slot 0. 6 is not in the table."},
    {"name": "100,000 keys", "args": "()", "expr": BIGP, "timeout": 6000,
     "show": "131,072 slots; insert 100,000 keys, find them, look for 100,000 missing keys, remove half, find again: five counts",
     "why": "The table is about 76% full, so a probe run is short on average. If this timed out, contains may scan the whole table (for example `key in self.slots`) instead of starting at key % m."},
], trusted="""
class ProbeTable:
    def __init__(self, m):
        self.s = [None] * m
    def _find(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            v = self.s[i]
            if v is None:
                return -1
            if v != 'DEL' and v == key:
                return i
            i = (i + 1) % m
        return -1
    def insert(self, key):
        m = len(self.s)
        i = key % m
        free = -1
        for _ in range(m):
            v = self.s[i]
            if v is None:
                if free < 0:
                    free = i
                break
            if v == 'DEL':
                if free < 0:
                    free = i
            elif v == key:
                return i
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
""")

# P3 longest run of consecutive whole numbers (sorted blocked)
build(S, 3, "longest_run", [
    {"name": "Classic", "args": "([100, 4, 200, 1, 3, 2],)", "show": "[100, 4, 200, 1, 3, 2]", "why": "1, 2, 3, 4 is a run of 4. The order in the list does not matter."},
    {"name": "Empty", "args": "([],)", "show": "[]", "why": "No numbers, no run: 0. max() of an empty sequence raises ValueError; give it a default."},
    {"name": "One number", "args": "([7],)", "show": "[7]", "why": "A single number is a run of 1."},
    {"name": "Repeats", "args": "([1, 2, 2, 3, 3, 3],)", "show": "[1, 2, 2, 3, 3, 3]", "why": "Repeats do not make a run longer: 1, 2, 3 is 3. A set removes the repeats."},
    {"name": "Negative numbers", "args": "([-2, -1, 0, 5, 6],)", "show": "[-2, -1, 0, 5, 6]", "why": "-2, -1, 0 is a run of 3."},
    {"name": "Two runs", "args": "([9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6],)", "show": "[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]", "why": "-1, 0, 1 is 3 long; 3 to 9 is 7 long. The answer is 7."},
    {"name": "No two in a row", "args": "([10, 20, 30],)", "show": "[10, 20, 30]", "why": "Every run is 1 long."},
    {"name": "200,000 in one run", "args": "(list(range(200_000, 0, -1)),)", "timeout": 3000, "show": "200,000 down to 1",
     "why": "Count up only from a number x where x − 1 is not in the set: the start of a run. If you count up from every number, a run of 200,000 costs about 20 billion steps (O(n²))."},
    {"name": "200,000 scattered", "args": "([(k * 7919) % 400_009 for k in range(200_000)],)", "timeout": 3000, "show": "200,000 scattered numbers below 400,009",
     "why": "With a set, each 'in' check is O(1) on average, so the whole job is O(n). sorted() is switched off, so sorting is not available."},
], trusted="""
def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best
""")

# P4 count the stretches that add up to k
build(S, 4, "count_sums", [
    {"name": "Small", "args": "([1, 1, 1], 2)", "show": "a = [1, 1, 1], k = 2", "why": "Places 0–1 and 1–2: 2 stretches."},
    {"name": "Different lengths", "args": "([1, 2, 3], 3)", "show": "a = [1, 2, 3], k = 3", "why": "[1, 2] and [3]: 2 stretches."},
    {"name": "Negative values", "args": "([1, -1, 0], 0)", "show": "a = [1, -1, 0], k = 0",
     "why": "[1, -1], [0] and [1, -1, 0]: 3. A sliding window (grow the right end, shrink the left end) does not work with negative values: a sum can go down as the window grows."},
    {"name": "Zeros", "args": "([0, 0, 0], 0)", "show": "a = [0, 0, 0], k = 0",
     "why": "Every stretch adds up to 0: 3 + 2 + 1 = 6. Start the dict with {0: 1} (the empty start, before place 0), and count before you store the current prefix sum."},
    {"name": "Empty", "args": "([], 5)", "show": "a = [], k = 5", "why": "No stretches: 0."},
    {"name": "Mixed", "args": "([3, 4, 7, 2, -3, 1, 4, 2], 7)", "show": "a = [3, 4, 7, 2, -3, 1, 4, 2], k = 7",
     "why": "[3, 4], [7], [7, 2, -3, 1] and [1, 4, 2]: 4."},
    {"name": "Whole list only", "args": "([5, -5, 5], 5)", "show": "a = [5, -5, 5], k = 5", "why": "[5], [5] and [5, -5, 5]: 3."},
    {"name": "200,000 values", "args": "([(k * 2654435761 >> 9) % 7 - 3 for k in range(200_000)], 5)", "timeout": 3000,
     "show": "200,000 values from -3 to 3; k = 5",
     "why": "Trying every stretch is O(n²): about 20 billion sums. With prefix sums and a dict of how often each sum has appeared, it is one pass, O(n)."},
], trusted="""
def count_sums(a, k):
    seen = {0: 1}
    total = count = 0
    for x in a:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
""")

# P5 an LRU cache (OrderedDict blocked)
LOPS = "(lambda C: [getattr(C, op[0])(*op[1:]) for op in args[1]])(LRUCache(args[0]))"
BIGL = ("(lambda C: [sum(C.get(k % 70_000) != -1 for k in range(0, 300_000, 3) if C.put((k * 37) % 70_000, k) is None), "
        "C.get(0), C.get(37 * 299_997 % 70_000)])(LRUCache(50_000))")
build(S, 5, "LRUCache", [
    {"name": "Room for two", "args": "(2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]])", "expr": LOPS,
     "show": "capacity 2: put 1, put 2, get 1, put 3, get 2, put 4, get 1, get 3, get 4",
     "why": "get(1) makes 1 recent, so put(3) throws out 2 (get(2) is -1). Then put(4) throws out 1. If get(2) gave 2, the cache threw out the oldest *added* key instead of the least recently *used*."},
    {"name": "Put updates and refreshes", "args": "(2, [['put', 1, 'a'], ['put', 2, 'b'], ['put', 1, 'A'], ['put', 3, 'c'], ['get', 1], ['get', 2], ['get', 3]])", "expr": LOPS,
     "show": "capacity 2: put(1, 'a'), put(2, 'b'), put(1, 'A'), put(3, 'c'), then get 1, 2, 3",
     "why": "Putting key 1 again changes its value to 'A' and makes it the most recent. So put(3) throws out 2. A put on an existing key must not add a second node."},
    {"name": "Capacity one", "args": "(1, [['put', 5, 50], ['get', 5], ['put', 6, 60], ['get', 5], ['get', 6]])", "expr": LOPS,
     "show": "capacity 1: put 5, get 5, put 6, get 5, get 6",
     "why": "With room for one, every new key throws out the old one: get(5) is -1 at the end and get(6) is 60."},
    {"name": "A miss changes nothing", "args": "(2, [['put', 1, 1], ['put', 2, 2], ['get', 9], ['put', 3, 3], ['get', 1], ['get', 2]])", "expr": LOPS,
     "show": "capacity 2: put 1, put 2, get(9) (a miss), put 3, get 1, get 2",
     "why": "get(9) returns -1 and changes no order, so 1 is still the least recent and is thrown out."},
    {"name": "get refreshes", "args": "(3, [['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 1], ['get', 2], ['put', 4, 4], ['get', 3], ['get', 1], ['get', 2], ['get', 4]])", "expr": LOPS,
     "show": "capacity 3: put 1, 2, 3; get 1; get 2; put 4; get 3, 1, 2, 4",
     "why": "After get(1) and get(2), key 3 is the least recently used, so put(4) throws out 3."},
    {"name": "Values can be falsy", "args": "(2, [['put', 0, 0], ['put', 1, None], ['get', 0], ['get', 1]])", "expr": LOPS,
     "show": "capacity 2: put(0, 0), put(1, None), get 0, get 1",
     "why": "The values 0 and None are real values: get returns them. Check whether the key is in the cache, not whether the value is truthy."},
    {"name": "200,000 operations", "args": "()", "expr": BIGL, "timeout": 5000,
     "show": "capacity 50,000; 100,000 puts each followed by a get: [number of hits, get(0), get of the last key put]",
     "why": "Every get and put must be O(1). A Python list of keys in order makes each refresh a list.remove(), O(capacity), so this takes billions of steps. Use a dict that maps each key to its node in a two-way list."},
], trusted="""
class _N:
    __slots__ = ("key", "value", "prev", "next")
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.front, self.back = _N(), _N()
        self.front.next, self.back.prev = self.back, self.front
    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev
    def _push_front(self, node):
        node.prev, node.next = self.front, self.front.next
        self.front.next.prev = node
        self.front.next = node
    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)
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
            old = self.back.prev
            self._unlink(old)
            del self.map[old.key]
        node = _N(key, value)
        self.map[key] = node
        self._push_front(node)
""")

# P6 a Bloom filter
H = """
def h1(word):
    total = 0
    for ch in word:
        total = (total * 31 + ord(ch)) % 2**32
    return total

def h2(word):
    total = 0
    for ch in word:
        total = (total * 37 + ord(ch)) % 2**32
    return total | 1
"""
BOPS = "(lambda B: [getattr(B, op[0])(*op[1:]) for op in args[2]])(Bloom(args[0], args[1]))"
ANIMALS = "['add', 'cat'], ['add', 'dog'], ['add', 'owl']"
build(S, 6, "Bloom", [
    {"name": "The figure's filter", "args": f"(16, 3, [{ANIMALS}, ['bits']])", "expr": BOPS,
     "show": "Bloom(16, 3); add cat, dog, owl; bits()",
     "why": "cat sets 6, 11, 0; dog sets 12, 3, 10; owl sets 4, 11, 2. bits() lists the positions that are 1, smallest first. Position i (for i = 0, 1, 2) is (h1(word) + i * h2(word)) % m."},
    {"name": "Ask the figure's questions", "args": f"(16, 3, [{ANIMALS}, ['might_contain', 'cat'], ['might_contain', 'fox'], ['might_contain', 'bee']])", "expr": BOPS,
     "show": "the same filter; might_contain cat, fox, bee",
     "why": "cat: True. fox: False, because bit 15 is 0. bee: True, a false positive: its bits 2, 3, 4 were set by owl and dog. If bee gave False, the code stores the words themselves instead of bits."},
    {"name": "Empty filter", "args": "(16, 3, [['might_contain', 'cat'], ['bits']])", "expr": BOPS,
     "show": "Bloom(16, 3) with nothing added",
     "why": "Every bit is 0, so every answer is False and bits() is []."},
    {"name": "One hash function", "args": "(16, 1, [['add', 'cat'], ['bits']])", "expr": BOPS,
     "show": "Bloom(16, 1); add cat",
     "why": "With k = 1 only i = 0 is used, so the position is h1('cat') % 16 = 6."},
    {"name": "Adding twice changes nothing", "args": "(32, 4, [['add', 'emu'], ['bits'], ['add', 'emu'], ['bits']])", "expr": BOPS,
     "show": "Bloom(32, 4); add emu, bits(), add emu again, bits()",
     "why": "Setting a bit that is already 1 leaves it 1. bits() is the same both times."},
    {"name": "No false negatives", "args": "()", "expr": "(lambda B: [[B.add('w' + str(j)) for j in range(5_000)], sum(B.might_contain('w' + str(j)) for j in range(5_000))][1])(Bloom(1 << 16, 5))",
     "show": "Bloom(65,536, 5); add 5,000 words; how many of them does might_contain say True for?",
     "why": "A word that was added always gets True: its own bits are 1 and nothing ever sets a bit back to 0. All 5,000."},
    {"name": "Counting false positives", "args": "()", "expr": "(lambda B: [[B.add('in' + str(j)) for j in range(1_000)], sum(B.might_contain('out' + str(j)) for j in range(10_000))][1])(Bloom(10_000, 7))",
     "show": "Bloom(10,000, 7); add 1,000 words; ask about 10,000 other words: how many say True?",
     "why": "The exact count depends on every bit being right, so a wrong position formula shows up here. The formula from lesson 8 predicts about 0.8%, so about 82. These two simple hash functions do a little worse: 152."},
    {"name": "The expected rate", "args": "()", "expr": "[round(Bloom(16, 3).false_rate(3), 6), round(Bloom(10_000, 7).false_rate(1_000), 6), Bloom(100, 2).false_rate(0)]",
     "show": "false_rate(3) for Bloom(16, 3); false_rate(1,000) for Bloom(10,000, 7); false_rate(0) for Bloom(100, 2)",
     "why": "In Python the formula is (1 - math.exp(-k * n / m)) ** k. math.exp(x) is the number e (about 2.718) raised to the power x, and ** k raises the result to the power k. With nothing added the rate is 0.0."},
    {"name": "100,000 words", "args": "()", "expr": "(lambda B: [[B.add('k' + str(j)) for j in range(100_000)], sum(B.might_contain('k' + str(j)) for j in range(0, 100_000, 2)), sum(B.might_contain('q' + str(j)) for j in range(50_000)), len(B.bits())][1:])(Bloom(1_000_000, 7))",
     "timeout": 8000,
     "show": "Bloom(1,000,000, 7); add 100,000 words; ask 50,000 added and 50,000 new: [hits, false positives, bits set]",
     "why": "Each add and each question is k bit operations: O(k). Keep the bits in a list or a bytearray of length m. If this timed out, the code may rebuild a big structure on every call."},
], trusted=H + """
import math

class Bloom:
    def __init__(self, m, k):
        self.m, self.k = m, k
        self.b = bytearray(m)
    def _pos(self, word):
        a, b = h1(word), h2(word)
        return [(a + i * b) % self.m for i in range(self.k)]
    def add(self, word):
        for p in self._pos(word):
            self.b[p] = 1
    def might_contain(self, word):
        return all(self.b[p] for p in self._pos(word))
    def bits(self):
        return [i for i in range(self.m) if self.b[i]]
    def false_rate(self, n):
        return (1 - math.exp(-self.k * n / self.m)) ** self.k
""")
