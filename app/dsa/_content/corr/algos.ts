// Step generators for the CORR figures. Captions use `backticks` for code.

import { plural, py, type CellState } from "../kit";

/* CORR-1.1: checking a function against its specification */

export type SpecStep = {
  a: number[] | null;
  states: CellState[];
  ret?: string;
  checks?: { ok: boolean; text: string }[];
  pre?: boolean;
  caption: string;
};

const SPEC_INPUTS = [[4, 9, 2], [7], [3, 3, 1], [-4, -2, -9], []];

export function specSteps(fixed: boolean): SpecStep[] {
  const steps: SpecStep[] = [
    {
      a: null,
      states: [],
      caption:
        "The spec for `largest(a)`. Input condition: `a` is a list of numbers that is not empty. Promise: return a value `m` where (1) `m` is in `a`, and (2) no value in `a` is bigger than `m`.",
    },
  ];
  for (const a of SPEC_INPUTS) {
    if (a.length === 0) {
      steps.push({
        a,
        states: [],
        pre: false,
        ret: fixed ? "IndexError" : "0",
        caption: `\`a = []\` breaks the input condition, because the list is empty. So the spec promises nothing here. ${
          fixed ? "This version raises an `IndexError`, and that is allowed." : "This version returns 0, and that is allowed too."
        } Code that calls \`largest\` must not pass an empty list.`,
      });
      continue;
    }
    const m = fixed ? Math.max(...a) : Math.max(0, ...a);
    const inA = a.includes(m);
    const top = a.every((x) => x <= m);
    const at = a.indexOf(m);
    steps.push({
      a,
      states: a.map((_, k) => (k === at ? "found" : "")),
      ret: String(m),
      pre: true,
      checks: [
        { ok: inA, text: inA ? `1. ${m} is in a` : `1. ${m} is not in a` },
        { ok: top, text: top ? "2. nothing is bigger" : "2. a bigger value exists" },
      ],
      caption: inA
        ? `\`a = ${py(a)}\` meets the input condition. \`largest\` returns ${m}. Both promises hold.`
        : `\`a = ${py(a)}\` meets the input condition. \`largest\` returns ${m}, but ${m} is not in the list. Promise 1 is broken, so the function is wrong.`,
    });
  }
  steps.push({
    a: null,
    states: [],
    caption: fixed
      ? "With `best = a[0]`, every input that meets the condition gets a correct answer. Five inputs are not a proof, though. The next lesson proves it for every list."
      : "One input is enough to show that `best = 0` is wrong: on a list of negative numbers it returns 0, which is not in the list. Switch to `best = a[0]` to compare.",
  });
  return steps;
}

/* CORR-2.1: the running maximum and its invariant */

export type InvStep = {
  i: number;
  best: number | null;
  states: CellState[];
  bad: boolean;
  caption: string;
  verdict?: { ok: boolean; text: string };
};

export function maxInvSteps(a: number[], bug: boolean): InvStep[] {
  const n = a.length;
  const steps: InvStep[] = [];
  const seenMax = (i: number) => (i === 0 ? null : Math.max(...a.slice(0, i)));
  const holds = (i: number, best: number) => i > 0 && best === seenMax(i);
  const v = (ok: boolean): InvStep["verdict"] => (ok ? { ok: true, text: "invariant holds" } : { ok: false, text: "invariant is false" });
  // Seen values sit under the window bracket; the value being compared is the current cell.
  const seen = (i: number, mid?: number): CellState[] => a.map((_, k) => (k === mid ? "mid" : ""));

  let best: number;
  let i: number;
  if (!bug) {
    best = a[0];
    i = 1;
    steps.push({
      i, best, states: seen(i), bad: false,
      caption: `Start with \`best = a[0] = ${best}\` and \`i = 1\`. Invariant: \`best\` is the largest of \`a[0..i-1]\`, the values already seen. Only one value has been seen, so it is true.`,
      verdict: v(true),
    });
  } else {
    best = 0;
    i = 0;
    steps.push({
      i, best, states: seen(i), bad: true,
      caption: "This version starts with `best = 0` and `i = 0`. No values have been seen yet, so there is no largest seen value, and the invariant cannot be true. Step on to see what goes wrong.",
      verdict: v(false),
    });
  }
  for (; i < n; i++) {
    const x = a[i];
    const bigger = x > best;
    steps.push({
      i, best, states: seen(i, i), bad: !holds(i, best),
      caption: `Compare \`a[${i}] = ${x}\` with \`best = ${best}\`. ${bigger ? `${x} is bigger, so it becomes the new best.` : `${x} is not bigger, so \`best\` stays.`}`,
      verdict: v(holds(i, best)),
    });
    if (bigger) best = x;
    const ok = holds(i + 1, best);
    steps.push({
      i: i + 1, best, states: seen(i + 1), bad: !ok,
      caption: ok
        ? `\`i = ${i + 1}\`. \`best = ${best}\` is the largest of the ${plural(i + 1, "value")} seen. The pass kept the invariant true.`
        : `\`i = ${i + 1}\`. The largest value seen is ${seenMax(i + 1)}, but \`best = ${best}\`. The invariant is still false.`,
      verdict: v(ok),
    });
  }
  const right = best === Math.max(...a);
  steps.push({
    i: n, best, states: seen(n), bad: !right,
    caption: right
      ? `The loop ends with \`i = ${n}\`. The invariant says \`best\` is the largest of \`a[0..${n - 1}]\`, which is the whole list. So returning \`best = ${best}\` is correct.`
      : `The loop ends and returns ${best}. The right answer is ${Math.max(...a)}. The invariant was false from the start, and nothing ever made it true.`,
    verdict: right ? { ok: true, text: `returns ${best}` } : { ok: false, text: `wrong: returns ${best}` },
  });
  return steps;
}

/* CORR-3.1: 1 + 3 + 5 + … + (2n − 1) = n², one layer at a time */

export type SquareStep = { n: number; caption: string };

export function squareSteps(N: number): SquareStep[] {
  const odd = (k: number) => 2 * k - 1;
  const sum = (n: number) => Array.from({ length: n }, (_, k) => odd(k + 1)).join(" + ");
  const steps: SquareStep[] = [
    { n: 0, caption: "Claim: for every n of 1 or more, the first n odd numbers add up to n² (n times n). So 1 + 3 + … + (2n − 1) = n². The figure adds one odd number per step." },
    { n: 1, caption: "Base case, n = 1: the sum is just 1, and 1² = 1. The claim is true for n = 1." },
  ];
  for (let n = 2; n <= N; n++) {
    steps.push({
      n,
      caption:
        n === 2
          ? "Inductive step: suppose the first k odd numbers make a k × k square. The next odd number is 2k + 1. That is k cells for a new row, k cells for a new column, and 1 for the corner. Here k = 1, and 3 cells turn the 1 × 1 square into a 2 × 2 square."
          : `Same step with k = ${n - 1}: the next odd number is ${odd(n)} = ${n - 1} + ${n - 1} + 1. It turns the ${n - 1} × ${n - 1} square into a ${n} × ${n} square. So ${sum(n)} = ${n * n}.`,
    });
  }
  steps.push({
    n: N,
    caption: `The base case covers n = 1. The step takes the claim from any n to n + 1. Together they cover every n: 1, then 2, then 3, and so on with no gaps. The figure stops at ${N}, but the proof does not.`,
  });
  return steps;
}

/* CORR-4.1: a counterexample to "always take the biggest coin" */

export type CoinStep = { greedy: number[]; best: number[] | null; left: number; caption: string; verdict?: { ok: boolean; text: string } };

export function fewestCoins(coins: number[], amount: number): number[] {
  const best: (number[] | null)[] = [[]];
  for (let x = 1; x <= amount; x++) {
    let pick: number[] | null = null;
    for (const c of coins) {
      const prev = x - c >= 0 ? best[x - c] : null;
      if (prev && (!pick || prev.length + 1 < pick.length)) pick = [...prev, c];
    }
    best.push(pick);
  }
  return [...(best[amount] ?? [])].sort((p, q) => q - p);
}

export function coinSteps(coins: number[], amount: number): CoinStep[] {
  const steps: CoinStep[] = [
    {
      greedy: [], best: null, left: amount,
      caption: `Coins: ${coins.join(", ")}. Make ${amount} with as few coins as possible. Claim to test: "always take the biggest coin that fits" gives the fewest coins.`,
    },
  ];
  const g: number[] = [];
  let left = amount;
  while (left > 0) {
    const c = Math.max(...coins.filter((x) => x <= left));
    g.push(c);
    left -= c;
    steps.push({ greedy: [...g], best: null, left, caption: `The biggest coin that fits in ${left + c} is ${c}. Take it. ${left === 0 ? "Nothing is left." : `${left} is left.`}` });
  }
  const best = fewestCoins(coins, amount);
  const same = best.length === g.length;
  steps.push({
    greedy: g, best, left: 0,
    caption: same
      ? `Greedy used ${plural(g.length, "coin")}. Checking every way to make ${amount} shows that ${g.length} is the fewest. The claim holds here, but one example proves nothing.`
      : `Greedy used ${plural(g.length, "coin")}, but ${best.join(" + ")} uses only ${best.length}. This one amount is a counterexample: the claim is false.`,
    verdict: same ? { ok: true, text: "greedy is best here" } : { ok: false, text: "counterexample" },
  });
  return steps;
}

/* CORR-5.1: stress testing a fast function against a slow one, then shrinking the failure */

export type StressRow = { a: number[]; fast: boolean; slow: boolean };
export type StressStep = { a: number[] | null; rows: StressRow[]; mark: number[]; caption: string; phase: "test" | "shrink"; verdict?: { ok: boolean; text: string } };

const fastDup = (a: number[]) => a.some((x, i) => i > 0 && a[i - 1] === x);
const slowDup = (a: number[]) => new Set(a).size < a.length;

export function stressSteps(): StressStep[] {
  const lists = [
    [3, 1, 4],
    [2, 2, 5],
    [6, 1, 8, 3],
    [5, 5],
    [4, 1, 7, 1, 9],
  ];
  const steps: StressStep[] = [
    {
      a: null, rows: [], mark: [], phase: "test",
      caption: "`fast(a)` says whether a list has a repeated value, but it only compares neighbours. `slow(a)` compares every pair, so it is surely right. Run both on small random lists and compare the answers.",
    },
  ];
  const rows: StressRow[] = [];
  for (const a of lists) {
    const r = { a, fast: fastDup(a), slow: slowDup(a) };
    rows.push(r);
    const agree = r.fast === r.slow;
    const dupVal = a.find((x, i) => a.indexOf(x) !== i);
    steps.push({
      a, rows: [...rows], phase: "test",
      mark: agree ? [] : a.flatMap((x, k) => (x === dupVal ? [k] : [])),
      caption: agree
        ? `\`${py(a)}\`: both say ${r.slow ? "True" : "False"}. They agree, so try another list.`
        : `\`${py(a)}\`: \`slow\` says True, but \`fast\` says False. The two 1s are not next to each other. We have found a failing input.`,
      verdict: agree ? { ok: true, text: "agree" } : { ok: false, text: "disagree" },
    });
  }
  const shrink: { a: number[]; caption: string }[] = [
    { a: [1, 7, 1, 9], caption: "Now make the failing input smaller, so the bug is easy to see. Remove the 4. Still a failure, so keep the change." },
    { a: [1, 7, 1], caption: "Remove the 9. Still a failure. Keep it." },
    { a: [1, 7, 1], caption: "Removing the 7 would give `[1, 1]`, where the 1s are neighbours, and `fast` gets that right. Removing a 1 leaves no repeat at all. So `[1, 7, 1]` is as small as it gets." },
  ];
  for (const s of shrink) {
    steps.push({
      a: s.a, rows: [...rows], phase: "shrink",
      mark: s.a.flatMap((x, k) => (x === 1 ? [k] : [])),
      caption: s.caption,
      verdict: { ok: false, text: "still fails" },
    });
  }
  steps.push({
    a: [1, 7, 1], rows: [...rows], phase: "shrink", mark: [0, 2],
    caption: "`[1, 7, 1]` shows the bug in one look: a repeated value with something between the two copies. That is the test to add, and the case to think about when you fix the code.",
    verdict: { ok: false, text: "smallest failing input" },
  });
  return steps;
}
