import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { TreeFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A railway wants to join every town for the least money. It does not need the fastest routes (that was PATH); it needs every town
        reachable, and nothing paid for twice. The answer is a tree, and the cheapest such tree has properties that make it easy to find.
      </p>

      <h2 id="trees">Joining everything with no loops</h2>
      <p>
        Take a connected, undirected graph with a cost on every edge. A <strong>spanning tree</strong> is a set of its edges that joins every
        vertex to every other (it <em>spans</em> the graph) and has no loop (it is a <em>tree</em>). A loop would be waste: drop any edge of a loop
        and everything stays joined, so a cheapest network never has one, as long as costs are not negative.
      </p>
      <p>Step through the first variant of the figure: too few edges leave a vertex out, too many make a loop, and the right number makes a tree.</p>
      <TreeFigure />

      <h2 id="facts">Three facts about trees</h2>
      <p>For a graph of V vertices, any two of these three facts about a set of edges give the third:</p>
      <ol>
        <li>it joins every vertex (connected);</li>
        <li>it has no loop;</li>
        <li>it has exactly V − 1 edges.</li>
      </ol>
      <p>
        The reason: start with V vertices and no edges, so V separate parts. Adding an edge either joins two parts (the number of parts drops by
        one) or lands inside one part (it closes a loop). With no loop, every edge joins two parts, so after k edges there are V − k parts, and one
        part needs exactly V − 1 edges. This is the counting union-find did in DSUF-5: each successful <code>union</code> is one fewer group.
      </p>
      <p>Two more facts follow, and both are used all through this station:</p>
      <ul>
        <li>
          <strong>One path.</strong> In a tree there is exactly one path between any two vertices. Two different paths would make a loop.
        </li>
        <li>
          <strong>One loop per new edge.</strong> Adding one edge u–v to a spanning tree closes exactly one loop: the tree path from u to v, plus the
          new edge. Removing any edge of that loop gives a spanning tree again.
        </li>
      </ul>
      <Note title="How many spanning trees?">
        <p>
          A graph usually has very many. When every pair of the V vertices is joined, there are V<sup>V−2</sup> spanning trees (V − 2 copies of V
          multiplied together; Cayley&rsquo;s formula): 16,807 for 7 vertices. Trying them all is hopeless, which is why the methods of this station
          matter. Kirchhoff&rsquo;s matrix-tree theorem counts the spanning trees of any graph with one determinant.
        </p>
      </Note>

      <h2 id="cheapest">The cheapest spanning tree</h2>
      <p>
        The <strong>cost</strong> of a spanning tree is the sum of its edges&rsquo; costs. A <strong>minimum spanning tree</strong> (MST) is a
        spanning tree whose cost is as small as possible. There can be several, all with the same cost, when some edges cost the same; when every
        cost is different, there is exactly one (lesson 4).
      </p>
      <p>
        If the graph is not connected, no spanning tree exists. The best one can do is a cheapest tree for each connected part: a{" "}
        <strong>minimum spanning forest</strong>. Every method in this station gives it with no change.
      </p>
      <p>
        Negative costs change nothing: only the <em>order</em> of the costs matters (lesson 4 proves this), so adding the same number to every cost
        gives the same cheapest trees. Compare shortest routes, where adding a number to every cost changes the answer (PATH-3).
      </p>

      <h2 id="cycle">The cycle property</h2>
      <Invariant label="Rule">If an edge is strictly the most expensive on some loop, no cheapest spanning tree contains it.</Invariant>
      <p>
        Suppose a spanning tree T contains such an edge f, the most expensive on a loop C. Remove f from T: the tree splits into two parts. The rest of
        the loop C still joins the two ends of f, so some other edge g of C joins the two parts. Add g: a spanning tree again, and it costs w(g) −
        w(f) less than T, which is below 0 because f is strictly more expensive. So T was not a cheapest tree.
      </p>
      <p>
        The second variant of the figure uses this in the other direction. Start from any spanning tree. Add an edge that is not in the tree: it
        closes one loop. If the most expensive edge of that loop is a tree edge, swap it out; the tree gets cheaper. When no outside edge can make a swap
        like this, every outside edge is the most expensive on its loop. Lesson 4 shows that such a tree is a cheapest one. Making one swap for one new
        edge is <Link href="/dsa/span/practice/1/">SPAN-P1</Link>.
      </p>
      <Note title="Swapping is slow as a method">
        <p>
          Improving a tree one swap at a time does reach a cheapest tree, but there can be many swaps, and each needs a search for the loop. Kruskal
          and Prim (lessons 2 and 3) build a cheapest tree directly in <M>O(E log V)</M>.
        </p>
      </Note>

      <h2 id="uses">Where spanning trees appear</h2>
      <ul>
        <li>
          <strong>Networks.</strong> Joining towns by roads or rails, buildings by cables, chips on a board by wires, for the least total length.
          Otakar Borůvka worked out the first method in 1926 for the electricity network of Moravia.
        </li>
        <li>
          <strong>Network switches</strong> run the spanning tree protocol, so that copies of a message never go round a loop of cables forever.
        </li>
        <li>
          <strong>Clusters.</strong> Building a cheapest tree and then removing its k − 1 most expensive edges splits the points into k groups that are as
          far apart as possible (lesson 2).
        </li>
        <li>
          <strong>Approximation.</strong> A cheapest spanning tree is the starting point of a classic method that finds a round trip through all
          cities at most twice the shortest (HARD-4).
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/span/practice/1/">SPAN-P1, A cheaper line</Link>.
      </p>
    </>
  );
}
