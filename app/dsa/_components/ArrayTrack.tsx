import { Check } from "lucide-react";
import type { CSSProperties } from "react";

// An array drawn as numbered platforms, with one rail per pointer underneath. Pointers are trains:
// each keeps its own rail, so lo, mid and hi never collide, and a move reads as one whole step.

export type CellState = "" | "out" | "mid" | "found" | "violated" | "path";
export type Pointer = { name: string; at: number | null; kind?: "mid" | "blue"; show?: string | number };

export function ArrayTrack({
  values,
  states = [],
  window: win,
  pointers,
  pred,
  target,
  label = "a",
  showIdx = true,
  base = 0,
}: {
  values: (number | string)[];
  states?: CellState[];
  window?: { lo: number; hi: number; label: string; bad?: boolean };
  pointers: Pointer[];
  pred?: (boolean | null)[];
  target?: number;
  label?: string;
  showIdx?: boolean;
  /** number shown on the first index plate, for a long array split into rows */
  base?: number;
}) {
  const n = values.length;
  const style = { "--n": n } as CSSProperties;
  const empty = win ? win.hi < win.lo : false;

  return (
    <div className="track" style={style}>
      {win && (
        <div className={`track__window${empty || win.bad ? " is-bad" : ""}`} aria-hidden="true">
          <div
            className="track__window-bar"
            style={
              {
                "--clip-l": `${(win.lo / n) * 100}%`,
                "--clip-r": empty ? `${100 - (win.lo / n) * 100}%` : `${((n - win.hi - 1) / n) * 100}%`,
              } as CSSProperties
            }
          />
          <span className="track__window-end" style={{ "--x": `calc(${win.lo} * var(--cw))` } as CSSProperties} />
          <span
            className="track__window-end"
            style={{ "--x": empty ? `calc(${win.lo} * var(--cw))` : `calc(${win.hi + 1} * var(--cw) - 2px)` } as CSSProperties}
          />
          <span className="track__window-label" style={{ "--at": Math.min(win.lo, n - 1) } as CSSProperties}>
            {empty ? "window empty" : win.label}
          </span>
        </div>
      )}
      {showIdx && <div className="track__row" aria-hidden="true">
        {values.map((_, k) => (
          <div key={k} className={`track__idx${states[k] === "out" ? " is-out" : ""}`}>
            <span>{k + base}</span>
          </div>
        ))}
      </div>}
      <div className="track__row" role="list" aria-label={`Array ${label}`}>
        {values.map((v, k) => {
          const s = states[k] ?? "";
          return (
            <div
              key={k}
              role="listitem"
              className={`cell${s ? ` is-${s}` : ""}${target === k ? " is-target" : ""}`}
              aria-label={`${label}[${k + base}] = ${v}${s === "out" ? ", ruled out" : s === "mid" ? ", at mid" : s === "found" ? ", found" : s === "violated" ? ", lost from the window" : ""}`}
            >
              {v}
              {s === "found" && (
                <span className="cell__flag" aria-hidden="true">
                  <Check size={13} strokeWidth={3.25} />
                </span>
              )}
            </div>
          );
        })}
      </div>
      {pred && (
        <div className="track__pred" aria-hidden="true">
          {pred.map((p, k) => (
            <div key={k} className={`pred${p === true ? " is-true" : p === null ? " is-unknown" : ""}`}>
              <span>{p === null ? "?" : p ? "T" : "F"}</span>
            </div>
          ))}
        </div>
      )}
      <div className="rails" style={{ width: `calc(${n + 1} * var(--cw))` }} aria-hidden="true">
        {pointers.map((p) => (
          <div className="rail" key={p.name}>
            <span className="rail__name">{p.name}</span>
            <div
              className={`train${p.kind ? ` train--${p.kind}` : ""}${p.at === null ? " is-off" : ""}`}
              style={{ "--at": p.at ?? 0 } as CSSProperties}
            >
              <span className="train__body">{p.at === null ? "" : (p.show ?? p.at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
