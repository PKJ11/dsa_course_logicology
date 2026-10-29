import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

const NET = `lines = [(0, 1, 10), (0, 2, 10), (1, 2, 2),
         (1, 3, 4), (1, 4, 8), (2, 4, 9),
         (4, 3, 6), (3, 5, 10), (4, 5, 10)]`;

export const FLOW_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Is this a flow?",
    fn: "flow_value",
    lessons: [1],
    starter: `def flow_value(n, lines, flow, s, t):
    # lines: one-way lines (u, v, c) with capacity c.
    # flow: one number per line. Return the value of the
    # flow (out of s minus into s) if it keeps both rules,
    # else None.
    pass
`,
    statement: (
      <>
        <p>
          A railway has n stations and one-way lines <code>(u, v, c)</code>: at most c trains an hour can run from u to v. A plan gives{" "}
          <code>flow[i]</code> trains an hour on line i. The plan is a <strong>flow</strong> from the source s to the sink t when it keeps two
          rules (lesson 1): every line carries between 0 and its capacity, and at every station other than s and t, the trains that arrive equal
          the trains that leave. Return the value of the flow, the trains leaving s minus the trains arriving at s, or <code>None</code> if a rule
          is broken.
        </p>
        <CodeBlock
          code={`${NET}
flow_value(6, lines,
           [10, 9, 0, 4, 6, 9, 5, 9, 10], 0, 5)   # 19
flow_value(6, lines,
           [10, 9, 0, 4, 6, 9, 5, 9, 11], 0, 5)   # None`}
        />
        <p>
          In the second call the last line carries 11 on a capacity of 10. Lines may repeat, and a line may join a station to itself. Return{" "}
          <code>None</code> also when <code>flow</code> does not have one number per line.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and 100,000 lines.</li>
          <li>Going through every line once per station is too slow. The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Both rules can be checked in one pass over the lines. What should you add up for each station as you go?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep <code>net[v]</code>, the flow out of v minus the flow into v. For each line (u, v, c) with flow f: check 0 ≤ f ≤ c, then add f
              to <code>net[u]</code> and take f from <code>net[v]</code>.
            </p>
            <p>Afterwards every station except s and t must have <code>net</code> 0. The value is <code>net[s]</code>.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if len(flow) != len(lines): return None
net = [0] * n
for (u, v, c), f in zip(lines, flow):
    if f < 0 or f > c: return None
    net[u] += f;  net[v] -= f
if any net[v] != 0 for v not s or t: return None
return net[s]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The most trains",
    fn: "max_flow",
    lessons: [2],
    starter: `def max_flow(n, lines, s, t):
    # Return the largest number of trains an hour that can
    # run from s to t (the value of a maximum flow).
    pass
`,
    statement: (
      <>
        <p>
          Return the value of a maximum flow from s to t: the most trains an hour that can leave s and reach t, keeping both rules of P1.
        </p>
        <CodeBlock
          code={`${NET}
max_flow(6, lines, 0, 5)      # 19
max_flow(4, [(0, 1, 1), (0, 2, 1), (1, 2, 1),
             (1, 3, 1), (2, 3, 1)], 0, 3)   # 2`}
        />
        <p>
          In the second network, the path 0 → 1 → 2 → 3 sends one train, and then no path is left in the network itself. The residual graph of
          lesson 2 still has a path, because it can undo the train on 1 → 2.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 50 stations and 300 lines, capacities up to 100. Any augmenting-path method is fast enough.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Ford-Fulkerson (lesson 2): while the residual graph has a path from s to t, send as much as its smallest residual capacity allows.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store each line as a pair of arcs in two lists: arc 2i is the line itself with residual capacity c, and arc 2i + 1 goes back with
              residual 0. The arc paired with e is <code>e ^ 1</code>.
            </p>
            <p>
              Find a path with a search over arcs with residual &gt; 0, remembering the arc that reached each station. Walk back from t to find the
              smallest residual, then take it from each arc on the path and add it to each paired arc.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for u, v, c in lines:
    add arc u->v with cap c, and arc v->u with cap 0
total = 0
while a search from s finds t (arcs with cap > 0):
    push = smallest cap on the path
    for each arc e on the path:
        cap[e] -= push;  cap[e ^ 1] += push
    total += push
return total`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "A full plan, fast",
    fn: "flow_plan",
    lessons: [3],
    starter: `def flow_plan(n, lines, s, t):
    # Return (value, flow): the value of a maximum flow
    # from s to t, and the flow on every line, in the
    # order of lines.
    pass
`,
    statement: (
      <>
        <p>
          Now return the plan itself: a pair <code>(value, flow)</code>, where <code>flow[i]</code> is the number of trains an hour on line i in
          a maximum flow. Any maximum flow is accepted: the tests check your flow line by line (both rules of P1) and its value.
        </p>
        <CodeBlock
          code={`${NET}
flow_plan(6, lines, 0, 5)
# (19, [10, 9, 0, 4, 6, 9, 5, 9, 10])`}
        />
        <p>
          The flow on line i is what its reverse arc holds at the end: the trains sent along it minus the trains sent back. Capacities are whole
          numbers up to 10⁹ (1,000,000,000).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 10,000 stations and 50,000 lines. The big tests have 4 to 5 seconds each.</li>
          <li>Paths found by depth-first search can carry very little each, so plain Ford-Fulkerson is too slow. Edmonds-Karp passes every test but the last.</li>
          <li>The last test has 160 layers of stations; it needs Dinic&rsquo;s method (lesson 3).</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Edmonds-Karp: the same loop as P2, but always with the shortest path, found by breadth-first search. For the last test, Dinic finds all
            the shortest paths of one length in one phase.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Dinic: in each phase, label every station with its BFS distance from s in the residual graph (its level). Then send flow only along
              arcs from one level to the next. Keep a pointer <code>ptr[u]</code> into each station&rsquo;s arc list and never move it back in a
              phase: an arc that is full, or leads to a dead end, is skipped for the rest of the phase.
            </p>
            <p>When no path along the levels is left, start a new phase. Stop when t gets no level.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`while BFS from s gives t a level:
    ptr = [0] * n
    repeat:
        walk from s along arcs with cap > 0 to level + 1,
            using ptr[u]; at a dead end, mark it,
            step back, and move the pointer on
        if the walk reached t: push its smallest cap
        else: end of phase
flow[i] = cap of arc 2i + 1`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The weakest set of lines",
    fn: "min_cut",
    lessons: [4],
    starter: `def min_cut(n, lines, s, t):
    # Return the source side of a minimum cut: a list of
    # stations with s and without t, such that the lines
    # from the side to the rest have the least total
    # capacity.
    pass
`,
    statement: (
      <>
        <p>
          A <strong>cut</strong> splits the stations into a side S that holds s and the rest, which holds t. Its capacity is the total capacity of
          the lines from S to the rest; lines the other way do not count. Return a side S whose cut has the smallest capacity: the cheapest set of
          lines to close so that no train can get from s to t.
        </p>
        <CodeBlock
          code={`${NET}
min_cut(6, lines, 0, 5)   # [0, 2]: it cuts the lines
                          # 0 -> 1 and 2 -> 4, 10 + 9 = 19`}
        />
        <p>
          When several sides give the least capacity, any of them is accepted: the tests check that your side holds s and not t, and add up its
          cut.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 10,000 stations and 50,000 lines, capacities up to 10⁹. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 4: after a maximum flow, which stations can the source still reach in the residual graph?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Run P3&rsquo;s method to the end. Then search the residual graph from s once more, over arcs with residual capacity above 0. The
              stations reached are S.
            </p>
            <p>
              Every line from S to the rest is full (or the search would have crossed it), and every line back carries nothing, so the cut equals
              the flow, and no cut can be smaller.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`run Edmonds-Karp or Dinic to the end
seen = search from s over arcs with cap > 0
return [v for v in range(n) if seen[v]]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Workers and jobs",
    fn: "matching",
    lessons: [5],
    starter: `def matching(nl, nr, pairs):
    # nl workers 0 .. nl-1, nr jobs 0 .. nr-1. pairs: the
    # allowed (worker, job) pairs. Return a largest list of
    # allowed pairs that uses no worker or job twice.
    pass
`,
    statement: (
      <>
        <p>
          A depot has nl drivers and nr routes. Each allowed pair <code>(worker, job)</code> says that a driver can take a route. Give as many
          drivers as possible one route each, with no route given twice: a <strong>maximum matching</strong>. Return the pairs you choose.
        </p>
        <CodeBlock
          code={`pairs = [(0, 0), (0, 1), (1, 0), (2, 1),
         (2, 2), (3, 2), (3, 3)]
matching(4, 4, pairs)
# [(0, 1), (1, 0), (2, 2), (3, 3)]`}
        />
        <p>
          When several matchings are largest, any of them is accepted: the tests check that every pair is allowed, that no driver or route is used
          twice, and how many pairs there are.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 60,000 drivers, 60,000 routes and 120,000 pairs. The big tests have 3 to 4 seconds each.</li>
          <li>An augmenting path can be 10,000 steps long, so recursion is too deep.</li>
          <li>The last test (30,000 drivers, 90,000 pairs) needs Hopcroft-Karp (lesson 5); one search per free driver passes the rest.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            A matching is largest exactly when no augmenting path is left: a path from a free driver to a free route that uses allowed pairs, every
            second one already matched (lesson 5).
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Hopcroft-Karp works in phases. A BFS from every free driver at once gives each driver a layer: free drivers 0, and a matched driver
              one more than the driver whose route it holds. Stop the BFS layer where a free route is found.
            </p>
            <p>
              Then from each free driver, search depth-first with your own stack, only from a driver to the driver one layer down, and flip each
              path found. A driver that leads nowhere is given no layer for the rest of the phase. Repeat until a BFS finds no free route.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`while True:
    dist = BFS layers from all free drivers
    if no free route was reached: break
    for each free driver r:
        path search from r: driver u may go to route v,
            then to w = mate[v] only if dist[w] == dist[u] + 1
        dead end: dist[u] = infinity, step back
        free route found: flip the path
return the matched pairs`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
