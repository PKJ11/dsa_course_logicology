"use client";

// The visualizer engine. A figure is a pure function of its step number: Prev and Next, the arrow
// keys, Home and End, the scrubber and the URL hash (#BSRC-2.1:5) all set one index. Each change is
// announced to screen readers and recorded as the learner's last stop.

import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { recordStep } from "../_lib/progress";

export function Stepper({
  id,
  lesson,
  title,
  total,
  caption,
  variants,
  resetKey,
  children,
}: {
  id: string;
  lesson: string;
  title: string;
  total: number;
  caption: (i: number) => ReactNode;
  variants?: ReactNode;
  resetKey?: string;
  children: (i: number) => ReactNode;
}) {
  const [rawStep, setI] = useState(0);
  // A variant can have fewer steps than the one before it; never render past the last step.
  const i = Math.min(rawStep, total - 1);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState("");
  const touched = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const last = total - 1;

  // The step pinned in the hash, if it belongs to this figure.
  const pinned = useCallback(() => {
    const m = window.location.hash.match(/^#([A-Z]{4}-\d+\.\d+):(\d+)$/);
    return m && m[1] === id ? Math.min(Math.max(parseInt(m[2], 10) - 1, 0), last) : null;
  }, [id, last]);

  useEffect(() => {
    const step = pinned();
    if (step !== null) {
      setI(step);
      requestAnimationFrame(() => rootRef.current?.scrollIntoView({ block: "start" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new variant starts the figure again. The phone data set arrives just after load, so until the
  // learner touches the figure, a pinned step still wins.
  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current === resetKey) return;
    lastKey.current = resetKey;
    setI(touched.current ? 0 : (pinned() ?? 0));
    setPlaying(false);
  }, [resetKey, pinned]);

  const go = useCallback(
    (next: number) => {
      touched.current = true;
      setI(Math.min(Math.max(next, 0), last));
    },
    [last],
  );

  useEffect(() => {
    if (!touched.current) return;
    recordStep(lesson, id, i, total);
    try {
      history.replaceState(null, "", `#${id}:${i + 1}`);
    } catch {
      /* ignore */
    }
    setLive(`Step ${i + 1} of ${total}. ${capRef.current?.textContent ?? ""}`);
  }, [i, id, lesson, total]);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(i + 1), 1300);
    return () => window.clearTimeout(t);
  }, [playing, i, last, go]);

  function onKey(e: KeyboardEvent) {
    const el = e.target as HTMLElement;
    if (el.tagName === "INPUT" && (el as HTMLInputElement).type === "range") return;
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
    else return;
    setPlaying(false);
    e.preventDefault();
  }

  return (
    <figure
      ref={rootRef}
      id={id}
      className="fig wide"
      tabIndex={0}
      role="group"
      aria-roledescription="step-through figure"
      aria-label={`Figure ${id}: ${title}`}
      onKeyDown={onKey}
    >
      <div className="fig__head">
        <span className="fig__code">FIG {id}</span>
        <span className="fig__title">{title}</span>
        <span className="fig__keys" aria-hidden="true">
          Step with ← → · Home · End
        </span>
      </div>
      {variants && <div className="fig__variants" onClickCapture={() => (touched.current = true)}>{variants}</div>}
      <div className="fig__stage">{children(i)}</div>
      <div className="fig__caption">
        <span className="fig__stepno num">
          {i + 1}/{total}
        </span>
        <p ref={capRef}>{caption(i)}</p>
      </div>
      <div className="fig__controls">
        <button type="button" className="btn btn--icon" onClick={() => { setPlaying(false); go(0); }} disabled={i === 0} aria-label="Back to step 1">
          <RotateCcw size={17} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn--icon" onClick={() => { setPlaying(false); go(i - 1); }} disabled={i === 0} aria-label="Previous step">
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn--board" onClick={() => { setPlaying(false); go(i + 1); }} disabled={i === last}>
          <span className="fig__next-label">Next step</span>
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => {
            if (i >= last) go(0);
            touched.current = true;
            setPlaying((p) => !p);
          }}
          aria-label={playing ? "Pause" : "Play through"}
          aria-pressed={playing}
        >
          {playing ? <Pause size={17} strokeWidth={2.25} aria-hidden="true" /> : <Play size={17} strokeWidth={2.25} aria-hidden="true" />}
        </button>
        <input
          className="scrub"
          type="range"
          min={0}
          max={last}
          value={i}
          onChange={(e) => {
            setPlaying(false);
            go(parseInt(e.target.value, 10));
          }}
          aria-label="Step"
          aria-valuetext={`Step ${i + 1} of ${total}`}
        />
        <span className="fig__count">
          Step {i + 1} of {total}
        </span>
      </div>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </figure>
  );
}

/** Captions are written with `backticks` for code. */
export function Cap({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((p, k) =>
        k % 2 ? (
          <code key={k} className="inline-code">
            {p}
          </code>
        ) : (
          <Fragment key={k}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function Variants<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <>
      <span className="fig__variants-label" id={`lbl-${label.replace(/\W+/g, "-")}`}>
        {label}
      </span>
      <span className="seg" role="group" aria-labelledby={`lbl-${label.replace(/\W+/g, "-")}`}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </span>
    </>
  );
}

export function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setCompact(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return compact;
}
