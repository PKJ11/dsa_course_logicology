// Step generators for the BSRC figures. Each returns the full list of states up front, so a figure is
// a pure function of its step number. Captions use `backticks` for code.

export type CellState = "" | "out" | "mid" | "found" | "violated";

export type ArrStep = {
  lo: number;
  hi: number;
  mid: number | null;
  states: CellState[];
  caption: string;
  reads: number;
  verdict?: { ok: boolean; text: string };
  pred?: (boolean | null)[];
  windowBad?: boolean;
};

function statesFor(n: number, lo: number, hi: number, mid: number | null, extra: Record<number, CellState> = {}) {
  const s: CellState[] = [];
  for (let k = 0; k < n; k++) s.push(k < lo || k > hi ? "out" : "");
  if (mid !== null && mid >= 0 && mid < n) s[mid] = "mid";
  for (const [k, v] of Object.entries(extra)) s[Number(k)] = v;
  return s;
}

const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? "" : "s"}`;

/**
 * Closed-interval binary search for an exact match.
 * `forgetEqual` is the classic bug: no `==` branch, so `a[mid] == t` falls into `hi = mid - 1`.
 */
export function classicSteps(a: number[], t: number, forgetEqual = false): ArrStep[] {
  const n = a.length;
  const steps: ArrStep[] = [];
  const at = a.indexOf(t);
  let lo = 0;
  let hi = n - 1;
  let reads = 0;
  const inv = () => (at === -1 ? null : at >= lo && at <= hi);
  const lostMark = (): Record<number, CellState> => (at !== -1 && !(at >= lo && at <= hi) ? { [at]: "violated" } : {});

  steps.push({
    lo, hi, mid: null, reads,
    states: statesFor(n, lo, hi, null),
    caption: `Start with the whole list as the window: \`lo = 0\`, \`hi = ${hi}\`. We are looking for ${t}.`,
    verdict: inv() === null ? undefined : { ok: true, text: `${t} is inside the window` },
  });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    reads++;
    const v = a[mid];
    if (!forgetEqual && v === t) {
      steps.push({
        lo, hi, mid, reads,
        states: statesFor(n, lo, hi, null, { [mid]: "found" }),
        caption: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`. \`a[${mid}] = ${v}\`. This is the target. It is at index ${mid}, found after ${plural(reads, "read")}.`,
        verdict: { ok: true, text: `Found at index ${mid}` },
      });
      return steps;
    }
    const goRight = v < t;
    const cmp = v < t ? "less than" : v > t ? "more than" : "equal to";
    steps.push({
      lo, hi, mid, reads,
      states: statesFor(n, lo, hi, mid, lostMark()),
      caption: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`. \`a[${mid}] = ${v}\` is ${cmp} ${t}${
        goRight ? `, so ${t} can only be to the right of mid.` : v === t ? `. But this version has no \`==\` check, so it goes to the else branch.` : `, so ${t} can only be to the left of mid.`
      }`,
      verdict: inv() === null ? undefined : { ok: true, text: `${t} is inside the window` },
    });
    if (goRight) lo = mid + 1;
    else hi = mid - 1;
    const stillIn = inv();
    const left = hi >= lo ? ` ${plural(hi - lo + 1, "value")} left.` : "";
    steps.push({
      lo, hi, mid: null, reads,
      states: statesFor(n, lo, hi, null, lostMark()),
      windowBad: stillIn === false,
      caption: goRight
        ? `\`lo = mid + 1 = ${lo}\`. Every value up to index ${mid} is now ruled out.${left}`
        : stillIn === false
          ? `\`hi = mid - 1 = ${hi}\`. This removes index ${mid}, but that is where ${t} is. The invariant is now false: the target is outside the window.`
          : `\`hi = mid - 1 = ${hi}\`. Every value from index ${mid} onwards is now ruled out.${left}`,
      verdict:
        stillIn === null ? undefined : stillIn ? { ok: true, text: `${t} is inside the window` } : { ok: false, text: `${t} is outside the window` },
    });
  }

  steps.push({
    lo, hi, mid: null, reads,
    states: statesFor(n, lo, hi, null, lostMark()),
    windowBad: at !== -1,
    caption:
      at === -1
        ? `The window is empty, because \`lo = ${lo}\` is bigger than \`hi = ${hi}\`. So ${t} is not in the list. Return \`-1\` after ${plural(reads, "read")}.`
        : `The window is empty, so the loop returns \`-1\`. But ${t} is at index ${at}. The answer is wrong, because the invariant became false earlier.`,
    verdict: at === -1 ? { ok: true, text: "Not in the list: return -1" } : { ok: false, text: `Wrong answer: -1` },
  });
  return steps;
}

/**
 * Half-open search for the first index where the predicate is true.
 * which = "first": p(i) = a[i] >= t.  which = "last": p(i) = a[i] > t, answer = boundary - 1.
 */
export function boundarySteps(a: number[], t: number, which: "first" | "last"): ArrStep[] {
  const n = a.length;
  const p = (k: number) => (which === "first" ? a[k] >= t : a[k] > t);
  const pText = which === "first" ? `a[i] >= ${t}` : `a[i] > ${t}`;
  const known = (lo: number, hi: number) => a.map((_, k) => (k < lo ? false : k >= hi ? true : null));
  const st = (lo: number, hi: number, mid: number | null, extra: Record<number, CellState> = {}) => statesFor(n, lo, hi - 1, mid, extra);
  const steps: ArrStep[] = [];
  let lo = 0;
  let hi = n;
  let reads = 0;
  steps.push({
    lo, hi: hi - 1, mid: null, reads, states: st(lo, hi, null), pred: known(lo, hi),
    caption: `For each index, ask: is \`${pText}\`? The answers go F F … F T T … T. Start with \`lo = 0\` and \`hi = ${n}\`. In a half-open window, hi is one past the end.`,
  });
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    reads++;
    const yes = p(mid);
    steps.push({
      lo, hi: hi - 1, mid, reads, states: st(lo, hi, mid), pred: known(lo, hi),
      caption: `\`mid = ${mid}\` and \`a[${mid}] = ${a[mid]}\`. Is \`${a[mid]} ${which === "first" ? ">=" : ">"} ${t}\`? ${yes ? `Yes, so the first T is at index ${mid} or before it. Set \`hi = mid\`.` : `No, so the first T is after index ${mid}. Set \`lo = mid + 1\`.`}`,
    });
    if (yes) hi = mid;
    else lo = mid + 1;
    const unknown = lo < hi ? ` ${hi - lo} still unknown.` : "";
    steps.push({
      lo, hi: hi - 1, mid: null, reads, states: st(lo, hi, null), pred: known(lo, hi),
      caption: yes
        ? `\`hi = ${hi}\`. Every index from ${hi} onwards is now known to be T.${unknown}`
        : `\`lo = ${lo}\`. Every index before ${lo} is now known to be F.${unknown}`,
    });
  }
  const b = lo;
  if (which === "first") {
    const ok = b < n && a[b] === t;
    steps.push({
      lo, hi: hi - 1, mid: null, reads, states: st(lo, hi, null, ok ? { [b]: "found" } : {}), pred: known(lo, hi),
      caption: ok
        ? `\`lo\` and \`hi\` are both ${b}, so this is the first T. \`a[${b}] == ${t}\`, so the first ${t} is at index ${b}. It took ${plural(reads, "read")}.`
        : b < n
          ? `\`lo\` and \`hi\` are both ${b}, so this is the first T. But \`a[${b}] = ${a[b]}\`, which is not ${t}. So ${t} is not in the list.`
          : `\`lo\` and \`hi\` are both ${b}, one past the end. No value is ${t} or more, so ${t} is not in the list.`,
      verdict: ok ? { ok: true, text: `First ${t} at index ${b}` } : { ok: true, text: "Not in the list: return -1" },
    });
  } else {
    const last = b - 1;
    const ok = last >= 0 && a[last] === t;
    steps.push({
      lo, hi: hi - 1, mid: null, reads, states: st(lo, hi, null, ok ? { [last]: "found" } : {}), pred: known(lo, hi),
      caption: ok
        ? `The first T is at index ${b}, so the last F is at index ${last}. \`a[${last}] == ${t}\`, so the last ${t} is at index ${last}. It took ${plural(reads, "read")}.`
        : `The first T is at index ${b}. The value just before it is not ${t}, so ${t} is not in the list.`,
      verdict: ok ? { ok: true, text: `Last ${t} at index ${last}` } : { ok: true, text: "Not in the list: return -1" },
    });
  }
  return steps;
}

export type DaySplit = { boxes: number[]; total: number }[];

export function splitDays(parcels: number[], cap: number): DaySplit {
  const days: DaySplit = [];
  let cur: number[] = [];
  let load = 0;
  for (const w of parcels) {
    if (load + w > cap) {
      days.push({ boxes: cur, total: load });
      cur = [];
      load = 0;
    }
    cur.push(w);
    load += w;
  }
  days.push({ boxes: cur, total: load });
  return days;
}

export type AnswerStep = {
  lo: number; // first candidate still unknown
  hi: number; // first candidate known feasible (half-open)
  mid: number | null;
  split?: DaySplit;
  caption: string;
  verdict?: { ok: boolean; text: string };
};

export function answerSteps(parcels: number[], days: number): { steps: AnswerStep[]; min: number; max: number } {
  const min = Math.max(...parcels);
  const max = parcels.reduce((x, y) => x + y, 0);
  const steps: AnswerStep[] = [];
  let lo = min;
  let hi = max;
  steps.push({
    lo, hi, mid: null,
    caption: `The van must carry the heaviest parcel (${min}), so the answer is at least ${min}. A van of ${max} carries everything in one day, so ${max} always works. The answer is somewhere from ${min} to ${max}.`,
  });
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const split = splitDays(parcels, mid);
    const ok = split.length <= days;
    steps.push({
      lo, hi, mid, split,
      caption: `Try capacity \`${mid}\`. Fill each day's van as full as possible, and start a new day when the next parcel does not fit. This takes ${plural(split.length, "day")}. ${ok ? `That is within ${days} days, so ${mid} works, and so does any bigger capacity.` : `That is more than ${days} days, so ${mid} is too small, and so is any smaller capacity.`}`,
      verdict: ok ? { ok: true, text: `${mid} works` } : { ok: false, text: `${mid} is too small` },
    });
    if (ok) hi = mid;
    else lo = mid + 1;
    steps.push({
      lo, hi, mid: null, split,
      caption: ok ? `\`hi = ${mid}\`. The smallest capacity that works is ${mid} or less.` : `\`lo = ${mid + 1}\`. The smallest capacity that works is at least ${mid + 1}.`,
    });
  }
  const tested = steps.filter((s) => s.mid !== null).length;
  steps.push({
    lo, hi, mid: null, split: splitDays(parcels, lo),
    caption: `\`lo\` and \`hi\` are both ${lo}. So ${lo} is the smallest capacity that sends everything in ${days} days. We only had to test ${tested} ${tested === 1 ? "capacity" : "capacities"}.`,
    verdict: { ok: true, text: `Answer: ${lo}` },
  });
  return { steps, min, max };
}

export type RealStep = { k: number; lo: number; hi: number; mid: number | null; rows: { k: number; lo: number; hi: number; mid: number; sq: number; keep: string }[]; caption: string };

export function sqrtSteps(x: number, iters: number): RealStep[] {
  let lo = 0;
  let hi = Math.max(1, x);
  const rows: RealStep["rows"] = [];
  const steps: RealStep[] = [
    { k: 0, lo, hi, mid: null, rows: [], caption: `√${x} is between 0 and ${hi}. The window is ${hi} wide, and each step halves it.` },
  ];
  for (let k = 1; k <= iters; k++) {
    const mid = (lo + hi) / 2;
    const sq = mid * mid;
    const keep = sq < x ? "right half" : "left half";
    rows.push({ k, lo, hi, mid, sq, keep });
    if (sq < x) lo = mid;
    else hi = mid;
    steps.push({
      k, lo, hi, mid, rows: rows.slice(),
      caption: `\`mid = ${fmt(mid)}\`. \`mid² = ${fmt(sq)}\`, which is ${sq < x ? "less" : "more"} than ${x}, so keep the ${keep}. The window is now ${fmtW(hi - lo)} wide.`,
    });
  }
  return steps;
}

export function fmt(v: number) {
  return v.toFixed(8).replace(/0+$/, "").replace(/\.$/, ".0");
}

export function fmtW(v: number) {
  if (v >= 0.001) return fmt(v);
  return v.toExponential(2).replace("e-", " × 10⁻").replace(/(\d+)$/, (d) => toSup(d));
}

function toSup(d: string) {
  const m: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return d.split("").map((c) => m[c] ?? c).join("");
}

/**
 * The `lo = mid` trap: `while lo < hi`, `mid = (lo + hi) // 2`, `if a[mid] < t: lo = mid else: hi = mid`.
 * When hi == lo + 1, mid == lo, and if a[mid] < t nothing changes. The fixed version uses lo = mid + 1.
 */
export function trapSteps(a: number[], t: number, fixed: boolean): ArrStep[] {
  const n = a.length;
  const steps: ArrStep[] = [];
  let lo = 0;
  let hi = n - 1;
  let reads = 0;
  const seen = new Map<string, number>();
  steps.push({
    lo, hi, mid: null, reads, states: statesFor(n, lo, hi, null),
    caption: `We want the first index with \`a[i] >= ${t}\`. The loop runs \`while lo < hi\`, starting with \`hi = n - 1\`. ${fixed ? "This version moves lo with `lo = mid + 1`." : "This version moves lo with `lo = mid`."}`,
  });
  seen.set(`${lo},${hi}`, 0);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    reads++;
    const less = a[mid] < t;
    steps.push({
      lo, hi, mid, reads, states: statesFor(n, lo, hi, mid),
      caption: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`. \`a[${mid}] = ${a[mid]}\` ${less ? `is less than ${t}, so lo must move right.` : `is ${t} or more, so set \`hi = mid\`.`}`,
    });
    if (less) lo = fixed ? mid + 1 : mid;
    else hi = mid;
    const key = `${lo},${hi}`;
    if (seen.has(key)) {
      steps.push({
        lo, hi, mid: null, reads, states: statesFor(n, lo, hi, null), windowBad: true,
        caption: `\`lo = ${lo}\` and \`hi = ${hi}\`. This is the same as after step ${seen.get(key)! + 1}. Nothing changed, so nothing will ever change. With two values left, \`mid\` rounds down to lo, so \`lo = mid\` does not move lo. The loop runs forever.`,
        verdict: { ok: false, text: "Stuck: same state again" },
      });
      return steps;
    }
    seen.set(key, steps.length);
    steps.push({
      lo, hi, mid: null, reads, states: statesFor(n, lo, hi, null),
      caption: less
        ? `\`lo = ${fixed ? "mid + 1" : "mid"} = ${lo}\`. ${plural(hi - lo + 1, "value")} in the window.`
        : `\`hi = mid = ${hi}\`. ${plural(hi - lo + 1, "value")} in the window.`,
    });
  }
  const ok = a[lo] >= t;
  steps.push({
    lo, hi, mid: null, reads, states: statesFor(n, lo, hi, null, ok ? { [lo]: "found" } : {}),
    caption: `\`lo\` and \`hi\` are both ${lo}, so the loop ends. Every step made the window at least one smaller, so the loop had to stop. The first index with \`a[i] >= ${t}\` is ${lo}.`,
    verdict: { ok: true, text: `Stops at index ${lo}` },
  });
  return steps;
}
