import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";

export const CONN_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "The junction's group",
    fn: "group_of",
    lessons: [1],
    starter: `def group_of(n, streets, s):
    # streets: one-way streets (u, v) from junction u to
    # junction v, junctions 0 .. n-1. Return, in increasing
    # order, every junction you can drive to from s and
    # also drive back to s from.
    pass
`,
    statement: (
      <>
        <p>
          A town has n junctions joined by one-way streets. A street <code>(u, v)</code> lets you drive from u to v, but not back. Return the
          strongly connected group of junction <code>s</code>: every junction v such that you can drive from s to v and also from v back to s,
          perhaps along many streets. List them in increasing order. Junction s is always in its own group.
        </p>
        <CodeBlock
          code={`streets = [(0, 1), (1, 4), (4, 0), (5, 4), (5, 6),
           (1, 2), (2, 3), (3, 7), (7, 6), (6, 2)]
group_of(8, streets, 0)   # [0, 1, 4]
group_of(8, streets, 5)   # [5]
group_of(8, streets, 6)   # [2, 3, 6, 7]`}
        />
        <p>
          This is the town of lesson 1&rsquo;s figure, with A to H as 0 to 7. A street may lead from a junction to itself, and the same street
          may be listed twice.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 junctions and 200,000 streets.</li>
          <li>A search may go 100,000 streets deep, so recursion is too deep. The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Which junctions can s reach? Which junctions can reach s? Lesson 1 shows that the group is exactly the junctions in both answers.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Search once from s along the streets: that marks what s can reach. To find what can reach s, search from s along the streets
              turned round: build a second list where each street (u, v) is stored as v → u.
            </p>
            <p>Use a stack (or a deque) of your own for both searches. Then keep the junctions that both searches marked; going through 0 to n − 1 gives them in increasing order.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`out[u] = streets from u;  back[v] = streets into v
f = search(out, s)        # list of True/False
b = search(back, s)
return [v for v in range(n) if f[v] and b[v]]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Every group, in order",
    fn: "scc",
    lessons: [2],
    starter: `def scc(n, streets):
    # Return a list with one group number per junction:
    # equal numbers exactly when each junction can reach
    # the other. Numbers run 0, 1, 2, ... with no gaps, and
    # every street (u, v) has number[u] <= number[v].
    pass
`,
    statement: (
      <>
        <p>
          Split all n junctions into their strongly connected groups. Return a list <code>group</code> with one number per junction. Two
          junctions get the same number exactly when each can reach the other. Number the groups 0, 1, 2, … with no number missing, and in an
          order that every street respects: for every street <code>(u, v)</code>, <code>group[u] &lt;= group[v]</code>. That order is a
          topological order of the graph of groups (lesson 1).
        </p>
        <CodeBlock
          code={`streets = [(0, 1), (1, 4), (4, 0), (5, 4), (5, 6),
           (1, 2), (2, 3), (3, 7), (7, 6), (6, 2)]
scc(8, streets)   # [1, 1, 2, 2, 1, 0, 2, 2]
scc(4, [(2, 3), (0, 1), (1, 2)])   # [0, 1, 2, 3]`}
        />
        <p>
          When several numberings are right (groups with no street between them can come in either order), any of them is accepted. The tests
          check the numbers you return: the groups, the order, and no gaps.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 junctions and 160,000 streets.</li>
          <li>The search can go 100,000 levels deep. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Kosaraju&rsquo;s method or Tarjan&rsquo;s method (lesson 2), written with your own stack of (vertex, iterator) pairs, as in GRPH-P3. In
            which order does each method find the groups?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <strong>Kosaraju:</strong> one search records the finish order. Then go through the vertices from the last to finish to the first,
              and from each one not yet in a group, search the streets turned round. Each search finds one group, and the groups come out in
              topological order: number them 0, 1, 2, … as they are found.
            </p>
            <p>
              <strong>Tarjan:</strong> one search with discovery numbers, low-link numbers and a stack. It finishes the groups in{" "}
              <em>reverse</em> topological order, so turn the numbers round at the end: <code>count - 1 - c</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = vertices in finish order (first search)
group = [-1] * n;  c = 0
for s in reversed(order):
    if group[s] == -1:
        search from s along streets turned round,
        giving group c to every vertex reached
        that has no group yet;  c += 1
return group`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Weak points of the network",
    fn: "weak_points",
    lessons: [3],
    starter: `def weak_points(n, lines):
    # lines: two-way lines (u, v), stations 0 .. n-1.
    # Return (bridges, cuts): the positions in lines of the
    # lines whose closing splits the network, and the
    # stations whose closing splits it. Both in increasing
    # order.
    pass
`,
    statement: (
      <>
        <p>
          A railway has n stations and two-way lines between them. A line is a <strong>bridge</strong> if closing it leaves the network in more
          separate parts than before. A station is a <strong>cut station</strong> (an articulation point) if closing it, with all its lines,
          leaves the stations that remain in more separate parts than before. Return a pair <code>(bridges, cuts)</code>: the positions in{" "}
          <code>lines</code> of the bridges, and the cut stations, both in increasing order.
        </p>
        <CodeBlock
          code={`lines = [(0, 1), (0, 2), (1, 2), (2, 3),
         (3, 4), (3, 5), (4, 5), (4, 6)]
weak_points(7, lines)      # ([3, 7], [2, 3, 4])
weak_points(7, lines + [(3, 2)])   # ([7], [2, 3, 4])`}
        />
        <p>
          This is lesson 3&rsquo;s figure, with A to G as 0 to 6. The network may already be in several parts. Two lines may join the same two
          stations (then neither of them is a bridge), and a line may join a station to itself (it is never a bridge).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and about 120,000 lines.</li>
          <li>The search can go 100,000 levels deep, so recursion is too deep. Closing each line in turn and counting parts again is too slow. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            One depth-first search with a discovery number and a low number for every station gives both answers (lesson 3). Which line must you
            not count as a way back up?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>low[v]</code> is the smallest discovery number reachable from v&rsquo;s part of the search tree using one line that leads back
              up. When the search returns from child v to its parent p: the line p–v is a bridge if <code>low[v] &gt; disc[p]</code>, and p is a cut
              station if <code>low[v] &gt;= disc[p]</code> and p is not the start of the search. The start is a cut station when it has two or more
              children.
            </p>
            <p>
              Keep the position of the line you arrived by on the stack, and skip only that line. A second line to the parent is a real way back.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`adj[u] = list of (v, position); skip lines u-u
for each start s not yet reached:
    stack = [(s, -1, iter(adj[s]))]
    for each (v, i) from the top iterator, i != arrived-by:
        reached: low[u] = min(low[u], disc[v])
        new: give it disc and low, push it, go deeper
    when an iterator is empty: pop u, update its parent:
        low[p] = min(low[p], low[u]); bridge? cut?
    start: cut if it has 2 or more children`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Yes-or-no rules",
    fn: "two_sat",
    lessons: [4],
    starter: `def two_sat(n, rules):
    # n yes-or-no questions, numbered 1 .. n. A rule (a, b):
    # k means "question k is yes", -k means "question k is
    # no"; at least one half of each rule must hold. Return
    # n answers True/False (question k at position k - 1),
    # or None if no choice keeps every rule.
    pass
`,
    statement: (
      <>
        <p>
          A planner must answer n yes-or-no questions, numbered 1 to n. Each rule is a pair <code>(a, b)</code> of two conditions, and at least one
          of the two must hold. The number k stands for &ldquo;question k is answered yes&rdquo;, and −k for &ldquo;question k is answered
          no&rdquo;. Return a list of n values: <code>True</code> for yes and <code>False</code> for no, question k at position k − 1. If no list
          of answers keeps every rule, return <code>None</code>.
        </p>
        <CodeBlock
          code={`rules = [(1, 2), (-1, 3), (-2, -3), (1, -2)]
two_sat(3, rules)              # [True, False, True]
two_sat(3, rules + [(-1, 2)])  # None`}
        />
        <p>
          The rule <code>(-1, 3)</code> reads: question 1 is no, or question 3 is yes (or both). A rule may name the same condition twice,{" "}
          <code>(2, 2)</code>, which means question 2 must be yes. When several lists keep every rule, any of them is accepted: the tests check
          your list against every rule.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 50,000 questions and 100,000 rules.</li>
          <li>Trying every list of answers is far too slow (2⁴⁰ lists for 40 questions). The implication graph can hold a path 100,000 vertices long. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            A rule &ldquo;a or b&rdquo; says: if a is false, b must be true, and if b is false, a must be true. Draw these as edges between 2n
            vertices, one for each condition (lesson 4).
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Number the condition &ldquo;k is yes&rdquo; as vertex 2(k − 1) and &ldquo;k is no&rdquo; as 2(k − 1) + 1, so the opposite of vertex x
              is <code>x ^ 1</code>. For each rule (a, b) add the edges not-a → b and not-b → a. Find the strongly connected groups (P2).
            </p>
            <p>
              If a question&rsquo;s yes and no are in the same group, return None. Otherwise answer yes exactly when the group of &ldquo;yes&rdquo;
              comes later in topological order than the group of &ldquo;no&rdquo;.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`node(k) = 2(k-1) if k > 0 else 2(-k-1) + 1
for a, b in rules:
    add edge node(a)^1 -> node(b)
    add edge node(b)^1 -> node(a)
group = scc(2n, edges)        # topological numbers
for k in 1..n:
    yes, no = group[2(k-1)], group[2(k-1) + 1]
    if yes == no: return None
    answer k = yes > no`}
          />
        ),
      },
    ],
    tests: t4,
  },
];
