// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import math
from collections import deque

def cheapest(n, edges, s):
    d = [math.inf] * n
    d[s] = 0
    for _ in range(n - 1):                 # n - 1 rounds are enough without bad loops
        changed = False
        for u, v, w in edges:
            if d[u] + w < d[v]:
                d[v] = d[u] + w
                changed = True
        if not changed:
            break                          # nothing can change any more
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append(v)
    q = deque()
    for u, v, w in edges:                  # one more round: who still improves?
        if d[u] + w < d[v] and d[v] != -math.inf:
            d[v] = -math.inf
            q.append(v)
    while q:                               # and everything they can reach
        u = q.popleft()
        for v in adj[u]:
            if d[v] != -math.inf:
                d[v] = -math.inf
                q.append(v)
    return [None if x == math.inf else x for x in d]
`;

export const notes = [
  "Bellman–Ford: go over every line, lowering d[v] when d[u] + w is smaller, and repeat. After round k, every station whose cheapest route uses at most k lines has its right fare. A cheapest route without a loop has at most n − 1 lines, so n − 1 rounds are enough when there is no loop below 0 (lesson 4).",
  "`math.inf + w` is still `math.inf`, so lines from stations not yet reached never lower anything; no special case is needed. Stopping when a round changes nothing is safe, and makes most networks much faster.",
  "If some line still lowers a fare after n − 1 rounds, a loop below 0 can be reached. But the stations that change in that extra round are only some of the stations the loop can reach: a station with a very cheap other way in may not change yet (the test 'A cheap way that a loop beats later'). So mark the stations that still change, then everything reachable from them, with a breadth-first search.",
  "Every station reachable from a bad loop has no cheapest fare, and every bad loop that the start can reach has a line that still improves in the extra round (the sum of its lines is below 0, so not all of them can be tight). Cost: O(V · E) for the rounds, O(V + E) for the marking.",
];
