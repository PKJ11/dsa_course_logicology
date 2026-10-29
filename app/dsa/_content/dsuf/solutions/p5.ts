// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def consistent(facts):
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
`;

export const notes = [
  "Equality joins names into groups, and is transitive (a == b and b == c give a == c), which is what union-find keeps track of.",
  "The == facts are all applied first. Only then is every != fact checked: it fails exactly when its two names ended up in one group. Checking the != facts in the order they appear would miss an == fact that comes later.",
  "The parents live in a dict, so names need no numbering; `setdefault` adds a name the first time it is seen. `x != x` fails because both names are the same root.",
  "Path halving keeps finds short even though the chain test builds a path of 100,000 names, and the loop never reaches the recursion limit. The whole check is nearly O(number of facts).",
];
