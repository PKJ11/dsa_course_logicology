from solgen import write_station

write_station("grph", 7, {
    1: ('''def direct_lines(n, edges, queries):
    adj = [set() for _ in range(n)]    # one set of neighbours per vertex
    for u, v in edges:
        adj[u].add(v)                  # lines go both ways
        adj[v].add(u)
    return [v in adj[u] for u, v in queries]
''', [
        "Adjacency sets: one set of neighbours per vertex. Building them reads each edge once, O(V + E) time and memory. A repeated edge is stored once, because a set keeps one copy.",
        "`v in adj[u]` asks a set, which takes about the same time however many neighbours u has (HASH). With lists, the same question reads the list from the start: on the hub test that is up to 200,000 reads per question.",
        "An adjacency matrix also answers in O(1), but it needs n² entries: 10¹⁰ for 100,000 vertices. Sets need memory only for the edges that exist.",
        "Another way is one set of pairs: `lines = {(u, v) for u, v in edges} | {(v, u) for u, v in edges}`, then `(u, v) in lines`. It is just as fast; the sets per vertex also give the neighbours, which a search needs.",
    ]),
    2: ('''from collections import deque

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
''', [
        "Breadth-first search reaches vertices in order of their distance from s, so the first time it reaches t, it has done so by a route with the fewest edges (lesson 2's proof).",
        "`parent[v]` records the vertex that first reached v. It also serves as the visited mark, so no separate set is needed. Each vertex enters the queue once, so the search is O(V + E).",
        "Walking back from t along the parents gives the route backwards; `[::-1]` turns it round. The walk takes at most V steps.",
        "Stopping when t is taken from the queue is optional: the answer is the same, and on big networks it can save time. A `deque` takes from the front in O(1); `list.pop(0)` moves every other item, which is O(n) per step.",
    ]),
    3: ('''def finish_order(adj):
    n = len(adj)
    seen = [False] * n
    out = []
    for s in range(n):                 # start again from every vertex not yet seen
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(adj[s]))]    # the path, as the recursion would hold it
        while stack:
            u, it = stack[-1]
            for v in it:               # go on from where u's list was left
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(adj[v])))
                    break              # go deeper first
            else:                      # u has no neighbours left: it finishes
                stack.pop()
                out.append(u)
    return out
''', [
        "This is the recursive search written with a stack of our own. Each stack entry is a vertex and an iterator over its neighbours. The iterator remembers how far through the list we got, exactly as a paused recursive call remembers its place in its loop.",
        "The `for ... else` runs the `else` only when the loop ends without `break`: every neighbour has been tried, so u finishes. The `break` happens when an unseen neighbour is found: we go one level deeper, and come back to u's iterator later.",
        "Each vertex is pushed once and each edge is read once (iterators never restart), so the search is O(V + E). The stack can grow to V entries, but it is a Python list, not the call stack, so a path of 100,000 vertices is no problem.",
        "Pushing all neighbours at once and popping one at a time gives a valid depth-first visiting order, but not the same one, and it has no moment when a vertex finishes. Finish times are what lessons 4 and 5 use, so the iterator form is the one to know.",
    ]),
    4: ('''def find_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    state = [0] * n          # 0 not reached, 1 on the current path, 2 finished
    parent = [-1] * n
    for s in range(n):
        if state[s]:
            continue
        state[s] = 1
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if state[v] == 0:
                    state[v] = 1
                    parent[v] = u
                    stack.append((v, iter(adj[v])))
                    break
                if state[v] == 1:      # an edge back to the path: a cycle
                    cyc = [u]
                    while cyc[-1] != v:
                        cyc.append(parent[cyc[-1]])
                    return cyc[::-1]
            else:
                stack.pop()
                state[u] = 2           # finished: no cycle through here
    return None
''', [
        "Three states. A vertex is on the current path (1) from the moment the search reaches it until it finishes; after that it is finished (2). An edge u → v with v on the path closes a cycle: v leads to u along the path, and u leads back to v.",
        "An edge to a finished vertex is never a cycle in a directed graph: everything a finished vertex can reach has been searched, and none of it led back to the path (lesson 4's proof). Treating every visited vertex as a cycle fails on the diamond test.",
        "The cycle is rebuilt from the parents: from u up the path until v, then turned round so it lists the edges in their direction. It runs from v to u, and the edge u → v closes it.",
        "Every vertex finishes at most once, so the search is O(V + E). Forgetting finished vertices (searching them again from every path) is correct but can take exponential time: the 40-layer test has 2⁴⁰ paths.",
    ]),
    5: ('''import heapq

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
''', [
        "Kahn's method (lesson 5): a vertex may be placed when no edges come into it from vertices not yet placed. Its in-degree counts those edges; placing a vertex removes its outgoing edges by lowering its neighbours' counts.",
        "To make the order as small as possible, place the smallest ready vertex at every step. This greedy choice is right: the first place must hold a ready vertex, the smallest one gives the smallest first entry, and the rest is the same problem on the smaller graph.",
        "A heap gives the smallest ready vertex in O(log V), so the whole method is O((V + E) log V). A plain queue gives a correct order, but not the smallest; scanning all vertices at each step gives the smallest, but costs O(V²).",
        "If the graph has a cycle, its vertices never become ready, and fewer than n vertices are placed. Comparing `len(out)` with n detects that, so no separate cycle search is needed.",
    ]),
    6: ('''from collections import deque

def two_teams(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    side = [-1] * n
    parent = [-1] * n
    for s in range(n):                 # every part of the graph
        if side[s] != -1:
            continue
        side[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if side[v] == -1:
                    side[v] = 1 - side[u]
                    parent[v] = u
                    q.append(v)
                elif side[v] == side[u]:
                    # u and v are on the same level: walk up until the routes meet
                    a, b = [u], [v]
                    while a[-1] != b[-1]:
                        a.append(parent[a[-1]])
                        b.append(parent[b[-1]])
                    return (False, a + b[-2::-1])
    return (True, side)
''', [
        "Breadth-first search gives each vertex the team opposite to the vertex that reached it, so a vertex's team is its level's parity (even or odd distance from the start). Every part of the graph gets its own start.",
        "An edge that joins two vertices of the same team must join two vertices of the same level: BFS levels of two neighbours differ by at most 1, and equal parity then means equal level.",
        "Both vertices are k levels below the place where their routes from the start meet. Walking up both lists of parents one step at a time reaches that place at the same moment. The cycle is u up to the meeting place, down to v, and the edge v–u back: k + k + 1 edges, an odd number.",
        "`a + b[-2::-1]` joins the two walks: a runs from u up to the meeting place, and b reversed (without its last item, the meeting place again) runs down to v. The whole method is O(V + E), with no recursion.",
    ]),
    7: ('''from collections import deque

def fewest_moves(grid, k):
    R, C = len(grid), len(grid[0])
    # least[r][c]: the fewest walls used by any visit to (r, c) so far
    least = [[k + 1] * C for _ in range(R)]
    least[0][0] = 0
    q = deque([(0, 0, 0)])             # (row, column, walls used)
    moves = 0
    while q:
        for _ in range(len(q)):        # every state that is `moves` away
            r, c, used = q.popleft()
            if r == R - 1 and c == C - 1:
                return moves
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < R and 0 <= nc < C:
                    w = used + (grid[nr][nc] == '#')
                    if w < least[nr][nc]:   # only a visit with fewer walls used can help
                        least[nr][nc] = w
                        q.append((nr, nc, w))
        moves += 1
    return -1
''', [
        "The vertices of this graph are states (row, column, walls used), not squares. Two visits to the same square with different walls used are different situations: one can still break walls that the other cannot (the test 'One visit per square is not enough').",
        "Breadth-first search reaches states in order of moves. So when a square is reached again, it is never by fewer moves. That later visit is useful only if it has used fewer walls; `least` keeps the fewest walls seen at each square and lets only such visits in.",
        "Each square can be entered at most k + 1 times (walls used k, k − 1, …, 0, each smaller than the last), so the search is O(R · C · (k + 1)). A table `seen[r][c][w]` of all states works too, and costs the same.",
        "The loop `for _ in range(len(q))` takes the queue one level at a time, so `moves` is the distance of every state in that level. Storing the distance inside each queue entry works just as well.",
    ]),
})
