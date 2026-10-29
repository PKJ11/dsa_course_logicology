// Step generators for the STAQ figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import type { Frame } from "../../_components/Stages";
import { type CellState, py } from "../kit";

const item = (name: string, vars?: string): Frame => ({ name, vars, state: "wait" });

/* STAQ-1.1: a stack kept in a Python list */

export const STACK_OPS = `stack = []
stack.append('A')
stack.append('B')
stack.append('C')
stack.pop()   # gives 'C'
stack[-1]     # the top
stack.append('D')
stack.pop()   # gives 'D'
stack.pop()   # gives 'B'`;

export type StackStep = { line: number | null; frames: Frame[]; out: string[]; caption: string };

export function stackSteps(): StackStep[] {
  const s: string[] = [];
  const out: string[] = [];
  const steps: StackStep[] = [];
  const snap = (line: number | null, caption: string) => steps.push({ line, frames: s.map((x) => item(`'${x}'`)), out: [...out], caption });
  snap(1, "An empty list is an empty stack. The end of the list is the top of the stack.");
  for (const [line, x] of [[2, "A"], [3, "B"], [4, "C"]] as const) {
    s.push(x);
    snap(line, `\`append\` puts '${x}' on top. ${x === "A" ? "It is the only item, so it is also the bottom." : "The items below it do not move."}`);
  }
  out.push(py(s.pop()!));
  snap(5, "`pop()` takes the top item off and gives it back: 'C', the last one in. This is last in, first out.");
  out.push(py(s[s.length - 1]));
  snap(6, "`stack[-1]` reads the top item without removing it. This is often called peek. It is an error on an empty stack, so check first.");
  s.push("D");
  snap(7, "'D' goes on top of 'B'.");
  out.push(py(s.pop()!));
  snap(8, "`pop()` gives 'D'.");
  out.push(py(s.pop()!));
  snap(9, "`pop()` gives 'B'. Only 'A', the first item in, is left. It will be the last out.");
  steps.push({
    line: null,
    frames: s.map((x) => item(`'${x}'`)),
    out: [...out],
    caption: "Every operation worked at the end of the list, so nothing else moved. `append`, `pop()` and `stack[-1]` are all O(1).",
  });
  return steps;
}

/* STAQ-2.1: brackets and postfix with a stack */

export type ScanStep = { i: number | null; states: CellState[]; frames: Frame[]; caption: string; verdict?: { ok: boolean; text: string } };

const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export function bracketSteps(text: string): ScanStep[] {
  const stack: number[] = [];
  const toks = [...text];
  const matched = new Set<number>();
  const steps: ScanStep[] = [];
  const states = (i: number | null, bad?: number): CellState[] =>
    toks.map((_, k) => (k === bad ? "violated" : k === i ? "mid" : matched.has(k) ? "found" : ""));
  const frames = () => stack.map((k) => item(`'${toks[k]}'`, `from place ${k}`));
  steps.push({ i: null, states: states(null), frames: frames(), caption: "Read the text from left to right. Push each opening bracket. Each closing bracket must match the opening bracket on top." });
  for (let i = 0; i < toks.length; i++) {
    const c = toks[i];
    if (!PAIR[c]) {
      stack.push(i);
      steps.push({ i, states: states(i), frames: frames(), caption: `'${c}' opens a pair. Push it. It must be closed before anything below it.` });
      continue;
    }
    const top = stack.length ? toks[stack[stack.length - 1]] : null;
    if (top !== PAIR[c]) {
      steps.push({
        i,
        states: states(i, i),
        frames: frames(),
        caption: top
          ? `'${c}' closes a '${PAIR[c]}', but the top of the stack is '${top}'. The pairs cross each other, so the text is not balanced.`
          : `'${c}' closes a pair, but the stack is empty: nothing is open.`,
        verdict: { ok: false, text: "Not balanced" },
      });
      return steps;
    }
    const k = stack.pop()!;
    matched.add(k);
    matched.add(i);
    steps.push({ i, states: states(i), frames: frames(), caption: `'${c}' matches the '${PAIR[c]}' on top. Pop it: that pair is done.` });
  }
  steps.push({
    i: null,
    states: states(null),
    frames: frames(),
    caption: stack.length ? "The text has ended, but the stack still holds an open bracket. It was never closed." : "The text has ended and the stack is empty: every bracket was closed, in the right order.",
    verdict: stack.length ? { ok: false, text: "Not balanced" } : { ok: true, text: "Balanced" },
  });
  return steps;
}

export const POSTFIX = ["5", "1", "2", "+", "4", "*", "+", "3", "-"];

export function postfixSteps(): ScanStep[] {
  const stack: number[] = [];
  const steps: ScanStep[] = [];
  const states = (i: number | null): CellState[] => POSTFIX.map((_, k) => (i !== null && k < i ? "out" : k === i ? "mid" : ""));
  const frames = () => stack.map((v) => item(String(v)));
  steps.push({ i: null, states: states(null), frames: frames(), caption: "In postfix, each operator comes after its two numbers. `5 1 2 + 4 * + 3 -` is the same as 5 + (1 + 2) × 4 − 3. No brackets are needed." });
  for (let i = 0; i < POSTFIX.length; i++) {
    const t = POSTFIX[i];
    if (/^\d+$/.test(t)) {
      stack.push(Number(t));
      steps.push({ i, states: states(i), frames: frames(), caption: `${t} is a number. Push it.` });
      continue;
    }
    const b = stack.pop()!;
    const a = stack.pop()!;
    const r = t === "+" ? a + b : t === "-" ? a - b : a * b;
    stack.push(r);
    steps.push({
      i,
      states: states(i),
      frames: frames(),
      caption: `'${t}': pop ${b}, then pop ${a}. The first pop is the right-hand number. Push ${a} ${t === "*" ? "×" : t === "-" ? "−" : "+"} ${b} = ${r}.`,
    });
  }
  steps.push({
    i: null,
    states: states(POSTFIX.length),
    frames: frames(),
    caption: "The tokens have ended, and one number is left on the stack: the answer, 14. Each token was handled once, so this is O(n).",
    verdict: { ok: true, text: "14" },
  });
  return steps;
}

/* STAQ-3.1: a queue with list.pop(0), and with a deque */

export type QueueStep = { values: string[]; states: CellState[]; front: number | null; back: number | null; moved: number; caption: string };

export function listQueueSteps(): QueueStep[] {
  let q = ["A", "B", "C", "D", "E", "F"];
  let moved = 0;
  const steps: QueueStep[] = [];
  const none = (n: number): CellState[] => Array(n).fill("");
  steps.push({ values: q, states: none(q.length), front: 0, back: q.length - 1, moved, caption: "A queue in a Python list: people join at the end and leave from the front, place 0." });
  steps.push({
    values: q,
    states: ["out", ...none(q.length - 1)],
    front: 0,
    back: q.length - 1,
    moved,
    caption: "`q.pop(0)` takes 'A' from the front. But a list must keep its items from place 0 with no gap.",
  });
  q = q.slice(1);
  moved += q.length;
  steps.push({ values: q, states: q.map(() => "path"), front: 0, back: q.length - 1, moved, caption: `So every other item moves one place to the left: ${q.length} moves for one removal.` });
  q = [...q, "G"];
  steps.push({ values: q, states: q.map((_, k) => (k === q.length - 1 ? "mid" : "")), front: 0, back: q.length - 1, moved, caption: "`q.append('G')` adds at the end. Nothing moves, so this takes one step." });
  q = q.slice(1);
  moved += q.length;
  steps.push({
    values: q,
    states: q.map(() => "path"),
    front: 0,
    back: q.length - 1,
    moved,
    caption: `\`q.pop(0)\` again: 'B' leaves and ${q.length} items move. With n items in the queue, each removal costs O(n).`,
  });
  return steps;
}

export function dequeQueueSteps(): QueueStep[] {
  const cells = ["", "", "A", "B", "C", "D", "E", "F", "", ""];
  let front = 2;
  let back = 7;
  const steps: QueueStep[] = [];
  const st = (cur?: number): CellState[] => cells.map((c, k) => (k === cur ? "mid" : c ? "" : "out"));
  steps.push({
    values: [...cells],
    states: st(),
    front,
    back,
    moved: 0,
    caption: "A deque keeps spare room at both ends and remembers where the front and the back are. (Inside, it is a linked list of blocks: LINK-3.)",
  });
  cells[front] = "";
  front += 1;
  steps.push({ values: [...cells], states: st(), front, back, moved: 0, caption: "`q.popleft()` takes 'A' and moves the front marker one place. Nothing else moves." });
  back += 1;
  cells[back] = "G";
  steps.push({ values: [...cells], states: st(back), front, back, moved: 0, caption: "`q.append('G')` writes into the spare room and moves the back marker." });
  cells[front] = "";
  front += 1;
  steps.push({
    values: [...cells],
    states: st(),
    front,
    back,
    moved: 0,
    caption: "`q.popleft()` takes 'B'. Still nothing moves. Both ends are O(1), however long the queue is. For a queue, use `collections.deque`.",
  });
  return steps;
}

/* STAQ-4.1: a circular buffer of fixed size */

export const RING_CAP = 6;

export type RingStep = { values: string[]; states: CellState[]; head: number; free: number; count: number; caption: string; verdict?: { ok: boolean; text: string } };

export function ringSteps(): RingStep[] {
  const cells: (number | null)[] = Array(RING_CAP).fill(null);
  let head = 0;
  let count = 0;
  const steps: RingStep[] = [];
  // `put` is the slot just written, shown as the current cell
  const snap = (caption: string, verdict?: RingStep["verdict"], put?: number) =>
    steps.push({
      values: cells.map((c) => (c === null ? "" : String(c))),
      states: cells.map((c, k) => (k === put ? "mid" : c === null ? "out" : "")),
      head,
      free: (head + count) % RING_CAP,
      count,
      caption,
      verdict,
    });
  snap("A fixed list of 6 slots. `head` is the place of the front item, and `count` is how many items there are. The next free slot is `(head + count) % 6`, shown as `free`.");
  for (const x of [10, 20, 30, 40]) {
    const at = (head + count) % RING_CAP;
    cells[at] = x;
    count++;
    snap(`push(${x}): write it at slot \`free\`, then add 1 to \`count\`.`, undefined, at);
  }
  for (let k = 0; k < 2; k++) {
    const x = cells[head];
    cells[head] = null;
    head = (head + 1) % RING_CAP;
    count--;
    snap(`pop(): take ${x} from slot \`head\`, then move \`head\` one place on and take 1 from \`count\`. Nothing else moves.`);
  }
  for (const x of [50, 60, 70]) {
    const at = (head + count) % RING_CAP;
    cells[at] = x;
    count++;
    snap(
      at < head
        ? `push(${x}): the next free slot is (${head} + ${count - 1}) % 6 = ${at}. The list wraps round to the start, where there is free room.`
        : `push(${x}): write it at slot ${at}.`,
      undefined,
      at,
    );
  }
  const last = (head + count) % RING_CAP;
  cells[last] = 80;
  count++;
  snap("push(80) fills the last free slot. Now `count` is 6: the buffer is full. `free` and `head` point to the same slot.", undefined, last);
  snap("push(90): the buffer is full, so it is refused. A fixed size means the memory never grows. Some buffers overwrite the oldest item instead.", { ok: false, text: "Full" });
  const x = cells[head];
  cells[head] = null;
  head = (head + 1) % RING_CAP;
  count--;
  snap(`pop() gives ${x}, the oldest item. Every operation is a few sums with %, so each is O(1).`, { ok: true, text: `gave ${x}` });
  return steps;
}

/* STAQ-5.1: next greater value with a monotonic stack */

export const NG_VALS = [2, 7, 3, 5, 4, 6, 1];

export type NgStep = { i: number | null; states: CellState[]; frames: Frame[]; answer: string[]; caption: string };

export function nextGreaterSteps(): NgStep[] {
  const a = NG_VALS;
  const ans: (number | null)[] = a.map(() => null);
  const stack: number[] = [];
  const steps: NgStep[] = [];
  let pops = 0;
  const snap = (i: number | null, caption: string) =>
    steps.push({
      i,
      states: a.map((_, k) => (k === i ? "mid" : ans[k] !== null ? "out" : "")),
      frames: stack.map((k) => item(`place ${k}`, `a[${k}] = ${a[k]}`)),
      answer: ans.map((v) => (v === null ? "" : String(v))),
      caption,
    });
  snap(null, "For each value, find the first value to its right that is bigger. The stack holds the places still waiting for an answer.");
  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      const j = stack.pop()!;
      ans[j] = a[i];
      pops++;
      snap(i, `${a[i]} is bigger than ${a[j]}, the value on top. So ${a[i]} is the answer for place ${j}. Pop it.`);
    }
    stack.push(i);
    snap(
      i,
      stack.length > 1
        ? `${a[i]} is not bigger than ${a[stack[stack.length - 2]]} on top, so stop. Push place ${i}. The values in the stack go down from bottom to top.`
        : `Push place ${i}: ${a[i]} waits for something bigger.`,
    );
  }
  for (const j of stack) ans[j] = -1;
  steps.push({
    i: null,
    states: a.map(() => "out"),
    frames: [],
    answer: ans.map((v) => String(v)),
    caption: `The places left on the stack never found a bigger value: their answer is −1. Each place was pushed once and popped at most once, so the work is O(n), even with the inner loop. (${pops} pops in all.)`,
  });
  return steps;
}

/* STAQ-6.1: sliding window maximum with a monotonic deque */

export const WM_VALS = [4, 2, 12, 3, 8, 5, 1, 7];
export const WM_K = 3;

export type WmStep = { i: number | null; lo: number; states: CellState[]; dq: number[]; out: number[]; caption: string };

export function windowMaxSteps(): WmStep[] {
  const a = WM_VALS;
  const k = WM_K;
  const dq: number[] = [];
  const out: number[] = [];
  const steps: WmStep[] = [];
  const snap = (i: number | null, caption: string) =>
    steps.push({
      i,
      lo: i === null ? 0 : Math.max(0, i - k + 1),
      states: a.map((_, j) => (i !== null && j < i - k + 1 ? "out" : j === i ? "mid" : "")),
      dq: [...dq],
      out: [...out],
      caption,
    });
  snap(null, `Find the biggest value in every window of ${k} values in a row. The deque holds places whose values go down from front to back. The front is always the biggest.`);
  for (let i = 0; i < a.length; i++) {
    while (dq.length && a[dq[dq.length - 1]] <= a[i]) {
      const j = dq.pop()!;
      snap(i, `${a[i]} is at least as big as ${a[j]} at the back. ${a[j]} can never be the biggest again: ${a[i]} is as big or bigger, and stays in the window longer. Remove it from the back.`);
    }
    dq.push(i);
    if (dq[0] <= i - k) {
      const j = dq.shift()!;
      snap(i, `Add place ${i} at the back. The front, place ${j}, has left the window. Remove it from the front.`);
    } else snap(i, `Add place ${i} (value ${a[i]}) at the back.`);
    if (i >= k - 1) {
      out.push(a[dq[0]]);
      snap(i, `The window is places ${i - k + 1} to ${i}. Its biggest value is at the front of the deque: ${a[dq[0]]}.`);
    }
  }
  steps.push({
    i: null,
    lo: a.length - k,
    states: a.map(() => ""),
    dq: [...dq],
    out: [...out],
    caption: "Done. Each place joined the deque once and left at most once, so the whole job is O(n), not O(n × k) (n times k).",
  });
  return steps;
}
