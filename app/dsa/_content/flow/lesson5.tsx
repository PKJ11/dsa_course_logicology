import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MatchFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Drivers and routes, students and projects, tasks and machines: pairing two kinds of things, when only some pairs are allowed, is the
        bipartite matching problem. It is a flow problem with every capacity 1, and its own form of augmenting path leads to a method that is
        faster than general flow.
      </p>

      <h2 id="match">Pairs with no repeats</h2>
      <p>
        A <strong>bipartite graph</strong> (GRPH-6) has two sides, here left (drivers) and right (routes), and every edge joins a left vertex to a
        right vertex. A <strong>matching</strong> is a set of edges with no vertex used twice. A <strong>maximum matching</strong> has as many
        edges as possible; when it uses every vertex on both sides it is <strong>perfect</strong>.
      </p>
      <p>
        Choosing greedily can go wrong: if driver 1 takes route A first, driver 2, who can only take A, is left out, unless driver 1 moves to B.
        The rest of the lesson is about making such moves in the right way.
      </p>

      <h2 id="flow">Matching as a flow</h2>
      <p>
        Add a source s with an edge of capacity 1 to every left vertex, a sink t with an edge of capacity 1 from every right vertex, and direct each
        allowed pair from left to right with capacity 1.
      </p>
      <Invariant label="Same size">The largest matching has as many edges as the maximum flow of this network.</Invariant>
      <p>
        A matching of k edges gives a flow of value k: send 1 along s → u → v → t for each matched pair. The other way: lesson 2 showed that a
        maximum flow can be chosen with whole numbers, so every edge carries 0 or 1. Each left vertex receives at most 1 from s, so it sends 1
        along at most one pair, and each right vertex passes on at most 1 to t, so it receives along at most one pair. The pairs carrying 1 are a
        matching of size |f|.
      </p>

      <h2 id="augment">Augmenting paths</h2>
      <p>
        In this network, an augmenting path from s goes to a free left vertex, then alternates: an unmatched edge to the right, a matched edge back
        to the left (a back arc), and so on, until it reaches a free right vertex and t. Without s and t, it is an{" "}
        <strong>augmenting path</strong> for the matching: a path between two free vertices whose edges are, in turn, not in the matching and in
        it. <strong>Flipping</strong> it (matched edges become unmatched and the other way round) gives one more pair.
      </p>
      <Invariant label="Berge">A matching is maximum exactly when it has no augmenting path.</Invariant>
      <p>
        One direction is the flip. For the other, suppose a matching M is not maximum and M′ is larger. Take the edges in exactly one of M and M′.
        Each vertex touches at most one edge of each, so these edges form paths and loops whose edges alternate between M and M′. A loop has as
        many of each. M′ has more edges in total, so some path has more M′ edges than M edges: it starts and ends with an M′ edge, at vertices that
        M leaves free. That path is an augmenting path for M.
      </p>
      <p>
        The simple method looks for an augmenting path from each left vertex in turn, by a depth-first search that goes right along any edge, and
        left along the matched edge of the route it reached. Step through the figure&rsquo;s first variant.
      </p>
      <MatchFigure />
      <p>
        Each search costs <M>O(V + E)</M> and there are at most V searches: <M>O(V · E)</M>. A vertex that is free after its own search stays free
        (the proof uses Berge again), so one pass over the left side is enough. Starting with a greedy matching first saves most of the searches on
        sparse graphs.
      </p>

      <h2 id="hk">Hopcroft-Karp</h2>
      <p>
        Hopcroft and Karp (1973) applied Dinic&rsquo;s idea to matching. Each phase:
      </p>
      <ol>
        <li>
          Run one BFS from <em>all</em> free left vertices at once, moving right along unmatched edges and left along matched ones. Stop at the
          layer where a free right vertex is first seen. This gives the length of the shortest augmenting paths.
        </li>
        <li>
          Find a largest set of shortest augmenting paths that share no vertex, by depth-first searches that only move one layer down, each from a
          free left vertex. A vertex that leads nowhere is given no layer for the rest of the phase. Flip every path found.
        </li>
      </ol>
      <p>
        Each phase costs <M>O(E)</M>. The shortest augmenting path gets longer after each phase. After √V phases (√V is the square root of V) the
        paths are longer than √V; the M′ argument above then shows that at most about √V more augmenting paths remain, each needing at least one
        phase. So there are about 2√V phases and the whole method costs <M>O(E · √V)</M>.
      </p>
      <CodeBlock
        code={`# one phase: dist[] from a BFS of all free left vertices
for root in free left vertices:
    path = [root]
    while path:
        u = path[-1]
        if ptr[u] == len(adj[u]):
            dist[u] = INF; path.pop(); continue   # a dead end
        v = adj[u][ptr[u]]; ptr[u] += 1
        w = mate_r[v]
        if w == -1:
            flip the path ending with route v; break
        if dist[w] == dist[u] + 1:
            path.append(w)`}
      />
      <p>
        On a sparse random graph the simple method with a greedy start is quick, because most augmenting paths are short. When nearly every vertex
        can be matched, late augmenting paths become long and the simple method slows down; FLOW-P5&rsquo;s last test (30,000 drivers and 90,000
        pairs) takes about 9 seconds that way in CPython and about half a second with Hopcroft-Karp. Now try{" "}
        <Link href="/dsa/flow/practice/5/">FLOW-P5, Workers and jobs</Link>.
      </p>

      <h2 id="konig">König&rsquo;s theorem</h2>
      <p>
        A <strong>vertex cover</strong> is a set of vertices that touches every edge. Every matching edge needs its own cover vertex (no vertex is
        in two matching edges), so any cover is at least as large as any matching.
      </p>
      <Invariant label="König">In a bipartite graph, the largest matching and the smallest vertex cover have the same size.</Invariant>
      <p>
        Take a maximum matching. Let Z be every vertex reachable from a free left vertex by an alternating path (unmatched edge right, matched edge
        left). The cover is: the left vertices <em>not</em> in Z, and the right vertices in Z. Step through the figure&rsquo;s second variant.
      </p>
      <ul>
        <li>
          <strong>It touches every edge.</strong> An edge from a left vertex in Z leads to a right vertex the search reached, which is in the
          cover. An edge from a left vertex not in Z is covered by that left vertex.
        </li>
        <li>
          <strong>It has one vertex per matched edge.</strong> Every right vertex in Z is matched (otherwise the path to it would be augmenting),
          and its partner is in Z too, so that matched edge has exactly one cover vertex, on the right. Every left vertex not in Z is matched
          (free left vertices are in Z), and its partner is not in Z, so again one cover vertex, on the left. Free vertices are never in the cover.
        </li>
      </ul>
      <p>
        In flow terms, this cover is the minimum cut of lesson 4: Z is the side the source reaches. In graphs that are not bipartite, finding a
        smallest vertex cover is NP-hard (HARD-1), while a maximum matching can still be found in polynomial time with Edmonds&rsquo;s blossom
        method.
      </p>
      <Note title="Hall’s theorem, and costs">
        <p>
          Hall&rsquo;s theorem says every left vertex can be matched exactly when every set of k left vertices has at least k neighbours in total.
          It follows from König. When pairs have costs and the cheapest perfect matching is wanted, the problem is called the assignment problem;
          the Hungarian method solves it in <M>O(V³)</M> (V times V times V), and it is a minimum-cost flow (lesson 1&rsquo;s note).
        </p>
      </Note>
    </>
  );
}
