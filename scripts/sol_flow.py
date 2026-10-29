from solgen import write_station

ARCS = '''    to, cap, adj = [], [], [[] for _ in range(n)]
    for u, v, c in lines:                  # arc 2i: the line; arc 2i + 1: its way back
        adj[u].append(len(to)); to.append(v); cap.append(c)
        adj[v].append(len(to)); to.append(u); cap.append(0)
'''

write_station("flow", 5, {
    1: ('''def flow_value(n, lines, flow, s, t):
    if len(flow) != len(lines):
        return None
    net = [0] * n                          # flow out minus flow in
    for (u, v, c), f in zip(lines, flow):
        if f < 0 or f > c:                 # the capacity rule
            return None
        net[u] += f
        net[v] -= f
    for v in range(n):
        if v != s and v != t and net[v] != 0:
            return None                    # conservation is broken at v
    return net[s]
''', [
        "Both rules are checked in one pass over the lines. The capacity rule looks at one line at a time. Conservation needs, for each station, the total in and the total out, so keep one running number per station: out minus in.",
        "A line from u to itself adds f to net[u] and takes it away again, so it never breaks conservation, though it must still keep within its capacity.",
        "The value is the flow out of s minus the flow into s. Adding up net over all stations gives 0 (each line adds f once and takes it once), and every station but s and t has net 0, so net[s] = −net[t]: what leaves the source is what reaches the sink.",
        "O(V + E). Looping over all lines once for each station to find its in and out is O(V · E), which is 10 billion steps on the big tests.",
    ]),
    2: ('''def max_flow(n, lines, s, t):
''' + ARCS + '''    total = 0
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
''', [
        "This is Ford-Fulkerson (lesson 2). The residual graph is kept in two lists: arc 2i is line i with what is left of its capacity, and arc 2i + 1 is the way back, holding the flow already sent (so it can be undone). The partner of arc e is e ^ 1.",
        "Each round finds any path from s to t over arcs with residual above 0, and sends as much as its smallest residual. Sending along a back arc takes flow off a line: that is how the method fixes an earlier bad choice, as in the diamond.",
        "When no path is left, the flow is maximum (lesson 4 proves it with cuts). With whole-number capacities each round sends at least 1, so there are at most (maximum flow) rounds, each O(V + E).",
        "That bound depends on the capacities. Here they are at most 100 and the networks are small, so any search works. P3 has networks where it does not.",
    ]),
    3: ('''from collections import deque

def flow_plan(n, lines, s, t):
''' + ARCS + '''    total = 0
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
''', [
        "This is Dinic's method (lesson 3). Each phase labels every station with its distance from s in the residual graph, then sends flow only along arcs that go one level down. Every path used in a phase is a shortest path.",
        "ptr[u] remembers the next arc of u to try, and never moves back during a phase. An arc is skipped when it is full or leads to a dead end, so each arc is passed over at most once per phase. Each path costs O(V) to walk, so a phase costs O(V · E), and the distance from s to t grows by at least 1 each phase, so there are at most V phases: O(V² · E) in all.",
        "Edmonds-Karp (one BFS per path) also uses shortest paths, so it needs O(V · E) paths, but each path costs a whole BFS. On the layered test thousands of paths have the same length; Dinic finds them all in one phase.",
        "The flow on line i is the residual of its back arc, cap[2i + 1]: it starts at 0 and holds exactly the trains sent along the line minus those sent back.",
        "The searches use loops and a list for the path, not recursion. Depth-first Ford-Fulkerson would pass the small tests but on the big ones its paths are long and carry little each, so it would run for hours.",
    ]),
    4: ('''from collections import deque

def min_cut(n, lines, s, t):
''' + ARCS + '''    while True:                            # Edmonds-Karp to the end
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
''', [
        "Any flow is at most any cut: every train from s to t crosses from S to the rest at least once more than it crosses back, so the value is at most the capacity of the lines from S (lesson 4).",
        "When the flow is maximum, the last search from s over the residual graph does not reach t. Let S be what it reached. Every line from S out is full (else the search would have crossed it), and every line from outside into S carries nothing (else its back arc would have let the search out). So the flow equals the capacity of this cut, and since no flow is larger than any cut, this cut is a smallest one.",
        "So the side is what the last search of Edmonds-Karp reached: no work is needed beyond the flow itself. With Dinic, the last BFS that gives t no level does the same job (stations with a level).",
        "There can be several smallest cuts. The stations that can still reach t in the residual graph give another one (the largest S); any is accepted.",
    ]),
    5: ('''from collections import deque

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
''', [
        "A matching is largest exactly when no augmenting path is left (Berge's theorem, lesson 5): a path from a free driver to a free job whose pairs are, in turn, not in the matching and in it. Flipping such a path adds one pair.",
        "Hopcroft-Karp works in phases. A BFS from all free drivers at once gives each driver its distance; then depth-first searches, each from one free driver, follow only pairs that go one layer further, so every path found is a shortest one, and drivers used or found useless are not entered again in the phase.",
        "Each phase costs O(E), and there are only about 2√V phases, so the whole method is O(E √V). One search per free driver, the simpler method, is O(V · E): fine on the sparse 60,000-driver test, about 9 seconds in desktop Python on the 30,000-driver test.",
        "The flip: walking the path back from its end, each driver takes the job after it and gives up the job before it. The tuple assignment `mate_l[x], v = v, mate_l[x]` does both at once.",
        "All searches use loops and lists. An augmenting path can be 10,000 steps long (the chain test), far past the recursion limit.",
    ]),
})
