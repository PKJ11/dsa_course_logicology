// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def finish_order(adj):
    n = len(adj)
    seen = [False] * n
    out = []
    for s in range(n):                 # start again from every vertex not yet seen
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(adj[s]))]    # the path, as the recursion would hold it
        while stack:
            u, it = stack[-1]
            for v in it:               # go on from where u's list was left
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(adj[v])))
                    break              # go deeper first
            else:                      # u has no neighbours left: it finishes
                stack.pop()
                out.append(u)
    return out
`;

export const notes = [
  "This is the recursive search written with a stack of our own. Each stack entry is a vertex and an iterator over its neighbours. The iterator remembers how far through the list we got, exactly as a paused recursive call remembers its place in its loop.",
  "The `for ... else` runs the `else` only when the loop ends without `break`: every neighbour has been tried, so u finishes. The `break` happens when an unseen neighbour is found: we go one level deeper, and come back to u's iterator later.",
  "Each vertex is pushed once and each edge is read once (iterators never restart), so the search is O(V + E). The stack can grow to V entries, but it is a Python list, not the call stack, so a path of 100,000 vertices is no problem.",
  "Pushing all neighbours at once and popping one at a time gives a valid depth-first visiting order, but not the same one, and it has no moment when a vertex finishes. Finish times are what lessons 4 and 5 use, so the iterator form is the one to know.",
];
