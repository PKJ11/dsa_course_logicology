import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";

export const SPAN_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "A cheaper line",
    fn: "cheaper_tree",
    lessons: [1],
    starter: `def cheaper_tree(n, tree, extra):
    # tree: n - 1 lines (u, v, w) that join stations 0 .. n-1
    # with no loop. extra: one new line (a, b, w). Return the
    # total cost of the cheapest spanning tree that uses only
    # these n lines.
    pass
`,
    statement: (
      <>
        <p>
          A railway has n stations joined by a spanning tree of lines: <code>tree</code> holds n − 1 lines <code>(u, v, w)</code>, each costing w
          a year to run, and together they join every station with no loop. A new line <code>extra = (a, b, w)</code> is offered. Using the old
          lines and the new one, which lines should run to join every station as cheaply as possible? Return the total yearly cost of that
          cheapest spanning tree.
        </p>
        <CodeBlock
          code={`tree = [(0, 1, 4), (1, 2, 2), (1, 3, 7), (3, 4, 1)]
cheaper_tree(5, tree, (2, 3, 3))   # 10
cheaper_tree(5, tree, (0, 4, 9))   # 14`}
        />
        <p>
          In the first call, the new line closes the loop 2 → 1 → 3 → 2. Dropping the line 1–3, which costs 7, gives 14 − 7 + 3 = 10. Costs are
          whole numbers and may be negative. The new line may join a station to itself, or two stations already joined by a line.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations.</li>
          <li>The tree can be a path 100,000 stations long, so a recursive search is too deep. The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Adding one line to a tree closes exactly one loop. Which line of that loop should go (lesson 1, the cycle property)?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The loop is the tree path from a to b, plus the new line. Find the most expensive line on that path with one search from a (breadth-first, with
              a queue), carrying the most expensive line seen so far to each station.
            </p>
            <p>If that most expensive line costs more than the new line, swap them: total − most expensive + w. Otherwise keep the old tree.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`total = sum of the tree's costs
if a == b: return total
heaviest[a] = -inf; BFS from a over tree lines:
    heaviest[v] = max(heaviest[u], cost of u-v)
h = heaviest[b]
return total - h + w if w < h else total`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The cheapest network",
    fn: "mst",
    lessons: [2],
    starter: `def mst(n, edges):
    # edges: lines (u, v, w) between stations 0 .. n-1, both
    # ways. Return a list of n - 1 of these lines that joins
    # every station for the least total cost, or None if no
    # set of lines joins them all.
    pass
`,
    statement: (
      <>
        <p>
          Choose lines from <code>edges</code> so that every station can reach every other, and the total cost is as small as possible: a minimum
          spanning tree. Return the chosen lines as a list of <code>(u, v, w)</code> triples, exactly as they appear in <code>edges</code> (either
          way round). Return <code>None</code> if the stations cannot all be joined.
        </p>
        <CodeBlock
          code={`edges = [(0, 1, 4), (0, 3, 2), (1, 3, 5), (1, 2, 6),
         (1, 4, 3), (3, 4, 7), (2, 4, 8), (2, 5, 1),
         (4, 5, 9), (2, 6, 5), (5, 6, 7)]
mst(7, edges)
# [(2, 5, 1), (0, 3, 2), (1, 4, 3), (0, 1, 4),
#  (2, 6, 5), (1, 2, 6)]   total 21`}
        />
        <p>
          When several trees cost the least, any of them is accepted. The tests check that your lines are taken from the list, that there are n − 1
          of them with no loop, and that their total is the least. Costs are whole numbers and may be negative. A line may join a station to itself,
          and two stations may be joined by more than one line.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and 250,000 lines.</li>
          <li>Joining two groups must be fast: relabelling every station of a group each time is too slow. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Kruskal&rsquo;s method (lesson 2): cheapest lines first, skipping any line that would close a loop. What tells you quickly that a line closes a loop?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the lines by cost. Keep a union-find of the stations (DSUF): two stations are in the same group when the kept lines already join
              them. For each line, if <code>find(u) != find(v)</code>, keep it and join the two groups; otherwise skip it.
            </p>
            <p>Stop when n − 1 lines are kept. If the list runs out first, return None.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`parent = list(range(n)); chosen = []
for u, v, w in edges sorted by w:
    a, b = find(u), find(v)
    if a != b:
        join a and b (smaller group under the larger)
        chosen.append((u, v, w))
return chosen if len(chosen) == n - 1 else None`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Connect the points",
    fn: "connect_points",
    lessons: [3],
    starter: `def connect_points(points):
    # points: a list of (x, y). A line between two points costs
    # |x1 - x2| + |y1 - y2|. Return the least total cost of
    # lines that join every point.
    pass
`,
    statement: (
      <>
        <p>
          Stations stand at the given points of a city laid out in square blocks. A line between two stations costs their Manhattan distance,{" "}
          <code>abs(x1 - x2) + abs(y1 - y2)</code>: the blocks you walk along streets. Any two stations may be joined. Return the least total cost
          of lines that join every station to every other.
        </p>
        <CodeBlock
          code={`connect_points([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)])
# 20
connect_points([(5, -5)])
# 0`}
        />
        <p>Coordinates are whole numbers. Two stations may stand at the same point.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 2,000 points, so up to 1,999,000 possible lines.</li>
          <li>Making and sorting every possible line is too slow. The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Every pair of points is joined, so the graph is dense. Lesson 3 shows a version of Prim&rsquo;s method that needs no heap and no list of lines.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Grow one tree from point 0. Keep <code>best[v]</code>, the cheapest line from the tree to each point outside it. Each step, take the
              outside point with the smallest <code>best</code>, add its cost, and lower <code>best</code> for the other outside points using
              distances to the new point.
            </p>
            <p>Each step is O(n), so the whole method is O(n²) (n steps of n each), with O(n) memory.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`best[v] = distance from point 0 to v
left = all points except 0; total = 0
while left:
    u = the point in left with the smallest best
    remove u from left; total += best[u]
    for v in left:
        best[v] = min(best[v], distance(u, v))
return total`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Lines in some cheapest tree",
    fn: "in_some_mst",
    lessons: [4],
    starter: `def in_some_mst(n, edges):
    # edges: lines (u, v, w), both ways. Return a list with one
    # answer per line: True if at least one cheapest spanning
    # tree (or forest) uses that line, else False.
    pass
`,
    statement: (
      <>
        <p>
          When several lines cost the same, there can be many cheapest spanning trees. For each line in <code>edges</code>, answer{" "}
          <code>True</code> if at least one cheapest spanning tree uses it, and <code>False</code> if none does. If the network is not connected,
          the question is about cheapest spanning forests: a cheapest tree for each connected part.
        </p>
        <CodeBlock
          code={`edges = [(0, 1, 1), (1, 2, 2), (0, 2, 2),
         (2, 3, 3), (1, 3, 5)]
in_some_mst(4, edges)
# [True, True, True, True, False]`}
        />
        <p>
          1–2 and 0–2 cost the same and close a loop with 0–1, so each of them is in some cheapest tree. 1–3 is the most expensive line on the loop 1 → 2
          → 3 → 1, so it is in none.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations and about 200,000 lines.</li>
          <li>Many lines may share a cost. A fresh search for every line is far too slow. The big tests have 4 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Lesson 4: a line u–v of cost w is in some cheapest tree exactly when u and v are not already joined by lines that all cost less than w.
            How can union-find answer that for every line?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the lines by cost and take them one cost at a time. For a group of lines that all cost w, union-find holds only the cheaper lines,
              so first ask <code>find(u) != find(v)</code> for every line of the group.
            </p>
            <p>Only after asking about the whole group, join the ends of every line in it. Then move on to the next cost.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = line positions sorted by cost
for each group of positions with the same cost:
    for k in group:
        ans[k] = find(u_k) != find(v_k)
    for k in group:
        union(u_k, v_k)
return ans`}
          />
        ),
      },
    ],
    tests: t4,
  },
];
