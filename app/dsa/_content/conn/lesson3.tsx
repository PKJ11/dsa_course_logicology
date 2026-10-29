import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { WeakFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Back to two-way edges. Some lines of a network matter more than others: close one, and part of the network is cut off. One depth-first
        search, with the same low numbers as Tarjan&rsquo;s method, finds every such line and every such station.
      </p>

      <h2 id="weak">Weak points of a network</h2>
      <p>In an undirected graph:</p>
      <ul>
        <li>
          A <strong>bridge</strong> is an edge whose removal leaves more connected parts than before. In a railway, it is a line with no other way
          round it.
        </li>
        <li>
          An <strong>articulation point</strong> (or <strong>cut vertex</strong>) is a vertex whose removal, together with its edges, leaves more
          connected parts than before. The practice page calls it a cut station.
        </li>
      </ul>
      <p>
        An edge is a bridge exactly when it lies on no cycle: if u–v is on a cycle, the rest of the cycle is another way from u to v; if it is on
        no cycle, there is no other way. The simple method removes each edge in turn and counts the parts again with a search: <M>O(E · (V + E))</M>
        . The method below does it all in one search, <M>O(V + E)</M>.
      </p>

      <h2 id="low">Low numbers in an undirected search</h2>
      <p>
        Run a depth-first search and give each vertex its discovery number <code>disc[v]</code> (1, 2, 3, …). GRPH-3 showed that in an undirected
        search every edge is either a <strong>tree edge</strong> (it reached a new vertex) or a <strong>back edge</strong> (it joins a vertex to one
        above it on the path). There are no cross edges.
      </p>
      <p>
        For each vertex v, let <code>low[v]</code> be the smallest discovery number that v&rsquo;s <strong>subtree</strong> (v and everything
        below it in the search tree) can reach with one back edge. It is computed as the search returns:
      </p>
      <CodeBlock
        code={`low[u] = smallest of:
    disc[u]
    disc[w]   for each back edge u - w (not the edge u came by)
    low[v]    for each child v of u in the search tree`}
      />
      <p>Step through the figure. The tags read disc/low.</p>
      <WeakFigure />

      <h2 id="rules">The two rules, with proofs</h2>
      <Invariant label="Bridge">A tree edge p–v is a bridge exactly when low[v] &gt; disc[p].</Invariant>
      <p>
        If <code>low[v] &gt; disc[p]</code>, no back edge leaves v&rsquo;s subtree to p or above it. The only edge between the subtree and the rest
        is p–v itself, so removing it cuts the subtree off. If <code>low[v] ≤ disc[p]</code>, some back edge goes from the subtree to p or above;
        together with tree edges it makes a cycle through p–v, so p–v is not a bridge. Back edges are never bridges, for the same reason: each
        closes a cycle with tree edges.
      </p>
      <Invariant label="Cut">A vertex p that is not the start is a cut vertex exactly when some child v has low[v] ≥ disc[p].</Invariant>
      <p>
        If <code>low[v] ≥ disc[p]</code>, the best v&rsquo;s subtree can do is get back to p itself. Remove p, and nothing joins that subtree to the
        vertices above p (there are some, because p is not the start). If every child v has <code>low[v] &lt; disc[p]</code>, each child&rsquo;s
        subtree has a back edge to a vertex above p, so removing p leaves every subtree joined to the part above p, and nothing is cut off.
      </p>
      <p>
        <strong>The start is different.</strong> It has no vertices above it, so the rule above would mark it whenever it has any child. The start
        is a cut vertex exactly when it has <strong>two or more children</strong> in the search tree. Two children&rsquo;s subtrees have no edge
        between them (there are no cross edges), so only the start joins them. With one child, removing the start leaves that one subtree whole.
        In the figure, A has one child, B, because C was reached through B.
      </p>
      <p>
        The difference between the two tests is &gt; against ≥. In the figure, <code>low[E] = 4 = disc[D]</code>: E&rsquo;s part can get back
        to D, so D–E is on a cycle (D–E–F–D) and is no bridge, but it cannot get above D, so closing D cuts it off. A cut vertex need not touch any
        bridge, and the two ends of a bridge are cut vertices unless they have degree 1.
      </p>

      <h2 id="repeat">Repeated lines</h2>
      <p>
        The rule &ldquo;skip the edge back to the parent&rdquo; must skip the <em>edge the search arrived by</em>, not every edge to the parent
        vertex. With two lines between C and D (the figure&rsquo;s second variant), the second line is a real second way: D&rsquo;s low drops to
        C&rsquo;s number, and neither line is a bridge. Skipping by parent vertex would miss this and report a bridge that is not there. So store
        each edge with its position in the list, and keep on the stack the position of the edge each vertex came by.
      </p>
      <p>
        Cut vertices do not change: closing C closes both lines. A line from a vertex to itself joins nothing and is never a bridge; leave it out
        of the lists.
      </p>
      <p>
        The search must not use recursion when paths can be long. Use the (vertex, iterator) stack again, with a third item: the edge the vertex
        came by. When the iterator on top runs out, pop it, and update the parent&rsquo;s <code>low</code> and the two rules there. Now try{" "}
        <Link href="/dsa/conn/practice/3/">CONN-P3, Weak points of the network</Link>.
      </p>

      <h2 id="more">Blocks, and the cheapest-tree link</h2>
      <ul>
        <li>
          <strong>2-edge-connected parts.</strong> Remove every bridge. The connected parts left are the largest groups of vertices with two
          separate ways (sharing no edge) between any two of them. Shrink each to a point, and the bridges form a forest: the{" "}
          <strong>bridge tree</strong>.
        </li>
        <li>
          <strong>Blocks.</strong> A block (a biconnected component) is a largest set of edges in which any two edges lie on a common cycle, or a single bridge on its own. Two
          blocks share at most one vertex, and that vertex is a cut vertex. The same search finds the blocks by keeping a stack of edges, and
          popping one block whenever the cut rule <code>low[v] ≥ disc[p]</code> holds.
        </li>
        <li>
          <strong>Menger&rsquo;s theorem</strong> says the number of separate routes between two vertices equals the fewest edges (or vertices)
          whose removal splits them. Bridges are the case &ldquo;one edge splits them&rdquo;. FLOW-4 proves the general form with network flow.
        </li>
        <li>
          <strong>Edges in every cheapest tree.</strong> SPAN-4 said that an edge u–v of cost w is in <em>every</em> cheapest spanning tree when
          it is a bridge in the graph made of the edges of cost w between the groups formed by cheaper edges. That graph can have two edges
          between the same two groups, which is exactly why repeated lines must be handled as above.
        </li>
      </ul>
      <Note title="Directed graphs">
        <p>
          In a directed graph, the matching question is &ldquo;which edge, if removed, stops u reaching v?&rdquo; or &ldquo;which vertex must
          every route from s pass through?&rdquo;. The second has its own theory (dominator trees, used by compilers). Strongly connected groups
          from lessons 1 and 2 are the directed graph&rsquo;s version of connected parts, not of bridges.
        </p>
      </Note>
    </>
  );
}
