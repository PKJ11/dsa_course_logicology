// Step generators for the BIGO figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import type { Frame, TNode } from "../../_components/Stages";
import { plural, recorder, type CellState, type TraceStep } from "../kit";

/* BIGO-1.1: counting steps in three loops */

export type LoopKind = "one" | "two" | "tri";

export const COUNT_CODE: Record<LoopKind, string> = {
  one: `n = 4
count = 0
for i in range(n):
    count += 1
print(count)`,
  two: `n = 4
count = 0
for i in range(n):
    for j in range(n):
        count += 1
print(count)`,
  tri: `n = 4
count = 0
for i in range(n):
    for j in range(i + 1, n):
        count += 1
print(count)`,
};

export const COUNT_TOTAL: Record<LoopKind, { formula: string; value: number }> = {
  one: { formula: "n", value: 4 },
  two: { formula: "n × n = n²", value: 16 },
  tri: { formula: "n(n − 1) / 2", value: 6 },
};

export function countSteps(kind: LoopKind): TraceStep[] {
  const n = 4;
  const r = recorder();
  let count = 0;
  r.push(1, { n: "4" }, "Count how many times the line `count += 1` runs. That number stands for the work the program does.");
  r.push(2, { n: "4", count: "0" }, "`count` starts at 0.");
  if (kind === "one") {
    for (let i = 0; i < n; i++) {
      r.push(3, { n: "4", count: String(count), i: String(i) }, i === 0 ? "The loop runs once for each `i` from 0 to 3." : `Next pass: \`i = ${i}\`.`);
      count++;
      r.push(4, { n: "4", count: String(count), i: String(i) }, `One more step. ${plural(count, "step")} so far.`);
    }
  } else {
    for (let i = 0; i < n; i++) {
      const from = kind === "two" ? 0 : i + 1;
      r.push(
        3,
        { n: "4", count: String(count), i: String(i) },
        kind === "two"
          ? `\`i = ${i}\`. The inner loop will run its full ${n} passes for this one value of \`i\`.`
          : `\`i = ${i}\`. The inner loop starts at \`j = ${i + 1}\`, so it runs ${plural(n - from, "time")}.`,
      );
      for (let j = from; j < n; j++) {
        count++;
        r.push(5, { n: "4", count: String(count), i: String(i), j: String(j) }, `\`i = ${i}\`, \`j = ${j}\`. ${plural(count, "step")} so far.`);
      }
      if (from >= n) r.push(4, { n: "4", count: String(count), i: String(i) }, `\`range(${i + 1}, 4)\` is empty, so the inner loop does nothing for \`i = ${i}\`.`);
    }
  }
  const last = kind === "one" ? 5 : 6;
  const sum =
    kind === "one"
      ? "One loop of n passes does n steps. Double n and the count doubles."
      : kind === "two"
        ? "A loop inside a loop multiplies: n passes, each doing n steps, is n² steps. Double n and the count goes up four times."
        : "The inner loop runs 3, 2, 1, then 0 times. 3 + 2 + 1 = 6, which is n(n − 1) / 2 for n = 4. That is about half of n², so it still grows like n².";
  r.push(last, { n: "4", count: String(count) }, `Printed ${count}. ${sum}`, { out: [String(count)] });
  return r.steps;
}

/* BIGO-2.1: finding c and n0 */

export type BoundKind = "c4" | "c3" | "sq";

export type BoundRow = { n: number; f: number; g: number; ok: boolean };

export const BOUND_LABEL: Record<BoundKind, string> = { c4: "4 × n", c3: "3 × n", sq: "1 × n²" };

export function boundRows(kind: BoundKind): BoundRow[] {
  const rows: BoundRow[] = [];
  for (let n = 1; n <= 8; n++) {
    const f = 3 * n + 5;
    const g = kind === "c4" ? 4 * n : kind === "c3" ? 3 * n : n * n;
    rows.push({ n, f, g, ok: f <= g });
  }
  return rows;
}

export function boundCaptions(kind: BoundKind): string[] {
  const rows = boundRows(kind);
  const caps = [
    kind === "sq"
      ? "Now try g(n) = n² with c = 1. Is 3n + 5 at most n² once n is big enough? The last column says whether it holds for that row."
      : `The cost is f(n) = 3n + 5. To show it is O(n), find a number c so that f(n) is at most c × n for every n from some point on. That point is called n₀ ("n nought"). Try c = ${kind === "c4" ? 4 : 3}. The last column says whether the bound holds for that row.`,
  ];
  for (const r of rows) {
    caps.push(
      r.ok
        ? `n = ${r.n}: f(n) = ${r.f} and the bound is ${r.g}. ${r.f} is at most ${r.g}, so the bound holds.`
        : `n = ${r.n}: f(n) = ${r.f} but the bound is only ${r.g}. The bound fails here.`,
    );
  }
  caps.push(
    kind === "c4"
      ? "From n₀ = 5 on, 3n + 5 is at most 4n, because 4n − (3n + 5) = n − 5, which is never negative once n is 5 or more. So 3n + 5 is O(n). The early rows do not matter."
      : kind === "c3"
        ? "With c = 3 the bound never holds: 3n + 5 is always 5 more than 3n. That does not prove anything. It only means c = 3 is too small. Pick a bigger c."
        : "From n₀ = 5 on, 3n + 5 is at most n² (n times n). So 3n + 5 is also O(n²). That is true but loose: Big-O is only an upper bound. Θ(n) is the exact growth.",
  );
  return caps;
}

/* BIGO-3.1: what n each growth rate can handle */

export const RATE = 1e7; // simple Python steps per second, roughly

export const CLASSES: { name: string; log10: (n: number) => number }[] = [
  { name: "1", log10: () => 0 },
  { name: "log n", log10: (n) => Math.log10(Math.max(1, Math.log2(n))) },
  { name: "n", log10: (n) => Math.log10(n) },
  { name: "n log n", log10: (n) => Math.log10(n * Math.max(1, Math.log2(n))) },
  { name: "n²", log10: (n) => 2 * Math.log10(n) },
  { name: "n³", log10: (n) => 3 * Math.log10(n) },
  { name: "2ⁿ", log10: (n) => n * Math.log10(2) },
  { name: "n!", log10: (n) => { let s = 0; for (let k = 2; k <= n; k++) s += Math.log10(k); return s; } },
];

export const GROWTH_NS = [10, 20, 100, 1000, 100_000, 1_000_000];

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function sup10(k: number): string {
  // 10 with k written as a superscript: a 1 followed by k zeros (the captions say so in words)
  return `10${String(k).split("").map((c) => SUP[Number(c)]).join("")}`;
}

export function fmtCount(l10: number): string {
  if (l10 < 15) return Math.round(10 ** l10).toLocaleString("en-US");
  return `about ${sup10(Math.floor(l10))}`;
}

// A time is never split between its number and its unit (the phone table is narrow).
export function fmtTime(l10steps: number): string {
  return timeText(l10steps).replace(/ (\S+)$/, " $1");
}

function timeText(l10steps: number): string {
  const l = l10steps - Math.log10(RATE);
  if (l < -6) return "under 1 µs";
  const s = 10 ** l;
  if (l < -3) return `${Math.round(s * 1e6)} µs`;
  if (l < 0) return `${Math.round(s * 1e3)} ms`;
  if (s < 60) return `${s < 10 ? s.toFixed(1) : Math.round(s)} s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return plural(Math.round(s / 3600), "hour");
  if (s < 3.15e7) return plural(Math.round(s / 86400), "day");
  const y = l - Math.log10(3.15e7);
  if (y < 6) return `${Math.round(10 ** y).toLocaleString("en-US")} years`;
  return `about ${sup10(Math.floor(y))} years`;
}

export const GROWTH_CAPS = [
  "Each row is a growth class. Each step picks a bigger size n. The time assumes about 10 million simple steps a second, which is roughly what plain Python manages. The bars compare each time with 10 seconds. 2ⁿ means n twos multiplied together, and n! means 1 × 2 × 3 × … × n.",
  "n = 10. Every class is instant. At this size even 2ⁿ and n! look harmless, which is why small tests cannot tell a good algorithm from a bad one.",
  "n = 20. n! already needs thousands of years. 2ⁿ is still about a tenth of a second. Very large counts are written as powers of 10: 10¹⁸ is a 1 followed by 18 zeros.",
  "n = 100. 2ⁿ is now far longer than the age of the universe. n³ is a tenth of a second. Everything up to n² is instant.",
  "n = 1,000. n³ takes about 2 minutes, and n² a tenth of a second.",
  "n = 100,000. n² now takes about 17 minutes. n log n is still under a second. This is the size where the choice of algorithm decides everything.",
  "n = 1,000,000. Only n log n and faster finish in a few seconds. n² would take more than a day. As a guide, plain Python manages about 10 million simple steps a second.",
];

/* BIGO-4.1: a loop and a recursion, both adding up a list */

export const SUM_LOOP = `def total(a):
    s = 0
    for x in a:
        s += x
    return s`;

export const SUM_REC = `def total(a, i=0):
    if i == len(a):
        return 0
    return a[i] + total(a, i + 1)`;

export const SUM_A = [4, 7, 1, 6, 2];

export type SpaceStep = { line: number; frames: Frame[]; vars?: Record<string, string>; caption: string; mem: number; most: number };

export function spaceSteps(rec: boolean): SpaceStep[] {
  const a = SUM_A;
  const out: SpaceStep[] = [];
  if (!rec) {
    let s = 0;
    out.push({ line: 2, frames: [{ name: "total(a)", state: "cur" }], vars: { s: "0" }, mem: 1, most: 1, caption: "One call to `total`. Its only extra names are `s` and `x`." });
    for (const x of a) {
      s += x;
      out.push({ line: 4, frames: [{ name: "total(a)", vars: `s=${s}`, state: "cur" }], vars: { s: String(s), x: String(x) }, mem: 1, most: 1, caption: `\`x = ${x}\`, \`s = ${s}\`. The same two names are reused on every pass. No new memory is needed.` });
    }
    out.push({ line: 5, frames: [{ name: "total(a)", state: "ret", ret: String(s) }], vars: { s: String(s) }, mem: 1, most: 1, caption: `Returns ${s}. However long the list, the loop uses the same small amount of extra memory. Its extra space is O(1), which means a constant amount.` });
    return out;
  }
  const frames: Frame[] = [];
  let most = 0;
  for (let i = 0; i <= a.length; i++) {
    frames.forEach((f) => (f.state = "wait"));
    frames.push({ name: `total(a, ${i})`, state: "cur" });
    most = Math.max(most, frames.length);
    out.push({
      line: i === a.length ? 3 : 4,
      frames: frames.map((f) => ({ ...f })),
      mem: frames.length,
      most,
      caption:
        i === 0
          ? "The first call cannot finish until `total(a, 1)` returns, so it waits. Its frame stays in memory."
          : i === a.length
            ? `\`i = ${i}\` equals \`len(a)\`. This is the base case: return 0. There are now ${a.length + 1} frames in memory at once.`
            : `Call \`total(a, ${i})\`. One more frame waits on top of the others.`,
    });
  }
  let ret = 0;
  for (let i = a.length; i >= 0; i--) {
    if (i < a.length) ret += a[i];
    frames[i] = { ...frames[i], state: "ret", ret: String(ret) };
    if (i > 0) frames[i - 1] = { ...frames[i - 1], state: "cur" };
    out.push({
      line: i === a.length ? 3 : 4,
      frames: frames.slice(0, i + 1).map((f) => ({ ...f })),
      mem: i + 1,
      most,
      caption: i === 0 ? `The first call returns ${ret}. The answer is the same, but the recursion needed ${most} frames at once: one per value, plus one. Its extra space is O(n).` : `\`total(a, ${i})\` returns ${ret}. Its frame is removed, and the call below it continues.`,
    });
    frames.length = i;
  }
  return out;
}

/* BIGO-5.1: recursion trees */

export type RecKind = "half" | "chain";

export type RecStep = { nodes: TNode[]; rows: { level: number; sizes: string; work: number }[]; caption: string };

export function recSteps(kind: RecKind): RecStep[] {
  const steps: RecStep[] = [];
  if (kind === "half") {
    const levels: { id: string; size: number; parent?: string }[][] = [[{ id: "r", size: 8 }]];
    for (let d = 1; d <= 3; d++) {
      const next: { id: string; size: number; parent?: string }[] = [];
      for (const p of levels[d - 1]) for (const s of ["a", "b"]) next.push({ id: p.id + s, size: p.size / 2, parent: p.id });
      levels.push(next);
    }
    const capFor = [
      "T(8) is one call on 8 values. It does 8 steps of its own work (for example, merging), then makes two calls on 4 values each.",
      "Level 1: two calls of size 4. Each does 4 steps, so the level does 2 × 4 = 8 steps.",
      "Level 2: four calls of size 2. 4 × 2 = 8 steps again.",
      "Level 3: eight calls of size 1. These are the base cases. 8 × 1 = 8 steps.",
    ];
    const rows: RecStep["rows"] = [];
    for (let d = 0; d <= 3; d++) {
      rows.push({ level: d, sizes: `${levels[d].length} × ${levels[d][0].size}`, work: 8 });
      const nodes: TNode[] = [];
      levels.forEach((lv, k) => lv.forEach((x) => nodes.push({ id: x.id, label: String(x.size), parent: x.parent, state: k > d ? "hidden" : k === d ? "cur" : "done" })));
      steps.push({ nodes, rows: rows.slice(), caption: capFor[d] });
    }
    const nodes: TNode[] = [];
    levels.forEach((lv) => lv.forEach((x) => nodes.push({ id: x.id, label: String(x.size), parent: x.parent, state: "done" })));
    steps.push({ nodes, rows: rows.slice(), caption: "Every level does n = 8 steps, and there are log₂ 8 + 1 = 4 levels (log₂ n is how many times you can halve n before reaching 1). Total: 8 × 4 = 32. In general T(n) = 2T(n/2) + n is Θ(n log n)." });
    return steps;
  }
  const n = 6;
  const rows: RecStep["rows"] = [];
  for (let d = 0; d < n; d++) {
    rows.push({ level: d, sizes: `1 × ${n - d}`, work: n - d });
    const nodes: TNode[] = [];
    for (let k = 0; k < n; k++) nodes.push({ id: `c${k}`, label: String(n - k), parent: k ? `c${k - 1}` : undefined, state: k > d ? "hidden" : k === d ? "cur" : "done" });
    steps.push({
      nodes,
      rows: rows.slice(),
      caption:
        d === 0
          ? "T(n) = T(n − 1) + n: one call on 6 values does 6 steps, then calls itself once on 5 values. Selection sort has this shape."
          : `Level ${d}: one call of size ${n - d}, doing ${n - d} steps.`,
    });
  }
  const nodes: TNode[] = [];
  for (let k = 0; k < n; k++) nodes.push({ id: `c${k}`, label: String(n - k), parent: k ? `c${k - 1}` : undefined, state: "done" });
  steps.push({ nodes, rows: rows.slice(), caption: "The levels do 6 + 5 + 4 + 3 + 2 + 1 = 21 steps, which is n(n + 1) / 2. Shrinking by one each time, instead of halving, gives Θ(n²)." });
  return steps;
}

/* BIGO-6.1: the master theorem, level by level */

export type MasterKind = "bs" | "ms" | "leaves" | "top";

export const MASTER: Record<MasterKind, { a: number; b: number; d: number; name: string; result: string }> = {
  bs: { a: 1, b: 2, d: 0, name: "binary search", result: "Θ(log n)" },
  ms: { a: 2, b: 2, d: 1, name: "merge sort", result: "Θ(n log n)" },
  leaves: { a: 4, b: 2, d: 1, name: "four half-size calls", result: "Θ(n²)" },
  top: { a: 1, b: 2, d: 1, name: "one half-size call, n work", result: "Θ(n)" },
};

export type MasterRow = { level: number; calls: number; size: number; each: number; total: number };

export function masterRows(kind: MasterKind, n = 16): MasterRow[] {
  const { a, b, d } = MASTER[kind];
  const rows: MasterRow[] = [];
  for (let k = 0, size = n; size >= 1; k++, size /= b) {
    const calls = a ** k;
    const each = size ** d;
    rows.push({ level: k, calls, size, each, total: calls * each });
  }
  return rows;
}

export function masterCaptions(kind: MasterKind): string[] {
  const { a, b, d, result } = MASTER[kind];
  const rows = masterRows(kind);
  const r = a / b ** d;
  const caps = [
    `T(n) = ${a === 1 ? "" : a}T(n/${b}) + ${d === 0 ? "1" : d === 1 ? "n" : `n${SUP[d]}`}. Each call makes ${plural(a, "call")} on inputs ${b} times smaller, and does ${d === 0 ? "a constant amount of" : "n steps of"} work itself. Here n = 16.`,
  ];
  for (const row of rows) {
    caps.push(`Level ${row.level}: ${plural(row.calls, "call")} of size ${row.size}, each doing ${row.each} ${row.each === 1 ? "step" : "steps"}. Level total: ${row.total}.`);
  }
  caps.push(
    r === 1
      ? `a = bᵈ (${a} = ${b}${SUP[d]}), so every level does the same work. Total = work per level × number of levels, which is ${result}.`
      : r > 1
        ? `a > bᵈ (${a} is more than ${b}${SUP[d]}), so each level does ${r} times the work of the level above. The bottom level, with the most calls, decides the total: ${result}.`
        : `a < bᵈ (${a} is less than ${b}${SUP[d]}), so each level does ${r === 0.5 ? "half" : `${r} times`} the work of the level above. The top level decides the total: ${result}.`,
  );
  return caps;
}

/* BIGO-7.1: a list that doubles when it is full */

export type GrowKind = "double" | "plus2";

export type GrowStep = { cells: (number | "")[]; states: CellState[]; size: number; cap: number; copied: number; total: number; caption: string };

export function growSteps(kind: GrowKind, appends = 16): GrowStep[] {
  const out: GrowStep[] = [];
  let cap = 1;
  const vals: number[] = [];
  let total = 0;
  const cellsOf = (c: number) => Array.from({ length: c }, (_, k) => (k < vals.length ? vals[k] : "")) as (number | "")[];
  out.push({ cells: cellsOf(cap), states: ["out"], size: 0, cap, copied: 0, total: 0, caption: `The list starts with room for 1 value. Unused room is hatched. ${kind === "double" ? "When it is full, it doubles its room." : "When it is full, it adds room for 2 more."}` });
  for (let v = 1; v <= appends; v++) {
    let copied = 0;
    if (vals.length === cap) {
      copied = vals.length;
      cap = kind === "double" ? cap * 2 : cap + 2;
      total += copied;
    }
    vals.push(v * 10);
    total += 1;
    const states: CellState[] = cellsOf(cap).map((_, k) => (k === vals.length - 1 ? "found" : k >= vals.length ? "out" : copied ? "mid" : ""));
    out.push({
      cells: cellsOf(cap),
      states,
      size: vals.length,
      cap,
      copied,
      total,
      caption: copied
        ? `Append ${v * 10}: the list was full. Make new room for ${cap}, copy the ${plural(copied, "old value")} across, then write ${v * 10}. Cost: ${copied} + 1 = ${copied + 1}.`
        : `Append ${v * 10}: there is room, so write it. Cost: 1.`,
    });
  }
  const n = appends;
  out.push({
    cells: cellsOf(cap),
    states: cellsOf(cap).map((_, k) => (k >= vals.length ? "out" : "")),
    size: vals.length,
    cap,
    copied: 0,
    total,
    caption:
      kind === "double"
        ? `${n} appends cost ${total} steps in all, about ${(total / n).toFixed(1)} per append. Copies happen at sizes 1, 2, 4 and 8, and 1 + 2 + 4 + … is always less than 2n. So each append costs O(1) on average. This is called amortised O(1).`
        : `${n} appends cost ${total} steps, about ${(total / n).toFixed(1)} per append, against 1.9 for doubling. A copy happens every 2 appends, and each copy is bigger than the last. The total grows like n², so each append costs O(n) on average.`,
  });
  return out;
}

/* BIGO-8.1: removing from the front */

export type FrontKind = "pop0" | "deque";

export type FrontStep = { values: (number | "")[]; states: CellState[]; moved: number; total: number; caption: string };

export function frontSteps(kind: FrontKind): FrontStep[] {
  const start = [12, 7, 30, 18, 4, 25, 9, 16];
  const out: FrontStep[] = [];
  let left = start.slice();
  let total = 0;
  let headAt = 0;
  out.push({ values: start.slice(), states: [], moved: 0, total: 0, caption: kind === "pop0" ? "Take values off the front, one at a time, with `a.pop(0)`. A Python list keeps its values side by side from index 0." : "Now use a `collections.deque` and `popleft()`. A deque keeps track of where its front is, so nothing needs to move." });
  while (left.length) {
    const x = left[0];
    if (kind === "pop0") {
      left = left.slice(1);
      const moved = left.length;
      total += moved;
      out.push({
        values: [...left, ""],
        states: [...left.map(() => (moved ? "mid" : "") as CellState), "out"],
        moved,
        total,
        caption: `\`a.pop(0)\` returns ${x}. The ${plural(moved, "value")} behind it each move one place to the left, to close the gap. ${moved} moves.`,
      });
    } else {
      headAt++;
      left = left.slice(1);
      out.push({
        values: start.map((v, k) => (k < headAt ? "" : v)),
        states: start.map((_, k) => (k < headAt ? "out" : k === headAt ? "found" : "")),
        moved: 0,
        total,
        caption: `\`d.popleft()\` returns ${x}. The front marker moves on by one. No value moves.`,
      });
    }
  }
  out.push({
    values: start.map(() => ""),
    states: start.map(() => "out"),
    moved: 0,
    total,
    caption:
      kind === "pop0"
        ? `Emptying 8 values from the front made 7 + 6 + … + 0 = ${total} moves. For n values that is about n² / 2. With 100,000 values it is 5 billion moves, which takes minutes.`
        : "Emptying 8 values made no moves at all. Each `popleft()` is O(1). Use a deque whenever you take values from the front.",
  });
  return out;
}
