// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def weak_points(n, lines):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(lines):
        if u != v:                         # a line to itself joins nothing
            adj[u].append((v, i))
            adj[v].append((u, i))
    disc = [0] * n                         # discovery number; 0 = not reached
    low = [0] * n
    cut = [False] * n
    bridges = []
    t = 0
    for s in range(n):
        if disc[s]:
            continue
        t += 1
        disc[s] = low[s] = t
        children = 0
        stack = [(s, -1, iter(adj[s]))]    # (station, line it came by, iterator)
        while stack:
            u, came, it = stack[-1]
            for v, i in it:
                if i == came:
                    continue               # not the line we arrived by
                if disc[v]:
                    low[u] = min(low[u], disc[v])
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, i, iter(adj[v])))
                    break
            else:
                stack.pop()                # u is finished
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        bridges.append(came)
                    if p == s:
                        children += 1
                    elif low[u] >= disc[p]:
                        cut[p] = True
        if children >= 2:
            cut[s] = True
    bridges.sort()
    return bridges, [v for v in range(n) if cut[v]]
`;

export const notes = [
  "In a search of an undirected network every line is a tree line or a line back up to a station still on the path (GRPH-3). low[u] is the smallest discovery number that u's part of the search tree can reach with one line back up.",
  "The tree line p–v is a bridge exactly when low[v] > disc[p]: nothing in v's part has a line back to p or above, so closing p–v cuts that part off. If some line did lead back to p or above, it would make a loop with p–v, and a line on a loop is never a bridge.",
  "A station p other than the start is a cut station exactly when some child v has low[v] >= disc[p]: v's part can get back to p but not above it, so closing p cuts that part off from the stations above p. The start has nothing above it; it is a cut station when it has two or more children, because the search could not get from one child's part to the other's except through the start.",
  "Skip the line you arrived by, by its position, not the parent station. A second line to the parent is a real second way, and then neither line is a bridge.",
  "Each station is pushed once and each line is looked at twice (once from each end): O(V + E). The stack holds the line each station came by, so the bridge can be reported by its position.",
];
