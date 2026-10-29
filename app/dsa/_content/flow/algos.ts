// FLOW step generators. Every figure is a list of steps made up front; each step is a full picture of the network
// (vertex and edge states, flow/capacity plates or residual capacities, tags).

import type { GEdge, GEdgeState, GNode, GState } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type GraphStep = {
  nodes: GNode[];
  edges: GEdge[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

type Line = { id: string; a: string; b: string; c: number };
/** `tagAt`: a tag corner per vertex, on the side no line leaves from (default top right) */
type Net = { pos: Record<string, [number, number]>; lines: Line[]; labels?: Record<string, string>; tagAt?: Record<string, GNode["tagAt"]> };

const ln = (a: string, b: string, c: number): Line => ({ id: `${a}${b}`, a, b, c });
const route = (xs: string[]) => xs.join(" → ");

/** What one step shows: marks on vertices and lines that last until changed, and marks for this step only. */
class Board {
  st = new Map<string, GState>();
  tag = new Map<string, string>();
  tk = new Map<string, "ink" | "plain" | "bad">();
  es = new Map<string, GEdgeState>();
  flashN = new Map<string, GState>();
  flashE = new Map<string, GEdgeState>();
  constructor(public g: Net) {}
  nodes(): GNode[] {
    return Object.entries(this.g.pos).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      label: this.g.labels?.[id],
      state: this.flashN.get(id) ?? this.st.get(id) ?? "",
      tag: this.tag.get(id),
      tagKind: this.tk.get(id) ?? "plain",
      tagAt: this.g.tagAt?.[id],
    }));
  }
  /** The network: every line with a flow/capacity plate; lines that carry flow get the Board Pale band. */
  network(f: Record<string, number>, plain = false): GEdge[] {
    return this.g.lines.map((l) => ({
      a: l.a,
      b: l.b,
      label: plain ? String(l.c) : `${f[l.id] ?? 0}/${l.c}`,
      state: this.flashE.get(l.id) ?? this.es.get(l.id) ?? ((f[l.id] ?? 0) > 0 ? "tree" : ""),
    }));
  }
  /** The residual graph: an arc a → b with what is left, and an arc b → a with the flow, each only when above 0. */
  residual(f: Record<string, number>): GEdge[] {
    const out: GEdge[] = [];
    for (const l of this.g.lines) {
      const fl = f[l.id] ?? 0;
      const both = fl > 0 && fl < l.c;
      out.push({ a: l.a, b: l.b, label: String(l.c - fl), bend: both ? 14 : 0, state: l.c - fl > 0 ? (this.flashE.get(`${l.id}+`) ?? "") : "hidden" });
      out.push({ a: l.b, b: l.a, label: String(fl), bend: both ? 14 : 0, state: fl > 0 ? (this.flashE.get(`${l.id}-`) ?? "old") : "hidden" });
    }
    return out;
  }
  snap(edges: GEdge[]): Pick<GraphStep, "nodes" | "edges"> {
    const s = { nodes: this.nodes(), edges };
    this.flashN.clear();
    this.flashE.clear();
    return s;
  }
}

/* ---------- the network of lessons 1, 3 and 4: s, A, B, C, D, t ---------- */

export const NET: Net = {
  // 2.6 high, not 2: on a phone the plates next to s and t then clear the tags.
  pos: { s: [0, 1.3], A: [2, 0], B: [2, 2.6], C: [4, 0], D: [4, 2.6], t: [6, 1.3] },
  // s's lines leave from its right corners and D → t from its top right, so those tags go above s and under D
  tagAt: { s: "t", D: "br" },
  lines: [ln("s", "A", 10), ln("s", "B", 10), ln("A", "B", 2), ln("A", "C", 4), ln("A", "D", 8), ln("B", "D", 9), ln("D", "C", 6), ln("C", "t", 10), ln("D", "t", 10)],
};
export const NET_SIZE = { w: 6, h: 2.6 };
const MAXF: Record<string, number> = { sA: 10, sB: 9, AB: 0, AC: 4, AD: 6, BD: 9, DC: 5, Ct: 9, Dt: 10 };

/* ---------- FLOW-1.1: the two rules of a flow ---------- */

export type RulesVariant = "check" | "broken";

const inOut = (g: Net, f: Record<string, number>, v: string) => {
  const ins = g.lines.filter((l) => l.b === v);
  const outs = g.lines.filter((l) => l.a === v);
  const sum = (ls: Line[]) => ls.reduce((s, l) => s + (f[l.id] ?? 0), 0);
  return { ins, outs, i: sum(ins), o: sum(outs), words: (ls: Line[]) => (ls.length > 1 ? `${ls.map((l) => f[l.id] ?? 0).join(" + ")} = ${sum(ls)}` : String(sum(ls))) };
};

export function rulesSteps(v: RulesVariant): GraphStep[] {
  const g = NET;
  const out: GraphStep[] = [];
  const b = new Board(g);
  if (v === "check") {
    const f = MAXF;
    b.tk.set("s", "ink");
    out.push({
      ...b.snap(b.network(f, true)),
      caption: "A network: one-way lines, each with a capacity, the most trains an hour it can carry. Trains start at the source s and end at the sink t.",
      readout: "capacities in trains an hour",
    });
    out.push({
      ...b.snap(b.network(f)),
      caption: "A plan: each plate now reads flow/capacity. Shaded lines carry trains. Rule 1, capacity: every line carries between 0 and its capacity. Every plate here passes.",
      readout: "rule 1: 0 ≤ flow ≤ capacity on every line",
      verdict: { ok: true, text: "capacity rule holds" },
    });
    for (const x of ["A", "B", "C", "D"]) {
      const r = inOut(g, f, x);
      b.flashN.set(x, "cur");
      for (const l of [...r.ins, ...r.outs]) b.flashE.set(l.id, "cur");
      out.push({
        ...b.snap(b.network(f)),
        caption:
          x === "A"
            ? `Rule 2, conservation: at every station except s and t, the trains that arrive equal the trains that leave. At A: in ${r.words(r.ins)}, out ${r.words(r.outs)}.`
            : `At ${x}: in ${r.words(r.ins)}, out ${r.words(r.outs)}.`,
        readout: `${x}: in ${r.i}, out ${r.o}`,
      });
    }
    b.flashN.set("s", "cur");
    b.flashN.set("t", "found");
    out.push({
      ...b.snap(b.network(f)),
      caption: "Both rules hold, so this is a flow. Its value is what leaves s: 10 + 9 = 19. The same 19 reaches t (9 + 10), because no station in between keeps or makes trains.",
      readout: "value = 19",
      verdict: { ok: true, text: "a flow of value 19" },
    });
    return out;
  }
  const over = { ...MAXF, Dt: 11 };
  b.es.set("Dt", "bad");
  out.push({
    ...b.snap(b.network(over)),
    caption: "This plan puts 11 trains an hour on D → t, whose capacity is 10. That breaks rule 1, whatever the other lines do.",
    readout: "D → t: 11 > 10",
    verdict: { ok: false, text: "over capacity" },
  });
  b.es.delete("Dt");
  const lost = { ...MAXF, Dt: 9 };
  const r = inOut(g, lost, "D");
  b.st.set("D", "bad");
  for (const l of [...r.ins, ...r.outs]) b.flashE.set(l.id, "cur");
  out.push({
    ...b.snap(b.network(lost)),
    caption: `Now D → t carries 9, within its capacity. But at D: in ${r.words(r.ins)}, out ${r.words(r.outs)}. One train an hour disappears at D, so rule 2 is broken.`,
    readout: `D: in ${r.i}, out ${r.o}`,
    verdict: { ok: false, text: "conservation broken at D" },
  });
  b.st.delete("D");
  out.push({
    ...b.snap(b.network(MAXF)),
    caption: "With 10 on D → t, D sends out 15 again and both rules hold. A checker must test both rules: every number can be within its capacity and the plan still be wrong (P1).",
    readout: "D: in 15, out 15",
    verdict: { ok: true, text: "a flow of value 19" },
  });
  return out;
}

/* ---------- FLOW-2.1: stuck without going back; the residual graph; bad choices ---------- */

export type FordVariant = "stuck" | "residual" | "slow";

const DIA_POS: Record<string, [number, number]> = { s: [0, 1], A: [2, 0], B: [2, 2], t: [4, 1] };
const diamond = (big: number): Net => ({ pos: DIA_POS, lines: [ln("s", "A", big), ln("s", "B", big), ln("A", "B", 1), ln("A", "t", big), ln("B", "t", big)] });
export const DIA_SIZE = { w: 4, h: 2 };

/** Mark a path on the network (cur) and add `push` to the flow; arcs used backwards take flow off the line. */
function along(g: Net, path: string[]) {
  return path.slice(0, -1).map((u, k) => {
    const w = path[k + 1];
    const fwd = g.lines.find((l) => l.a === u && l.b === w);
    if (fwd) return { id: fwd.id, dir: 1 };
    const back = g.lines.find((l) => l.a === w && l.b === u)!;
    return { id: back.id, dir: -1 };
  });
}

export function fordSteps(v: FordVariant): GraphStep[] {
  const out: GraphStep[] = [];
  if (v === "stuck") {
    const g = diamond(1);
    const b = new Board(g);
    const f: Record<string, number> = {};
    out.push({ ...b.snap(b.network(f)), caption: "Every line carries at most 1. The most that can reach t is 2: s → A → t and s → B → t. Try the simple idea: find a path with room, send along it, repeat." });
    for (const x of along(g, ["s", "A", "B", "t"])) b.flashE.set(x.id, "found");
    out.push({ ...b.snap(b.network(f)), caption: "Suppose the first path found is s → A → B → t. Every line on it has room for 1.", readout: "path s → A → B → t, room 1" });
    for (const x of along(g, ["s", "A", "B", "t"])) f[x.id] = 1;
    out.push({ ...b.snap(b.network(f)), caption: "Send 1 along it. The flow is now 1.", readout: "flow 1" });
    b.flashE.set("sB", "cur");
    b.flashE.set("Bt", "old");
    b.flashE.set("sA", "old");
    out.push({
      ...b.snap(b.network(f)),
      caption: "Now look for another path with room. From s only s → B has room, and from B the only line, B → t, is full. No path is left, so the simple idea stops at 1, though 2 is possible.",
      readout: "flow 1, best 2",
      verdict: { ok: false, text: "stuck at 1" },
    });
    return out;
  }
  if (v === "residual") {
    const g = diamond(1);
    const b = new Board(g);
    const f: Record<string, number> = {};
    out.push({
      ...b.snap(b.residual(f)),
      caption: "The residual graph shows what can still change. Each line u → v gives an arc u → v with the room left, c − f, and an arc v → u with the flow f, which can be sent back. Arcs with 0 are not drawn. With no flow yet, it is the network itself.",
      readout: "flow 0",
    });
    const p1 = ["s", "A", "B", "t"];
    for (const x of along(g, p1)) b.flashE.set(`${x.id}+`, "found");
    out.push({ ...b.snap(b.residual(f)), caption: "First path: s → A → B → t, room 1, the same bad choice as before.", readout: "path s → A → B → t" });
    for (const x of along(g, p1)) f[x.id] = 1;
    out.push({
      ...b.snap(b.residual(f)),
      caption: "Send 1. Each line on the path is now full, so its forward arc is gone, and a dashed arc points back, holding the 1 that could be undone. B → A is one of them.",
      readout: "flow 1",
    });
    const p2 = ["s", "B", "A", "t"];
    for (const x of along(g, p2)) b.flashE.set(`${x.id}${x.dir > 0 ? "+" : "-"}`, "found");
    out.push({
      ...b.snap(b.residual(f)),
      caption: "Search the residual graph: s → B → A → t. The middle arc B → A goes against the line A → B. Using it means: take the train off A → B and send it on from A to t instead.",
      readout: "path s → B → A → t, room 1",
    });
    for (const x of along(g, p2)) f[x.id] = (f[x.id] ?? 0) + x.dir;
    out.push({
      ...b.snap(b.residual(f)),
      caption: "Send 1. Now no arc leaves s at all, so there is no path: the flow is maximum (lesson 4 proves this).",
      readout: "flow 2",
    });
    b.es.set("AB", "old");
    out.push({
      ...b.snap(b.network(f)),
      caption: "Back in the network: s → A → t and s → B → t carry 1 each, and A → B carries 0. The second path undid the first path’s use of A → B.",
      readout: "flow 2",
      verdict: { ok: true, text: "the most: 2" },
    });
    return out;
  }
  const g = diamond(1000);
  const b = new Board(g);
  const f: Record<string, number> = {};
  out.push({ ...b.snap(b.network(f)), caption: "The same shape with capacity 1,000 on the outer lines. The most flow is 2,000, and two paths are enough: s → A → t and s → B → t." });
  const send = (p: string[], caption: string, readout: string) => {
    for (const x of along(g, p)) {
      f[x.id] = (f[x.id] ?? 0) + x.dir;
      b.flashE.set(x.id, "found");
    }
    out.push({ ...b.snap(b.network(f)), caption, readout });
  };
  send(["s", "A", "B", "t"], "But a method that may pick any path could pick s → A → B → t. The middle line has room 1, so only 1 is sent.", "flow 1");
  send(["s", "B", "A", "t"], "Next it could pick s → B → A → t, using the middle line backwards. Again only 1 is sent.", "flow 2");
  send(["s", "A", "B", "t"], "And s → A → B → t again: 1 more. Each pair of rounds adds 2.", "flow 3");
  for (const id of ["sA", "sB", "At", "Bt"]) f[id] = 1000;
  f.AB = 0;
  out.push({
    ...b.snap(b.network(f)),
    caption: "Choosing like this every time takes 2,000 rounds to reach 2,000. With capacities of a million it would take two million. The number of rounds depends on the capacities: lesson 3 fixes this by always taking a shortest path.",
    readout: "flow 2000 after 2000 rounds",
    verdict: { ok: true, info: true, text: "right, but slow" },
  });
  return out;
}

/* ---------- FLOW-3.1: Edmonds-Karp rounds and Dinic phases on the same network ---------- */

export type FastVariant = "ek" | "dinic";

type Arc = { from: string; to: string; id: string; dir: number; room: number };
function arcs(g: Net, f: Record<string, number>): Arc[] {
  const out: Arc[] = [];
  for (const l of g.lines) {
    out.push({ from: l.a, to: l.b, id: l.id, dir: 1, room: l.c - (f[l.id] ?? 0) });
    out.push({ from: l.b, to: l.a, id: l.id, dir: -1, room: f[l.id] ?? 0 });
  }
  return out.filter((a) => a.room > 0);
}
function levels(g: Net, f: Record<string, number>): Record<string, number> {
  const d: Record<string, number> = { s: 0 };
  const q = ["s"];
  const as = arcs(g, f);
  while (q.length) {
    const u = q.shift()!;
    for (const a of as) if (a.from === u && !(a.to in d)) (d[a.to] = d[u] + 1), q.push(a.to);
  }
  return d;
}

export function fastSteps(v: FastVariant): GraphStep[] {
  const g = NET;
  const b = new Board(g);
  const f: Record<string, number> = {};
  const out: GraphStep[] = [];
  let total = 0;
  const tagLevels = (d: Record<string, number>) => {
    for (const x of Object.keys(g.pos)) {
      if (x in d) b.tag.set(x, String(d[x]));
      else b.tag.delete(x);
    }
  };
  const push = (path: Arc[]) => {
    const p = Math.min(...path.map((a) => a.room));
    for (const a of path) f[a.id] = (f[a.id] ?? 0) + a.dir * p;
    total += p;
    return p;
  };
  if (v === "ek") {
    out.push({
      ...b.snap(b.network(f)),
      caption: "Edmonds-Karp: Ford-Fulkerson where each path is a shortest path in the residual graph, found by breadth-first search. Tags show each station’s distance from s in the residual graph.",
      readout: "flow 0",
    });
    for (let round = 1; ; round++) {
      const d = levels(g, f);
      tagLevels(d);
      if (!("t" in d)) {
        out.push({
          ...b.snap(b.network(f)),
          caption: `Round ${round}: the search from s reaches only ${Object.keys(d).join(" and ")}. t has no distance, so no path is left: the flow is maximum.`,
          readout: `flow ${total}`,
          verdict: { ok: true, text: `the most: ${total}` },
        });
        return out;
      }
      // the BFS tree path to t, arcs tried in list order
      const as = arcs(g, f);
      const via: Record<string, Arc> = {};
      const seen = new Set(["s"]);
      const q = ["s"];
      while (q.length) {
        const u = q.shift()!;
        for (const a of as) if (a.from === u && !seen.has(a.to)) (seen.add(a.to), (via[a.to] = a), q.push(a.to));
      }
      const path: Arc[] = [];
      for (let x = "t"; x !== "s"; x = via[x].from) path.unshift(via[x]);
      for (const a of path) b.flashE.set(a.id, "found");
      const names = ["s", ...path.map((a) => a.to)];
      const room = Math.min(...path.map((a) => a.room));
      out.push({
        ...b.snap(b.network(f)),
        caption: `Round ${round}: the shortest path is ${route(names)}, ${path.length} lines long. Its smallest room is ${room}.`,
        readout: `flow ${total}, distance to t ${d.t}`,
      });
      push(path);
      for (const a of path) b.flashE.set(a.id, "cur");
      out.push({ ...b.snap(b.network(f)), caption: `Send ${room}. The flow is now ${total}.`, readout: `flow ${total}` });
    }
  }
  // Dinic
  out.push({
    ...b.snap(b.network(f)),
    caption: "Dinic’s method works in phases. Each phase labels every station with its level, its distance from s in the residual graph, and then sends flow only from one level to the next.",
    readout: "flow 0",
  });
  for (let phase = 1; ; phase++) {
    const d = levels(g, f);
    tagLevels(d);
    for (const x of Object.keys(g.pos)) b.st.set(x, "");
    if (!("t" in d)) {
      out.push({
        ...b.snap(b.network(f)),
        caption: `Phase ${phase}: t gets no level, so no path is left. ${phase - 1} phases, flow ${total}.`,
        readout: `flow ${total}`,
        verdict: { ok: true, text: `the most: ${total}` },
      });
      return out;
    }
    const usable = (a: Arc) => a.room > 0 && d[a.to] === d[a.from] + 1 && b.st.get(a.to) !== "out";
    const lvl = arcs(g, f).filter((a) => d[a.to] === d[a.from] + 1);
    for (const l of g.lines) if (!lvl.some((a) => a.id === l.id)) b.es.set(l.id, "old");
    out.push({
      ...b.snap(b.network(f)),
      caption: `Phase ${phase}: levels by breadth-first search (tags). Lines that do not go from one level to the next are left out of this phase (dashed). t is at level ${d.t}.`,
      readout: `flow ${total}`,
    });
    // blocking flow: walk from s; a dead end is hatched and never entered again in this phase
    while (true) {
      const path: Arc[] = [];
      let u = "s";
      const dead: string[] = [];
      while (u !== "t") {
        const a = arcs(g, f).find((x) => x.from === u && usable(x));
        if (!a) {
          if (u === "s") break;
          b.st.set(u, "out");
          dead.push(u);
          u = path.pop()!.from;
          continue;
        }
        path.push(a);
        u = a.to;
      }
      if (u !== "t") {
        out.push({
          ...b.snap(b.network(f)),
          caption: `No more paths along the levels${dead.length ? `: ${dead.join(" and ")} lead${dead.length > 1 ? "" : "s"} nowhere now (hatched)` : ""}. The phase has found a blocking flow. The flow is ${total}.`,
          readout: `flow ${total}`,
        });
        break;
      }
      const names = ["s", ...path.map((a) => a.to)];
      const room = Math.min(...path.map((a) => a.room));
      push(path);
      for (const a of path) b.flashE.set(a.id, "found");
      out.push({
        ...b.snap(b.network(f)),
        caption: `${dead.length ? `${dead.join(" and ")} lead${dead.length > 1 ? "" : "s"} nowhere now (hatched), so the walk went another way. ` : ""}Path ${route(names)}: send ${room}. The flow is ${total}.`,
        readout: `flow ${total}`,
      });
    }
    for (const l of g.lines) b.es.delete(l.id);
  }
}

/* ---------- FLOW-4.1: cuts, and the cut that the last search finds ---------- */

export type CutVariant = "find" | "every";

export function cutSteps(v: CutVariant): GraphStep[] {
  const g = NET;
  const f = MAXF;
  const out: GraphStep[] = [];
  const capOf = (S: Set<string>) => g.lines.filter((l) => S.has(l.a) && !S.has(l.b)).reduce((s, l) => s + l.c, 0);
  const across = (S: Set<string>) =>
    g.lines.filter((l) => S.has(l.a) && !S.has(l.b)).reduce((s, l) => s + f[l.id], 0) - g.lines.filter((l) => !S.has(l.a) && S.has(l.b)).reduce((s, l) => s + f[l.id], 0);
  const show = (S: Set<string>, caption: string, final = false) => {
    const b = new Board(g);
    for (const x of S) b.st.set(x, "seen");
    for (const l of g.lines) {
      if (S.has(l.a) && !S.has(l.b)) b.es.set(l.id, final ? "found" : "cur");
      else if (!S.has(l.a) && S.has(l.b)) b.es.set(l.id, "old");
    }
    const c = capOf(S);
    out.push({
      ...b.snap(b.network(f)),
      caption,
      readout: `S = {${[...S].join(", ")}}: capacity ${c}, flow across ${across(S)}`,
      verdict: final ? { ok: true, text: `cut ${c} = flow 19` } : undefined,
    });
  };
  if (v === "every") {
    const b = new Board(g);
    out.push({
      ...b.snap(b.network(f)),
      caption: "A maximum flow of 19. A cut splits the stations into a side S with s, and the rest with t. Its capacity is the total capacity of the lines from S to the rest.",
      readout: "flow 19",
    });
    show(new Set(["s"]), "S = {s}: the lines out of S are s → A and s → B, capacity 10 + 10 = 20. Every train crosses them, so the flow is at most 20.");
    show(new Set(["s", "A", "B"]), "S = {s, A, B}: lines A → C, A → D and B → D cross, capacity 4 + 8 + 9 = 21. The flow across is 19: what goes out minus what comes back.");
    show(
      new Set(["s", "A", "B", "D"]),
      "S = {s, A, B, D}: A → C, D → C and D → t cross, capacity 4 + 6 + 10 = 20, and the flow across is 4 + 5 + 10 = 19.",
    );
    show(new Set(["s", "A", "C"]), "S = {s, A, C}: s → B, A → B, A → D and C → t cross, 10 + 2 + 8 + 10 = 30. D → C comes back into S (dashed): its 5 counts against the flow across, 9 + 0 + 6 + 9 − 5 = 19. Every cut carries exactly the value, 19, and that is never more than its capacity.");
    return out;
  }
  const b = new Board(g);
  out.push({
    ...b.snap(b.network(f)),
    caption: "The flow is maximum: no path is left in the residual graph. Search the residual graph from s once more and see which stations it reaches.",
    readout: "flow 19",
  });
  b.st.set("s", "seen");
  b.flashE.set("sA", "old");
  b.flashE.set("sB", "cur");
  out.push({
    ...b.snap(b.network(f)),
    caption: "From s: s → A is full (10/10), so no arc. s → B has room 1, so B is reached. No line brings flow into s, so there are no arcs back from s.",
    readout: "reached: s, B",
  });
  b.st.set("B", "seen");
  // both lines out of B are refused, and drawn the same
  b.flashE.set("BD", "old");
  b.flashE.set("AB", "old");
  out.push({
    ...b.snap(b.network(f)),
    caption: "From B: B → D is full (9/9). A → B carries 0, so there is nothing to send back to A. The search stops: S = {s, B}.",
    readout: "reached: s, B",
  });
  show(
    new Set(["s", "B"]),
    "The lines from S out are s → A (10) and B → D (9): both full. The line from outside into S, A → B, carries 0. So the flow across the cut is all of its capacity: 10 + 9 = 19. Flow 19 = cut 19, so both are best.",
    true,
  );
  return out;
}

/* ---------- FLOW-5.1: augmenting paths, and König's cover ---------- */

export type MatchVariant = "augment" | "konig";

const side = (n: number, pre: string, labels: string[]) => Object.fromEntries(labels.slice(0, n).map((l, k) => [`${pre}${k}`, [pre === "L" ? 0 : 2, k * 0.9] as [number, number]]));
const W = ["1", "2", "3", "4"];
const J = ["A", "B", "C", "D"];
const bip = (pairs: [number, number][]): Net => ({
  pos: { ...side(4, "L", W), ...side(4, "R", J) },
  labels: { ...Object.fromEntries(W.map((w, k) => [`L${k}`, w])), ...Object.fromEntries(J.map((j, k) => [`R${k}`, j])) },
  lines: pairs.map(([u, v]) => ({ id: `L${u}R${v}`, a: `L${u}`, b: `R${v}`, c: 1 })),
});
export const BIP_SIZE = { w: 2, h: 2.7 };

export function matchSteps(v: MatchVariant): GraphStep[] {
  const out: GraphStep[] = [];
  const pairs: [number, number][] =
    v === "augment"
      ? [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 1],
          [2, 2],
          [3, 2],
          [3, 3],
        ]
      : [
          [0, 0],
          [1, 0],
          [1, 1],
          [2, 1],
          [3, 1],
          [3, 2],
        ];
  const g = bip(pairs);
  const b = new Board(g);
  const mateL: number[] = [-1, -1, -1, -1];
  const mateR: number[] = [-1, -1, -1, -1];
  const adj = (u: number) => pairs.filter((p) => p[0] === u).map((p) => p[1]);
  const L = (u: number) => W[u];
  const R = (x: number) => J[x];
  const edges = (): GEdge[] =>
    g.lines.map((l) => {
      const u = Number(l.a.slice(1));
      const x = Number(l.b.slice(1));
      return { a: l.a, b: l.b, state: b.flashE.get(l.id) ?? (mateL[u] === x ? "found" : "") };
    });
  const marks = () => {
    for (let k = 0; k < 4; k++) {
      b.st.set(`L${k}`, mateL[k] >= 0 ? "done" : "");
      b.st.set(`R${k}`, mateR[k] >= 0 ? "done" : "");
    }
  };
  const snap = (caption: string, readout?: string, verdict?: Verdict) => {
    marks();
    const s = { nodes: b.nodes(), edges: edges(), caption, readout, verdict };
    b.flashN.clear();
    b.flashE.clear();
    out.push(s);
  };
  const size = () => mateL.filter((x) => x >= 0).length;
  if (v === "augment") {
    snap(
      "Drivers 1 to 4 on the left, routes A to D on the right; a line means the driver can take that route. A matching pairs drivers with routes, using nobody twice. Matched pairs get the yellow band.",
      "matched 0",
    );
    for (let root = 0; root < 4; root++) {
      // search for an augmenting path from root, first free route by depth-first search
      const via: Record<number, number> = {};
      const seenR = new Set<number>();
      const tried: string[] = [];
      let end = -1;
      const dfs = (u: number): boolean => {
        for (const x of adj(u)) {
          if (seenR.has(x)) continue;
          seenR.add(x);
          via[x] = u;
          if (mateR[x] === -1) {
            end = x;
            return true;
          }
          tried.push(`${R(x)} is taken by ${L(mateR[x])}`);
          if (dfs(mateR[x])) return true;
        }
        return false;
      };
      dfs(root);
      // the path: driver, route, driver, ... route
      const path: string[] = [];
      for (let x = end; x !== -1; ) {
        const u = via[x];
        path.unshift(`L${u}`, `R${x}`);
        x = u === root ? -1 : mateL[u];
      }
      b.flashN.set(`L${root}`, "cur");
      for (let k = 0; k + 1 < path.length; k++) b.flashE.set(k % 2 === 0 ? `${path[k]}${path[k + 1]}` : `${path[k + 1]}${path[k]}`, k % 2 === 0 ? "cur" : "found");
      const names = path.map((id) => (id[0] === "L" ? L(Number(id.slice(1))) : R(Number(id.slice(1)))));
      const short = path.length === 2;
      snap(
        short
          ? tried.length
            ? `Driver ${L(root)}: ${tried.join(", ")}, and ${tried.length > 2 ? "none of them" : "neither"} can move to another route. But route ${names[1]} is free.`
            : `Driver ${L(root)}: route ${names[1]} is free. The path is just ${names.join(" – ")}.`
          : `Driver ${L(root)}: ${tried.join(", ")}… An augmenting path: ${names.join(" – ")}. Its lines are, in turn, not matched (bold) and matched (yellow band), and it ends at a free route.`,
        `matched ${size()}`,
      );
      for (let x = end; x !== -1; ) {
        const u = via[x];
        const prev = mateL[u];
        mateL[u] = x;
        mateR[x] = u;
        x = u === root ? -1 : prev;
      }
      snap(
        short ? `Match ${names.join(" – ")}.` : `Flip the path: every unmatched line on it becomes matched, and every matched one unmatched. One more pair than before, and nobody is used twice.`,
        `matched ${size()}`,
      );
    }
    snap("Every driver has a route: 4 pairs, the most possible. Lesson 5 proves that a matching is largest exactly when no augmenting path is left.", "matched 4", { ok: true, text: "4 pairs" });
    return out;
  }
  // König: a largest matching, then the cover built from the free driver's alternating search
  for (const [u, x] of [
    [0, 0],
    [1, 1],
    [3, 2],
  ]) {
    mateL[u] = x;
    mateR[x] = u;
  }
  snap(
    "A largest matching here has 3 pairs: driver 3 can only take route B, and drivers 2, 3 and 4 all want B. König’s theorem says the fewest vertices that touch every line is also 3.",
    "matched 3",
  );
  // alternating search from free drivers
  const Z = new Set<string>();
  const queue = [2];
  Z.add("L2");
  const order: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    for (const x of adj(u)) {
      if (Z.has(`R${x}`) || mateL[u] === x) continue;
      Z.add(`R${x}`);
      order.push(`${L(u)} – ${R(x)}`);
      const w = mateR[x];
      if (w >= 0 && !Z.has(`L${w}`)) {
        Z.add(`L${w}`);
        order.push(`${R(x)} = ${L(w)}`);
        queue.push(w);
      }
    }
  }
  for (const id of Z) b.flashN.set(id, "seen");
  snap(
    `Start from every free driver (here only 3) and follow lines that alternate: not matched to a route, then the matched line back to a driver. This reaches ${[...Z].map((id) => (id[0] === "L" ? L(Number(id.slice(1))) : R(Number(id.slice(1))))).join(", ")} (shaded). No free route is reached, or there would be an augmenting path.`,
    "matched 3",
  );
  const cover = [...["L0", "L1", "L2", "L3"].filter((id) => !Z.has(id)), ...["R0", "R1", "R2", "R3"].filter((id) => Z.has(id))];
  const name = (id: string) => (id[0] === "L" ? L(Number(id.slice(1))) : R(Number(id.slice(1))));
  for (const id of cover) b.flashN.set(id, "found");
  snap(
    `The cover: drivers not reached (${cover.filter((id) => id[0] === "L").map(name).join(", ")}) and routes reached (${cover.filter((id) => id[0] === "R").map(name).join(", ")}). That is ${cover.length} vertices, one for each matched pair.`,
    `cover ${cover.map(name).join(" ")}`,
  );
  for (const id of cover) b.flashN.set(id, "found");
  for (const l of g.lines) b.flashE.set(l.id, "cur");
  snap(
    "Every line touches the cover: a line from a reached driver goes to a reached route, and a line from a driver not reached is covered by that driver. So 3 vertices touch all 6 lines, and no matching can have more than 3 pairs: each pair needs its own cover vertex.",
    `cover ${cover.map(name).join(" ")}`,
    { ok: true, text: "largest matching 3 = smallest cover 3" },
  );
  return out;
}
