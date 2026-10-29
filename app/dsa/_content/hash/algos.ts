// Step generators for the HASH figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code. Tables are drawn from rows of entries (Stages: HashTable).

import type { HMark, HRow, LEdge, LName, LNode, Mark, Var } from "../../_components/Stages";
import { vars, type CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type HashStep = {
  rows: HRow[];
  marks?: HMark[];
  caption: string;
  line?: number | null;
  vars?: Var[];
  readout?: string;
  verdict?: Verdict;
  /** a second table (the new table while a table grows) */
  rows2?: HRow[];
};

const empty = (m: number): HRow[] => Array.from({ length: m }, () => ({ entries: [] }));
const clone = (rows: HRow[]): HRow[] => rows.map((r) => ({ ...r, entries: r.entries.map((e) => ({ ...e })) }));
/** Copy rows and clear every state, so a new step starts plain. */
const plain = (rows: HRow[]): HRow[] => rows.map((r) => ({ tomb: r.tomb, entries: r.entries.map((e) => ({ label: e.label, sub: e.sub })) }));

/* HASH-1.1: from a word to a bucket */

export const HASH_WORDS = ["cat", "act", "dog", "god"];
export const HASH_M = 7;

export const BUCKET_POLY = `def bucket(word, m):
    total = 0
    for ch in word:
        total = total * 31 + ord(ch)
    return total % m`;

export const BUCKET_SUM = `def bucket(word, m):
    total = 0
    for ch in word:
        total = total + ord(ch)
    return total % m`;

export function wordHash(word: string, poly: boolean) {
  let t = 0;
  for (const ch of word) t = poly ? t * 31 + ch.charCodeAt(0) : t + ch.charCodeAt(0);
  return t;
}

export function bucketSteps(poly: boolean): HashStep[] {
  const out: HashStep[] = [];
  let rows = empty(HASH_M);
  out.push({
    rows,
    line: null,
    vars: [],
    caption: `A table of ${HASH_M} buckets, numbered 0 to ${HASH_M - 1}. A hash function turns each word into a whole number. Then \`% ${HASH_M}\` (the remainder after dividing by ${HASH_M}) turns that number into a bucket number.`,
  });
  // The first word, one letter at a time.
  const w = HASH_WORDS[0];
  let prev: Record<string, string> = {};
  let now: Record<string, string> = { word: `'${w}'`, total: "0" };
  out.push({ rows, line: 2, vars: vars(now, prev), caption: `Start with \`${w}\`. \`total\` starts at 0.` });
  let t = 0;
  for (const ch of w) {
    const before = t;
    t = poly ? t * 31 + ch.charCodeAt(0) : t + ch.charCodeAt(0);
    prev = now;
    now = { word: `'${w}'`, ch: `'${ch}'`, total: String(t) };
    out.push({
      rows,
      line: 4,
      vars: vars(now, prev),
      caption: poly
        ? `\`ord('${ch}')\` is ${ch.charCodeAt(0)}, the letter's code number. Multiply the total by 31, then add it: ${before} × 31 + ${ch.charCodeAt(0)} = ${t.toLocaleString("en-US")}.`
        : `\`ord('${ch}')\` is ${ch.charCodeAt(0)}, the letter's code number. Add it to the total: ${before} + ${ch.charCodeAt(0)} = ${t}.`,
    });
  }
  const placed: Record<number, string[]> = {};
  const place = (word: string, k: number, caption: string, verdict?: Verdict) => {
    const h = wordHash(word, poly);
    const b = h % HASH_M;
    placed[b] = [...(placed[b] ?? []), word];
    rows = empty(HASH_M).map((_, i) => ({
      entries: (placed[i] ?? []).map((x) => ({ label: x, state: (x === word ? "cur" : "") as Mark })),
    }));
    prev = now;
    now = { word: `'${word}'`, total: String(h), "total % 7": String(b) };
    out.push({ rows, marks: [{ row: b, name: word }], line: 5, vars: vars(now, prev), caption, verdict, readout: `${h.toLocaleString("en-US")} % ${HASH_M} = ${b}` });
    return b;
  };
  const b0 = wordHash(w, poly) % HASH_M;
  place(w, 0, `\`${t.toLocaleString("en-US")} % ${HASH_M}\` is ${b0}, so \`${w}\` goes in bucket ${b0}. To find \`${w}\` later, compute the same number and look only in bucket ${b0}.`);
  for (let k = 1; k < HASH_WORDS.length; k++) {
    const word = HASH_WORDS[k];
    const h = wordHash(word, poly);
    const b = h % HASH_M;
    const clash = (placed[b] ?? [])[0];
    const last = k === HASH_WORDS.length - 1;
    let caption = `\`${word}\` gives ${h.toLocaleString("en-US")}, and ${h.toLocaleString("en-US")} % ${HASH_M} = ${b}.`;
    let verdict: Verdict | undefined;
    if (clash) {
      caption += ` Bucket ${b} already holds \`${clash}\`. Two keys in one bucket is called a collision.`;
      if (!poly) caption += ` Adding the codes ignores the order of the letters, so every rearrangement of the same letters collides.`;
    } else caption += ` Bucket ${b} is empty.`;
    if (last && poly) {
      caption += ` Multiplying by 31 at each letter makes the order count: ${HASH_WORDS.map((x) => `\`${x}\``).join(", ")} land in four different buckets.`;
      verdict = { ok: true, text: "no collisions" };
    }
    if (last && !poly) verdict = { ok: false, text: "2 collisions out of 4 words" };
    place(word, k, caption, verdict);
  }
  return out;
}

/* HASH-2.1: chaining */

export const CHAIN_M = 5;
export const CHAIN_KEYS = [12, 7, 15, 3, 22, 9];

export function chainSteps(): HashStep[] {
  const out: HashStep[] = [];
  const b: number[][] = Array.from({ length: CHAIN_M }, () => []);
  const rows = (cur?: { row: number; at: number; s: Mark }[], extra: Record<number, Mark> = {}): HRow[] =>
    b.map((keys, i) => ({
      state: extra[i],
      entries: keys.map((k, j) => ({ label: k, state: cur?.find((c) => c.row === i && c.at === j)?.s ?? "" })),
    }));
  out.push({
    rows: rows(),
    caption: `A table of ${CHAIN_M} buckets. Each bucket holds a chain: a list of the keys that landed there. The keys here are whole numbers, and for a whole number Python's \`hash(k)\` is just \`k\`.`,
  });
  for (const k of CHAIN_KEYS) {
    const i = k % CHAIN_M;
    const had = b[i].length;
    b[i].push(k);
    out.push({
      rows: rows([{ row: i, at: b[i].length - 1, s: "cur" }]),
      marks: [{ row: i, name: String(k) }],
      readout: `hash(${k}) % ${CHAIN_M} = ${i}`,
      caption:
        had === 0
          ? `Insert ${k}: ${k} % ${CHAIN_M} = ${i}. Bucket ${i} is empty, so ${k} starts its chain.`
          : `Insert ${k}: ${k} % ${CHAIN_M} = ${i}. Bucket ${i} already holds ${had === 1 ? b[i][0] : b[i].slice(0, -1).join(", ")}. First check that ${k} is not already in the chain, then add it at the end.`,
    });
  }
  // find 22
  const f = 22;
  const fi = f % CHAIN_M;
  b[fi].forEach((k, j) => {
    const hit = k === f;
    out.push({
      rows: rows([{ row: fi, at: j, s: hit ? "found" : "cur" }]),
      marks: [{ row: fi, name: String(f) }],
      readout: `find ${f}: bucket ${fi}, comparison ${j + 1}`,
      caption: hit
        ? `${k} == ${f}: found, after ${j + 1} comparisons. The other ${CHAIN_M - 1} buckets were never looked at.`
        : j === 0
          ? `Find ${f}: ${f} % ${CHAIN_M} = ${fi}, so look only in bucket ${fi}. Walk its chain: ${k} is not ${f}.`
          : `${k} is not ${f}. Move on along the chain.`,
      verdict: hit ? { ok: true, text: `found in ${j + 1} comparisons` } : undefined,
    });
    if (hit) return;
  });
  // miss 17
  const g = 17;
  const gi = g % CHAIN_M;
  out.push({
    rows: rows(b[gi].map((_, j) => ({ row: gi, at: j, s: "out" as Mark }))),
    marks: [{ row: gi, name: String(g) }],
    readout: `find ${g}: bucket ${gi}, ${b[gi].length} comparisons`,
    caption: `Find ${g}: ${g} % ${CHAIN_M} = ${gi}. None of the ${b[gi].length} keys in bucket ${gi} is ${g}, and the chain ends. So ${g} is not in the table. A miss walks the whole chain.`,
    verdict: { ok: false, text: `${g} not in the table`, info: true },
  });
  // remove 7
  const r = 7;
  const ri = r % CHAIN_M;
  const rj = b[ri].indexOf(r);
  out.push({
    rows: rows([{ row: ri, at: rj, s: "out" }]),
    marks: [{ row: ri, name: String(r) }],
    readout: `remove ${r}: bucket ${ri}`,
    caption: `Remove ${r}: find it in bucket ${ri} the same way, then take it out of the chain.`,
  });
  b[ri].splice(rj, 1);
  out.push({
    rows: rows(),
    caption: `${r} is gone. Bucket ${ri} now holds ${b[ri].join(", ")}. Every job (insert, find, remove) costs one hash plus a walk along one chain.`,
  });
  return out;
}

export const GROW_KEYS = [5, 9, 2, 14, 7];

export function growSteps(): HashStep[] {
  const out: HashStep[] = [];
  let m = 4;
  const b: number[][] = Array.from({ length: m }, () => []);
  const toRows = (bb: number[][], cur?: number, s: Mark = "cur"): HRow[] => bb.map((keys) => ({ entries: keys.map((k) => ({ label: k, state: k === cur ? s : "" })) }));
  out.push({ rows: toRows(b), caption: `Start with 4 buckets. The rule: when the number of keys n becomes bigger than the number of buckets m, double the buckets.` });
  for (const k of GROW_KEYS) {
    b[k % m].push(k);
    const n = b.flat().length;
    out.push({
      rows: toRows(b, k),
      marks: [{ row: k % m, name: String(k) }],
      readout: `n = ${n}, m = ${m}`,
      caption: n > m ? `Insert ${k} into bucket ${k % m}. Now n = ${n} is bigger than m = ${m}: time to grow.` : `Insert ${k}: ${k} % ${m} = ${k % m}. n = ${n}, m = ${m}.`,
    });
  }
  const old = b.map((x) => [...x]);
  m = 8;
  const nb: number[][] = Array.from({ length: m }, () => []);
  out.push({
    rows: toRows(old),
    rows2: toRows(nb),
    readout: `old m = 4, new m = 8`,
    caption: `Make a new table with 8 buckets. Every key must move, because its bucket was \`k % 4\` and is now \`k % 8\`. Take the old buckets in order, and each chain from front to back.`,
  });
  const moved = new Set<number>();
  for (const k of old.flat()) {
    nb[k % m].push(k);
    moved.add(k);
    out.push({
      rows: old.map((keys) => ({ entries: keys.map((x) => ({ label: x, state: (x === k ? "cur" : moved.has(x) ? "out" : "") as Mark })) })),
      rows2: toRows(nb, k),
      marks: [{ row: k % m, name: String(k) }],
      readout: `${k} % 4 = ${k % 4}  →  ${k} % 8 = ${k % 8}`,
      caption: `${k} was in bucket ${k % 4}. In the new table it goes to bucket ${k % 8}.`,
    });
  }
  out.push({
    rows2: toRows(nb),
    rows: [],
    readout: `n = 5, m = 8`,
    caption: `Done. Moving n keys cost O(n), but it happens only when n doubles. Spread over all the inserts, that is O(1) extra per insert, the same argument as a growing Python list (ARRS-1).`,
    verdict: { ok: true, text: "longest chain: 1" },
  });
  return out;
}

/* HASH-3.1: open addressing with linear probing */

export const PROBE_M = 10;
export const PROBE_KEYS = [23, 43, 13, 27, 37];

type Slot = number | "DEL" | null;

function slotRows(s: Slot[], st: Record<number, Mark> = {}): HRow[] {
  return s.map((v, i) => (v === "DEL" ? { entries: [], tomb: true, state: st[i] } : { entries: v === null ? [] : [{ label: v, state: st[i] ?? "" }], state: st[i] }));
}

export type ProbeVariant = "insert" | "marker" | "empty";

export function probeSteps(v: ProbeVariant): HashStep[] {
  const out: HashStep[] = [];
  const s: Slot[] = Array(PROBE_M).fill(null);
  const fill = () => {
    for (const k of PROBE_KEYS) {
      let i = k % PROBE_M;
      while (s[i] !== null) i = (i + 1) % PROBE_M;
      s[i] = k;
    }
  };
  if (v === "insert") {
    out.push({ rows: slotRows(s), caption: `Open addressing keeps every key in the table itself: one key per slot, no chains. Here there are ${PROBE_M} slots, and a key's home slot is \`k % ${PROBE_M}\`.` });
    for (const k of PROBE_KEYS) {
      const home = k % PROBE_M;
      let i = home;
      while (s[i] !== null) {
        out.push({
          rows: slotRows(s, { [i]: "out" }),
          marks: [{ row: i, name: "i" }],
          readout: `insert ${k}: home slot ${home}`,
          caption: `Insert ${k}: its home slot is ${home}${i === home ? "" : `, but we are now at ${i}`}. Slot ${i} holds ${s[i]}, so try the next slot.`,
        });
        i = (i + 1) % PROBE_M;
      }
      s[i] = k;
      out.push({
        rows: slotRows(s, { [i]: "cur" }),
        marks: [{ row: i, name: "i" }],
        readout: `insert ${k}: home slot ${home}, placed in ${i}`,
        caption: i === home ? `Insert ${k}: home slot ${home} is empty. Put it there.` : `Slot ${i} is empty: put ${k} there. Looking at the next slot, then the next, is called linear probing.`,
      });
    }
    const find = (k: number, last: boolean) => {
      let i = k % PROBE_M;
      let n = 0;
      for (;;) {
        n++;
        const v = s[i];
        if (v === k) {
          out.push({ rows: slotRows(s, { [i]: "found" }), marks: [{ row: i, name: "i" }], readout: `find ${k}: ${n} probes`, caption: `Slot ${i} holds ${k}: found after ${n} probes (a probe is one look at a slot).`, verdict: { ok: true, text: `found in ${n} probes` } });
          return;
        }
        if (v === null) {
          out.push({
            rows: slotRows(s),
            marks: [{ row: i, name: "i" }],
            readout: `find ${k}: ${n} probes`,
            caption: `Slot ${i} is empty, so stop: ${k} is not in the table. If ${k} were here, the insert would have put it in this empty slot or before it.${last ? " Notice how 23, 43 and 13 formed one long run. Runs like this are called clusters, and they make probes longer." : ""}`,
            verdict: { ok: false, text: `${k} not in the table`, info: true },
          });
          return;
        }
        out.push({
          rows: slotRows(s, { [i]: "out" }),
          marks: [{ row: i, name: "i" }],
          readout: `find ${k}: probe ${n}`,
          caption: n === 1 ? `Find ${k}: start at its home slot, ${i}. Slot ${i} holds ${v}, not ${k}. Keep going.` : `Slot ${i} holds ${v}. Keep going.`,
        });
        i = (i + 1) % PROBE_M;
      }
    };
    find(13, false);
    find(33, true);
    return out;
  }
  fill();
  out.push({ rows: slotRows(s), caption: `The table after inserting ${PROBE_KEYS.join(", ")}. Now remove 43, which sits in slot 4, between 23 and 13.` });
  out.push({ rows: slotRows(s, { 3: "out" }), marks: [{ row: 3, name: "i" }], readout: "remove 43: probe 1", caption: "Remove 43: start at its home slot, 3. Slot 3 holds 23. Keep going." });
  if (v === "marker") {
    s[4] = "DEL";
    out.push({
      rows: slotRows(s),
      marks: [{ row: 4, name: "i" }],
      readout: "remove 43: marker in slot 4",
      caption: "Slot 4 holds 43. Do not empty the slot. Put a deleted marker in it instead (often called a tombstone). The marker says: something was here, so keep probing past me.",
    });
    out.push({ rows: slotRows(s, { 3: "out" }), marks: [{ row: 3, name: "i" }], readout: "find 13: probe 1", caption: "Find 13: start at slot 3. It holds 23. Keep going." });
    out.push({ rows: slotRows(s), marks: [{ row: 4, name: "i" }], readout: "find 13: probe 2", caption: "Slot 4 has a marker. A find skips it and keeps going." });
    out.push({ rows: slotRows(s, { 5: "found" }), marks: [{ row: 5, name: "i" }], readout: "find 13: 3 probes", caption: "Slot 5 holds 13: found.", verdict: { ok: true, text: "found 13" } });
    out.push({ rows: slotRows(s, { 3: "out" }), marks: [{ row: 3, name: "i" }], readout: "insert 53: probe 1", caption: "Insert 53 (home slot 3). Slot 3 holds 23. Keep going." });
    out.push({ rows: slotRows(s), marks: [{ row: 4, name: "i" }], readout: "insert 53: first marker at 4", caption: "Slot 4 has a marker. Remember it as the first free place, but keep going: 53 might already be in the table further on." });
    out.push({ rows: slotRows(s, { 5: "out" }), marks: [{ row: 5, name: "i" }], readout: "insert 53: probe 3", caption: "Slot 5 holds 13. Keep going." });
    out.push({ rows: slotRows(s), marks: [{ row: 6, name: "i" }], readout: "insert 53: empty slot at 6", caption: "Slot 6 is empty, so 53 is not in the table. Now go back and use the first marker seen, in slot 4." });
    s[4] = 53;
    out.push({ rows: slotRows(s, { 4: "cur" }), marks: [{ row: 4, name: "i" }], readout: "insert 53: placed in 4", caption: "53 goes into slot 4. Reusing markers stops them from piling up.", verdict: { ok: true, text: "marker reused" } });
    return out;
  }
  s[4] = null;
  out.push({ rows: slotRows(s, { 4: "bad" }), marks: [{ row: 4, name: "i" }], readout: "remove 43: slot 4 emptied", caption: "Slot 4 holds 43. This version simply empties the slot. It looks harmless." });
  out.push({ rows: slotRows(s, { 3: "out" }), marks: [{ row: 3, name: "i" }], readout: "find 13: probe 1", caption: "Find 13: start at slot 3. It holds 23. Keep going." });
  out.push({
    rows: slotRows(s, { 4: "bad" }),
    marks: [{ row: 4, name: "i" }],
    readout: "find 13: slot 4 is empty",
    caption: "Slot 4 is empty, so the find stops and says 13 is not here. But 13 is in slot 5. Emptying slot 4 broke the run that leads to it.",
    verdict: { ok: false, text: "wrong: 13 is in slot 5" },
  });
  return out;
}

/* HASH-4.1: chosen keys against a fixed hash and a random one */

export const ATTACK_KEYS = [8, 16, 24, 32, 40, 48, 56, 64];
export const UH = { p: 101, a: 37, b: 11, m: 8 };

export function attackSteps(random: boolean): HashStep[] {
  const out: HashStep[] = [];
  const b: number[][] = Array.from({ length: UH.m }, () => []);
  const f = (k: number) => (random ? ((UH.a * k + UH.b) % UH.p) % UH.m : k % UH.m);
  const rows = (cur?: number): HRow[] => b.map((keys) => ({ entries: keys.map((k) => ({ label: k, state: (k === cur ? "cur" : "") as Mark })) }));
  out.push({
    rows: rows(),
    caption: random
      ? `The same 8 keys, but now the table picked two random numbers when it was made: a = ${UH.a} and b = ${UH.b}. The bucket is \`((a*k + b) % ${UH.p}) % 8\`. The attacker does not know a and b.`
      : `An attacker knows the table uses \`k % 8\`. So they send keys that are all multiples of 8: ${ATTACK_KEYS.join(", ")}.`,
  });
  for (const k of ATTACK_KEYS) {
    const i = f(k);
    b[i].push(k);
    const longest = Math.max(...b.map((x) => x.length));
    const last = k === ATTACK_KEYS[ATTACK_KEYS.length - 1];
    out.push({
      rows: rows(k),
      marks: [{ row: i, name: String(k) }],
      readout: random ? `((${UH.a}·${k} + ${UH.b}) % ${UH.p}) % 8 = ${i}` : `${k} % 8 = ${i}`,
      caption: random
        ? `${k} goes to bucket ${i}.${last ? " The keys spread out. The attacker chose them for `k % 8`, and that choice tells them nothing about this function." : ""}`
        : last
          ? `${k} % 8 = 0 as well. All 8 keys share one chain, so every find walks it: the table has become a slow list.`
          : `${k} % 8 = 0. Bucket 0 again: its chain is now ${b[0].length} long.`,
      verdict: last ? (random ? { ok: true, text: `longest chain: ${longest}` } : { ok: false, text: `longest chain: ${longest}` }) : undefined,
    });
  }
  return out;
}

/* HASH-5.1: inside CPython's dict */

export const DICT_KEYS: [number, string][] = [
  [16, "a"],
  [3, "b"],
  [8, "c"],
  [11, "d"],
];

export type DictStep = { indices: (number | null)[]; states: CellState[]; at: number | null; entries: [number, string][]; cur: number | null; caption: string; readout?: string; verdict?: Verdict };

export function dictSteps(): DictStep[] {
  const out: DictStep[] = [];
  const idx: (number | null)[] = Array(8).fill(null);
  const entries: [number, string][] = [];
  const st = (mark: Record<number, CellState> = {}) => idx.map((_, i) => mark[i] ?? "");
  out.push({
    indices: [...idx],
    states: st(),
    at: null,
    entries: [],
    cur: null,
    caption:
      "A Python dict is two arrays. `indices` has 8 slots, all empty. `entries` lists the keys and values in the order they were added. Each slot of `indices` holds a position in `entries`.",
  });
  const put = (key: number, val: string) => {
    let i = key & 7;
    let probe = 1;
    while (idx[i] !== null) {
      const e = entries[idx[i]!];
      out.push({
        indices: [...idx],
        states: st({ [i]: "out" }),
        at: i,
        entries: [...entries],
        cur: idx[i],
        readout: probe === 1 ? `hash(${key}) % 8 = ${i}` : `next slot: ${i}`,
        caption:
          probe === 1
            ? `\`d[${key}] = '${val}'\`: ${key} % 8 = ${i}. Slot ${i} points to entry ${idx[i]}, whose key is ${e[0]}, not ${key}. A collision.`
            : `Slot ${i} points to entry ${idx[i]}, whose key is ${e[0]}. Taken again.`,
      });
      const next = (5 * i + 1) % 8;
      out[out.length - 1].caption += ` Python tries slot (5 × ${i} + 1) % 8 = ${next} next.`;
      i = next;
      probe++;
    }
    entries.push([key, val]);
    idx[i] = entries.length - 1;
    out.push({
      indices: [...idx],
      states: st({ [i]: "mid" }),
      at: i,
      entries: [...entries],
      cur: entries.length - 1,
      readout: probe === 1 ? `hash(${key}) % 8 = ${i}` : `placed in slot ${i}`,
      caption:
        probe === 1
          ? `\`d[${key}] = '${val}'\`: ${key} % 8 = ${i}, and slot ${i} is empty. Add (${key}, '${val}') as entry ${entries.length - 1}, and store ${entries.length - 1} in slot ${i}.`
          : `Slot ${i} is empty. Add (${key}, '${val}') as entry ${entries.length - 1}, and store ${entries.length - 1} in slot ${i}.`,
    });
  };
  for (const [k, v] of DICT_KEYS) put(k, v);
  // look up 8
  out.push({
    indices: [...idx],
    states: st({ 0: "out" }),
    at: 0,
    entries: [...entries],
    cur: 0,
    readout: "hash(8) % 8 = 0",
    caption: "Now read `d[8]`. Start at slot 0. It points to entry 0, whose key is 16, not 8. Try (5 × 0 + 1) % 8 = 1, the same order the insert used.",
  });
  out.push({
    indices: [...idx],
    states: st({ 1: "found" }),
    at: 1,
    entries: [...entries],
    cur: 2,
    readout: "found in 2 probes",
    caption: "Slot 1 points to entry 2, whose key is 8. Found: `d[8]` is 'c'.",
    verdict: { ok: true, text: "d[8] == 'c'" },
  });
  out.push({
    indices: [...idx],
    states: st(),
    at: null,
    entries: [...entries],
    cur: null,
    caption: "`list(d)` reads `entries` from top to bottom: [16, 3, 8, 11]. That is why a dict remembers the order keys were added. The scattered slots never decide the order.",
    verdict: { ok: true, text: "order kept: 16, 3, 8, 11", info: true },
  });
  return out;
}

/* HASH-6.1: counting words, and pairs that add up to a target */

export const WORDS = ["to", "be", "or", "not", "to", "be"];

export type CountStep = { at: number | null; states: CellState[]; table: [string, string][]; cur: string | null; caption: string; verdict?: Verdict };

export function countSteps(): CountStep[] {
  const out: CountStep[] = [];
  const c = new Map<string, number>();
  const table = () => [...c.entries()].map(([k, v]) => [`'${k}'`, String(v)] as [string, string]);
  out.push({ at: null, states: WORDS.map(() => ""), table: [], cur: null, caption: "Count how often each word appears. `counts` starts as an empty dict." });
  WORDS.forEach((w, i) => {
    const seen = c.has(w);
    c.set(w, (c.get(w) ?? 0) + 1);
    out.push({
      at: i,
      states: WORDS.map((_, j) => (j < i ? "out" : j === i ? "mid" : "")),
      table: table(),
      cur: `'${w}'`,
      caption: seen
        ? `\`'${w}'\` is already a key: add 1, so \`counts['${w}']\` is ${c.get(w)}. Finding the key is O(1) on average.`
        : `\`'${w}'\` is not a key yet. \`counts.get('${w}', 0) + 1\` gives 1.`,
    });
  });
  out.push({
    at: null,
    states: WORDS.map(() => "out"),
    table: table(),
    cur: null,
    caption: "Done: one pass, O(n) on average. `collections.Counter(words)` does the same job in one line.",
    verdict: { ok: true, text: "4 different words" },
  });
  return out;
}

export const PAIR_VALS = [8, 3, 11, 5, 7];
export const PAIR_TARGET = 12;

export type PairStep = CountStep & { need: number | null };

export function pairSteps(): PairStep[] {
  const out: PairStep[] = [];
  const seen = new Map<number, number>();
  const table = () => [...seen.entries()].map(([k, v]) => [String(k), String(v)] as [string, string]);
  out.push({
    at: null,
    need: null,
    states: PAIR_VALS.map(() => ""),
    table: [],
    cur: null,
    caption: `Find two places whose values add up to ${PAIR_TARGET}. \`seen\` maps each value already passed to its place. For each value x, the partner it needs is ${PAIR_TARGET} − x.`,
  });
  for (let i = 0; i < PAIR_VALS.length; i++) {
    const x = PAIR_VALS[i];
    const need = PAIR_TARGET - x;
    if (seen.has(need)) {
      const j = seen.get(need)!;
      out.push({
        at: i,
        need,
        states: PAIR_VALS.map((_, k) => (k === i || k === j ? "found" : k < i ? "out" : "")),
        table: table(),
        cur: String(need),
        caption: `x = ${x} needs ${need}, and \`seen\` has ${need} at place ${j}. The answer is places (${j}, ${i}): ${need} + ${x} = ${PAIR_TARGET}. One pass, O(n) on average, instead of trying all pairs, O(n²).`,
        verdict: { ok: true, text: `(${j}, ${i})` },
      });
      return out;
    }
    seen.set(x, i);
    out.push({
      at: i,
      need,
      states: PAIR_VALS.map((_, k) => (k === i ? "mid" : k < i ? "out" : "")),
      table: table(),
      cur: String(x),
      caption: `x = ${x} needs ${need}. \`${need} in seen\` is False. Store ${x} → ${i} and move on.`,
    });
  }
  return out;
}

/* HASH-7.1: an LRU cache from a dict and a two-way list */

export type LruStep = { nodes: LNode[]; edges: LEdge[]; names: LName[]; table: [string, string][]; cur: string | null; caption: string; op: string; verdict?: Verdict };

export const LRU_CAP = 3;
/** two-way nodes are almost a slot wide, so space them out to leave room for the arrows */
const GAP = 1.4;

export function lruSteps(): LruStep[] {
  const out: LruStep[] = [];
  // order: most recent first, between the sentinels
  let order: [number, string][] = [];
  const snap = (caption: string, op: string, { cur = null as number | null, gone = null as [number, string] | null, verdict = undefined as Verdict | undefined } = {}) => {
    const all = gone ? [...order, gone] : order;
    const nodes: LNode[] = [{ id: "F", label: "front", x: 0, state: "todo" }];
    all.forEach(([k, v], i) => nodes.push({ id: `k${k}`, label: `${k}:${v}`, x: (i + 1) * GAP, state: gone && gone[0] === k ? "out" : k === cur ? "cur" : "" }));
    nodes.push({ id: "B", label: "back", x: (all.length + 1) * GAP, state: "todo" });
    const ids = nodes.map((n) => n.id);
    const edges: LEdge[] = [];
    for (let i = 0; i + 1 < ids.length; i++) {
      edges.push({ from: ids[i], to: ids[i + 1] });
      edges.push({ from: ids[i + 1], to: ids[i], kind: "prev" });
    }
    out.push({
      nodes,
      edges,
      names: [],
      table: order.map(([k]) => [String(k), `node ${k}`] as [string, string]),
      cur: cur === null ? null : String(cur),
      caption,
      op,
      verdict,
    });
  };
  snap(`An LRU cache keeps at most ${LRU_CAP} items. LRU means "least recently used": when it is full, it throws out the item that was used longest ago. The two-way list keeps items from most recent (left) to least recent (right). The dict maps each key to its node.`, "empty");
  const put = (k: number, v: string) => {
    order = [[k, v], ...order];
    snap(`\`put(${k}, '${v}')\`: make a node and insert it just after \`front\`. Store it in the dict. ${order.length} of ${LRU_CAP} places used.`, `put(${k}, '${v}')`, { cur: k });
  };
  put(1, "a");
  put(2, "b");
  put(3, "c");
  const hit = order.find(([k]) => k === 1)!;
  order = [hit, ...order.filter(([k]) => k !== 1)];
  snap("`get(1)`: the dict finds node 1 in O(1). Unlink it (its neighbours point past it) and insert it again just after `front`. Now 1 is the most recent, and 2 is the least recent.", "get(1) → 'a'", { cur: 1 });
  const gone = order[order.length - 1];
  order = order.slice(0, -1);
  snap(`\`put(4, 'd')\`: the cache is full. The least recent item is the node just before \`back\`: key ${gone[0]}. Unlink it and delete it from the dict.`, "put(4, 'd'): evict", { gone, verdict: { ok: false, text: `evicted ${gone[0]}`, info: true } });
  order = [[4, "d"], ...order];
  snap("Now insert 4 just after `front`. Every step was a dict lookup or a few reference changes: O(1).", "put(4, 'd')", { cur: 4 });
  snap("`get(2)`: 2 is not in the dict, so return −1. A miss changes nothing.", "get(2) → −1", { verdict: { ok: false, text: "get(2) → −1", info: true } });
  return out;
}

/* HASH-8.1: a Bloom filter */

export const BLOOM_M = 16;
export const BLOOM_K = 3;

function h1(w: string) {
  let t = 0;
  for (const ch of w) t = (t * 31 + ch.charCodeAt(0)) % 2 ** 32;
  return t;
}
function h2(w: string) {
  let t = 0;
  for (const ch of w) t = (t * 37 + ch.charCodeAt(0)) % 2 ** 32;
  return t % 2 === 1 ? t : t + 1;
}
export function bloomPositions(w: string) {
  const a = h1(w);
  const b = h2(w);
  return Array.from({ length: BLOOM_K }, (_, i) => (a + i * b) % BLOOM_M);
}

export type BloomStep = { bits: number[]; states: CellState[]; caption: string; readout?: string; verdict?: Verdict };

export function bloomSteps(): BloomStep[] {
  const out: BloomStep[] = [];
  const bits = Array(BLOOM_M).fill(0);
  out.push({
    bits: [...bits],
    states: bits.map(() => ""),
    caption: `A Bloom filter is a row of ${BLOOM_M} bits, all 0, and ${BLOOM_K} hash functions. It answers one question: have I seen this word? It stores no words at all.`,
  });
  for (const w of ["cat", "dog", "owl"]) {
    const p = bloomPositions(w);
    p.forEach((i) => (bits[i] = 1));
    out.push({
      bits: [...bits],
      states: bits.map((_, i) => (p.includes(i) ? "mid" : "")),
      readout: `${w} → ${p.join(", ")}`,
      caption: `Add \`${w}\`: the ${BLOOM_K} hash functions give positions ${p.join(", ")}. Set those bits to 1.${w === "owl" ? ` Bit 11 was already 1 (from \`cat\`). Bits are shared.` : ""}`,
    });
  }
  const ask = (w: string, added: boolean) => {
    const p = bloomPositions(w);
    const zero = p.find((i) => bits[i] === 0);
    out.push({
      bits: [...bits],
      states: bits.map((_, i) => (i === zero ? "violated" : p.includes(i) ? (zero === undefined ? "found" : "mid") : "")),
      readout: `${w} → ${p.join(", ")}`,
      caption:
        zero !== undefined
          ? `Ask about \`${w}\`: positions ${p.join(", ")}. Bit ${zero} is 0. If \`${w}\` had been added, that bit would be 1. So the answer is a sure no.`
          : added
            ? `Ask about \`${w}\`: positions ${p.join(", ")} are all 1. The answer is "maybe": all the bits are set, but other words could have set them.`
            : `Ask about \`${w}\`: positions ${p.join(", ")} are all 1, set by \`owl\` (2 and 4) and \`dog\` (3). The filter says "maybe", but \`${w}\` was never added. This is a false positive.`,
      verdict: zero !== undefined ? { ok: true, text: "definitely not added" } : added ? { ok: true, text: "maybe (and it was added)", info: true } : { ok: false, text: "false positive" },
    });
  };
  ask("cat", true);
  ask("fox", false);
  ask("bee", false);
  return out;
}
