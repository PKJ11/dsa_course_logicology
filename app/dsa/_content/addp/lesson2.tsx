import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DagFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        GRPH-5 counted the longest chain of tasks in a DAG, and PATH-6 found shortest routes in one. Both were the same move: go through the
        vertices in topological order, and settle each one from the edges that come into it. This lesson does that move in general, and shows
        that every dynamic program is this move on some DAG, even when the DAG is not drawn.
      </p>

      <h2 id="every">Every DP is a DAG</h2>
      <p>
        Recall the five steps of DYNP-1: a state, a rule, base cases, an order and the answer. Draw each state as a vertex, and draw an edge
        u → v when the rule for v reads the answer of u. The result is a directed graph. It has no cycle, because a cycle would mean a state
        waiting for itself: the rule would never finish. So it is a <strong>DAG</strong> (a directed acyclic graph, GRPH-5).
      </p>
      <ul>
        <li>Fewest coins: vertex x for each amount, an edge x − c → x for each coin c.</li>
        <li>LCS (DYNP-7): vertex (i, j) for each pair of prefixes, edges from (i − 1, j), (i, j − 1) and (i − 1, j − 1).</li>
        <li>Joining piles (lesson 3): vertex (i, j) for each stretch, edges from every shorter stretch inside it.</li>
      </ul>
      <p>
        Any order of filling that puts every edge forward is a topological order of this DAG. A table loop is one such order, written down in
        advance. Memoisation (DYNP-2) finds one as it goes: a depth-first search from the answer, where a state is finished only after all the
        states it reads. Many “best” DPs are a <strong>shortest or longest route</strong> in their DAG, and many counting DPs count{" "}
        <strong>routes</strong> in it.
      </p>

      <h2 id="pass">One pass in topological order</h2>
      <p>
        When the DAG is given as a graph, put its vertices in topological order (Kahn’s method or a DFS, GRPH-5) and settle them in that order.
        Every edge goes forward, so when v’s turn comes, every vertex with an edge into v is already settled.
      </p>
      <Invariant label="Order">When v is settled, every u with an edge u → v has its final answer.</Invariant>
      <ul>
        <li>
          <strong>Counting routes</strong> from s: <code>routes(s) = 1</code>, and <code>routes(v)</code> adds <code>routes(u)</code> over the
          edges u → v. Two routes that arrive by different last edges are different routes, and a route that arrives by u → v is a route to u
          plus that edge. So the sum counts each route exactly once.
        </li>
        <li>
          <strong>The best route</strong>: <code>best(s) = 0</code>, and <code>best(v)</code> is the largest <code>best(u) + value(u → v)</code>.
          The part of a best route up to u must itself be best: if a better route to u existed, it could replace that part (the cut-and-paste
          argument of DYNP-1).
        </li>
      </ul>
      <p>
        Step through both. The best route is a longest route, which is NP-hard in a general graph (PATH-1). In a DAG no route can return to a
        vertex, so the argument above holds and one pass is enough.
      </p>
      <DagFigure />

      <h2 id="code">The code</h2>
      <CodeBlock
        title="dag_best.py"
        code={`def best_route(n, edges, s, t):
    out = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        out[u].append((v, w))
        indeg[v] += 1
    order = [v for v in range(n) if indeg[v] == 0]
    for u in order:                       # Kahn's method (GRPH-5)
        for v, w in out[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                order.append(v)
    NONE = float("-inf")
    best = [NONE] * n
    best[s] = 0
    for u in order:                       # every edge goes forward
        if best[u] == NONE:
            continue                      # not reachable from s
        for v, w in out[u]:
            best[v] = max(best[v], best[u] + w)
    return best[t]                        # -inf: no route at all`}
      />
      <p>
        Each vertex and each edge is handled once in each loop: <M>O(V + E)</M>. Values may be negative here; a DAG has no cycle to go round, so
        negative values cause no trouble. For counting, replace <code>max</code> with a sum, start from <code>1</code> instead of 0, and take
        the count modulo a prime when it can grow huge (MATH-2): the number of routes can double with every pair of vertices added.
      </p>
      <Note title="Pushing or pulling">
        <p>
          The code <em>pushes</em>: each settled u offers its value along its edges. The figure <em>pulls</em>: each v reads its incoming edges.
          Both give the same answers in the same order (DYNP-3). Pushing needs only the outgoing lists, which is what a graph usually gives you.
        </p>
      </Note>

      <h2 id="disguise">DAGs in disguise</h2>
      <ul>
        <li>
          <strong>Nesting.</strong> Boxes that fit inside each other (DYNP-P6): an edge from a box to every larger box makes a DAG, and the longest
          nesting is its longest route. Sorting the boxes by size gives a topological order, so no search for an order is needed.
        </li>
        <li>
          <strong>Timetables.</strong> Vertices are (station, time) pairs and every edge moves forward in time (PATH-6). Time itself is the order.
        </li>
        <li>
          <strong>Games.</strong> In a game where every move makes progress (fewer stones, a smaller number), positions form a DAG. A position is
          a win if some move leads to a loss for the other player, and a loss if every move leads to a win. Settle positions from the end of the
          game backwards.
        </li>
        <li>
          <strong>Projects.</strong> The critical path of GRPH-5 and PATH-6 is the longest route when each task’s duration is added.
        </li>
      </ul>

      <h2 id="cycles">When the graph has cycles</h2>
      <p>
        A graph with cycles has no topological order, and a rule like “best of the vertices before me” can go round a cycle forever. Often the
        cycles can be removed first. CONN-1 groups the vertices that reach each other both ways, and shows that the groups form a DAG. When
        anything reachable inside a group can be collected once you are in the group (a value at each vertex that may be passed many times),
        treat each group as one vertex worth the total of its members, and run the DAG pass on the groups. Kosaraju’s method (CONN-2) even
        finds the groups in topological order.
      </p>
      <p>
        This works because inside a group you can walk to every member and come back out by the way you came in; once you leave a group, no
        route returns to it. The practice problem is exactly this. When a cycle would change the answer each time round (a profit for going
        round), there is no best answer at all, as with negative cycles in PATH-4.
      </p>
      <p>
        Now try <Link href="/dsa/addp/practice/2/">ADDP-P2, The most parcels collected</Link>.
      </p>
    </>
  );
}
