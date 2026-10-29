import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { RulesFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Shortest paths ask how to get one thing from A to B quickly. Network flow asks how <em>much</em> can get from A to B at once, when every
        line has a limit. The question looks narrow, but matching, scheduling, cutting a network in two and many other problems turn out to be flow
        problems in disguise.
      </p>

      <h2 id="network">Capacities, a source and a sink</h2>
      <p>A <strong>flow network</strong> is a directed graph with:</p>
      <ul>
        <li>
          a <strong>capacity</strong> c(u, v) ≥ 0 on each edge u → v: the most that can pass along it per unit of time. In this station the
          edges are railway lines and capacities are trains per hour;
        </li>
        <li>
          a <strong>source</strong> s, where everything starts, and a <strong>sink</strong> t, where everything ends.
        </li>
      </ul>
      <p>
        The figure&rsquo;s network has six stations. Its plates first show the capacities only; from the second step they read{" "}
        <strong>flow/capacity</strong>.
      </p>

      <h2 id="rules">The two rules of a flow</h2>
      <p>A <strong>flow</strong> gives each edge a number f(u, v), how much actually passes, and keeps two rules:</p>
      <Invariant label="Capacity">0 ≤ f(u, v) ≤ c(u, v) on every edge.</Invariant>
      <Invariant label="Conservation">At every vertex other than s and t, the total flow in equals the total flow out.</Invariant>
      <p>
        Conservation says that stations in the middle neither keep trains nor make new ones. Step through the figure: the first variant checks
        both rules on a plan, and the second breaks each rule in turn. The second broken plan is the important one: every number is within its
        capacity, and the plan is still wrong.
      </p>
      <RulesFigure />

      <h2 id="value">The value of a flow</h2>
      <p>
        The <strong>value</strong> of a flow, written |f|, is the total flow out of s minus the total flow into s. The <strong>maximum flow</strong>{" "}
        problem asks for a flow of the largest value.
      </p>
      <Invariant label="Value">The value also equals the total flow into t minus the total flow out of t.</Invariant>
      <p>
        Proof: for each vertex v, take (flow out of v) − (flow into v), and add these numbers up over all vertices. Each edge u → v adds f(u, v)
        once (out of u) and takes it away once (into v), so the sum is 0. Conservation makes the term of every vertex except s and t equal to 0.
        So the term for s plus the term for t is 0: what leaves s is what reaches t. Lesson 4 uses the same sum over a set of vertices, which gives
        the flow across a cut.
      </p>
      <p>
        Checking a proposed flow takes one pass over the edges, keeping a running total of &ldquo;out minus in&rdquo; for each vertex: O(V + E),
        where V is the number of vertices and E the number of edges. That is{" "}
        <Link href="/dsa/flow/practice/1/">FLOW-P1, Is this a flow?</Link>
      </p>

      <h2 id="shapes">Fitting other problems to the shape</h2>
      <p>Real problems often have several sources or sinks, or limits on stations as well as on lines. Small changes to the graph fix that:</p>
      <ul>
        <li>
          <strong>Several sources or sinks.</strong> Add a new source with an edge of very large capacity to each real source, and a new sink with
          such an edge from each real sink. A flow from the new source to the new sink is a flow between the real ones.
        </li>
        <li>
          <strong>A limit on a station.</strong> If a station v can handle at most k trains an hour, split it into v<sub>in</sub> and v
          <sub>out</sub>, send every edge into v to v<sub>in</sub> and every edge out of v from v<sub>out</sub>, and add v<sub>in</sub> → v
          <sub>out</sub> with capacity k.
        </li>
        <li>
          <strong>Two-way lines.</strong> A line that can be used either way, up to c in total, becomes two edges, u → v and v → u, each of capacity
          c. A flow never needs to use both at once: sending a along one and b along the other is the same as sending a − b along one.
        </li>
        <li>
          <strong>Repeated edges.</strong> Two edges from u to v act like one edge with the sum of their capacities, but a program can simply keep
          both.
        </li>
      </ul>
      <Note title="Flow and other problems">
        <p>
          With costs on edges as well as capacities, the question becomes <strong>minimum-cost flow</strong>: send a given amount as cheaply as
          possible. It is solved by sending along cheapest paths in the residual graph of lesson 2, found with Bellman–Ford (PATH-4) or with
          Dijkstra and potentials (PATH-5&rsquo;s reweighting). It is beyond this station, but every idea it uses is here or in PATH. Flow can also be
          written as a linear program (a list of inequalities and an amount to make as large as possible), and the max-flow min-cut theorem of
          lesson 4 is the simplest case of the duality theorem for linear programs.
        </p>
      </Note>
      <p>
        Lesson 2 asks how to find a maximum flow. The obvious idea, sending along any path that still has room, is almost right, and the one thing
        it is missing is the subject of the whole lesson.
      </p>
    </>
  );
}
