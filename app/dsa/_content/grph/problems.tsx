import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";
import t7 from "./tests/p7.json";

export const GRPH_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Is there a direct line?",
    fn: "direct_lines",
    lessons: [1],
    starter: `def direct_lines(n, edges, queries):
    # Vertices are 0 .. n-1. Each edge (u, v) joins u and v
    # both ways. For each (u, v) in queries, answer True if
    # an edge joins u and v, else False.
    pass
`,
    statement: (
      <>
        <p>
          A railway network has <code>n</code> stations, numbered 0 to <code>n − 1</code>, and a list of direct lines. Each line{" "}
          <code>(u, v)</code> joins stations u and v, and trains run both ways. Return a list with one answer for each question{" "}
          <code>(u, v)</code> in <code>queries</code>: <code>True</code> if a line joins u and v directly, <code>False</code> if not.
        </p>
        <CodeBlock
          code={`edges = [(0, 1), (1, 2), (2, 3), (3, 0), (1, 3)]
direct_lines(5, edges, [(0, 1), (1, 0), (0, 2), (4, 1)])
# [True, True, False, False]`}
        />
        <p>
          The same line may be listed more than once. No line joins a station to itself, so a question <code>(u, u)</code> is always{" "}
          <code>False</code>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,001 stations, 200,000 lines and 200,000 questions.</li>
          <li>
            One station may have 200,000 lines. Reading through a list of its neighbours for every question is far too slow. The big tests have
            3 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Which of the three ways to store a graph (lesson 1) answers &ldquo;is u joined to v?&rdquo; fastest without using n² memory?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep one <strong>set</strong> of neighbours per station. Add v to u&rsquo;s set and u to v&rsquo;s set for each line. A question is
            then <code>v in adj[u]</code>, which takes about the same time however many neighbours u has.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`adj = a list of n empty sets
for each line (u, v):
    add v to adj[u]; add u to adj[v]
return [v in adj[u] for each question (u, v)]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "A shortest route",
    fn: "route",
    lessons: [2],
    starter: `def route(n, edges, s, t):
    # Return a list of stations from s to t that uses the
    # fewest lines, or None if t cannot be reached.
    pass
`,
    statement: (
      <>
        <p>
          The network is as in P1: stations 0 to <code>n − 1</code>, and lines <code>(u, v)</code> that run both ways. Return a route from
          station <code>s</code> to station <code>t</code> that uses the fewest lines, as a list of stations that starts with s and ends with t.
          Return <code>None</code> if no route exists.
        </p>
        <CodeBlock
          code={`edges = [(0, 5), (5, 6), (0, 1), (1, 2), (2, 3), (3, 4), (4, 6)]
route(7, edges, 0, 6)     # [0, 5, 6]
route(3, [(0, 1)], 0, 2)  # None
route(3, [(0, 1)], 1, 1)  # [1]`}
        />
        <p>
          When several routes are equally short, any of them is accepted. The tests check that your list is a route (each pair of stations next
          to each other in it is joined by a line) and count its lines.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 500,002 stations and 500,001 lines.</li>
          <li>
            Routes can be 100,000 lines long, so a recursive search is too deep. One station can have 500,000 neighbours waiting in the queue at
            once. The big tests have 3 seconds each, and 4 for that one.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Breadth-first search reaches stations in order of how many lines away they are. What do you need to remember to rebuild the route at the
            end?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Run breadth-first search from s with a <code>collections.deque</code>. When a station v is first reached from u, record{" "}
              <code>parent[v] = u</code>; this also marks v as visited, so it never joins the queue twice.
            </p>
            <p>
              If t was never reached, return None. Otherwise start at t and follow the parents back to s, then turn the list round.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`build adjacency lists (both directions)
parent = [-1] * n; parent[s] = s
queue = deque([s])
while queue:
    u = queue.popleft()
    for v in adj[u]:
        if parent[v] == -1:
            parent[v] = u; queue.append(v)
if parent[t] == -1: return None
walk from t through parent[...] to s; reverse`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Finish order",
    fn: "finish_order",
    lessons: [3],
    starter: `def finish_order(adj):
    # adj[u] lists the vertices that u has edges to (one way).
    # Search depth-first from 0, then from every vertex not yet
    # visited, in number order. Return the vertices in the
    # order they finish.
    pass
`,
    statement: (
      <>
        <p>
          A directed graph is given as adjacency lists: <code>adj[u]</code> lists the vertices that u has an edge to, in order. Run a depth-first
          search exactly as the recursive version in lesson 3 would: start at vertex 0, try the neighbours of each vertex in the order of its
          list, and when the search from 0 is over, start again from the smallest vertex not yet visited.
        </p>
        <p>
          A vertex <strong>finishes</strong> when every neighbour in its list has been tried. Return the vertices in the order they finish.
        </p>
        <CodeBlock
          code={`finish_order([[1, 2], [3], [3], []])   # [3, 1, 2, 0]
finish_order([[2, 1], [3], [3], []])   # [3, 2, 1, 0]
finish_order([[1], [], [0], []])       # [1, 0, 2, 3]`}
        />
        <p>
          In the first example, 0 goes to 1 and 1 goes to 3. Vertex 3 has no neighbours, so it finishes first, then 1. Back at 0, the next
          neighbour is 2; its only neighbour, 3, is already visited, so 2 finishes, and then 0.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 vertices and 300,000 edges. Lists may contain a vertex itself, or the same neighbour twice.</li>
          <li>
            Paths can be 100,000 vertices deep. A recursive function fails: Python stops at about 1,000 nested calls, and the browser may stop
            sooner. Keep your own stack. The big tests have 3 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            A paused recursive call remembers two things: which vertex it is working on, and how far through that vertex&rsquo;s list it has got.
            Your stack needs to remember both.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a stack of pairs <code>(u, iter(adj[u]))</code>. Look at the top pair and take neighbours from its iterator until you find one
              not yet visited. Then mark it, push its own pair, and stop for now: that is &ldquo;going deeper&rdquo;.
            </p>
            <p>
              If the iterator runs out, u is finished: pop it and add it to the answer. Python&rsquo;s <code>for ... else</code> tells the two
              cases apart.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for s in range(n):
    if s visited: continue
    mark s; stack = [(s, iter(adj[s]))]
    while stack:
        u, it = stack[-1]
        for v in it:
            if v not visited:
                mark v; push (v, iter(adj[v])); break
        else:
            pop; out.append(u)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Find a cycle",
    fn: "find_cycle",
    lessons: [4],
    starter: `def find_cycle(n, edges):
    # Each edge (u, v) goes one way, from u to v.
    # Return a cycle as a list of vertices, or None.
    pass
`,
    statement: (
      <>
        <p>
          A directed graph has vertices 0 to <code>n − 1</code>, and each edge <code>(u, v)</code> goes one way, from u to v. If the graph has a{" "}
          <strong>cycle</strong> (a route that follows edges and comes back to where it started), return one, as a list of different vertices{" "}
          <code>[v0, v1, …, vk]</code> where each vertex has an edge to the next, and the last has an edge back to the first. Otherwise return{" "}
          <code>None</code>.
        </p>
        <CodeBlock
          code={`edges = [(0, 1), (1, 2), (2, 3), (3, 1), (3, 4)]
find_cycle(5, edges)                  # [1, 2, 3]
diamond = [(0, 1), (0, 2), (1, 3), (2, 3)]
find_cycle(4, diamond)                # None
find_cycle(2, [(0, 1), (1, 1)])       # [1]`}
        />
        <p>
          Any cycle is accepted, starting from any of its vertices. An edge from a vertex to itself is a cycle of one vertex. The tests follow
          your cycle&rsquo;s edges to check it.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 vertices and 200,000 edges.</li>
          <li>
            Paths can be 100,000 vertices deep, so use your own stack (as in P3). One test has 2⁴⁰ different paths: each vertex must be searched
            only once. The big tests have 3 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            In the second example, 3 is reached twice, but there is no cycle. Which vertices must an edge lead to before it closes a cycle?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Give each vertex one of three states: not reached, on the current path, finished. Search depth-first with your own stack (P3). An
              edge u → v where v is <em>on the current path</em> closes a cycle. An edge to a finished vertex never does.
            </p>
            <p>
              Record each vertex&rsquo;s parent when you reach it. When u → v closes a cycle, follow the parents from u back to v, and turn the list
              round.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`state = [0] * n     # 0 new, 1 on path, 2 finished
for each s with state 0:
    depth-first search from s with a stack of (u, iterator)
    reaching new v: state 1, parent[v] = u, push
    edge u -> v with state[v] == 1:
        cyc = [u]; follow parent until v; return reversed
    u's iterator runs out: pop, state[u] = 2
return None`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The smallest order",
    fn: "smallest_order",
    lessons: [5],
    starter: `def smallest_order(n, edges):
    # Each edge (u, v) says u must come before v.
    # Return the smallest order of 0 .. n-1 that keeps
    # every rule, or None if there is none.
    pass
`,
    statement: (
      <>
        <p>
          There are <code>n</code> tasks, numbered 0 to <code>n − 1</code>. Each edge <code>(u, v)</code> says task u must come before task v.
          Return an order of all n tasks that keeps every rule (a topological order). If several orders are possible, return the{" "}
          <strong>smallest</strong>: the one with the smallest first task; among those, the smallest second task; and so on. This is how Python
          compares lists. If no order is possible, return <code>None</code>.
        </p>
        <CodeBlock
          code={`edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]
smallest_order(6, edges)       # [4, 5, 0, 2, 3, 1]
smallest_order(3, [(1, 0)])    # [1, 0, 2]
ring = [(0, 1), (1, 2), (2, 0)]
smallest_order(3, ring)        # None`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 tasks and 200,000 rules. A rule may be given twice.</li>
          <li>
            Looking through all n tasks for the smallest ready one at every step costs about n² steps: far too slow. The big tests have 3 seconds
            each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Kahn&rsquo;s method (lesson 5) places, at each step, some task with no rules left coming in. Which one should you place to make the order
            as small as possible?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Count each task&rsquo;s in-degree (rules coming in). Keep the ready tasks (in-degree 0) in a <strong>min-heap</strong>, with{" "}
              <code>heapq</code>. Pop the smallest, place it, and lower its neighbours&rsquo; counts; push any that reach 0.
            </p>
            <p>If fewer than n tasks are placed, some tasks wait for each other in a cycle: return None.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`indeg[v] = number of rules (u, v)
ready = heap of every v with indeg[v] == 0
while ready:
    u = heappop(ready); out.append(u)
    for each rule (u, v):
        indeg[v] -= 1
        if indeg[v] == 0: heappush(ready, v)
return out if len(out) == n else None`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Two teams, or an odd cycle",
    fn: "two_teams",
    lessons: [6],
    starter: `def two_teams(n, edges):
    # Each edge (u, v) joins two people who must be on
    # different teams. Return (True, side) with side[v] in
    # {0, 1}, or (False, cycle) with a cycle of odd length.
    pass
`,
    statement: (
      <>
        <p>
          There are <code>n</code> people, numbered 0 to <code>n − 1</code>. Each edge <code>(u, v)</code> joins two people who must be on
          different teams. If two teams are possible, return <code>(True, side)</code>, where <code>side</code> is a list of n numbers, each 0 or
          1, and every edge joins a 0 to a 1.
        </p>
        <p>
          If two teams are impossible, prove it: return <code>(False, cycle)</code>, where <code>cycle</code> lists an odd number of different
          people, each joined by an edge to the next, and the last joined to the first (lesson 6).
        </p>
        <CodeBlock
          code={`two_teams(5, [(0, 1), (1, 2), (2, 3), (3, 0), (3, 4)])
# (True, [0, 1, 0, 1, 0])
two_teams(3, [(0, 1), (1, 2), (2, 0)])
# (False, [0, 1, 2])`}
        />
        <p>
          Any correct answer is accepted. The tests check every edge of your teams, or follow your cycle and count its people. No edge joins a
          person to themselves; an edge may be listed twice.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,001 people and 170,000 edges.</li>
          <li>Paths and cycles can be 100,000 people long, so a recursive search is too deep. The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Give the first person team 0. Then each neighbour must be on team 1, each of their neighbours on team 0, and so on. When does this go
            wrong?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Run breadth-first search from every person without a team, giving each newly reached person the team opposite to the one who reached
              them, and recording that person as their parent.
            </p>
            <p>
              If an edge joins two people u and v of the same team, they are on the same level of the search. Walk up from both through their
              parents, one step at a time, until the two walks meet. The two walks and the edge u–v make an odd cycle.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for each s without a team:
    side[s] = 0; breadth-first search from s
    reaching new v from u: side[v] = 1 - side[u]; parent[v] = u
    edge u-v with side[u] == side[v]:
        a = [u]; b = [v]
        while a[-1] != b[-1]: go up one step in both
        return (False, a + b without its last item, reversed)
return (True, side)`}
          />
        ),
      },
    ],
    tests: t6,
  },
  {
    n: 7,
    title: "Through the walls",
    fn: "fewest_moves",
    lessons: [7],
    starter: `def fewest_moves(grid, k):
    # grid is a list of strings of '.' (open) and '#' (wall).
    # Go from the top-left square to the bottom-right one,
    # one step up, down, left or right at a time, passing
    # through at most k walls. Return the fewest steps, or -1.
    pass
`,
    statement: (
      <>
        <p>
          A grid is given as a list of strings: <code>&apos;.&apos;</code> is an open square and <code>&apos;#&apos;</code> is a wall. Start on
          the top-left square and reach the bottom-right square. Each move goes one square up, down, left or right, and stays inside the grid.
          You may move onto at most <code>k</code> wall squares in total. Return the fewest moves, or <code>-1</code> if the end cannot be
          reached.
        </p>
        <CodeBlock
          code={`grid = ['..#.',
        '#.#.',
        '..#.',
        '.##.']
fewest_moves(grid, 1)   # 6
fewest_moves(grid, 0)   # -1`}
        />
        <p>The top-left and bottom-right squares are always open.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200 × 200 squares, and <code>k</code> up to 400.
          </li>
          <li>Trying every route is far too slow. The two big tests with walls to break have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Is &ldquo;I am on this square&rdquo; enough to know what you can still do? Two visits to the same square can have used different numbers
            of walls.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Search the graph of <strong>states</strong> (row, column, walls used) with breadth-first search. A move onto a wall adds 1 to the walls
              used, and is allowed only if the total stays at most k.
            </p>
            <p>
              You need not keep every state. Because the queue is in order of moves, a later visit to a square never has fewer moves; it is useful
              only if it has used fewer walls. Keep the fewest walls used so far for each square, and skip visits that are no better.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`least = R x C table, all k + 1; least[0][0] = 0
queue = deque([(0, 0, 0)]); moves = 0
while queue:
    for each state (r, c, used) in this level:
        if (r, c) is the end: return moves
        for each neighbour (nr, nc) in the grid:
            w = used + (1 if it is a wall else 0)
            if w < least[nr][nc]:
                least[nr][nc] = w; add (nr, nc, w)
    moves += 1
return -1`}
          />
        ),
      },
    ],
    tests: t7,
  },
];
