// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def fewest_reversals(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append((v, 0))              # along the line: no cost
        adj[v].append((u, 1))              # against it: one reversal
    INF = float('inf')
    dist = [INF] * n
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        d = dist[u]
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                if w == 0:
                    q.appendleft(v)        # same distance: handle it next
                else:
                    q.append(v)            # one more: handle it later
    return -1 if dist[t] == INF else dist[t]
`;

export const notes = [
  "Turn the question into a graph with costs 0 and 1. Moving along a one-way line costs nothing; moving against it means reversing it, which costs 1. The fewest reversals is the cheapest route from s to t in this graph.",
  "0-1 BFS keeps the deque in order of distance: the front holds distance d and the back d + 1. A cost-0 move keeps the distance, so it goes to the front; a cost-1 move goes to the back. Stations then leave the deque in order of distance, as in Dijkstra's method, but each step is O(1) instead of O(log V).",
  "A station can be added twice: first by a cost-1 move, later with a smaller value by a cost-0 move. So the test is `d + w < dist[v]`, not 'not seen yet'. When the old copy comes out later, its value is not smaller than anything, and its moves change nothing. Each station is handled at most twice, so the method is O(V + E).",
  "A heap (Dijkstra's method) also gives the right answer, in O((V + E) log V). A plain breadth-first search does not: it keeps the value a station was first reached with (tests 'The long way is free' and 'Front, not back').",
];
