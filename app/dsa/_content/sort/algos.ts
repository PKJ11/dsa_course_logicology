// Step generators for the SORT figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code.

import type { TNode } from "../../_components/Stages";
import { plural, statesFor, type CellState } from "../kit";

type Win = { lo: number; hi: number; label: string; bad?: boolean };
type Ptr = { name: string; at: number | null; kind?: "mid" | "blue" };

export type ArrStep = { a: (number | string)[]; states: CellState[]; win?: Win; ptrs: Ptr[]; caption: string; stats: Record<string, number> };

/* SORT-1.1: three simple sorts */

export const A7 = [29, 10, 14, 37, 13, 5, 21];

export type SimpleKind = "insertion" | "selection" | "bubble";

export function simpleSteps(kind: SimpleKind): ArrStep[] {
  const a = A7.slice();
  const n = a.length;
  const out: ArrStep[] = [];
  let cmp = 0;
  let moves = 0;
  const push = (states: CellState[], win: Win | undefined, ptrs: Ptr[], caption: string) =>
    out.push({ a: a.slice(), states, win, ptrs, caption, stats: { comparisons: cmp, [kind === "insertion" ? "moves" : "swaps"]: moves } });
  const none: CellState[] = [];
  if (kind === "insertion") {
    push(none, { lo: 0, hi: 0, label: "sorted" }, [], "Insertion sort grows a sorted part on the left. Each new value is moved left until it sits in order, like sorting a hand of cards.");
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      push(a.map((_, k) => (k === i ? "mid" : "")), { lo: 0, hi: i - 1, label: "sorted" }, [{ name: "i", at: i, kind: "blue" }], `Take ${key}, the next value. Compare it with the sorted values to its left, from right to left.`);
      while (j >= 0) {
        cmp++;
        if (a[j] > key) {
          a[j + 1] = a[j];
          a[j] = key;
          moves++;
          push(a.map((_, k) => (k === j ? "mid" : "")), { lo: 0, hi: i, label: "sorted" }, [{ name: "j", at: j, kind: "blue" }], `${a[j + 1]} is bigger than ${key}, so ${a[j + 1]} moves one place right and ${key} moves left.`);
          j--;
        } else {
          push(a.map((_, k) => (k === j + 1 ? "mid" : "")), { lo: 0, hi: i, label: "sorted" }, [{ name: "j", at: j, kind: "blue" }], `${a[j]} is not bigger than ${key}, so ${key} stops here. The first ${i + 1} values are sorted.`);
          break;
        }
      }
      if (j < 0) push(a.map((_, k) => (k === 0 ? "mid" : "")), { lo: 0, hi: i, label: "sorted" }, [], `${key} reached the front. The first ${i + 1} values are sorted.`);
    }
    push(none, { lo: 0, hi: n - 1, label: "sorted" }, [], `Sorted, with ${cmp} comparisons and ${moves} moves. Each move fixes one pair that was out of order, so on a nearly sorted list insertion sort is fast. On a reversed list it does about n² / 2 moves.`);
    return out;
  }
  if (kind === "selection") {
    push(none, undefined, [], "Selection sort finds the smallest value left, swaps it to the front of the unsorted part, and repeats.");
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        cmp++;
        const was = m;
        if (a[j] < a[m]) m = j;
        push(
          a.map((_, k) => (k === m ? "mid" : "")),
          i ? { lo: 0, hi: i - 1, label: "sorted" } : undefined,
          [{ name: "j", at: j, kind: "blue" }, { name: "min", at: m, kind: "mid" }],
          m !== was ? `${a[j]} is smaller than ${a[was]}: the smallest so far.` : `${a[j]} is not smaller than ${a[m]}.`,
        );
      }
      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]];
        moves++;
      }
      push(a.map((_, k) => (k === i ? "found" : "")), { lo: 0, hi: i, label: "sorted" }, [{ name: "i", at: i, kind: "blue" }], m !== i ? `Swap ${a[i]} into place ${i}. It will never move again.` : `${a[i]} is already in place ${i}.`);
    }
    push(none, { lo: 0, hi: n - 1, label: "sorted" }, [], `Sorted, with ${cmp} comparisons and ${moves} swaps. Selection sort always makes n(n − 1) / 2 = ${(n * (n - 1)) / 2} comparisons, even on a sorted list, but at most n − 1 swaps.`);
    return out;
  }
  push(none, undefined, [], "Bubble sort walks along the list swapping neighbours that are out of order. After each pass the largest value left has bubbled to the end.");
  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      cmp++;
      const sw = a[j] > a[j + 1];
      if (sw) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        moves++;
        swapped = true;
      }
      push(
        a.map((_, k) => (k === j || k === j + 1 ? "mid" : "")),
        end < n - 1 ? { lo: end + 1, hi: n - 1, label: "sorted" } : undefined,
        [{ name: "j", at: j, kind: "blue" }],
        sw ? `${a[j + 1]} is bigger than ${a[j]}: swap them.` : `${a[j]} is not bigger than ${a[j + 1]}: leave them.`,
      );
    }
    if (!swapped) {
      push(none, { lo: 0, hi: n - 1, label: "sorted" }, [], "A whole pass with no swap: the list is sorted, so stop early.");
      break;
    }
  }
  push(none, { lo: 0, hi: n - 1, label: "sorted" }, [], `Sorted, with ${cmp} comparisons and ${moves} swaps. Bubble sort makes as many swaps as insertion sort makes moves, but it compares more. It is rarely the best choice.`);
  return out;
}

/* SORT-2.1: merging two sorted lists, and the whole sort */

export const LEFT = [3, 27, 38, 43];
export const RIGHT = [9, 10, 15, 82];

export type MergeStep = { i: number; j: number; out: (number | "")[]; from: "L" | "R" | null; caption: string };

export function mergeSteps(): MergeStep[] {
  const L = LEFT;
  const R = RIGHT;
  const out: (number | "")[] = Array(L.length + R.length).fill("");
  const steps: MergeStep[] = [{ i: 0, j: 0, out: out.slice(), from: null, caption: "Two sorted lists. The smallest value of all must be at the front of one of them. Compare the two fronts." }];
  let i = 0;
  let j = 0;
  let k = 0;
  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) {
      out[k++] = L[i];
      steps.push({ i: i + 1, j, out: out.slice(), from: "L", caption: `${L[i]} is not bigger than ${R[j]}: take ${L[i]} from the left list. On a tie the left list goes first, which keeps the sort stable.` });
      i++;
    } else {
      out[k++] = R[j];
      steps.push({ i, j: j + 1, out: out.slice(), from: "R", caption: `${R[j]} is smaller than ${L[i]}: take ${R[j]} from the right list.` });
      j++;
    }
  }
  while (i < L.length) {
    out[k++] = L[i++];
    steps.push({ i, j, out: out.slice(), from: "L", caption: "The right list is used up. Copy the rest of the left list." });
  }
  while (j < R.length) {
    out[k++] = R[j++];
    steps.push({ i, j, out: out.slice(), from: "R", caption: "The left list is used up. Copy the rest of the right list." });
  }
  steps.push({ i, j, out, from: null, caption: `Merged. Each step moves one value to the output, so merging lists of total length n takes O(n) time and an O(n) output list.` });
  return steps;
}

export const MS8 = [38, 27, 43, 3, 9, 82, 10, 15];

export type TreeStep = { nodes: TNode[]; caption: string };

export function mergeTreeSteps(): TreeStep[] {
  type Seg = { id: string; lo: number; hi: number; parent?: string };
  const segs: Seg[] = [];
  const events: { id: string; kind: "split" | "merge" | "leaf" }[] = [];
  const build = (lo: number, hi: number, id: string, parent?: string) => {
    segs.push({ id, lo, hi, parent });
    if (lo === hi) {
      events.push({ id, kind: "leaf" });
      return;
    }
    events.push({ id, kind: "split" });
    const mid = Math.floor((lo + hi) / 2);
    build(lo, mid, id + "L", id);
    build(mid + 1, hi, id + "R", id);
    events.push({ id, kind: "merge" });
  };
  build(0, MS8.length - 1, "r");
  const seen = new Set<string>();
  const merged = new Set<string>();
  const label = (s: Seg) => {
    const part = MS8.slice(s.lo, s.hi + 1);
    return (merged.has(s.id) ? [...part].sort((x, y) => x - y) : part).join(" ");
  };
  const steps: TreeStep[] = [];
  const snap = (cur: string, caption: string) =>
    steps.push({ caption, nodes: segs.map((s) => ({ id: s.id, label: label(s), parent: s.parent, state: !seen.has(s.id) ? "hidden" : s.id === cur ? (merged.has(s.id) ? "found" : "cur") : merged.has(s.id) || s.lo === s.hi ? "done" : "" })) });
  for (const e of events) {
    const s = segs.find((x) => x.id === e.id)!;
    seen.add(e.id);
    if (e.kind === "split") snap(e.id, s.id === "r" ? "Merge sort splits the list in half, sorts each half the same way, then merges the two sorted halves." : `Split ${label(s)} into two halves.`);
    else if (e.kind === "leaf") {
      merged.add(e.id);
      snap(e.id, `${MS8[s.lo]} alone is already sorted: the base case.`);
    } else {
      merged.add(e.id);
      snap(e.id, `Both halves are sorted. Merge them: ${label(s)}.`);
    }
  }
  steps.push({ caption: "Sorted. There are log₂ 8 = 3 levels of merging, and each level merges 8 values in all. So merge sort is O(n log n), in every case.", nodes: segs.map((s) => ({ id: s.id, label: label(s), parent: s.parent, state: "done" })) });
  return steps;
}

/* SORT-3.1: Lomuto partition */

export const PART_RANDOM = [29, 10, 14, 37, 13, 5, 33, 18];
export const PART_SORTED = [5, 10, 13, 14, 18, 21, 29, 37];

export function partitionSteps(input: number[]): ArrStep[] {
  const a = input.slice();
  const hi = a.length - 1;
  const p = a[hi];
  let i = 0;
  let cmp = 0;
  let swaps = 0;
  const out: ArrStep[] = [];
  const st = (j: number | null, extra: Record<number, CellState> = {}): CellState[] => a.map((_, k) => (k === hi ? "mid" : k in extra ? extra[k] : j !== null && k >= i && k < j ? "out" : ""));
  const win = (): Win | undefined => (i > 0 ? { lo: 0, hi: i - 1, label: `less than ${p}` } : undefined);
  out.push({ a: a.slice(), states: st(null), win: win(), ptrs: [], caption: `Partition around the pivot ${p}, the last value. Goal: every value less than ${p} to its left, every other value to its right.`, stats: { comparisons: 0, swaps: 0 } });
  for (let j = 0; j < hi; j++) {
    cmp++;
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      swaps++;
      i++;
      out.push({ a: a.slice(), states: st(j + 1, { [i - 1]: "found" }), win: win(), ptrs: [{ name: "i", at: i, kind: "blue" }, { name: "j", at: j, kind: "blue" }], caption: `${a[i - 1]} is smaller than ${p}: swap it to position ${i - 1}, the end of the small part. \`i\` moves on.`, stats: { comparisons: cmp, swaps } });
    } else {
      out.push({ a: a.slice(), states: st(j + 1), win: win(), ptrs: [{ name: "i", at: i, kind: "blue" }, { name: "j", at: j, kind: "blue" }], caption: `${a[j]} is at least ${p}: leave it. It joins the big part (hatched).`, stats: { comparisons: cmp, swaps } });
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  swaps++;
  out.push({
    a: a.slice(),
    states: a.map((_, k) => (k === i ? "found" : "")),
    win: win(),
    ptrs: [{ name: "i", at: i, kind: "blue" }],
    caption: `Swap the pivot into position ${i}. It is now in its final place: ${i} values are smaller and ${hi - i} are not.`,
    stats: { comparisons: cmp, swaps },
  });
  out.push({
    a: a.slice(),
    states: a.map((_, k) => (k === i ? "found" : "")),
    win: win(),
    ptrs: [],
    caption:
      i === hi
        ? `A bad split: ${i} values on the left and none on the right. On a sorted list the last value is always the largest, so every split is like this, and quick sort takes about n² / 2 comparisons. Choosing the pivot at random fixes this.`
        : `A good split: ${i} on the left, ${hi - i} on the right. Quick sort now sorts each side the same way. When the splits are roughly even, it takes O(n log n) time.`,
    stats: { comparisons: cmp, swaps },
  });
  return out;
}

/* SORT-4.1: heap sort */

export const HEAP_IN = [4, 10, 3, 5, 1, 8, 7];

export type HeapStep = { a: number[]; size: number; hl: number[]; ok: number | null; caption: string };

export function heapSteps(): HeapStep[] {
  const a = HEAP_IN.slice();
  const n = a.length;
  const steps: HeapStep[] = [];
  steps.push({ a: a.slice(), size: n, hl: [], ok: null, caption: "The list read as a tree: the children of position i are at 2i + 1 and 2i + 2. A max-heap has every parent at least as big as its children." });
  const sift = (i: number, size: number) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let big = i;
      if (l < size && a[l] > a[big]) big = l;
      if (r < size && a[r] > a[big]) big = r;
      if (big === i) {
        steps.push({ a: a.slice(), size, hl: [i], ok: i, caption: l < size ? `${a[i]} is at least as big as its children. This part is a heap.` : `${a[i]} has no children inside the heap, so this part is a heap.` });
        return;
      }
      steps.push({ a: a.slice(), size, hl: [i, big], ok: null, caption: `${a[i]} is smaller than its child ${a[big]}. Swap them and keep going down.` });
      [a[i], a[big]] = [a[big], a[i]];
      i = big;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sift(i, n);
  steps.push({ a: a.slice(), size: n, hl: [0], ok: 0, caption: `The heap is built. The largest value, ${a[0]}, is at the top. Building a heap this way takes O(n) time.` });
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    steps.push({ a: a.slice(), size: end, hl: [0], ok: null, caption: `Swap the top, ${a[end]}, with the last value of the heap. ${a[end]} is now in its final place, and the heap shrinks by one.` });
    sift(0, end);
  }
  steps.push({ a: a.slice(), size: 0, hl: [], ok: null, caption: "Sorted. Each of the n removals sifts down at most log₂ n levels, so heap sort is O(n log n) in every case, and it needs only O(1) extra space." });
  return steps;
}

/* SORT-5.1: the decision tree for three values */

export type DTStep = { nodes: TNode[]; caption: string; count: number };

const DT: { id: string; label: string; parent?: string; edge?: string; test?: [string, string] }[] = [
  { id: "r", label: "a < b ?", test: ["a", "b"] },
  { id: "y", label: "b < c ?", parent: "r", edge: "yes", test: ["b", "c"] },
  { id: "yy", label: "a b c", parent: "y", edge: "yes" },
  { id: "yn", label: "a < c ?", parent: "y", edge: "no", test: ["a", "c"] },
  { id: "yny", label: "a c b", parent: "yn", edge: "yes" },
  { id: "ynn", label: "c a b", parent: "yn", edge: "no" },
  { id: "n", label: "a < c ?", parent: "r", edge: "no", test: ["a", "c"] },
  { id: "ny", label: "b a c", parent: "n", edge: "yes" },
  { id: "nn", label: "b < c ?", parent: "n", edge: "no", test: ["b", "c"] },
  { id: "nny", label: "b c a", parent: "nn", edge: "yes" },
  { id: "nnn", label: "c b a", parent: "nn", edge: "no" },
];

export function decisionSteps(vals: Record<string, number>): DTStep[] {
  const steps: DTStep[] = [];
  const path: string[] = ["r"];
  let cur = DT[0];
  const desc = `a = ${vals.a}, b = ${vals.b}, c = ${vals.c}`;
  const snap = (caption: string) =>
    steps.push({
      count: path.length - 1,
      caption,
      nodes: DT.map((d) => ({ id: d.id, label: d.label, parent: d.parent, edge: d.edge, state: d.id === path[path.length - 1] ? (d.test ? "cur" : "found") : path.includes(d.id) ? "done" : "" })),
    });
  steps.push({ count: 0, caption: "Any sort that only compares values can be drawn as a tree. Each box is one comparison; each answer picks a branch. Each leaf is one possible order of a, b and c.", nodes: DT.map((d) => ({ id: d.id, label: d.label, parent: d.parent, edge: d.edge })) });
  snap(`Sort ${desc}. Start at the top.`);
  while (cur.test) {
    const [x, y] = cur.test;
    const yes = vals[x] < vals[y];
    const next = DT.find((d) => d.parent === cur.id && d.edge === (yes ? "yes" : "no"))!;
    path.push(next.id);
    snap(`Is ${x} smaller than ${y}? ${vals[x]} ${yes ? "is" : "is not"} smaller than ${vals[y]}: take the “${yes ? "yes" : "no"}” branch.${next.test ? "" : ` A leaf: the order is ${next.label.split(" ").map((k) => vals[k]).join(", ")}.`}`);
    cur = next;
  }
  steps.push({
    count: path.length - 1,
    nodes: DT.map((d) => ({ id: d.id, label: d.label, parent: d.parent, edge: d.edge, state: d.test ? "" : "found" })),
    caption: "There are 3! = 6 leaves, one for each order. A tree of depth d has at most 2ᵈ leaves (d twos multiplied together), so d is at least log₂ 6, about 2.6: some input needs 3 comparisons. For n values, d is at least log₂(n!), which is about n log₂ n.",
  });
  return steps;
}

/* SORT-6.1: counting sort and radix sort */

export const CS = [3, 1, 4, 1, 0, 3, 2, 4, 1];

export type CountStep = { a: (number | string)[]; aStates: CellState[]; count: number[]; cStates: CellState[]; out: (number | "")[]; caption: string };

export function countingSteps(): CountStep[] {
  const a = CS;
  const k = 5;
  const count = Array(k).fill(0);
  const out: (number | "")[] = Array(a.length).fill("");
  const steps: CountStep[] = [{ a, aStates: [], count: count.slice(), cStates: [], out: out.slice(), caption: `The values are whole numbers from 0 to ${k - 1}. Make a list of ${k} counters, one per possible value.` }];
  a.forEach((v, i) => {
    count[v]++;
    steps.push({ a, aStates: a.map((_, j) => (j === i ? "mid" : j < i ? "out" : "")), count: count.slice(), cStates: count.map((_, j) => (j === v ? "found" : "")), out: out.slice(), caption: `Read ${v}: add 1 to \`count[${v}]\`. No value is compared with another.` });
  });
  let w = 0;
  for (let v = 0; v < k; v++) {
    for (let c = 0; c < count[v]; c++) out[w++] = v;
    steps.push({ a, aStates: a.map(() => "out"), count: count.slice(), cStates: count.map((_, j) => (j === v ? "mid" : j < v ? "out" : "")), out: out.slice(), caption: count[v] ? `Write ${v} ${count[v] === 1 ? "once" : `${count[v]} times`}.` : `No ${v}s: write nothing.` });
  }
  steps.push({ a, aStates: [], count, cStates: [], out, caption: `Sorted in O(n + k) time: one pass to count, one pass over the ${k} counters. It beats n log n because it never compares values, so the lower bound from lesson 5 does not apply. It only works when k, the range of values, is small.` });
  return steps;
}

export const RADIX = [170, 45, 75, 90, 802, 24, 2, 66];

export function radixSteps(): CountStep[] {
  let a = RADIX.slice();
  const names = ["ones", "tens", "hundreds"];
  const steps: CountStep[] = [{ a: a.map(pad), aStates: [], count: [], cStates: [], out: [], caption: "Radix sort sorts by one digit at a time, starting with the last digit. Each pass must be stable: values with the same digit keep their order from the pass before." }];
  for (let d = 0; d < 3; d++) {
    const p = 10 ** d;
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const v of a) buckets[Math.floor(v / p) % 10].push(v);
    a = buckets.flat();
    steps.push({
      a: a.map(pad),
      aStates: [],
      count: buckets.map((b) => b.length),
      cStates: [],
      out: [],
      caption: `Pass ${d + 1}, by the ${names[d]} digit: ${a.map((v) => `${pad(v)}`).join(", ")}. ${d === 0 ? "Values are in order of their last digit." : `Values with the same ${names[d]} digit stay in the order the last pass left them.`}`,
    });
  }
  steps.push({ a: a.map(pad), aStates: [], count: [], cStates: [], out: [], caption: "Sorted after 3 passes, one per digit. With d digits and base b, radix sort takes O(d × (n + b)) time. For numbers of a fixed size this is O(n)." });
  return steps;
}

function pad(v: number) {
  return String(v).padStart(3, "0");
}

/* SORT-7.1: stable and unstable */

export const RECS: [string, number][] = [
  ["BCT", 2],
  ["HWH", 1],
  ["MAS", 2],
  ["SBC", 1],
  ["NDLS", 2],
];

export type StabStep = { a: string[]; states: CellState[]; caption: string; verdict?: { ok: boolean; text: string } };

export function stabilitySteps(stable: boolean): StabStep[] {
  const a = RECS.slice();
  const show = () => a.map(([n, p]) => `${n}·${p}`);
  const steps: StabStep[] = [{ a: show(), states: [], caption: `Sort these trains by platform number only. BCT, MAS and NDLS share platform 2, in that order. A stable sort keeps them in that order.` }];
  if (stable) {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0 && a[j][1] > key[1]) {
        a[j + 1] = a[j];
        j--;
      }
      a[j + 1] = key;
      steps.push({ a: show(), states: a.map((_, k) => (k === j + 1 ? "mid" : "")), caption: `Insertion sort places ${key[0]}. It only moves past values with a strictly larger platform, so it never jumps over an equal one.` });
    }
  } else {
    for (let i = 0; i < a.length - 1; i++) {
      let m = i;
      for (let j = i + 1; j < a.length; j++) if (a[j][1] < a[m][1]) m = j;
      const jumped = m !== i ? a[i][0] : null;
      [a[i], a[m]] = [a[m], a[i]];
      steps.push({ a: show(), states: a.map((_, k) => (k === i ? "mid" : k === m && m !== i ? "path" : "")), caption: jumped ? `Selection sort swaps ${a[i][0]} to position ${i}. ${jumped} jumps to position ${m}, past the values in between.` : `${a[i][0]} is already in place.` });
    }
  }
  const twos = a.filter(([, p]) => p === 2).map(([n]) => n);
  const ok = twos.join() === "BCT,MAS,NDLS";
  steps.push({
    a: show(),
    states: a.map(([, p]) => (p === 2 ? (ok ? "found" : "violated") : "")),
    caption: ok ? `Platform 2 reads ${twos.join(", ")}: the original order. This sort is stable.` : `Platform 2 now reads ${twos.join(", ")}. The swap moved BCT past MAS. Selection sort is not stable.`,
    verdict: { ok, text: ok ? "stable" : "not stable" },
  });
  return steps;
}

/* SORT-8.1: quickselect */

export const QS = [29, 10, 14, 37, 13, 5, 33, 18, 21];

export type SelStep = { a: number[]; states: CellState[]; win: Win; p: number | null; caption: string };

export function selectSteps(k = 4): SelStep[] {
  const a = QS.slice();
  let lo = 0;
  let hi = a.length - 1;
  const steps: SelStep[] = [{ a: a.slice(), states: [], win: { lo, hi, label: "search here" }, p: null, caption: `Find the value at index ${k} of the sorted list (the ${k + 1}th smallest) without sorting everything.` }];
  for (;;) {
    const piv = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < piv) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    const states = statesFor(a.length, lo, hi, { [i]: i === k ? "found" : "mid" });
    if (i === k) {
      steps.push({ a: a.slice(), states, win: { lo, hi, label: "search here" }, p: i, caption: `Partition around ${piv}. It lands at index ${i}, which is k: the answer is ${piv}. Done.` });
      break;
    }
    const left = k < i;
    steps.push({
      a: a.slice(),
      states,
      win: { lo, hi, label: "search here" },
      p: i,
      caption: `Partition around ${piv}. It lands at index ${i}. We want index ${k}, which is ${left ? "to its left" : "to its right"}, so throw away the other side.`,
    });
    if (left) hi = i - 1;
    else lo = i + 1;
    steps.push({ a: a.slice(), states: statesFor(a.length, lo, hi), win: { lo, hi, label: "search here" }, p: null, caption: `Only ${plural(hi - lo + 1, "value")} left to search. Unlike quick sort, only one side is ever looked at again.` });
  }
  steps.push({ a: a.slice(), states: a.map((_, j) => (j === k ? "found" : "")), win: { lo: k, hi: k, label: "answer" }, p: k, caption: "With good pivots each round keeps about half, so the work is n + n/2 + n/4 + … < 2n: O(n) on average. Pick the pivot at random so no input is bad every time." });
  return steps;
}
