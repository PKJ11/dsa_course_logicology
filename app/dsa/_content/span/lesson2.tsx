import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { KruskalFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        DSUF-5 and GRDY-5 both met Kruskal&rsquo;s method in one sentence: take the edges from cheapest to most expensive, and keep each one that does not
        close a loop. This lesson builds it in full, with its cost and its uses.
      </p>

      <h2 id="method">Cheapest first, skip loops</h2>
      <ol>
        <li>Sort the edges by cost.</li>
        <li>Start with no edges: every vertex is a group on its own.</li>
        <li>
          For each edge u–v in order: if u and v are in different groups, keep the edge and join the two groups. If they are in the same group, the
          kept edges already join them, and this edge would close a loop: skip it.
        </li>
        <li>Stop when V − 1 edges are kept.</li>
      </ol>
      <p>
        Joseph Kruskal published it in 1956. It is greedy (GRDY-1): each step takes the cheapest edge that is still allowed and never takes it back.
        Lesson 4 proves it gives a cheapest tree. Step through the figure; each vertex&rsquo;s tag names its group, and skipped edges are dashed.
      </p>
      <KruskalFigure />
      <Invariant label="Invariant">The kept edges are always part of some cheapest spanning tree.</Invariant>

      <h2 id="dsu">Union-find does the checking</h2>
      <p>
        &ldquo;Are u and v in the same group?&rdquo; and &ldquo;join their groups&rdquo; are exactly the two operations of union-find (DSUF). With
        union by size and path halving, each costs nearly O(1) (DSUF-4).
      </p>
      <CodeBlock
        code={`# find and union are a union-find (DSUF): find(x) names x's group
total = 0
for u, v, w in sorted(edges, key=lambda e: e[2]):   # cheapest first
    if find(u) != find(v):          # different groups: no loop
        union(u, v)
        total += w`}
      />
      <p>
        That loop is the whole method; <Link href="/dsa/span/practice/2/">SPAN-P2</Link> asks you to write it in full, with the union-find, and
        to return the lines kept. DSUF-2 explains why linking the smaller group under the larger keeps finds short, and path halving alone already
        keeps them short in practice. A version without union-find, which relabels every vertex of one group on each
        join, is correct but can cost O(V²), that is V times V steps: on a chain of edges listed in order, each join relabels the whole growing group.{" "}
        <Link href="/dsa/span/practice/2/">SPAN-P2</Link> has that test. Relabelling only the <em>smaller</em> group is O(V log V), because a vertex
        that is relabelled always lands in a group at least twice as big.
      </p>

      <h2 id="cost">What it costs</h2>
      <p>
        Sorting is <M>O(E log E)</M>, which is the same as O(E log V) because E is at most V² (V times V). The union-find work is nearly O(E). So the whole
        method is <M>O(E log V)</M>, and the sort is the slowest part. If the costs are small whole numbers, a counting sort (SORT-6) makes it
        nearly O(E).
      </p>
      <p>
        The <code>key</code> in the code above sorts by cost only. Python&rsquo;s sort is stable (SORT-7), so edges of equal cost stay in list
        order, and which of several cheapest trees you get depends on that order. <code>operator.itemgetter(2)</code> as the key does the same a
        little faster, and storing edges as <code>(w, u, v)</code> lets a plain <code>sort()</code> work.
      </p>

      <h2 id="more">Forests, ties, and clusters</h2>
      <ul>
        <li>
          <strong>Not connected.</strong> If the graph has several parts, Kruskal&rsquo;s method gives a cheapest tree for each, a minimum spanning
          forest, with V − (number of parts) edges. Fewer than V − 1 kept edges means the graph is not connected.
        </li>
        <li>
          <strong>Ties.</strong> When costs repeat, the order among equal edges decides which cheapest tree comes out. All of them cost the same.
          Lesson 4 shows which edges can appear in some cheapest tree.
        </li>
        <li>
          <strong>Clusters.</strong> Stop Kruskal&rsquo;s method when k groups are left. The groups are the best split into k clusters in one exact
          sense: the cheapest edge between two different groups is as expensive as possible. This is single-linkage clustering.
        </li>
        <li>
          <strong>Matroids.</strong> GRDY-5 named the reason greedy works here: sets of edges without a loop form a matroid, and on a matroid
          &ldquo;cheapest allowed item first&rdquo; is always best. Lesson 4 proves it for trees directly.
        </li>
      </ul>
      <Note title="Borůvka’s method">
        <p>
          The oldest method (1926) works in rounds: every group picks its cheapest edge to another group, and all those edges are added at once.
          Each round at least halves the number of groups, so there are at most log₂ V rounds of O(E): O(E log V). The rounds are easy to split
          over many computers, which is why it is popular for very large graphs.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/span/practice/2/">SPAN-P2, The cheapest network</Link>.
      </p>
    </>
  );
}
