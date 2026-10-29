// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class DSU:
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
`;

export const notes = [
  "Each set is a tree stored in the list `parent`; the root is the set's representative, so `find` goes up to it.",
  "`find` uses path halving: every node it passes is pointed at its grandparent. It is a loop, so even a long path cannot reach Python's recursion limit.",
  "`union` puts the root of the smaller set under the root of the larger one (union by size), so a tree is never taller than log₂ n. It returns False when both roots are the same, without changing anything.",
  "Sizes are kept only at roots: `size(x)` reads `sz[find(x)]`. The set counter goes down only when a union really joins two sets.",
  "With both rules, a long run of operations costs nearly O(1) each (at most about 4 or 5 steps on average; lesson 4).",
];
