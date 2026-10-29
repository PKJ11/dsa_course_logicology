import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BellmanFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Dijkstra&rsquo;s method needs every edge to be 0 or more. Bellman–Ford drops that rule. It is slower, and simpler: it relaxes every edge,
        again and again, and it can tell when a negative cycle makes the question have no answer.
      </p>

      <h2 id="rounds">Rounds over every edge</h2>
      <p>
        Keep the edge list from GRPH-1: triples <code>(u, v, w)</code>. One <strong>round</strong> relaxes every edge once, in list order. Repeat the
        round V − 1 times.
      </p>
      <CodeBlock
        code={`import math

def bellman_ford(n, edges, s):
    dist = [math.inf] * n
    dist[s] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break                 # nothing changed: nothing ever will
    return dist`}
      />
      <p>
        Richard Bellman (who named dynamic programming, DYNP-1) and Lester Ford published it in the 1950s. Step through the figure. The edge list on
        the right is in a bad order on purpose, so each round reaches only one edge further along the shortest route.
      </p>
      <BellmanFigure />

      <h2 id="proof">Why V − 1 rounds are enough</h2>
      <Invariant label="Invariant">After round k, dist[v] ≤ the length of the shortest route to v that uses at most k edges.</Invariant>
      <p>
        Before round 1 (k = 0) only s has a route with 0 edges, and dist[s] = 0. Now take a shortest route to v with at most k edges, and let u be
        the vertex before v on it. Its part up to u has at most k − 1 edges, so after round k − 1, dist[u] is at most that part&rsquo;s length.
        In round k the edge u → v is relaxed, so dist[v] drops to at most dist[u] + w, the length of the whole route. Values only go down, so later
        relaxations in the same round cannot spoil this.
      </p>
      <p>
        When there is no negative cycle, a shortest route never repeats a vertex (lesson 1), so it has at most V − 1 edges. After round V − 1
        every dist[v] is at most the true distance, and it is never below it (lesson 1). So it is exact.
      </p>
      <p>
        <strong>Cost.</strong> V − 1 rounds of E relaxations: <M>O(V · E)</M>. That is much slower than Dijkstra for big graphs, but each step is
        tiny. Stopping early when a round changes nothing is safe, and on most graphs it ends after a few rounds. Only a bad order, as in the
        figure, needs all of them. In practice the order of the edge list matters a lot: a list in the order of a breadth-first search from s
        often finishes in two or three rounds.
      </p>

      <h2 id="cycles">Finding negative cycles</h2>
      <p>
        Run one more round, round V. Without a negative cycle that s can reach, every value is already final, so nothing changes. With one, the
        values on the cycle can always go down: if every edge u → v of a cycle had dist[v] ≤ dist[u] + w, adding these up round the cycle would
        give 0 ≤ (sum of the cycle&rsquo;s weights), which is false for a negative cycle. So <strong>something changes in round V exactly when a
        negative cycle can be reached from s</strong>.
      </p>
      <p>
        Which vertices have no shortest route? Every vertex that the cycle can reach: go round the cycle as often as you like, then on to it. The
        vertices that change in round V are on the cycle or after it, but they are not always all of them. A vertex with a much cheaper other way
        in may not have changed yet, because the cycle has not been gone round often enough after V − 1 rounds. So:
      </p>
      <ol>
        <li>run V − 1 rounds;</li>
        <li>in round V, collect every vertex v whose value would still go down;</li>
        <li>mark every vertex reachable from those with −∞, by a breadth-first search (GRPH-2).</li>
      </ol>
      <p>
        The second variant of the figure does this. <Link href="/dsa/path/practice/4/">PATH-P4</Link> has a test where step 3 matters. To list the
        cycle itself, take any vertex that changed in round V and follow <code>parent</code> back V times: that is sure to land on the cycle, and
        following parents from there comes back round it.
      </p>
      <Note title="Where negative cycles mean something">
        <p>
          Exchange rates: with rates r on each pair of currencies, a cycle whose rates multiply to more than 1 makes money. Taking −log r as the
          weight turns &ldquo;multiply to more than 1&rdquo; into &ldquo;add to less than 0&rdquo;, so Bellman–Ford finds such a cycle. Systems of
          difference constraints (x<sub>j</sub> − x<sub>i</sub> ≤ c, as in scheduling) have a solution exactly when the matching graph has no
          negative cycle.
        </p>
      </Note>

      <h2 id="dp">A DP, and faster versions</h2>
      <p>
        Bellman–Ford is DYNP-1&rsquo;s recipe. The state is (v, k): the cheapest route to v with at most k edges. The rule is
      </p>
      <Invariant label="Rule">best(v, k) = min(best(v, k − 1), min over edges u → v of best(u, k − 1) + w).</Invariant>
      <p>
        A table of V rows and V columns would follow it exactly. The code above keeps only one row and updates it in place, which can only make the
        values smaller sooner: the invariant says &ldquo;at most&rdquo;, not &ldquo;exactly&rdquo;. A version that copies the row each round and
        reads only the old copy gives exactly &ldquo;at most k edges&rdquo;, which answers questions like the cheapest flight with at most k stops.
      </p>
      <ul>
        <li>
          <strong>A queue of changed vertices</strong> (often called SPFA): only edges out of vertices whose value just changed can do anything, so
          keep those vertices in a queue and relax only their edges. It is often much faster, but its worst case is still O(V · E).
        </li>
        <li>
          <strong>Routing on the internet.</strong> Distance-vector protocols such as RIP run Bellman–Ford spread over many routers: each router
          tells its neighbours its distances, and neighbours relax. No router needs the whole map.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/path/practice/4/">PATH-P4, Fares with refunds</Link>.
      </p>
    </>
  );
}
