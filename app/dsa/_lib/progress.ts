"use client";

// Progress lives in this browser only (prototype). It moves to the platform's login and server
// storage once that work is decided. Every read and write survives a blocked or empty storage.

import { useSyncExternalStore } from "react";

export type ProblemProgress = {
  solved?: boolean;
  hintsOpened?: number;
  solutionOpen?: boolean;
  code?: string;
};

export type Progress = {
  figures: Record<string, { max: number; total: number }>;
  lastStop?: { lesson: string; fig: string; step: number; at: number };
  problems: Record<string, ProblemProgress>;
};

const KEY = "dsa:progress:v1";
const EMPTY: Progress = { figures: {}, problems: {} };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Progress>) : {};
    cache = { figures: parsed.figures ?? {}, problems: parsed.problems ?? {}, lastStop: parsed.lastStop };
  } catch {
    cache = { ...EMPTY };
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: progress lasts for this visit only.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function recordStep(lesson: string, fig: string, step: number, total: number) {
  const p = read();
  const prev = p.figures[fig];
  const max = Math.max(prev?.max ?? 0, step);
  const sameFig = prev && prev.max === max && prev.total === total;
  const sameStop = p.lastStop && p.lastStop.fig === fig && p.lastStop.step === step;
  if (sameFig && sameStop) return;
  write({
    ...p,
    figures: { ...p.figures, [fig]: { max, total } },
    lastStop: { lesson, fig, step, at: Date.now() },
  });
}

export function updateProblem(id: string, patch: ProblemProgress) {
  const p = read();
  write({ ...p, problems: { ...p.problems, [id]: { ...p.problems[id], ...patch } } });
}

/** A figure counts as completed only when its last step has been reached. */
export function figureDone(p: Progress, fig: string) {
  const f = p.figures[fig];
  return !!f && f.max >= f.total - 1;
}

export type LessonState = "done" | "part" | "todo";

export function lessonState(p: Progress, figs: string[]): LessonState {
  const done = figs.filter((f) => figureDone(p, f)).length;
  if (figs.length > 0 && done === figs.length) return "done";
  if (done > 0 || figs.some((f) => p.figures[f])) return "part";
  return "todo";
}

/** A one-off read for code that runs only in the browser. */
export function getProgress(): Progress {
  return read();
}
