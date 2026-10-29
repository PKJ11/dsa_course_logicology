// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def matching(nl, nr, pairs):
    adj = [[] for _ in range(nl)]
    for u, v in pairs:
        adj[u].append(v)
    mate_l = [-1] * nl                     # job of each driver
    mate_r = [-1] * nr                     # driver of each job
    for u in range(nl):                    # a quick greedy start
        for v in adj[u]:
            if mate_r[v] == -1:
                mate_l[u] = v
                mate_r[v] = u
                break
    INF = float('inf')
    while True:
        # BFS layers from every free driver at once
        dist = [INF] * nl
        q = deque()
        for u in range(nl):
            if mate_l[u] == -1:
                dist[u] = 0
                q.append(u)
        found = False
        while q:
            u = q.popleft()
            for v in adj[u]:
                w = mate_r[v]
                if w == -1:
                    found = True           # a free job: augmenting paths exist
                elif dist[w] == INF:
                    dist[w] = dist[u] + 1
                    q.append(w)
        if not found:
            break
        # many shortest augmenting paths, never sharing a driver
        ptr = [0] * nl
        for root in range(nl):
            if mate_l[root] != -1:
                continue
            path = [root]
            while path:
                u = path[-1]
                if ptr[u] == len(adj[u]):
                    dist[u] = INF          # a dead end for this phase
                    path.pop()
                    continue
                v = adj[u][ptr[u]]
                ptr[u] += 1
                w = mate_r[v]
                if w == -1:                # flip the path: each driver takes the next job
                    for x in reversed(path):
                        mate_l[x], v = v, mate_l[x]
                        mate_r[mate_l[x]] = x
                    break
                if dist[w] == dist[u] + 1:
                    path.append(w)
    return [(u, mate_l[u]) for u in range(nl) if mate_l[u] != -1]
`;

export const notes = [
  "A matching is largest exactly when no augmenting path is left (Berge's theorem, lesson 5): a path from a free driver to a free job whose pairs are, in turn, not in the matching and in it. Flipping such a path adds one pair.",
  "Hopcroft-Karp works in phases. A BFS from all free drivers at once gives each driver its distance; then depth-first searches, each from one free driver, follow only pairs that go one layer further, so every path found is a shortest one, and drivers used or found useless are not entered again in the phase.",
  "Each phase costs O(E), and there are only about 2√V phases, so the whole method is O(E √V). One search per free driver, the simpler method, is O(V · E): fine on the sparse 60,000-driver test, about 9 seconds in desktop Python on the 30,000-driver test.",
  "The flip: walking the path back from its end, each driver takes the job after it and gives up the job before it. The tuple assignment `mate_l[x], v = v, mate_l[x]` does both at once.",
  "All searches use loops and lists. An augmenting path can be 10,000 steps long (the chain test), far past the recursion limit.",
];
