// Step generators for the PYTH figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import { plural, py, recorder, statesFor, type CellState, type TraceStep } from "../kit";

export const A8 = [3, 11, 19, 25, 36, 47, 58, 70];

/* PYTH-1.1: indexing and slicing */

export type IdxStep = {
  states: CellState[];
  ptr: { at: number | null; show: string };
  win?: { lo: number; hi: number; label: string };
  slice?: { start: number; stop: number };
  result?: string;
  caption: string;
  verdict?: { ok: boolean; text: string };
};

export function indexSteps(a: number[]): IdxStep[] {
  const n = a.length;
  const none = { at: null, show: "" };
  const at = (i: number): IdxStep["states"] => a.map((_, k) => (k === i ? "found" : ""));
  return [
    { states: [], ptr: none, caption: `This list has ${n} values. The blue plates show each value's index, its position in the list. The first index is 0, so the last is ${n - 1}.` },
    { states: at(0), ptr: { at: 0, show: "0" }, caption: `\`a[0]\` is ${a[0]}, the first value.`, result: String(a[0]) },
    { states: at(3), ptr: { at: 3, show: "3" }, caption: `\`a[3]\` is ${a[3]}. Index 3 is the fourth value, because counting starts at 0.`, result: String(a[3]) },
    { states: at(n - 1), ptr: { at: n - 1, show: String(n - 1) }, caption: `\`a[${n - 1}]\` is ${a[n - 1]}. The last index is always \`len(a) - 1\`, which is ${n} − 1 = ${n - 1} here.`, result: String(a[n - 1]) },
    { states: at(n - 1), ptr: { at: n - 1, show: "-1" }, caption: `\`a[-1]\` is also ${a[n - 1]}. A negative index counts from the end. Python reads \`a[-1]\` as \`a[len(a) - 1]\`.`, result: String(a[n - 1]) },
    { states: at(n - 3), ptr: { at: n - 3, show: "-3" }, caption: `\`a[-3]\` is \`a[${n} - 3]\`, which is \`a[${n - 3}]\`, so ${a[n - 3]}.`, result: String(a[n - 3]) },
    {
      states: [],
      ptr: { at: n, show: String(n) },
      caption: `\`a[${n}]\` does not exist. The list stops at index ${n - 1}, so Python raises an \`IndexError\`. Reading one past the end is the most common index mistake.`,
      verdict: { ok: false, text: "IndexError" },
    },
  ];
}

export function sliceSteps(a: number[]): IdxStep[] {
  const n = a.length;
  const contiguous = (start: number, stop: number, label: string, caption: string): IdxStep => ({
    states: statesFor(n, start, stop - 1),
    ptr: { at: null, show: "" },
    win: { lo: start, hi: stop - 1, label },
    slice: { start, stop },
    result: py(a.slice(start, stop)),
    caption,
  });
  return [
    {
      states: [],
      ptr: { at: null, show: "" },
      caption: "A slice `a[start:stop]` makes a new list. It holds the values from index `start` up to, but not including, index `stop`.",
    },
    contiguous(2, 6, "a[2:6]", "`a[2:6]` takes indices 2, 3, 4 and 5. It stops before index 6. So the new list has 6 − 2 = 4 values."),
    contiguous(0, 3, "a[:3]", "Leave out `start`, and the slice starts at 0. `a[:3]` is the first 3 values."),
    contiguous(5, n, "a[5:]", `Leave out \`stop\`, and the slice runs to the end. \`a[5:]\` is every value from index 5 on.`),
    contiguous(n - 3, n, "a[-3:]", "Negative numbers work in slices too. `a[-3:]` starts 3 from the end, so it is the last 3 values."),
    {
      states: a.map((_, k) => (k % 2 ? "out" : "")),
      ptr: { at: null, show: "" },
      result: py(a.filter((_, k) => k % 2 === 0)),
      caption: "A third number sets the step. `a[::2]` takes every second value: indices 0, 2, 4 and 6. `a[::-1]` uses a step of −1, which gives the list in reverse order.",
    },
    {
      states: a.map(() => "out"),
      ptr: { at: null, show: "" },
      win: { lo: 3, hi: 2, label: "" },
      result: "[]",
      caption: "`a[3:3]` is empty, because it starts and stops at the same place. A slice never raises an `IndexError`: `a[5:100]` just stops at the end of the list.",
    },
  ];
}

/* PYTH-2.1: a for loop, a comprehension and a while loop, line by line */

export const LOOP_FOR = `a = [3, 8, 5, 6]
evens = []
for x in a:
    if x % 2 == 0:
        evens.append(x)
print(evens)`;

export const LOOP_COMP = `a = [3, 8, 5, 6]
evens = [x for x in a if x % 2 == 0]
print(evens)`;

export const LOOP_WHILE = `n = 37
steps = 0
while n > 1:
    n = n // 2
    steps += 1
print(steps)`;

export type LoopX = { at: number | null };

export function forSteps(): TraceStep<LoopX>[] {
  const a = [3, 8, 5, 6];
  const r = recorder<LoopX>();
  const evens: number[] = [];
  r.push(1, { a: py(a) }, "Line 1 makes the list.", { x: { at: null } });
  r.push(2, { a: py(a), evens: "[]" }, "Line 2 makes an empty list. We will add the even values to it.", { x: { at: null } });
  a.forEach((x, k) => {
    const base = { a: py(a), evens: py(evens), x: String(x) };
    r.push(3, base, `The loop takes the next value from \`a\` and calls it \`x\`. Now \`x = ${x}\`.`, { x: { at: k } });
    const even = x % 2 === 0;
    r.push(4, base, `Is \`${x} % 2 == 0\`? The \`%\` sign gives the remainder after dividing. ${x} % 2 is ${x % 2}, so ${even ? "yes, it is even." : "no, it is odd. Skip line 5."}`, { x: { at: k } });
    if (even) {
      evens.push(x);
      r.push(5, { ...base, evens: py(evens) }, `Add ${x} to the end of \`evens\`.`, { x: { at: k } });
    }
  });
  r.push(6, { a: py(a), evens: py(evens), x: String(a[a.length - 1]) }, `There are no values left, so the loop ends. Line 6 prints \`${py(evens)}\`. Notice that \`x\` still exists after the loop, holding the last value.`, {
    x: { at: null },
    out: [py(evens)],
  });
  return r.steps;
}

export function compSteps(): TraceStep<LoopX>[] {
  const a = [3, 8, 5, 6];
  const r = recorder<LoopX>();
  const evens: number[] = [];
  r.push(1, { a: py(a) }, "The same task, written as a list comprehension.", { x: { at: null } });
  a.forEach((x, k) => {
    const even = x % 2 === 0;
    if (even) evens.push(x);
    r.push(2, { a: py(a), "(building)": py(evens) }, `Inside the brackets, \`x\` takes each value in turn. \`x = ${x}\`: ${even ? `it is even, so ${x} goes into the new list.` : "it is odd, so the `if` part leaves it out."}`, { x: { at: k } });
  });
  r.push(2, { a: py(a), evens: py(evens) }, "When every value has been checked, the finished list is stored in `evens`. Here `x` lives only inside the brackets.", { x: { at: null } });
  r.push(3, { a: py(a), evens: py(evens) }, `Line 3 prints \`${py(evens)}\`. Same result, one line instead of four.`, { x: { at: null }, out: [py(evens)] });
  return r.steps;
}

export function whileSteps(): TraceStep<LoopX>[] {
  const r = recorder<LoopX>();
  let n = 37;
  let steps = 0;
  r.push(1, { n: String(n) }, "A `while` loop repeats as long as its condition is true. We do not know in advance how many times it will run.");
  r.push(2, { n: String(n), steps: "0" }, "`steps` counts the passes.");
  while (true) {
    const go = n > 1;
    r.push(3, { n: String(n), steps: String(steps) }, `Is \`${n} > 1\`? ${go ? "Yes, so run the body." : "No, so the loop ends."}`);
    if (!go) break;
    const before = n;
    n = Math.floor(n / 2);
    r.push(4, { n: String(n), steps: String(steps) }, `\`//\` divides and rounds down: \`${before} // 2 = ${n}\`.`);
    steps++;
    r.push(5, { n: String(n), steps: String(steps) }, `\`steps\` is now ${steps}.`);
  }
  r.push(6, { n: String(n), steps: String(steps) }, `It prints ${steps}. Halving 37 down to 1 takes ${plural(steps, "step")}. You will meet this count again: it is how binary search measures its work.`, { out: [String(steps)] });
  return r.steps;
}

/* PYTH-3.1: functions calling functions, with the call stack */

export const FUNCS = `def total(a):
    s = 0
    for x in a:
        s += x
    return s

def average(a):
    return total(a) / len(a)

print(average([4, 8, 6]))`;

export type Fr = { name: string; vars?: string; state: "cur" | "wait" | "ret"; ret?: string };
export type FuncStep = { line: number; frames: Fr[]; caption: string; out?: string };

export function funcSteps(): FuncStep[] {
  const a = "[4, 8, 6]";
  const mod = (state: Fr["state"] = "wait"): Fr => ({ name: "main program", state });
  const avg = (state: Fr["state"], ret?: string): Fr => ({ name: "average", vars: `a = ${a}`, state, ret });
  const tot = (s: number, x?: number, state: Fr["state"] = "cur", ret?: string): Fr => ({
    name: "total",
    vars: `a = ${a}, s = ${s}${x === undefined ? "" : `, x = ${x}`}`,
    state,
    ret,
  });
  const steps: FuncStep[] = [
    { line: 1, frames: [mod("cur")], caption: "Lines 1 to 8 only define two functions. Defining a function stores it under its name. None of its lines run yet." },
    { line: 10, frames: [mod("cur")], caption: "Line 10 is the first line that does work. To print, Python first needs the value of `average([4, 8, 6])`, so it calls `average`." },
    { line: 7, frames: [mod(), avg("cur")], caption: "A call creates a new frame: a small box that holds the function's own names. Here `a` refers to the list `[4, 8, 6]`. The main program waits." },
    { line: 8, frames: [mod(), avg("cur")], caption: "Line 8 needs `total(a)` before it can divide. So `average` waits too, and `total` gets its own frame." },
    { line: 2, frames: [mod(), avg("wait"), tot(0)], caption: "`total` has its own `a` and `s`. They are separate from any other names with the same spelling. These are called local names." },
  ];
  let s = 0;
  for (const x of [4, 8, 6]) {
    steps.push({ line: 3, frames: [mod(), avg("wait"), tot(s, x)], caption: `The loop gives \`x = ${x}\`.` });
    s += x;
    steps.push({ line: 4, frames: [mod(), avg("wait"), tot(s, x)], caption: `\`s += x\` adds ${x}, so \`s = ${s}\`.` });
  }
  steps.push(
    { line: 5, frames: [mod(), avg("wait"), tot(s, 6, "ret", "18")], caption: "`return s` sends 18 back to the caller. The frame of `total` is then removed, with its `s` and `x`." },
    { line: 8, frames: [mod(), avg("cur")], caption: "Back in `average`, `total(a)` is replaced by 18. Now it computes `18 / len(a)`, which is `18 / 3`." },
    { line: 8, frames: [mod(), avg("ret", "6.0")], caption: "The `/` sign always gives a float (a number with a decimal point), so `average` returns 6.0." },
    { line: 10, frames: [mod("cur")], caption: "The main program gets 6.0 and prints it. Every frame that was created has now been removed.", out: "6.0" },
  );
  return steps;
}

/* PYTH-4.1: counting with a dictionary */

export const COUNT = `codes = ["BCT", "HWH", "BCT", "MAS", "HWH", "BCT"]
counts = {}
for c in codes:
    counts[c] = counts.get(c, 0) + 1
print(counts)`;

export const CODES6 = ["BCT", "HWH", "BCT", "MAS", "HWH", "BCT"];

export type DictStep = { line: number; at: number | null; dict: [string, number][]; changed?: string; caption: string; out?: string };

export function countSteps(): DictStep[] {
  const counts = new Map<string, number>();
  const snap = () => [...counts.entries()];
  const steps: DictStep[] = [
    { line: 1, at: null, dict: [], caption: "We want to know how often each station code appears." },
    { line: 2, at: null, dict: [], caption: "`counts = {}` makes an empty dictionary. A dictionary stores pairs: each key (here, a code) maps to a value (here, a count)." },
  ];
  CODES6.forEach((c, k) => {
    const had = counts.get(c);
    steps.push({ line: 3, at: k, dict: snap(), caption: `\`c = '${c}'\`.` });
    counts.set(c, (had ?? 0) + 1);
    steps.push({
      line: 4,
      at: k,
      dict: snap(),
      changed: c,
      caption:
        had === undefined
          ? `\`'${c}'\` is not a key yet, so \`counts.get(c, 0)\` gives the default, 0. Store 0 + 1 = 1 under \`'${c}'\`.`
          : `\`'${c}'\` is already a key, so \`counts.get(c, 0)\` gives ${had}. Store ${had} + 1 = ${had + 1}.`,
    });
  });
  steps.push({
    line: 5,
    at: null,
    dict: snap(),
    caption: "Done. Each lookup took about the same time, however big the dictionary was. A dictionary finds a key without searching through the other keys.",
    out: py(Object.fromEntries(counts)),
  });
  return steps;
}

/* PYTH-5.1: nodes joined by references */

export const NODES = `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

head = Node(3)
head.next = Node(8)
head.next.next = Node(5)

cur = head
while cur is not None:
    print(cur.value)
    cur = cur.next`;

export type NodeStep = { line: number; built: number; cur: number | null; caption: string; out: string[] };

export function nodeSteps(): NodeStep[] {
  const v = [3, 8, 5];
  const steps: NodeStep[] = [
    { line: 1, built: 0, cur: null, out: [], caption: "Lines 1 to 4 define a new kind of value, `Node`. Each node will hold a value and a reference to the next node." },
    { line: 6, built: 1, cur: null, out: [], caption: "`Node(3)` makes a node and runs `__init__`, which sets `value = 3` and `next = None`. The name `head` now refers to it." },
    { line: 7, built: 2, cur: null, out: [], caption: "`head.next = Node(8)` makes a second node, and stores a reference to it in the first node's `next`." },
    { line: 8, built: 3, cur: null, out: [], caption: "`head.next.next` is the `next` of the second node. It now refers to a third node. The last `next` is still `None`, which marks the end." },
    { line: 10, built: 3, cur: 0, out: [], caption: "To visit every node, start a second name, `cur`, at the head. This does not copy anything: `head` and `cur` refer to the same node." },
  ];
  const out: string[] = [];
  for (let k = 0; k <= v.length; k++) {
    const live = k < v.length;
    steps.push({ line: 11, built: 3, cur: live ? k : null, out: [...out], caption: live ? `\`cur\` is a node, not \`None\`, so the loop runs.` : "`cur` is `None`, so the loop stops. Every node was visited once." });
    if (!live) break;
    out.push(String(v[k]));
    steps.push({ line: 12, built: 3, cur: k, out: [...out], caption: `Print \`cur.value\`, which is ${v[k]}.` });
    steps.push({
      line: 13,
      built: 3,
      cur: k + 1 < v.length ? k + 1 : null,
      out: [...out],
      caption: k + 1 < v.length ? `\`cur = cur.next\` moves \`cur\` to the next node. \`head\` does not move.` : "The last node's `next` is `None`, so now `cur` is `None`.",
    });
  }
  return steps;
}

/* PYTH-6.1: running tests against a function with a bug */

export const LARGEST_BUG = `def largest(a):
    best = 0
    for x in a:
        if x > best:
            best = x
    return best`;

export type TestRunRow = { name: string; call: string; expect: string; got: string };

export const RUN_ROWS: TestRunRow[] = [
  { name: "Largest in the middle", call: "largest([4, 9, 2])", expect: "9", got: "9" },
  { name: "Largest at the end", call: "largest([1, 3, 7])", expect: "7", got: "7" },
  { name: "One value", call: "largest([5])", expect: "5", got: "5" },
  { name: "All negative", call: "largest([-4, -2, -9])", expect: "-2", got: "0" },
  { name: "Repeated values", call: "largest([6, 6, 1])", expect: "6", got: "6" },
];
