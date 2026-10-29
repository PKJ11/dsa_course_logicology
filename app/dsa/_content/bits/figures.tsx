"use client";

import { useMemo, useState } from "react";
import { Grid, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  PLACES8,
  binSteps,
  countSteps,
  maskSteps,
  opSteps,
  subSteps,
  type BinVariant,
  type BitStep,
  type CountVariant,
  type MaskVariant,
  type OpVariant,
  type SubVariant,
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

function Bits({ s, label, rh }: { s: BitStep; label: string; rh: number }) {
  return (
    <div className="stage-stack">
      <Grid cells={s.cells} colHead={s.colHead ?? PLACES8} rowHead={s.rowHead} rowHeadWidth={rh} label={label} />
      <Readout s={s} />
    </div>
  );
}

/* BITS-1.1 */
export function BinFigure() {
  const [v, setV] = useState<BinVariant>("halve");
  const steps = useMemo(() => binSteps(v), [v]);
  return (
    <Stepper
      id="BITS-1.1"
      lesson="BITS-1"
      title="Whole numbers as rows of bits"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "halve", label: "To binary" },
            { value: "neg", label: "A negative number" },
            { value: "over", label: "Overflow" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Bits s={steps[i]} rh={44} label="Places 7 to 0, with the worth of each place and the bits of the numbers" />}
    </Stepper>
  );
}

/* BITS-2.1 */
export function OpFigure() {
  const [v, setV] = useState<OpVariant>("and");
  const steps = useMemo(() => opSteps(v), [v]);
  return (
    <Stepper
      id="BITS-2.1"
      lesson="BITS-2"
      title="Operators that work place by place"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Operator"
          value={v}
          options={[
            { value: "and", label: "& and" },
            { value: "or", label: "| or" },
            { value: "xor", label: "^ xor" },
            { value: "shift", label: "<< >> shifts" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Bits s={steps[i]} rh={44} label="The bits of x, y and the result, places 7 to 0" />}
    </Stepper>
  );
}

/* BITS-3.1 */
export function MaskFigure() {
  const [v, setV] = useState<MaskVariant>("one");
  const steps = useMemo(() => maskSteps(v), [v]);
  return (
    <Stepper
      id="BITS-3.1"
      lesson="BITS-3"
      title="Masks pick the places to change"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Mask"
          value={v}
          options={[
            { value: "one", label: "One bit" },
            { value: "drop", label: "Drop the lowest 1" },
            { value: "keep", label: "Keep the lowest 1" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Bits s={steps[i]} rh={44} label="The bits of x, the mask and the result, places 7 to 0" />}
    </Stepper>
  );
}

/* BITS-4.1 */
export function CountFigure() {
  const [v, setV] = useState<CountVariant>("drop");
  const steps = useMemo(() => countSteps(v), [v]);
  return (
    <Stepper
      id="BITS-4.1"
      lesson="BITS-4"
      title="Counting the 1 bits"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "drop", label: "Drop the lowest 1" },
            { value: "table", label: "A table for 0 to 15" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) =>
        v === "drop" ? (
          <Bits s={steps[i]} rh={44} label="x, x − 1 and the next x, places 7 to 0" />
        ) : (
          <div className="stage-stack">
            <Grid
              cells={steps[i].cells}
              rowHead={steps[i].rowHead}
              rowHeadWidth={30}
              label="The number of 1 bits of each number from 0 to 15; the second row is 8 to 15"
            />
            <Readout s={steps[i]} />
          </div>
        )
      }
    </Stepper>
  );
}

/* BITS-5.1 */
export function SubsetFigure() {
  const [v, setV] = useState<SubVariant>("all");
  const steps = useMemo(() => subSteps(v), [v]);
  return (
    <Stepper
      id="BITS-5.1"
      lesson="BITS-5"
      title="Subsets as numbers"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="List"
          value={v}
          options={[
            { value: "all", label: "Every subset" },
            { value: "sub", label: "Submasks of a mask" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <Bits
          s={steps[i]}
          rh={v === "all" ? 30 : 44}
          label={v === "all" ? "The subsets of three items, one row per number from 0 to 7, with the weight of each subset" : "The submasks of 1101, one row each"}
        />
      )}
    </Stepper>
  );
}
