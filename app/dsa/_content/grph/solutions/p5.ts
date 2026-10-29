// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def smallest_order(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n                    # edges still coming in
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    ready = [v for v in range(n) if indeg[v] == 0]
    heapq.heapify(ready)
    out = []
    while ready:
        u = heapq.heappop(ready)       # the smallest vertex that may go next
        out.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(ready, v)
    return out if len(out) == n else None
`;

export const notes = [
  "Kahn's method (lesson 5): a vertex may be placed when no edges come into it from vertices not yet placed. Its in-degree counts those edges; placing a vertex removes its outgoing edges by lowering its neighbours' counts.",
  "To make the order as small as possible, place the smallest ready vertex at every step. This greedy choice is right: the first place must hold a ready vertex, the smallest one gives the smallest first entry, and the rest is the same problem on the smaller graph.",
  "A heap gives the smallest ready vertex in O(log V), so the whole method is O((V + E) log V). A plain queue gives a correct order, but not the smallest; scanning all vertices at each step gives the smallest, but costs O(V²).",
  "If the graph has a cycle, its vertices never become ready, and fewer than n vertices are placed. Comparing `len(out)` with n detects that, so no separate cycle search is needed.",
];
