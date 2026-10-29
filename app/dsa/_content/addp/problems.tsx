import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

export const ADDP_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Total distance from every station",
    fn: "total_distance",
    lessons: [1],
    starter: `def total_distance(n, roads):
    # n stations 0 .. n-1; roads: (u, v, length), n - 1 of
    # them, joining every station into one tree.
    # Return a list: for each station, the sum of its
    # distances to all the other stations.
    pass
`,
    statement: (
      <>
        <p>
          A railway company has n stations joined by n − 1 roads, so that there is exactly one way between any two stations: the roads form a
          tree. Each road is given as <code>(u, v, length)</code>, in either direction. For every station, return the total of its distances to
          all the other stations.
        </p>
        <CodeBlock
          code={`total_distance(4, [(0, 1, 1), (1, 2, 1), (2, 3, 1)])
# [6, 4, 4, 6]
total_distance(3, [(0, 1, 2), (1, 2, 10)])   # [14, 12, 22]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 stations; lengths from 0 to 1,000.</li>
          <li>The tree can be a single line of 100,000 stations, so a recursive search runs out of depth.</li>
          <li>A search from every station takes about 10¹⁰ steps. Aim for O(n).</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Rerooting (lesson 1): one pass from the leaves up, one pass from the top down. The figure does it with roads of length 1.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Root the tree at station 0 and list the stations in BFS order, noting each one’s parent and the length w of the road up to it. Going
              backwards through the list, add up <code>size</code> (stations in each subtree) and <code>down</code> (their total distance from the
              top of the subtree): a child c adds <code>down[c] + w · size[c]</code> to its parent.
            </p>
            <p>
              Then <code>total[0] = down[0]</code>, and going forwards, <code>total[c] = total[p] + w · (n − 2 · size[c])</code>: the stations in
              c’s subtree come w closer, the others go w further.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`build adjacency lists with (neighbour, length)
order = [0]; for v in order: add unseen neighbours u,
    with parent[u] = v and up[u] = length
size = [1] * n; down = [0] * n
for v in reversed(order), except the root:
    p = parent[v]
    size[p] += size[v]
    down[p] += down[v] + up[v] * size[v]
total[0] = down[0]
for v in order[1:]:
    total[v] = total[parent[v]] + up[v] * (n - 2 * size[v])`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The most parcels collected",
    fn: "most_collected",
    lessons: [2],
    starter: `def most_collected(n, streets, value, s):
    # n junctions 0 .. n-1; streets: one-way (u, v) pairs.
    # value[v]: parcels waiting at junction v.
    # A van starts at s and drives as long as it likes,
    # passing junctions any number of times. Return the
    # most parcels it can collect (each junction once).
    pass
`,
    statement: (
      <>
        <p>
          A delivery van starts at junction <code>s</code> of a town with one-way streets. At each junction v, <code>value[v]</code> parcels are
          waiting. The van may drive along the streets for as long as it likes, through any junction any number of times, and it collects the
          parcels of every junction it passes, the first time it is there. What is the largest number of parcels it can collect?
        </p>
        <CodeBlock
          code={`most_collected(3, [(0, 1), (1, 0), (0, 2)], [0, 5, 7], 0)   # 12
most_collected(2, [(0, 1)], [3, 4], 1)                       # 4`}
        />
        <p>
          In the first, the van goes to 1, back to 0, then on to 2. Streets may repeat, and a street may lead from a junction to itself. Values
          are 0 or more.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 junctions and 150,000 streets.</li>
          <li>A chain of 100,000 streets in a row: searches must not use recursion.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Once the van is in a group of junctions that reach each other both ways (CONN-1), it can collect the whole group and still leave by any
            street out of it. Lesson 2, “When the graph has cycles”.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Find the groups of the junctions that s reaches, numbered in topological order. Kosaraju’s method (CONN-2) does this with two
              searches; CONN-P2 asked for exactly this numbering. Write both searches with a stack.
            </p>
            <p>
              Each group is worth the sum of its values. Every street goes to the same group or a later one, so go through the groups from last to
              first: <code>best[g]</code> is the group’s worth plus the largest <code>best[h]</code> over the streets from g to another group h.
              The answer is <code>best</code> of s’s group.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`pass 1: search from s along streets (a stack of
    (vertex, next position)); record finish order
pass 2: for v in reversed(finish order): if no group yet,
    give a new group number k to everything v reaches
    along reversed streets (among vertices seen in pass 1)
worth[g] = sum of value over the group
for g from the last group down to 0:
    best[g] = worth[g] + max(best[h] for streets g -> h, h != g;
                             0 if none)
return best[group[s]]`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Cutting a rail",
    fn: "cheapest_cuts",
    lessons: [3],
    starter: `def cheapest_cuts(length, marks):
    # A rail from 0 to length must be cut at every mark.
    # Each cut costs the length of the piece being cut.
    # Return the smallest total cost.
    pass
`,
    statement: (
      <>
        <p>
          A rail runs from 0 to <code>length</code> and must be cut at every position in <code>marks</code> (different whole numbers strictly
          between 0 and <code>length</code>, in any order). A cut splits one piece into two, and costs the length of the piece being cut. The
          order of the cuts changes the total. Return the smallest total.
        </p>
        <CodeBlock
          code={`cheapest_cuts(10, [4])           # 10
cheapest_cuts(7, [1, 3, 4, 5])   # 16: cut at 3, 1, 5, then 4`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 150 marks; the length can be up to 10⁹.</li>
          <li>Trying every order of the cuts is far too slow. Memoised recursion is fine here: it goes at most 150 calls deep.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Sort the marks and add 0 and length at the ends. A piece is always a stretch between two of these points (lesson 3).</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Let <code>best[i][j]</code> be the cheapest way to make every cut strictly between points i and j. If no point lies between them,
              it is 0. Otherwise the <em>first</em> cut on that piece is at some point k between them, costs <code>p[j] − p[i]</code>, and leaves
              two pieces cut separately.
            </p>
            <p>Fill the table by the distance j − i between the points, shortest first, as in the figure.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`p = [0] + sorted(marks) + [length]; m = len(p)
best = m x m table of zeros
for gap in 2 .. m - 1:
    for i in 0 .. m - 1 - gap:
        j = i + gap
        best[i][j] = p[j] - p[i] + min(best[i][k] + best[k][j]
                                       for k in i+1 .. j-1)
return best[0][m - 1]`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The fewest wagons",
    fn: "fewest_wagons",
    lessons: [4],
    starter: `def fewest_wagons(weights, cap):
    # Each wagon carries parcels of total weight at most cap.
    # Return the fewest wagons that carry every parcel.
    pass
`,
    statement: (
      <>
        <p>
          Parcels with the given <code>weights</code> must go on wagons, and a wagon can carry a total weight of at most <code>cap</code>. Every
          parcel weighs at most <code>cap</code>. Return the fewest wagons that can carry all of them.
        </p>
        <CodeBlock
          code={`fewest_wagons([2, 3, 3, 5, 6], 10)          # 2
fewest_wagons([6, 5, 4, 3, 3, 10, 3], 12)   # 3`}
        />
        <p>
          This is the bin packing problem, which is NP-hard (HARD-1): no fast method is known for many parcels. For a few it is a bitmask DP.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 16 parcels. Trying every order (16! is about 2 × 10¹³) is far too slow.</li>
          <li>
            Splitting into groups with submask loops (lesson 4) is right but makes about 3¹⁶, 43 million, steps for 16 parcels: too slow in Python.
            Aim for about 2ⁿ · n steps.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Load the wagons one after another. The state is the set of parcels loaded so far, plus something about the wagon being loaded now
            (lesson 4).
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              For each mask of loaded parcels, keep the best pair <code>(wagons used, weight in the last wagon)</code>, where smaller is better in
              that order: fewer wagons first, then a lighter last wagon. Python compares tuples exactly this way.
            </p>
            <p>
              From a mask, add any parcel not yet loaded: into the last wagon if it fits, otherwise into a new wagon. Any packing can be built in
              some loading order, so the best pair for the full mask gives the answer.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if no parcels: return 0
best = [(n + 1, 0)] * 2**n; best[0] = (1, 0)
for mask in range(2**n):
    t, load = best[mask]
    for each parcel i not in mask:
        if load + w[i] <= cap: c = (t, load + w[i])
        else:                  c = (t + 1, w[i])
        best[mask | 1 << i] = min(best[mask | 1 << i], c)
return best[2**n - 1][0]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "No digit twice in a row",
    fn: "count_no_repeat",
    lessons: [5],
    starter: `def count_no_repeat(a, b):
    # How many whole numbers x with a <= x <= b have no
    # two neighbouring digits equal?
    pass
`,
    statement: (
      <>
        <p>
          Count the whole numbers x with <code>a ≤ x ≤ b</code> in which no two neighbouring digits are equal, written in the usual way with no
          zeros in front. So 1213 counts, 1223 does not, and 100 does not (two zeros). The number 0 counts: it has one digit.
        </p>
        <CodeBlock
          code={`count_no_repeat(0, 100)    # 91
count_no_repeat(10, 20)    # 10: every number but 11`}
        />
        <h2>Limits</h2>
        <ul>
          <li>0 ≤ a ≤ b ≤ 10¹⁸, so counting the numbers one by one is impossible.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Count from 0 up to a limit with a digit DP, and use f(b) − f(a − 1) (lesson 5). Be careful with zeros in front.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The state is (place, previous digit, tight, started). While not started, a 0 is not a digit, so it is not compared with anything.
              With <code>functools.cache</code> the recursion is at most 19 calls deep.
            </p>
            <p>
              Or count directly: numbers with fewer digits than N are 1 (for 0) plus <code>9 ** k</code> for each length k. For numbers with
              the same length as N, walk N’s digits from the left, as in the figure: at each place, every smaller allowed digit frees the rest,
              giving <code>9 ** (places left)</code> numbers. Stop if N itself repeats a digit.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`f(x): count of 0 .. x   (f(-1) = 0)
    s = str(x); L = len(s)
    @cache go(i, prev, tight, started):
        if i == L: return 1
        top = int(s[i]) if tight else 9
        total = 0
        for d in 0 .. top:
            if started and d == prev: skip
            now = started or d != 0
            total += go(i + 1, d if now else -1,
                        tight and d == top, now)
        return total
    return go(0, -1, True, False)
answer = f(b) - f(a - 1)`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "The cheapest trip",
    fn: "cheapest_trip",
    lessons: [6],
    starter: `def cheapest_trip(x, c):
    # x: station positions, strictly rising. A train goes
    # from the first station to the last, stopping where
    # it likes. A run from stop i to stop j costs
    # (x[j] - x[i]) ** 2 + c. Return the cheapest total.
    pass
`,
    statement: (
      <>
        <p>
          Stations lie along a line at positions <code>x[0] &lt; x[1] &lt; …</code>. A train starts at the first station and ends at the last.
          It may stop at any stations in between. Each run from one stop to the next stop, i to j, costs <code>(x[j] − x[i]) ** 2 + c</code>. Find
          the cheapest total.
        </p>
        <CodeBlock
          code={`cheapest_trip([0, 1, 2], 1)        # 4: stop at 1
cheapest_trip([1, 2, 3, 4, 5], 6)  # 20: stop at 3`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 150,000 stations; positions up to about 10⁹ (a thousand million); c up to 10¹² (a million million).</li>
          <li>Trying every earlier stop for every station is about 10¹⁰ steps (ten thousand million). Aim for O(n).</li>
          <li>Answers can be near 10¹⁸. Keep to whole numbers.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Multiply out the square (lesson 6, “Lines on a hull”): each earlier stop becomes a straight line, and each station asks for the lowest line at its x.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>best[j] = x[j]² + c + min over i of (−2·x[i]) · x[j] + (best[i] + x[i]²)</code>. The slopes −2·x[i] fall as i grows, and the
              questions x[j] rise. Keep the useful lines in a list with a moving front index (or a deque).
            </p>
            <p>
              Question: while the next line gives a value at most the front line’s at x[j], move the front on. Adding line 3 after lines 1 and 2:
              remove line 2 while <code>(b3 − b1) · (m1 − m2) ≤ (b2 − b1) · (m1 − m3)</code>, which says line 3 passes under line 1 no later than
              line 2 does. Multiplying across keeps everything exact.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`ms = [-2 * x[0]]; bs = [x[0] ** 2]; head = 0
for j in 1 .. n - 1:
    X = x[j]
    while head + 1 < len(ms) and line head+1 at X <= line head at X:
        head += 1
    best = ms[head] * X + bs[head] + X * X + c
    m, b = -2 * X, best + X * X
    while at least 2 lines after head and the last is useless:
        pop the last line
    append (m, b)
return best of the last station (0 if only one)`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
