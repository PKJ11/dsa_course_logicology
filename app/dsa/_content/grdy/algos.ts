// Step generators for the GRDY figures. Every figure is a pure function of its step number.
// Intervals, jobs, coins and bags are drawn with the Timeline stage: each piece is a bar over the stretch of the
// axis it uses (time, kilograms or rupees). Huffman's trees use the Tree stage as a forest that slides together.
// Captions use `backticks` for code.

import type { Mark, TBar, TMark, TNode, TRow } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type LineStep = {
  rows: TRow[];
  marks?: TMark[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
  /** a small table under the line: header plus rows, with one row marked */
  table?: { head: string[]; rows: string[][]; cur?: number };
};

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

/* GRDY-1.1: the fractional knapsack, three greedy rules */

export type BagRule = "ratio" | "value" | "light";

export const ITEMS = [
  { name: "A", kg: 5, value: 10 },
  { name: "B", kg: 4, value: 7 },
  { name: "C", kg: 3, value: 3 },
  { name: "D", kg: 2, value: 5 },
];
export const BAG = 8;

const RULE_TEXT: Record<BagRule, string> = {
  ratio: "the most value per kg first",
  value: "the most valuable item first",
  light: "the lightest item first",
};

const FRACTION: Record<string, string> = { "0.25": "1/4", "0.5": "1/2", "0.75": "3/4" };
const frac = (f: number) => (f === 1 ? "all" : FRACTION[String(f)] ?? fmt(f));

export function bagSteps(rule: BagRule): LineStep[] {
  const order = ITEMS.slice().sort((a, b) =>
    rule === "ratio" ? b.value / b.kg - a.value / a.kg : rule === "value" ? b.value - a.value : a.kg - b.kg,
  );
  const head = ["item", "kg", "value", "per kg", "taken"];
  const taken: Record<string, string> = {};
  const tableRows = () => order.map((it) => [it.name, String(it.kg), String(it.value), fmt(it.value / it.kg), taken[it.name] ?? ""]);
  const bars: TBar[] = [];
  const steps: LineStep[] = [];
  steps.push({
    rows: [{ name: "bag", bars: [] }],
    table: { head, rows: tableRows() },
    caption: `A bag holds ${BAG} kg. Four items, and any part of an item may be taken (think of rice or gold dust): half of an item weighs half and is worth half. The greedy rule here: take ${RULE_TEXT[rule]}. The table lists the items in that order.`,
    readout: `0 kg used, value 0`,
  });
  let used = 0;
  let value = 0;
  for (let k = 0; k < order.length; k++) {
    const it = order[k];
    const room = BAG - used;
    if (room === 0) {
      taken[it.name] = "none";
      continue;
    }
    const kg = Math.min(it.kg, room);
    const f = kg / it.kg;
    const v = it.value * f;
    taken[it.name] = frac(f);
    for (const b of bars) b.state = "done";
    bars.push({ id: it.name, from: used, to: used + kg, label: f === 1 ? it.name : `${frac(f)} ${it.name}`, state: "cur" });
    used += kg;
    value += v;
    steps.push({
      rows: [{ name: "bag", bars: bars.map((b) => ({ ...b })) }],
      table: { head, rows: tableRows(), cur: k },
      caption:
        f === 1
          ? `Take all of ${it.name}: ${it.kg} kg worth ${it.value}. The bag now holds ${used} kg.`
          : `Only ${room} kg is left, so take ${frac(f)} of ${it.name}: ${kg} of its ${it.kg} kg, worth ${fmt(v)}. The bag is full.`,
      readout: `${used} kg used, value ${fmt(value)}`,
    });
  }
  const best = 16.75;
  const ok = Math.abs(value - best) < 1e-9;
  for (const b of bars) b.state = ok ? "found" : "done";
  steps.push({
    rows: [{ name: "bag", bars: bars.map((b) => ({ ...b })) }],
    table: { head, rows: tableRows() },
    caption: ok
      ? "The bag is full and worth 16.75. No other choice does better: every kilogram in the bag is the most valuable kilogram that was still left (lesson 2 turns this into a proof)."
      : `The bag is full, but it is worth only ${fmt(value)}. Taking the most value per kg first gives 16.75. ${rule === "value" ? "A was valuable, but also heavy." : "Light items are not always worth much."}`,
    readout: `value ${fmt(value)}`,
    verdict: ok ? { ok: true, text: "16.75, the best possible" } : { ok: false, text: `${fmt(value)}; 16.75 is possible` },
  });
  return steps;
}

/* GRDY-2.1: exchange arguments, by swapping neighbours */

export type SwapVariant = "wait" | "late";

type Job = { name: string; len: number; due?: number };

export const WAIT_JOBS: Job[] = [
  { name: "A", len: 3 },
  { name: "B", len: 1 },
  { name: "C", len: 4 },
  { name: "D", len: 2 },
];

export const LATE_JOBS: Job[] = [
  { name: "A", len: 3, due: 6 },
  { name: "B", len: 2, due: 2 },
  { name: "C", len: 1, due: 9 },
  { name: "D", len: 4, due: 8 },
];

function finishes(order: Job[]) {
  let t = 0;
  return order.map((j) => (t += j.len));
}

function jobBars(order: Job[], v: SwapVariant, cur: string[] = [], allState: Mark = ""): TBar[] {
  const fin = finishes(order);
  return order.map((j, k) => {
    const tag = v === "wait" ? `${fin[k]}` : undefined;
    return { id: j.name, from: fin[k] - j.len, to: fin[k], label: j.name, state: cur.includes(j.name) ? "cur" : allState, tag, tagKind: "plain" as const };
  });
}

const score = (order: Job[], v: SwapVariant) => {
  const fin = finishes(order);
  return v === "wait" ? fin.reduce((s, x) => s + x, 0) : Math.max(0, ...order.map((j, k) => fin[k] - (j.due ?? fin[k])));
};

export function swapSteps(v: SwapVariant): LineStep[] {
  const order = (v === "wait" ? WAIT_JOBS : LATE_JOBS).slice();
  const key = (j: Job) => (v === "wait" ? j.len : j.due!);
  const marks: TMark[] = v === "late" ? order.map((j) => ({ at: j.due!, label: j.name, kind: "dash" as const })) : [];
  const steps: LineStep[] = [];
  const read = () => {
    if (v === "wait") return `finish times ${finishes(order).join(" + ")} = ${score(order, v)}`;
    const fin = finishes(order);
    const late = order.map((j, k) => [j.name, fin[k] - j.due!] as const).filter(([, l]) => l > 0);
    return `late: ${late.map(([n, l]) => `${n} by ${l}`).join(", ") || "none"}; largest ${score(order, v)}`;
  };
  steps.push({
    rows: [{ name: "order", bars: jobBars(order, v) }],
    marks,
    caption:
      v === "wait"
        ? "Four jobs share one machine, one after another. Each tag is the time that job finishes, which is how long its owner waits. The goal: the smallest total wait. Greedy rule: the shortest job first. This order breaks that rule."
        : "Four jobs, each with a length and a deadline (the dashed lines, named by job). A job that finishes after its deadline is late by the difference. The goal: make the largest lateness as small as possible. Greedy rule: the earliest deadline first.",
    readout: read(),
  });
  // swap neighbours that break the rule, one pair at a time, as an exchange argument does
  for (;;) {
    const k = order.findIndex((j, i) => i + 1 < order.length && key(j) > key(order[i + 1]));
    if (k < 0) break;
    const x = order[k];
    const y = order[k + 1];
    const before = score(order, v);
    steps.push({
      rows: [{ name: "order", bars: jobBars(order, v, [x.name, y.name]) }],
      marks,
      caption:
        v === "wait"
          ? `${x.name} (length ${x.len}) runs just before ${y.name} (length ${y.len}), which is shorter. Swap the two. ${y.name} will finish ${x.len} earlier and ${x.name} ${y.len} later; no other job moves.`
          : `${x.name} (due ${x.due}) runs just before ${y.name} (due ${y.due}), which is due earlier. Swap the two. Both together still end at the same time, and no other job moves.`,
      readout: read(),
    });
    order[k] = y;
    order[k + 1] = x;
    const after = score(order, v);
    steps.push({
      rows: [{ name: "order", bars: jobBars(order, v, [x.name, y.name]) }],
      marks,
      caption:
        v === "wait"
          ? `Swapped. The total changed by ${y.len} − ${x.len} = −${x.len - y.len}: it went down, because the shorter job now goes first. A swap like this never makes the total larger.`
          : `Swapped. ${y.name} finishes earlier, so it is late by no more than before. ${x.name} now finishes when ${y.name} used to, and ${x.name}'s deadline is later than ${y.name}'s, so ${x.name} is late by less than ${y.name} was. The largest lateness went from ${before} to ${after}: it never goes up.`,
      readout: read(),
    });
  }
  const fin = score(order, v);
  steps.push({
    rows: [{ name: "order", bars: jobBars(order, v, [], "found") }],
    marks,
    caption:
      v === "wait"
        ? `No neighbours are left out of order: this is the shortest-first order. Each swap kept the total the same or made it smaller, so no order beats it. The same swaps turn any order, even a best one, into this one.`
        : `Now the jobs run in order of deadline. Every swap kept the largest lateness the same or made it smaller, so the earliest-deadline order is at least as good as any other order.`,
    readout: read(),
    verdict: { ok: true, text: v === "wait" ? `total ${fin}, the least` : `largest lateness ${fin}, the least` },
  });
  return steps;
}

/* GRDY-3.1: interval scheduling (three rules) and fewest platforms */

export type IntervalRule = "end" | "start" | "short" | "platforms";

export const INTERVALS = [
  { name: "A", from: 0, to: 7 },
  { name: "B", from: 1, to: 3 },
  { name: "C", from: 3, to: 5 },
  { name: "D", from: 5, to: 8 },
  { name: "E", from: 7, to: 9 },
  { name: "F", from: 8, to: 11 },
];

export const TRAINS = [
  { name: "T1", from: 0, to: 4 },
  { name: "T2", from: 1, to: 3 },
  { name: "T3", from: 2, to: 6 },
  { name: "T4", from: 3, to: 5 },
  { name: "T5", from: 5, to: 8 },
  { name: "T6", from: 6, to: 9 },
  { name: "T7", from: 7, to: 10 },
];

const RULE: Record<Exclude<IntervalRule, "platforms">, string> = {
  end: "the one that ends first",
  start: "the one that starts first",
  short: "the shortest",
};

export function intervalSteps(rule: IntervalRule): LineStep[] {
  if (rule === "platforms") return platformSteps();
  const order = INTERVALS.slice().sort((a, b) =>
    rule === "end" ? a.to - b.to : rule === "start" ? a.from - b.from : a.to - a.from - (b.to - b.from) || a.from - b.from,
  );
  const state: Record<string, { s: Mark; tag?: string }> = {};
  const chosen: string[] = [];
  let free = 0;
  const steps: LineStep[] = [];
  const snapshot = (cur: string | null): TRow[] => [
    {
      name: "chosen",
      bars: chosen.map((n) => {
        const it = INTERVALS.find((x) => x.name === n)!;
        // the chosen strip is a summary: the new booking's heavy frame stays on its own row
        return { id: `c${n}`, from: it.from, to: it.to, label: n, state: "done" as const };
      }),
    },
    ...INTERVALS.map((it) => ({
      bars: [{ id: it.name, from: it.from, to: it.to, label: it.name, state: state[it.name]?.s ?? "", tag: state[it.name]?.tag, tagKind: "plain" as const, tagAt: "end" as const }],
    })),
  ];
  steps.push({
    rows: snapshot(null),
    caption: `Six bookings for one room, each from a start time up to (not including) an end time. Choose as many as possible with no two overlapping. Greedy rule: of the bookings that still fit, take ${RULE[rule as keyof typeof RULE]}. In that order: ${order.map((x) => x.name).join(", ")}.`,
    readout: "chosen: none",
  });
  for (const it of order) {
    for (const n of Object.keys(state)) if (state[n].s === "cur") state[n] = { s: "done" };
    const fits = it.from >= free;
    const was = free;
    if (fits) {
      chosen.push(it.name);
      chosen.sort((a, b) => INTERVALS.find((x) => x.name === a)!.from - INTERVALS.find((x) => x.name === b)!.from);
      state[it.name] = { s: "cur" };
      free = it.to;
    } else {
      state[it.name] = { s: "out", tag: "skip" };
    }
    const blocker = INTERVALS.find((x) => chosen.includes(x.name) && x.from < it.to && it.from < x.to && x.name !== it.name);
    steps.push({
      rows: snapshot(fits ? it.name : null),
      marks: chosen.length ? [{ at: free, label: `free ${free}` }] : [],
      caption: fits
        ? `${it.name} (${it.from} to ${it.to}) starts at ${it.from}, and the room is free from ${was}, so take it. The room is now busy until ${it.to}.`
        : `${it.name} (${it.from} to ${it.to}) overlaps ${blocker?.name ?? "a chosen booking"}, which is already chosen. Skip it.`,
      readout: `chosen: ${chosen.join(", ")}`,
    });
  }
  for (const n of Object.keys(state)) if (state[n].s === "cur") state[n] = { s: "done" };
  const best = 4;
  const ok = chosen.length === best;
  steps.push({
    rows: snapshot(null).map((r, k) => (k === 0 ? { ...r, bars: r.bars.map((b) => ({ ...b, state: ok ? ("found" as const) : ("done" as const) })) } : r)),
    marks: [{ at: free, label: `free ${free}` }],
    caption: ok
      ? "Four bookings: B, C, D and F. Taking the one that ends first always leaves the room free as early as possible, so the greedy choice is never behind any other choice (lesson 3 proves it)."
      : rule === "start"
        ? `Only ${chosen.length}. A starts first but lasts until 7, and blocks B, C and D. Taking the one that ends first gives 4: B, C, D and F.`
        : `Only ${chosen.length}. E is short, but it overlaps both D and F, which do not overlap each other. Taking the one that ends first gives 4: B, C, D and F.`,
    readout: `chosen: ${chosen.join(", ")}`,
    verdict: ok ? { ok: true, text: "4, the most possible" } : { ok: false, text: `${chosen.length}; 4 are possible` },
  });
  return steps;
}

function platformSteps(): LineStep[] {
  const platforms: { name: string; bars: TBar[]; free: number }[] = [];
  const steps: LineStep[] = [];
  const total = 3;
  const rows = (cur: string | null): TRow[] =>
    Array.from({ length: total }, (_, k) => {
      const p = platforms[k];
      if (!p) return { bars: [] };
      return { name: p.name, bars: p.bars.map((b) => ({ ...b, state: b.id === cur ? ("cur" as const) : ("done" as const) })) };
    });
  steps.push({
    rows: rows(null),
    caption: "Seven trains, each in the station from its arrival up to (not including) its departure. A platform can hold one train at a time, and is free again the moment its train leaves. How few platforms are enough? Greedy rule: take the trains in order of arrival, and put each on a platform that is free; open a new platform only when none is.",
    readout: "platforms: 0",
  });
  for (const t of TRAINS) {
    const free = platforms.filter((p) => p.free <= t.from);
    // the platform that became free first: the heap of departure times keeps it on top
    const p = free.sort((a, b) => a.free - b.free)[0];
    let text: string;
    if (p) {
      text = `${t.name} arrives at ${t.from}. ${p.name} has been free since ${p.free}, so ${t.name} goes there.`;
      p.bars.push({ id: t.name, from: t.from, to: t.to, label: t.name });
      p.free = t.to;
    } else {
      const name = `P${platforms.length + 1}`;
      text = `${t.name} arrives at ${t.from}. ${platforms.length ? `Every platform is busy (${platforms.map((q) => `${q.name} until ${q.free}`).join(", ")}), so` : "No platform is open yet, so"} open ${name}.`;
      platforms.push({ name, bars: [{ id: t.name, from: t.from, to: t.to, label: t.name }], free: t.to });
    }
    steps.push({
      rows: rows(t.name),
      marks: [{ at: t.from, label: `now ${t.from}` }],
      caption: text,
      readout: `platforms: ${platforms.length}`,
    });
  }
  steps.push({
    rows: rows(null).map((r) => ({ ...r, bars: r.bars.map((b) => ({ ...b, state: "found" as const })) })),
    marks: [{ at: 2, label: "at 2" }],
    caption: "Three platforms. No method can use fewer: at time 2, trains T1, T2 and T3 are all in the station, and each needs its own platform. The greedy method opens a new platform only when every open one is busy, so it never opens more than the largest number of trains in at once.",
    readout: "platforms: 3",
    verdict: { ok: true, text: "3, the fewest possible" },
  });
  return steps;
}

/* GRDY-4.1: Huffman coding, as a forest that merges */

export type HuffVariant = "build" | "decode";

export const FREQ: [string, number][] = [
  ["a", 5],
  ["b", 9],
  ["c", 12],
  ["d", 13],
  ["e", 16],
  ["f", 45],
];

type HNode = { id: string; w: number; sym?: string; kids?: [HNode, HNode]; order: number };

export type HuffStep = {
  nodes: TNode[];
  queue: string[];
  queueStates: CellState[];
  bits?: string[];
  bitStates?: CellState[];
  bitAt?: number | null;
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

const hlabel = (n: HNode) => (n.sym ? `${n.sym} ${n.w}` : `${n.w}`);

function treeNodes(roots: HNode[], marks: Record<string, Mark>, notes: Record<string, string> = {}, walked: string[] = []): TNode[] {
  const out: TNode[] = [];
  const walk = (n: HNode, parent?: string, edge?: string) => {
    out.push({ id: n.id, label: hlabel(n), parent, edge, state: marks[n.id] ?? "", note: notes[n.id], walked: walked.includes(n.id) });
    if (n.kids) {
      walk(n.kids[0], n.id, "0");
      walk(n.kids[1], n.id, "1");
    }
  };
  for (const r of roots) walk(r);
  return out;
}

/** The full merge sequence: the queue in order before each merge, and the tree at the end. */
function huffman() {
  let order = 0;
  let queue: HNode[] = FREQ.map(([s, w]) => ({ id: s, w, sym: s, order: order++ }));
  const cmp = (a: HNode, b: HNode) => a.w - b.w || a.order - b.order;
  queue.sort(cmp);
  const history: { queue: HNode[]; a: HNode; b: HNode; joined: HNode; after: HNode[] }[] = [];
  while (queue.length > 1) {
    const [a, b, ...rest] = queue;
    const joined: HNode = { id: `n${a.id}${b.id}`, w: a.w + b.w, kids: [a, b], order: order++ };
    const after = [...rest, joined].sort(cmp);
    history.push({ queue, a, b, joined, after });
    queue = after;
  }
  return { history, root: queue[0] };
}

export function codes(root: HNode): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (n: HNode, path: string) => {
    if (n.sym) out[n.sym] = path || "0";
    else {
      walk(n.kids![0], path + "0");
      walk(n.kids![1], path + "1");
    }
  };
  walk(root, "");
  return out;
}

const qcells = (q: HNode[]) => q.map(hlabel);

export function huffSteps(v: HuffVariant): HuffStep[] {
  const { history, root } = huffman();
  const code = codes(root);
  const steps: HuffStep[] = [];
  if (v === "build") {
    const start = history[0].queue;
    steps.push({
      nodes: treeNodes(start, {}),
      queue: qcells(start),
      queueStates: start.map(() => ""),
      caption:
        "Six letters and how often each appears in a text of 100 letters. Each letter starts as a tree of one node, weighed by its count. The queue keeps the trees smallest first; the program uses a heap for it (HEAP-4).",
      readout: "6 trees",
    });
    history.forEach((h, k) => {
      steps.push({
        nodes: treeNodes(h.queue, { [h.a.id]: "cur", [h.b.id]: "cur" }),
        queue: qcells(h.queue),
        queueStates: h.queue.map((_, i) => (i < 2 ? "mid" : "")),
        caption: `Take the two lightest trees: ${hlabel(h.a)} and ${hlabel(h.b)}. These will end up deepest, so their letters get the longest codes.`,
        readout: `${h.queue.length} trees`,
      });
      const at = h.after.indexOf(h.joined);
      steps.push({
        nodes: treeNodes(h.after, { [h.joined.id]: "found" }),
        queue: qcells(h.after),
        queueStates: h.after.map((_, i) => (i === at ? "mid" : "")),
        caption: `Join them under a new node of weight ${h.a.w} + ${h.b.w} = ${h.joined.w}: the lighter on the left (edge 0), the other on the right (edge 1). Put the new tree back in the queue.${k === history.length - 1 ? " One tree is left: the Huffman tree." : ""}`,
        readout: `${h.after.length} ${h.after.length === 1 ? "tree" : "trees"}`,
      });
    });
    const notes = Object.fromEntries(Object.entries(code).map(([s, c]) => [s, c]));
    const bits = FREQ.reduce((s, [sym, w]) => s + w * code[sym].length, 0);
    steps.push({
      nodes: treeNodes([root], Object.fromEntries(FREQ.map(([s]) => [s, "found" as Mark])), notes),
      queue: qcells([root]),
      queueStates: [""],
      caption: `A letter's code is the edges on the path from the top down to it: f is \`0\`, c is \`100\`, a is \`1100\`. No code is the start of another, because every letter is a leaf. The text needs ${bits} bits, against 300 for 3 bits per letter.`,
      readout: `${bits} bits in all`,
      verdict: { ok: true, text: "the fewest bits possible" },
    });
    return steps;
  }
  // decode a bit string by walking down from the top
  const msg = ["f", "d", "a"];
  const bitstr = msg.map((s) => code[s]).join("");
  const bits = bitstr.split("");
  // nodes already walked through are inked (done), as in every trie walk; the node just reached is current
  const marks = (path: string[], found?: string): Record<string, Mark> => ({
    ...Object.fromEntries(path.map((id, k) => [id, (k === path.length - 1 && !found ? "cur" : "done") as Mark])),
    ...(found ? { [found]: "found" as Mark } : {}),
  });
  const notes = code;
  steps.push({
    nodes: treeNodes([root], {}, notes),
    queue: [],
    queueStates: [],
    bits,
    bitStates: bits.map(() => ""),
    bitAt: null,
    caption: `Decoding reads the bits from the left and walks down the tree: 0 goes left, 1 goes right. Arriving at a letter means the code is complete. Here are ${bits.length} bits to decode.`,
    readout: "out: (nothing yet)",
  });
  let at: HNode = root;
  let path: string[] = [root.id];
  const out: string[] = [];
  bits.forEach((b, k) => {
    at = at.kids![b === "0" ? 0 : 1];
    path.push(at.id);
    const leaf = !!at.sym;
    if (leaf) out.push(at.sym!);
    steps.push({
      // the edges walked so far (every node on the path below the root) are inked
      nodes: treeNodes([root], marks(leaf ? path.slice(0, -1) : path, leaf ? at.id : undefined), notes, path.slice(1)),
      queue: [],
      queueStates: [],
      bits,
      bitStates: bits.map((_, i) => (i === k ? "path" : "")),
      bitAt: k,
      caption: leaf
        ? `Bit ${b}: go ${b === "0" ? "left" : "right"}, to the letter ${at.sym}. Write ${at.sym} and start again at the top. No look-ahead is needed, because no code is the start of another.`
        : `Bit ${b}: go ${b === "0" ? "left" : "right"}, to the node of weight ${at.w}. Not a letter yet: read the next bit.`,
      readout: `out: ${out.join(" ") || "(nothing yet)"}`,
    });
    if (leaf) {
      at = root;
      path = [root.id];
    }
  });
  steps.push({
    nodes: treeNodes([root], {}, notes),
    queue: [],
    queueStates: [],
    bits,
    bitStates: bits.map(() => "found"),
    bitAt: null,
    caption: `The ${bits.length} bits were the letters ${out.join(", ")}. Each letter took as many steps as its code is long, so decoding is O(total bits).`,
    readout: `out: ${out.join(" ")}`,
    verdict: { ok: true, text: `decoded "${out.join("")}"` },
  });
  return steps;
}

/* GRDY-5.1: when greedy fails */

export type FailVariant = "coins" | "rupees" | "knap";

function coinRow(name: string, coins: number[], cur: number | null, all: Mark = "done"): TRow {
  let t = 0;
  return {
    name,
    bars: coins.map((c, k) => {
      const b: TBar = { id: `${name}${k}`, from: t, to: t + c, label: `${c}`, state: k === cur ? "cur" : all };
      t += c;
      return b;
    }),
  };
}

export function failSteps(v: FailVariant): LineStep[] {
  const steps: LineStep[] = [];
  if (v === "knap") {
    const items = [
      { name: "A", kg: 5, value: 10 },
      { name: "B", kg: 4, value: 7 },
      { name: "C", kg: 4, value: 7 },
    ];
    const head = ["item", "kg", "value", "per kg"];
    const rows = items.map((it) => [it.name, String(it.kg), String(it.value), fmt(it.value / it.kg)]);
    const bar = (it: (typeof items)[number], from: number, s: Mark): TBar => ({ id: `${it.name}${from}`, from, to: from + it.kg, label: it.name, state: s, tag: `+${it.value}`, tagKind: "plain" });
    steps.push({
      rows: [{ name: "greedy", bars: [] }, { name: "best", bars: [] }],
      table: { head, rows },
      caption: "Now items cannot be cut: take all of an item or none of it (the 0/1 knapsack). The bag holds 8 kg. Try lesson 1's rule: the most value per kg first.",
      readout: "greedy: 0",
    });
    steps.push({
      rows: [{ name: "greedy", bars: [bar(items[0], 0, "cur")] }, { name: "best", bars: [] }],
      table: { head, rows, cur: 0 },
      caption: "A has the most value per kg (2). Take it: 5 kg, worth 10. 3 kg are left.",
      readout: "greedy: 10",
    });
    steps.push({
      rows: [{ name: "greedy", bars: [bar(items[0], 0, "done")] }, { name: "best", bars: [] }],
      table: { head, rows, cur: 1 },
      caption: "B and C weigh 4 kg each, and only 3 kg are left. Neither fits, and they cannot be cut. The greedy bag stops at 10, with 3 kg empty.",
      readout: "greedy: 10",
    });
    steps.push({
      rows: [
        { name: "greedy", bars: [bar(items[0], 0, "done")] },
        { name: "best", bars: [bar(items[1], 0, "found"), bar(items[2], 4, "found")] },
      ],
      table: { head, rows },
      caption: "Leaving A out and taking B and C fills the bag exactly: 14. The first choice used space that two better-fitting items needed, and greedy never takes a choice back. The 0/1 knapsack needs dynamic programming (DYNP-8).",
      readout: "greedy: 10, best: 14",
      verdict: { ok: false, text: "greedy 10; 14 is possible" },
    });
    return steps;
  }
  const coins = v === "coins" ? [4, 3, 1] : [10, 5, 2, 1];
  const amount = v === "coins" ? 6 : 8;
  const best = v === "coins" ? [3, 3] : [5, 2, 1];
  const taken: number[] = [];
  steps.push({
    rows: [{ name: "greedy", bars: [] }, { name: "best", bars: [] }],
    caption:
      v === "coins"
        ? `Make ${amount} with as few coins as possible, using coins of 1, 3 and 4. Greedy rule: take the largest coin that still fits, again and again.`
        : `Make ${amount} with as few coins as possible, using India's coins of 1, 2, 5 and 10. Greedy rule: take the largest coin that still fits.`,
    readout: `left: ${amount}`,
  });
  let left = amount;
  while (left > 0) {
    const c = coins.find((x) => x <= left)!;
    taken.push(c);
    left -= c;
    steps.push({
      rows: [coinRow("greedy", taken, taken.length - 1), { name: "best", bars: [] }],
      caption: `The largest coin that fits ${left + c} is ${c}. Take it; ${left} left.`,
      readout: `left: ${left}`,
    });
  }
  const ok = taken.length === best.length;
  steps.push({
    rows: [coinRow("greedy", taken, null, ok ? "found" : "done"), coinRow("best", best, null, "found")],
    caption: ok
      ? `${taken.length} coins, and that is the fewest. For coin systems like India's, the largest coin first is always best; such systems are called canonical. Lesson 5 shows how to check a coin system.`
      : `Greedy used ${taken.length} coins (4, 1, 1), but 3 + 3 uses 2. Taking the 4 looked best, and it ruled out the better answer. The greedy rule is not wrong everywhere: it fails only for some amounts, which is what makes it dangerous.`,
    readout: `greedy: ${taken.length} coins, best: ${best.length}`,
    verdict: ok ? { ok: true, text: `${taken.length} coins, the fewest` } : { ok: false, text: `greedy ${taken.length} coins; ${best.length} are enough` },
  });
  return steps;
}
