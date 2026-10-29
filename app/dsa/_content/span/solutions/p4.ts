// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def in_some_mst(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    order = sorted(range(len(edges)), key=lambda i: edges[i][2])
    ans = [False] * len(edges)
    i = 0
    while i < len(order):
        j = i
        w = edges[order[i]][2]
        while j < len(order) and edges[order[j]][2] == w:
            j += 1
        group = order[i:j]                 # every line of cost w
        for k in group:                    # joined by cheaper lines already?
            u, v, _ = edges[k]
            ans[k] = find(u) != find(v)
        for k in group:                    # then add the whole group
            u, v, _ = edges[k]
            a, b = find(u), find(v)
            if a != b:
                parent[a] = b
        i = j
    return ans
`;

export const notes = [
  "A line u–v of cost w is in some cheapest tree exactly when u and v are not joined by lines that are all cheaper than w. If they are, the line is the most expensive on a loop, and strictly more expensive than the rest of it, so by the cycle property no cheapest tree uses it.",
  "If they are not, look at the cut between the stations joined to u by cheaper lines and all the others. No cheaper line crosses it, so u–v is a cheapest line across that cut, and by the cut property some cheapest tree contains it (lesson 4).",
  "So sort the lines and handle them one cost at a time. First ask about every line of the group, with union-find holding only the cheaper lines; only then add the group. Adding each line before asking about the next line of the same cost gets ties wrong (a triangle of equal lines).",
  "The work is one sort and one union-find pass: O(E log E). A line from a station to itself is never in a tree: `find(u) == find(v)` is True for it.",
];
