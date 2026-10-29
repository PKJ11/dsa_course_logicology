// Step generators for the ARRS figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import type { GCell, Mark } from "../../_components/Stages";
import { plural, statesFor, type CellState } from "../kit";

/* ARRS-1.1: where a[i] lives, and what insert costs */

export const MEM_A = [31, 8, 54, 17, 42, 26, 9, 60];
export const BASE = 4000;

export type MemStep = { values: (number | "")[]; states: CellState[]; at: number | null; addr?: string; moved: number; caption: string };

export function memSteps(insert: boolean): MemStep[] {
  const a = MEM_A;
  if (!insert) {
    const read = (i: number, caption: string): MemStep => ({
      values: a,
      states: a.map((_, k) => (k === i ? "found" : "")),
      at: i,
      addr: `${BASE} + ${i} × 8 = ${BASE + i * 8}`,
      moved: 0,
      caption,
    });
    return [
      { values: a, states: [], at: null, moved: 0, caption: `A list of 8 numbers. The computer keeps its slots side by side in memory, starting at address ${BASE}. Each slot takes 8 bytes.` },
      read(0, `\`a[0]\` is at the start: address ${BASE}.`),
      read(3, `\`a[3]\` is 3 slots further on: ${BASE} + 3 × 8 = ${BASE + 24}. One multiplication and one addition find it. Nothing else is read.`),
      read(7, `\`a[7]\` costs the same as \`a[0]\`: ${BASE} + 7 × 8 = ${BASE + 56}. That is why indexing is O(1), whatever the index.`),
      { values: a, states: [], at: null, moved: 0, caption: "In Python each slot actually holds a reference (the address of a number object stored elsewhere). The slots are still all the same size, so the same sum finds any slot." },
    ];
  }
  const out: MemStep[] = [
    { values: [...a, ""], states: [...a.map(() => "" as CellState), "out"], at: null, moved: 0, caption: "Now insert 99 at index 2 with `a.insert(2, 99)`. There is one spare slot at the end." },
  ];
  const cur: (number | "")[] = [...a, ""];
  let moved = 0;
  for (let k = a.length; k > 2; k--) {
    cur[k] = cur[k - 1];
    moved++;
    out.push({
      values: cur.slice(),
      states: cur.map((_, j) => (j === k ? "mid" : "")),
      at: k,
      moved,
      caption: `Move ${cur[k]} from slot ${k - 1} to slot ${k}. Values must move from the back, so that none is written over before it has moved.`,
    });
  }
  cur[2] = 99;
  out.push({ values: cur.slice(), states: cur.map((_, j) => (j === 2 ? "found" : j > 2 ? "path" : "")), at: 2, moved, caption: `Write 99 into slot 2. Inserting at index 2 moved ${plural(moved, "value")}. Inserting at index i of a list of n values moves n − i values, so insert near the front is O(n).` });
  return out;
}

/* ARRS-2.1: two pointers on a sorted list */

export const TP = [2, 5, 8, 12, 16, 23, 38, 45];

export type TPStep = { lo: number; hi: number; states: CellState[]; sum?: number; caption: string; verdict?: { ok: boolean; text: string } };

export function twoPointerSteps(target: number): TPStep[] {
  const a = TP;
  let lo = 0;
  let hi = a.length - 1;
  const st = (extra: Record<number, CellState> = {}) => statesFor(a.length, lo, hi, extra);
  const out: TPStep[] = [
    { lo, hi, states: st(), caption: `The list is sorted. Find two values that add up to ${target}. Start \`lo\` at the smallest value and \`hi\` at the largest.` },
  ];
  while (lo < hi) {
    const s = a[lo] + a[hi];
    if (s === target) {
      out.push({ lo, hi, sum: s, states: st({ [lo]: "found", [hi]: "found" }), caption: `${a[lo]} + ${a[hi]} = ${s}. Found the pair, at indices ${lo} and ${hi}.`, verdict: { ok: true, text: `found: ${lo}, ${hi}` } });
      return out;
    }
    if (s > target) {
      out.push({ lo, hi, sum: s, states: st({ [lo]: "path", [hi]: "path" }), caption: `${a[lo]} + ${a[hi]} = ${s}, too big. ${a[hi]} plus even the smallest value left is too big, so ${a[hi]} cannot be in any pair. Rule it out: move \`hi\` left.` });
      hi--;
    } else {
      out.push({ lo, hi, sum: s, states: st({ [lo]: "path", [hi]: "path" }), caption: `${a[lo]} + ${a[hi]} = ${s}, too small. ${a[lo]} plus even the largest value left is too small, so ${a[lo]} cannot be in any pair. Rule it out: move \`lo\` right.` });
      lo++;
    }
  }
  out.push({ lo, hi, states: st(), caption: `\`lo\` has met \`hi\`. Every value has been ruled out, so no pair adds up to ${target}. At most n − 1 moves were needed: O(n) time, O(1) extra space.`, verdict: { ok: false, text: "no pair" } });
  return out;
}

/* ARRS-3.1: sliding windows */

export const SW = [4, 2, 1, 7, 3, 1, 2, 5];

export type SWStep = { lo: number; hi: number; states: CellState[]; sum: number; best: string; caption: string; bad?: boolean };

export function fixedWindowSteps(k = 3): SWStep[] {
  const a = SW;
  const out: SWStep[] = [];
  let sum = a.slice(0, k).reduce((x, y) => x + y, 0);
  let best = sum;
  let bestAt = 0;
  out.push({ lo: 0, hi: k - 1, states: statesFor(a.length, 0, k - 1), sum, best: `${best} at 0..${k - 1}`, caption: `Find the ${k} neighbouring values with the largest sum. The first window is a[0..${k - 1}], with sum ${sum}.` });
  for (let r = k; r < a.length; r++) {
    const l = r - k + 1;
    sum += a[r] - a[l - 1];
    const note = sum > best ? "A new best." : "Not better.";
    if (sum > best) {
      best = sum;
      bestAt = l;
    }
    out.push({
      lo: l,
      hi: r,
      states: statesFor(a.length, l, r, { [r]: "mid" }),
      sum,
      best: `${best} at ${bestAt}..${bestAt + k - 1}`,
      caption: `Slide one place: add ${a[r]}, which comes in on the right, and take away ${a[l - 1]}, which leaves on the left. Sum ${sum}. ${note} Two steps, not ${k}.`,
    });
  }
  out.push({ lo: bestAt, hi: bestAt + k - 1, states: statesFor(a.length, bestAt, bestAt + k - 1), sum: best, best: `${best} at ${bestAt}..${bestAt + k - 1}`, caption: `The best window is a[${bestAt}..${bestAt + k - 1}] with sum ${best}. Each slide costs O(1), so the whole scan is O(n), not O(n × k).` });
  return out;
}

export function growShrinkSteps(limit = 10): SWStep[] {
  const a = SW;
  const out: SWStep[] = [];
  let lo = 0;
  let sum = 0;
  let best = 0;
  let bestAt = [0, -1];
  out.push({ lo: 0, hi: -1, states: a.map(() => ""), sum: 0, best: "0", caption: `Find the longest run of neighbouring values with sum at most ${limit}. The window grows on the right, and shrinks from the left only when it breaks the rule.` });
  for (let hi = 0; hi < a.length; hi++) {
    sum += a[hi];
    out.push({ lo, hi, states: statesFor(a.length, lo, hi, { [hi]: "mid" }), sum, best: String(best), bad: sum > limit, caption: `Grow: add ${a[hi]}. Sum ${sum}.${sum > limit ? ` That is over ${limit}.` : ""}` });
    while (sum > limit) {
      sum -= a[lo];
      lo++;
      out.push({ lo, hi, states: statesFor(a.length, lo, hi), sum, best: String(best), bad: sum > limit, caption: `Shrink: drop ${a[lo - 1]} from the left. Sum ${sum}.${sum > limit ? " Still too big." : " Back within the limit."}` });
    }
    if (hi - lo + 1 > best) {
      best = hi - lo + 1;
      bestAt = [lo, hi];
      out.push({ lo, hi, states: statesFor(a.length, lo, hi), sum, best: String(best), caption: `The window a[${lo}..${hi}] is the longest valid one so far: ${plural(best, "value")}.` });
    }
  }
  out.push({
    lo: bestAt[0],
    hi: bestAt[1],
    states: statesFor(a.length, bestAt[0], bestAt[1]),
    sum: a.slice(bestAt[0], bestAt[1] + 1).reduce((x, y) => x + y, 0),
    best: String(best),
    caption: `Longest: ${plural(best, "value")}. Each value enters the window once and leaves at most once, so there are at most 2n moves in total: O(n). This works because all values are positive: growing never lowers the sum, and shrinking never raises it.`,
  });
  return out;
}

/* ARRS-4.1: prefix sums and difference arrays */

export const PS = [3, 1, 4, 1, 5, 9, 2, 6];

export type PSStep = { top: (number | "")[]; topStates: CellState[]; bottom: (number | "")[]; bottomStates: CellState[]; caption: string; result?: string };

export function prefixSteps(): PSStep[] {
  const a = PS;
  const P: (number | "")[] = Array(a.length + 1).fill("");
  const out: PSStep[] = [];
  P[0] = 0;
  out.push({ top: a, topStates: [], bottom: P.slice(), bottomStates: [], caption: "Build `P`, one longer than `a`. `P[i]` is the sum of the first i values, so `P[0] = 0`." });
  for (let i = 0; i < a.length; i++) {
    P[i + 1] = (P[i] as number) + a[i];
    out.push({
      top: a,
      topStates: a.map((_, k) => (k === i ? "path" : k < i ? "" : "out")),
      bottom: P.slice(),
      bottomStates: P.map((_, k) => (k === i + 1 ? "mid" : "")),
      caption: `\`P[${i + 1}] = P[${i}] + a[${i}]\` = ${P[i]} + ${a[i]} = ${P[i + 1]}.`,
    });
  }
  const l = 2;
  const r = 5;
  const ans = (P[r + 1] as number) - (P[l] as number);
  out.push({
    top: a,
    topStates: statesFor(a.length, l, r),
    bottom: P,
    bottomStates: P.map((_, k) => (k === l || k === r + 1 ? "found" : "")),
    result: String(ans),
    caption: `The sum of a[${l}..${r}] is \`P[${r + 1}] − P[${l}]\` = ${P[r + 1]} − ${P[l]} = ${ans}. P[${r + 1}] holds the first ${r + 1} values and P[${l}] the first ${l}. The difference is exactly a[${l}..${r}]. One subtraction answers any range: O(1) per question, after O(n) to build P.`,
  });
  return out;
}

export const DIFF_UPDATES: [number, number, number][] = [
  [1, 4, 3],
  [3, 6, 2],
  [0, 2, 1],
];

export function diffSteps(n = 8): PSStep[] {
  const d: number[] = Array(n + 1).fill(0);
  const out: PSStep[] = [];
  const zeros: (number | "")[] = Array(n).fill("");
  out.push({ top: d.slice(), topStates: [], bottom: zeros, bottomStates: [], caption: `Add a number to every value in a range, several times, on a list of ${n} zeros. Instead of touching every value in the range, keep a difference list \`d\`, one longer than the list.` });
  for (const [l, r, k] of DIFF_UPDATES) {
    d[l] += k;
    d[r + 1] -= k;
    out.push({
      top: d.slice(),
      topStates: d.map((_, j) => (j === l || j === r + 1 ? "path" : "")),
      bottom: zeros,
      bottomStates: [],
      caption: `Add ${k} to positions ${l} to ${r}: \`d[${l}] += ${k}\` and \`d[${r + 1}] −= ${k}\`. Two writes, however long the range. The +${k} starts the change, and the −${k} ends it.`,
    });
  }
  const res: (number | "")[] = Array(n).fill("");
  let run = 0;
  for (let i = 0; i < n; i++) {
    run += d[i];
    res[i] = run;
    out.push({
      top: d.slice(),
      topStates: d.map((_, j) => (j === i ? "path" : j > i ? "" : "out")),
      bottom: res.slice(),
      bottomStates: res.map((_, j) => (j === i ? "mid" : "")),
      caption: `Running total of \`d\` up to ${i}: ${run}. This is the final value at position ${i}.`,
    });
  }
  out.push({ top: d, topStates: [], bottom: res, bottomStates: [], caption: `${DIFF_UPDATES.length} range updates and one running total. With u updates on n positions this is O(n + u), instead of O(n × u). It is the reverse of prefix sums.` });
  return out;
}

/* ARRS-5.1: walking a grid */

export const GRID = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
];

export type GridKind = "rows" | "cols" | "spiral";

export type GridStep = { cells: GCell[][]; order: number[]; caption: string; bounds?: string };

function gridOrder(kind: GridKind): { r: number; c: number; note?: string; bounds?: string }[] {
  const R = GRID.length;
  const C = GRID[0].length;
  const out: { r: number; c: number; note?: string; bounds?: string }[] = [];
  if (kind === "rows") for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) out.push({ r, c });
  else if (kind === "cols") for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) out.push({ r, c });
  else {
    let top = 0;
    let bottom = R - 1;
    let left = 0;
    let right = C - 1;
    const b = () => `top ${top}, bottom ${bottom}, left ${left}, right ${right}`;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) out.push({ r: top, c, note: c === left ? "Along the top row, left to right." : undefined, bounds: b() });
      top++;
      for (let r = top; r <= bottom; r++) out.push({ r, c: right, note: r === top ? "Down the right column. The top row is done, so `top` moved down." : undefined, bounds: b() });
      right--;
      if (top <= bottom) {
        for (let c = right; c >= left; c--) out.push({ r: bottom, c, note: c === right ? "Back along the bottom row, right to left." : undefined, bounds: b() });
        bottom--;
      }
      if (left <= right) {
        for (let r = bottom; r >= top; r--) out.push({ r, c: left, note: r === bottom ? "Up the left column. Then the next ring starts, one step in." : undefined, bounds: b() });
        left++;
      }
    }
  }
  return out;
}

export function gridSteps(kind: GridKind): GridStep[] {
  const ord = gridOrder(kind);
  const R = GRID.length;
  const C = GRID[0].length;
  const make = (upto: number): GCell[][] =>
    GRID.map((row, r) =>
      row.map((v, c) => {
        const k = ord.findIndex((o) => o.r === r && o.c === c);
        const s: Mark = k === upto ? "cur" : k < upto ? "done" : "";
        return { v, s };
      }),
    );
  const first =
    kind === "rows"
      ? "Row by row: for each row r, go along every column c. The cell is `grid[r][c]`: first the row, then the column."
      : kind === "cols"
        ? "Column by column: swap the two loops. The outer loop picks the column, the inner loop goes down the rows."
        : "A spiral: go round the outside, then the next ring in. Keep four limits, `top`, `bottom`, `left` and `right`, and move one in after each side is done.";
  const steps: GridStep[] = [{ cells: make(-1), order: [], caption: first }];
  ord.forEach((o, k) => {
    steps.push({
      cells: make(k),
      order: ord.slice(0, k + 1).map((x) => GRID[x.r][x.c]),
      bounds: o.bounds,
      caption: o.note ? `${o.note} \`grid[${o.r}][${o.c}]\` = ${GRID[o.r][o.c]}.` : `\`grid[${o.r}][${o.c}]\` = ${GRID[o.r][o.c]}.`,
    });
  });
  steps.push({
    cells: make(ord.length),
    order: ord.map((x) => GRID[x.r][x.c]),
    caption:
      kind === "spiral"
        ? `All ${R * C} cells, each visited once. The checks \`top <= bottom\` and \`left <= right\` before the last two sides stop a single middle row or column from being visited twice.`
        : `All ${R * C} cells, each visited once: O(R × C) for R rows and C columns.${kind === "cols" ? " Row by row is usually a little faster in practice, because each row is one list read from start to end." : ""}`,
  });
  return steps;
}

/* ARRS-6.1: is it a palindrome? */

export type PalStep = { lo: number | null; hi: number | null; states: CellState[]; caption: string; verdict?: { ok: boolean; text: string } };

const isAlnum = (ch: string) => /[a-z0-9]/i.test(ch);

export function palSteps(s: string): PalStep[] {
  const chars = s.split("");
  const n = chars.length;
  const done = new Set<number>();
  const skipped = new Set<number>();
  const st = (lo: number, hi: number, cur: CellState = "path"): CellState[] =>
    chars.map((_, k) => (k === lo || k === hi ? cur : done.has(k) ? "out" : skipped.has(k) ? "out" : ""));
  const out: PalStep[] = [{ lo: null, hi: null, states: [], caption: `Is "${s}" the same backwards, if we ignore case, spaces and punctuation? Use two pointers, one from each end. Do not build a cleaned copy.` }];
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    if (!isAlnum(chars[lo])) {
      skipped.add(lo);
      out.push({ lo, hi, states: st(lo, hi), caption: `\`s[${lo}]\` is ${chars[lo] === " " ? "a space" : `"${chars[lo]}"`}, not a letter or digit. Skip it: move \`lo\` right.` });
      lo++;
      continue;
    }
    if (!isAlnum(chars[hi])) {
      skipped.add(hi);
      out.push({ lo, hi, states: st(lo, hi), caption: `\`s[${hi}]\` is ${chars[hi] === " " ? "a space" : `"${chars[hi]}"`}, not a letter or digit. Skip it: move \`hi\` left.` });
      hi--;
      continue;
    }
    const a = chars[lo].toLowerCase();
    const b = chars[hi].toLowerCase();
    if (a !== b) {
      out.push({ lo, hi, states: st(lo, hi, "violated"), caption: `"${a}" and "${b}" differ. One mismatch is enough: it is not a palindrome.`, verdict: { ok: false, text: "not a palindrome" } });
      return out;
    }
    out.push({ lo, hi, states: st(lo, hi), caption: `"${chars[lo]}" and "${chars[hi]}" match${chars[lo] !== chars[hi] ? " once both are made lower case" : ""}. Move both pointers in.` });
    done.add(lo);
    done.add(hi);
    lo++;
    hi--;
  }
  out.push({ lo: null, hi: null, states: chars.map((_, k) => (done.has(k) ? "found" : "out")), caption: "The pointers have met, and every pair matched. It is a palindrome. Each character was looked at once: O(n) time and O(1) extra space.", verdict: { ok: true, text: "palindrome" } });
  return out;
}
