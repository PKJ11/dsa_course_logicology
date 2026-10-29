// GRPH step generators. Every figure is a list of steps made up front; each step is a full picture of the graph
// (vertex and edge states, tags) plus its side panel (a queue, a stack, a table or a grid).

import type { Frame, GCell, GEdge, GEdgeState, GNode, GState, QItem } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
export type Row = { k: string; v: string; cur?: boolean };

export type GraphStep = {
  nodes: GNode[];
  edges: GEdge[];
  caption: string;
  queue?: QItem[];
  order?: QItem[];
  frames?: Frame[];
  rows?: Row[];
  matrix?: GCell[][];
  readout?: string;
  verdict?: Verdict;
};

export type GridStep = { cells: GCell[][]; queue: QItem[]; caption: string; readout?: string; verdict?: Verdict };

/* ---------- a small graph and a board that remembers its marks ---------- */

type GDef = {
  pos: Record<string, [number, number]>;
  edges: [string, string][];
  directed: boolean;
  bend?: Record<string, number>;
  /** tag corners per vertex, where the default top right is taken by an edge */
  tagAt?: Record<string, GNode["tagAt"]>;
};

const key = (g: GDef, a: string, b: string) => (g.directed || a < b ? `${a}|${b}` : `${b}|${a}`);

/** Neighbours of each vertex in alphabetical (or number) order. */
function adjacency(g: GDef): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const v of Object.keys(g.pos)) adj[v] = [];
  for (const [a, b] of g.edges) {
    adj[a].push(b);
    if (!g.directed) adj[b].push(a);
  }
  const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : NaN);
  for (const v of Object.keys(adj)) adj[v].sort((x, y) => (Number.isNaN(num(x)) ? x.localeCompare(y) : num(x) - num(y)));
  return adj;
}

class Board {
  st = new Map<string, GState>();
  tag = new Map<string, string>();
  tk = new Map<string, "ink" | "plain" | "bad">();
  es = new Map<string, GEdgeState>();
  el = new Map<string, string>();
  /** marks that last one step only */
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
      tagAt: this.g.tagAt?.[id],
    }));
  }
  edges(): GEdge[] {
    return this.g.edges.map(([a, b]) => {
      const k = key(this.g, a, b);
      return { a, b, state: this.flashE.get(k) ?? this.es.get(k) ?? "", label: this.el.get(k), bend: this.g.bend?.[k] };
    });
  }
  snap(): Pick<GraphStep, "nodes" | "edges"> {
    const s = { nodes: this.nodes(), edges: this.edges() };
    this.flashN.clear();
    this.flashE.clear();
    return s;
  }
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/* ---------- the line used in lessons 1 and 2: 7 stations, 8 edges ---------- */

const LINE_POS: Record<string, [number, number]> = { A: [0, 1], B: [1.5, 0], C: [1.5, 2], D: [3, 0], E: [3, 2], F: [4.5, 1], G: [6, 1] };
const LINE_EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "D"],
  ["C", "E"],
  ["D", "F"],
  ["E", "F"],
  ["F", "G"],
];
export const LINE: GDef = { pos: LINE_POS, edges: LINE_EDGES, directed: false };
export const LINE_DIRECTED: GDef = { pos: LINE_POS, edges: LINE_EDGES, directed: true };
export const LINE_SIZE = { w: 6, h: 2 };

/* ---------- GRPH-1.1: one graph stored three ways ---------- */

export type RepVariant = "lists" | "matrix" | "edges" | "directed";

export function repSteps(v: RepVariant): GraphStep[] {
  const g = v === "directed" ? LINE_DIRECTED : LINE;
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const lists: Record<string, string[]> = Object.fromEntries(names.map((n) => [n, []]));
  const M = names.map(() => names.map(() => 0));
  const added: string[] = [];
  const out: GraphStep[] = [];
  for (const [a, c] of g.edges) b.edge(a, c, "todo");
  const side = (changed: string[], cells: [number, number][]) => {
    if (v === "matrix")
      return { matrix: M.map((row, i) => row.map((x, j) => ({ v: x, s: cells.some(([p, q]) => p === i && q === j) ? ("cur" as const) : undefined }))) };
    if (v === "edges") return { rows: added.map((e, i) => ({ k: String(i), v: e, cur: i === added.length - 1 && changed.length > 0 })) };
    return { rows: names.map((n) => ({ k: n, v: lists[n].length ? lists[n].join(", ") : "–", cur: changed.includes(n) })) };
  };
  out.push({
    ...b.snap(),
    ...side([], []),
    caption:
      v === "directed"
        ? "The same seven vertices, but now every edge goes one way, from left to right. The dashed edges are still to be added."
        : "Seven vertices, A to G. The dashed edges are still to be added, one at a time, in the order of the edge list.",
  });
  g.edges.forEach(([a, c], k) => {
    const i = names.indexOf(a);
    const j = names.indexOf(c);
    lists[a].push(c);
    if (!g.directed) lists[c].push(a);
    M[i][j] = 1;
    if (!g.directed) M[j][i] = 1;
    added.push(g.directed ? `(${a}, ${c})` : `(${a}, ${c})`);
    b.edge(a, c, "");
    b.flash(a, c, "cur");
    let caption: string;
    if (v === "lists")
      caption =
        k === 0
          ? `Edge ${a}–${c}: add ${c} to ${a}’s list, and ${a} to ${c}’s list. An edge that goes both ways is stored twice.`
          : `Edge ${a}–${c}: ${c} joins ${a}’s list, and ${a} joins ${c}’s list.`;
    else if (v === "matrix")
      caption =
        k === 0
          ? `Edge ${a}–${c}: set row ${a}, column ${c} to 1, and row ${c}, column ${a} too. The matrix stays the same when flipped across its diagonal.`
          : `Edge ${a}–${c}: two more 1s, at (${a}, ${c}) and (${c}, ${a}).`;
    else if (v === "edges")
      caption = k === 0 ? `Edge ${a}–${c} is one row of the edge list. Nothing else is stored.` : `Edge ${a}–${c}: one more row.`;
    else caption = k === 0 ? `Edge ${a} → ${c}: add ${c} to ${a}’s list only. A one-way edge is stored once.` : `Edge ${a} → ${c}: ${c} joins ${a}’s list.`;
    out.push({ ...b.snap(), ...side(g.directed ? [a] : [a, c], g.directed ? [[i, j]] : [[i, j], [j, i]]), caption });
  });
  if (v === "directed") {
    for (const n of names) b.tag.set(n, String(g.edges.filter(([, c]) => c === n).length));
  } else {
    for (const n of names) b.tag.set(n, String(lists[n].length));
  }
  const final: Record<RepVariant, string> = {
    lists: "Each tag is a degree: the number of edges at that vertex, which is also the length of its list. The degrees add up to 16, twice the 8 edges, because every edge has two ends.",
    matrix: "Each tag is a degree, and each row of the matrix adds up to it. The matrix has 7 · 7 = 49 entries for 8 edges; listing C’s neighbours means reading all of row C.",
    edges: "8 rows, one per edge: the least memory. But to find C’s neighbours, every row must be read. Each tag is a degree.",
    directed:
      "Each tag is an in-degree: the number of edges coming in. The length of a list is the out-degree. A has in-degree 0: nothing leads to it. Lesson 5 starts from such vertices.",
  };
  out.push({ ...b.snap(), ...side([], []), caption: final[v] });
  return out;
}

/* ---------- GRPH-2.1: breadth-first search ---------- */

export type BfsVariant = "one" | "many";

export function bfsSteps(v: BfsVariant): GraphStep[] {
  const g = LINE;
  const adj = adjacency(g);
  const b = new Board(g);
  const starts = v === "one" ? ["A"] : ["A", "G"];
  const dist: Record<string, number> = {};
  const parent: Record<string, string> = {};
  const q: string[] = [];
  const out: GraphStep[] = [];
  const qi = (cur?: string): QItem[] => q.map((x) => ({ v: x, s: x === cur ? "cur" : "seen" }));
  for (const s of starts) {
    dist[s] = 0;
    b.st.set(s, "seen");
    b.tag.set(s, "0");
    q.push(s);
  }
  out.push({
    ...b.snap(),
    queue: qi(),
    caption:
      v === "one"
        ? "Start at A. It is 0 edges from itself. Mark it as reached, with its distance as a tag, and put it in the queue."
        : "Two starts, A and G. Both are 0 edges from a start, so both are reached and both go in the queue before the search begins.",
  });
  while (q.length) {
    const u = q.shift()!;
    const fresh: string[] = [];
    const old: string[] = [];
    for (const w of adj[u]) {
      if (dist[w] === undefined) {
        dist[w] = dist[u] + 1;
        parent[w] = u;
        b.st.set(w, "seen");
        b.tag.set(w, String(dist[w]));
        b.edge(u, w, "tree");
        b.flash(u, w, "cur");
        q.push(w);
        fresh.push(w);
      } else if (parent[u] !== w) {
        old.push(w);
        b.flash(u, w, "old");
      }
    }
    b.flashN.set(u, "cur");
    const d = dist[u];
    let caption = `Take ${u} from the front of the queue (distance ${d}). `;
    if (fresh.length)
      caption += `${fresh.length === 1 ? "Its neighbour" : "Its neighbours"} ${list(fresh)} ${fresh.length === 1 ? "is" : "are"} new: ${d + 1} ${d + 1 === 1 ? "edge" : "edges"} from ${v === "one" ? "A" : "a start"}. Mark ${fresh.length === 1 ? "it" : "them"} and add ${fresh.length === 1 ? "it" : "them"} to the back of the queue.`;
    else caption += "It has no new neighbours.";
    // name every neighbour already reached, the one this vertex was reached from included
    const before = parent[u] !== undefined && parent[u] !== null && !old.includes(parent[u] as never) ? [...old, parent[u]] : old;
    if (before.length) caption += ` ${list(before as typeof old)} ${before.length === 1 ? "was" : "were"} reached already, so ${before.length === 1 ? "it is" : "they are"} skipped.`;
    out.push({ ...b.snap(), queue: [{ v: u, s: "cur" }, ...qi()], caption });
    b.st.set(u, "done");
  }
  if (v === "one") {
    const path = ["G"];
    while (path[path.length - 1] !== "A") path.push(parent[path[path.length - 1]]);
    for (let k = 0; k + 1 < path.length; k++) b.edge(path[k], path[k + 1], "found");
    for (const x of path) b.st.set(x, "found");
    out.push({
      ...b.snap(),
      queue: [],
      caption: `The queue is empty: every vertex has its distance. For a route to G, follow the edges that first reached each vertex, backwards: ${path.join(" ← ")}. It has 4 edges, the fewest possible.`,
      verdict: { ok: true, text: `route ${[...path].reverse().join(" → ")}` },
    });
  } else {
    out.push({
      ...b.snap(),
      queue: [],
      caption: "The queue is empty. Each tag is the distance to the nearer start: one search from both starts at once, not one search per start.",
      verdict: { ok: true, text: "all distances found" },
    });
  }
  return out;
}

/* ---------- GRPH-3.1: depth-first search, with discovery and finish times ---------- */

export const DFS_G: GDef = {
  pos: { A: [0, 0.7], B: [2, 0.7], C: [4, 0.7], D: [2, 2.7], E: [4, 2.7], F: [6, 1.7] },
  edges: [
    ["A", "B"],
    ["A", "D"],
    ["B", "C"],
    ["B", "D"],
    ["C", "A"],
    ["D", "C"],
    ["E", "D"],
    ["E", "F"],
    ["F", "C"],
  ],
  directed: true,
  bend: { "C|A": 90 },
  // the back edge C → A comes into A's top right corner, so A's tag goes on the left
  tagAt: { A: "tl" },
};

export type DfsVariant = "rec" | "stack";

export function dfsSteps(v: DfsVariant): GraphStep[] {
  const g = DFS_G;
  const adj = adjacency(g);
  const b = new Board(g);
  const d: Record<string, number> = {};
  const f: Record<string, number> = {};
  const nextAt: Record<string, number> = {};
  const path: string[] = [];
  let time = 0;
  const out: GraphStep[] = [];
  const frames = (): Frame[] =>
    v === "rec"
      ? path.map((x, i) => ({ name: `dfs(${x})`, state: i === path.length - 1 ? "cur" : "wait" }))
      : path.map((x) => ({ name: x, vars: nextAt[x] < adj[x].length ? `next: ${adj[x][nextAt[x]]}` : "all tried", state: "wait" }));
  const tagOf = (x: string) => (f[x] ? `${d[x]}/${f[x]}` : `${d[x]}/`);
  const push = (caption: string, top?: string) => {
    if (top) b.flashN.set(top, "cur");
    out.push({ ...b.snap(), frames: frames(), caption });
  };
  const reach = (x: string, from?: string) => {
    d[x] = ++time;
    nextAt[x] = 0;
    path.push(x);
    b.st.set(x, "seen");
    b.tag.set(x, tagOf(x));
    if (from) {
      b.edge(from, x, "tree");
      b.flash(from, x, "cur");
    }
  };
  for (const s of Object.keys(g.pos)) {
    if (d[s]) continue;
    reach(s);
    push(
      s === "A"
        ? `Start at A. It is discovered at time 1, and goes on the path. Its tag will read discovery/finish.`
        : `The search from A is over, but ${s} was never reached. Start again from ${s}: discovered at time ${d[s]}.`,
      s,
    );
    while (path.length) {
      const u = path[path.length - 1];
      if (nextAt[u] < adj[u].length) {
        const w = adj[u][nextAt[u]++];
        if (!d[w]) {
          reach(w, u);
          push(
            v === "rec"
              ? `${u} → ${w}: ${w} is new. Call dfs(${w}); ${u} waits. ${w} is discovered at time ${d[w]}. This is a tree edge.`
              : `${u} → ${w}: ${w} is new. Push ${w} with its own place in its list; ${u} keeps its place for later. ${w} is discovered at time ${d[w]}.`,
            w,
          );
        } else if (!f[w]) {
          b.edge(u, w, "old");
          b.el.set(key(g, u, w), "back");
          b.flash(u, w, "cur");
          push(`${u} → ${w}: ${w} is still on the path, so this edge leads back to a vertex above ${u}. It is a back edge. Lesson 4: a back edge means a cycle.`, u);
        } else if (d[w] > d[u]) {
          b.edge(u, w, "old");
          b.el.set(key(g, u, w), "forward");
          b.flash(u, w, "cur");
          push(`${u} → ${w}: ${w} is finished and was discovered after ${u}, so it is already below ${u} in the search. A forward edge.`, u);
        } else {
          b.edge(u, w, "old");
          b.el.set(key(g, u, w), "cross");
          b.flash(u, w, "cur");
          push(`${u} → ${w}: ${w} is finished and was discovered before ${u}. Neither is above the other: a cross edge.`, u);
        }
      } else {
        f[u] = ++time;
        path.pop();
        b.st.set(u, "done");
        b.tag.set(u, tagOf(u));
        b.tk.set(u, "ink");
        const back = path[path.length - 1];
        push(
          `${u} has no neighbours left to try. It finishes at time ${f[u]}${back ? ` and leaves the path; ${v === "rec" ? `dfs(${back}) carries on` : `${back} is on top again`}.` : "."}`,
          back,
        );
      }
    }
  }
  out.push({
    ...b.snap(),
    frames: [],
    caption:
      "Done: every vertex has discovery/finish times. For any two vertices, their time spans are either one inside the other (one is below the other in the search) or apart. They never overlap partly.",
    verdict: { ok: true, text: "finish order C D B A F E" },
  });
  return out;
}

/* ---------- GRPH-4.1: finding a cycle ---------- */

export type CycleVariant = "directed" | "diamond" | "undirected";

const CYC_D: GDef = {
  pos: { A: [0, 1], B: [2, 1], C: [4, 2], D: [4, 0], E: [6, 1] },
  edges: [
    ["A", "B"],
    ["B", "C"],
    ["B", "D"],
    ["D", "C"],
    ["D", "E"],
    ["E", "B"],
  ],
  directed: true,
};
const CYC_DIAMOND: GDef = {
  pos: { A: [0, 1], B: [2, 0], C: [2, 2], D: [4, 1] },
  edges: [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "D"],
  ],
  directed: true,
};
const CYC_U: GDef = {
  pos: { A: [0, 1], B: [2, 0], C: [2, 2], D: [4, 2] },
  edges: [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
    ["C", "D"],
  ],
  directed: false,
};

export const CYCLE_GRAPHS: Record<CycleVariant, { g: GDef; w: number; h: number }> = {
  directed: { g: CYC_D, w: 6, h: 2 },
  diamond: { g: CYC_DIAMOND, w: 4, h: 2 },
  undirected: { g: CYC_U, w: 4, h: 2 },
};

export function cycleSteps(v: CycleVariant): GraphStep[] {
  const { g } = CYCLE_GRAPHS[v];
  const adj = adjacency(g);
  const b = new Board(g);
  const state: Record<string, number> = {};
  const parent: Record<string, string> = {};
  const nextAt: Record<string, number> = {};
  const path: string[] = [];
  const out: GraphStep[] = [];
  const frames = (): Frame[] => path.map((x) => ({ name: x, vars: nextAt[x] < adj[x].length ? `next: ${adj[x][nextAt[x]]}` : "all tried", state: "wait" }));
  const push = (caption: string, top?: string, verdict?: Verdict) => {
    if (top) b.flashN.set(top, "cur");
    out.push({ ...b.snap(), frames: frames(), caption, verdict });
  };
  const reach = (x: string, from?: string) => {
    state[x] = 1;
    nextAt[x] = 0;
    path.push(x);
    b.st.set(x, "seen");
    if (from) {
      parent[x] = from;
      b.edge(from, x, "tree");
      b.flash(from, x, "cur");
    }
  };
  const first: Record<CycleVariant, string> = {
    directed: "Start at A. A vertex has one of three states: not reached (white), on the current path (pale), or finished (black). A goes on the path.",
    diamond: "Two routes from A lead to D. Start at A, with the same three states.",
    undirected: "Edges go both ways now. Start at A. In an undirected graph the edge back to the vertex you came from is not a cycle, so each vertex remembers its parent.",
  };
  const to = g.directed ? "→" : "–";
  reach("A");
  push(first[v], "A");
  while (path.length) {
    const u = path[path.length - 1];
    if (nextAt[u] < adj[u].length) {
      const w = adj[u][nextAt[u]++];
      if (!state[w]) {
        reach(w, u);
        push(`${u} ${to} ${w}: ${w} is not reached yet. It goes on the path.`, w);
      } else if (state[w] === 2) {
        b.flash(u, w, "old");
        push(`${u} ${to} ${w}: ${w} is finished. Everything ${w} leads to was searched, and none of it led back to the path. So this is not a cycle, only a second way to reach ${w}.`, u);
      } else if (!g.directed && parent[u] === w) {
        b.flash(u, w, "old");
        push(`${u} – ${w}: this is the edge ${u} was reached by, from its parent ${w}. Going back along it is not a cycle.`, u);
      } else {
        const cyc = [u];
        while (cyc[cyc.length - 1] !== w) cyc.push(parent[cyc[cyc.length - 1]]);
        cyc.reverse();
        for (let k = 0; k < cyc.length; k++) b.edge(cyc[k], cyc[(k + 1) % cyc.length], "found");
        for (const x of cyc) b.st.set(x, "found");
        push(
          `${u} ${to} ${w}: ${w} is on the current path${g.directed ? "" : ", and it is not the parent of " + u}. The path runs from ${w} down to ${u}, and this edge goes back up: a cycle. Follow the parents from ${u} back to ${w}: ${cyc.join(` ${to} `)} ${to} ${w}.`,
          undefined,
          { ok: true, text: `cycle ${cyc.join(` ${to} `)} ${to} ${w}` },
        );
        return out;
      }
    } else {
      state[u] = 2;
      path.pop();
      b.st.set(u, "done");
      push(`${u} has no neighbours left. It is finished and leaves the path.`, path[path.length - 1]);
    }
  }
  out.push({
    ...b.snap(),
    frames: [],
    caption: "Every vertex is finished and no edge led back to the path, so the graph has no cycle. D was reached twice, but a second way in is not a way back.",
    verdict: { ok: true, info: true, text: "no cycle" },
  });
  return out;
}

/* ---------- GRPH-5.1: topological sort ---------- */

export type TopoVariant = "kahn" | "dfs" | "cycle";

const TOPO_POS: Record<string, [number, number]> = { "5": [0, 0], "2": [2, 0], "3": [4, 0], "4": [0, 2], "0": [2, 2], "1": [4, 2] };
const TOPO_EDGES: [string, string][] = [
  ["5", "2"],
  ["5", "0"],
  ["4", "0"],
  ["4", "1"],
  ["2", "3"],
  ["3", "1"],
];
export const TOPO: GDef = { pos: TOPO_POS, edges: TOPO_EDGES, directed: true, bend: { "4|1": 46 } };
export const TOPO_CYCLE: GDef = { pos: TOPO_POS, edges: [...TOPO_EDGES, ["1", "2"]], directed: true, bend: { "4|1": 46 } };
export const TOPO_SIZE = { w: 4, h: 2.6 };

export function topoSteps(v: TopoVariant): GraphStep[] {
  const g = v === "cycle" ? TOPO_CYCLE : TOPO;
  return v === "dfs" ? topoDfs(g) : topoKahn(g, v === "cycle");
}

function topoKahn(g: GDef, cyc: boolean): GraphStep[] {
  const adj = adjacency(g);
  const b = new Board(g);
  const names = Object.keys(g.pos);
  const indeg: Record<string, number> = Object.fromEntries(names.map((n) => [n, 0]));
  for (const [, c] of g.edges) indeg[c]++;
  for (const n of names) b.tag.set(n, String(indeg[n]));
  const ready = names.filter((n) => indeg[n] === 0).sort((x, y) => Number(x) - Number(y));
  for (const n of ready) b.st.set(n, "seen");
  const order: string[] = [];
  const out: GraphStep[] = [];
  const rq = (): QItem[] => ready.map((x) => ({ v: x, s: "seen" }));
  const oq = (): QItem[] => order.map((x) => ({ v: x, s: "done" }));
  out.push({
    ...b.snap(),
    queue: rq(),
    order: [],
    caption: `Each tag is an in-degree: how many edges come in. Vertices with in-degree 0 (${list(ready)}) have nothing that must come before them. They are ready.`,
  });
  while (ready.length) {
    ready.sort((x, y) => Number(x) - Number(y));
    const u = ready.shift()!;
    order.push(u);
    const freed: string[] = [];
    for (const w of adj[u]) {
      indeg[w]--;
      b.tag.set(w, String(indeg[w]));
      b.edge(u, w, "old");
      b.flash(u, w, "cur");
      if (indeg[w] === 0) {
        ready.push(w);
        freed.push(w);
        b.st.set(w, "seen");
      }
    }
    ready.sort((x, y) => Number(x) - Number(y));
    b.flashN.set(u, "cur");
    b.st.set(u, "done");
    let caption = `Take the smallest ready vertex, ${u}, and put it next in the order. `;
    caption += adj[u].length ? `Remove its edges: ${list(adj[u])} ${adj[u].length === 1 ? "loses" : "each lose"} one edge coming in.` : "It has no edges going out.";
    if (freed.length) caption += ` ${list(freed)} ${freed.length === 1 ? "is" : "are"} now at 0, so ${freed.length === 1 ? "it is" : "they are"} ready.`;
    out.push({ ...b.snap(), queue: rq(), order: oq(), caption });
  }
  if (cyc) {
    const left = names.filter((n) => !order.includes(n));
    for (const n of left) {
      b.st.set(n, "bad");
      b.tk.set(n, "bad");
    }
    for (const [a, c] of g.edges) if (left.includes(a) && left.includes(c)) b.edge(a, c, "bad");
    out.push({
      ...b.snap(),
      queue: [],
      order: oq(),
      caption: `Nothing is ready, but ${list(left)} ${left.length === 1 ? "is" : "are"} still left. Each waits for another: 2 → 3 → 1 → 2 is a cycle, so no order can keep all the rules.`,
      verdict: { ok: false, text: `${order.length} of ${names.length} placed: a cycle` },
    });
  } else {
    out.push({
      ...b.snap(),
      queue: [],
      order: oq(),
      caption: "Every vertex is placed, so every edge points forward in this order. Taking the smallest ready vertex each time gives the smallest such order (P5).",
      verdict: { ok: true, text: `order ${order.join(" ")}` },
    });
  }
  return out;
}

function topoDfs(g: GDef): GraphStep[] {
  const adj = adjacency(g);
  const b = new Board(g);
  const seen: Record<string, boolean> = {};
  const nextAt: Record<string, number> = {};
  const path: string[] = [];
  const order: string[] = [];
  const out: GraphStep[] = [];
  const names = Object.keys(g.pos).sort((x, y) => Number(x) - Number(y));
  const oq = (): QItem[] => order.map((x) => ({ v: x, s: "done" }));
  const frames = (): Frame[] => path.map((x) => ({ name: x, vars: nextAt[x] < adj[x].length ? `next: ${adj[x][nextAt[x]]}` : "all tried", state: "wait" }));
  const push = (caption: string, top?: string, verdict?: Verdict) => {
    if (top) b.flashN.set(top, "cur");
    out.push({ ...b.snap(), frames: frames(), order: oq(), caption, verdict });
  };
  for (const s of names) {
    if (seen[s]) continue;
    seen[s] = true;
    nextAt[s] = 0;
    path.push(s);
    b.st.set(s, "seen");
    push(s === "0" ? "Depth-first search from 0, then from each vertex not yet reached, in number order. When a vertex finishes, it goes to the front of the order." : `Start again from ${s}.`, s);
    while (path.length) {
      const u = path[path.length - 1];
      if (nextAt[u] < adj[u].length) {
        const w = adj[u][nextAt[u]++];
        if (!seen[w]) {
          seen[w] = true;
          nextAt[w] = 0;
          path.push(w);
          b.st.set(w, "seen");
          b.edge(u, w, "tree");
          b.flash(u, w, "cur");
          push(`${u} → ${w}: ${w} is new and goes on the path.`, w);
        } else {
          b.flash(u, w, "old");
          push(`${u} → ${w}: ${w} is already finished, so it is already in the order, after where ${u} will go.`, u);
        }
      } else {
        path.pop();
        order.unshift(u);
        b.st.set(u, "done");
        push(`${u} finishes. Everything it leads to is already in the order, so put ${u} in front of them.`, path[path.length - 1]);
      }
    }
  }
  push("The order is the finish order reversed. For every edge u → v, v finished before u, so u comes first: every edge points forward.", undefined, {
    ok: true,
    text: `order ${order.join(" ")}`,
  });
  return out;
}

/* ---------- GRPH-6.1: two teams ---------- */

export type TeamsVariant = "even" | "odd";

export const TEAMS_EVEN: GDef = {
  pos: { A: [0, 1], B: [1.5, 0], C: [3, 0], D: [4.5, 1], E: [3, 2], F: [1.5, 2], G: [6, 1] },
  edges: [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "E"],
    ["E", "F"],
    ["F", "A"],
    ["B", "E"],
    ["D", "G"],
  ],
  directed: false,
};
export const TEAMS_ODD: GDef = {
  pos: { A: [0, 1], B: [1.5, 0], C: [3.5, 0], D: [3.5, 2], E: [1.5, 2], F: [5.5, 1] },
  edges: [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "E"],
    ["E", "A"],
    ["C", "F"],
  ],
  directed: false,
};

export function teamsSteps(v: TeamsVariant): GraphStep[] {
  const g = v === "even" ? TEAMS_EVEN : TEAMS_ODD;
  const adj = adjacency(g);
  const b = new Board(g);
  const side: Record<string, number> = {};
  const parent: Record<string, string> = {};
  const q: string[] = [];
  const out: GraphStep[] = [];
  const setSide = (x: string, t: number) => {
    side[x] = t;
    b.tag.set(x, String(t));
    b.tk.set(x, t ? "ink" : "plain");
  };
  setSide("A", 0);
  b.st.set("A", "seen");
  q.push("A");
  out.push({
    ...b.snap(),
    queue: [{ v: "A", s: "seen" }],
    caption: "Each edge joins two people who must be on different teams. Put A on team 0 (the tag) and start a breadth-first search from A.",
  });
  while (q.length) {
    const u = q.shift()!;
    const fresh: string[] = [];
    for (const w of adj[u]) {
      if (side[w] === undefined) {
        setSide(w, 1 - side[u]);
        parent[w] = u;
        b.st.set(w, "seen");
        b.edge(u, w, "tree");
        b.flash(u, w, "cur");
        q.push(w);
        fresh.push(w);
      } else if (side[w] === side[u]) {
        // u and w are on the same level: walk up from both until the routes meet
        const a = [u];
        const c = [w];
        while (a[a.length - 1] !== c[c.length - 1]) {
          a.push(parent[a[a.length - 1]]);
          c.push(parent[c[c.length - 1]]);
        }
        const cyc = [...a, ...c.slice(0, -1).reverse()];
        b.edge(u, w, "bad");
        b.flashN.set(u, "cur");
        out.push({
          ...b.snap(),
          queue: q.map((x) => ({ v: x, s: "seen" })),
          caption: `Take ${u}. Its neighbour ${w} is already on team ${side[w]}, the same team as ${u}. The edge ${u}–${w} breaks the rule.`,
        });
        for (let k = 0; k < cyc.length; k++) {
          const x = cyc[k];
          const y = cyc[(k + 1) % cyc.length];
          if (!(x === u && y === w) && !(x === w && y === u)) b.edge(x, y, "found");
        }
        for (const x of cyc) b.st.set(x, "found");
        b.edge(u, w, "bad");
        out.push({
          ...b.snap(),
          queue: [],
          caption: `${u} and ${w} are both ${a.length - 1} edges from where their routes meet, at ${a[a.length - 1]}. The two routes and the edge ${u}–${w} make a cycle of ${cyc.length} people: ${cyc.join(", ")}. An odd cycle cannot be split into two teams.`,
          verdict: { ok: false, info: true, text: `odd cycle ${cyc.join(" ")}` },
        });
        return out;
      }
    }
    b.flashN.set(u, "cur");
    let caption = `Take ${u} (team ${side[u]}). `;
    caption += fresh.length
      ? `${list(fresh)} ${fresh.length === 1 ? "goes" : "go"} on team ${1 - side[u]}, the other team.`
      : "All its neighbours already have a team, and every one is on the other team.";
    out.push({ ...b.snap(), queue: [{ v: u, s: "cur" }, ...q.map((x): QItem => ({ v: x, s: "seen" }))], caption });
    b.st.set(u, "done");
  }
  out.push({
    ...b.snap(),
    queue: [],
    caption: "Every edge joins a team-0 person to a team-1 person, including the edge B–E. Team 0 is the even distances from A, team 1 the odd ones.",
    verdict: { ok: true, text: "two teams" },
  });
  return out;
}

/* ---------- GRPH-7.1: grids as graphs ---------- */

export type GridVariant = "route" | "islands" | "many";

const MAZE = ["...#..", "##.#.#", "......", ".####.", "...#.."];
const LAND = ["11..1.", "1..11.", "..1...", "11..11", "1..1.1"];
const MOVES: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function gridSteps(v: GridVariant): GridStep[] {
  return v === "islands" ? islandSteps() : levelSteps(v === "route" ? [[0, 0]] : [[0, 0], [4, 5]], v === "route");
}

function levelSteps(starts: [number, number][], route: boolean): GridStep[] {
  const R = MAZE.length;
  const C = MAZE[0].length;
  const dist: (number | null)[][] = MAZE.map((r) => [...r].map(() => null));
  const par: ([number, number] | null)[][] = MAZE.map((r) => [...r].map(() => null));
  const out: GridStep[] = [];
  let level: [number, number][] = [];
  for (const [r, c] of starts) {
    dist[r][c] = 0;
    level.push([r, c]);
  }
  const cells = (front: [number, number][], path: Set<string> = new Set(), end?: string): GCell[][] =>
    MAZE.map((row, r) =>
      [...row].map((ch, c) => {
        if (ch === "#") return { s: "out" as const };
        const d = dist[r][c];
        const k = `${r},${c}`;
        if (end === k) return { v: d ?? "", s: "found" as const };
        if (path.has(k)) return { v: d ?? "", s: "path" as const };
        if (front.some(([a, b]) => a === r && b === c)) return { v: d ?? "", s: "cur" as const };
        return { v: d ?? "" };
      }),
    );
  const qOf = (front: [number, number][]): QItem[] => front.map(([r, c]) => ({ v: `${r},${c}`, s: "seen" }));
  out.push({
    cells: cells(level),
    queue: qOf(level),
    caption: route
      ? "Each open square is a vertex, joined to the open squares up, down, left and right. Walls (hatched) are not vertices. Start at the top-left square, row 0, column 0: distance 0."
      : "Two starts, the top-left and bottom-right squares, both at distance 0. Think of a fire that starts in two places and spreads one square per minute.",
  });
  let d = 0;
  while (level.length) {
    const next: [number, number][] = [];
    for (const [r, c] of level)
      for (const [dr, dc] of MOVES) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && MAZE[nr][nc] === "." && dist[nr][nc] === null) {
          dist[nr][nc] = d + 1;
          par[nr][nc] = [r, c];
          next.push([nr, nc]);
        }
      }
    if (!next.length) break;
    d++;
    out.push({
      cells: cells(next),
      queue: qOf(next),
      caption:
        next.length === 1
          ? `Squares ${d} ${d === 1 ? "move" : "moves"} away: open neighbours of the squares at distance ${d - 1} that have no distance yet. There is one, (${next[0][0]}, ${next[0][1]}), and it joins the queue.`
          : `Squares ${d} ${d === 1 ? "move" : "moves"} away: open neighbours of the squares at distance ${d - 1} that have no distance yet. These ${next.length} join the queue.`,
      readout: `distance ${d}: ${next.length} ${next.length === 1 ? "square" : "squares"}`,
    });
    level = next;
  }
  if (route) {
    const path = new Set<string>();
    let at: [number, number] | null = [R - 1, C - 1];
    while (at) {
      path.add(`${at[0]},${at[1]}`);
      at = par[at[0]][at[1]];
    }
    out.push({
      cells: cells([], path, `${R - 1},${C - 1}`),
      queue: [],
      caption: `The bottom-right square is ${dist[R - 1][C - 1]} moves away. Following each square back to the one that reached it gives a shortest route (pale).`,
      verdict: { ok: true, text: `${dist[R - 1][C - 1]} moves` },
    });
  } else {
    out.push({
      cells: cells([]),
      queue: [],
      caption: "Each number is the distance to the nearer start. Both starts were in the queue from the beginning, so one search did the work of two.",
      verdict: { ok: true, text: `every square within ${d} moves` },
    });
  }
  return out;
}

function islandSteps(): GridStep[] {
  const R = LAND.length;
  const C = LAND[0].length;
  const lab: (string | null)[][] = LAND.map((r) => [...r].map(() => null));
  const out: GridStep[] = [];
  const names = "ABCDEFGH";
  const cells = (cur: Set<string>): GCell[][] =>
    LAND.map((row, r) =>
      [...row].map((ch, c) => {
        if (ch === ".") return { s: "out" as const };
        const l = lab[r][c];
        if (cur.has(`${r},${c}`)) return { v: l ?? "", s: "cur" as const };
        return l ? { v: l, s: "done" as const } : { v: "" };
      }),
    );
  out.push({
    cells: cells(new Set()),
    queue: [],
    caption: "Land squares are vertices; water (hatched) is not. Two land squares are joined when they touch up, down, left or right. An island is a connected component: count them.",
  });
  let k = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (LAND[r][c] !== "1" || lab[r][c]) continue;
      const name = names[k++];
      const got = new Set<string>([`${r},${c}`]);
      lab[r][c] = name;
      const stack: [number, number][] = [[r, c]];
      while (stack.length) {
        const [a, b] = stack.pop()!;
        for (const [dr, dc] of MOVES) {
          const nr = a + dr;
          const nc = b + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && LAND[nr][nc] === "1" && !lab[nr][nc]) {
            lab[nr][nc] = name;
            got.add(`${nr},${nc}`);
            stack.push([nr, nc]);
          }
        }
      }
      out.push({
        cells: cells(got),
        queue: [...got].map((x) => ({ v: x, s: "seen" })),
        caption: `Reading row by row, (${r}, ${c}) is the first land square with no label. A search from it labels every land square it can reach: island ${name}, ${got.size} ${got.size === 1 ? "square" : "squares"}.`,
        readout: `islands so far: ${k}`,
      });
    }
  out.push({
    cells: cells(new Set()),
    queue: [],
    caption: `Every land square has a label, so there are ${k} islands. Each search visits only its own island, so the whole count is O(R · C).`,
    verdict: { ok: true, text: `${k} islands` },
  });
  return out;
}
