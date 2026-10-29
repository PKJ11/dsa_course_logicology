"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Bar, CallStack, CodeTrace, Tree, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import {
  BOUND_LABEL,
  CLASSES,
  COUNT_CODE,
  COUNT_TOTAL,
  GROWTH_CAPS,
  GROWTH_NS,
  MASTER,
  RATE,
  SUM_A,
  SUM_LOOP,
  SUM_REC,
  boundCaptions,
  boundRows,
  countSteps,
  fmtCount,
  fmtTime,
  frontSteps,
  growSteps,
  masterCaptions,
  masterRows,
  recSteps,
  spaceSteps,
  type BoundKind,
  type FrontKind,
  type GrowKind,
  type LoopKind,
  type MasterKind,
  type RecKind,
} from "./algos";

function Out({ lines }: { lines?: string[] }) {
  return (
    <div className="outbox" aria-label="Printed output">
      <span className="outbox__head">Printed</span>
      <pre>{lines && lines.length ? lines.join("\n") : " "}</pre>
    </div>
  );
}

/* BIGO-1.1 */
export function CountFigure() {
  const [v, setV] = useState<LoopKind>("one");
  const steps = useMemo(() => countSteps(v), [v]);
  return (
    <Stepper
      id="BIGO-1.1"
      lesson="BIGO-1"
      title="Counting how many times one line runs"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Loops"
          value={v}
          options={[
            { value: "one", label: "One loop" },
            { value: "two", label: "Loop in a loop" },
            { value: "tri", label: "j from i + 1" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={COUNT_CODE[v]}
            line={s.line}
            vars={s.vars}
            aside={
              <>
                <div className="readout" style={{ marginTop: 0 }}>
                  <span>
                    total for n = 4 <b>{COUNT_TOTAL[v].formula}</b>
                  </span>
                  <span>
                    = <b className="num">{COUNT_TOTAL[v].value}</b>
                  </span>
                </div>
                <Out lines={s.out} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* BIGO-2.1 */
export function BoundFigure() {
  const [v, setV] = useState<BoundKind>("c4");
  const rows = useMemo(() => boundRows(v), [v]);
  const caps = useMemo(() => boundCaptions(v), [v]);
  return (
    <Stepper
      id="BIGO-2.1"
      lesson="BIGO-2"
      title="Is 3n + 5 at most c × g(n)?"
      total={caps.length}
      resetKey={v}
      caption={(i) => <Cap text={caps[i]} />}
      variants={
        <Variants
          label="Bound"
          value={v}
          options={[
            { value: "c4", label: "4n" },
            { value: "c3", label: "3n" },
            { value: "sq", label: "n²" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const end = i === caps.length - 1;
        const n0 = rows.find((r, k) => rows.slice(k).every((x) => x.ok));
        return (
          <div className="stage-stack" style={{ justifyItems: "stretch" }}>
            <div className="tt-wrap" style={{ margin: 0 }}>
              <table className="tt">
                <caption className="visually-hidden">f(n) = 3n + 5 against the bound {BOUND_LABEL[v]}</caption>
                <thead>
                  <tr>
                    <th className="r">n</th>
                    <th className="r">3n + 5</th>
                    <th className="r">{BOUND_LABEL[v]}</th>
                    <th>holds?</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, k) => {
                    const shown = end || k < i;
                    return (
                      <tr key={r.n} className={k === i - 1 && !end ? "is-current" : shown ? undefined : "is-future"}>
                        <td className="r num">{r.n}</td>
                        <td className="r num">{shown ? r.f : ""}</td>
                        <td className="r num">{shown ? r.g : ""}</td>
                        <td>{shown ? <Verdict v={{ ok: r.ok, text: r.ok ? "yes" : "no" }} /> : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {end && (
              <div className="readout">
                {n0 ? (
                  <>
                    <span>
                      holds from <b>n₀ = {n0.n}</b>
                    </span>
                    <Verdict v={{ ok: true, text: v === "sq" ? "3n + 5 is O(n²)" : "3n + 5 is O(n)" }} />
                  </>
                ) : (
                  <Verdict v={{ ok: false, text: "c too small: try a bigger c" }} />
                )}
              </div>
            )}
          </div>
        );
      }}
    </Stepper>
  );
}

/* BIGO-3.1 */
export function GrowthFigure() {
  return (
    <Stepper id="BIGO-3.1" lesson="BIGO-3" title="How long each growth rate takes as n grows" total={GROWTH_CAPS.length} caption={(i) => <Cap text={GROWTH_CAPS[i]} />}>
      {(i) => {
        const n = i === 0 ? null : GROWTH_NS[i - 1];
        return (
          <div className="stage-stack" style={{ justifyItems: "stretch" }}>
            <div className="readout" style={{ marginTop: 0 }}>
              <span>
                n <b className="num">{n === null ? "—" : n.toLocaleString("en-US")}</b>
              </span>
              <span>
                speed <b className="num">{RATE.toLocaleString("en-US")}</b> steps a second
              </span>
            </div>
            <div className="tt-wrap" style={{ margin: 0 }}>
              <table className="tt">
                <caption className="visually-hidden">Steps and time for each growth class</caption>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th className="r">Steps</th>
                    <th className="r">Time</th>
                    <th style={{ width: "34%" }}>Against 10 seconds</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSES.map((c) => {
                    const l = n === null ? null : c.log10(n);
                    const frac = l === null ? 0 : 10 ** Math.min(l - Math.log10(RATE) - 1, 3);
                    return (
                      <tr key={c.name}>
                        <td>
                          <code>{c.name}</code>
                        </td>
                        <td className="r num">{l === null ? "" : fmtCount(l)}</td>
                        <td className="r num">{l === null ? "" : fmtTime(l)}</td>
                        <td>{l === null ? "" : <Bar frac={frac} label={`${fmtTime(l)}`} />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* BIGO-4.1 */
export function SpaceFigure() {
  const [v, setV] = useState<"loop" | "rec">("loop");
  const steps = useMemo(() => spaceSteps(v === "rec"), [v]);
  return (
    <Stepper
      id="BIGO-4.1"
      lesson="BIGO-4"
      title="The same sum, with a loop and with recursion"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Version"
          value={v}
          options={[
            { value: "loop", label: "Loop" },
            { value: "rec", label: "Recursion" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={v === "loop" ? SUM_LOOP : SUM_REC}
            line={s.line}
            aside={
              <>
                <CallStack frames={s.frames} />
                <div className="readout" style={{ marginTop: 0 }}>
                  <span>
                    a <b>[{SUM_A.join(", ")}]</b>
                  </span>
                  <span>
                    most frames at once <b className="num">{s.most}</b>
                  </span>
                </div>
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* BIGO-5.1 */
export function RecTreeFigure() {
  const [v, setV] = useState<RecKind>("half");
  const steps = useMemo(() => recSteps(v), [v]);
  return (
    <Stepper
      id="BIGO-5.1"
      lesson="BIGO-5"
      title="Adding up a recursion tree, level by level"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Recurrence"
          value={v}
          options={[
            { value: "half", label: "2T(n/2) + n" },
            { value: "chain", label: "T(n − 1) + n" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        const sum = s.rows.reduce((t, r) => t + r.work, 0);
        return (
          <div className="stage-stack">
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Tree nodes={s.nodes} label={`Recursion tree, ${s.rows.length} levels shown`} level={v === "chain" ? 48 : 66} unit={v === "chain" ? 44 : undefined} />
            </div>
            <div className="tt-wrap" style={{ margin: 0, width: "100%" }}>
              <table className="tt">
                <caption className="visually-hidden">Work at each level</caption>
                <thead>
                  <tr>
                    <th className="r">Level</th>
                    <th>Calls × size</th>
                    <th className="r">Work at this level</th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map((r, k) => (
                    <tr key={r.level} className={k === s.rows.length - 1 && i < steps.length - 1 ? "is-current" : undefined}>
                      <td className="r num">{r.level}</td>
                      <td className="num">{r.sizes}</td>
                      <td className="r num">{r.work}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="readout">
              <span>
                total so far <b className="num">{sum}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* BIGO-6.1 */
export function MasterFigure() {
  const [v, setV] = useState<MasterKind>("ms");
  const rows = useMemo(() => masterRows(v), [v]);
  const caps = useMemo(() => masterCaptions(v), [v]);
  const most = Math.max(...rows.map((r) => r.total));
  const m = MASTER[v];
  const compact = useCompact();
  return (
    <Stepper
      id="BIGO-6.1"
      lesson="BIGO-6"
      title="Where the work is: top, bottom or every level"
      total={caps.length}
      resetKey={v}
      caption={(i) => <Cap text={caps[i]} />}
      variants={
        <Variants
          label="a, b, d"
          value={v}
          options={[
            { value: "bs", label: "1, 2, 0" },
            { value: "ms", label: "2, 2, 1" },
            { value: "leaves", label: "4, 2, 1" },
            { value: "top", label: "1, 2, 1" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const end = i === caps.length - 1;
        const total = rows.slice(0, end ? rows.length : i).reduce((t, r) => t + r.total, 0);
        return (
          <div className="stage-stack" style={{ justifyItems: "stretch" }}>
            <div className="readout" style={{ marginTop: 0 }}>
              <span>
                example <b>{m.name}</b>
              </span>
              <span>
                a / b<sup>d</sup> <b className="num">{m.a / m.b ** m.d}</b>
              </span>
              {end && <Verdict v={{ ok: true, text: m.result }} />}
            </div>
            <div className="tt-wrap" style={{ margin: 0 }}>
              <table className="tt">
                <caption className="visually-hidden">Work at each level for n = 16</caption>
                <thead>
                  <tr>
                    <th className="r">Level</th>
                    <th className="r">Calls</th>
                    <th className="r">Size</th>
                    <th className="r">Each</th>
                    <th className="r">{compact ? "Total" : "Level total"}</th>
                    {!compact && <th style={{ width: "30%" }}>Share</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, k) => {
                    const shown = end || k < i;
                    return (
                      <tr key={r.level} className={k === i - 1 && !end ? "is-current" : shown ? undefined : "is-future"}>
                        <td className="r num">{r.level}</td>
                        <td className="r num">{shown ? r.calls : ""}</td>
                        <td className="r num">{shown ? r.size : ""}</td>
                        <td className="r num">{shown ? r.each : ""}</td>
                        <td className="r num">{shown ? r.total : ""}</td>
                        {!compact && <td>{shown ? <Bar frac={r.total / most} label={`${r.total} of the largest level ${most}`} /> : ""}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="readout">
              <span>
                total so far <b className="num">{total}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* BIGO-7.1 */
export function GrowFigure() {
  const [v, setV] = useState<GrowKind>("double");
  const steps = useMemo(() => growSteps(v), [v]);
  return (
    <Stepper
      id="BIGO-7.1"
      lesson="BIGO-7"
      title="Appending to a list that must grow"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="When full"
          value={v}
          options={[
            { value: "double", label: "Double the room" },
            { value: "plus2", label: "Add room for 2" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <ArrayTrack values={s.cells} states={s.states} pointers={[]} />
            </div>
            <div className="readout">
              <span>
                size <b className="num">{s.size}</b>
              </span>
              <span>
                room <b className="num">{s.cap}</b>
              </span>
              <span>
                copied now <b className="num">{s.copied}</b>
              </span>
              <span>
                total cost <b className="num">{s.total}</b>
              </span>
              {s.size > 0 && (
                <span>
                  per append <b className="num">{(s.total / s.size).toFixed(2)}</b>
                </span>
              )}
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* BIGO-8.1 */
export function FrontFigure() {
  const [v, setV] = useState<FrontKind>("pop0");
  const steps = useMemo(() => frontSteps(v), [v]);
  return (
    <Stepper
      id="BIGO-8.1"
      lesson="BIGO-8"
      title="Taking values off the front"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Using"
          value={v}
          options={[
            { value: "pop0", label: "list.pop(0)" },
            { value: "deque", label: "deque.popleft()" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={s.values} states={s.states} pointers={[]} />
            <div className="readout">
              <span>
                moves this time <b className="num">{s.moved}</b>
              </span>
              <span>
                total moves <b className="num">{s.total}</b>
              </span>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}
