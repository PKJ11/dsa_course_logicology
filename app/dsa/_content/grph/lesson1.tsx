import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RepFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A railway map, a road network, friends on a website, web pages and their links, tasks that must wait for other tasks: all of these are
        things joined to other things. A graph is the general picture of that. This station shows how to store a graph, and then how to search
        one. Leg D builds everything else on it.
      </p>

      <h2 id="words">Vertices and edges</h2>
      <p>
        A <strong>graph</strong> is a set of <strong>vertices</strong> (also called nodes: the stations) and a set of <strong>edges</strong>{" "}
        (the lines). Each edge joins two vertices. Two vertices joined by an edge are <strong>neighbours</strong>.
      </p>
      <ul>
        <li>
          In an <strong>undirected</strong> graph an edge goes both ways: a line between A and B can be used from A to B and from B to A. We
          write it A–B.
        </li>
        <li>
          In a <strong>directed</strong> graph each edge goes one way, from its start to its end, written A → B. One-way streets, links between
          web pages and &ldquo;task A must come before task B&rdquo; are directed.
        </li>
        <li>
          The <strong>degree</strong> of a vertex is the number of edges at it. In a directed graph, the <strong>out-degree</strong> counts edges
          going out and the <strong>in-degree</strong> counts edges coming in.
        </li>
        <li>
          A <strong>path</strong> is a sequence of vertices where each one is joined to the next. A <strong>cycle</strong> is a path that comes
          back to where it started. A graph is <strong>connected</strong> if there is a path between every two vertices.
        </li>
      </ul>
      <p>
        We write <M>V</M> for the number of vertices and <M>E</M> for the number of edges. Cost is usually given in both, as in{" "}
        <M>O(V + E)</M>: &ldquo;time that grows with the number of vertices plus the number of edges&rdquo;. A graph with no repeated edges and no
        edge from a vertex to itself has at most V(V − 1)/2 undirected edges, so E can be anything from 0 to about V²/2 (half of V times V). A graph with few edges
        (a road map, where E is a small multiple of V) is called <strong>sparse</strong>; one with close to V² edges is <strong>dense</strong>.
      </p>
      <Invariant label="Handshakes">The degrees of all vertices add up to 2E.</Invariant>
      <p>
        The reason: every edge has two ends, and each end adds 1 to the degree of one vertex. So the total is exactly twice the number of edges.
        One consequence is that the number of vertices with an odd degree is always even.
      </p>

      <h2 id="matrix">The adjacency matrix</h2>
      <p>
        Number the vertices 0 to V − 1. The <strong>adjacency matrix</strong> is a V × V table where row u, column v holds 1 if there is an
        edge from u to v, and 0 if not. For an undirected graph the table is <strong>symmetric</strong>: it reads the same when flipped across its
        diagonal, because every edge is entered twice, at (u, v) and at (v, u).
      </p>
      <ul>
        <li>&ldquo;Is u joined to v?&rdquo; is one look-up: O(1).</li>
        <li>Listing the neighbours of u means reading the whole row: O(V), even if u has only two neighbours.</li>
        <li>The memory is V² entries, whatever the number of edges. 100,000 vertices need 10¹⁰ entries (ten thousand million), which no laptop holds.</li>
      </ul>
      <p>
        So the matrix suits small or dense graphs. It also allows arithmetic on the whole graph: entry (u, v) of the matrix to the power k (k
        copies of the matrix multiplied together) counts the walks of exactly k edges from u to v (a <strong>walk</strong> is a path that may repeat vertices). MATH-3 computes such
        powers quickly. Floyd–Warshall (PATH-5) also works on a matrix.
      </p>

      <h2 id="lists">Adjacency lists</h2>
      <p>
        <strong>Adjacency lists</strong> keep, for each vertex, a list of its neighbours. An undirected edge u–v appears twice, once in u&rsquo;s
        list and once in v&rsquo;s; a directed edge u → v appears once, in u&rsquo;s list. Step through the figure to see the same graph built
        each way.
      </p>
      <RepFigure />
      <p>Building adjacency lists from a list of edges takes one pass:</p>
      <CodeBlock
        code={`def build(n, edges, directed=False):
    adj = [[] for _ in range(n)]       # not [[]] * n: that is one list, n times
    for u, v in edges:
        adj[u].append(v)
        if not directed:
            adj[v].append(u)
    return adj`}
      />
      <ul>
        <li>The memory is O(V + E): one list per vertex, and one or two entries per edge.</li>
        <li>Listing the neighbours of u takes time in proportion to its degree, which is what a search needs.</li>
        <li>
          &ldquo;Is u joined to v?&rdquo; means scanning u&rsquo;s list: O(degree of u). If that question is common, keep each vertex&rsquo;s
          neighbours in a <strong>set</strong> instead of a list. A set answers it in O(1) on average (HASH), at the cost of more memory and of
          losing the order of the neighbours.
        </li>
      </ul>
      <p>
        Nearly every algorithm in Leg D uses adjacency lists, because a search touches each edge only a few times and the lists give exactly those
        edges.
      </p>

      <h2 id="edges">The edge list</h2>
      <p>
        The simplest form is just the list of edges, <code>[(u, v), …]</code>: the way graphs usually arrive in a file or a problem. It uses the
        least memory, but answering anything about one vertex means reading the whole list. Algorithms that look at every edge in some order use
        it directly: Kruskal&rsquo;s method sorts the edges by weight (SPAN-2), and Bellman–Ford goes over all edges again and again (PATH-4).
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <thead>
            <tr>
              <th>Stored as</th>
              <th>Memory</th>
              <th>Is u joined to v?</th>
              <th>Neighbours of u</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Adjacency matrix</td>
              <td>
                <M>O(V²)</M>
              </td>
              <td>
                <M>O(1)</M>
              </td>
              <td>
                <M>O(V)</M>
              </td>
            </tr>
            <tr>
              <td>Adjacency lists</td>
              <td>
                <M>O(V + E)</M>
              </td>
              <td>
                <M>O(deg u)</M>
              </td>
              <td>
                <M>O(deg u)</M>
              </td>
            </tr>
            <tr>
              <td>Adjacency sets</td>
              <td>
                <M>O(V + E)</M>
              </td>
              <td>
                <M>O(1)</M> on average
              </td>
              <td>
                <M>O(deg u)</M>
              </td>
            </tr>
            <tr>
              <td>Edge list</td>
              <td>
                <M>O(E)</M>
              </td>
              <td>
                <M>O(E)</M>
              </td>
              <td>
                <M>O(E)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="python">Graphs in Python</h2>
      <p>
        When the vertices are numbered 0 to n − 1, a list of lists is the fastest choice. When they have names (station codes, words), use a dict
        whose values are lists or sets:
      </p>
      <CodeBlock
        code={`from collections import defaultdict

lines = [("NDLS", "AGC"), ("AGC", "GWL"), ("NDLS", "JP")]
adj = defaultdict(set)            # a missing key starts as an empty set
for a, b in lines:
    adj[a].add(b)
    adj[b].add(a)
print(sorted(adj["NDLS"]))        # ['AGC', 'JP']`}
      />
      <p>Another way is to give each name a number once, and then use lists:</p>
      <CodeBlock
        code={`names = ["NDLS", "AGC", "GWL", "JP"]
index = {name: i for i, name in enumerate(names)}
adj = [[] for _ in names]
for a, b in lines:
    adj[index[a]].append(index[b])
    adj[index[b]].append(index[a])`}
      />
      <p>
        That is faster for big graphs, and the numbers let you keep facts about each vertex (a distance, a parent) in plain lists.
      </p>
      <Note title="Repeated edges and loops">
        <p>
          Real input can list the same edge twice, or contain an edge from a vertex to itself (a <strong>loop</strong>). Lists keep both copies,
          which is harmless for a search but wrong for counting degrees or neighbours; sets keep one. Decide which the problem means, and read
          the statement for it. Libraries such as networkx offer ready-made graph classes, but they are not used in this course: building the
          lists yourself is short, and it is what interviews and contests expect.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/grph/practice/1/">GRPH-P1, Is there a direct line?</Link>
      </p>
    </>
  );
}
