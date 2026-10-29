from solgen import write_station

FIND = '''    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x
'''

write_station("dsuf", 5, {
    1: ('''class DSU:
    def __init__(self, n):
        self.parent = list(range(n))   # every element is a root
        self.sz = [1] * n              # set sizes, read at the roots
        self.sets = n

    def find(self, x):
        p = self.parent
        while p[x] != x:
            p[x] = p[p[x]]             # path halving
            x = p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.sz[ra] > self.sz[rb]:
            ra, rb = rb, ra            # ra is the smaller set
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
''', [
        "Each set is a tree stored in the list `parent`; the root is the set's representative, so `find` goes up to it.",
        "`find` uses path halving: every node it passes is pointed at its grandparent. It is a loop, so even a long path cannot reach Python's recursion limit.",
        "`union` puts the root of the smaller set under the root of the larger one (union by size), so a tree is never taller than log₂ n. It returns False when both roots are the same, without changing anything.",
        "Sizes are kept only at roots: `size(x)` reads `sz[find(x)]`. The set counter goes down only when a union really joins two sets.",
        "With both rules, a long run of operations costs nearly O(1) each (at most about 4 or 5 steps on average; lesson 4).",
    ]),
    2: ('''def largest_after_each(n, pairs):
    parent = list(range(n))
    size = [1] * n

''' + FIND + '''
    best = 1          # the largest group so far
    out = []
    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] > size[rb]:
                ra, rb = rb, ra
            parent[ra] = rb
            size[rb] += size[ra]
            if size[rb] > best:     # only the joined group is new
                best = size[rb]
        out.append(best)
    return out
''', [
        "Union by size keeps each group's size at its root, which is exactly what this problem asks about.",
        "Groups only grow, so the largest size can only grow too. After a union, the only new size is that of the joined group, so one comparison keeps `best` up to date. Searching every group after every pair would cost O(n) per pair.",
        "A pair inside one group changes nothing, and the answer is the same as before.",
        "Each pair costs two finds, nearly O(1), so the whole list costs nearly O(n + number of pairs).",
    ]),
    3: ('''def first_cycle(n, roads):
    parent = list(range(n))
    size = [1] * n

''' + FIND + '''
    for k, (a, b) in enumerate(roads):
        ra, rb = find(a), find(b)
        if ra == rb:          # a and b can already reach each other
            return k
        if size[ra] > size[rb]:
            ra, rb = rb, ra
        parent[ra] = rb
        size[rb] += size[ra]
    return -1
''', [
        "A road closes a loop exactly when its two ends were already connected, because then there was already a path between them, and the road turns that path into a loop.",
        "The union-find holds the groups of places connected by the roads so far. Equal roots mean already connected.",
        "A road (a, a) has equal roots at once, and a second road between the same places finds them already joined, so both cases come for free.",
        "Each road costs two finds and at most one union: nearly O(1) per road. Searching for a path before every road would cost O(n) per road.",
    ]),
    4: ('''def islands_after_each(rows, cols, cells):
    parent = {}       # only land cells are in the union-find
    size = {}

''' + FIND + '''
    count = 0
    out = []
    for r, c in cells:
        i = r * cols + c
        if i not in parent:           # already land: nothing changes
            parent[i] = i
            size[i] = 1
            count += 1                # a new island of one cell
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < rows and 0 <= nc < cols:
                    j = nr * cols + nc
                    if j in parent:
                        ra, rb = find(i), find(j)
                        if ra != rb:  # two islands become one
                            if size[ra] > size[rb]:
                                ra, rb = rb, ra
                            parent[ra] = rb
                            size[rb] += size[ra]
                            count -= 1
        out.append(count)
    return out
''', [
        "Cell (r, c) gets the number r · cols + c. Keeping the union-find in dicts means only land cells are stored, and `i in parent` doubles as the test for land.",
        "A rising cell starts as a new island (count + 1). Each union with a land neighbour that really joins two islands takes 1 off. Two neighbours on the same island give only one decrease, because the second union finds equal roots.",
        "The bounds are checked on the row and column, not on the cell number, so a cell at the end of a row is never joined to the start of the next row.",
        "Each cell costs at most four unions, nearly O(1), so the whole run is nearly O(number of cells). Recounting after every cell would cost O(rows · cols) each time.",
    ]),
    5: ('''def consistent(facts):
    parent = {}

    def find(x):
        parent.setdefault(x, x)        # a new name is its own root
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for f in facts:                    # first: every equal fact
        if "==" in f:
            a, b = f.split("==")
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
    for f in facts:                    # then: every not-equal fact
        if "!=" in f:
            a, b = f.split("!=")
            if find(a) == find(b):
                return False
    return True
''', [
        "Equality joins names into groups, and is transitive (a == b and b == c give a == c), which is what union-find keeps track of.",
        "The == facts are all applied first. Only then is every != fact checked: it fails exactly when its two names ended up in one group. Checking the != facts in the order they appear would miss an == fact that comes later.",
        "The parents live in a dict, so names need no numbering; `setdefault` adds a name the first time it is seen. `x != x` fails because both names are the same root.",
        "Path halving keeps finds short even though the chain test builds a path of 100,000 names, and the loop never reaches the recursion limit. The whole check is nearly O(number of facts).",
    ]),
})
