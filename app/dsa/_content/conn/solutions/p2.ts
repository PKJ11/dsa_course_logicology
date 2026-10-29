// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def scc(n, streets):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]          # the streets turned round
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)
    # first search: the finish order, with a stack of (vertex, iterator)
    seen = [False] * n
    order = []
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(out[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(out[v])))
                    break
            else:
                stack.pop()
                order.append(u)            # u finishes
    # second pass: latest finish first, along the turned-round streets
    group = [-1] * n
    c = 0
    for s in reversed(order):
        if group[s] != -1:
            continue
        group[s] = c
        stack = [s]
        while stack:
            u = stack.pop()
            for v in back[u]:
                if group[v] == -1:
                    group[v] = c
                    stack.append(v)
        c += 1                             # one search, one group
    return group
`;

export const notes = [
  "This is Kosaraju's method (lesson 2). The first search records the order in which vertices finish. Lesson 2 proves that if a street leads from group X to a different group Y, the last finish in X is later than the last finish in Y.",
  "So the vertex that finished last is in a group that no other group's street leads into: a first group in topological order. Searching from it along the turned-round streets reaches exactly its own group, because any street that leaves the group in the turned-round graph would be a street into the group in the real one.",
  "Then take the next vertex (by latest finish) that has no group yet, and repeat. Streets to groups already found are ignored, which is why each later search also stays inside its own group. The groups are found in topological order, so numbering them 0, 1, 2, … as they are found gives group[u] <= group[v] for every street.",
  "Both passes use their own stack. The first needs the (vertex, iterator) form from GRPH-P3, because the finish order matters; the second only needs to reach, so a plain stack is enough. O(V + E) in all.",
  "Tarjan's method also works in one search, but it finishes the groups in reverse topological order: with Tarjan, return count − 1 − c.",
];
