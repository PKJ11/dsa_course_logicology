"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CodeTrace, Follow, Named, SkipList, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  ROT_DOUBLE,
  ROT_LEFT,
  ROT_RIGHT,
  SKIP_KEYS,
  avlSteps,
  btreeSteps,
  rbSteps,
  rotSteps,
  shapeSteps,
  skipSteps,
  type AvlVariant,
  type RbVariant,
  type RotVariant,
  type TreeStep,
} from "./algos";

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

function TreeStage({ s, label }: { s: TreeStep; label: string }) {
  return (
    <Follow>
      <Tree nodes={s.nodes} label={label} binary slide />
    </Follow>
  );
}

function InOrder({ s, name = "in order" }: { s: TreeStep; name?: string }) {
  if (!s.arr) return null;
  const a = s.arr;
  return (
    <Named name={name}>
      <ArrayTrack
        values={a.values}
        states={a.states}
        window={a.lo !== undefined && a.hi !== undefined ? { lo: a.lo, hi: a.hi, label: "this part" } : undefined}
        pointers={a.mid !== undefined ? [{ name: "mid", at: a.mid, kind: "mid" }] : []}
        label={name}
      />
    </Named>
  );
}

/* BALT-1.1 */
export function ShapeFigure() {
  const [v, setV] = useState<"sorted" | "middle">("sorted");
  const steps = useMemo(() => shapeSteps(v), [v]);
  return (
    <Stepper
      id="BALT-1.1"
      lesson="BALT-1"
      title="The same seven keys, two shapes"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Build"
          value={v}
          options={[
            { value: "sorted", label: "Insert in sorted order" },
            { value: "middle", label: "Middle key first" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="Binary search tree" />
            <InOrder s={s} name="sorted keys" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* BALT-2.1 */
export function RotateFigure() {
  const [v, setV] = useState<RotVariant>("right");
  const steps = useMemo(() => rotSteps(v), [v]);
  const code = v === "right" ? ROT_RIGHT : v === "left" ? ROT_LEFT : ROT_DOUBLE;
  return (
    <Stepper
      id="BALT-2.1"
      lesson="BALT-2"
      title="Rotations change the shape, not the order"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Rotate"
          value={v}
          options={[
            { value: "right", label: "Right" },
            { value: "left", label: "Left" },
            { value: "double", label: "Left, then right" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="Binary search tree being rotated" />
            <InOrder s={s} />
            <CodeTrace code={code} line={s.line ?? null} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* BALT-3.1 */
export function AvlFigure() {
  const [v, setV] = useState<AvlVariant>("sorted");
  const steps = useMemo(() => avlSteps(v), [v]);
  return (
    <Stepper
      id="BALT-3.1"
      lesson="BALT-3"
      title="An AVL tree keeps every balance within one"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Insert"
          value={v}
          options={[
            { value: "sorted", label: "1 to 7 in order" },
            { value: "double", label: "A double rotation" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="AVL tree; each tag is the node's balance" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* BALT-4.1 */
export function RbFigure() {
  const [v, setV] = useState<RbVariant>("rules");
  const steps = useMemo(() => rbSteps(v), [v]);
  return (
    <Stepper
      id="BALT-4.1"
      lesson="BALT-4"
      title="Red-black trees"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "rules", label: "The rules" },
            { value: "insert", label: "Insert 1 to 8" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="Red-black tree; each tag is the node's colour, R for red and B for black" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* BALT-5.1 */
export function BtreeFigure() {
  const [v, setV] = useState<"insert" | "search">("insert");
  const steps = useMemo(() => btreeSteps(v), [v]);
  return (
    <Stepper
      id="BALT-5.1"
      lesson="BALT-5"
      title="A B-tree grows at the root"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "insert", label: "Insert 10 to 100" },
            { value: "search", label: "Search for 70" },
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
              <Tree nodes={s.nodes} label="B-tree; each box is one node holding up to 3 keys" slide unit={118} />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* BALT-6.1 */
export function SkipFigure() {
  const [v, setV] = useState<"search" | "insert">("search");
  const steps = useMemo(() => skipSteps(v), [v]);
  return (
    <Stepper
      id="BALT-6.1"
      lesson="BALT-6"
      title="A skip list: higher levels skip over keys"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "search", label: "Search for 19" },
            { value: "insert", label: "Insert 12" },
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
              <SkipList keys={SKIP_KEYS} heights={s.heights} levels={4} states={s.states} edges={s.edges} label="Skip list with 4 levels" />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
