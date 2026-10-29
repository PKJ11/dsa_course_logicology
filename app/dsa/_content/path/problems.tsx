import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";
import t7 from "./tests/p7.json";

export const PATH_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Are these the shortest times?",
    fn: "are_shortest",
    lessons: [1],
    starter: `def are_shortest(n, edges, s, d):
    # Stations 0 .. n-1. Each edge (u, v, w) is a one-way
    # line from u to v that takes w minutes (w >= 0).
    # d[v] is a claimed shortest time from s to v, or None
    # for "cannot be reached". Return True if every claim
    # is right, else False.
    pass
`,
    statement: (
      <>
        <p>
          Someone has worked out the shortest travel time from station <code>s</code> to every station, and handed you the list{" "}
          <code>d</code>. Check it without trusting it. Return <code>True</code> if every entry is right: <code>d[v]</code> is the least
          number of minutes from s to v, or <code>None</code> exactly when v cannot be reached. Otherwise return <code>False</code>.
        </p>
        <CodeBlock
          code={`edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2),
         (1, 3, 1), (2, 3, 5), (3, 4, 3)]
are_shortest(5, edges, 0, [0, 3, 1, 4, 7])   # True
are_shortest(5, edges, 0, [0, 4, 1, 5, 8])   # False`}
        />
        <p>
          In the second call, the line 2 → 1 reaches 1 in 1 + 2 = 3 minutes, less than the claimed 4. Lines are one-way, and times are whole
          numbers from 0 up. A line can take 0 minutes.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and about 150,000 lines.</li>
          <li>
            Aim for O(V + E): read each line a fixed number of times. The big tests have 3 seconds each. Running a shortest-path search yourself
            and comparing is accepted too.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Lesson 1 gives two facts about true shortest times: no line can make anything shorter, and every time is made by a real route. Which
            check tests the second fact, and why is &ldquo;every value has a tight line into it&rdquo; not enough when lines can take 0 minutes?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              First, <code>d[s]</code> must be 0. Then go over every line u → v whose start has a number. If <code>d[v]</code> is None, or{" "}
              <code>d[u] + w &lt; d[v]</code>, return False. If <code>d[u] + w == d[v]</code>, the line is <strong>tight</strong>: keep it.
            </p>
            <p>
              Last, search from s along tight lines only (breadth-first search). The claims are right exactly when this search reaches every
              station with a number, and no station with None.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if d[s] != 0: return False
tight = n empty lists
for each line (u, v, w) with d[u] not None:
    if d[v] is None or d[u] + w < d[v]: return False
    if d[u] + w == d[v]: tight[u].append(v)
seen = BFS from s along tight lines
return seen[v] == (d[v] is not None) for every v`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Fewest lines to reverse",
    fn: "fewest_reversals",
    lessons: [2],
    starter: `def fewest_reversals(n, edges, s, t):
    # Stations 0 .. n-1. Each edge (u, v) is a one-way line
    # from u to v. Return the fewest lines that must be
    # reversed so that t can be reached from s, or -1.
    pass
`,
    statement: (
      <>
        <p>
          Every line in this network runs one way: <code>(u, v)</code> means trains go from u to v only. The railway can reverse any line, so that
          trains run from v to u instead. Return the fewest lines that must be reversed so that a train can go from station <code>s</code> to
          station <code>t</code>. Return <code>-1</code> if even reversing lines cannot join them.
        </p>
        <CodeBlock
          code={`lines = [(0, 1), (2, 1), (2, 3), (4, 3)]
fewest_reversals(5, lines, 0, 4)              # 2
fewest_reversals(3, [(0, 1), (1, 2)], 0, 2)   # 0
fewest_reversals(4, [(0, 1), (2, 3)], 0, 3)   # -1`}
        />
        <p>
          In the first call, go 0 → 1 along its line, then reverse 2 → 1 to go 1 → 2, then 2 → 3, then reverse 4 → 3. A line may be listed more
          than once, and a line may join a station to itself.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and 200,000 lines.</li>
          <li>Aim for O(V + E). The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Moving along a line costs nothing. Moving against a line means reversing it. What does each move cost, and which lesson handles exactly those costs?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Build a graph where each line u → v gives two moves: u to v with cost 0, and v to u with cost 1. The answer is the cheapest route from
              s to t in that graph.
            </p>
            <p>
              Use 0-1 BFS with a <code>collections.deque</code>. When a move gives a station a smaller value, put the station at the{" "}
              <strong>front</strong> if the move cost 0, at the <strong>back</strong> if it cost 1. A station may be put in twice; that is fine.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`adj[u] gets (v, 0) and adj[v] gets (u, 1) for each line
dist = [inf] * n; dist[s] = 0; q = deque([s])
while q:
    u = q.popleft()
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            appendleft(v) if w == 0 else append(v)
return dist[t], or -1 if it is still inf`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The fastest journey",
    fn: "fastest",
    lessons: [3],
    starter: `def fastest(n, edges, s, t):
    # Each edge (u, v, w) is a one-way line from u to v that
    # takes w minutes (w >= 0). Return (time, route): the
    # least time from s to t and a list of stations from s
    # to t that takes that time. Return None if t cannot be
    # reached.
    pass
`,
    statement: (
      <>
        <p>
          Find the fastest journey from station <code>s</code> to station <code>t</code>. Return a pair <code>(time, route)</code>, where{" "}
          <code>time</code> is the least number of minutes and <code>route</code> is a list of stations from s to t that takes exactly that time.
          Return <code>None</code> if t cannot be reached.
        </p>
        <CodeBlock
          code={`edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2),
         (1, 3, 1), (2, 3, 5), (3, 4, 3)]
fastest(5, edges, 0, 4)   # (7, [0, 2, 1, 3, 4])
fastest(5, edges, 4, 0)   # None
fastest(5, edges, 2, 2)   # (0, [2])`}
        />
        <p>
          Lines are one-way, and times are whole numbers from 0 up. When several routes are equally fast, any of them is accepted: the tests add
          up the times of your route&rsquo;s lines and compare them with your time and with the least time.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 102,002 stations and 200,000 lines.</li>
          <li>
            Looking through every station to find the nearest one is too slow here, and so is handling a station again for every old entry it
            left in the heap. The big tests have 3 or 4 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Dijkstra&rsquo;s method with <code>heapq</code>, as in lesson 3. Two details decide the speed: how you find the nearest station, and what
            you do with an entry whose time is out of date.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep <code>dist</code> and <code>parent</code> lists and a heap of <code>(time, station)</code> entries. When a line gives a station a
              better time, record the time and the parent and push a new entry; the old entry stays in the heap.
            </p>
            <p>
              When an entry comes out with a time bigger than <code>dist[u]</code>, skip it at once. When t comes out, stop, and walk the parents
              back from t to build the route.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`dist[s] = 0; heap = [(0, s)]
while heap:
    d, u = heappop(heap)
    if d > dist[u]: continue      # old entry
    if u == t: break
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w; parent[v] = u
            heappush(heap, (d + w, v))
if dist[t] is inf: return None
walk parents back from t, reverse, return (dist[t], route)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Fares with refunds",
    fn: "cheapest",
    lessons: [4],
    starter: `import math

def cheapest(n, edges, s):
    # Each edge (u, v, w) is a one-way fare from u to v; w can
    # be negative (a refund). Return a list: for each station
    # its cheapest fare from s, None if it cannot be reached,
    # or -math.inf if its fare can be made as low as you like.
    pass
`,
    statement: (
      <>
        <p>
          Some tickets in this network come with a refund, so a fare <code>(u, v, w)</code> can have a negative <code>w</code>. Return a list
          with one entry per station: the cheapest total fare from station <code>s</code>; <code>None</code> if the station cannot be reached;
          or <code>-math.inf</code> if the fare can be made lower and lower without end, because a route to it can use a loop whose fares add up
          to less than 0.
        </p>
        <CodeBlock
          code={`cheapest(5, [(0, 1, 4), (0, 2, 2), (2, 1, -1),
             (1, 3, 3), (2, 3, 6), (3, 4, -2)], 0)
# [0, 1, 2, 4, 2]
cheapest(5, [(0, 1, 1), (1, 2, -1), (2, 1, -1),
             (2, 3, 4)], 0)
# [0, -inf, -inf, -inf, None]`}
        />
        <p>
          The second network has the loop 1 → 2 → 1, which costs −2 each time round. The tests show <code>-math.inf</code> as{" "}
          <code>&apos;-inf&apos;</code>. Fares are whole numbers.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000 stations and 4,002 fares.</li>
          <li>Bellman–Ford is O(V · E), about 4 million steps here. Stop early when a round changes nothing. The big tests have 6 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Dijkstra&rsquo;s method is wrong with refunds (lesson 3). Bellman–Ford finds the fares in n − 1 rounds. What does it mean if a fare still
            goes down in round n, and which stations does that affect?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Run n − 1 rounds over all fares, lowering <code>d[v]</code> to <code>d[u] + w</code> when that is smaller. Start with{" "}
              <code>math.inf</code> everywhere except the start; <code>math.inf + w</code> stays <code>math.inf</code>.
            </p>
            <p>
              Then do one more round, without trusting it to find everything: any station whose fare still goes down is reached through a loop
              below 0. Every station reachable from such a station also has no lowest fare. Find them all with a breadth-first search.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`d = [inf] * n; d[s] = 0
repeat n - 1 times (stop early if nothing changes):
    for u, v, w in edges:
        if d[u] + w < d[v]: d[v] = d[u] + w
queue = every v with d[u] + w < d[v] for some line
BFS from the queue: set d[x] = -inf for all reached x
return d, with inf replaced by None`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Routes between asked pairs",
    fn: "cheapest_routes",
    lessons: [5],
    starter: `def cheapest_routes(n, edges, queries):
    # Each edge (u, v, w) is a one-way fare, w may be negative.
    # queries: (i, j) pairs. For each, return the list of
    # stations on a cheapest route from i to j, or None if j
    # cannot be reached. Return None (not a list) if there is
    # a loop below 0.
    pass
`,
    statement: (
      <>
        <p>
          Fares can be negative. For each asked pair <code>(i, j)</code>, return the stations of a cheapest route from i to j, in order, starting
          with i and ending with j; a station&rsquo;s route to itself is <code>[i]</code>. Return <code>None</code> for a pair with no route. If any
          loop of fares adds up to less than 0, return <code>None</code> instead of a list, because then some pairs have no cheapest route.
        </p>
        <CodeBlock
          code={`cheapest_routes(3, [(0, 1, 4), (0, 2, 5), (2, 1, -3)],
                [(0, 1), (1, 0), (2, 2)])
# [[0, 2, 1], None, [2]]: 0 -> 2 -> 1 costs 5 - 3 = 2
cheapest_routes(3, [(0, 1, 1), (1, 2, -2), (2, 0, 0)], [(0, 2)])
# None: the loop 0 -> 1 -> 2 -> 0 costs -1`}
        />
        <p>
          Any cheapest route passes: the tests report the cost of each route you give, or what is wrong with it. Lesson 5 describes the table of
          first steps that makes this cheap.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 150 stations, about 22,500 fares and 300 asked pairs.</li>
          <li>Aim for O(n³) (n · n · n steps) for the tables, then a few steps per route. The big tests have 5 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Floyd–Warshall (lesson 5), plus the table of first steps that lesson 5 describes under &ldquo;Routes&rdquo;.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep two tables: <code>d[i][j]</code>, the cheapest fare found so far, and <code>nxt[i][j]</code>, the first station after i on that
              route. A line u → v sets <code>nxt[u][v] = v</code>; <code>nxt[i][i] = i</code>. The loop over k must be outside.
            </p>
            <p>
              When going through k is cheaper, set <code>nxt[i][j] = nxt[i][k]</code>: the new route starts the way the route to k starts. At the
              end, a negative number on the diagonal means a loop below 0. To list a route, follow <code>nxt</code> from i until you reach j.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`d = n x n of inf; d[i][i] = 0; nxt[i][i] = i
for u, v, w in edges: if w < d[u][v]: d[u][v] = w; nxt[u][v] = v
for k in range(n):
    for i in range(n):
        for j in range(n):
            if d[i][k] + d[k][j] < d[i][j]:
                d[i][j] = d[i][k] + d[k][j]
                nxt[i][j] = nxt[i][k]
if some d[i][i] < 0: return None
for (i, j) in queries: None if d[i][j] is inf,
    else walk i, nxt[i][j], nxt[that][j], ... until j`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Cheapest routes in a DAG",
    fn: "dag_routes",
    lessons: [6],
    starter: `def dag_routes(n, edges, s):
    # The lines (u, v, w) form a DAG: no route comes back to
    # where it started. w may be negative. Return (dist, ways):
    # dist[v] is the least time from s to v (None if v cannot
    # be reached), ways[v] is how many routes take that time,
    # modulo 1_000_000_007 (0 if v cannot be reached).
    pass
`,
    statement: (
      <>
        <p>
          The lines form a directed acyclic graph (a DAG): following lines, you can never come back to a station. Times can be negative. Return a
          pair of lists <code>(dist, ways)</code>. <code>dist[v]</code> is the least total time from <code>s</code> to v, or <code>None</code> if
          v cannot be reached. <code>ways[v]</code> is how many different routes from s to v take exactly that time, as the remainder after
          dividing by 1,000,000,007 (0 if v cannot be reached). Two routes are different if they use a different line at any point, so a line
          listed twice gives two routes.
        </p>
        <CodeBlock
          code={`dag_routes(4, [(0, 1, 1), (0, 2, 1), (1, 3, 1),
               (2, 3, 1), (0, 3, 3)], 0)
# ([0, 1, 1, 2], [1, 1, 1, 2])`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and about 250,000 lines.</li>
          <li>Routes can be 100,000 lines long, so recursion is too deep. Aim for O(V + E). The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>In which order can the stations be handled so that every line into a station is done before the station itself? GRPH-5 gives it.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Put the stations in topological order with Kahn&rsquo;s method. Then go through them in that order. For each station u that has a time,
              offer <code>dist[u] + w</code> along each of its lines.
            </p>
            <p>
              If the offer is smaller than <code>dist[v]</code> (or v has no time yet), v takes the new time and u&rsquo;s count. If it is equal,
              add u&rsquo;s count to v&rsquo;s. Keep counts modulo 1,000,000,007.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = Kahn's topological order
dist = [None] * n; ways = [0] * n
dist[s], ways[s] = 0, 1
for u in order:
    if dist[u] is None: continue
    for v, w in adj[u]:
        if dist[v] is None or dist[u] + w < dist[v]:
            dist[v], ways[v] = dist[u] + w, ways[u]
        elif dist[u] + w == dist[v]:
            ways[v] = (ways[v] + ways[u]) % M`}
          />
        ),
      },
    ],
    tests: t6,
  },
  {
    n: 7,
    title: "Across an endless grid",
    fn: "moves_needed",
    lessons: [7],
    starter: `def moves_needed(start, goal, walls):
    # start and goal are squares (x, y) of an endless grid;
    # walls is a list of squares you cannot enter. Each move
    # goes one square up, down, left or right. Return the
    # fewest moves from start to goal.
    pass
`,
    statement: (
      <>
        <p>
          The grid has no edges: x and y can be any whole numbers, including negative ones. Some squares are walls. Each move goes one square up,
          down, left or right, into a square that is not a wall. Return the fewest moves from <code>start</code> to <code>goal</code>. A route
          always exists, and the start is never a wall.
        </p>
        <CodeBlock
          code={`moves_needed((0, 0), (4, 0), [(2, -1), (2, 0), (2, 1)])  # 8
moves_needed((-2, 7), (3, 1), [])                        # 11`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 3,000 moves apart, and a few hundred walls.</li>
          <li>
            A breadth-first search looks at every square closer than the goal: millions of squares. Use A* with a good guess, and think about which
            entry should come first when two have the same f. The big tests have 3 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Lesson 7: order the heap by f = g + h, where h is a guess of the moves still needed that is never too high. On an open grid, many squares
            have the same f. Which of them should come out first?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Use the Manhattan distance <code>abs(x - gx) + abs(y - gy)</code> as h. Keep the walls in a set and the best g of each reached square
              in a dict (the grid is endless, so a list cannot hold it).
            </p>
            <p>
              Push entries <code>(g + h, -g, square)</code>: among equal f, the larger g comes out first, so the search heads straight for the goal.
              Skip entries whose g is out of date. Return g when the goal comes out.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`g = {start: 0}; heap = [(h(start), 0, start)]
while heap:
    f, neg, p = heappop(heap); d = -neg
    if d > g[p]: continue
    if p == goal: return d
    for q in the 4 neighbours of p, not walls:
        if d + 1 < g.get(q, inf):
            g[q] = d + 1
            heappush(heap, (d + 1 + h(q), -(d + 1), q))`}
          />
        ),
      },
    ],
    tests: t7,
  },
];
