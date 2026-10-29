// Step generators for the RNGQ figures. Every figure is a pure function of its step number.
// The structures over an array (Fenwick tree, segment tree, blocks) are drawn with the Spans stage: each stored
// value is a bar over exactly the cells it covers, on the same columns as the array track below it.
// Captions use `backticks` for code.

import type { GCell, Mark, SpanRow } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };
export type Win = { lo: number; hi: number; label: string };

export type Track = { name: string; values: (number | string)[]; states?: CellState[]; window?: Win; pointer?: { name: string; at: number | null }; base?: number };

export type RangeStep = {
  tracks: Track[];
  spans?: SpanRow[];
  grid?: GCell[][];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

const states = (n: number, m: Record<number, CellState> = {}): CellState[] => Array.from({ length: n }, (_, k) => m[k] ?? "");
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
const fill = (ks: number[], s: CellState) => Object.fromEntries(ks.map((k) => [k, s])) as Record<number, CellState>;

/* RNGQ-1.1: prefix sums, and the difference list for adding to ranges */

export const A7 = [3, 1, 4, 1, 5, 9, 2];

export function prefixSteps(v: "sums" | "adds"): RangeStep[] {
  const steps: RangeStep[] = [];
  if (v === "sums") {
    const a = A7;
    const p: (number | string)[] = [0, "", "", "", "", "", "", ""];
    steps.push({
      tracks: [
        { name: "a", values: a },
        { name: "p", values: p.slice(), states: states(8, { 0: "found" }) },
      ],
      caption: "A list `a` of 7 numbers, and its prefix sums `p`: `p[k]` is the total of the first k values. `p` has one more cell than `a`, and `p[0] = 0`, the total of no values.",
    });
    for (let k = 0; k < a.length; k++) {
      p[k + 1] = (p[k] as number) + a[k];
      steps.push({
        tracks: [
          { name: "a", values: a, states: states(7, { [k]: "mid" }) },
          { name: "p", values: p.slice(), states: states(8, { [k]: "found", [k + 1]: "mid" }) },
        ],
        caption: `\`p[${k + 1}] = p[${k}] + a[${k}]\` = ${p[k]} + ${a[k]} = ${p[k + 1]}. One addition per cell: building \`p\` is O(n).`,
        readout: `p[${k + 1}] = ${p[k + 1]}`,
      });
    }
    const ask = (l: number, r: number, last: boolean) =>
      steps.push({
        tracks: [
          { name: "a", values: a, states: states(7, fill(range(l, r), "found")), window: { lo: l, hi: r - 1, label: `a[${l}:${r}]` } },
          { name: "p", values: p.slice(), states: states(8, { [l]: "mid", [r]: "mid" }) },
        ],
        caption: `The total of \`a[${l}:${r}]\` is \`p[${r}] − p[${l}]\` = ${p[r]} − ${p[l]} = ${(p[r] as number) - (p[l] as number)}: the first ${r} values minus the first ${l}. Two reads and one subtraction, however long the range.${last ? " So after O(n) work once, every range sum costs O(1)." : ""}`,
        readout: `sum(a[${l}:${r}]) = ${(p[r] as number) - (p[l] as number)}`,
        verdict: last ? { ok: true, text: "O(1) per question" } : undefined,
      });
    ask(2, 5, false);
    ask(0, 7, true);
    return steps;
  }
  // the difference list: add v to a[l:r] by changing two cells, then one prefix-sum pass
  const n = 7;
  const d = new Array(n + 1).fill(0);
  const adds: [number, number, number][] = [
    [1, 4, 2],
    [3, 7, 5],
    [0, 2, 1],
  ];
  steps.push({
    tracks: [
      { name: "a", values: new Array(n).fill(0) },
      { name: "d", values: d.slice() },
    ],
    caption: "Now the other way round: many changes of the form “add v to every value of `a[l:r]`”, and the final list is wanted only at the end. Keep a difference list `d`, all zeros, one cell longer than `a`.",
  });
  for (const [l, r, val] of adds) {
    d[l] += val;
    d[r] -= val;
    steps.push({
      tracks: [
        { name: "a", values: new Array(n).fill(0), window: { lo: l, hi: r - 1, label: `add ${val} to a[${l}:${r}]` } },
        { name: "d", values: d.slice(), states: states(n + 1, { [l]: "mid", [r]: "mid" }) },
      ],
      caption: `Add ${val} to \`a[${l}:${r}]\`: \`d[${l}] += ${val}\` (from here on, ${val} more) and \`d[${r}] -= ${val}\` (from here on, ${val} less again). Two changes, however long the range.`,
      readout: `d[${l}] += ${val}, d[${r}] -= ${val}`,
    });
  }
  const a: number[] = [];
  let run = 0;
  for (let k = 0; k < n; k++) {
    run += d[k];
    a.push(run);
  }
  steps.push({
    tracks: [
      { name: "a", values: a, states: states(n, fill(range(0, n), "found")) },
      { name: "d", values: d.slice() },
    ],
    caption: "At the end, a running total of `d` gives `a`: `a[k] = d[0] + d[1] + … + d[k]`. Each add is felt from its start to its end and nowhere else. All the adds together cost O(1) each, plus one O(n) pass.",
    readout: `a = [${a.join(", ")}]`,
    verdict: { ok: true, text: "O(1) per add" },
  });
  return steps;
}

/* RNGQ-2.1: the sparse table for range minimum */

export const A8 = [5, 2, 7, 4, 6, 1, 8, 3];

function sparse(a: number[]): (number | null)[][] {
  const t: (number | null)[][] = [a.slice()];
  for (let k = 1; 1 << k <= a.length; k++) {
    const h = 1 << (k - 1);
    t.push(a.map((_, i) => (i + (1 << k) <= a.length ? Math.min(t[k - 1][i]!, t[k - 1][i + h]!) : null)));
  }
  return t;
}

function tableCells(t: (number | null)[][], upto: number, marks: Record<string, Mark> = {}): GCell[][] {
  return t.map((row, k) => row.map((x, i) => (k > upto || x === null ? {} : { v: x, s: marks[`${k}:${i}`] })));
}

export function sparseSteps(v: "build" | "query"): RangeStep[] {
  const a = A8;
  const t = sparse(a);
  const steps: RangeStep[] = [];
  if (v === "build") {
    steps.push({
      tracks: [{ name: "a", values: a }],
      grid: tableCells(t, 0, {}),
      caption: "The table has one row per power of two. Row k holds, for every start i, the smallest value of the block of length 2ᵏ (k twos multiplied together; 2⁰ is 1) that starts at i. Row 0 is the list itself: blocks of length 1.",
    });
    for (let k = 1; k < t.length; k++) {
      const h = 1 << (k - 1);
      const i = k === 3 ? 0 : 2;
      steps.push({
        tracks: [{ name: "a", values: a, states: states(8, fill(range(i, i + (1 << k)), "found")) }],
        grid: tableCells(t, k, { [`${k}:${i}`]: "cur", [`${k - 1}:${i}`]: "found", [`${k - 1}:${i + h}`]: "found" }),
        spans: [
          {
            bars: [
              { l: i, r: i + h - 1, label: t[k - 1][i]!, state: "found" },
              { l: i + h, r: i + 2 * h - 1, label: t[k - 1][i + h]!, state: "found" },
            ],
          },
        ],
        caption: `Row ${k}: blocks of length ${1 << k}. Each is two blocks of length ${h} from row ${k - 1}, side by side. For example, the block at ${i} is the smaller of row ${k - 1} at ${i} and at ${i + h}: min(${t[k - 1][i]}, ${t[k - 1][i + h]}) = ${t[k][i]}.`,
        readout: `t[${k}][${i}] = min(t[${k - 1}][${i}], t[${k - 1}][${i + h}]) = ${t[k][i]}`,
      });
    }
    steps.push({
      tracks: [{ name: "a", values: a }],
      grid: tableCells(t, 3),
      caption: "About log₂ n rows of at most n cells, each cell one min: O(n log n) time and memory to build. The list never changes afterwards; the table cannot handle updates.",
      verdict: { ok: true, text: "table built" },
    });
    return steps;
  }
  const ask = (l: number, r: number, last: boolean) => {
    const len = r - l;
    const k = Math.floor(Math.log2(len));
    const b = 1 << k;
    const x = t[k][l]!;
    const y = t[k][r - b]!;
    steps.push({
      tracks: [{ name: "a", values: a, window: { lo: l, hi: r - 1, label: `a[${l}:${r}]` } }],
      grid: tableCells(t, 3),
      caption: `The smallest value of \`a[${l}:${r}]\`: ${len} cells. The largest power of two that fits is ${b} (row ${k}).`,
      readout: `length ${len}, k = ${k}, block length ${b}`,
    });
    steps.push({
      tracks: [{ name: "a", values: a, window: { lo: l, hi: r - 1, label: `a[${l}:${r}]` }, states: states(8, fill(range(l, r), "found")) }],
      grid: tableCells(t, 3, { [`${k}:${l}`]: "cur", [`${k}:${r - b}`]: "cur" }),
      spans: [
        { name: "1st", bars: [{ l, r: l + b - 1, label: x, state: "cur" }] },
        { name: "2nd", bars: [{ l: r - b, r: r - 1, label: y, state: "cur" }] },
      ],
      caption:
        b === len
          ? `The range is exactly one block, at ${l}: read row ${k} at ${l}. One read.`
          : `Two blocks of length ${b} cover the range: one starting at ${l}, one ending at ${r - 1} (starting at ${r - b}). They overlap, but a value counted twice cannot change a minimum. The answer is min(${x}, ${y}) = ${Math.min(x, y)}.`,
      readout: `min(a[${l}:${r}]) = min(t[${k}][${l}], t[${k}][${r - b}]) = ${Math.min(x, y)}`,
      verdict: last ? { ok: true, text: "O(1) per question" } : undefined,
    });
  };
  ask(1, 7, false);
  ask(2, 5, true);
  return steps;
}

/* RNGQ-3.1: the Fenwick tree. Positions are counted from 1, so the low bit of i says how many cells t[i] covers. */

const low = (i: number) => i & -i;
const bin4 = (i: number) => i.toString(2).padStart(4, "0");

/** One row per length (8, 4, 2, 1); bar i covers positions i - low(i) + 1 .. i (cells i - low(i) .. i - 1). */
function fenRows(t: number[], marks: Record<number, Mark> = {}): SpanRow[] {
  return [8, 4, 2, 1].map((len) => ({
    name: String(len),
    bars: range(1, 9)
      .filter((i) => low(i) === len)
      .map((i) => ({ l: i - len, r: i - 1, label: t[i], state: marks[i] })),
  }));
}

export function fenwickSteps(v: "prefix" | "add" | "range"): RangeStep[] {
  const a = [0, ...A8]; // a[1..8]
  const t = new Array(9).fill(0);
  for (let i = 1; i <= 8; i++) for (let j = i; j <= 8; j += low(j)) t[j] += a[i];
  const steps: RangeStep[] = [];
  const arr = (m: Record<number, CellState> = {}): Track => ({ name: "a", values: a.slice(1), states: states(8, m), base: 1 });
  steps.push({
    tracks: [arr()],
    spans: fenRows(t),
    caption:
      v === "prefix"
        ? "A Fenwick tree for 8 values, counted from position 1. `t[i]` is drawn as a bar that ends at position i. Its length is the lowest 1 bit of i: 1 for odd i, 2 for 2 and 6, 4 for 4, 8 for 8. The row name is that length."
        : v === "add"
          ? "The same Fenwick tree. Add 5 to the value at position 3. Every bar that covers position 3 must grow by 5, and there is one such bar per row at most."
          : "The total of positions 3 to 6 is the total of the first 6 minus the total of the first 2. A Fenwick tree answers “the first i” questions, so ask two of them.",
  });
  const prefix = (n: number, acc: { s: number }, tag: string) => {
    let i = n;
    const used: number[] = [];
    while (i > 0) {
      used.push(i);
      acc.s += t[i];
      const next = i - low(i);
      steps.push({
        tracks: [arr(fill(range(i - low(i), n), "found"))],
        spans: fenRows(t, { ...Object.fromEntries(used.slice(0, -1).map((u) => [u, "done" as Mark])), [i]: "cur" }),
        caption: `${tag}i = ${i} (\`${bin4(i)}\`): add \`t[${i}]\` = ${t[i]}, which covers positions ${i - low(i) + 1} to ${i}. Then remove the lowest 1 bit: i = ${i} − ${low(i)} = ${next}.`,
        readout: `${tag}total so far: ${acc.s}   next i = ${bin4(next)} = ${next}`,
      });
      i = next;
    }
    return used;
  };
  if (v === "prefix") {
    const acc = { s: 0 };
    const used = prefix(7, acc, "");
    steps.push({
      tracks: [arr(fill(range(0, 7), "found"))],
      spans: fenRows(t, Object.fromEntries(used.map((u) => [u, "found" as Mark]))),
      caption: `i reached 0: stop. Three bars cover positions 1 to 7 exactly, one per 1 bit of 7 = \`0111\`. At most log₂ n + 1 bars, so a prefix sum is O(log n).`,
      readout: `sum of the first 7 = ${acc.s}`,
      verdict: { ok: true, text: `${acc.s}` },
    });
    return steps;
  }
  if (v === "add") {
    let i = 3;
    const touched: number[] = [];
    while (i <= 8) {
      t[i] += 5;
      touched.push(i);
      const next = i + low(i);
      steps.push({
        tracks: [{ ...arr({ 2: "mid" }), values: a.slice(1).map((x, k) => (k === 2 ? x + 5 : x)) }],
        spans: fenRows(t, { ...Object.fromEntries(touched.slice(0, -1).map((u) => [u, "done" as Mark])), [i]: "cur" }),
        caption: `i = ${i} (\`${bin4(i)}\`): \`t[${i}] += 5\`, now ${t[i]}. To reach the next bar that covers position 3, add the lowest 1 bit: i = ${i} + ${low(i)} = ${next}.`,
        readout: `next i = ${bin4(next)} = ${next}`,
      });
      i = next;
    }
    steps.push({
      tracks: [{ ...arr({ 2: "found" }), values: a.slice(1).map((x, k) => (k === 2 ? x + 5 : x)) }],
      spans: fenRows(t, Object.fromEntries(touched.map((u) => [u, "found" as Mark]))),
      caption: `i = 16 is past the end: stop. Three bars changed: 3, 4 and 8, exactly the bars that cover position 3. Adding the low bit moves up one row each time, so an update is also O(log n).`,
      verdict: { ok: true, text: "updated in 3 steps" },
    });
    return steps;
  }
  const big = { s: 0 };
  prefix(6, big, "first 6: ");
  const small = { s: 0 };
  prefix(2, small, "first 2: ");
  steps.push({
    tracks: [arr(fill(range(2, 6), "found"))],
    spans: fenRows(t),
    caption: `The first 6 total ${big.s}, and the first 2 total ${small.s}. So positions 3 to 6 total ${big.s} − ${small.s} = ${big.s - small.s}. Two prefix sums: still O(log n).`,
    readout: `${big.s} − ${small.s} = ${big.s - small.s}`,
    verdict: { ok: true, text: `${big.s - small.s}` },
  });
  return steps;
}

/* RNGQ-4.1 and 5.1: the segment tree over A8 (sums). Node (lo, hi) covers cells lo..hi; the leaves are the array cells. */

type Seg = { lo: number; hi: number };
const LEVELS: Seg[][] = [
  [{ lo: 0, hi: 7 }],
  [
    { lo: 0, hi: 3 },
    { lo: 4, hi: 7 },
  ],
  [
    { lo: 0, hi: 1 },
    { lo: 2, hi: 3 },
    { lo: 4, hi: 5 },
    { lo: 6, hi: 7 },
  ],
];
const key = (s: Seg) => `${s.lo}-${s.hi}`;

function segRows(sum: Record<string, number>, marks: Record<string, Mark> = {}, tags: Record<string, string> = {}, upto = 2): SpanRow[] {
  return LEVELS.map((row, d) => ({
    bars: row.map((s) => ({
      l: s.lo,
      r: s.hi,
      label: d > upto ? "" : sum[key(s)],
      state: d > upto ? "todo" : marks[key(s)],
      tag: tags[key(s)],
    })),
  }));
}

function sums(a: number[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of LEVELS) for (const s of row) out[key(s)] = a.slice(s.lo, s.hi + 1).reduce((x, y) => x + y, 0);
  return out;
}

export function segSteps(v: "build" | "query" | "update"): RangeStep[] {
  const a = A8.slice();
  const steps: RangeStep[] = [];
  const S = sums(a);
  if (v === "build") {
    steps.push({
      tracks: [{ name: "a", values: a }],
      spans: segRows(S, {}, {}, -1),
      caption:
        "A segment tree for 8 values. The array cells are the leaves. Above them, every bar is a node that stores the sum of the cells under it, and its two children are the two bars directly below it, each covering half.",
    });
    for (let d = 2; d >= 0; d--) {
      const marks = Object.fromEntries(LEVELS[d].map((s) => [key(s), "cur" as Mark]));
      steps.push({
        tracks: [{ name: "a", values: a }],
        spans: segRows(S, marks, {}, 2).map((row, k) => (k < d ? { bars: row.bars.map((b) => ({ ...b, label: "", state: "todo" as Mark })) } : row)),
        caption:
          d === 2
            ? "Build from the bottom: each node on this level adds its two leaves. 5 + 2 = 7, 7 + 4 = 11, and so on."
            : d === 1
              ? "Next level up: each node adds its two children: 7 + 11 = 18 and 7 + 11 = 18."
              : "The root adds its two children: 36, the sum of everything. Every node was computed once from its children: O(n) to build, and 2n − 1 nodes in all.",
        readout: d === 0 ? "root = 36" : undefined,
        verdict: d === 0 ? { ok: true, text: "built" } : undefined,
      });
    }
    return steps;
  }
  if (v === "query") {
    const l = 2;
    const r = 6; // cells 2..6
    const marks: Record<string, Mark> = {};
    const cells: Record<number, CellState> = {};
    let total = 0;
    const win = { lo: l, hi: r, label: "a[2:7]" };
    steps.push({ tracks: [{ name: "a", values: a, window: win }], spans: segRows(S), caption: "The sum of `a[2:7]`, cells 2 to 6. Start at the root and go down only where the range cuts through a node." });
    const visit = (s: Seg) => {
      const k = key(s);
      const leaf = s.lo === s.hi;
      if (s.hi < l || s.lo > r) {
        if (leaf) cells[s.lo] = "out";
        else marks[k] = "out";
        steps.push({
          tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
          spans: segRows(S, marks),
          caption: leaf ? `Cell ${s.lo} is outside the range: skip it.` : `Node ${s.lo}–${s.hi} lies outside the range: skip it and everything below it.`,
          readout: `total: ${total}`,
        });
        return;
      }
      if (l <= s.lo && s.hi <= r) {
        total += leaf ? a[s.lo] : S[k];
        // the part being taken is current (heavy frame) for its own step, then joins the taken parts (double rule)
        if (leaf) cells[s.lo] = "mid";
        else marks[k] = "cur";
        steps.push({
          tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
          spans: segRows(S, marks),
          caption: leaf
            ? `Cell ${s.lo} is inside the range: add its value, ${a[s.lo]}.`
            : `Node ${s.lo}–${s.hi} lies completely inside the range: add its stored sum, ${S[k]}, and do not go below it.`,
          readout: `total: ${total}`,
        });
        if (leaf) cells[s.lo] = "found";
        else marks[k] = "found";
        return;
      }
      marks[k] = "cur";
      steps.push({
        tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
        spans: segRows(S, marks),
        caption: `Node ${s.lo}–${s.hi} is partly inside: look at its two children.`,
        readout: `total: ${total}`,
      });
      marks[k] = "done";
      const m = (s.lo + s.hi) >> 1;
      visit({ lo: s.lo, hi: m });
      visit({ lo: m + 1, hi: s.hi });
    };
    visit({ lo: 0, hi: 7 });
    steps.push({
      tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
      spans: segRows(S, marks),
      caption: `The sum is ${total}. On each level at most two nodes are partly inside (one at each end of the range), so a query visits O(log n) nodes.`,
      readout: `sum(a[2:7]) = ${total}`,
      verdict: { ok: true, text: `${total}` },
    });
    return steps;
  }
  // update: set a[5] = 9, then fix the sums on the path to the root
  const i = 5;
  const old = a[i];
  a[i] = 9;
  steps.push({
    tracks: [{ name: "a", values: a, states: states(8, { [i]: "mid" }) }],
    spans: segRows(S),
    caption: `Set \`a[${i}] = 9\` (it was ${old}). Only the nodes above cell ${i} include it: one per level.`,
    readout: `a[${i}]: ${old} → 9`,
  });
  const path = [LEVELS[2][2], LEVELS[1][1], LEVELS[0][0]];
  const marks: Record<string, Mark> = {};
  for (const s of path) {
    S[key(s)] += 9 - old;
    marks[key(s)] = "cur";
    steps.push({
      tracks: [{ name: "a", values: a, states: states(8, { [i]: "found" }) }],
      spans: segRows(S, marks),
      caption: `Node ${s.lo}–${s.hi}: recompute it from its two children (or add the change, ${9 - old}). Now ${S[key(s)]}.`,
      readout: `node ${s.lo}–${s.hi} = ${S[key(s)]}`,
    });
    marks[key(s)] = "done";
  }
  steps.push({
    tracks: [{ name: "a", values: a, states: states(8, { [i]: "found" }) }],
    spans: segRows(S, Object.fromEntries(path.map((s) => [key(s), "found" as Mark]))),
    caption: "Three nodes changed, one per level: an update is O(log n). In a list, node k has its children at 2k and 2k + 1, as in a heap, so no links are needed.",
    verdict: { ok: true, text: "updated" },
  });
  return steps;
}

/* RNGQ-5.1: lazy propagation. Add 3 to a[1:7], then ask for a[5:7]. */

export function lazySteps(v: "add" | "query"): RangeStep[] {
  const leaf = A8.slice(); // what the leaves store: stale under a pending tag
  const S = sums(leaf);
  const tag: Record<string, number> = {};
  const steps: RangeStep[] = [];
  const marks: Record<string, Mark> = {};
  const cells: Record<number, CellState> = {};
  const tags = () => Object.fromEntries(Object.entries(tag).filter(([, x]) => x).map(([k, x]) => [k, `+${x}`]));
  const snap = (caption: string, extra: Partial<RangeStep> = {}, win?: Win) =>
    steps.push({ tracks: [{ name: "a", values: leaf.slice(), states: states(8, cells), window: win }], spans: segRows(S, { ...marks }, tags()), caption, ...extra });
  const L = 1;
  const R = 6;
  const addWin = { lo: L, hi: R, label: "add 3 to a[1:7]" };
  const add = (s: Seg, quiet: boolean) => {
    const k = key(s);
    const isLeaf = s.lo === s.hi;
    if (s.hi < L || s.lo > R) {
      if (!quiet) {
        if (isLeaf) cells[s.lo] = "out";
        else marks[k] = "out";
        snap(isLeaf ? `Cell ${s.lo} is outside: leave it.` : `Node ${s.lo}–${s.hi} is outside: leave it.`, {}, addWin);
      }
      return;
    }
    if (L <= s.lo && s.hi <= R) {
      if (isLeaf) {
        leaf[s.lo] += 3;
        cells[s.lo] = quiet ? "found" : "mid";
      } else {
        S[k] += 3 * (s.hi - s.lo + 1);
        tag[k] = (tag[k] ?? 0) + 3;
        marks[k] = quiet ? "found" : "cur";
      }
      if (!quiet)
        snap(
          isLeaf
            ? `Cell ${s.lo} is inside: add 3 to it.`
            : `Node ${s.lo}–${s.hi} is completely inside. Add 3 for each of its ${s.hi - s.lo + 1} cells to its sum (now ${S[k]}), and leave a tag, +3, instead of visiting the cells below. The tag says “everything below still needs +3”.`,
          {},
          addWin,
        );
      if (isLeaf) cells[s.lo] = "found";
      else marks[k] = "found";
      return;
    }
    marks[k] = "cur";
    if (!quiet) snap(`Node ${s.lo}–${s.hi} is partly inside: go to its children.`, {}, addWin);
    delete marks[k]; // only the node being worked on has the heavy frame
    const m = (s.lo + s.hi) >> 1;
    add({ lo: s.lo, hi: m }, quiet);
    add({ lo: m + 1, hi: s.hi }, quiet);
    const kids = [{ lo: s.lo, hi: m }, { lo: m + 1, hi: s.hi }].map((c) => (c.lo === c.hi ? leaf[c.lo] : S[key(c)]));
    S[k] = kids[0] + kids[1];
    marks[k] = "cur";
    if (!quiet) snap(`Back at node ${s.lo}–${s.hi}: its sum is its children's sums added, ${kids[0]} + ${kids[1]} = ${S[k]}.`, {}, addWin);
    marks[k] = "done";
  };
  if (v === "add") {
    snap("A segment tree of sums, as in lesson 4. Add 3 to every value of `a[1:7]`: six cells. Changing every leaf would cost O(n).", {}, addWin);
    add({ lo: 0, hi: 7 }, false);
    snap(
      "Done: every sum on the way is correct. The cells under the tags still show their old values: 2–3 and 4–5 owe +3 to the cells below them. Only O(log n) nodes were touched.",
      { verdict: { ok: true, text: "added, lazily" } },
      addWin,
    );
    return steps;
  }
  add({ lo: 0, hi: 7 }, true);
  for (const k of Object.keys(marks)) delete marks[k];
  for (const k of Object.keys(cells)) delete cells[Number(k)];
  const qWin = { lo: 5, hi: 6, label: "a[5:7]" };
  snap(
    "After adding 3 to `a[1:7]`, two nodes carry a +3 tag and the cells below them are out of date. Now ask for the sum of `a[5:7]`.",
    {},
    qWin,
  );
  let total = 0;
  const push = (s: Seg) => {
    const k = key(s);
    const x = tag[k];
    if (!x) return;
    const m = (s.lo + s.hi) >> 1;
    for (const c of [
      { lo: s.lo, hi: m },
      { lo: m + 1, hi: s.hi },
    ]) {
      if (c.lo === c.hi) {
        leaf[c.lo] += x;
        cells[c.lo] = "mid";
      } else {
        S[key(c)] += x * (c.hi - c.lo + 1);
        tag[key(c)] = (tag[key(c)] ?? 0) + x;
      }
    }
    tag[k] = 0;
  };
  const query = (s: Seg) => {
    const k = key(s);
    const isLeaf = s.lo === s.hi;
    if (s.hi < 5 || s.lo > 6) {
      if (isLeaf) cells[s.lo] = "out";
      else marks[k] = "out";
      snap(isLeaf ? `Cell ${s.lo} is outside: skip it.` : `Node ${s.lo}–${s.hi} is outside: skip it.`, { readout: `total: ${total}` }, qWin);
      return;
    }
    if (5 <= s.lo && s.hi <= 6) {
      total += isLeaf ? leaf[s.lo] : S[k];
      if (isLeaf) cells[s.lo] = "mid";
      else marks[k] = "cur";
      snap(isLeaf ? `Cell ${s.lo} is inside: add ${leaf[s.lo]}.` : `Node ${s.lo}–${s.hi} is inside: add ${S[k]}.`, { readout: `total: ${total}` }, qWin);
      if (isLeaf) cells[s.lo] = "found";
      else marks[k] = "found";
      return;
    }
    marks[k] = "cur";
    if (tag[k]) {
      const x = tag[k];
      snap(`Node ${s.lo}–${s.hi} is partly inside, and it has a tag, +${x}. Before going below it, push the tag down.`, { readout: `total: ${total}` }, qWin);
      push(s);
      snap(
        `Pushed: the children get the +${x} (cells add it to their values; a node would add it to its sum and take the tag). The node's own tag is cleared. Now its children are correct.`,
        { readout: `total: ${total}` },
        qWin,
      );
    } else snap(`Node ${s.lo}–${s.hi} is partly inside: go to its children.`, { readout: `total: ${total}` }, qWin);
    marks[k] = "done";
    const m = (s.lo + s.hi) >> 1;
    query({ lo: s.lo, hi: m });
    query({ lo: m + 1, hi: s.hi });
  };
  query({ lo: 0, hi: 7 });
  snap(
    `The sum is ${total} (1 + 3 and 8 + 3). A tag is pushed down only when a later operation needs to go below it, one level at a time. So every add and every query stays O(log n).`,
    { readout: `sum(a[5:7]) = ${total}`, verdict: { ok: true, text: `${total}` } },
    qWin,
  );
  return steps;
}

/* RNGQ-6.1: square-root decomposition, blocks of 3 */

const BLOCK = 3;
const blocks = (a: number[]) => range(0, Math.ceil(a.length / BLOCK)).map((b) => ({ lo: b * BLOCK, hi: Math.min(a.length, (b + 1) * BLOCK) - 1 }));

function blockRow(a: number[], marks: Record<number, Mark> = {}): SpanRow[] {
  return [{ name: "sum", bars: blocks(a).map((b, k) => ({ l: b.lo, r: b.hi, label: a.slice(b.lo, b.hi + 1).reduce((x, y) => x + y, 0), state: marks[k] })) }];
}

export function sqrtSteps(v: "query" | "update"): RangeStep[] {
  const a = A8.slice();
  const steps: RangeStep[] = [];
  if (v === "query") {
    const win = { lo: 1, hi: 6, label: "a[1:7]" };
    steps.push({
      tracks: [{ name: "a", values: a, window: win }],
      spans: blockRow(a),
      caption: "Cut the list into blocks of about √n cells (the square root of n: √n × √n = n). Here n = 8, so blocks of 3. Keep the sum of each block. Ask for the sum of `a[1:7]`.",
    });
    let total = 0;
    const cells: Record<number, CellState> = {};
    const marks: Record<number, Mark> = {};
    total += a[1] + a[2];
    Object.assign(cells, { 1: "found", 2: "found" });
    steps.push({
      tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
      spans: blockRow(a, marks),
      caption: `Block 0 is only partly inside, so add its cells in the range one by one: ${a[1]} + ${a[2]}.`,
      readout: `total: ${total}`,
    });
    total += a[3] + a[4] + a[5];
    marks[1] = "found";
    steps.push({
      tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
      spans: blockRow(a, marks),
      caption: `Block 1 is completely inside: add its stored sum, ${a[3] + a[4] + a[5]}, without reading its cells.`,
      readout: `total: ${total}`,
    });
    total += a[6];
    cells[6] = "found";
    steps.push({
      tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
      spans: blockRow(a, marks),
      caption: `Block 2 is partly inside: add cell 6 by itself, ${a[6]}.`,
      readout: `total: ${total}`,
    });
    steps.push({
      tracks: [{ name: "a", values: a, window: win, states: states(8, cells) }],
      spans: blockRow(a, marks),
      caption: `The sum is ${total}. At most two partial blocks of fewer than √n cells each, and at most √n whole blocks: O(√n) per question.`,
      readout: `sum(a[1:7]) = ${total}`,
      verdict: { ok: true, text: `${total}` },
    });
    return steps;
  }
  steps.push({ tracks: [{ name: "a", values: a }], spans: blockRow(a), caption: "Set `a[4] = 9` (it was 6). Only one block contains cell 4." });
  a[4] = 9;
  steps.push({ tracks: [{ name: "a", values: a, states: states(8, { 4: "mid" }) }], spans: blockRow(a), caption: "Change the cell first: `a[4]` is now 9. It was 6, so it grew by 3. The only sum that changes is the sum of the block holding cell 4, block 1." });
  steps.push({
    tracks: [{ name: "a", values: a, states: states(8, { 4: "found" }) }],
    spans: blockRow(a, { 1: "found" }),
    caption: "Then add the same difference to block 1's stored sum: 11 + 3 = 14. An update is O(1) here. Other summaries (a minimum, a sorted copy of the block) cost O(√n) to rebuild.",
    verdict: { ok: true, text: "updated" },
  });
  return steps;
}
