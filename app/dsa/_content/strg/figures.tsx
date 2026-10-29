"use client";

import { useMemo, useState } from "react";
import { Grid, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  kmpSteps,
  manSteps,
  naiveSteps,
  rkSteps,
  saSteps,
  zSteps,
  type KmpVariant,
  type ManVariant,
  type NaiveVariant,
  type SaVariant,
  type StrStep,
} from "./algos";

function StrStage({ s, label, rh }: { s: StrStep; label: string; rh?: number }) {
  return (
    <div className="stage-stack">
      <Grid cells={s.cells} colHead={s.cols} rowHead={s.rows} rowHeadWidth={rh} label={label} />
      {(s.readout || s.verdict) && (
        <div className="readout">
          {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
          {s.verdict && <Verdict v={s.verdict} />}
        </div>
      )}
    </div>
  );
}

/* STRG-1.1 */
export function NaiveFigure() {
  const [v, setV] = useState<NaiveVariant>("few");
  const steps = useMemo(() => naiveSteps(v), [v]);
  return (
    <Stepper
      id="STRG-1.1"
      lesson="STRG-1"
      title="Trying every place"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "few", label: "A short search" },
            { value: "worst", label: "The worst case" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <StrStage s={steps[i]} label="The text T, with the pattern P under it at the place being tried" />}
    </Stepper>
  );
}

/* STRG-2.1 */
export function KmpFigure() {
  const [v, setV] = useState<KmpVariant>("table");
  const steps = useMemo(() => kmpSteps(v), [v]);
  return (
    <Stepper
      id="STRG-2.1"
      lesson="STRG-2"
      title="The border table, and a search that never steps back"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "table", label: "Build π" },
            { value: "search", label: "Search with π" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => (
        <StrStage
          s={steps[i]}
          label={v === "table" ? "The pattern, a copy of it slid along under it, and the border table π" : "The text, the pattern under it, and the pattern's border table"}
        />
      )}
    </Stepper>
  );
}

/* STRG-3.1 */
export function ZFigure() {
  const steps = useMemo(() => zSteps(), []);
  return (
    <Stepper id="STRG-3.1" lesson="STRG-3" title="The Z-array and its box" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => <StrStage s={steps[i]} label="The string s, a copy of s starting under place i, and the Z-array" />}
    </Stepper>
  );
}

/* STRG-4.1 */
export function RollFigure() {
  const steps = useMemo(() => rkSteps(), []);
  return (
    <Stepper id="STRG-4.1" lesson="STRG-4" title="Rabin–Karp with a rolling hash" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => <StrStage s={steps[i]} label="The text of digits, the pattern under the piece being hashed, and the hash of each piece" />}
    </Stepper>
  );
}

/* STRG-5.1 */
export function SuffixFigure() {
  const [v, setV] = useState<SaVariant>("double");
  const steps = useMemo(() => saSteps(v), [v]);
  return (
    <Stepper
      id="STRG-5.1"
      lesson="STRG-5"
      title="Sorting the suffixes of banana"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "double", label: "Sort by doubling" },
            { value: "lcp", label: "The lcp column" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <StrStage s={steps[i]} label="One suffix per row, its letters in columns, named by its start" />}
    </Stepper>
  );
}

/* STRG-6.1 */
export function ManacherFigure() {
  const [v, setV] = useState<ManVariant>("odd");
  const steps = useMemo(() => manSteps(v), [v]);
  return (
    <Stepper
      id="STRG-6.1"
      lesson="STRG-6"
      title="Palindromes from the mirror image"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Lengths"
          value={v}
          options={[
            { value: "odd", label: "Odd" },
            { value: "even", label: "Even" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <StrStage s={steps[i]} label="The string and the count of palindromes at each centre" />}
    </Stepper>
  );
}
