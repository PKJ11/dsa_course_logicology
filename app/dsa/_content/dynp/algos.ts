// Step generators for the DYNP figures. Every figure is a pure function of its step number.
// DP tables use the Grid stage, with `from` arrows (this value came from above, the left or above-left),
// `src` outlines (cells being read) and the `path` mark (a traced-back path). The call tree of lesson 1 uses
// the Tree stage and the memoised calls of lesson 2 use the CallStack. Captions use `backticks` for code.

import type { Frame, GCell, GFrom, Mark, TNode } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type TableStep = {
  cells: GCell[][];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

type Val = string | number | undefined;
type Extra = Partial<GCell> | undefined;

/** Build a table from values, then let `f` add marks to any cell. */
function table(vals: Val[][], f: (r: number, c: number) => Extra = () => undefined): GCell[][] {
  return vals.map((row, r) => row.map((v, c) => ({ v, ...(f(r, c) ?? {}) })));
}

const grid = <T,>(rows: number, cols: number, fill: (r: number, c: number) => T): T[][] =>
  Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => fill(r, c)));

/* ---------------------------------------------------------------- DYNP-1.1: the same question, asked again */

export type CoinVariant = "calls" | "once";
export const COINS = [1, 3, 4];
export const AMOUNT = 5;
const FEWEST = (() => {
  const f = [0];
  for (let x = 1; x <= AMOUNT; x++) f.push(1 + Math.min(...COINS.filter((c) => c <= x).map((c) => f[x - c])));
  return f;
})();

export type CoinStep = { nodes?: TNode[]; cells: GCell[][]; caption: string; readout?: string; verdict?: Verdict };

type Call = { id: string; x: number; parent?: string; coin?: number; again: boolean };

function coinCalls(): Call[] {
  const out: Call[] = [];
  const seen = new Set<number>();
  const go = (x: number, id: string, parent?: string, coin?: number) => {
    out.push({ id, x, parent, coin, again: seen.has(x) });
    seen.add(x);
    for (const c of COINS) if (c <= x) go(x - c, `${id}-${c}`, id, c);
  };
  go(AMOUNT, "r");
  return out;
}

export function coinSteps(v: CoinVariant): CoinStep[] {
  return v === "calls" ? coinTree() : coinOnce();
}

function coinTree(): CoinStep[] {
  const calls = coinCalls();
  const steps: CoinStep[] = [];
  const at = (k: number): CoinStep["nodes"] =>
    calls.map((o, j) => ({
      id: o.id,
      label: `f(${o.x})`,
      parent: o.parent,
      state: j > k ? "hidden" : j === k ? "cur" : o.again ? "dup" : "",
    }));
  // One row: how many times each amount has been asked so far.
  const asked = (k: number, cur?: number): GCell[][] => {
    const n = Array(AMOUNT + 1).fill(0);
    for (let j = 0; j <= k; j++) n[calls[j].x]++;
    return [n.map((t, x) => ({ v: t || undefined, s: (x === cur ? "cur" : "") as Mark }))];
  };
  steps.push({
    nodes: at(0),
    cells: asked(0, AMOUNT),
    caption:
      "Find `f(5)`: the fewest coins that make 5, with coins 1, 3 and 4. The first coin is 1, 3 or 4, so `f(5)` asks three smaller questions: `f(4)`, `f(2)` and `f(1)`, one for each first coin.",
    readout: "calls so far: 1",
  });
  for (let k = 1; k < calls.length; k++) {
    const o = calls[k];
    const kids = COINS.filter((c) => c <= o.x).map((c) => `\`f(${o.x - c})\``);
    let caption: string;
    if (o.x === 0) caption = o.again ? "`f(0)` again: 0 coins. A base case, so it costs little, but it is still a call." : "`f(0)` = 0: no coins are needed. This is the base case.";
    else if (o.again)
      caption = `\`f(${o.x})\` again. It was asked before, but nothing remembers the answer, so it asks ${kids.join(", ")} all over again.`;
    else caption = `A new question: \`f(${o.x})\`. It asks ${kids.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
    steps.push({ nodes: at(k), cells: asked(k, o.x), caption, readout: `calls so far: ${k + 1}` });
  }
  const all = calls.map((o) => ({ id: o.id, label: `f(${o.x})`, parent: o.parent, state: (o.again ? "dup" : "done") as TNode["state"] }));
  steps.push({
    nodes: all,
    cells: asked(calls.length - 1),
    caption:
      "15 calls, but only 6 different questions: `f(0)` to `f(5)`. `f(1)` was worked out 4 times and `f(0)` 6 times. For an amount of 30 the same recursion makes 2,550,408 calls, still for only 31 questions.",
    readout: "15 calls · 6 different questions",
    verdict: { ok: false, info: true, text: "the same questions, again and again" },
  });
  return steps;
}

function coinOnce(): CoinStep[] {
  const steps: CoinStep[] = [];
  const row = (upto: number, cur?: number) =>
    [FEWEST.map((f, x) => ({
      v: x <= upto ? f : undefined,
      s: (x === cur ? "cur" : x <= upto ? "done" : "") as Mark,
      src: cur !== undefined && cur !== x && COINS.some((c) => c <= cur && cur - c === x),
    }))];
  steps.push({
    cells: row(-1),
    caption:
      "Now ask each question once. Write the answers in a row, one cell per amount, smallest amount first. Then every smaller answer is ready before it is needed.",
    readout: "f(x) = 1 + the smallest of f(x − 1), f(x − 3), f(x − 4)",
  });
  steps.push({ cells: row(0, 0), caption: "`f(0)` = 0: the base case. No coins make 0.", readout: "f(0) = 0" });
  for (let x = 1; x <= AMOUNT; x++) {
    const used = COINS.filter((c) => c <= x);
    const parts = used.map((c) => `f(${x - c})`).join(", ");
    const nums = used.map((c) => FEWEST[x - c]).join(", ");
    steps.push({
      cells: row(x, x),
      caption:
        used.length === 1
          ? `\`f(${x})\`: only the coin 1 fits, so read \`f(${x - 1})\` (dashed) and add 1 coin.`
          : `\`f(${x})\`: read the ${used.length} dashed cells (${parts.replace(/, ([^,]*)$/, " and $1")}), take the smallest and add 1 coin.`,
      readout: used.length === 1 ? `f(${x}) = 1 + f(${x - 1}) = ${FEWEST[x]}` : `f(${x}) = 1 + min(${nums}) = ${FEWEST[x]}`,
    });
  }
  steps.push({
    cells: row(AMOUNT),
    caption:
      "Six questions, each answered once by reading at most 3 earlier cells: about 6 × 3 steps. In general the cost is the number of different questions times the work for each one. For an amount of 30 that is 31 × 3 steps instead of 2.5 million calls.",
    readout: "f(5) = 2 (coins 4 + 1)",
    verdict: { ok: true, text: "each question once" },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-2.1 and 3.1: paths in a grid */

export const PR = 3;
export const PC = 4;
const PATHS = grid(PR, PC, (r, c) => {
  let v = 1;
  for (let k = 1; k <= r; k++) v = (v * (c + k)) / k;
  return v;
});

export type MemoStep = { cells: GCell[][]; frames: Frame[]; caption: string; readout?: string; verdict?: Verdict };

type MemoEvent = { kind: "call" | "base" | "hit" | "ret"; r: number; c: number; stack: [number, number][] };

function memoEvents(): MemoEvent[] {
  const ev: MemoEvent[] = [];
  const stack: [number, number][] = [];
  const known = new Set<string>();
  const go = (r: number, c: number) => {
    stack.push([r, c]);
    const key = `${r},${c}`;
    if (r === 0 || c === 0) {
      ev.push({ kind: "base", r, c, stack: stack.slice() });
      known.add(key);
    } else if (known.has(key)) {
      ev.push({ kind: "hit", r, c, stack: stack.slice() });
    } else {
      ev.push({ kind: "call", r, c, stack: stack.slice() });
      go(r - 1, c);
      go(r, c - 1);
      known.add(key);
      ev.push({ kind: "ret", r, c, stack: stack.slice() });
    }
    stack.pop();
  };
  go(PR - 1, PC - 1);
  return ev;
}

const ordinal = (k: number) => `${k}${k % 10 === 1 && k !== 11 ? "st" : k % 10 === 2 && k !== 12 ? "nd" : k % 10 === 3 && k !== 13 ? "rd" : "th"}`;

export function memoSteps(): MemoStep[] {
  const events = memoEvents();
  const steps: MemoStep[] = [];
  const stored = new Map<string, number>();
  let maxDepth = 0;
  const frames = (e: MemoEvent): Frame[] =>
    e.stack
      .slice()
      .reverse()
      .map(([r, c], j) => {
        const done = j === 0 && e.kind !== "call";
        return { name: `paths(${r}, ${c})`, state: j === 0 ? (done ? "ret" : "cur") : "wait", ret: done ? String(PATHS[r][c]) : undefined };
      });
  const cells = (e?: MemoEvent) => {
    const waiting = new Set((e?.stack ?? []).slice(0, -1).map(([r, c]) => `${r},${c}`));
    return table(grid(PR, PC, (r, c) => (stored.has(`${r},${c}`) ? PATHS[r][c] : undefined)), (r, c) => {
      const key = `${r},${c}`;
      const isTop = e && e.r === r && e.c === c;
      const s: GCell["s"] = isTop ? (e.kind === "hit" ? "done" : "cur") : waiting.has(key) ? "path" : stored.has(key) ? "done" : "";
      return { s, tag: stored.get(key), src: isTop && e.kind === "hit" };
    });
  };
  steps.push({
    cells: cells(),
    frames: [],
    caption:
      "Count the paths from the top-left cell to cell (2, 3), moving only right or down. The last move came from above or from the left, so `paths(r, c)` is `paths(r − 1, c)` plus `paths(r, c − 1)`. Cells on the top row or the left column have 1 path.",
    readout: "memo: empty",
  });
  for (const e of events) {
    maxDepth = Math.max(maxDepth, e.stack.length);
    const name = `\`paths(${e.r}, ${e.c})\``;
    let caption = "";
    if (e.kind === "call") {
      caption =
        e.stack.length === 1
          ? `Call ${name}. It is not in the memo, so it calls \`paths(${e.r - 1}, ${e.c})\` first, the cell above. Pale cells are calls that are waiting.`
          : `${name} is not in the memo either. It calls the cell above first: \`paths(${e.r - 1}, ${e.c})\`.`;
    } else if (e.kind === "base") {
      stored.set(`${e.r},${e.c}`, stored.size + 1);
      caption = `${name} is on the ${e.r === 0 ? "top row" : "left column"}: 1 path. Store it. It is the ${ordinal(stored.size)} answer stored (the small number).`;
    } else if (e.kind === "hit") {
      caption = `${name} is already in the memo: ${PATHS[e.r][e.c]}. Return it at once, with no calls below it.`;
    } else {
      stored.set(`${e.r},${e.c}`, stored.size + 1);
      caption = `Both answers are back, so ${name} = ${PATHS[e.r - 1][e.c]} + ${PATHS[e.r][e.c - 1]} = ${PATHS[e.r][e.c]}. Store it: the ${ordinal(stored.size)} answer.`;
    }
    steps.push({ cells: cells(e), frames: frames(e), caption, readout: `memo: ${stored.size} answer${stored.size === 1 ? "" : "s"} · ${e.stack.length} call${e.stack.length === 1 ? "" : "s"} deep` });
  }
  steps.push({
    cells: cells(),
    frames: [],
    caption: `\`paths(2, 3)\` = 10. The small numbers show the order the answers were stored: the order in which calls finished, deep cells first. Cell (0, 0) was never needed, so it was never filled. The calls went at most ${maxDepth} deep: r + c for the cell (2, 3). A 1,000 × 1,000 grid would need about 2,000.`,
    readout: `memo: ${stored.size} answers · most calls waiting at once: ${maxDepth}`,
    verdict: { ok: true, text: "paths(2, 3) = 10" },
  });
  return steps;
}

export type TabVariant = "rows" | "row";
export type TabStep = TableStep & { rowNo?: number };

export function tabSteps(v: TabVariant): TabStep[] {
  return v === "rows" ? tabRows() : tabOneRow();
}

function tabRows(): TabStep[] {
  const steps: TabStep[] = [];
  const filled = new Set<string>();
  const cells = (cur?: [number, number]) =>
    table(grid(PR, PC, (r, c) => (filled.has(`${r},${c}`) ? PATHS[r][c] : undefined)), (r, c) => {
      const isCur = cur && cur[0] === r && cur[1] === c;
      const src = !!cur && ((r === cur[0] - 1 && c === cur[1]) || (r === cur[0] && c === cur[1] - 1));
      const from: GFrom[] | undefined = r > 0 && c > 0 && filled.has(`${r},${c}`) ? ["up", "left"] : undefined;
      return { s: isCur ? "cur" : filled.has(`${r},${c}`) ? "done" : "", src, from };
    });
  steps.push({
    cells: cells(),
    caption:
      "Fill the same table with a loop instead of calls. Every cell needs the cell above it and the cell to its left. Going row by row, left to right, those two are always filled first.",
    readout: "for r in range(rows): for c in range(cols): …",
  });
  for (let c = 0; c < PC; c++) filled.add(`0,${c}`);
  for (let r = 0; r < PR; r++) filled.add(`${r},0`);
  steps.push({
    cells: cells(),
    caption: "The top row and the left column are all 1: there is one way to reach each of them, straight along or straight down. These are the base cases.",
    readout: "row 0 and column 0: 1",
  });
  for (let r = 1; r < PR; r++)
    for (let c = 1; c < PC; c++) {
      filled.add(`${r},${c}`);
      steps.push({
        cells: cells([r, c]),
        caption:
          r === 1 && c === 1
            ? "Cell (1, 1): add the cell above and the cell to the left (dashed). The arrows record where the value came from."
            : `Cell (${r}, ${c}): ${PATHS[r - 1][c]} from above plus ${PATHS[r][c - 1]} from the left.`,
        readout: `paths(${r}, ${c}) = ${PATHS[r - 1][c]} + ${PATHS[r][c - 1]} = ${PATHS[r][c]}`,
      });
    }
  steps.push({
    cells: cells(),
    caption:
      "Done: 12 cells, each filled once with one addition, so O(rows × columns) time. There are no calls, so no depth limit: a table of 10,000 × 10,000 cells is only a matter of time and memory.",
    readout: "paths(2, 3) = 10",
    verdict: { ok: true, text: "every cell after its sources" },
  });
  return steps;
}

function tabOneRow(): TabStep[] {
  const steps: TabStep[] = [];
  const row = [1, 1, 1, 1];
  const cells = (cur?: number, done = PC) => [
    row.map((v, c) => ({
      v,
      s: (c === cur ? "cur" : c < done ? "done" : "") as GCell["s"],
      src: cur !== undefined && c === cur - 1,
      from: c === cur ? (["up", "left"] as GFrom[]) : undefined,
    })),
  ];
  steps.push({
    cells: cells(undefined, PC),
    rowNo: 0,
    caption:
      "Each row needs only the row above it. So keep one list, `row`, and update it in place. It starts as row 0: all 1s.",
    readout: "row = [1, 1, 1, 1]",
  });
  for (let r = 1; r < PR; r++) {
    for (let c = 1; c < PC; c++) {
      const above = row[c];
      row[c] = row[c] + row[c - 1];
      steps.push({
        cells: cells(c, c),
        rowNo: r,
        caption:
          r === 1 && c === 1
            ? "Row 1, column 1. Before the update, `row[1]` still holds the value from row 0: that is the cell above. `row[0]`, to its left, is already row 1's value. Add them."
            : `Row ${r}, column ${c}: the old \`row[${c}]\` (${above}, the cell above) plus the new \`row[${c - 1}]\` (${row[c - 1]}, the cell to the left).`,
        readout: `row[${c}] = ${above} + ${row[c - 1]} = ${row[c]}`,
      });
    }
  }
  steps.push({
    cells: cells(undefined, PC),
    rowNo: PR - 1,
    caption:
      "The list now holds the last row, and `row[-1]` is the answer, 10. The time is the same, but the space is one row, O(columns), instead of the whole table. The price: the earlier rows are gone, so you cannot walk back through them (lesson 9).",
    readout: "row = [1, 3, 6, 10]",
    verdict: { ok: true, text: "one row of memory" },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-4.1: one number per position */

export type OneVariant = "skip" | "end";
export const SKIP_A = [6, 2, 3, 9, 4, 5, 8, 1];
export const END_A = [-2, 1, -3, 4, -1, 2, 1, -5];

export function oneSteps(v: OneVariant): TableStep[] {
  return v === "skip" ? skipSteps() : endSteps();
}

function skipSteps(): TableStep[] {
  const a = SKIP_A;
  const best: number[] = [];
  for (let i = 0; i < a.length; i++) best.push(i === 0 ? a[0] : i === 1 ? Math.max(a[0], a[1]) : Math.max(best[i - 1], best[i - 2] + a[i]));
  const steps: TableStep[] = [];
  const cells = (upto: number, cur?: number, taken: number[] = []) =>
    table([a, a.map((_, i) => (i <= upto ? best[i] : undefined))], (r, c) => {
      if (r === 0) return { s: taken.includes(c) ? "found" : "", src: c === cur };
      return { s: c === cur ? "cur" : c <= upto ? "done" : "", src: cur !== undefined && cur >= 2 && (c === cur - 1 || c === cur - 2) };
    });
  steps.push({
    cells: cells(-1),
    caption:
      "Choose values from the row so that no two chosen values are side by side, with the largest total. `best[i]` is the largest total using only positions 0 to i.",
    readout: "best[i] = max(best[i − 1], best[i − 2] + a[i])",
  });
  steps.push({ cells: cells(0, 0), caption: "With only position 0, take it: `best[0]` = 6.", readout: "best[0] = 6" });
  steps.push({ cells: cells(1, 1), caption: "With positions 0 and 1, only one can be taken. The larger is 6.", readout: "best[1] = max(6, 2) = 6" });
  for (let i = 2; i < a.length; i++) {
    const skip = best[i - 1];
    const take = best[i - 2] + a[i];
    steps.push({
      cells: cells(i, i),
      caption:
        i === 2
          ? `Position 2 (value 3): skip it and keep \`best[1]\` = ${skip}, or take it. Taking it rules out position 1, so add it to \`best[0]\`: ${best[0]} + 3 = ${take}.`
          : `Position ${i} (value ${a[i]}): skip gives ${skip}; take gives \`best[${i - 2}]\` + ${a[i]} = ${take}. ${take > skip ? "Take it." : take === skip ? "Both give the same." : "Skip it."}`,
      readout: `best[${i}] = max(${skip}, ${best[i - 2]} + ${a[i]}) = ${best[i]}`,
    });
  }
  steps.push({
    cells: cells(a.length - 1, undefined, [0, 3, 6]),
    caption:
      "The answer is the last cell, 23: the values 6, 9 and 8 (marked). Each position was decided once from two earlier answers: O(n) time, and only the last two answers are needed, so O(1) space. Lesson 9 shows how to find the chosen values.",
    readout: "best = 23 (6 + 9 + 8)",
    verdict: { ok: true, text: "23" },
  });
  return steps;
}

/** Numbers with a real minus sign, and sums written without "+ -". */
const num = (x: number) => (x < 0 ? `−${-x}` : String(x));
const plus = (x: number, y: number) => `${num(x)} ${y < 0 ? "−" : "+"} ${Math.abs(y)}`;

function endSteps(): TableStep[] {
  const a = END_A;
  const end: number[] = [];
  for (let i = 0; i < a.length; i++) end.push(i === 0 ? a[0] : Math.max(a[i], end[i - 1] + a[i]));
  const steps: TableStep[] = [];
  let bestSoFar = -Infinity;
  const cells = (upto: number, cur?: number, win?: [number, number]) =>
    table([a, a.map((_, i) => (i <= upto ? end[i] : undefined))], (r, c) => {
      if (r === 0) return { s: win && c >= win[0] && c <= win[1] ? "found" : "", src: c === cur };
      return { s: c === cur ? "cur" : c <= upto ? "done" : "", src: cur !== undefined && c === cur - 1 };
    });
  steps.push({
    cells: cells(-1),
    caption:
      "The largest sum of a stretch (DVCQ-1), as DP. Let `end[i]` be the largest sum of a stretch that ends exactly at position i. Fixing where the stretch ends gives a simple rule.",
    readout: "end[i] = max(a[i], end[i − 1] + a[i])",
  });
  for (let i = 0; i < a.length; i++) {
    bestSoFar = Math.max(bestSoFar, end[i]);
    const ext = i > 0 ? end[i - 1] + a[i] : undefined;
    steps.push({
      cells: cells(i, i),
      caption:
        i === 0
          ? "A stretch ending at position 0 is just the value −2."
          : ext! >= a[i]
            ? `Position ${i}: extend the best stretch ending at ${i - 1} (${plus(end[i - 1], a[i])} = ${num(ext!)}), or start again at ${num(a[i])}. Extending is ${ext === a[i] ? "as good" : "better"}.`
            : `Position ${i}: extending gives ${plus(end[i - 1], a[i])} = ${num(ext!)}, less than starting again at ${num(a[i])}. A stretch with a negative sum before it is never worth keeping.`,
      readout: `end[${i}] = ${num(end[i])} · best so far ${num(bestSoFar)}`,
    });
  }
  steps.push({
    cells: cells(a.length - 1, undefined, [3, 6]),
    caption:
      "The answer is the largest `end[i]`: 6, the stretch from position 3 to 6. This is Kadane's method: O(n) time, and only `end[i − 1]` is needed, so O(1) space. Fixing one end of the stretch is what made the rule simple.",
    readout: "largest sum: 6 (4 − 1 + 2 + 1)",
    verdict: { ok: true, text: "6" },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-5.1: grids */

export type GridVariant = "cheap" | "blocked";
export const COST = [
  [1, 3, 1, 2, 4],
  [1, 5, 1, 3, 1],
  [4, 2, 1, 9, 1],
  [2, 1, 5, 1, 1],
];
const GR = COST.length;
const GC = COST[0].length;
export const BLOCKED = new Set(["0,3", "1,1", "2,3"]);

export function gridSteps(v: GridVariant): TableStep[] {
  return v === "cheap" ? cheapSteps() : blockedSteps();
}

function cheapSteps(): TableStep[] {
  const best = grid(GR, GC, () => 0);
  const from = grid<GFrom | undefined>(GR, GC, () => undefined);
  for (let r = 0; r < GR; r++)
    for (let c = 0; c < GC; c++) {
      if (r === 0 && c === 0) best[r][c] = COST[0][0];
      else if (r === 0 || (c > 0 && best[r][c - 1] < best[r - 1][c])) {
        best[r][c] = COST[r][c] + best[r][c - 1];
        from[r][c] = "left";
      } else {
        best[r][c] = COST[r][c] + best[r - 1][c];
        from[r][c] = "up";
      }
    }
  const steps: TableStep[] = [];
  const filled = new Set<string>();
  const cells = (cur?: [number, number], path: Set<string> = new Set()) =>
    table(grid(GR, GC, (r, c) => (filled.has(`${r},${c}`) ? best[r][c] : undefined)), (r, c) => {
      const key = `${r},${c}`;
      const isCur = cur && cur[0] === r && cur[1] === c;
      const src = !!cur && ((r === cur[0] - 1 && c === cur[1]) || (r === cur[0] && c === cur[1] - 1));
      return {
        tag: COST[r][c],
        s: path.has(key) ? "path" : isCur ? "cur" : filled.has(key) ? "done" : "",
        src,
        from: filled.has(key) ? from[r][c] : undefined,
      };
    });
  const fill = (cells: [number, number][]) => cells.forEach(([r, c]) => filled.add(`${r},${c}`));
  steps.push({
    cells: cells(),
    caption:
      "Each cell has a cost (the small number). Walk from the top-left cell to the bottom-right one, moving only right or down. Find the smallest total cost. `cheap[r][c]` is the cheapest total for reaching cell (r, c).",
    readout: "cheap[r][c] = cost[r][c] + min(cheap above, cheap to the left)",
  });
  fill([[0, 0]]);
  steps.push({ cells: cells([0, 0]), caption: "The start costs its own cost: 1.", readout: "cheap[0][0] = 1" });
  fill(Array.from({ length: GC - 1 }, (_, k) => [0, k + 1] as [number, number]));
  steps.push({
    cells: cells(),
    caption: "The top row can only be reached from the left, so it is a running total. The arrows point to the cell each value came from.",
    readout: `row 0: ${best[0].join(", ")}`,
  });
  fill(Array.from({ length: GR - 1 }, (_, k) => [k + 1, 0] as [number, number]));
  steps.push({ cells: cells(), caption: "The left column can only be reached from above: another running total.", readout: `column 0: ${best.map((row) => row[0]).join(", ")}` });
  for (let c = 1; c < GC; c++) {
    fill([[1, c]]);
    const up = best[0][c];
    const left = best[1][c - 1];
    steps.push({
      cells: cells([1, c]),
      caption:
        c === 1
          ? `Cell (1, 1) costs 5. Arrive from above (${up}) or from the left (${left}): the left is cheaper, so 5 + ${left} = ${best[1][1]}.`
          : `Cell (1, ${c}) costs ${COST[1][c]}. Above is ${up}, left is ${left}. Take the smaller: ${COST[1][c]} + ${Math.min(up, left)} = ${best[1][c]}.`,
      readout: `cheap[1][${c}] = ${COST[1][c]} + min(${up}, ${left}) = ${best[1][c]}`,
    });
  }
  for (let r = 2; r < GR; r++) {
    fill(Array.from({ length: GC - 1 }, (_, k) => [r, k + 1] as [number, number]));
    steps.push({
      cells: cells(),
      caption: `Row ${r} in the same way, left to right: each cell adds its cost to the smaller of the cell above and the cell to its left.`,
      readout: `row ${r}: ${best[r].join(", ")}`,
    });
  }
  const path = new Set<string>();
  let r = GR - 1;
  let c = GC - 1;
  path.add(`${r},${c}`);
  while (r > 0 || c > 0) {
    if (from[r][c] === "up") r--;
    else c--;
    path.add(`${r},${c}`);
  }
  steps.push({
    cells: cells(undefined, path),
    caption: `The cheapest total is the bottom-right cell, ${best[GR - 1][GC - 1]}. Following the arrows back from it gives the route itself (pale cells): costs 1, 3, 1, 1, 3, 1, 1, 1. Lesson 9 is about this walk back.`,
    readout: `cheapest: ${best[GR - 1][GC - 1]}`,
    verdict: { ok: true, text: String(best[GR - 1][GC - 1]) },
  });
  return steps;
}

function blockedSteps(): TableStep[] {
  const ways = grid(GR, GC, () => 0);
  for (let r = 0; r < GR; r++)
    for (let c = 0; c < GC; c++) {
      if (BLOCKED.has(`${r},${c}`)) continue;
      ways[r][c] = r === 0 && c === 0 ? 1 : (r > 0 ? ways[r - 1][c] : 0) + (c > 0 ? ways[r][c - 1] : 0);
    }
  const steps: TableStep[] = [];
  const cells = (upto: number) =>
    table(grid(GR, GC, (r, c) => (r <= upto ? ways[r][c] : undefined)), (r, c) => {
      const blocked = BLOCKED.has(`${r},${c}`);
      if (blocked) return { s: "out" };
      const from: GFrom[] = [];
      if (r <= upto && !(r === 0 && c === 0)) {
        if (r > 0 && !BLOCKED.has(`${r - 1},${c}`)) from.push("up");
        if (c > 0 && !BLOCKED.has(`${r},${c - 1}`)) from.push("left");
      }
      // the row being filled is pale: the caption describes the whole row, so no cell takes the heavy frame
      return { s: r === upto ? "path" : r < upto ? "done" : "", from: from.length ? from : undefined };
    });
  steps.push({
    cells: cells(-1),
    caption:
      "Now count the paths from the top-left to the bottom-right, moving right or down, when some cells are blocked (hatched). A blocked cell has 0 paths through it.",
    readout: "ways[r][c] = ways above + ways to the left; blocked cells are 0",
  });
  for (let r = 0; r < GR; r++)
    steps.push({
      cells: cells(r),
      caption:
        r === 0
          ? "Row 0: 1 path to each cell, until the blocked cell. After it, the cells cannot be reached from the left, and there is nothing above: 0."
          : r === 1
            ? "Row 1: the blocked cell (1, 1) is 0, so the cell after it gets paths only from above."
            : `Row ${r}: each cell adds the cell above and the cell to its left. Blocked cells add nothing.`,
      readout: `row ${r}: ${ways[r].map((w, c) => (BLOCKED.has(`${r},${c}`) ? "blocked" : w)).join(", ")}`,
    });
  steps.push({
    cells: cells(GR),
    caption: `${ways[GR - 1][GC - 1]} paths avoid the blocked cells. Without them there would be 35. The rule is the same; only the base cases and the blocked cells change. Counting needs no comparisons, only additions, and the counts can grow very large.`,
    readout: `ways = ${ways[GR - 1][GC - 1]}`,
    verdict: { ok: true, text: `${ways[GR - 1][GC - 1]} paths` },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-6.1: longest increasing subsequence */

export type LisVariant = "table" | "tails";
export const LIS_A = [5, 2, 8, 6, 3, 6, 9, 7];

export function lisSteps(v: LisVariant): TableStep[] {
  return v === "table" ? lisTable() : lisTails();
}

function lisTable(): TableStep[] {
  const a = LIS_A;
  const len: number[] = [];
  for (let i = 0; i < a.length; i++) {
    let m = 0;
    for (let j = 0; j < i; j++) if (a[j] < a[i]) m = Math.max(m, len[j]);
    len.push(m + 1);
  }
  const steps: TableStep[] = [];
  const cells = (upto: number, cur?: number, chain: number[] = []) =>
    table([a, a.map((_, i) => (i <= upto ? len[i] : undefined))], (r, c) => {
      const src = cur !== undefined && c < cur && a[c] < a[cur];
      if (r === 0) return { s: chain.includes(c) ? "found" : "", src: src || c === cur };
      return { s: c === cur ? "cur" : c <= upto ? "done" : "", src };
    });
  steps.push({
    cells: cells(-1),
    caption:
      "A subsequence keeps some values in their order, skipping others. Find the longest one whose values rise strictly. `len[i]` is the length of the longest rising subsequence that ends with the value at position i.",
    readout: "len[i] = 1 + the largest len[j] with j < i and a[j] < a[i]",
  });
  for (let i = 0; i < a.length; i++) {
    const smaller = a.slice(0, i).map((x, j) => [x, j]).filter(([x]) => x < a[i]);
    steps.push({
      cells: cells(i, i),
      caption:
        smaller.length === 0
          ? `${a[i]}: no earlier value is smaller, so a rising subsequence ending here has only this value: \`len[${i}]\` = 1.`
          : smaller.length === 1
            ? `${a[i]}: the only earlier value smaller than ${a[i]} is ${smaller[0][0]} (dashed). Extend its subsequence by ${a[i]}.`
            : `${a[i]}: the earlier values smaller than ${a[i]} are ${smaller.map(([x]) => x).join(", ").replace(/, ([^,]*)$/, " and $1")} (dashed). Extend the longest of their subsequences by ${a[i]}.`,
      readout:
        smaller.length === 0
          ? `len[${i}] = 1`
          : smaller.length === 1
            ? `len[${i}] = 1 + ${len[smaller[0][1]]} = ${len[i]}`
            : `len[${i}] = 1 + max(${smaller.map(([, j]) => len[j]).join(", ")}) = ${len[i]}`,
    });
  }
  steps.push({
    cells: cells(a.length - 1, undefined, [1, 4, 5, 6]),
    caption:
      "The answer is the largest `len[i]`: 4, for example 2, 3, 6, 9 (marked). Each position looks at every earlier one, so this is O(n²): fine for a few thousand values, too slow for 100,000.",
    readout: "longest: 4 · about n²/2 = 28 comparisons",
    verdict: { ok: true, text: "4" },
  });
  return steps;
}

function lisTails(): TableStep[] {
  const a = LIS_A;
  const steps: TableStep[] = [];
  const tails: number[] = [];
  const cells = (cur?: number, k?: number, seen = 0) =>
    table([a, a.map((_, j) => tails[j])], (r, c) => {
      if (r === 0) return { s: c < seen && c !== cur ? "done" : "", src: c === cur };
      return { s: c === k ? "cur" : c < tails.length ? "done" : "" };
    });
  steps.push({
    cells: cells(),
    caption:
      "A faster way. Keep a second row, `tails`: `tails[k]` is the smallest value that ends a rising subsequence of length k + 1 found so far. A small end is better, because more values can follow it.",
    readout: "tails = []",
  });
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    let k = 0;
    while (k < tails.length && tails[k] < x) k++;
    const old = tails[k];
    if (k === tails.length) tails.push(x);
    else tails[k] = x;
    steps.push({
      cells: cells(i, k, i),
      caption:
        old === undefined
          ? tails.length === 1
            ? `${x}: the first value starts a subsequence of length 1.`
            : `${x} is larger than every tail, so it extends the longest subsequence: now one of length ${tails.length}.`
          : `${x}: binary search finds the first tail that is not smaller, ${old} at position ${k}. Replace it: a subsequence of length ${k + 1} can now end with ${x}, which is smaller.`,
      readout: `bisect_left(tails, ${x}) = ${k} · tails = [${tails.join(", ")}]`,
    });
  }
  steps.push({
    cells: cells(undefined, undefined, a.length),
    caption:
      "The length of `tails` is the answer: 4. `tails` always rises, so each value costs one binary search: O(n log n) in all. Note that `tails` itself (2, 3, 6, 7) happens to be a rising subsequence here, but in general it is not one; lesson 9 shows how to rebuild a real one.",
    readout: "len(tails) = 4",
    verdict: { ok: true, text: "4" },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-7.1 and 9.1: two strings */

export type StrVariant = "lcs" | "edit";
export const LCS_A = "ABCBDAB";
export const LCS_B = "BDCABA";
export const ED_A = "horse";
export const ED_B = "ros";

export type StrStep = TableStep & { colHead: string[]; rowHead: string[] };

function lcsTable() {
  const n = LCS_A.length;
  const m = LCS_B.length;
  const L = grid(n + 1, m + 1, () => 0);
  const from = grid<GFrom | undefined>(n + 1, m + 1, () => undefined);
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      if (LCS_A[i - 1] === LCS_B[j - 1]) {
        L[i][j] = L[i - 1][j - 1] + 1;
        from[i][j] = "diag";
      } else if (L[i - 1][j] >= L[i][j - 1]) {
        L[i][j] = L[i - 1][j];
        from[i][j] = "up";
      } else {
        L[i][j] = L[i][j - 1];
        from[i][j] = "left";
      }
    }
  return { L, from, n, m };
}

function editTable() {
  const n = ED_A.length;
  const m = ED_B.length;
  const D = grid(n + 1, m + 1, (i, j) => (i === 0 ? j : j === 0 ? i : 0));
  const from = grid<GFrom | undefined>(n + 1, m + 1, (i, j) => (i === 0 && j > 0 ? "left" : j === 0 && i > 0 ? "up" : undefined));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      if (ED_A[i - 1] === ED_B[j - 1]) {
        D[i][j] = D[i - 1][j - 1];
        from[i][j] = "diag";
      } else {
        const opts: [number, GFrom][] = [
          [D[i - 1][j - 1], "diag"],
          [D[i - 1][j], "up"],
          [D[i][j - 1], "left"],
        ];
        const [best, f] = opts.reduce((x, y) => (y[0] < x[0] ? y : x));
        D[i][j] = best + 1;
        from[i][j] = f;
      }
    }
  return { D, from, n, m };
}

export function strSteps(v: StrVariant): StrStep[] {
  return v === "lcs" ? lcsSteps() : editSteps();
}

function lcsSteps(): StrStep[] {
  const { L, from, n, m } = lcsTable();
  const colHead = ["", ...LCS_B];
  const rowHead = ["", ...LCS_A];
  const filled = new Set<string>();
  const cells = (cur?: [number, number]) =>
    table(grid(n + 1, m + 1, (i, j) => (filled.has(`${i},${j}`) ? L[i][j] : undefined)), (i, j) => {
      const key = `${i},${j}`;
      const isCur = cur && cur[0] === i && cur[1] === j;
      let src = false;
      if (cur) {
        const [ci, cj] = cur;
        src = LCS_A[ci - 1] === LCS_B[cj - 1] ? i === ci - 1 && j === cj - 1 : (i === ci - 1 && j === cj) || (i === ci && j === cj - 1);
      }
      return { s: isCur ? "cur" : "", src, from: filled.has(key) ? from[i][j] : undefined };
    });
  const steps: StrStep[] = [];
  const push = (s: TableStep) => steps.push({ ...s, colHead, rowHead });
  push({
    cells: cells(),
    caption:
      "The longest common subsequence (LCS) of ABCBDAB and BDCABA: the longest sequence of letters that appears in both, in order, with skips allowed. `L[i][j]` is the LCS length of the first i letters of one string and the first j letters of the other.",
    readout: "rows: ABCBDAB · columns: BDCABA",
  });
  for (let i = 0; i <= n; i++) filled.add(`${i},0`);
  for (let j = 0; j <= m; j++) filled.add(`0,${j}`);
  push({ cells: cells(), caption: "Row 0 and column 0 stand for an empty prefix (–). An empty string has nothing in common with anything: 0.", readout: "L[0][j] = L[i][0] = 0" });
  filled.add("1,1");
  push({
    cells: cells([1, 1]),
    caption:
      "A against B: the last letters differ, so one of them is not in the LCS. Drop A (the cell above) or drop B (the cell to the left), and keep the larger. Both are 0.",
    readout: "A ≠ B: L[1][1] = max(L[0][1], L[1][0]) = 0",
  });
  for (let j = 2; j <= 3; j++) filled.add(`1,${j}`);
  filled.add("1,4");
  push({
    cells: cells([1, 4]),
    caption: "A against BDCA: the last letters are both A. Then A ends a common subsequence: take the LCS of the shorter prefixes (above-left) and add 1.",
    readout: "A = A: L[1][4] = L[0][3] + 1 = 1",
  });
  for (let j = 5; j <= m; j++) filled.add(`1,${j}`);
  push({ cells: cells(), caption: "The rest of row 1. The arrow in each cell shows which rule gave its value.", readout: `row A: ${L[1].join(", ")}` });
  for (let i = 2; i <= n; i++) {
    for (let j = 1; j <= m; j++) filled.add(`${i},${j}`);
    push({
      cells: cells(),
      caption:
        i === 2
          ? "Row B. Matching letters (B with B) take the diagonal and add 1; the others copy the larger of above and left."
          : i === n
            ? "The last row. Every cell was filled once, from three neighbours that were already filled."
            : `Row ${LCS_A[i - 1]}, in the same way.`,
      readout: `row ${LCS_A[i - 1]}: ${L[i].join(", ")}`,
    });
  }
  push({
    cells: table(grid(n + 1, m + 1, (i, j) => L[i][j]), (i, j) => ({ from: from[i][j], s: i === n && j === m ? "cur" : "" })),
    caption: `The LCS length is the bottom-right cell: ${L[n][m]}. The table has (n + 1) × (m + 1) cells and each takes O(1) time, so O(n × m). The arrows are enough to rebuild an LCS itself (lesson 9).`,
    readout: `LCS length = ${L[n][m]}`,
    verdict: { ok: true, text: String(L[n][m]) },
  });
  return steps;
}

function editSteps(): StrStep[] {
  const { D, from, n, m } = editTable();
  const colHead = ["", ...ED_B];
  const rowHead = ["", ...ED_A];
  const steps: StrStep[] = [];
  const cells = (upto: number, cur?: number) =>
    table(grid(n + 1, m + 1, (i, j) => (i <= upto ? D[i][j] : undefined)), (i, j) => ({
      s: i === cur && j > 0 ? "path" : "",
      from: i <= upto ? from[i][j] : undefined,
    }));
  const push = (s: TableStep) => steps.push({ ...s, colHead, rowHead });
  push({
    cells: cells(0),
    caption:
      "Edit distance from horse to ros: the fewest inserts, deletes and replacements. `D[i][j]` is the distance from the first i letters of horse to the first j letters of ros. Row 0: turn nothing into j letters with j inserts.",
    readout: "D[0][j] = j · D[i][0] = i",
  });
  const why: Record<number, string> = {
    1: "Row h. h is not r: replace (diagonal), delete h (above) or insert (left), whichever cell is smallest, plus 1.",
    2: "Row o. In column o the letters match, so `D[2][2]` copies the diagonal with no edit: 1.",
    3: "Row r. In column r the letters match again: copy the diagonal.",
    4: "Row s. In the last column both words end in s, so that cell copies the diagonal: 2.",
    5: "Row e. e matches nothing, so each cell is 1 + the smallest of its three neighbours. The last cell comes from above: delete e.",
  };
  for (let i = 1; i <= n; i++) push({ cells: cells(i, i), caption: why[i], readout: `row ${ED_A[i - 1]}: ${D[i].join(", ")}` });
  push({
    cells: table(grid(n + 1, m + 1, (i, j) => D[i][j]), (i, j) => ({ from: from[i][j], s: i === n && j === m ? "cur" : "" })),
    caption: `The edit distance is ${D[n][m]}: for example replace h with r, delete r, delete e. A diagonal arrow is a replacement (or a free match), an up arrow a delete, a left arrow an insert.`,
    readout: `edit distance = ${D[n][m]}`,
    verdict: { ok: true, text: String(D[n][m]) },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-8.1 and 9.1: the 0/1 knapsack */

export type BagVariant = "table" | "rtl" | "ltr";
export const ITEMS: { name: string; w: number; v: number }[] = [
  { name: "A", w: 1, v: 1 },
  { name: "B", w: 3, v: 4 },
  { name: "C", w: 4, v: 5 },
  { name: "D", w: 5, v: 7 },
];
export const CAP = 7;

export type BagStep = TableStep & { rowHead: (string | number | null)[]; item?: number };

function bagTable() {
  const best = [Array(CAP + 1).fill(0) as number[]];
  for (const it of ITEMS) {
    const prev = best[best.length - 1];
    best.push(prev.map((x, w) => (w >= it.w ? Math.max(x, prev[w - it.w] + it.v) : x)));
  }
  return best;
}

export function bagSteps(v: BagVariant): BagStep[] {
  return v === "table" ? bagFull() : bagRow(v === "rtl");
}

function bagFull(): BagStep[] {
  const best = bagTable();
  const rowHead = ["", ...ITEMS.map((it) => it.name)];
  const steps: BagStep[] = [];
  const cells = (upto: number, cur?: [number, number], partial?: number) =>
    table(
      best.map((row, i) => row.map((x, w) => (i < upto || (i === upto && (partial === undefined || w <= partial)) ? x : undefined))),
      (i, w) => {
        if (cur && i === cur[0] && w === cur[1]) return { s: "cur" };
        const it = cur ? ITEMS[cur[0] - 1] : undefined;
        const src = !!cur && i === cur[0] - 1 && (w === cur[1] || (it !== undefined && cur[1] >= it.w && w === cur[1] - it.w));
        return { src };
      },
    );
  const push = (s: TableStep, item?: number) => steps.push({ ...s, rowHead, item });
  push({
    cells: cells(0),
    caption:
      "Four items, a bag that holds 7 kg, and each item can be taken once (the 0/1 knapsack). `best[i][x]` is the best value using only the first i items, in a bag of x kg. Row 0 uses no items: 0.",
    readout: "best[i][x] = the better of best[i − 1][x] and value + best[i − 1][x − weight]",
  });
  push({ cells: cells(1), caption: "Row A (1 kg, ₹1): any bag of at least 1 kg can hold A. Worth 1.", readout: `row A: ${best[1].join(", ")}` }, 1);
  push(
    {
      cells: cells(2, [2, 4], 4),
      caption:
        "Row B (3 kg, ₹4), bag of 4 kg. Skip B: the best without it is the cell above, 1. Take B: it uses 3 kg, leaving 1 kg for the earlier items, so ₹4 + `best[1][1]` = 5 (both dashed). Take the larger.",
      readout: "best[2][4] = max(1, 4 + best[1][1]) = max(1, 5) = 5",
    },
    2,
  );
  push({ cells: cells(2), caption: "The rest of row B in the same way. Bags under 3 kg cannot hold B, so they copy the row above.", readout: `row B: ${best[2].join(", ")}` }, 2);
  push(
    {
      cells: cells(3, [3, 7], 7),
      caption:
        "Row C (4 kg, ₹5), bag of 7 kg. Skip C: 5 (above). Take C: 3 kg are left, and the best of A and B in 3 kg is 4. So 5 + 4 = 9.",
      readout: "best[3][7] = max(5, 5 + best[2][3]) = max(5, 9) = 9",
    },
    3,
  );
  push({ cells: cells(3), caption: "Row C, all of it.", readout: `row C: ${best[3].join(", ")}` }, 3);
  push(
    {
      cells: cells(4, [4, 7], 7),
      caption:
        "Row D (5 kg, ₹7), bag of 7 kg. Skip D: 9. Take D: 2 kg are left, worth 1 with A. 7 + 1 = 8 is less than 9, so skip D, even though it is the most valuable item.",
      readout: "best[4][7] = max(9, 7 + best[3][2]) = max(9, 8) = 9",
    },
    4,
  );
  push(
    {
      cells: cells(4),
      caption:
        "The answer is the bottom-right cell: 9 (items B and C). Each cell reads two cells of the row above, so the table costs O(n × capacity) time.",
      readout: "best value = 9",
      verdict: { ok: true, text: "₹9" },
    },
    4,
  );
  return steps;
}

function bagRow(rtl: boolean): BagStep[] {
  const best = bagTable();
  const item = rtl ? 3 : 2; // C right to left, or B left to right
  const it = ITEMS[item - 1];
  const row = best[item - 1].slice();
  const done = new Set<number>();
  const steps: BagStep[] = [];
  const cells = (cur?: number, src: number[] = [], bad?: number) => [
    row.map((x, w) => ({
      v: x,
      s: (w === bad ? "bad" : w === cur ? "cur" : done.has(w) ? "done" : "") as GCell["s"],
      src: src.includes(w),
    })),
  ];
  const push = (s: TableStep) => steps.push({ ...s, rowHead: [it.name], item });
  push({
    cells: cells(),
    caption: rtl
      ? `One row is enough. The list holds row B: [${row.join(", ")}]. Add item C (4 kg, ₹5) by going from the largest bag down. A cell reads itself (the old value, which is "above") and a cell further left.`
      : `Now go left to right instead. The list holds row A: [${row.join(", ")}]. Add item B (3 kg, ₹4), from the smallest bag up.`,
    readout: rtl ? "for x in range(cap, w - 1, -1)" : "for x in range(w, cap + 1)   # wrong order for 0/1",
  });
  const order = rtl ? Array.from({ length: CAP - it.w + 1 }, (_, k) => CAP - k) : Array.from({ length: CAP - it.w + 1 }, (_, k) => it.w + k);
  for (const x of order) {
    const old = row[x];
    const left = row[x - it.w];
    const leftDone = done.has(x - it.w);
    row[x] = Math.max(old, left + it.v);
    done.add(x);
    const twice = !rtl && leftDone && row[x] === left + it.v && row[x] > old;
    push({
      cells: cells(x, [x - it.w], twice ? x : undefined),
      caption: rtl
        ? `Bag of ${x} kg: keep ${old}, or take C and add the value at ${x - 4} kg, ${left}. That cell is still row B's value, because the loop has not reached it yet.`
        : twice
          ? `Bag of ${x} kg: the cell at ${x - 3} kg was already updated in this pass, and it already contains B. Adding B again gives ${row[x]}: B is used twice.`
          : `Bag of ${x} kg: keep ${old}, or take B: ${it.v} + ${left} = ${left + it.v}.`,
      readout: `row[${x}] = max(${old}, ${it.v} + row[${x - it.w}]) = ${row[x]}`,
      verdict: twice ? { ok: false, text: "B taken twice" } : undefined,
    });
  }
  push({
    cells: cells(),
    caption: rtl
      ? "The list is now row C, the same as in the full table. Going right to left means every cell reads values from before this item, so each item is used at most once."
      : "Left to right lets an item be used again and again. That is wrong for the 0/1 knapsack, but it is exactly right when there are unlimited copies (the unbounded knapsack, or paying with coins).",
    readout: `row = [${row.join(", ")}]`,
    verdict: rtl ? { ok: true, text: "each item once" } : { ok: false, info: true, text: "unbounded: any number of copies" },
  });
  return steps;
}

/* ---------------------------------------------------------------- DYNP-9.1: walking back */

export type BackVariant = "lcs" | "bag";
export type BackStep = TableStep & { colHead?: string[]; rowHead: (string | number | null)[]; picked: string };

export function backSteps(v: BackVariant): BackStep[] {
  return v === "lcs" ? backLcs() : backBag();
}

function backLcs(): BackStep[] {
  const { L, from, n, m } = lcsTable();
  const colHead = ["", ...LCS_B];
  const rowHead = ["", ...LCS_A];
  const steps: BackStep[] = [];
  const path: [number, number][] = [];
  const taken = new Set<string>();
  const cells = (cur?: [number, number]) =>
    table(grid(n + 1, m + 1, (i, j) => L[i][j]), (i, j) => {
      const key = `${i},${j}`;
      const onPath = path.some(([a, b]) => a === i && b === j);
      return {
        from: from[i][j],
        s: cur && cur[0] === i && cur[1] === j ? "cur" : taken.has(key) ? "found" : onPath ? "path" : "",
      };
    });
  let letters = "";
  steps.push({
    cells: cells(),
    colHead,
    rowHead,
    picked: "",
    caption:
      "The table from lesson 7 gives the LCS length, 4, but not the letters. Walk back from the bottom-right cell, following the arrows, and collect a letter at every diagonal arrow.",
    readout: "letters: none yet",
  });
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const f = from[i][j];
    const here: [number, number] = [i, j];
    let caption: string;
    if (f === "diag") {
      letters = LCS_A[i - 1] + letters;
      taken.add(`${i},${j}`);
      caption = `${LCS_A[i - 1]} = ${LCS_B[j - 1]}: this letter is in the LCS. Collect it and move diagonally.`;
    } else if (f === "up") caption = `${LCS_A[i - 1]} ≠ ${LCS_B[j - 1]}, and the value came from above: ${LCS_A[i - 1]} is not used here. Move up.`;
    else caption = `${LCS_A[i - 1]} ≠ ${LCS_B[j - 1]}, and the value came from the left: ${LCS_B[j - 1]} is not used here. Move left.`;
    steps.push({ cells: cells(here), colHead, rowHead, picked: letters, caption, readout: `letters (collected from the end): ${letters || "none yet"}` });
    path.push(here);
    if (f === "diag") {
      i--;
      j--;
    } else if (f === "up") i--;
    else j--;
  }
  steps.push({
    cells: cells(),
    colHead,
    rowHead,
    picked: letters,
    caption: `The walk reached row 0 or column 0, so it stops. The letters were collected from the end, so read them in the order shown: ${letters}. The walk takes at most n + m steps. Breaking ties the other way (left before up) can give a different LCS of the same length.`,
    readout: `LCS = ${letters}`,
    verdict: { ok: true, text: letters },
  });
  return steps;
}

function backBag(): BackStep[] {
  const best = bagTable();
  const rowHead = ["", ...ITEMS.map((it) => it.name)];
  const steps: BackStep[] = [];
  const path: [number, number][] = [];
  const taken = new Set<string>();
  let picked: string[] = [];
  const cells = (cur?: [number, number], src?: [number, number]) =>
    table(best, (i, w) => ({
      s: cur && cur[0] === i && cur[1] === w ? "cur" : taken.has(`${i},${w}`) ? "found" : path.some(([a, b]) => a === i && b === w) ? "path" : "",
      src: !!src && src[0] === i && src[1] === w,
    }));
  steps.push({
    cells: cells(),
    rowHead,
    picked: "",
    caption:
      "The knapsack table from lesson 8, with every row kept. The best value is 9. To find the items, start at the bottom-right cell and compare each cell with the one above it.",
    readout: "items: none yet",
  });
  let x = CAP;
  for (let i = ITEMS.length; i >= 1; i--) {
    const it = ITEMS[i - 1];
    const same = best[i][x] === best[i - 1][x];
    const here: [number, number] = [i, x];
    if (!same) {
      taken.add(`${i},${x}`);
      picked = [it.name, ...picked];
    }
    steps.push({
      cells: cells(here, [i - 1, x]),
      rowHead,
      picked: picked.join(" + "),
      caption: same
        ? `Row ${it.name}, ${x} kg: ${best[i][x]}, the same as the cell above (dashed). The best value is possible without ${it.name}, so skip it and move up.`
        : `Row ${it.name}, ${x} kg: ${best[i][x]}, more than the ${best[i - 1][x]} above. ${it.name} must have been taken. Collect it and move up to row ${i - 1 === 0 ? "0" : ITEMS[i - 2].name} at ${x} − ${it.w} = ${x - it.w} kg.`,
      readout: `items: ${picked.join(" + ") || "none yet"}`,
    });
    path.push(here);
    if (!same) x -= it.w;
  }
  path.push([0, x]);
  steps.push({
    cells: cells(),
    rowHead,
    picked: picked.join(" + "),
    caption:
      "Row 0 reached: the choice is B and C, 7 kg, ₹9. The walk is one step per item, O(n), but it needs every row of the table. With one row (lesson 8) the choices are lost, so keep the rows, or keep one bit per cell that says \"taken\".",
    readout: "items: B + C = 7 kg, ₹9",
    verdict: { ok: true, text: "B + C" },
  });
  return steps;
}
