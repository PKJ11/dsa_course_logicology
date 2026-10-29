import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DijkstraFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Edsger Dijkstra designed this method in 1956, in about twenty minutes, he said, sitting at a café in Amsterdam. It finds the shortest
        times from one start to every vertex when no edge is negative, and it is still the method behind route planners today.
      </p>

      <h2 id="nearest">Settle the nearest</h2>
      <p>
        Breadth-first search reaches vertices in order of distance. Dijkstra&rsquo;s method does the same with weights. It keeps a best time so far
        for every vertex, and splits the vertices into two groups: <strong>settled</strong> vertices, whose time is final, and the rest. At each
        step it picks the vertex that is not settled and has the smallest time, settles it, and relaxes its edges (lesson 1).
      </p>
      <ol>
        <li>Set every time to ∞, except the start&rsquo;s, which is 0.</li>
        <li>Pick the unsettled vertex u with the smallest time. If its time is ∞, stop: the rest cannot be reached.</li>
        <li>Settle u. Relax every edge u → v: if time(u) + w is less than time(v), lower time(v) and make u its parent.</li>
        <li>Repeat from step 2 until every vertex is settled.</li>
      </ol>
      <p>
        This is a greedy method (GRDY-1): it makes the choice that looks best now and never takes it back. Step through the figure. The heap on the
        right holds the candidates; ink stations are settled.
      </p>
      <DijkstraFigure />

      <h2 id="proof">Why a settled time is final</h2>
      <Invariant label="Invariant">Every settled vertex has its true distance, and no edge is negative.</Invariant>
      <p>
        Suppose u is the unsettled vertex with the smallest time t, and take any route P from s to u. P starts inside the settled group (s is
        settled first) and ends outside it, so at some point it leaves the group: let x → y be the first edge of P from a settled x to an unsettled
        y. When x was settled, the edge x → y was relaxed, so time(y) ≤ δ(s, x) + w(x, y), which is the length of P up to y. Because u was picked,
        t ≤ time(y). And the rest of P, from y to u, has no negative edge, so it adds 0 or more. Putting these together:
      </p>
      <Invariant label="So">t ≤ time(y) ≤ length of P up to y ≤ length of P.</Invariant>
      <p>
        Every route to u is at least t long, and t is the length of a real route, so t is the true distance. Settling u keeps the invariant true,
        and by induction every vertex is settled with its true distance. The proof used &ldquo;no edge is negative&rdquo; exactly once, in the last
        step; the last section of this lesson shows what happens without it.
      </p>

      <h2 id="heap">With heapq</h2>
      <p>
        Step 2, finding the smallest time, is the slow part. A heap (HEAP-4) finds it in O(log V). Python&rsquo;s <code>heapq</code> has no way to
        lower the priority of an entry already in the heap, so the usual Python version uses <strong>lazy removal</strong>, as HEAP-4 described:
        when a time goes down, push a new entry and leave the old one where it is. When an entry comes out, check whether it is out of date, and if
        so, skip it.
      </p>
      <CodeBlock
        code={`import heapq
import math

def dijkstra(adj, s):            # adj[u]: list of (v, w), w >= 0
    dist = [math.inf] * len(adj)
    parent = [-1] * len(adj)
    dist[s] = 0
    heap = [(0, s)]               # (time, vertex): smallest time first
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue              # an old entry: u is settled already
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (d + w, v))
    return dist, parent`}
      />
      <p>
        The tuples compare by time first, then by vertex number when times tie, so the heap never has to compare anything else. If vertices are
        objects that cannot be compared, use <code>(time, count, vertex)</code> with a counter, as in HEAP-4.
      </p>
      <p>
        The line <code>if d &gt; dist[u]: continue</code> matters for speed. Without it, an old entry for u makes the loop read all of u&rsquo;s
        edges again. A vertex with many edges that is offered a better time many times is then handled many times, each time reading every edge:{" "}
        <Link href="/dsa/path/practice/3/">PATH-P3</Link> has a test built for that. A list <code>done</code> of settled vertices does the same job.
      </p>
      <p>
        <strong>One target.</strong> If only the time to t is wanted, stop when t comes out of the heap: its time is final then. The route is
        rebuilt by following <code>parent</code> back from t, as in GRPH-2.
      </p>

      <h2 id="cost">What it costs</h2>
      <p>
        Each edge is relaxed once (when its start is settled) and can push one entry, so the heap holds at most E entries. Each push and pop costs
        O(log E), and log E ≤ 2 log V, because E is at most V² (V times V). In all, <M>O((V + E) log V)</M>.
      </p>
      <ul>
        <li>
          <strong>Without a heap.</strong> Looking through all V vertices for the smallest time costs O(V) per step, so <M>O(V²)</M> in all. For a
          dense graph, where E is close to V², that is as good as the heap version, and simpler. For a sparse graph of 100,000 vertices it is about
          10¹⁰ steps (ten thousand million): far too slow.
        </li>
        <li>
          <strong>Decrease-key.</strong> A heap that can lower an entry in place (it keeps a list of where each vertex sits in the heap) holds at most V entries
          instead of E. With a Fibonacci heap, lowering costs O(1) on average and the total is O(E + V log V), the best known bound for this method.
          In Python, lazy removal with <code>heapq</code> is faster in practice than any heap written by hand.
        </li>
      </ul>
      <Note title="Ties, zero weights, and undirected graphs">
        <p>
          Edges of weight 0 are allowed: the proof only needs &ldquo;not negative&rdquo;. Undirected graphs work as two directed edges. When several
          routes are equally short, which parent a vertex keeps depends on the order of the edges, and any of them is correct.
        </p>
      </Note>

      <h2 id="negative">Why negative edges break it</h2>
      <p>
        Switch the figure to &ldquo;A negative edge&rdquo;. B is settled at 2 because 2 is the smallest time in the heap. Later, C (at 3) has an edge
        of −2 to B, which would give 1. But B is settled and never looked at again, and D, settled from B, is wrong too. In the proof, &ldquo;the
        rest of P adds 0 or more&rdquo; is false: a longer route can become cheaper after its last edge.
      </p>
      <p>
        Two tempting fixes do not work. <strong>Adding a constant</strong> to every weight to make them all positive changes which route is
        shortest: a route with more edges gets the constant more times. <strong>Allowing settled vertices to be lowered</strong> again (dropping the
        settled check) does give right answers when there is no negative cycle, but a vertex can then be handled many times, and on bad inputs the
        number of steps grows exponentially. With negative edges, use Bellman–Ford (lesson 4), or Johnson&rsquo;s reweighting (lesson 5) for all
        pairs.
      </p>
      <p>
        Now try <Link href="/dsa/path/practice/3/">PATH-P3, The fastest journey</Link>.
      </p>
    </>
  );
}
