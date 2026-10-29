// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def first_cycle(n, roads):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

    for k, (a, b) in enumerate(roads):
        ra, rb = find(a), find(b)
        if ra == rb:          # a and b can already reach each other
            return k
        if size[ra] > size[rb]:
            ra, rb = rb, ra
        parent[ra] = rb
        size[rb] += size[ra]
    return -1
`;

export const notes = [
  "A road closes a loop exactly when its two ends were already connected, because then there was already a path between them, and the road turns that path into a loop.",
  "The union-find holds the groups of places connected by the roads so far. Equal roots mean already connected.",
  "A road (a, a) has equal roots at once, and a second road between the same places finds them already joined, so both cases come for free.",
  "Each road costs two finds and at most one union: nearly O(1) per road. Searching for a path before every road would cost O(n) per road.",
];
