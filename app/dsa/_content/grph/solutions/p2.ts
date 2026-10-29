// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def route(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n                  # -1: not reached yet
    parent[s] = s
    q = deque([s])
    while q:
        u = q.popleft()
        if u == t:
            break                      # t's route is already known
        for v in adj[u]:
            if parent[v] == -1:        # mark when first reached, not when taken out
                parent[v] = u
                q.append(v)
    if parent[t] == -1:
        return None
    path = [t]
    while path[-1] != s:               # walk back along the parents
        path.append(parent[path[-1]])
    return path[::-1]
`;

export const notes = [
  "Breadth-first search reaches vertices in order of their distance from s, so the first time it reaches t, it has done so by a route with the fewest edges (lesson 2's proof).",
  "`parent[v]` records the vertex that first reached v. It also serves as the visited mark, so no separate set is needed. Each vertex enters the queue once, so the search is O(V + E).",
  "Walking back from t along the parents gives the route backwards; `[::-1]` turns it round. The walk takes at most V steps.",
  "Stopping when t is taken from the queue is optional: the answer is the same, and on big networks it can save time. A `deque` takes from the front in O(1); `list.pop(0)` moves every other item, which is O(n) per step.",
];
