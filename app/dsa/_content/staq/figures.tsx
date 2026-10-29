"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CallStack, CodeTrace, Follow, Named, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  NG_VALS,
  POSTFIX,
  STACK_OPS,
  WM_K,
  WM_VALS,
  bracketSteps,
  dequeQueueSteps,
  listQueueSteps,
  nextGreaterSteps,
  postfixSteps,
  ringSteps,
  stackSteps,
  windowMaxSteps,
} from "./algos";

function Out({ lines, head = "Values given back" }: { lines?: string[]; head?: string }) {
  return (
    <div className="outbox" aria-label={head}>
      <span className="outbox__head">{head}</span>
      <pre>{lines && lines.length ? lines.join("\n") : " "}</pre>
    </div>
  );
}

function Track({ values, empty = "empty", ...rest }: Parameters<typeof ArrayTrack>[0] & { empty?: string }) {
  if (!values.length) return <div className="stage-label" style={{ padding: "14px 0" }}>{empty}</div>;
  return <ArrayTrack values={values} {...rest} />;
}

/* STAQ-1.1 */
export function StackFigure() {
  const steps = useMemo(() => stackSteps(), []);
  return (
    <Stepper id="STAQ-1.1" lesson="STAQ-1" title="A stack kept in a Python list" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <CodeTrace
            code={STACK_OPS}
            line={s.line}
            aside={
              <>
                <CallStack frames={s.frames} label="Stack" plain />
                <Out lines={s.out} />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* STAQ-2.1 */
export function ScanFigure() {
  const [v, setV] = useState<"ok" | "bad" | "postfix">("ok");
  const text = v === "ok" ? "{[()()]}" : "([)]";
  const steps = useMemo(() => (v === "postfix" ? postfixSteps() : bracketSteps(text)), [v, text]);
  const toks = v === "postfix" ? POSTFIX : [...text];
  return (
    <Stepper
      id="STAQ-2.1"
      lesson="STAQ-2"
      title="Reading from left to right with a stack"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Input"
          value={v}
          options={[
            { value: "ok", label: "{[()()]}" },
            { value: "bad", label: "([)]" },
            { value: "postfix", label: "Postfix sum" },
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
              <ArrayTrack values={toks} states={s.states} pointers={[{ name: "i", at: s.i, kind: "mid" }]} label="tokens" />
            </Follow>
            <div className="stage-row">
              <CallStack frames={s.frames} label="Stack" plain />
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

/* STAQ-3.1 */
export function QueueFigure() {
  const [v, setV] = useState<"list" | "deque">("list");
  const steps = useMemo(() => (v === "list" ? listQueueSteps() : dequeQueueSteps()), [v]);
  return (
    <Stepper
      id="STAQ-3.1"
      lesson="STAQ-3"
      title="Taking from the front of a queue"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Stored in"
          value={v}
          options={[
            { value: "list", label: "list with pop(0)" },
            { value: "deque", label: "deque" },
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
              <ArrayTrack
                values={s.values}
                states={s.states}
                pointers={[
                  { name: "front", at: s.front, kind: "mid" },
                  { name: "back", at: s.back },
                ]}
                label="queue"
              />
            </Follow>
            <div className="readout">
              <span>
                items moved <b className="num">{s.moved}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* STAQ-4.1 */
export function RingFigure() {
  const steps = useMemo(() => ringSteps(), []);
  return (
    <Stepper id="STAQ-4.1" lesson="STAQ-4" title="A circular buffer of 6 slots" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <ArrayTrack
              values={s.values}
              states={s.states}
              pointers={[
                { name: "head", at: s.head, kind: "mid" },
                { name: "free", at: s.free },
              ]}
              label="slots"
            />
            <div className="readout">
              <span>
                head <b className="num">{s.head}</b>
              </span>
              <span>
                count <b className="num">{s.count}</b>
              </span>
              {s.verdict && <Verdict v={s.verdict} />}
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* STAQ-5.1 */
export function NextGreaterFigure() {
  const steps = useMemo(() => nextGreaterSteps(), []);
  return (
    <Stepper id="STAQ-5.1" lesson="STAQ-5" title="Next bigger value, with a stack" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="a">
              <ArrayTrack values={NG_VALS} states={s.states} pointers={[{ name: "i", at: s.i, kind: "mid" }]} label="a" />
            </Named>
            <Named name="answer">
              <ArrayTrack values={s.answer} pointers={[]} label="answer" />
            </Named>
            <CallStack frames={s.frames} label="Stack of places" plain />
          </div>
        );
      }}
    </Stepper>
  );
}

/* STAQ-6.1 */
export function WindowMaxFigure() {
  const steps = useMemo(() => windowMaxSteps(), []);
  return (
    <Stepper id="STAQ-6.1" lesson="STAQ-6" title={`Biggest value in each window of ${WM_K}`} total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        const hi = s.i ?? WM_VALS.length - 1;
        return (
          <div className="stage-stack">
            <Named name="a">
              <ArrayTrack
                values={WM_VALS}
                states={s.states}
                window={s.i === null && i === 0 ? undefined : { lo: s.lo, hi, label: "window" }}
                pointers={[{ name: "i", at: s.i, kind: "mid" }]}
                label="a"
              />
            </Named>
            <Named name="deque">
              <Track
                values={s.dq.map((j) => `${WM_VALS[j]}`)}
                pointers={[]}
                showIdx={false}
                label="deque, values at the places it holds, front first"
                empty="empty"
              />
            </Named>
            <div className="stage-label" style={{ margin: 0 }}>
              places in the deque: {s.dq.length ? s.dq.join(", ") : "none"}
            </div>
            <Named name="maxima">
              <Track values={s.out} pointers={[]} label="maxima" empty="none yet" />
            </Named>
          </div>
        );
      }}
    </Stepper>
  );
}
