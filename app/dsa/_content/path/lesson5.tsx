import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FloydFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A timetable book lists the travel time between every pair of stations. Floyd–Warshall fills such a table in three nested loops, with
        negative weights allowed, and in about five lines of Python.
      </p>

      <h2 id="all">Every pair at once</h2>
      <p>
        The answer is a table <code>d</code> with V rows and V columns: <code>d[i][j]</code> is the distance from i to j. It has V² entries (V
        times V), so no method can do better than O(V²). Running a single-start method from every vertex is one way: V runs of Dijkstra cost{" "}
        <M>O(V (V + E) log V)</M>, good for sparse graphs with no negative weights. Floyd–Warshall costs <M>O(V³)</M> (V · V · V) whatever the
        number of edges, works with negative weights, and works on the adjacency matrix of GRPH-1 directly.
      </p>
      <p>Start the table from the edges: 0 on the diagonal, the weight of the cheapest edge from i to j, and ∞ where there is none.</p>

      <h2 id="middle">Allowing one more station</h2>
      <p>
        Number the vertices 0 to V − 1. The <strong>middle vertices</strong> of a route are all its vertices except the first and the last. The
        method is a DP (DYNP-1) whose state is (i, j, k):
      </p>
      <Invariant label="State">After round k, d[i][j] is the cheapest route from i to j whose middle vertices are all among 0, 1, …, k.</Invariant>
      <p>
        Before round 0 no middle vertices are allowed, so only single edges count: that is the starting table. In round k, vertex k is allowed too.
        The best route from i to j with middle vertices up to k either does not use k (then it is d[i][j] from before), or it uses k once: i → … →
        k → … → j, where both halves have middle vertices below k, so both are already in the table. (It never needs k twice: that would contain a
        cycle through k, which is not negative.) So the rule is
      </p>
      <Invariant label="Rule">d[i][j] = min(d[i][j], d[i][k] + d[k][j])</Invariant>
      <CodeBlock
        code={`import math

def floyd_warshall(n, edges):
    d = [[math.inf] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
    for u, v, w in edges:
        d[u][v] = min(d[u][v], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d`}
      />
      <p>
        Step through the figure. Each step shows one entry that changes, with the two entries it was made from outlined. Row B, column A gets its
        value 7 only in round D, from B → D (found in round C) and D → A.
      </p>
      <FloydFigure />
      <p>
        A full table for every k would take V³ memory (V · V · V entries). The code keeps one table and changes it in place. That is safe, because in round k the
        entries d[i][k] and d[k][j] do not change: d[i][k] could only become d[i][k] + d[k][k], and d[k][k] is 0 (or less, if there is a negative
        cycle, which the next section deals with).
      </p>

      <h2 id="order">Why k is the outer loop</h2>
      <p>
        The rule reads d[i][k] and d[k][j], and they must already be the best values for &ldquo;middle vertices below k&rdquo;. With k outside, a
        whole round finishes before k moves on, so they are. Put k inside instead (for i, for j, for k) and each entry d[i][j] is worked out once,
        early, from entries that may still be ∞. Switch the figure to &ldquo;k inside&rdquo;: row B is filled while row C is still nearly empty, so
        B to A gets 14 instead of 7, and nothing ever comes back to fix it. The order of i and j does not matter; the order of k does.
      </p>
      <Note title="Speed in Python">
        <p>
          The three loops run V³ times: 3.4 million times for V = 150, about a second of plain Python. Building each new row with a list
          comprehension does the inner loop at C speed and is several times faster. Skipping rows where d[i][k] is ∞ saves more:
        </p>
        <CodeBlock
          code={`for k in range(n):
    dk = d[k]
    for i in range(n):
        dik = d[i][k]
        if dik != math.inf:
            d[i] = [min(a, dik + b)
                    for a, b in zip(d[i], dk)]`}
        />
        <p>
          With NumPy, one whole round is one line: <code>d = np.minimum(d, d[:, [k]] + d[k])</code>.
        </p>
      </Note>

      <h2 id="more">Negative cycles, routes, and other uses</h2>
      <ul>
        <li>
          <strong>Negative cycles.</strong> A vertex i on a negative cycle ends with d[i][i] &lt; 0: the cycle is a route from i to i that costs less
          than staying put. So after the loops, look at the diagonal. Then the table is not to be trusted for pairs whose routes can touch such a
          cycle. <Link href="/dsa/path/practice/5/">PATH-P5</Link> needs this check.
        </li>
        <li>
          <strong>Routes.</strong> Keep a second table <code>nxt[i][j]</code>: the first step from i towards j. Start it as j wherever there is an edge;
          whenever d[i][j] improves through k, set <code>nxt[i][j] = nxt[i][k]</code>. To list the route, follow nxt from i until j.
        </li>
        <li>
          <strong>Reachability.</strong> With True and False instead of numbers, and &ldquo;or&rdquo; and &ldquo;and&rdquo; instead of min and +, the
          same loops give which vertex can reach which: the transitive closure (Warshall&rsquo;s version). With each row stored as a Python int of
          bits (BITS-3), a whole row is one <code>|</code>.
        </li>
        <li>
          <strong>Johnson&rsquo;s method.</strong> For sparse graphs with negative weights: run Bellman–Ford once from a new vertex joined to every
          vertex with weight 0, giving each vertex a value h(v). Then every edge&rsquo;s new weight w + h(u) − h(v) is 0 or more, and every route
          between the same two vertices changes by the same amount, h(i) − h(j), so shortest routes stay shortest. Now run Dijkstra from every
          vertex: <M>O(V · E log V)</M> in all. Lesson 7 uses the same kind of reweighting to explain A*.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/path/practice/5/">PATH-P5, Routes between asked pairs</Link>.
      </p>
    </>
  );
}
