import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DfsFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Depth-first search goes as far as it can along one path, then backs up and tries the next way. It does not find shortest routes. What
        it gives instead is structure: the order in which vertices finish, and a label for every edge. Cycles (lesson 4), task orders (lesson 5)
        and the connectivity station (CONN) all read that structure.
      </p>

      <h2 id="deep">Going deep first</h2>
      <p>
        TREE-2 walked a tree in pre-order and post-order with recursion. Depth-first search (DFS) is the same walk on a graph, plus a mark on
        every vertex already reached, so it never goes round a cycle again and again:
      </p>
      <CodeBlock
        code={`def dfs_all(adj):
    n = len(adj)
    d = [0] * n                 # discovery time; 0 means not reached
    f = [0] * n                 # finish time
    time = 0

    def visit(u):
        nonlocal time
        time += 1
        d[u] = time             # u is discovered
        for v in adj[u]:
            if d[v] == 0:
                visit(v)        # go deeper first
        time += 1
        f[u] = time             # every neighbour tried: u finishes

    for s in range(n):          # every vertex, even ones s cannot reach
        if d[s] == 0:
            visit(s)
    return d, f`}
      />
      <p>
        A vertex is <strong>discovered</strong> when the search first reaches it, and <strong>finishes</strong> when all its neighbours have
        been tried. In between, it sits on the current path: the chain of calls that are waiting. Each vertex is visited once and each list is
        read once, so DFS costs <M>O(V + E)</M>, like BFS. The figure keeps one clock for both events and shows each vertex&rsquo;s times as a
        tag, discovery/finish.
      </p>
      <DfsFigure />

      <h2 id="times">Discovery and finish times</h2>
      <p>
        Think of each vertex as holding the time span from its discovery to its finish. Two facts about these spans are the base of every proof
        in this station.
      </p>
      <Invariant label="Nesting">Two time spans are either one inside the other, or apart. They never overlap partly.</Invariant>
      <p>
        Take two vertices u and v, with u discovered first. If v is discovered while u is still on the path, v is below u in the search, and
        calls end in the reverse order they began (STAQ-1), so v finishes before u: v&rsquo;s span is inside u&rsquo;s. Otherwise u had already
        finished when v was discovered, and the spans are apart. So v is <strong>below</strong> u in the search (a descendant) exactly when
        v&rsquo;s span is inside u&rsquo;s.
      </p>
      <Invariant label="Free path">
        v ends up below u exactly when, at the moment u is discovered, a path leads from u to v through vertices not yet reached.
      </Invariant>
      <p>
        If v ends up below u, the path of calls from u down to v was made of vertices discovered after u, so they were not reached at that
        moment. For the other direction, suppose such a free path exists but some vertex on it does not end up below u; take the first one, w.
        The vertex just before w on the path is below u (or is u), so the search tries the edge to w before that vertex finishes, and therefore
        before u finishes. w was not reached when u began, so it is discovered inside u&rsquo;s span, which puts it below u, a contradiction.
      </p>

      <h2 id="kinds">Four kinds of edges</h2>
      <p>When the search looks along an edge u → v, the state of v sorts the edge into one of four kinds:</p>
      <ul>
        <li>
          <strong>Tree edge:</strong> v is not reached yet, and the search goes to v. The tree edges form the <strong>DFS forest</strong>: one
          tree per fresh start.
        </li>
        <li>
          <strong>Back edge:</strong> v is still on the path, so v is above u. The edge leads back up.
        </li>
        <li>
          <strong>Forward edge:</strong> v is finished and was discovered after u, so v is already below u, reached by another way.
        </li>
        <li>
          <strong>Cross edge:</strong> v is finished and was discovered before u. Neither is above the other.
        </li>
      </ul>
      <p>
        In an <em>undirected</em> graph only tree edges and back edges occur. An edge u–v is looked at from both ends, and whichever end is
        discovered first still has the edge to try while the other end is being searched, so the later one is always below the earlier one.
      </p>

      <h2 id="stack">Without recursion</h2>
      <p>
        Each recursive call uses room on Python&rsquo;s call stack, and Python stops at 1,000 nested calls by default
        (<code>sys.getrecursionlimit()</code>). A path of 100,000 vertices is common in real input. <code>sys.setrecursionlimit</code> lets
        Python go deeper, but the call stack underneath is fixed in size, and when it runs out the program crashes without a Python error. In
        the browser the limit is lower still. So a DFS that must handle any input keeps its own stack in a list.
      </p>
      <p>The short version pushes all neighbours and pops one at a time:</p>
      <CodeBlock
        code={`def dfs_visit_order(adj, s):
    seen = [False] * len(adj)
    order = []
    stack = [s]
    while stack:
        u = stack.pop()
        if seen[u]:
            continue            # pushed twice, by two neighbours
        seen[u] = True
        order.append(u)
        for v in reversed(adj[u]):   # so adj[u][0] is popped first
            if not seen[v]:
                stack.append(v)
    return order`}
      />
      <p>
        This visits vertices in the same order as the recursion, but it has no moment when a vertex finishes, and a vertex can sit on the stack
        several times (the stack can hold E entries). To copy the recursion exactly, keep on the stack what a paused call keeps: the vertex,
        and how far through its list it has got. A Python iterator remembers exactly that: push <code>(u, iter(adj[u]))</code>, take the next
        neighbour from the iterator on top, and when the iterator is empty, u finishes. The figure&rsquo;s second variant shows this stack,
        with each vertex&rsquo;s next neighbour; it holds the same vertices as the call stack. P3 asks you to write it.
      </p>

      <h2 id="parts">Connected parts</h2>
      <p>
        In an undirected graph, each fresh start of the search reaches exactly one <strong>connected component</strong>: a largest group of
        vertices that are joined by paths. Counting fresh starts counts components, in O(V + E). DSUF-5 counts them with union-find, which is
        better when edges arrive one at a time and the count is wanted after each one. A search is better when you also need the paths, the
        order, or the times.
      </p>
      <Note title="BFS or DFS?">
        <p>
          Both are O(V + E) and both find everything that can be reached. Use BFS when the number of edges matters (distances, fewest steps). Use
          DFS when the structure matters: finish times, back edges, the order of tasks, and in CONN the low-link numbers that find weak points
          of a network. For &ldquo;can I reach it at all&rdquo;, either works. Their memory differs: BFS holds a whole layer of the graph in its
          queue, DFS holds one path.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/grph/practice/3/">GRPH-P3, Finish order</Link>.
      </p>
    </>
  );
}
