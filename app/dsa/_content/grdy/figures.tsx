"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Grid, Named, Timeline, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import { bagSteps, failSteps, huffSteps, intervalSteps, swapSteps, type BagRule, type FailVariant, type HuffVariant, type IntervalRule, type LineStep, type SwapVariant } from "./algos";

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

/** A small table of items under the line, with the item being looked at marked. */
function Items({ t }: { t: NonNullable<LineStep["table"]> }) {
  return (
    <table className="tt vars" style={{ minWidth: 220, width: "min(100%, 400px)" }}>
      <caption className="visually-hidden">The items</caption>
      <thead>
        <tr>
          {t.head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {t.rows.map((r, k) => (
          <tr key={r[0]} className={k === t.cur ? "is-current" : undefined}>
            {r.map((c, j) => (
              <td key={j}>{j === 0 ? <code>{c}</code> : c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Line({ s, from, to, label }: { s: LineStep; from: number; to: number; label: string }) {
  return (
    <div className="stage-stack">
      <Timeline from={from} to={to} rows={s.rows} marks={s.marks} label={label} />
      {s.table && <Items t={s.table} />}
      <Readout s={s} />
    </div>
  );
}

/* GRDY-1.1 */
export function BagFigure() {
  const [v, setV] = useState<BagRule>("ratio");
  const steps = useMemo(() => bagSteps(v), [v]);
  return (
    <Stepper
      id="GRDY-1.1"
      lesson="GRDY-1"
      title="Filling a bag, one greedy choice at a time"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Rule"
          value={v}
          options={[
            { value: "ratio", label: "Value per kg" },
            { value: "value", label: "Most valuable" },
            { value: "light", label: "Lightest" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Line s={steps[i]} from={0} to={8} label="The bag as a line of 8 kilograms; each item fills the kilograms it uses" />}
    </Stepper>
  );
}

/* GRDY-2.1 */
export function SwapFigure() {
  const [v, setV] = useState<SwapVariant>("wait");
  const steps = useMemo(() => swapSteps(v), [v]);
  return (
    <Stepper
      id="GRDY-2.1"
      lesson="GRDY-2"
      title="An exchange argument: swap neighbours that break the rule"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Goal"
          value={v}
          options={[
            { value: "wait", label: "Least total wait" },
            { value: "late", label: "Least lateness" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Line s={steps[i]} from={0} to={10} label="Jobs on one machine, one after another, along a time line" />}
    </Stepper>
  );
}

/* GRDY-3.1 */
export function IntervalFigure() {
  const [v, setV] = useState<IntervalRule>("end");
  const steps = useMemo(() => intervalSteps(v), [v]);
  return (
    <Stepper
      id="GRDY-3.1"
      lesson="GRDY-3"
      title="Choosing intervals"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Rule"
          value={v}
          options={[
            { value: "end", label: "Ends first" },
            { value: "start", label: "Starts first" },
            { value: "short", label: "Shortest" },
            { value: "platforms", label: "Platforms" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) =>
        v === "platforms" ? (
          <Line s={steps[i]} from={0} to={10} label="Trains on platforms along a time line" />
        ) : (
          <Line s={steps[i]} from={0} to={11} label="Bookings along a time line, with the chosen ones on the top row" />
        )
      }
    </Stepper>
  );
}

/* GRDY-4.1 */
export function HuffmanFigure() {
  const [v, setV] = useState<HuffVariant>("build");
  const steps = useMemo(() => huffSteps(v), [v]);
  // on phones the six starting trees must fit one row: narrower units and almost no gap between trees
  const compact = useCompact();
  return (
    <Stepper
      id="GRDY-4.1"
      lesson="GRDY-4"
      title="Building a Huffman tree"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "build", label: "Build" },
            { value: "decode", label: "Decode" },
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
              <Tree
                nodes={s.nodes}
                label="Huffman trees; edges to the left are 0, to the right 1"
                slide
                level={62}
                unit={compact ? 50 : 58}
                forestGap={compact ? 0.06 : 0.3}
              />
            </Follow>
            {v === "build" ? (
              <Named name="queue, lightest first">
                <Grid
                  cells={[
                    s.queue.map((q, k) => ({ v: q.split(" ").length > 1 ? q.split(" ")[0] : "", s: s.queueStates[k] === "mid" ? "path" : "" })),
                    s.queue.map((q, k) => ({ v: q.split(" ").pop(), s: s.queueStates[k] === "mid" ? "path" : "" })),
                  ]}
                  colHead={s.queue.map((_, k) => k)}
                  rowHead={["letter", "weight"]}
                  rowHeadWidth={54}
                  label="the queue of trees, lightest first: each tree's letter (if it is one letter) and its weight"
                />
              </Named>
            ) : (
              <Named name="bits">
                <ArrayTrack
                  values={s.bits ?? []}
                  states={s.bitStates ?? []}
                  pointers={[{ name: "read", at: s.bitAt ?? null, kind: "mid" }]}
                  label="the bits to decode"
                />
              </Named>
            )}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* GRDY-5.1 */
export function FailFigure() {
  const [v, setV] = useState<FailVariant>("coins");
  const steps = useMemo(() => failSteps(v), [v]);
  const to = v === "coins" ? 6 : 8;
  return (
    <Stepper
      id="GRDY-5.1"
      lesson="GRDY-5"
      title="When the greedy choice is wrong"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Problem"
          value={v}
          options={[
            { value: "coins", label: "Coins 1, 3, 4" },
            { value: "rupees", label: "Coins 1, 2, 5, 10" },
            { value: "knap", label: "Whole items" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <Line
          s={steps[i]}
          from={0}
          to={to}
          label={v === "knap" ? "Two bags of 8 kilograms: the greedy one and the best one" : "The amount as a line; each coin covers as much of it as it is worth"}
        />
      )}
    </Stepper>
  );
}
