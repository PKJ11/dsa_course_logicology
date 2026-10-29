"use client";

import { useMemo, useState } from "react";
import { CallStack, CodeTrace, Follow, Grid, Tree, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import { FACT, FIB, FLAT_REC, FLAT_STACK, SUM_BROKEN, SUM_REC, factSteps, fibSteps, flatSteps, permSteps, queenSteps, shrinkSteps, subsetSteps } from "./algos";

function Out({ lines, head = "Printed" }: { lines?: string[]; head?: string }) {
  return (
    <div className="outbox" aria-label={head}>
      <span className="outbox__head">{head}</span>
      <pre>{lines && lines.length ? lines.join("\n") : " "}</pre>
    </div>
  );
}

/* RECR-1.1 */
export function ShrinkFigure() {
  const [v, setV] = useState<"base" | "none">("base");
  const steps = useMemo(() => shrinkSteps(v === "none"), [v]);
  return (
    <Stepper
      id="RECR-1.1"
      lesson="RECR-1"
      title="Each call hands a smaller problem down"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Version"
          value={v}
          options={[
            { value: "base", label: "With a base case" },
            { value: "none", label: "No base case" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <CodeTrace code={v === "base" ? SUM_REC : SUM_BROKEN} line={s.line} />
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Tree nodes={s.nodes} label="Chain of calls, each on a shorter list" level={56} unit={150} />
            </div>
            {s.verdict && (
              <div className="readout">
                <Verdict v={s.verdict} />
              </div>
            )}
          </div>
        );
      }}
    </Stepper>
  );
}

/* RECR-2.1 */
export function StackFigure() {
  const steps = useMemo(() => factSteps(), []);
  return (
    <Stepper id="RECR-2.1" lesson="RECR-2" title="The call stack for fact(4)" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={FACT}
            line={s.line}
            aside={
              <>
                <CallStack frames={s.frames} />
                <Out lines={s.out} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* RECR-3.1 */
export function FibFigure() {
  const [v, setV] = useState<"plain" | "memo">("plain");
  const steps = useMemo(() => fibSteps(v === "memo"), [v]);
  return (
    <Stepper
      id="RECR-3.1"
      lesson="RECR-3"
      title="The recursion tree of fib(5)"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Version"
          value={v}
          options={[
            { value: "plain", label: "Plain" },
            { value: "memo", label: "With a memo" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        const memo = Object.entries(s.memo);
        return (
          <div className="stage-stack">
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Tree nodes={s.nodes} label={`Recursion tree of fib(5), ${s.calls} calls so far`} level={58} />
            </div>
            <div className="readout">
              <span>
                calls <b className="num">{s.calls}</b>
              </span>
              {v === "memo" && (
                <span>
                  memo <b>{memo.length ? `{${memo.map(([k, x]) => `${k}: ${x}`).join(", ")}}` : "{}"}</b>
                </span>
              )}
            </div>
            {i === 0 && <CodeTrace code={FIB} line={null} />}
          </div>
        );
      }}
    </Stepper>
  );
}

/* RECR-4.1 */
export function ChoiceFigure() {
  const [v, setV] = useState<"sub" | "perm">("sub");
  const steps = useMemo(() => (v === "sub" ? subsetSteps() : permSteps()), [v]);
  return (
    <Stepper
      id="RECR-4.1"
      lesson="RECR-4"
      title={v === "sub" ? "Every subset of a, b, c: take or skip" : "Every order of 1, 2, 3: pick an unused value"}
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="List"
          value={v}
          options={[
            { value: "sub", label: "Subsets" },
            { value: "perm", label: "Orders" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Follow>
              <Tree nodes={s.nodes} label={v === "sub" ? "Decision tree for subsets" : "Decision tree for orders"} level={66} />
            </Follow>
            <Out head={`Recorded (${s.found.length})`} lines={[s.found.join("  ")]} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* RECR-5.1 */
export function QueensFigure() {
  const steps = useMemo(() => queenSteps(), []);
  return (
    <Stepper id="RECR-5.1" lesson="RECR-5" title="Four queens: place, check, take back" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Grid cells={s.cells} label="A 4 by 4 board" />
            <div className="readout">
              <span>
                placements tried <b className="num">{s.tried}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* RECR-6.1 */
export function FlattenFigure() {
  const [v, setV] = useState<"rec" | "stack">("rec");
  const steps = useMemo(() => flatSteps(v === "stack"), [v]);
  return (
    <Stepper
      id="RECR-6.1"
      lesson="RECR-6"
      title="Flattening [1, [2, [3, 4]], 5]"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Using"
          value={v}
          options={[
            { value: "rec", label: "Recursion" },
            { value: "stack", label: "A stack list" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={v === "rec" ? FLAT_REC : FLAT_STACK}
            line={s.line}
            aside={
              <>
                <CallStack frames={s.frames} label={v === "rec" ? "Call stack" : "stack, top first"} plain={v === "stack"} />
                <Out head="out" lines={[`[${s.out.join(", ")}]`]} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}
