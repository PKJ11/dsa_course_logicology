import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ProblemFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Breadth-first search (GRPH-2) finds the route with the fewest edges. On a real railway, lines take different times, and the route with the
        fewest changes is not always the quickest. This station is about routes where each edge has a length.
      </p>

      <h2 id="weights">Edges with lengths</h2>
      <p>
        Give every edge a number, its <strong>weight</strong>: minutes of travel, kilometres, a fare. A graph with weights is a{" "}
        <strong>weighted graph</strong>. The <strong>length</strong> (or weight, or cost) of a route is the sum of the weights of its edges. A{" "}
        <strong>shortest route</strong> from s to t is a route whose length is as small as possible, and that smallest length is the{" "}
        <strong>distance</strong> from s to t, written <M>δ(s, t)</M> (the Greek letter delta). If t cannot be reached, the distance is ∞
        (infinity).
      </p>
      <p>
        When every weight is 1, the length of a route is its number of edges, and breadth-first search already solves the problem. With other
        weights it does not. Step through the first variant of the figure: the route with the fewest edges takes 10 minutes, and a route with one
        more edge takes 9.
      </p>
      <ProblemFigure />
      <p>
        In code, store the weight with each neighbour. An adjacency list of pairs is the usual choice, and the edge list of triples{" "}
        <code>(u, v, w)</code> from GRPH-1 is the other:
      </p>
      <CodeBlock
        code={`def build(n, edges, directed=False):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        if not directed:
            adj[v].append((u, w))
    return adj`}
      />
      <p>
        This station asks three kinds of question. <strong>One start to one target</strong>: the quickest way from here to there.{" "}
        <strong>One start to every vertex</strong> (single-source shortest paths): most methods answer this anyway, because they cannot be sure
        about the target until they know about everything nearer. <strong>Every pair</strong> (all-pairs shortest paths): a table of distances
        between all stations.
      </p>

      <h2 id="relax">Distances and relaxing</h2>
      <p>
        Every method in this station keeps two lists. <code>dist[v]</code> is the length of the best route to v found so far (∞ at first, 0 for the
        start). <code>parent[v]</code> is the vertex just before v on that route. Both are changed by one small step, called{" "}
        <strong>relaxing</strong> an edge:
      </p>
      <CodeBlock
        code={`import math

dist = [math.inf] * n
dist[s] = 0

def relax(u, v, w):
    if dist[u] + w < dist[v]:     # a better route to v, through u
        dist[v] = dist[u] + w
        parent[v] = u`}
      />
      <p>
        <code>math.inf</code> is Python&rsquo;s infinity: it is larger than every number, and <code>math.inf + 5</code> is still{" "}
        <code>math.inf</code>, so relaxing an edge from a vertex not yet reached changes nothing. The second variant of the figure relaxes edges one
        at a time, by hand. A time can go down more than once, and the parent changes when it does.
      </p>
      <p>
        Two facts about relaxing hold whatever the order. First, <code>dist[v]</code> is never smaller than the true distance: each value is the
        length of a real route, made one edge at a time. Second, it only goes down. So a method is correct if it relaxes the right edges in the
        right order until every value equals the distance. The methods of this station differ only in that order:
      </p>
      <ul>
        <li>0-1 BFS (lesson 2) and Dijkstra (lesson 3) relax the edges out of the nearest vertex next;</li>
        <li>Bellman–Ford (lesson 4) relaxes every edge, again and again;</li>
        <li>a DAG (lesson 6) relaxes edges in topological order, each once;</li>
        <li>A* (lesson 7) relaxes the edges out of the vertex that seems nearest to the target.</li>
      </ul>

      <h2 id="facts">Two facts about shortest routes</h2>
      <p>
        <strong>Parts of shortest routes are shortest routes.</strong> If s → … → u → … → t is a shortest route from s to t, then its part from s
        to u is a shortest route from s to u. If it were not, a shorter route to u could replace that part, and the whole route would get shorter.
        This is the &ldquo;optimal substructure&rdquo; of DYNP-1, and it is why one <code>parent</code> per vertex is enough: the shortest routes
        from s to every vertex fit together into one tree, the <strong>shortest-path tree</strong> (the shaded edges in the figure).
      </p>
      <p>
        <strong>The triangle rule.</strong> For every edge u → v with weight w, the distances satisfy
      </p>
      <Invariant label="Rule">δ(s, v) ≤ δ(s, u) + w(u, v) for every edge u → v.</Invariant>
      <p>
        Going to u by a shortest route and then along the edge is one way to reach v, so the best way to v is at most that long. An edge where the
        two sides are equal is called <strong>tight</strong>: it lies on some shortest route. When no edge can be relaxed any more, the triangle rule
        holds for every edge, and that is how every method knows it has finished.
      </p>
      <p>
        These two facts also give a way to <em>check</em> claimed distances d without running a search again. The claims are right when d[s] = 0,
        no edge breaks the triangle rule, and every vertex with a number is reached from s along tight edges. The last part matters: with edges of
        weight 0, tight edges can go round a loop that never starts from s, and numbers that are too small can still pass the first two checks.
        That is <Link href="/dsa/path/practice/1/">PATH-P1</Link>.
      </p>

      <h2 id="negative">Negative edges and negative cycles</h2>
      <p>
        Weights can be negative: a refund on a ticket, energy gained going downhill, a profit. A <strong>negative edge</strong> is no problem in
        itself. But a <strong>negative cycle</strong>, a cycle whose weights add up to less than 0, is: going round it once more always makes a
        route cheaper, so vertices reachable through it have no shortest route at all. Their distance is said to be −∞. A shortest route never
        needs to repeat a vertex when there is no negative cycle (cutting out a loop of length 0 or more never makes a route longer), so a
        shortest route then has at most V − 1 edges. Lesson 4 uses this.
      </p>
      <p>
        In an undirected graph, a negative edge is itself a negative cycle: go along it and straight back. So negative weights only make sense on
        directed edges.
      </p>
      <Note title="Shortest is easy, longest is hard">
        <p>
          Asking for the <em>longest</em> route without repeating a vertex looks like the same problem with the signs flipped, but it is not. Flipping
          the signs makes cycles negative, and &ldquo;without repeating a vertex&rdquo; can then no longer be dropped. The longest simple route is
          NP-hard (HARD-1): no fast method is known. DYNP-1 used it as the example where optimal substructure fails. In a DAG there are no cycles,
          and the longest route is easy (lesson 6).
        </p>
      </Note>

      <h2 id="map">Which method when</h2>
      <div className="tt-wrap">
        <table className="tt">
          <thead>
            <tr>
              <th>Graph</th>
              <th>Question</th>
              <th>Method</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>every weight 1</td>
              <td>one start</td>
              <td>BFS (GRPH-2)</td>
              <td className="num nowrap">O(V + E)</td>
            </tr>
            <tr>
              <td>weights 0 and 1</td>
              <td>one start</td>
              <td>0-1 BFS (lesson 2)</td>
              <td className="num nowrap">O(V + E)</td>
            </tr>
            <tr>
              <td>no negative weights</td>
              <td>one start</td>
              <td>Dijkstra (lesson 3)</td>
              <td className="num nowrap">O((V + E) log V)</td>
            </tr>
            <tr>
              <td>negative weights</td>
              <td>one start</td>
              <td>Bellman–Ford (lesson 4)</td>
              <td className="num nowrap">O(V · E)</td>
            </tr>
            <tr>
              <td>any, small V</td>
              <td>every pair</td>
              <td>Floyd–Warshall (lesson 5)</td>
              <td className="num nowrap">O(V³)</td>
            </tr>
            <tr>
              <td>a DAG</td>
              <td>one start</td>
              <td>topological order (lesson 6)</td>
              <td className="num nowrap">O(V + E)</td>
            </tr>
            <tr>
              <td>a known target, a good guess</td>
              <td>one pair</td>
              <td>A* (lesson 7)</td>
              <td className="num">often far less than Dijkstra</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Here log V is &ldquo;how many times you can halve V&rdquo;, and V³ means V · V · V. Now try <Link href="/dsa/path/practice/1/">PATH-P1, Are these the shortest times?</Link>
      </p>
    </>
  );
}
