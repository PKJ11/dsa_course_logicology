// SPAN step generators. Every figure is a list of steps made up front; each step is a full picture of the graph
// (vertex and edge states, tags, cost plates) plus its side panel (a heap or the sorted edge list).

import type { GEdge, GEdgeState, GNode, GState, QItem } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
export type Row = { k: string; v: string; p?: string; cur?: boolean };

export type GraphStep = {
  nodes: GNode[];
  edges: GEdge[];
  caption: string;
  queue?: QItem[];
  rows?: Row[];
  readout?: string;
  verdict?: Verdict;
};

/* ---------- the network every SPAN figure uses: 7 stations, 11 lines ---------- */

type E = [string, string, number];
const POS: Record<string, [number, number]> = { A: [0, 0], B: [2, 0], C: [4, 0], D: [0, 2.4], E: [2, 2.4], F: [4, 2.4], G: [6, 1.2] };
const EDGES: E[] = [
  ["A", "B", 4],
  ["A", "D", 2],
  ["B", "D", 5],
  ["B", "C", 6],
  ["B", "E", 3],
  ["D", "E", 7],
  ["C", "E", 8],
  ["C", "F", 1],
  ["E", "F", 9],
  ["C", "G", 5],
  ["F", "G", 7],
];
export const NET_SIZE = { w: 6, h: 2.4 };

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const name = (e: E) => `${e[0]}–⁠${e[1]}`; // a word joiner keeps "D–E" on one line
// A name and its value ("E 6") never break apart on a phone.
const list = (ys: string[]) => {
  const xs = ys.map((y) => y.replace(" ", " "));
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
};

class Board {
  st = new Map<string, GState>();
  tag = new Map<string, string>();
  tk = new Map<string, "ink" | "plain" | "bad">();
  es = new Map<string, GEdgeState>();
  flashN = new Map<string, GState>();
  flashE = new Map<string, GEdgeState>();
  edge(a: string, b: string, s: GEdgeState) {
    this.es.set(key(a, b), s);
  }
  flash(a: string, b: string, s: GEdgeState) {
    this.flashE.set(key(a, b), s);
  }
  snap(): Pick<GraphStep, "nodes" | "edges"> {
    const nodes = Object.entries(POS).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      state: this.flashN.get(id) ?? this.st.get(id) ?? "",
      tag: this.tag.get(id),
      tagKind: this.tk.get(id) ?? "plain",
      // the bottom row's edges leave up and to the right, where a top-right tag would sit on them
      tagAt: y > 2 ? ("br" as const) : ("tr" as const),
    }));
    const edges = EDGES.map(([a, b, w]) => ({ a, b, state: this.flashE.get(key(a, b)) ?? this.es.get(key(a, b)) ?? "", label: String(w) }));
    this.flashN.clear();
    this.flashE.clear();
    return { nodes, edges };
  }
}

const find = (e: string[]) => EDGES.find((x) => key(x[0], x[1]) === key(e[0], e[1]))!;

/** The edges of the tree path from a to b in a tree given as a list of edges. */
function treePath(tree: E[], a: string, b: string): E[] {
  const adj: Record<string, E[]> = {};
  for (const e of tree) {
    (adj[e[0]] ??= []).push(e);
    (adj[e[1]] ??= []).push(e);
  }
  const prev: Record<string, E | null> = { [a]: null };
  const q = [a];
  while (q.length) {
    const u = q.shift()!;
    for (const e of adj[u] ?? []) {
      const v = e[0] === u ? e[1] : e[0];
      if (!(v in prev)) {
        prev[v] = e;
        q.push(v);
      }
    }
  }
  const out: E[] = [];
  let x = b;
  while (prev[x]) {
    const e = prev[x]!;
    out.push(e);
    x = e[0] === x ? e[1] : e[0];
  }
  return out;
}

const cost = (t: E[]) => t.reduce((s, e) => s + e[2], 0);

/* ---------- SPAN-1.1: what a spanning tree is; swapping one edge ---------- */

export type TreeVariant = "count" | "swap";

export function treeSteps(v: TreeVariant): GraphStep[] {
  const out: GraphStep[] = [];
  if (v === "count") {
    const show = (picked: E[], caption: string, verdict: Verdict, cycle: E[] = [], cut: string[] = []) => {
      const b = new Board();
      for (const e of picked) b.edge(e[0], e[1], "tree");
      // a loop is shown by its yellow band; the edge just added is the one current (3px) edge
      for (const e of cycle) b.edge(e[0], e[1], "found");
      for (const x of cut) b.st.set(x, "todo");
      out.push({ ...b.snap(), caption, verdict, readout: `${picked.length} edges, 7 vertices` });
    };
    const base = [find(["A", "D"]), find(["A", "B"]), find(["B", "E"]), find(["B", "C"]), find(["C", "F"])];
    show(
      base,
      "Five shaded edges, and no loop among them. But G is not joined to anything: 7 vertices need at least 6 edges to be connected.",
      { ok: false, info: true, text: "not connected" },
      [],
      ["G"],
    );
    show(
      [...base, find(["D", "E"]), find(["C", "G"])],
      "Seven edges: everything is joined, but A, B, E, D now form a loop. Any edge of the loop could be dropped and everything would still be joined.",
      { ok: false, info: true, text: "a loop" },
      [find(["A", "B"]), find(["B", "E"]), find(["D", "E"]), find(["A", "D"])],
    );
    show(
      [...base, find(["C", "G"])],
      "Six edges, connected, no loop: a spanning tree. Every spanning tree of 7 vertices has exactly 6 edges. Its cost is the sum of its edges: 2 + 4 + 3 + 6 + 1 + 5 = 21.",
      { ok: true, text: "a spanning tree" },
    );
    return out;
  }
  let tree: E[] = [find(["A", "B"]), find(["B", "C"]), find(["C", "F"]), find(["F", "G"]), find(["B", "E"]), find(["D", "E"])];
  const draw = (b: Board) => {
    for (const e of EDGES) b.edge(e[0], e[1], "");
    for (const e of tree) b.edge(e[0], e[1], "tree");
  };
  let b = new Board();
  draw(b);
  out.push({
    ...b.snap(),
    caption: `A spanning tree (shaded): 6 edges, no loop. It costs ${cost(tree)}. Is there a cheaper one? Try adding one edge that is not in the tree.`,
    readout: `cost ${cost(tree)}`,
  });
  for (const add of [find(["A", "D"]), find(["C", "G"]), find(["B", "D"])]) {
    const loop = treePath(tree, add[0], add[1]);
    const worst = loop.reduce((m, e) => (e[2] > m[2] ? e : m), loop[0]);
    b = new Board();
    draw(b);
    for (const e of loop) b.edge(e[0], e[1], "found");
    b.edge(add[0], add[1], "cur");
    const all = [...loop, add].map(name);
    out.push({
      ...b.snap(),
      caption: `Add ${name(add)} (${add[2]}). In a tree there is one path from ${add[0]} to ${add[1]}, so the new edge closes exactly one loop: ${list(all)}. Its most expensive edge is ${worst[2] > add[2] ? `${name(worst)} (${worst[2]})` : `the new edge itself (${add[2]})`}.`,
      readout: `loop: ${[...loop, add].map((e) => e[2]).join(", ")}`,
    });
    b = new Board();
    if (worst[2] > add[2]) {
      tree = [...tree.filter((e) => e !== worst), add];
      draw(b);
      b.edge(worst[0], worst[1], "old");
      out.push({
        ...b.snap(),
        caption: `Drop ${name(worst)} and keep ${name(add)}: still 6 edges, still connected, no loop. The tree now costs ${cost(tree) + worst[2] - add[2]} − ${worst[2]} + ${add[2]} = ${cost(tree)}.`,
        readout: `cost ${cost(tree)}`,
      });
    } else {
      draw(b);
      b.edge(add[0], add[1], "old");
      out.push({
        ...b.snap(),
        caption: `The new edge is the most expensive on its loop, so swapping it in would not help. Leave the tree as it is.`,
        readout: `cost ${cost(tree)}`,
      });
    }
  }
  b = new Board();
  draw(b);
  out.push({
    ...b.snap(),
    caption: `Now every edge outside the tree is the most expensive edge on the loop it would close, so no single swap helps. Lesson 4 proves that this means the tree is a cheapest spanning tree: ${cost(tree)}.`,
    readout: `cost ${cost(tree)}`,
    verdict: { ok: true, text: "no swap helps" },
  });
  return out;
}

/* ---------- SPAN-2.1: Kruskal, with a group label on every vertex ---------- */

export function kruskalSteps(): GraphStep[] {
  const sorted = [...EDGES].sort((x, y) => x[2] - y[2] || name(x).localeCompare(name(y)));
  const group: Record<string, string> = Object.fromEntries(Object.keys(POS).map((x) => [x, x]));
  const status = new Map<E, string>();
  const b = new Board();
  const tags = () => {
    for (const x of Object.keys(POS)) b.tag.set(x, group[x]);
  };
  tags();
  const rows = (cur?: E): Row[] => sorted.map((e) => ({ k: name(e), v: String(e[2]), p: status.get(e) ?? "", cur: e === cur }));
  const out: GraphStep[] = [];
  out.push({
    ...b.snap(),
    rows: rows(),
    caption: "Kruskal’s method: sort the edges by cost (the table). Each vertex starts in a group of its own; its tag names its group.",
  });
  let kept = 0;
  let total = 0;
  for (const e of sorted) {
    const [a, c, w] = e;
    if (kept === 6) {
      status.set(e, "–");
      continue;
    }
    const ga = group[a];
    const gc = group[c];
    if (ga === gc) {
      status.set(e, "skip");
      b.edge(a, c, "old");
      b.flash(a, c, "cur");
      out.push({
        ...b.snap(),
        rows: rows(e),
        caption: `${name(e)} (${w}): ${a} and ${c} are both in group ${ga} already, so this edge would close a loop. Skip it.`,
        readout: `kept ${kept}, cost ${total}`,
      });
      continue;
    }
    const [keep, gone] = ga < gc ? [ga, gc] : [gc, ga];
    for (const x of Object.keys(group)) if (group[x] === gone) group[x] = keep;
    tags();
    status.set(e, "kept");
    b.edge(a, c, "found");
    b.flash(a, c, "cur");
    kept++;
    total += w;
    out.push({
      ...b.snap(),
      rows: rows(e),
      caption: `${name(e)} (${w}): ${a} is in group ${ga} and ${c} in group ${gc}, so no loop. Keep it, and join the two groups into group ${keep}.${kept === 6 ? " That is 6 edges: the tree is complete." : ""}`,
      readout: `kept ${kept}, cost ${total}`,
    });
  }
  for (const x of Object.keys(POS)) b.st.set(x, "done");
  out.push({
    ...b.snap(),
    rows: rows(),
    caption: `Every vertex is in group A. The kept edges form a cheapest spanning tree, cost ${total}. With 6 edges kept there is no need to look at the rest of the list.`,
    readout: `kept 6, cost ${total}`,
    verdict: { ok: true, text: `cost ${total}` },
  });
  return out;
}

/* ---------- SPAN-3.1: Prim, with a heap of (cost, vertex) entries ---------- */

export function primSteps(): GraphStep[] {
  const adj: Record<string, [string, number][]> = {};
  for (const [a, c, w] of EDGES) {
    (adj[a] ??= []).push([c, w]);
    (adj[c] ??= []).push([a, w]);
  }
  for (const x of Object.keys(adj)) adj[x].sort((p, q) => p[0].localeCompare(q[0]));
  const inTree = new Set<string>();
  const best: Record<string, number> = { A: 0 };
  const via: Record<string, string> = {};
  let heap: [number, string, string][] = [[0, "A", ""]]; // cost, vertex, from
  const order = () => heap.sort((p, q) => p[0] - q[0] || p[1].localeCompare(q[1]));
  const hi = (): QItem[] => heap.map(([w, x]) => ({ v: `${w} ${x}`, s: inTree.has(x) || w > best[x] ? "out" : "seen" }));
  const b = new Board();
  const out: GraphStep[] = [];
  b.st.set("A", "seen");
  out.push({ ...b.snap(), queue: hi(), caption: "Prim’s method grows one tree, here from A. The heap holds (cost, vertex): the cheapest known edge from the tree to that vertex." });
  let total = 0;
  while (heap.length) {
    order();
    const [w, u, from] = heap.shift()!;
    if (inTree.has(u)) {
      b.flashN.set(u, "cur");
      out.push({ ...b.snap(), queue: [{ v: `${w} ${u}`, s: "out" }, ...hi()], caption: `Take ${w} ${u}. ${u} is in the tree already, so this entry is out of date: skip it.`, readout: `cost ${total}` });
      continue;
    }
    inTree.add(u);
    total += w;
    b.st.set(u, "done");
    b.flashN.set(u, "cur");
    if (from) {
      b.edge(from, u, "found");
      b.flash(from, u, "cur");
    }
    const pushed: string[] = [];
    for (const [x, c] of adj[u]) {
      if (inTree.has(x)) continue;
      if (c < (best[x] ?? Infinity)) {
        best[x] = c;
        via[x] = u;
        heap.push([c, x, u]);
        b.st.set(x, "seen");
        pushed.push(`${c} ${x}`);
      }
    }
    order();
    const head = from ? `Take ${w} ${u}: the cheapest edge leaving the tree is ${from}–${u}. Add ${u} and that edge.` : "Take A: the tree is just A.";
    out.push({
      ...b.snap(),
      queue: [{ v: `${w} ${u}`, s: "cur" }, ...hi()],
      caption: `${head} ${pushed.length ? `Push ${list(pushed)}.` : `No edge from ${u} is a cheaper way to a vertex outside the tree.`}`,
      readout: `cost ${total}`,
    });
  }
  out.push({
    ...b.snap(),
    queue: [],
    caption: `The heap is empty and every vertex is in the tree. The same cost as Kruskal’s, ${total}: here the cheapest tree is unique, because every edge outside it is strictly the most expensive on its loop (lesson 4).`,
    readout: `cost ${total}`,
    verdict: { ok: true, text: `cost ${total}` },
  });
  return out;
}

/* ---------- SPAN-4.1: the cut property, and the exchange proof ---------- */

export type CutVariant = "cuts" | "exchange";

export function cutSteps(v: CutVariant): GraphStep[] {
  const out: GraphStep[] = [];
  const crossing = (S: Set<string>) => EDGES.filter(([a, c]) => S.has(a) !== S.has(c));
  if (v === "cuts") {
    const chosen: E[] = [];
    const cuts = [["A"], ["C"], ["A", "D"], ["A", "B", "D"], ["C", "F"], ["A", "B", "D", "E"]];
    {
      const b = new Board();
      out.push({
        ...b.snap(),
        caption: "A cut splits the vertices into two sides. In the next steps the shaded vertices are one side, and an edge crosses the cut when its ends are on different sides.",
      });
    }
    for (const side of cuts) {
      const S = new Set(side);
      const b = new Board();
      for (const e of chosen) b.edge(e[0], e[1], "found");
      for (const x of side) b.st.set(x, "seen");
      const cr = crossing(S);
      const light = cr.reduce((m, e) => (e[2] < m[2] ? e : m), cr[0]);
      for (const e of cr) if (!chosen.includes(e)) b.edge(e[0], e[1], "cur");
      b.edge(light[0], light[1], "found");
      chosen.push(light);
      out.push({
        ...b.snap(),
        caption: `Side {${side.join(", ")}}. ${cr.length} edges cross: ${cr.map((e) => e[2]).join(", ")}. The cheapest is ${name(light)} (${light[2]}), and by the cut property it belongs to a cheapest spanning tree.${chosen.length === 6 ? " That is 6 edges: a whole tree." : ""}`,
        readout: `chosen ${chosen.length}, cost ${cost(chosen)}`,
      });
    }
    const b = new Board();
    for (const e of chosen) b.edge(e[0], e[1], "found");
    out.push({
      ...b.snap(),
      caption: `Any cut will do, as long as no edge chosen so far crosses it. Six cuts gave six edges, cost ${cost(chosen)}: the same tree Kruskal and Prim find. Kruskal and Prim are two ways of choosing the cuts.`,
      readout: `cost ${cost(chosen)}`,
      verdict: { ok: true, text: `cost ${cost(chosen)}` },
    });
    return out;
  }
  // the exchange proof: a tree T without the cheapest crossing edge e can swap e in for no more cost
  const S = new Set(["A", "D", "E"]);
  const cr = crossing(S);
  const e = cr.reduce((m, x) => (x[2] < m[2] ? x : m), cr[0]);
  const T: E[] = [find(["A", "B"]), find(["A", "D"]), find(["D", "E"]), find(["B", "C"]), find(["C", "F"]), find(["C", "G"])];
  const side = (b: Board) => {
    for (const x of S) b.st.set(x, "seen");
  };
  let b = new Board();
  side(b);
  for (const x of cr) b.edge(x[0], x[1], "cur");
  b.edge(e[0], e[1], "found");
  out.push({
    ...b.snap(),
    caption: `The cut: {A, D, E} against the rest. Five edges cross it: ${cr.map((x) => `${name(x)} (${x[2]})`).join(", ")}. The cheapest is e = ${name(e)} (${e[2]}). Claim: some cheapest spanning tree contains e.`,
  });
  b = new Board();
  side(b);
  for (const x of T) b.edge(x[0], x[1], "tree");
  out.push({
    ...b.snap(),
    caption: `Take any spanning tree T that does not contain e, like this one (cost ${cost(T)}). The proof changes T into a tree that contains e and costs no more. Done to a cheapest tree, it gives a cheapest tree that contains e.`,
    readout: `T costs ${cost(T)}`,
  });
  const loop = treePath(T, e[0], e[1]);
  const f = loop.find(([a, c]) => S.has(a) !== S.has(c))!;
  b = new Board();
  side(b);
  for (const x of T) b.edge(x[0], x[1], "tree");
  // the loop is the tree path plus e itself; f, where it crosses the cut again, is the one heavy edge
  for (const x of [...loop, e]) b.edge(x[0], x[1], "found");
  b.edge(f[0], f[1], "cur");
  out.push({
    ...b.snap(),
    caption: `Add e to T. It closes one loop: ${list([...loop, e].map(name))}. The loop starts on one side of the cut and comes back, so besides e it crosses the cut at least once more. Here it crosses at f = ${name(f)} (${f[2]}).`,
    readout: `e = ${e[2]}, f = ${f[2]}`,
  });
  const T2 = [...T.filter((x) => x !== f), e];
  b = new Board();
  side(b);
  for (const x of T2) b.edge(x[0], x[1], "tree");
  b.edge(e[0], e[1], "found");
  b.edge(f[0], f[1], "old");
  out.push({
    ...b.snap(),
    caption: `Drop f. Removing an edge of the loop keeps everything joined, so T − f + e is a spanning tree. f crosses the cut and e is the cheapest crossing edge, so w(e) ≤ w(f): the new tree costs ${cost(T)} − ${f[2]} + ${e[2]} = ${cost(T2)}, no more than T.`,
    readout: `new tree costs ${cost(T2)}`,
    verdict: { ok: true, text: "a tree with e, no more expensive" },
  });
  return out;
}
