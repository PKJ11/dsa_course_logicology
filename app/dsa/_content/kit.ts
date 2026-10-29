// Small helpers shared by every station's step generators.

import type { CellState } from "../_components/ArrayTrack";
import type { Var } from "../_components/Stages";

export type { CellState };

export const plural = (k: number, word: string, many = `${word}s`) => `${k.toLocaleString("en-US")} ${k === 1 ? word : many}`;

/** A Python-style picture of a value: [1, 2], 'NDLS', None, {'a': 1}, 6.0. */
export type Py = number | string | boolean | null | Py[] | { [k: string]: Py } | { float: number } | { tuple: Py[] };

export function py(v: Py): string {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `'${v}'`;
  if (Array.isArray(v)) return `[${v.map(py).join(", ")}]`;
  if ("float" in v && typeof v.float === "number") return Number.isInteger(v.float) ? `${v.float}.0` : String(v.float);
  if ("tuple" in v && Array.isArray(v.tuple)) return v.tuple.length === 1 ? `(${py(v.tuple[0])},)` : `(${v.tuple.map(py).join(", ")})`;
  return `{${Object.entries(v as Record<string, Py>).map(([k, x]) => `'${k}': ${py(x)}`).join(", ")}}`;
}

/** Turn a name → value record into table rows, marking the names that changed since `prev`. */
export function vars(now: Record<string, string>, prev: Record<string, string> = {}): Var[] {
  return Object.entries(now).map(([name, value]) => ({ name, value, changed: prev[name] !== value }));
}

/** Cell states for a window: everything outside lo..hi is ruled out. */
export function statesFor(n: number, lo: number, hi: number, extra: Record<number, CellState> = {}): CellState[] {
  const s: CellState[] = [];
  for (let k = 0; k < n; k++) s.push(k < lo || k > hi ? "out" : "");
  for (const [k, v] of Object.entries(extra)) s[Number(k)] = v;
  return s;
}

/** A tiny trace recorder: push a step with the current line, the variables and a caption. */
export type TraceStep<X = unknown> = { line: number | null; vars: Var[]; caption: string; out?: string[]; x?: X };

export function recorder<X = unknown>() {
  const steps: TraceStep<X>[] = [];
  let prev: Record<string, string> = {};
  return {
    steps,
    push(line: number | null, now: Record<string, string>, caption: string, extra: { out?: string[]; x?: X } = {}) {
      steps.push({ line, vars: vars(now, prev), caption, ...extra });
      prev = { ...now };
    },
  };
}
