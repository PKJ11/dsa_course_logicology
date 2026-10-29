import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DagFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        When a directed graph has no cycles (a DAG), shortest routes need neither a heap nor many rounds. Put the vertices in topological order
        (GRPH-5) and relax each edge once. Negative weights are fine, and the longest route is just as easy.
      </p>

      <h2 id="order">Relax in topological order</h2>
      <p>
        GRPH-5 showed that a DAG has a <strong>topological order</strong>: a list of its vertices in which every edge goes from an earlier vertex
        to a later one. GRPH-5 also said that this order is the order in which a DP table can be filled (DYNP-3). Here the DP is the shortest time
        to each vertex:
      </p>
      <Invariant label="Rule">dist(v) = min over edges u → v of dist(u) + w, and dist(s) = 0.</Invariant>
      <p>
        Every u in the rule comes before v in the order. So going through the vertices in order, and relaxing each vertex&rsquo;s edges out,
        offers every route to v before v&rsquo;s own edges are used.
      </p>
      <CodeBlock
        code={`import math
from collections import deque

def dag_shortest(n, edges, s):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indeg[v] += 1
    order = []                     # Kahn's method, GRPH-5
    q = deque(v for v in range(n) if indeg[v] == 0)
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    dist = [math.inf] * n
    dist[s] = 0
    for u in order:
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`}
      />
      <DagFigure />

      <h2 id="proof">Why one pass is enough</h2>
      <p>
        Take any vertex v and a shortest route to it, s = v<sub>0</sub>, v<sub>1</sub>, …, v<sub>k</sub> = v. The edges of the route go forward
        in the order, so v<sub>0</sub>, v<sub>1</sub>, … come in the order in that sequence. When v<sub>i</sub> is handled, its value is already
        exact (by induction: the edge from v<sub>i−1</sub> was relaxed earlier, when v<sub>i−1</sub> already had its exact value), and relaxing
        v<sub>i</sub> → v<sub>i+1</sub> gives v<sub>i+1</sub> its exact value. This is lesson 4&rsquo;s argument with all its rounds folded into
        one: Bellman–Ford in topological order needs just one round.
      </p>
      <p>
        Nothing in the proof needs weights to be 0 or more, so negative weights are fine. There can be no negative cycle, because there is no cycle
        at all. <strong>Cost:</strong> the order costs O(V + E), and the pass relaxes each edge once, so <M>O(V + E)</M>, faster than Dijkstra.
        Vertices before s in the order keep ∞, and their edges change nothing.
      </p>
      <Note title="Recursion is the same DP backwards">
        <p>
          Asking &ldquo;what is dist(v)?&rdquo; and recursing into every edge coming into v, with a memo (DYNP-2), gives the same answers. But a
          chain of 100,000 vertices is 100,000 calls deep. The loop over a topological order has no recursion at all. That is one of the tests in{" "}
          <Link href="/dsa/path/practice/6/">PATH-P6</Link>.
        </p>
      </Note>

      <h2 id="longest">Longest paths</h2>
      <p>
        In a general graph the longest simple route is NP-hard (lesson 1). In a DAG it is easy: there are no cycles to go round, so use the same
        pass with max instead of min (and −∞ instead of ∞), or flip the sign of every weight and find the shortest route. The second variant of the
        figure does this.
      </p>
      <p>
        <strong>The critical path.</strong> In a project, tasks are vertices with durations, and an edge u → v says u must finish before v starts.
        The earliest moment the project can end is the longest route through the DAG, and the tasks on that route are the{" "}
        <strong>critical path</strong>: any delay there delays everything. GRPH-5 counted the longest chain of tasks; this is the same with
        durations. ADDP-2 does DP on DAGs in general.
      </p>
      <p>
        <strong>Counting.</strong> The same pass can count routes. Keep <code>ways[v]</code>, the number of cheapest routes to v. When an offer is
        cheaper, v takes the offer&rsquo;s count; when it is equal, the counts add. That is PATH-P6.
      </p>

      <h2 id="uses">Where DAGs appear</h2>
      <ul>
        <li>
          <strong>Timetables.</strong> A train timetable is a DAG when each vertex is a (station, departure time) pair: every edge goes forward in
          time. Earliest arrival is then one pass in time order. Many journey planners work this way.
        </li>
        <li>
          <strong>DP tables.</strong> Every DP whose states never depend on themselves is a shortest or longest route in the DAG of its states:
          the grid paths of DYNP-5, the longest increasing subsequence of DYNP-6, the edit distance of DYNP-7.
        </li>
        <li>
          <strong>Text and speech.</strong> Splitting a sentence into words, or choosing the most likely words for a sound, are best routes through a
          DAG of positions (the Viterbi method).
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/path/practice/6/">PATH-P6, Cheapest routes in a DAG</Link>.
      </p>
    </>
  );
}
