// Step generators for the DVCQ figures. Every figure is a pure function of its step number.
// Recursion trees use the Tree stage; the master theorem's levels use the Timeline stage (one bar per piece of
// work); closest pair uses the Plane stage; median of medians uses the Grid. Captions use `backticks` for code.

import type { Pointer } from "../../_components/ArrayTrack";
import type { GCell, Mark, PBox, PLine, PPoint, PSeg, TBar, TMark, TNode, TRow } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type Win = { lo: number; hi: number; label: string; bad?: boolean };

/* DVCQ-1.1: the largest sum of a stretch, by divide and conquer */

export type SubVariant = "whole" | "cross";

export const SUB = [-2, 1, -3, 4, -1, 2, 1, -5];

export type SubStep = {
  nodes: TNode[];
  states: CellState[];
  window?: Win;
  pointers: Pointer[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

const rng = (lo: number, hi: number) => (lo === hi ? `${SUB[lo]}` : `${lo}–${hi}`);

/** The tree of parts: 0–7, 0–3, 4–7, 0–1, …, then the eight single values. */
function subTree(done: Record<string, number>, cur: string[], todo: boolean): TNode[] {
  const out: TNode[] = [];
  const add = (lo: number, hi: number, parent?: string) => {
    const id = `${lo}-${hi}`;
    const best = done[id];
    const label = lo === hi ? `${SUB[lo]}` : best === undefined ? rng(lo, hi) : `${rng(lo, hi)}: ${best}`;
    const state: TNode["state"] = cur.includes(id) ? "cur" : best !== undefined ? "done" : todo ? "todo" : "";
    out.push({ id, label, parent, state });
    if (lo < hi) {
      const mid = (lo + hi) >> 1;
      add(lo, mid, id);
      add(mid + 1, hi, id);
    }
  };
  add(0, 7);
  return out;
}

function cells(n: number, marks: Record<number, CellState>): CellState[] {
  return Array.from({ length: n }, (_, k) => marks[k] ?? "");
}

function span(lo: number, hi: number, s: CellState): Record<number, CellState> {
  const m: Record<number, CellState> = {};
  for (let k = lo; k <= hi; k++) m[k] = s;
  return m;
}

export function subSteps(v: SubVariant): SubStep[] {
  return v === "whole" ? subWhole() : subCross();
}

function subWhole(): SubStep[] {
  const steps: SubStep[] = [];
  const done: Record<string, number> = {};
  for (let k = 0; k < 8; k++) done[`${k}-${k}`] = SUB[k];
  const push = (cur: string[], s: Omit<SubStep, "nodes" | "pointers">) => steps.push({ nodes: subTree({ ...done }, cur, true), pointers: [], ...s });

  push([], {
    states: cells(8, {}),
    caption:
      "Find the stretch of neighbouring values with the largest sum. Divide: split the list in half, and in half again, down to single values. The tree shows every part. A single value is its own best stretch.",
    readout: "best stretch: not known yet",
  });
  push(["0-7"], {
    states: cells(8, {}),
    window: { lo: 0, hi: 7, label: "the whole list" },
    caption:
      "The best stretch of the whole list lies in the left half, or in the right half, or it crosses the middle. Solve each half the same way (conquer), then check the stretches that cross the middle (combine).",
  });

  type Part = { lo: number; hi: number; cross: [number, number, number] };
  const pair = (p: Part, left: number, right: number) => {
    const id = `${p.lo}-${p.hi}`;
    const best = Math.max(left, right, p.cross[2]);
    done[id] = best;
    push([id], {
      states: cells(8, span(p.lo, p.hi, "mid")),
      window: { lo: p.lo, hi: p.hi, label: `part ${p.lo}–${p.hi}` },
      caption: `Part ${p.lo}–${p.hi}: the left value alone is ${left}, the right value alone is ${right}, and both together make ${p.cross[2]}. The best is ${best}.`,
      readout: `max(${left}, ${right}, ${p.cross[2]}) = ${best}`,
    });
  };
  const join = (p: Part, left: number, right: number) => {
    const id = `${p.lo}-${p.hi}`;
    const mid = (p.lo + p.hi) >> 1;
    const [a, b, c] = p.cross;
    push([id], {
      states: cells(8, span(a, b, "mid")),
      window: { lo: p.lo, hi: p.hi, label: `part ${p.lo}–${p.hi}` },
      caption: `Part ${p.lo}–${p.hi}: its halves are solved (best ${left} on the left, ${right} on the right). Now the stretches that cross the middle, between positions ${mid} and ${mid + 1}: the best one is positions ${a} to ${b}, with sum ${c}.`,
      readout: `crossing the middle: ${c}`,
    });
    const best = Math.max(left, right, c);
    done[id] = best;
    push([id], {
      states: cells(8, best === c ? span(a, b, "mid") : {}),
      window: { lo: p.lo, hi: p.hi, label: `part ${p.lo}–${p.hi}` },
      caption: `The best of the three answers is ${best}, so part ${p.lo}–${p.hi} reports ${best} to its parent.`,
      readout: `max(${left}, ${right}, ${c}) = ${best}`,
    });
  };

  pair({ lo: 0, hi: 1, cross: [0, 1, -1] }, -2, 1);
  pair({ lo: 2, hi: 3, cross: [2, 3, 1] }, -3, 4);
  join({ lo: 0, hi: 3, cross: [1, 3, 2] }, 1, 4);
  pair({ lo: 4, hi: 5, cross: [4, 5, 1] }, -1, 2);
  pair({ lo: 6, hi: 7, cross: [6, 7, -4] }, 1, -5);
  join({ lo: 4, hi: 7, cross: [5, 6, 3] }, 2, 1);

  push(["0-7"], {
    states: cells(8, span(3, 6, "mid")),
    window: { lo: 0, hi: 7, label: "the whole list" },
    caption:
      "The whole list: best 4 on the left and 3 on the right. The best stretch that crosses the middle is positions 3 to 6, with sum 6. The variant “Crossing the middle” shows how it is found in one pass.",
    readout: "crossing the middle: 6",
  });
  done["0-7"] = 6;
  steps.push({
    nodes: subTree({ ...done }, [], true).map((n) => (n.id === "0-7" ? { ...n, state: "found" } : n)),
    pointers: [],
    states: cells(8, span(3, 6, "found")),
    caption:
      "The answer is 6: positions 3 to 6 (4, −1, 2, 1). Each level of the tree does O(n) work in all, and there are about log₂ n levels, so the method costs O(n log n).",
    readout: "max(4, 3, 6) = 6",
    verdict: { ok: true, text: "best sum 6" },
  });
  return steps;
}

function subCross(): SubStep[] {
  const steps: SubStep[] = [];
  steps.push({
    nodes: subTree({}, ["0-7"], true),
    states: cells(8, {}),
    window: { lo: 0, hi: 7, label: "the whole list" },
    pointers: [],
    caption:
      "The combine step of the whole list. A stretch that crosses the middle must use position 3 (the last of the left half) and position 4 (the first of the right half). So it is a best stretch that ends at 3, joined to a best stretch that starts at 4.",
    readout: "left half 0–3, right half 4–7",
  });
  let sum = 0;
  let best = -Infinity;
  let bestAt = 3;
  for (let i = 3; i >= 0; i--) {
    sum += SUB[i];
    const better = sum > best;
    if (better) {
      best = sum;
      bestAt = i;
    }
    steps.push({
      // one heavy frame: the position just added; the positions summed before it are pale, the root plain
      nodes: subTree({}, [], true),
      states: cells(8, { ...span(i + 1, 3, "path"), [i]: "mid" }),
      window: { lo: i, hi: 3, label: `sum ${sum}` },
      pointers: [{ name: "i", at: i, kind: "mid" }],
      caption:
        i === 3
          ? `Walk left from position 3, adding as you go. Positions 3 to 3 add up to ${sum}. This is the best so far.`
          : `Add position ${i} (${SUB[i]}): positions ${i} to 3 add up to ${sum}. ${better ? "That is the new best." : `The best is still ${best}, from position ${bestAt}.`}`,
      readout: `left: sum ${sum}, best ${best}`,
    });
  }
  const leftBest = best;
  const leftAt = bestAt;
  sum = 0;
  best = -Infinity;
  bestAt = 4;
  for (let j = 4; j <= 7; j++) {
    sum += SUB[j];
    const better = sum > best;
    if (better) {
      best = sum;
      bestAt = j;
    }
    steps.push({
      nodes: subTree({}, [], true),
      states: cells(8, { ...span(leftAt, 3, "found"), ...span(4, j - 1, "path"), [j]: "mid" }),
      window: { lo: 4, hi: j, label: `sum ${sum}` },
      pointers: [{ name: "j", at: j, kind: "mid" }],
      caption:
        j === 4
          ? `The best stretch ending at 3 is positions ${leftAt} to 3, sum ${leftBest}. Now walk right from position 4: it alone is ${sum}.`
          : `Add position ${j} (${SUB[j]}): positions 4 to ${j} add up to ${sum}. ${better ? "That is the new best." : `The best is still ${best}, up to position ${bestAt}.`}`,
      readout: `right: sum ${sum}, best ${best}`,
    });
  }
  steps.push({
    nodes: subTree({}, ["0-7"], true),
    states: cells(8, span(leftAt, bestAt, "found")),
    pointers: [],
    caption: `Join the two: positions ${leftAt} to ${bestAt}, sum ${leftBest} + ${best} = ${leftBest + best}. Each position was added once, so the combine step costs O(n). That is why the whole method is O(n log n).`,
    readout: `${leftBest} + ${best} = ${leftBest + best}`,
    verdict: { ok: true, text: `crossing best ${leftBest + best}` },
  });
  return steps;
}

/* DVCQ-2.1: where the work of a recursion goes, level by level, for recurrences the basic theorem does not cover */

export type LevelVariant = "mom" | "third" | "log";

export type LevelStep = { rows: TRow[]; marks: TMark[]; caption: string; readout?: string; verdict?: Verdict };

const one = (x: number) => String(Math.round(x * 10) / 10);

export const levelTo = (v: LevelVariant) => (v === "mom" ? 10 : v === "third" ? 9 : 24);

/** Pieces of each level for T(n) = T(n·f1) + T(n·f2) + n; a piece of size 1 or less has no children. */
function splitLevels(n: number, f: number[], levels: number): number[][] {
  const out: number[][] = [[n]];
  for (let k = 1; k < levels; k++) {
    const next: number[] = [];
    for (const size of out[k - 1]) if (size > 1) for (const x of f) next.push(size * x);
    out.push(next);
  }
  return out;
}

export function levelSteps(v: LevelVariant): LevelStep[] {
  const steps: LevelStep[] = [];
  const rows: TRow[] = [];
  const copy = () => rows.map((r) => ({ ...r, bars: r.bars.map((x) => ({ ...x })) }));
  if (v === "log") {
    // T(n) = 2 T(n/2) + n log2 n, n = 8: a piece of size s does s × log2 s work
    const marks: TMark[] = [];
    const sums: number[] = [];
    for (let k = 0, size = 8, pieces = 1; size >= 2; k++, size /= 2, pieces *= 2) {
      const w = size * Math.log2(size);
      // levels already shown are ink; the new level is plain (no row of heavy frames)
      for (const r of rows) for (const bar of r.bars) bar.state = "done";
      rows.push({ name: String(k), bars: Array.from({ length: pieces }, (_, p) => ({ id: `${k}-${p}`, from: p * w, to: (p + 1) * w, label: `${size}×${Math.log2(size)}`, state: "" as Mark })) });
      sums.push(pieces * w);
      steps.push({
        rows: copy(),
        marks,
        caption:
          k === 0
            ? "T(n) = 2 T(n/2) + n log₂ n, with n = 8. Each bar is one call, and its length is the work it does outside its recursive calls: a piece of size s does s × log₂ s. The top call does 8 × 3 = 24."
            : `Level ${k}: ${pieces} pieces of size ${size}, each doing ${size} × ${Math.log2(size)} = ${w}. In all ${pieces * w}: the levels shrink, but only a little each time.`,
        readout: `level ${k}: ${pieces} × ${w} = ${pieces * w}`,
      });
    }
    for (const r of rows) for (const bar of r.bars) bar.state = "done";
    steps.push({
      rows: copy(),
      marks,
      caption:
        "Pieces of size 1 do no work, because log₂ 1 = 0. Level k does n × (log₂ n − k), so the total is n × (log₂ n + (log₂ n − 1) + … + 1), about n (log₂ n)² / 2. Every level is nearly as big as the top one, so this is Θ(n log² n), one log more than the work at the top.",
      readout: `total ${sums.join(" + ")} = ${sums.reduce((x, y) => x + y, 0)}`,
      verdict: { ok: true, info: true, text: "Θ(n log² n)" },
    });
    return steps;
  }
  const mom = v === "mom";
  const n = mom ? 10 : 9;
  const f = mom ? [0.2, 0.7] : [1 / 3, 2 / 3];
  const levels = splitLevels(n, f, 4);
  const marks: TMark[] = [{ at: n, label: "n", kind: "dash" }];
  const sums: number[] = [];
  const shown = mom ? 3 : 4;
  for (let k = 0; k < shown; k++) {
    let at = 0;
    for (const r of rows) for (const bar of r.bars) bar.state = "done";
    rows.push({
      name: String(k),
      bars: levels[k].map((size, p) => {
        const bar: TBar = { id: `${k}-${p}`, from: at, to: at + size, label: size >= 0.95 ? one(size) : "", state: "" };
        at += size;
        return bar;
      }),
    });
    const sum = levels[k].reduce((x, y) => x + y, 0);
    sums.push(sum);
    steps.push({
      rows: copy(),
      marks,
      caption:
        k === 0
          ? mom
            ? "T(n) = T(n/5) + T(7n/10) + n, with n = 10. This is median of medians (lesson 6): two calls of different sizes. Each bar is one call; its length is its size, which is also the work it does outside its calls."
            : "T(n) = T(n/3) + T(2n/3) + n, with n = 9: a split into one third and two thirds, as quicksort gets with a fairly good pivot. Each bar is one call, and its length is the work it does outside its calls."
          : mom
            ? `Level ${k}: the pieces add up to ${one(sum)}, which is 9/10 of the level above. The two parts together are smaller than the whole, because 1/5 + 7/10 = 9/10.`
            : k < 3
              ? `Level ${k}: the pieces add up to ${one(sum)} = n again, because 1/3 + 2/3 = 1.`
              : `Level ${k} has no bar for the piece of size 1: it is a base case and stops. So this level adds up to ${one(sum)}, a little less than n. The long branch, which keeps two thirds each time, goes on for more levels.`,
      readout: `level ${k}: ${one(sum)}`,
    });
  }
  for (const r of rows) for (const bar of r.bars) bar.state = "done";
  steps.push({
    rows: copy(),
    marks,
    caption: mom
      ? "Each level is 9/10 of the one above: 10 + 9 + 8.1 + … adds up to less than 10 × 10 = 100, whatever the number of levels. So the top level decides, and T(n) = O(n), with a large constant (10). This is why median of medians is linear."
      : "Every full level adds up to n. The shortest branch (one third each time) has log₃ n levels and the longest (two thirds each time) has log₁.₅ n, so the tree has between about 0.63 log₂ n and 1.71 log₂ n levels, each costing at most n. T(n) = Θ(n log n).",
    readout: `levels: ${sums.map(one).join(", ")}`,
    verdict: { ok: true, info: true, text: mom ? "O(n)" : "Θ(n log n)" },
  });
  return steps;
}

/* DVCQ-3.1: counting inversions while merge sort runs */

export type InvVariant = "merge" | "tree";

export const INV_LEFT = [2, 5, 7, 8];
export const INV_RIGHT = [1, 3, 4, 6];
export const INV_LIST = [5, 2, 8, 7, 1, 6, 3, 4];

export type MergeStep = {
  out: (number | string)[];
  counts: (number | string)[];
  leftStates: CellState[];
  rightStates: CellState[];
  outStates: CellState[];
  countStates: CellState[];
  rightWin?: Win;
  i: number | null;
  j: number | null;
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export type InvTreeStep = { nodes: TNode[]; caption: string; readout?: string; verdict?: Verdict };

/** One merge, counting for each left value how many smaller values come after it (they are in the right half). */
export function mergeSteps(): MergeStep[] {
  const L = INV_LEFT;
  const R = INV_RIGHT;
  const out: (number | string)[] = Array(8).fill("");
  const counts = L.map(() => 0);
  const steps: MergeStep[] = [];
  let i = 0;
  let j = 0;
  let k = 0;
  const total = () => counts.reduce((x, y) => x + y, 0);
  const snap = (mark: { left?: number; right?: number; count?: number; out?: number }): Omit<MergeStep, "caption"> => ({
    out: [...out],
    counts: [...counts],
    leftStates: L.map((_, x) => (x === mark.left ? "mid" : x < i ? "out" : "")),
    rightStates: R.map((_, x) => (x === mark.right ? "mid" : x < j ? "out" : "")),
    outStates: out.map((_, x) => (x === mark.out ? "mid" : "")) as CellState[],
    countStates: counts.map((_, x) => (x === mark.count ? "mid" : "")) as CellState[],
    i: i < L.length ? i : null,
    j: j < R.length ? j : null,
    readout: `inversions so far: ${total()}`,
  });
  steps.push({
    ...snap({}),
    caption:
      "Both halves are sorted, and every pair inside one half is already counted. A value in the left half came before every value in the right half in the list. So for a left value, the smaller values after it in this part are exactly the right values smaller than it. The bottom row collects that count for each left value.",
  });
  while (i < L.length || j < R.length) {
    if (j >= R.length || (i < L.length && L[i] <= R[j])) {
      const v = L[i];
      out[k] = v;
      counts[i] += j;
      const s = snap({ left: i, count: i, out: k });
      steps.push({
        ...s,
        rightWin: j > 0 ? { lo: 0, hi: j - 1, label: `${j} smaller` } : undefined,
        caption:
          j < R.length
            ? `${v} ≤ ${R[j]}: take ${v} from the left. The ${j === 1 ? "right value already taken is" : `${j} right values already taken are`} smaller than ${v} and came after it, so ${v} gets +${j}.`
            : `The right half is used up, so all ${j} right values are smaller than ${v}: it gets +${j}.`,
      });
      i++;
    } else {
      const v = R[j];
      out[k] = v;
      const s = snap({ right: j, out: k });
      steps.push({
        ...s,
        caption: `${L[i]} > ${v}: take ${v} from the right. It is smaller than ${L[i]} and every left value after it; each of them will count it when it is taken.`,
      });
      j++;
    }
    k++;
  }
  steps.push({
    out: [...out],
    counts: [...counts],
    leftStates: L.map(() => "out"),
    rightStates: R.map(() => "out"),
    outStates: out.map(() => "found"),
    countStates: counts.map(() => "found"),
    i: null,
    j: null,
    caption: `Done: ${counts.join(" + ")} = ${total()} inversions between the halves. Adding the count when a right value is taken (SORT-2: “the left values still waiting”) gives the same total; adding it when a left value is taken also gives each value its own count, which practice problem 3 needs.`,
    readout: `inversions between the halves: ${total()}`,
    verdict: { ok: true, text: `${total()} between the halves` },
  });
  return steps;
}

export function invTreeSteps(): InvTreeStep[] {
  // Parts of INV_LIST, from the whole list down to single values.
  type Part = { id: string; lo: number; hi: number; parent?: string };
  const parts: Part[] = [];
  const add = (lo: number, hi: number, parent?: string) => {
    const id = `${lo}-${hi}`;
    parts.push({ id, lo, hi, parent });
    if (lo < hi) {
      const mid = (lo + hi) >> 1;
      add(lo, mid, id);
      add(mid + 1, hi, id);
    }
  };
  add(0, 7);
  const sortedOf = (p: Part) => INV_LIST.slice(p.lo, p.hi + 1).sort((x, y) => x - y);
  const crossOf = (p: Part) => {
    const mid = (p.lo + p.hi) >> 1;
    let c = 0;
    for (let x = p.lo; x <= mid; x++) for (let y = mid + 1; y <= p.hi; y++) if (INV_LIST[x] > INV_LIST[y]) c++;
    return c;
  };
  const merged: Record<string, number> = {};
  for (let k = 0; k < 8; k++) merged[`${k}-${k}`] = 0;
  const nodes = (cur: string | null): TNode[] =>
    parts.map((p) => {
      const isDone = p.id in merged;
      const vals = isDone ? sortedOf(p) : INV_LIST.slice(p.lo, p.hi + 1);
      const leaf = p.lo === p.hi;
      return {
        id: p.id,
        parent: p.parent,
        label: vals.join(" "),
        state: p.id === cur ? "cur" : isDone ? (leaf ? "" : "done") : "todo",
        tag: !leaf && isDone ? `+${merged[p.id]}` : undefined,
        tagKind: "plain",
      };
    });
  let total = 0;
  const steps: InvTreeStep[] = [];
  steps.push({
    nodes: nodes(null),
    caption:
      "The whole method on 8 values. An inversion is a pair of positions where the bigger value comes first. Split in half down to single values; a single value has no inversions. Then merge back up, counting at each merge.",
    readout: "total so far: 0",
  });
  const order = ["0-1", "2-3", "0-3", "4-5", "6-7", "4-7", "0-7"];
  for (const id of order) {
    const p = parts.find((q) => q.id === id)!;
    const c = crossOf(p);
    merged[id] = c;
    total += c;
    const mid = (p.lo + p.hi) >> 1;
    const lv = sortedOf({ ...p, hi: mid });
    const rv = sortedOf({ ...p, lo: mid + 1 });
    steps.push({
      nodes: nodes(id),
      caption: `Merge ${lv.join(" ")} with ${rv.join(" ")}: ${c === 0 ? "no left value is bigger than a right value, so this adds 0" : `this finds ${c} pair${c === 1 ? "" : "s"} with the bigger value on the left`}. The tag shows what this merge added.`,
      readout: `total so far: ${total}`,
    });
  }
  steps.push({
    nodes: nodes(null).map((n) => (n.id === "0-7" ? { ...n, state: "found" } : n)),
    caption: `Every inversion is counted exactly once: at the merge where its two values first end up in different halves. 1 + 1 + 0 + 0 + 0 + 2 + 12 = ${total}. Merge sort's cost, O(n log n), is unchanged.`,
    readout: `total ${total}`,
    verdict: { ok: true, text: `${total} inversions` },
  });
  return steps;
}

/* DVCQ-4.1: closest pair of points */

export type PairVariant = "dc" | "box";

export type PlaneStep = {
  points: PPoint[];
  segs: PSeg[];
  lines: PLine[];
  boxes: PBox[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export const PTS: [string, number, number][] = [
  ["A", 1, 7],
  ["B", 2, 2],
  ["C", 3, 9],
  ["D", 4, 5],
  ["E", 6, 8],
  ["F", 7, 3],
  ["G", 8, 4],
  ["H", 10, 8],
  ["I", 12, 2],
  ["J", 13, 6],
  ["K", 15, 9],
  ["L", 14, 3],
];

const rt = (d2: number) => (Number.isInteger(Math.sqrt(d2)) ? String(Math.sqrt(d2)) : `√${d2}`);

export function pairSteps(v: PairVariant): PlaneStep[] {
  return v === "dc" ? pairDc() : pairBox();
}

function pairDc(): PlaneStep[] {
  const steps: PlaneStep[] = [];
  const mid = 7.5;
  const delta = Math.sqrt(5);
  const pts = (st: Record<string, Mark> = {}, dflt: Mark = ""): PPoint[] =>
    PTS.map(([id, x, y]) => ({ id, x, y, state: st[id] ?? dflt, lp: id === "K" ? "l" : id === "G" ? "b" : id === "F" ? "l" : undefined }));
  const divider: PLine = { x: mid, label: "x = 7.5" };
  const strip: PBox[] = [{ x1: mid - delta, y1: 0, x2: mid + delta, y2: 10, kind: "strip" }];
  const edges: PLine[] = [
    { x: mid - delta, kind: "dash", label: "−δ" },
    { x: mid + delta, kind: "dash", label: "+δ" },
  ];

  steps.push({
    points: pts(),
    segs: [],
    lines: [],
    boxes: [],
    caption:
      "Twelve points. Find the two that are closest together. Checking every pair takes 12 × 11 / 2 = 66 distances; for n points, n(n − 1) / 2, which is O(n²). Divide and conquer does it in O(n log n).",
    readout: "12 points",
  });
  steps.push({
    points: pts(),
    segs: [],
    lines: [divider],
    boxes: [],
    caption:
      "Sort the points by x once, at the start. Draw a vertical line that splits them into two halves of 6: A to F on the left, G to L on the right.",
    readout: "left: A–F, right: G–L",
  });
  steps.push({
    points: pts({ A: "found", C: "found", G: "out", H: "out", I: "out", J: "out", K: "out", L: "out" }),
    segs: [{ a: "A", b: "C", state: "found", label: "√8" }],
    lines: [divider],
    boxes: [{ x1: mid, y1: 0, x2: 16, y2: 10, kind: "shade" }],
    caption:
      "Solve the left half with the same method (it splits again, down to two or three points). Its closest pair is A and C: the distance is √8 ≈ 2.83, because the differences are 2 across and 2 up, and 2² + 2² = 8.",
    readout: "left best: A–C, √8 ≈ 2.83",
  });
  steps.push({
    points: pts({ I: "found", L: "found", A: "out", B: "out", C: "out", D: "out", E: "out", F: "out" }),
    segs: [{ a: "I", b: "L", state: "found", label: "√5" }],
    lines: [divider],
    boxes: [{ x1: 0, y1: 0, x2: mid, y2: 10, kind: "shade" }],
    caption: "Solve the right half the same way. Its closest pair is I and L: 2 across and 1 up, so the distance is √5 ≈ 2.24.",
    readout: "right best: I–L, √5 ≈ 2.24",
  });
  steps.push({
    points: pts({ I: "found", L: "found" }),
    segs: [
      { a: "I", b: "L", state: "found", label: "√5" },
      { a: "A", b: "C", state: "old", label: "√8" },
    ],
    lines: [divider],
    boxes: [],
    caption:
      "Call the smaller of the two answers δ (the Greek letter delta): here δ = √5 ≈ 2.24. The only pairs not checked yet have one point on each side of the line. Any such pair closer than δ is what we still need to look for.",
    readout: "δ = √5 ≈ 2.24",
  });
  steps.push({
    points: pts({ I: "found", L: "found", E: "cur", F: "cur", G: "cur", A: "out", B: "out", C: "out", D: "out", H: "out", J: "out", K: "out" }),
    segs: [{ a: "I", b: "L", state: "found", label: "√5" }],
    lines: [divider, ...edges],
    boxes: strip,
    caption:
      "A point further than δ from the line is further than δ from every point on the other side. So only points within δ of the line matter: the strip, 2δ wide. Here only E, F and G are in it.",
    readout: "in the strip: E, F, G",
  });
  steps.push({
    points: pts({ I: "found", L: "found", E: "cur", F: "cur", G: "cur", A: "out", B: "out", C: "out", D: "out", H: "out", J: "out", K: "out" }),
    segs: [
      { a: "I", b: "L", state: "old", label: "√5" },
      { a: "F", b: "G", state: "cur", label: "√2" },
    ],
    lines: [divider, ...edges],
    boxes: strip,
    caption:
      "List the strip's points from bottom to top (by y): F, G, E. Compare each point with the next few above it. F and G: 1 across and 1 up, distance √2 ≈ 1.41. That beats δ.",
    readout: "F–G: √2 ≈ 1.41 < √5",
  });
  steps.push({
    points: pts({ F: "found", G: "found", E: "cur", A: "out", B: "out", C: "out", D: "out", H: "out", J: "out", K: "out", I: "out", L: "out" }),
    segs: [{ a: "F", b: "G", state: "found", label: "√2" }],
    lines: [divider, ...edges],
    boxes: strip,
    caption:
      "F and E: E is 5 higher than F, so it is at least 5 away; stop looking above F. G and E: 4 higher, stop. In a strip sorted by y, each point needs at most 7 comparisons (the variant “Why few checks” shows why).",
    readout: "best: F–G, √2",
  });
  steps.push({
    points: pts({ F: "found", G: "found" }),
    segs: [{ a: "F", b: "G", state: "found", label: "√2" }],
    lines: [divider],
    boxes: [],
    caption:
      "The closest pair is F and G, one on each side of the line. Each level of the recursion does O(n) work on the strip, so T(n) = 2 T(n/2) + O(n) = O(n log n), as for merge sort.",
    readout: "F(7, 3) and G(8, 4): √2 ≈ 1.41",
    verdict: { ok: true, text: "closest pair F–G" },
  });
  return steps;
}

const BOX_PTS: [string, number, number][] = [
  ["P", 7, 1],
  ["Q", 5, 5],
  ["R", 9, 1],
  ["S", 11, 5],
  ["T", 2, 8],
  ["U", 14, 8],
];

function pairBox(): PlaneStep[] {
  const steps: PlaneStep[] = [];
  const mid = 8;
  const d = 4;
  const pts = (st: Record<string, Mark> = {}, extra: PPoint[] = []): PPoint[] => [
    // P and R sit on the box's bottom edge and Q and S on its top edge: their labels go outside the box
    ...BOX_PTS.map(([id, x, y]) => ({ id, x, y, state: st[id] ?? "", lp: id === "P" || id === "R" ? ("b" as const) : id === "Q" || id === "S" ? ("t" as const) : undefined })),
    ...extra,
  ];
  const lines: PLine[] = [
    { x: mid, label: "x = 8" },
    { x: mid - d, kind: "dash", label: "−δ" },
    { x: mid + d, kind: "dash", label: "+δ" },
  ];
  const strip: PBox = { x1: mid - d, y1: 0, x2: mid + d, y2: 10, kind: "strip" };
  steps.push({
    points: pts({ T: "out", U: "out" }),
    segs: [],
    lines,
    boxes: [strip],
    caption:
      "Why does each point in the strip need only a few comparisons? Here δ = 4: any two points on the same side of the line are at least 4 apart, because each half was already solved. T and U are outside the strip.",
    readout: "δ = 4",
  });
  steps.push({
    points: pts({ P: "cur", T: "out", U: "out" }),
    segs: [],
    lines,
    boxes: [strip, { x1: mid - d, y1: 1, x2: mid + d, y2: 1 + d, label: "δ × 2δ" }],
    caption:
      "Take P, the lowest point in the strip that is still to be compared. A partner closer than δ must be less than δ higher than P. So it lies in this box: δ tall and 2δ wide.",
    readout: "box: 4 tall, 8 wide",
  });
  steps.push({
    points: pts({ P: "cur", T: "out", U: "out" }),
    segs: [],
    lines,
    boxes: [strip, { x1: mid - d, y1: 1, x2: mid + d, y2: 1 + d, nx: 4, ny: 2, label: "8 squares" }],
    caption:
      "Cut the box into 8 squares, each δ/2 on a side. The longest distance inside one square is its diagonal, δ/2 × √2 ≈ 0.71 δ, which is less than δ.",
    readout: "each square: 2 by 2",
  });
  steps.push({
    points: pts({ P: "cur", T: "out", U: "out" }, [{ id: "X", x: 6, y: 2, state: "bad", lp: "l" }]),
    segs: [{ a: "P", b: "X", state: "bad" }],
    lines,
    boxes: [strip, { x1: mid - d, y1: 1, x2: mid + d, y2: 1 + d, nx: 4, ny: 2 }],
    caption:
      "Could a square hold two points? Then they would be on the same side and closer than δ, like P and this X. But the points on one side are at least δ apart. So each square holds at most one point.",
    readout: "P–X: √2 ≈ 1.41 < δ · two points in one square: impossible",
    verdict: { ok: false, text: "breaks the rule: same side, closer than δ" },
  });
  steps.push({
    points: pts({ P: "cur", Q: "found", R: "found", S: "found", T: "out", U: "out" }),
    segs: [],
    lines,
    boxes: [strip, { x1: mid - d, y1: 1, x2: mid + d, y2: 1 + d, nx: 4, ny: 2 }],
    caption:
      "So the box holds at most 8 points, one of them P itself. In the strip sorted by y, any partner of P closer than δ is among the next 7 points. Here only Q, R and S are in the box.",
    readout: "at most 7 points to check after P",
    verdict: { ok: true, text: "at most 7 comparisons per point" },
  });
  return steps;
}

/* DVCQ-5.1: Karatsuba multiplication as a recursion tree */

export type KaraVariant = "three" | "four";

export type KaraStep = { nodes: TNode[]; caption: string; readout?: string; verdict?: Verdict };

type KNode = { id: string; parent?: string; a: number; b: number; kids: KNode[] };

function kTree(three: boolean): KNode {
  const make = (id: string, a: number, b: number, parent: string | undefined, depth: number): KNode => {
    const node: KNode = { id, parent, a, b, kids: [] };
    if (depth < 2) {
      const h = depth === 0 ? 100 : 10;
      const a1 = Math.floor(a / h);
      const a0 = a % h;
      const b1 = Math.floor(b / h);
      const b0 = b % h;
      const pairs: [number, number][] = three
        ? [
            [a1, b1],
            [a0, b0],
            [a1 + a0, b1 + b0],
          ]
        : [
            [a1, b1],
            [a1, b0],
            [a0, b1],
            [a0, b0],
          ];
      node.kids = pairs.map(([x, y], k) => make(`${id}.${k}`, x, y, id, depth + 1));
    }
    return node;
  };
  return make("r", 1321, 2213, undefined, 0);
}

export function karaSteps(v: KaraVariant): KaraStep[] {
  const three = v === "three";
  const root = kTree(three);
  const all: KNode[] = [];
  const walk = (n: KNode) => {
    all.push(n);
    n.kids.forEach(walk);
  };
  walk(root);
  const shown = new Set<string>(["r"]);
  const solved = new Set<string>();
  const nodes = (cur: string[], found = false): TNode[] =>
    all.map((n) => {
      const leaf = n.kids.length === 0;
      const isSolved = solved.has(n.id);
      return {
        id: n.id,
        parent: n.parent,
        label: !leaf && isSolved ? `${n.a} × ${n.b} = ${n.a * n.b}` : leaf && !three ? `${n.a}×${n.b}` : `${n.a} × ${n.b}`,
        note: leaf && isSolved ? String(n.a * n.b) : undefined,
        state: !shown.has(n.id)
          ? "hidden"
          : found && n.id === "r"
            ? "found"
            : cur.includes(n.id)
              ? "cur"
              : isSolved
                ? "done"
                : n.kids.some((k) => shown.has(k.id))
                  ? ""
                  : "todo",
      };
    });
  const steps: KaraStep[] = [];
  steps.push({
    nodes: nodes(["r"]),
    caption: three
      ? "Multiply 1321 × 2213. Split each number into a high half and a low half: 1321 = 13 × 100 + 21, and 2213 = 22 × 100 + 13. Call the halves a = 13, b = 21, c = 22, d = 13."
      : "Multiply 1321 × 2213 by splitting each number in half: 1321 = 13 × 100 + 21 and 2213 = 22 × 100 + 13. Then (13 × 100 + 21)(22 × 100 + 13) needs four products of halves.",
    readout: three ? "a = 13, b = 21, c = 22, d = 13" : "13·100 + 21 and 22·100 + 13",
  });
  for (const k of root.kids) shown.add(k.id);
  steps.push({
    nodes: nodes(["r"]),
    caption: three
      ? "Karatsuba needs only three products: a × c = 13 × 22, b × d = 21 × 13, and (a + b) × (c + d) = 34 × 35. The fourth product is not needed: the middle part a × d + b × c equals (a + b)(c + d) − a × c − b × d."
      : "The four products: 13 × 22 (high × high), 13 × 13 and 21 × 22 (the two middle products), and 21 × 13 (low × low). Each is a multiplication of 2-digit numbers, so split each of them again.",
    readout: three ? "3 products of 2 digits" : "4 products of 2 digits",
  });
  for (const k of root.kids) {
    for (const g of k.kids) shown.add(g.id);
    for (const g of k.kids) solved.add(g.id);
    solved.add(k.id);
    const [p, q, r] = k.kids.map((g) => g.a * g.b);
    const hi = Math.floor(k.a / 10);
    const lo = k.a % 10;
    const hi2 = Math.floor(k.b / 10);
    const lo2 = k.b % 10;
    steps.push({
      // the product being finished is the one heavy frame; its digit products are done, with notes
      nodes: nodes([k.id]),
      caption: three
        ? `${k.a} × ${k.b}: the same three products on single digits. ${hi} × ${hi2} = ${p}, ${lo} × ${lo2} = ${q}, and ${hi + lo} × ${hi2 + lo2} = ${r}. So ${k.a} × ${k.b} = ${p} × 100 + (${r} − ${p} − ${q}) × 10 + ${q} = ${k.a * k.b}.`
        : `${k.a} × ${k.b}: four one-digit products, ${k.kids.map((g) => `${g.a} × ${g.b} = ${g.a * g.b}`).join(", ")}. So ${k.a} × ${k.b} = ${k.a * k.b}.`,
      readout: three ? `${p}·100 + (${r} − ${p} − ${q})·10 + ${q} = ${k.a * k.b}` : `${k.a} × ${k.b} = ${k.a * k.b}`,
    });
  }
  solved.add("r");
  const ac = 13 * 22;
  const bd = 21 * 13;
  const mid = three ? 34 * 35 - ac - bd : 13 * 13 + 21 * 22;
  steps.push({
    nodes: nodes(["r"]),
    caption: three
      ? `Combine at the top: ${ac} × 10⁴ + (1190 − ${ac} − ${bd}) × 10² + ${bd} = 2,860,000 + 63,100 + 273 = 2,923,373. Multiplying by 10⁴ or 10² only shifts the digits, which costs O(n).`
      : `Combine: ${ac} × 10⁴ + (169 + 462) × 10² + ${bd} = 2,923,373. The middle part is the sum of the two middle products, ${mid}.`,
    readout: three ? `286·10⁴ + 631·10² + 273` : `286·10⁴ + 631·10² + 273`,
  });
  const leaves = all.filter((n) => n.kids.length === 0).length;
  steps.push({
    nodes: nodes([], true),
    caption: three
      ? `1321 × 2213 = 2,923,373, using ${leaves} one-digit products instead of 16. Each level has 3 times as many products, on numbers half as long: T(n) = 3 T(n/2) + O(n) = O(n to the power log₂ 3), about n¹·⁵⁸⁵.`
      : `The same answer with ${leaves} one-digit products, one for every pair of digits: T(n) = 4 T(n/2) + O(n) = O(n²). Splitting alone does not help; saving the fourth product does.`,
    readout: `${leaves} one-digit products`,
    verdict: three ? { ok: true, text: "2,923,373 with 9 products" } : { ok: true, info: true, text: "2,923,373 with 16 products" },
  });
  return steps;
}

/* DVCQ-6.1: median of medians */

export type MomVariant = "mom" | "first";

export const GROUPS = [
  [12, 3, 25, 8, 17],
  [6, 21, 14, 1, 10],
  [19, 9, 2, 23, 15],
  [4, 18, 11, 24, 7],
  [22, 13, 5, 16, 20],
];

export type MomStep = {
  cells?: GCell[][];
  values?: number[];
  states?: CellState[];
  window?: Win;
  pointers?: Pointer[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export function momSteps(v: MomVariant): MomStep[] {
  return v === "mom" ? momPivot() : firstPivot();
}

/** The groups are columns; the grid has one row per place in a group. */
function grid(groups: number[][], mark: (g: number, r: number, v: number) => Mark = () => ""): GCell[][] {
  return Array.from({ length: 5 }, (_, r) => groups.map((col, g) => ({ v: col[r], s: mark(g, r, col[r]) })));
}

function momPivot(): MomStep[] {
  const steps: MomStep[] = [];
  const sorted = GROUPS.map((g) => g.slice().sort((a, b) => a - b));
  const meds = sorted.map((g) => g[2]);
  const pivot = 12;
  steps.push({
    cells: grid(GROUPS),
    caption:
      "Choose a pivot for quickselect that is never too close to either end. Put the 25 values in groups of 5; here each group is a column.",
    readout: "25 values, 5 groups",
  });
  steps.push({
    cells: grid(sorted),
    caption:
      "Sort each group. A group has only 5 values, so this takes at most 10 comparisons per group, which is O(n) for all of them together.",
    readout: "each column sorted, smallest at the top",
  });
  steps.push({
    cells: grid(sorted, (_, r) => (r === 2 ? "cur" : "")),
    caption: `The middle row holds each group's median: ${meds.join(", ")}.`,
    readout: `medians: ${meds.join(", ")}`,
  });
  steps.push({
    cells: grid(sorted, (_, r, x) => (r === 2 ? (x === pivot ? "found" : "cur") : "")),
    caption:
      "Find the median of these 5 medians by calling select itself on them (a recursive call on n/5 values). It is 12. This is the pivot.",
    readout: "median of medians: 12",
  });
  const order = [1, 3, 0, 2, 4];
  const byMed = order.map((g) => sorted[g]);
  steps.push({
    cells: grid(byMed, (_, r, x) => (r === 2 ? (x === pivot ? "found" : "cur") : "")),
    caption:
      "For the proof only (the method never does this), put the groups in order of their medians: 10, 11, 12, 15, 16. The pivot's group is now in the middle.",
    readout: "groups in order of their medians",
  });
  steps.push({
    cells: grid(byMed, (g, r, x) => (x === pivot ? "found" : g <= 2 && r <= 2 ? "done" : "")),
    caption:
      "The top-left block is at most 12: in the first three groups, the median is at most 12, and the values above a median are smaller still. That is 9 values. In general at least 3 values from half of the groups: about 3n/10.",
    readout: "at least 9 values ≤ 12",
  });
  steps.push({
    cells: grid(byMed, (g, r, x) => (x === pivot ? "found" : g >= 2 && r >= 2 ? "cur" : g <= 2 && r <= 2 ? "done" : "")),
    caption:
      "In the same way the bottom-right block is at least 12: another 9 values, about 3n/10. So whichever side quickselect keeps, it drops at least 3n/10 values and keeps at most 7n/10.",
    readout: "at least 9 values ≥ 12",
  });
  steps.push({
    cells: grid(byMed, (_, __, x) => (x === pivot ? "found" : x < pivot ? "" : "")),
    caption:
      "Partition around 12: 11 values are smaller and 13 are larger. Look for k in the side that holds it. The cost is T(n) ≤ T(n/5) + T(7n/10) + O(n). Since n/5 + 7n/10 = 9n/10 is less than n, this is O(n).",
    readout: "11 smaller, 13 larger",
    verdict: { ok: true, text: "pivot 12: rank 12 of 25" },
  });
  return steps;
}

function firstPivot(): MomStep[] {
  const values = [1, 2, 3, 4, 5, 6, 7, 8];
  const steps: MomStep[] = [];
  let comps = 0;
  steps.push({
    values,
    states: values.map(() => ""),
    window: { lo: 0, hi: 7, label: "look here" },
    pointers: [],
    caption: "Quickselect with the first value as the pivot, on a sorted list, looking for the largest value (k = 7).",
    readout: "comparisons: 0",
  });
  for (let lo = 0; lo < 7; lo++) {
    comps += 7 - lo;
    steps.push({
      values,
      states: values.map((_, x) => (x < lo ? "out" : x === lo ? "mid" : "")),
      window: { lo: lo + 1, hi: 7, label: `${7 - lo} left` },
      pointers: [{ name: "p", at: lo, kind: "mid" }],
      caption: `The pivot p is ${values[lo]}. Comparing it with the other ${7 - lo} values shows that all of them are larger, so only the pivot is dropped.${lo === 6 ? "" : " The list shrinks by one value."}`,
      readout: `comparisons: ${comps}`,
    });
  }
  steps.push({
    values,
    states: values.map((_, x) => (x === 7 ? "found" : "out")),
    pointers: [],
    caption: `Found 8, after 7 + 6 + … + 1 = ${comps} comparisons: n(n − 1)/2, which is O(n²). A pivot from the median of medians drops at least 3n/10 values every round instead.`,
    readout: `comparisons: ${comps}`,
    verdict: { ok: false, text: "O(n²) on a sorted list" },
  });
  return steps;
}
