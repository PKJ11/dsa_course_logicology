"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Graph, Grid, Named, Queue, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  BF_SIZE,
  DAG_SIZE,
  FW_SIZE,
  NET_SIZE,
  ZO_SIZE,
  bellmanSteps,
  dagSteps,
  dijkstraSteps,
  floydSteps,
  problemSteps,
  starSteps,
  zeroOneSteps,
  type BellmanVariant,
  type DagVariant,
  type DijkstraVariant,
  type FloydVariant,
  type GraphStep,
  type ProblemVariant,
  type Row,
  type StarVariant,
  type ZeroOneVariant,
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

/** A graph with its side panel (heap, deque, table) to the right on wide screens and below it on phones. */
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

/** A small table beside a graph: station, time and parent, or an edge list with weights. */
function SideTable({ rows, head, caption }: { rows: Row[]; head: string[]; caption: string }) {
  return (
    <table className="tt vars">
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {head.map((x) => (
            <th key={x}>{x}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.k} className={r.cur ? "is-current" : r.path ? "is-path" : undefined}>
            <td>
              <code>{r.k}</code>
            </td>
            <td className="num">{r.v}</td>
            {head.length > 2 && (
              <td>
                <code>{r.p}</code>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* PATH-1.1 */
export function ProblemFigure() {
  const [v, setV] = useState<ProblemVariant>("fewest");
  const steps = useMemo(() => problemSteps(v), [v]);
  return (
    <Stepper
      id="PATH-1.1"
      lesson="PATH-1"
      title="Fewest edges or least time"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "fewest", label: "Two routes" },
            { value: "relax", label: "Relaxing edges" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <GraphStage
            s={s}
            {...NET_SIZE}
            directed={false}
            label="Seven stations; each edge shows its travel time in minutes"
            side={v === "relax" ? <SideTable rows={s.rows ?? []} head={["Station", "Time", "Parent"]} caption="Best time so far and parent of each station" /> : undefined}
          />
        );
      }}
    </Stepper>
  );
}

/* PATH-2.1 */
export function ZeroOneFigure() {
  const [v, setV] = useState<ZeroOneVariant>("deque");
  const steps = useMemo(() => zeroOneSteps(v), [v]);
  return (
    <Stepper
      id="PATH-2.1"
      lesson="PATH-2"
      title="Costs of 0 and 1 with a deque"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Queue"
          value={v}
          options={[
            { value: "deque", label: "0-1 BFS" },
            { value: "plain", label: "Plain BFS" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...ZO_SIZE}
          directed={false}
          label="Each edge costs 0 or 1; tags are the cheapest costs found so far"
          side={<Queue items={steps[i].queue ?? []} name={v === "deque" ? "deque (station, time)" : "queue (station, time)"} />}
        />
      )}
    </Stepper>
  );
}

/* PATH-3.1 */
export function DijkstraFigure() {
  const [v, setV] = useState<DijkstraVariant>("heap");
  const steps = useMemo(() => dijkstraSteps(v), [v]);
  return (
    <Stepper
      id="PATH-3.1"
      lesson="PATH-3"
      title="Dijkstra’s method"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Graph"
          value={v}
          options={[
            { value: "heap", label: "Times on the line" },
            { value: "negative", label: "A negative edge" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          w={v === "heap" ? NET_SIZE.w : 4}
          h={v === "heap" ? NET_SIZE.h : 2}
          directed={v === "negative"}
          label="Dijkstra's method; tags are the best times so far, finished stations are settled"
          side={<Queue items={steps[i].queue ?? []} name="heap (time, station)" />}
        />
      )}
    </Stepper>
  );
}

/* PATH-4.1 */
export function BellmanFigure() {
  const [v, setV] = useState<BellmanVariant>("plain");
  const steps = useMemo(() => bellmanSteps(v), [v]);
  return (
    <Stepper
      id="PATH-4.1"
      lesson="PATH-4"
      title="Bellman–Ford, one round at a time"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Graph"
          value={v}
          options={[
            { value: "plain", label: "A negative edge" },
            { value: "cycle", label: "A negative cycle" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...BF_SIZE}
          directed
          label="Bellman-Ford; tags are the best times so far"
          side={<SideTable rows={steps[i].rows ?? []} head={["Edge", "Time"]} caption="The edge list, in the order each round relaxes it" />}
        />
      )}
    </Stepper>
  );
}

/* PATH-5.1 */
export function FloydFigure() {
  const [v, setV] = useState<FloydVariant>("right");
  const steps = useMemo(() => floydSteps(v), [v]);
  const names = ["A", "B", "C", "D"];
  return (
    <Stepper
      id="PATH-5.1"
      lesson="PATH-5"
      title="Floyd–Warshall on a table"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Loops"
          value={v}
          options={[
            { value: "right", label: "k outside" },
            { value: "wrong", label: "k inside" },
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
              <Graph {...FW_SIZE} nodes={s.nodes} edges={s.edges} directed label="Four stations with one-way lines" />
              <div className="graph-side">
                <Named name="cost from row to column">
                  <Grid cells={s.matrix!} colHead={names} rowHead={names} label="Cheapest known cost from each row's station to each column's station" />
                </Named>
              </div>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* PATH-6.1 */
export function DagFigure() {
  const [v, setV] = useState<DagVariant>("short");
  const steps = useMemo(() => dagSteps(v), [v]);
  return (
    <Stepper
      id="PATH-6.1"
      lesson="PATH-6"
      title="One pass in topological order"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Route"
          value={v}
          options={[
            { value: "short", label: "Cheapest" },
            { value: "long", label: "Longest" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...DAG_SIZE}
          directed
          label={v === "short" ? "A DAG; tags are the cheapest times so far" : "A DAG; tags are the longest totals so far"}
          side={<Queue items={steps[i].order ?? []} name="topological order" end="none" />}
        />
      )}
    </Stepper>
  );
}

/* PATH-7.1 */
export function StarFigure() {
  const [v, setV] = useState<StarVariant>("dijkstra");
  const steps = useMemo(() => starSteps(v), [v]);
  return (
    <Stepper
      id="PATH-7.1"
      lesson="PATH-7"
      title="Searching towards a goal"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "dijkstra", label: "Dijkstra" },
            { value: "astar", label: "A*" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <div className="stage-stack">
          <Grid cells={steps[i].cells} label="A grid with walls; numbers are moves from the start, ink squares have been taken" />
          <Readout s={steps[i]} />
        </div>
      )}
    </Stepper>
  );
}
