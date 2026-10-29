"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Graph, Queue, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import { NET_SIZE, cutSteps, kruskalSteps, primSteps, treeSteps, type CutVariant, type GraphStep, type Row, type TreeVariant } from "./algos";

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

/** The network with its side panel (heap or sorted edge list) to the right on wide screens and below it on phones. */
function GraphStage({ s, label, side }: { s: GraphStep; label: string; side?: ReactNode }) {
  return (
    <div className="stage-stack">
      <div className={side ? "graph-row" : undefined} style={side ? undefined : { width: "100%" }}>
        <Graph {...NET_SIZE} nodes={s.nodes} edges={s.edges} label={label} />
        {side && <div className="graph-side">{side}</div>}
      </div>
      <Readout s={s} />
    </div>
  );
}

function EdgeTable({ rows }: { rows: Row[] }) {
  return (
    <table className="tt vars">
      <caption className="visually-hidden">The edges sorted by cost, and what Kruskal’s method did with each</caption>
      <thead>
        <tr>
          <th>Edge</th>
          <th>Cost</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.k} className={r.cur ? "is-current" : undefined}>
            <td>
              <code>{r.k}</code>
            </td>
            <td className="num">{r.v}</td>
            <td>{r.p === "skip" ? <span className="tt-skip">skip</span> : r.p}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* SPAN-1.1 */
export function TreeFigure() {
  const [v, setV] = useState<TreeVariant>("count");
  const steps = useMemo(() => treeSteps(v), [v]);
  return (
    <Stepper
      id="SPAN-1.1"
      lesson="SPAN-1"
      title="Spanning trees"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "count", label: "What counts as a tree" },
            { value: "swap", label: "Swapping one edge" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} label="Seven vertices; each edge shows its cost; shaded edges are in the tree" />}
    </Stepper>
  );
}

/* SPAN-2.1 */
export function KruskalFigure() {
  const steps = useMemo(() => kruskalSteps(), []);
  return (
    <Stepper id="SPAN-2.1" lesson="SPAN-2" title="Kruskal’s method" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => (
        <GraphStage s={steps[i]} label="Kruskal's method; each tag names the vertex's group" side={<EdgeTable rows={steps[i].rows ?? []} />} />
      )}
    </Stepper>
  );
}

/* SPAN-3.1 */
export function PrimFigure() {
  const steps = useMemo(() => primSteps(), []);
  return (
    <Stepper id="SPAN-3.1" lesson="SPAN-3" title="Prim’s method" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => (
        <GraphStage s={steps[i]} label="Prim's method; ink vertices are in the tree" side={<Queue items={steps[i].queue ?? []} name="heap (cost, vertex)" />} />
      )}
    </Stepper>
  );
}

/* SPAN-4.1 */
export function CutFigure() {
  const [v, setV] = useState<CutVariant>("cuts");
  const steps = useMemo(() => cutSteps(v), [v]);
  return (
    <Stepper
      id="SPAN-4.1"
      lesson="SPAN-4"
      title="The cut property"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "cuts", label: "Cheapest across a cut" },
            { value: "exchange", label: "The exchange proof" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <GraphStage s={steps[i]} label="Shaded vertices are one side of the cut; marked edges cross it" />}
    </Stepper>
  );
}
