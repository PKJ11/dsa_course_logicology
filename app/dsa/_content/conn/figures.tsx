"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Graph, Queue, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  LIT_SIZE,
  NET_SIZE,
  TOWN_SIZE,
  findSteps,
  groupSteps,
  satSteps,
  weakSteps,
  type FindVariant,
  type GraphStep,
  type GroupVariant,
  type SatVariant,
  type WeakVariant,
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

/** A graph with its side panel (a stack or an order) to the right on wide screens and below it on phones. */
function GraphStage({ s, w, h, directed, label, side }: { s: GraphStep; w: number; h: number; directed: boolean; label: string; side?: ReactNode }) {
  return (
    <div className="stage-stack">
      <div className={side ? "graph-row" : undefined} style={side ? undefined : { width: "100%" }}>
        <Graph w={w} h={h} nodes={s.nodes} edges={s.edges} directed={directed} label={label} />
        {side && <div className="graph-side">{side}</div>}
      </div>
      <Readout s={s} />
    </div>
  );
}

/* CONN-1.1 */
export function GroupFigure() {
  const [v, setV] = useState<GroupVariant>("one");
  const steps = useMemo(() => groupSteps(v), [v]);
  return (
    <Stepper
      id="CONN-1.1"
      lesson="CONN-1"
      title="Strongly connected groups"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "one", label: "The group of A" },
            { value: "all", label: "Every group" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...TOWN_SIZE}
          directed
          label={v === "one" ? "One-way streets; shaded junctions are reached by the search" : "One-way streets; tags give each junction's group number"}
        />
      )}
    </Stepper>
  );
}

/* CONN-2.1 */
export function FindFigure() {
  const [v, setV] = useState<FindVariant>("kosaraju");
  const steps = useMemo(() => findSteps(v), [v]);
  return (
    <Stepper
      id="CONN-2.1"
      lesson="CONN-2"
      title="Finding every group"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "kosaraju", label: "Kosaraju" },
            { value: "tarjan", label: "Tarjan" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...TOWN_SIZE}
          directed
          label={v === "kosaraju" ? "Kosaraju's method; tags give the finish order, then the group" : "Tarjan's method; tags read number/low"}
          side={v === "tarjan" ? <Queue items={steps[i].queue ?? []} name="stack" end="top" /> : undefined}
        />
      )}
    </Stepper>
  );
}

/* CONN-3.1 */
export function WeakFigure() {
  const [v, setV] = useState<WeakVariant>("one");
  const steps = useMemo(() => weakSteps(v), [v]);
  return (
    <Stepper
      id="CONN-3.1"
      lesson="CONN-3"
      title="Bridges and cut vertices"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Network"
          value={v}
          options={[
            { value: "one", label: "One line between C and D" },
            { value: "double", label: "Two lines" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...NET_SIZE} directed={false} label="A two-way network; tags read disc/low; bridges get the yellow band and cut vertices the double rule" />}
    </Stepper>
  );
}

/* CONN-4.1 */
export function SatFigure() {
  const [v, setV] = useState<SatVariant>("yes");
  const steps = useMemo(() => satSteps(v), [v]);
  return (
    <Stepper
      id="CONN-4.1"
      lesson="CONN-4"
      title="The implication graph"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Rules"
          value={v}
          options={[
            { value: "yes", label: "Four rules" },
            { value: "no", label: "Five rules" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...LIT_SIZE} directed label="The implication graph; an edge x to y means: if x holds, y must hold" />}
    </Stepper>
  );
}
