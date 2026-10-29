import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ZeroOneFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Some graphs have only two kinds of edge: ones that cost nothing and ones that cost 1. A wall you walk past or a wall you break; a line you
        ride along or a line you must reverse. For these, a small change to breadth-first search gives the right answer at the same speed.
      </p>

      <h2 id="costs">Costs of 0 and 1</h2>
      <p>
        Breadth-first search works because its queue always holds vertices of distance d, then vertices of distance d + 1, in that order (GRPH-2&rsquo;s
        proof). Every edge adds exactly 1, so new vertices always belong at the back.
      </p>
      <p>
        With an edge of cost 0, a vertex reached along it has the <em>same</em> distance as the vertex it came from. Putting it at the back breaks
        the order: vertices of distance d + 1 would be taken out before it. Step through &ldquo;Plain BFS&rdquo; in the figure: B is first reached
        by an edge of cost 1 and keeps that, although A → C → B costs 0 + 0.
      </p>

      <h2 id="deque">The front and the back</h2>
      <p>
        The fix is a <strong>deque</strong> (STAQ-3, <code>collections.deque</code>), a queue that can add at both ends in O(1). A vertex reached by a
        cost-0 edge goes to the <strong>front</strong>, because it has the same distance as the vertex being handled. A vertex reached by a cost-1
        edge goes to the <strong>back</strong>. And, as in Dijkstra&rsquo;s method, a vertex is updated whenever a cheaper way to it is found, not
        only the first time it is reached.
      </p>
      <CodeBlock
        code={`from collections import deque
import math

def zero_one_bfs(adj, s):         # adj[u]: list of (v, w), w is 0 or 1
    dist = [math.inf] * len(adj)
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    q.appendleft(v)
                else:
                    q.append(v)
    return dist`}
      />
      <ZeroOneFigure />
      <p>
        A vertex can be in the deque twice: once from a cost-1 edge, and again, with a smaller value, from a cost-0 edge found later. When the
        older entry comes out, the vertex&rsquo;s value is already smaller than the entry says; the figure hatches such entries and skips them. The
        code above does not need to skip them: handling the vertex again relaxes its edges with the same value as before, and nothing changes.
        Skipping saves the work, and the figure stores the value with each entry to show it.
      </p>

      <h2 id="proof">Why the order is right</h2>
      <Invariant label="Deque">The deque holds values d, …, d, d + 1, …, d + 1, front to back.</Invariant>
      <p>
        At the start it holds only s, with 0. Taking a vertex of value d from the front and adding a vertex of value d at the front, or d + 1 at
        the back, keeps the shape. So vertices come out in order of their value, as in Dijkstra&rsquo;s method with a heap; the deque is a heap
        that only ever has two different values in it. When a vertex comes out with value d, no vertex with a smaller value is left, and edges
        cost at least 0, so nothing can lower it later: its value is final. Lesson 3 proves the same thing for Dijkstra in detail.
      </p>
      <p>
        <strong>Cost.</strong> A vertex&rsquo;s value can go down only once after it is first set: from d + 1 to d (values in the deque differ by
        at most 1). So each vertex enters the deque at most twice, each edge is relaxed at most twice, and the whole search is{" "}
        <M>O(V + E)</M>, the same as breadth-first search, with no log V factor from a heap.
      </p>
      <Note title="Costs other than 0 and 1">
        <p>
          The same idea works for small whole-number costs 0 to k: keep k + 1 lists, one for each value d, d + 1, …, d + k, and use them in turn
          (Dial&rsquo;s method, a bucket queue). Each step is O(1), plus O(k) to move past empty lists. With large or fractional costs, use a heap
          (lesson 3).
        </p>
      </Note>

      <h2 id="uses">Where 0 and 1 appear</h2>
      <ul>
        <li>
          <strong>Walls to break.</strong> GRPH-7 counted moves with at most k walls broken, by searching states (square, walls used). If the question
          is only &ldquo;fewest walls broken&rdquo;, a step into a free square costs 0 and a step into a wall costs 1, and 0-1 BFS on the squares
          answers it with no extra state.
        </li>
        <li>
          <strong>Lines to reverse.</strong> Riding along a one-way line costs 0; riding against it, by reversing it, costs 1. That is{" "}
          <Link href="/dsa/path/practice/2/">PATH-P2</Link>.
        </li>
        <li>
          <strong>Changes of direction.</strong> In a grid of arrows, following a square&rsquo;s arrow costs 0 and changing it costs 1. In a maze where
          turning costs 1, the state is (square, direction), and going straight on costs 0.
        </li>
        <li>
          <strong>Changes of line.</strong> On a metro map, staying on the same line costs 0 and changing lines costs 1: the state is (station, line).
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/path/practice/2/">PATH-P2, Fewest lines to reverse</Link>.
      </p>
    </>
  );
}
