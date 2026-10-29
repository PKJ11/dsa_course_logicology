// GEOM step generators. Every figure is a Plane (whole-number coordinates, y going up). Areas and hulls are filled
// polygons, vectors are arrows, and the sweep line is the Plane's blue line. Captions use backticks for code.

import type { PLine, PPoint, PPoly, PSeg, QItem } from "../../_components/Stages";

export type Verdict = { ok: boolean; text: string; info?: boolean };
export type GeoStep = {
  points: PPoint[];
  segs: PSeg[];
  polys?: PPoly[];
  lines?: PLine[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
  queue?: QItem[];
};
type P = [number, number];

export function cross(o: P, a: P, b: P): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}
const sgn = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
const fmt = (p: P) => `(${p[0]}, ${p[1]})`;
const neg = (v: number) => (v < 0 ? `−${-v}` : String(v));

/* ---------- GEOM-1.1: vectors, the cross product, and area ---------- */

export type CrossVariant = "left" | "right" | "line" | "area";
export const CROSS_SIZE = { w: 8, h: 6 };

const VEC: Record<"left" | "right" | "line", { A: P; B: P }> = {
  left: { A: [5, 2], B: [2, 4] },
  right: { A: [2, 4], B: [5, 2] },
  line: { A: [3, 2], B: [5, 3] },
};
const O: P = [1, 1];

export function crossSteps(v: CrossVariant): GeoStep[] {
  if (v === "area") return areaSteps();
  const { A, B } = VEC[v];
  const a: P = [A[0] - O[0], A[1] - O[1]];
  const b: P = [B[0] - O[0], B[1] - O[1]];
  const c = a[0] * b[1] - a[1] * b[0];
  const S: P = [O[0] + a[0] + b[0], O[1] + a[1] + b[1]];
  const pts = (extra: PPoint[] = []): PPoint[] => [
    { id: "O", x: O[0], y: O[1], lp: "l" },
    { id: "A", x: A[0], y: A[1], lp: v === "right" ? "l" : "r" },
    { id: "B", x: B[0], y: B[1], lp: v === "right" ? "r" : "l" },
    ...extra,
  ];
  const arrows: PSeg[] = [
    { a: "O", b: "A", state: "cur", arrow: true, label: "a" },
    { a: "O", b: "B", state: "cur", arrow: true, label: "b" },
  ];
  const out: GeoStep[] = [];
  out.push({
    points: pts(),
    segs: [],
    caption: `Three points with whole-number coordinates. Standing at O, we ask: is B to the left of the direction from O to A, to the right, or exactly on that line?`,
  });
  out.push({
    points: pts(),
    segs: arrows,
    caption: `A vector is a step: how far to move in x and in y. a = A − O = ${fmt(a)} and b = B − O = ${fmt(b)}. Subtracting the coordinates gives the step from one point to the other.`,
    readout: `a = ${fmt(a)} · b = ${fmt(b)}`,
  });
  const area = `${a[0]}·${b[1]} − ${a[1]}·${b[0]} = ${neg(c)}`;
  out.push({
    points: pts(c === 0 ? [] : [{ id: "S", x: S[0], y: S[1], state: "todo", label: "" }]),
    segs: [...arrows, ...(c === 0 ? [] : [{ a: "A", b: "S", state: "old" as const }, { a: "B", b: "S", state: "old" as const }])],
    polys: c === 0 ? [] : [{ pts: ["O", "A", "S", "B"], kind: "pale" }],
    caption:
      c === 0
        ? `The cross product is a.x·b.y − a.y·b.x = ${area}. It is 0: the two steps point along one line, so they make no area.`
        : `The cross product is a.x·b.y − a.y·b.x = ${area}. Its size is the area of the shaded parallelogram with sides a and b: ${Math.abs(c)} squares.`,
    readout: `cross(a, b) = ${area}`,
  });
  out.push({
    points: pts(c === 0 ? [] : [{ id: "S", x: S[0], y: S[1], state: "todo", label: "" }]),
    segs: [...arrows, ...(c === 0 ? [] : [{ a: "A", b: "S", state: "old" as const }, { a: "B", b: "S", state: "old" as const }])],
    polys: c === 0 ? [] : [{ pts: ["O", "A", "S", "B"], kind: "pale" }],
    caption:
      c > 0
        ? `Its sign gives the direction. Positive: turning from a to b goes counterclockwise, so B is on the left of the line from O to A.`
        : c < 0
          ? `Its sign gives the direction. Negative: turning from a to b goes clockwise, so B is on the right of the line from O to A. Swapping a and b changes only the sign.`
          : `Zero means O, A and B lie on one line. B could be between O and A, beyond A, or behind O: the sign alone cannot tell; comparing coordinates can.`,
    readout: `cross(a, b) = ${neg(c)}`,
    verdict: { ok: true, info: true, text: c > 0 ? "B is on the left" : c < 0 ? "B is on the right" : "on one line" },
  });
  if (c !== 0)
    out.push({
      points: pts(),
      segs: [...arrows, { a: "A", b: "B", state: "" }],
      polys: [{ pts: ["O", "A", "B"], kind: "pale" }],
      caption: `The triangle OAB is half of the parallelogram: area ${Math.abs(c)}/2 = ${Math.abs(c) / 2}. Programs usually keep the doubled value, ${Math.abs(c)}, so that everything stays a whole number.`,
      readout: `area of OAB = |${neg(c)}| / 2 = ${Math.abs(c) / 2}`,
    });
  return out;
}

const POLY: P[] = [
  [1, 1],
  [7, 1],
  [7, 5],
  [4, 2],
  [2, 5],
  [1, 3],
];

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function inside(poly: P[], q: P): boolean {
  // strictly inside: not on an edge, odd number of crossings to the right
  const n = poly.length;
  let w = false;
  for (let k = 0; k < n; k++) {
    const p1 = poly[k];
    const p2 = poly[(k + 1) % n];
    if (cross(p1, p2, q) === 0 && Math.min(p1[0], p2[0]) <= q[0] && q[0] <= Math.max(p1[0], p2[0]) && Math.min(p1[1], p2[1]) <= q[1] && q[1] <= Math.max(p1[1], p2[1])) return false;
    if (p1[1] > q[1] !== p2[1] > q[1]) {
      const xAt = p1[0] + ((q[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
      if (q[0] < xAt) w = !w;
    }
  }
  return w;
}

function areaSteps(): GeoStep[] {
  const ids = POLY.map((_, k) => `P${k}`);
  const base: PPoint[] = POLY.map((p, k) => ({ id: ids[k], x: p[0], y: p[1], lp: k === 3 ? "b" : k === 0 || k === 5 ? "l" : "r" }));
  const edges: PSeg[] = ids.map((id, k) => ({ a: id, b: ids[(k + 1) % ids.length], state: "cur" as const }));
  const out: GeoStep[] = [];
  out.push({
    points: base,
    segs: edges,
    caption: `A polygon with corners P0 to P5, listed counterclockwise. It is not convex: P3 points inwards. Split it into triangles that all share the corner P0.`,
    readout: "2 × area so far = 0",
  });
  let total = 0;
  const done: PPoly[] = [];
  for (let k = 1; k + 1 < POLY.length; k++) {
    const c = cross(POLY[0], POLY[k], POLY[k + 1]);
    total += c;
    const tri: PPoly = { pts: [ids[0], ids[k], ids[k + 1]], kind: c >= 0 ? "pale" : "out" };
    out.push({
      points: base,
      segs: [
        ...edges.filter((e) => !(e.a === ids[0] && (e.b === ids[k] || e.b === ids[k + 1]))).map((e) => ({ ...e, state: "" as const })),
        { a: ids[0], b: ids[k], state: "cur" },
        { a: ids[0], b: ids[k + 1], state: "cur" },
      ],
      polys: [...done, tri],
      caption:
        c >= 0
          ? `Triangle P0, P${k}, P${k + 1}: the cross product of P${k} − P0 and P${k + 1} − P0 is ${neg(c)}, positive, so this triangle's doubled area is added.`
          : `Triangle P0, P${k}, P${k + 1}: the cross product is ${neg(c)}, negative, because P${k + 1} is to the right of the step from P0 to P${k}. Its area is taken away (hatched). With the added and the taken-away triangles together, every spot inside the polygon is counted once and every spot outside it zero times.`,
      readout: `2 × area so far = ${neg(total)}`,
    });
    done.push(tri);
  }
  const twice = total;
  const B = POLY.reduce((s, p, k) => s + gcd(POLY[(k + 1) % POLY.length][0] - p[0], POLY[(k + 1) % POLY.length][1] - p[1]), 0);
  const I = (Math.abs(twice) - B + 2) / 2;
  const inner: PPoint[] = [];
  for (let x = 0; x <= CROSS_SIZE.w; x++)
    for (let y = 0; y <= CROSS_SIZE.h; y++) if (inside(POLY, [x, y])) inner.push({ id: `q${x},${y}`, x, y, state: "todo", label: "" });
  out.push({
    points: base,
    segs: edges.map((e) => ({ ...e, state: "found" as const })),
    polys: [{ pts: ids, kind: "pale" }],
    caption: `The signed parts add up to ${twice}, twice the area, so the area is ${twice / 2}. This is the shoelace formula. Going round clockwise would give −${twice}: take the absolute value.`,
    readout: `area = ${twice} / 2 = ${twice / 2}`,
  });
  out.push({
    points: [...base, ...inner],
    segs: edges.map((e) => ({ ...e, state: "found" as const })),
    polys: [{ pts: ids, kind: "pale" }],
    caption: `Pick's theorem counts the whole-number points strictly inside (dashed): ${B} lie on the edges (each edge adds the gcd of its x and y steps), so inside there are (${twice} − ${B} + 2) / 2 = ${I}.`,
    readout: `inside = (2A − B + 2) / 2 = ${I}`,
    verdict: { ok: true, info: true, text: `${I} points inside` },
  });
  return out;
}

/* ---------- GEOM-2.1: orientation and intersection ---------- */

export type MeetVariant = "cross" | "miss" | "touch" | "line";
export const MEET_SIZE = { w: 8, h: 7 };
const MEET: Record<MeetVariant, P[]> = {
  cross: [
    [1, 1],
    [7, 5],
    [1, 5],
    [6, 1],
  ],
  miss: [
    [1, 1],
    [4, 3],
    [5, 5],
    [7, 1],
  ],
  touch: [
    [1, 1],
    [7, 4],
    [3, 2],
    [4, 6],
  ],
  line: [
    [1, 1],
    [4, 4],
    [5, 5],
    [7, 7],
  ],
};

function side(v: number, who: string, line: string): string {
  return v > 0 ? `${who} is on the left of ${line}` : v < 0 ? `${who} is on the right of ${line}` : `${who} is on the line ${line}`;
}

function within(p: P, q: P, r: P): boolean {
  return Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
}

export function meetSteps(v: MeetVariant): GeoStep[] {
  const [A, B, C, D] = MEET[v];
  const pts = (st: Record<string, PPoint["state"]> = {}): PPoint[] => [
    { id: "A", x: A[0], y: A[1], lp: "l", state: st.A },
    { id: "B", x: B[0], y: B[1], lp: "r", state: st.B },
    { id: "C", x: C[0], y: C[1], lp: v === "touch" ? "b" : "l", state: st.C },
    { id: "D", x: D[0], y: D[1], lp: "r", state: st.D },
  ];
  const d1 = cross(A, B, C);
  const d2 = cross(A, B, D);
  const d3 = cross(C, D, A);
  const d4 = cross(C, D, B);
  const out: GeoStep[] = [];
  out.push({
    points: pts(),
    segs: [
      { a: "A", b: "B" },
      { a: "C", b: "D" },
    ],
    caption: `Two pieces, AB and CD. Do they share a point? Only orientations are needed: for each end of one piece, is it left of, right of, or on the line of the other piece?`,
  });
  const o = (p: string, q: string, r: string, val: number, tri: string[], st: string) => ({
    points: pts({ [st]: "cur" }),
    segs: [
      { a: p, b: q, state: "cur" as const },
      { a: p === "A" ? "C" : "A", b: p === "A" ? "D" : "B" },
    ],
    polys: val === 0 ? [] : [{ pts: tri, kind: "pale" as const }],
    caption: `orient(${p}, ${q}, ${r}) is the cross product of ${q} − ${p} and ${r} − ${p}: ${sgn(val)}. So ${side(val, r, `${p}${q}`)}.`,
    readout: `orient(${p}, ${q}, ${r}) = ${sgn(val)}`,
  });
  out.push(o("A", "B", "C", d1, ["A", "B", "C"], "C"));
  out.push(o("A", "B", "D", d2, ["A", "B", "D"], "D"));
  out.push(o("C", "D", "A", d3, ["C", "D", "A"], "A"));
  out.push(o("C", "D", "B", d4, ["C", "D", "B"], "B"));
  const all = `C ${sgn(d1)}, D ${sgn(d2)} against AB · A ${sgn(d3)}, B ${sgn(d4)} against CD`;
  const proper = d1 * d2 < 0 && d3 * d4 < 0;
  if (proper) {
    out.push({
      points: pts(),
      segs: [
        { a: "A", b: "B", state: "found" },
        { a: "C", b: "D", state: "found" },
      ],
      caption: `C and D are on opposite sides of AB, and A and B are on opposite sides of CD. So the pieces cross, at one point.`,
      readout: all,
      verdict: { ok: true, text: "they cross" },
    });
  } else if (d1 === 0 && d2 === 0) {
    out.push({
      points: pts(),
      segs: [
        { a: "A", b: "B", state: "cur" },
        { a: "C", b: "D", state: "cur" },
      ],
      caption: `All four orientations are 0: the four points lie on one line. Now compare positions along the line: AB covers x from ${A[0]} to ${B[0]}, CD from ${C[0]} to ${D[0]}. These ranges do not overlap, so the pieces do not meet.`,
      readout: all,
      verdict: { ok: true, info: true, text: "no common point" },
    });
  } else if ((d1 === 0 && within(A, B, C)) || (d2 === 0 && within(A, B, D)) || (d3 === 0 && within(C, D, A)) || (d4 === 0 && within(C, D, B))) {
    out.push({
      points: pts({ C: "found" }),
      segs: [
        { a: "A", b: "B", state: "found" },
        { a: "C", b: "D", state: "found" },
      ],
      caption: `C is on the line AB (orientation 0), and it lies between A and B: its x is between ${A[0]} and ${B[0]}, and its y between ${A[1]} and ${B[1]}. So the pieces touch at C.`,
      readout: all,
      verdict: { ok: true, text: "they touch at C" },
    });
  } else {
    out.push({
      points: pts(),
      segs: [
        { a: "A", b: "B", state: "old" },
        { a: "C", b: "D", state: "old" },
      ],
      caption: `C and D are on opposite sides of the line AB, but A and B are on the same side of the line CD. The lines cross, but beyond the end of AB. Both tests are needed.`,
      readout: all,
      verdict: { ok: true, info: true, text: "no common point" },
    });
  }
  return out;
}

/* ---------- GEOM-3.1: Andrew's monotone chain ---------- */

export const HULL_SIZE = { w: 10, h: 7 };
const HULL_PTS: P[] = [
  [1, 3],
  [2, 1],
  [3, 5],
  [4, 3],
  [5, 1],
  [6, 4],
  [6, 6],
  [7, 2],
  [8, 1],
  [9, 4],
];

export function hullSteps(): GeoStep[] {
  const pts = HULL_PTS.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const ids = pts.map((_, k) => String.fromCharCode(65 + k));
  const at = (k: number) => pts[k];
  const out: GeoStep[] = [];
  // A point is hatched only on the step it is popped. `done` is the finished lower hull, drawn as found edges
  // while the upper walk runs; the chain being built is plain.
  const view = (done: number[], ch: number[], st: Record<number, PPoint["state"]>, extra: PSeg[] = []): Pick<GeoStep, "points" | "segs"> => ({
    points: pts.map((p, k) => ({ id: ids[k], x: p[0], y: p[1], state: st[k], lp: p[1] >= 5 ? "t" : p[1] <= 1 ? "b" : "r" })),
    segs: [
      ...done.slice(1).map((k, j) => ({ a: ids[done[j]], b: ids[k], state: "found" as const })),
      ...ch.slice(1).map((k, j) => ({ a: ids[ch[j]], b: ids[k], state: "" as const })),
      ...extra,
    ],
  });
  out.push({
    ...view([], [], {}),
    caption: `Ten points. The convex hull is the smallest convex polygon that holds them all. First sort the points by x (then by y): they are named A to J in that order.`,
    readout: "sorted: " + ids.join(" "),
  });
  const chain = (order: number[], name: string, other: number[]) => {
    const st: number[] = [];
    for (const k of order) {
      let popped = 0;
      while (st.length >= 2) {
        const c = cross(at(st[st.length - 2]), at(st[st.length - 1]), at(k));
        if (c > 0) break;
        const gone = st[st.length - 1];
        out.push({
          ...view(other, st, { [k]: "cur", [gone]: "out" }, [{ a: ids[st[st.length - 2]], b: ids[k], state: "old" }]),
          caption:
            c < 0
              ? `${ids[st[st.length - 2]]} → ${ids[gone]} → ${ids[k]} turns right (cross product ${neg(c)}). On the ${name} hull every turn must go left, so ${ids[gone]} cannot be a corner: remove it.`
              : `${ids[st[st.length - 2]]}, ${ids[gone]} and ${ids[k]} lie on one line (cross product 0). ${ids[gone]} is on an edge, not a corner: remove it too.`,
          readout: `${name}: ${st.map((j) => ids[j]).join(" ")}`,
        });
        st.pop();
        popped++;
      }
      st.push(k);
      out.push({
        ...view(other, st, { [k]: "cur" }),
        caption:
          st.length === 1
            ? `Start the ${name} hull at ${ids[k]}.`
            : st.length === 2
              ? `${popped ? `Only ${ids[st[0]]} is left before ${ids[k]}, so there is no turn to check. ` : ""}Add ${ids[k]}: the ${name} hull is now ${ids[st[0]]}, ${ids[k]}.`
              : `${ids[st[st.length - 3]]} → ${ids[st[st.length - 2]]} → ${ids[k]} turns left (cross product ${neg(cross(at(st[st.length - 3]), at(st[st.length - 2]), at(k)))}). Keep it and add ${ids[k]}.`,
        readout: `${name}: ${st.map((j) => ids[j]).join(" ")}`,
      });
    }
    return st;
  };
  const lower = chain(
    pts.map((_, k) => k),
    "lower",
    [],
  );
  out.push({
    ...view(lower, [], {}),
    caption: `The lower hull runs from A to J along the bottom. Now walk back from J to A for the upper hull, with the same rule.`,
    readout: `lower: ${lower.map((j) => ids[j]).join(" ")}`,
  });
  const upper = chain(
    pts.map((_, k) => pts.length - 1 - k),
    "upper",
    lower,
  );
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  out.push({
    points: pts.map((p, k) => ({ id: ids[k], x: p[0], y: p[1], state: hull.includes(k) ? "found" : "out", lp: p[1] >= 5 ? "t" : p[1] <= 1 ? "b" : "r" })),
    segs: hull.map((k, j) => ({ a: ids[k], b: ids[hull[(j + 1) % hull.length]], state: "found" as const })),
    polys: [{ pts: hull.map((k) => ids[k]), kind: "pale" }],
    caption: `Join the two chains (the end of each is the start of the other): ${hull.map((k) => ids[k]).join(", ")}, counterclockwise. Each point was added once and removed at most once, so after sorting the walk is O(n).`,
    readout: `hull: ${hull.map((k) => ids[k]).join(" ")}`,
    verdict: { ok: true, text: `${hull.length} corners` },
  });
  return out;
}

/* ---------- GEOM-4.1: the sweep line (Shamos–Hoey) ---------- */

export type SweepVariant = "found" | "none";
export const SWEEP_SIZE = { w: 12, h: 8 };
type Seg = { name: string; a: P; b: P };
const SWEEP: Record<SweepVariant, Seg[]> = {
  found: [
    { name: "a", a: [1, 1], b: [11, 7] },
    { name: "b", a: [1, 4], b: [4, 4] },
    { name: "c", a: [2, 7], b: [11, 1] },
  ],
  none: [
    { name: "a", a: [1, 1], b: [11, 3] },
    { name: "b", a: [1, 4], b: [4, 4] },
    { name: "c", a: [2, 7], b: [11, 5] },
    { name: "d", a: [6, 3], b: [9, 4] },
  ],
};

function segsMeet(s: Seg, t: Seg): boolean {
  const d1 = cross(s.a, s.b, t.a);
  const d2 = cross(s.a, s.b, t.b);
  const d3 = cross(t.a, t.b, s.a);
  const d4 = cross(t.a, t.b, s.b);
  if (d1 * d2 < 0 && d3 * d4 < 0) return true;
  return (d1 === 0 && within(s.a, s.b, t.a)) || (d2 === 0 && within(s.a, s.b, t.b)) || (d3 === 0 && within(t.a, t.b, s.a)) || (d4 === 0 && within(t.a, t.b, s.b));
}

/** y of piece s at x, as a number (for ordering the drawing only; the method itself uses cross products). */
function yAt(s: Seg, x: number): number {
  return s.a[1] + ((s.b[1] - s.a[1]) * (x - s.a[0])) / (s.b[0] - s.a[0]);
}

export function sweepSteps(v: SweepVariant): GeoStep[] {
  const segs = SWEEP[v];
  const points: PPoint[] = segs.flatMap((s) => [
    // a name to the left of x = 1 would sit on the axis numbers, so it goes above there
    { id: `${s.name}1`, x: s.a[0], y: s.a[1], label: s.name, lp: s.a[0] <= 1 ? ("t" as const) : ("l" as const) },
    { id: `${s.name}2`, x: s.b[0], y: s.b[1], label: "" },
  ]);
  const events = segs
    .flatMap((s, i) => [
      { x: s.a[0], kind: 0, y: s.a[1], i },
      { x: s.b[0], kind: 1, y: s.b[1], i },
    ])
    .sort((p, q) => p.x - q.x || p.kind - q.kind || p.y - q.y);
  const out: GeoStep[] = [];
  const active: number[] = [];
  const checked = new Set<string>();
  const finished = new Set<number>();
  const view = (x: number | null, st: Record<number, PSeg["state"]>, label?: string) => ({
    points,
    segs: segs.map((s, i) => ({ a: `${s.name}1`, b: `${s.name}2`, state: st[i] ?? (finished.has(i) ? ("old" as const) : ("" as const)) })),
    lines: x === null ? [] : [{ x, label: label ?? `x = ${x}` }],
    queue: active.map((i) => ({ v: segs[i].name, s: st[i] === "cur" || st[i] === "found" ? ("cur" as const) : undefined })),
  });
  out.push({
    ...view(null, {}),
    caption: `${segs.length === 3 ? "Three" : "Four"} pieces. A vertical line sweeps from left to right. It stops only at events: where a piece starts or ends. On the right is the list of pieces the line crosses, from the bottom up.`,
    readout: "events: " + events.map((e) => `${segs[e.i].name} ${e.kind ? "ends" : "starts"} at ${e.x}`).join(" · "),
  });
  for (const e of events) {
    const s = segs[e.i];
    if (e.kind === 0) {
      let k = 0;
      while (k < active.length && yAt(segs[active[k]], e.x) < e.y) k++;
      active.splice(k, 0, e.i);
      const nb = [active[k - 1], active[k + 1]].filter((j) => j !== undefined) as number[];
      for (const j of nb) checked.add(`${Math.min(j, e.i)},${Math.max(j, e.i)}`);
      const hit = nb.find((j) => segsMeet(s, segs[j]));
      const st: Record<number, PSeg["state"]> = { [e.i]: "cur" };
      for (const j of nb) st[j] = j === hit ? "found" : "cur";
      if (hit !== undefined) st[e.i] = "found";
      out.push({
        ...view(e.x, st),
        caption:
          `${s.name} starts at x = ${e.x}. Put it in the list by its height at this x` +
          (nb.length === 0
            ? `; the list was empty, so there is nothing to check.`
            : nb.length === 1
              ? `. Its only neighbour is ${segs[nb[0]].name}; check the two.`
              : `, between ${segs[nb[0]].name} and ${segs[nb[1]].name}, and check it against both.`) +
          (hit !== undefined ? ` ${s.name} and ${segs[hit].name} meet: done.` : nb.length === 2 ? ` Neither meets ${s.name}.` : nb.length ? ` They do not meet.` : ""),
        readout: `check: ${nb.map((j) => `${s.name}–${segs[j].name} ${segsMeet(s, segs[j]) ? "meet" : "no"}`).join(", ") || "nothing"}`,
        verdict: hit !== undefined ? { ok: true, text: `${s.name} and ${segs[hit].name} meet` } : undefined,
      });
      if (hit !== undefined) return out;
    } else {
      const k = active.indexOf(e.i);
      active.splice(k, 1);
      finished.add(e.i);
      const below = active[k - 1];
      const above = active[k];
      const st: Record<number, PSeg["state"]> = {};
      let hit = false;
      let again = false;
      if (below !== undefined && above !== undefined) {
        const key = `${Math.min(below, above)},${Math.max(below, above)}`;
        again = checked.has(key);
        checked.add(key);
        hit = segsMeet(segs[below], segs[above]);
        st[below] = hit ? "found" : "cur";
        st[above] = hit ? "found" : "cur";
      }
      out.push({
        ...view(e.x, st),
        caption:
          `${s.name} ends at x = ${e.x}: take it out of the list.` +
          (below !== undefined && above !== undefined
            ? (again
                ? ` Now ${segs[below].name} and ${segs[above].name} are next to each other again. Check them again (a simple program does not remember earlier checks).`
                : ` Now ${segs[below].name} and ${segs[above].name} are next to each other for the first time, so check them.`) +
              (hit ? ` They meet: done. Without this check after a removal, the crossing would be missed.` : ` They do not meet.`)
            : ` No two pieces became neighbours.`),
        readout: below !== undefined && above !== undefined ? `check: ${segs[below].name}–${segs[above].name} ${hit ? "meet" : "no"}` : "check: nothing",
        verdict: hit ? { ok: true, text: `${segs[below].name} and ${segs[above].name} meet` } : undefined,
      });
      if (hit) return out;
    }
  }
  out.push({
    ...view(null, {}),
    caption: `The line has passed every event and no check found two pieces that meet. So no two pieces meet: if two did, they would have been neighbours in the list just before the leftmost meeting point.`,
    readout: `${events.length} events, at most 2 checks each`,
    verdict: { ok: true, info: true, text: "no two pieces meet" },
  });
  return out;
}
