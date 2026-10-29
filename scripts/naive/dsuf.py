# Naive DSUF solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
class DSU:
    # no union rule and no compression: the first root always goes under the second
    def __init__(self, n):
        self.parent = list(range(n))
        self.sets = n
    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.parent[ra] = rb
        self.sets -= 1
        return True
    def connected(self, a, b):
        return self.find(a) == self.find(b)
    def size(self, x):
        r = self.find(x)
        return sum(1 for y in range(len(self.parent)) if self.find(y) == r)
    def groups(self):
        return self.sets
''', [4, 7]),
    2: ('''
def largest_after_each(n, pairs):
    # union by size, but the largest group is searched for after every pair
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    out = []
    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] > size[rb]:
                ra, rb = rb, ra
            parent[ra] = rb
            size[rb] += size[ra]
        out.append(max(size[x] for x in range(n) if parent[x] == x))
    return out
''', [6, 7]),
    3: ('''
def first_cycle(n, roads):
    # before each road, search the roads so far for a path
    adj = [[] for _ in range(n)]
    for k, (a, b) in enumerate(roads):
        seen = {a}
        todo = [a]
        while todo:
            x = todo.pop()
            for y in adj[x]:
                if y not in seen:
                    seen.add(y)
                    todo.append(y)
        if b in seen:
            return k
        adj[a].append(b)
        adj[b].append(a)
    return -1
''', [7, 8]),
    4: ('''
def islands_after_each(rows, cols, cells):
    # count the islands again after every cell
    land = set()
    out = []
    for r, c in cells:
        land.add((r, c))
        seen = set()
        count = 0
        for cell in land:
            if cell in seen:
                continue
            count += 1
            todo = [cell]
            seen.add(cell)
            while todo:
                x, y = todo.pop()
                for nb in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nb in land and nb not in seen:
                        seen.add(nb)
                        todo.append(nb)
        out.append(count)
    return out
''', [6, 7]),
    5: ('''
def consistent(facts):
    # a recursive find with no union rule
    parent = {}
    def find(x):
        parent.setdefault(x, x)
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
    for f in facts:
        if "==" in f:
            a, b = f.split("==")
            parent[find(a)] = find(b)
    for f in facts:
        if "!=" in f:
            a, b = f.split("!=")
            if find(a) == find(b):
                return False
    return True
''', [7, 8]),
}

# Wrong orders, run by hand: P5 checking != facts as they arrive.
NAIVE_P5_ORDER = '''
def consistent(facts):
    parent = {}
    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for f in facts:
        if "==" in f:
            a, b = f.split("==")
            parent[find(a)] = find(b)
        else:
            a, b = f.split("!=")
            if find(a) == find(b):
                return False
    return True
'''
