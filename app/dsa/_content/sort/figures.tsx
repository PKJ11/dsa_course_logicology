"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Grid, Named, Tree, Verdict, type TNode } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  LEFT,
  PART_RANDOM,
  PART_SORTED,
  RIGHT,
  countingSteps,
  decisionSteps,
  heapSteps,
  mergeSteps,
  mergeTreeSteps,
  partitionSteps,
  radixSteps,
  selectSteps,
  simpleSteps,
  stabilitySteps,
  type ArrStep,
  type SimpleKind,
} from "./algos";

function Stats({ s }: { s: ArrStep }) {
  return (
    <div className="readout">
      {Object.entries(s.stats).map(([k, v]) => (
        <span key={k}>
          {k} <b className="num">{v}</b>
        </span>
      ))}
    </div>
  );
}

function Wide({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: "auto", maxWidth: "100%" }}>{children}</div>;
}

/* SORT-1.1 */
export function SimpleFigure() {
  const [v, setV] = useState<SimpleKind>("insertion");
  const steps = useMemo(() => simpleSteps(v), [v]);
  return (
    <Stepper
      id="SORT-1.1"
      lesson="SORT-1"
      title="Three simple sorts on the same list"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Sort"
          value={v}
          options={[
            { value: "insertion", label: "Insertion" },
            { value: "selection", label: "Selection" },
            { value: "bubble", label: "Bubble" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={s.a} states={s.states} window={s.win} pointers={s.ptrs} />
            <Stats s={s} />
          </>
        );
      }}
    </Stepper>
  );
}

/* SORT-2.1 */
export function MergeFigure() {
  const [v, setV] = useState<"merge" | "tree">("merge");
  const merge = useMemo(() => mergeSteps(), []);
  const tree = useMemo(() => mergeTreeSteps(), []);
  const total = v === "merge" ? merge.length : tree.length;
  return (
    <Stepper
      id="SORT-2.1"
      lesson="SORT-2"
      title={v === "merge" ? "Merging two sorted lists" : "Merge sort: split, then merge"}
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "merge" ? merge : tree)[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "merge", label: "One merge" },
            { value: "tree", label: "The whole sort" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "tree") {
          const s = tree[i];
          return (
            <Follow>
              <Tree nodes={s.nodes} label="Merge sort recursion tree" level={64} unit={64} />
            </Follow>
          );
        }
        const s = merge[i];
        return (
          <div className="stage-stack">
            <Named name="left">
              <ArrayTrack label="left" values={LEFT} states={LEFT.map((_, k) => (k < s.i ? "out" : k === s.i ? "mid" : ""))} pointers={[{ name: "i", at: s.i < LEFT.length ? s.i : null, kind: "blue" }]} />
            </Named>
            <Named name="right">
              <ArrayTrack label="right" values={RIGHT} states={RIGHT.map((_, k) => (k < s.j ? "out" : k === s.j ? "mid" : ""))} pointers={[{ name: "j", at: s.j < RIGHT.length ? s.j : null, kind: "blue" }]} />
            </Named>
            <Named name="out">
              <ArrayTrack label="out" values={s.out} states={s.out.map((x, k) => (x === "" ? "" : k === s.i + s.j - 1 && s.from ? "found" : ""))} pointers={[]} />
            </Named>
          </div>
        );
      }}
    </Stepper>
  );
}

/* SORT-3.1 */
export function PartitionFigure() {
  const [v, setV] = useState<"random" | "sorted">("random");
  const steps = useMemo(() => partitionSteps(v === "random" ? PART_RANDOM : PART_SORTED), [v]);
  return (
    <Stepper
      id="SORT-3.1"
      lesson="SORT-3"
      title="Partitioning around the last value"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Input"
          value={v}
          options={[
            { value: "random", label: "Mixed order" },
            { value: "sorted", label: "Already sorted" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack values={s.a} states={s.states} window={s.win} pointers={s.ptrs} />
            <Stats s={s} />
          </>
        );
      }}
    </Stepper>
  );
}

/* SORT-4.1 */
export function HeapFigure() {
  const steps = useMemo(() => heapSteps(), []);
  return (
    <Stepper id="SORT-4.1" lesson="SORT-4" title="Heap sort: build a heap, then take the top" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        const nodes: TNode[] = s.a.map((v, k) => ({
          id: `h${k}`,
          label: String(v),
          parent: k ? `h${Math.floor((k - 1) / 2)}` : undefined,
          state: k >= s.size ? "hidden" : s.hl.includes(k) ? (s.ok === k ? "found" : "cur") : "",
        }));
        return (
          <div className="stage-stack">
            <Tree nodes={nodes} label={`Heap of ${s.size} values`} level={58} unit={52} />
            <ArrayTrack
              values={s.a}
              states={s.a.map((_, k) => (k >= s.size ? "found" : s.hl.includes(k) ? "mid" : ""))}
              window={s.size > 0 ? { lo: 0, hi: s.size - 1, label: "heap" } : undefined}
              pointers={[]}
            />
          </div>
        );
      }}
    </Stepper>
  );
}

/* SORT-5.1 */
const INPUTS = { mixed: { a: 7, b: 2, c: 5 }, sorted: { a: 1, b: 2, c: 3 } };

export function DecisionFigure() {
  const [v, setV] = useState<"mixed" | "sorted">("mixed");
  const steps = useMemo(() => decisionSteps(INPUTS[v]), [v]);
  return (
    <Stepper
      id="SORT-5.1"
      lesson="SORT-5"
      title="Every comparison sort is a decision tree"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Input a, b, c"
          value={v}
          options={[
            { value: "mixed", label: "7, 2, 5" },
            { value: "sorted", label: "1, 2, 3" },
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
              <Tree nodes={s.nodes} label="Decision tree for sorting a, b and c" level={70} />
            </Follow>
            <div className="readout">
              <span>
                comparisons <b className="num">{s.count}</b>
              </span>
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* SORT-6.1 */
export function CountingFigure() {
  const [v, setV] = useState<"count" | "radix">("count");
  const steps = useMemo(() => (v === "count" ? countingSteps() : radixSteps()), [v]);
  return (
    <Stepper
      id="SORT-6.1"
      lesson="SORT-6"
      title={v === "count" ? "Counting sort: count, then write out" : "Radix sort: one digit at a time"}
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Sort"
          value={v}
          options={[
            { value: "count", label: "Counting" },
            { value: "radix", label: "Radix" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        if (v === "radix")
          return (
            <div className="stage-stack">
              <Named name="list">
                <ArrayTrack label="list" values={s.a} states={s.aStates} pointers={[]} />
              </Named>
              {s.count.length > 0 && (
                <Named name="how many have each digit">
                  <ArrayTrack label="how many have each digit" values={s.count} states={[]} pointers={[]} />
                </Named>
              )}
            </div>
          );
        return (
          <div className="stage-stack">
            <Named name="a">
              <ArrayTrack label="a" values={s.a} states={s.aStates} pointers={[]} />
            </Named>
            <Named name="count">
              <ArrayTrack label="count" values={s.count} states={s.cStates} pointers={[]} />
            </Named>
            <Named name="out">
              <ArrayTrack label="out" values={s.out} states={[]} pointers={[]} />
            </Named>
          </div>
        );
      }}
    </Stepper>
  );
}

/* SORT-7.1 */
export function StabilityFigure() {
  const [v, setV] = useState<"stable" | "unstable">("stable");
  const steps = useMemo(() => stabilitySteps(v === "stable"), [v]);
  return (
    <Stepper
      id="SORT-7.1"
      lesson="SORT-7"
      title="Do equal keys keep their order?"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Sort"
          value={v}
          options={[
            { value: "stable", label: "Insertion" },
            { value: "unstable", label: "Selection" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <>
            <Wide>
              <Grid
                cells={["name", "platform"].map((_, r) =>
                  s.a.map((x, k) => {
                    const v = x.split("·")[r];
                    const st = s.states[k];
                    return { v, small: r === 0, s: st === "mid" ? "cur" : st === "violated" ? "bad" : st === "found" ? "found" : st === "path" ? "path" : "" };
                  }),
                )}
                rowHead={["train", "platform"]}
                rowHeadWidth={62}
                label="the trains in their current order: each train's name above its platform number"
              />
            </Wide>
            <div className="readout">
              <span>
                sorted by <b>platform</b> only
              </span>
              <Verdict v={s.verdict} />
            </div>
          </>
        );
      }}
    </Stepper>
  );
}

/* SORT-8.1 */
export function SelectFigure() {
  const steps = useMemo(() => selectSteps(), []);
  return (
    <Stepper id="SORT-8.1" lesson="SORT-8" title="Quickselect keeps only one side" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <>
            <ArrayTrack
              values={s.a}
              states={s.states}
              window={s.win}
              pointers={[
                { name: "k", at: 4, kind: "blue" },
                { name: "pivot", at: s.p, kind: "mid" },
              ]}
            />
            <div className="readout">
              <span>
                looking for index <b className="num">4</b>
              </span>
            </div>
          </>
        );
      }}
    </Stepper>
  );
}
