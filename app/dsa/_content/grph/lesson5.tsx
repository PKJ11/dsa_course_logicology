import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TopoFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A course has prerequisites, a build has steps that need other steps, a timetable has trains that must wait for connections. Each rule
        says &ldquo;this before that&rdquo;. Is there an order of everything that keeps every rule, and how do you find one? This lesson answers
        both, with two different methods.
      </p>

      <h2 id="order">An order that keeps every rule</h2>
      <p>
        Draw each rule &ldquo;u before v&rdquo; as an edge u → v. A <strong>topological order</strong> is a list of all the vertices in which
        every edge points forward: for each edge u → v, u comes earlier than v. It is usually not unique. With rules A → C and B → C, both A, B,
        C and B, A, C are topological orders.
      </p>
      <p>
        DYNP-3 met this idea already: a DP table must be filled in an order where every cell comes after the cells it reads, and that order is a
        topological order of the graph of &ldquo;reads from&rdquo; edges.
      </p>

      <h2 id="exists">When an order exists</h2>
      <p>
        A directed graph with no cycle is called a <strong>DAG</strong> (directed acyclic graph).
      </p>
      <Invariant label="Orders">A topological order exists exactly when the graph is a DAG.</Invariant>
      <p>
        <strong>A cycle makes it impossible.</strong> Going round a cycle, each vertex must come before the next, so the first vertex of the
        cycle must come before itself.
      </p>
      <p>
        <strong>With no cycle, an order exists.</strong> First, a DAG always has a vertex with no edges coming in. Start at any vertex and walk
        backwards along an incoming edge, again and again. Without a cycle you can never meet a vertex twice, so after at most V steps the walk
        stops, at a vertex with in-degree 0. Put that vertex first: it breaks no rule. Remove it with its edges; what is left is still a DAG, so
        repeat. Every vertex gets placed, and every edge points forward.
      </p>

      <h2 id="kahn">Kahn&rsquo;s method</h2>
      <p>
        The proof is already an algorithm. Kahn&rsquo;s method (1962) keeps each vertex&rsquo;s <strong>in-degree</strong> (lesson 1): the number
        of edges still coming in. Vertices at 0 are <strong>ready</strong>. Take any ready vertex, put it next in the order, and remove its
        outgoing edges by lowering its neighbours&rsquo; counts. A neighbour whose count reaches 0 becomes ready.
      </p>
      <CodeBlock
        code={`from collections import deque

def topo_order(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    ready = deque(v for v in range(n) if indeg[v] == 0)
    order = []
    while ready:
        u = ready.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                ready.append(v)
    return order if len(order) == n else None   # None: a cycle`}
      />
      <p>
        Each vertex is placed once and each edge lowers one count once: <M>O(V + E)</M>. If the graph has a cycle, the vertices on it never reach
        0, so the method stops early with fewer than n vertices placed. The same loop therefore orders a DAG and detects a cycle.
      </p>
      <p>
        You may take any ready vertex. Taking them in queue order gives one valid order. Taking the <em>smallest</em> ready vertex each time
        gives the smallest order (compared as Python compares lists); that needs a heap of ready vertices (HEAP), so it costs{" "}
        <M>O((V + E) log V)</M>, where log V is the number of times V can be halved. P5 asks for it.
      </p>
      <TopoFigure />

      <h2 id="dfs">Finish order, reversed</h2>
      <p>The second method uses depth-first search and lesson 3&rsquo;s finish times.</p>
      <Invariant label="Finishing">In a DAG, for every edge u → v, v finishes before u.</Invariant>
      <p>
        When the search looks along u → v, u is on the path. If v is not reached yet, it is searched below u and finishes first. If v is already
        finished, it finished first. And v cannot be on the path, because then u → v would be a back edge, which means a cycle (lesson 4). So
        listing the vertices in <em>reverse</em> finish order puts every u before its v. In code: run DFS from every vertex, append each vertex
        to a list when it finishes, then reverse the list (P3 builds the finish order). Like Kahn&rsquo;s method this is O(V + E), and the back
        edge test finds a cycle along the way.
      </p>
      <p>
        The two methods usually give different orders, and both are right. Kahn&rsquo;s method is easy to control (smallest first, or in rounds
        of tasks that can run at the same time); the DFS method needs no in-degree counts and costs nothing extra when a DFS is running anyway.
      </p>

      <h2 id="python">graphlib, and what orders are for</h2>
      <p>
        Python&rsquo;s standard library has a topological sort in <code>graphlib</code>. Its input is a dict that maps each vertex to the
        vertices that must come <em>before</em> it, the reverse of our edges:
      </p>
      <CodeBlock
        code={`from graphlib import TopologicalSorter, CycleError

needs = {"deploy": {"test", "docs"}, "test": {"build"},
         "docs": {"build"}, "build": set()}
print(list(TopologicalSorter(needs).static_order()))
# ['build', 'test', 'docs', 'deploy'] (test and docs may swap)

try:
    list(TopologicalSorter({"a": {"b"}, "b": {"a"}}).static_order())
except CycleError as e:
    print(e.args[1])            # ['a', 'b', 'a']: the cycle`}
      />
      <p>
        For running tasks in parallel, <code>prepare()</code>, <code>get_ready()</code> and <code>done()</code> hand out every task whose
        prerequisites are finished, in rounds. The order of tasks inside a set is not fixed, because sets of strings have no fixed order.
      </p>
      <ul>
        <li>
          <strong>Work along a DAG in order.</strong> Once vertices are in topological order, anything that depends only on earlier vertices can
          be computed in one pass. For the longest chain of tasks, go through the order and set{" "}
          <code>best[v] = max(best[v], best[u] + 1)</code> for each edge u → v. With task lengths this is the critical path: the shortest time
          the whole project can take. ADDP-2 does DP on DAGs in general, and PATH-6 finds shortest paths this way.
        </li>
        <li>
          <strong>Counting orders is hard.</strong> Finding one order takes O(V + E), but counting all of them has no known fast method for
          general graphs.
        </li>
      </ul>
      <Note title="Is the order unique?">
        <p>
          A DAG has exactly one topological order when Kahn&rsquo;s method never has two ready vertices at once. Equivalently, the order has an
          edge from each vertex to the next one, so the whole graph contains one path through every vertex.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/grph/practice/5/">GRPH-P5, The smallest order</Link>.
      </p>
    </>
  );
}
