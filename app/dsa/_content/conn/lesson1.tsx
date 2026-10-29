import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { GroupFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        In a network of one-way streets, being able to drive from u to v says nothing about driving back. This lesson groups the vertices of a
        directed graph by a stronger rule: you can get from each one to the other, both ways. These groups split every directed graph into parts,
        and the parts always line up in an order with no cycle.
      </p>

      <h2 id="both">Reaching both ways</h2>
      <p>
        In a directed graph, u <strong>reaches</strong> v when there is a path from u to v along the edges, in their direction. Every vertex
        reaches itself, by a path of no edges. Two vertices u and v are <strong>strongly connected</strong> when u reaches v and v reaches u.
      </p>
      <p>
        In an undirected graph this is the same as being in one connected part (GRPH-3), because every path can be walked backwards. In a directed
        graph it is not. In the figure below, A reaches D (A → B → C → D), but D cannot get back to A: no street leads from C, D, G or H to A, B or E.
      </p>

      <h2 id="groups">Groups that split the graph</h2>
      <p>Being strongly connected has three properties:</p>
      <ul>
        <li>Every vertex is strongly connected to itself.</li>
        <li>If u is strongly connected to v, then v is strongly connected to u: the rule is the same both ways.</li>
        <li>
          If u is strongly connected to v, and v to w, then u is strongly connected to w. A path from u to v followed by a path from v to w is a
          path from u to w, and the same holds on the way back.
        </li>
      </ul>
      <p>
        A rule with these three properties splits the vertices into groups: each vertex is in exactly one group, and two vertices are in the same
        group exactly when the rule holds between them. These groups are the <strong>strongly connected components</strong>. This course calls
        them groups for short. A vertex that no cycle passes through is a group on its own.
      </p>
      <Invariant label="Group">u and v are in the same group exactly when u reaches v and v reaches u.</Invariant>
      <p>
        One fact follows at once: every cycle lies inside one group, because every vertex on a cycle reaches every other along the cycle. And any
        edge u → v inside a group lies on a cycle: v reaches u, and the edge closes the loop. So a group is the largest set of vertices that cycles
        can join together.
      </p>

      <h2 id="one">The group of one vertex</h2>
      <p>
        To find the group of a vertex s, two searches are enough. The first search follows the edges from s, and marks every vertex s reaches. The
        second search follows the edges <em>backwards</em>: it uses the <strong>reversed graph</strong>, where every edge u → v is turned round
        to v → u. A path from v to s in the graph is a path from s to v in the reversed graph, so the second search marks every vertex that reaches
        s. The group of s is the set of vertices marked by both.
      </p>
      <GroupFigure />
      <CodeBlock
        code={`def same_group(n, edges, u, v):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]      # the reversed graph
    for a, b in edges:
        out[a].append(b)
        back[b].append(a)
    # u reaches v, and v reaches u (u reaches v in the reversed graph)
    return reach(out, u)[v] and reach(back, u)[v]`}
      />
      <p>
        Here <code>reach</code> is any search that returns a list of True and False: BFS (GRPH-2) or a depth-first search with its own stack
        (GRPH-3). Each search costs <M>O(V + E)</M>, where V is the number of vertices and E the number of edges. The same two lists give the whole
        group of u: every vertex marked True in both. So the group of one vertex also costs <M>O(V + E)</M>. Doing this again from each vertex not yet in a group finds every group, but each round can cost <M>O(V + E)</M> and
        there can be V groups, so the total can reach <M>O(V · (V + E))</M>. On 100,000 vertices that is billions of steps. Lesson 2 finds every
        group with two searches in total, or with one.
      </p>
      <p>
        Now try <Link href="/dsa/conn/practice/1/">CONN-P1, The junction&rsquo;s group</Link>.
      </p>

      <h2 id="dag">The graph of groups has no cycle</h2>
      <p>
        Shrink each group to a single point, and keep one edge from group X to group Y whenever some edge of the graph goes from a vertex of X to
        a vertex of Y (with X and Y different). The result is the <strong>graph of groups</strong> (often called the condensation). Step through
        the figure&rsquo;s second variant.
      </p>
      <Invariant label="Order">The graph of groups never has a cycle: it is a DAG.</Invariant>
      <p>
        Suppose it had a cycle X₁ → X₂ → … → X₁. Take any vertex x in X₁ and any vertex y in X₂. Inside a group every vertex reaches every
        other, so following the cycle of groups gives a path from x to y, and going on round the cycle gives a path from y back to x. Then x and y
        are strongly connected, so X₁ and X₂ are the same group, which is not allowed for an edge of the graph of groups. So there is no cycle.
      </p>
      <p>
        A DAG (a directed graph with no cycle) has a topological order (GRPH-5): an order of its vertices in which every edge goes forward. So the
        groups of any directed graph can be numbered 0, 1, 2, … so that every edge goes from a group to the same group or a later one. Lesson 2
        shows that both methods for finding groups give this order on the way, and <Link href="/dsa/conn/practice/2/">CONN-P2</Link> asks for it.
      </p>
      <Note title="Two views of one graph">
        <p>
          Any directed graph is a DAG of groups, with cycles only inside the groups. Many questions split along that line: answer them inside each
          group (where everything reaches everything), then once over the DAG of groups in topological order, as in DYNP and PATH-6. For example,
          &ldquo;how many vertices can v reach?&rdquo; or &ldquo;the largest total value on a walk&rdquo; becomes a DP over the DAG of groups.
        </p>
      </Note>

      <h2 id="uses">Where groups appear</h2>
      <ul>
        <li>
          <strong>One-way streets.</strong> A town&rsquo;s street plan works for everyone exactly when the whole graph is one group. Checking this
          needs only the two searches above from any one junction.
        </li>
        <li>
          <strong>Programs.</strong> Functions that call each other in a loop form a group of the call graph. Compilers and tools that check
          imports work group by group, in topological order.
        </li>
        <li>
          <strong>Spreadsheets and build tools.</strong> A group of more than one cell is a set of formulas that depend on each other in a loop
          (GRPH-4&rsquo;s cycles, all found at once).
        </li>
        <li>
          <strong>Logic.</strong> Lesson 4 turns rules with two conditions into a graph whose groups decide whether the rules can all hold.
        </li>
        <li>
          <strong>The web.</strong> Studies of web links found one huge group of pages that all reach each other, with pages that only lead into it
          and pages that only lead out of it.
        </li>
      </ul>
    </>
  );
}
