// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def flow_plan(n, lines, s, t):
    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:                  # arc 2i: the line; arc 2i + 1: its way back
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
    total = 0
    while True:
        level = [-1] * n                   # BFS distance from s in the residual graph
        level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for e in adj[u]:
                if cap[e] > 0 and level[to[e]] < 0:
                    level[to[e]] = level[u] + 1
                    q.append(to[e])
        if level[t] < 0:
            break                          # t cannot be reached: the flow is maximum
        ptr = [0] * n                      # next arc to try, per station
        while True:
            path = []                      # arcs from s to the current station
            u = s
            while u != t:
                while ptr[u] < len(adj[u]):
                    e = adj[u][ptr[u]]
                    if cap[e] > 0 and level[to[e]] == level[u] + 1:
                        break
                    ptr[u] += 1
                if ptr[u] == len(adj[u]):  # a dead end
                    if u == s:
                        break
                    level[u] = -1          # never enter it again this phase
                    e = path.pop()
                    u = to[e ^ 1]
                    ptr[u] += 1
                    continue
                e = adj[u][ptr[u]]
                path.append(e)
                u = to[e]
            if u != t:
                break                      # the phase is over: a blocking flow
            push = min(cap[e] for e in path)
            for e in path:
                cap[e] -= push
                cap[e ^ 1] += push
            total += push
    return total, [cap[2 * i + 1] for i in range(len(lines))]
`;

export const notes = [
  "This is Dinic's method (lesson 3). Each phase labels every station with its distance from s in the residual graph, then sends flow only along arcs that go one level down. Every path used in a phase is a shortest path.",
  "ptr[u] remembers the next arc of u to try, and never moves back during a phase. An arc is skipped when it is full or leads to a dead end, so each arc is passed over at most once per phase. Each path costs O(V) to walk, so a phase costs O(V · E), and the distance from s to t grows by at least 1 each phase, so there are at most V phases: O(V² · E) in all.",
  "Edmonds-Karp (one BFS per path) also uses shortest paths, so it needs O(V · E) paths, but each path costs a whole BFS. On the layered test thousands of paths have the same length; Dinic finds them all in one phase.",
  "The flow on line i is the residual of its back arc, cap[2i + 1]: it starts at 0 and holds exactly the trains sent along the line minus those sent back.",
  "The searches use loops and a list for the path, not recursion. Depth-first Ford-Fulkerson would pass the small tests but on the big ones its paths are long and carry little each, so it would run for hours.",
];
