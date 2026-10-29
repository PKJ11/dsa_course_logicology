// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def max_flow(n, lines, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:                  # arc 2i: the line; arc 2i + 1: its way back
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        via = [-1] * n                     # the arc that reached each station
        via[s] = -2
        stack = [s]
        while stack and via[t] == -1:      # any search will do: depth-first here
            u = stack.pop()
            for e in adj[u]:
                if cap[e] > 0 and via[to[e]] == -1:
                    via[to[e]] = e
                    stack.append(to[e])
        if via[t] == -1:
            return total                   # no augmenting path is left
        push = None
        v = t
        while v != s:                      # the smallest residual on the path
            e = via[v]
            push = cap[e] if push is None else min(push, cap[e])
            v = to[e ^ 1]
        v = t
        while v != s:
            e = via[v]
            cap[e] -= push                 # use some of the line
            cap[e ^ 1] += push             # and allow it to be undone
            v = to[e ^ 1]
        total += push
`;

export const notes = [
  "This is Ford-Fulkerson (lesson 2). The residual graph is kept in two lists: arc 2i is line i with what is left of its capacity, and arc 2i + 1 is the way back, holding the flow already sent (so it can be undone). The partner of arc e is e ^ 1.",
  "Each round finds any path from s to t over arcs with residual above 0, and sends as much as its smallest residual. Sending along a back arc takes flow off a line: that is how the method fixes an earlier bad choice, as in the diamond.",
  "When no path is left, the flow is maximum (lesson 4 proves it with cuts). With whole-number capacities each round sends at least 1, so there are at most (maximum flow) rounds, each O(V + E).",
  "That bound depends on the capacities. Here they are at most 100 and the networks are small, so any search works. P3 has networks where it does not.",
];
