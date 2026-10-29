import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FindFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Two well-known methods find every strongly connected group in <M>O(V + E)</M> time. Kosaraju&rsquo;s method uses two depth-first searches.
        Tarjan&rsquo;s method uses one search and one extra number per vertex. Both read the finish order of depth-first search (GRPH-3).
      </p>

      <h2 id="kosaraju">Kosaraju: finish order, then turn round</h2>
      <ol>
        <li>Run a depth-first search over the whole graph (starting again from every vertex not yet reached), and list the vertices in the order they finish.</li>
        <li>Reverse every edge.</li>
        <li>
          Go through the vertices from the last to finish to the first. From each vertex that has no group yet, search the reversed graph, and
          give every vertex it reaches that has no group yet a new group number.
        </li>
      </ol>
      <p>Each search in step 3 finds exactly one whole group. Step through the first variant of the figure.</p>
      <FindFigure />

      <h2 id="why">Why each search finds one group</h2>
      <p>
        For a group X, let f(X) be the latest finish time of any vertex in X. The whole proof rests on one fact about the graph of groups (lesson
        1).
      </p>
      <Invariant label="Key fact">If an edge goes from group X to a different group Y, then f(X) &gt; f(Y).</Invariant>
      <p>Take the first vertex of X ∪ Y that the search reaches; call it x. There are two cases.</p>
      <ul>
        <li>
          <strong>x is in X.</strong> At that moment no vertex of X or Y is reached, and x reaches all of them (all of X inside its group, then the
          edge into Y, then all of Y). By the free-path fact of GRPH-3, every one of them ends up below x in the search, so each finishes before
          x. So x finishes last of all of them: f(X) = finish of x &gt; f(Y).
        </li>
        <li>
          <strong>x is in Y.</strong> The search from x reaches all of Y, but none of X: if anything in Y reached X, X and Y would be one group
          (the edge X → Y already gives the way back). So all of Y finishes before the search ever reaches X, and every vertex of X finishes
          later. So f(X) &gt; f(Y).
        </li>
      </ul>
      <p>
        Now step 3. The vertex with the latest finish of all is in a group X whose f is the largest. By the key fact, no edge comes into X from
        another group, because that group would have a larger f. In the reversed graph that means no edge leaves X. So a search of the reversed
        graph from that vertex reaches exactly X: all of X (a group stays a group when every edge is reversed) and nothing else.
      </p>
      <p>
        Then the method takes the next vertex with no group, by finish time. Its group X′ has the largest f among the groups left. Any edge into X′
        from a group not yet found would break the key fact, so in the reversed graph the only edges leaving X′ lead to groups already found, and
        the search skips vertices that already have a group. By induction, every search finds exactly one group. The groups also come out in
        topological order: each group has no edges coming in from groups found later.
      </p>
      <p>
        Cost: two searches over all vertices and edges, plus building the reversed graph: <M>O(V + E)</M> time and <M>O(V + E)</M> memory.
      </p>

      <h2 id="tarjan">Tarjan: one search and a stack</h2>
      <p>
        Robert Tarjan&rsquo;s method (1972) finds the groups during one depth-first search. Each vertex gets two numbers: <code>index[v]</code>, its
        place in the order of discovery (1, 2, 3, …), and <code>low[v]</code>, its <strong>low-link</strong> number. Each vertex is also pushed
        on a separate stack when it is reached, and stays there until its whole group is known.
      </p>
      <CodeBlock
        code={`# index[u]: when u was reached (0 = not yet); low[u]; on[u]: is u
# on the stack?; comp[u]: u's group; t and count: two counters.
    def visit(u):
        nonlocal t, count
        t += 1
        index[u] = low[u] = t
        stack.append(u); on[u] = True
        for v in adj[u]:
            if index[v] == 0:
                visit(v)
                low[u] = min(low[u], low[v])
            elif on[v]:                # v's group is not finished
                low[u] = min(low[u], index[v])
        if low[u] == index[u]:         # u is its group's first vertex
            while True:
                x = stack.pop(); on[x] = False
                comp[x] = count
                if x == u:
                    break
            count += 1`}
      />
      <p>
        This is the main step of the method: one call per vertex, run from every vertex not yet reached. Setting up the lists and the outer loop is
        left to <Link href="/dsa/conn/practice/2/">CONN-P2</Link>, which also needs a version without recursion and the groups in topological
        order. Step through the second variant of the figure. The tag on each junction reads index/low; the stack is beside the graph (under it
        on a phone).
      </p>

      <h2 id="low">The low-link rule</h2>
      <p>
        In each group, call the vertex the search reaches first the group&rsquo;s <strong>head</strong>. By the free-path fact, the rest of the
        group ends up below the head in the search, so the head finishes last in its group.
      </p>
      <Invariant label="Low-link">u is the head of its group exactly when low[u] = index[u] at the moment u finishes.</Invariant>
      <p>
        <code>low[u]</code> is the smallest index the search can reach from u&rsquo;s part of the search tree, using tree edges down and then one
        edge to a vertex that is still on the stack. A vertex is still on the stack exactly when its group is not finished, which means its head is
        still on the current path, above u or equal to u.
      </p>
      <ul>
        <li>
          <strong>If u is not a head,</strong> its head h is above u on the path. h reaches u, so u reaches h, and the path from u to h must leave
          u&rsquo;s part of the tree by some edge into a vertex that is reached and still on the stack, with an index smaller than u&rsquo;s. That
          edge lowers <code>low</code> somewhere under u, and the lower value is carried up to u. So <code>low[u] &lt; index[u]</code>.
        </li>
        <li>
          <strong>If u is a head,</strong> every vertex on the stack with a smaller index belongs to a different group above u. An edge from
          u&rsquo;s part to such a vertex w would give a path u → … → w, and w is above u on the path, so w reaches u: they would be one group, a
          contradiction. So nothing lowers <code>low[u]</code> below <code>index[u]</code>.
        </li>
      </ul>
      <p>
        When a head u finishes, the vertices above it on the stack are exactly its group: they were pushed after u, while u was on the path, and
        every group found inside u&rsquo;s part has already been popped. So popping down to u gives the group.
      </p>
      <p>
        Why must the rule ask &ldquo;is v still on the stack?&rdquo;? An edge to a vertex whose group is finished leads into a group that cannot
        get back, and must be ignored. In the figure, F&rsquo;s streets lead to E and G, both finished: F is a group on its own. Without the check,
        low[F] would drop to 3 and F would never be popped.
      </p>
      <Note title="Tarjan gives the reverse order">
        <p>
          A group is popped only after every group it can reach has been popped. So Tarjan&rsquo;s numbers run in <em>reverse</em> topological
          order: in the figure, {"{C, D, G, H}"} first and {"{F}"} last. To number the groups so that every edge goes forward, use{" "}
          <code>count - 1 - comp[v]</code>. Lesson 4 uses this order directly.
        </p>
      </Note>
      <p>
        Many books write the edge rule as <code>low[u] = min(low[u], low[v])</code> for every v on the stack. That also finds the right groups,
        though <code>low</code> then means something slightly different. The version above matches the proof.
      </p>

      <h2 id="stack">Without recursion</h2>
      <p>
        Both methods are depth-first searches, and a path can be 100,000 vertices long, far beyond Python&rsquo;s limit of about 1,000 nested
        calls (GRPH-3), and lower still in the browser. Use the stack of (vertex, iterator) pairs from GRPH-P3. For Tarjan, the work after a
        recursive call returns, <code>low[u] = min(low[u], low[v])</code>, moves to the moment v is popped from that stack: the vertex now on top is
        v&rsquo;s parent. The stack of the method itself (the one holding unfinished groups) is a second, separate list.
      </p>
      <p>
        Kosaraju needs the iterator form only in its first pass, where the finish order matters. The second pass only marks what it reaches, so a
        plain stack or a queue is enough.
      </p>

      <h2 id="compare">Which one to use</h2>
      <ul>
        <li>
          <strong>Kosaraju</strong> is easier to get right and to prove. It needs the reversed graph (twice the memory for edges) and two
          searches.
        </li>
        <li>
          <strong>Tarjan</strong> needs one search and no reversed graph, so it is usually faster. The low-link rule needs care.
        </li>
        <li>
          A third method, the <strong>path-based</strong> method of Cheriyan, Mehlhorn and Gabow, keeps two stacks and no low numbers. All three
          are <M>O(V + E)</M>.
        </li>
        <li>
          In Python, the networkx library does this for you with its function <code>strongly_connected_components</code>. The practice pages do not have networkx, so write it yourself there.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/conn/practice/2/">CONN-P2, Every group, in order</Link>.
      </p>
    </>
  );
}
