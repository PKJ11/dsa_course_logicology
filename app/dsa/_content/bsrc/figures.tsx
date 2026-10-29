"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import { answerSteps, boundarySteps, classicSteps, fmt, fmtW, sqrtSteps, trapSteps, type ArrStep } from "./algos";

const A16 = [3, 7, 11, 14, 19, 22, 25, 31, 36, 41, 47, 52, 58, 63, 70, 78];
const A8 = [3, 11, 19, 25, 36, 47, 58, 70];

function Verdict({ v }: { v?: { ok: boolean; text: string } }) {
  if (!v) return null;
  return <span className={`verdict ${v.ok ? "verdict--ok" : "verdict--bad"}`}>{v.text}</span>;
}

function Readout({ s, extra }: { s: ArrStep; extra?: React.ReactNode }) {
  const size = Math.max(0, s.hi - s.lo + 1);
  return (
    <div className="readout">
      <span>
        reads <b className="num">{s.reads}</b>
      </span>
      <span>
        window <b className="num">{size}</b>
      </span>
      {extra}
      <Verdict v={s.verdict} />
    </div>
  );
}

function arrPointers(s: ArrStep) {
  return [
    { name: "lo", at: s.lo },
    { name: "mid", at: s.mid, kind: "mid" as const },
    { name: "hi", at: s.hi >= s.lo - 1 ? s.hi : null },
  ];
}

/* BSRC-1.1 */
export function HalvingFigure() {
  const compact = useCompact();
  const a = compact ? A8 : A16;
  const targets = compact ? [47, 26, 3] : [41, 26, 3];
  const [ti, setTi] = useState(0);
  const t = targets[ti];
  const steps = useMemo(() => classicSteps(a, t), [a, t]);
  return (
    <Stepper
      id="BSRC-1.1"
      lesson="BSRC-1"
      title="Halving the window"
      total={steps.length}
      resetKey={`${compact}-${ti}`}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Look for"
          value={String(ti)}
          options={targets.map((x, k) => ({ value: String(k), label: k === 1 ? `${x} (absent)` : String(x) }))}
          onChange={(v) => setTi(Number(v))}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={a} states={s.states} window={{ lo: s.lo, hi: s.hi, label: "window" }} pointers={arrPointers(s)} />
            <Readout s={s} />
          </>
        );
      }}
    </Stepper>
  );
}

/* BSRC-2.1 */
export function InvariantFigure() {
  const compact = useCompact();
  const a = compact ? A8 : A16;
  const t = compact ? 47 : 41;
  const [variant, setVariant] = useState<"right" | "bug">("right");
  const steps = useMemo(() => classicSteps(a, t, variant === "bug"), [a, t, variant]);
  return (
    <Stepper
      id="BSRC-2.1"
      lesson="BSRC-2"
      title={`Watching the invariant: is ${t} still inside a[lo..hi]?`}
      total={steps.length}
      resetKey={`${compact}-${variant}`}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Code"
          value={variant}
          options={[
            { value: "right", label: "With the == branch" },
            { value: "bug", label: "Forgot the == branch" },
          ]}
          onChange={setVariant}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack
              values={a}
              states={s.states}
              window={{ lo: s.lo, hi: s.hi, label: `if ${t} is anywhere, it is in here`, bad: s.windowBad }}
              pointers={arrPointers(s)}
            />
            <Readout s={s} />
          </>
        );
      }}
    </Stepper>
  );
}

/* BSRC-3.1 */
const D16 = [2, 4, 4, 7, 7, 7, 7, 9, 12, 12, 15, 18, 18, 18, 21, 25];
const D8 = [2, 4, 7, 7, 7, 9, 12, 15];

export function BoundaryFigure() {
  const compact = useCompact();
  const a = compact ? D8 : D16;
  const [which, setWhich] = useState<"first" | "last">("first");
  const t = 7;
  const steps = useMemo(() => boundarySteps(a, t, which), [a, which]);
  return (
    <Stepper
      id="BSRC-3.1"
      lesson="BSRC-3"
      title={`Finding the ${which} 7 by finding a boundary`}
      total={steps.length}
      resetKey={`${compact}-${which}`}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Find"
          value={which}
          options={[
            { value: "first", label: "First 7 (a[i] >= 7)" },
            { value: "last", label: "Last 7 (a[i] > 7)" },
          ]}
          onChange={setWhich}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack
              values={a}
              states={s.states}
              pred={s.pred}
              window={{ lo: s.lo, hi: s.hi, label: "unknown" }}
              pointers={[
                { name: "lo", at: s.lo },
                { name: "mid", at: s.mid, kind: "mid" },
                { name: "hi", at: s.hi + 1 },
              ]}
            />
            <Readout s={s} />
          </>
        );
      }}
    </Stepper>
  );
}

/* BSRC-4.1 */
export function AnswerFigure() {
  const compact = useCompact();
  const parcels = compact ? [4, 1, 3, 2] : [3, 2, 2, 4, 1, 4];
  const days = compact ? 2 : 3;
  const { steps, min, max } = useMemo(() => answerSteps(parcels, days), [compact]); // eslint-disable-line react-hooks/exhaustive-deps
  const caps = Array.from({ length: max - min + 1 }, (_, k) => min + k);
  return (
    <Stepper
      id="BSRC-4.1"
      lesson="BSRC-4"
      title={`Smallest van that ships [${parcels.join(", ")}] in ${days} days`}
      total={steps.length}
      resetKey={String(compact)}
      caption={(i) => <Cap text={steps[i].caption} />}
    >
      {(i) => {
        const s = steps[i];
        const split = s.split;
        return (
          <>
            <div className="parcels" aria-label={split ? `Loading at capacity ${s.mid ?? s.lo}` : "Parcels in order"}>
              {(split ?? [{ boxes: parcels, total: 0 }]).map((d, k) => {
                const over = !!split && split.length > days && k >= days;
                return (
                  <div key={k} className={`parcel-day${over ? " is-over" : ""}`}>
                    <div className="parcel-day__boxes">
                      {d.boxes.map((w, j) => (
                        <span key={j} className="parcel">
                          {w}
                        </span>
                      ))}
                    </div>
                    <span className="parcel-day__label">{split ? `Day ${k + 1} · ${d.total}` : "parcels, in order"}</span>
                  </div>
                );
              })}
            </div>
            <ArrayTrack
              label="capacity"
              showIdx={false}
              values={caps}
              states={caps.map((c) => (c < s.lo || c > s.hi ? "out" : c === s.mid ? "mid" : i === steps.length - 1 && c === s.lo ? "found" : ""))}
              pred={caps.map((c) => (c < s.lo ? false : c >= s.hi ? true : null))}
              window={{ lo: s.lo - min, hi: s.hi - min, label: "answer is in here" }}
              pointers={[
                { name: "lo", at: s.lo - min, show: s.lo },
                { name: "mid", at: s.mid === null ? null : s.mid - min, kind: "mid", show: s.mid ?? "" },
                { name: "hi", at: s.hi - min, show: s.hi },
              ]}
            />
            <div className="readout">
              <span>
                candidates tested <b className="num">{steps.slice(0, i + 1).filter((x) => x.mid !== null).length}</b>
              </span>
              <span>
                still possible <b className="num">{s.hi - s.lo + 1}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* BSRC-5.1 */
function settled(lo: number, hi: number) {
  const a = lo.toFixed(8);
  const b = hi.toFixed(8);
  let k = 0;
  while (k < a.length && a[k] === b[k]) k++;
  return { a, k };
}

export function SqrtFigure() {
  const steps = useMemo(() => sqrtSteps(2, 14), []);
  const W = 600;
  const x = (v: number) => 20 + (v / 2) * (W - 40);
  return (
    <Stepper id="BSRC-5.1" lesson="BSRC-5" title="Narrowing in on √2 between lo and hi" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        const { a, k } = settled(s.lo, s.hi);
        return (
          <>
            <svg viewBox={`0 0 ${W} 74`} width="100%" style={{ maxWidth: W, margin: "0 auto", overflow: "visible" }} role="img" aria-label={`Window from ${fmt(s.lo)} to ${fmt(s.hi)} on the line from 0 to 2`}>
              <line x1={20} x2={W - 20} y1={40} y2={40} stroke="var(--ink)" strokeWidth={3} />
              {[0, 0.5, 1, 1.5, 2].map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={34} y2={46} stroke="var(--ink)" strokeWidth={1.5} />
                  <text x={x(v)} y={66} textAnchor="middle" fontFamily="var(--f-code)" fontSize={13} fill="var(--ink-2)">
                    {v}
                  </text>
                </g>
              ))}
              <rect x={x(s.lo)} y={26} width={Math.max(2, x(s.hi) - x(s.lo))} height={10} fill="var(--blue)" style={{ transition: "all var(--move) var(--ease)" }} />
              <line x1={x(Math.SQRT2)} x2={x(Math.SQRT2)} y1={14} y2={46} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="3 3" />
              <text x={x(Math.SQRT2)} y={10} textAnchor="middle" fontFamily="var(--f-board)" fontWeight={700} fontSize={12} fill="var(--ink)">
                √2
              </text>
            </svg>
            <div className="tt-wrap" style={{ marginBottom: 0 }}>
              <table className="tt">
                <thead>
                  <tr>
                    <th className="r">Step</th>
                    <th className="r">lo</th>
                    <th className="r">hi</th>
                    <th className="r">mid</th>
                    <th className="r">mid²</th>
                    <th>Keep</th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.slice(-6).map((r) => (
                    <tr key={r.k} className={r.k === s.k ? "is-current" : undefined}>
                      <td className="r">{r.k}</td>
                      <td className="r"><code>{fmt(r.lo)}</code></td>
                      <td className="r"><code>{fmt(r.hi)}</code></td>
                      <td className="r"><code>{fmt(r.mid)}</code></td>
                      <td className="r"><code>{fmt(r.sq)}</code></td>
                      <td>{r.keep}</td>
                    </tr>
                  ))}
                  {s.rows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ color: "var(--ink-3)" }}>
                        Rows appear as you step.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="readout">
              <span>
                settled digits{" "}
                <b>
                  <code>{a.slice(0, k) || "none yet"}</code>
                </b>
              </span>
              <span>
                width <b className="num">{fmtW(s.hi - s.lo)}</b>
              </span>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* BSRC-6.1 */
export function TrapFigure() {
  const a = [2, 5, 8, 11, 14, 17, 20, 23];
  const t = 20;
  const [variant, setVariant] = useState<"trap" | "fixed">("trap");
  const steps = useMemo(() => trapSteps(a, t, variant === "fixed"), [variant]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stepper
      id="BSRC-6.1"
      lesson="BSRC-6"
      title="The lo = mid trap"
      total={steps.length}
      resetKey={variant}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Update"
          value={variant}
          options={[
            { value: "trap", label: "lo = mid" },
            { value: "fixed", label: "lo = mid + 1" },
          ]}
          onChange={setVariant}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={a} states={s.states} window={{ lo: s.lo, hi: s.hi, label: "window", bad: s.windowBad }} pointers={arrPointers(s)} />
            <Readout s={s} />
          </>
        );
      }}
    </Stepper>
  );
}
