import Link from "next/link";
import { Invariant, Note } from "../../_components/Prose";
import { CutFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Kruskal and Prim look different, but one fact makes both of them right. It is called the cut property, and its proof is an exchange
        argument of the kind GRDY-2 taught.
      </p>

      <h2 id="cuts">Cuts and crossing edges</h2>
      <p>
        A <strong>cut</strong> splits the vertices into two non-empty sides, S and the rest. An edge <strong>crosses</strong> the cut when one end is
        in S and the other is not. Every spanning tree has at least one edge across every cut: otherwise nothing would join the two sides.
      </p>
      <Invariant label="Cut">For any cut, a cheapest edge crossing it belongs to some cheapest spanning tree.</Invariant>
      <p>
        Step through the first variant of the figure. Each step picks a side, marks the crossing edges, and takes the cheapest. After six cuts the
        six edges form a cheapest tree.
      </p>
      <CutFigure />

      <h2 id="proof">The exchange proof</h2>
      <p>
        Let e be a cheapest edge crossing the cut, and T a cheapest spanning tree. If T contains e, there is nothing to prove. If not:
      </p>
      <ol>
        <li>Add e to T. In a tree, this closes exactly one loop: e and the tree path between its ends (lesson 1).</li>
        <li>
          e goes from one side of the cut to the other, and the tree path comes back. So the loop crosses the cut at least once more, at some tree
          edge f.
        </li>
        <li>
          Remove f. The loop is broken in one place, so everything stays joined: T − f + e is a spanning tree.
        </li>
        <li>
          f also crosses the cut, and e is a cheapest crossing edge, so w(e) ≤ w(f). The new tree costs w(T) − w(f) + w(e) ≤ w(T). T was cheapest,
          so the new tree is cheapest too, and it contains e.
        </li>
      </ol>
      <p>
        The second variant of the figure steps through this exchange on a tree that is not the cheapest; the swap still never makes it more expensive.
        The proof also works when the cut must avoid edges chosen before: if no chosen edge crosses the cut, f is not one of them, so the new tree
        keeps every chosen edge.
      </p>
      <Note title="The cycle property, again">
        <p>
          Lesson 1&rsquo;s rule is the mirror image: the strictly most expensive edge on a loop is in no cheapest tree. Together the two give a test for a
          whole tree: a spanning tree is cheapest exactly when every edge outside it is at least as expensive as every tree edge on the loop it would
          close. One direction is lesson 1; the other follows by doing the exchange above again and again.
        </p>
      </Note>

      <h2 id="both">Why Kruskal and Prim are right</h2>
      <p>
        Both keep the invariant &ldquo;the chosen edges are part of some cheapest tree&rdquo;, and each step uses the cut property with a well-chosen
        cut that no chosen edge crosses.
      </p>
      <ul>
        <li>
          <strong>Prim.</strong> The cut is the tree so far against everything else. No tree edge crosses it, and Prim takes the cheapest edge that
          leaves the tree, which is the cheapest crossing edge.
        </li>
        <li>
          <strong>Kruskal.</strong> When Kruskal keeps u–v, take the cut between u&rsquo;s group and everything else. No kept edge crosses it, because
          groups are joined only by kept edges. Every cheaper edge was looked at earlier and either kept or skipped; a skipped edge lies inside one
          group. So no cheaper edge crosses this cut, and u–v is a cheapest crossing edge.
        </li>
      </ul>
      <p>
        By induction the V − 1 chosen edges are part of some cheapest spanning tree, and a spanning tree has exactly V − 1 edges, so they{" "}
        <em>are</em> a cheapest spanning tree. The proofs only compare costs with each other, which is why only the order of the costs matters and
        negative costs are fine.
      </p>

      <h2 id="ties">Ties, and which edges can appear</h2>
      <ul>
        <li>
          <strong>All costs different.</strong> Then the cheapest tree is unique. If two cheapest trees T and T′ differed, take the cheapest edge e
          that is in one but not the other, say in T. Adding e to T′ closes a loop, and that loop has an edge f not in T (T has no loop). f is
          more expensive than e, because e was the cheapest edge in just one tree and costs are all different. Swapping f for e makes T′ cheaper, which is
          impossible.
        </li>
        <li>
          <strong>Which edges can appear.</strong> An edge u–v of cost w is in <em>some</em> cheapest tree exactly when u and v are not already
          joined by edges that all cost less than w. If they are joined that way, the edge is strictly the most expensive on a loop (cycle property). If
          they are not, the cut between &ldquo;everything joined to u by cheaper edges&rdquo; and the rest has u–v as a cheapest crossing edge (cut
          property). Kruskal&rsquo;s method, run one cost at a time, answers this for every edge at once:{" "}
          <Link href="/dsa/span/practice/4/">SPAN-P4</Link>.
        </li>
        <li>
          <strong>Edges in every cheapest tree.</strong> An edge is in all of them when, among the edges of the same cost, removing it would
          disconnect the groups formed by cheaper edges: it is a bridge in that graph. Finding bridges is CONN-3.
        </li>
        <li>
          <strong>The same sorted order.</strong> Every cheapest tree has the same list of costs when sorted. So any question about the costs (the
          most expensive edge in the tree, the sum of the k cheapest) has the same answer for every cheapest tree.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/span/practice/4/">SPAN-P4, Lines in some cheapest tree</Link>.
      </p>
    </>
  );
}
