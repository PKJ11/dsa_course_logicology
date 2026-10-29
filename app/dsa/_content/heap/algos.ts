// Step generators for the HEAP figures. Every figure is a pure function of its step number.
// A heap is drawn twice: as a tree (Tree stage with `slide`, node ids follow the values, so a swap moves
// the two nodes) and as the list that stores it (ArrayTrack). Captions use `backticks` for code.

import type { Mark, TNode } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };

/** One heap entry: `id` stays with the value as it moves; `key` orders it; `label` is what is drawn. */
export type Item = { id: string; key: number; label: string };

export type HeapStep = {
  items: Item[];
  /** marks by position */
  marks?: Record<number, Mark>;
  /** cell states by position, for the list under the tree */
  cells?: Record<number, CellState>;
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export const num = (k: number): Item => ({ id: `n${k}`, key: k, label: String(k) });

/** Tree-stage nodes for a heap stored in `items` (position k has children 2k + 1 and 2k + 2). */
export function heapNodes(items: Item[], marks: Record<number, Mark> = {}, removed: Set<string> = new Set()): TNode[] {
  return items.map((it, k) => ({
    id: it.id,
    label: it.label,
    parent: k ? items[Math.floor((k - 1) / 2)].id : undefined,
    state: removed.has(it.id) ? "out" : marks[k],
  }));
}

export function cellStates(n: number, cells: Record<number, CellState> = {}): CellState[] {
  return Array.from({ length: n }, (_, k) => cells[k] ?? "");
}

/* HEAP-1.1: the heap property and the list layout */

export function propertySteps(v: "positions" | "check"): HeapStep[] {
  if (v === "positions") {
    const items = [1, 3, 2, 7, 4, 5, 8, 9].map(num);
    return [
      {
        items,
        caption:
          "A min-heap of 8 values, drawn as a tree and stored as a list. The tree is filled level by level, left to right, with no gaps. The list holds the same values in that order.",
      },
      { items, marks: { 0: "cur" }, cells: { 0: "mid" }, caption: "Position 0 holds the root. In a min-heap the root is the smallest value: 1." },
      {
        items,
        marks: { 1: "cur", 3: "found", 4: "found" },
        cells: { 1: "mid", 3: "found", 4: "found" },
        caption: "The children of position i are at positions 2i + 1 and 2i + 2. Position 1 (value 3) has its children at positions 3 and 4: values 7 and 4.",
        readout: "2·1 + 1 = 3,  2·1 + 2 = 4",
      },
      {
        items,
        marks: { 2: "cur", 5: "found", 6: "found" },
        cells: { 2: "mid", 5: "found", 6: "found" },
        caption: "Position 2 (value 2) has its children at positions 5 and 6: values 5 and 8.",
        readout: "2·2 + 1 = 5,  2·2 + 2 = 6",
      },
      {
        items,
        marks: { 3: "cur", 7: "found" },
        cells: { 3: "mid", 7: "found" },
        caption: "Position 3 would have children at 7 and 8. The list has 8 values (positions 0 to 7), so only position 7 exists: 9 is its only child.",
        readout: "2·3 + 1 = 7,  2·3 + 2 = 8 (past the end)",
      },
      {
        items,
        marks: { 6: "cur", 2: "found" },
        cells: { 6: "mid", 2: "found" },
        caption: "Going up: the parent of position i is at (i − 1) // 2, that is, i − 1 halved and rounded down. The parent of position 6 (value 8) is position 2 (value 2).",
        readout: "(6 − 1) // 2 = 2",
      },
      {
        items,
        caption:
          "So the list needs no links: the positions alone give the tree. Every parent is at most its children, which is the min-heap rule. The values are not sorted: 2 is to the right of 3 and 7 is above 4.",
        verdict: { ok: true, text: "a min-heap" },
      },
    ];
  }
  const items = [2, 5, 3, 6, 9, 4, 8, 1].map(num);
  const steps: HeapStep[] = [
    { items, caption: "Is this list a min-heap? Check every parent against its children. Only positions 0 to n // 2 − 1 have children: here 0 to 3." },
  ];
  for (let p = 0; p <= 3; p++) {
    const kids = [2 * p + 1, 2 * p + 2].filter((c) => c < items.length);
    const bad = kids.filter((c) => items[c].key < items[p].key);
    const marks: Record<number, Mark> = { [p]: bad.length ? "bad" : "cur" };
    const cells: Record<number, CellState> = { [p]: bad.length ? "violated" : "mid" };
    kids.forEach((c) => {
      marks[c] = bad.includes(c) ? "bad" : "found";
      cells[c] = bad.includes(c) ? "violated" : "found";
    });
    steps.push({
      items,
      marks,
      cells,
      caption: bad.length
        ? `Position ${p} holds ${items[p].key}, but its child at position ${bad[0]} holds ${items[bad[0]].key}, which is smaller. The rule is broken.`
        : `Position ${p} holds ${items[p].key}. Its children hold ${kids.map((c) => items[c].key).join(" and ")}: both at least ${items[p].key}. Fine.`,
      verdict: bad.length ? { ok: false, text: "not a heap" } : undefined,
    });
  }
  steps.push({
    items,
    marks: { 8: "bad" },
    cells: { 8: "violated" },
    caption: "One broken pair is enough: this is not a heap. A quick sign: the smallest value, 1, is not at position 0. In a min-heap the smallest value is always at the root.",
    verdict: { ok: false, text: "not a heap" },
  });
  return steps;
}

/* HEAP-2.1: sift up (push) and sift down (pop) */

const BASE = [1, 3, 5, 7, 4, 8, 6];

export function siftSteps(v: "push" | "pop"): HeapStep[] {
  const a = BASE.map(num);
  const steps: HeapStep[] = [];
  const push = (s: Omit<HeapStep, "items">) => steps.push({ items: a.slice(), ...s });
  let cmp = 0;
  if (v === "push") {
    push({ caption: "A min-heap of 7 values. Push 2." });
    a.push(num(2));
    let i = a.length - 1;
    push({ marks: { [i]: "cur" }, cells: { [i]: "mid" }, caption: "Put 2 at the end of the list. In the tree, that is the next free place on the bottom level, so the tree stays complete." });
    while (i > 0) {
      const p = (i - 1) >> 1;
      cmp++;
      if (a[i].key < a[p].key) {
        push({
          marks: { [i]: "cur", [p]: "bad" },
          cells: { [i]: "mid", [p]: "violated" },
          caption: `Compare 2 with its parent at position ${p}, ${a[p].key}. 2 is smaller, so the rule is broken here. Swap them.`,
          readout: `comparisons: ${cmp}`,
        });
        [a[i], a[p]] = [a[p], a[i]];
        i = p;
        push({ marks: { [i]: "cur" }, cells: { [i]: "mid" }, caption: `2 moved up to position ${i}. Everything below it is still in order: the value it swapped with was smaller than its other children.`, readout: `comparisons: ${cmp}` });
      } else {
        push({
          marks: { [i]: "found", [p]: "done" },
          cells: { [i]: "found" },
          caption: `Compare 2 with its parent, ${a[p].key}. 2 is not smaller, so stop. This is sift up: at most one swap per level, so O(log n).`,
          readout: `comparisons: ${cmp}`,
          verdict: { ok: true, text: "a min-heap again" },
        });
        break;
      }
    }
    return steps;
  }
  push({ marks: { 0: "found" }, cells: { 0: "found" }, caption: "A min-heap of 7 values. Pop: the smallest value, 1, is at the root. Take it out and return it." });
  const last = a.pop()!;
  a[0] = last;
  let i = 0;
  push({
    marks: { 0: "cur" },
    cells: { 0: "mid" },
    caption: `That leaves a hole at the root. Move the last value, ${last.key}, into it: the list gets one shorter and the tree stays complete. But ${last.key} is too big for the root.`,
    readout: "returned 1",
  });
  for (;;) {
    const l = 2 * i + 1;
    if (l >= a.length) {
      push({ marks: { [i]: "found" }, cells: { [i]: "found" }, caption: `${a[i].key} has no children now, so stop. This is sift down: at most two comparisons per level, so O(log n).`, readout: `comparisons: ${cmp}`, verdict: { ok: true, text: "a min-heap again" } });
      break;
    }
    const r = l + 1;
    let c = l;
    cmp++;
    if (r < a.length) {
      cmp++;
      if (a[r].key < a[l].key) c = r;
    }
    if (a[c].key < a[i].key) {
      push({
        marks: { [i]: "bad", [c]: "cur" },
        cells: { [i]: "violated", [c]: "mid" },
        caption: `The children of ${a[i].key} are ${r < a.length ? `${a[l].key} and ${a[r].key}` : a[l].key}. The smaller one, ${a[c].key}, is smaller than ${a[i].key}: swap them. Swapping with the smaller child keeps it the smallest of the three.`,
        readout: `comparisons: ${cmp}`,
      });
      [a[i], a[c]] = [a[c], a[i]];
      i = c;
    } else {
      push({ marks: { [i]: "found" }, cells: { [i]: "found" }, caption: `Both children are at least ${a[i].key}: stop.`, readout: `comparisons: ${cmp}`, verdict: { ok: true, text: "a min-heap again" } });
      break;
    }
  }
  return steps;
}

/* HEAP-3.1: building a heap, bottom up or one value at a time */

export function buildSteps(v: "down" | "up"): HeapStep[] {
  const a = [8, 7, 6, 5, 4, 3, 2, 1].map(num);
  const n = a.length;
  const steps: HeapStep[] = [];
  let cmp = 0;
  if (v === "down") {
    steps.push({
      items: a.slice(),
      caption: "Turn the list 8, 7, …, 1 into a min-heap. Positions 4 to 7 are leaves: each is already a heap of one value. Start at the last parent, position 3, and work back to the root.",
    });
    for (let s = (n >> 1) - 1; s >= 0; s--) {
      let i = s;
      const moved: number[] = [];
      const startKey = a[s].key;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= n) break;
        let c = l;
        cmp++;
        if (l + 1 < n) {
          cmp++;
          if (a[l + 1].key < a[l].key) c = l + 1;
        }
        if (a[c].key < a[i].key) {
          [a[i], a[c]] = [a[c], a[i]];
          moved.push(c);
          i = c;
        } else break;
      }
      steps.push({
        items: a.slice(),
        marks: i === s ? { [s]: "cur" } : { [s]: "found", [i]: "cur" },
        cells: { [i]: "mid" },
        caption: `Sift down position ${s} (${startKey}). It moves down ${moved.length} level${moved.length === 1 ? "" : "s"}. Now the subtree under position ${s} is a heap.`,
        readout: `comparisons so far: ${cmp}`,
      });
    }
    steps.push({
      items: a.slice(),
      caption: `Done, with ${cmp} comparisons for ${n} values. Values high in the tree may travel far, but there are few of them; the many values near the bottom travel little. In total, fewer than 2n comparisons: O(n).`,
      readout: `comparisons: ${cmp} (2n = ${2 * n})`,
      verdict: { ok: true, text: "a min-heap" },
    });
    return steps;
  }
  const h: Item[] = [];
  for (const it of a) {
    h.push(it);
    let i = h.length - 1;
    let ups = 0;
    while (i > 0) {
      const p = (i - 1) >> 1;
      cmp++;
      if (h[i].key < h[p].key) {
        [h[i], h[p]] = [h[p], h[i]];
        i = p;
        ups++;
      } else break;
    }
    steps.push({
      items: h.slice(),
      marks: { [i]: "cur" },
      cells: { [i]: "mid" },
      caption:
        ups === 0
          ? `The other way: push the values 8, 7, …, 1 one at a time, sifting each one up. Push ${it.key}: it is the first value, so it is the root.`
          : `Push ${it.key}. It is smaller than every value so far, so it moves up to the root: ${ups} swap${ups === 1 ? "" : "s"}.`,
      readout: `comparisons so far: ${cmp}`,
    });
  }
  steps.push({
    items: h.slice(),
    caption: `Done, with ${cmp} comparisons. On a decreasing list, every value moves up to the root, so the k-th push costs about log₂ k: O(n log n) in total. The bottom-up way needs fewer than 2n.`,
    readout: `comparisons: ${cmp} (2n = ${2 * n})`,
    verdict: { ok: false, info: true, text: "slower: O(n log n)" },
  });
  return steps;
}

/* HEAP-4.1: a priority queue with ties and lazy removal */

export type PqStep = HeapStep & { removed: string[] };

export function pqSteps(): PqStep[] {
  const steps: PqStep[] = [];
  const h: Item[] = [];
  const removed = new Set<string>();
  let count = 0;
  const key = (p: number, c: number) => p * 100 + c;
  const snap = (caption: string, marks: Record<number, Mark> = {}, extra: Partial<PqStep> = {}) =>
    steps.push({ items: h.slice(), marks, caption, removed: [...removed], ...extra });
  const up = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[i].key < h[p].key) {
        [h[i], h[p]] = [h[p], h[i]];
        i = p;
      } else break;
    }
    return i;
  };
  const down = () => {
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      if (l >= h.length) return;
      const c = l + 1 < h.length && h[l + 1].key < h[l].key ? l + 1 : l;
      if (h[c].key < h[i].key) {
        [h[i], h[c]] = [h[c], h[i]];
        i = c;
      } else return;
    }
  };
  const add = (task: string, p: number, why: string) => {
    const it: Item = { id: task, key: key(p, count), label: `${p}, ${count}, ${task}` };
    count++;
    h.push(it);
    const i = up(h.length - 1);
    snap(why, { [i]: "cur" });
  };
  const pop = () => {
    const top = h[0];
    const last = h.pop()!;
    if (h.length) {
      h[0] = last;
      down();
    }
    return top;
  };
  add("write", 3, "Each entry is a tuple (priority, count, task). Add `write` with priority 3. The count is 0: it numbers the entries in the order they arrive.");
  add("fix", 1, "Add `fix` with priority 1 (count 1). A smaller priority means more urgent, so it sifts up to the root.");
  add("test", 3, "Add `test` with priority 3 (count 2). It ties with `write` on priority; the count will decide between them.");
  add("review", 2, "Add `review` with priority 2 (count 3).");
  const fi = h.findIndex((it) => it.id === "fix");
  removed.add("fix");
  snap("Remove `fix`. Finding it in the heap would take O(n), and taking it out of the middle is awkward. Instead, mark it as removed (here: hatched) and leave it where it is.", { [fi]: "out" }, {
    readout: "fix marked as removed",
  });
  snap("Pop. The root is `fix`, but it is marked as removed (hatched), so it must not be returned. Throw it away instead.", { 0: "out" }, {
    readout: "root: fix, removed",
  });
  let t = pop();
  snap("`fix` is gone, and the heap filled the root in the usual way. A removed entry costs one extra pop, later. Now pop again.", { 0: "cur" }, { readout: `discarded ${t.id}` });
  t = pop();
  snap(`Pop again: \`${t.id}\` comes out, the most urgent task still waiting.`, h.length ? { 0: "cur" } : {}, { readout: `returned ${t.id}` });
  t = pop();
  snap(
    `Pop: \`write\` and \`test\` both have priority 3. Tuples compare item by item, so the counts decide: 0 is smaller than 2. \`${t.id}\` arrived first and comes out first.`,
    h.length ? { 0: "cur" } : {},
    { readout: `returned ${t.id}`, verdict: { ok: true, text: "first come, first served" } },
  );
  t = pop();
  snap(`Pop: \`${t.id}\`. The queue is empty. Without the count, two tasks with the same priority would be compared by their names, and two objects that cannot be compared would raise TypeError.`, {}, {
    readout: `returned ${t.id}`,
  });
  return steps;
}

/* HEAP-5.1: top-k with a small min-heap, and k-way merge */

export const STREAM = [5, 1, 9, 3, 7, 2, 8, 6];

export type StreamStep = HeapStep & { at: number | null; stream: CellState[]; out?: number[] };

export function topkSteps(): StreamStep[] {
  const k = 3;
  const steps: StreamStep[] = [];
  const h: Item[] = [];
  const st: CellState[] = STREAM.map(() => "");
  const down = () => {
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      if (l >= h.length) return;
      const c = l + 1 < h.length && h[l + 1].key < h[l].key ? l + 1 : l;
      if (h[c].key < h[i].key) {
        [h[i], h[c]] = [h[c], h[i]];
        i = c;
      } else return;
    }
  };
  const up = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[i].key < h[p].key) {
        [h[i], h[p]] = [h[p], h[i]];
        i = p;
      } else break;
    }
  };
  STREAM.forEach((x, j) => {
    if (h.length < k) {
      h.push(num(x));
      up(h.length - 1);
      st[j] = "found";
      steps.push({
        items: h.slice(),
        marks: { 0: "cur" },
        at: j,
        stream: st.slice(),
        caption: j === 0 ? `Find the 3 largest values of a stream. Keep the 3 largest so far in a min-heap. The first values go straight in: ${x}.` : `${x} goes straight in: the heap has room for 3.`,
        readout: `the smallest of the top 3 so far: ${h[0].key}`,
      });
      return;
    }
    if (x > h[0].key) {
      const out = h[0].key;
      const gone = STREAM.indexOf(out);
      st[gone] = "out";
      h[0] = num(x);
      down();
      st[j] = "found";
      steps.push({
        items: h.slice(),
        marks: { [h.findIndex((it) => it.key === x)]: "cur" },
        at: j,
        stream: st.slice(),
        caption: `${x} is bigger than the heap's top, ${out}, the smallest of the 3 kept. So ${out} cannot be in the top 3: replace it with ${x} and sift down.`,
        readout: `the smallest of the top 3 so far: ${h[0].key}`,
      });
    } else {
      st[j] = "out";
      steps.push({
        items: h.slice(),
        marks: { 0: "done" },
        at: j,
        stream: st.slice(),
        caption: `${x} is not bigger than the top, ${h[0].key}. Three kept values beat it, so skip it. One comparison.`,
        readout: `the smallest of the top 3 so far: ${h[0].key}`,
      });
    }
  });
  steps.push({
    items: h.slice(),
    at: null,
    stream: st.slice(),
    caption: "The heap holds the 3 largest: 7, 8 and 9. Each value cost one comparison, plus O(log k) when it went in. Total O(n log k) time and O(k) space.",
    verdict: { ok: true, text: "top 3: 9, 8, 7" },
  });
  return steps;
}

export const LISTS: Record<string, number[]> = { A: [1, 4, 7], B: [2, 5, 8], C: [0, 6] };

export type MergeStep = HeapStep & { pos: Record<string, number>; out: number[] };

export function mergeSteps(): MergeStep[] {
  const steps: MergeStep[] = [];
  const pos: Record<string, number> = { A: 0, B: 0, C: 0 };
  const out: number[] = [];
  const h: Item[] = [];
  const ent = (name: string) => ({ id: `${name}${pos[name]}`, key: LISTS[name][pos[name]] * 10 + "ABC".indexOf(name), label: `${LISTS[name][pos[name]]} ${name}` });
  const down = () => {
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      if (l >= h.length) return;
      const c = l + 1 < h.length && h[l + 1].key < h[l].key ? l + 1 : l;
      if (h[c].key < h[i].key) {
        [h[i], h[c]] = [h[c], h[i]];
        i = c;
      } else return;
    }
  };
  for (const name of ["A", "B", "C"]) h.push(ent(name));
  // heapify the three entries
  if (h[1].key < h[0].key || h[2].key < h[0].key) {
    const c = h[2].key < h[1].key ? 2 : 1;
    [h[0], h[c]] = [h[c], h[0]];
  }
  steps.push({
    items: h.slice(),
    marks: { 0: "cur" },
    pos: { ...pos },
    out: [],
    caption: "Merge three sorted lists. Put the front value of each list in a min-heap, with the name of its list: 1 from A, 2 from B, 0 from C. The smallest front value is at the root.",
  });
  while (h.length) {
    const top = h[0];
    const name = top.label.split(" ")[1];
    out.push(LISTS[name][pos[name]]);
    pos[name]++;
    let caption: string;
    if (pos[name] < LISTS[name].length) {
      h[0] = ent(name);
      caption = `Take ${top.key / 10 | 0} from list ${name} and append it to the output. List ${name}'s next value, ${LISTS[name][pos[name]]}, takes its place in the heap and sifts down.`;
    } else {
      const last = h.pop()!;
      if (h.length) h[0] = last;
      caption = `Take ${top.key / 10 | 0} from list ${name}. List ${name} is used up, so the heap shrinks by one.`;
    }
    down();
    steps.push({ items: h.slice(), marks: h.length ? { 0: "cur" } : {}, pos: { ...pos }, out: out.slice(), caption, readout: `heap size ${h.length}` });
  }
  const last = steps[steps.length - 1];
  last.caption += " Every value went through a heap of at most k entries: O(n log k) for n values in k lists.";
  last.verdict = { ok: true, text: "merged" };
  return steps;
}

/* HEAP-6.1: running median with two heaps */

export const MSTREAM = [5, 15, 1, 3, 8, 7, 9, 10];

export type MedianStep = { low: Item[]; high: Item[]; lowMark?: number; highMark?: number; at: number; caption: string; readout?: string };

export function medianSteps(): MedianStep[] {
  // low: a max-heap (key = -value); high: a min-heap
  const low: Item[] = [];
  const high: Item[] = [];
  const steps: MedianStep[] = [];
  const up = (a: Item[], i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[i].key < a[p].key) {
        [a[i], a[p]] = [a[p], a[i]];
        i = p;
      } else break;
    }
  };
  const down = (a: Item[]) => {
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      if (l >= a.length) return;
      const c = l + 1 < a.length && a[l + 1].key < a[l].key ? l + 1 : l;
      if (a[c].key < a[i].key) {
        [a[i], a[c]] = [a[c], a[i]];
        i = c;
      } else return;
    }
  };
  const pop = (a: Item[]) => {
    const t = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      down(a);
    }
    return t;
  };
  const lo = (v: number): Item => ({ id: `m${v}`, key: -v, label: String(v) });
  const hi = (v: number): Item => ({ id: `m${v}`, key: v, label: String(v) });
  const med = () => (low.length > high.length ? `${-low[0].key}` : `(${-low[0].key} + ${high[0].key}) / 2 = ${(-low[0].key + high[0].key) / 2}`);
  MSTREAM.forEach((x, j) => {
    let caption: string;
    if (!low.length || x <= -low[0].key) {
      const t = low.length ? -low[0].key : null;
      low.push(lo(x));
      up(low, low.length - 1);
      caption = t === null ? `Add ${x}. The lower half is empty, so ${x} goes there.` : `Add ${x}. It is at most ${t}, the largest of the lower half, so it goes into the lower half.`;
    } else {
      high.push(hi(x));
      up(high, high.length - 1);
      caption = `Add ${x}. It is bigger than ${-low[0].key}, the largest of the lower half, so it goes into the upper half.`;
    }
    if (low.length > high.length + 1) {
      const t = pop(low);
      high.push(hi(-t.key));
      up(high, high.length - 1);
      caption += ` Now the lower half has two more values than the upper half, so move its largest, ${-t.key}, across.`;
    } else if (high.length > low.length) {
      const t = pop(high);
      low.push(lo(t.key));
      up(low, low.length - 1);
      caption += ` Now the upper half is bigger, so move its smallest, ${t.key}, across.`;
    }
    caption += low.length > high.length ? ` The count is odd: the median is the top of the lower half.` : ` The count is even: the median is the average of the two tops.`;
    steps.push({ low: low.slice(), high: high.slice(), lowMark: 0, highMark: high.length ? 0 : undefined, at: j, caption, readout: `median ${med()}` });
  });
  const last = steps[steps.length - 1];
  last.caption += " Each add is a few heap steps, O(log n); each median reads two tops, O(1).";
  return steps;
}
