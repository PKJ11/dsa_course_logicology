import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TeamsFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Some graphs split naturally into two sides, with every edge going across: students and the courses they take, jobs and the machines
        that can do them. Whether a graph can be split this way is easy to test, and when it cannot, there is always a short proof of why: a
        cycle of odd length.
      </p>

      <h2 id="two">Two sides</h2>
      <p>
        An undirected graph is <strong>bipartite</strong> if its vertices can be put into two groups so that every edge joins a vertex of one
        group to a vertex of the other. No edge stays inside a group. Giving each vertex a group number, 0 or 1, is called a{" "}
        <strong>2-colouring</strong>; the numbers are just names for the two groups.
      </p>
      <ul>
        <li>Every tree is bipartite: put the vertices at even depth in group 0 and those at odd depth in group 1.</li>
        <li>A cycle of even length is bipartite: go round it, alternating 0, 1, 0, 1.</li>
        <li>A grid is bipartite, like a chessboard: square (r, c) goes in group (r + c) % 2, the remainder when r + c is divided by 2, and every move changes r + c by 1.</li>
        <li>A triangle is not: two of its three vertices must share a group, and they are joined.</li>
      </ul>

      <h2 id="colour">Splitting with a search</h2>
      <p>
        Put any vertex in group 0. Its neighbours must then be in group 1, their neighbours in group 0, and so on: every choice is forced. A
        breadth-first search makes these choices layer by layer. If it ever finds an edge whose two ends are already in the same group, the split
        is impossible, because nothing was chosen freely except the first vertex, and swapping the groups would not help.
      </p>
      <CodeBlock
        code={`from collections import deque

def two_sides(adj):
    n = len(adj)
    side = [-1] * n               # -1: no group yet
    for s in range(n):            # each part of the graph on its own
        if side[s] != -1:
            continue
        side[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if side[v] == -1:
                    side[v] = 1 - side[u]
                    q.append(v)
                elif side[v] == side[u]:
                    return None   # an edge inside one group
    return side`}
      />
      <p>
        Each connected part needs its own first choice, so the loop starts a new search from every vertex without a group. The cost is that of
        BFS, <M>O(V + E)</M>. A depth-first search works just as well (with your own stack on deep graphs). In the figure the tags are the
        groups; the second variant ends with an edge whose two ends are in the same group.
      </p>
      <TeamsFigure />

      <h2 id="odd">Odd cycles</h2>
      <p>
        A <strong>cycle of odd length</strong> (an odd number of edges, like the triangle) can never be split. Going round it, the group must
        change at every edge. After an odd number of changes you are in the other group, but you are back at the vertex you started from, which
        cannot be in both. So any graph that contains an odd cycle is not bipartite.
      </p>
      <Invariant label="Two sides">A graph is bipartite exactly when it has no cycle of odd length.</Invariant>

      <h2 id="proof">Why an odd cycle is the only obstacle</h2>
      <p>
        The other half says: if the search above fails, the graph really has an odd cycle. Look at the BFS from one start. Each vertex is in the
        group of its distance&rsquo;s parity (even or odd). An edge can only join vertices whose distances differ by 0 or 1, because if u is at
        distance d, its neighbour is at most d + 1 away. An edge between distances d and d + 1 goes across the groups, as it should. So the only
        edges that can break the split join two vertices u and v at the <em>same</em> distance d.
      </p>
      <p>
        Follow the parents from u and from v back towards the start, one step at a time from both. The two walks are on the same level at every
        step, so they meet at the same moment, at some vertex w that is k steps up from both. The route from w down to u, the edge u–v, and the
        route from v back up to w form a cycle of k + 1 + k = 2k + 1 edges: an odd number. The vertices are all different, because the two
        walks meet only at w.
      </p>
      <p>
        So when the split fails, the search can also hand back an odd cycle as proof, at the cost of the two walks up (at most V steps). An answer
        that comes with a short proof that anyone can check is called a <strong>certificate</strong>. P6 asks for one.
      </p>
      <Note title="With depth-first search">
        <p>
          With DFS the clashing edge u–v joins a vertex to one of its ancestors (lesson 3: undirected graphs have only tree and back edges), so
          the odd cycle is simply the path of tree edges from v down to u plus the edge. Both searches give a certificate. Neither promises
          the shortest odd cycle; that needs more work.
        </p>
      </Note>

      <h2 id="uses">Where two sides appear</h2>
      <ul>
        <li>
          <strong>Matching.</strong> Pairing students with projects, or workers with jobs, so that as many as possible are paired, is a matching
          in a bipartite graph. FLOW-5 solves it with network flow.
        </li>
        <li>
          <strong>Two shifts, two rooms.</strong> If each edge means &ldquo;these two cannot be together&rdquo;, a 2-colouring splits everyone
          into two groups with no conflict, or the odd cycle shows who blocks it.
        </li>
        <li>
          <strong>Three groups is much harder.</strong> Deciding whether a graph can be split into three groups with no edge inside a group
          has no known fast method; it is one of the NP-complete problems of HARD-1, a family of problems for which no fast method is known. Two groups is easy because every choice is forced.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/grph/practice/6/">GRPH-P6, Two teams, or an odd cycle</Link>.
      </p>
    </>
  );
}
