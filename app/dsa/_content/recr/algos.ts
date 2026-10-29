// Step generators for the RECR figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import type { Frame, GCell, Mark, TNode } from "../../_components/Stages";
import { plural, py } from "../kit";

/* RECR-1.1: a problem that shrinks to its base case */

export const SUM_REC = `def total(a):
    if not a:               # base case
        return 0
    return a[0] + total(a[1:])`;

export const SUM_BROKEN = `def total(a):
    return a[0] + total(a[1:])`;

export type ShrinkStep = { nodes: TNode[]; line: number | null; caption: string; verdict?: { ok: boolean; text: string } };

export function shrinkSteps(broken: boolean): ShrinkStep[] {
  const a = [4, 7, 1, 6];
  const lists = a.map((_, k) => a.slice(k)).concat([[]]);
  const out: ShrinkStep[] = [];
  const node = (k: number, state: Mark | "hidden", ret?: string): TNode => ({
    id: `n${k}`,
    label: `total(${py(lists[k])})${ret ? ` ${ret}` : ""}`,
    parent: k ? `n${k - 1}` : undefined,
    state,
  });
  if (broken) {
    for (let d = 0; d < lists.length; d++) {
      out.push({
        nodes: lists.map((_, k) => node(k, k > d ? "hidden" : k === d ? "cur" : "")),
        line: 2,
        caption: d === 0 ? "This version has no base case. Each call still makes a smaller problem." : d < lists.length - 1 ? `\`total(${py(lists[d])})\` calls \`total(${py(lists[d + 1])})\`.` : "Now the list is empty, but nothing checks for that. `a[0]` does not exist.",
      });
    }
    out.push({
      nodes: lists.map((_, k) => node(k, k === lists.length - 1 ? "bad" : "")),
      line: 2,
      caption: "`a[0]` on an empty list raises `IndexError`. Without a base case the recursion has no way to stop. With a version that never shrinks, such as calling `total(a)` again, Python stops it after about 1,000 calls with `RecursionError`.",
      verdict: { ok: false, text: "IndexError" },
    });
    return out;
  }
  for (let d = 0; d < lists.length; d++) {
    const base = d === lists.length - 1;
    out.push({
      nodes: lists.map((_, k) => node(k, k > d ? "hidden" : k === d ? "cur" : "")),
      line: base ? 3 : 4,
      caption:
        d === 0
          ? `To add up ${py(a)}, take the first value, ${a[0]}, and add the total of the rest. The rest is a smaller problem of the same kind.`
          : base
            ? "The list is empty. This is the base case: its total is 0, with no further call."
            : `\`total(${py(lists[d])})\` waits for \`total(${py(lists[d + 1])})\`.`,
    });
  }
  let ret = 0;
  for (let d = lists.length - 1; d >= 0; d--) {
    if (d < lists.length - 1) ret += lists[d][0];
    out.push({
      nodes: lists.map((_, k) => node(k, k > d ? "done" : k === d ? "found" : "", k >= d ? `= ${k === d ? ret : lists[k].reduce((x, y) => x + y, 0)}` : undefined)),
      line: d === lists.length - 1 ? 3 : 4,
      caption: d === lists.length - 1 ? "The base case returns 0." : `${lists[d][0]} + ${ret - lists[d][0]} = ${ret}. \`total(${py(lists[d])})\` returns ${ret}.`,
    });
  }
  out.push({
    nodes: lists.map((_, k) => node(k, "done", `= ${lists[k].reduce((x, y) => x + y, 0)}`)),
    line: null,
    caption: `The answer is ${ret}. Each call trusted the call below it to be right, and only added one value. Lesson 1 shows why that trust is a proof by induction.`,
  });
  return out;
}

/* RECR-2.1: the call stack for factorial */

export const FACT = `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(4))`;

export type StackStep = { line: number; frames: Frame[]; caption: string; out?: string[] };

export function factSteps(): StackStep[] {
  const N = 4;
  const out: StackStep[] = [];
  const frames: Frame[] = [];
  out.push({ line: 6, frames: [], caption: "`print(fact(4))` needs the value of `fact(4)`, so Python calls it." });
  for (let n = N; n >= 1; n--) {
    frames.forEach((f) => (f.state = "wait"));
    frames.push({ name: `fact(${n})`, vars: `n=${n}`, state: "cur" });
    out.push({
      line: n <= 1 ? 2 : 4,
      frames: frames.map((f) => ({ ...f })),
      caption:
        n === 1
          ? "`fact(1)`: `n <= 1`, the base case. There are now 4 frames on the stack, one for each call that has not returned. Each has its own `n`."
          : `\`fact(${n})\` needs \`fact(${n - 1})\` before it can multiply. Python pushes a new frame on top. The frame below waits, remembering \`n = ${n}\` and where it stopped.`,
    });
  }
  let val = 1;
  for (let n = 1; n <= N; n++) {
    val = n === 1 ? 1 : val * n;
    frames[frames.length - 1] = { ...frames[frames.length - 1], state: "ret", ret: String(val) };
    out.push({
      line: n === 1 ? 3 : 4,
      frames: frames.map((f) => ({ ...f })),
      caption: n === 1 ? "`fact(1)` returns 1. Its frame is about to be removed." : `\`fact(${n})\` gets back ${val / n} and returns ${n} × ${val / n} = ${val}.`,
    });
    frames.pop();
    if (frames.length) frames[frames.length - 1].state = "cur";
  }
  out.push({ line: 6, frames: [], caption: `The stack is empty again. \`print\` shows ${val}. The stack was 4 frames deep at most: the depth of the recursion is the extra space it uses.`, out: [String(val)] });
  return out;
}

/* RECR-3.1: the Fibonacci tree, with and without a memo */

export const FIB = `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`;

export type FibStep = { nodes: TNode[]; calls: number; caption: string; memo: Record<number, number> };

export function fibSteps(memo: boolean, N = 5): FibStep[] {
  type Raw = { id: string; n: number; parent?: string; val?: number; hit?: boolean; dup?: boolean; end: number };
  const order: Raw[] = [];
  const known: Record<number, number> = {};
  const seen = new Set<number>();
  let next = 0;
  const visit = (n: number, parent?: string): number => {
    const id = `f${next++}`;
    const node: Raw = { id, n, parent, dup: seen.has(n) && n >= 2, end: order.length };
    order.push(node);
    seen.add(n);
    if (memo && n >= 2 && n in known) {
      node.hit = true;
      node.val = known[n];
      return known[n];
    }
    const v = n < 2 ? n : visit(n - 1, id) + visit(n - 2, id);
    node.val = v;
    node.end = order.length - 1;
    if (memo && n >= 2) known[n] = v;
    return v;
  };
  visit(N);
  const steps: FibStep[] = [];
  const mem: Record<number, number> = {};
  const nodesAt = (k: number): TNode[] =>
    order.map((o, j) => ({
      id: o.id,
      label: `fib(${o.n})`,
      parent: o.parent,
      state: j > k ? "hidden" : o.hit ? "found" : o.dup && !memo ? "dup" : j === k ? "cur" : "",
    }));
  steps.push({ nodes: nodesAt(0), calls: 1, memo: {}, caption: memo ? `\`fib(${N})\` with a memo: a dictionary that stores each answer the first time it is worked out.` : `\`fib(${N})\` calls \`fib(${N - 1})\` and \`fib(${N - 2})\`. Each of those calls two more, unless n < 2.` });
  for (let k = 1; k < order.length; k++) {
    const o = order[k];
    let cap: string;
    if (o.hit) cap = `\`fib(${o.n})\` is already in the memo (${o.val}). Return it at once. No calls below it.`;
    else if (o.dup && !memo) cap = `\`fib(${o.n})\` again. It was worked out already, but nothing remembers it, so the whole subtree is done again.`;
    else if (o.n < 2) cap = `\`fib(${o.n})\` is a base case: it returns ${o.n}.`;
    else cap = `\`fib(${o.n})\` calls \`fib(${o.n - 1})\` first.`;
    for (const p of order) if (memo && p.n >= 2 && !p.hit && p.end <= k && p.val !== undefined) mem[p.n] = p.val;
    steps.push({ nodes: nodesAt(k), calls: k + 1, memo: { ...mem }, caption: cap });
  }
  const repeats = order.filter((o) => o.dup).length;
  steps.push({
    nodes: order.map((o) => ({ id: o.id, label: `fib(${o.n}) = ${o.val}`, parent: o.parent, state: o.hit ? "found" : o.dup && !memo ? "dup" : "done" })),
    calls: order.length,
    memo: { ...mem },
    caption: memo
      ? `${order.length} calls. Each fib(k) is worked out once, and each later request is a memo hit. That is O(n) calls, in step with n, instead of about 1.6ⁿ (n copies of 1.6 multiplied together).`
      : `${order.length} calls for fib(${N}), and ${plural(repeats, "subtree")} marked AGAIN were repeats. The tree roughly grows by 1.6 times for each step up in n, so fib(40) makes over 300 million calls.`,
  });
  return steps;
}

/* RECR-4.1: decision trees for subsets and permutations */

export type ChoiceStep = { nodes: TNode[]; path: string; found: string[]; caption: string };

export function subsetSteps(items = ["a", "b", "c"]): ChoiceStep[] {
  type Raw = { id: string; parent?: string; label: string; edge?: string; depth: number; pick: string[] };
  const order: Raw[] = [];
  const go = (i: number, pick: string[], id: string, parent?: string, edge?: string) => {
    order.push({ id, parent, label: i === items.length ? `{${pick.join(", ")}}` : i === 0 ? "start" : `{${pick.join(", ")}}`, edge, depth: i, pick });
    if (i === items.length) return;
    go(i + 1, [...pick, items[i]], `${id}1`, id, `take ${items[i]}`);
    go(i + 1, pick, `${id}0`, id, `skip ${items[i]}`);
  };
  go(0, [], "r");
  const steps: ChoiceStep[] = [];
  const found: string[] = [];
  order.forEach((o, k) => {
    const leaf = o.depth === items.length;
    if (leaf) found.push(`{${o.pick.join(", ")}}`);
    steps.push({
      nodes: order.map((p, j) => ({ id: p.id, label: p.label, parent: p.parent, edge: p.edge, state: j > k ? "hidden" : j === k ? (leaf ? "found" : "cur") : p.depth === items.length ? "found" : "" })),
      path: `{${o.pick.join(", ")}}`,
      found: found.slice(),
      caption:
        k === 0
          ? `For each of ${items.join(", ")}, make one choice: take it or skip it. Each path from the top to the bottom is one subset.`
          : leaf
            ? `All ${items.length} choices made. Record the subset {${o.pick.join(", ")}}${o.pick.length ? "" : ", the empty set"}. Then go back up and try the other branch.`
            : `${o.edge![0].toUpperCase()}${o.edge!.slice(1)}. The choice so far is {${o.pick.join(", ")}}.`,
    });
  });
  steps.push({ nodes: order.map((p) => ({ id: p.id, label: p.label, parent: p.parent, edge: p.edge, state: p.depth === items.length ? "found" : "done" })), path: "", found, caption: `${found.length} subsets = 2³ = 2 × 2 × 2. Each of n items doubles the number of paths, so there are 2ⁿ subsets (n twos multiplied together), and listing them takes O(n × 2ⁿ) time.` });
  return steps;
}

export function permSteps(items = [1, 2, 3]): ChoiceStep[] {
  type Raw = { id: string; parent?: string; label: string; edge?: string; depth: number; pick: number[] };
  const order: Raw[] = [];
  const go = (pick: number[], id: string, parent?: string, edge?: string) => {
    order.push({ id, parent, label: pick.length ? pick.join("") : "start", edge, depth: pick.length, pick });
    if (pick.length === items.length) return;
    for (const x of items) if (!pick.includes(x)) go([...pick, x], `${id}${x}`, id, `${x}`);
  };
  go([], "r");
  const steps: ChoiceStep[] = [];
  const found: string[] = [];
  order.forEach((o, k) => {
    const leaf = o.depth === items.length;
    if (leaf) found.push(o.pick.join(""));
    const left = items.filter((x) => !o.pick.includes(x));
    steps.push({
      nodes: order.map((p, j) => ({ id: p.id, label: p.label, parent: p.parent, edge: p.edge, state: j > k ? "hidden" : j === k ? (leaf ? "found" : "cur") : p.depth === items.length ? "found" : "" })),
      path: o.pick.join(", "),
      found: found.slice(),
      caption:
        k === 0
          ? `Build each order one place at a time. The first place can hold any of ${items.length} values.`
          : leaf
            ? `Every value is used: record the order ${o.pick.join(", ")}. Go back and try the next unused value one level up.`
            : `Place ${o.pick[o.pick.length - 1]}. Unused: ${left.join(", ")}. The next place has ${plural(left.length, "choice")}.`,
    });
  });
  steps.push({ nodes: order.map((p) => ({ id: p.id, label: p.label, parent: p.parent, edge: p.edge, state: p.depth === items.length ? "found" : "done" })), path: "", found, caption: `${found.length} orders = 3 × 2 × 1, written 3! (“3 factorial”). With n values there are n! = n × (n − 1) × … × 1 orders, so listing them is O(n × n!).` });
  return steps;
}

/* RECR-5.1: four queens with backtracking */

export type QueenStep = { cells: GCell[][]; caption: string; tried: number; verdict?: { ok: boolean; text: string } };

export function queenSteps(n = 4): QueenStep[] {
  const steps: QueenStep[] = [];
  const cols: number[] = [];
  let tried = 0;
  const board = (cur?: { r: number; c: number; s: Mark }): GCell[][] =>
    Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => {
        if (cur && cur.r === r && cur.c === c) return { v: "♛", s: cur.s };
        if (cols[r] === c) return { v: "♛", s: "done" as Mark };
        return { v: "" };
      }),
    );
  const clash = (r: number, c: number) => cols.findIndex((cc, rr) => rr < r && (cc === c || Math.abs(cc - c) === r - rr));
  steps.push({ cells: board(), tried, caption: "Place 4 queens on a 4 × 4 board so that no two share a row, a column or a diagonal. Place one queen per row, top to bottom." });
  let done = false;
  const place = (r: number) => {
    if (done) return;
    if (r === n) {
      done = true;
      steps.push({ cells: board(), tried, caption: `All ${n} queens are placed, with no clash. A solution: columns ${cols.map((c) => c).join(", ")}.`, verdict: { ok: true, text: "solution" } });
      return;
    }
    for (let c = 0; c < n && !done; c++) {
      tried++;
      const k = clash(r, c);
      if (k >= 0) {
        steps.push({ cells: board({ r, c, s: "bad" }), tried, caption: `Row ${r}, column ${c}: it clashes with the queen in row ${k} (${cols[k] === c ? "same column" : "same diagonal"}). Prune: do not go deeper from here.` });
        continue;
      }
      cols[r] = c;
      steps.push({ cells: board({ r, c, s: "cur" }), tried, caption: `Row ${r}, column ${c} is safe. Place a queen and go to row ${r + 1}.` });
      place(r + 1);
      if (!done) {
        cols.length = r;
        steps.push({ cells: board({ r, c, s: "out" }), tried, caption: `Nothing works in row ${r + 1} below this choice. Backtrack: take the queen off row ${r}, column ${c} (hatched), and try the next column.` });
      }
    }
  };
  place(0);
  steps.push({ cells: board(), tried, caption: `Found after ${tried} placements were tried. Trying every way to put one queen in each row would be 4⁴ = 256 boards (4 copies of 4 multiplied together). Pruning at the first clash skips whole subtrees.`, verdict: { ok: true, text: `${tried} tries` } });
  return steps;
}

/* RECR-6.1: flatten with recursion and with an explicit stack */

export type NestItem = number | NestItem[];
export const NESTED: NestItem[] = [1, [2, [3, 4]], 5];

const show = (x: NestItem): string => (Array.isArray(x) ? `[${x.map(show).join(", ")}]` : String(x));

export type FlatStep = { frames: Frame[]; out: number[]; caption: string; line: number };

export const FLAT_REC = `def flatten(x, out):
    for v in x:
        if isinstance(v, list):
            flatten(v, out)
        else:
            out.append(v)`;

export const FLAT_STACK = `def flatten(x):
    out = []
    stack = [x]
    while stack:
        v = stack.pop()
        if isinstance(v, list):
            stack.extend(reversed(v))
        else:
            out.append(v)
    return out`;

export function flatSteps(explicit: boolean): FlatStep[] {
  const steps: FlatStep[] = [];
  const out: number[] = [];
  if (!explicit) {
    const frames: Frame[] = [];
    const go = (x: NestItem[]) => {
      frames.forEach((f) => (f.state = "wait"));
      frames.push({ name: `flatten(${show(x)})`, state: "cur" });
      steps.push({ frames: frames.map((f) => ({ ...f })), out: out.slice(), line: 2, caption: frames.length === 1 ? "Call `flatten` on the whole list. Each inner list gets its own call, and its own frame on the stack." : `An inner list: call \`flatten(${show(x)})\`. The caller waits.` });
      for (const v of x) {
        if (Array.isArray(v)) {
          go(v);
          frames.pop();
          frames[frames.length - 1].state = "cur";
          steps.push({ frames: frames.map((f) => ({ ...f })), out: out.slice(), line: 4, caption: "The inner call is finished. Its frame is removed and the caller carries on from where it stopped." });
        } else {
          out.push(v);
          steps.push({ frames: frames.map((f) => ({ ...f })), out: out.slice(), line: 6, caption: `${v} is a number: append it.` });
        }
      }
    };
    go(NESTED);
    steps.push({ frames: [], out: out.slice(), line: 2, caption: "Done. The stack was as deep as the nesting: 3 frames here. A list nested 5,000 deep needs 5,000 frames, which is past Python's limit." });
    return steps;
  }
  const stack: NestItem[] = [NESTED];
  const frames = () => stack.map((v, k) => ({ name: show(v), state: (k === stack.length - 1 ? "cur" : "wait") as Frame["state"] }));
  steps.push({ frames: frames(), out: [], line: 3, caption: "Now the same job with a list used as a stack. Python's call stack is replaced by `stack`, which can grow as large as memory allows." });
  while (stack.length) {
    const v = stack.pop()!;
    if (Array.isArray(v)) {
      stack.push(...[...v].reverse());
      steps.push({ frames: frames(), out: out.slice(), line: 7, caption: `Pop ${show(v)}: a list. Push its items in reverse order, so that the first item is on top and comes off first.` });
    } else {
      out.push(v);
      steps.push({ frames: frames(), out: out.slice(), line: 9, caption: `Pop ${v}: a number. Append it.` });
    }
  }
  steps.push({ frames: [], out: out.slice(), line: 10, caption: "The stack is empty, and the order is the same as the recursive version. Each item is pushed and popped once: O(total items) time, with no depth limit." });
  return steps;
}
