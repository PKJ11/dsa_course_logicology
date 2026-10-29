"use client";

import { useMemo, useState } from "react";
import { Graph, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  BIP_SIZE,
  DIA_SIZE,
  NET_SIZE,
  cutSteps,
  fastSteps,
  fordSteps,
  matchSteps,
  rulesSteps,
  type CutVariant,
  type FastVariant,
  type FordVariant,
  type GraphStep,
  type MatchVariant,
  type RulesVariant,
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

function GraphStage({ s, w, h, directed = true, label, unit }: { s: GraphStep; w: number; h: number; directed?: boolean; label: string; unit?: number }) {
  return (
    <div className="stage-stack">
      <div style={{ width: "100%" }}>
        <Graph w={w} h={h} nodes={s.nodes} edges={s.edges} directed={directed} label={label} unit={unit} />
      </div>
      <Readout s={s} />
    </div>
  );
}

/* FLOW-1.1 */
export function RulesFigure() {
  const [v, setV] = useState<RulesVariant>("check");
  const steps = useMemo(() => rulesSteps(v), [v]);
  return (
    <Stepper
      id="FLOW-1.1"
      lesson="FLOW-1"
      title="The two rules of a flow"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Plan"
          value={v}
          options={[
            { value: "check", label: "A flow" },
            { value: "broken", label: "Broken rules" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...NET_SIZE} label="A network from s to t; each plate reads flow/capacity" />}
    </Stepper>
  );
}

/* FLOW-2.1 */
export function FordFigure() {
  const [v, setV] = useState<FordVariant>("stuck");
  const steps = useMemo(() => fordSteps(v), [v]);
  return (
    <Stepper
      id="FLOW-2.1"
      lesson="FLOW-2"
      title="Paths, and paths that undo"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "stuck", label: "Stuck" },
            { value: "residual", label: "Residual graph" },
            { value: "slow", label: "Bad choices" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...DIA_SIZE}
          unit={96}
          label={v === "residual" ? "The residual graph; plates give how much more each arc can carry" : "A network from s to t; each plate reads flow/capacity"}
        />
      )}
    </Stepper>
  );
}

/* FLOW-3.1 */
export function FastFigure() {
  const [v, setV] = useState<FastVariant>("ek");
  const steps = useMemo(() => fastSteps(v), [v]);
  return (
    <Stepper
      id="FLOW-3.1"
      lesson="FLOW-3"
      title="Shortest paths first"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "ek", label: "Edmonds-Karp" },
            { value: "dinic", label: "Dinic" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...NET_SIZE} label="A network; plates read flow/capacity; tags give the distance from s in the residual graph" />}
    </Stepper>
  );
}

/* FLOW-4.1 */
export function CutFigure() {
  const [v, setV] = useState<CutVariant>("every");
  const steps = useMemo(() => cutSteps(v), [v]);
  return (
    <Stepper
      id="FLOW-4.1"
      lesson="FLOW-4"
      title="Flows and cuts"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "every", label: "Every cut" },
            { value: "find", label: "The smallest cut" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...NET_SIZE} label="A maximum flow; shaded stations are the side S; marked lines cross the cut" />}
    </Stepper>
  );
}

/* FLOW-5.1 */
export function MatchFigure() {
  const [v, setV] = useState<MatchVariant>("augment");
  const steps = useMemo(() => matchSteps(v), [v]);
  return (
    <Stepper
      id="FLOW-5.1"
      lesson="FLOW-5"
      title="Matching drivers to routes"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "augment", label: "Augmenting paths" },
            { value: "konig", label: "König’s cover" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} {...BIP_SIZE} directed={false} unit={110} label="Drivers on the left, routes on the right; matched pairs have the yellow band" />}
    </Stepper>
  );
}
