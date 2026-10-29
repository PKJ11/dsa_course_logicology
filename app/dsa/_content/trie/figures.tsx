"use client";

import { useMemo, useState } from "react";
import { ArrayTrack } from "../../_components/ArrayTrack";
import { Follow, Named, Tree, Verdict, ReadoutText } from "../../_components/Stages";
import { Cap, Stepper, Variants, useCompact } from "../../_components/Stepper";
import { XOR_NUMS, autoSteps, buildSteps, radixSteps, searchSteps, xorSteps, type SearchVariant, type TrieStep } from "./algos";

function Readout({ s }: { s: { readout?: string; verdict?: { ok: boolean; text: string; info?: boolean } } }) {
  if (!s.readout && !s.verdict) return null;
  return (
    <div className="readout">
      {s.readout && <span className="num"><ReadoutText text={s.readout} /></span>}
      {s.verdict && <Verdict v={s.verdict} />}
    </div>
  );
}

/** `phoneUnit` narrows the tree on phones; `notesOnPhone` moves leaf tags (the numbers of the bit trie) under the leaves there. */
function TrieTree({ s, label, unit = 84, phoneUnit, notesOnPhone = false }: { s: TrieStep; label: string; unit?: number; phoneUnit?: number; notesOnPhone?: boolean }) {
  const compact = useCompact();
  const nodes = compact && notesOnPhone ? s.nodes.map((n) => (n.tag ? { ...n, note: n.tag, tag: undefined } : n)) : s.nodes;
  return (
    <Follow>
      <Tree nodes={nodes} label={label} level={compact && notesOnPhone ? 58 : 62} unit={compact && phoneUnit ? phoneUnit : unit} slide />
    </Follow>
  );
}

function Word({ s, name = "word" }: { s: TrieStep; name?: string }) {
  if (!s.word) return null;
  const w = s.word;
  const letters = w.text.split("");
  return (
    <Named name={name}>
      <ArrayTrack
        values={letters}
        states={letters.map((_, k) => w.states?.[k] ?? "")}
        pointers={w.at === null ? [] : [{ name: "i", at: w.at, kind: "mid" }]}
        label={`the ${name}, one letter per cell`}
      />
    </Named>
  );
}

/* TRIE-1.1 */
export function BuildFigure() {
  const steps = useMemo(() => buildSteps(), []);
  return (
    <Stepper id="TRIE-1.1" lesson="TRIE-1" title="Building a trie one word at a time" total={steps.length} caption={(i) => <Cap text={steps[i].caption} />}>
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TrieTree s={s} label="Trie: one node per prefix, letters on the edges" />
            <Word s={s} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TRIE-2.1 */
export function SearchFigure() {
  const [v, setV] = useState<SearchVariant>("ten");
  const steps = useMemo(() => searchSteps(v), [v]);
  return (
    <Stepper
      id="TRIE-2.1"
      lesson="TRIE-2"
      title="Search, prefix search and delete"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "ten", label: "Search ten" },
            { value: "te", label: "Search te" },
            { value: "tin", label: "Search tin" },
            { value: "delete", label: "Delete in, inn" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TrieTree s={s} label="Trie of in, inn, tea, ten, to" />
            <Word s={s} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TRIE-3.1 */
export function AutoFigure() {
  const [v, setV] = useState<"all" | "two">("all");
  const steps = useMemo(() => autoSteps(v), [v]);
  return (
    <Stepper
      id="TRIE-3.1"
      lesson="TRIE-3"
      title="Suggest words that start with te"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Show"
          value={v}
          options={[
            { value: "all", label: "All matches" },
            { value: "two", label: "At most 2" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TrieTree s={s} label="Trie of tea, team, ten, tend, to, toe" />
            <Word s={s} name="typed" />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TRIE-4.1 */
export function RadixFigure() {
  const [v, setV] = useState<"compress" | "insert">("compress");
  const steps = useMemo(() => radixSteps(v), [v]);
  return (
    <Stepper
      id="TRIE-4.1"
      lesson="TRIE-4"
      title="Compressing a trie"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "compress", label: "Merge the chains" },
            { value: "insert", label: "Insert toad" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <TrieTree s={s} label="Compressed trie: edges carry strings" unit={96} phoneUnit={80} />
            <Word s={s} />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}

/* TRIE-5.1 */
export function XorFigure() {
  const [v, setV] = useState<"build" | "query" | "all">("build");
  const steps = useMemo(() => xorSteps(v), [v]);
  return (
    <Stepper
      id="TRIE-5.1"
      lesson="TRIE-5"
      title="A trie of bits and the largest XOR"
      total={steps.length}
      resetKey={v}
      caption={(i) => <Cap text={steps[i].caption} />}
      variants={
        <Variants
          label="Job"
          value={v}
          options={[
            { value: "build", label: "Build" },
            { value: "query", label: "Best partner for 3" },
            { value: "all", label: "Largest XOR" },
          ]}
          onChange={setV}
        />
      }
    >
      {(i) => {
        const s = steps[i];
        return (
          <div className="stage-stack">
            <Named name="numbers">
              <ArrayTrack values={XOR_NUMS} states={s.nums} pointers={s.at === null ? [] : [{ name: "x", at: s.at, kind: "mid" }]} label="the numbers" />
            </Named>
            <TrieTree s={s} label="Trie of 4-bit numbers, highest bit first" unit={80} phoneUnit={60} notesOnPhone />
            <Readout s={s} />
          </div>
        );
      }}
    </Stepper>
  );
}
