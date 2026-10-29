// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def islands_after_each(rows, cols, cells):
    parent = {}       # only land cells are in the union-find
    size = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

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
`;

export const notes = [
  "Cell (r, c) gets the number r · cols + c. Keeping the union-find in dicts means only land cells are stored, and `i in parent` doubles as the test for land.",
  "A rising cell starts as a new island (count + 1). Each union with a land neighbour that really joins two islands takes 1 off. Two neighbours on the same island give only one decrease, because the second union finds equal roots.",
  "The bounds are checked on the row and column, not on the cell number, so a cell at the end of a row is never joined to the start of the next row.",
  "Each cell costs at most four unions, nearly O(1), so the whole run is nearly O(number of cells). Recounting after every cell would cost O(rows · cols) each time.",
];
