// Step generators for the BITS figures. Every figure is a pure function of its step number.
// A row of bits is a Grid row, written highest place first, as Python prints binary. The plate over each
// bit is its place number, so place 0 is at the right (decided once for the station). Captions use `backticks` for code.

import type { GCell, Mark } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };

export type BitStep = {
  cells: GCell[][];
  rowHead: (string | number | null)[];
  colHead?: (string | number)[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export const PLACES8 = [7, 6, 5, 4, 3, 2, 1, 0];

/** The lowest w bits of x, highest place first (Python's & works on negative numbers as two's complement). */
export function bitsOf(x: number, w = 8): number[] {
  return Array.from({ length: w }, (_, j) => (x >> (w - 1 - j)) & 1);
}

const str = (bits: number[]) => bits.join("");
const col = (place: number, w = 8) => w - 1 - place;

type RowSpec = { v: (number | string | undefined)[]; s?: (Mark | "path" | undefined)[]; src?: boolean[] };

function rows(spec: RowSpec[]): GCell[][] {
  return spec.map((r) =>
    r.v.map((v, c) => ({ v, s: r.s?.[c] || undefined, src: r.src?.[c] || undefined, small: String(v ?? "").length >= 4 || undefined })),
  );
}

const blank = (w = 8) => Array<number | undefined>(w).fill(undefined);
const all = <T,>(w: number, v: T) => Array<T>(w).fill(v);
const only = (w: number, c: number, s: Mark | "path") => Array.from({ length: w }, (_, k) => (k === c ? s : undefined));

/* ---------------------------------------------------------------- BITS-1.1: writing numbers in binary */

export type BinVariant = "halve" | "neg" | "over";
const WORTH = [128, 64, 32, 16, 8, 4, 2, 1];
const WORTH_SIGNED: (number | string)[] = ["−128", 64, 32, 16, 8, 4, 2, 1];

export function binSteps(v: BinVariant): BitStep[] {
  if (v === "halve") return halveSteps();
  if (v === "neg") return negSteps();
  return overSteps();
}

function halveSteps(): BitStep[] {
  const X = 45;
  const steps: BitStep[] = [];
  const bits = blank();
  const head = ["worth", "bits"];
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH }, { v: [...bits] }]),
    caption:
      "Write 45 in binary, with 8 places. Each place is worth twice the place on its right: 1, 2, 4, 8, and so on. The plate over each place is its number, so place 0 is at the right.",
    readout: "left to write: 45",
  });
  let n = X;
  let place = 0;
  while (n > 0) {
    const b = n % 2;
    const c = col(place);
    bits[c] = b;
    const next = Math.floor(n / 2);
    steps.push({
      rowHead: head,
      cells: rows([
        { v: WORTH, src: only(8, c, "cur").map((s) => s === "cur") },
        { v: [...bits], s: only(8, c, "cur") },
      ]),
      caption:
        place === 0
          ? `45 is odd, so place 0 holds 1. Now halve and round down: \`45 // 2\` is 22. The places from 1 upwards must now make 22.`
          : `${n} is ${b ? "odd" : "even"}, so place ${place} holds ${b}. Halve and round down: \`${n} // 2\` is ${next}.`,
      readout: `${n} % 2 = ${b}   ·   ${n} // 2 = ${next}`,
    });
    n = next;
    place++;
  }
  for (let p = place; p < 8; p++) bits[col(p)] = 0;
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH }, { v: [...bits], s: bits.map((_, c) => (c <= col(place) ? "cur" : undefined)) }]),
    caption: `Nothing is left, so places ${place} and 7 hold 0. Six halvings were enough: a number below 2⁶ = 64 needs 6 places.`,
    readout: "left to write: 0",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH, s: bits.map((b) => (b ? "path" : undefined)) }, { v: [...bits], s: bits.map((b) => (b ? "done" : undefined)) }]),
    caption: "Read it back: add the worth of every place that holds a 1. 32 + 8 + 4 + 1 = 45. In Python, `bin(45)` gives `'0b101101'`.",
    readout: "00101101 = 32 + 8 + 4 + 1 = 45",
    verdict: { ok: true, text: "45 = 0b101101" },
  });
  return steps;
}

function negSteps(): BitStep[] {
  const six = bitsOf(6);
  const flip = six.map((b) => 1 - b);
  const neg = bitsOf(-6);
  const head = ["worth", "6", "flip", "−6", "sum"];
  const E = blank();
  const steps: BitStep[] = [];
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH }, { v: six, s: all(8, "path") }, { v: E }, { v: E }, { v: E }]),
    caption: "Now a negative number: −6 in 8 bits. Start from 6, which is 00000110.",
    readout: "6 = 4 + 2",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH }, { v: six }, { v: flip, s: all(8, "path") }, { v: E }, { v: E }]),
    caption: "Flip every bit: each 0 becomes 1, and each 1 becomes 0. Python writes this as `~6`.",
    readout: "~00000110 = 11111001",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH }, { v: six }, { v: flip }, { v: neg, s: all(8, "path") }, { v: E }]),
    caption:
      "Add 1. Place 0 holds 1, so it becomes 0 and 1 carries into place 1. Place 1 holds 0, so it becomes 1 and the carry stops. This pattern is −6 in two's complement.",
    readout: "11111001 + 1 = 11111010",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH_SIGNED, s: only(8, 0, "cur") }, { v: six }, { v: flip }, { v: neg, s: neg.map((b) => (b ? "done" : undefined)) }, { v: E }]),
    caption:
      "Why is it −6? In two's complement the top place is worth −128 instead of +128. All the other places keep their usual worth. So 11111010 is −128 + 64 + 32 + 16 + 8 + 2 = −6.",
    readout: "−128 + 122 = −6",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH_SIGNED }, { v: six, s: all(8, "path") }, { v: flip }, { v: neg, s: all(8, "path") }, { v: all(8, 0), s: all(8, "done") }]),
    caption:
      "Check by adding 6 and −6 as plain bits. Every place carries 1 into the next, and the last carry leaves place 7. There is no place 8, so that carry is dropped. All 8 bits are 0.",
    readout: "00000110 + 11111010 = 1 00000000 → 00000000",
    verdict: { ok: true, text: "6 + (−6) = 0" },
  });
  return steps;
}

function overSteps(): BitStep[] {
  const a = bitsOf(127);
  const one = bitsOf(1);
  const s = bitsOf(128);
  const head = ["worth", "127", "1", "sum"];
  const steps: BitStep[] = [];
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH_SIGNED }, { v: a, s: all(8, "path") }, { v: one, s: all(8, "path") }, { v: blank() }]),
    caption: "8 bits in two's complement hold −128 to 127. Add 1 to 127, the largest.",
    readout: "01111111 + 00000001",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH_SIGNED, s: only(8, 0, "cur") }, { v: a }, { v: one }, { v: s, s: only(8, 0, "cur") }]),
    caption: "Every place carries, and the carry ends in place 7. The result is 10000000. Place 7 is worth −128, so the machine reads it as −128.",
    readout: "01111111 + 00000001 = 10000000",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: WORTH_SIGNED, src: only(8, 0, "cur").map((m) => !!m) }, { v: a }, { v: one }, { v: s, s: only(8, 0, "cur") }]),
    caption:
      "127 + 1 should be 128, but 128 does not fit in 8 bits, so the sum wraps round to −128. This is called overflow. Python's own whole numbers grow instead, so they never overflow.",
    readout: "127 + 1 → −128 in 8 bits",
    verdict: { ok: false, text: "overflow" },
  });
  return steps;
}

/* ---------------------------------------------------------------- BITS-2.1: bitwise operators */

export type OpVariant = "and" | "or" | "xor" | "shift";
const OX = 202;
const OY = 166;
const OP: Record<"and" | "or" | "xor", { sym: string; f: (a: number, b: number) => number; rule: (a: number, b: number) => string }> = {
  and: { sym: "&", f: (a, b) => a & b, rule: (a, b) => (a && b ? "both are 1, so 1" : "they are not both 1, so 0") },
  or: { sym: "|", f: (a, b) => a | b, rule: (a, b) => (a || b ? "at least one is 1, so 1" : "both are 0, so 0") },
  xor: { sym: "^", f: (a, b) => a ^ b, rule: (a, b) => (a !== b ? "they differ, so 1" : "they are the same, so 0") },
};

export function opSteps(v: OpVariant): BitStep[] {
  if (v === "shift") return shiftSteps();
  const op = OP[v];
  const x = bitsOf(OX);
  const y = bitsOf(OY);
  const z = x.map((b, c) => op.f(b, y[c]));
  const head = ["x", "y", `x ${op.sym} y`];
  const intro: Record<typeof v, string> = {
    and: "`x & y` (and) works place by place: a result bit is 1 only when the bits of x and y in that place are both 1.",
    or: "`x | y` (or) works place by place: a result bit is 1 when the bit of x or the bit of y in that place is 1, or both are.",
    xor: "`x ^ y` (exclusive or, XOR) works place by place: a result bit is 1 when the two bits differ. TRIE-5 used it to compare numbers.",
  };
  const steps: BitStep[] = [];
  const res = blank();
  steps.push({ rowHead: head, cells: rows([{ v: x }, { v: y }, { v: [...res] }]), caption: `${intro[v]} Here x is 202 and y is 166.`, readout: `x = ${str(x)}   y = ${str(y)}` });
  for (let p = 0; p < 8; p++) {
    const c = col(p);
    res[c] = z[c];
    const mark = only(8, c, "cur");
    steps.push({
      rowHead: head,
      // the result row being written is pale; the place being worked on is the one heavy frame
      cells: rows([{ v: x, src: mark.map((s) => !!s) }, { v: y, src: mark.map((s) => !!s) }, { v: [...res], s: mark.map((m) => m ?? "path") }]),
      caption: `Place ${p}: x has ${x[c]} and y has ${y[c]}; ${op.rule(x[c], y[c])}.`,
      readout: `${x[c]} ${op.sym} ${y[c]} = ${z[c]}`,
    });
  }
  const val = op.f(OX, OY);
  const end: Record<typeof v, string> = {
    and: "`&` keeps only the 1s that x and y share. With a mask as y, it keeps the places you choose and clears the rest (lesson 3).",
    or: "`|` collects the 1s of both. With a mask as y, it sets the places you choose to 1 and leaves the rest as they are.",
    xor: "`^` marks the places where x and y differ. Doing it twice undoes it: `(x ^ y) ^ y` is x again.",
  };
  steps.push({
    rowHead: head,
    cells: rows([{ v: x }, { v: y }, { v: z, s: z.map((b) => (b ? "done" : undefined)) }]),
    caption: `${end[v]} The result is ${str(z)}, which is ${val}.`,
    readout: `${OX} ${op.sym} ${OY} = ${val}`,
    verdict: { ok: true, text: `x ${op.sym} y = ${val}` },
  });
  return steps;
}

function shiftSteps(): BitStep[] {
  const X = 45;
  const x = bitsOf(X);
  const l = bitsOf(X << 2);
  const r = bitsOf(X >> 2);
  const head = ["x", "x << 2", "x >> 2"];
  const E = blank();
  return [
    {
      rowHead: head,
      cells: rows([{ v: x, s: all(8, "path") }, { v: E }, { v: E }]),
      caption: "Shifts move every bit of a number the same number of places. Here x is 45, which is 00101101.",
      readout: "x = 00101101 = 45",
    },
    {
      rowHead: head,
      cells: rows([{ v: x }, { v: l, s: l.map((_, c) => (c >= 6 ? "cur" : undefined)) }, { v: E }]),
      caption:
        "`x << 2` moves every bit 2 places to the left, and two 0s come in at the right. Each bit is now worth 4 times as much, so the value is 45 × 4 = 180.",
      readout: "45 << 2 = 180 = 45 × 2²",
    },
    {
      rowHead: head,
      cells: rows([{ v: x, s: x.map((_, c) => (c >= 6 ? "out" : undefined)) }, { v: l }, { v: r, s: r.map((_, c) => (c < 2 ? "cur" : undefined)) }]),
      caption:
        "`x >> 2` moves every bit 2 places to the right. The two lowest bits fall off the end (hatched), and 0s come in at the left. The value is 45 // 4 = 11: divide by 2² and round down.",
      readout: "45 >> 2 = 11 = 45 // 2²",
    },
    {
      rowHead: head,
      cells: rows([{ v: x }, { v: l }, { v: r }]),
      caption:
        "So `x << k` is `x * 2**k`, and `x >> k` is `x // 2**k`, for any whole number x, negative ones too. Python's numbers have no top place, so bits shifted left are never lost.",
      readout: "x << k = x · 2ᵏ   ·   x >> k = x // 2ᵏ",
      verdict: { ok: true, text: "shifts multiply and divide by powers of 2" },
    },
  ];
}

/* ---------------------------------------------------------------- BITS-3.1: masks */

export type MaskVariant = "one" | "drop" | "keep";

export function maskSteps(v: MaskVariant): BitStep[] {
  if (v === "one") return oneBitSteps();
  return lowSteps(v);
}

function oneBitSteps(): BitStep[] {
  const X = 0b10100110;
  const x = bitsOf(X);
  const head = ["x", "mask", "result"];
  const steps: BitStep[] = [];
  steps.push({
    rowHead: head,
    cells: rows([{ v: x, s: all(8, "path") }, { v: blank() }, { v: blank() }]),
    caption: "A mask is a number whose 1 bits pick the places you want to work on. Here x is 10100110. Each step uses a mask with a single 1.",
    readout: "x = 10100110 = 166",
  });
  const op = (k: number, kind: "test" | "set" | "clear" | "flip") => {
    const m = bitsOf(1 << k);
    const c = col(k);
    const maskRow = kind === "clear" ? m.map((b) => 1 - b) : m;
    const R = kind === "test" ? X & (1 << k) : kind === "set" ? X | (1 << k) : kind === "clear" ? X & ~(1 << k) : X ^ (1 << k);
    return {
      maskRow,
      res: bitsOf(R),
      R,
      c,
      cells: rows([
        { v: x, src: only(8, c, "cur").map((s) => !!s) },
        { v: maskRow, src: only(8, c, "cur").map((s) => !!s) },
        { v: bitsOf(R), s: only(8, c, "cur").map((m) => m ?? "path") },
      ]),
    };
  };
  const t = op(3, "test");
  steps.push({
    rowHead: head,
    cells: t.cells,
    caption: "Test place 3. The mask `1 << 3` is 00001000. `x & mask` keeps place 3 of x and clears every other place. The result is 0, so place 3 of x holds 0.",
    readout: "x & (1 << 3) = 0",
    verdict: { ok: true, info: true, text: "place 3 is 0" },
  });
  const s = op(3, "set");
  steps.push({
    rowHead: head,
    cells: s.cells,
    caption: "Set place 3 to 1 with `x | mask`. Where the mask has 0, `|` copies x unchanged; where it has 1, the result is 1.",
    readout: `x | (1 << 3) = ${str(s.res)} = ${s.R}`,
  });
  const c = op(2, "clear");
  steps.push({
    rowHead: head,
    cells: c.cells,
    caption:
      "Clear place 2 with `x & ~mask`. `~(1 << 2)` has a 1 in every place except place 2, so `&` keeps everything else and clears place 2.",
    readout: `x & ~(1 << 2) = ${str(c.res)} = ${c.R}`,
  });
  const f = op(7, "flip");
  steps.push({
    rowHead: head,
    cells: f.cells,
    caption: "Flip place 7 with `x ^ mask`. `^` with 1 turns 1 into 0 and 0 into 1; `^` with 0 changes nothing.",
    readout: `x ^ (1 << 7) = ${str(f.res)} = ${f.R}`,
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: x }, { v: blank() }, { v: blank() }]),
    caption: "Four moves, one mask: `&` to test, `|` to set, `& ~` to clear and `^` to flip. A mask with several 1s does the same to several places at once.",
    readout: "test &  ·  set |  ·  clear & ~  ·  flip ^",
    verdict: { ok: true, text: "one mask, four moves" },
  });
  return steps;
}

function lowSteps(v: "drop" | "keep"): BitStep[] {
  const X = 0b01011000;
  const x = bitsOf(X);
  const low = col(3);
  const steps: BitStep[] = [];
  if (v === "drop") {
    const m1 = bitsOf(X - 1);
    const r = bitsOf(X & (X - 1));
    const head = ["x", "x − 1", "result"];
    steps.push({
      rowHead: head,
      cells: rows([{ v: x, s: only(8, low, "cur") }, { v: blank() }, { v: blank() }]),
      caption: "x is 88, which is 01011000. Its lowest 1 bit is in place 3. Below it are only 0s.",
      readout: "x = 01011000 = 88",
    });
    steps.push({
      rowHead: head,
      cells: rows([{ v: x }, { v: m1, s: m1.map((_, c) => (c >= low ? "cur" : undefined)) }, { v: blank() }]),
      caption:
        "Subtract 1. Place 0 holds 0, so it borrows from the left, and the borrow runs up to the lowest 1. That 1 becomes 0, and every 0 below it becomes 1. The places above it do not change.",
      readout: "88 − 1 = 87 = 01010111",
    });
    steps.push({
      rowHead: head,
      cells: rows([{ v: x }, { v: m1 }, { v: r, s: only(8, low, "cur") }]),
      caption:
        "`x & (x - 1)`: above the lowest 1, x and x − 1 agree, so those bits stay. From the lowest 1 down, they never both have a 1, so those places become 0. Only the lowest 1 has gone.",
      readout: "x & (x − 1) = 01010000 = 80",
      verdict: { ok: true, text: "lowest 1 dropped" },
    });
    steps.push({
      rowHead: head,
      cells: rows([{ v: x }, { v: m1 }, { v: r }]),
      caption:
        "A power of 2 has exactly one 1 bit, so dropping it leaves 0. That gives the test `x > 0 and x & (x - 1) == 0` for \"x is a power of 2\". Lesson 4 uses the same move to count 1 bits.",
      readout: "64 & 63 = 0  ·  88 & 87 = 80",
    });
    return steps;
  }
  const neg = bitsOf(-X);
  const flip = x.map((b) => 1 - b);
  const r = bitsOf(X & -X);
  const head = ["x", "~x", "−x", "result"];
  steps.push({
    rowHead: head,
    cells: rows([{ v: x, s: only(8, low, "cur") }, { v: blank() }, { v: blank() }, { v: blank() }]),
    caption: "x is 88 again, 01011000. This time keep only its lowest 1 bit and clear everything else.",
    readout: "x = 01011000 = 88",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: x }, { v: flip, s: all(8, "path") }, { v: blank() }, { v: blank() }]),
    caption: "Lesson 1: `-x` is `~x + 1`. First flip every bit. The 0s below the lowest 1 become 1s, and the lowest 1 becomes 0.",
    readout: "~x = 10100111",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: x }, { v: flip }, { v: neg, s: neg.map((_, c) => (c >= low ? "cur" : undefined)) }, { v: blank() }]),
    caption:
      "Add 1. The carry runs through the 1s at the bottom and stops at place 3. So −x has the same lowest 1 as x, with 0s below it, and every bit above it is flipped.",
    readout: "~x + 1 = 10101000 = −88 in 8 bits",
  });
  steps.push({
    rowHead: head,
    cells: rows([{ v: x }, { v: flip }, { v: neg }, { v: r, s: only(8, low, "cur") }]),
    caption:
      "`x & -x`: above place 3 the bits are opposite, so they give 0. Below it both are 0. Only place 3 is 1 in both. The result is 8, the worth of the lowest 1 bit. RNGQ-3's Fenwick tree uses exactly this.",
    readout: "x & −x = 00001000 = 8",
    verdict: { ok: true, text: "lowest 1 kept" },
  });
  return steps;
}

/* ---------------------------------------------------------------- BITS-4.1: counting 1 bits */

export type CountVariant = "drop" | "table";

export function countSteps(v: CountVariant): BitStep[] {
  return v === "drop" ? dropSteps() : tableSteps();
}

function dropSteps(): BitStep[] {
  const head = ["x", "x − 1", "next x"];
  const steps: BitStep[] = [];
  let x = 0b10110100;
  steps.push({
    rowHead: head,
    cells: rows([{ v: bitsOf(x), s: all(8, "path") }, { v: blank() }, { v: blank() }]),
    caption:
      "Count the 1 bits of 180, which is 10110100. Checking all 8 places takes 8 steps. Dropping the lowest 1 again and again takes one step per 1 bit.",
    readout: "count = 0",
  });
  let count = 0;
  while (x) {
    const nx = x & (x - 1);
    count++;
    const lowPlace = Math.log2(x & -x);
    const c = col(lowPlace);
    steps.push({
      rowHead: head,
      cells: rows([
        { v: bitsOf(x), s: only(8, c, "cur") },
        { v: bitsOf(x - 1) },
        { v: bitsOf(nx), s: bitsOf(nx).map((b, k) => (k === c ? "cur" : undefined)) },
      ]),
      caption:
        nx === 0
          ? `The last 1, in place ${lowPlace}, is dropped. x is now 0, so the loop stops. It ran ${count} times, once for each 1 bit.`
          : `\`x & (x - 1)\` drops the lowest 1, in place ${lowPlace}. That is one more 1 bit counted.`,
      readout: `count = ${count}`,
      verdict: nx === 0 ? { ok: true, text: `180 has ${count} ones` } : undefined,
    });
    x = nx;
  }
  steps.push({
    rowHead: head,
    cells: rows([{ v: bitsOf(180) }, { v: blank() }, { v: blank() }]),
    caption: "Python does the whole count in C: `(180).bit_count()` gives 4 (Python 3.10 and later), and `bin(180).count(\"1\")` works in older versions.",
    readout: "(180).bit_count() = 4",
  });
  return steps;
}

function tableSteps(): BitStep[] {
  const N = 16;
  const ones = Array.from({ length: N }, (_, i) => i.toString(2).split("").filter((b) => b === "1").length);
  const head = ["+0", "+8"];
  const steps: BitStep[] = [];
  const grid = (upto: number, cur?: number, src?: number): GCell[][] =>
    [0, 1].map((r) =>
      Array.from({ length: 8 }, (_, c) => {
        const i = r * 8 + c;
        return {
          v: i <= upto ? ones[i] : undefined,
          s: (i === cur ? "cur" : undefined) as Mark | undefined,
          src: i === src || undefined,
        };
      }),
    );
  steps.push({
    rowHead: head,
    cells: grid(-1),
    caption:
      "Now count the 1 bits of every number from 0 to 15, as a table. The cell under plate c in the row marked +8 is for 8 + c. Each count comes from a count already in the table.",
    readout: "ones[i] = ones[i >> 1] + (i & 1)",
  });
  steps.push({ rowHead: head, cells: grid(0, 0), caption: "0 has no 1 bits. This is the base case.", readout: "ones[0] = 0" });
  for (let i = 1; i < N; i++) {
    const h = i >> 1;
    const b = i & 1;
    steps.push({
      rowHead: head,
      cells: grid(i, i, h),
      caption: `${i} is ${i.toString(2)}. Drop its last bit: \`${i} >> 1\` is ${h} (${h.toString(2)}), which has ${ones[h]}. ${i} is ${b ? "odd, so add 1" : "even, so add 0"}: ${ones[i]}.`,
      readout: `ones[${i}] = ones[${h}] + ${b} = ${ones[i]}`,
    });
  }
  steps.push({
    rowHead: head,
    cells: grid(N - 1).map((row) => row.map((c) => ({ ...c, s: "done" as Mark }))),
    caption:
      "One addition per number: O(n) for the whole table. This is a small DP (DYNP): each answer is built from a smaller one that is already known.",
    readout: "16 counts, 16 additions",
    verdict: { ok: true, text: "table filled" },
  });
  return steps;
}

/* ---------------------------------------------------------------- BITS-5.1: subsets as bitmasks */

export type SubVariant = "all" | "sub";
export const ITEMS = [
  { name: "a", w: 5 },
  { name: "b", w: 3 },
  { name: "c", w: 8 },
];

export function subSteps(v: SubVariant): BitStep[] {
  return v === "all" ? allSubsetSteps() : submaskSteps();
}

function allSubsetSteps(): BitStep[] {
  const n = 3;
  const sums = [0];
  for (let m = 1; m < 1 << n; m++) {
    const low = m & -m;
    sums.push(sums[m ^ low] + ITEMS[Math.log2(low)].w);
  }
  const colHead = [2, 1, 0, "sum"];
  const head = Array.from({ length: 1 << n }, (_, m) => m);
  const grid = (upto: number, cur?: number, src?: number): GCell[][] =>
    Array.from({ length: 1 << n }, (_, m) => {
      const bits = bitsOf(m, n);
      // the row being built is pale and its sum, the new number, is the one heavy frame
      const cells: GCell[] = bits.map((b) => ({ v: m <= upto ? b : undefined, s: (m === cur ? "path" : undefined) as GCell["s"] }));
      cells.push({ v: m <= upto ? sums[m] : undefined, s: m === cur ? "cur" : undefined, src: m === src || undefined });
      return cells;
    });
  const names = (m: number) => {
    const s = ITEMS.filter((_, i) => (m >> i) & 1).map((it) => it.name);
    return s.length ? `{${s.join(", ")}}` : "{} (empty)";
  };
  const steps: BitStep[] = [];
  steps.push({
    rowHead: head,
    colHead,
    cells: grid(-1),
    caption:
      "Three items: a weighs 5, b weighs 3 and c weighs 8. Item a is place 0, b is place 1, c is place 2. Each row is one number from 0 to 7, and its bits say which items are in the subset.",
    readout: "2³ = 8 subsets",
  });
  for (let m = 0; m < 1 << n; m++) {
    const low = m & -m;
    const rest = m ^ low;
    const k = low ? Math.log2(low) : -1;
    steps.push({
      rowHead: head,
      colHead,
      cells: grid(m, m, low ? rest : undefined),
      caption:
        m === 0
          ? "Row 0 is 000: no items. The empty subset weighs 0."
          : rest === 0
            ? `Row ${m} is ${bitsOf(m, n).join("")}: only ${ITEMS[k].name}. Its lowest 1 is place ${k}; without it, row 0 is left. So the sum is 0 + ${ITEMS[k].w}.`
            : `Row ${m} is ${bitsOf(m, n).join("")}: ${names(m)}. Drop its lowest 1 (item ${ITEMS[k].name}) to get row ${rest}, which is already done. Add ${ITEMS[k].name}'s ${ITEMS[k].w}.`,
      readout: m === 0 ? "sum[0] = 0" : `sum[${m}] = sum[${rest}] + ${ITEMS[k].w} = ${sums[m]}`,
    });
  }
  steps.push({
    rowHead: head,
    colHead,
    cells: grid(7).map((row) => row.map((c, j) => (j === 3 ? { ...c, s: "done" as Mark } : c))),
    caption:
      "Every subset and its weight, with one addition each: O(2ⁿ) in all, not O(2ⁿ · n). `for mask in range(1 << n)` lists the subsets in this order.",
    readout: "sums: 0 5 3 8 8 13 11 16",
    verdict: { ok: true, text: "8 subsets, 8 sums" },
  });
  return steps;
}

function submaskSteps(): BitStep[] {
  const MASK = 0b1101;
  const n = 4;
  const subs: number[] = [];
  let sub = MASK;
  for (;;) {
    subs.push(sub);
    if (sub === 0) break;
    sub = (sub - 1) & MASK;
  }
  const maskBits = bitsOf(MASK, n);
  const outside = maskBits.map((b) => (b ? undefined : ("out" as Mark)));
  const head: (string | number)[] = ["mask", ...subs];
  const grid = (upto: number): GCell[][] => [
    maskBits.map((b) => ({ v: b, s: (b ? "path" : "out") as Mark | "path" })),
    ...subs.map((s, k) =>
      bitsOf(s, n).map((b, c) => ({ v: k <= upto ? b : undefined, s: outside[c] ?? (k === upto ? ("path" as const) : undefined) })),
    ),
  ];
  const steps: BitStep[] = [];
  steps.push({
    rowHead: head,
    colHead: [3, 2, 1, 0],
    cells: grid(-1),
    caption:
      "List every subset of the items in mask 1101 (places 0, 2 and 3). Place 1 is not in the mask, so it is never 1 in any of them (hatched). There are 2³ = 8 such subsets, called submasks.",
    readout: "mask = 1101 = 13",
  });
  for (let k = 0; k < subs.length; k++) {
    const s = subs[k];
    const prev = k ? subs[k - 1] : null;
    steps.push({
      rowHead: head,
      colHead: [3, 2, 1, 0],
      cells: grid(k),
      caption:
        prev === null
          ? "Start with the mask itself: `sub = mask`. The plate at the left of each row is the submask as a number."
          : s === 0
            ? `${prev} − 1 = ${prev - 1}, and \`& mask\` gives 0: the empty subset. After 0 the loop stops; it has visited all 8 submasks, largest first.`
            : `\`(sub - 1) & mask\`: ${prev} − 1 = ${prev - 1} (${bitsOf(prev - 1, n).join("")}), and \`& mask\` clears place 1, giving ${s} (${bitsOf(s, n).join("")}).`,
      readout: prev === null ? "sub = 1101" : `(${bitsOf(prev, n).join("")} − 1) & 1101 = ${bitsOf(s, n).join("")}`,
      verdict: s === 0 ? { ok: true, text: "all 8 submasks" } : undefined,
    });
  }
  return steps;
}
