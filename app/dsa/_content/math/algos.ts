// Step generators for the MATH figures. Every figure is a pure function of its step number.
// Tables use the Grid stage (Euclid's steps, powers, the sieve, inverse tables, Pascal's triangle);
// the clock of lesson 2 uses the ArrayTrack with a train. Crossed-out numbers are hatched (`out`), never red.
// Captions use `backticks` for code.

import type { Pointer } from "../../_components/ArrayTrack";
import type { CellState } from "../../_components/ArrayTrack";
import type { GCell, GFrom, Mark } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type TableStep = {
  cells: GCell[][];
  /** a second, smaller table under the first (the kept slots of a reservoir) */
  kept?: GCell[][];
  rowHead?: (string | number | null)[];
  colHead?: (string | number)[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

const small = (v: string | number | undefined) => String(v ?? "").length >= 4 || undefined;
const cell = (v: string | number | undefined, s?: Mark | "path", extra: Partial<GCell> = {}): GCell => ({ v, s, small: small(v), ...extra });
const fmt = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
/** a number as the right-hand factor of a product: negatives in brackets */
const par = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

/* ---------------------------------------------------------------- MATH-1.1: Euclid's algorithm */

export type EuclidVariant = "gcd" | "slow" | "ext";

export function euclidSteps(v: EuclidVariant): TableStep[] {
  if (v === "ext") return extSteps();
  const [A, B] = v === "gcd" ? [1071, 462] : [89, 55];
  const rowsData: [number, number, number, number][] = [];
  let a = A;
  let b = B;
  while (b) {
    rowsData.push([a, b, Math.floor(a / b), a % b]);
    [a, b] = [b, a % b];
  }
  const colHead = ["a", "b", "q", "r"];
  const head = (k: number) => Array.from({ length: k }, (_, i) => i + 1);
  const grid = (upto: number, cur?: number, done = false): GCell[][] =>
    rowsData.slice(0, upto + 1).map((r, i) =>
      r.map((x, c) => {
        if (done && i === upto && c === 1) return cell(x, "found");
        const isCur = i === cur && c === 3;
        const isSrc = cur !== undefined && i === cur - 1 && (c === 1 || c === 3);
        return cell(x, isCur ? "cur" : undefined, { src: isSrc || undefined });
      }),
    );
  const steps: TableStep[] = [];
  steps.push({
    colHead,
    rowHead: [1],
    cells: [[cell(A), cell(B), cell(undefined), cell(undefined)]],
    caption:
      v === "gcd"
        ? "Find the greatest common divisor of 1071 and 462: the largest number that divides both. Each row divides a by b: a = q · b + r, where q is how many times b fits and r is the remainder."
        : "Now the slowest case for Euclid: two Fibonacci numbers in a row, 89 and 55. (Each Fibonacci number is the sum of the two before it: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89.)",
    readout: `gcd(${A}, ${B}) = gcd(${B}, ${A} % ${B})`,
  });
  rowsData.forEach(([ra, rb, q, r], i) => {
    steps.push({
      colHead,
      rowHead: head(i + 1),
      cells: grid(i, i),
      caption:
        i === 0
          ? `${ra} = ${q} · ${rb} + ${r}. Any number that divides ${ra} and ${rb} also divides ${r} = ${ra} − ${q} · ${rb}, and the other way round. So the next row works on ${rb} and ${r} instead.`
          : r === 0
            ? `${ra} = ${q} · ${rb} + 0. The remainder is 0, so ${rb} divides ${ra}, and the common divisors of ${ra} and ${rb} are just the divisors of ${rb}.`
            : v === "slow"
              ? `${ra} = 1 · ${rb} + ${r}. The quotient is 1 again: each step takes away only one copy of b, and the numbers shrink as slowly as they can.`
              : `The new a and b are the old b and r (dashed). ${ra} = ${q} · ${rb} + ${r}.`,
      readout: `${ra} % ${rb} = ${r}`,
    });
  });
  const g = rowsData[rowsData.length - 1][1];
  steps.push({
    colHead,
    rowHead: head(rowsData.length),
    cells: grid(rowsData.length - 1, undefined, true),
    caption:
      v === "gcd"
        ? `The last b is the answer: gcd(1071, 462) = ${g}. Three divisions were enough. Python: \`math.gcd(1071, 462)\`.`
        : `gcd(89, 55) = 1, after ${rowsData.length} divisions. Fibonacci numbers are the worst case: the number of steps is at most about 5 times the number of digits of the smaller number.`,
    readout: `gcd(${A}, ${B}) = ${g}`,
    verdict: { ok: true, text: `gcd = ${g}` },
  });
  return steps;
}

function extSteps(): TableStep[] {
  const A = 240;
  const B = 46;
  type Row = { r: number; q?: number; x: number; y: number };
  const rs: Row[] = [
    { r: A, x: 1, y: 0 },
    { r: B, x: 0, y: 1 },
  ];
  while (rs[rs.length - 1].r !== 0) {
    const p = rs[rs.length - 2];
    const c = rs[rs.length - 1];
    const q = Math.floor(p.r / c.r);
    rs.push({ r: p.r - q * c.r, q, x: p.x - q * c.x, y: p.y - q * c.y });
  }
  const colHead = ["r", "q", "x", "y"];
  const grid = (upto: number, cur?: number, found?: number): GCell[][] =>
    rs.slice(0, upto + 1).map((row, i) => {
      const s: Mark | undefined = i === found ? "found" : i === cur ? "cur" : undefined;
      const src = cur !== undefined && (i === cur - 1 || i === cur - 2) ? true : undefined;
      return [
        cell(row.r, s, { src }),
        cell(row.q === undefined ? "" : row.q, s === "cur" ? "cur" : undefined),
        cell(fmt(row.x), s, { src }),
        cell(fmt(row.y), s, { src }),
      ];
    });
  const steps: TableStep[] = [];
  steps.push({
    colHead,
    rowHead: [1, 2],
    cells: grid(1),
    caption:
      "The extended algorithm also finds x and y with 240 · x + 46 · y = gcd(240, 46). Every row keeps this rule: r = 240 · x + 46 · y. The first two rows are 240 = 240 · 1 + 46 · 0 and 46 = 240 · 0 + 46 · 1.",
    readout: "r = 240 · x + 46 · y on every row",
  });
  for (let i = 2; i < rs.length; i++) {
    const row = rs[i];
    const p = rs[i - 2];
    const c = rs[i - 1];
    steps.push({
      colHead,
      rowHead: Array.from({ length: i + 1 }, (_, k) => k + 1),
      cells: grid(i, i),
      caption:
        row.r === 0
          ? `${p.r} = ${row.q} · ${c.r} + 0: the remainder is 0, so the row above holds the gcd. This last row is not needed.`
          : `q = ${p.r} // ${c.r} = ${row.q}. Take q times the row above from the row two above, in every column: r = ${p.r} − ${row.q} · ${c.r} = ${row.r}, x = ${fmt(p.x)} − ${row.q} · ${par(c.x)} = ${fmt(row.x)}, y = ${fmt(p.y)} − ${row.q} · ${par(c.y)} = ${fmt(row.y)}. Both rows kept the rule, so this one does too.`,
      readout: row.r === 0 ? "remainder 0: stop" : `240 · ${par(row.x)} + 46 · ${par(row.y)} = ${row.r}`,
    });
  }
  const last = rs.length - 2;
  const g = rs[last];
  steps.push({
    colHead,
    rowHead: Array.from({ length: rs.length }, (_, k) => k + 1),
    cells: grid(rs.length - 1, undefined, last),
    caption: `gcd(240, 46) = ${g.r}, and its row gives x = ${fmt(g.x)} and y = ${g.y}: 240 · (${fmt(g.x)}) + 46 · ${g.y} = −2160 + 2162 = 2. Only the last two rows are needed at any time, so a loop keeps six numbers.`,
    readout: `240 · (${fmt(g.x)}) + 46 · ${g.y} = ${g.r}`,
    verdict: { ok: true, text: `gcd = ${g.r} = 240x + 46y` },
  });
  return steps;
}

/* ---------------------------------------------------------------- MATH-2.1: a clock of 7 */

export type ClockVariant = "add" | "neg" | "times";
export const CLOCK = 7;

export type ClockStep = { values: (number | string)[]; states: CellState[]; pointers: Pointer[]; caption: string; readout?: string; verdict?: Verdict };

export function clockSteps(v: ClockVariant): ClockStep[] {
  const m = CLOCK;
  const mod = (x: number) => ((x % m) + m) % m;
  const base = Array.from({ length: m }, (_, k) => k);
  const at = (x: number, label: string | number, extra: Partial<ClockStep> = {}): ClockStep => ({
    values: base,
    states: base.map((k) => (k === mod(x) ? "mid" : "")),
    pointers: [{ name: "x", at: mod(x), show: label }],
    caption: "",
    ...extra,
  });
  const steps: ClockStep[] = [];
  if (v === "add") {
    steps.push(at(5, 5, { caption: "Remainders after dividing by 7 go round like a clock with 7 places, 0 to 6. Start at 5. The train shows the true number; the cell above it is its remainder.", readout: "5 % 7 = 5" }));
    for (let k = 1; k <= 4; k++) {
      const x = 5 + k;
      steps.push(
        at(x, x, {
          caption:
            mod(x) === 0
              ? "Add 1 more: 7 has remainder 0. Past 6 the clock goes back to 0, because 7 is a whole multiple of 7."
              : k === 4
                ? "Add the last 1: 9 has remainder 2. So 5 + 4 lands on 2."
                : `Add 1: ${x} has remainder ${mod(x)}.`,
          readout: `${x} % 7 = ${mod(x)}`,
        }),
      );
    }
    steps.push(
      at(9, 9, {
        caption: "Adding 4 to 5 and then taking the remainder gives the same place as taking remainders first: (5 + 4) % 7 = 2. We write 9 ≡ 2 (mod 7), read \"9 is congruent to 2 modulo 7\": both leave remainder 2.",
        readout: "9 ≡ 2 (mod 7)",
        verdict: { ok: true, text: "(5 + 4) % 7 = 2" },
      }),
    );
    return steps;
  }
  if (v === "neg") {
    steps.push(at(0, 0, { caption: "Negative numbers sit on the same clock. Start at 0 and go back 3 places.", readout: "0 % 7 = 0" }));
    for (let k = 1; k <= 3; k++) {
      const x = -k;
      steps.push(
        at(x, x, {
          caption: k === 1 ? "One place back from 0 is 6: −1 has remainder 6, because −1 = −1 · 7 + 6." : `${x < 0 ? `−${-x}` : x} has remainder ${mod(x)}.`,
          readout: `${x} % 7 = ${mod(x)}`,
        }),
      );
    }
    steps.push(
      at(-3, -3, {
        caption:
          "In Python, `-3 % 7` is 4 and `-3 // 7` is −1, because −3 = −1 · 7 + 4. A remainder after dividing by a positive m is always 0 to m − 1. C, Java and JavaScript give −3 here instead, so they need ((x % m) + m) % m.",
        readout: "-3 = -1 · 7 + 4",
        verdict: { ok: true, text: "-3 % 7 = 4" },
      }),
    );
    return steps;
  }
  const seen: (number | string)[] = base.map(() => "");
  const visitStates = (cur: number): CellState[] => base.map((k) => (k === cur ? "mid" : ""));
  steps.push({
    values: [...seen],
    states: base.map(() => ""),
    pointers: [{ name: "3k", at: null }],
    caption: "Now multiply: where does 3 · k land, for k = 0, 1, 2, …, 6? Each cell will show the k that lands on it. The blue plates are the remainders.",
    readout: "3 · k % 7",
  });
  for (let k = 0; k < m; k++) {
    const r = (3 * k) % m;
    seen[r] = k;
    steps.push({
      values: [...seen],
      states: visitStates(r),
      pointers: [{ name: "3k", at: r, show: 3 * k }],
      caption:
        k === 5
          ? "k = 5: 3 · 5 = 15 = 2 · 7 + 1, so it lands on 1. Multiplying by 5 undoes multiplying by 3: 5 is the inverse of 3 modulo 7 (lesson 5)."
          : `k = ${k}: 3 · ${k} = ${3 * k}, which has remainder ${r}.`,
      readout: `3 · ${k} % 7 = ${r}`,
    });
  }
  steps.push({
    values: [...seen],
    states: base.map(() => ""),
    pointers: [{ name: "3k", at: null }],
    caption:
      "The 7 multiples land on 7 different places: every remainder once. That happens because 3 and 7 have no common factor. Multiplying by 2 on a clock of 8 would only reach the even places.",
    readout: "0 3 6 2 5 1 4",
    verdict: { ok: true, text: "every remainder once" },
  });
  return steps;
}

/* ---------------------------------------------------------------- MATH-3.1: fast powers */

export type PowerVariant = "sq" | "mat";

export function powerSteps(v: PowerVariant): TableStep[] {
  return v === "sq" ? squareSteps() : matrixSteps();
}

function squareSteps(): TableStep[] {
  const X = 3;
  const N = 13;
  const M = 100;
  const places = 4;
  const bits = Array.from({ length: places }, (_, j) => (N >> (places - 1 - j)) & 1);
  const powers: number[] = [];
  const results: number[] = [];
  let p = X % M;
  let r = 1;
  for (let k = 0; k < places; k++) {
    powers.push(p);
    if ((N >> k) & 1) r = (r * p) % M;
    results.push(r);
    p = (p * p) % M;
  }
  const colHead = [3, 2, 1, 0];
  const rowHead = ["bit", "power", "result"];
  const col = (k: number) => places - 1 - k;
  const grid = (upto: number, cur?: number): GCell[][] => {
    const pow = Array.from({ length: places }, (_, j) => {
      const k = col(j);
      // the new power is pale; the result cell it feeds is the one heavy frame
      return cell(k <= upto ? powers[k] : undefined, k === cur ? "path" : undefined, { src: cur !== undefined && k === cur - 1 ? true : undefined });
    });
    const res = Array.from({ length: places }, (_, j) => {
      const k = col(j);
      return cell(k <= upto ? results[k] : undefined, k === cur ? "cur" : undefined);
    });
    const b = bits.map((x, j) => cell(x, col(j) === cur ? "path" : undefined));
    return [b, pow, res];
  };
  const steps: TableStep[] = [
    {
      colHead,
      rowHead,
      cells: grid(-1),
      caption:
        "Work out 3¹³ % 100 (3 to the power 13, then the remainder after dividing by 100). 13 in binary is 1101, so 3¹³ = 3⁸ · 3⁴ · 3¹. The powers 3¹, 3², 3⁴, 3⁸ each come from squaring the one before.",
      readout: "13 = 8 + 4 + 1 = 1101",
    },
  ];
  const prevP = (k: number) => (k ? powers[k - 1] : X);
  for (let k = 0; k < places; k++) {
    const bit = (N >> k) & 1;
    const sq = k === 0 ? "" : `Square the power before it: ${prevP(k)} · ${prevP(k)} = ${prevP(k) * prevP(k)}, which is ${powers[k]} after % 100. `;
    steps.push({
      colHead,
      rowHead,
      cells: grid(k, k),
      caption:
        k === 0
          ? "Place 0: the power is 3¹ = 3. The bit is 1, so multiply it into the result: 1 · 3 = 3."
          : `Place ${k}: ${sq}The bit is ${bit}, so ${bit ? `multiply: ${results[k - 1]} · ${powers[k]} = ${results[k - 1] * powers[k]}, which is ${results[k]} after % 100.` : "the result stays as it is."}`,
      readout: bit ? `result = ${results[k]}` : "bit 0: no multiply",
    });
  }
  steps.push({
    colHead,
    rowHead,
    cells: grid(places - 1),
    caption:
      "3¹³ = 1,594,323, and its last two digits are 23. That took 3 squarings and 3 multiplications instead of 12 multiplications, and no number ever reached 100 · 100. Python: `pow(3, 13, 100)`.",
    readout: "pow(3, 13, 100) = 23",
    verdict: { ok: true, text: "3¹³ % 100 = 23" },
  });
  return steps;
}

function matrixSteps(): TableStep[] {
  const fib = [0, 1];
  for (let i = 2; i <= 15; i++) fib.push(fib[i - 1] + fib[i - 2]);
  const row = (k: number) => [fib[k + 1], fib[k], fib[k - 1]];
  const powers = [1, 2, 4, 8];
  const results = [1, 5, 13];
  const colHead = ["k+1", "k", "k−1"];
  const rowHead: (string | number)[] = ["M¹", "M²", "M⁴", "M⁸", "result"];
  const grid = (pUpto: number, rRes?: number, cur?: "p" | "r", srcRows: number[] = []): GCell[][] => [
    ...powers.map((k, i) =>
      row(k).map((x) => cell(i <= pUpto ? x : undefined, cur === "p" && i === pUpto ? "path" : undefined, { src: srcRows.includes(i) || undefined })),
    ),
    (rRes === undefined ? [undefined, undefined, undefined] : row(results[rRes])).map((x) => cell(x, cur === "r" ? "path" : rRes === 2 ? "found" : undefined)),
  ];
  return [
    {
      colHead,
      rowHead,
      cells: grid(0),
      caption:
        "The same idea works for anything you can multiply, such as matrices (square tables of numbers). M is the 2 × 2 matrix with rows (1, 1) and (1, 0). Its power Mᵏ has rows (F(k+1), F(k)) and (F(k), F(k−1)), where F are the Fibonacci numbers. Each row here lists F(k+1), F(k) and F(k−1): the column plates give the Fibonacci number's position.",
      readout: "M¹ = (1 1 / 1 0)",
    },
    { colHead, rowHead, cells: grid(1, undefined, "p", [0]), caption: "Square M¹ to get M²: F(3), F(2), F(1) = 2, 1, 1.", readout: "M² = M¹ · M¹" },
    { colHead, rowHead, cells: grid(2, undefined, "p", [1]), caption: "Square M² to get M⁴: 5, 3, 2.", readout: "M⁴ = M² · M²" },
    { colHead, rowHead, cells: grid(3, undefined, "p", [2]), caption: "Square M⁴ to get M⁸: 34, 21, 13. Each squaring doubles k.", readout: "M⁸ = M⁴ · M⁴" },
    {
      colHead,
      rowHead,
      cells: grid(3, 0, "r", [0]),
      caption: "Now F(13). 13 = 8 + 4 + 1, so M¹³ = M⁸ · M⁴ · M¹. Start the result with M¹.",
      readout: "result = M¹",
    },
    { colHead, rowHead, cells: grid(3, 1, "r", [2]), caption: "Multiply by M⁴: M¹ · M⁴ = M⁵, which holds F(6), F(5), F(4) = 8, 5, 3.", readout: "result = M⁵" },
    { colHead, rowHead, cells: grid(3, 2, "r", [3]), caption: "Multiply by M⁸: M⁵ · M⁸ = M¹³, which holds 377, 233, 144.", readout: "result = M¹³" },
    {
      colHead,
      rowHead,
      cells: grid(3, 2),
      caption:
        "F(13) = 233, after 3 squarings and 2 more products. For F(10¹⁸) the same takes about 60 squarings of a 2 × 2 matrix, with % m after every product to keep the numbers small.",
      readout: "F(13) = 233",
      verdict: { ok: true, text: "F(13) = 233" },
    },
  ];
}

/* ---------------------------------------------------------------- MATH-4.1: the sieve of Eratosthenes */

export type SieveVariant = "cross" | "spf";
export const SIEVE_N = 48;
const SIEVE_COLS = 8;

export function sieveSteps(v: SieveVariant): TableStep[] {
  const N = SIEVE_N;
  const out = new Set<number>([1]);
  const spf = new Map<number, number>();
  const primes: number[] = [];
  const grid = (o: { cur?: number; fresh?: Set<number>; primesDone?: boolean; path?: number[] } = {}): GCell[][] =>
    Array.from({ length: N / SIEVE_COLS }, (_, r) =>
      Array.from({ length: SIEVE_COLS }, (_, c) => {
        const x = r * SIEVE_COLS + c + 1;
        const isPrime = primes.includes(x) || (o.primesDone && !out.has(x));
        const s: Mark | "path" | undefined = o.path?.includes(x)
          ? "path"
          : x === o.cur
            ? "cur"
            : out.has(x)
              ? "out"
              : isPrime
                ? "done"
                : undefined;
        return cell(x, s, { src: o.fresh?.has(x) || undefined, tag: v === "spf" && out.has(x) ? spf.get(x) : undefined });
      }),
    );
  const steps: TableStep[] = [];
  steps.push({
    cells: grid(),
    caption:
      v === "cross"
        ? "Find every prime up to 48. A prime is a whole number above 1 whose only divisors are 1 and itself. 1 is not prime, so it starts crossed out (hatched)."
        : "The same sieve can remember why each number was crossed out: the small number in the corner of a crossed cell is its smallest prime factor.",
    readout: "numbers 1 to 48",
  });
  for (const p of [2, 3, 5]) {
    primes.push(p);
    if (v === "spf") spf.set(p, p);
    steps.push({
      cells: grid({ cur: p }),
      caption: `${p} is not crossed out, so no smaller prime divides it: ${p} is prime.`,
      readout: `prime: ${p}`,
    });
    const fresh = new Set<number>();
    for (let x = p * p; x <= N; x += p) {
      if (!out.has(x)) {
        fresh.add(x);
        out.add(x);
        spf.set(x, p);
      }
    }
    const list = [...fresh];
    steps.push({
      cells: grid({ cur: p, fresh }),
      caption:
        p === 2
          ? "Cross out the multiples of 2, starting from 2 · 2 = 4: 4, 6, 8, …, 48 (dashed). Each has 2 as a divisor, so none of them is prime."
          : `Cross out the multiples of ${p}, starting from ${p} · ${p} = ${p * p}. Smaller multiples such as ${p * 2} already have a smaller prime factor, so they are crossed out already. New this time: ${list.join(", ")}.`,
      readout: `${p}² = ${p * p}: ${list.length} new`,
    });
  }
  primes.push(7);
  if (v === "spf") spf.set(7, 7);
  steps.push({
    cells: grid({ cur: 7 }),
    caption:
      "7 is prime, but 7 · 7 = 49 is past 48, so it has nothing new to cross out. Any number up to 48 with a factor is crossed out already: its smallest prime factor is at most √48, which is about 6.9. So stop here.",
    readout: "7² = 49 > 48: stop",
  });
  for (let x = 2; x <= N; x++) if (!out.has(x) && v === "spf") spf.set(x, x);
  if (v === "cross") {
    steps.push({
      cells: grid({ primesDone: true }),
      caption:
        "Every number left is prime: 15 primes up to 48 (ink). The work was about n · (1/2 + 1/3 + 1/5) crossings, and the sum over primes grows only like log log n, so the sieve is O(n log log n).",
      readout: "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47",
      verdict: { ok: true, text: "15 primes" },
    });
  } else {
    steps.push({
      cells: grid({ primesDone: true, path: [45, 15, 5] }),
      caption:
        "Factorise 45 with the corner numbers: 45 has 3, and 45 / 3 = 15; 15 has 3, and 15 / 3 = 5; 5 is prime. So 45 = 3 · 3 · 5, in one division per factor.",
      readout: "45 → 15 → 5: 45 = 3 · 3 · 5",
      verdict: { ok: true, text: "45 = 3 · 3 · 5" },
    });
  }
  return steps;
}

/* ---------------------------------------------------------------- MATH-5.1: inverses and two clocks */

export type InvVariant = "seven" | "eight" | "clocks";

export function invSteps(v: InvVariant): TableStep[] {
  if (v === "clocks") return clockPairSteps();
  const m = v === "seven" ? 7 : 8;
  const n = m - 1;
  const head = Array.from({ length: n }, (_, k) => k + 1);
  const grid = (upto: number, cur?: number): GCell[][] =>
    head.map((a, i) =>
      head.map((x) => {
        const val = (a * x) % m;
        if (i > upto) return cell(undefined);
        return cell(val, val === 1 ? "found" : i === cur ? "path" : undefined);
      }),
    );
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const steps: TableStep[] = [];
  steps.push({
    colHead: head,
    rowHead: head,
    cells: grid(-1),
    caption: `The table of a · x % ${m}: row a, column x. An inverse of a is an x with a · x % ${m} = 1. It lets you "divide by a": multiply by x instead.`,
    readout: `a · x % ${m}`,
  });
  for (let i = 0; i < n; i++) {
    const a = i + 1;
    const inv = head.find((x) => (a * x) % m === 1);
    steps.push({
      colHead: head,
      rowHead: head,
      cells: grid(i, i),
      caption:
        inv !== undefined
          ? `Row ${a}: ${a} · ${inv} = ${a * inv}, which leaves 1, so the inverse of ${a} is ${inv}.${m === 7 ? ` The row holds every remainder 1 to 6 once.` : ""}`
          : `Row ${a}: no 1 at all. ${a} and ${m} share the factor ${gcd(a, m)}, so every a · x is a multiple of ${gcd(a, m)} plus a multiple of ${m}: never 1. ${a} has no inverse.`,
      readout: inv !== undefined ? `${a} · ${inv} ≡ 1 (mod ${m})` : `gcd(${a}, ${m}) = ${gcd(a, m)}: no inverse`,
    });
  }
  steps.push({
    colHead: head,
    rowHead: head,
    cells: grid(n - 1),
    caption:
      m === 7
        ? "7 is prime, so every a from 1 to 6 has exactly one inverse. Each row is the numbers 1 to 6 in a new order; lesson 5 uses this to prove Fermat's rule."
        : "Only 1, 3, 5 and 7 have inverses modulo 8: the numbers with no common factor with 8. In general, a has an inverse modulo m exactly when gcd(a, m) = 1.",
    readout: m === 7 ? "inverses: 1↔1 2↔4 3↔5 6↔6" : "inverses: 1↔1 3↔3 5↔5 7↔7",
    verdict: { ok: true, info: m === 8, text: m === 7 ? "every row has one 1" : "only odd a have inverses" },
  });
  return steps;
}

function clockPairSteps(): TableStep[] {
  const A = 3;
  const B = 5;
  const placed = new Map<string, number>();
  const grid = (cur?: number, found?: number): GCell[][] =>
    Array.from({ length: A }, (_, r) =>
      Array.from({ length: B }, (_, c) => {
        const x = placed.get(`${r},${c}`);
        return cell(x, x !== undefined && x === found ? "found" : x !== undefined && x === cur ? "cur" : undefined);
      }),
    );
  const rowHead = [0, 1, 2];
  const colHead = [0, 1, 2, 3, 4];
  const steps: TableStep[] = [];
  steps.push({
    rowHead,
    colHead,
    cells: grid(),
    caption: "Two clocks at once: row = x % 3, column = x % 5. Put each x from 0 to 14 in its cell. Does any cell get two numbers, or none?",
    readout: "row x % 3, column x % 5",
  });
  const groups = [[0], [1], [2], [3], [4], [5], [6, 7, 8], [9, 10, 11], [12, 13, 14]];
  for (const g of groups) {
    for (const x of g) placed.set(`${x % A},${x % B}`, x);
    const x = g[g.length - 1];
    steps.push({
      rowHead,
      colHead,
      cells: grid(x),
      caption:
        g.length === 1
          ? x === 3
            ? "3 % 3 = 0 and 3 % 5 = 3: back to row 0, in a new column. Each step moves one row down and one column right, wrapping round."
            : `${x} % 3 = ${x % A} and ${x} % 5 = ${x % B}.`
          : `${g.join(", ")}: each lands in a cell that is still empty.`,
      readout: g.map((y) => `${y} → (${y % A}, ${y % B})`).join("  "),
    });
  }
  steps.push({
    rowHead,
    colHead,
    cells: grid(undefined, 8),
    caption:
      "All 15 cells are filled, each exactly once. So for any remainders, one x from 0 to 14 has both: x % 3 = 2 and x % 5 = 3 gives 8. This is the Chinese remainder theorem. With clocks of 4 and 6, which share the factor 2, x would only reach 12 of the 24 cells.",
    readout: "x % 3 = 2, x % 5 = 3 → x = 8",
    verdict: { ok: true, text: "one x for every pair" },
  });
  return steps;
}

/* ---------------------------------------------------------------- MATH-6.1: Pascal's triangle */

export type PascalVariant = "rows" | "odd";
export const PASCAL_N = 8;

export function pascalSteps(v: PascalVariant): TableStep[] {
  const N = PASCAL_N;
  const C: number[][] = [];
  for (let n = 0; n < N; n++) {
    C.push([]);
    for (let k = 0; k <= n; k++) C[n].push(k === 0 || k === n ? 1 : C[n - 1][k - 1] + C[n - 1][k]);
  }
  const head = Array.from({ length: N }, (_, k) => k);
  const grid = (upto: number, cur?: [number, number], allDone = false): GCell[][] =>
    head.map((n) =>
      head.map((k) => {
        if (k > n || n > upto) return cell(undefined);
        const val = v === "odd" ? C[n][k] % 2 : C[n][k];
        const from: GFrom[] | undefined = v === "rows" && k > 0 && k < n ? ["diag", "up"] : undefined;
        const isCur = cur !== undefined && cur[0] === n && cur[1] === k;
        const isSrc = cur !== undefined && n === cur[0] - 1 && (k === cur[1] || k === cur[1] - 1);
        const s: Mark | undefined = isCur ? "cur" : v === "odd" && val === 1 ? "done" : allDone && v === "rows" && n === 7 && k === 3 ? "found" : undefined;
        return cell(val, s, { from, src: isSrc || undefined });
      }),
    );
  const steps: TableStep[] = [];
  const example: Record<number, number> = { 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3 };
  steps.push({
    colHead: head,
    rowHead: head,
    cells: grid(-1),
    caption:
      v === "rows"
        ? "C(n, k), read “n choose k”, is the number of ways to choose k items from n. Row n, column k of this table will hold it. Each cell inside is the sum of the cell above and the cell above-left."
        : "The same triangle, keeping only whether each number is odd (1, ink) or even (0). This is the triangle modulo 2.",
    readout: "C(n, k) = C(n − 1, k − 1) + C(n − 1, k)",
  });
  for (let n = 0; n < N; n++) {
    const k = example[n];
    steps.push({
      colHead: head,
      rowHead: head,
      cells: grid(n, k !== undefined ? [n, k] : undefined),
      caption:
        n === 0
          ? "Row 0: one way to choose nothing from nothing."
          : n === 1
            ? "Row 1: choosing 0 or 1 items from 1 item, one way each. Every row starts and ends with 1."
            : v === "rows"
              ? `Row ${n}: C(${n}, ${k}) = C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${C[n - 1][k - 1]} + ${C[n - 1][k]} = ${C[n][k]} (dashed: the two cells it adds). Of the ways to choose ${k} of ${n} items, ${C[n - 1][k - 1]} take the last item and ${C[n - 1][k]} leave it.`
              : `Row ${n}: ${C[n].map((x) => x % 2).join(" ")}. The parity of a sum is fixed by the parities of the two cells above.`,
      readout: v === "rows" ? `row ${n}: ${C[n].join(" ")}` : `row ${n}: ${C[n].map((x) => x % 2).join(" ")}`,
    });
  }
  steps.push({
    colHead: head,
    rowHead: head,
    cells: grid(N - 1, undefined, true),
    caption:
      v === "rows"
        ? "Each row adds up to 2ⁿ (2 to the power n), the number of subsets of n items. For example C(7, 3) = 35. Filled this way, with % m on each sum, the table gives C(n, k) % m for any m, in O(n²) steps."
        : "C(n, k) is odd exactly when every 1 bit of k is also a 1 bit of n, that is, when `k & n == k` (BITS-5). Row 5 is 101 in binary: k = 0, 1, 4, 5 are odd. This is Lucas's theorem for the prime 2.",
    readout: v === "rows" ? "row 7: 1 7 21 35 35 21 7 1, sum 128" : "row 5: odd at k = 0, 1, 4, 5",
    verdict: { ok: true, text: v === "rows" ? "rows sum to 2ⁿ" : "odd ⇔ k & n == k" },
  });
  return steps;
}

/* ---------------------------------------------------------------- MATH-7.1: fair shuffles and samples */

export type ChanceVariant = "fy" | "count" | "res";
export const ORDERS = ["abc", "acb", "bac", "bca", "cab", "cba"];

export function chanceSteps(v: ChanceVariant): TableStep[] {
  if (v === "fy") return fySteps();
  if (v === "count") return countSteps();
  return resSteps();
}

function fySteps(): TableStep[] {
  let a = ["a", "b", "c", "d", "e"];
  const picks = [2, 3, 0, 1];
  const n = a.length;
  const colHead = [0, 1, 2, 3, 4];
  const row = (settledFrom: number, i?: number, j?: number): GCell[][] => [
    a.map((x, k) => cell(x, k === i ? "cur" : k >= settledFrom ? "done" : undefined, { src: k === j && j !== i ? true : undefined })),
  ];
  const steps: TableStep[] = [
    {
      colHead,
      rowHead: [null],
      cells: row(n),
      caption:
        "Fisher–Yates shuffle: for i from the last place down to 1, pick j at random from 0 to i, and swap places i and j. Here the random picks are fixed in advance, so you can follow them.",
      readout: "for i = 4, 3, 2, 1: j = random from 0 to i",
    },
  ];
  for (let t = 0; t < picks.length; t++) {
    const i = n - 1 - t;
    const j = picks[t];
    const before = [...a];
    a = [...a];
    [a[i], a[j]] = [a[j], a[i]];
    steps.push({
      colHead,
      rowHead: [null],
      cells: row(i + 1, i, j),
      caption:
        i === j
          ? `i = ${i}: the pick is j = ${j}, the same place, so ${a[i]} stays. Staying must be possible, or the shuffle could never leave an item where it was.`
          : `i = ${i}: the pick is j = ${j} out of ${i + 1} choices (0 to ${i}). Swap ${before[i]} and ${before[j]}. Place ${i} is now final (ink): it never moves again.`,
      readout: `i = ${i}, j = ${j}: ${a.join(" ")}`,
    });
  }
  steps.push({
    colHead,
    rowHead: [null],
    cells: row(0),
    caption:
      "Done: e b a d c. There were 5 · 4 · 3 · 2 = 120 possible runs of picks, and each gives a different order, so each of the 120 orders has the same chance, 1/120. Python's `random.shuffle` does exactly this.",
    readout: "5 · 4 · 3 · 2 = 120 runs, 120 orders",
    verdict: { ok: true, text: "every order equally likely" },
  });
  return steps;
}

function countSteps(): TableStep[] {
  const shuffle = (choices: number[], fair: boolean) => {
    const a = ["a", "b", "c"];
    if (fair) {
      for (let t = 0; t < 2; t++) {
        const i = 2 - t;
        const j = choices[t];
        [a[i], a[j]] = [a[j], a[i]];
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const j = choices[i];
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return a.join("");
  };
  const fair = ORDERS.map(() => 0);
  for (let j0 = 0; j0 < 3; j0++) for (let j1 = 0; j1 < 2; j1++) fair[ORDERS.indexOf(shuffle([j0, j1], true))]++;
  const anyBy: number[][] = [];
  const any = ORDERS.map(() => 0);
  for (let j0 = 0; j0 < 3; j0++) {
    for (let j1 = 0; j1 < 3; j1++) for (let j2 = 0; j2 < 3; j2++) any[ORDERS.indexOf(shuffle([j0, j1, j2], false))]++;
    anyBy.push([...any]);
  }
  const rowHead = ["fair", "any"];
  const grid = (f?: number[], a?: number[], curRow?: number, badAll = false): GCell[][] => [
    // a row being counted is pale, not a row of heavy frames
    ORDERS.map((_, k) => cell(f?.[k], curRow === 0 ? "path" : f ? "done" : undefined)),
    ORDERS.map((_, k) => cell(a?.[k], curRow === 1 && !badAll ? "path" : undefined)),
  ];
  return [
    {
      colHead: ORDERS,
      rowHead,
      cells: grid(),
      caption:
        "Count how often each order of a, b, c comes out, over every possible run of random picks. Row \"fair\" is Fisher–Yates. Row \"any\" is a common mistake: for every place i, swap it with a random place from all 3.",
      readout: "6 orders",
    },
    {
      colHead: ORDERS,
      rowHead,
      cells: grid(fair, undefined, 0),
      caption: "Fisher–Yates makes 3 · 2 = 6 runs of picks, and each order comes out exactly once.",
      readout: "fair: 1 1 1 1 1 1 (6 runs)",
    },
    ...anyBy.map((counts, j0) => ({
      colHead: ORDERS,
      rowHead,
      cells: grid(fair, counts, 1),
      caption:
        j0 === 0
          ? "The mistake makes 3 · 3 · 3 = 27 runs. These are the 9 runs whose first pick is 0."
          : `Add the 9 runs whose first pick is ${j0}.`,
      readout: `any: ${counts.join(" ")} (${9 * (j0 + 1)} runs)`,
    })),
    {
      colHead: ORDERS,
      rowHead,
      cells: grid(fair, any, undefined, true),
      caption:
        "27 runs cannot be shared equally among 6 orders, because 27 is not a multiple of 6. abc, cab and cba come out 4 times, the others 5 times: the mistake is not fair. With n items it makes nⁿ runs, which is never a multiple of n! for n above 2.",
      readout: `any: ${any.join(" ")}`,
      verdict: { ok: false, text: "not equally likely" },
    },
  ];
}

function resSteps(): TableStep[] {
  const items = ["a", "b", "c", "d", "e", "f"];
  const k = 2;
  const picks = [1, 0, 3, 2];
  const kept: string[] = [];
  const colHead = items.map((_, i) => i);
  const steps: TableStep[] = [];
  const grid = (i: number): GCell[][] => [items.map((x, t) => cell(x, t === i ? "cur" : t > i ? undefined : kept.includes(x) ? "done" : "out"))];
  const slots = (j?: number): GCell[][] => [Array.from({ length: k }, (_, s) => cell(kept[s], j === s ? "cur" : undefined))];
  steps.push({
    colHead,
    rowHead: [null],
    cells: [items.map((x) => cell(x))],
    kept: slots(),
    caption:
      "Reservoir sampling: keep 2 items chosen fairly from a stream whose length you do not know in advance. The kept row has 2 slots. The random picks are fixed in advance here.",
    readout: "k = 2 slots",
  });
  for (let i = 0; i < items.length; i++) {
    let caption: string;
    let j: number | undefined;
    if (i < k) {
      kept[i] = items[i];
      j = i;
      caption = `Item ${i} (${items[i]}) goes straight into slot ${i}: the first k items are always kept at first.`;
    } else {
      j = picks[i - k];
      if (j < k) {
        caption = `Item ${i} (${items[i]}): pick j from 0 to ${i}; it is ${j}, which is below 2, so ${items[i]} replaces slot ${j} (${kept[j]}). Chance of keeping ${items[i]}: 2 in ${i + 1}.`;
        kept[j] = items[i];
      } else {
        caption = `Item ${i} (${items[i]}): pick j from 0 to ${i}; it is ${j}, not below 2, so ${items[i]} is skipped (hatched).`;
        j = undefined;
      }
    }
    steps.push({ colHead, rowHead: [null], cells: grid(i), kept: slots(j), caption, readout: `kept: ${kept.join(", ")}  ·  chance ${Math.min(k, i + 1)}/${i + 1}` });
  }
  steps.push({
    colHead,
    rowHead: [null],
    cells: grid(items.length),
    kept: slots(),
    caption:
      "The sample is d and c. Each of the 6 items had the same chance, 2 in 6, of ending up in it, though the stream was read once and only 2 items were ever stored. Lesson 7 proves this; MATH-P7 asks for the code.",
    readout: "each item kept with chance 2/6",
    verdict: { ok: true, text: "a fair sample of 2" },
  });
  return steps;
}
