import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BfsFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        How many changes of train from here to there? Who are the friends of my friends? These questions ask for the fewest edges between two
        vertices. Breadth-first search answers them for every vertex at once, in time that grows only with the size of the graph.
      </p>

      <h2 id="layers">Layer by layer</h2>
      <p>
        TREE-2 visited a tree level by level with a queue (STAQ-3): take a node from the front, add its children to the back. Breadth-first
        search (BFS) does the same on a graph, with one addition. In a graph a vertex can be reached along more than one path, and a path can
        come back to where it started. So each vertex gets a mark the first time it is reached, and a marked vertex is never added again.
      </p>
      <CodeBlock
        code={`from collections import deque

def bfs(adj, s):
    dist = [-1] * len(adj)      # -1: not reached
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:   # first time v is reached
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`}
      />
      <p>
        Here <code>dist</code> is both the answer and the mark. The search spreads out in layers: first the start, then everything 1 edge away,
        then everything 2 edges away, and so on. Step through the figure; the tags are the distances.
      </p>
      <BfsFigure />
      <Note title="Mark when added, not when taken out">
        <p>
          If a vertex is marked only when it is taken from the queue, it can be added many times before that: once by each neighbour that reaches
          it first. The answer is still right, but the queue can grow to E entries instead of V, and each copy is handled again. Mark a vertex as
          soon as it is added.
        </p>
      </Note>

      <h2 id="proof">Why the distances are right</h2>
      <p>
        The claim: when BFS ends, <code>dist[v]</code> is the fewest edges on any path from s to v. Two facts give it.
      </p>
      <Invariant label="Queue">The queue holds distances d, …, d, d + 1, …, d + 1, in that order.</Invariant>
      <p>
        At the start the queue holds only s, at distance 0. Each step takes a vertex of distance d from the front and adds vertices of distance d
        + 1 at the back, so the queue keeps this shape. It follows that vertices are taken out in order of their distance: all the 0s, then all
        the 1s, then all the 2s.
      </p>
      <p>
        Now the claim, for each true distance k in turn. A label is never too small: a label j is given only along a real path of j edges, so j is
        at least the true distance. For k = 0 the only vertex is s, labelled 0. Take a vertex v whose true distance is k ≥ 1, and assume every
        vertex closer to s is labelled correctly. On a shortest path to v, the vertex u just before v has true distance k − 1, so u is labelled k −
        1. When u is taken out, either v has no label yet and gets k, or v was labelled already, by a vertex taken out before u. Such a vertex has
        a label of at most k − 1, so v&rsquo;s label is at most k. It is never too small, so it is exactly k.
      </p>

      <h2 id="route">Getting the route back</h2>
      <p>
        Distances say how far, not which way. To get a route, record for each vertex the vertex that first reached it, its{" "}
        <strong>parent</strong>. The edges from parents to children form a tree (the <strong>BFS tree</strong>, shaded in the figure), and the
        path in that tree from s to any vertex is a shortest path. To list it, start at the target and follow the parents back to s, then turn
        the list round. The walk takes at most V steps. A vertex never reached has no parent: there is no route to it.
      </p>
      <p>
        When there are several shortest routes, which one BFS returns depends on the order of the neighbours in the lists. Any of them is
        correct.
      </p>

      <h2 id="cost">What it costs</h2>
      <p>
        Each vertex is added to the queue at most once, because it is marked when added. Each vertex taken out reads its adjacency list once.
        The lists hold 2E entries in an undirected graph (E in a directed one), so the total is <M>O(V + E)</M> time and <M>O(V)</M> extra
        memory. With an adjacency matrix, reading a vertex&rsquo;s neighbours costs O(V), so BFS costs <M>O(V²)</M>.
      </p>
      <Note title="list.pop(0) is not a queue" warn>
        <p>
          A Python list removes its first item by moving every other item one place left: O(n) per removal. When the queue holds many vertices at
          once, that makes BFS O(V²). <code>collections.deque</code> removes from either end in O(1). Another way is a plain list with a read
          position <code>head</code> that only moves forward.
        </p>
      </Note>

      <h2 id="uses">Several starts, and other uses</h2>
      <ul>
        <li>
          <strong>Several starts.</strong> To find each vertex&rsquo;s distance to the <em>nearest</em> of several starts (the nearest
          hospital, the nearest exit), put all starts in the queue at distance 0 before the loop begins. The proof above still works, and it costs
          one search, not one per start. The figure&rsquo;s second variant shows it.
        </li>
        <li>
          <strong>Parts of a graph.</strong> Vertices left at −1 cannot be reached. Starting a new search from each such vertex finds the
          connected parts of an undirected graph (DSUF-5 does the same with union-find).
        </li>
        <li>
          <strong>Graphs that are never built.</strong> In a word ladder (change one letter at a time, from COLD to WARM), each word is a vertex
          and its neighbours are the words one letter different. The neighbours can be made when a word is taken out, so the graph is never
          stored. Puzzle states (the positions of a sliding puzzle) work the same way. Lesson 7 uses this idea.
        </li>
        <li>
          <strong>Searching from both ends.</strong> If each vertex has about b neighbours and the target is d edges away, BFS looks at about{" "}
          <M>bᵈ</M> vertices (b to the power d). Searching from both ends at once and stopping when the two searches meet looks at about 2
          · b<sup>d/2</sup> (two searches of half the depth), far fewer: for b = 10 and d = 6, two thousand instead of a million.
        </li>
        <li>
          <strong>Edges with lengths.</strong> BFS counts edges. When edges have different lengths, the fewest edges may not be the shortest
          route. PATH-2 handles lengths 0 and 1 with a deque, and PATH-3 (Dijkstra) handles any lengths that are not negative.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/grph/practice/2/">GRPH-P2, A shortest route</Link>.
      </p>
    </>
  );
}
