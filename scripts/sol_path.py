from solgen import write_station

write_station("path", 7, {
    1: ('''from collections import deque

def are_shortest(n, edges, s, d):
    if d[s] != 0:
        return False
    tight = [[] for _ in range(n)]         # lines with d[v] == d[u] + w
    for u, v, w in edges:
        if d[u] is None:
            continue                       # lines out of unreachable stations
        if d[v] is None or d[u] + w < d[v]:
            return False                   # this line gives a shorter way to v
        if d[u] + w == d[v]:
            tight[u].append(v)
    # every station with a number must be reached from s along tight lines
    seen = [False] * n
    seen[s] = True
    q = deque([s])
    while q:
        u = q.popleft()
        for v in tight[u]:
            if not seen[v]:
                seen[v] = True
                q.append(v)
    return all(seen[v] == (d[v] is not None) for v in range(n))
''', [
        "Two facts make a list d the true distances. First, no line can make anything shorter: d[v] <= d[u] + w for every line u → v from a reachable station. Along a shortest route to any v this gives d[v] <= the true distance, step by step from d[s] = 0.",
        "Second, every value is made by a real route. Each tight line (d[v] == d[u] + w) adds exactly its time, so if v is reached from s along tight lines, d[v] is the time of that route, which is at least the true distance. Both together give d[v] equal to the true distance.",
        "Checking only that each value has some tight line coming in is not enough. With lines of 0 minutes, tight lines can go round a loop that never starts from s (the test 'Zero-minute lines in a loop'). The breadth-first search along tight lines is what rules that out.",
        "A station that cannot be reached must be None, and the search along tight lines also checks that: it reaches exactly the stations with numbers. Every line is read once and the search is O(V + E), with no heap. Running Dijkstra's method and comparing is also correct, and costs O((V + E) log V).",
    ]),
    2: ('''from collections import deque

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
''', [
        "Turn the question into a graph with costs 0 and 1. Moving along a one-way line costs nothing; moving against it means reversing it, which costs 1. The fewest reversals is the cheapest route from s to t in this graph.",
        "0-1 BFS keeps the deque in order of distance: the front holds distance d and the back d + 1. A cost-0 move keeps the distance, so it goes to the front; a cost-1 move goes to the back. Stations then leave the deque in order of distance, as in Dijkstra's method, but each step is O(1) instead of O(log V).",
        "A station can be added twice: first by a cost-1 move, later with a smaller value by a cost-0 move. So the test is `d + w < dist[v]`, not 'not seen yet'. When the old copy comes out later, its value is not smaller than anything, and its moves change nothing. Each station is handled at most twice, so the method is O(V + E).",
        "A heap (Dijkstra's method) also gives the right answer, in O((V + E) log V). A plain breadth-first search does not: it keeps the value a station was first reached with (tests 'The long way is free' and 'Front, not back').",
    ]),
    3: ('''import heapq

def fastest(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    parent = [-1] * n
    dist[s] = 0
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                       # an old entry: u was settled already
        if u == t:
            break                          # t's time is final
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (d + w, v))
    if dist[t] == INF:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    return (dist[t], route[::-1])
''', [
        "Dijkstra's method: take the unsettled station with the smallest time, settle it, and offer better times to its neighbours. With no negative times, the smallest time in the heap can never be improved later, because any other way to that station passes a station whose time is at least as big (lesson 3's proof).",
        "heapq has no 'lower this entry' operation, so a better time is pushed as a new entry and the old one stays in the heap. When an entry comes out with `d > dist[u]`, it is old: skip it. Without the skip, a station that was offered better times many times is handled many times, and each time all its lines are read again (the 'busy station' test).",
        "`parent[v]` remembers the station that gave v its best time. When t is taken out, its time is final, so the search can stop there; walking the parents back from t gives the route.",
        "Cost: each line can push one entry, so the heap holds at most E entries, and each push or pop costs O(log E) = O(log V). The total is O((V + E) log V). Scanning all stations for the smallest time instead costs O(V) per station, O(V²) in all: fine for dense networks, far too slow for 100,000 stations with few lines.",
    ]),
    4: ('''import math
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
''', [
        "Bellman–Ford: go over every line, lowering d[v] when d[u] + w is smaller, and repeat. After round k, every station whose cheapest route uses at most k lines has its right fare. A cheapest route without a loop has at most n − 1 lines, so n − 1 rounds are enough when there is no loop below 0 (lesson 4).",
        "`math.inf + w` is still `math.inf`, so lines from stations not yet reached never lower anything; no special case is needed. Stopping when a round changes nothing is safe, and makes most networks much faster.",
        "If some line still lowers a fare after n − 1 rounds, a loop below 0 can be reached. But the stations that change in that extra round are only some of the stations the loop can reach: a station with a very cheap other way in may not change yet (the test 'A cheap way that a loop beats later'). So mark the stations that still change, then everything reachable from them, with a breadth-first search.",
        "Every station reachable from a bad loop has no cheapest fare, and every bad loop that the start can reach has a line that still improves in the extra round (the sum of its lines is below 0, so not all of them can be tight). Cost: O(V · E) for the rounds, O(V + E) for the marking.",
    ]),
    5: ('''import math

def cheapest_routes(n, edges, queries):
    d = [[math.inf] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]   # nxt[i][j]: the first step from i towards j
    for i in range(n):
        d[i][i] = 0
        nxt[i][i] = i
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w                    # keep the cheaper of two lines
            nxt[u][v] = v
    for k in range(n):                     # k: now allowed in the middle
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == math.inf:
                continue                   # i cannot reach k: nothing changes
            row = d[i]
            new = [dik + b if dik + b < a else a for a, b in zip(row, dk)]
            if new != row:                 # only rows that got cheaper need new first steps
                nik = nxt[i][k]            # going through k starts like going to k
                nxt[i] = [x if c == a else nik for a, c, x in zip(row, new, nxt[i])]
                d[i] = new
    if any(d[i][i] < 0 for i in range(n)):
        return None                        # a loop below 0
    out = []
    for i, j in queries:
        if d[i][j] == math.inf:
            out.append(None)
            continue
        route = [i]
        while route[-1] != j:              # follow first steps until j
            route.append(nxt[route[-1]][j])
        out.append(route)
    return out
''', [
        "Floyd–Warshall (lesson 5) with a second table: nxt[i][j] is the first station after i on the cheapest route found so far from i to j. A direct line sets it to j.",
        "When going through k makes d[i][j] cheaper, the new route starts the way the route from i to k starts, so nxt[i][j] becomes nxt[i][k]. Both tables are updated row by row with list comprehensions, which run at C speed; k must be the outer loop, for the reason the lesson proves.",
        "To list a route, start at i and keep taking the first step towards j. Each step lands on a station whose cheapest route to j is one line shorter, so the walk ends at j, even when some loops cost exactly 0. Following 'any line that keeps the cost' instead can go round a loop of free lines for ever (the test 'Free lines both ways').",
        "A loop below 0 shows up as d[i][i] < 0. Cost: O(n³) time and O(n²) memory for the tables, plus O(n) per route listed.",
    ]),
    6: ('''from collections import deque

def dag_routes(n, edges, s):
    M = 1_000_000_007
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indeg[v] += 1
    order = []                             # Kahn's method (GRPH-5)
    q = deque(v for v in range(n) if indeg[v] == 0)
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    dist = [None] * n
    ways = [0] * n
    dist[s], ways[s] = 0, 1
    for u in order:                        # every line into u is done by now
        if dist[u] is None:
            continue
        for v, w in adj[u]:
            nd = dist[u] + w
            if dist[v] is None or nd < dist[v]:
                dist[v], ways[v] = nd, ways[u]    # a cheaper way: start counting again
            elif nd == dist[v]:
                ways[v] = (ways[v] + ways[u]) % M  # just as cheap: add its routes
    return (dist, ways)
''', [
        "In a DAG, a topological order puts every line forward. Going through the stations in that order, all lines into a station have been offered before the station is reached, so its time and its count are final when its own lines are handled. That is the DP order of DYNP-3, and why negative times are no problem here.",
        "The count follows the time. A cheaper offer replaces both the time and the count. An equally cheap offer adds the giver's count: every cheapest route to v ends with one line into v, and the cheapest routes to v through u are exactly the cheapest routes to u, followed by that line.",
        "Stations before s in the order, and stations s cannot reach, keep None and 0. A line from such a station is skipped, because `dist[u] is None`.",
        "Kahn's method needs no recursion, so the chain of 100,000 is no problem. The whole method is O(V + E). Recursion with a memo is the same DP in the other direction (asking each station's incoming lines), but it is 100,000 calls deep on the chain.",
    ]),
    7: ('''import heapq

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    gx, gy = goal
    def h(x, y):                           # a guess that is never too high
        return abs(x - gx) + abs(y - gy)
    start = tuple(start)
    g = {start: 0}                         # best moves found so far
    heap = [(h(*start), 0, start)]         # (f, -g, square)
    while heap:
        f, neg, p = heapq.heappop(heap)
        d = -neg
        if d > g[p]:
            continue                       # an old entry
        if p == (gx, gy):
            return d
        x, y = p
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q in blocked:
                continue
            if d + 1 < g.get(q, d + 2):
                g[q] = d + 1
                heapq.heappush(heap, (d + 1 + h(*q), -(d + 1), q))
    return -1
''', [
        "A* is Dijkstra's method ordered by f = g + h instead of g, where g is the moves made so far and h is a guess of the moves still needed. The Manhattan distance |x − gx| + |y − gy| is never more than the true number of moves (each move changes x or y by 1), and it changes by at most 1 per move, so the first time the goal comes out of the heap its g is the fewest moves (lesson 7).",
        "The grid is endless, so it cannot be stored as a list. A dict `g` holds only the squares reached so far, and a set holds the walls. The problem promises the goal can be reached, so the search always ends.",
        "Ties matter. On an open grid, every square in the box between start and goal has the same f. The entries are (f, −g, square), so among equal f the square with the larger g, the one nearer the goal, comes out first, and the search walks straight to the goal. With (f, g, square) the smaller g comes first, and A* fills the whole box (1.44 million squares in the diagonal test).",
        "Breadth-first search finds the same answers, but it looks at every square closer than the goal: about 2 · d² squares for a goal d moves away. With no walls A* looks at about d squares; walls make it look at more, but only near the walls.",
    ]),
})
