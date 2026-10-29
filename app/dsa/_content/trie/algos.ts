// Step generators for the TRIE figures. Every figure is a pure function of its step number.
// A trie is drawn with the Tree stage: one node per prefix (the node shows the prefix it stands for), the
// letter on the edge above it, and an "end" tag where a stored word ends. Every node the figure will ever
// need is in the list from the first step (hidden until it exists), so the tree never jumps sideways.

import type { Mark, TNode } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type TrieStep = {
  nodes: TNode[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
  /** the word being read, one cell per letter, with the current letter */
  word?: { text: string; at: number | null; states?: Record<number, CellState> };
  /** words collected so far (autocomplete) */
  out?: string[];
};

/** Every prefix of every word, sorted, so siblings sit in alphabetical order. "" is the root. */
export function prefixes(words: string[]): string[] {
  const all = new Set<string>([""]);
  for (const w of words) for (let k = 1; k <= w.length; k++) all.add(w.slice(0, k));
  return [...all].sort();
}

/** Tree nodes for a trie. `have` holds the prefixes that exist now; the rest are hidden but keep their place. */
export function trieNodes(all: string[], have: Set<string>, ends: Set<string>, marks: Record<string, Mark> = {}): TNode[] {
  return all.map((p) => ({
    id: `p:${p}`,
    label: p === "" ? "root" : p,
    parent: p === "" ? undefined : `p:${p.slice(0, -1)}`,
    edge: p === "" ? undefined : p[p.length - 1],
    state: !have.has(p) ? "hidden" : marks[p],
    tag: have.has(p) && ends.has(p) ? "end" : undefined,
    tagKind: "ink",
  }));
}

/* TRIE-1.1: building a trie one word at a time */

export const BUILD_WORDS = ["tea", "ten", "to", "inn", "in"];

export function buildSteps(): TrieStep[] {
  const all = prefixes(BUILD_WORDS);
  const have = new Set<string>([""]);
  const ends = new Set<string>();
  const steps: TrieStep[] = [];
  const snap = (marks: Record<string, Mark>, s: Omit<TrieStep, "nodes">) => steps.push({ nodes: trieNodes(all, have, ends, marks), ...s });
  snap(
    { "": "cur" },
    {
      caption:
        "An empty trie is a single node, the root. It stands for the empty prefix: no letters yet. We will add five words: tea, ten, to, inn and in.",
      readout: "nodes: 1",
    },
  );
  for (const w of BUILD_WORDS) {
    let made = 0;
    for (let k = 1; k <= w.length; k++) {
      const p = w.slice(0, k);
      const isNew = !have.has(p);
      if (isNew) {
        have.add(p);
        made++;
      }
      const last = k === w.length;
      if (last) ends.add(p);
      const marks: Record<string, Mark> = { ...walkedPath(p), [p]: last ? "found" : "cur" };
      const what = isNew ? `There is no edge for \`${w[k - 1]}\` yet, so make a new node, \`${p}\`.` : `The edge for \`${w[k - 1]}\` is already there: follow it to \`${p}\`.`;
      let caption = `Insert \`${w}\`, letter ${k}: \`${w[k - 1]}\`. ${what}`;
      if (last)
        caption += made
          ? ` That was the last letter, so tag \`${p}\` as the end of a word.`
          : ` That was the last letter. No new node was needed: \`${w}\` is a prefix of a word already stored, so we only tag its node as the end of a word.`;
      snap(marks, {
        caption,
        word: { text: w, at: k - 1, states: Object.fromEntries(Array.from({ length: k - 1 }, (_, j) => [j, "out" as CellState])) },
        readout: `nodes: ${have.size}`,
      });
    }
  }
  snap(
    {},
    {
      caption:
        "Five words, 9 nodes. Words that share a start share a path: tea and ten share `t` and `te`. The tag matters: `in` is a word, but the node `i` is only a prefix.",
      readout: "nodes: 9 (the five words have 13 letters)",
      verdict: { ok: true, text: "5 words stored" },
    },
  );
  return steps;
}

/* TRIE-2.1: search, prefix search and delete */

export type SearchVariant = "ten" | "te" | "tin" | "delete";
export function searchSteps(v: SearchVariant): TrieStep[] {
  const words = ["in", "inn", "tea", "ten", "to"];
  const extra = v === "tin" ? ["ti"] : [];
  const all = prefixes([...words, ...extra]);
  const have = new Set(prefixes(words));
  const ends = new Set(words);
  const steps: TrieStep[] = [];
  const snap = (marks: Record<string, Mark>, s: Omit<TrieStep, "nodes">, ghost?: string) => {
    const nodes = trieNodes(all, have, ends, marks);
    if (ghost) for (const n of nodes) if (n.id === `p:${ghost}`) n.state = "todo";
    steps.push({ nodes, ...s });
  };
  const walked = (w: string, k: number) => Object.fromEntries(Array.from({ length: k }, (_, j) => [j, "out" as CellState]));
  // every trie figure inks the nodes already walked through (the path above the current node), as TRIE-5.1 does
  const above = (p: string): Record<string, Mark> => Object.fromEntries(Array.from({ length: p.length }, (_, j) => [p.slice(0, j), "done" as Mark]));

  if (v !== "delete") {
    const w = v;
    snap({ "": "cur" }, { caption: `Search for \`${w}\`. Start at the root and follow one edge per letter.`, word: { text: w, at: null } });
    for (let k = 1; k <= w.length; k++) {
      const p = w.slice(0, k);
      if (!have.has(p)) {
        const parent = w.slice(0, k - 1);
        snap(
          { ...above(parent), [parent]: "cur" },
          {
            caption: `Letter ${k}: \`${w[k - 1]}\`. The node \`${parent}\` has no edge for \`${w[k - 1]}\` (the dashed box shows where it would be). So no stored word starts with \`${p}\`, and \`${w}\` is not in the trie.`,
            word: { text: w, at: k - 1, states: walked(w, k - 1) },
            verdict: { ok: false, text: `search('${w}') is False`, info: true },
          },
          p,
        );
        snap(
          { ...above(parent), [parent]: "cur" },
          {
            caption: `We stopped after ${k} letters, without looking at any other word. A search costs at most one step per letter of the word, however many words are stored.`,
            word: { text: w, at: k - 1, states: walked(w, k - 1) },
            readout: `steps: ${k}`,
            verdict: { ok: false, text: `search('${w}') is False`, info: true },
          },
          p,
        );
        return steps;
      }
      snap(
        { ...above(p), [p]: "cur" },
        { caption: `Letter ${k}: \`${w[k - 1]}\`. There is an edge for \`${w[k - 1]}\`: follow it to \`${p}\`.`, word: { text: w, at: k - 1, states: walked(w, k - 1) } },
      );
    }
    if (ends.has(w)) {
      snap(
        { ...above(w), [w]: "found" },
        {
          caption: `All ${w.length} letters were found, and the node \`${w}\` is tagged as the end of a word. So \`${w}\` is stored.`,
          word: { text: w, at: null, states: walked(w, w.length) },
          readout: `steps: ${w.length}`,
          verdict: { ok: true, text: `search('${w}') is True` },
        },
      );
    } else {
      snap(
        { ...above(w), [w]: "cur" },
        {
          caption: `All ${w.length} letters were found, but the node \`${w}\` has no end tag. \`${w}\` is only the start of longer words (tea, ten), not a stored word itself.`,
          word: { text: w, at: null, states: walked(w, w.length) },
          verdict: { ok: false, text: `search('${w}') is False`, info: true },
        },
      );
      snap(
        { ...above(w), [w]: "cur", tea: "found", ten: "found" },
        {
          caption: `A prefix search asks a different question: does any stored word start with \`${w}\`? The walk is the same, and the answer is yes as soon as the node exists.`,
          word: { text: w, at: null, states: walked(w, w.length) },
          readout: `steps: ${w.length}`,
          verdict: { ok: true, text: `starts_with('${w}') is True`, info: true },
        },
      );
    }
    return steps;
  }

  // delete "in", then "inn"
  snap({}, { caption: "Delete two words: first `in`, then `inn`. Deleting must not harm any other word, and should not leave nodes that lead to no word." });
  snap({ in: "cur" }, { caption: "Delete `in`: walk to its node, as in a search. It is tagged, so the word is there.", word: { text: "in", at: null } });
  ends.delete("in");
  snap(
    { in: "cur", inn: "found" },
    {
      caption: "Remove the end tag. The node `in` must stay, because it is on the path to `inn`, which is still stored. So deleting `in` only removes the tag.",
      word: { text: "in", at: null },
      verdict: { ok: true, text: "in deleted" },
    },
  );
  snap({ inn: "cur" }, { caption: "Now delete `inn`. Walk to its node and remove its end tag.", word: { text: "inn", at: null } });
  ends.delete("inn");
  snap(
    { inn: "out" },
    {
      caption: "The node `inn` now has no tag and no children: no word passes through it. It is useless, so remove it (the hatched node).",
      word: { text: "inn", at: null },
    },
  );
  have.delete("inn");
  snap(
    { in: "out" },
    {
      caption: "Go back up. `in` now has no tag (we deleted `in` earlier) and no children left. Remove it too.",
      word: { text: "inn", at: null },
    },
  );
  have.delete("in");
  snap(
    { i: "out" },
    {
      caption: "Up again. `i` has no tag and no children, so remove it as well.",
      word: { text: "inn", at: null },
    },
  );
  have.delete("i");
  snap(
    { "": "cur" },
    {
      caption:
        "Up to the root. The root still has a child, `t`, and the root is never removed: stop. Removal stops at the first node that is tagged or still has another child.",
      word: { text: "inn", at: null },
      readout: "nodes: 9 → 6",
      verdict: { ok: true, text: "inn deleted" },
    },
  );
  return steps;
}

/* TRIE-3.1: autocomplete: walk to the prefix, then visit everything below it in alphabetical order */

export const AUTO_WORDS = ["tea", "team", "ten", "tend", "to", "toe"];

export function autoSteps(v: "all" | "two"): TrieStep[] {
  const all = prefixes(AUTO_WORDS);
  const have = new Set(all);
  const ends = new Set(AUTO_WORDS);
  const steps: TrieStep[] = [];
  const out: string[] = [];
  const outside = { to: "out", toe: "out" } as Record<string, Mark>;
  const snap = (marks: Record<string, Mark>, s: Omit<TrieStep, "nodes" | "out">) => steps.push({ nodes: trieNodes(all, have, ends, marks), out: out.slice(), ...s });
  const limit = v === "two" ? 2 : Infinity;
  snap({ "": "cur" }, { caption: `The learner has typed \`te\`. Suggest the stored words that start with it${v === "two" ? ", but at most 2 of them" : ""}, in alphabetical order.`, word: { text: "te", at: null } });
  snap({ t: "cur" }, { caption: "First, walk the prefix as in a search: `t`…", word: { text: "te", at: 0 } });
  snap(
    { te: "cur", ...outside },
    {
      caption: "…then `te`. Every word that starts with `te` is below this node, and no other word is. The `to` branch is never looked at (hatched).",
      word: { text: "te", at: 1, states: { 0: "out" } },
    },
  );
  // depth-first walk below "te", children in alphabetical order
  const order = ["te", "tea", "team", "ten", "tend"];
  const seen: Record<string, Mark> = {};
  for (const p of order.slice(1)) {
    if (out.length >= limit) break;
    if (ends.has(p)) out.push(p);
    const hit = ends.has(p);
    snap(
      { ...outside, ...seen, [p]: hit ? "found" : "cur" },
      {
        caption: hit
          ? `Go down to \`${p}\`. It is tagged, so \`${p}\` is a word: add it to the list.${p === "team" ? " It has no children, so go back up to the nearest node with a branch not yet visited." : ""}`
          : `Go down to \`${p}\`.`,
        readout: `suggestions: ${out.join(", ")}`,
      },
    );
    seen[p] = "done";
  }
  if (v === "two") {
    snap(
      { ...outside, ...seen },
      {
        caption: "Two words found, so stop. The rest of the branch (`ten`, `tend`) is never visited. When only a few suggestions are wanted, the walk stops early.",
        readout: `suggestions: ${out.join(", ")}`,
        verdict: { ok: true, text: "2 suggestions" },
      },
    );
  } else {
    snap(
      { ...outside, ...seen },
      {
        caption:
          "Nothing left below `te`. The words came out in alphabetical order because the children were visited in alphabetical order, and a word comes before the longer words below it.",
        readout: `suggestions: ${out.join(", ")}`,
        verdict: { ok: true, text: "4 suggestions" },
      },
    );
  }
  return steps;
}

/* TRIE-4.1: compressed tries. Node ids are the full string at the node, so a merge moves the lower node up. */

type RNode = { id: string; parent?: string; edge?: string; end?: boolean };

function radixNodes(list: RNode[], shown: Set<string>, marks: Record<string, Mark> = {}): TNode[] {
  return list.map((n) => ({
    id: `r:${n.id}`,
    label: n.id === "" ? "root" : n.id,
    parent: n.parent === undefined ? undefined : `r:${n.parent}`,
    edge: n.edge,
    state: !shown.has(n.id) ? "hidden" : marks[n.id],
    tag: shown.has(n.id) && n.end ? "end" : undefined,
    tagKind: "ink",
  }));
}

export function radixSteps(v: "compress" | "insert"): TrieStep[] {
  const steps: TrieStep[] = [];
  if (v === "compress") {
    const words = ["bus", "tea", "team", "ten", "to", "toast"];
    const plain = prefixes(words);
    const ends = new Set(words);
    let nodes: RNode[] = plain.map((p) => ({ id: p, parent: p === "" ? undefined : p.slice(0, -1), edge: p === "" ? undefined : p[p.length - 1], end: ends.has(p) }));
    const shown = new Set(plain);
    const by = (id: string) => nodes.find((n) => n.id === id)!;
    const snap = (marks: Record<string, Mark>, s: Omit<TrieStep, "nodes">) => steps.push({ nodes: radixNodes(nodes, shown, marks), ...s });
    snap({}, { caption: "A plain trie of six words: bus, tea, team, ten, to and toast. It has 13 nodes, one per letter.", readout: "nodes: 13" });
    snap(
      { b: "cur", bu: "cur", toa: "cur", toas: "cur" },
      {
        caption:
          "Some nodes do no work: they are not the end of a word and have exactly one child, so there is only one way to go. `b`, `bu`, `toa` and `toas` are such nodes.",
        readout: "nodes: 13",
      },
    );
    snap({ b: "out", bu: "out" }, { caption: "Merge the chain `b` → `bu` → `bus` into one edge. The two middle nodes go away…", readout: "nodes: 13" });
    nodes = nodes.filter((n) => n.id !== "b" && n.id !== "bu");
    Object.assign(by("bus"), { parent: "", edge: "bus" });
    snap({ bus: "cur" }, { caption: "…and `bus` hangs straight from the root, on an edge labelled with the whole string `bus`.", readout: "nodes: 11" });
    snap({ toa: "out", toas: "out" }, { caption: "Do the same for the chain below `to`: `toa` and `toas` go away…", readout: "nodes: 11" });
    nodes = nodes.filter((n) => n.id !== "toa" && n.id !== "toas");
    Object.assign(by("toast"), { parent: "to", edge: "ast" });
    snap({ toast: "cur" }, { caption: "…and the edge from `to` to `toast` is labelled `ast`.", readout: "nodes: 9" });
    snap(
      {},
      {
        caption:
          "This is a compressed trie (also called a radix tree). Every node except the root is now the end of a word or a place where paths split. So it never has more than 2n nodes for n words, however long the words are.",
        readout: "nodes: 9 (the plain trie had 13)",
        verdict: { ok: true, text: "same words, fewer nodes" },
      },
    );
    return steps;
  }
  // insert "toad" into the compressed trie: the edge "ast" splits after "a"
  const nodes: RNode[] = [
    { id: "" },
    { id: "bus", parent: "", edge: "bus", end: true },
    { id: "t", parent: "", edge: "t" },
    { id: "te", parent: "t", edge: "e" },
    { id: "tea", parent: "te", edge: "a", end: true },
    { id: "team", parent: "tea", edge: "m", end: true },
    { id: "ten", parent: "te", edge: "n", end: true },
    { id: "to", parent: "t", edge: "o", end: true },
    { id: "toa", parent: "to", edge: "a" },
    { id: "toad", parent: "toa", edge: "d", end: true },
    { id: "toast", parent: "to", edge: "ast", end: true },
  ];
  const shown = new Set(nodes.map((n) => n.id).filter((id) => id !== "toa" && id !== "toad"));
  const by = (id: string) => nodes.find((n) => n.id === id)!;
  const snap = (marks: Record<string, Mark>, s: Omit<TrieStep, "nodes">) => steps.push({ nodes: radixNodes(nodes, shown, marks), ...s });
  const w = "toad";
  snap({ "": "cur" }, { caption: "Insert `toad` into the compressed trie. At each node, look for the edge whose label starts with the next letter.", word: { text: w, at: null } });
  snap({ "": "done", t: "cur" }, { caption: "The edge `t` matches the first letter. Follow it.", word: { text: w, at: 0 } });
  snap({ "": "done", t: "done", to: "cur" }, { caption: "The edge `o` matches the next letter. Follow it to `to`.", word: { text: w, at: 1, states: { 0: "out" } } });
  snap(
    { "": "done", t: "done", to: "done", toast: "cur" },
    {
      caption: "The next letter is `a`, and the edge `ast` starts with `a`. Compare letter by letter: `a` matches, but the word has `d` where the edge has `s`. The word leaves the edge in the middle.",
      word: { text: w, at: 3, states: { 0: "out", 1: "out", 2: "out" } },
    },
  );
  // split: toast slides down under the new node toa
  shown.add("toa");
  Object.assign(by("toast"), { parent: "toa", edge: "st" });
  snap(
    { "": "done", t: "done", to: "done", toa: "cur" },
    {
      caption: "Split the edge where they differ. A new node `toa` takes the shared part, `a`. The old edge keeps the rest, `st`, and `toast` moves down one level.",
      word: { text: w, at: 3, states: { 0: "out", 1: "out", 2: "out" } },
    },
  );
  shown.add("toad");
  snap(
    { "": "done", t: "done", to: "done", toa: "done", toad: "found" },
    {
      caption: "Hang the rest of the word, `d`, from the new node as a new edge, and tag it as a word. An insert adds at most two nodes: one split node and one new leaf.",
      word: { text: w, at: null, states: { 0: "out", 1: "out", 2: "out", 3: "out" } },
      readout: "nodes: 9 → 11",
      verdict: { ok: true, text: "toad inserted" },
    },
  );
  return steps;
}

/* TRIE-5.1: a bitwise trie of 4-bit numbers, and the best XOR partner */

export const XOR_NUMS = [3, 10, 5, 9, 6];
const BITS = 4;
const bin = (x: number) => x.toString(2).padStart(BITS, "0");

function bitNodes(have: Set<string>, marks: Record<string, Mark> = {}): TNode[] {
  const all = prefixes(XOR_NUMS.map(bin));
  return all.map((p) => ({
    id: `b:${p}`,
    label: p === "" ? "root" : p,
    parent: p === "" ? undefined : `b:${p.slice(0, -1)}`,
    edge: p === "" ? undefined : p[p.length - 1],
    state: !have.has(p) ? "hidden" : marks[p],
    tag: have.has(p) && p.length === BITS ? String(parseInt(p, 2)) : undefined,
    tagKind: "plain",
  }));
}

/** the nodes above prefix p, marked as walked */
const walkedPath = (p: string): Record<string, Mark> => Object.fromEntries(Array.from({ length: p.length }, (_, j) => [p.slice(0, j), "done" as Mark]));

export type XorStep = TrieStep & { at: number | null; nums: CellState[] };

export function xorSteps(v: "build" | "query" | "all"): XorStep[] {
  const steps: XorStep[] = [];
  const have = new Set<string>([""]);
  const numStates = (cur: number | null, found: number | null = null): CellState[] =>
    XOR_NUMS.map((_, k) => (k === cur ? "mid" : k === found ? "found" : ""));
  if (v === "build") {
    steps.push({ nodes: bitNodes(have, { "": "cur" }), at: null, nums: numStates(null), caption: "Write each number with the same number of bits, 4 here, highest bit first. Each number is then a 4-letter word over the letters 0 and 1." });
    XOR_NUMS.forEach((x, k) => {
      const b = bin(x);
      const marks: Record<string, Mark> = {};
      for (let j = 1; j <= BITS; j++) {
        have.add(b.slice(0, j));
        marks[b.slice(0, j)] = j === BITS ? "found" : "cur";
      }
      steps.push({
        nodes: bitNodes(have, marks),
        at: k,
        nums: numStates(k),
        caption: `Insert ${x} = \`${b}\` in binary: one edge per bit, as for a word. The leaf is tagged with the number, ${x}.`,
        readout: `${x} = ${b}`,
      });
    });
    steps.push({
      nodes: bitNodes(have),
      at: null,
      nums: numStates(null),
      caption: "Every number is a path of exactly 4 edges, so all leaves are on the bottom level. A number with B bits costs B steps to insert or find.",
      verdict: { ok: true, text: "5 numbers stored" },
    });
    return steps;
  }
  for (const x of XOR_NUMS) for (let j = 1; j <= BITS; j++) have.add(bin(x).slice(0, j));
  if (v === "query") {
    const x = 3;
    const b = bin(x);
    let p = "";
    steps.push({
      nodes: bitNodes(have, { "": "cur" }),
      at: 0,
      nums: numStates(0),
      caption: "Which stored number y makes `3 ^ y` largest? XOR (`^`) compares two numbers bit by bit: a result bit is 1 when the two bits differ. 3 is `0011`.",
      readout: "x = 3 = 0011",
    });
    for (let j = 0; j < BITS; j++) {
      const want = b[j] === "0" ? "1" : "0";
      const ok = have.has(p + want);
      const go = ok ? want : b[j];
      const before = p;
      p += go;
      const val = 1 << (BITS - 1 - j);
      steps.push({
        nodes: bitNodes(have, { ...walkedPath(p), [p]: "cur" }),
        at: 0,
        nums: numStates(0),
        caption: ok
          ? `Bit ${j + 1} of 3, counting from the left in \`0011\`, is ${b[j]}. A ${want} on this edge makes this bit of the result 1, which is worth ${val}. That edge exists: take it.`
          : `Bit ${j + 1} of 3, counting from the left in \`0011\`, is ${b[j]}. We want ${want}, but \`${before}\` has no edge for ${want}. Take the ${go} edge: this bit of the result is 0.`,
        readout: `path so far: ${p} · result so far: ${(parseInt(b.slice(0, j + 1), 2) ^ parseInt(p, 2)).toString(2).padStart(j + 1, "0")}`,
      });
    }
    const y = parseInt(p, 2);
    steps.push({
      nodes: bitNodes(have, { ...walkedPath(p), [p]: "found" }),
      at: 0,
      nums: numStates(0, XOR_NUMS.indexOf(y)),
      caption: `The path ends at ${y}. So \`3 ^ ${y} = ${3 ^ y}\` (\`${bin(3 ^ y)}\` in binary) is the largest. Taking the opposite bit first is always right: one high bit is worth more than all the lower bits together.`,
      readout: `3 ^ ${y} = ${bin(3)} ^ ${bin(y)} = ${bin(3 ^ y)} = ${3 ^ y}`,
      verdict: { ok: true, text: `best partner: ${y}` },
    });
    return steps;
  }
  // all: the best partner for every number; the largest of these is the answer
  let best = -1;
  steps.push({
    nodes: bitNodes(have),
    at: null,
    nums: numStates(null),
    caption: "To find the largest XOR of any two stored numbers, find the best partner of each number in turn (as in the previous variant) and keep the largest result.",
  });
  XOR_NUMS.forEach((x, k) => {
    let p = "";
    const b = bin(x);
    for (let j = 0; j < BITS; j++) {
      const want = b[j] === "0" ? "1" : "0";
      p += have.has(p + want) ? want : b[j];
    }
    const y = parseInt(p, 2);
    const r = x ^ y;
    const better = r > best;
    best = Math.max(best, r);
    steps.push({
      nodes: bitNodes(have, { [bin(x)]: "cur", [p]: "found" }),
      at: k,
      nums: numStates(k, XOR_NUMS.indexOf(y)),
      caption: `${x}: the best partner is ${y}, and \`${x} ^ ${y} = ${r}\`.${better ? " The best so far." : ""}`,
      readout: `${bin(x)} ^ ${bin(y)} = ${bin(r)} = ${r}   best: ${best}`,
    });
  });
  steps.push({
    nodes: bitNodes(have),
    at: null,
    nums: numStates(null),
    caption: `The largest XOR is ${best}: \`5 ^ 10\` and \`9 ^ 6\` both give \`1111\`. That is n walks of B steps each: O(n · B) instead of comparing all n² pairs.`,
    readout: `answer: ${best}`,
    verdict: { ok: true, text: `largest XOR: ${best}` },
  });
  return steps;
}
