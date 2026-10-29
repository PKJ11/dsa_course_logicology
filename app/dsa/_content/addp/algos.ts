// ADDP step generators. Every figure is a pure function of its step number.
// Tree DP draws the tree (Tree stage, letters only) over a Grid table with one column per node. DP on a DAG is the
// Graph stage in topological order with the order as a Queue. Interval, bitmask, digit and Knuth tables are Grids
// (`src` outlines for the cells being read, `path` for a tight digit or a walk back). Lines for the hull speed-up
// are segments on the Plane, with the kept lines as a Queue. Captions use `backticks` for code.

import type { GCell, GEdge, GNode, Mark, PLine, PPoint, PSeg, QItem, TNode } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type Base = { caption: string; readout?: string; verdict?: Verdict };

const list = (xs: (string | number)[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/* ---------------------------------------------------------------- ADDP-1.1: DP on a tree */

export type TreeVariant = "pick" | "reroot";
export type TreeStep = Base & { nodes: TNode[]; cells: GCell[][]; rowHead: string[] };

export const T_IDS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const T_PARENT: Record<string, string | undefined> = { A: undefined, B: "A", C: "A", D: "A", E: "B", F: "B", G: "C", H: "D" };
const T_VALUE: Record<string, number> = { A: 3, B: 5, C: 2, D: 4, E: 6, F: 1, G: 7, H: 2 };
const kidsOf = (v: string) => T_IDS.filter((c) => T_PARENT[c] === v);
const POST = ["E", "F", "B", "G", "C", "H", "D", "A"];
const PRE = ["A", "B", "E", "F", "C", "G", "D", "H"];

function treeNodes(st: Record<string, TNode["state"]>): TNode[] {
  return T_IDS.map((id) => ({ id, label: id, parent: T_PARENT[id], state: st[id] ?? "" }));
}

export function treeSteps(v: TreeVariant): TreeStep[] {
  return v === "pick" ? pickSteps() : rerootSteps();
}

function pickSteps(): TreeStep[] {
  const take: Record<string, number> = {};
  const skip: Record<string, number> = {};
  const out: TreeStep[] = [];
  const rowHead = ["value", "take", "skip"];
  const cells = (cur?: string, srcs: string[] = [], walk: Record<string, "take" | "skip"> = {}) =>
    [
      T_IDS.map((id) => ({ v: T_VALUE[id], s: (walk[id] === "take" ? "path" : "") as GCell["s"] })),
      T_IDS.map((id) => ({
        v: take[id],
        s: (id === cur ? "cur" : walk[id] === "take" ? (id === "A" ? "found" : "path") : take[id] !== undefined ? "done" : "") as GCell["s"],
        src: srcs.includes(id),
      })),
      T_IDS.map((id) => ({
        v: skip[id],
        s: (id === cur ? "cur" : walk[id] === "skip" ? "path" : skip[id] !== undefined ? "done" : "") as GCell["s"],
        src: srcs.includes(id),
      })),
    ];
  out.push({
    nodes: treeNodes({}),
    cells: cells(),
    rowHead,
    caption:
      "Staff some stations of this tree of roads, so that no two staffed stations are joined by a road. Each station has a value (first row). Find the largest total. Work from the leaves up: each station gets two answers for its own subtree, `take` (it is staffed) and `skip` (it is not).",
    readout: "take(v) = value(v) + skip of each child · skip(v) = the better of take and skip of each child",
  });
  const done: Record<string, TNode["state"]> = {};
  for (const id of POST) {
    const ks = kidsOf(id);
    take[id] = T_VALUE[id] + ks.reduce((s, c) => s + skip[c], 0);
    skip[id] = ks.reduce((s, c) => s + Math.max(take[c], skip[c]), 0);
    const caption = ks.length
      ? ks.length === 1
        ? `${id}: if ${id} is staffed, its child ${ks[0]} cannot be, so add its \`skip\` answer. If ${id} is not staffed, ${ks[0]} is free: take the better of its two answers.`
        : `${id}: if ${id} is staffed, its children ${list(ks)} cannot be, so add their \`skip\` answers. If ${id} is not staffed, each child is free: take the better of its two answers.`
      : `${id} is a leaf: its subtree is just ${id}. Staffed, it is worth ${T_VALUE[id]}; not staffed, 0.`;
    const readout = ks.length
      ? `take(${id}) = ${[T_VALUE[id], ...ks.map((c) => skip[c])].join(" + ")} = ${take[id]} · skip(${id}) = ${ks.map((c) => `max(${take[c]}, ${skip[c]})`).join(" + ")} = ${skip[id]}`
      : `take(${id}) = ${T_VALUE[id]} · skip(${id}) = 0`;
    out.push({ nodes: treeNodes({ ...done, [id]: "cur" }), cells: cells(id, ks), rowHead, caption, readout });
    done[id] = "done";
  }
  // walk back from the root
  const walk: Record<string, "take" | "skip"> = {};
  const go = (id: string, allowed: boolean) => {
    const t = allowed && take[id] >= skip[id];
    walk[id] = t ? "take" : "skip";
    for (const c of kidsOf(id)) go(c, !t);
  };
  go("A", true);
  const chosen = T_IDS.filter((id) => walk[id] === "take");
  out.push({
    nodes: treeNodes(Object.fromEntries(chosen.map((id) => [id, "found" as const]))),
    cells: cells(undefined, [], walk),
    rowHead,
    caption: `The answer for the whole tree is the better of A's two: take(A) = ${take.A} beats skip(A) = ${skip.A}, so A is staffed. Walking back down, A's children use \`skip\`, and each of their children takes its better answer. Staffed: ${list(chosen)}.`,
    readout: `${chosen.map((id) => T_VALUE[id]).join(" + ")} = ${take.A} · each station looked at once: O(n)`,
    verdict: { ok: true, text: String(Math.max(take.A, skip.A)) },
  });
  return out;
}

function rerootSteps(): TreeStep[] {
  const n = T_IDS.length;
  const size: Record<string, number> = {};
  const down: Record<string, number> = {};
  const total: Record<string, number> = {};
  const rowHead = ["size", "down", "total"];
  const cells = (cur: string | undefined, row: number, srcs: [number, string][] = [], best?: string) =>
    [size, down, total].map((tab, r) =>
      T_IDS.map((id) => ({
        v: tab[id],
        s: (id === best && r === 2 ? "found" : id === cur && (r === row || (row === 0 && r === 1)) ? "cur" : tab[id] !== undefined ? "done" : "") as GCell["s"],
        src: srcs.some(([rr, c]) => rr === r && c === id),
      })),
    );
  const out: TreeStep[] = [];
  out.push({
    nodes: treeNodes({}),
    cells: cells(undefined, 0),
    rowHead,
    caption:
      "Now find, for every station, the total distance to all the others (every road is 1 long). A search from every station costs O(n²). Two passes do it in O(n). Pass 1 goes from the leaves up and computes `size`, the stations in a subtree, and `down`, their total distance from its top.",
    readout: "size(v) = 1 + size of each child · down(v) = down(child) + size(child), added over the children",
  });
  const st: Record<string, TNode["state"]> = {};
  for (const id of POST) {
    const ks = kidsOf(id);
    size[id] = 1 + ks.reduce((s, c) => s + size[c], 0);
    down[id] = ks.reduce((s, c) => s + down[c] + size[c], 0);
    out.push({
      nodes: treeNodes({ ...st, [id]: "cur" }),
      cells: cells(id, 0, ks.flatMap((c) => [[0, c] as [number, string], [1, c] as [number, string]])),
      rowHead,
      caption: ks.length
        ? `${id}: every station in the subtree of ${list(ks)} is one road further from ${id} than from ${ks.length === 1 ? "that child" : "its own child"}. So each child adds its own \`down\` plus one road for each station in its subtree.`
        : `${id} is a leaf: a subtree of 1 station, at distance 0.`,
      readout: ks.length
        ? `size(${id}) = ${[1, ...ks.map((c) => size[c])].join(" + ")} = ${size[id]} · down(${id}) = ${ks.map((c) => `(${down[c]} + ${size[c]})`).join(" + ")} = ${down[id]}`
        : `size(${id}) = 1 · down(${id}) = 0`,
    });
    st[id] = "done";
  }
  total.A = down.A;
  out.push({
    nodes: treeNodes({ A: "cur" }),
    cells: cells("A", 2, [[1, "A"]]),
    rowHead,
    caption: `A is the top, so its subtree is the whole tree: total(A) = down(A) = ${down.A}. Pass 2 goes from the top down. When the answer moves from a parent p to its child c, the size(c) stations below c get one road closer, and the other n − size(c) get one road further.`,
    readout: `total(A) = ${total.A} · total(c) = total(p) − size(c) + (n − size(c)) = total(p) + n − 2·size(c)`,
  });
  const st2: Record<string, TNode["state"]> = { A: "done" };
  for (const id of PRE.slice(1)) {
    const p = T_PARENT[id]!;
    total[id] = total[p] + n - 2 * size[id];
    out.push({
      nodes: treeNodes({ ...st2, [id]: "cur" }),
      cells: cells(id, 2, [[2, p], [0, id]]),
      rowHead,
      caption:
        size[id] === 1
          ? `From ${p} to ${id}: ${id} itself comes one road closer, and the other ${n - 1} stations go one road further.`
          : `From ${p} to ${id}: the ${size[id]} stations in ${id}'s subtree come one road closer, and the other ${n - size[id]} go one road further.`,
      readout: `total(${id}) = ${total[p]} + ${n} − 2 × ${size[id]} = ${total[id]}`,
    });
    st2[id] = "done";
  }
  const bestId = T_IDS.reduce((b, id) => (total[id] < total[b] ? id : b), "A");
  out.push({
    nodes: treeNodes({ ...st2, [bestId]: "found" }),
    cells: cells(undefined, 2, [], bestId),
    rowHead,
    caption: `Every station has its total after two passes over the tree, O(n) in all. This is called rerooting: each answer is moved from a parent to a child with a one-line rule. The best place for a depot is ${bestId}, with total ${total[bestId]}.`,
    readout: T_IDS.map((id) => `${id} ${total[id]}`).join(" · "),
    verdict: { ok: true, text: `${bestId}: ${total[bestId]}` },
  });
  return out;
}

/* ---------------------------------------------------------------- ADDP-2.1: DP on a DAG */

export type DagVariant = "count" | "best";
export type DagStep = Base & { nodes: GNode[]; edges: GEdge[]; queue: QItem[] };
export const DAG_SIZE = { w: 6, h: 3.6 };
const D_POS: Record<string, [number, number]> = { S: [0, 1.8], A: [1.5, 0], B: [1.5, 3.6], C: [3, 1.8], D: [4.5, 0], E: [4.5, 3.6], T: [6, 1.8] };
export const D_ORDER = ["S", "A", "B", "C", "D", "E", "T"];
// each tag on a side no edge leaves from
const D_TAG: Record<string, GNode["tagAt"]> = { S: "t", A: "tr", B: "br", C: "t", D: "tr", E: "br", T: "tr" };
const D_EDGES: [string, string, number][] = [
  ["S", "A", 2],
  ["S", "B", 4],
  ["A", "C", 3],
  ["B", "C", 1],
  ["A", "D", 6],
  ["C", "D", 2],
  ["C", "E", 5],
  ["B", "E", 7],
  ["D", "T", 4],
  ["E", "T", 2],
];

export function dagSteps(v: DagVariant): DagStep[] {
  const best = v === "best";
  const val: Record<string, number> = {};
  const par: Record<string, string> = {};
  const out: DagStep[] = [];
  const view = (cur: string | undefined, look: string[], found: Set<string> = new Set()): Pick<DagStep, "nodes" | "edges" | "queue"> => ({
    nodes: D_ORDER.map((id) => ({
      id,
      x: D_POS[id][0],
      y: D_POS[id][1],
      state: (found.has(id) ? "found" : id === cur ? "cur" : val[id] !== undefined ? "done" : "") as GNode["state"],
      tag: val[id] !== undefined ? String(val[id]) : undefined,
      tagKind: "plain" as const,
      tagAt: D_TAG[id],
    })),
    // Counting: every edge into the current vertex is used, so all are cur. Best route: the edge kept gets the pale
    // band at once, and the others stay plain, so the band is the step's answer.
    edges: D_EDGES.map(([a, b, w]) => ({
      a,
      b,
      label: best ? String(w) : undefined,
      state: (found.has(`${a}${b}`) ? "found" : best ? (par[b] === a ? "tree" : "") : b === cur && look.includes(a) ? "cur" : "") as GEdge["state"],
    })),
    queue: D_ORDER.map((id) => ({ v: id, s: (id === cur ? "cur" : val[id] !== undefined ? "done" : "") as QItem["s"] })),
  });
  out.push({
    ...view(undefined, []),
    caption: best
      ? "Each edge has a value (its plate). Find the route from S to T with the largest total. The vertices are already in topological order (GRPH-5): every edge goes from an earlier vertex to a later one. So when a vertex is reached, every edge into it has been settled."
      : "How many different routes lead from S to T? The vertices are already in topological order (GRPH-5): every edge goes from an earlier vertex to a later one. A route into v must arrive along one of v's incoming edges.",
    readout: best ? "best(v) = the largest best(u) + value(u → v) over the edges into v" : "routes(v) = routes(u) added over the edges u → v",
  });
  for (const id of D_ORDER) {
    const ins = D_EDGES.filter(([, b]) => b === id);
    if (!ins.length) {
      val[id] = best ? 0 : 1;
      out.push({
        ...view(id, []),
        caption: best ? "S is the start: the empty route has total 0." : "S is the start: there is one route from S to itself, the empty one.",
        readout: best ? "best(S) = 0" : "routes(S) = 1",
      });
      continue;
    }
    if (best) {
      let b = -Infinity;
      for (const [a, , w] of ins) {
        if (val[a] + w > b) {
          b = val[a] + w;
          par[id] = a;
        }
      }
      val[id] = b;
    } else val[id] = ins.reduce((s, [a]) => s + val[a], 0);
    out.push({
      ...view(
        id,
        ins.map(([a]) => a),
      ),
      caption: best
        ? ins.length === 1
          ? `${id} has one edge in, from ${ins[0][0]}. It gets the pale band.`
          : `${id} has ${ins.length} edges in: ${list(ins.map(([a, , w]) => `from ${a} (${val[a]} + ${w} = ${val[a] + w})`))}. Keep the larger total, ${val[id]} from ${par[id]}, and remember that edge: ${par[id]} → ${id} gets the pale band.`
        : ins.length === 1
          ? `${id} has one edge in, from ${ins[0][0]}: each route to ${ins[0][0]} goes on to ${id} in one way.`
          : `${id} has edges in from ${list(ins.map(([a]) => a))}. The routes through each are different routes, so add them.`,
      readout: best
        ? `best(${id}) = ${ins.length > 1 ? `max(${ins.map(([a, , w]) => `${val[a]} + ${w}`).join(", ")})` : `${val[ins[0][0]]} + ${ins[0][2]}`} = ${val[id]}`
        : ins.length === 1
          ? `routes(${id}) = routes(${ins[0][0]}) = ${val[id]}`
          : `routes(${id}) = ${ins.map(([a]) => val[a]).join(" + ")} = ${val[id]}`,
    });
  }
  if (best) {
    const route = ["T"];
    while (route[0] !== "S") route.unshift(par[route[0]]);
    const found = new Set<string>([...route, ...route.slice(1).map((x, k) => `${route[k]}${x}`)]);
    out.push({
      ...view(undefined, [], found),
      caption: `Walk back from T along the remembered edges: ${route.join(" → ")}. Each vertex and each edge was looked at once, so the cost is O(V + E).`,
      readout: `${route.slice(1).map((x, k) => D_EDGES.find(([a, b]) => a === route[k] && b === x)![2]).join(" + ")} = ${val.T}`,
      verdict: { ok: true, text: String(val.T) },
    });
  } else {
    out.push({
      ...view(undefined, [], new Set(["T"])),
      caption: `There are ${val.T} routes from S to T, found in one pass in O(V + E). Listing them one by one could take time proportional to their number, which can grow exponentially with the size of the graph.`,
      readout: D_ORDER.map((id) => `${id} ${val[id]}`).join(" · "),
      verdict: { ok: true, text: String(val.T) },
    });
  }
  return out;
}

/* ---------------------------------------------------------------- ADDP-3.1: interval DP, joining piles */

export type JoinVariant = "length" | "rows";
export type JoinStep = Base & { piles: GCell[][]; cells: GCell[][] };
export const PILES = [4, 1, 3, 2, 5];

const rangeSum = (a: number[], i: number, j: number) => a.slice(i, j + 1).reduce((s, x) => s + x, 0);

function joinTable(a: number[]) {
  const n = a.length;
  const best = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const opt = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      let b = Infinity;
      for (let k = i; k < j; k++) {
        const c = best[i][k] + best[k + 1][j];
        if (c < b) {
          b = c;
          opt[i][j] = k;
        }
      }
      best[i][j] = b + rangeSum(a, i, j);
    }
  return { best, opt };
}

export function joinSteps(v: JoinVariant): JoinStep[] {
  return v === "length" ? joinByLength() : joinByRows();
}

function pileRow(a: number[], hi?: [number, number]): GCell[][] {
  return [a.map((x, k) => ({ v: x, s: (hi && k >= hi[0] && k <= hi[1] ? "path" : "") as GCell["s"] }))];
}

function joinByLength(): JoinStep[] {
  const a = PILES;
  const n = a.length;
  const { best } = joinTable(a);
  const filled = new Set<string>();
  const out: JoinStep[] = [];
  const cells = (cur?: [number, number], srcs: [number, number][] = [], fin = false): GCell[][] =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (j < i) return { blank: true };
        const key = `${i},${j}`;
        const isCur = cur && cur[0] === i && cur[1] === j;
        return {
          v: filled.has(key) ? best[i][j] : undefined,
          s: (fin && i === 0 && j === n - 1 ? "found" : isCur ? "cur" : filled.has(key) ? "done" : "") as GCell["s"],
          src: srcs.some(([r, c]) => r === i && c === j),
        };
      }),
    );
  out.push({
    piles: pileRow(a),
    cells: cells(),
    caption:
      "Join neighbouring piles, two at a time, until one pile is left. Each join costs the size of the new pile. Find the cheapest order. `best[i][j]` is the cheapest way to join piles i to j into one: row i, column j of the table.",
    readout: "best[i][j] = (piles i to j added up) + the smallest best[i][k] + best[k + 1][j]",
  });
  for (let i = 0; i < n; i++) filled.add(`${i},${i}`);
  out.push({
    piles: pileRow(a),
    cells: cells(),
    caption: "A single pile needs no joins: `best[i][i]` = 0 on the diagonal. These are the stretches of length 1.",
    readout: "length 1: best[i][i] = 0",
  });
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const ks = Array.from({ length: j - i }, (_, t) => i + t);
      const s = rangeSum(a, i, j);
      out.push({
        piles: pileRow(a, [i, j]),
        cells: (filled.add(`${i},${j}`), cells([i, j], ks.flatMap((k) => [[i, k] as [number, number], [k + 1, j] as [number, number]]))),
        caption:
          len === 2
            ? `Piles ${i} and ${j}: one join, costing ${a[i]} + ${a[j]} = ${s}.`
            : `Piles ${i} to ${j}. The last join puts together a left part i..k and a right part k+1..j, for some k. Every part is shorter than ${len}, so its answer is already in the table (dashed).`,
        readout:
          len === 2
            ? `best[${i}][${j}] = ${s} + (0 + 0) = ${best[i][j]}`
            : `best[${i}][${j}] = ${s} + min(${ks.map((k) => `${best[i][k]} + ${best[k + 1][j]}`).join(", ")}) = ${best[i][j]}`,
      });
    }
  out.push({
    piles: pileRow(a, [0, n - 1]),
    cells: cells(undefined, [], true),
    caption: `The answer is in the top-right corner: ${best[0][n - 1]}. Filling by length means every shorter stretch is ready before a longer one needs it. There are about n²/2 cells and each tries up to n splits: O(n³).`,
    readout: `best[0][${n - 1}] = ${best[0][n - 1]}`,
    verdict: { ok: true, text: String(best[0][n - 1]) },
  });
  return out;
}

function joinByRows(): JoinStep[] {
  const a = PILES;
  const n = a.length;
  const { best } = joinTable(a);
  const got: Record<string, number> = {};
  const out: JoinStep[] = [];
  const cells = (cur?: [number, number], srcs: [number, number][] = [], bad?: [number, number], unread?: [number, number]): GCell[][] =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (j < i) return { blank: true };
        const key = `${i},${j}`;
        const known = key in got;
        const isCur = cur && cur[0] === i && cur[1] === j;
        const isBad = bad && bad[0] === i && bad[1] === j;
        return {
          v: known ? got[key] : 0,
          s: (isBad ? "bad" : isCur ? "cur" : known ? "done" : unread && unread[0] === i && unread[1] === j ? "todo" : "") as GCell["s"],
          src: srcs.some(([r, c]) => r === i && c === j),
        };
      }),
    );
  out.push({
    piles: pileRow(a),
    cells: cells(),
    caption:
      "The same rule, filled in the usual reading order instead: row 0 from left to right, then row 1, and so on. The table starts full of zeros.",
    readout: "best[i][j] = (piles i to j added up) + the smallest best[i][k] + best[k + 1][j]",
  });
  got["0,0"] = 0;
  got["0,1"] = rangeSum(a, 0, 1);
  out.push({
    piles: pileRow(a, [0, 1]),
    cells: cells([0, 1], [
      [0, 0],
      [1, 1],
    ]),
    caption: "`best[0][1]` reads `best[1][1]`, which has not been filled yet. It holds 0, which happens to be right for a single pile.",
    readout: `best[0][1] = ${rangeSum(a, 0, 1)} + (0 + 0) = ${got["0,1"]}`,
  });
  const ks = [0, 1];
  const wrong = rangeSum(a, 0, 2) + Math.min(...ks.map((k) => (got[`0,${k}`] ?? 0) + (got[`${k + 1},2`] ?? 0)));
  got["0,2"] = wrong;
  out.push({
    piles: pileRow(a, [0, 2]),
    cells: cells(
      [0, 2],
      [
        [0, 0],
        [1, 2],
        [0, 1],
        [2, 2],
      ],
      [0, 2],
      [1, 2],
    ),
    caption: `\`best[0][2]\` needs \`best[1][2]\`, the cost of joining piles 1 and 2. The dashed cells are the four the rule reads. \`best[2][2]\` = 0 is right (a single pile needs no join), but \`best[1][2]\` is in row 1, which this order has not reached: it still holds 0. So the result is too small, and it is wrong.`,
    readout: `best[0][2] = ${rangeSum(a, 0, 2)} + min(0 + 0, ${got["0,1"]} + 0) = ${wrong}, but the true value is ${best[0][2]}`,
    verdict: { ok: false, text: `${wrong} is wrong` },
  });
  out.push({
    piles: pileRow(a, [0, 2]),
    cells: cells(undefined, [], [0, 2]),
    caption:
      "A cell needs every shorter stretch inside it. Filling by length guarantees that. Filling the rows from the bottom row up, each row left to right, works too: everything below and to the left is ready.",
    readout: "orders that work: by length · rows from the bottom up",
    verdict: { ok: false, text: "wrong order" },
  });
  return out;
}

/* ---------------------------------------------------------------- ADDP-4.1: bitmask DP, the shortest round trip */

export type TourVariant = "tour" | "back";
export type TourStep = Base & { cells: GCell[][]; dist: GCell[][] };
export const T_DIST = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];
export const TOUR_MASKS = [1, 3, 5, 7, 9, 11, 13, 15];
export const maskBits = (m: number) => m.toString(2).padStart(4, "0");
const citiesIn = (m: number) => [0, 1, 2, 3].filter((c) => m >> c & 1);

function tourTable() {
  const best = new Map<string, number>();
  const prev = new Map<string, number>();
  best.set("1,0", 0);
  for (const m of TOUR_MASKS)
    for (const j of citiesIn(m)) {
      if (j === 0) continue;
      const pm = m ^ (1 << j);
      let b = Infinity;
      for (const i of citiesIn(pm)) {
        const key = `${pm},${i}`;
        if (!best.has(key)) continue;
        const c = best.get(key)! + T_DIST[i][j];
        if (c < b) {
          b = c;
          prev.set(`${m},${j}`, i);
        }
      }
      best.set(`${m},${j}`, b);
    }
  return { best, prev };
}

export function tourSteps(v: TourVariant): TourStep[] {
  const { best, prev } = tourTable();
  const filled = new Set<string>(["1,0"]);
  const out: TourStep[] = [];
  const cells = (cur?: string, srcs: string[] = [], path: string[] = [], found?: string): GCell[][] =>
    TOUR_MASKS.map((m) =>
      [0, 1, 2, 3].map((j) => {
        const key = `${m},${j}`;
        if (!best.has(key)) return { blank: true };
        return {
          v: filled.has(key) ? best.get(key) : undefined,
          s: (key === found ? "found" : key === cur ? "cur" : path.includes(key) ? "path" : filled.has(key) ? "done" : "") as GCell["s"],
          src: srcs.includes(key),
        };
      }),
    );
  const dist = (srcs: [number, number][] = []): GCell[][] =>
    T_DIST.map((row, i) => row.map((d, j) => ({ v: d, src: srcs.some(([a, b]) => a === i && b === j) })));
  const full = 15;
  const ends = [1, 2, 3].map((j) => best.get(`${full},${j}`)! + T_DIST[j][0]);
  const tour = Math.min(...ends);
  const last = [1, 2, 3][ends.indexOf(tour)];
  if (v === "tour") {
    out.push({
      cells: cells(),
      dist: dist(),
      caption:
        "Four cities, 0 to 3, and the distances between them (right). Find the shortest round trip from city 0 through every city and back. A state is a set of visited cities, written as a mask (place k is city k, place 0 at the right), and the city where the route ends.",
      readout: "best[mask][j] = the shortest route from 0 through exactly the cities in mask, ending at j",
    });
    out.push({
      cells: cells("1,0"),
      dist: dist(),
      caption:
        "The route starts at city 0, having visited only city 0: `best[0001][0]` = 0. Empty cells are states that cannot happen (the route must contain its end, and only the start ends at 0).",
      readout: "best[0001][0] = 0",
    });
    for (const m of TOUR_MASKS)
      for (const j of citiesIn(m)) {
        if (j === 0) continue;
        const pm = m ^ (1 << j);
        const from = citiesIn(pm).filter((i) => best.has(`${pm},${i}`));
        const key = `${m},${j}`;
        filled.add(key);
        out.push({
          cells: cells(
            key,
            from.map((i) => `${pm},${i}`),
          ),
          dist: dist(from.map((i) => [i, j])),
          caption:
            from.length === 1
              ? `Mask ${maskBits(m)}, ending at ${j}: the city before ${j} must be ${from[0]}, the only other city of the set that a route can end at. Look up the route without ${j} (row ${maskBits(pm)}) and add the step to ${j}.`
              : `Mask ${maskBits(m)}, ending at ${j}: the city before ${j} is one of ${list(from)}. Each choice is a route through mask ${maskBits(pm)} plus one step to ${j}. Keep the shortest.`,
          readout: `best[${maskBits(m)}][${j}] = ${from.length > 1 ? `min(${from.map((i) => `${best.get(`${pm},${i}`)} + ${T_DIST[i][j]}`).join(", ")})` : `${best.get(`${pm},${from[0]}`)} + ${T_DIST[from[0]][j]}`} = ${best.get(key)}`,
        });
      }
    out.push({
      cells: cells(undefined, [1, 2, 3].map((j) => `${full},${j}`)),
      dist: dist([1, 2, 3].map((j) => [j, 0])),
      caption: `Every city is visited in row 1111. Close the round trip by adding the step back to city 0 from each possible end, and keep the shortest. The table has 2ⁿ · n cells (2ⁿ is n twos multiplied together), each tried from up to n cities: O(2ⁿ · n²).`,
      readout: `tour = min(${[1, 2, 3].map((j) => `${best.get(`${full},${j}`)} + ${T_DIST[j][0]}`).join(", ")}) = ${tour}`,
      verdict: { ok: true, text: String(tour) },
    });
    return out;
  }
  // walk back
  for (const k of best.keys()) filled.add(k);
  const route = [last];
  let m = full;
  const path: string[] = [`${full},${last}`];
  out.push({
    cells: cells(`${full},${last}`),
    dist: dist([[last, 0]]),
    caption: `The table is full. The shortest tour, ${tour}, ends its visits at city ${last} and then goes back to 0. To find the order, walk back: at each state, look for the city before it that gave its value.`,
    readout: `tour = best[1111][${last}] + ${T_DIST[last][0]} = ${tour}`,
  });
  while (m !== 1) {
    const j = route[0];
    const i = prev.get(`${m},${j}`)!;
    const pm = m ^ (1 << j);
    m = pm;
    route.unshift(i);
    path.push(`${pm},${i}`);
    out.push({
      cells: cells(`${pm},${i}`, [], path.slice(0, -1)),
      dist: dist([[i, j]]),
      caption: `\`best[${maskBits(pm ^ (1 << j))}][${j}]\` came from city ${i}: ${best.get(`${pm},${i}`)} + ${T_DIST[i][j]}. Remove ${j} from the mask and move to row ${maskBits(pm)}, column ${i}.`,
      readout: `route so far: ${route.join(" → ")} → 0`,
    });
  }
  out.push({
    cells: cells(undefined, [], path.slice(0, -1), "1,0"),
    dist: dist(),
    caption: `Back at the start state. The shortest round trip is ${route.join(" → ")} → 0, of length ${tour}. Storing the city before each state, or finding it again as here, rebuilds the order in O(n²) more steps.`,
    readout: `${[...route, 0].slice(1).map((c, k) => T_DIST[[...route, 0][k]][c]).join(" + ")} = ${tour}`,
    verdict: { ok: true, text: `${route.join(" → ")} → 0` },
  });
  return out;
}

/* ---------------------------------------------------------------- ADDP-5.1: digit DP */

export type DigitStep = Base & { cells: GCell[][] };
export const DIGIT_N = 2357;
export const DIGIT_S = 10;

/** ways[r][t]: strings of r digits (leading zeros allowed) whose digits add up to t. */
function ways(r: number, t: number): number {
  if (t < 0) return 0;
  if (r === 0) return t === 0 ? 1 : 0;
  let s = 0;
  for (let d = 0; d <= 9; d++) s += ways(r - 1, t - d);
  return s;
}

export function digitSteps(): DigitStep[] {
  const ds = String(DIGIT_N).split("").map(Number);
  const L = ds.length;
  const val: (number | undefined)[][] = Array.from({ length: 10 }, () => Array(L).fill(undefined));
  const st: GCell["s"][][] = Array.from({ length: 10 }, () => Array(L).fill(""));
  const out: DigitStep[] = [];
  const cells = (curCol?: number): GCell[][] =>
    val.map((row, d) =>
      row.map((v, p) => ({
        v,
        s: (p === curCol && st[d][p] === "path" ? "cur" : st[d][p]) as GCell["s"],
      })),
    );
  out.push({
    cells: cells(),
    caption: `How many numbers from 0 to ${DIGIT_N} have digits that add up to ${DIGIT_S}? Build the number one place at a time, from the left. Each column is a place of N, headed by N's digit there; each row is a digit you could put in that place.`,
    readout: "ways[r][t] = strings of r digits that add up to t (a small table worked out first)",
  });
  let sum = 0;
  let total = 0;
  for (let p = 0; p < L; p++) {
    const rest = L - 1 - p;
    const got: string[] = [];
    for (let d = 0; d <= 9; d++) {
      if (d < ds[p]) {
        const w = ways(rest, DIGIT_S - sum - d);
        val[d][p] = w;
        st[d][p] = w > 0 ? "done" : "";
        total += w;
        got.push(String(w));
      } else if (d === ds[p]) {
        st[d][p] = "path";
        val[d][p] = undefined;
      } else st[d][p] = "out";
    }
    const tightSum = sum + ds[p];
    out.push({
      cells: cells(p),
      caption:
        p === 0
          ? `First place, N's digit ${ds[p]}. A smaller digit here makes the number smaller than N whatever follows, so the other ${rest} places are free: count them with \`ways\` (ink cells). A larger digit would go above N (hatched). The digit ${ds[p]} itself keeps the number equal to N so far: it is "tight" (heavy frame, then pale), and the next place is limited too.`
          : p < L - 1
            ? `Still tight, with ${sum} added up so far. N's digit here is ${ds[p]}: digits 0 to ${ds[p] - 1} free the remaining ${rest} place${rest > 1 ? "s" : ""}, which must add up to ${DIGIT_S} − ${sum} − d. Then follow ${ds[p]} and stay tight.`
            : `Last place, still tight with ${sum} so far. A digit d below ${ds[p]} ends a number below N, and it counts only if ${sum} + d = ${DIGIT_S}: only d = ${DIGIT_S - sum}. The digit ${ds[p]} gives N itself, ${DIGIT_N}, whose digits add up to ${tightSum}${tightSum === DIGIT_S ? ": it counts too" : `, not ${DIGIT_S}: not counted`}.`,
      readout: `place ${p + 1}: ${got.join(" + ") || "0"} · total so far ${total}`,
    });
    sum = tightSum;
  }
  if (sum === DIGIT_S) total += 1;
  out.push({
    cells: cells(),
    caption: `Add up the counts: ${total} numbers. The state of this digit DP is (place, sum so far, tight or not). Only one path is tight, so the work is about places × 10 digits, plus the \`ways\` table: tiny even for numbers near 10¹⁸.`,
    readout: `${ds.map((_, p) => val.map((r) => r[p]).filter((x): x is number => x !== undefined && x > 0).join(" + ")).filter(Boolean).map((t) => `(${t})`).join(" + ")} = ${total}`,
    verdict: { ok: true, text: String(total) },
  });
  return out;
}

/* ---------------------------------------------------------------- ADDP-6.1: Knuth's speed-up, and lines on a hull */

export type FastVariant = "knuth" | "lines";
export type KnuthStep = Base & { piles: GCell[][]; cells: GCell[][] };
export type LineStep = Base & { points: PPoint[]; segs: PSeg[]; lines: PLine[]; queue: QItem[] };
export const KNUTH_PILES = [3, 1, 4, 1, 5, 2];
export const LINE_SIZE = { w: 12, h: 12 };

export function knuthSteps(): KnuthStep[] {
  const a = KNUTH_PILES;
  const n = a.length;
  const best = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const opt = Array.from({ length: n }, (_, i) => Array<number>(n).fill(i));
  const filled = new Set<string>();
  const out: KnuthStep[] = [];
  let tried = 0;
  let full = 0;
  const cells = (cur?: [number, number], srcs: [number, number][] = [], fin = false): GCell[][] =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (j < i) return { blank: true };
        const key = `${i},${j}`;
        const isCur = cur && cur[0] === i && cur[1] === j;
        const has = filled.has(key);
        return {
          v: has ? best[i][j] : undefined,
          tag: has && j > i ? opt[i][j] : undefined,
          s: (fin && i === 0 && j === n - 1 ? "found" : isCur ? "cur" : has ? "done" : "") as GCell["s"],
          src: srcs.some(([r, c]) => r === i && c === j),
          small: has && best[i][j] >= 100,
        };
      }),
    );
  for (let i = 0; i < n; i++) filled.add(`${i},${i}`);
  out.push({
    piles: pileRow(a),
    cells: cells(),
    caption:
      "Joining piles again (lesson 3), with 6 piles. Each cell now also keeps, as a small number, the split k that gave its best value: the last join was i..k with k+1..j. Knuth's rule: that best split never moves left when the stretch grows to the right, nor right when it grows to the left.",
    readout: "opt[i][j − 1] ≤ opt[i][j] ≤ opt[i + 1][j]",
  });
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const lo = len === 2 ? i : opt[i][j - 1];
      const hi = len === 2 ? i : Math.min(opt[i + 1][j], j - 1);
      let b = Infinity;
      for (let k = lo; k <= hi; k++) {
        const c = best[i][k] + best[k + 1][j];
        if (c < b) {
          b = c;
          opt[i][j] = k;
        }
      }
      tried += hi - lo + 1;
      full += j - i;
      best[i][j] = b + rangeSum(a, i, j);
      filled.add(`${i},${j}`);
      const ks = Array.from({ length: hi - lo + 1 }, (_, t) => lo + t);
      if (len === 2) {
        if (i + len === n)
          out.push({
            piles: pileRow(a),
            cells: cells(),
            caption: "Stretches of two piles have only one split, k = i. Fill them first, as in lesson 3.",
            readout: "length 2: opt[i][i + 1] = i",
          });
        continue;
      }
      out.push({
        piles: pileRow(a, [i, j]),
        cells: cells([i, j], ks.flatMap((k) => [[i, k] as [number, number], [k + 1, j] as [number, number]])),
        caption:
          ks.length < j - i
            ? `Piles ${i} to ${j}. The splits of the two stretches one shorter are ${opt[i][j - 1]} (row ${i}, left) and ${opt[i + 1][j]} (column ${j}, below). Only k from ${lo} to ${hi} can be best: ${ks.length} split${ks.length > 1 ? "s" : ""} instead of ${j - i}.`
            : `Piles ${i} to ${j}. The splits of the two stretches one shorter are ${opt[i][j - 1]} and ${opt[i + 1][j]}, so k from ${lo} to ${hi}: here that is every split.`,
        readout: `k in ${lo}..${hi}: best[${i}][${j}] = ${rangeSum(a, i, j)} + ${b} = ${best[i][j]}, opt ${opt[i][j]}`,
      });
    }
  out.push({
    piles: pileRow(a, [0, n - 1]),
    cells: cells(undefined, [], true),
    caption: `The same answer, ${best[0][n - 1]}, with ${tried} splits tried instead of ${full}. For one length, the ranges of neighbouring cells overlap only at their ends, so they add up to about n per length: O(n²) in all, not O(n³). Stretches of length 2 were filled first, as before.`,
    readout: `splits tried: ${tried} · without the rule: ${full}`,
    verdict: { ok: true, text: String(best[0][n - 1]) },
  });
  return out;
}

const LINES: { id: string; y0: number; y1: number }[] = [
  { id: "a", y0: 1, y1: 7 },
  { id: "b", y0: 5, y1: 5 },
  { id: "c", y0: 7, y1: 1 },
  { id: "d", y0: 12, y1: 0 },
];
const lineAt = (l: { y0: number; y1: number }, x: number) => l.y0 + ((l.y1 - l.y0) * x) / 12;

export function lineSteps(): LineStep[] {
  const out: LineStep[] = [];
  const shown = new Set<string>();
  const gone = new Set<string>();
  const view = (
    kept: string[],
    o: { cur?: string; old?: string; q?: number; ans?: string; env?: boolean } = {},
  ): Pick<LineStep, "points" | "segs" | "lines" | "queue"> => {
    const points: PPoint[] = [];
    const segs: PSeg[] = [];
    for (const l of LINES) {
      if (!shown.has(l.id)) continue;
      // the name goes at the right end: at x = 0 it would sit on the axis numbers
      points.push({ id: l.id, x: 0, y: l.y0, label: "", state: l.id === o.cur ? "cur" : gone.has(l.id) || l.id === o.old ? "out" : "" });
      points.push({ id: `${l.id}'`, x: 12, y: l.y1, label: l.id, lp: "r" });
      segs.push({ a: l.id, b: `${l.id}'`, state: l.id === o.cur ? "cur" : gone.has(l.id) || l.id === o.old ? "old" : o.env ? "" : "" });
    }
    if (o.q !== undefined && o.ans) {
      const l = LINES.find((x) => x.id === o.ans)!;
      points.push({ id: "q", x: o.q, y: lineAt(l, o.q), label: "", state: "found" });
    }
    if (o.env) {
      points.push({ id: "p1", x: 6, y: 4, label: "" }, { id: "p2", x: 10, y: 2, label: "" });
      segs.push({ a: "a", b: "p1", state: "found" }, { a: "p1", b: "p2", state: "found" }, { a: "p2", b: "d'", state: "found" });
    }
    return {
      points,
      segs,
      lines: o.q !== undefined ? [{ x: o.q, label: `x = ${o.q}`, kind: "blue" }] : [],
      queue: kept.map((id) => ({ v: id, s: (id === o.cur ? "cur" : id === o.ans ? "found" : id === o.old ? "out" : "") as QItem["s"] })),
    };
  };
  out.push({
    ...view([]),
    caption:
      "Many DPs take, for each new state, the smallest of many values of the form m·x + b: one straight line per earlier state, read at the new state's x. Here lines arrive with falling slopes, and the questions ask for the lowest line at an x that only moves right.",
    readout: "keep only the lines that are lowest somewhere, in a deque",
  });
  shown.add("a");
  out.push({ ...view(["a"], { cur: "a" }), caption: "Line a arrives. It is the only line, so it is kept.", readout: "kept: a" });
  out.push({
    ...view(["a"], { q: 2, ans: "a" }),
    caption: "Question at x = 2: the lowest line is the first kept line, a, with value 2.",
    readout: "x = 2: a gives 2",
  });
  shown.add("b");
  out.push({
    ...view(["a", "b"], { cur: "b" }),
    caption: "Line b arrives. It is flat, so far to the right it is lower than a: they cross at x = 8. Keep it at the back of the deque.",
    readout: "kept: a, b · a and b cross at x = 8",
  });
  shown.add("c");
  out.push({
    ...view(["a", "b", "c"], { cur: "c", old: "b" }),
    caption:
      "Line c arrives, falling. It crosses a at x = 6, left of where b would take over (x = 8). So wherever b is below a, c is lower still: b is never the lowest line. Remove it from the back.",
    readout: "c meets a at x = 6 < 8, where b meets a: drop b",
  });
  gone.add("b");
  out.push({
    ...view(["a", "c"], { q: 8, ans: "c", old: "a" }),
    caption:
      "Question at x = 8. At the front, a gives 5 and the next line, c, gives 3. Since later questions only move right, a will never be lowest again: remove it from the front. The answer is 3.",
    readout: "x = 8: a gives 5, c gives 3 · drop a",
  });
  gone.add("a");
  shown.add("d");
  out.push({
    ...view(["c", "d"], { cur: "d" }),
    caption: "Line d arrives, steeper. It crosses c at x = 10, to the right of where c took over, so c stays. Keep d at the back.",
    readout: "kept: c, d · c and d cross at x = 10",
  });
  out.push({
    ...view(["c", "d"], { q: 11, ans: "d", old: "c" }),
    caption: "Question at x = 11: c gives 1.5 and d gives 1, so c leaves from the front. The answer is 1.",
    readout: "x = 11: c gives 1.5, d gives 1 · drop c",
  });
  gone.add("c");
  gone.delete("a");
  gone.delete("c");
  gone.add("b");
  out.push({
    ...view(["d"], { env: true }),
    caption:
      "The lines kept over time trace the lower edge of all the lines, a convex shape (GEOM-3): a, then c, then d. Each line enters the deque once and leaves at most once, so n lines and n questions cost O(n) in all.",
    readout: "lowest: a up to x = 6, c up to x = 10, then d",
    verdict: { ok: true, text: "O(n)" },
  });
  return out;
}
