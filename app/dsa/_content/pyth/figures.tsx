"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CallStack, Chain, CodeTrace, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  A8,
  CODES6,
  COUNT,
  FUNCS,
  LARGEST_BUG,
  LOOP_COMP,
  LOOP_FOR,
  LOOP_WHILE,
  NODES,
  RUN_ROWS,
  compSteps,
  countSteps,
  forSteps,
  funcSteps,
  indexSteps,
  nodeSteps,
  sliceSteps,
  whileSteps,
} from "./algos";

function Out({ lines }: { lines?: string[] }) {
  return (
    <div className="outbox" aria-label="Printed output">
      <span className="outbox__head">Printed</span>
      <pre>{lines && lines.length ? lines.join("\n") : " "}</pre>
    </div>
  );
}

/* PYTH-1.1 */
export function IndexFigure() {
  const [mode, setMode] = useState<"index" | "slice">("index");
  const steps = useMemo(() => (mode === "index" ? indexSteps(A8) : sliceSteps(A8)), [mode]);
  return (
    <Stepper
      id="PYTH-1.1"
      lesson="PYTH-1"
      title="Reading a list by index and by slice"
      total={steps.length}
      resetKey={mode}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={mode}
          options={[
            { value: "index", label: "Indexing" },
            { value: "slice", label: "Slicing" },
          ]}
          onChange={setMode}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <div className="track-tight">
            <ArrayTrack
              values={A8}
              states={s.states}
              window={s.win}
              pointers={
                mode === "index"
                  ? [{ name: "i", at: s.ptr.at, kind: "mid", show: s.ptr.show }]
                  : [
                      { name: "start", at: s.slice ? s.slice.start : null },
                      { name: "stop", at: s.slice ? s.slice.stop : null },
                    ]
              }
            />
            </div>
            <div className="readout">
              <span>
                len(a) <b className="num">{A8.length}</b>
              </span>
              <span>
                result <b>{s.result ?? "—"}</b>
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* PYTH-2.1 */
export function LoopFigure() {
  const [mode, setMode] = useState<"for" | "comp" | "while">("for");
  const steps = useMemo(() => (mode === "for" ? forSteps() : mode === "comp" ? compSteps() : whileSteps()), [mode]);
  const code = mode === "for" ? LOOP_FOR : mode === "comp" ? LOOP_COMP : LOOP_WHILE;
  return (
    <Stepper
      id="PYTH-2.1"
      lesson="PYTH-2"
      title="Three loops, one line at a time"
      total={steps.length}
      resetKey={mode}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Loop"
          value={mode}
          options={[
            { value: "for", label: "for" },
            { value: "comp", label: "Comprehension" },
            { value: "while", label: "while" },
          ]}
          onChange={setMode}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={code}
            line={s.line}
            vars={s.vars}
            aside={
              <>
                {mode !== "while" && (
                  <div style={{ overflowX: "auto" }}>
                    <ArrayTrack values={[3, 8, 5, 6]} states={[3, 8, 5, 6].map((v, k) => (s.x?.at === k ? (v % 2 ? "out" : "mid") : ""))} pointers={[{ name: "x", at: s.x?.at ?? null, kind: "mid", show: s.x?.at == null ? "" : String([3, 8, 5, 6][s.x.at]) }]} />
                  </div>
                )}
                <Out lines={s.out} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* PYTH-3.1 */
export function FunctionFigure() {
  const steps = useMemo(() => funcSteps(), []);
  return (
    <Stepper id="PYTH-3.1" lesson="PYTH-3" title="One function calls another" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={FUNCS}
            line={s.line}
            aside={
              <>
                <CallStack frames={s.frames} />
                <Out lines={s.out ? [s.out] : []} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* PYTH-4.1 */
export function DictFigure() {
  const steps = useMemo(() => countSteps(), []);
  return (
    <Stepper id="PYTH-4.1" lesson="PYTH-4" title="Counting station codes with a dictionary" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <ArrayTrack label="codes" values={CODES6} states={CODES6.map((_, k) => (s.at === k ? "mid" : ""))} pointers={[{ name: "c", at: s.at, kind: "mid", show: s.at === null ? "" : CODES6[s.at] }]} />
            <CodeTrace
              code={COUNT}
              line={s.line}
              varsTitle="counts: key"
              vars={s.dict.map(([k, v]) => ({ name: `'${k}'`, value: String(v), changed: s.changed === k }))}
              aside={<Out lines={s.out ? [s.out] : []} />}
            />
          </div>
        );
      }}
    </Stepper>
  );
}

/* PYTH-5.1 */
export function NodeFigure() {
  const steps = useMemo(() => nodeSteps(), []);
  const vals = [3, 8, 5];
  return (
    <Stepper id="PYTH-5.1" lesson="PYTH-5" title="Building three nodes, then walking along them" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        const shown = vals.slice(0, s.built);
        return (
          <div className="stage-stack">
            <div style={{ overflowX: "auto", maxWidth: "100%", minHeight: 150 }}>
              {shown.length ? (
                <Chain
                  values={shown}
                  states={shown.map((_, k) => (s.cur === k ? "cur" : ""))}
                  names={[
                    { name: "head", at: 0 },
                    { name: "cur", at: s.cur, kind: "mid" },
                  ]}
                />
              ) : (
                <p className="stage-label" style={{ paddingTop: 40 }}>
                  No nodes yet
                </p>
              )}
            </div>
            <CodeTrace code={NODES} line={s.line} aside={<Out lines={s.out} />} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* PYTH-6.1 */
export function TestRunFigure() {
  const total = RUN_ROWS.length + 4;
  const caps = [
    "This is the code under test. It looks fine. The practice screen runs it against each test in the table, one row at a time.",
    ...RUN_ROWS.map((r, k) =>
      k === 3
        ? `Test ${k + 1}: \`${r.call}\` should give ${r.expect}, but it gave ${r.got}. The row turns red.`
        : `Test ${k + 1}: \`${r.call}\` gives ${r.got}, as expected. Pass.`,
    ),
    "4 of 5 pass. A red row opens to show what failed and what that failure usually means: here, that `best` starts at a value bigger than every value in the list.",
    "Trace the failing input by hand. `best` starts at 0. Each of −4, −2 and −9 is less than 0, so `best` never changes, and 0 is returned. 0 is not even in the list.",
    "The fix: start with a value that is in the list, `best = a[0]`. Run again, and all 5 rows pass.",
  ];
  return (
    <Stepper id="PYTH-6.1" lesson="PYTH-6" title="A test run finds the bug that reading missed" total={total} caption={(i) => <Cap text={caps[i]} />}>
      {(i) => {
        const fixed = i === total - 1;
        const ran = fixed ? RUN_ROWS.length : Math.min(i, RUN_ROWS.length);
        const code = fixed ? LARGEST_BUG.replace("best = 0", "best = a[0]") : LARGEST_BUG;
        return (
          <div className="stage-stack" style={{ justifyItems: "stretch" }}>
            <CodeTrace code={code} line={fixed ? 2 : i === total - 2 ? 2 : null} />
            <div className="tt-wrap" style={{ margin: 0 }}>
              <table className="tt">
                <caption className="visually-hidden">Test rows</caption>
                <thead>
                  <tr>
                    <th className="r">#</th>
                    <th>Test</th>
                    <th>Call</th>
                    <th className="r">Expected</th>
                    <th className="r">Got</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {RUN_ROWS.map((r, k) => {
                    const done = k < ran;
                    const got = fixed ? r.expect : r.got;
                    const bad = done && got !== r.expect;
                    return (
                      <tr key={r.name} className={`test-row${bad ? " is-fail" : ""}${k === i - 1 && !fixed ? " is-current" : ""}`}>
                        <td className="r num">{k + 1}</td>
                        <td>{r.name}</td>
                        <td>
                          <code>{r.call}</code>
                        </td>
                        <td className="r">
                          <code>{r.expect}</code>
                        </td>
                        <td className="r">{done ? <code>{got}</code> : ""}</td>
                        <td>
                          <span className={`state state--${done ? (bad ? "fail" : "pass") : "idle"}`}>{done ? (bad ? "Fail" : "Pass") : "Not run"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="readout">
              <span>
                passed <b className="num">{fixed ? 5 : RUN_ROWS.slice(0, ran).filter((r) => r.got === r.expect).length}</b> of 5
              </span>
              {i >= RUN_ROWS.length + 1 && !fixed && <Verdict v={{ ok: false, text: "best starts above every value" }} />}
              {fixed && <Verdict v={{ ok: true, text: "All tests pass" }} />}
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}
