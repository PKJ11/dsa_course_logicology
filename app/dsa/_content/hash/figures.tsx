"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { CodeTrace, Follow, HashTable, Links, Named, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import {
  BLOOM_M,
  BUCKET_POLY,
  BUCKET_SUM,
  LRU_CAP,
  PAIR_TARGET,
  PAIR_VALS,
  WORDS,
  attackSteps,
  bloomSteps,
  bucketSteps,
  chainSteps,
  countSteps,
  dictSteps,
  growSteps,
  lruSteps,
  pairSteps,
  probeSteps,
  type HashStep,
  type ProbeVariant,
} from "./algos";

/** A small two-column table inside a stage: a dict's keys and values, with the current key marked. */
function KV({ title, head, rows, cur }: { title: string; head: [string, string]; rows: [string, string][]; cur?: string | null }) {
  return (
    <table className="tt vars" style={{ minWidth: 180, width: "min(100%, 360px)" }}>
      <caption className="visually-hidden">{title}</caption>
      <thead>
        <tr>
          <th>{head[0]}</th>
          <th>{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={2} style={{ color: "var(--ink-3)" }}>
              empty
            </td>
          </tr>
        )}
        {rows.map(([k, v]) => (
          <tr key={k} className={k === cur ? "is-current" : undefined}>
            <td>
              <code>{k}</code>
            </td>
            <td>
              <code>{v}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

function Table({ s, mode, label, m }: { s: HashStep; mode: "chain" | "slots"; label: string; m: number }) {
  return (
    <Follow>
      <HashTable rows={s.rows} mode={mode} marks={s.marks} label={`${label}, ${m} ${mode === "chain" ? "buckets" : "slots"}`} />
    </Follow>
  );
}

/* HASH-1.1 */
export function BucketFigure() {
  const [v, setV] = useState<"poly" | "sum">("poly");
  const steps = useMemo(() => bucketSteps(v === "poly"), [v]);
  return (
    <Stepper
      id="HASH-1.1"
      lesson="HASH-1"
      title="From a word to a bucket"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Hash function"
          value={v}
          options={[
            { value: "poly", label: "Multiply by 31" },
            { value: "sum", label: "Add the letters" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <CodeTrace code={v === "poly" ? BUCKET_POLY : BUCKET_SUM} line={s.line ?? null} vars={s.vars} />
            <Table s={s} mode="chain" label="Hash table" m={7} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-2.1 */
export function ChainFigure() {
  const [v, setV] = useState<"use" | "grow">("use");
  const steps = useMemo(() => (v === "use" ? chainSteps() : growSteps()), [v]);
  return (
    <Stepper
      id="HASH-2.1"
      lesson="HASH-2"
      title="Chaining: a list in every bucket"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "use", label: "Insert, find, remove" },
            { value: "grow", label: "Grow the table" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        if (v === "use")
          return (
            <div className="stage-stack">
              <Table s={s} mode="chain" label="Hash table with chaining" m={5} />
              <Readout s={s} />
            </div>
          );
        return (
          <div className="stage-stack">
            <div className="stage-row">
              {s.rows.length > 0 && (
                <Named name={s.rows2 ? "old table" : "table"}>
                  <Follow>
                    <HashTable rows={s.rows} mode="chain" marks={s.rows2 ? undefined : s.marks} label="Old hash table, 4 buckets" />
                  </Follow>
                </Named>
              )}
              {s.rows2 && (
                <Named name="new table">
                  <Follow>
                    <HashTable rows={s.rows2} mode="chain" marks={s.marks} label="New hash table, 8 buckets" />
                  </Follow>
                </Named>
              )}
            </div>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-3.1 */
export function ProbeFigure() {
  const [v, setV] = useState<ProbeVariant>("insert");
  const steps = useMemo(() => probeSteps(v), [v]);
  return (
    <Stepper
      id="HASH-3.1"
      lesson="HASH-3"
      title="Linear probing"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "insert", label: "Insert and find" },
            { value: "marker", label: "Remove with a marker" },
            { value: "empty", label: "Remove by emptying" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Table s={s} mode="slots" label="Open-addressing table" m={10} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-4.1 */
export function AttackFigure() {
  const [v, setV] = useState<"fixed" | "random">("fixed");
  const steps = useMemo(() => attackSteps(v === "random"), [v]);
  return (
    <Stepper
      id="HASH-4.1"
      lesson="HASH-4"
      title="Chosen keys against a fixed hash and a random one"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Hash"
          value={v}
          options={[
            { value: "fixed", label: "Fixed: k % 8" },
            { value: "random", label: "Random a and b" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Table s={s} mode="chain" label="Hash table under attack" m={8} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-5.1 */
export function DictFigure() {
  const steps = useMemo(() => dictSteps(), []);
  return (
    <Stepper id="HASH-5.1" lesson="HASH-5" title="Inside a Python dict" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="indices">
              <ArrayTrack values={s.indices.map((x) => (x === null ? "" : x))} states={s.states} pointers={[{ name: "i", at: s.at, kind: "mid" }]} label="indices" />
            </Named>
            <Named name="entries">
              <table className="tt vars" style={{ minWidth: 220, width: "min(100%, 360px)" }}>
                <caption className="visually-hidden">entries, in the order they were added</caption>
                <thead>
                  <tr>
                    <th className="num">entry</th>
                    <th>key</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>
                  {s.entries.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: "var(--ink-3)" }}>
                        empty
                      </td>
                    </tr>
                  )}
                  {s.entries.map(([k, val], j) => (
                    <tr key={j} className={j === s.cur ? "is-current" : undefined}>
                      <td className="num">{j}</td>
                      <td>
                        <code>{k}</code>
                      </td>
                      <td>
                        <code>&apos;{val}&apos;</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Named>
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-6.1 */
export function CountFigure() {
  const [v, setV] = useState<"count" | "pairs">("count");
  const count = useMemo(() => countSteps(), []);
  const pairs = useMemo(() => pairSteps(), []);
  const total = v === "count" ? count.length : pairs.length;
  return (
    <Stepper
      id="HASH-6.1"
      lesson="HASH-6"
      title="One pass with a dict"
      total={total}
      resetKey={v}
      caption={(i) => <Cap text={(v === "count" ? count[i] : pairs[i]).caption} />}
      variants={
        <Variants
          label="Task"
          value={v}
          options={[
            { value: "count", label: "Count words" },
            { value: "pairs", label: `Pair that adds to ${PAIR_TARGET}` },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        if (v === "count") {
          const s = count[i];
          return (
            <div className="stage-stack">
              <Named name="words">
                <ArrayTrack values={WORDS} states={s.states} pointers={[{ name: "i", at: s.at, kind: "mid" }]} label="words" />
              </Named>
              <KV title="counts" head={["key", "count"]} rows={s.table} cur={s.cur} />
              <Readout s={s} />
            </div>
          );
        }
        const s = pairs[i];
        return (
          <div className="stage-stack">
            <Named name="a">
              <ArrayTrack values={PAIR_VALS} states={s.states} pointers={[{ name: "i", at: s.at, kind: "mid" }]} label="a" />
            </Named>
            <KV title="seen: value to place" head={["seen key", "place"]} rows={s.table} cur={s.cur} />
            <div className="readout">
              {s.need !== null && (
                <span>
                  need <b className="num">{s.need}</b>
                </span>
              )}
              {s.verdict && <Verdict v={s.verdict} />}
            </div>
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-7.1 */
export function LruFigure() {
  const steps = useMemo(() => lruSteps(), []);
  return (
    <Stepper id="HASH-7.1" lesson="HASH-7" title={`An LRU cache with room for ${LRU_CAP}`} total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <div className="stage-label" style={{ margin: 0 }}>
              {s.op}
            </div>
            <Named name="two-way list: most recent on the left">
              <Follow>
                <Links nodes={s.nodes} edges={s.edges} names={s.names} label="Two-way list of cache items between two sentinels" double />
              </Follow>
            </Named>
            <KV title="dict: key to node" head={["key", "node"]} rows={s.table} cur={s.cur} />
            {s.verdict && (
              <div className="readout">
                <Verdict v={s.verdict} />
              </div>
            )}
          </div>
        );
      }}
    </Stepper>
  );
}

/* HASH-8.1 */
export function BloomFigure() {
  const steps = useMemo(() => bloomSteps(), []);
  const compact = useCompact();
  const half = BLOOM_M / 2;
  return (
    <Stepper id="HASH-8.1" lesson="HASH-8" title={`A Bloom filter of ${BLOOM_M} bits`} total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            {compact ? (
              <>
                <ArrayTrack values={s.bits.slice(0, half)} states={s.states.slice(0, half)} pointers={[]} label="bits" />
                <ArrayTrack values={s.bits.slice(half)} states={s.states.slice(half)} pointers={[]} label="bits" base={half} />
              </>
            ) : (
              <ArrayTrack values={s.bits} states={s.states} pointers={[]} label="bits" />
            )}
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
