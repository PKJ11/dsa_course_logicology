// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def min_cut(n, lines, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:                  # arc 2i: the line; arc 2i + 1: its way back
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    while True:                            # Edmonds-Karp to the end
        via = [-1] * n
        via[s] = -2
        q = deque([s])
        while q and via[t] == -1:
            u = q.popleft()
            for e in adj[u]:
                if cap[e] > 0 and via[to[e]] == -1:
                    via[to[e]] = e
                    q.append(to[e])
        if via[t] == -1:
            break
        push = None
        v = t
        while v != s:
            e = via[v]
            push = cap[e] if push is None else min(push, cap[e])
            v = to[e ^ 1]
        v = t
        while v != s:
            e = via[v]
            cap[e] -= push
            cap[e ^ 1] += push
            v = to[e ^ 1]
    # the last search could not reach t: what it reached is the side
    return [v for v in range(n) if via[v] != -1]
`;

export const notes = [
  "Any flow is at most any cut: every train from s to t crosses from S to the rest at least once more than it crosses back, so the value is at most the capacity of the lines from S (lesson 4).",
  "When the flow is maximum, the last search from s over the residual graph does not reach t. Let S be what it reached. Every line from S out is full (else the search would have crossed it), and every line from outside into S carries nothing (else its back arc would have let the search out). So the flow equals the capacity of this cut, and since no flow is larger than any cut, this cut is a smallest one.",
  "So the side is what the last search of Edmonds-Karp reached: no work is needed beyond the flow itself. With Dinic, the last BFS that gives t no level does the same job (stations with a level).",
  "There can be several smallest cuts. The stations that can still reach t in the residual graph give another one (the largest S); any is accepted.",
];
