"use client";

import { useMemo, useState } from "react";
import { Plane, Queue, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants } from "../../_components/Stepper";
import {
  CROSS_SIZE,
  HULL_SIZE,
  MEET_SIZE,
  SWEEP_SIZE,
  crossSteps,
  hullSteps,
  meetSteps,
  sweepSteps,
  type CrossVariant,
  type GeoStep,
  type MeetVariant,
  type SweepVariant,
} from "./algos";

function Readout({ s }: { s: GeoStep }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

function PlaneStage({ s, w, h, label }: { s: GeoStep; w: number; h: number; label: string }) {
  return (
    <div className="stage-stack">
      <Plane w={w} h={h} points={s.points} segs={s.segs} polys={s.polys} lines={s.lines} label={label} />
      <Readout s={s} />
    </div>
  );
}

/* GEOM-1.1 */
export function CrossFigure() {
  const [v, setV] = useState<CrossVariant>("left");
  const steps = useMemo(() => crossSteps(v), [v]);
  return (
    <Stepper
      id="GEOM-1.1"
      lesson="GEOM-1"
      title="The cross product: an area with a sign"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
            { value: "line", label: "In line" },
            { value: "area", label: "A polygon" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <PlaneStage s={steps[i]} w={CROSS_SIZE.w} h={CROSS_SIZE.h} label="Points and vectors on a grid of whole-number coordinates" />}
    </Stepper>
  );
}

/* GEOM-2.1 */
export function MeetFigure() {
  const [v, setV] = useState<MeetVariant>("cross");
  const steps = useMemo(() => meetSteps(v), [v]);
  return (
    <Stepper
      id="GEOM-2.1"
      lesson="GEOM-2"
      title="Do two pieces meet? Four orientations"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Pieces"
          value={v}
          options={[
            { value: "cross", label: "Cross" },
            { value: "miss", label: "Miss" },
            { value: "touch", label: "Touch" },
            { value: "line", label: "One line" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => <PlaneStage s={steps[i]} w={MEET_SIZE.w} h={MEET_SIZE.h} label="Two line pieces, AB and CD" />}
    </Stepper>
  );
}

/* GEOM-3.1 */
export function HullFigure() {
  const steps = useMemo(() => hullSteps(), []);
  return (
    <Stepper id="GEOM-3.1" lesson="GEOM-3" title="Andrew's monotone chain" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => <PlaneStage s={steps[i]} w={HULL_SIZE.w} h={HULL_SIZE.h} label="Ten points, named A to J from left to right, and the hull built so far" />}
    </Stepper>
  );
}

/* GEOM-4.1 */
export function SweepFigure() {
  const [v, setV] = useState<SweepVariant>("found");
  const steps = useMemo(() => sweepSteps(v), [v]);
  return (
    <Stepper
      id="GEOM-4.1"
      lesson="GEOM-4"
      title="A sweep line looking for two pieces that meet"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Pieces"
          value={v}
          options={[
            { value: "found", label: "Two meet" },
            { value: "none", label: "None meet" },
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
              <Plane w={SWEEP_SIZE.w} h={SWEEP_SIZE.h} points={s.points} segs={s.segs} lines={s.lines} label="Line pieces and the sweep line" />
              <div className="graph-side">
                <Queue items={s.queue ?? []} name="on the line, lowest first" end="none" />
              </div>
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
