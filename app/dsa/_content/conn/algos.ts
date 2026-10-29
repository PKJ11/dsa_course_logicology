// CONN step generators. Every figure is a list of steps made up front; each step is a full picture of the graph
// (vertex and edge states, tags) plus its side panel (a stack or an order).

import type { GEdge, GEdgeState, GNode, GState, QItem } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type GraphStep = {
  nodes: GNode[];
  edges: GEdge[];
  caption: string;
  queue?: QItem[];
  readout?: string;
  verdict?: Verdict;
};

/* ---------- graphs whose edges have ids, so two edges between the same pair are kept apart ---------- */

type EDef = { id: string; a: string; b: string; bend?: number; hidden?: boolean };
/** `below`: vertices whose tag goes at the bottom right, because an edge comes into their top right corner. */
type GDef = { pos: Record<string, [number, number]>; edges: EDef[]; labels?: Record<string, string>; below?: string[] };

class Board {
  st = new Map<string, GState>();
  tag = new Map<string, string>();
  tk = new Map<string, "ink" | "plain" | "bad">();
  es = new Map<string, GEdgeState>();
  el = new Map<string, string>();
  /** marks that last one step only */
  flashN = new Map<string, GState>();
  flashE = new Map<string, GEdgeState>();
  /** draw every edge turned round (Kosaraju's second pass) */
  turned = false;
  constructor(public g: GDef) {}
  snap(): Pick<GraphStep, "nodes" | "edges"> {
    const nodes: GNode[] = Object.entries(this.g.pos).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      label: this.g.labels?.[id],
      state: this.flashN.get(id) ?? this.st.get(id) ?? "",
      tag: this.tag.get(id),
      tagKind: this.tk.get(id) ?? "plain",
      tagAt: this.g.below?.includes(id) ? ("br" as const) : ("tr" as const),
    }));
    const edges: GEdge[] = this.g.edges.map((e) => ({
      a: this.turned ? e.b : e.a,
      b: this.turned ? e.a : e.b,
      bend: e.bend,
      label: this.el.get(e.id),
      state: this.flashE.get(e.id) ?? this.es.get(e.id) ?? (e.hidden ? "hidden" : ""),
    }));
    this.flashN.clear();
    this.flashE.clear();
    return { nodes, edges };
  }
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const set = (xs: string[]) => `{${[...xs].sort().join(", ")}}`;

/** Out-neighbours (or in-neighbours) in alphabetical order, as (vertex, edge id). */
function adjacency(g: GDef, turned = false, undirected = false): Record<string, [string, string][]> {
  const adj: Record<string, [string, string][]> = {};
  for (const v of Object.keys(g.pos)) adj[v] = [];
  for (const e of g.edges) {
    if (e.hidden) continue;
    const [a, b] = turned ? [e.b, e.a] : [e.a, e.b];
    adj[a].push([b, e.id]);
    if (undirected && a !== b) adj[b].push([a, e.id]);
  }
  for (const v of Object.keys(adj)) adj[v].sort((p, q) => p[0].localeCompare(q[0]) || p[1].localeCompare(q[1]));
  return adj;
}

/* ---------- the town of lessons 1 and 2: 8 junctions, 10 one-way streets ---------- */

const arc = (a: string, b: string, extra: Partial<EDef> = {}): EDef => ({ id: `${a}${b}`, a, b, ...extra });

export const TOWN: GDef = {
  pos: { A: [0, 0], B: [2, 0], C: [4, 0], D: [6, 0], E: [0, 2], F: [2, 2], G: [4, 2], H: [6, 2] },
  below: ["E"],
  edges: [
    arc("A", "B"),
    arc("B", "E"),
    arc("E", "A"),
    arc("F", "E"),
    arc("F", "G"),
    arc("B", "C"),
    arc("C", "D"),
    arc("D", "H"),
    arc("H", "G"),
    arc("G", "C"),
    arc("G", "B", { hidden: true }),
  ],
};
export const TOWN_SIZE = { w: 6, h: 2 };

/** The groups of the town, numbered in topological order. */
const TOWN_GROUPS = [["F"], ["A", "B", "E"], ["C", "D", "G", "H"]];

/* ---------- CONN-1.1: the group of one vertex; the graph of groups ---------- */

export type GroupVariant = "one" | "all";

/** Layer-by-layer search from s; returns the layers and the edges that first reached each vertex. */
function layers(g: GDef, s: string, turned: boolean): { layers: string[][]; via: Map<string, string> } {
  const adj = adjacency(g, turned);
  const seen = new Set([s]);
  const via = new Map<string, string>();
  const out = [[s]];
  while (true) {
    const next: string[] = [];
    for (const u of out[out.length - 1])
      for (const [v, id] of adj[u])
        if (!seen.has(v)) {
          seen.add(v);
          via.set(v, id);
          next.push(v);
        }
    if (!next.length) return { layers: out, via };
    out.push(next.sort());
  }
}

export function groupSteps(v: GroupVariant): GraphStep[] {
  const g = TOWN;
  const out: GraphStep[] = [];
  if (v === "one") {
    let b = new Board(g);
    out.push({
      ...b.snap(),
      caption: "One-way streets between 8 junctions. Which junctions are in A’s group: junctions that A can reach and that can also get back to A?",
    });
    const fwd = layers(g, "A", false);
    const reached: string[] = [];
    for (const [k, layer] of fwd.layers.entries()) {
      for (const x of layer) {
        reached.push(x);
        b.st.set(x, "seen");
        const id = fwd.via.get(x);
        if (id) {
          b.es.set(id, "tree");
          b.flashE.set(id, "cur");
        }
        b.flashN.set(x, "cur");
      }
      out.push({
        ...b.snap(),
        caption:
          k === 0
            ? "First search: follow the streets from A. Shaded junctions are reached."
            : `Follow the streets one more step: ${list(layer)}.${k === fwd.layers.length - 1 ? " Nothing new after this." : ""}`,
        readout: `A reaches: ${reached.slice().sort().join(" ")}`,
      });
    }
    const fwdSet = new Set(reached);
    b = new Board(g);
    b.turned = true;
    out.push({
      ...b.snap(),
      caption: `A reaches ${reached.length} junctions, but not F. Now turn every street round. A route from X to A along the streets is a route from A to X along the turned streets.`,
      readout: `A reaches: ${reached.slice().sort().join(" ")}`,
    });
    const bwd = layers(g, "A", true);
    const back: string[] = [];
    for (const [k, layer] of bwd.layers.entries()) {
      for (const x of layer) {
        back.push(x);
        b.st.set(x, "seen");
        const id = bwd.via.get(x);
        if (id) {
          b.es.set(id, "tree");
          b.flashE.set(id, "cur");
        }
        b.flashN.set(x, "cur");
      }
      out.push({
        ...b.snap(),
        caption:
          k === 0
            ? "Second search: from A along the turned streets. It finds every junction that can reach A."
            : `One more step: ${list(layer)}.${k === bwd.layers.length - 1 ? " Nothing new after this." : ""}`,
        readout: `reach A: ${back.slice().sort().join(" ")}`,
      });
    }
    b = new Board(g);
    const both = back.filter((x) => fwdSet.has(x)).sort();
    for (const x of both) b.st.set(x, "found");
    for (const e of g.edges) if (both.includes(e.a) && both.includes(e.b)) b.es.set(e.id, "found");
    out.push({
      ...b.snap(),
      caption: `Keep the junctions found by both searches: ${list(both)}. That is A’s group. F can reach A but A cannot reach F; C, D, G and H are the other way round.`,
      readout: `group of A: ${set(both)}`,
      verdict: { ok: true, text: "two searches, O(V + E)" },
    });
    return out;
  }
  // "all": every group, the streets between groups, and why groups never form a cycle
  const b = new Board(g);
  out.push({
    ...b.snap(),
    caption: "Every junction is in exactly one group. The next steps mark the three groups, numbered so that streets between groups go from a smaller number to a larger one.",
  });
  TOWN_GROUPS.forEach((grp, k) => {
    for (const x of grp) {
      b.st.set(x, "done");
      b.tag.set(x, String(k));
      b.tk.set(x, "ink");
      b.flashN.set(x, "cur");
    }
    for (const e of g.edges) if (!e.hidden && grp.includes(e.a) && grp.includes(e.b)) b.es.set(e.id, "tree");
    out.push({
      ...b.snap(),
      caption:
        grp.length === 1
          ? `Group 0 is F alone. F can reach other junctions, but no street leads into F, so nothing gets back to it. A junction on its own is a group too.`
          : `Group ${k}: ${list(grp)}. Each can reach the others along the shaded streets${k === 1 ? " (A → B → E → A)" : " (C → D → H → G → C)"}.`,
      readout: `groups: ${TOWN_GROUPS.slice(0, k + 1).map(set).join(" ")}`,
    });
  });
  // Only the streets between groups are shaded now, so the mark means one thing.
  for (const e of g.edges) if (!e.hidden) b.es.set(e.id, ["FE", "FG", "BC"].includes(e.id) ? "tree" : "");
  out.push({
    ...b.snap(),
    caption: "The shaded streets join different groups: F → E and F → G go from group 0, B → C from group 1 to group 2. Shrink each group to one point and you get the graph of groups: 0 → 1 → 2, and 0 → 2.",
    readout: "graph of groups: 0 → 1, 0 → 2, 1 → 2",
  });
  b.es.set("GB", "todo");
  for (const x of ["A", "B", "E", "C", "D", "G", "H"]) b.flashN.set(x, "seen");
  out.push({
    ...b.snap(),
    caption: "Suppose a street G → B were added (dashed). Then B reaches G (B → C → D → H → G) and G reaches B, so groups 1 and 2 would join into one. A cycle in the graph of groups always merges its groups.",
    readout: "with G → B: groups {F} {A, B, C, D, E, G, H}",
  });
  out.push({
    ...b.snap(),
    caption: "So the graph of groups never has a cycle: it is a DAG, and it has a topological order (GRPH-5). The numbers 0, 1, 2 are such an order.",
    readout: "graph of groups: 0 → 1 → 2",
    verdict: { ok: true, text: "the graph of groups is a DAG" },
  });
  return out;
}

/* ---------- CONN-2.1: Kosaraju's two passes, and Tarjan's one search ---------- */

export type FindVariant = "kosaraju" | "tarjan";

export function findSteps(v: FindVariant): GraphStep[] {
  return v === "kosaraju" ? kosarajuSteps() : tarjanSteps();
}

function kosarajuSteps(): GraphStep[] {
  const g = TOWN;
  const adj = adjacency(g);
  const out: GraphStep[] = [];
  let b = new Board(g);
  const order: string[] = [];
  const reached = new Set<string>();
  const oq = () => `finish order: ${order.length ? order.join(" ") : "none yet"}`;
  out.push({
    ...b.snap(),
    readout: oq(),
    caption: "Kosaraju’s method, first pass: an ordinary depth-first search (GRPH-3), trying streets in alphabetical order. Each junction’s tag will give its place in the finish order.",
  });
  // a recursive search, recorded at each finish
  const path: string[] = [];
  const visit = (u: string) => {
    reached.add(u);
    path.push(u);
    b.st.set(u, "seen");
    const looked: string[] = [];
    for (const [w, id] of adj[u]) {
      if (!reached.has(w)) {
        b.es.set(id, "tree");
        visit(w);
      } else looked.push(w);
    }
    order.push(u);
    b.st.set(u, "done");
    b.tag.set(u, String(order.length));
    b.tk.set(u, "ink");
    b.flashN.set(u, "cur");
    const route = path.join(" → ");
    path.pop();
    const lead = order.length === 1 ? `The search went ${route}.` : path.length ? `Back at ${u} (path ${route}).` : `${u} is the start.`;
    const why = adj[u].length === 0 ? `${u} has no streets out` : looked.length === adj[u].length && looked.length ? `${u}’s streets lead to ${list(looked)}, already reached` : `Every street from ${u} has been followed`;
    out.push({ ...b.snap(), readout: oq(), caption: `${lead} ${why.charAt(0).toUpperCase() + why.slice(1)}, so ${u} finishes, number ${order.length}.` });
  };
  for (const s of Object.keys(g.pos)) {
    if (reached.has(s)) continue;
    if (s !== "A") {
      b.flashN.set(s, "cur");
      out.push({ ...b.snap(), readout: oq(), caption: `The search from A is over, but ${s} was never reached. Start again from ${s}.` });
    }
    visit(s);
  }
  // second pass
  const fin = Object.fromEntries(order.map((x, i) => [x, i + 1]));
  b = new Board(g);
  b.turned = true;
  for (const x of order) {
    b.tag.set(x, String(fin[x]));
    b.tk.set(x, "plain");
  }
  out.push({
    ...b.snap(),
    readout: oq(),
    caption: `Second pass: turn every street round, and take the junctions from the last finish to the first: ${[...order].reverse().join(", ")}. Each search from a junction not yet in a group finds one whole group.`,
  });
  const radj = adjacency(g, true);
  const group = new Map<string, number>();
  let c = 0;
  const found: string[][] = [];
  for (const s of [...order].reverse()) {
    if (group.has(s)) continue;
    const mine = [s];
    group.set(s, c);
    const stack = [s];
    const ignored: string[] = [];
    while (stack.length) {
      const u = stack.pop()!;
      for (const [w, id] of radj[u]) {
        if (!group.has(w)) {
          group.set(w, c);
          mine.push(w);
          stack.push(w);
          b.es.set(id, "tree");
        } else if (group.get(w)! < c) {
          ignored.push(`${u} → ${w}`);
          b.flashE.set(id, "old");
        }
      }
    }
    for (const x of mine) {
      b.st.set(x, "done");
      b.tk.set(x, "ink");
      b.tag.set(x, `g${c}`);
      b.flashN.set(x, x === s ? "cur" : "seen");
    }
    found.push(mine.sort());
    out.push({
      ...b.snap(),
      caption:
        `${s} finished latest of the junctions left. Search from it along the turned streets: it reaches ${list(mine)}. That is group ${c}.` +
        (ignored.length ? ` The turned street${ignored.length > 1 ? "s" : ""} ${list(ignored)} lead${ignored.length > 1 ? "" : "s"} into a group already found: ignore ${ignored.length > 1 ? "them" : "it"}.` : ""),
      readout: `groups: ${found.map(set).join(" ")}`,
    });
    c++;
  }
  out.push({
    ...b.snap(),
    caption: "Done: three searches, three groups, and they came out in topological order, 0 → 1 → 2. The tags g0, g1, g2 are the group numbers.",
    readout: `groups: ${found.map(set).join(" ")}`,
    verdict: { ok: true, text: "two passes, O(V + E)" },
  });
  return out;
}

function tarjanSteps(): GraphStep[] {
  const g = TOWN;
  const adj = adjacency(g);
  const b = new Board(g);
  const out: GraphStep[] = [];
  const idx: Record<string, number> = {};
  const low: Record<string, number> = {};
  const on = new Set<string>();
  const stack: string[] = [];
  const groups: string[][] = [];
  let t = 0;
  const sq = (): QItem[] => stack.map((x) => ({ v: x, s: b.st.get(x) === "seen" ? "seen" : undefined }));
  const tag = (x: string) => b.tag.set(x, `${idx[x]}/${low[x]}`);
  const push = (caption: string, cur?: string) => {
    if (cur) b.flashN.set(cur, "cur");
    out.push({ ...b.snap(), queue: sq(), caption, readout: groups.length ? `groups: ${groups.map(set).join(" ")}` : "groups: none yet" });
  };
  out.push({
    ...b.snap(),
    queue: [],
    caption: "Tarjan’s method: one depth-first search. Each junction gets a number in the order it is reached, and a low-link number. Its tag reads number/low. Reached junctions also go on a stack of their own.",
    readout: "groups: none yet",
  });
  const visit = (u: string, from?: string, id?: string) => {
    idx[u] = low[u] = ++t;
    stack.push(u);
    on.add(u);
    b.st.set(u, "seen");
    tag(u);
    if (id) {
      b.es.set(id, "tree");
      b.flashE.set(id, "cur");
    }
    push(
      from
        ? `${from} → ${u}: ${u} is new. It gets number ${t}, and its low starts at ${t}. Push ${u} on the stack.`
        : `Start at ${u}: number ${t}, low ${t}. Push ${u} on the stack.`,
      u,
    );
    for (const [w, eid] of adj[u]) {
      if (!(w in idx)) {
        visit(w, u, eid);
        if (low[w] < low[u]) {
          low[u] = low[w];
          tag(u);
        }
        b.flashE.set(eid, "cur");
        push(`Back at ${u} from ${w}. low[${u}] = smallest of ${u}’s low and ${w}’s low = ${low[u]}.`, u);
      } else if (on.has(w)) {
        const before = low[u];
        low[u] = Math.min(low[u], idx[w]);
        tag(u);
        b.flashE.set(eid, "cur");
        push(
          `${u} → ${w}: ${w} is still on the stack, so ${u} can get back to ${w}. low[${u}] = smallest of ${before} and ${w}’s number ${idx[w]} = ${low[u]}.`,
          u,
        );
      } else {
        b.flashE.set(eid, "old");
        push(`${u} → ${w}: ${w} is reached but no longer on the stack: its group is finished. This street cannot lead back to ${u}, so ignore it.`, u);
      }
    }
    if (low[u] === idx[u]) {
      const grp: string[] = [];
      while (true) {
        const x = stack.pop()!;
        on.delete(x);
        grp.push(x);
        b.st.set(x, "done");
        b.tk.set(x, "ink");
        if (x === u) break;
      }
      groups.push(grp);
      for (const x of grp) b.flashN.set(x, x === u ? "cur" : "found");
      out.push({
        ...b.snap(),
        queue: sq(),
        caption: `${u} has no streets left, and low[${u}] = ${low[u]} is its own number: nothing below ${u} gets back above it. So ${u} is the first junction of its group that the search reached. Pop the stack down to ${u}: ${grp.length === 1 ? `${u} alone is a group` : `${list([...grp].sort())} form a group`}, the ${["first", "second", "third"][groups.length - 1]} one found.`,
        readout: `groups: ${groups.map(set).join(" ")}`,
      });
    } else {
      b.st.set(u, "");
      push(
        `${u} has no streets left. low[${u}] = ${low[u]} is smaller than its number ${idx[u]}: from ${u} you can get back to a junction reached before ${u}, so ${u} belongs to that junction’s group. It stays on the stack.`,
        u,
      );
    }
  };
  for (const s of Object.keys(g.pos)) if (!(s in idx)) visit(s);
  out.push({
    ...b.snap(),
    queue: [],
    caption: `Done in one search. The groups came out ${groups.map(set).join(", then ")}: the reverse of the topological order. Number them backwards to get 0 → 1 → 2.`,
    readout: `groups: ${groups.map(set).join(" ")}`,
    verdict: { ok: true, text: "one search, O(V + E)" },
  });
  return out;
}

/* ---------- CONN-3.1: bridges and cut vertices in one search ---------- */

export type WeakVariant = "one" | "double";

const line = (a: string, b: string, extra: Partial<EDef> = {}): EDef => ({ id: `${a}${b}`, a, b, ...extra });

// 2.6 high, not 2: on a phone the "back" plates then clear the tags.
const NET_POS: Record<string, [number, number]> = { A: [0, 0], B: [0, 2.6], C: [1.5, 1.3], D: [3, 1.3], E: [4.5, 0], F: [4.5, 2.6], G: [6, 0] };
const NET_LINES = [line("A", "B"), line("A", "C"), line("B", "C"), line("C", "D"), line("D", "E"), line("D", "F"), line("E", "F"), line("E", "G")];
export const NET: Record<WeakVariant, GDef> = {
  one: { pos: NET_POS, edges: NET_LINES },
  double: { pos: NET_POS, edges: [...NET_LINES.map((e) => (e.id === "CD" ? { ...e, bend: 13 } : e)), line("C", "D", { id: "CD2", bend: -13 })] },
};
export const NET_SIZE = { w: 6, h: 2.6 };

export function weakSteps(v: WeakVariant): GraphStep[] {
  const g = NET[v];
  const adj = adjacency(g, false, true);
  const b = new Board(g);
  const out: GraphStep[] = [];
  const disc: Record<string, number> = {};
  const low: Record<string, number> = {};
  const bridges: string[] = [];
  const cuts: string[] = [];
  let t = 0;
  const tag = (x: string) => b.tag.set(x, `${disc[x]}/${low[x]}`);
  const read = () => `bridges: ${bridges.length ? bridges.join(" ") : "none"} · cut: ${cuts.length ? [...cuts].sort().join(" ") : "none"}`;
  const push = (caption: string, cur?: string, verdict?: Verdict) => {
    if (cur) b.flashN.set(cur, "cur");
    out.push({ ...b.snap(), caption, readout: read(), verdict });
  };
  out.push({
    ...b.snap(),
    caption:
      v === "one"
        ? "A two-way network. One depth-first search from A finds every bridge and every cut vertex. Each tag will read disc/low: the discovery number, and the smallest discovery number its part of the search can get back to."
        : "The same network with a second line between C and D (two curved lines). Watch what changes.",
    readout: read(),
  });
  let rootKids = 0;
  const visit = (u: string, came?: string, from?: string) => {
    disc[u] = low[u] = ++t;
    b.st.set(u, "seen");
    tag(u);
    if (came) {
      b.es.set(came, "tree");
      b.flashE.set(came, "cur");
    }
    push(from ? `${from} – ${u}: ${u} is new. disc = low = ${t}.` : `Start at ${u}: disc = low = 1.`, u);
    for (const [w, id] of adj[u]) {
      if (id === came) continue;
      if (!(w in disc)) {
        if (u === "A") rootKids++;
        visit(w, id, u);
        b.flashE.set(id, "cur");
        const p = u;
        if (low[w] < low[p]) {
          low[p] = low[w];
          tag(p);
        }
        const isBridge = low[w] > disc[p];
        const isCut = p !== "A" && low[w] >= disc[p];
        if (isBridge) {
          bridges.push(`${p}–⁠${w}`);
          b.es.set(id, "found");
        }
        if (isCut && !cuts.includes(p)) {
          cuts.push(p);
          b.st.set(p, "found");
        }
        if (v === "double" && !["C", "D"].includes(p) && !isBridge && !isCut) continue;
        const sum = isBridge
          ? `low[${w}] = ${low[w]} > disc[${p}] = ${disc[p]}: nothing under ${w} gets back to ${p} or above, so ${p}–⁠${w} is a bridge${isCut ? `, and ${p} is a cut vertex` : ""}.`
          : isCut
            ? `low[${w}] = ${low[w]} ≥ disc[${p}] = ${disc[p]}: ${w}’s part gets back to ${p} but not above it. ${p} is a cut vertex, but ${p}–⁠${w} is not a bridge.`
            : p === "A"
              ? `A is the start: the rule for the start is different (the last step).`
              : `low[${w}] = ${low[w]} < disc[${p}] = ${disc[p]}: ${w}’s part gets back above ${p}. Nothing to mark.`;
        push(`Back at ${p} from ${w}. ${sum} low[${p}] = ${low[p]}.`, p);
      } else if (disc[w] < disc[u]) {
        const before = low[u];
        low[u] = Math.min(low[u], disc[w]);
        tag(u);
        b.es.set(id, "old");
        if (id !== "CD2") b.el.set(id, "back");
        b.flashE.set(id, "cur");
        push(
          `${u} – ${w}: ${w} was reached earlier and is above ${u}${id === "CD2" ? ", along a second line, not the one D came by" : ""}. A line back up: low[${u}] = smallest of ${before} and ${disc[w]} = ${low[u]}.`,
          u,
        );
      }
    }
    b.st.set(u, cuts.includes(u) ? "found" : "done");
    b.tk.set(u, "ink");
  };
  visit("A");
  push(
    `The search is over. A is the start, and the rule for the start is different: it is a cut vertex only if it has two or more children in the search tree. A has ${rootKids} (B), because C was reached through B.`,
    undefined,
    { ok: true, text: "one search, O(V + E)" },
  );
  if (v === "double")
    out[out.length - 1].caption +=
      " With two lines between C and D, neither is a bridge. But C and D are still cut vertices: closing a station closes both lines.";
  return out;
}

/* ---------- CONN-4.1: 2-SAT with the implication graph ---------- */

export type SatVariant = "yes" | "no";

// A hexagon with each condition opposite its own negation: the edge x → y and its mirror ¬y → ¬x sit on opposite sides, and no edges cross.
const LIT_POS: Record<string, [number, number]> = { a: [1, 0], c: [3, 0], nb: [4, 1.7], na: [3, 3.4], nc: [1, 3.4], b: [0, 1.7] };
const LIT_LABEL: Record<string, string> = { a: "a", b: "b", c: "c", na: "¬a", nb: "¬b", nc: "¬c" };
export const LIT_SIZE = { w: 4, h: 3.4 };
const neg = (x: string) => (x.startsWith("n") ? x.slice(1) : `n${x}`);
const L = (x: string) => LIT_LABEL[x];

const RULES: Record<SatVariant, [string, string][]> = {
  yes: [
    ["a", "b"],
    ["na", "c"],
    ["nb", "nc"],
    ["a", "nb"],
  ],
  no: [
    ["a", "b"],
    ["na", "c"],
    ["nb", "nc"],
    ["a", "nb"],
    ["na", "b"],
  ],
};

export function satGraph(v: SatVariant): GDef {
  const pairs = new Set<string>();
  const edges: EDef[] = [];
  for (const [x, y] of RULES[v])
    for (const [p, q] of [
      [neg(x), y],
      [neg(y), x],
    ])
      if (!pairs.has(p + q)) {
        pairs.add(p + q);
        edges.push({ id: p + q, a: p, b: q });
      }
  for (const e of edges) if (pairs.has(e.b + e.a)) e.bend = 20;
  return { pos: LIT_POS, edges, labels: LIT_LABEL };
}

export function satSteps(v: SatVariant): GraphStep[] {
  const g = satGraph(v);
  const b = new Board(g);
  for (const e of g.edges) b.es.set(e.id, "hidden");
  const out: GraphStep[] = [];
  const rules = RULES[v];
  const rule = ([x, y]: [string, string]) => `(${L(x)} or ${L(y)})`;
  out.push({
    ...b.snap(),
    caption: `${rules.length} rules over three yes-or-no questions a, b and c: ${rules.map(rule).join(", ")}. Each condition and its opposite (¬a means “a is no”) is a vertex.`,
  });
  for (const [x, y] of rules) {
    const ids = [neg(x) + y, neg(y) + x];
    for (const id of ids) {
      b.es.set(id, "");
      b.flashE.set(id, "cur");
    }
    out.push({
      ...b.snap(),
      caption: `Rule ${rule([x, y])}: if ${L(x)} is false, ${L(y)} must hold, so add ${L(neg(x))} → ${L(y)}. If ${L(y)} is false, ${L(x)} must hold: ${L(neg(y))} → ${L(x)}.`,
    });
  }
  // the groups of the implication graph, numbered in topological order
  const ids = Object.keys(LIT_POS);
  const reach = (s: string) => {
    const seen = new Set([s]);
    const st = [s];
    while (st.length) {
      const u = st.pop()!;
      for (const e of g.edges) if (e.a === u && !seen.has(e.b)) (seen.add(e.b), st.push(e.b));
    }
    return seen;
  };
  const R = Object.fromEntries(ids.map((x) => [x, reach(x)]));
  const groups: string[][] = [];
  for (const x of ids) if (!groups.some((gr) => gr.includes(x))) groups.push(ids.filter((y) => R[x].has(y) && R[y].has(x)));
  groups.sort((p, q) => (R[p[0]].has(q[0]) ? -1 : R[q[0]].has(p[0]) ? 1 : 0));
  const gOf = (x: string) => groups.findIndex((gr) => gr.includes(x));
  for (const x of ids) {
    b.tag.set(x, String(gOf(x)));
    b.tk.set(x, "plain");
  }
  for (const e of g.edges) b.es.set(e.id, gOf(e.a) === gOf(e.b) ? "tree" : "cur");
  const names = (gr: string[]) => `{${gr.map(L).join(", ")}}`;
  out.push({
    ...b.snap(),
    caption:
      groups.length === 1
        ? "Find the strongly connected groups (lesson 2). Here every vertex is in one group: each condition forces every other."
        : `Find the strongly connected groups (lesson 2): ${groups.map(names).join(" and ")}. Tags give each group’s number in topological order; the marked edges go from group 0 to group 1.`,
    readout: `groups: ${groups.map(names).join(" ")}`,
  });
  if (groups.length === 1) {
    b.st.set("a", "bad");
    b.st.set("na", "bad");
    out.push({
      ...b.snap(),
      caption: "a and ¬a are in the same group. a → b → ¬c → ¬a: if a is yes, a must be no. And ¬a → ¬b → a: if a is no, a must be yes. No choice keeps every rule.",
      readout: `groups: ${groups.map(names).join(" ")}`,
      verdict: { ok: false, text: "a and ¬a in one group: no answer" },
    });
    return out;
  }
  out.push({
    ...b.snap(),
    caption: "Check each question: a and ¬a are in different groups, and so are b and ¬b, and c and ¬c. So an answer exists (the proof is in this lesson).",
    readout: `groups: ${groups.map(names).join(" ")}`,
    verdict: { ok: true, text: "no condition is with its opposite" },
  });
  const truth: string[] = [];
  for (const q of ["a", "b", "c"]) {
    const t = gOf(q) > gOf(neg(q)) ? q : neg(q);
    truth.push(t);
    b.st.set(t, "found");
    b.st.set(neg(t), "out");
  }
  out.push({
    ...b.snap(),
    caption: `For each question, make true the condition whose group comes later: ${truth.map(L).join(", ")} (double rule). Their opposites are false (hatched). So a is yes, b is no, c is yes.`,
    readout: "a = yes, b = no, c = yes",
  });
  const holds = (x: string) => truth.includes(x);
  out.push({
    ...b.snap(),
    caption: `Every rule holds: ${rules.map(([x, y]) => `${rule([x, y])} by ${holds(x) ? L(x) : L(y)}`).join("; ")}. No true condition has an edge to a false one.`,
    readout: "a = yes, b = no, c = yes",
    verdict: { ok: true, text: "every rule holds" },
  });
  return out;
}
