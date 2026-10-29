// STRG step generators. Every figure is a Grid: the text in one row, the pattern (or a copy of the string) in a row
// under it, shifted to the place being tried, and a table row (π, Z, a hash, a radius) under that. Columns are
// places in the text. Captions use backticks for code.

import type { GCell } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type CellMark = GCell["s"];

export type StrStep = {
  cells: GCell[][];
  rows: (string | number | null)[];
  cols?: (string | number)[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

const q = (s: string) => `“${s}”`;

/** A row of letters with marks. */
function row(text: string, marks: Record<number, CellMark> = {}, src: number[] = []): GCell[] {
  return text.split("").map((ch, k) => ({ v: ch, s: marks[k], src: src.includes(k) || undefined }));
}

/** `pat` placed under a text of length n, starting at column `at`. Columns it does not cover are blank. */
function shifted(pat: string, at: number, n: number, marks: Record<number, CellMark> = {}): GCell[] {
  return Array.from({ length: n }, (_, c) => {
    const j = c - at;
    if (j < 0 || j >= pat.length) return { blank: true };
    return { v: pat[j], s: marks[j] };
  });
}

/** A row of numbers (a table), blank where the value is not known yet. */
function nums(vals: (number | string | null)[], marks: Record<number, CellMark> = {}, src: number[] = []): GCell[] {
  return vals.map((v, k) => (v === null ? { v: "" } : { v, s: marks[k], src: src.includes(k) || undefined }));
}

function range(a: number, b: number): number[] {
  return Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
}

function marks(ks: number[], m: CellMark, into: Record<number, CellMark> = {}): Record<number, CellMark> {
  for (const k of ks) into[k] = m;
  return into;
}

/* ---------- STRG-1.1: the naive method ---------- */

export type NaiveVariant = "few" | "worst";
export const NAIVE: Record<NaiveVariant, { t: string; p: string }> = {
  few: { t: "abcabcab", p: "cab" },
  worst: { t: "aaaaaaaa", p: "aaab" },
};

export function naiveSteps(v: NaiveVariant): StrStep[] {
  const { t, p } = NAIVE[v];
  const n = t.length;
  const m = p.length;
  const out: StrStep[] = [];
  const found: number[] = [];
  let count = 0;
  const foundMarks = () => marks(found.flatMap((s) => range(s, s + m)), "found");
  const rd = (s: number) => `place ${s} · comparisons so far ${count}`;
  out.push({
    cells: [row(t), shifted(p, 0, n)],
    rows: ["T", "P"],
    caption:
      v === "few"
        ? `The text T is ${q(t)} and the pattern P is ${q(p)}. Put P under T at place 0, and compare letters from the left.`
        : `The worst case: T is ${q(t)} and P is ${q(p)}. At every place the first ${m - 1} letters match, and only the last one differs.`,
    readout: rd(0),
  });
  for (let s = 0; s + m <= n; s++) {
    if (v === "worst") {
      let j = 0;
      while (j < m && t[s + j] === p[j]) j++;
      count += Math.min(j + 1, m);
      const tm = marks(range(s, s + j), "path", foundMarks());
      const pm = marks(range(0, j), "path");
      if (j < m) {
        tm[s + j] = "cur";
        pm[j] = "cur";
      }
      out.push({
        cells: [row(t, tm), shifted(p, s, n, pm)],
        rows: ["T", "P"],
        caption: `Place ${s}: ${j} letters match, then ${q(t[s + j])} ≠ ${q(p[j])}. That is ${j + 1} comparisons, and P moves one place right.`,
        readout: rd(s),
      });
      continue;
    }
    for (let j = 0; j < m; j++) {
      count++;
      const same = t[s + j] === p[j];
      const tm = marks(range(s, s + j), "path", foundMarks());
      const pm = marks(range(0, j), "path");
      if (same && j === m - 1) {
        found.push(s);
        out.push({
          cells: [row(t, foundMarks()), shifted(p, s, n, marks(range(0, m), "found"))],
          rows: ["T", "P"],
          caption: `T[${s + j}] and P[${j}] are both ${q(p[j])}. All ${m} letters match, so P occurs at place ${s}. Report it, then move P one place right.`,
          readout: rd(s),
          verdict: { ok: true, text: `found at ${s}` },
        });
        break;
      }
      tm[s + j] = "cur";
      pm[j] = "cur";
      out.push({
        cells: [row(t, tm), shifted(p, s, n, pm)],
        rows: ["T", "P"],
        caption: same
          ? `T[${s + j}] and P[${j}] are both ${q(p[j])}: they match. Compare the next pair.`
          : `T[${s + j}] is ${q(t[s + j])} but P[${j}] is ${q(p[j])}: they differ. Stop here, and move P one place right.`,
        readout: rd(s),
      });
      if (!same) break;
    }
  }
  const places = n - m + 1;
  out.push({
    cells: [row(t, foundMarks()), shifted(p, n - m, n)],
    rows: ["T", "P"],
    caption:
      v === "few"
        ? `Done: P occurs at places ${found.join(" and ")}. ${count} comparisons for ${places} places: most places stop after one letter.`
        : `Done, with no match: ${places} places × ${m} comparisons = ${count}. In general (n − m + 1) · m. For a text of a million letters and a pattern of a thousand, that is about a billion.`,
    readout: `comparisons ${count}`,
    verdict: found.length ? undefined : { ok: true, info: true, text: "no match" },
  });
  return out;
}

/* ---------- STRG-2.1: KMP ---------- */

export function prefixFunction(p: string): number[] {
  const pi = new Array(p.length).fill(0);
  for (let i = 1; i < p.length; i++) {
    let k = pi[i - 1];
    while (k > 0 && p[i] !== p[k]) k = pi[k - 1];
    if (p[i] === p[k]) k++;
    pi[i] = k;
  }
  return pi;
}

export type KmpVariant = "table" | "search";
export const KMP_P = "abacabab";
export const KMP_SEARCH = { t: "abababac", p: "ababac" };

export function kmpSteps(v: KmpVariant): StrStep[] {
  return v === "table" ? tableSteps(KMP_P) : searchSteps(KMP_SEARCH.t, KMP_SEARCH.p);
}

function tableSteps(p: string): StrStep[] {
  const n = p.length;
  const pi: (number | null)[] = new Array(n).fill(null);
  pi[0] = 0;
  const full = prefixFunction(p);
  const out: StrStep[] = [];
  let count = 0;
  const rows = ["P", "P", "π"];
  out.push({
    cells: [row(p), shifted(p, 1, n), nums(pi)],
    rows,
    caption: `π[i] is the length of the longest border of P[0..i]: the longest piece that is both a start and an end of it, but not all of it. π[0] is always 0. To find the rest, slide a copy of P along P itself.`,
    readout: "comparisons 0",
  });
  for (let i = 1; i < n; i++) {
    let k = pi[i - 1] as number;
    for (;;) {
      count++;
      const same = p[i] === p[k];
      const at = i - k; // the copy's place: its letter k sits under letter i
      const top = marks(range(at, i), "path");
      top[i] = "cur";
      const low = marks(range(0, k), "path");
      low[k] = "cur";
      const src: number[] = [];
      if (same) {
        pi[i] = k + 1;
        out.push({
          cells: [row(p, top), shifted(p, at, n, low), nums(pi, { [i]: "cur" })],
          rows,
          caption:
            k === 0
              ? `P[${i}] = P[0] = ${q(p[i])}. A border of length 1, so π[${i}] = 1.`
              : `The border of length ${k} (shaded) can grow: P[${i}] = P[${k}] = ${q(p[i])}. So π[${i}] = ${k + 1}.`,
          readout: `comparisons ${count}`,
        });
        break;
      }
      if (k === 0) {
        pi[i] = 0;
        out.push({
          cells: [row(p, top), shifted(p, at, n, low), nums(pi, { [i]: "cur" })],
          rows,
          caption: `P[${i}] is ${q(p[i])} and P[0] is ${q(p[0])}: they differ, and there is no shorter border left to try. So π[${i}] = 0.`,
          readout: `comparisons ${count}`,
        });
        break;
      }
      const next = pi[k - 1] as number;
      src.push(k - 1);
      out.push({
        cells: [row(p, top), shifted(p, at, n, low), nums(pi, {}, src)],
        rows,
        caption:
          `P[${i}] is ${q(p[i])} but P[${k}] is ${q(p[k])}: the border of length ${k} cannot grow. ` +
          (next === 0
            ? `π[${k - 1}] = 0 (dashed): it has no shorter border, so slide the copy right and try P[0].`
            : `The next shorter border is π[${k - 1}] = ${next} letter${next === 1 ? "" : "s"} long (dashed), so slide the copy right and try that one.`),
        readout: `comparisons ${count}`,
      });
      k = next;
    }
  }
  out.push({
    cells: [row(p), shifted(p, n, n), nums(full, marks(range(0, n), "done"))],
    rows,
    caption: `The table is complete after ${count} comparisons for ${n} letters. Each comparison either makes the border one longer or makes it shorter, so there are at most 2n of them.`,
    readout: `π = [${full.join(", ")}]`,
  });
  return out;
}

function searchSteps(t: string, p: string): StrStep[] {
  const n = t.length;
  const m = p.length;
  const pi = prefixFunction(p);
  const out: StrStep[] = [];
  const rows = ["T", "P", "π"];
  const piRow = (at: number, mk: Record<number, CellMark> = {}, src: number[] = []): GCell[] => {
    const base = shifted(pi.map(String).join("\u0000"), 0, 0); // placeholder, replaced below
    void base;
    return Array.from({ length: n }, (_, c) => {
      const j = c - at;
      if (j < 0 || j >= m) return { blank: true };
      return { v: pi[j], s: mk[j], src: src.includes(j) || undefined };
    });
  };
  let count = 0;
  let j = 0;
  const found: number[] = [];
  out.push({
    cells: [row(t), shifted(p, 0, n), piRow(0)],
    rows,
    caption: `Search for P = ${q(p)} in T = ${q(t)}. π, P's border table, moves with P. The place i in T only ever moves right.`,
    readout: "i = 0 · j = 0 · comparisons 0",
  });
  for (let i = 0; i < n; i++) {
    for (;;) {
      count++;
      const at = i - j;
      const same = t[i] === p[j];
      const tm = marks(range(at, i), "path");
      tm[i] = "cur";
      const pm = marks(range(0, j), "path");
      pm[j] = "cur";
      if (same) {
        j++;
        if (j === m) {
          out.push({
            cells: [row(t, marks(range(at, at + m), "found")), shifted(p, at, n, marks(range(0, m), "found")), piRow(at)],
            rows,
            caption: `T[${i}] = P[${m - 1}] = ${q(t[i])}: all ${m} letters match, so P occurs at place ${at}. No letter of T was read twice.`,
            readout: `i = ${i} · j = ${m} · comparisons ${count}`,
            verdict: { ok: true, text: `found at ${at}` },
          });
          found.push(at);
          j = pi[m - 1];
        } else {
          out.push({
            cells: [row(t, tm), shifted(p, at, n, pm), piRow(at)],
            rows,
            caption: `T[${i}] = P[${j - 1}] = ${q(t[i])}. ${j} letter${j > 1 ? "s" : ""} of P match${j > 1 ? "" : "es"} so far; move to the next letter of T.`,
            readout: `i = ${i} · j = ${j - 1} · comparisons ${count}`,
          });
        }
        break;
      }
      if (j === 0) {
        out.push({
          cells: [row(t, tm), shifted(p, at, n, pm), piRow(at)],
          rows,
          caption: `T[${i}] is ${q(t[i])} and P[0] is ${q(p[0])}: they differ, with nothing matched. Move on in T.`,
          readout: `i = ${i} · j = 0 · comparisons ${count}`,
        });
        break;
      }
      const nj = pi[j - 1];
      out.push({
        cells: [row(t, tm), shifted(p, at, n, pm), piRow(at, {}, [j - 1])],
        rows,
        caption: `T[${i}] is ${q(t[i])} but P[${j}] is ${q(p[j])}. The ${j} letters before them matched, and π[${j - 1}] = ${nj} (dashed) says their last ${nj} letters are also P's first ${nj}. So slide P right by ${j - nj} and keep those ${nj} letters matched; i stays where it is.`,
        readout: `i = ${i} · j = ${j} · comparisons ${count}`,
      });
      j = nj;
    }
  }
  out.push({
    cells: [row(t, marks(found.flatMap((f) => range(f, f + m)), "found")), shifted(p, n, n), piRow(n)],
    rows,
    caption: `Done: ${count} comparisons for ${n} letters of T. Each comparison either moves i right or slides P right, and each can happen at most n times, so KMP makes at most 2n comparisons.`,
    readout: `comparisons ${count}`,
  });
  return out;
}

/* ---------- STRG-3.1: the Z-algorithm ---------- */

export const Z_S = "aabaabaa";

export function zArray(s: string): number[] {
  const n = s.length;
  const z = new Array(n).fill(0);
  let l = 0;
  let r = 0;
  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
  }
  return z;
}

export function zSteps(): StrStep[] {
  const s = Z_S;
  const n = s.length;
  const z: (number | string | null)[] = new Array(n).fill(null);
  z[0] = "–";
  const out: StrStep[] = [];
  const rows = ["s", "s", "Z"];
  let l = 0;
  let r = 0;
  let count = 0;
  out.push({
    cells: [row(s), shifted(s, 1, n), nums(z)],
    rows,
    caption: `Z[i] is the length of the longest piece starting at place i that is also a start of the whole string s. The copy of s under it shows the comparison. Z[0] is left out: it would be the whole string.`,
    readout: "box empty · comparisons 0",
  });
  for (let i = 1; i < n; i++) {
    let k = 0;
    let caption = "";
    const src: number[] = [];
    if (i < r) {
      const mirror = z[i - l] as number;
      k = Math.min(r - i, mirror);
      src.push(i - l);
      if (mirror < r - i) {
        z[i] = k;
        out.push({
          cells: [row(s, marks(range(l, r), "path")), shifted(s, i, n, marks(range(0, k), "path")), nums(z, { [i]: "cur" }, src)], // one heavy frame: Z[i]
          rows,
          caption: `Place ${i} is inside the box [${l}, ${r}), which is a copy of s[0..${r - l}). So the letters from ${i} look like the letters from ${i - l}, and Z[${i - l}] = ${mirror} (dashed) ends inside the box. Z[${i}] = ${mirror}, with no comparisons at all.`,
          readout: `box [${l}, ${r}) · comparisons ${count}`,
        });
        continue;
      }
      caption = `Place ${i} is inside the box [${l}, ${r}). Z[${i - l}] = ${mirror} reaches the end of the box, so the first ${k} letter${k === 1 ? " is" : "s are"} known to match without comparing. `;
    } else {
      caption = r === 0 ? `Place ${i}: there is no box yet, so compare from the start. ` : `Place ${i} is outside the box, so compare from the start. `;
    }
    const k0 = k;
    let cmp = 0;
    while (i + k < n && s[k] === s[i + k]) {
      k++;
      cmp++;
    }
    const stopped = i + k < n;
    if (stopped) cmp++;
    count += cmp;
    z[i] = k;
    const tm = marks(range(i, i + k), "path");
    const pm = marks(range(0, k), "path");
    if (stopped) {
      tm[i + k] = "cur";
      pm[k] = "cur";
    }
    const grew = i + k > r;
    caption +=
      cmp === 0
        ? `No letters left to compare, so Z[${i}] = ${k}.`
        : k === k0
          ? `${q(s[i + k])} ≠ ${q(s[k])} at once. Z[${i}] = ${k}.`
          : `${k - k0} ${k0 ? "more " : ""}letter${k - k0 === 1 ? " matches" : "s match"}${stopped ? `, then ${q(s[i + k])} ≠ ${q(s[k])}` : " up to the end of s"}. Z[${i}] = ${k}.`;
    if (grew)
      caption +=
        r === 0
          ? ` The piece [${i}, ${i + k}) matches a start of s. Call it the box: of the matches found so far, the one that reaches furthest right.`
          : ` The match reaches past ${r}, so the box becomes [${i}, ${i + k}).`;
    out.push({
      cells: [row(s, tm), shifted(s, i, n, pm), nums(z, { [i]: "cur" }, src)],
      rows,
      caption,
      readout: `box [${grew ? i : l}, ${grew ? i + k : r}) · comparisons ${count}`,
    });
    if (grew) {
      l = i;
      r = i + k;
    }
  }
  const zz = zArray(s);
  out.push({
    cells: [row(s), shifted(s, n, n), nums(["–", ...zz.slice(1)], marks(range(1, n), "done"))],
    rows,
    caption: `Done: ${count} comparisons for ${n} letters. Every comparison that matches moves the right end of the box further right, and that end never moves back, so the whole run is O(n).`,
    readout: `Z = [–, ${zz.slice(1).join(", ")}]`,
  });
  return out;
}

/* ---------- STRG-4.1: Rabin-Karp with a rolling hash ---------- */

export const RK = { t: "31415926", p: "159", mod: 13 };

export function rkSteps(): StrStep[] {
  const { t, p, mod } = RK;
  const n = t.length;
  const m = p.length;
  const hp = Number(p) % mod;
  const h: (number | null)[] = new Array(n).fill(null);
  const out: StrStep[] = [];
  const rows = ["T", "P", "h"];
  const found: number[] = [];
  const bad: number[] = [];
  const keep = () => marks(found.flatMap((s) => range(s, s + m)), "found");
  out.push({
    cells: [row(t), shifted(p, 0, n), nums(h)],
    rows,
    caption: `Digits make the idea easy to see. The hash of a piece is its number modulo ${mod} (the remainder after dividing by ${mod}). P = ${p}, and ${p} mod ${mod} = ${hp}. Row h will hold the hash of the piece of T that starts at each place.`,
    readout: `hash(P) = ${hp}`,
  });
  let w = Number(t.slice(0, m));
  for (let s = 0; s + m <= n; s++) {
    let how: string;
    if (s === 0) {
      how = `The first piece is ${t.slice(0, m)}, and ${t.slice(0, m)} mod ${mod} = ${w % mod}.`;
    } else {
      const old = Number(t.slice(s - 1, s - 1 + m));
      how = `Roll: drop ${t[s - 1]} (worth ${t[s - 1]}·100), multiply by 10 and add ${t[s + m - 1]}: (${old} − ${Number(t[s - 1]) * 100})·10 + ${t[s + m - 1]} = ${w}, and ${w} mod ${mod} = ${w % mod}.`;
    }
    h[s] = w % mod;
    const tm = marks(range(s, s + m), "path", keep());
    if (s > 0) tm[s - 1] = "out";
    // the window is pale; the new hash h[s] carries the one heavy frame
    if (h[s] !== hp) {
      out.push({
        cells: [row(t, tm), shifted(p, s, n), nums(h, { [s]: "cur" })],
        rows,
        caption: `${how} That is not ${hp}, so this piece cannot be P. No letters compared.`,
        readout: `hash(P) = ${hp}`,
      });
    } else if (t.slice(s, s + m) === p) {
      found.push(s);
      out.push({
        cells: [row(t, keep()), shifted(p, s, n, marks(range(0, m), "found")), nums(h, { [s]: "found" })],
        rows,
        caption: `${how} The hashes are equal, so compare the letters to be sure: ${t.slice(s, s + m)} = ${p}. P occurs at place ${s}.`,
        readout: `hash(P) = ${hp}`,
        verdict: { ok: true, text: `found at ${s}` },
      });
    } else {
      bad.push(s);
      out.push({
        cells: [row(t, { ...marks(range(s, s + m), "path"), ...keep() }), shifted(p, s, n), nums(h, { [s]: "cur" })],
        rows,
        caption: `${how} The hashes are equal, but the letters are not: ${t.slice(s, s + m)} ≠ ${p}. This is a collision: two different pieces with the same hash. The check by letters catches it.`,
        readout: `hash(P) = ${hp}`,
        verdict: { ok: false, text: "a collision, caught by the check" },
      });
    }
    if (s + m < n) w = (w - Number(t[s]) * 100) * 10 + Number(t[s + m]);
  }
  out.push({
    cells: [row(t, keep()), shifted(p, n, n), nums(h, marks(range(0, n - m + 1), "done"))],
    rows,
    caption: `Done. Each roll took a few steps, whatever the length of P, so the hashes cost O(n). Letters were compared only where the hashes agreed. With a modulus near 10¹⁸ instead of ${mod}, a collision like the one at place ${bad[0]} almost never happens.`,
    readout: `found at ${found.join(", ")}`,
  });
  return out;
}

/* ---------- STRG-5.1: suffix arrays ---------- */

export const SA_S = "banana";

export function suffixArray(s: string): number[] {
  return Array.from({ length: s.length }, (_, i) => i).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1));
}

export type SaVariant = "double" | "lcp";

/** One row per suffix: its letters in columns 0..n-1, then extra columns. */
function sufRow(s: string, i: number, lit: number, extra: GCell[], cur = false): GCell[] {
  const n = s.length;
  const cells: GCell[] = Array.from({ length: n }, (_, c) => {
    if (i + c >= n) return { blank: true };
    return { v: s[i + c], s: c < lit ? (cur ? "cur" : "path") : undefined };
  });
  return [...cells, ...extra];
}

export function saSteps(v: SaVariant): StrStep[] {
  return v === "double" ? doubleSteps(SA_S) : kasaiSteps(SA_S);
}

function doubleSteps(s: string): StrStep[] {
  const n = s.length;
  const cols = [...range(0, n).map(String), "pair", "rank"];
  const out: StrStep[] = [];
  let order = range(0, n);
  out.push({
    cells: order.map((i) => sufRow(s, i, 0, [{ v: "" }, { v: "" }])),
    rows: order,
    cols,
    caption: `The suffixes (endings) of ${q(s)}, one per row, named by the place where each starts. The goal is to put the rows in alphabetical order. The row plates will then read the suffix array.`,
  });
  // round 1: rank by the first letter
  const letters = [...new Set(s.split(""))].sort();
  let rank = range(0, n).map((i) => letters.indexOf(s[i]));
  order = range(0, n).sort((a, b) => rank[a] - rank[b] || a - b);
  out.push({
    cells: order.map((i) => sufRow(s, i, 1, [{ v: "" }, { v: rank[i], s: "path" }])),
    rows: order,
    cols,
    caption: `Round 1: sort by the first letter only, and give each row a rank: equal first letters get equal ranks (a is 0, b is 1, n is 2). The rows starting with ${q("a")} are not in order yet, but they are together.`,
    readout: "sorted by 1 letter",
  });
  for (let k = 1; k < n; k *= 2) {
    const pair = (i: number) => [rank[i], i + k < n ? rank[i + k] : -1] as const;
    const show = (i: number) => {
      const [a, b] = pair(i);
      return `${a},${b < 0 ? "–" : b}`;
    };
    order = range(0, n).sort((a, b) => {
      const [a1, a2] = pair(a);
      const [b1, b2] = pair(b);
      return a1 - b1 || a2 - b2;
    });
    out.push({
      cells: order.map((i) => sufRow(s, i, Math.min(2 * k, n), [{ v: show(i), s: "path", small: true }, { v: rank[i] }])),
      rows: order,
      cols,
      caption:
        k === 1
          ? `Round 2: the first 2 letters of a suffix are its first letter, then the first letter of the suffix one place later. Both already have ranks. So sort by the pair (own rank, rank of the next suffix), with – (nothing left) as the smallest.`
          : `Round ${Math.log2(k) + 2}: the first ${2 * k} letters of a suffix are its first ${k}, then the first ${k} of the suffix ${k} places later. Both already have ranks. So sort by the pair (own rank, rank of the suffix ${k} later).`,
      readout: `sorted by ${2 * k} letters`,
    });
    const next = new Array(n).fill(0);
    for (let r = 1; r < n; r++) {
      const [a1, a2] = pair(order[r - 1]);
      const [b1, b2] = pair(order[r]);
      next[order[r]] = next[order[r - 1]] + (a1 !== b1 || a2 !== b2 ? 1 : 0);
    }
    rank = next;
    const distinct = new Set(rank).size === n;
    out.push({
      cells: order.map((i) => sufRow(s, i, Math.min(2 * k, n), [{ v: show(i), small: true }, { v: rank[i], s: distinct ? "done" : "path" }])),
      rows: order,
      cols,
      caption: distinct
        ? `New ranks from the sorted pairs: all ${n} are different, so the order is final after ${Math.log2(k) + 2} rounds. The suffix array is [${order.join(", ")}].`
        : `New ranks: equal pairs get equal ranks. Some ranks are still shared, so double again.`,
      readout: `sorted by ${2 * k} letters`,
      verdict: distinct ? { ok: true, text: "all ranks differ" } : undefined,
    });
    if (distinct) break;
  }
  return out;
}

function lcpOf(s: string, a: number, b: number): number {
  let k = 0;
  while (a + k < s.length && b + k < s.length && s[a + k] === s[b + k]) k++;
  return k;
}

function kasaiSteps(s: string): StrStep[] {
  const n = s.length;
  const sa = suffixArray(s);
  const rank = new Array(n);
  sa.forEach((i, r) => (rank[i] = r));
  const lcp: (number | string | null)[] = new Array(n).fill(null);
  lcp[0] = "–";
  const cols = [...range(0, n).map(String), "lcp"];
  const out: StrStep[] = [];
  const view = (curRow: number | null, lit: number, prevRow: number | null, lcpMark?: CellMark): GCell[][] =>
    sa.map((i, r) =>
      sufRow(s, i, r === curRow || r === prevRow ? lit : 0, [{ v: lcp[r] ?? "", s: r === curRow ? lcpMark : undefined }]),
    );
  out.push({
    cells: view(null, 0, null),
    rows: sa,
    cols,
    caption: `The sorted suffixes. lcp of a row is the length of the longest common prefix (shared start) of that suffix and the one in the row above it. Kasai's method fills the column in the order of the text: the suffix at 0, then 1, then 2, …`,
  });
  let h = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const r = rank[i];
    if (r === 0) {
      h = 0;
      out.push({
        cells: view(r, 0, null),
        rows: sa,
        cols,
        caption: `The suffix at ${i} is in the first row, with nothing above it. Set h = 0.`,
        readout: `h = 0 · comparisons ${count}`,
      });
      continue;
    }
    const j = sa[r - 1];
    const start = h;
    let cmp = 0;
    while (i + h < n && j + h < n && s[i + h] === s[j + h]) {
      h++;
      cmp++;
    }
    if (i + h < n && j + h < n) cmp++;
    count += cmp;
    lcp[r] = h;
    out.push({
      cells: view(r, h, r - 1, "cur"),
      rows: sa,
      cols,
      caption:
        (start > 0 ? `The last answer was ${start + 1}, so this one is at least ${start}: skip the first ${start} letter${start === 1 ? "" : "s"}. ` : "") +
        `Compare the suffix at ${i} with the row above (the suffix at ${j}): they share ${h} letter${h === 1 ? "" : "s"}, so lcp = ${h}.`,
      readout: `h = ${h} · comparisons ${count}`,
    });
    if (h > 0) h--;
  }
  out.push({
    cells: sa.map((i, r) => sufRow(s, i, 0, [{ v: lcp[r] ?? "", s: r > 0 ? "done" : undefined }])),
    rows: sa,
    cols,
    caption: `Done with ${count} comparisons. h drops by at most 1 from one suffix to the next and never goes above n, so the whole column takes O(n). The largest lcp, ${Math.max(...(lcp.slice(1) as number[]))}, is the longest piece that occurs twice (${q(s.slice(sa[(lcp as number[]).indexOf(Math.max(...(lcp.slice(1) as number[])))], sa[(lcp as number[]).indexOf(Math.max(...(lcp.slice(1) as number[])))] + Math.max(...(lcp.slice(1) as number[]))))}).`,
    readout: `lcp = [–, ${lcp.slice(1).join(", ")}]`,
  });
  return out;
}

/* ---------- STRG-6.1: Manacher ---------- */

export type ManVariant = "odd" | "even";
export const MAN: Record<ManVariant, string> = { odd: "abacabad", even: "abbaabba" };

export function manSteps(v: ManVariant): StrStep[] {
  const s = MAN[v];
  const n = s.length;
  const odd = v === "odd";
  const d: (number | null)[] = new Array(n).fill(null);
  const out: StrStep[] = [];
  const rows = ["s", odd ? "d₁" : "d₂"];
  let l = 0;
  let r = -1;
  let count = 0;
  out.push({
    cells: [row(s), nums(d)],
    rows,
    caption: odd
      ? `d₁[i] counts the palindromes of odd length centred on place i: 1 for the letter itself, 2 if it also has a matching letter on each side, and so on. The shaded box will be the palindrome found so far that reaches furthest right.`
      : `d₂[i] counts the palindromes of even length whose centre is the gap just before place i: 1 if s[i − 1] = s[i], 2 if the pair around them also matches, and so on.`,
    readout: "box empty · comparisons 0",
  });
  for (let i = 0; i < n; i++) {
    let k: number;
    let caption = "";
    const src: number[] = [];
    if (i <= r) {
      const j = odd ? l + r - i : l + r - i + 1;
      const mirror = d[j] as number;
      const room = odd ? r - i + 1 : r - i + 1;
      k = Math.min(mirror, room);
      src.push(j);
      caption = `Place ${i} is inside the box [${l}, ${r}], a palindrome. Its mirror image in the box is place ${j}, with ${odd ? "d₁" : "d₂"}[${j}] = ${mirror} (dashed). `;
      caption += mirror < room ? `That palindrome ends inside the box, so the one here is the same, with no comparisons. ` : `That reaches the box's edge, so start from ${k} and compare outside the box. `;
    } else {
      k = odd ? 1 : 0;
      caption = `Place ${i} is outside the box, so start from ${k} and compare letters on both sides. `;
    }
    let cmp = 0;
    const inside = src.length > 0 && (d[src[0]] as number) < (r - i + 1);
    if (inside) {
      // the mirror's palindrome ends inside the box, so this one cannot grow: no comparisons
    } else if (odd) {
      while (i - k >= 0 && i + k < n && s[i - k] === s[i + k]) {
        k++;
        cmp++;
      }
      if (i - k >= 0 && i + k < n) cmp++;
    } else {
      while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] === s[i + k]) {
        k++;
        cmp++;
      }
      if (i - k - 1 >= 0 && i + k < n) cmp++;
    }
    count += cmp;
    d[i] = k;
    const lo = odd ? i - k + 1 : i - k;
    const hi = i + k - 1;
    const tm = marks(range(l, r + 1), "path");
    for (const c of range(Math.max(lo, 0), hi + 1)) tm[c] = "path";
    tm[i] = "path"; // the one heavy frame is d[i]
    const grows = hi > r && k > 0;
    if (cmp > 0) caption += `${cmp} comparison${cmp === 1 ? "" : "s"}: `;
    else if (!inside) caption += `No pair to compare there. `;
    caption += `${odd ? "d₁" : "d₂"}[${i}] = ${k}.`;
    if (grows) caption += ` This palindrome, [${lo}, ${hi}], reaches further right, so it becomes the box.`;
    const box = grows ? `box [${lo}, ${hi}]` : r < 0 ? "box empty" : `box [${l}, ${r}]`;
    out.push({ cells: [row(s, tm), nums(d, { [i]: "cur" }, src)], rows, caption, readout: `${box} · comparisons ${count}` });
    if (grows) {
      l = lo;
      r = hi;
    }
  }
  const total = (d as number[]).reduce((a, b) => a + b, 0);
  out.push({
    cells: [row(s), nums(d, marks(range(0, n), "done"))],
    rows,
    caption: `Done: ${count} comparisons. Each comparison that matches moves the box's right end further right, and it never moves back, so Manacher's method is O(n). The row adds up to ${total}: the number of ${odd ? "odd" : "even"}-length palindromes in ${q(s)}, counted by position.`,
    readout: `${odd ? "d₁" : "d₂"} = [${(d as number[]).join(", ")}]`,
  });
  return out;
}
