"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CodeTrace, Follow, Named, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  HEIGHT_CODE,
  RB_IN,
  RB_PRE,
  SER_TOKENS,
  bstSteps,
  deleteSteps,
  heightSteps,
  lcaAnySteps,
  lcaBstSteps,
  rebuildSteps,
  serSteps,
  traversalSteps,
  wordSteps,
  type BstVariant,
  type DelVariant,
  type Order,
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

function TreeStage({ s, label, unit }: { s: TreeStep; label: string; unit?: number }) {
  return (
    <Follow>
      <Tree nodes={s.nodes} label={label} binary unit={unit} />
    </Follow>
  );
}

/* TREE-1.1 */
export function PartsFigure() {
  const [v, setV] = useState<"words" | "height">("words");
  const steps = useMemo(() => (v === "words" ? wordSteps() : heightSteps()), [v]);
  return (
    <Stepper
      id="TREE-1.1"
      lesson="TREE-1"
      title="The parts of a tree"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "words", label: "The words" },
            { value: "height", label: "Height by recursion" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="Binary tree of 9 nodes" unit={v === "height" ? 62 : undefined} />
            {v === "height" && <CodeTrace code={HEIGHT_CODE} line={s.line ?? null} />}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-2.1 */
export function TraversalFigure() {
  const [v, setV] = useState<Order>("pre");
  const steps = useMemo(() => traversalSteps(v), [v]);
  return (
    <Stepper
      id="TREE-2.1"
      lesson="TREE-2"
      title="Four ways to visit every node"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Order"
          value={v}
          options={[
            { value: "pre", label: "Pre-order" },
            { value: "in", label: "In-order" },
            { value: "post", label: "Post-order" },
            { value: "level", label: "Level" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label="Binary tree being traversed" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-3.1 */
export function RebuildFigure() {
  const steps = useMemo(() => rebuildSteps(), []);
  return (
    <Stepper id="TREE-3.1" lesson="TREE-3" title="Rebuilding a tree from two lists" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="preorder">
              <ArrayTrack values={RB_PRE} states={s.pre} pointers={[{ name: "nxt", at: s.next, kind: "mid" }]} label="preorder" />
            </Named>
            <Named name="inorder">
              <ArrayTrack
                values={RB_IN}
                states={s.ins}
                window={s.showWin ? { lo: s.lo, hi: s.hi, label: "this subtree" } : undefined}
                pointers={[]}
                label="inorder"
              />
            </Named>
            <TreeStage s={s} label="The tree, as rebuilt so far" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-4.1 */
export function BstFigure() {
  const [v, setV] = useState<BstVariant>("search");
  const steps = useMemo(() => bstSteps(v), [v]);
  return (
    <Stepper
      id="TREE-4.1"
      lesson="TREE-4"
      title="Search and insert in a search tree"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "search", label: "Search for 7" },
            { value: "insert", label: "Insert 5" },
            { value: "sorted", label: "Insert in sorted order" },
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
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-5.1 */
export function DeleteFigure() {
  const [v, setV] = useState<DelVariant>("leaf");
  const steps = useMemo(() => deleteSteps(v), [v]);
  return (
    <Stepper
      id="TREE-5.1"
      lesson="TREE-5"
      title="Deleting a key"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Delete"
          value={v}
          options={[
            { value: "leaf", label: "A leaf: 4" },
            { value: "one", label: "One child: 10" },
            { value: "two", label: "Two children: 3" },
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
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-6.1 */
export function LcaFigure() {
  const [v, setV] = useState<"bst" | "any">("bst");
  const steps = useMemo(() => (v === "bst" ? lcaBstSteps() : lcaAnySteps()), [v]);
  return (
    <Stepper
      id="TREE-6.1"
      lesson="TREE-6"
      title="Lowest common ancestor"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Tree"
          value={v}
          options={[
            { value: "bst", label: "Search tree: 4 and 7" },
            { value: "any", label: "Any tree: 7 and 4" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label={v === "bst" ? "Binary search tree" : "Binary tree whose values are not sorted"} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TREE-7.1 */
export function SerialFigure() {
  const [v, setV] = useState<"write" | "read">("write");
  const steps = useMemo(() => serSteps(v === "read"), [v]);
  return (
    <Stepper
      id="TREE-7.1"
      lesson="TREE-7"
      title="A tree as text, and back"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Direction"
          value={v}
          options={[
            { value: "write", label: "Write it out" },
            { value: "read", label: "Read it back" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TreeStage s={s} label={v === "write" ? "Tree with its missing children marked #" : "Tree being rebuilt from the text"} />
            {v === "read" && (
              <Named name="tokens">
                <ArrayTrack values={SER_TOKENS} states={s.tstates} pointers={[{ name: "next", at: s.at, kind: "mid" }]} label="tokens" />
              </Named>
            )}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
