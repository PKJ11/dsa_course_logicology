"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CallStack, Graph, Grid, Named, Queue, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  CYCLE_GRAPHS,
  LINE_SIZE,
  TOPO_SIZE,
  bfsSteps,
  cycleSteps,
  dfsSteps,
  gridSteps,
  repSteps,
  teamsSteps,
  topoSteps,
  type BfsVariant,
  type CycleVariant,
  type DfsVariant,
  type GraphStep,
  type GridStep,
  type GridVariant,
  type RepVariant,
  type TeamsVariant,
  type TopoVariant,
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

/** A graph with its side panel (queue, stack, table) to the right on wide screens and below it on phones. */
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

/* GRPH-1.1 */
export function RepFigure() {
  const [v, setV] = useState<RepVariant>("lists");
  const steps = useMemo(() => repSteps(v), [v]);
  const names = ["A", "B", "C", "D", "E", "F", "G"];
  return (
    <Stepper
      id="GRPH-1.1"
      lesson="GRPH-1"
      title="One graph, stored three ways"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Store"
          value={v}
          options={[
            { value: "lists", label: "Adjacency lists" },
            { value: "matrix", label: "Matrix" },
            { value: "edges", label: "Edge list" },
            { value: "directed", label: "One-way edges" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        if (v === "matrix")
          return (
            <div className="stage-stack">
              <Graph w={LINE_SIZE.w} h={LINE_SIZE.h} nodes={s.nodes} edges={s.edges} label="A graph of 7 vertices" />
              <Named name="adjacency matrix">
                <Grid cells={s.matrix!} colHead={names} rowHead={names} label="Adjacency matrix: 1 where the row's vertex and the column's vertex are joined" />
              </Named>
              <Readout s={s} />
            </div>
          );
        const head = v === "edges" ? ["Row", "Edge"] : ["Vertex", v === "directed" ? "Edges out to" : "Neighbours"];
        return (
          <GraphStage
            s={s}
            {...LINE_SIZE}
            directed={v === "directed"}
            label="A graph of 7 vertices"
            side={
              <table className="tt vars">
                <caption className="visually-hidden">{v === "edges" ? "Edge list" : "Adjacency lists"}</caption>
                <thead>
                  <tr>
                    <th>{head[0]}</th>
                    <th>{head[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows!.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ color: "var(--ink-3)" }}>
                        none yet
                      </td>
                    </tr>
                  )}
                  {s.rows!.map((r) => (
                    <tr key={r.k} className={r.cur ? "is-current" : undefined}>
                      <td>
                        <code>{r.k}</code>
                      </td>
                      <td>
                        <code>{r.v}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* GRPH-2.1 */
export function BfsFigure() {
  const [v, setV] = useState<BfsVariant>("one");
  const steps = useMemo(() => bfsSteps(v), [v]);
  return (
    <Stepper
      id="GRPH-2.1"
      lesson="GRPH-2"
      title="Breadth-first search"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Start"
          value={v}
          options={[
            { value: "one", label: "From A" },
            { value: "many", label: "From A and G" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          {...LINE_SIZE}
          directed={false}
          label="Breadth-first search; tags are distances in edges"
          side={<Queue items={steps[i].queue ?? []} name="queue" />}
        />
      )}
    </Stepper>
  );
}

/* GRPH-3.1 */
export function DfsFigure() {
  const [v, setV] = useState<DfsVariant>("rec");
  const steps = useMemo(() => dfsSteps(v), [v]);
  return (
    <Stepper
      id="GRPH-3.1"
      lesson="GRPH-3"
      title="Depth-first search and its times"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Keep the path in"
          value={v}
          options={[
            { value: "rec", label: "Recursive calls" },
            { value: "stack", label: "Your own stack" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          w={6}
          h={2.7}
          directed
          label="Depth-first search on a directed graph; tags are discovery and finish times"
          side={v === "rec" ? <CallStack frames={steps[i].frames ?? []} /> : <CallStack frames={steps[i].frames ?? []} label="stack" plain />}
        />
      )}
    </Stepper>
  );
}

/* GRPH-4.1 */
export function CycleFigure() {
  const [v, setV] = useState<CycleVariant>("directed");
  const steps = useMemo(() => cycleSteps(v), [v]);
  const { g, w, h } = CYCLE_GRAPHS[v];
  return (
    <Stepper
      id="GRPH-4.1"
      lesson="GRPH-4"
      title="Looking for a cycle"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Graph"
          value={v}
          options={[
            { value: "directed", label: "One-way, with a cycle" },
            { value: "diamond", label: "Two ways in" },
            { value: "undirected", label: "Two-way edges" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          w={w}
          h={h}
          directed={g.directed}
          label="Depth-first search with three states: not reached, on the path, finished"
          side={<CallStack frames={steps[i].frames ?? []} label="path (stack)" plain />}
        />
      )}
    </Stepper>
  );
}

/* GRPH-5.1 */
export function TopoFigure() {
  const [v, setV] = useState<TopoVariant>("kahn");
  const steps = useMemo(() => topoSteps(v), [v]);
  return (
    <Stepper
      id="GRPH-5.1"
      lesson="GRPH-5"
      title="Putting tasks in order"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "kahn", label: "Kahn’s method" },
            { value: "dfs", label: "Finish order" },
            { value: "cycle", label: "With a cycle" },
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
            {...TOPO_SIZE}
            directed
            label={v === "dfs" ? "Depth-first search; finished vertices go to the front of the order" : "Kahn's method; tags are in-degrees"}
            side={
              <>
                {v === "dfs" ? <CallStack frames={s.frames ?? []} label="path (stack)" plain /> : <Queue items={s.queue ?? []} name="ready, smallest first" />}
                <Queue items={s.order ?? []} name="order" end="none" />
              </>
            }
          />
        );
      }}
    </Stepper>
  );
}

/* GRPH-6.1 */
export function TeamsFigure() {
  const [v, setV] = useState<TeamsVariant>("even");
  const steps = useMemo(() => teamsSteps(v), [v]);
  return (
    <Stepper
      id="GRPH-6.1"
      lesson="GRPH-6"
      title="Two teams by breadth-first search"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Graph"
          value={v}
          options={[
            { value: "even", label: "Two teams" },
            { value: "odd", label: "An odd cycle" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <GraphStage
          s={steps[i]}
          w={6}
          h={2}
          directed={false}
          label="Each tag is a team, 0 or 1"
          side={<Queue items={steps[i].queue ?? []} name="queue" />}
        />
      )}
    </Stepper>
  );
}

/* GRPH-7.1 */
export function GridFigure() {
  const [v, setV] = useState<GridVariant>("route");
  const steps = useMemo(() => gridSteps(v), [v]);
  return (
    <Stepper
      id="GRPH-7.1"
      lesson="GRPH-7"
      title="A grid is a graph"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Search"
          value={v}
          options={[
            { value: "route", label: "Fewest moves" },
            { value: "many", label: "Two starts" },
            { value: "islands", label: "Islands" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s: GridStep = steps[i];
        return (
          <div className="stage-stack">
            <Grid
              cells={s.cells}
              label={v === "islands" ? "Land and water; each land square is labelled with its island" : "A maze; each number is a distance in moves"}
            />
            {v !== "islands" && <Queue items={s.queue} name="queue (row, column)" />}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
