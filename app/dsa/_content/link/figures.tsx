"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CodeTrace, Follow, Links, Verdict } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  DELETE,
  INSERT,
  INSERT_BAD,
  MERGE,
  READ_VALS,
  REVERSE,
  REVERSE_BAD,
  ROUND,
  UNLINK,
  circleSteps,
  deleteSteps,
  insertSteps,
  linkReadSteps,
  listReadSteps,
  loopSteps,
  mergeSteps,
  middleSteps,
  reverseSteps,
  unlinkSteps,
  type LinkStep,
} from "./algos";

function LinkStage({ s, label, double }: { s: LinkStep; label: string; double?: boolean }) {
  return (
    <Follow>
      <Links nodes={s.nodes} edges={s.edges} names={s.names} label={label} double={double} />
    </Follow>
  );
}

/* LINK-1.1 */
export function ReadFigure() {
  const [v, setV] = useState<"list" | "linked">("list");
  const list = useMemo(() => listReadSteps(), []);
  const linked = useMemo(() => linkReadSteps(), []);
  const total = v === "list" ? list.length : linked.length;
  return (
    <Stepper
      id="LINK-1.1"
      lesson="LINK-1"
      title="Reading item 4"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={v === "list" ? list[i].caption : linked[i].caption} />}
      variants={
        <Variants
          label="Stored as"
          value={v}
          options={[
            { value: "list", label: "Python list" },
            { value: "linked", label: "Linked list" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const count = v === "list" ? list[i].count : linked[i].count;
        return (
          <div className="stage-stack">
            {v === "list" ? (
              <ArrayTrack values={READ_VALS} states={list[i].states} pointers={[{ name: "a[4]", at: list[i].at, kind: "mid" }]} />
            ) : (
              <LinkStage s={linked[i]} label="Linked list of 6 nodes" />
            )}
            <div className="readout">
              <span>
                steps <b className="num">{count}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* LINK-2.1 */
export function InsertFigure() {
  const [v, setV] = useState<"insert" | "wrong" | "delete">("insert");
  const steps = useMemo(() => (v === "delete" ? deleteSteps() : insertSteps(v === "wrong")), [v]);
  return (
    <Stepper
      id="LINK-2.1"
      lesson="LINK-2"
      title="Insert after a node, and delete after a node"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Version"
          value={v}
          options={[
            { value: "insert", label: "Insert" },
            { value: "wrong", label: "Insert, wrong order" },
            { value: "delete", label: "Delete" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <LinkStage s={s} label="Linked list" />
            <CodeTrace code={v === "insert" ? INSERT : v === "wrong" ? INSERT_BAD : DELETE} line={s.line ?? null} />
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

/* LINK-3.1 */
export function TwoWayFigure() {
  const [v, setV] = useState<"two" | "circle">("two");
  const steps = useMemo(() => (v === "two" ? unlinkSteps() : circleSteps()), [v]);
  return (
    <Stepper
      id="LINK-3.1"
      lesson="LINK-3"
      title="Two-way and circular lists"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="List"
          value={v}
          options={[
            { value: "two", label: "Two-way: remove a node" },
            { value: "circle", label: "Circular: go round" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <LinkStage s={s} label={v === "two" ? "Two-way linked list" : "Circular linked list"} double={v === "two"} />
            <CodeTrace code={v === "two" ? UNLINK : ROUND} line={s.line ?? null} />
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

/* LINK-4.1 */
export function ReverseFigure() {
  const [v, setV] = useState<"right" | "bad">("right");
  const steps = useMemo(() => reverseSteps(v === "bad"), [v]);
  return (
    <Stepper
      id="LINK-4.1"
      lesson="LINK-4"
      title="Reversing a list in place"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Version"
          value={v}
          options={[
            { value: "right", label: "With nxt" },
            { value: "bad", label: "Without nxt" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <LinkStage s={s} label="Linked list being reversed" />
            <CodeTrace code={v === "right" ? REVERSE : REVERSE_BAD} line={s.line ?? null} />
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

/* LINK-5.1 */
export function RunnersFigure() {
  const [v, setV] = useState<"middle" | "loop">("middle");
  const steps = useMemo(() => (v === "middle" ? middleSteps() : loopSteps()), [v]);
  return (
    <Stepper
      id="LINK-5.1"
      lesson="LINK-5"
      title="A slow name and a fast name"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Task"
          value={v}
          options={[
            { value: "middle", label: "Find the middle" },
            { value: "loop", label: "Find a loop" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <LinkStage s={steps[i]} label={v === "middle" ? "Linked list of 7 nodes" : "Linked list of 8 nodes whose last node points back to the fourth"} />}
    </Stepper>
  );
}

/* LINK-6.1 */
export function MergeFigure() {
  const steps = useMemo(() => mergeSteps(), []);
  return (
    <Stepper id="LINK-6.1" lesson="LINK-6" title="Merging two sorted lists" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <LinkStage s={s} label="Two sorted lists being merged into one" />
            <CodeTrace code={MERGE} line={s.line ?? null} />
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
