"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Grid, Named, Spans, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import { fenwickSteps, lazySteps, prefixSteps, segSteps, sparseSteps, sqrtSteps, type RangeStep, type Track } from "./algos";

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

function Bare({ t }: { t: Track }) {
  return (
    <ArrayTrack
      values={t.values}
      states={t.states ?? []}
      window={t.window}
      pointers={t.pointer ? [{ name: t.pointer.name, at: t.pointer.at, kind: "mid" }] : []}
      base={t.base ?? 0}
      label={`the list ${t.name}`}
    />
  );
}

/** The bars sit directly above the first list, in the same scroll box, on the same columns. */
function Stage({ s, spansLabel, table }: { s: RangeStep; spansLabel: string; table?: string }) {
  const [first, ...rest] = s.tracks;
  return (
    <div className="stage-stack">
      {s.grid && (
        <Named name={table ?? "table"}>
          <Grid cells={s.grid} label={table ?? "table"} />
        </Named>
      )}
      <Named name={first.name}>
        {s.spans && <Spans n={first.values.length} rows={s.spans} label={spansLabel} />}
        <Bare t={first} />
      </Named>
      {rest.map((t) => (
        <Named key={t.name} name={t.name}>
          <Bare t={t} />
        </Named>
      ))}
      <Readout s={s} />
    </div>
  );
}

/* RNGQ-1.1 */
export function PrefixFigure() {
  const [v, setV] = useState<"sums" | "adds">("sums");
  const steps = useMemo(() => prefixSteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-1.1"
      lesson="RNGQ-1"
      title="Prefix sums and the difference list"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "sums", label: "Range sums" },
            { value: "adds", label: "Adding to ranges" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="" />}
    </Stepper>
  );
}

/* RNGQ-2.1 */
export function SparseFigure() {
  const [v, setV] = useState<"build" | "query">("build");
  const steps = useMemo(() => sparseSteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-2.1"
      lesson="RNGQ-2"
      title="A sparse table for the smallest value"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "build", label: "Build" },
            { value: "query", label: "Ask" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="The blocks being combined" table="table: row k, start i" />}
    </Stepper>
  );
}

/* RNGQ-3.1 */
export function FenwickFigure() {
  const [v, setV] = useState<"prefix" | "add" | "range">("prefix");
  const steps = useMemo(() => fenwickSteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-3.1"
      lesson="RNGQ-3"
      title="A Fenwick tree"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "prefix", label: "First 7" },
            { value: "add", label: "Add 5 at 3" },
            { value: "range", label: "Positions 3 to 6" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="Fenwick tree: bar t[i] ends at position i" />}
    </Stepper>
  );
}

/* RNGQ-4.1 */
export function SegmentFigure() {
  const [v, setV] = useState<"build" | "query" | "update">("build");
  const steps = useMemo(() => segSteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-4.1"
      lesson="RNGQ-4"
      title="A segment tree of sums"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "build", label: "Build" },
            { value: "query", label: "Sum of a[2:7]" },
            { value: "update", label: "Set a[5] = 9" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="Segment tree: each bar is a node over the cells below it" />}
    </Stepper>
  );
}

/* RNGQ-5.1 */
export function LazyFigure() {
  const [v, setV] = useState<"add" | "query">("add");
  const steps = useMemo(() => lazySteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-5.1"
      lesson="RNGQ-5"
      title="Adding to a range, lazily"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "add", label: "Add 3 to a[1:7]" },
            { value: "query", label: "Then sum a[5:7]" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="Segment tree with pending tags" />}
    </Stepper>
  );
}

/* RNGQ-6.1 */
export function SqrtFigure() {
  const [v, setV] = useState<"query" | "update">("query");
  const steps = useMemo(() => sqrtSteps(v), [v]);
  return (
    <Stepper
      id="RNGQ-6.1"
      lesson="RNGQ-6"
      title="Blocks of about √n"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "query", label: "Sum of a[1:7]" },
            { value: "update", label: "Set a[4] = 9" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Stage s={steps[i]} spansLabel="Block sums" />}
    </Stepper>
  );
}
