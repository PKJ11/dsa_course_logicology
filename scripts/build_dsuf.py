import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "dsuf"

DSU = """
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.sz = [1] * n
        self.sets = n

    def find(self, x):
        p = self.parent
        while p[x] != x:
            p[x] = p[p[x]]
            x = p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.sz[ra] > self.sz[rb]:
            ra, rb = rb, ra
        self.parent[ra] = rb
        self.sz[rb] += self.sz[ra]
        self.sets -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)

    def size(self, x):
        return self.sz[self.find(x)]

    def groups(self):
        return self.sets
"""

OPS = "(lambda D: [getattr(D, op[0])(*op[1:]) for op in args[1]])(DSU(args[0]))"
SAME = "(lambda D: [[D.union(a, b) for a, b in args[1]], [D.find(x) == D.find(y) for x, y in args[2]]][1])(DSU(args[0]))"
CHAIN = ("(lambda D, n: [[D.union(i, i + 1) for i in range(n - 1)], D.groups(), D.size(0), D.size(n - 1),"
         " sum(D.connected(0, (k * 7919) % n) for k in range(n))][1:])(DSU(args[0]), args[0])")
CHAIN2 = ("(lambda D, n: [[D.union(i + 1, i) for i in range(n - 1)], D.groups(), D.size(n // 2),"
          " sum(D.connected(n - 1, (k * 7919) % n) for k in range(n))][1:])(DSU(args[0]), args[0])")
PAIRS = ("(lambda D, n: [[D.union(i, i + s) for s in [2 ** j for j in range(17)] for i in range(0, n, 2 * s)], D.groups(), D.size(5),"
         " sum(D.find((k * 7919) % n) == D.find(0) for k in range(n))][1:])(DSU(args[0]), args[0])")
RAND = ("(lambda D, n: [sum(D.union((k * 7919) % n, (k * 104729 + 13) % n) for k in range(n)), D.groups(),"
        " sum(D.connected((k * 31337) % n, (k * 65537 + 7) % n) for k in range(n)), max(D.size(x) for x in range(0, n, 1000))])(DSU(args[0]), args[0])")
build(S, 1, "DSU", [
    {"name": "Union and find", "args": "(5, [('connected', 0, 1), ('union', 0, 1), ('connected', 0, 1), ('union', 1, 2), ('connected', 0, 2), ('connected', 0, 3)])", "expr": OPS,
     "show": "DSU(5); connected(0, 1); union(0, 1); connected(0, 1); union(1, 2); connected(0, 2); connected(0, 3)",
     "why": "[False, True, True, True, True, False]. After union(0, 1) and union(1, 2), elements 0, 1 and 2 share one root."},
    {"name": "Union twice", "args": "(4, [('union', 0, 1), ('union', 1, 0), ('union', 0, 0), ('union', 2, 3), ('union', 0, 3), ('union', 1, 2)])", "expr": OPS,
     "show": "DSU(4); union(0, 1); union(1, 0); union(0, 0); union(2, 3); union(0, 3); union(1, 2)",
     "why": "[True, False, False, True, True, False]. union returns False when both are already in one set, including an element with itself. Compare the roots, not the elements."},
    {"name": "Sizes and groups", "args": "(6, [('groups',), ('union', 0, 1), ('union', 2, 3), ('union', 3, 4), ('size', 0), ('size', 4), ('size', 5), ('groups',), ('union', 1, 4), ('size', 2), ('groups',)])", "expr": OPS,
     "show": "DSU(6); groups(); union(0, 1), (2, 3), (3, 4); size(0), size(4), size(5); groups(); union(1, 4); size(2); groups()",
     "why": "[6, True, True, True, 2, 3, 1, 3, True, 5, 2]. size(x) is the size of x's whole set: read it at the root. groups() goes down by 1 only when a union really joins two sets."},
    {"name": "One representative", "args": "(8, [(0, 1), (2, 3), (1, 3), (5, 6)], [(0, 2), (1, 3), (0, 3), (5, 6), (4, 5), (7, 7), (6, 0)])", "expr": SAME,
     "show": "DSU(8); union (0, 1), (2, 3), (1, 3), (5, 6); then find(x) == find(y) for (0, 2), (1, 3), (0, 3), (5, 6), (4, 5), (7, 7), (6, 0)",
     "why": "[True, True, True, True, False, True, False]. find must return the same element for every member of a set: the root."},
    {"name": "A long chain", "args": "(100_000,)", "expr": CHAIN, "timeout": 4000,
     "show": "DSU(100,000); union(i, i + 1) for every i; then [groups, size(0), size(n − 1), how many of 100,000 elements are connected to 0]",
     "why": "If union always puts the first root under the second, these unions build one path of 100,000 nodes, and each find goes up the whole path: billions of steps. Use union by size or rank, path compression, or both. A recursive find can also stop with RecursionError here."},
    {"name": "A chain the other way", "args": "(100_000,)", "expr": CHAIN2, "timeout": 4000,
     "show": "DSU(100,000); union(i + 1, i) for every i; then [groups, size(n // 2), how many elements are connected to n − 1]",
     "why": "The same chain, joined in the other direction. If one of the two chain tests fails, the code depends on the order of the arguments: compare the sizes (or ranks) of the two roots."},
    {"name": "Equal unions", "args": "(131_072,)", "expr": PAIRS, "timeout": 4000,
     "show": "DSU(131,072); unions of equal pairs, then fours, eights, …; then [groups, size(5), how many elements share 0's root]",
     "why": "The tallest trees union by rank allows: height 17. Everything ends in one set of 131,072."},
    {"name": "200,000 random unions", "args": "(200_000,)", "expr": RAND, "timeout": 4000,
     "show": "DSU(200,000); 200,000 unions of mixed pairs and 200,000 connected checks: [unions that joined, groups, checks that said True, largest size seen]",
     "why": "About a million finds in all. Each should cost a few steps."},
], trusted=DSU)

LARGEST = """
def largest_after_each(n, pairs):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    best = 1
    out = []
    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] > size[rb]:
                ra, rb = rb, ra
            parent[ra] = rb
            size[rb] += size[ra]
            if size[rb] > best:
                best = size[rb]
        out.append(best)
    return out
"""

LBIG = "(lambda r: [len(r), sum(r), r[:5], r[-1]])(largest_after_each(*args))"
build(S, 2, "largest_after_each", [
    {"name": "The example", "args": "(5, [(0, 1), (2, 3), (1, 2), (3, 4)])", "show": "largest_after_each(5, [(0, 1), (2, 3), (1, 2), (3, 4)])",
     "why": "[2, 2, 4, 5]. After (2, 3) there are two groups of 2, so the largest is still 2."},
    {"name": "Already together", "args": "(4, [(0, 1), (1, 0), (0, 0), (2, 3)])", "show": "largest_after_each(4, [(0, 1), (1, 0), (0, 0), (2, 3)])",
     "why": "[2, 2, 2, 2]. A pair that is already in one group changes nothing, and a pair of an element with itself is allowed."},
    {"name": "One element", "args": "(1, [(0, 0)])", "show": "largest_after_each(1, [(0, 0)])", "why": "[1]. Every element is a group of at least 1."},
    {"name": "Small groups join", "args": "(7, [(0, 1), (2, 3), (4, 5), (5, 6), (0, 2), (6, 1)])", "show": "largest_after_each(7, [(0, 1), (2, 3), (4, 5), (5, 6), (0, 2), (6, 1)])",
     "why": "[2, 2, 2, 3, 4, 7]. Joining two groups adds their sizes: 4 + 3 = 7."},
    {"name": "No pairs", "args": "(3, [])", "show": "largest_after_each(3, [])", "why": "[]: one answer per pair."},
    {"name": "Star", "args": "(6, [(0, k) for k in range(1, 6)])", "show": "largest_after_each(6, [(0, 1), (0, 2), (0, 3), (0, 4), (0, 5)])", "why": "[2, 3, 4, 5, 6]."},
    {"name": "200,000 pairs", "args": "(200_000, [((k * 7919) % 200_000, (k * 104729 + 13) % 200_000) for k in range(200_000)])", "expr": LBIG, "timeout": 4000,
     "show": "200,000 elements and 200,000 pairs: [answers, their sum, the first five, the last]",
     "why": "Keep the size at each root, and the largest size so far: sizes only grow, so the largest can only grow too. Searching all groups after every pair costs n steps each time."},
    {"name": "A long chain", "args": "(150_000, [(k, k + 1) for k in range(149_999)])", "expr": LBIG, "timeout": 4000,
     "show": "150,000 elements joined in a chain, (0, 1), (1, 2), …: [answers, their sum, the first five, the last]",
     "why": "Without union by size or path compression, this builds one long path and the finds go up the whole path every time."},
], trusted=LARGEST)

CYCLE = """
def first_cycle(n, roads):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for k, (a, b) in enumerate(roads):
        ra, rb = find(a), find(b)
        if ra == rb:
            return k
        if size[ra] > size[rb]:
            ra, rb = rb, ra
        parent[ra] = rb
        size[rb] += size[ra]
    return -1
"""

build(S, 3, "first_cycle", [
    {"name": "The example", "args": "(4, [(0, 1), (1, 2), (2, 0), (2, 3)])", "show": "first_cycle(4, [(0, 1), (1, 2), (2, 0), (2, 3)])",
     "why": "2: when road 2 (from 2 to 0) arrives, 2 and 0 are already connected through 1."},
    {"name": "No cycle", "args": "(4, [(0, 1), (1, 2), (2, 3)])", "show": "first_cycle(4, [(0, 1), (1, 2), (2, 3)])", "why": "-1: every road joins two separate groups."},
    {"name": "A road to itself", "args": "(3, [(0, 1), (2, 2), (1, 2)])", "show": "first_cycle(3, [(0, 1), (2, 2), (1, 2)])",
     "why": "1: a road from a place to itself is a loop at once."},
    {"name": "The same road twice", "args": "(3, [(0, 1), (1, 0)])", "show": "first_cycle(3, [(0, 1), (1, 0)])", "why": "1: a second road between the same two places closes a loop."},
    {"name": "Lesson 5's roads", "args": "(6, [(0, 1), (1, 2), (3, 4), (0, 2), (4, 5), (2, 3), (5, 3)])", "show": "first_cycle(6, the roads of the lesson's figure)",
     "why": "3: road 0–2 is the first to join two places already connected. Return the first, not the last."},
    {"name": "Separate groups", "args": "(6, [(0, 1), (2, 3), (4, 5), (1, 3), (5, 2), (0, 4)])", "show": "first_cycle(6, [(0, 1), (2, 3), (4, 5), (1, 3), (5, 2), (0, 4)])",
     "why": "5: after road 4 all six places are one group, so road 0–4 closes a loop."},
    {"name": "No roads", "args": "(5, [])", "show": "first_cycle(5, [])", "why": "-1."},
    {"name": "200,000 places", "args": "(200_000, [((k * 7919 + 13) % k, k) for k in range(1, 200_000)] + [(123_456, 98_765)])", "timeout": 4000,
     "show": "200,000 places; 199,999 roads that join a new place to an older one, then one more road",
     "why": "Only the last road closes a cycle. Searching the roads seen so far for a path before adding each road costs O(n) per road."},
    {"name": "A long chain", "args": "(150_000, [(k, k + 1) for k in range(149_999)] + [(0, 149_999)])", "timeout": 4000,
     "show": "150,000 places in a chain, then a road from the first to the last",
     "why": "Without union by size or path compression, the chain becomes one long path that every find goes up."},
], trusted=CYCLE)

ISLANDS = """
def islands_after_each(rows, cols, cells):
    parent = {}
    size = {}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    count = 0
    out = []
    for r, c in cells:
        i = r * cols + c
        if i not in parent:
            parent[i] = i
            size[i] = 1
            count += 1
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                j = nr * cols + nc
                if 0 <= nr < rows and 0 <= nc < cols and j in parent:
                    ra, rb = find(i), find(j)
                    if ra != rb:
                        if size[ra] > size[rb]:
                            ra, rb = rb, ra
                        parent[ra] = rb
                        size[rb] += size[ra]
                        count -= 1
        out.append(count)
    return out
"""

IBIG = "(lambda r: [len(r), sum(r), max(r), r[-5:]])(islands_after_each(*args))"
build(S, 4, "islands_after_each", [
    {"name": "The example", "args": "(3, 3, [(0, 0), (0, 1), (1, 2), (2, 1), (1, 1)])", "show": "islands_after_each(3, 3, [(0, 0), (0, 1), (1, 2), (2, 1), (1, 1)])",
     "why": "[1, 1, 2, 3, 1]. The last cell touches all three islands and joins them into one."},
    {"name": "Corners do not touch", "args": "(2, 2, [(0, 0), (1, 1), (0, 1)])", "show": "islands_after_each(2, 2, [(0, 0), (1, 1), (0, 1)])",
     "why": "[1, 2, 1]. Only up, down, left and right count. (0, 0) and (1, 1) touch at a corner only."},
    {"name": "Already land", "args": "(2, 3, [(0, 0), (0, 0), (0, 2), (0, 2)])", "show": "islands_after_each(2, 3, [(0, 0), (0, 0), (0, 2), (0, 2)])",
     "why": "[1, 1, 2, 2]. A cell that is already land changes nothing. Adding it again must not count a new island."},
    {"name": "Edges of the map", "args": "(1, 4, [(0, 3), (0, 0), (0, 2), (0, 1)])", "show": "islands_after_each(1, 4, [(0, 3), (0, 0), (0, 2), (0, 1)])",
     "why": "[1, 2, 2, 1]. Watch the edges: in a 1 by 4 map, cell (0, 3) has no right neighbour, and its number + 1 is not a neighbour on the next row."},
    {"name": "Wrapping rows", "args": "(2, 2, [(0, 1), (1, 0)])", "show": "islands_after_each(2, 2, [(0, 1), (1, 0)])",
     "why": "[1, 2]. Cells 1 and 2 are next to each other as numbers (r · cols + c), but not on the map. Check rows and columns, not just numbers."},
    {"name": "A ring", "args": "(3, 3, [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 1), (2, 0), (1, 0), (1, 1)])", "show": "islands_after_each(3, 3, a ring of 8 cells, then the middle)",
     "why": "[1, 1, 1, 1, 1, 1, 1, 1, 1]. When the ring closes, (1, 0) touches two cells of the same island: union must not count that twice."},
    {"name": "300 by 300", "args": "(300, 300, [((k * 7919) % 90_000 // 300, (k * 7919) % 90_000 % 300) for k in range(60_000)])", "expr": IBIG, "timeout": 4000,
     "show": "a 300 by 300 map; 60,000 cells become land in a scattered order: [answers, their sum, the most islands at once, the last five]",
     "why": "Counting the islands again after every cell costs up to 90,000 steps each time. Keep a union-find of the land cells and a running count."},
    {"name": "A long snake", "args": "(1, 100_000, [(0, c) for c in range(100_000)])", "expr": IBIG, "timeout": 4000,
     "show": "a map of 1 row and 100,000 columns, filled from left to right",
     "why": "Each new cell joins the island on its left. Without union by size or path compression this builds one long path of parents."},
], trusted=ISLANDS)

EQ = """
def consistent(facts):
    parent = {}
    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for f in facts:
        if '==' in f:
            a, b = f.split('==')
            parent[find(a)] = find(b)
    for f in facts:
        if '!=' in f:
            a, b = f.split('!=')
            if find(a) == find(b):
                return False
    return True
"""

build(S, 5, "consistent", [
    {"name": "The example", "args": "(['a==b', 'b==c', 'a!=c'],)", "show": "consistent(['a==b', 'b==c', 'a!=c'])", "why": "False: a equals b and b equals c, so a equals c."},
    {"name": "Can all hold", "args": "(['a==b', 'c!=a', 'c==d'],)", "show": "consistent(['a==b', 'c!=a', 'c==d'])", "why": "True: {a, b} and {c, d} are two groups, and a is not equal to c."},
    {"name": "Order of the facts", "args": "(['a!=b', 'b==c', 'c==a'],)", "show": "consistent(['a!=b', 'b==c', 'c==a'])",
     "why": "False. The != fact comes first, but the == facts after it still join a and b. Process all the == facts first, then check every != fact."},
    {"name": "Not equal to itself", "args": "(['x!=x'],)", "show": "consistent(['x!=x'])", "why": "False: nothing can be different from itself."},
    {"name": "Equal to itself", "args": "(['x==x', 'y!=x'],)", "show": "consistent(['x==x', 'y!=x'])", "why": "True."},
    {"name": "Longer names", "args": "(['delhi==dilli', 'mumbai==bombay', 'chennai==madras', 'bombay!=madras', 'dilli!=delhi'],)",
     "show": "consistent(['delhi==dilli', 'mumbai==bombay', 'chennai==madras', 'bombay!=madras', 'dilli!=delhi'])",
     "why": "False: dilli and delhi were made equal. Names are whole words: split each fact at '==' or '!='."},
    {"name": "No facts", "args": "([],)", "show": "consistent([])", "why": "True."},
    {"name": "A long chain, all fine", "args": "([f'v{k}==v{k + 1}' for k in range(100_000)] + [f'v0!=w{k}' for k in range(100_000)],)", "timeout": 4000,
     "show": "100,000 facts v0 == v1, v1 == v2, …, then 100,000 facts v0 != w0, v0 != w1, …",
     "why": "True. The chain v0 … v100000 is one group. Without union by size or path compression, it is one long path, and each of the 100,000 checks of v0 goes up all of it. A recursive find stops with RecursionError."},
    {"name": "A long chain, one clash", "args": "([f'v{k}==v{k + 1}' for k in range(100_000)] + [f'v{k}!=w{k}' for k in range(50_000)] + ['v100000!=v0'],)", "timeout": 4000,
     "show": "the same chain, 50,000 harmless != facts, then v100000 != v0",
     "why": "False: the two ends of the chain are equal."},
], trusted=EQ)
