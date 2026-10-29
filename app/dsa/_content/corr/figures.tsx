"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Grid, Verdict, type GCell } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import { py } from "../kit";
import { coinSteps, maxInvSteps, specSteps, squareSteps, stressSteps } from "./algos";

/* CORR-1.1 */
export function SpecFigure() {
  const [v, setV] = useState<"zero" | "first">("zero");
  const steps = useMemo(() => specSteps(v === "first"), [v]);
  return (
    <Stepper
      id="CORR-1.1"
      lesson="CORR-1"
      title="Checking largest(a) against its spec"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Code starts with"
          value={v}
          options={[
            { value: "zero", label: "best = 0" },
            { value: "first", label: "best = a[0]" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            {s.a && s.a.length > 0 ? (
              <ArrayTrack values={s.a} states={s.states} pointers={[]} />
            ) : (
              <p className="stage-label" style={{ padding: "22px 0 10px" }}>
                {s.a ? "a = [] (empty)" : "largest(a) → m"}
              </p>
            )}
            <div className="readout">
              {s.a && (
                <span>
                  a <b>{py(s.a)}</b>
                </span>
              )}
              {s.ret && (
                <span>
                  returns <b>{s.ret}</b>
                </span>
              )}
              {s.pre === false && <Verdict v={{ ok: true, info: true, text: "input condition is false" }} />}
              {s.checks?.map((c) => <Verdict key={c.text} v={c} />)}
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* CORR-2.1 */
const POS = [5, 2, 8, 3, 8, 1, 9, 4];
const NEG = [-5, -2, -8, -3, -6, -4];

export function MaxInvariantFigure() {
  const [v, setV] = useState<"right" | "bug">("right");
  const a = v === "right" ? POS : NEG;
  const steps = useMemo(() => maxInvSteps(v === "right" ? POS : NEG, v === "bug"), [v]);
  return (
    <Stepper
      id="CORR-2.1"
      lesson="CORR-2"
      title="Keeping the invariant: best is the largest value seen so far"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Start"
          value={v}
          options={[
            { value: "right", label: "best = a[0]" },
            { value: "bug", label: "best = 0 (negative list)" },
          ]}
          onChange={setV}
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
              window={{ lo: 0, hi: s.i - 1, label: s.i > 0 ? `best should be the largest of these` : "nothing seen yet", bad: s.bad && s.i > 0 }}
              pointers={[{ name: "i", at: s.i, kind: "mid" }]}
            />
            <div className="readout">
              <span>
                best <b className="num">{s.best}</b>
              </span>
              <span>
                largest seen <b className="num">{s.i > 0 ? Math.max(...a.slice(0, s.i)) : "none"}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* CORR-3.1 */
export function SquareFigure() {
  const N = 5;
  const steps = useMemo(() => squareSteps(N), []);
  return (
    <Stepper id="CORR-3.1" lesson="CORR-3" title="Adding odd numbers builds squares" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const { n } = steps[i];
        const last = i === steps.length - 1;
        const cells: GCell[][] = Array.from({ length: N }, (_, r) =>
          Array.from({ length: N }, (_, c) => {
            const layer = Math.max(r, c) + 1; // the odd number 2·layer − 1 adds this cell
            if (layer > n) return {};
            return { s: layer === n && !last ? "cur" : "done", v: 2 * layer - 1 };
          }),
        );
        const odds = Array.from({ length: n }, (_, k) => 2 * k + 1);
        return (
          <>
            <Grid cells={cells} label={`A ${n} by ${n} square made of the first ${n} odd numbers`} showIdx={false} />
            <div className="readout">
              <span>
                n <b className="num">{n}</b>
              </span>
              <span>
                sum <b className="num">{n ? `${odds.join(" + ")} = ${n * n}` : "—"}</b>
              </span>
              {n > 0 && (
                <span>
                  n × n <b className="num">{n * n}</b>
                </span>
              )}
              {n > 0 && <Verdict v={{ ok: true, text: i === 1 ? "base case holds" : last ? "true for every n" : `true for n = ${n}` }} />}
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* CORR-4.1 */
export function CoinFigure() {
  const [amount, setAmount] = useState<"6" | "7">("6");
  const coins = [1, 3, 4];
  const steps = useMemo(() => coinSteps([1, 3, 4], Number(amount)), [amount]);
  return (
    <Stepper
      id="CORR-4.1"
      lesson="CORR-4"
      title="Is the biggest coin always the right choice?"
      total={steps.length}
      resetKey={amount}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Amount"
          value={amount}
          options={[
            { value: "6", label: "6" },
            { value: "7", label: "7" },
          ]}
          onChange={setAmount}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <div className="stage-row">
              <div>
                <p className="stage-label">Coins available</p>
                <div className="parcel-day__boxes">
                  {coins.map((c) => (
                    <span key={c} className="parcel">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="stage-label">Biggest coin first</p>
                <div className="parcel-day__boxes" style={{ minHeight: 36 }}>
                  {s.greedy.map((c, k) => (
                    <span key={k} className="parcel">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {s.best && (
                <div>
                  <p className="stage-label">Fewest possible</p>
                  <div className="parcel-day__boxes">
                    {s.best.map((c, k) => (
                      <span key={k} className="parcel" style={{ background: "var(--board)" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="readout">
              <span>
                left to make <b className="num">{s.left}</b>
              </span>
              <span>
                coins used <b className="num">{s.greedy.length}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* CORR-5.1 */
export function StressFigure() {
  const steps = useMemo(() => stressSteps(), []);
  return (
    <Stepper id="CORR-5.1" lesson="CORR-5" title="Stress testing, then shrinking the failure" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack" style={{ justifyItems: "stretch" }}>
            <div style={{ minHeight: 120, display: "grid", alignItems: "center" }}>
              {s.a ? (
                <ArrayTrack values={s.a} states={s.a.map((_, k) => (s.mark.includes(k) ? "path" : ""))} pointers={[]} />
              ) : (
                <p className="stage-label">fast(a) against slow(a)</p>
              )}
            </div>
            <div className="tt-wrap" style={{ margin: 0 }}>
              <table className="tt">
                <caption className="visually-hidden">Random tests so far</caption>
                <thead>
                  <tr>
                    <th>Random list</th>
                    <th>fast</th>
                    <th>slow</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--ink-3)" }}>
                        Rows appear as you step.
                      </td>
                    </tr>
                  )}
                  {s.rows.map((r) => {
                    const bad = r.fast !== r.slow;
                    return (
                      <tr key={py(r.a)} className={`test-row${bad ? " is-fail" : ""}`}>
                        <td>
                          <code>{py(r.a)}</code>
                        </td>
                        <td>
                          <code>{r.fast ? "True" : "False"}</code>
                        </td>
                        <td>
                          <code>{r.slow ? "True" : "False"}</code>
                        </td>
                        <td>
                          <span className={`state state--${bad ? "fail" : "pass"}`}>{bad ? "Disagree" : "Agree"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="readout">
              <span>
                phase <b>{s.phase === "test" ? "random tests" : "shrinking"}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
