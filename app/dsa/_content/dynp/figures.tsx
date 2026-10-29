"use client";

import { useMemo, useState } from "react";
import { CallStack, Follow, Grid, Named, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  AMOUNT,
  CAP,
  ITEMS,
  backSteps,
  bagSteps,
  coinSteps,
  gridSteps,
  lisSteps,
  memoSteps,
  oneSteps,
  strSteps,
  tabSteps,
  type BackVariant,
  type BagVariant,
  type CoinVariant,
  type GridVariant,
  type LisVariant,
  type OneVariant,
  type StrVariant,
  type TabVariant,
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

const AMOUNTS = Array.from({ length: AMOUNT + 1 }, (_, x) => x);
const KG = Array.from({ length: CAP + 1 }, (_, x) => x);

/* DYNP-1.1 */
export function CoinFigure() {
  const [v, setV] = useState<CoinVariant>("calls");
  const steps = useMemo(() => coinSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-1.1"
      lesson="DYNP-1"
      title="The same questions, asked again and again"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "calls", label: "Plain recursion" },
            { value: "once", label: "Each question once" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            {s.nodes && (
              <Follow>
                <Tree nodes={s.nodes} label="The calls of the fewest-coins recursion" level={56} unit={58} />
              </Follow>
            )}
            <Named name={v === "calls" ? "times each amount was asked" : "fewest coins for each amount"}>
              <Grid cells={s.cells} colHead={AMOUNTS} rowHead={[null]} label={v === "calls" ? "How many times each amount has been asked" : "The fewest coins for each amount from 0 to 5"} />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-2.1 */
export function MemoFigure() {
  const steps = useMemo(() => memoSteps(), []);
  return (
    <Stepper id="DYNP-2.1" lesson="DYNP-2" title="A memo fills in the order calls finish" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <div className="stage-row">
              <Named name="the memo, as a table">
                <Grid cells={s.cells} label="Paths to each cell; the small number is the order the answer was stored" />
              </Named>
              <CallStack frames={s.frames} label="Calls waiting" />
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-3.1 */
export function TabFigure() {
  const [v, setV] = useState<TabVariant>("rows");
  const steps = useMemo(() => tabSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-3.1"
      lesson="DYNP-3"
      title="Filling the table with a loop"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Keep"
          value={v}
          options={[
            { value: "rows", label: "The whole table" },
            { value: "row", label: "One row" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name={v === "rows" ? "paths to each cell" : `one list, now holding row ${s.rowNo}`}>
              <Grid cells={s.cells} rowHead={v === "row" ? [null] : undefined} label={v === "rows" ? "Paths to each cell, filled row by row" : "One list, reused for every row"} />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-4.1 */
export function OneFigure() {
  const [v, setV] = useState<OneVariant>("skip");
  const steps = useMemo(() => oneSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-4.1"
      lesson="DYNP-4"
      title="One answer per position"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Problem"
          value={v}
          options={[
            { value: "skip", label: "No two side by side" },
            { value: "end", label: "Best stretch" },
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
              <Grid
                cells={s.cells}
                rowHead={v === "skip" ? ["a", "best"] : ["a", "end"]}
                rowHeadWidth={40}
                label={v === "skip" ? "The values, and the best total up to each position" : "The values, and the best sum of a stretch ending at each position"}
              />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-5.1 */
export function GridFigure() {
  const [v, setV] = useState<GridVariant>("cheap");
  const steps = useMemo(() => gridSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-5.1"
      lesson="DYNP-5"
      title="A table shaped like the grid"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Problem"
          value={v}
          options={[
            { value: "cheap", label: "Cheapest path" },
            { value: "blocked", label: "Blocked cells" },
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
              <Grid
                cells={s.cells}
                label={v === "cheap" ? "Cheapest total to reach each cell; the small number is the cell's own cost" : "Number of paths to each cell; hatched cells are blocked"}
              />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-6.1 */
export function LisFigure() {
  const [v, setV] = useState<LisVariant>("table");
  const steps = useMemo(() => lisSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-6.1"
      lesson="DYNP-6"
      title="The longest rising subsequence"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "table", label: "O(n²) table" },
            { value: "tails", label: "Tails and binary search" },
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
              <Grid
                cells={s.cells}
                rowHead={v === "table" ? ["a", "len"] : ["a", "tails"]}
                rowHeadWidth={42}
                label={v === "table" ? "The values, and the longest rising subsequence ending at each one" : "The values, and the smallest end of a rising subsequence of each length"}
              />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-7.1 */
export function StrFigure() {
  const [v, setV] = useState<StrVariant>("lcs");
  const steps = useMemo(() => strSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-7.1"
      lesson="DYNP-7"
      title="One table for two strings"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Table"
          value={v}
          options={[
            { value: "lcs", label: "Common subsequence" },
            { value: "edit", label: "Edit distance" },
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
              <Grid
                cells={s.cells}
                colHead={s.colHead}
                rowHead={s.rowHead}
                label={v === "lcs" ? "LCS lengths for every pair of prefixes; arrows show where each value came from" : "Edit distances for every pair of prefixes; arrows show where each value came from"}
              />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DYNP-8.1 */
export function BagFigure() {
  const [v, setV] = useState<BagVariant>("table");
  const steps = useMemo(() => bagSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-8.1"
      lesson="DYNP-8"
      title="The 0/1 knapsack, as a table and as one row"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "table", label: "Table" },
            { value: "rtl", label: "One row, right to left" },
            { value: "ltr", label: "Left to right" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name={v === "table" ? "best value · columns: bag size in kg" : "one list · columns: bag size in kg"}>
              <Follow>
                <Grid cells={s.cells} colHead={KG} rowHead={s.rowHead} label="Best value for each set of items and each bag size" />
              </Follow>
            </Named>
            <ItemList active={s.item} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

function ItemList({ active }: { active?: number }) {
  return (
    <table className="tt vars dynp-items">
      <thead>
        <tr>
          <th>item</th>
          <th>weight</th>
          <th>value</th>
        </tr>
      </thead>
      <tbody>
        {ITEMS.map((it, k) => (
          <tr key={it.name} className={active === k + 1 ? "is-current" : undefined}>
            <td>{it.name}</td>
            <td className="num">{it.w} kg</td>
            <td className="num">₹{it.v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* DYNP-9.1 */
export function BackFigure() {
  const [v, setV] = useState<BackVariant>("lcs");
  const steps = useMemo(() => backSteps(v), [v]);
  return (
    <Stepper
      id="DYNP-9.1"
      lesson="DYNP-9"
      title="Walking back through the table"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Table"
          value={v}
          options={[
            { value: "lcs", label: "Common subsequence" },
            { value: "bag", label: "Knapsack" },
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
              <Grid
                cells={s.cells}
                colHead={s.colHead ?? KG}
                rowHead={s.rowHead}
                label={v === "lcs" ? "The LCS table; pale cells are the path walked back, marked cells give a letter" : "The knapsack table; pale cells are the path walked back, marked cells are items taken"}
              />
            </Follow>
            {v === "bag" && <ItemList />}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
