// PATH step generators. Every figure is a list of steps made up front; each step is a full picture of the graph
// (vertex and edge states, distance tags, weight plates) plus its side panel (a heap, a deque, a table or a grid).

import type { GCell, GEdge, GEdgeState, GNode, GState, QItem } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
export type Row = { k: string; v: string; p?: string; cur?: boolean; path?: boolean };

export type GraphStep = {
  nodes: GNode[];
  edges: GEdge[];
  caption: string;
  queue?: QItem[];
  order?: QItem[];
  rows?: Row[];
  matrix?: GCell[][];
  readout?: string;
  verdict?: Verdict;
};

export type GridStep = { cells: GCell[][]; caption: string; readout?: string; verdict?: Verdict };

/* ---------- a weighted graph and a board that remembers its marks ---------- */

type GDef = {
  pos: Record<string, [number, number]>;
  edges: [string, string, number][];
  directed: boolean;
  bend?: Record<string, number>;
  /** vertices whose tags go on the bottom-right corner, clear of edges that leave them up and to the right */
  below?: string[];
};

const key = (g: GDef, a: string, b: string) => (g.directed || a < b ? `${a}|${b}` : `${b}|${a}`);
/** A number with a true minus sign, and ∞ for Infinity. */
export const num = (x: number) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : x < 0 ? `−${-x}` : String(x));

/** Out-edges of each vertex, as (neighbour, weight), in alphabetical order. */
function adjacency(g: GDef): Record<string, [string, number][]> {
  const adj: Record<string, [string, number][]> = {};
  for (const v of Object.keys(g.pos)) adj[v] = [];
  for (const [a, b, w] of g.edges) {
    adj[a].push([b, w]);
    if (!g.directed) adj[b].push([a, w]);
  }
  for (const v of Object.keys(adj)) adj[v].sort((x, y) => x[0].localeCompare(y[0]));
  return adj;
}

class Board {
  st = new Map<string, GState>();
  tag = new Map<string, string>();
  tk = new Map<string, "ink" | "plain" | "bad">();
  es = new Map<string, GEdgeState>();
  flashN = new Map<string, GState>();
  flashE = new Map<string, GEdgeState>();
  constructor(public g: GDef) {}
  edge(a: string, b: string, s: GEdgeState) {
    this.es.set(key(this.g, a, b), s);
  }
  flash(a: string, b: string, s: GEdgeState) {
    this.flashE.set(key(this.g, a, b), s);
  }
  nodes(): GNode[] {
    return Object.entries(this.g.pos).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      state: this.flashN.get(id) ?? this.st.get(id) ?? "",
      tag: this.tag.get(id),
      tagKind: this.tk.get(id) ?? "plain",
      tagAt: this.g.below?.includes(id) ? ("br" as const) : ("tr" as const),
    }));
  }
  edges(): GEdge[] {
    return this.g.edges.map(([a, b, w]) => {
      const k = key(this.g, a, b);
      return { a, b, state: this.flashE.get(k) ?? this.es.get(k) ?? "", label: num(w), bend: this.g.bend?.[k] };
    });
  }
  snap(): Pick<GraphStep, "nodes" | "edges"> {
    const s = { nodes: this.nodes(), edges: this.edges() };
    this.flashN.clear();
    this.flashE.clear();
    return s;
  }
}

// A name and its value ("E 6") never break apart on a phone.
const list = (ys: string[]) => {
  const xs = ys.map((y) => y.replace(" ", " "));
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
};
const plus = (a: number, b: number) => `${num(a)} + ${b < 0 ? `(${num(b)})` : num(b)}`;
const mins = (x: number) => `${num(x)} ${x === 1 ? "minute" : "minutes"}`;

/* ---------- the network of lessons 1 and 3: GRPH's line of 7 stations, now with travel times ---------- */

const NET_POS: Record<string, [number, number]> = { A: [0, 1.3], B: [1.5, 0], C: [1.5, 2.6], D: [3, 0], E: [3, 2.6], F: [4.5, 1.3], G: [6, 1.3] };
export const NET: GDef = {
  pos: NET_POS,
  below: ["C", "E"],
  edges: [
    ["A", "B", 4],
    ["A", "C", 1],
    ["B", "C", 2],
    ["B", "D", 1],
    ["C", "D", 5],
    ["C", "E", 2],
    ["D", "F", 3],
    ["E", "F", 6],
    ["F", "G", 2],
  ],
  directed: false,
};
export const NET_SIZE = { w: 6, h: 2.6 };

const tableRows = (names: string[], dist: Record<string, number>, parent: Record<string, string>, cur: string[] = []): Row[] =>
  names.map((n) => ({ k: n, v: num(dist[n] ?? Infinity), p: parent[n] ?? "–", cur: cur.includes(n) }));

/* ---------- PATH-1.1: fewest edges or least time; relaxing edges ---------- */

export type ProblemVariant = "fewest" | "relax";

export function problemSteps(v: ProblemVariant): GraphStep[] {
  const g = NET;
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const out: GraphStep[] = [];
  if (v === "fewest") {
    out.push({ ...b.snap(), caption: "The line from GRPH-2, with a travel time in minutes on every edge. Trains run both ways. What is the quickest way from A to G?" });
    const bfs = ["A", "B", "D", "F", "G"];
    for (let k = 0; k + 1 < bfs.length; k++) b.edge(bfs[k], bfs[k + 1], "cur");
    for (const x of bfs) b.st.set(x, "seen");
    out.push({
      ...b.snap(),
      caption: "Breadth-first search finds the route with the fewest edges: A, B, D, F, G. It has 4 edges. Add up the times on them.",
      readout: "4 + 1 + 3 + 2 = 10 minutes",
    });
    for (let k = 0; k + 1 < bfs.length; k++) b.edge(bfs[k], bfs[k + 1], "old");
    for (const x of bfs) b.st.delete(x);
    const best = ["A", "C", "B", "D", "F", "G"];
    for (let k = 0; k + 1 < best.length; k++) b.edge(best[k], best[k + 1], "found");
    for (const x of best) b.st.set(x, "found");
    out.push({
      ...b.snap(),
      caption: "This route has 5 edges, one more, but it takes 9 minutes, one less: going A, C, B instead of straight to B saves a minute. Breadth-first search counts edges and cannot see this.",
      readout: "1 + 2 + 1 + 3 + 2 = 9 minutes",
      verdict: { ok: true, text: "more edges, less time" },
    });
    return out;
  }
  // relax a few edges by hand, in an order that shows a time going down later
  const dist: Record<string, number> = { A: 0 };
  const parent: Record<string, string> = {};
  for (const n of names) b.tag.set(n, n === "A" ? "0" : "∞");
  b.st.set("A", "seen");
  out.push({
    ...b.snap(),
    rows: tableRows(names, dist, parent, ["A"]),
    caption: "Start with a time for every station: 0 for A, and ∞ (no route known yet) for the others. The tags show these times.",
  });
  const order: [string, string][] = [
    ["A", "B"],
    ["A", "C"],
    ["C", "D"],
    ["C", "B"],
    ["B", "D"],
    ["C", "E"],
    ["D", "F"],
    ["E", "F"],
    ["F", "G"],
  ];
  const w = (a: string, c: string) => g.edges.find(([x, y]) => (x === a && y === c) || (x === c && y === a))![2];
  for (const [a, c] of order) {
    const nd = dist[a] + w(a, c);
    const old = dist[c] ?? Infinity;
    let caption: string;
    if (nd < old) {
      const before = parent[c];
      dist[c] = nd;
      if (before) b.edge(before, c, "");
      parent[c] = a;
      b.edge(a, c, "tree");
      b.flash(a, c, "cur");
      b.tag.set(c, num(nd));
      b.st.set(c, "seen");
      b.flashN.set(c, "cur");
      caption =
        old === Infinity
          ? `Relax ${a} → ${c}: ${num(dist[a])} + ${w(a, c)} = ${nd}, less than ∞. ${c} gets ${mins(nd)}, and ${a} becomes its parent (the shaded edge).`
          : `Relax ${a} → ${c}: ${num(dist[a])} + ${w(a, c)} = ${nd}, less than ${old}. ${c}’s time goes down, and its parent changes from ${before} to ${a}.`;
    } else {
      b.flash(a, c, "old");
      b.flashN.set(c, "cur");
      caption = `Relax ${a} → ${c}: ${num(dist[a])} + ${w(a, c)} = ${nd}, not less than ${c}’s ${old}. Nothing changes.`;
    }
    out.push({ ...b.snap(), rows: tableRows(names, dist, parent, [c]), caption, readout: `d[${c}] = min(${num(old)}, ${num(dist[a])} + ${w(a, c)})` });
  }
  for (const n of names) b.st.set(n, "done");
  out.push({
    ...b.snap(),
    rows: tableRows(names, dist, parent),
    caption:
      "Now no edge can lower any time: for every edge, d[v] ≤ d[u] + w. So these are the shortest times, and the shaded parent edges form a tree of shortest routes. D was lowered twice, because C → D was relaxed before B’s time was final.",
    verdict: { ok: true, text: "no edge can improve" },
  });
  return out;
}

/* ---------- PATH-2.1: 0-1 BFS with a deque, and a plain queue that gets it wrong ---------- */

export const ZO: GDef = {
  pos: { A: [0, 1], B: [1.5, 0], C: [1.5, 2], D: [3, 0], E: [3, 2], F: [4.5, 1] },
  edges: [
    ["A", "B", 1],
    ["A", "C", 0],
    ["B", "C", 0],
    ["B", "D", 1],
    ["C", "E", 1],
    ["D", "E", 0],
    ["D", "F", 0],
    ["E", "F", 1],
  ],
  directed: false,
};
export const ZO_SIZE = { w: 4.5, h: 2 };

export type ZeroOneVariant = "deque" | "plain";

export function zeroOneSteps(v: ZeroOneVariant): GraphStep[] {
  const g = ZO;
  const adj = adjacency(g);
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const dist: Record<string, number> = { A: 0 };
  const parent: Record<string, string> = {};
  // entries remember the time they were added with, so an out-of-date entry can be shown hatched
  let q: { v: string; d: number }[] = [{ v: "A", d: 0 }];
  const qi = (): QItem[] => q.map((e) => ({ v: `${e.v} ${e.d}`, s: e.d > (dist[e.v] ?? Infinity) ? "out" : "seen" }));
  for (const n of names) b.tag.set(n, n === "A" ? "0" : "∞");
  b.st.set("A", "seen");
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    queue: qi(),
    caption:
      v === "deque"
        ? "Each edge costs 0 or 1. Start at A with 0. The deque holds stations with the time they were added with; the front is at the left."
        : "The same graph, searched by a plain breadth-first search: each station keeps the time it is first given, and everything goes to the back of the queue.",
  });
  while (q.length) {
    const e = q.shift()!;
    const u = e.v;
    if (e.d > dist[u]) {
      b.flashN.set(u, "cur");
      out.push({ ...b.snap(), queue: [{ v: `${u} ${e.d}`, s: "out" }, ...qi()], caption: `Take ${u} ${e.d} from the front. ${u} has ${dist[u]} now, so this entry is out of date: skip it.` });
      continue;
    }
    const d = dist[u];
    const front: string[] = [];
    const back: string[] = [];
    const same: string[] = [];
    for (const [w, c] of adj[u]) {
      const nd = d + c;
      const better = v === "deque" ? nd < (dist[w] ?? Infinity) : dist[w] === undefined;
      if (better) {
        if (parent[w]) b.edge(parent[w], w, "");
        dist[w] = nd;
        parent[w] = u;
        b.tag.set(w, String(nd));
        b.st.set(w, "seen");
        b.edge(u, w, "tree");
        b.flash(u, w, "cur");
        if (v === "deque" && c === 0) {
          q.unshift({ v: w, d: nd });
          front.push(w);
        } else {
          q.push({ v: w, d: nd });
          back.push(w);
        }
      } else if (parent[u] !== w) {
        same.push(w);
        b.flash(u, w, "old");
      }
    }
    b.flashN.set(u, "cur");
    let caption = `Take ${u} from the front (time ${d}). `;
    const parts: string[] = [];
    if (front.length) parts.push(`${list(front)} ${front.length === 1 ? "is" : "are"} reached by a 0 edge with time ${d}: to the front`);
    if (back.length)
      parts.push(
        v === "deque"
          ? `${list(back)} ${back.length === 1 ? "is" : "are"} reached by a 1 edge with time ${d + 1}: to the back`
          : `${list(back)} ${back.length === 1 ? "is" : "are"} new: ${back.map((x) => `${x} gets ${dist[x]}`).join(", ")}, at the back`,
      );
    if (same.length) parts.push(`${list(same)} ${v === "deque" ? (same.length === 1 ? "gets no better time" : "get no better times") : same.length === 1 ? "was reached already" : "were reached already"}`);
    caption += parts.length ? `${parts.join("; ")}.` : "Nothing changes.";
    out.push({ ...b.snap(), queue: [{ v: `${u} ${d}`, s: "cur" }, ...qi()], caption });
    b.st.set(u, "done");
  }
  if (v === "deque") {
    out.push({
      ...b.snap(),
      queue: [],
      caption: "The deque is empty and every tag is the cheapest cost from A. B went down from 1 to 0 after it was first reached, and a 0 edge put it at the front, so it was handled before anything at time 1.",
      verdict: { ok: true, text: "all times right" },
    });
  } else {
    for (const x of ["B", "D"]) b.st.set(x, "bad");
    out.push({
      ...b.snap(),
      queue: [],
      caption: "Done, but wrong. B is 0 away (A → C → B costs 0 + 0), and D is 1 away, not 2. The plain queue gave B its time from the first edge that reached it, and that time was never lowered.",
      verdict: { ok: false, text: "B and D are wrong" },
    });
  }
  return out;
}

/* ---------- PATH-3.1: Dijkstra with a heap and lazy removal; a negative edge ---------- */

export const NEG: GDef = {
  pos: { A: [0, 1], B: [2, 0], C: [2, 2], D: [4, 0] },
  edges: [
    ["A", "B", 2],
    ["A", "C", 3],
    ["C", "B", -2],
    ["B", "D", 1],
  ],
  directed: true,
};

export type DijkstraVariant = "heap" | "negative";

export function dijkstraSteps(v: DijkstraVariant): GraphStep[] {
  const g = v === "heap" ? NET : NEG;
  const adj = adjacency(g);
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const dist: Record<string, number> = { A: 0 };
  const parent: Record<string, string> = {};
  const done = new Set<string>();
  let heap: [number, string][] = [[0, "A"]];
  const sortHeap = () => heap.sort((x, y) => x[0] - y[0] || x[1].localeCompare(y[1]));
  const hi = (): QItem[] => heap.map(([d, x]) => ({ v: `${num(d)} ${x}`, s: done.has(x) || d > dist[x] ? "out" : "seen" }));
  for (const n of names) b.tag.set(n, n === "A" ? "0" : "∞");
  b.st.set("A", "seen");
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    queue: hi(),
    caption:
      v === "heap"
        ? "Dijkstra’s method on the timed line. The heap holds (time, station) entries, smallest first. A starts with 0."
        : "Four stations and one-way lines; C → B takes −2: a refund. Dijkstra’s method assumes no edge is negative. Watch what happens.",
  });
  let wrongEdge: [string, string] | null = null;
  while (heap.length) {
    sortHeap();
    const [d, u] = heap.shift()!;
    if (done.has(u) || d > dist[u]) {
      b.flashN.set(u, "cur");
      out.push({
        ...b.snap(),
        queue: [{ v: `${num(d)} ${u}`, s: "out" }, ...hi()],
        caption: `Take ${num(d)} ${u}. ${u} was settled at ${dist[u]} already, so this entry is out of date: skip it, without looking at ${u}’s edges again.`,
      });
      continue;
    }
    done.add(u);
    b.st.set(u, "done");
    b.flashN.set(u, "cur");
    if (parent[u]) b.edge(parent[u], u, "tree");
    const better: string[] = [];
    const worse: string[] = [];
    let late = "";
    for (const [w, c] of adj[u]) {
      if (done.has(w)) {
        if (d + c < dist[w]) {
          late = `${u} → ${w} gives ${num(d)} + (${num(c)}) = ${num(d + c)}, less than ${w}’s ${num(dist[w])}. But ${w} is settled and never looked at again`;
          b.flash(u, w, "bad");
          wrongEdge = [u, w];
        }
        continue;
      }
      if (d + c < (dist[w] ?? Infinity)) {
        dist[w] = d + c;
        if (parent[w]) b.edge(parent[w], w, "");
        parent[w] = u;
        b.tag.set(w, num(d + c));
        b.st.set(w, "seen");
        b.flash(u, w, "cur");
        heap.push([d + c, w]);
        better.push(`${w} ${num(d + c)}`);
      } else {
        worse.push(w);
        b.flash(u, w, "old");
      }
    }
    sortHeap();
    let caption = `Take ${num(d)} ${u}: the smallest time in the heap, so ${u} is settled at ${num(d)}. `;
    if (better.length) caption += `Push ${list(better)}. `;
    if (worse.length) caption += `${list(worse)} ${worse.length === 1 ? "gets" : "get"} no better time. `;
    if (late) caption += `${late}.`;
    if (!better.length && !worse.length && !late) caption += "No new times.";
    out.push({ ...b.snap(), queue: [{ v: `${num(d)} ${u}`, s: "cur" }, ...hi()], caption: caption.trim() });
  }
  if (v === "heap") {
    const path = ["G"];
    while (path[path.length - 1] !== "A") path.push(parent[path[path.length - 1]]);
    for (let k = 0; k + 1 < path.length; k++) b.edge(path[k], path[k + 1], "found");
    for (const x of path) b.st.set(x, "found");
    out.push({
      ...b.snap(),
      queue: [],
      caption: `The heap is empty. Each station was settled once, in order of time: A, C, B, E, D, F, G. Three old entries were skipped. The route to G follows the parents back: ${path.join(" ← ")}.`,
      verdict: { ok: true, text: "A → G in 9 minutes" },
    });
  } else {
    void wrongEdge;
    for (const x of ["B", "D"]) b.st.set(x, "bad");
    out.push({
      ...b.snap(),
      queue: [],
      caption: "Finished, and wrong. A → C → B costs 3 − 2 = 1, not 2, and D can be reached for 2, not 3. B was settled before C was looked at, and a negative edge made a longer route cheaper later.",
      verdict: { ok: false, text: "B should be 1 and D 2" },
    });
  }
  return out;
}

/* ---------- PATH-4.1: Bellman-Ford, round by round; a negative cycle ---------- */

const BF_POS: Record<string, [number, number]> = { A: [0, 1], B: [1.5, 0], C: [1.5, 2], D: [3, 0], E: [3, 2] };
const BF_EDGES: [string, string, number][] = [
  ["D", "E", 2],
  ["C", "D", 3],
  ["B", "C", -1],
  ["A", "B", 2],
  ["A", "C", 5],
  ["B", "D", 6],
];
export const BF_SIZE = { w: 3, h: 2 };

export type BellmanVariant = "plain" | "cycle";

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven"];

export function bellmanSteps(v: BellmanVariant): GraphStep[] {
  const edges: [string, string, number][] = v === "plain" ? BF_EDGES : [...BF_EDGES, ["E", "C", -8]];
  const g: GDef = { pos: BF_POS, edges, directed: true };
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const n = names.length;
  const dist: Record<string, number> = Object.fromEntries(names.map((x) => [x, x === "A" ? 0 : Infinity]));
  const parent: Record<string, string> = {};
  for (const x of names) b.tag.set(x, num(dist[x]));
  b.st.set("A", "seen");
  const rows = (cur: number[]): GraphStep["rows"] =>
    edges.map(([a, c, w], i) => ({ k: `${a} → ${c}`, v: num(w), cur: cur.length === 1 && cur.includes(i), path: cur.length > 1 && cur.includes(i) }));
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    rows: rows([]),
    caption:
      v === "plain"
        ? "One-way lines, one with a negative time. The edge list is in the table, in this order. Each round relaxes every edge once, top to bottom."
        : "The same lines plus E → C with −8. Now the loop C → D → E → C costs 3 + 2 − 8 = −3: a negative cycle.",
  });
  for (let round = 1; round <= n; round++) {
    const changed: number[] = [];
    const said: string[] = [];
    edges.forEach(([a, c, w], i) => {
      if (dist[a] + w < dist[c]) {
        if (round === n) {
          changed.push(i);
          return;
        }
        dist[c] = dist[a] + w;
        if (parent[c]) b.edge(parent[c], c, "");
        parent[c] = a;
        b.edge(a, c, "tree");
        b.flash(a, c, "cur");
        b.tag.set(c, num(dist[c]));
        b.st.set(c, "seen");
        changed.push(i);
        said.push(`${c} ${num(dist[c])}`);
      }
    });
    if (round === n) {
      if (changed.length === 0) break;
      for (const i of changed) b.flash(edges[i][0], edges[i][1], "bad");
      out.push({
        ...b.snap(),
        rows: rows(changed),
        caption: `Round ${n}, one more than V − 1 = ${n - 1}. ${changed.map((i) => `${edges[i][0]} → ${edges[i][1]}`).join(" and ")} still ${changed.length === 1 ? "lowers a time" : "lower times"}. Without a negative cycle, nothing could change now. So a negative cycle can be reached from A.`,
        readout: `round ${n}`,
        verdict: { ok: false, text: "negative cycle" },
      });
      const bad = new Set(changed.map((i) => edges[i][1]));
      let grew = true;
      while (grew) {
        grew = false;
        for (const [a, c] of edges) if (bad.has(a) && !bad.has(c)) (bad.add(c), (grew = true));
      }
      for (const x of bad) {
        b.st.set(x, "bad");
        b.tag.set(x, "−∞");
        b.tk.set(x, "bad");
      }
      for (const [a, c] of edges) if (bad.has(a) && bad.has(c)) b.edge(a, c, "bad");
      out.push({
        ...b.snap(),
        rows: rows([]),
        caption: `Every station the loop can reach can be made as cheap as you like: go round the loop more times. Mark ${list([...bad].sort())} as −∞. A and B cannot be reached from the loop, so their times stand.`,
        verdict: { ok: false, text: `${list([...bad].sort())}: no cheapest time` },
      });
      return out;
    }
    out.push({
      ...b.snap(),
      rows: rows(changed),
      caption: changed.length
        ? `Round ${round}: relax all ${edges.length} edges in list order. ${said.length === 1 ? "One time goes down" : `${WORDS[said.length] ?? said.length} times go down`}: ${list(said)}.${round === 1 ? " Edges from stations at ∞ change nothing, so the first edges do nothing yet." : ""}`
        : `Round ${round}: nothing changes, so nothing ever will. Stop early.`,
      readout: `round ${round} of at most ${n - 1}`,
    });
    if (changed.length === 0) break;
  }
  if (v === "plain") {
    for (const x of names) b.st.set(x, "done");
    out.push({
      ...b.snap(),
      rows: rows([]),
      caption: "After V − 1 = 4 rounds every time is final. Round 4 was needed: the route A → B → C → D → E has 4 edges, and the list is in the worst order for it, so each round got one edge further along.",
      verdict: { ok: true, text: "4 rounds" },
    });
  }
  return out;
}

/* ---------- PATH-5.1: Floyd-Warshall on a table; the wrong loop order ---------- */

export const FW: GDef = {
  pos: { A: [0, 0], B: [2.4, 0], C: [2.4, 1.6], D: [0, 1.6] },
  edges: [
    ["A", "B", 6],
    ["A", "D", 3],
    ["B", "C", -3],
    ["B", "D", 7],
    ["C", "D", 3],
    ["D", "A", 7],
  ],
  directed: true,
  bend: { "A|D": 16, "D|A": 16 },
};
export const FW_SIZE = { w: 2.4, h: 1.6 };

export type FloydVariant = "right" | "wrong";

export function floydSteps(v: FloydVariant): GraphStep[] {
  const g = FW;
  const names = Object.keys(g.pos);
  const n = names.length;
  const d: number[][] = names.map((_, i) => names.map((_, j) => (i === j ? 0 : Infinity)));
  for (const [a, c, w] of g.edges) d[names.indexOf(a)][names.indexOf(c)] = Math.min(d[names.indexOf(a)][names.indexOf(c)], w);
  const b = new Board(g);
  const mat = (cur?: [number, number], src: [number, number][] = [], bad?: [number, number], doneRows = false): GCell[][] =>
    d.map((row, i) =>
      row.map((x, j) => ({
        v: num(x),
        s: bad && bad[0] === i && bad[1] === j ? "bad" : cur && cur[0] === i && cur[1] === j ? "cur" : doneRows ? "done" : undefined,
        src: src.some(([p, q]) => p === i && q === j),
      })),
    );
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    matrix: mat(),
    caption: "Row i, column j holds the cheapest known cost from i to j. At first only direct lines count: 0 on the diagonal, ∞ where there is no line.",
  });
  const change = (i: number, j: number, k: number, label: string) => {
    const nd = d[i][k] + d[k][j];
    if (nd < d[i][j]) {
      const old = d[i][j];
      d[i][j] = nd;
      // the changed cell is the one heavy frame; i and j are both pale on the graph
      b.flashN.set(names[i], "seen");
      b.flashN.set(names[j], "seen");
      b.flashN.set(names[k], "found");
      out.push({
        ...b.snap(),
        matrix: mat([i, j], [
          [i, k],
          [k, j],
        ]),
        caption: `${label}${names[i]} to ${names[j]} through ${names[k]}: ${plus(d[i][k], d[k][j])} = ${num(nd)}, less than ${num(old)}.`,
        readout: `d[${names[i]}][${names[j]}] = min(${num(old)}, d[${names[i]}][${names[k]}] + d[${names[k]}][${names[j]}]) = ${num(nd)}`,
      });
    }
  };
  if (v === "right") {
    for (let k = 0; k < n; k++) {
      let first = true;
      const before = out.length;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          if (i === k || j === k || d[i][k] === Infinity || d[k][j] === Infinity) continue;
          change(i, j, k, first ? `k = ${names[k]}: now ${names[k]} may be a middle station. ` : "");
          if (out.length > before) first = false;
        }
      if (out.length === before) {
        b.flashN.set(names[k], "found");
        out.push({ ...b.snap(), matrix: mat(), caption: `k = ${names[k]}: going through ${names[k]} makes no cost smaller.` });
      }
    }
    out.push({
      ...b.snap(),
      matrix: mat(undefined, [], undefined, true),
      caption: "All four stations have been allowed in the middle, so every entry is final. B to A costs 7, through C and D: the loop over k, the outer one, built that route from B → C → D (k = C) and then D → A (k = D).",
      verdict: { ok: true, text: "all pairs found" },
    });
  } else {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) {
          if (k === i || k === j || d[i][k] === Infinity || d[k][j] === Infinity) continue;
          change(i, j, k, `Row ${names[i]}, column ${names[j]}, every k in turn. `);
        }
    const bi = names.indexOf("B");
    const ai = names.indexOf("A");
    out.push({
      ...b.snap(),
      matrix: mat(undefined, [], [bi, ai]),
      caption: "Finished, and wrong. B to A is 7 (B → C → D → A), but the table says 14. When row B was filled, C to A was still ∞: row C is filled later. With k inside, each entry gets only one chance.",
      verdict: { ok: false, text: "B to A should be 7" },
    });
  }
  return out;
}

/* ---------- PATH-6.1: relax in topological order; longest paths ---------- */

export const DAG: GDef = {
  pos: { A: [0, 1], B: [1.2, 0], C: [2.4, 2], D: [3.6, 0], E: [3.6, 2], F: [4.8, 1] },
  edges: [
    ["A", "B", 2],
    ["A", "C", 6],
    ["B", "C", 3],
    ["B", "D", 4],
    ["C", "D", -1],
    ["C", "E", 1],
    ["D", "F", 2],
    ["E", "F", 3],
  ],
  directed: true,
};
export const DAG_SIZE = { w: 4.8, h: 2 };

export type DagVariant = "short" | "long";

export function dagSteps(v: DagVariant): GraphStep[] {
  const g = DAG;
  const adj = adjacency(g);
  const b = new Board(g);
  const order = ["A", "B", "C", "D", "E", "F"];
  const better = (x: number, y: number) => (v === "short" ? x < y : x > y);
  const none = v === "short" ? Infinity : -Infinity;
  const dist: Record<string, number> = { A: 0 };
  const parent: Record<string, string> = {};
  for (const x of order) b.tag.set(x, x === "A" ? "0" : v === "short" ? "∞" : "−∞");
  const oq = (k: number): QItem[] => order.map((x, i) => ({ v: x, s: i < k ? "done" : i === k ? "cur" : undefined }));
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    order: oq(-1),
    caption:
      v === "short"
        ? "A DAG: every edge points right, so A, B, C, D, E, F is a topological order (GRPH-5). C → D takes −1. Handle the stations in this order, each once."
        : "The same DAG, now looking for the longest route from A: the slowest chain of tasks. Start at −∞ (no route yet) and keep the larger value.",
  });
  order.forEach((u, k) => {
    b.flashN.set(u, "cur");
    if (dist[u] === undefined) {
      out.push({ ...b.snap(), order: oq(k), caption: `${u} has no route from A, so its edges are skipped.` });
      return;
    }
    if (parent[u]) b.edge(parent[u], u, "tree");
    const ch: string[] = [];
    const no: string[] = [];
    for (const [w, c] of adj[u]) {
      const nd = dist[u] + c;
      if (better(nd, dist[w] ?? none)) {
        if (parent[w]) b.edge(parent[w], w, "");
        dist[w] = nd;
        parent[w] = u;
        b.tag.set(w, num(nd));
        b.st.set(w, "seen");
        b.flash(u, w, "cur");
        ch.push(`${w} ${num(nd)}`);
      } else {
        no.push(w);
        b.flash(u, w, "old");
      }
    }
    let caption =
      k === 0
        ? `A comes first. Every edge into a station comes from earlier in the order, so A’s ${v === "short" ? "time" : "value"}, 0, is final. `
        : `${u} is next. All edges into ${u} are done, so its ${v === "short" ? "time" : "value"}, ${num(dist[u])}, is final. `;
    if (ch.length) caption += `Relax its edges: ${list(ch)}. `;
    if (no.length) caption += `${list(no)} ${no.length === 1 ? "keeps its" : "keep their"} ${v === "short" ? "smaller time" : "larger value"}.`;
    if (!adj[u].length) caption += "It has no edges out.";
    out.push({ ...b.snap(), order: oq(k), caption: caption.trim() });
    b.st.set(u, "done");
  });
  const path = ["F"];
  while (path[path.length - 1] !== "A") path.push(parent[path[path.length - 1]]);
  for (let k = 0; k + 1 < path.length; k++) b.edge(path[k], path[k + 1], "found");
  for (const x of path) b.st.set(x, "found");
  out.push({
    ...b.snap(),
    order: oq(order.length),
    caption:
      v === "short"
        ? `One pass over the order, each edge relaxed once: O(V + E). The negative edge caused no trouble. The cheapest route to F is ${[...path].reverse().join(" → ")}.`
        : `The longest route to F is ${[...path].reverse().join(" → ")}, ${dist.F} in all. In a DAG this is as easy as the shortest route; in a graph with cycles it is a hard problem (HARD).`,
    verdict: { ok: true, text: `${v === "short" ? "cheapest" : "longest"}: ${num(dist.F)}` },
  });
  return out;
}

/* ---------- PATH-7.1: Dijkstra and A* on a small grid ---------- */

const ROWS = 6;
const COLS = 8;
const START: [number, number] = [2, 0];
const GOAL: [number, number] = [2, 7];
const WALLS = new Set(["1,4", "2,4", "3,4", "4,4", "5,4", "0,2", "1,2"]);

export type StarVariant = "dijkstra" | "astar";

export function starSteps(v: StarVariant): GridStep[] {
  const h = (r: number, c: number) => (v === "astar" ? Math.abs(r - GOAL[0]) + Math.abs(c - GOAL[1]) : 0);
  const g = new Map<string, number>([[`${START}`, 0]]);
  const parent = new Map<string, string>();
  const closed = new Set<string>();
  const heap: [number, number, number, number][] = [[h(...START), 0, START[0], START[1]]]; // f, -g, r, c
  const out: GridStep[] = [];
  const cells = (cur?: string, path: string[] = []): GCell[][] =>
    Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        const k = `${r},${c}`;
        if (WALLS.has(k)) return { s: "out" as const };
        const isGoal = r === GOAL[0] && c === GOAL[1];
        const val = g.has(k) ? g.get(k)! : undefined;
        let s: GCell["s"];
        if (k === cur) s = isGoal ? "found" : "cur";
        else if (path.includes(k)) s = isGoal ? "found" : "path";
        else if (closed.has(k)) s = "done";
        return { v: val ?? (isGoal ? "G" : ""), s, tag: v === "astar" && val !== undefined && !closed.has(k) ? h(r, c) : undefined };
      }),
    );
  out.push({
    cells: cells(),
    caption:
      v === "dijkstra"
        ? "Find the fewest moves from the 0 at the left to G at the right. Every move costs 1. Dijkstra’s method (here the same as breadth-first search) takes squares in order of g, the moves so far."
        : "The same grid. A* takes squares in order of f = g + h, where h is the Manhattan distance to G: |rows apart| + |columns apart|. The small tags show h for squares waiting in the heap.",
  });
  let found = false;
  let lastF = h(...START);
  while (heap.length && !found) {
    heap.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || x[3] - y[3]);
    // Dijkstra's figure moves one whole layer per step (all squares with the same g), A* one square per step
    const batch: [number, number, number, number][] = [];
    const f0 = heap[0][0];
    if (v === "dijkstra") while (heap.length && heap[0][0] === f0) batch.push(heap.shift()!);
    else batch.push(heap.shift()!);
    const taken: string[] = [];
    for (const [, ng, r, c] of batch) {
      const k = `${r},${c}`;
      if (closed.has(k) || -ng > g.get(k)!) continue;
      closed.add(k);
      taken.push(k);
      if (r === GOAL[0] && c === GOAL[1]) {
        found = true;
        break;
      }
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nr = r + dr;
        const nc = c + dc;
        const nk = `${nr},${nc}`;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || WALLS.has(nk)) continue;
        const nd = -ng + 1;
        if (nd < (g.get(nk) ?? Infinity)) {
          g.set(nk, nd);
          parent.set(nk, k);
          heap.push([nd + h(nr, nc), -nd, nr, nc]);
        }
      }
    }
    if (!taken.length) continue;
    const last = taken[taken.length - 1];
    const [lr, lc] = last.split(",").map(Number);
    const gl = g.get(last)!;
    let caption: string;
    if (found) break;
    if (v === "dijkstra")
      caption = `Take every square with g = ${gl} (${taken.length} ${taken.length === 1 ? "square" : "squares"}) and give ${taken.length === 1 ? "its" : "their"} free neighbours g = ${gl + 1}. The search spreads out evenly in every direction.`;
    else {
      const f = gl + h(lr, lc);
      caption = `Take the square with the smallest f: g = ${gl}, h = ${h(lr, lc)}, f = ${f}. `;
      if (closed.size === 1) caption += "Its neighbours get g = 1 and wait in the heap.";
      else if (f > lastF) caption += `No square with f = ${lastF} is left: the wall blocks the straight way, so the smallest f is now ${f}.`;
      else if (closed.size === 2) caption += "Several squares have f = 7; the one with the larger g, nearer the goal, goes first.";
      else caption += `Still f = ${f}: the larger g goes first.`;
      lastF = f;
    }
    out.push({ cells: cells(v === "astar" ? last : undefined), caption, readout: `squares taken: ${closed.size}` });
  }
  const path: string[] = [];
  let k: string | undefined = `${GOAL}`;
  while (k) {
    path.push(k);
    k = parent.get(k);
  }
  out.push({
    cells: cells(`${GOAL}`, path),
    caption:
      v === "dijkstra"
        ? `G is taken after ${closed.size} squares: the fewest moves is ${g.get(`${GOAL}`)}. Most of those squares lie away from G; Dijkstra’s method cannot tell which way G is.`
        : `G is taken after only ${closed.size} squares, with the same ${g.get(`${GOAL}`)} moves. The guess h steered the search towards G, and round the wall.`,
    readout: `squares taken: ${closed.size}`,
    verdict: { ok: true, text: `${g.get(`${GOAL}`)} moves` },
  });
  return out;
}
