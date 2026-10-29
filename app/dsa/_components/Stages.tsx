"use client";

import { keepTogether } from "./Prose";

// Figure stages beyond the array track. Each one draws a single step from plain data, using the shared
// state marks: current = yellow inside a heavy ink frame, done = solid ink, out = hatched,
// found = double rule, bad = red strike. Blue only marks a position (an index or a line number).

import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check } from "lucide-react";
import { tokenize } from "./Code";
import { CodeHint } from "./CodeHint";
import type { Pointer } from "./ArrayTrack";
import { useCompact } from "./Stepper";

export type Mark = "" | "cur" | "done" | "out" | "found" | "bad" | "todo";

export function Verdict({ v }: { v?: { ok: boolean; text: string; info?: boolean } }) {
  if (!v) return null;
  return <span className={`verdict ${v.info ? "verdict--info" : v.ok ? "verdict--ok" : "verdict--bad"}`}>{v.text}</span>;
}

/* ---------- Code trace: the program with its current line, beside its variables ---------- */

export type Var = { name: string; value: string; changed?: boolean };

/** A readout line's text, kept together in the places a phone must not break it (see keepTogether). */
export function ReadoutText({ text }: { text: string }) {
  return <>{keepTogether(text)}</>;
}

export function CodeTrace({
  code,
  line,
  vars,
  varsTitle = "Variables",
  aside,
}: {
  code: string;
  line: number | null;
  vars?: Var[];
  varsTitle?: string;
  aside?: ReactNode;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className={`ctrace${vars || aside ? "" : " ctrace--solo"}`}>
      <div className="ctrace__main">
      <pre className="ctrace__code" aria-label={line ? `Code, running line ${line}` : "Code"}>
        <code>
          {lines.map((l, i) => (
            <span key={i} className={`ln${line === i + 1 ? " is-mark" : ""}`} aria-current={line === i + 1 ? "step" : undefined}>
              {tokenize(l).map((tk, j) =>
                tk.c ? (
                  <span key={j} className={tk.c}>
                    {tk.t}
                  </span>
                ) : (
                  <Fragment key={j}>{tk.t}</Fragment>
                ),
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      <CodeHint />
      </div>
      {(vars || aside) && (
        <div className="ctrace__side">
          {vars && (
            <table className="tt vars">
              <caption className="visually-hidden">{varsTitle}</caption>
              <thead>
                <tr>
                  <th>{varsTitle}</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {vars.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ color: "var(--ink-3)" }}>
                      none yet
                    </td>
                  </tr>
                )}
                {vars.map((v) => (
                  <tr key={v.name} className={v.changed ? "is-current" : undefined}>
                    <td>
                      <code>{v.name}</code>
                    </td>
                    <td>
                      <code>{v.value}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {aside}
        </div>
      )}
    </div>
  );
}

/* ---------- Call stack: frames listed top first ---------- */

export type Frame = { name: string; vars?: string; state: "cur" | "wait" | "ret"; ret?: string };

/** `plain` lists items without running/waiting states: for a stack held in a list, not calls. */
export function CallStack({ frames, label = "Call stack", plain = false }: { frames: Frame[]; label?: string; plain?: boolean }) {
  const top = [...frames].reverse();
  return (
    <div className="stack" role="list" aria-label={`${label}, top first, ${frames.length} ${frames.length === 1 ? "frame" : "frames"}`}>
      <div className="stack__head" aria-hidden="true">
        <span>{label}</span>
        <span className="num">{plain ? `${frames.length} ${frames.length === 1 ? "item" : "items"}` : `depth ${frames.length}`}</span>
      </div>
      {top.length === 0 && <div className="stack__empty">empty</div>}
      {top.map((f, k) => (
        <div
          key={frames.length - k}
          role="listitem"
          className={`frame is-${f.state}`}
          aria-label={`${f.name}${f.vars ? `, ${f.vars}` : ""}${plain ? (k === 0 ? ", top" : "") : f.state === "cur" ? ", running" : f.state === "wait" ? ", waiting" : `, returns ${f.ret}`}`}
        >
          <span className="frame__main">
            <span className="frame__name">{f.name}</span>
            {f.vars && <span className="frame__vars">{f.vars}</span>}
          </span>
          {!plain && (
            <span className="frame__state">
              {f.state === "cur" ? "running" : f.state === "wait" ? "waiting" : <span className="verdict verdict--ok">returns {f.ret}</span>}
            </span>
          )}
        </div>
      ))}
      <div className="stack__floor" aria-hidden="true" />
    </div>
  );
}

/* ---------- Tree: recursion trees, decision trees, heaps ---------- */

export type TNode = {
  id: string;
  label: string;
  parent?: string;
  state?: Mark | "hidden" | "dup";
  note?: string;
  /** label on the edge from the parent */
  edge?: string;
  /** the edge from the parent has been walked (a decoding or search path): drawn at the 2px mark weight */
  walked?: boolean;
  /** left or right child, for binary trees drawn with `binary` */
  side?: "L" | "R";
  /** a small tag just right of the node: an AVL balance ("+1"), a red-black colour ("R", "B"), a name ("x") */
  tag?: string;
  /** ink: black tag; plain: white tag; bad: a broken rule (red) */
  tagKind?: "ink" | "plain" | "bad";
};

/** Where an edge label goes: beside the middle of the edge, pushed out at right angles to it (away from the tree's middle),
 *  so the line never runs through the letter. Longer labels are pushed further. */
function edgeLabelAt(a: { x: number; y: number }, b: { x: number; y: number }, label: string) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // Words (yes, no, take c, ast) start just beside the middle and run away from the edge, as they always did.
  if (label.length > 2) {
    const side = dx < 0 ? -1 : 1;
    return { x: mx + side * (dx === 0 ? 8 : 6), y: my + 4, textAnchor: side < 0 ? "end" : "start" } as const;
  }
  // Single letters and bits go out at right angles to the edge, on its outer side, so the line never crosses them.
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = dx < 0 ? [-dy / len, dx / len] : dx > 0 ? [dy / len, -dx / len] : [1, 0];
  return { x: mx + nx * 8, y: my + ny * 8 + 4, textAnchor: "middle" } as const;
}

/** `binary` places each node by its in-order position, so a lone right child sits to the right of its parent. */
export function Tree({
  nodes,
  label,
  level = 66,
  unit: unitIn,
  binary = false,
  slide = false,
  forestGap = 0.35,
  full = false,
}: {
  nodes: TNode[];
  label: string;
  level?: number;
  unit?: number;
  /** never scale the tree down to its box: keep labels at full size and let a Follow box scroll it (DVCQ-5.1) */
  full?: boolean;
  binary?: boolean;
  /** nodes and edges glide to their new places between steps (keep ids stable), as in a rotation */
  slide?: boolean;
  /** extra space between the trees of a forest, in units */
  forestGap?: number;
}) {
  const hatch = useId().replace(/:/g, "");
  const kids = new Map<string, TNode[]>();
  // Several nodes without a parent make a forest (union-find): the trees stand side by side, in list order.
  const roots: TNode[] = [];
  for (const n of nodes) {
    if (n.parent === undefined) roots.push(n);
    else kids.set(n.parent, [...(kids.get(n.parent) ?? []), n]);
  }
  if (!roots.length) return null;
  const w = (n: TNode) => Math.max(34, n.label.length * 8.2 + 16);
  const unit = unitIn ?? Math.max(...nodes.map(w)) + 12;
  // Leaves sit one unit apart, in order; a parent sits over the middle of its children.
  const pos = new Map<string, { x: number; d: number }>();
  let leaf = 0;
  let depth = 0;
  const place = (n: TNode, d: number): number => {
    depth = Math.max(depth, d);
    const c = kids.get(n.id) ?? [];
    const x = c.length === 0 ? leaf++ * unit : (() => {
      const xs = c.map((k) => place(k, d + 1));
      return (xs[0] + xs[xs.length - 1]) / 2;
    })();
    pos.set(n.id, { x, d });
    return x;
  };
  const placeBinary = (n: TNode, d: number) => {
    depth = Math.max(depth, d);
    const c = kids.get(n.id) ?? [];
    const l = c.find((k) => k.side === "L");
    const r = c.find((k) => k.side === "R");
    if (l) placeBinary(l, d + 1);
    pos.set(n.id, { x: leaf++ * unit, d });
    if (r) placeBinary(r, d + 1);
  };
  roots.forEach((r, k) => {
    // a little more room between two trees of a forest than between two siblings
    if (k) leaf += forestGap;
    if (binary) placeBinary(r, 0);
    else place(r, 0);
  });
  const pad = unit / 2 + 4;
  // room on the right for the last node's tag
  const W = (leaf - 1) * unit + pad * 2 + (nodes.some((n) => n.tag) ? 22 : 0);
  // Tags sit just right of their node; in binary mode the next node to the right is always on another level.
  const top = 0;
  const H = depth * level + 30 + 34 + top;
  const P = (id: string) => {
    const p = pos.get(id)!;
    return { x: p.x + pad, y: p.d * level + 18 + top };
  };
  const shown = nodes.filter((n) => n.state !== "hidden");

  const edgePath = (n: TNode) => {
    const a = P(n.parent!);
    const b = P(n.id);
    return `M${a.x},${a.y + 15} L${b.x},${b.y - 15}`;
  };

  return (
    <svg
      className={`tree${slide ? " tree--slide" : ""}`}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      style={full ? { minWidth: W } : { maxWidth: "100%", minWidth: Math.min(W, 520) }}
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern id={hatch} width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6.5" height="6.5" fill="var(--ground-2)" />
          <rect width="1.5" height="6.5" fill="#dedcd5" />
        </pattern>
      </defs>
      {shown.map((n) => {
        if (n.parent === undefined) return null;
        const a = P(n.parent);
        const b = P(n.id);
        const faint = n.state === "todo";
        const d = edgePath(n);
        return (
          <g key={`e-${n.id}`}>
            <path
              className="tree__line"
              d={d}
              style={slide ? ({ d: `path("${d}")` } as CSSProperties) : undefined}
              stroke={faint ? "#a3a29b" : "var(--ink)"}
              strokeWidth={n.walked ? 2 : 1.5}
              strokeDasharray={faint ? "4 4" : undefined}
              fill="none"
            />
            {n.edge && (
              <text {...edgeLabelAt(a, b, n.edge)} className="tree__edge">
                {n.edge}
              </text>
            )}
          </g>
        );
      })}
      {shown.map((n) => {
        const at = P(n.id);
        // When sliding, the group moves by transform and the node is drawn around (0, 0).
        const { x, y } = slide ? { x: 0, y: 0 } : at;
        const nw = w(n);
        const s = n.state ?? "";
        const tw = n.tag ? Math.max(16, n.tag.length * 7 + 8) : 0;
        return (
          <g key={n.id} className={`tnode is-${s || "plain"}`} style={slide ? { transform: `translate(${at.x}px, ${at.y}px)` } : undefined}>
            <rect x={x - nw / 2} y={y - 15} width={nw} height={30} style={s === "out" ? { fill: `url(#${hatch})` } : undefined} />
            {s === "found" && <rect className="tnode__inner" x={x - nw / 2 + 4.5} y={y - 10.5} width={nw - 9} height={21} />}
            <text x={x} y={y + 4.5} textAnchor="middle">
              {n.label}
            </text>
            {n.tag && (
              <g className={`tnode__flag tnode__flag--${n.tagKind ?? "ink"}`}>
                <rect x={x + nw / 2 + 3} y={y - 7.5} width={tw} height={15} />
                <text x={x + nw / 2 + 3 + tw / 2} y={y + 3.5} textAnchor="middle">
                  {n.tag}
                </text>
              </g>
            )}
            {s === "dup" && (
              <g>
                <rect className="tnode__tag" x={x + nw / 2 - 30} y={y - 24} width={38} height={14} />
                <text className="tnode__tagtext" x={x + nw / 2 - 11} y={y - 13.5} textAnchor="middle">
                  AGAIN
                </text>
              </g>
            )}
            {n.note && (
              <text x={x} y={y + 31} textAnchor="middle" className="tnode__note">
                {n.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Grid: matrices and boards, with blue row and column plates ---------- */

/** Where a DP table cell's value came from: the cell above, the cell to the left, or the cell above-left. */
export type GFrom = "up" | "left" | "diag";

export type GCell = {
  v?: string | number;
  /** `path` marks a cell on a traced-back path (DYNP-9) */
  s?: Mark | "path";
  tag?: string | number;
  /** a small arrow at the cell's edge, pointing to the cell its value came from (2px mark) */
  from?: GFrom | GFrom[];
  /** this cell is being read to work out the current one: a dashed outline */
  src?: boolean;
  /** smaller text, for a value of four characters or more ("−128") */
  small?: boolean;
  /** no frame and no fill: a place with nothing in it, such as the columns a shifted pattern does not cover (STRG) */
  blank?: boolean;
};

const FROM_WORDS: Record<GFrom, string> = { up: "from above", left: "from the left", diag: "from above-left" };

function FromArrow({ dir }: { dir: GFrom }) {
  const d = dir === "up" ? "M6 11V2M2.5 5.5 6 2l3.5 3.5" : dir === "left" ? "M11 6H2M5.5 2.5 2 6l3.5 3.5" : "M11 11 2 2M2 7V2h5";
  return (
    <svg className={`cell__from cell__from--${dir}`} viewBox="0 0 12 12" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** A plate in a Grid head: a number or a letter; an empty string is a muted plate (the empty prefix). */
function HeadPlate({ v }: { v: string | number }) {
  return <span className={v === "" ? "is-empty" : undefined}>{v === "" ? "–" : v}</span>;
}

export function Grid({
  cells,
  label,
  showIdx = true,
  colHead,
  rowHead,
  rowHeadWidth,
}: {
  cells: GCell[][];
  label: string;
  showIdx?: boolean;
  /** labels for the column plates instead of 0, 1, 2, … (letters of a string, capacities) */
  colHead?: (string | number)[];
  /** labels for the row plates instead of 0, 1, 2, …; null leaves a row without a plate */
  rowHead?: (string | number | null)[];
  /** width of the row-plate column in px, for word labels such as "best" */
  rowHeadWidth?: number;
}) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const style = { "--cols": cols, ...(rowHeadWidth ? { "--rh": `${rowHeadWidth}px` } : {}) } as CSSProperties;
  return (
    <div className={`grid2${cols >= 8 ? " grid2--wide" : ""}`} style={style} role="table" aria-label={label}>
      {showIdx && (
        <div className="grid2__row" role="row" aria-hidden="true">
          <span className="grid2__corner" />
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} className="track__idx">
              <HeadPlate v={colHead?.[c] ?? c} />
            </span>
          ))}
        </div>
      )}
      {cells.map((row, r) => (
        <div key={r} className="grid2__row" role="row">
          {showIdx && (
            <span className="grid2__ridx" aria-hidden="true">
              {rowHead?.[r] !== null && <HeadPlate v={rowHead?.[r] ?? r} />}
            </span>
          )}
          {row.map((c, k) => {
            const from = c.from === undefined ? [] : Array.isArray(c.from) ? c.from : [c.from];
            return (
              <span
                key={k}
                role="cell"
                className={`cell${c.s ? ` is-${cellClass(c.s)}` : ""}${c.src ? " is-target" : ""}${c.small ? " is-small" : ""}${c.blank ? " is-blank" : ""}`}
                aria-label={`row ${r}, column ${k}: ${c.v ?? "empty"}${c.s === "cur" ? ", current" : c.s === "out" ? ", done" : c.s === "bad" ? ", conflict" : c.s === "path" ? ", on the path" : ""}${c.src ? ", being read" : ""}${from.length ? `, ${from.map((f) => FROM_WORDS[f]).join(" and ")}` : ""}`}
              >
                {c.v}
                {c.tag !== undefined && <span className="cell__tag num">{c.tag}</span>}
                {c.s !== "found" && from.map((f) => <FromArrow key={f} dir={f} />)}
                {c.s === "found" && (
                  <span className="cell__flag" aria-hidden="true">
                    <Check size={13} strokeWidth={3.25} />
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ))}
      {rows === 0 && <span />}
    </div>
  );
}

function cellClass(s: Mark | "path") {
  return s === "cur" ? "mid" : s === "bad" ? "violated" : s;
}

/* ---------- Chain: objects joined by references, with name tags as trains ---------- */

export function Chain({ values, states = [], names }: { values: (string | number)[]; states?: Mark[]; names: Pointer[] }) {
  return (
    <div className="chain" style={{ "--n": values.length } as CSSProperties}>
      <div className="chain__row" role="list" aria-label="Nodes, in order">
        {values.map((v, k) => (
          <div key={k} className="chain__item" role="listitem" aria-label={`node ${k + 1}, value ${v}, next ${k < values.length - 1 ? `is node ${k + 2}` : "is None"}`}>
            <span className={`chain__node${states[k] ? ` is-${cellClass(states[k])}` : ""}`}>
              <span className="chain__val">{v}</span>
              <span className="chain__next" aria-hidden="true" />
            </span>
            <span className="chain__arrow" aria-hidden="true" />
          </div>
        ))}
        <span className="plate plate--sm plate--muted chain__none">None</span>
      </div>
      <div className="rails chain__rails" aria-hidden="true">
        {names.map((p) => (
          <div className="rail" key={p.name}>
            <span className="rail__name">{p.name}</span>
            <div className={`train${p.kind ? ` train--${p.kind}` : ""}${p.at === null ? " is-off" : ""}`} style={{ "--at": p.at ?? 0 } as CSSProperties}>
              <span className="train__body">{p.at === null ? "" : (p.show ?? `node ${p.at + 1}`)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- A bar inside a timetable cell ---------- */

export function Bar({ frac, label }: { frac: number; label?: string }) {
  const off = frac > 1;
  return (
    <span className={`tbar${off ? " is-off" : ""}`} aria-label={label}>
      <span className="tbar__fill" style={{ transform: `scaleX(${Math.max(0, Math.min(1, frac))})` }} />
      {off && <span className="tbar__off">off the scale</span>}
    </span>
  );
}

/* ---------- A visible name over a track, for figures with more than one ---------- */

export function Named({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="named-track">
      <span className="plate plate--sm plate--muted named-track__name">{name}</span>
      <div className="named-track__body">{children}</div>
    </div>
  );
}

/* ---------- Links: linked nodes whose references can be rewired, with name tags on rails ---------- */

export type LNode = {
  id: string;
  label: string | number;
  /** slot from the left (may be a fraction, for a node waiting between two others) */
  x: number;
  /** 0 is the main row; -1 sits above it, 1 below */
  row?: number;
  state?: Mark | "hidden";
  /** a None end marker instead of a node */
  none?: boolean;
};
export type LEdge = { from: string; to: string; kind?: "next" | "prev"; state?: "" | "cur" | "old" | "bad" };
export type LName = { name: string; at: string | null; kind?: "mid" | "blue" };

const LU = 96; // slot width
const LU_PHONE = 80; // narrower slots on phones, where the list is drawn full size and scrolls in Follow
const LH = 40; // node height
const LR = 96; // row spacing

export function Links({
  nodes,
  edges,
  names = [],
  label,
  double = false,
}: {
  nodes: LNode[];
  edges: LEdge[];
  names?: LName[];
  label: string;
  double?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  // On phones a scaled-down list made its values about 7px. Draw it full size with narrower nodes instead;
  // the figure wraps it in Follow, which scrolls to the current node.
  const compact = useCompact();
  const U = compact ? LU_PHONE : LU;
  const shown = nodes.filter((n) => n.state !== "hidden");
  const by = new Map(shown.map((n) => [n.id, n]));
  const nw = (n: LNode) => (n.none ? 52 : double ? (compact ? 80 : 92) : compact ? 60 : 70);
  // On phones each train also carries its own name ("cur 5"), so a rail keeps its name however far the list is
  // scrolled; the narrower name gutter still names the rails at the start.
  const padL = names.length ? (compact ? 50 : 58) : 12;
  const trainText = (name: string, v: string | number) => (compact ? `${name} ${v}` : String(v));
  const trainW = (t: string, min: number) => (compact ? Math.max(min, Math.round(t.length * 7.6 + 14)) : min);
  const arc = (e: LEdge) => Math.min(30 + 12 * Math.abs(by.get(e.to)!.x - by.get(e.from)!.x), 72);
  const back = (e: LEdge) => {
    const a = by.get(e.from)!;
    const b = by.get(e.to)!;
    return e.kind === "prev" ? b.x >= a.x : b.x <= a.x;
  };
  const live = edges.filter((e) => by.has(e.from) && by.has(e.to));
  const rows = shown.map((n) => n.row ?? 0);
  const minRow = Math.min(0, ...rows);
  const maxRow = Math.max(0, ...rows);
  const upArc = Math.max(0, ...live.filter((e) => back(e) && e.kind !== "prev" && (by.get(e.to)!.row ?? 0) === minRow).map(arc));
  const downArc = Math.max(0, ...live.filter((e) => back(e) && e.kind === "prev" && (by.get(e.to)!.row ?? 0) === maxRow).map(arc));
  const top = 12 + upArc;
  const maxX = Math.max(0, ...shown.map((n) => n.x));
  const W = padL + maxX * U + (double ? 92 : 70) + 12;
  const rowsBottom = top + (maxRow - minRow) * LR + LH + downArc;
  const railY = (k: number) => rowsBottom + 26 + k * 32;
  const H = names.length ? railY(names.length - 1) + 22 : rowsBottom + 12;
  const box = (n: LNode) => {
    const left = padL + n.x * U;
    const y = top + ((n.row ?? 0) - minRow) * LR;
    return { left, right: left + nw(n), cx: left + nw(n) / 2, top: y, bottom: y + LH, cy: y + LH / 2 };
  };
  const off = double ? 8 : 0;

  const path = (e: LEdge) => {
    const a = box(by.get(e.from)!);
    const tn = by.get(e.to)!;
    const b = box(tn);
    const prev = e.kind === "prev";
    const S = prev ? { x: a.left + 11, y: a.cy + off } : { x: a.right - 12, y: a.cy - off };
    // Between rows: leave the dot upwards or downwards and enter the target through its top or bottom.
    const ra = by.get(e.from)!.row ?? 0;
    const rb = tn.row ?? 0;
    if (ra !== rb) {
      const down = rb > ra ? 1 : -1;
      const T = { x: b.cx + (tn.none ? 0 : prev ? 6 : -6), y: down > 0 ? b.top - 2 : b.bottom + 2 };
      const k = Math.max(24, Math.abs(T.y - S.y) / 2);
      return `M${S.x},${S.y} C${S.x},${S.y + down * k} ${T.x},${T.y - down * k} ${T.x},${T.y}`;
    }
    if (back(e)) {
      const h = arc(e);
      if (prev) {
        const T = { x: b.cx + 6, y: b.bottom };
        return `M${S.x},${S.y} C${S.x},${S.y + h + 6} ${T.x},${T.y + h} ${T.x},${T.y + 2}`;
      }
      const T = { x: b.cx - (tn.none ? 0 : 6), y: b.top };
      return `M${S.x},${S.y} C${S.x},${S.y - h - 6} ${T.x},${T.y - h} ${T.x},${T.y - 2}`;
    }
    const T = prev ? { x: b.right + 2, y: b.cy + (tn.none ? 0 : off) } : { x: b.left - 2, y: b.cy - (tn.none ? 0 : off) };
    if (Math.abs(T.y - S.y) < 1) return `M${S.x},${S.y} L${T.x},${T.y}`;
    const k = Math.max(26, Math.abs(T.x - S.x) / 2);
    const d = prev ? -1 : 1;
    return `M${S.x},${S.y} C${S.x + d * k},${S.y} ${T.x - d * k},${T.y} ${T.x},${T.y}`;
  };

  const name = (id: string) => (by.get(id)!.none ? "None" : String(by.get(id)!.label));
  const desc = live
    .filter((e) => e.state !== "old")
    .map((e) => `${name(e.from)} ${e.kind === "prev" ? "prev" : "next"} is ${name(e.to)}`)
    .join("; ");
  const named = names.map((p) => `${p.name} refers to ${p.at && by.has(p.at) ? name(p.at) : "None"}`).join("; ");

  return (
    <svg
      className="links"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      style={compact ? { maxWidth: "none" } : { maxWidth: "100%", minWidth: Math.min(W, 470) }}
      role="img"
      aria-label={`${label}. ${desc}${named ? `. ${named}` : ""}`}
    >
      <defs>
        {(["ink", "old", "bad"] as const).map((c) => (
          <marker
            key={c}
            id={`${uid}-${c}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={c === "ink" ? "var(--ink)" : c === "bad" ? "var(--red)" : "#a3a29b"} />
          </marker>
        ))}
        <pattern id={`${uid}-h`} width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6.5" height="6.5" fill="var(--ground-2)" />
          <rect width="1.5" height="6.5" fill="#dedcd5" />
        </pattern>
      </defs>
      {names.map((p, k) => {
        const n = p.at ? by.get(p.at) : undefined;
        const y = railY(k);
        return (
          <g key={`r-${p.name}`} className="links__rail">
            <text x={4} y={y + 4.5} className="links__railname">
              {p.name}
            </text>
            <line x1={padL - 6} x2={W - 4} y1={y - 3} y2={y - 3} />
            <line x1={padL - 6} x2={W - 4} y1={y + 3} y2={y + 3} />
            {n ? (
              (() => {
                const t = trainText(p.name, n.none ? "None" : n.label);
                const tw = trainW(t, 54);
                return (
                  <g className={`links__train${p.kind ? ` links__train--${p.kind}` : ""}`} style={{ transform: `translate(${box(n).cx}px, ${y}px)` }}>
                    <rect x={-tw / 2} y={-11} width={tw} height={22} />
                    <text y={4.5} textAnchor="middle">
                      {t}
                    </text>
                  </g>
                );
              })()
            ) : (
              (() => {
                const t = trainText(p.name, "None");
                const tw = trainW(t, 44);
                return (
                  <g className="links__off">
                    <rect x={padL} y={y - 10} width={tw} height={20} />
                    <text x={padL + tw / 2} y={y + 4} textAnchor="middle">
                      {t}
                    </text>
                  </g>
                );
              })()
            )}
          </g>
        );
      })}
      {live.map((e, k) => {
        const st = e.state ?? "";
        return (
          <path
            key={`e-${e.from}-${e.kind ?? "next"}-${k}`}
            d={path(e)}
            fill="none"
            className={`links__edge${st ? ` is-${st}` : ""}`}
            markerEnd={`url(#${uid}-${st === "old" ? "old" : st === "bad" ? "bad" : "ink"})`}
          />
        );
      })}
      {shown.map((n) => {
        const b = box(n);
        if (n.none)
          return (
            <g key={n.id} className="links__none" style={{ transform: `translate(${b.left}px, ${b.top}px)` }}>
              <rect x={0} y={LH / 2 - 12} width={52} height={24} />
              <text x={26} y={LH / 2 + 4.5} textAnchor="middle">
                None
              </text>
            </g>
          );
        const s = n.state ?? "";
        const w = nw(n);
        const valL = double ? 22 : 0;
        return (
          <g key={n.id} className={`tnode lnode is-${s || "plain"}`} style={{ transform: `translate(${b.left}px, ${b.top}px)` }}>
            <rect x={0} y={0} width={w} height={LH} style={s === "out" ? { fill: `url(#${uid}-h)` } : undefined} />
            {s === "found" && <rect className="tnode__inner" x={4.5} y={4.5} width={w - 9} height={LH - 9} />}
            {double && <line className="lnode__div" x1={22} x2={22} y1={0} y2={LH} />}
            <line className="lnode__div" x1={w - 24} x2={w - 24} y1={0} y2={LH} />
            <text x={valL + (w - 24 - valL) / 2} y={LH / 2 + 5.5} textAnchor="middle" className={`lnode__val${String(n.label).length > 3 ? " is-small" : ""}`}>
              {n.label}
            </text>
            <circle className="lnode__dot" cx={w - 12} cy={LH / 2 - off} r={3.5} />
            {double && <circle className="lnode__dot" cx={11} cy={LH / 2 + off} r={3.5} />}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- HashTable: buckets with chains (chaining) or one key per slot (open addressing) ---------- */

export type HEntry = { label: string | number; sub?: string | number; state?: Mark };
/** One bucket or slot. In slots mode a row holds at most one entry; `tomb` marks a deleted slot. */
export type HRow = { entries: HEntry[]; tomb?: boolean; state?: Mark };
export type HMark = { row: number; name: string };

export function HashTable({
  rows,
  mode,
  marks = [],
  label,
}: {
  rows: HRow[];
  mode: "chain" | "slots";
  marks?: HMark[];
  label: string;
}) {
  const markAt = new Map(marks.map((m) => [m.row, m.name]));
  const hasMarks = marks.length > 0;
  const say = (r: HRow, i: number) => {
    const head = `${mode === "chain" ? "bucket" : "slot"} ${i}`;
    if (r.tomb) return `${head}: deleted marker`;
    if (r.entries.length === 0) return `${head}: empty`;
    return `${head}: ${r.entries.map((e) => `${e.label}${e.sub !== undefined ? ` ${e.sub}` : ""}${e.state === "cur" ? " (current)" : e.state === "found" ? " (found)" : e.state === "bad" ? " (wrong)" : ""}`).join(", then ")}`;
  };
  return (
    <div className={`htable htable--${mode}${hasMarks ? " has-marks" : ""}`} role="list" aria-label={label}>
      {rows.map((r, i) => {
        const here = markAt.get(i);
        return (
          <div key={i} className="htable__row" role="listitem" aria-label={`${say(r, i)}${here ? `; ${here} is here` : ""}`}>
            {hasMarks && (
              <span className="htable__mark" aria-hidden="true">
                {here && <span className="htable__train">{here}</span>}
              </span>
            )}
            <span className={`track__idx htable__idx${here ? " is-here" : ""}`} aria-hidden="true">
              <span>{i}</span>
            </span>
            {mode === "slots" ? (
              <span
                className={`htable__slot${r.tomb ? " is-tomb" : ""}${r.entries[0]?.state ? ` is-${r.entries[0].state}` : r.state ? ` is-${r.state}` : ""}`}
                aria-hidden="true"
              >
                {r.tomb ? <span className="htable__tomb">deleted</span> : r.entries[0] && <Entry e={r.entries[0]} />}
              </span>
            ) : (
              <span className="htable__chain" aria-hidden="true">
                <span className={`htable__head${r.entries.length ? " is-full" : ""}${r.state ? ` is-${r.state}` : ""}`} />
                {r.entries.map((e, k) => (
                  <Fragment key={k}>
                    <span className="htable__arrow" />
                    <span className={`htable__node${e.state ? ` is-${e.state}` : ""}`}>
                      <Entry e={e} />
                    </span>
                  </Fragment>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Entry({ e }: { e: HEntry }) {
  return (
    <>
      <span className="htable__key">{e.label}</span>
      {e.sub !== undefined && <span className="htable__sub">{e.sub}</span>}
      {e.state === "found" && (
        <span className="cell__flag" aria-hidden="true">
          <Check size={12} strokeWidth={3.25} />
        </span>
      )}
    </>
  );
}

/* ---------- SkipList: levels of linked lists over one sorted row (BALT) ---------- */

export type SkipEdge = "" | "cur" | "old" | "bad";

/** Draws a skip list. Column -1 is the head; each key has a tower of `heights[k]` nodes (0 keeps the column
 *  empty, so a key can appear later without the others moving). States and edges are keyed "level:col",
 *  level 0 being the bottom list; an edge is named by the node it leaves. */
export function SkipList({
  keys,
  heights,
  levels,
  states = {},
  edges = {},
  label,
}: {
  keys: (number | string)[];
  heights: number[];
  levels: number;
  states?: Record<string, Mark>;
  edges?: Record<string, SkipEdge>;
  label: string;
}) {
  const uid = useId().replace(/:/g, "");
  const CW = 58;
  const RH = 46;
  const NW = 42;
  const NH = 28;
  const padL = 34;
  const top = 8;
  const n = keys.length;
  const colX = (c: number) => padL + (c + 1) * CW;
  const rowY = (lv: number) => top + (levels - 1 - lv) * RH;
  const endX = colX(n);
  const W = endX + 52 + 8;
  const H = top + levels * RH + 18;
  const next = (lv: number, c: number) => {
    for (let k = c + 1; k < n; k++) if (heights[k] > lv) return k;
    return n;
  };
  const rows = Array.from({ length: levels }, (_, lv) => lv);
  const desc = rows
    .slice()
    .reverse()
    .map((lv) => `level ${lv}: ${keys.filter((_, k) => heights[k] > lv).join(", ") || "empty"}`)
    .join("; ");
  return (
    <svg className="skip" viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: "100%", minWidth: Math.min(W, 470) }} role="img" aria-label={`${label}. ${desc}`}>
      <defs>
        {(["ink", "old", "bad"] as const).map((c) => (
          <marker key={c} id={`${uid}-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={c === "ink" ? "var(--ink)" : c === "bad" ? "var(--red)" : "#a3a29b"} />
          </marker>
        ))}
        <pattern id={`${uid}-h`} width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6.5" height="6.5" fill="var(--ground-2)" />
          <rect width="1.5" height="6.5" fill="#dedcd5" />
        </pattern>
      </defs>
      {rows.map((lv) => {
        const y = rowY(lv);
        return (
          <g key={`lv-${lv}`}>
            <g className="skip__lvl">
              <rect x={2} y={y + NH / 2 - 10} width={22} height={20} />
              <text x={13} y={y + NH / 2 + 4.5} textAnchor="middle">
                {lv}
              </text>
            </g>
            {[-1, ...keys.map((_, k) => k)]
              .filter((c) => c === -1 || heights[c] > lv)
              .map((c) => {
                const to = next(lv, c);
                const st = edges[`${lv}:${c}`] ?? "";
                const x1 = (c === -1 ? colX(-1) + 30 : colX(c) + NW) + 1;
                const x2 = (to === n ? endX : colX(to)) - 2;
                return (
                  <path
                    key={`e-${lv}-${c}`}
                    d={`M${x1},${y + NH / 2} L${x2},${y + NH / 2}`}
                    className={`links__edge${st ? ` is-${st}` : ""}`}
                    markerEnd={`url(#${uid}-${st === "old" ? "old" : st === "bad" ? "bad" : "ink"})`}
                  />
                );
              })}
            <g className={`skip__head is-${states[`${lv}:-1`] || "plain"}`}>
              <rect x={colX(-1)} y={y} width={30} height={NH} />
              <circle cx={colX(-1) + 15} cy={y + NH / 2} r={3} />
            </g>
            <g className="links__none">
              <rect x={endX} y={y + NH / 2 - 12} width={52} height={24} />
              <text x={endX + 26} y={y + NH / 2 + 4.5} textAnchor="middle">
                None
              </text>
            </g>
            {keys.map((key, c) => {
              if (heights[c] <= lv) return null;
              const st = states[`${lv}:${c}`] ?? "";
              const x = colX(c);
              return (
                <g key={`n-${lv}-${c}`} className={`tnode is-${st || "plain"}`}>
                  <rect x={x} y={y} width={NW} height={NH} style={st === "out" ? { fill: `url(#${uid}-h)` } : undefined} />
                  {st === "found" && <rect className="tnode__inner" x={x + 4.5} y={y + 4.5} width={NW - 9} height={NH - 9} />}
                  <text x={x + NW / 2} y={y + NH / 2 + 4.5} textAnchor="middle">
                    {key}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <text x={colX(-1) + 15} y={H - 4} textAnchor="middle" className="skip__foot">
        head
      </text>
    </svg>
  );
}

/* ---------- Spans: rows of range bars over an array (Fenwick, segment tree, blocks) ---------- */

/** A bar covers cells l..r of the array below it (inclusive, counted from the first cell). */
export type SpanBar = { l: number; r: number; label: string | number; state?: Mark; tag?: string };
export type SpanRow = { name?: string; bars: SpanBar[] };

/** Rows of bars drawn on the same columns as an ArrayTrack of `n` cells, so a bar sits exactly over the cells it
 *  covers. Put it directly above (or below) the track in a `stage-stack`. A row name sits in the left margin,
 *  where the track keeps its rail names. A tag is a small ink flag on the bar's top right (a lazy "+3"). */
export function Spans({ n, rows, label }: { n: number; rows: SpanRow[]; label: string }) {
  return (
    <div className="spans" style={{ "--n": n } as CSSProperties} role="img" aria-label={label}>
      {rows.map((row, k) => (
        <div key={k} className="spans__row">
          {row.name && (
            <span className="spans__name" aria-hidden="true">
              {row.name}
            </span>
          )}
          {row.bars.map((b) => (
            <span
              key={`${b.l}-${b.r}`}
              className={`spans__bar is-${b.state || "plain"}`}
              style={{ gridColumn: `${b.l + 1} / ${b.r + 2}` }}
            >
              <span className="spans__label">{b.label}</span>
              {b.tag && <span className="spans__tag">{b.tag}</span>}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Timeline: intervals as bars over a time axis (GRDY) ---------- */

/** A bar covers the half-open time [from, to). Keep `id` stable across steps: a bar that moves in time glides. */
/** `tagAt: "end"` puts the tag just outside the bar's right end instead of on its top-right corner, for short bars
 *  whose label the corner tag would cover (GRDY-3.1's "skip"). */
export type TBar = { id: string; from: number; to: number; label: string; state?: Mark; tag?: string; tagKind?: "ink" | "plain" | "bad"; tagAt?: "corner" | "end" };
export type TRow = { name?: string; bars: TBar[] };
/** A vertical line at a time: `blue` for a position (now, free from), `dash` for a limit (a deadline). */
export type TMark = { at: number; label: string; kind?: "blue" | "dash" };

/** Rows of interval bars placed by time over a numbered axis from `from` to `to`. The plot is fluid, so it always
 *  fits the stage; bars and marks are placed in percent of the time span. Row names sit in a left margin. */
export function Timeline({ from, to, rows, marks = [], label }: { from: number; to: number; rows: TRow[]; marks?: TMark[]; label: string }) {
  const span = to - from;
  const pct = (t: number) => `${((t - from) / span) * 100}%`;
  const ticks = Array.from({ length: span + 1 }, (_, k) => from + k);
  return (
    <div
      className={`tline${marks.length ? " tline--marks" : ""}${span > 8 ? " tline--dense" : ""}`}
      style={{ "--span": span } as CSSProperties}
      role="img"
      aria-label={label}
    >
      <div className="tline__plot">
        {marks.map((m) => (
          <span key={`${m.label}-${m.at}`} className={`tline__mark tline__mark--${m.kind ?? "blue"}`} style={{ left: pct(m.at) }}>
            <span className="tline__marklabel">{m.label}</span>
          </span>
        ))}
        {rows.map((row, k) => (
          <div key={k} className="tline__row">
            {row.name && (
              <span className="tline__name" aria-hidden="true">
                {row.name}
              </span>
            )}
            {row.bars.map((b) => (
              <span key={b.id} className={`tline__bar is-${b.state || "plain"}`} style={{ left: pct(b.from), width: `calc(${((b.to - b.from) / span) * 100}% - 3px)` }}>
                <span className="tline__label">{b.label}</span>
                {b.tag && <span className={`tline__tag tline__tag--${b.tagKind ?? "ink"}${b.tagAt === "end" ? " tline__tag--end" : ""}`}>{b.tag}</span>}
              </span>
            ))}
          </div>
        ))}
        <div className="tline__axis" aria-hidden="true">
          {ticks.map((t, k) => (
            <span key={t} className={`tline__tick${k % 2 ? " is-odd" : ""}`} style={{ left: pct(t) }}>
              <span className="tline__num">{t}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Plane: points on a grid of whole-number coordinates (DVCQ closest pair; GEOM later) ---------- */

/** A point with a short label. `lp` moves the label: right (default), left, above or below the point. */
export type PPoint = { id: string; x: number; y: number; state?: Mark; lp?: "r" | "l" | "t" | "b"; label?: string };
/** A line joining two points: `cur` the pair being compared, `found` the best pair so far, `old` a pair already
 *  compared, `bad` a pair that breaks a rule. `label` sits at its middle (a distance). */
export type PSeg = { a: string; b: string; state?: "" | "cur" | "found" | "old" | "bad"; label?: string; arrow?: boolean };
/** A filled polygon through the listed points (GEOM): `pale` an area being measured or a hull (Board Pale),
 *  `out` an area that is taken away (hatched), `shade` a quiet area. Drawn under the grid lines. */
export type PPoly = { pts: string[]; kind?: "pale" | "out" | "shade" };
/** A vertical line at x: `blue` for a position (the dividing line), `dash` for a limit (the edge of a strip). */
export type PLine = { x: number; label?: string; kind?: "blue" | "dash" };
/** A rectangle from (x1, y1) to (x2, y2). `box` is drawn in ink and can be split into nx by ny squares;
 *  `strip` is the pale band around the dividing line; `shade` is a quiet area that is not being looked at. */
export type PBox = { x1: number; y1: number; x2: number; y2: number; nx?: number; ny?: number; kind?: "box" | "shade" | "strip"; label?: string };

/** Points on a plane, with y going up. The drawing is measured to its box, so it is always as wide as the stage
 *  (640px at most) and its labels keep their size on a phone. Every coordinate must lie in 0..w and 0..h. */
export function Plane({
  w,
  h,
  points,
  segs = [],
  lines = [],
  boxes = [],
  polys = [],
  label,
}: {
  w: number;
  h: number;
  points: PPoint[];
  segs?: PSeg[];
  lines?: PLine[];
  boxes?: PBox[];
  polys?: PPoly[];
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(560);
  const hatch = useId().replace(/:/g, "");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setBox(Math.min(640, el.clientWidth || 560));
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = 26; // room for the y numbers
  const R = 18;
  const B = 22; // room for the x numbers
  const u = Math.max(12, (box - L - R) / w);
  // Line labels sit above the plot. If two of them would touch, the limit labels (dashed lines) move up a row.
  const plateW = (l: PLine) => (l.label ? l.label.length * 6.7 + 8 : 0);
  const spans = lines.filter((l) => l.label).map((l) => ({ a: L + l.x * u - plateW(l) / 2, b: L + l.x * u + plateW(l) / 2 }));
  const crowded = spans.some((p, i) => spans.some((q, j) => i < j && p.a < q.b + 3 && q.a < p.b + 3));
  const T = crowded ? 43 : 26; // room for line labels
  const W = L + R + u * w;
  const H = T + B + u * h;
  const X = (x: number) => L + x * u;
  const Y = (y: number) => T + (h - y) * u;
  const at = new Map(points.map((p) => [p.id, p]));
  const every = u < 22 ? 2 : 1;
  const quiet = boxes.filter((b) => b.kind === "shade" || b.kind === "strip");
  const drawn = boxes.filter((b) => !b.kind || b.kind === "box");
  return (
    <div ref={ref} className="plane">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <defs>
          <pattern id={hatch} width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6.5" height="6.5" fill="var(--ground-2)" />
            <rect width="1.5" height="6.5" fill="#dedcd5" />
          </pattern>
        </defs>
        {quiet.map((b, k) => (
          <rect
            key={`q${k}`}
            className={`plane__${b.kind}`}
            x={X(Math.min(b.x1, b.x2))}
            y={Y(Math.max(b.y1, b.y2))}
            width={Math.abs(b.x2 - b.x1) * u}
            height={Math.abs(b.y2 - b.y1) * u}
          />
        ))}
        {polys.map((pg, k) => {
          const pts = pg.pts.map((id) => at.get(id)).filter((p): p is PPoint => !!p);
          const kind = pg.kind ?? "pale";
          return (
            <polygon
              key={`pg${k}`}
              className={`plane__poly plane__poly--${kind}`}
              points={pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")}
              style={kind === "out" ? { fill: `url(#${hatch})` } : undefined}
            />
          );
        })}
        <g className="plane__grid" aria-hidden="true">
          {Array.from({ length: w + 1 }, (_, k) => (
            <line key={`gx${k}`} x1={X(k)} x2={X(k)} y1={Y(0)} y2={Y(h)} />
          ))}
          {Array.from({ length: h + 1 }, (_, k) => (
            <line key={`gy${k}`} x1={X(0)} x2={X(w)} y1={Y(k)} y2={Y(k)} />
          ))}
        </g>
        <g className="plane__axis" aria-hidden="true">
          <line x1={X(0)} x2={X(w)} y1={Y(0)} y2={Y(0)} />
          <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(h)} />
          {Array.from({ length: w + 1 }, (_, k) =>
            k % every ? null : (
              <text key={`nx${k}`} x={X(k)} y={Y(0) + 15} textAnchor="middle">
                {k}
              </text>
            ),
          )}
          {Array.from({ length: h + 1 }, (_, k) =>
            k % every || k === 0 ? null : (
              <text key={`ny${k}`} x={X(0) - 7} y={Y(k) + 4} textAnchor="end">
                {k}
              </text>
            ),
          )}
        </g>
        {drawn.map((b, k) => {
          const x1 = Math.min(b.x1, b.x2);
          const x2 = Math.max(b.x1, b.x2);
          const y1 = Math.min(b.y1, b.y2);
          const y2 = Math.max(b.y1, b.y2);
          const nx = b.nx ?? 1;
          const ny = b.ny ?? 1;
          return (
            <g key={`b${k}`} className="plane__box">
              {Array.from({ length: nx - 1 }, (_, i) => {
                const x = X(x1 + ((x2 - x1) * (i + 1)) / nx);
                return <line key={`bx${i}`} className="plane__cell" x1={x} x2={x} y1={Y(y1)} y2={Y(y2)} />;
              })}
              {Array.from({ length: ny - 1 }, (_, i) => {
                const y = Y(y1 + ((y2 - y1) * (i + 1)) / ny);
                return <line key={`by${i}`} className="plane__cell" x1={X(x1)} x2={X(x2)} y1={y} y2={y} />;
              })}
              <rect className="plane__frame" x={X(x1)} y={Y(y2)} width={(x2 - x1) * u} height={(y2 - y1) * u} />
              {b.label && (
                <text className="plane__boxlabel" x={X(x2) + 5} y={Y(y2) + 11}>
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
        {lines.map((l) => {
          const kind = l.kind ?? "blue";
          const tw = plateW(l);
          const up = crowded && kind === "dash" ? 17 : 0;
          return (
            <g key={`l${l.x}-${kind}`} className={`plane__line plane__line--${kind}`}>
              <line x1={X(l.x)} x2={X(l.x)} y1={Y(h) - 4 - up} y2={Y(0)} />
              {l.label && (
                <g className="plane__plate">
                  <rect x={X(l.x) - tw / 2} y={Y(h) - 21 - up} width={tw} height={15} />
                  <text x={X(l.x)} y={Y(h) - 10 - up} textAnchor="middle">
                    {l.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {segs.map((sg) => {
          const a = at.get(sg.a);
          const b = at.get(sg.b);
          if (!a || !b) return null;
          const st = sg.state || "plain";
          const mx = (X(a.x) + X(b.x)) / 2;
          const my = (Y(a.y) + Y(b.y)) / 2;
          const tw = sg.label ? sg.label.length * 6.9 + 8 : 0;
          // an arrow stops short of its point's square and ends in a head
          const len = Math.hypot(X(b.x) - X(a.x), Y(b.y) - Y(a.y)) || 1;
          const ux = (X(b.x) - X(a.x)) / len;
          const uy = (Y(b.y) - Y(a.y)) / len;
          const tipX = sg.arrow ? X(b.x) - ux * 8 : X(b.x);
          const tipY = sg.arrow ? Y(b.y) - uy * 8 : Y(b.y);
          const head = sg.arrow
            ? `${tipX},${tipY} ${tipX - ux * 10 - uy * 5},${tipY - uy * 10 + ux * 5} ${tipX - ux * 10 + uy * 5},${tipY - uy * 10 - ux * 5}`
            : "";
          return (
            <g key={`${sg.a}-${sg.b}`} className={`plane__seg is-${st}`}>
              {st === "found" && <line className="plane__under" x1={X(a.x)} y1={Y(a.y)} x2={tipX} y2={tipY} />}
              <line x1={X(a.x)} y1={Y(a.y)} x2={sg.arrow ? tipX - ux * 6 : tipX} y2={sg.arrow ? tipY - uy * 6 : tipY} />
              {sg.arrow && <polygon className="plane__head" points={head} />}
              {sg.label && (
                <g className="plane__dist">
                  <rect x={mx - tw / 2} y={my - 8} width={tw} height={16} />
                  <text x={mx} y={my + 4} textAnchor="middle">
                    {sg.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {points.map((p) => {
          const s = p.state || "plain";
          const r = s === "cur" || s === "found" ? 7.5 : 5.5;
          const px = X(p.x);
          const py = Y(p.y);
          const lp = p.lp ?? "r";
          const off = r + 4;
          const tx = lp === "r" ? px + off : lp === "l" ? px - off : px;
          const ty = lp === "t" ? py - off - 2 : lp === "b" ? py + off + 10 : py + 4.5;
          return (
            <g key={p.id} className={`plane__pt is-${s}`}>
              <rect x={px - r} y={py - r} width={r * 2} height={r * 2} style={s === "out" ? { fill: `url(#${hatch})` } : undefined} />
              {s === "found" && <rect className="plane__inner" x={px - r + 3.5} y={py - r + 3.5} width={r * 2 - 7} height={r * 2 - 7} />}
              <text x={tx} y={ty} textAnchor={lp === "r" ? "start" : lp === "l" ? "end" : "middle"}>
                {p.label ?? p.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Graph: vertices at fixed places joined by edges (GRPH; PATH, SPAN, CONN and FLOW reuse it) ---------- */

/** `seen` is a vertex that has been reached but not yet handled (it waits in the queue or on the stack). */
export type GState = Mark | "seen" | "hidden";
/** A vertex at (x, y) in grid units, y going down. Keep `id` and the place the same in every step, so the
 *  drawing never jumps. `label` defaults to the id. A tag sits on the top-right corner: a distance, a side (0 or 1),
 *  discovery and finish times ("1/8"). */
/** `tagAt: "br"` puts the tag on the bottom-right corner instead of the top-right, for a vertex whose edges leave up and
 *  to the right (the bottom row of SPAN-2.1); `"t"` centres it above the vertex, for one with edges at every corner (ADDP-2.1's C);
 *  `"tl"` puts it on the top-left corner, for a vertex an arc comes into from the top right (GRPH-3.1's A). */
export type GNode = { id: string; x: number; y: number; label?: string; state?: GState; tag?: string; tagKind?: "ink" | "plain" | "bad"; tagAt?: "tr" | "br" | "t" | "tl" };
/** `cur` the edge being looked at; `tree` the edge that first reached a vertex; `found` an answer (a route);
 *  `old` looked at and not used; `bad` an edge that breaks a rule; `todo` not there yet (dashed). */
export type GEdgeState = "" | "cur" | "tree" | "found" | "old" | "bad" | "todo" | "hidden";
/** An edge from a to b. `label` is a plate at its middle (a weight, a capacity). `bend` curves it by that many
 *  pixels to one side, for two edges between the same vertices. a === b draws a loop. */
export type GEdge = { a: string; b: string; state?: GEdgeState; label?: string; bend?: number };

const G_WORDS: Partial<Record<GState, string>> = { cur: "current", seen: "waiting", done: "finished", found: "found", out: "skipped", bad: "wrong", todo: "not yet reached" };

/** Vertices and edges. The drawing is measured to its box, as Plane is, so it fits a phone with labels at full
 *  size; the unit is at most `unit` pixels, so a small graph is not blown up on a wide screen. */
export function Graph({
  w,
  h,
  nodes,
  edges,
  directed = false,
  label,
  unit = 84,
}: {
  w: number;
  h: number;
  nodes: GNode[];
  edges: GEdge[];
  directed?: boolean;
  label: string;
  unit?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(460);
  const uid = useId().replace(/:/g, "");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setBox(el.clientWidth || 460);
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const tagged = nodes.some((n) => n.tag);
  const NH = 30;
  const nw = (n: GNode) => Math.max(30, (n.label ?? n.id).length * 8.6 + 14);
  const widest = Math.max(30, ...nodes.map(nw));
  const padL = widest / 2 + 6 + (nodes.some((n) => n.tag && n.tagAt === "tl") ? 26 : 0);
  const padR = widest / 2 + 6 + (tagged ? 26 : 0);
  const loops = edges.some((e) => e.a === e.b && e.state !== "hidden");
  const padT = NH / 2 + 6 + (tagged || loops ? 16 : 0);
  const padB = NH / 2 + 6 + (nodes.some((n) => n.tag && n.tagAt === "br") ? 12 : 0);
  const u = Math.max(20, Math.min(unit, (box - padL - padR) / Math.max(1, w)));
  const W = padL + padR + u * w;
  const H = padT + padB + u * h;
  const at = new Map(nodes.map((n) => [n.id, n]));
  const X = (n: GNode) => padL + n.x * u;
  const Y = (n: GNode) => padT + n.y * u;
  const shown = nodes.filter((n) => n.state !== "hidden");
  const live = edges.filter((e) => e.state !== "hidden" && at.has(e.a) && at.has(e.b) && at.get(e.a)!.state !== "hidden" && at.get(e.b)!.state !== "hidden");

  // The point where the line from the centre of n towards (px, py) leaves n's box, plus `gap` pixels.
  const clip = (n: GNode, px: number, py: number, gap: number) => {
    const cx = X(n);
    const cy = Y(n);
    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    const t = Math.min(dx ? (nw(n) / 2) / Math.abs(dx) : Infinity, dy ? (NH / 2) / Math.abs(dy) : Infinity);
    return { x: cx + dx * t + (dx / len) * gap, y: cy + dy * t + (dy / len) * gap };
  };
  const geo = (e: GEdge) => {
    const A = at.get(e.a)!;
    const B = at.get(e.b)!;
    if (A === B) {
      const x = X(A);
      const top = Y(A) - NH / 2;
      return { d: `M${x - 7},${top} C${x - 26},${top - 30} ${x + 26},${top - 30} ${x + 7},${top - (directed ? 2 : 0)}`, mx: x, my: top - 23 };
    }
    const ax = X(A);
    const ay = Y(A);
    const bx = X(B);
    const by = Y(B);
    const bend = e.bend ?? 0;
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const cx = (ax + bx) / 2 + (-(by - ay) / len) * bend;
    const cy = (ay + by) / 2 + ((bx - ax) / len) * bend;
    const s = clip(A, cx, cy, 0);
    const t = clip(B, cx, cy, directed ? 1.5 : 0);
    if (!bend) return { d: `M${s.x},${s.y} L${t.x},${t.y}`, mx: (s.x + t.x) / 2, my: (s.y + t.y) / 2 };
    return { d: `M${s.x},${s.y} Q${cx},${cy} ${t.x},${t.y}`, mx: (s.x + 2 * cx + t.x) / 4, my: (s.y + 2 * cy + t.y) / 4 };
  };

  const name = (id: string) => at.get(id)!.label ?? id;
  const desc = [
    live.filter((e) => e.state !== "todo").map((e) => `${name(e.a)} ${directed ? "to" : "and"} ${name(e.b)}${e.label ? ` (${e.label})` : ""}`).join(", "),
    shown
      .filter((n) => n.state && G_WORDS[n.state])
      .map((n) => `${name(n.id)} ${G_WORDS[n.state!]}${n.tag ? ` ${n.tag}` : ""}`)
      .join(", "),
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div ref={ref} className="graph">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: "100%" }} role="img" aria-label={`${label}. ${desc}`}>
        <defs>
          {(["ink", "old", "bad"] as const).map((c) => (
            <marker key={c} id={`${uid}-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={c === "ink" ? "var(--ink)" : c === "bad" ? "var(--red)" : "#a3a29b"} />
            </marker>
          ))}
          <pattern id={`${uid}-h`} width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6.5" height="6.5" fill="var(--ground-2)" />
            <rect width="1.5" height="6.5" fill="#dedcd5" />
          </pattern>
        </defs>
        {live.map((e) => {
          const st = e.state || "plain";
          const g = geo(e);
          const marker = directed ? `url(#${uid}-${st === "old" || st === "todo" ? "old" : st === "bad" ? "bad" : "ink"})` : undefined;
          return (
            <g key={`${e.a}-${e.b}-${e.bend ?? 0}`} className={`gedge is-${st}`}>
              {(st === "tree" || st === "found") && <path className="gedge__under" d={g.d} />}
              <path className="gedge__line" d={g.d} markerEnd={marker} />
            </g>
          );
        })}
        {live
          .filter((e) => e.label)
          .map((e) => {
            const g = geo(e);
            const tw = e.label!.length * 6.9 + 8;
            return (
              <g key={`l-${e.a}-${e.b}-${e.bend ?? 0}`} className={`gedge__plate is-${e.state || "plain"}`}>
                <rect x={g.mx - tw / 2} y={g.my - 8} width={tw} height={16} />
                <text x={g.mx} y={g.my + 4} textAnchor="middle">
                  {e.label}
                </text>
              </g>
            );
          })}
        {shown.map((n) => {
          const s = n.state || "plain";
          const x = X(n);
          const y = Y(n);
          const bw = nw(n);
          const tw = n.tag ? Math.max(16, n.tag.length * 6.6 + 8) : 0;
          return (
            <g key={n.id} className={`gnode is-${s}`}>
              <rect x={x - bw / 2} y={y - NH / 2} width={bw} height={NH} style={s === "out" ? { fill: `url(#${uid}-h)` } : undefined} />
              {s === "found" && <rect className="gnode__inner" x={x - bw / 2 + 4.5} y={y - NH / 2 + 4.5} width={bw - 9} height={NH - 9} />}
              <text x={x} y={y + 4.5} textAnchor="middle">
                {n.label ?? n.id}
              </text>
              {n.tag && (
                <g className={`gnode__tag gnode__tag--${n.tagKind ?? "ink"}`}>
                  <rect
                    x={n.tagAt === "t" ? x - tw / 2 : n.tagAt === "tl" ? x - bw / 2 + 8 - tw : x + bw / 2 - 8}
                    y={n.tagAt === "br" ? y + NH / 2 - 4 : n.tagAt === "t" ? y - NH / 2 - 17 : y - NH / 2 - 11}
                    width={tw}
                    height={15}
                  />
                  <text
                    x={n.tagAt === "t" ? x : n.tagAt === "tl" ? x - bw / 2 + 8 - tw / 2 : x + bw / 2 - 8 + tw / 2}
                    y={n.tagAt === "br" ? y + NH / 2 + 7.5 : n.tagAt === "t" ? y - NH / 2 - 5.5 : y - NH / 2 + 0.5}
                    textAnchor="middle"
                  >
                    {n.tag}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Queue: the frontier of a search, as a row of boxes (front at the left, or top at the right) ---------- */

export type QItem = { v: string | number; s?: Mark | "seen" };

/** A queue (`end="front"`: items leave from the left), a stack held in a list (`end="top"`: the right end), or a
 *  plain list such as an output order (`end="none"`). */
export function Queue({ items, name, end = "front", label }: { items: QItem[]; name: string; end?: "front" | "top" | "none"; label?: string }) {
  const words = items.map((q) => String(q.v)).join(", ");
  const say = end === "none" ? "" : `, ${end} is ${end === "front" ? items[0]?.v : items[items.length - 1]?.v}`;
  return (
    <div className="gq" role="img" aria-label={`${label ?? name}: ${items.length ? `${words}${say}` : "empty"}`}>
      <span className="plate plate--sm plate--muted gq__name">{name}</span>
      <div className="gq__box">
        <div className={`gq__row gq__row--${end}`}>
          {items.length === 0 && <span className="gq__empty">empty</span>}
          {items.map((q, k) => (
            <span key={k} className={`gq__item is-${q.s || "plain"}`}>
              {q.v}
            </span>
          ))}
        </div>
        {items.length > 0 && end !== "none" && <span className={`gq__end gq__end--${end}`}>{end}</span>}
      </div>
    </div>
  );
}

/* ---------- Follow: a sideways scroll box that keeps the current mark in view ---------- */

/** Wide trees and lists scroll inside the stage on phones. After each step, scroll just enough to bring the
 *  first current, found or bad node into view, so the learner never has to look for it. */
export function Follow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    // a few pixels over (a found cell's check flag) is not worth a swipe hint
    const over = box.scrollWidth > box.clientWidth + 10;
    if (over !== wide) setWide(over);
    if (!over) return;
    const follow = () => {
      // nothing marked yet (a search before its first step): show the first tree node, the root
      // A marked node comes first: in Links the edges are drawn before the nodes, and a current edge ends at its
      // node's edge, so following it left the node itself cut off.
      // The current mark (the step's one heavy frame) comes before found or bad marks: a decision tree keeps its
      // recorded leaves `found`, and the first of those, at the far left, used to win (RECR-4.1).
      const cur =
        box.querySelector(".tnode.is-cur") ??
        box.querySelector(".tnode.is-found, .tnode.is-bad") ??
        box.querySelector(".is-cur, .cell.is-mid") ??
        box.querySelector(".is-found, .is-bad") ??
        box.querySelector(".tnode");
      if (!cur) return;
      // Scroll only as far as needed, so the start of the row (index plates, the root) stays in view when it can.
      const b = box.getBoundingClientRect();
      const r = cur.getBoundingClientRect();
      const room = 24;
      const roomL = 60; // clear of the pinned rail names
      if (r.left < b.left + roomL && box.scrollLeft > 0) {
        box.scrollLeft -= b.left + roomL - r.left;
        // close to the start: show the start itself, with the rail names of a Links figure
        if (box.scrollLeft < 72) box.scrollLeft = 0;
      } else if (r.right > b.right - room) box.scrollLeft += r.right - (b.right - room);
    };
    follow();
    // Sliding nodes (Tree `slide`, Links nodes moving to new places) reach their places later; look again when they have.
    if (!box.querySelector(".tree--slide, .skip, .links")) return;
    const t = window.setTimeout(follow, 420);
    return () => window.clearTimeout(t);
  });
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const ro = new ResizeObserver(() => setWide(box.scrollWidth > box.clientWidth + 10));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="follow">
      <div ref={ref} className="follow__box">
        {children}
      </div>
      {wide && (
        <p className="follow__hint" aria-hidden="true">
          Wider than the screen: swipe sideways to see the rest.
        </p>
      )}
    </div>
  );
}
