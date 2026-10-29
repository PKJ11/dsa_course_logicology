"use client";

// Owns the Pyodide worker. Every call has a time limit; when it runs out, the worker is terminated
// (the only reliable way to stop a Python infinite loop without special server headers) and a fresh
// one boots from the browser cache. A crash inside Pyodide replaces the worker the same way.

import { useCallback, useEffect, useRef, useState } from "react";

export type Runtime =
  | { phase: "off" }
  | { phase: "fetching" | "starting" | "restarting" }
  | { phase: "ready"; version: string }
  | { phase: "error"; message: string; online: boolean };

type Pending = { resolve: (v: unknown) => void; timer: number };

export type CallResult<T> = { timeout: true } | { timeout: false; crash?: string; result?: T };

export function usePython(enabled: boolean) {
  const [rt, setRt] = useState<Runtime>({ phase: "off" });
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, Pending>());
  const ready = useRef<Promise<void> | null>(null);
  const seq = useRef(0);

  const spawn = useCallback((restart = false) => {
    worker.current?.terminate();
    pending.current.forEach((p) => window.clearTimeout(p.timer));
    pending.current.clear();
    setRt({ phase: restart ? "restarting" : "fetching" });
    const w = new Worker("/dsa/runner.mjs", { type: "module" });
    worker.current = w;
    ready.current = new Promise<void>((resolveReady, rejectReady) => {
      w.onmessage = (ev: MessageEvent) => {
        const m = ev.data;
        if (m.type === "stage") {
          if (!restart) setRt({ phase: m.stage });
        } else if (m.type === "ready") {
          setRt({ phase: "ready", version: m.version });
          resolveReady();
        } else if (m.type === "boot-error") {
          setRt({ phase: "error", message: m.message, online: m.online });
          rejectReady(new Error(m.message));
        } else {
          const p = pending.current.get(m.id);
          if (!p) return;
          window.clearTimeout(p.timer);
          pending.current.delete(m.id);
          p.resolve(m.type === "crash" ? { timeout: false, crash: m.message } : { timeout: false, result: m.result });
          // A crash is a JavaScript error inside Pyodide (for example, its stack ran out). Pyodide can be
          // left unusable after one, so start a fresh runner, as after a timeout.
          if (m.type === "crash") spawn(true);
        }
      };
      w.onerror = () => {
        setRt({ phase: "error", message: "The Python runner stopped unexpectedly.", online: navigator.onLine });
        rejectReady(new Error("runner error"));
      };
    });
    ready.current.catch(() => {});
  }, []);

  useEffect(() => {
    if (enabled && !worker.current) spawn();
  }, [enabled, spawn]);

  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = null;
    },
    [],
  );

  const call = useCallback(
    async <T,>(msg: Record<string, unknown>, timeoutMs: number): Promise<CallResult<T>> => {
      if (!worker.current || !ready.current) return { timeout: false, crash: "Python is not running." };
      try {
        await ready.current;
      } catch {
        return { timeout: false, crash: "Python could not start." };
      }
      const id = ++seq.current;
      return new Promise<CallResult<T>>((resolve) => {
        const timer = window.setTimeout(() => {
          pending.current.delete(id);
          spawn(true);
          resolve({ timeout: true });
        }, timeoutMs);
        pending.current.set(id, { resolve: resolve as (v: unknown) => void, timer });
        worker.current!.postMessage({ ...msg, id });
      });
    },
    [spawn],
  );

  return { rt, call, retry: () => spawn() };
}
