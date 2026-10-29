"use client";

import { useMemo, useState } from "react";
import { Follow, Graph, Grid, Named, Plane, Queue, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  DAG_SIZE,
  DIGIT_N,
  KNUTH_PILES,
  LINE_SIZE,
  PILES,
  TOUR_MASKS,
  T_IDS,
  dagSteps,
  digitSteps,
  joinSteps,
  knuthSteps,
  lineSteps,
  maskBits,
  tourSteps,
  treeSteps,
  type DagVariant,
  type FastVariant,
  type JoinVariant,
  type TourVariant,
  type TreeVariant,
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

const idx = (n: number) => Array.from({ length: n }, (_, k) => k);

/* ADDP-1.1 */
export function TreeFigure() {
  const [v, setV] = useState<TreeVariant>("pick");
  const steps = useMemo(() => treeSteps(v), [v]);
  return (
    <Stepper
      id="ADDP-1.1"
      lesson="ADDP-1"
      title="Answers for every subtree, from the leaves up"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "pick", label: "Staff stations" },
            { value: "reroot", label: "Rerooting" },
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
              <Tree nodes={s.nodes} label="A tree of eight stations, A at the top" level={56} unit={50} />
            </Follow>
            <Named name={v === "pick" ? "value, take, skip" : "size, down, total"}>
              <Grid cells={s.cells} colHead={T_IDS} rowHead={s.rowHead} rowHeadWidth={46} label="One column per station" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* ADDP-2.1 */
export function DagFigure() {
  const [v, setV] = useState<DagVariant>("count");
  const steps = useMemo(() => dagSteps(v), [v]);
  return (
    <Stepper
      id="ADDP-2.1"
      lesson="ADDP-2"
      title="One pass in topological order"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Find"
          value={v}
          options={[
            { value: "count", label: "Count routes" },
            { value: "best", label: "Best route" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <div className="graph-row">
              <Graph w={DAG_SIZE.w} h={DAG_SIZE.h} nodes={s.nodes} edges={s.edges} directed label="A DAG from S to T" />
              <div className="graph-side">
                <Queue items={s.queue} name="topological order" end="none" />
              </div>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* ADDP-3.1 */
export function JoinFigure() {
  const [v, setV] = useState<JoinVariant>("length");
  const steps = useMemo(() => joinSteps(v), [v]);
  return (
    <Stepper
      id="ADDP-3.1"
      lesson="ADDP-3"
      title="Joining piles: a table of stretches"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Fill"
          value={v}
          options={[
            { value: "length", label: "By length" },
            { value: "rows", label: "Row by row" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="piles">
              <Grid cells={s.piles} colHead={idx(PILES.length)} rowHead={[null]} label="The sizes of the piles, in order" />
            </Named>
            <Named name="best[i][j]">
              <Grid cells={s.cells} label="Row i, column j: the cheapest way to join piles i to j" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* ADDP-4.1 */
export function TourFigure() {
  const [v, setV] = useState<TourVariant>("tour");
  const steps = useMemo(() => tourSteps(v), [v]);
  return (
    <Stepper
      id="ADDP-4.1"
      lesson="ADDP-4"
      title="The shortest round trip over sets of cities"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "tour", label: "Fill the table" },
            { value: "back", label: "Walk back" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <div className="stage-row">
              <Named name="best[mask][end]">
                <Grid cells={s.cells} colHead={idx(4)} rowHead={TOUR_MASKS.map(maskBits)} rowHeadWidth={52} label="One row per set of visited cities, one column per end city" />
              </Named>
              <Named name="distance">
                <Grid cells={s.dist} label="Distances between the four cities" />
              </Named>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* ADDP-5.1 */
export function DigitFigure() {
  const steps = useMemo(() => digitSteps(), []);
  return (
    <Stepper id="ADDP-5.1" lesson="ADDP-5" title="Counting numbers up to N, place by place" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name={`digit, under N = ${DIGIT_N}`}>
              <Grid cells={s.cells} colHead={String(DIGIT_N).split("")} rowHead={idx(10)} label="One row per digit, one column per place of N" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* ADDP-6.1 */
export function FastFigure() {
  const [v, setV] = useState<FastVariant>("knuth");
  const kSteps = useMemo(() => knuthSteps(), []);
  const lSteps = useMemo(() => lineSteps(), []);
  const total = v === "knuth" ? kSteps.length : lSteps.length;
  return (
    <Stepper
      id="ADDP-6.1"
      lesson="ADDP-6"
      title="Trying fewer candidates"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "knuth" ? kSteps : lSteps)[Math.min(i, total - 1)].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "knuth", label: "Knuth's rule" },
            { value: "lines", label: "Lines on a hull" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "knuth") {
          const s = kSteps[Math.min(i, kSteps.length - 1)];
          return (
            <div className="stage-stack">
              <Named name="piles">
                <Grid cells={s.piles} colHead={idx(KNUTH_PILES.length)} rowHead={[null]} label="The sizes of the piles, in order" />
              </Named>
              <Named name="best[i][j], with the best split">
                <Grid cells={s.cells} label="Row i, column j: the cheapest way to join piles i to j, and its split" />
              </Named>
              <Readout s={s} />
            </div>
          );
        }
        const s = lSteps[Math.min(i, lSteps.length - 1)];
        return (
          <div className="stage-stack">
            <div className="graph-row">
              <Plane w={LINE_SIZE.w} h={LINE_SIZE.h} points={s.points} segs={s.segs} lines={s.lines} label="Straight lines and the lowest of them" />
              <div className="graph-side">
                <Queue items={s.queue} name="lines kept" end="front" />
              </div>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
