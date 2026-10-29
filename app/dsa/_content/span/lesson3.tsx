import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PrimFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Kruskal&rsquo;s method grows many small trees and joins them. Prim&rsquo;s method grows one tree from a starting vertex, adding the cheapest
        edge that leaves it at every step. It looks like Dijkstra&rsquo;s method, and the code is almost the same.
      </p>

      <h2 id="grow">Grow one tree</h2>
      <ol>
        <li>Start with a tree of one vertex, any vertex.</li>
        <li>Look at every edge with one end in the tree and the other end outside it. Take the cheapest, and add it and its outside vertex.</li>
        <li>Repeat until every vertex is in the tree.</li>
      </ol>
      <Invariant label="Invariant">The tree so far is part of some cheapest spanning tree.</Invariant>
      <p>
        Vojtěch Jarník found it in 1930; Robert Prim (1957) and Edsger Dijkstra (1959) found it again. Lesson 4 proves it: the edges leaving the tree
        are exactly the edges crossing the cut between the tree and the rest, and the cheapest edge across any cut is safe to take.
      </p>

      <h2 id="heap">With heapq</h2>
      <p>
        The heap holds candidate vertices with the cost of the cheapest known edge from the tree to them. As in Dijkstra&rsquo;s method (PATH-3),
        an improvement pushes a new entry, and old entries are skipped when they come out (lazy removal, HEAP-4). Step through the figure.
      </p>
      <PrimFigure />
      <CodeBlock
        code={`import heapq

def prim(adj, s=0):              # adj[u]: list of (v, w), both ways
    n = len(adj)
    in_tree = [False] * n
    total, count = 0, 0
    heap = [(0, s)]               # (cost of the edge into v, v)
    while heap and count < n:
        w, u = heapq.heappop(heap)
        if in_tree[u]:
            continue              # an old entry
        in_tree[u] = True
        total += w
        count += 1
        for v, c in adj[u]:
            if not in_tree[v]:
                heapq.heappush(heap, (c, v))
    return total if count == n else None`}
      />
      <p>
        The only change from Dijkstra is the number pushed: Dijkstra pushes <code>d + w</code>, the length of a whole route from the start; Prim
        pushes <code>c</code>, the cost of one edge. Each edge can push one entry, so the cost is <M>O(E log V)</M>, the same as Kruskal. To get
        the edges and not only the total, push <code>(c, v, u)</code> and record u as v&rsquo;s parent when v joins the tree.
      </p>

      <h2 id="dense">Dense graphs: no heap</h2>
      <p>
        When almost every pair of vertices is joined (E close to V², which is V times V), the heap holds up to V² entries and the edges alone take V² memory. A plain list
        does better. Keep <code>best[v]</code>, the cheapest edge from the tree to v. Each step scans all outside vertices for the smallest{" "}
        <code>best</code> (O(V)), adds that vertex, and lowers <code>best</code> for the others using edges to the new vertex (O(V)). In all{" "}
        <M>O(V²)</M> time and O(V) extra memory, and the edges never need to be stored if their costs can be worked out, such as distances between
        points.
      </p>
      <p>
        For V points on a plane, every pair is an edge: about 2 million for 2,000 points. Listing and sorting them for Kruskal costs{" "}
        <M>O(V² log V)</M> time and lots of memory; the list version of Prim costs O(V²) and almost no memory. That is{" "}
        <Link href="/dsa/span/practice/3/">SPAN-P3</Link>.
      </p>
      <Note title="Faster for points">
        <p>
          For points with straight-line distances, a cheapest tree only uses edges of the Delaunay triangulation (a way of joining points into triangles), which has at most 3V − 6
          edges, so it can be found in O(V log V). For Manhattan distances there is a similar method that keeps only the nearest point in each of
          eight directions.
        </p>
      </Note>

      <h2 id="compare">Prim, Kruskal, and Dijkstra</h2>
      <table className="tt">
        <thead>
          <tr>
            <th></th>
            <th>Kruskal</th>
            <th>Prim</th>
            <th>Dijkstra</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>grows</td>
            <td>a forest</td>
            <td>one tree</td>
            <td>one tree</td>
          </tr>
          <tr>
            <td>takes next</td>
            <td>cheapest edge anywhere</td>
            <td>cheapest edge leaving the tree</td>
            <td>nearest vertex from the start</td>
          </tr>
          <tr>
            <td>needs</td>
            <td>sort and union-find</td>
            <td>a heap (or a list)</td>
            <td>a heap (or a list)</td>
          </tr>
          <tr>
            <td>negative costs</td>
            <td>fine</td>
            <td>fine</td>
            <td>wrong</td>
          </tr>
          <tr>
            <td>best for</td>
            <td>sparse, edge list</td>
            <td>dense, or adjacency lists</td>
            <td>shortest routes</td>
          </tr>
        </tbody>
      </table>
      <p>
        A cheapest spanning tree is not a tree of shortest routes. In a triangle with edges A–B 2, B–C 2 and A–C 3, the cheapest tree uses A–B and
        B–C (cost 4), so the route from A to C in the tree takes 4, while the direct edge takes 3. Dijkstra from A keeps A–C. Each tree is the best
        at its own question.
      </p>
      <p>
        Now try <Link href="/dsa/span/practice/3/">SPAN-P3, Connect the points</Link>.
      </p>
    </>
  );
}
