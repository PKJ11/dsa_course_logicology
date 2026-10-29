// Step generators for the DSUF figures. Every figure is a pure function of its step number.
// A union-find structure is drawn twice: as a forest (Tree stage with several roots and `slide`; node ids
// follow the elements, so a link or a compression moves whole subtrees) and as the parent list that
// stores it (ArrayTrack). Captions use `backticks` for code.

import type { GCell, Mark, TNode } from "../../_components/Stages";
import { plural, type CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type UfStep = {
  parent: number[];
  /** shown as a tag on each root */
  rank?: number[];
  marks?: Record<number, Mark>;
  cells?: Record<number, CellState>;
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export function forestNodes(parent: number[], marks: Record<number, Mark> = {}, rank?: number[]): TNode[] {
  return parent.map((p, i) => ({
    id: `e${i}`,
    label: String(i),
    parent: p === i ? undefined : `e${p}`,
    state: marks[i],
    tag: rank && p === i ? String(rank[i]) : undefined,
    tagKind: "plain",
  }));
}

export function cellStates(n: number, cells: Record<number, CellState> = {}): CellState[] {
  return Array.from({ length: n }, (_, k) => cells[k] ?? "");
}

const root = (parent: number[], x: number) => {
  while (parent[x] !== x) x = parent[x];
  return x;
};
const pathOf = (parent: number[], x: number) => {
  const p = [x];
  while (parent[x] !== x) p.push((x = parent[x]));
  return p;
};
const mark = (xs: number[], m: Mark) => Object.fromEntries(xs.map((x) => [x, m])) as Record<number, Mark>;

/* DSUF-1.1: sets as a forest, and the simpler label list */

const N = 8;
const OPS1: ["union" | "find" | "connected", number, number?][] = [
  ["union", 0, 1],
  ["union", 2, 3],
  ["union", 4, 5],
  ["union", 1, 3],
  ["union", 6, 7],
  ["union", 5, 7],
  ["find", 0],
  ["connected", 0, 2],
  ["connected", 0, 6],
  ["union", 2, 6],
];

export function forestSteps(): UfStep[] {
  const parent = Array.from({ length: N }, (_, i) => i);
  const steps: UfStep[] = [
    {
      parent: parent.slice(),
      caption:
        "Eight elements, 0 to 7, each in a set of its own. Each set is a tree of one node. A node points to its parent, and a root points to itself: the list `parent` below the trees stores exactly this.",
    },
  ];
  for (const [op, a, b] of OPS1) {
    if (op === "union") {
      const ra = root(parent, a);
      const rb = root(parent, b!);
      const finds = ra === a && rb === b ? "" : ` First find the roots: ${a} leads to ${ra}, and ${b} leads to ${rb}.`;
      parent[ra] = rb;
      steps.push({
        parent: parent.slice(),
        marks: { ...mark(pathOf(parent, a).slice(0, -1), "done"), [ra]: "cur", [rb]: "found" },
        cells: { [ra]: "mid" },
        caption: `\`union(${a}, ${b})\`.${finds} Make the root ${ra} point to the root ${rb}: one change in the list, \`parent[${ra}] = ${rb}\`. The two sets are now one tree.`,
        readout: `parent[${ra}] = ${rb}`,
      });
    } else if (op === "find") {
      const p = pathOf(parent, a);
      steps.push({
        parent: parent.slice(),
        marks: { ...mark(p.slice(0, -1), "cur"), [p[p.length - 1]]: "found" },
        cells: Object.fromEntries(p.map((x, k) => [x, k === p.length - 1 ? "found" : "mid"])) as Record<number, CellState>,
        caption: `\`find(${a})\`: follow the parents up, ${p.join(" → ")}, until a node points to itself. That root, ${p[p.length - 1]}, names the set. Every element of the set leads to the same root.`,
        readout: `find(${a}) = ${p[p.length - 1]}   (${plural(p.length - 1, "parent step")})`,
      });
    } else {
      const ra = root(parent, a);
      const rb = root(parent, b!);
      const same = ra === rb;
      steps.push({
        parent: parent.slice(),
        marks: { ...mark(pathOf(parent, a), "cur"), ...mark(pathOf(parent, b!), "cur"), [ra]: "found", [rb]: "found" },
        caption: same
          ? `\`connected(${a}, ${b})\`: find both roots. ${a} leads to ${ra} and ${b} leads to ${rb}: the same root, so they are in the same set.`
          : `\`connected(${a}, ${b})\`: ${a} leads to ${ra}, but ${b} leads to ${rb}. Different roots, different sets.`,
        readout: `find(${a}) = ${ra}, find(${b}) = ${rb}`,
        verdict: same ? { ok: true, text: "True" } : { ok: false, text: "False", info: true },
      });
    }
  }
  steps.push({
    parent: parent.slice(),
    caption:
      "One set of 8. A union changed one entry of the list. The cost of a find is the number of parent steps to the root, so it depends on how tall the trees grow. Lessons 2 and 3 keep them short.",
    verdict: { ok: true, text: "1 set" },
  });
  return steps;
}

export type LabelStep = { label: number[]; cells: Record<number, CellState>; caption: string; readout?: string; verdict?: Verdict };

/** The simplest method: every element stores the name of its set. find is one read; union rewrites a whole set. */
export function labelSteps(): LabelStep[] {
  const label = Array.from({ length: N }, (_, i) => i);
  let reads = 0;
  const steps: LabelStep[] = [
    {
      label: label.slice(),
      cells: {},
      caption: "The simplest method: a list `label`, where `label[x]` names the set of `x`. At the start every element is its own set. `find(x)` is one read: `label[x]`.",
    },
  ];
  for (const [op, a, b] of OPS1) {
    if (op !== "union") continue;
    const la = label[a];
    const lb = label[b!];
    const changed: number[] = [];
    for (let i = 0; i < N; i++) {
      reads++;
      if (label[i] === la) {
        label[i] = lb;
        changed.push(i);
      }
    }
    steps.push({
      label: label.slice(),
      cells: Object.fromEntries(changed.map((i) => [i, "mid" as CellState])),
      caption: `\`union(${a}, ${b})\`: every element labelled ${la} must be relabelled ${lb}. To find them, read the whole list: ${N} reads, to change ${changed.length}.`,
      readout: `reads so far: ${reads}`,
    });
  }
  steps.push({
    label: label.slice(),
    cells: {},
    caption: `Fast finds, but every union reads all n labels, so n unions cost n² reads. With a million elements that is a million million. The forest makes union cheap instead.`,
    readout: `reads so far: ${reads}`,
    verdict: { ok: false, text: "union is O(n)", info: true },
  });
  return steps;
}

/* DSUF-2.1: union by rank keeps the trees short */

export type RankVariant = "naive" | "rank" | "pairs";

export function rankSteps(v: RankVariant): UfStep[] {
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array(N).fill(0);
  const steps: UfStep[] = [];
  const ops: [number, number][] =
    v === "pairs"
      ? [
          [0, 1],
          [2, 3],
          [4, 5],
          [6, 7],
          [1, 3],
          [5, 7],
          [3, 7],
        ]
      : [1, 2, 3, 4, 5, 6, 7].map((b) => [0, b] as [number, number]);
  const showRank = v !== "naive";
  const height = () => Math.max(...parent.map((_, i) => pathOf(parent, i).length - 1));
  steps.push({
    parent: parent.slice(),
    rank: showRank ? rank.slice() : undefined,
    caption:
      v === "naive"
        ? "Union always makes the root of the first set point to the root of the second. Watch what `union(0, 1)`, `union(0, 2)`, …, `union(0, 7)` do."
        : v === "rank"
          ? "The same unions, but each root keeps a rank, shown in the list named rank (and beside each root on a wide screen): at the start, every rank is 0. The root with the smaller rank points to the other one."
          : "Unions of equal pairs: first single elements, then pairs, then fours. This is the case where the height grows as much as the rank rule allows.",
  });
  for (const [a, b] of ops) {
    let ra = root(parent, a);
    let rb = root(parent, b);
    let why: string;
    if (v === "naive") {
      why = `${ra} now points to ${rb}`;
    } else {
      if (rank[ra] > rank[rb]) [ra, rb] = [rb, ra];
      if (rank[ra] === rank[rb]) {
        why = `Both ranks are ${rank[rb]}: ${ra} points to ${rb}, and the rank of ${rb} goes up to ${rank[rb] + 1}`;
      } else {
        why = `Rank ${rank[ra]} is smaller than rank ${rank[rb]}: ${ra} points to ${rb}, and no rank changes`;
      }
    }
    parent[ra] = rb;
    if (showRank && rank[ra] === rank[rb]) rank[rb]++;
    steps.push({
      parent: parent.slice(),
      rank: showRank ? rank.slice() : undefined,
      marks: { [ra]: "cur", [rb]: "found" },
      cells: { [ra]: "mid" },
      caption: `\`union(${a}, ${b})\`: the roots are ${ra} and ${rb}. ${why}.`,
      readout: `height: ${height()}`,
    });
  }
  const deep = parent.map((_, i) => i).sort((x, y) => pathOf(parent, y).length - pathOf(parent, x).length)[0];
  const p = pathOf(parent, deep);
  steps.push({
    parent: parent.slice(),
    rank: showRank ? rank.slice() : undefined,
    marks: { ...mark(p.slice(0, -1), "cur"), [p[p.length - 1]]: "found" },
    caption:
      v === "naive"
        ? `One long path. \`find(${deep})\` takes ${p.length - 1} parent steps. With n elements this order of unions makes a path of length n − 1, so a find costs O(n).`
        : v === "rank"
          ? `Every union hung a small tree under the big one, so the height stays 1. \`find(${deep})\` takes ${p.length - 1} parent step.`
          : `The height grew only when two trees of equal rank met, and it is 3 = log₂ 8. A tree of rank r has at least 2 to the power r nodes, so the height is at most log₂ n.`,
    readout: `find(${deep}): ${plural(p.length - 1, "parent step")}`,
    verdict:
      v === "naive"
        ? { ok: false, text: `height ${height()}`, info: true }
        : { ok: true, text: `height ${height()}` },
  });
  return steps;
}

/* DSUF-3.1: path compression and path halving */

export function compressSteps(v: "compress" | "halve"): UfStep[] {
  // a tall tree: 0 → 1 → 2 → 3 → 4, with 5 under 1, 6 under 3 and 7 under 4
  const parent = [1, 2, 3, 4, 4, 1, 3, 4];
  const steps: UfStep[] = [];
  steps.push({
    parent: parent.slice(),
    caption: `A tall tree, made by unions without the rank rule. \`find(0)\` must go up 4 parents. Path ${v === "compress" ? "compression" : "halving"} shortens the path while this find walks it, so later finds are cheaper.`,
  });
  if (v === "compress") {
    const p = pathOf(parent, 0);
    for (let k = 0; k < p.length; k++) {
      const last = k === p.length - 1;
      steps.push({
        parent: parent.slice(),
        marks: { ...mark(p.slice(0, k), "done"), [p[k]]: last ? "found" : "cur" },
        cells: { [p[k]]: last ? "found" : "mid" },
        caption: last
          ? `${p[k]} points to itself: it is the root. That was the first pass: ${p.length - 1} parent steps.`
          : `First pass: go up to the root. At ${p[k]}, its parent is ${parent[p[k]]}.`,
        readout: `steps: ${k}`,
      });
    }
    const r = p[p.length - 1];
    for (const x of p.slice(0, -1)) {
      if (parent[x] === r) continue;
      parent[x] = r;
      steps.push({
        parent: parent.slice(),
        marks: { [x]: "cur", [r]: "found" },
        cells: { [x]: "mid" },
        caption: `Second pass: walk the path again and point every node straight at the root. \`parent[${x}] = ${r}\`. Everything below ${x} moves up with it.`,
        readout: `parent[${x}] = ${r}`,
      });
    }
    const q = pathOf(parent, 5);
    steps.push({
      parent: parent.slice(),
      marks: { ...mark(q.slice(0, -1), "cur"), [r]: "found" },
      caption: `Done. The next \`find\` on any of these nodes, or below them, is short: \`find(5)\` now takes ${q.length - 1} steps, where it took 4 before. The work of one long find is shared by all later finds.`,
      readout: `find(5): ${plural(q.length - 1, "parent step")} (was 4)`,
      verdict: { ok: true, text: "path compressed" },
    });
    return steps;
  }
  // path halving: every node on the way points to its grandparent, in one pass
  let x = 0;
  let k = 0;
  while (parent[x] !== x) {
    const g = parent[parent[x]];
    const old = parent[x];
    parent[x] = g;
    k++;
    steps.push({
      parent: parent.slice(),
      marks: { [x]: "cur", [g]: "found" },
      cells: { [x]: "mid" },
      caption: `At ${x}: its parent is ${old} and its grandparent is ${g}. Point ${x} at its grandparent, \`parent[${x}] = ${g}\`, and jump there.`,
      readout: `parent[${x}] = ${g}`,
    });
    x = g;
  }
  steps.push({
    parent: parent.slice(),
    marks: { [x]: "found" },
    cells: { [x]: "found" },
    caption: `${x} is the root, reached in ${k} jumps. Halving needs only one pass and no list of the path. The path is roughly halved each time, and repeated finds flatten it completely: the cost has the same bound as full compression.`,
    readout: `jumps: ${k}`,
    verdict: { ok: true, text: "path halved" },
  });
  return steps;
}

/* DSUF-4.1: measured costs and the iterated logarithm. The numbers were measured once by a short Python program
   with the union and find of lesson 3: the average number of parent steps per operation, for the two sequences
   that lesson 4 describes. */

export const SIZES = [8, 64, 512, 4_096, 32_768];
// columns: neither, rank only, compression only, both
export const MEASURED: Record<"chain" | "balanced", number[][]> = {
  chain: [
    [1.87, 0.8, 0.87, 0.8],
    [15.87, 0.98, 0.98, 0.98],
    [127.87, 1.0, 1.0, 1.0],
    [1023.87, 1.0, 1.0, 1.0],
    [8191.87, 1.0, 1.0, 1.0],
  ],
  balanced: [
    [1.33, 1.33, 1.2, 1.2],
    [2.41, 2.41, 1.64, 1.64],
    [3.23, 3.23, 1.73, 1.73],
    [4.0, 4.0, 1.75, 1.75],
    [4.75, 4.75, 1.75, 1.75],
  ],
};

export const LOGSTAR = [
  { n: "2⁶⁵⁵³⁶", words: "a number with 19,729 digits" },
  { n: "65,536", words: "2¹⁶" },
  { n: "16", words: "2⁴" },
  { n: "4", words: "2²" },
  { n: "2", words: "2¹" },
  { n: "1", words: "stop" },
];

/* DSUF-5.1: applications. Edges arriving one by one (groups and cycles), and islands on a grid. */

export const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 4],
  [0, 2],
  [4, 5],
  [2, 3],
  [5, 3],
];

export type EdgeStep = UfStep & { at: number | null; edgeCells: CellState[] };

export function edgeSteps(): EdgeStep[] {
  const n = 6;
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const cycles: number[] = [];
  let groups = n;
  const edgeCells = (cur: number | null): CellState[] => EDGES.map((_, k) => (k === cur ? "mid" : cycles.includes(k) ? "found" : k < (cur ?? EDGES.length) ? "out" : ""));
  const steps: EdgeStep[] = [
    {
      parent: parent.slice(),
      at: null,
      edgeCells: edgeCells(-1),
      caption: "Six places, 0 to 5, and roads between them that arrive one at a time. Two questions: how many separate groups are there, and which roads close a loop (a cycle)?",
      readout: `groups: ${groups}`,
    },
  ];
  EDGES.forEach(([a, b], k) => {
    let ra = root(parent, a);
    let rb = root(parent, b);
    if (ra === rb) {
      cycles.push(k);
      steps.push({
        parent: parent.slice(),
        at: k,
        edgeCells: edgeCells(k),
        marks: { ...mark(pathOf(parent, a), "cur"), ...mark(pathOf(parent, b), "cur"), [ra]: "found" },
        caption: `Road ${a}–${b}: both lead to the root ${ra}. They are already connected, so this road closes a cycle. \`union\` returns False and nothing changes.`,
        readout: `groups: ${groups}`,
        verdict: { ok: false, text: "closes a cycle", info: true },
      });
      return;
    }
    if (rank[ra] > rank[rb]) [ra, rb] = [rb, ra];
    parent[ra] = rb;
    if (rank[ra] === rank[rb]) rank[rb]++;
    groups--;
    steps.push({
      parent: parent.slice(),
      at: k,
      edgeCells: edgeCells(k),
      marks: { [ra]: "cur", [rb]: "found" },
      cells: { [ra]: "mid" },
      caption: `Road ${a}–${b}: the roots are different, so join the two groups. One group fewer.`,
      readout: `groups: ${groups}`,
    });
  });
  steps.push({
    parent: parent.slice(),
    at: null,
    edgeCells: edgeCells(null),
    caption: `All roads are in: ${groups} group, and ${cycles.length} roads closed a cycle (marked). Each road cost two finds, so the whole job is nearly O(1) per road.`,
    readout: `groups: ${groups}`,
    verdict: { ok: true, text: `${groups} group, ${cycles.length} cycles` },
  });
  return steps;
}

export const ISLAND_MAP = ["11001", "01011", "10000", "11011"];

export type IslandStep = { cells: GCell[][]; caption: string; readout: string; verdict?: Verdict };

export function islandSteps(): IslandStep[] {
  const R = ISLAND_MAP.length;
  const C = ISLAND_MAP[0].length;
  const land = (r: number, c: number) => r >= 0 && c >= 0 && r < R && c < C && ISLAND_MAP[r][c] === "1";
  const parent = Array.from({ length: R * C }, (_, i) => i);
  const rank = new Array(R * C).fill(0);
  let count = ISLAND_MAP.join("").split("").filter((x) => x === "1").length;
  const draw = (cur: number | null): GCell[][] =>
    ISLAND_MAP.map((row, r) =>
      row.split("").map((ch, c) => {
        const i = r * C + c;
        if (ch !== "1") return {};
        return { v: root(parent, i), s: i === cur ? "cur" : "done" } as GCell;
      }),
    );
  const steps: IslandStep[] = [
    {
      cells: draw(null),
      caption: `A map: dark cells are land, white cells are water. Land cells that touch up, down, left or right belong to one island. Number the cells 0 to ${R * C - 1}, row by row. At first every land cell is its own set, so it shows its own number.`,
      readout: `islands: ${count}`,
    },
  ];
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!land(r, c)) continue;
      const i = r * C + c;
      const joined: number[] = [];
      for (const [nr, nc] of [
        [r - 1, c],
        [r, c - 1],
      ]) {
        if (!land(nr, nc)) continue;
        const j = nr * C + nc;
        let ra = root(parent, i);
        let rb = root(parent, j);
        if (ra === rb) continue;
        if (rank[ra] > rank[rb]) [ra, rb] = [rb, ra];
        parent[ra] = rb;
        if (rank[ra] === rank[rb]) rank[rb]++;
        count--;
        joined.push(j);
      }
      const what = joined.length
        ? `It touches land at ${joined.join(" and ")}: union with ${joined.length === 1 ? "it" : "both"}. ${joined.length === 1 ? "One island" : "Two islands"} fewer.`
        : "No land above it or to its left, so nothing to join yet.";
      steps.push({ cells: draw(i), caption: `Cell ${i}. ${what} Looking up and left is enough: the cells below and to the right will look back at this one.`, readout: `islands: ${count}` });
    }
  steps.push({
    cells: draw(null),
    caption: `Every land cell now shows the root of its island, and the count is ${count}. Each cell made at most two unions, so the work is nearly O(1) per cell.`,
    readout: `islands: ${count}`,
    verdict: { ok: true, text: `${count} islands` },
  });
  return steps;
}
