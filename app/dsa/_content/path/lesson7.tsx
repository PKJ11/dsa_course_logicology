import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { StarFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        Dijkstra&rsquo;s method spreads out evenly in every direction, even when the target is clearly to the east. A* (say &ldquo;A star&rdquo;)
        adds a guess of the distance still to go, and searches towards the target first, without giving up the guarantee of a shortest route.
      </p>

      <h2 id="goal">Searching towards a goal</h2>
      <p>
        Dijkstra takes the vertex with the smallest g(v), the time from the start so far. A* takes the vertex with the smallest
      </p>
      <Invariant label="Order">f(v) = g(v) + h(v)</Invariant>
      <p>
        where h(v) is a <strong>heuristic</strong>: a guess, worked out from v alone, of the distance from v to the goal. On a map, h(v) can be the
        straight-line distance from v to the goal. f(v) is then a guess of the length of the best route that passes through v. With h = 0 for every
        vertex, A* is Dijkstra.
      </p>
      <p>
        Step through the figure: a grid where each move costs 1, with a wall between the start and the goal. Dijkstra takes 33 squares before it
        reaches the goal; A* takes 18, nearly all of them on the way.
      </p>
      <StarFigure />
      <p>The code is Dijkstra&rsquo;s, with f in the heap and a stop at the goal:</p>
      <CodeBlock
        code={`import heapq
import math

def a_star(adj, s, goal, h):     # adj[u]: list of (v, w), w >= 0
    g = {s: 0}
    heap = [(h(s), s)]
    while heap:
        f, u = heapq.heappop(heap)
        if u == goal:
            return g[u]
        if f > g[u] + h(u):
            continue                # an old entry
        for v, w in adj[u]:
            if g[u] + w < g.get(v, math.inf):
                g[v] = g[u] + w
                heapq.heappush(heap, (g[v] + h(v), v))
    return math.inf`}
      />

      <h2 id="guess">A guess that is never too high</h2>
      <p>Two properties of h decide whether A* is right and how fast it is.</p>
      <ul>
        <li>
          <strong>Admissible:</strong> h(v) is never more than the true distance from v to the goal. The guess may be too low, never too high.
          The straight-line distance is admissible, because no route is shorter than a straight line.
        </li>
        <li>
          <strong>Consistent:</strong> for every edge u → v, h(u) ≤ w(u, v) + h(v). The guess never drops by more than the edge just used. The
          straight-line distance is consistent too (it is the triangle rule of geometry). A consistent h with h(goal) = 0 is always admissible.
        </li>
      </ul>
      <p>
        A larger h, as long as it stays admissible, means fewer vertices looked at: h equal to the true distance would walk straight along a
        shortest route. h = 0 is admissible and gives back Dijkstra. A guess that is sometimes too high can make A* return a route that is not the
        shortest.
      </p>

      <h2 id="proof">Why A* is right</h2>
      <p>
        With a consistent h there is a short proof: A* is Dijkstra on a changed graph. Give every edge the new weight
      </p>
      <Invariant label="Weight">w′(u, v) = w(u, v) − h(u) + h(v)</Invariant>
      <p>
        Consistency says exactly that every w′ is 0 or more, so Dijkstra is correct on the new weights. Along any route from s to v the new weights
        add up to the old length − h(s) + h(v), because the h terms in the middle cancel in pairs. So every route from s to the goal changes by the
        same amount, −h(s) + h(goal), and shortest routes stay shortest. And Dijkstra&rsquo;s order on the new weights is the order of g(v) + h(v)
        − h(s): the order of f, since h(s) is the same for every vertex. This is the reweighting of Johnson&rsquo;s method (lesson 5).
      </p>
      <p>
        So with a consistent h, every vertex is settled once, with its true g, and the goal&rsquo;s g is final when it comes out of the heap. With an
        h that is admissible but not consistent, A* still returns a shortest route if it allows a settled vertex to be lowered and handled again.
        Every vertex taken out has f(v) ≤ δ(s, goal), so A* only looks at vertices that the guess cannot rule out.
      </p>

      <h2 id="grids">Guesses for grids, and ties</h2>
      <ul>
        <li>
          <strong>Four directions,</strong> each move costs 1: the <strong>Manhattan distance</strong> |x − x<sub>goal</sub>| + |y − y<sub>goal</sub>|.
          Each move changes x or y by 1, so it is consistent.
        </li>
        <li>
          <strong>Eight directions,</strong> with diagonal moves costing √2 (the square root of 2, about 1.414): the <strong>octile distance</strong>{" "}
          max(dx, dy) + (√2 − 1) · min(dx, dy), where dx and dy are how far apart the columns and rows are. With all eight moves costing 1, use
          max(dx, dy).
        </li>
        <li>
          <strong>Any direction</strong> on a map: the straight-line distance, <code>math.dist(p, goal)</code>.
        </li>
      </ul>
      <p>
        <strong>Ties.</strong> On an open grid, every square in the rectangle between the start and the goal has the same f: g + h equals the
        Manhattan distance of the whole trip. If ties go to the square with the smaller g, or to the square added first, A* fills that whole
        rectangle, d<sup>2</sup> squares (d times d) for a goal d moves away diagonally. If ties go to the <strong>larger g</strong>, the square
        nearest the goal, A* walks straight there. With <code>heapq</code>, push <code>(f, -g, square)</code>: the minus sign makes the larger g come
        first. <Link href="/dsa/path/practice/7/">PATH-P7</Link> has a test built for this.
      </p>
      <Note title="An endless grid">
        <p>
          When the grid has no edge, the squares cannot be stored in a list. Keep g in a dict (only squares reached so far) and the walls in a set,
          and make each square&rsquo;s neighbours when it is taken out, as GRPH-2 did for word ladders.
        </p>
      </Note>

      <h2 id="limits">Where A* is used</h2>
      <ul>
        <li>
          <strong>Games and robots</strong> find routes on grids and meshes with A*, often with a guess made a little too high on purpose (weighted
          A*, f = g + 1.5 h): routes may be a little longer, but far fewer squares are looked at.
        </li>
        <li>
          <strong>Puzzles.</strong> For the 15-puzzle, the sum over the tiles of each tile&rsquo;s Manhattan distance to its place is admissible. The
          state graph is too big to store; A* builds it as it goes.
        </li>
        <li>
          <strong>Road maps.</strong> Route planners use guesses worked out in advance: landmarks (distances to a few chosen places give lower
          bounds by the triangle rule, the ALT method), and contraction hierarchies, which add shortcut edges so a search touches only a few hundred
          vertices of a continent-sized map.
        </li>
        <li>
          <strong>Memory.</strong> A* keeps every reached vertex. When that is too much, IDA* repeats depth-first searches with a growing limit on f,
          using memory only for the current path.
        </li>
      </ul>
      <p>
        Without a single goal, or without a good guess, A* has nothing to add to Dijkstra. Its worst case is the same, <M>O((V + E) log V)</M>.
        Now try <Link href="/dsa/path/practice/7/">PATH-P7, Across an endless grid</Link>.
      </p>
    </>
  );
}
