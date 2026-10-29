// HARD step generators. Every figure is a pure function of its step number.
// Certificates, reductions, vertex covers and tours are drawn on the Graph stage; group numbers are plain tags,
// never colours. The branch-and-bound search is a Tree whose pruned nodes are hatched (pruning is not a mistake).
// Variable choices and Miller–Rabin squarings are Grid rows. Captions use `backticks` for code.

import type { GCell, GEdge, GNode, QItem, TNode } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type Base = { caption: string; readout?: string; verdict?: Verdict };
export type GraphStep = Base & { nodes: GNode[]; edges: GEdge[]; queue?: QItem[] };

const list = (xs: (string | number)[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/* ---------------------------------------------------------------- HARD-1.1: checking a certificate, and search from yes/no */

export type CheckVariant = "check" | "wrong" | "find";
export const CHECK_SIZE = { w: 4, h: 3.2 };
const C_POS: Record<string, [number, number]> = { A: [0, 0], B: [2, 0], C: [4, 0], D: [1, 1.6], E: [3, 1.6], F: [2, 3.2] };
const C_EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "C"],
  ["A", "D"],
  ["B", "D"],
  ["B", "E"],
  ["C", "E"],
  ["D", "E"],
  ["D", "F"],
  ["E", "F"],
];
const GOOD: Record<string, number> = { A: 0, B: 1, C: 2, D: 2, E: 0, F: 1 };
const BAD: Record<string, number> = { ...GOOD, F: 0 };

export type FindStep = Base & { cells: GCell[][] };
export const SAT_VARS = ["x₁", "x₂", "x₃", "x₄"];
const SAT_F: number[][] = [
  [1, 2],
  [-1, 3],
  [-2, -3],
  [3, 4],
  [-4, -1],
];
const litText = (l: number) => (l > 0 ? `x${l}` : `not x${-l}`);
export const SAT_TEXT = SAT_F.map((c) => `(${c.map(litText).join(" or ")})`).join(" and ");

function satisfiable(fixed: Record<number, boolean>): boolean {
  for (let m = 0; m < 16; m++) {
    const val = (v: number) => ((m >> (v - 1)) & 1) === 1;
    if (Object.entries(fixed).some(([v, b]) => val(Number(v)) !== b)) continue;
    if (SAT_F.every((c) => c.some((l) => (l > 0 ? val(l) : !val(-l))))) return true;
  }
  return false;
}

export function checkSteps(v: CheckVariant): GraphStep[] {
  const col = v === "wrong" ? BAD : GOOD;
  const out: GraphStep[] = [];
  const view = (done: number, cur: number | null, bad: number | null): Pick<GraphStep, "nodes" | "edges"> => ({
    nodes: Object.entries(C_POS).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      tag: String(col[id]),
      tagKind: "plain" as const,
    })),
    edges: C_EDGES.map(([a, b], k) => ({
      a,
      b,
      state: (k === bad ? "bad" : k === cur ? "cur" : k < done ? "tree" : "") as GEdge["state"],
    })),
  });
  out.push({
    ...view(0, null, null),
    caption:
      v === "wrong"
        ? "The same question, but this time the claimed answer is wrong. The checker does not know that: it runs exactly the same loop over the edges."
        : "Can these vertices be split into three groups, 0, 1 and 2, so that no edge joins two vertices of one group? Finding such a split may be hard. But someone hands you one (the tags): checking it is easy.",
    readout: `certificate: ${Object.entries(col)
      .map(([id, c]) => `${id} ${c}`)
      .join(" · ")}`,
  });
  for (let k = 0; k < C_EDGES.length; k++) {
    const [a, b] = C_EDGES[k];
    if (col[a] === col[b]) {
      out.push({
        ...view(k, null, k),
        caption: `${a}–${b}: both are in group ${col[a]}. The rule is broken, so this certificate does not prove a yes. (Another split might still exist; a wrong certificate proves nothing either way.)`,
        readout: `edge ${a}–${b}: ${col[a]} = ${col[b]}`,
        verdict: { ok: false, text: `${a} and ${b} in one group` },
      });
      return out;
    }
    out.push({
      ...view(k, k, null),
      caption: `Edge ${a}–${b}: groups ${col[a]} and ${col[b]} differ. Fine.`,
      readout: `checked ${k + 1} of ${C_EDGES.length} edges`,
    });
  }
  out.push({
    ...view(C_EDGES.length, null, null),
    caption: `Every edge joins two different groups, so the answer is yes, and the tags prove it. The check took one look per edge: O(V + E). A yes answer with a proof that can be checked this fast is what puts a problem in NP.`,
    readout: `${C_EDGES.length} edges checked`,
    verdict: { ok: true, text: "yes, proved" },
  });
  return out;
}

export function findSteps(): FindStep[] {
  const fixed: Record<number, boolean> = {};
  const out: FindStep[] = [];
  const cells = (cur?: number, tried?: boolean): GCell[][] => [
    SAT_VARS.map((_, k) => {
      const v = k + 1;
      if (v === cur) return { v: tried ? "T" : "F", s: "cur" as const };
      return { v: v in fixed ? (fixed[v] ? "T" : "F") : undefined, s: (v in fixed ? "done" : "") as GCell["s"] };
    }),
  ];
  out.push({
    cells: cells(),
    caption: `Suppose a helper \`sat(F)\` answers only yes or no: does formula F have an assignment that makes it true? Here F is ${SAT_TEXT}. With n + 1 questions you can find an actual assignment.`,
    readout: "question 1: sat(F)?",
  });
  out.push({
    cells: cells(),
    caption: "First ask about F itself. If the answer is no, there is nothing to find. Here it is yes.",
    readout: "sat(F) = yes",
    verdict: { ok: true, text: "an answer exists" },
  });
  let q = 1;
  for (let v = 1; v <= SAT_VARS.length; v++) {
    q++;
    const yes = satisfiable({ ...fixed, [v]: true });
    const shown = Object.entries(fixed).map(([k, b]) => `x${k} = ${b ? "T" : "F"}`);
    out.push({
      cells: cells(v, true),
      caption: yes
        ? `Ask: is F still satisfiable with ${list([...shown, `x${v} = T`])}? Yes, so keep x${v} = True.`
        : `Ask: is F still satisfiable with ${list([...shown, `x${v} = T`])}? No. Since an answer exists with the earlier choices, it must have x${v} = False: no question needed for that.`,
      readout: `question ${q}: sat(F and ${[...shown, `x${v} = T`].join(" and ")}) = ${yes ? "yes" : "no"}`,
    });
    fixed[v] = yes;
  }
  out.push({
    cells: cells(),
    caption:
      "Every variable is fixed, and each fixing kept the formula satisfiable, so the result is an assignment. A fast yes/no method would therefore give a fast way to find answers too. This is called self-reducibility.",
    readout: `questions asked: ${q} = n + 1`,
    verdict: { ok: true, text: SAT_VARS.map((x, k) => `${x} ${fixed[k + 1] ? "T" : "F"}`).join(" · ") },
  });
  return out;
}

/* ---------------------------------------------------------------- HARD-2.1: 3-SAT to independent set */

export const RED_SIZE = { w: 9, h: 3.2 };
type Lit = { id: string; label: string; v: number; tri: number; x: number; y: number };
const CLAUSES = [
  [1, 2, 3],
  [-1, -2, 3],
  [1, -2, -3],
];
const lit = (l: number) => (l > 0 ? `x${l}` : `¬x${-l}`);
const LITS: Lit[] = [
  { id: "a1", label: lit(1), v: 1, tri: 0, x: 2, y: 2.1 },
  { id: "a2", label: lit(2), v: 2, tri: 0, x: 1, y: 0.7 },
  { id: "a3", label: lit(3), v: 3, tri: 0, x: 0, y: 2.1 },
  { id: "b1", label: lit(-1), v: -1, tri: 1, x: 3.5, y: 2.1 },
  { id: "b2", label: lit(-2), v: -2, tri: 1, x: 4.5, y: 0.7 },
  { id: "b3", label: lit(3), v: 3, tri: 1, x: 5.5, y: 2.1 },
  { id: "c1", label: lit(1), v: 1, tri: 2, x: 9, y: 2.1 },
  { id: "c2", label: lit(-2), v: -2, tri: 2, x: 8, y: 0.7 },
  { id: "c3", label: lit(-3), v: -3, tri: 2, x: 7, y: 2.1 },
];
const TRI_EDGES: [string, string][] = [0, 1, 2].flatMap((t) => {
  const ids = LITS.filter((l) => l.tri === t).map((l) => l.id);
  return [
    [ids[0], ids[1]],
    [ids[1], ids[2]],
    [ids[0], ids[2]],
  ] as [string, string][];
});
const BENDS: Record<string, number> = { b1c1: 40, a2c2: -40, a3c3: 70 };
const CONFLICT: [string, string][] = [];
for (let i = 0; i < LITS.length; i++)
  for (let j = i + 1; j < LITS.length; j++) if (LITS[i].v === -LITS[j].v) CONFLICT.push([LITS[i].id, LITS[j].id]);
export const CLAUSE_TEXT = CLAUSES.map((c) => `(${c.map(lit).join(" ∨ ")})`).join(" ∧ ");

export function reduceSteps(): GraphStep[] {
  const out: GraphStep[] = [];
  const view = (o: { conflicts: "hidden" | "cur" | ""; chosen?: string[]; tri?: "cur" | "" }): Pick<GraphStep, "nodes" | "edges"> => ({
    nodes: LITS.map((l) => ({ id: l.id, label: l.label, x: l.x, y: l.y, state: (o.chosen?.includes(l.id) ? "found" : "") as GNode["state"] })),
    edges: [
      ...TRI_EDGES.map(([a, b]) => ({ a, b, state: (o.tri ?? "") as GEdge["state"] })),
      ...CONFLICT.map(([a, b]) => ({ a, b, state: o.conflicts as GEdge["state"], bend: BENDS[`${a}${b}`] ?? 0 })),
    ],
  });
  out.push({
    ...view({ conflicts: "hidden", tri: "cur" }),
    caption: `A 3-SAT formula: ${CLAUSE_TEXT}. Each clause (a bracket of three conditions joined by "or") becomes a triangle with one vertex per condition. ¬ means "not".`,
    readout: "3 clauses → 3 triangles, 9 vertices",
  });
  out.push({
    ...view({ conflicts: "cur" }),
    caption: "Then join every condition to every copy of its opposite: x₁ to each ¬x₁, x₂ to each ¬x₂, x₃ to each ¬x₃. These edges stop a choice from saying both x and not x.",
    readout: `${TRI_EDGES.length} triangle edges + ${CONFLICT.length} edges between opposites`,
  });
  out.push({
    ...view({ conflicts: "" }),
    caption:
      "The question for the new graph: is there an independent set of size 3, the number of clauses? An independent set is a set of vertices with no edge between any two of them. The graph is built in polynomial time.",
    readout: "formula satisfiable  ⟺  graph has an independent set of size 3",
  });
  const chosen = ["a1", "b2", "c1"];
  out.push({
    ...view({ conflicts: "", chosen }),
    caption:
      "Yes to yes: x₁ = True, x₂ = False, x₃ = True makes every clause true. Pick one true condition in each triangle: x₁, ¬x₂, x₁. No two share a triangle, and no two are opposites, because they all hold together.",
    readout: "x₁ = T, x₂ = F, x₃ = T → {x₁, ¬x₂, x₁}",
    verdict: { ok: true, text: "independent, size 3" },
  });
  out.push({
    ...view({ conflicts: "", chosen }),
    caption:
      "Yes to yes, backwards: take any independent set of size 3. A triangle can hold at most one of its vertices, so each triangle holds exactly one. No vertex is joined to its opposite, so setting all chosen conditions true is consistent, and it makes every clause true. The other variables can be anything.",
    readout: "one per triangle · no x with ¬x  →  an assignment",
  });
  out.push({
    ...view({ conflicts: "" }),
    caption:
      "So a fast method for independent sets would give a fast method for 3-SAT. Since 3-SAT is NP-complete, independent set is NP-hard; it is in NP too (check a set in O(V + E)), so it is NP-complete.",
    readout: "3m vertices, at most 3m + 9m²/2 edges for m clauses: polynomial",
    verdict: { ok: true, text: "3-SAT ≤ independent set" },
  });
  return out;
}

/* ---------------------------------------------------------------- HARD-3.1: branch and bound */

export type BnbVariant = "frac" | "sum";
export type BnbStep = Base & { nodes: TNode[]; cells: GCell[][] };
export const BNB_ITEMS = [
  { id: "A", w: 2, v: 40 },
  { id: "B", w: 3, v: 45 },
  { id: "C", w: 4, v: 48 },
  { id: "D", w: 5, v: 50 },
];
export const BNB_CAP = 7;

type Visit = { id: string; parent?: string; edge?: string; value: number; room: number; bound: number; k: number; kind: "open" | "pruned" | "leaf" | "nofit" | "enough" };

function bnbVisits(kind: BnbVariant) {
  const its = BNB_ITEMS;
  const n = its.length;
  const bound = (k: number, room: number, value: number) => {
    if (kind === "sum") return value + its.slice(k).reduce((s, t) => s + t.v, 0);
    for (const t of its.slice(k)) {
      if (t.w <= room) {
        room -= t.w;
        value += t.v;
      } else return value + Math.floor((t.v * room) / t.w);
    }
    return value;
  };
  const visits: Visit[] = [];
  let best = 0;
  const bests: number[] = [];
  const go = (id: string, parent: string | undefined, edge: string | undefined, k: number, room: number, value: number) => {
    const b = bound(k, room, value);
    const better = value > best;
    if (better) best = value;
    const pruned = k < n && b <= best && id !== "";
    const v: Visit = { id, parent, edge, value, room, bound: b, k, kind: k === n ? "leaf" : pruned ? (better && b === value ? "enough" : "pruned") : "open" };
    visits.push(v);
    bests.push(best);
    if (k === n || pruned) return;
    const t = its[k];
    if (t.w <= room) go(id + "1", id, `+${t.id}`, k + 1, room - t.w, value + t.v);
    else {
      visits.push({ id: id + "1", parent: id, edge: `+${t.id}`, value, room, bound: 0, k: k + 1, kind: "nofit" });
      bests.push(best);
    }
    go(id + "0", id, `−${t.id}`, k + 1, room, value);
  };
  go("", undefined, undefined, 0, BNB_CAP, 0);
  return { visits, bests, best };
}

export function bnbSteps(kind: BnbVariant): BnbStep[] {
  const { visits, bests, best } = bnbVisits(kind);
  const out: BnbStep[] = [];
  const bestAt = (upto: number) => visits.findIndex((v, k) => k <= upto && v.value === bests[upto] && v.kind !== "nofit");
  const items = (k?: number): GCell[][] => [
    BNB_ITEMS.map((t, j) => ({ v: t.w, s: (j === k ? "cur" : "") as GCell["s"] })),
    BNB_ITEMS.map((t, j) => ({ v: t.v, s: (j === k ? "cur" : "") as GCell["s"] })),
  ];
  const tree = (upto: number, fin = false): TNode[] =>
    visits.map((v, k) => {
      const seen = k <= upto;
      const isBest = fin && k === bestAt(upto);
      // before the search starts, the root is drawn plain, so the first step is not an empty stage
      if (upto < 0 && k === 0) return { id: "root", label: String(v.value), state: undefined };
      return {
        id: v.id || "root",
        parent: v.parent === undefined ? undefined : v.parent || "root",
        label: v.kind === "nofit" ? "–" : String(v.value),
        edge: v.edge,
        state: (!seen ? "hidden" : isBest ? "found" : v.kind === "pruned" || v.kind === "nofit" ? "out" : k === upto ? "cur" : "done") as TNode["state"],
        tag: seen && v.kind !== "nofit" && v.kind !== "leaf" ? `≤${v.bound}` : undefined,
        tagKind: "plain" as const,
      };
    });
  out.push({
    nodes: tree(-1),
    cells: items(),
    caption:
      kind === "frac"
        ? `Pack a bag of ${BNB_CAP} kg for the most value. Items are sorted by value per kilogram. Each node is a partial choice, labelled with its value so far; the tag is an upper bound on any packing below it. The bound fills the room left greedily and lets the last item be cut, which no real packing can beat.`
        : `The same search with a weaker bound: the value so far plus every item not yet decided, ignoring the weight. It is still never too small, so it is safe, but it is much less sharp.`,
    readout: "left branch: take the item (+) · right branch: leave it (−)",
  });
  for (let k = 0; k < visits.length; k++) {
    const v = visits[k];
    const t = BNB_ITEMS[v.k - 1];
    let caption: string;
    if (v.id === "") caption = `The root: nothing decided, ${BNB_CAP} kg of room. Its bound is ${v.bound}.`;
    else if (v.kind === "nofit") caption = `${t.id} weighs ${t.w} kg, more than the ${v.room} kg left: that branch does not exist (hatched).`;
    else if (v.kind === "leaf") caption = `Every item decided: a real packing worth ${v.value}${bests[k] === v.value && (k === 0 || bests[k - 1] < v.value) ? `, the best so far` : ""}.`;
    else if (v.kind === "enough")
      caption = `${v.edge!.startsWith("+") ? "Take" : "Leave"} ${t.id}: value ${v.value}, the best so far. Its bound is also ${v.bound}, so leaving out everything not yet decided is already the best this branch can do: stop here.`;
    else if (v.kind === "pruned")
      caption = `Bound ${v.bound}, but a packing worth ${bests[k]} is already known. Nothing below this node can beat it, so the whole branch is cut off (hatched) without being searched.`;
    else
      caption = `${v.edge!.startsWith("+") ? "Take" : "Leave"} ${t.id}: value ${v.value}, ${v.room} kg left. Bound ${v.bound} is above the best so far (${bests[k]}), so keep going.`;
    out.push({
      nodes: tree(k),
      cells: items(v.k < BNB_ITEMS.length && v.kind === "open" ? v.k : undefined),
      caption,
      readout: `best so far ${bests[k]} · nodes ${k + 1}`,
    });
  }
  const real = visits.filter((v) => v.kind !== "nofit").length;
  out.push({
    nodes: tree(visits.length - 1, true),
    cells: items(),
    caption:
      kind === "frac"
        ? `The best packing is worth ${best}: B and C. Greedy by value per kilogram would take A and B (85) and stop. The search looked at ${real} nodes out of the 31 of the full tree.`
        : `The same best, ${best}, but the weak bound cut much less: ${real} nodes. The gap grows fast with more items: on the practice tests with 100 items, the weak bound passes 2,000,000 nodes without finishing, while the fractional bound needs about a thousand.`,
    readout: `nodes looked at: ${real} of 31`,
    verdict: { ok: true, text: String(best) },
  });
  return out;
}

/* ---------------------------------------------------------------- HARD-4.1: approximation */

export type ApproxVariant = "cover" | "tour";
export const COVER_SIZE = { w: 4, h: 2.4 };
const V_POS: Record<string, [number, number]> = { A: [0, 0], B: [2, 0], C: [4, 0], D: [0, 2.4], E: [2, 2.4], F: [4, 2.4], G: [1, 1.2] };
const V_EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "C"],
  ["A", "G"],
  ["G", "D"],
  ["B", "E"],
  ["D", "E"],
  ["E", "F"],
  ["C", "F"],
  ["G", "E"],
];

function smallestCover(): string[] {
  const ids = Object.keys(V_POS);
  let best: string[] = ids;
  for (let m = 0; m < 1 << ids.length; m++) {
    const s = ids.filter((_, k) => (m >> k) & 1);
    if (s.length < best.length && V_EDGES.every(([a, b]) => s.includes(a) || s.includes(b))) best = s;
  }
  return best;
}

export function coverSteps(): GraphStep[] {
  const out: GraphStep[] = [];
  const cover = new Set<string>();
  const taken: number[] = [];
  const view = (cur: number | null, flash: "cur" | "old" = "cur"): Pick<GraphStep, "nodes" | "edges"> => ({
    nodes: Object.entries(V_POS).map(([id, [x, y]]) => ({
      id,
      x,
      y,
      state: (cover.has(id) ? "found" : "") as GNode["state"],
    })),
    edges: V_EDGES.map(([a, b], k) => ({
      a,
      b,
      state: (k === cur ? flash : taken.includes(k) ? "found" : cover.has(a) || cover.has(b) ? "tree" : "") as GEdge["state"],
    })),
  });
  out.push({
    ...view(null),
    caption:
      "A vertex cover is a set of vertices that touches every edge. The smallest one is NP-hard to find. This method is fast and never more than twice the smallest: go through the edges, and when an edge has neither end in the cover, put both ends in.",
    readout: "edges with an end in the cover are pale",
  });
  for (let k = 0; k < V_EDGES.length; k++) {
    const [a, b] = V_EDGES[k];
    if (cover.has(a) || cover.has(b)) {
      out.push({ ...view(k, "old"), caption: `${a}–${b} is already covered by ${cover.has(a) ? a : b}. Skip it.`, readout: `cover: ${[...cover].join(" ")}` });
      continue;
    }
    cover.add(a);
    cover.add(b);
    taken.push(k);
    out.push({
      ...view(null),
      caption: `${a}–${b} is not covered. Take both ends, ${a} and ${b}. The edge is marked: the marked edges share no vertex.`,
      readout: `cover: ${[...cover].join(" ")}`,
    });
  }
  const opt = smallestCover();
  out.push({
    ...view(null),
    caption: `Cover of ${cover.size}. The ${taken.length} marked edges share no vertex, and any cover needs at least one end of each, so the smallest cover has at least ${taken.length}. Our cover has exactly 2 × ${taken.length}. Here the smallest is ${opt.length} (${opt.join(", ")}).`,
    readout: `${cover.size} ≤ 2 × smallest (${opt.length})`,
    verdict: { ok: true, text: `ratio ${(cover.size / opt.length).toFixed(2)} ≤ 2` },
  });
  return out;
}

export const TOUR_SIZE = { w: 6, h: 3 };
const CITIES: Record<string, [number, number]> = { P: [0, 1], Q: [1.5, 0], R: [3, 0.5], S: [5, 0], T: [6, 2], U: [3.5, 3], V: [1, 2.8] };
const dist = (a: string, b: string) => Math.hypot(CITIES[a][0] - CITIES[b][0], CITIES[a][1] - CITIES[b][1]);
const f1 = (x: number) => x.toFixed(1);

function prim(): [string, string][] {
  const ids = Object.keys(CITIES);
  const inTree = new Set([ids[0]]);
  const edges: [string, string][] = [];
  while (inTree.size < ids.length) {
    let bestE: [string, string] = ["", ""];
    let bd = Infinity;
    for (const a of inTree)
      for (const b of ids)
        if (!inTree.has(b) && dist(a, b) < bd) {
          bd = dist(a, b);
          bestE = [a, b];
        }
    edges.push(bestE);
    inTree.add(bestE[1]);
  }
  return edges;
}

function bestTour(): number {
  const ids = Object.keys(CITIES).slice(1);
  let best = Infinity;
  const perm = (rest: string[], path: string[]) => {
    if (!rest.length) {
      const route = ["P", ...path, "P"];
      best = Math.min(best, route.slice(1).reduce((s, c, k) => s + dist(route[k], c), 0));
      return;
    }
    rest.forEach((c, k) => perm([...rest.slice(0, k), ...rest.slice(k + 1)], [...path, c]));
  };
  perm(ids, []);
  return best;
}

export function tourSteps(): GraphStep[] {
  const ids = Object.keys(CITIES);
  const mst = prim();
  const treeLen = mst.reduce((s, [a, b]) => s + dist(a, b), 0);
  // preorder walk from P
  const kids: Record<string, string[]> = {};
  for (const [a, b] of mst) (kids[a] ??= []).push(b);
  const order: string[] = [];
  const walk = (v: string) => {
    order.push(v);
    for (const c of (kids[v] ?? []).sort()) walk(c);
  };
  walk("P");
  const tour = [...order, "P"];
  const tourEdges = tour.slice(1).map((c, k) => [tour[k], c] as [string, string]);
  const tourLen = tourEdges.reduce((s, [a, b]) => s + dist(a, b), 0);
  const opt = bestTour();
  const pairs: [string, string][] = [];
  for (const [a, b] of [...mst, ...tourEdges])
    if (!pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) pairs.push([a, b]);
  const out: GraphStep[] = [];
  const view = (o: { tree?: boolean; tour?: number; cur?: string }): Pick<GraphStep, "nodes" | "edges" | "queue"> => ({
    nodes: ids.map((id) => ({
      id,
      x: CITIES[id][0],
      y: CITIES[id][1],
      state: (id === o.cur ? "cur" : o.tour !== undefined && order.indexOf(id) <= o.tour ? "done" : "") as GNode["state"],
    })),
    // one edge per pair of cities: a trip edge already walked wins over a tree edge
    edges: pairs.map(([a, b]) => {
      const k = tourEdges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
      const onTrip = k >= 0 && o.tour !== undefined && k < o.tour;
      const inTree = o.tree && mst.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
      return { a, b, state: (onTrip ? "found" : inTree ? "tree" : "hidden") as GEdge["state"] };
    }),
    queue: order.map((id, k) => ({ v: id, s: (o.tour !== undefined && k <= o.tour ? "done" : "") as QItem["s"] })),
  });
  out.push({
    ...view({}),
    caption:
      "Seven cities; travel costs the straight-line distance, so a direct trip is never longer than a detour (the triangle rule). Find a round trip through all of them. The shortest is NP-hard, but a trip at most twice the shortest is easy.",
    readout: "distances are straight lines on the grid",
  });
  out.push({
    ...view({ tree: true }),
    caption: `First a cheapest spanning tree (SPAN-3, Prim's method): length ${f1(treeLen)}. Removing one edge from the best round trip leaves a spanning tree, so the best trip is at least as long as this tree.`,
    readout: `tree ${f1(treeLen)} ≤ best trip`,
  });
  out.push({
    ...view({ tree: true, tour: 0, cur: "P" }),
    caption: `Walk round the tree from P, as a depth-first search does, going along each tree edge twice: once down, once back. That walk costs exactly 2 × ${f1(treeLen)}. List each city the first time the walk reaches it (the order at the side).`,
    readout: `walk = 2 × tree = ${f1(2 * treeLen)}`,
  });
  for (let k = 1; k < tour.length; k++) {
    out.push({
      ...view({ tree: true, tour: k, cur: tour[k] }),
      caption:
        k === tour.length - 1
          ? `Back to P. Each straight step skips cities the walk had already passed, which by the triangle rule is never longer.`
          : `Go straight from ${tour[k - 1]} to ${tour[k]}, the next new city in the walk${dist(tour[k - 1], tour[k]) > 0 && !mst.some(([a, b]) => (a === tour[k - 1] && b === tour[k]) || (b === tour[k - 1] && a === tour[k])) ? ", a shortcut past the cities already seen" : ""}.`,
      readout: `trip so far ${f1(tourEdges.slice(0, k).reduce((s, [a, b]) => s + dist(a, b), 0))}`,
    });
  }
  out.push({
    ...view({ tree: false, tour: tour.length - 1 }),
    caption: `The trip costs ${f1(tourLen)}, at most the walk ${f1(2 * treeLen)}, which is at most twice the best trip. Here the best is ${f1(opt)}, so this trip is ${Math.round((tourLen / opt - 1) * 100)}% longer than the best: well inside the guarantee.`,
    readout: `trip ${f1(tourLen)} ≤ 2 × tree ${f1(2 * treeLen)} ≤ 2 × best ${f1(2 * opt)}`,
    verdict: { ok: true, text: `ratio ${(tourLen / opt).toFixed(2)} ≤ 2` },
  });
  return out;
}

/* ---------------------------------------------------------------- HARD-5.1: Miller–Rabin */

export type MrVariant = "prime" | "carmichael" | "liar";
export type MrStep = Base & { cells: GCell[][]; rowHead: string[]; colHead: string[] };
const MR: Record<MrVariant, { n: number; bases: number[] }> = {
  prime: { n: 97, bases: [2, 5] },
  carmichael: { n: 561, bases: [2] },
  liar: { n: 2047, bases: [2, 3] },
};

function powmod(a: number, e: number, n: number): number {
  let r = 1;
  let b = a % n;
  while (e > 0) {
    if (e & 1) r = (r * b) % n;
    b = (b * b) % n;
    e >>= 1;
  }
  return r;
}

export function mrSteps(v: MrVariant): MrStep[] {
  const { n, bases } = MR[v];
  let d = n - 1;
  let s = 0;
  while (d % 2 === 0) {
    d /= 2;
    s++;
  }
  const colHead = Array.from({ length: s + 1 }, (_, k) => (k === 0 ? "d" : `${2 ** k}d`));
  const rowHead = bases.map((a) => `a=${a}`);
  const rows: { vals: number[]; at: number; kind: "start" | "minus" | "witness" | "fermat" }[] = bases.map((a) => {
    const vals = [powmod(a, d, n)];
    for (let k = 1; k <= s; k++) vals.push((vals[k - 1] * vals[k - 1]) % n);
    if (vals[0] === 1) return { vals, at: 0, kind: "start" as const };
    const m = vals.findIndex((x, k) => k < s && x === n - 1);
    if (m >= 0) return { vals, at: m, kind: "minus" as const };
    const one = vals.findIndex((x) => x === 1);
    return { vals, at: one > 0 ? one - 1 : s, kind: one > 0 ? ("witness" as const) : ("fermat" as const) };
  });
  const out: MrStep[] = [];
  const cells = (upto: number, colUpto: number, mark?: number): GCell[][] =>
    rows.map((r, i) =>
      r.vals.map((x, k) => {
        const shown = i < upto || (i === upto && k <= colUpto);
        const decided = i < upto || (i === upto && mark !== undefined);
        let st: GCell["s"] = "";
        if (shown) st = "done";
        if (decided && (r.kind === "start" || r.kind === "minus") && k === r.at) st = "path";
        if (decided && r.kind === "witness" && k === r.at) st = "found";
        if (i === upto && k === colUpto && mark === undefined) st = "cur";
        return { v: shown ? x : undefined, s: st, small: x >= 1000 };
      }),
    );
  out.push({
    cells: cells(-1, -1),
    rowHead,
    colHead,
    caption: `Is ${n} prime? Write n − 1 = ${n - 1} as d × 2 to the power s with d odd: d = ${d}, s = ${s}. For a base a, work out a to the power d modulo n, then square it ${s} time${s > 1 ? "s" : ""}. The last column is a to the power n − 1.`,
    readout: `${n} − 1 = ${d} × 2${s > 1 ? superscript(s) : ""}`,
  });
  rows.forEach((r, i) => {
    const a = bases[i];
    for (let k = 0; k <= s; k++) {
      if (k > r.at + 1 && r.kind !== "fermat") break;
      out.push({
        cells: cells(i, k),
        rowHead,
        colHead,
        caption:
          k === 0
            ? `Base ${a}: ${a} to the power ${d} modulo ${n} is ${r.vals[0]} (\`pow(${a}, ${d}, ${n})\`).`
            : `Square it: ${r.vals[k - 1]}² modulo ${n} is ${r.vals[k]}.`,
        readout: `a = ${a}: ${r.vals.slice(0, k + 1).join(" → ")}`,
      });
    }
    const say =
      r.kind === "start"
        ? `It starts at 1, so every square is 1: base ${a} cannot prove anything.`
        : r.kind === "minus"
          ? `It reaches ${n - 1}, which is −1 modulo n; every square after it is 1. This is what a prime always does, so base ${a} proves nothing.`
          : r.kind === "witness"
            ? `${r.vals[r.at]} squared is 1, but ${r.vals[r.at]} is neither 1 nor −1 (${n - 1}). Modulo a prime, only 1 and −1 square to 1. So ${n} is not prime, and ${a} is a witness. Fermat's test, which looks only at the last column, says "maybe prime" here.`
            : `The last column is not 1, so even Fermat's test (MATH-5) proves ${n} is not prime.`;
    const liar = v === "liar" && i === 0;
    out.push({
      cells: cells(i, s, 1),
      rowHead,
      colHead,
      caption: liar ? `${say} But ${n} = 23 × 89 is not prime: base 2 is a strong liar for 2047. Stopping after one base would give a wrong answer.` : say,
      readout: `a = ${a}: ${r.vals.join(" → ")}`,
      verdict:
        r.kind === "witness" || r.kind === "fermat"
          ? { ok: true, text: `${n} is composite` }
          : liar
            ? { ok: false, text: "one base says prime: wrong" }
            : { ok: true, text: `base ${a}: maybe prime`, info: true },
    });
  });
  out.push({
    cells: cells(rows.length, s, 1),
    rowHead,
    colHead,
    caption:
      v === "prime"
        ? `${n} passes every base. For a composite n, at most a quarter of the bases from 2 to n − 2 are liars, so k random bases that all pass leave a chance of at most 1 in 4 to the power k that n is composite.`
        : v === "liar"
          ? `Base 3 finds the truth. Each extra base cuts the chance of a wrong "prime" by at least 4. For n below 3.3 × 10²⁴, the 13 prime bases 2 to 41 are known to catch every composite.`
          : `A Carmichael number fools Fermat's test for every base with no common factor, but the square root check catches it.`,
    readout: v === "prime" ? `${bases.length} bases passed` : `${n} = ${factorText(n)}`,
    verdict: v === "prime" ? { ok: true, text: `${n}: prime` } : { ok: true, text: `${n}: composite` },
  });
  return out;
}

function superscript(k: number) {
  const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return String(k)
    .split("")
    .map((c) => sup[Number(c)])
    .join("");
}

function factorText(n: number) {
  const f: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) while (m % p === 0) (f.push(p), (m /= p));
  if (m > 1) f.push(m);
  return f.join(" × ");
}
