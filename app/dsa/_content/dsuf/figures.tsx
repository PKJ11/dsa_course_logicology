"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Grid, Named, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import {
  EDGES,
  LOGSTAR,
  MEASURED,
  SIZES,
  cellStates,
  compressSteps,
  edgeSteps,
  forestNodes,
  forestSteps,
  islandSteps,
  labelSteps,
  rankSteps,
  type RankVariant,
  type UfStep,
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

function Forest({ s, label }: { s: UfStep; label: string }) {
  const compact = useCompact();
  // On phones the rank tags beside the roots are left out (the rank list below shows them), so a forest of 8 single nodes fits 358px.
  const tags = compact ? undefined : s.rank;
  const unit = tags ? 50 : compact ? 36 : 44;
  return (
    <>
      <Follow>
        <Tree nodes={forestNodes(s.parent, s.marks, tags)} label={label} slide level={58} unit={unit} forestGap={compact ? 0.06 : 0.4} />
      </Follow>
      <Named name="parent">
        <ArrayTrack values={s.parent} states={cellStates(s.parent.length, s.cells)} pointers={[]} label="the parent list" />
      </Named>
      {s.rank && (
        <Named name="rank">
          <ArrayTrack values={s.rank.map((r, i) => (s.parent[i] === i ? r : ""))} states={[]} pointers={[]} label="the rank of each root" />
        </Named>
      )}
    </>
  );
}

/* DSUF-1.1 */
export function ForestFigure() {
  const [v, setV] = useState<"forest" | "labels">("forest");
  const forest = useMemo(() => forestSteps(), []);
  const labels = useMemo(() => labelSteps(), []);
  const total = v === "forest" ? forest.length : labels.length;
  return (
    <Stepper
      id="DSUF-1.1"
      lesson="DSUF-1"
      title="Disjoint sets as a forest"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "forest" ? forest[i] : labels[i]).caption} />}
      variants={
        <Variants
          label="Store"
          value={v}
          options={[
            { value: "forest", label: "A forest" },
            { value: "labels", label: "A label per element" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "forest") {
          const s = forest[i];
          return (
            <div className="stage-stack">
              <Forest s={s} label="Each set is a tree; every node points to its parent" />
              <Readout s={s} />
            </div>
          );
        }
        const s = labels[i];
        return (
          <div className="stage-stack">
            <Named name="label">
              <ArrayTrack values={s.label} states={cellStates(s.label.length, s.cells)} pointers={[]} label="the label of each element" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DSUF-2.1 */
export function RankFigure() {
  const [v, setV] = useState<RankVariant>("naive");
  const steps = useMemo(() => rankSteps(v), [v]);
  return (
    <Stepper
      id="DSUF-2.1"
      lesson="DSUF-2"
      title="Union by rank keeps the trees short"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Union"
          value={v}
          options={[
            { value: "naive", label: "First under second" },
            { value: "rank", label: "By rank" },
            { value: "pairs", label: "By rank, equal pairs" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Forest s={s} label={s.rank ? "Forest; the tag on each root is its rank" : "Forest"} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DSUF-3.1 */
export function CompressFigure() {
  const [v, setV] = useState<"compress" | "halve">("compress");
  const steps = useMemo(() => compressSteps(v), [v]);
  return (
    <Stepper
      id="DSUF-3.1"
      lesson="DSUF-3"
      title="A find that flattens the path"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "compress", label: "Path compression" },
            { value: "halve", label: "Path halving" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Forest s={s} label="One tree of 8 elements" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DSUF-4.1 */
const COLS = ["neither", "rank", "compression", "both"];
// tighter cells, so all five columns fit a phone
const PAD = { paddingLeft: 6, paddingRight: 6 };

export function CostFigure() {
  const [v, setV] = useState<"chain" | "balanced" | "logstar">("chain");
  const total = v === "logstar" ? LOGSTAR.length : SIZES.length + 1;
  const caption = (i: number) => {
    if (v === "logstar") {
      if (i === 0) return "log₂ n is how many times you can halve n before reaching 1. log* n (say “log star”) counts how many times you must take log₂, again and again, before the number drops to 1. Start with a huge n.";
      if (i === LOGSTAR.length - 1) return `${i} times. So log* n is at most 5 for every n up to 2⁶⁵⁵³⁶, far more than the number of atoms in the universe. The true bound for union-find, α(n), grows even more slowly.`;
      return `log₂ of the previous number is ${LOGSTAR[i].n}: take log ${i} ${i === 1 ? "time" : "times"} so far.`;
    }
    if (i === 0)
      return v === "chain"
        ? "`union(i, i + 1)` for every i, then a find on every element. This is the order that builds one long path when union has no rule. The table shows the average number of parent steps per operation."
        : "Unions of equal-sized trees (pairs, then fours, then eights, …), then a find on random elements. This is the order that makes rank-only trees as tall as they can be: log₂ n.";
    const n = SIZES[i - 1];
    const row = MEASURED[v][i - 1];
    if (v === "chain")
      return i === 1
        ? `n = ${n}. With no rule, the finds walk the long path.`
        : `n = ${n.toLocaleString("en-US")}. With neither method the average is about n / 4 (${row[0].toLocaleString("en-US", { maximumFractionDigits: 1 })}); with any rule it stays about 1.`;
    return i === SIZES.length
      ? `n = ${n.toLocaleString("en-US")}. Rank alone grows slowly, like log₂ n. With compression the average stays below 2: each long find flattens the path for the finds after it.`
      : `n = ${n.toLocaleString("en-US")}. Rank alone: ${row[1].toFixed(1)}. Both: ${row[3].toFixed(1)}.`;
  };
  return (
    <Stepper
      id="DSUF-4.1"
      lesson="DSUF-4"
      title="How much work is a find?"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={caption(i)} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "chain", label: "Chain of unions" },
            { value: "balanced", label: "Equal unions" },
            { value: "logstar", label: "log* n" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "logstar") {
          return (
            <div className="stage-stack">
              <div className="tt-wrap" style={{ margin: 0, width: "min(100%, 420px)" }}>
                <table className="tt">
                  <caption className="visually-hidden">Taking log₂ again and again</caption>
                  <thead>
                    <tr>
                      <th className="r">logs taken</th>
                      <th className="r">number</th>
                      <th>which is</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOGSTAR.map((r, k) => (
                      <tr key={k} className={k === i ? "is-current" : k > i ? "is-future" : ""}>
                        <td className="r num">{k}</td>
                        <td className="r num">{r.n}</td>
                        <td>{r.words}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {i === LOGSTAR.length - 1 && <Readout s={{ readout: "logs taken: 5", verdict: { ok: true, text: "log* n is at most 5" } }} />}
            </div>
          );
        }
        const rows = MEASURED[v];
        return (
          <div className="stage-stack">
            <div className="tt-wrap" style={{ margin: 0, width: "100%" }}>
              <table className="tt">
                <caption className="visually-hidden">Average parent steps per operation</caption>
                <thead>
                  <tr>
                    <th className="r" style={PAD}>n</th>
                    {COLS.map((c) => (
                      <th key={c} className="r" style={PAD}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((n, k) => (
                    <tr key={n} className={k === i - 1 ? "is-current" : k >= i ? "is-future" : ""}>
                      <td className="r num" style={PAD}>{n.toLocaleString("en-US")}</td>
                      {rows[k].map((x, c) => (
                        <td key={c} className="r num" style={PAD}>
                          {x.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="follow__hint">average parent steps per operation</p>
          </div>
        );
      }}
    </Stepper>
  );
}

/* DSUF-5.1 */
export function UsesFigure() {
  const [v, setV] = useState<"edges" | "islands">("edges");
  const edges = useMemo(() => edgeSteps(), []);
  const islands = useMemo(() => islandSteps(), []);
  const total = v === "edges" ? edges.length : islands.length;
  return (
    <Stepper
      id="DSUF-5.1"
      lesson="DSUF-5"
      title="Groups, cycles and islands"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "edges" ? edges[i] : islands[i]).caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "edges", label: "Roads one by one" },
            { value: "islands", label: "Islands" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "edges") {
          const s = edges[i];
          return (
            <div className="stage-stack">
              <Named name="roads">
                <ArrayTrack
                  values={EDGES.map(([a, b]) => `${a}–${b}`)}
                  states={s.edgeCells}
                  pointers={s.at === null ? [] : [{ name: "k", at: s.at, kind: "mid" }]}
                  label="the roads, in the order they arrive"
                />
              </Named>
              <Forest s={s} label="Union-find forest of the six places" />
              <Readout s={s} />
            </div>
          );
        }
        const s = islands[i];
        return (
          <div className="stage-stack">
            <Grid cells={s.cells} label="The map; each land cell shows the root of its set" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
