import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FordFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Ford and Fulkerson&rsquo;s method (1956) builds a maximum flow one path at a time. Its key idea is that a later path may undo part of an
        earlier one. The graph that makes this possible, the residual graph, is used by every method in this station.
      </p>

      <h2 id="greedy">Sending along paths gets stuck</h2>
      <p>
        The simple idea: find a path from s to t on which every edge has room left, send as much as the fullest edge allows, and repeat until no
        such path exists. Step through the first variant of the figure. After one unlucky path, s → A → B → t, nothing more can be sent, although
        the best flow is twice as large.
      </p>
      <FordFigure />
      <p>
        The first path used the middle line A → B, and the simple idea has no way to take that back. The fix is to allow a path to send flow
        &ldquo;backwards&rdquo; along a line, which means reducing the flow already on it.
      </p>

      <h2 id="residual">The residual graph</h2>
      <p>
        For a flow f, the <strong>residual graph</strong> has the same vertices and, for each edge u → v of the network, up to two arcs:
      </p>
      <ul>
        <li>
          u → v with <strong>residual capacity</strong> c(u, v) − f(u, v): how much more can be sent forward;
        </li>
        <li>v → u with residual capacity f(u, v): how much of the flow already on the edge can be sent back, that is, taken off.</li>
      </ul>
      <p>
        Arcs with residual capacity 0 are left out. An <strong>augmenting path</strong> is a path from s to t in the residual graph. Its{" "}
        <strong>bottleneck</strong> is the smallest residual capacity on it. Step through the second variant of the figure: the second augmenting
        path uses the back arc B → A, which takes the train off A → B and sends it on from A to t.
      </p>
      <Invariant label="Augment">Sending the bottleneck along an augmenting path gives a new flow whose value is larger by the bottleneck.</Invariant>
      <p>
        Why it is still a flow: on a forward arc, the flow goes up by at most the room left; on a back arc, it goes down by at most the flow there.
        So the capacity rule holds. At each vertex inside the path, one unit of the path comes in and one goes out. Whether those arcs are forward
        or back, the vertex&rsquo;s in and out change by the same amount, so conservation holds. Only s gains: the first arc leaves s, so the value
        goes up by the bottleneck.
      </p>

      <h2 id="method">The method</h2>
      <ol>
        <li>Start with the flow 0 on every edge.</li>
        <li>While the residual graph has a path from s to t, send its bottleneck along it.</li>
        <li>When no path is left, the flow is maximum.</li>
      </ol>
      <p>
        Step 3 is a theorem, not an obvious fact: perhaps a flow with no augmenting path could still be improved by some larger rearrangement.
        Lesson 4 proves that it cannot, using cuts. The method does not say how to find the path; any search works (BFS or DFS, GRPH-2 and 3).
        Lesson 3 shows that the choice matters a great deal for speed.
      </p>

      <h2 id="code">Arcs in pairs</h2>
      <p>
        Programs keep the residual graph directly, as a list of arcs. Each edge i becomes arc 2i (forward, holding c − f) and arc 2i + 1 (back,
        holding f). The partner of arc e is <code>e ^ 1</code>, which flips the lowest bit (BITS-2), so sending along an arc and updating its
        partner is two lines.
      </p>
      <CodeBlock
        code={`to, cap, adj = [], [], [[] for _ in range(n)]
for u, v, c in edges:
    adj[u].append(len(to)); to.append(v); cap.append(c)  # 2i
    adj[v].append(len(to)); to.append(u); cap.append(0)  # 2i + 1

# after finding a path as a list of arcs, with bottleneck push:
for e in path:
    cap[e] -= push          # less room forward
    cap[e ^ 1] += push      # more that can be sent back

# at the end, the flow on edge i is cap[2 * i + 1]`}
      />
      <p>
        The flow is never stored separately: it is what the back arcs hold. A search for a path looks only at arcs with <code>cap[e] &gt; 0</code>{" "}
        and remembers the arc that reached each vertex, so the path can be read back from t. Now try{" "}
        <Link href="/dsa/flow/practice/2/">FLOW-P2, The most trains</Link>.
      </p>

      <h2 id="cost">How long it can take</h2>
      <p>
        With whole-number capacities, every bottleneck is a whole number of at least 1, so each round raises the value by at least 1. If the
        maximum value is F, there are at most F rounds, and each round is one search, <M>O(V + E)</M>. So Ford-Fulkerson takes{" "}
        <M>O(E · F)</M> time (the E covers the V, since a network where every vertex matters has E ≥ V − 1).
      </p>
      <Invariant label="Whole numbers">With whole-number capacities there is a maximum flow in which every edge carries a whole number.</Invariant>
      <p>
        The method itself proves this: it starts at 0, and adding or taking off whole-number bottlenecks keeps every flow a whole number. This fact
        is what makes flow useful for matching (lesson 5): a flow of 0s and 1s is a set of chosen edges.
      </p>
      <p>
        But F can be huge compared with the network. The figure&rsquo;s third variant has four lines of capacity 1,000 and one of capacity 1. A
        method that keeps picking paths through the middle line sends 1 per round, back and forth, and needs 2,000 rounds where 2 are enough. With
        capacities of 10⁹ (a thousand million) it would need two thousand million.
      </p>
      <Note title="Capacities that are not whole numbers">
        <p>
          With capacities that are irrational numbers (such as √2), badly chosen paths can send smaller and smaller amounts forever, and the flow
          can even approach a value below the maximum. Programs work with whole numbers or fractions, so this cannot happen in practice, but it
          shows that the choice of path is not a detail. The next lesson removes the dependence on capacities altogether.
        </p>
      </Note>
    </>
  );
}
