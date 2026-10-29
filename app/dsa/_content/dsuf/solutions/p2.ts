// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def largest_after_each(n, pairs):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

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
`;

export const notes = [
  "Union by size keeps each group's size at its root, which is exactly what this problem asks about.",
  "Groups only grow, so the largest size can only grow too. After a union, the only new size is that of the joined group, so one comparison keeps `best` up to date. Searching every group after every pair would cost O(n) per pair.",
  "A pair inside one group changes nothing, and the answer is the same as before.",
  "Each pair costs two finds, nearly O(1), so the whole list costs nearly O(n + number of pairs).",
];
