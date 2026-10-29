import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TourFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        When a problem is about choosing an order or a grouping of a few items, the state can be the set of items already used. With n items
        there are 2ⁿ sets (2ⁿ is n twos multiplied together). That is far fewer than the n! orders (n × (n − 1) × … × 1), and each set fits in
        one whole number.
      </p>

      <h2 id="sets">A set as the state</h2>
      <p>
        BITS-5 wrote a set of items 0 to n − 1 as a <strong>mask</strong>: a whole number whose place k is 1 when item k is in the set.{" "}
        <code>mask &gt;&gt; k &amp; 1</code> asks whether k is in, <code>mask | 1 &lt;&lt; k</code> adds it, and{" "}
        <code>mask ^ 1 &lt;&lt; k</code> removes it (when it is in). Masks are list indices, so a table <code>best[mask]</code> is a plain list
        of length 2ⁿ.
      </p>
      <p>
        Adding an item to a set makes the number larger. So the plain order <code>for mask in range(1 &lt;&lt; n)</code> handles every set
        after all of its subsets: a topological order of the state DAG (lesson 2), with no extra work.
      </p>

      <h2 id="tour">The shortest round trip</h2>
      <p>
        A salesperson starts at city 0, visits every city once and comes back. What is the shortest round trip? This is the{" "}
        <strong>travelling salesman problem</strong>. Trying every order of the other n − 1 cities costs <M>(n − 1)!</M> tours. But to
        continue a route well, you only need to know <em>which</em> cities it has visited and <em>where</em> it is now, not the order it took.
        That is the state, from Bellman, and Held and Karp (1962):
      </p>
      <Invariant label="State">best[mask][j] = the length of the shortest route that starts at city 0, visits exactly the cities in mask, and ends at j.</Invariant>
      <p>
        The rule looks at the city before j: <code>best[mask][j]</code> is the smallest <code>best[mask without j][i] + d[i][j]</code> over the
        cities i in the mask. The start is <code>best[{"{0}"}][0] = 0</code>, and the tour is the smallest{" "}
        <code>best[all][j] + d[j][0]</code>. In the figure the masks are written in binary, city 0 at the right.
      </p>
      <TourFigure />
      <CodeBlock
        title="tour.py"
        code={`def shortest_tour(d):
    n = len(d)
    INF = float("inf")
    best = [[INF] * n for _ in range(1 << n)]
    best[1][0] = 0                       # at city 0, only city 0 visited
    for mask in range(1, 1 << n, 2):     # odd masks: city 0 is in the set
        for j in range(n):
            here = best[mask][j]
            if here == INF:
                continue
            for k in range(n):           # go on to a city k not yet visited
                if not mask >> k & 1:
                    nxt = mask | 1 << k
                    if here + d[j][k] < best[nxt][k]:
                        best[nxt][k] = here + d[j][k]
    full = (1 << n) - 1
    return min(best[full][j] + d[j][0] for j in range(n))`}
      />
      <p>
        This version pushes: from each finished state it offers a step to every unvisited city. It skips even masks, which do not contain the
        start, so it does half the work.
      </p>

      <h2 id="why">Subsets instead of orders</h2>
      <p>
        <strong>Why is it right?</strong> Take the shortest route through a set that ends at j, and remove its last step i → j. What is left is a
        route through the set without j, ending at i. If a shorter such route existed, it could replace this part and give a shorter route to j.
        So the best route to (mask, j) is made of a best route to some (mask without j, i): exactly what the rule tries.
      </p>
      <p>
        <strong>Cost.</strong> There are <M>2ⁿ · n</M> states, each tried from up to n cities: <M>O(2ⁿ · n²)</M> time and{" "}
        <M>O(2ⁿ · n)</M> memory. For 20 cities that is about 400 million steps against about 1.2 × 10¹⁷ orders. Exponential still, but the
        problem is NP-hard (HARD-1), so nothing polynomial is known, and this has been the best known worst-case method since 1962.
      </p>
      <p>
        The same idea fits any problem where only <em>which</em> items are used matters, plus a little more (where you are, how full the
        current wagon is). Orders that differ only in what is already finished are merged into one state.
      </p>

      <h2 id="assign">Jobs for people</h2>
      <p>
        n people, n jobs, and a cost for each person doing each job. Give each person one job, as cheaply as possible. If people are placed in
        order 0, 1, 2, …, the mask of jobs taken also tells you who is next: the number of 1s in it. So one number per mask is enough:
      </p>
      <CodeBlock
        title="assign.py"
        code={`def cheapest_assignment(cost):          # cost[p][j]: person p does job j
    n = len(cost)
    best = [float("inf")] * (1 << n)
    best[0] = 0
    for mask in range(1 << n):
        p = mask.bit_count()             # people 0 .. p-1 have jobs: place p next
        if p == n:
            continue
        for j in range(n):
            if not mask >> j & 1:        # job j is still free
                nxt = mask | 1 << j
                best[nxt] = min(best[nxt], best[mask] + cost[p][j])
    return best[-1]`}
      />
      <p>
        <M>O(2ⁿ · n)</M>. <code>int.bit_count()</code> (Python 3.10 and later) counts the 1s in C. For this problem there is also a polynomial
        method, the Hungarian method, <M>O(n³)</M> (n · n · n), related to matching (FLOW-5); SciPy has it as{" "}
        <code>linear_sum_assignment</code>. The mask version is the better choice when the rules are unusual, such as costs that depend on which jobs are already
        done.
      </p>

      <h2 id="groups">Splitting into groups</h2>
      <p>
        Some problems split all the items into groups, where each group must be allowed (a weight limit, no two enemies together), and ask for
        the fewest groups. Here the last step adds a whole group, a <strong>submask</strong> of the items left. BITS-5’s loop{" "}
        <code>sub = (sub - 1) &amp; mask</code> lists every submask.
      </p>
      <CodeBlock
        title="groups.py"
        code={`def fewest_groups(n, ok):               # ok(mask): can these items form one group?
    good = [ok(m) for m in range(1 << n)]
    best = [0] + [n + 1] * ((1 << n) - 1)
    for mask in range(1, 1 << n):
        low = mask & -mask               # the lowest item is in some group
        sub = mask
        while sub:                       # every submask, largest first
            if sub & low and good[sub]:
                best[mask] = min(best[mask], best[mask ^ sub] + 1)
            sub = (sub - 1) & mask
    return best[-1]`}
      />
      <p>
        The test <code>sub &amp; low</code> asks only for groups that contain the lowest item left. Some group must contain it, so nothing is
        lost, and the same split is not found once per order of its groups.
      </p>
      <Invariant label="3ⁿ">3ⁿ is n threes multiplied together. Over all masks, the submask loops make 3ⁿ steps in all (BITS-5): each item is outside the mask, in the mask but not the submask, or in both.</Invariant>
      <p>
        3ⁿ grows much faster than <M>2ⁿ · n</M>: for 16 items it is about 43 million against about a million. When groups are filled one at
        a time, as wagons are loaded one after another, a state of (set loaded, room left in the current group) avoids submasks altogether. That
        is the practice problem.
      </p>

      <h2 id="python">How far Python goes</h2>
      <p>
        Pure Python does roughly 10 to 30 million simple steps a second, and the browser is slower. So <M>2ⁿ · n</M> work suits n up to about
        18 or 20, <M>2ⁿ · n²</M> about 15 to 17, and 3ⁿ about 14. Small habits help: test bits with <code>mask &gt;&gt; k &amp; 1</code>{" "}
        rather than building sets; keep tables as flat lists; skip states that cannot be reached (<code>INF</code>); and walk only the items
        that are in, or out of, a mask when that is the shorter list.
      </p>
      <Note title="Other forms">
        <p>
          <strong>Profiles:</strong> filling a grid with tiles, column by column, where the mask says which cells of the next column are already
          covered. <strong>Sum over subsets:</strong> adding up a value over every submask of every mask in <M>2ⁿ · n</M> rather than 3ⁿ,
          one item at a time. Both reuse the idea of this lesson: the state is a set written as bits.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/addp/practice/4/">ADDP-P4, The fewest wagons</Link>.
      </p>
    </>
  );
}
