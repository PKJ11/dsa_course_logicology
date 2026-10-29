"use client";

import { useMemo, useState } from "react";
import { Follow, Graph, Grid, Named, Queue, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  BNB_ITEMS,
  CHECK_SIZE,
  COVER_SIZE,
  RED_SIZE,
  SAT_VARS,
  TOUR_SIZE,
  bnbSteps,
  checkSteps,
  coverSteps,
  findSteps,
  mrSteps,
  reduceSteps,
  tourSteps,
  type ApproxVariant,
  type BnbVariant,
  type CheckVariant,
  type GraphStep,
  type MrVariant,
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

function GraphOnly({ s, w, h, label, directed = false }: { s: GraphStep; w: number; h: number; label: string; directed?: boolean }) {
  return (
    <div className="stage-stack">
      <div style={{ width: "100%" }}>
        <Graph w={w} h={h} nodes={s.nodes} edges={s.edges} directed={directed} label={label} />
      </div>
      <Readout s={s} />
    </div>
  );
}

/* HARD-1.1 */
export function CheckFigure() {
  const [v, setV] = useState<CheckVariant>("check");
  const gSteps = useMemo(() => (v === "find" ? [] : checkSteps(v)), [v]);
  const fSteps = useMemo(() => findSteps(), []);
  const total = v === "find" ? fSteps.length : gSteps.length;
  return (
    <Stepper
      id="HARD-1.1"
      lesson="HARD-1"
      title="Checking an answer, and finding one"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "find" ? fSteps : gSteps)[Math.min(i, total - 1)].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "check", label: "Check" },
            { value: "wrong", label: "A wrong answer" },
            { value: "find", label: "Find with yes/no" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "find") {
          const s = fSteps[Math.min(i, fSteps.length - 1)];
          return (
            <div className="stage-stack">
              <Named name="fixed so far">
                <Grid cells={s.cells} colHead={SAT_VARS} rowHead={[null]} label="The value fixed for each variable, T or F" />
              </Named>
              <Readout s={s} />
            </div>
          );
        }
        const s = gSteps[Math.min(i, gSteps.length - 1)];
        return <GraphOnly s={s} w={CHECK_SIZE.w} h={CHECK_SIZE.h} label="A graph whose vertices carry a claimed group number" />;
      }}
    </Stepper>
  );
}

/* HARD-2.1 */
export function ReduceFigure() {
  const steps = useMemo(() => reduceSteps(), []);
  return (
    <Stepper id="HARD-2.1" lesson="HARD-2" title="From 3-SAT to independent set" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => <GraphOnly s={steps[i]} w={RED_SIZE.w} h={RED_SIZE.h} label="One triangle per clause, and an edge between every condition and its opposite" />}
    </Stepper>
  );
}

/* HARD-3.1 */
export function BnbFigure() {
  const [v, setV] = useState<BnbVariant>("frac");
  const steps = useMemo(() => bnbSteps(v), [v]);
  return (
    <Stepper
      id="HARD-3.1"
      lesson="HARD-3"
      title="Branch and bound on a small knapsack"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Bound"
          value={v}
          options={[
            { value: "frac", label: "Cut the last item" },
            { value: "sum", label: "Add up everything left" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="items: weight, value">
              <Grid cells={s.cells} colHead={BNB_ITEMS.map((t) => t.id)} rowHead={["kg", "value"]} rowHeadWidth={46} label="Items A to D with their weights and values" />
            </Named>
            <Follow>
              <Tree nodes={s.nodes} label="The search tree: left takes the next item, right leaves it" level={58} unit={74} full />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HARD-4.1 */
export function ApproxFigure() {
  const [v, setV] = useState<ApproxVariant>("cover");
  const cSteps = useMemo(() => coverSteps(), []);
  const tSteps = useMemo(() => tourSteps(), []);
  const total = v === "cover" ? cSteps.length : tSteps.length;
  return (
    <Stepper
      id="HARD-4.1"
      lesson="HARD-4"
      title="Fast answers with a guarantee"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "cover" ? cSteps : tSteps)[Math.min(i, total - 1)].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "cover", label: "Vertex cover" },
            { value: "tour", label: "Tour from a tree" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "cover") return <GraphOnly s={cSteps[Math.min(i, cSteps.length - 1)]} w={COVER_SIZE.w} h={COVER_SIZE.h} label="A graph and the cover being built" />;
        const s = tSteps[Math.min(i, tSteps.length - 1)];
        return (
          <div className="stage-stack">
            <div className="graph-row">
              <Graph w={TOUR_SIZE.w} h={TOUR_SIZE.h} nodes={s.nodes} edges={s.edges} label="Seven cities, a cheapest spanning tree and the trip made from it" />
              <div className="graph-side">
                <Queue items={s.queue ?? []} name="first visits in the walk" end="none" />
              </div>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HARD-5.1 */
export function MrFigure() {
  const [v, setV] = useState<MrVariant>("prime");
  const steps = useMemo(() => mrSteps(v), [v]);
  return (
    <Stepper
      id="HARD-5.1"
      lesson="HARD-5"
      title="The Miller–Rabin test"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="n"
          value={v}
          options={[
            { value: "prime", label: "97" },
            { value: "carmichael", label: "561" },
            { value: "liar", label: "2047" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="powers of a, modulo n">
              <Grid cells={s.cells} colHead={s.colHead} rowHead={s.rowHead} rowHeadWidth={44} label="One row per base a; each column squares the one before" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
