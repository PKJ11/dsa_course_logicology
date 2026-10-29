import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CycleFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A cycle is a path that comes back to where it started. Sometimes a cycle is the problem: tasks that wait for each other so none can start, a
        spreadsheet cell that depends on itself. Sometimes it is the point: a round trip. Either way, the question &ldquo;is there a cycle?&rdquo;
        has a clean answer in O(V + E) time, and it is slightly different for two-way and one-way edges.
      </p>

      <h2 id="undirected">Two-way edges</h2>
      <p>
        Search an undirected graph with BFS or DFS, and remember each vertex&rsquo;s parent (the vertex it was reached from). The edge back to the
        parent is the edge you just came along, so it does not count. Any <em>other</em> edge to a vertex already reached closes a cycle: there
        were already two different routes to that vertex, and together they go round.
      </p>
      <ul>
        <li>
          If the same edge is listed twice, u–v and u–v again, that is a cycle of two edges in a graph that allows repeated edges. Skip the parent
          only once, or give each edge a number and skip only the edge you arrived by.
        </li>
        <li>An edge from a vertex to itself is a cycle of one edge.</li>
        <li>
          A quick count often settles it. A graph with no cycle is a <strong>forest</strong> (a set of trees), and a forest with c connected
          parts has exactly V − c edges. So if E ≥ V, there is certainly a cycle.
        </li>
      </ul>
      <p>
        DSUF-5 found cycles with union-find instead: an edge whose two ends are already in one group closes a cycle. When edges arrive one at a
        time and you need the first that closes a loop, union-find is the tool (DSUF-P3). When the graph is given at once and you want the cycle
        itself, a search is simpler.
      </p>

      <h2 id="directed">One-way edges: three states</h2>
      <p>
        With one-way edges, reaching a vertex for the second time does <em>not</em> mean a cycle. If A → B, A → C, B → D and C → D, then D is
        reached twice, but nothing leads back to A. What matters is whether an edge leads back to a vertex that is still on the current path of
        a depth-first search. So each vertex has three states, not two:
      </p>
      <ul>
        <li>
          <strong>not reached</strong> (white in the figure);
        </li>
        <li>
          <strong>on the path</strong>: discovered, not yet finished (pale);
        </li>
        <li>
          <strong>finished</strong>: every edge out of it has been tried (black).
        </li>
      </ul>
      <CodeBlock
        code={`def has_cycle(adj):
    n = len(adj)
    state = [0] * n             # 0 not reached, 1 on the path, 2 finished

    def visit(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return True     # an edge back to the path
            if state[v] == 0 and visit(v):
                return True
        state[u] = 2            # finished: no cycle runs through u
        return False

    return any(state[s] == 0 and visit(s) for s in range(n))`}
      />
      <p>
        This is lesson 3&rsquo;s recursion, so it fails on deep graphs; P4 asks for the version with your own stack. Step through the figure:
        the first variant has a cycle, the second has two ways into one vertex and no cycle, and the third shows the parent rule for two-way
        edges.
      </p>
      <CycleFigure />

      <h2 id="proof">Why a back edge is a cycle</h2>
      <Invariant label="Cycles">A directed graph has a cycle exactly when depth-first search finds a back edge.</Invariant>
      <p>
        <strong>A back edge gives a cycle.</strong> A back edge u → v means v is on the path above u. The path of tree edges leads from v down to
        u, and the edge u → v leads back: that is a cycle.
      </p>
      <p>
        <strong>A cycle gives a back edge.</strong> Take any cycle, and let v be the first of its vertices that the search discovers. At that
        moment every other vertex of the cycle is not yet reached, and the cycle itself is a path from v to each of them through unreached
        vertices. By lesson 3&rsquo;s free-path fact, all of them end up below v. Let u be the vertex just before v on the cycle. u is below v, so
        while the search looks along u → v, v is still on the path: a back edge.
      </p>
      <p>
        The second half also explains why finished vertices can be ignored. A finished vertex w has had all its edges tried, and if a cycle ran
        through w, its back edge would have been found while w was on the path. So reaching w again can never complete a cycle. A search that
        forgets this and searches finished vertices again is still correct, but it can take exponential time: a ladder of 40 layers of two
        vertices has 2⁴⁰ (about a million million) different paths.
      </p>

      <h2 id="find">Returning the cycle</h2>
      <p>
        To return the cycle, not only &ldquo;yes&rdquo;, record each vertex&rsquo;s parent when it is reached. When the back edge u → v is found,
        walk the parents from u up to v; that lists the cycle backwards, so turn it round. The walk is at most V steps, so the whole method stays{" "}
        <M>O(V + E)</M>.
      </p>
      <Note title="Another way: Kahn's method">
        <p>
          Lesson 5&rsquo;s method for ordering tasks repeatedly removes vertices with no edges coming in. If it gets stuck with vertices left,
          those vertices include a cycle. It answers yes or no without recursion; finding the cycle itself then needs a short walk among the
          vertices left over.
        </p>
      </Note>

      <h2 id="uses">Where cycles matter</h2>
      <ul>
        <li>
          <strong>Deadlock.</strong> Draw an edge from each waiting program to the program it waits for. A cycle means each waits for the next
          and none can go on. Databases search this &ldquo;wait-for&rdquo; graph and stop one program to break the cycle.
        </li>
        <li>
          <strong>Spreadsheets and build tools.</strong> A cell that depends on itself through other cells, or a file that must be built before
          itself, is a cycle in the graph of dependencies. The tool must report it rather than loop.
        </li>
        <li>
          <strong>Imports.</strong> When two Python modules import each other, Python may stop with &ldquo;partially initialized module&rdquo;:
          a cycle in the import graph.
        </li>
        <li>
          <strong>One edge out of every vertex.</strong> If every vertex has exactly one edge out, as in a linked list or the function that takes x to
          the remainder of x × x + 1 divided by m, following the edges must end in a cycle. LINK-5&rsquo;s fast and slow pointers find it with O(1) memory.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/grph/practice/4/">GRPH-P4, Find a cycle</Link>.
      </p>
    </>
  );
}
