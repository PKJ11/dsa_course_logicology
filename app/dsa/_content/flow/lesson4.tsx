import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { CutFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        How do you know a flow is the largest possible? By showing a set of lines that every train must cross, whose capacities add up to exactly
        the flow. The max-flow min-cut theorem says such a set always exists, and it proves that Ford-Fulkerson&rsquo;s stopping rule is right.
      </p>

      <h2 id="cuts">Cuts in a network</h2>
      <p>
        An <strong>s-t cut</strong> splits the vertices into two sides: S, which contains s, and T, the rest, which contains t. Its{" "}
        <strong>capacity</strong> c(S, T) is the total capacity of the edges from S to T. Edges from T back to S do not count. SPAN-4 used cuts
        with costs; here the edges have a direction and capacities.
      </p>
      <p>
        The <strong>flow across</strong> the cut is the flow on edges from S to T minus the flow on edges from T to S. Step through the
        figure&rsquo;s first variant: four different cuts of the same maximum flow.
      </p>
      <CutFigure />

      <h2 id="bound">Every flow fits under every cut</h2>
      <Invariant label="Across">For any flow and any cut, the flow across the cut equals the value of the flow.</Invariant>
      <p>
        Add up (flow out − flow in) over the vertices of S, as in lesson 1. Conservation makes every term 0 except the term for s, which is the
        value. In the sum, an edge with both ends in S is added once and taken once, so it cancels. What is left are the edges between S and T:
        those from S to T count plus, those from T to S count minus. That is the flow across.
      </p>
      <Invariant label="Bound">For any flow f and any cut (S, T), the value |f| ≤ c(S, T).</Invariant>
      <p>
        The flow across is at most the flow on the edges from S to T (the edges back only subtract), and each of those carries at most its
        capacity. So the largest flow is at most the smallest cut. Any one cut gives an upper bound on every flow.
      </p>

      <h2 id="theorem">The theorem</h2>
      <Invariant label="Max-flow min-cut">The value of a maximum flow equals the capacity of a minimum cut.</Invariant>
      <p>Ford and Fulkerson proved more: for a flow f, these three statements are equivalent.</p>
      <ol>
        <li>f is a maximum flow.</li>
        <li>The residual graph of f has no augmenting path.</li>
        <li>Some cut has capacity exactly |f|.</li>
      </ol>
      <p>
        <strong>1 gives 2:</strong> if there were an augmenting path, lesson 2 would give a larger flow. <strong>3 gives 1:</strong> no flow can be larger
        than that cut, by the bound above.
      </p>
      <p>
        <strong>2 gives 3</strong>, the main step: let S be every vertex that s can reach in the residual graph, and T the rest. t is in T, because
        there is no augmenting path, so this is a cut. Take an edge u → v from S to T. If it had room left, the arc u → v would be in the residual
        graph and v would be reachable, so it is full: f(u, v) = c(u, v). Take an edge v → u from T to S. If it carried any flow, the back arc u
        → v would be in the residual graph, so it carries 0. So the flow across the cut is exactly c(S, T), and it equals |f|.
      </p>
      <p>
        So Ford-Fulkerson is right when it stops (statement 2 gives statement 1), and the maximum flow and the minimum cut are the same number. This
        is an example of <strong>duality</strong>: a maximum problem and a minimum problem whose answers meet, so each answer proves that the
        other is the best possible.
      </p>

      <h2 id="find">Finding a smallest cut</h2>
      <p>
        The proof is also the method. Run any maximum-flow method to the end. The last search from s fails to reach t, and the vertices it reached
        are S. Step through the second variant of the figure: S = {"{s, B}"}, and the two lines out of it, s → A and B → D, are both full, 10 + 9 =
        19.
      </p>
      <p>
        With Edmonds-Karp, the arcs that reached each vertex in the last BFS mark S at no extra cost. Several smallest cuts can exist; the one from
        s is the one with the smallest S. Searching backwards from t gives the one with the smallest T. Now try{" "}
        <Link href="/dsa/flow/practice/4/">FLOW-P4, The weakest set of lines</Link>.
      </p>

      <h2 id="uses">What cuts answer</h2>
      <ul>
        <li>
          <strong>Separate routes (Menger&rsquo;s theorem).</strong> Give every line capacity 1. A flow of value k gives k routes from s to t that
          share no line (follow the flow), and a cut of capacity k is k lines whose closing separates s from t. So the most routes that share no
          line equals the fewest lines whose closing separates the two. Vertex limits of 1 (lesson 1&rsquo;s split) give the same for routes that
          share no station. CONN-3&rsquo;s bridges are the case of one line.
        </li>
        <li>
          <strong>Choosing projects.</strong> Projects earn money, some need machines that cost money, and a project can only run if its machines
          are bought. The best set of projects is found with one minimum cut: s to each project (its earning), each machine to t (its cost), and
          a line of very large capacity from each project to each machine it needs.
        </li>
        <li>
          <strong>Splitting an image.</strong> To separate an object from its background, each pixel is joined to s by how much it looks like the
          object, to t by how much it looks like background, and to its neighbours by how similar they are. The minimum cut is a good split.
        </li>
        <li>
          <strong>Matching.</strong> Lesson 5: in a bipartite graph, the minimum cut is a smallest set of vertices that touches every edge.
        </li>
      </ul>
      <Note title="The global minimum cut">
        <p>
          The smallest cut over <em>all</em> pairs s, t of an undirected network (how many lines must fail before it falls apart) does not need V
          flow computations. Karger&rsquo;s random contraction and the Stoer-Wagner method find it directly; Karger&rsquo;s method belongs to HARD-5, on randomised algorithms.
        </p>
      </Note>
      <p>
        The cost of finding a minimum cut is the cost of the flow plus one search: <M>O(V · E²)</M> (V times E times E) with Edmonds-Karp,{" "}
        <M>O(V² · E)</M> (V times V times E) with Dinic.
      </p>
    </>
  );
}
