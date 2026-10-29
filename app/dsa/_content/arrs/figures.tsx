"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Grid, Named, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import { SW, TP, diffSteps, fixedWindowSteps, gridSteps, growShrinkSteps, memSteps, palSteps, prefixSteps, twoPointerSteps, type GridKind } from "./algos";

/* ARRS-1.1 */
export function MemoryFigure() {
  const [v, setV] = useState<"read" | "insert">("read");
  const steps = useMemo(() => memSteps(v === "insert"), [v]);
  return (
    <Stepper
      id="ARRS-1.1"
      lesson="ARRS-1"
      title="Finding a slot, and making room for a new one"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Do"
          value={v}
          options={[
            { value: "read", label: "Read a[i]" },
            { value: "insert", label: "Insert at 2" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={s.values} states={s.states} pointers={[{ name: "i", at: s.at, kind: "mid" }]} />
            <div className="readout">
              {v === "read" ? (
                <span>
                  address <b className="num">{s.addr ?? "—"}</b>
                </span>
              ) : (
                <span>
                  values moved <b className="num">{s.moved}</b>
                </span>
              )}
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* ARRS-2.1 */
export function TwoPointerFigure() {
  const [v, setV] = useState<"31" | "33">("31");
  const steps = useMemo(() => twoPointerSteps(Number(v)), [v]);
  return (
    <Stepper
      id="ARRS-2.1"
      lesson="ARRS-2"
      title="Two pointers close in on a pair"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Target"
          value={v}
          options={[
            { value: "31", label: "31" },
            { value: "33", label: "33 (no pair)" },
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
              values={TP}
              states={s.states}
              pointers={[
                { name: "lo", at: s.lo, kind: "blue" },
                { name: "hi", at: s.hi, kind: "blue" },
              ]}
            />
            <div className="readout">
              <span>
                a[lo] + a[hi] <b className="num">{s.sum ?? "—"}</b>
              </span>
              <span>
                target <b className="num">{v}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* ARRS-3.1 */
export function WindowFigure() {
  const [v, setV] = useState<"fixed" | "grow">("fixed");
  const steps = useMemo(() => (v === "fixed" ? fixedWindowSteps() : growShrinkSteps()), [v]);
  return (
    <Stepper
      id="ARRS-3.1"
      lesson="ARRS-3"
      title="A window slides along the list"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Window"
          value={v}
          options={[
            { value: "fixed", label: "Fixed size 3" },
            { value: "grow", label: "Sum at most 10" },
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
              values={SW}
              states={s.states}
              window={s.hi >= s.lo ? { lo: s.lo, hi: s.hi, label: `window, sum ${s.sum}`, bad: s.bad } : undefined}
              pointers={[
                { name: "lo", at: s.hi >= s.lo ? s.lo : null, kind: "blue" },
                { name: "hi", at: s.hi >= 0 ? s.hi : null, kind: "blue" },
              ]}
            />
            <div className="readout">
              <span>
                sum <b className="num">{s.sum}</b>
              </span>
              <span>
                {v === "fixed" ? "best sum" : "longest"} <b className="num">{s.best}</b>
              </span>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* ARRS-4.1 */
export function PrefixFigure() {
  const [v, setV] = useState<"prefix" | "diff">("prefix");
  const steps = useMemo(() => (v === "prefix" ? prefixSteps() : diffSteps()), [v]);
  return (
    <Stepper
      id="ARRS-4.1"
      lesson="ARRS-4"
      title={v === "prefix" ? "Prefix sums answer range questions" : "A difference list applies range updates"}
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "prefix", label: "Prefix sums" },
            { value: "diff", label: "Difference list" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name={v === "prefix" ? "a" : "d"}>
              <ArrayTrack label={v === "prefix" ? "a" : "d"} values={s.top} states={s.topStates} pointers={[]} />
            </Named>
            <Named name={v === "prefix" ? "P" : "final values"}>
              <ArrayTrack label={v === "prefix" ? "P" : "final values"} values={s.bottom} states={s.bottomStates} pointers={[]} />
            </Named>
            {s.result && (
              <div className="readout">
                <span>
                  sum of a[2..5] <b className="num">{s.result}</b>
                </span>
              </div>
            )}
          </div>
        );
      }}
    </Stepper>
  );
}

/* ARRS-5.1 */
export function GridFigure() {
  const [v, setV] = useState<GridKind>("rows");
  const steps = useMemo(() => gridSteps(v), [v]);
  return (
    <Stepper
      id="ARRS-5.1"
      lesson="ARRS-5"
      title="Three ways to walk a grid"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Order"
          value={v}
          options={[
            { value: "rows", label: "Rows" },
            { value: "cols", label: "Columns" },
            { value: "spiral", label: "Spiral" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Grid cells={s.cells} label="A grid of 4 rows and 5 columns" />
            <div className="readout">
              <span>
                visited <b className="num">{s.order.length}</b> of 20
              </span>
              {v === "spiral" && s.bounds && (
                <span>
                  limits <b>{s.bounds}</b>
                </span>
              )}
            </div>
            <div className="readout" style={{ marginTop: 0, maxWidth: "100%" }}>
              <span>
                order <b>{s.order.length ? s.order.join(", ") : "—"}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* ARRS-6.1 */
const PAL = { yes: "Step on no pets", no: "Step on no pots" };

export function PalindromeFigure() {
  const [v, setV] = useState<"yes" | "no">("yes");
  const steps = useMemo(() => palSteps(PAL[v]), [v]);
  const chars = PAL[v].split("").map((c) => (c === " " ? "␣" : c));
  return (
    <Stepper
      id="ARRS-6.1"
      lesson="ARRS-6"
      title="Checking a palindrome from both ends"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Text"
          value={v}
          options={[
            { value: "yes", label: PAL.yes },
            { value: "no", label: PAL.no },
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
              <ArrayTrack
                values={chars}
                states={s.states}
                pointers={[
                  { name: "lo", at: s.lo, kind: "blue" },
                  { name: "hi", at: s.hi, kind: "blue" },
                ]}
              />
            </div>
            <div className="readout">
              <span>
                s <b>&quot;{PAL[v]}&quot;</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}
