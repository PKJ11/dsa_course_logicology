"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Grid, Named, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  chanceSteps,
  clockSteps,
  euclidSteps,
  invSteps,
  pascalSteps,
  powerSteps,
  sieveSteps,
  type ChanceVariant,
  type ClockVariant,
  type EuclidVariant,
  type InvVariant,
  type PascalVariant,
  type PowerVariant,
  type SieveVariant,
  type TableStep,
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

function Table({ s, label, rh, showIdx = true }: { s: TableStep; label: string; rh?: number; showIdx?: boolean }) {
  return (
    <div className="stage-stack">
      <Grid cells={s.cells} colHead={s.colHead} rowHead={s.rowHead} rowHeadWidth={rh} showIdx={showIdx} label={label} />
      <Readout s={s} />
    </div>
  );
}

/* MATH-1.1 */
export function EuclidFigure() {
  const [v, setV] = useState<EuclidVariant>("gcd");
  const steps = useMemo(() => euclidSteps(v), [v]);
  return (
    <Stepper
      id="MATH-1.1"
      lesson="MATH-1"
      title="Euclid’s algorithm"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "gcd", label: "1071 and 462" },
            { value: "slow", label: "The slowest case" },
            { value: "ext", label: "Extended" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Table s={steps[i]} label={v === "ext" ? "Rows of the extended algorithm: r, q, x and y" : "One row per division: a, b, the quotient q and the remainder r"} />}
    </Stepper>
  );
}

/* MATH-2.1 */
export function ClockFigure() {
  const [v, setV] = useState<ClockVariant>("add");
  const steps = useMemo(() => clockSteps(v), [v]);
  return (
    <Stepper
      id="MATH-2.1"
      lesson="MATH-2"
      title="Remainders go round a clock"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "add", label: "Adding" },
            { value: "neg", label: "Negative numbers" },
            { value: "times", label: "Multiplying" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <ArrayTrack values={s.values} states={s.states} pointers={s.pointers} label="remainders after dividing by 7" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* MATH-3.1 */
export function PowerFigure() {
  const [v, setV] = useState<PowerVariant>("sq");
  const steps = useMemo(() => powerSteps(v), [v]);
  return (
    <Stepper
      id="MATH-3.1"
      lesson="MATH-3"
      title="Powers by squaring"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Power of"
          value={v}
          options={[
            { value: "sq", label: "A number" },
            { value: "mat", label: "A matrix" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <Table
          s={steps[i]}
          rh={v === "sq" ? 48 : 46}
          label={v === "sq" ? "The bits of 13, the powers 3, 3², 3⁴, 3⁸ modulo 100, and the result after each place" : "Powers of the Fibonacci matrix, each shown as F(k+1), F(k), F(k−1), and the result"}
        />
      )}
    </Stepper>
  );
}

/* MATH-4.1 */
export function SieveFigure() {
  const [v, setV] = useState<SieveVariant>("cross");
  const steps = useMemo(() => sieveSteps(v), [v]);
  return (
    <Stepper
      id="MATH-4.1"
      lesson="MATH-4"
      title="The sieve of Eratosthenes"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Keep"
          value={v}
          options={[
            { value: "cross", label: "Primes" },
            { value: "spf", label: "Smallest factors" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Table s={steps[i]} showIdx={false} label="The numbers 1 to 48, eight to a row; crossed-out numbers are hatched" />}
    </Stepper>
  );
}

/* MATH-5.1 */
export function InverseFigure() {
  const [v, setV] = useState<InvVariant>("seven");
  const steps = useMemo(() => invSteps(v), [v]);
  return (
    <Stepper
      id="MATH-5.1"
      lesson="MATH-5"
      title="Which numbers can be undone"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "seven", label: "Modulo 7" },
            { value: "eight", label: "Modulo 8" },
            { value: "clocks", label: "Two clocks" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <Table
          s={steps[i]}
          label={v === "clocks" ? "Each x from 0 to 14 placed by its remainders: row x % 3, column x % 5" : `a times x modulo ${v === "seven" ? 7 : 8}: row a, column x`}
        />
      )}
    </Stepper>
  );
}

/* MATH-6.1 */
export function PascalFigure() {
  const [v, setV] = useState<PascalVariant>("rows");
  const steps = useMemo(() => pascalSteps(v), [v]);
  return (
    <Stepper
      id="MATH-6.1"
      lesson="MATH-6"
      title="Pascal’s triangle"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "rows", label: "Counts" },
            { value: "odd", label: "Odd or even" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <Table s={steps[i]} label="C(n, k): row n, column k" />}
    </Stepper>
  );
}

/* MATH-7.1 */
export function ChanceFigure() {
  const [v, setV] = useState<ChanceVariant>("fy");
  const steps = useMemo(() => chanceSteps(v), [v]);
  return (
    <Stepper
      id="MATH-7.1"
      lesson="MATH-7"
      title="Fair shuffles and samples"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "fy", label: "Fisher–Yates" },
            { value: "count", label: "Count the orders" },
            { value: "res", label: "Reservoir" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        if (v === "count") return <Table s={s} rh={40} label="How many runs of random picks give each order of a, b, c" />;
        return (
          <div className="stage-stack">
            <Named name={v === "fy" ? "the list" : "the stream"}>
              <Grid cells={s.cells} colHead={s.colHead} rowHead={s.rowHead} label={v === "fy" ? "The list being shuffled" : "The items of the stream, in order"} />
            </Named>
            {s.kept && (
              <Named name="kept">
                <Grid cells={s.kept} rowHead={[null]} label="The two kept slots" />
              </Named>
            )}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
