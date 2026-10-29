import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FastFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Ford-Fulkerson&rsquo;s time depends on the size of the capacities. Two small rules make it depend only on the size of the network: always
        use a shortest augmenting path (Edmonds and Karp, 1972), and send along all shortest paths of one length in one go (Dinic, 1970).
      </p>

      <h2 id="ek">Edmonds-Karp: shortest paths first</h2>
      <p>
        Edmonds-Karp is Ford-Fulkerson with one rule: each augmenting path is a <strong>shortest</strong> path from s to t in the residual graph,
        counting arcs, found by breadth-first search (GRPH-2). Step through the first variant of the figure. The tags show each station&rsquo;s
        distance from s in the residual graph; watch them across rounds.
      </p>
      <FastFigure />
      <CodeBlock
        code={`from collections import deque

def shortest_path(n, to, cap, adj, s, t):   # arcs in pairs, lesson 2
    via = [-1] * n                       # the arc that reached each vertex
    via[s] = -2
    q = deque([s])
    while q and via[t] == -1:
        u = q.popleft()
        for e in adj[u]:
            if cap[e] > 0 and via[to[e]] == -1:
                via[to[e]] = e
                q.append(to[e])
    return via if via[t] != -1 else None     # None: no augmenting path`}
      />
      <p>
        The rest of each round is lesson 2&rsquo;s augmenting step. Walk back from t along <code>via</code> (the arc into v is{" "}
        <code>via[v]</code>, and its start is <code>to[via[v] ^ 1]</code>) and find the smallest room on the path, the bottleneck. Walk back
        again and push that amount: take it off each arc e and add it to its partner <code>e ^ 1</code>. Repeat until{" "}
        <code>shortest_path</code> returns None; the total pushed is the most flow. Writing that loop is{" "}
        <Link href="/dsa/flow/practice/2/">FLOW-P2</Link>.
      </p>

      <h2 id="proof">Why O(V · E²)</h2>
      <p>
        Let d(v) be the distance from s to v in the residual graph: the fewest arcs on a path. The proof has two steps.
      </p>
      <Invariant label="Step 1">Augmenting along a shortest path never makes any d(v) smaller.</Invariant>
      <p>
        On a shortest path every arc goes from distance k to distance k + 1. Augmenting can remove arcs (the full ones) and add new ones, and every
        new arc is the reverse of an arc on the path, so it goes from distance k + 1 back to k: one step <em>closer</em> to s, never a way that
        skips ahead. Removing arcs cannot shorten paths, and arcs that go one step closer to s cannot shorten a path to anything either. So
        distances can stay the same or grow, never shrink.
      </p>
      <Invariant label="Step 2">Each edge can be the bottleneck of a path at most about V / 2 times.</Invariant>
      <p>
        When arc u → v is a bottleneck, it fills and disappears; at that moment d(v) = d(u) + 1. For u → v to come back, some later shortest path
        must use the reverse arc v → u, so then d(u) = d(v) + 1. Distances never shrink (step 1), so d(u) has grown by at least 2 between the
        two times u → v was a bottleneck. A distance is at most V − 1 (or the vertex cannot be reached at all), so this happens at most about V /
        2 times for each arc.
      </p>
      <p>
        Every round has a bottleneck arc, and there are 2E arcs, so there are at most about V · E rounds. Each round is one BFS, O(E). So
        Edmonds-Karp takes <M>O(V · E²)</M> time (V times E times E), whatever the capacities. In the figure the distance to t goes 3, 3, 3, 4, and
        then t cannot be reached at all.
      </p>
      <p>
        In practice Edmonds-Karp is far faster than this bound on most networks. But each round still runs a whole BFS to find one path. When
        thousands of paths have the same length, that work is repeated thousands of times.
      </p>

      <h2 id="dinic">Dinic: levels and blocking flows</h2>
      <p>Dinic&rsquo;s method finds all the shortest paths of one length in one <strong>phase</strong>:</p>
      <ol>
        <li>
          Run one BFS from s in the residual graph. Each vertex gets its <strong>level</strong>, its distance d(v). If t gets no level, stop.
        </li>
        <li>
          Keep only arcs from a level to the next (d(v) = d(u) + 1): the <strong>level graph</strong>. Every path from s to t in it is a shortest
          path.
        </li>
        <li>
          Send flow along paths of the level graph until no path from s to t is left in it. Such a flow is called a <strong>blocking flow</strong>.
          Then start the next phase.
        </li>
      </ol>
      <p>
        Step 3 must not search from scratch for each path. Each vertex keeps a pointer <code>ptr[u]</code> to the next arc of its list to try, and
        the pointer only moves forward during a phase. An arc is passed over when it is full or leads to a <strong>dead end</strong>, a vertex
        from which t cannot be reached in the level graph. A dead end is never entered again in that phase. Step through the second variant of the
        figure: phase 1 sends three paths of length 3, and phase 2 one path of length 4.
      </p>
      <CodeBlock
        code={`# one phase, after the BFS has set level[]
ptr = [0] * n
while True:
    path, u = [], s                     # arcs from s to u
    while u != t:
        while ptr[u] < len(adj[u]):     # next usable arc of u
            e = adj[u][ptr[u]]
            if cap[e] > 0 and level[to[e]] == level[u] + 1:
                break
            ptr[u] += 1
        if ptr[u] == len(adj[u]):       # u is a dead end
            if u == s:
                break
            level[u] = -1               # never enter it again
            e = path.pop(); u = to[e ^ 1]; ptr[u] += 1
            continue
        path.append(adj[u][ptr[u]]); u = to[path[-1]]
    if u != t:
        break                           # a blocking flow
    push = min(cap[e] for e in path)
    for e in path:
        cap[e] -= push; cap[e ^ 1] += push`}
      />

      <h2 id="dcost">What Dinic costs</h2>
      <Invariant label="Phases">After each phase, the distance from s to t is larger, so there are at most V − 1 phases.</Invariant>
      <p>
        After a blocking flow, every shortest path of the old length has a full arc. Arcs added by the phase go one level back, so, as in step 1
        above, they create no new paths of the old length or shorter. So the next phase&rsquo;s distance to t is at least one more.
      </p>
      <p>
        Inside a phase, each path found costs at most V steps to walk and fills at least one arc, which then leaves the level graph: at most E
        paths, <M>O(V · E)</M>. Each step back from a dead end moves a pointer forward for good: at most E such steps. So a phase is{" "}
        <M>O(V · E)</M> and the whole method <M>O(V² · E)</M>, that is V times V times E. On networks where every capacity is 1, a sharper count gives{" "}
        <M>O(E · √V)</M> for the bipartite networks of lesson 5 (√V is the square root of V); lesson 5&rsquo;s Hopcroft-Karp method is exactly
        this.
      </p>

      <h2 id="choose">Which method when</h2>
      <ul>
        <li>
          <strong>Small total flow</strong> (F small): plain Ford-Fulkerson with any search, <M>O(E · F)</M>, is the simplest.
        </li>
        <li>
          <strong>General networks:</strong> Edmonds-Karp is short and safe. On the random networks of FLOW-P3 it finishes in a fraction of a
          second, where depth-first Ford-Fulkerson runs for hours.
        </li>
        <li>
          <strong>Long, layered networks</strong> where many shortest paths share a length: Dinic. FLOW-P3&rsquo;s last test has 160 layers;
          Edmonds-Karp needs about 13 seconds there in CPython, Dinic about half a second.
        </li>
        <li>
          Other methods: <strong>capacity scaling</strong> (only take paths with a bottleneck of at least Δ, halving Δ each time,{" "}
          <M>O(E² · log C)</M>, E times E times log C, where C is the largest capacity), and <strong>push-relabel</strong>, which moves extra flow along one edge at a time
          instead of whole paths and is the fastest in many real uses. In 2022 a method that is almost linear in E was found; it is far too complex
          for everyday use.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/flow/practice/3/">FLOW-P3, A full plan, fast</Link>.
      </p>
      <Note title="Recursion">
        <p>
          Many books write the blocking-flow walk as a recursive function. A path in FLOW-P3 is about 160 arcs long, which would fit, but the
          walk above keeps its path in a list anyway, so no network is too deep for it.
        </p>
      </Note>
    </>
  );
}
