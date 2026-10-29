"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Grid, Named, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import {
  LISTS,
  MSTREAM,
  STREAM,
  buildSteps,
  cellStates,
  heapNodes,
  medianSteps,
  mergeSteps,
  pqSteps,
  propertySteps,
  siftSteps,
  topkSteps,
  type HeapStep,
  type Item,
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

function HeapTree({ items, marks, removed, label, unit }: { items: Item[]; marks?: HeapStep["marks"]; removed?: string[]; label: string; unit?: number }) {
  return (
    <Follow>
      <Tree nodes={heapNodes(items, marks, new Set(removed))} label={label} slide level={58} unit={unit ?? 52} />
    </Follow>
  );
}

function HeapView({ s, label, list = true }: { s: HeapStep; label: string; list?: boolean }) {
  return (
    <>
      <HeapTree items={s.items} marks={s.marks} label={label} />
      {list && s.items.length > 0 && (
        <Named name="the list">
          <ArrayTrack values={s.items.map((it) => it.label)} states={cellStates(s.items.length, s.cells)} pointers={[]} label="the list that stores the heap" />
        </Named>
      )}
    </>
  );
}

/* HEAP-1.1 */
export function PropertyFigure() {
  const [v, setV] = useState<"positions" | "check">("positions");
  const steps = useMemo(() => propertySteps(v), [v]);
  return (
    <Stepper
      id="HEAP-1.1"
      lesson="HEAP-1"
      title="A heap is a tree stored in a list"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "positions", label: "Positions" },
            { value: "check", label: "Is it a heap?" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <HeapView s={s} label="Heap drawn as a tree" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HEAP-2.1 */
export function SiftFigure() {
  const [v, setV] = useState<"push" | "pop">("push");
  const steps = useMemo(() => siftSteps(v), [v]);
  return (
    <Stepper
      id="HEAP-2.1"
      lesson="HEAP-2"
      title="Sift up and sift down"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "push", label: "Push 2 (sift up)" },
            { value: "pop", label: "Pop (sift down)" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <HeapView s={s} label="Min-heap" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HEAP-3.1 */
export function BuildFigure() {
  const [v, setV] = useState<"down" | "up">("down");
  const steps = useMemo(() => buildSteps(v), [v]);
  return (
    <Stepper
      id="HEAP-3.1"
      lesson="HEAP-3"
      title="Two ways to build a heap"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Build"
          value={v}
          options={[
            { value: "down", label: "Bottom up" },
            { value: "up", label: "One at a time" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <HeapView s={s} label="Heap being built" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HEAP-4.1 */
export function QueueFigure() {
  const steps = useMemo(() => pqSteps(), []);
  return (
    <Stepper id="HEAP-4.1" lesson="HEAP-4" title="A priority queue with ties and removal" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <HeapTree items={s.items} marks={s.marks} removed={s.removed} label="Heap of (priority, count, task) entries" unit={122} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HEAP-5.1 */
export function TopFigure() {
  const [v, setV] = useState<"topk" | "merge">("topk");
  const top = useMemo(() => topkSteps(), []);
  const merge = useMemo(() => mergeSteps(), []);
  const compact = useCompact();
  const total = v === "topk" ? top.length : merge.length;
  return (
    <Stepper
      id="HEAP-5.1"
      lesson="HEAP-5"
      title="Small heaps for big inputs"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "topk" ? top[i] : merge[i]).caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "topk", label: "Top 3 of a stream" },
            { value: "merge", label: "Merge 3 sorted lists" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "topk") {
          const s = top[i];
          return (
            <div className="stage-stack">
              <Named name="stream">
                <ArrayTrack values={STREAM} states={s.stream} pointers={s.at === null ? [] : [{ name: "i", at: s.at, kind: "mid" }]} label="stream" />
              </Named>
              <HeapTree items={s.items} marks={s.marks} label="Min-heap of the 3 largest so far" />
              <Readout s={s} />
            </div>
          );
        }
        const s = merge[i];
        return (
          <div className="stage-stack">
            {compact ? (
              // On phones the three short lists share one small table, so the heap and the output stay on screen.
              <Named name="lists A, B, C">
                <Grid
                  cells={Object.entries(LISTS).map(([name, vals]) =>
                    vals.map((val, k) => ({ v: val, s: k < s.pos[name] ? ("out" as const) : undefined })),
                  )}
                  rowHead={Object.keys(LISTS)}
                  label="The three sorted lists; values already taken are hatched"
                />
              </Named>
            ) : (
              <div className="stage-row">
                {Object.entries(LISTS).map(([name, vals]) => (
                  <Named key={name} name={`list ${name}`}>
                    <ArrayTrack
                      values={vals}
                      states={vals.map((_, k) => (k < s.pos[name] ? "out" : ""))}
                      pointers={[]}
                      label={`list ${name}`}
                    />
                  </Named>
                ))}
              </div>
            )}
            <HeapTree items={s.items} marks={s.marks} label="Min-heap of front values" unit={58} />
            <Named name="output">
              <ArrayTrack values={s.out.length ? s.out : ["–"]} states={[]} pointers={[]} showIdx={s.out.length > 0} label="output" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HEAP-6.1 */
export function MedianFigure() {
  const steps = useMemo(() => medianSteps(), []);
  return (
    <Stepper id="HEAP-6.1" lesson="HEAP-6" title="The median from two heaps" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="stream">
              <ArrayTrack values={MSTREAM} states={MSTREAM.map((_, k) => (k === s.at ? "mid" : ""))} pointers={[{ name: "i", at: s.at, kind: "mid" }]} label="stream" />
            </Named>
            <div className="stage-row">
              <Named name="lower half: max-heap">
                <HeapTree items={s.low} marks={s.low.length ? { 0: "cur" } : {}} label="Lower half, largest on top" />
              </Named>
              <Named name="upper half: min-heap">
                {s.high.length ? <HeapTree items={s.high} marks={{ 0: "cur" }} label="Upper half, smallest on top" /> : <p className="follow__hint">empty</p>}
              </Named>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
