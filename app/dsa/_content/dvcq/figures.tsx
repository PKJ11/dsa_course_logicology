"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Grid, Named, Plane, Timeline, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  invTreeSteps,
  karaSteps,
  levelSteps,
  levelTo,
  mergeSteps,
  momSteps,
  pairSteps,
  subSteps,
  SUB,
  INV_LEFT,
  INV_RIGHT,
  type InvVariant,
  type KaraVariant,
  type LevelVariant,
  type MomVariant,
  type PairVariant,
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

/* DVCQ-1.1 */
export function SubFigure() {
  const [v, setV] = useState<SubVariant>("whole");
  const steps = useMemo(() => subSteps(v), [v]);
  return (
    <Stepper
      id="DVCQ-1.1"
      lesson="DVCQ-1"
      title="The largest sum of a stretch, by divide and conquer"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "whole", label: "Whole method" },
            { value: "cross", label: "Crossing the middle" },
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
              <Tree nodes={s.nodes} label="The parts of the list; each solved part shows its best sum after the colon" level={56} unit={58} />
            </Follow>
            <Named name="values">
              <ArrayTrack values={SUB} states={s.states} window={s.window} pointers={s.pointers} label="the values" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DVCQ-2.1 */
export function LevelFigure() {
  const [v, setV] = useState<LevelVariant>("mom");
  const steps = useMemo(() => levelSteps(v), [v]);
  return (
    <Stepper
      id="DVCQ-2.1"
      lesson="DVCQ-2"
      title="Adding up the levels when the theorem does not fit"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Case"
          value={v}
          options={[
            { value: "mom", label: "n/5 + 7n/10" },
            { value: "third", label: "n/3 + 2n/3" },
            { value: "log", label: "n log n work" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Timeline from={0} to={levelTo(v)} rows={s.rows} marks={s.marks} label="One row per level of the recursion; each bar is the work on one piece" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DVCQ-3.1 */
export function InvFigure() {
  const [v, setV] = useState<InvVariant>("merge");
  const merge = useMemo(() => mergeSteps(), []);
  const tree = useMemo(() => invTreeSteps(), []);
  const total = v === "merge" ? merge.length : tree.length;
  return (
    <Stepper
      id="DVCQ-3.1"
      lesson="DVCQ-3"
      title="Counting inversions while merging"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "merge" ? merge[i] : tree[i]).caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "merge", label: "One merge" },
            { value: "tree", label: "Whole sort" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "tree") {
          const s = tree[i];
          return (
            <div className="stage-stack">
              <Follow>
                <Tree nodes={s.nodes} label="Merge sort's parts; the tag on a merged part is the number of inversions that merge found" level={58} unit={46} />
              </Follow>
              <Readout s={s} />
            </div>
          );
        }
        const s = merge[i];
        return (
          <div className="stage-stack">
            <div className="stage-row">
              <div className="stage-stack">
                <Named name="left half">
                  <ArrayTrack values={INV_LEFT} states={s.leftStates} pointers={[{ name: "i", at: s.i, kind: "mid" }]} label="the left half, sorted" />
                </Named>
                <Named name="smaller after">
                  <ArrayTrack values={s.counts} states={s.countStates} pointers={[]} showIdx={false} label="for each left value, how many smaller values come after it" />
                </Named>
              </div>
              <Named name="right half">
                <ArrayTrack values={INV_RIGHT} states={s.rightStates} window={s.rightWin} pointers={[{ name: "j", at: s.j, kind: "mid" }]} label="the right half, sorted" />
              </Named>
            </div>
            <Named name="merged">
              <ArrayTrack values={s.out} states={s.outStates} pointers={[]} label="the merged list" />
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DVCQ-4.1 */
export function PairFigure() {
  const [v, setV] = useState<PairVariant>("dc");
  const steps = useMemo(() => pairSteps(v), [v]);
  return (
    <Stepper
      id="DVCQ-4.1"
      lesson="DVCQ-4"
      title="The closest pair of points"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "dc", label: "Divide and conquer" },
            { value: "box", label: "Why few checks" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Plane w={16} h={10} points={s.points} segs={s.segs} lines={s.lines} boxes={s.boxes} label="Points on a grid; x goes right and y goes up" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DVCQ-5.1 */
export function KaraFigure() {
  const [v, setV] = useState<KaraVariant>("three");
  const steps = useMemo(() => karaSteps(v), [v]);
  return (
    <Stepper
      id="DVCQ-5.1"
      lesson="DVCQ-5"
      title="Multiplying with three products instead of four"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Method"
          value={v}
          options={[
            { value: "three", label: "Karatsuba: 3 products" },
            { value: "four", label: "Plain split: 4 products" },
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
              <Tree nodes={s.nodes} label="The multiplications; each number under a leaf is that one-digit product" level={62} unit={v === "three" ? 64 : 46} full={v !== "three"} />
            </Follow>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* DVCQ-6.1 */
export function MomFigure() {
  const [v, setV] = useState<MomVariant>("mom");
  const steps = useMemo(() => momSteps(v), [v]);
  return (
    <Stepper
      id="DVCQ-6.1"
      lesson="DVCQ-6"
      title="A pivot that is never near the ends"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Pivot"
          value={v}
          options={[
            { value: "mom", label: "Median of medians" },
            { value: "first", label: "First value" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            {s.cells ? (
              <Grid cells={s.cells} label="Groups of five as columns; row 2 holds the medians" />
            ) : (
              <Named name="values">
                <ArrayTrack values={s.values ?? []} states={s.states} window={s.window} pointers={s.pointers ?? []} label="a sorted list" />
              </Named>
            )}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
