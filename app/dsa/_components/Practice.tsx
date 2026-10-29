"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock3,
  KeyRound,
  Laptop,
  LoaderCircle,
  Lock,
  Play,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { ArrayTrack } from "./ArrayTrack";
import { CodeBlock } from "./Code";
import { Editor } from "./Editor";
import { Cap } from "./Stepper";
import { usePython } from "../_lib/python";
import { getProgress, updateProblem, useProgress } from "../_lib/progress";
import type { Hint, TestCase } from "../_content/types";
import { STATION_SOLUTIONS } from "../_content/solutions";

type Status = "idle" | "running" | "pass" | "fail" | "error" | "timeout" | "skipped";
type Row = { status: Status; got?: string; expected?: string; error?: string; stdout?: string; reads?: number; ms?: number; slow?: boolean };
type TestResult = { status: "pass" | "fail" | "error"; got?: string; expected?: string; error?: string; stdout?: string; reads?: number; ms?: number; slow?: boolean };
type LoadResult = { ok: boolean; error?: string; stdout?: string };

const INSTRUCTOR_HASH = (process.env.NEXT_PUBLIC_DSA_INSTRUCTOR_HASH || "").trim().toLowerCase();

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export function Practice({
  id,
  fn,
  starter,
  blocked,
  tests,
  hints,
  solution,
  statement,
  next,
  lessonLinks,
}: {
  id: string;
  fn: string;
  starter: string;
  blocked?: string[];
  tests: TestCase[];
  hints: Hint[];
  solution: number;
  statement: ReactNode;
  next?: { href: string; label: string };
  lessonLinks: ReactNode;
}) {
  const wide = useWide();
  const { rt, call, retry } = usePython(wide);
  const progress = useProgress();
  const mine = progress.problems[id] ?? {};

  const [mounted, setMounted] = useState(false);
  const [initial, setInitial] = useState(starter);
  const code = useRef(starter);
  const [resetSignal, setResetSignal] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [rows, setRows] = useState<Row[]>(() => tests.map(() => ({ status: "idle" })));
  const [open, setOpen] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [loadError, setLoadError] = useState<LoadResult | null>(null);
  const [loadOut, setLoadOut] = useState("");
  const [ran, setRan] = useState(false);
  const saveTimer = useRef<number>(0);

  useEffect(() => {
    const saved = getProgress().problems[id]?.code;
    if (saved) {
      setInitial(saved);
      code.current = saved;
    }
    setMounted(true);
  }, [id]);

  const onChange = useCallback(
    (c: string) => {
      code.current = c;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => updateProblem(id, { code: c }), 400);
    },
    [id],
  );

  const runAll = useCallback(async () => {
    if (running || rt.phase !== "ready") return;
    setRunning(true);
    setRan(true);
    setLoadError(null);
    setLoadOut("");
    setOpen(null);
    const fresh: Row[] = tests.map(() => ({ status: "idle" }));
    setRows(fresh.slice());
    const src = code.current;
    updateProblem(id, { code: src });

    const load = async () => {
      const r = await call<LoadResult>({ type: "load", code: src, blocked: blocked ?? [] }, 5000);
      if (r.timeout) return { ok: false, error: "Your file was still running after 5 seconds, before any test started. Is there a loop at the top level, outside the function?" } as LoadResult;
      if (r.crash) return { ok: false, error: r.crash } as LoadResult;
      return r.result!;
    };

    let loaded = await load();
    if (!loaded.ok) {
      setLoadError(loaded);
      setRows(tests.map(() => ({ status: "skipped" })));
      setRunning(false);
      return;
    }
    setLoadOut(loaded.stdout ?? "");

    let firstBad: number | null = null;
    for (let k = 0; k < tests.length; k++) {
      const t = tests[k];
      fresh[k] = { status: "running" };
      setRows(fresh.slice());
      const r = await call<TestResult>({ type: "test", fn, args: t.args, expect: t.expect, probe: t.probe ?? 0, expr: t.expr ?? "" }, t.timeout ?? 3000);
      if (r.timeout) {
        fresh[k] = { status: "timeout" };
        setRows(fresh.slice());
        if (firstBad === null) firstBad = k;
        // The runner was replaced; load the code again before the next test.
        if (k < tests.length - 1) {
          loaded = await load();
          if (!loaded.ok) {
            for (let j = k + 1; j < tests.length; j++) fresh[j] = { status: "skipped" };
            setRows(fresh.slice());
            break;
          }
        }
        continue;
      }
      if (r.crash) {
        fresh[k] = {
          status: "error",
          error: `Python itself stopped (${r.crash}) and was restarted. This usually means very deep recursion, or data nested very deeply.`,
        };
        // The runner was replaced; load the code again before the next test.
        if (k < tests.length - 1) {
          loaded = await load();
          if (!loaded.ok) {
            setRows(fresh.slice());
            for (let j = k + 1; j < tests.length; j++) fresh[j] = { status: "skipped" };
            setRows(fresh.slice());
            if (firstBad === null) firstBad = k;
            break;
          }
        }
      } else {
        const res = r.result!;
        fresh[k] = { ...res, status: res.status };
      }
      if (fresh[k].status !== "pass" && firstBad === null) firstBad = k;
      setRows(fresh.slice());
    }
    setOpen(firstBad);
    setRunning(false);
    if (fresh.every((x) => x.status === "pass")) updateProblem(id, { solved: true });
  }, [running, rt.phase, tests, call, blocked, fn, id]);

  const passed = rows.filter((r) => r.status === "pass").length;
  const allPass = ran && !running && passed === tests.length;
  const runningIdx = rows.findIndex((r) => r.status === "running");

  return (
    <div className="practice">
      <section className="practice__problem" aria-labelledby="problem-heading">
        <h2 id="problem-heading" className="visually-hidden">
          The problem
        </h2>
        <div className="prose">{statement}</div>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "18px 0 0" }}>{lessonLinks}</p>

        <div className="laptop-only">
          <p style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 750 }}>
            <Laptop size={20} strokeWidth={2.25} aria-hidden="true" /> Continue on a laptop
          </p>
          <p>
            Practice runs Python in the browser and needs a keyboard and a wider screen. Read the problem and open hints here, then write
            your solution on a laptop. Progress is saved per browser for now, so hints opened here stay on this device.
          </p>
        </div>

        <HintLadder id={id} hints={hints} opened={mine.hintsOpened ?? 0} solution={solution} />
      </section>

      <section className="practice__work" aria-label="Your solution and its tests">
        <div className="editor-bar">
          <Runtime rt={rt} />
          <span className="editor-bar__file">solution.py</span>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                window.setTimeout(() => setConfirmReset(false), 3000);
                return;
              }
              setConfirmReset(false);
              setResetSignal((s) => s + 1);
            }}
          >
            <RotateCcw size={15} strokeWidth={2.25} aria-hidden="true" />
            {confirmReset ? "Click again to reset" : "Reset"}
          </button>
          <button type="button" className="btn btn--board" onClick={runAll} disabled={running || rt.phase !== "ready"} aria-keyshortcuts="Control+Enter">
            {running ? <LoaderCircle size={17} className="spin" aria-hidden="true" /> : <Play size={17} strokeWidth={2.5} aria-hidden="true" />}
            {running ? "Running" : "Run tests"}
          </button>
        </div>
        {mounted && wide && (
          <Editor initial={initial} starter={starter} resetSignal={resetSignal} onChange={onChange} onRun={runAll} label={`Python editor for ${fn}`} />
        )}
        {!mounted && <div className="editor" aria-hidden="true" />}
        <p style={{ margin: 0, padding: "6px 14px", fontSize: 12.5, color: "var(--ink-3)", borderBottom: "1px solid var(--rule-soft)" }}>
          Ctrl + Enter runs the tests. Tab indents; press Esc, then Tab, to leave the editor.
        </p>

        <BootPanel rt={rt} retry={retry} />

        {allPass && (
          <div className="solved" role="status" style={{ marginTop: 16 }}>
            <p>
              All {tests.length} tests pass. {id} solved{mine.solutionOpen ? " (after opening the solution)" : ""}.
            </p>
            {next && (
              <Link className="btn btn--ink" href={next.href}>
                {next.label}
                <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <div className="tests">
          <div className="tests__summary" aria-live="polite">
            <span>
              {running
                ? `Running test ${runningIdx + 1} of ${tests.length}`
                : ran
                  ? `${passed} of ${tests.length} tests pass`
                  : `${tests.length} tests, not run yet`}
            </span>
            {mine.solved && !allPass && <span className="mark mark--solved"><span className="mark__glyph" aria-hidden="true" />Solved before</span>}
          </div>
          {loadError && (
            <div className="boot boot--error" style={{ margin: "0 0 12px" }} role="alert">
              <strong>Your code did not load, so no test ran.</strong>
              <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", fontFamily: "var(--f-code)", fontSize: 13 }}>{loadError.error}</pre>
            </div>
          )}
          {loadOut && (
            <div className="boot" style={{ margin: "0 0 12px" }}>
              <strong>Printed while loading your file</strong>
              <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", fontFamily: "var(--f-code)", fontSize: 13 }}>{loadOut}</pre>
            </div>
          )}
          <div className="tt-wrap">
            <table className="tt">
              <caption className="visually-hidden">Test results</caption>
              <thead>
                <tr>
                  <th className="r">#</th>
                  <th>Test</th>
                  <th>Result</th>
                  <th className="r">Reads · time</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t, k) => {
                  const r = rows[k];
                  const bad = r.status === "fail" || r.status === "error" || r.status === "timeout";
                  const expanded = open === k;
                  return (
                    <Fragment key={k}>
                      <tr className={`test-row${bad ? " is-fail" : ""}`}>
                        <td className="r">{k + 1}</td>
                        <td>
                          {bad ? (
                            <button type="button" className="row-toggle" aria-expanded={expanded} aria-controls={`test-${k}`} onClick={() => setOpen(expanded ? null : k)}>
                              <ChevronRight size={15} strokeWidth={2.5} aria-hidden="true" />
                              {t.name}
                            </button>
                          ) : (
                            <span style={{ paddingLeft: 21, display: "inline-block" }}>{t.name}</span>
                          )}
                        </td>
                        <td>
                          <StateMark s={r.status} slow={r.slow} />
                        </td>
                        <td className="r" style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>
                          {r.reads !== undefined ? `${r.reads.toLocaleString("en-US")}${t.probe ? ` / ${t.probe}` : ""}` : ""}
                          {r.reads !== undefined && r.ms !== undefined ? " · " : ""}
                          {r.ms !== undefined ? `${r.ms} ms` : ""}
                        </td>
                      </tr>
                      {bad && expanded && (
                        <tr className="test-detail" id={`test-${k}`}>
                          <td colSpan={4}>
                            <dl>
                              <dt>Input</dt>
                              <dd>{t.show}</dd>
                              {r.status === "fail" && (
                                <>
                                  <dt>Expected</dt>
                                  <dd>{r.expected}</dd>
                                  <dt>Got</dt>
                                  <dd>{r.got}</dd>
                                </>
                              )}
                              {r.status === "timeout" && (
                                <>
                                  <dt>Got</dt>
                                  <dd>Still running after {((t.timeout ?? 3000) / 1000).toFixed(0)} seconds, so the runner was stopped and restarted.</dd>
                                </>
                              )}
                              {r.status === "error" && (
                                <>
                                  <dt>Error</dt>
                                  <dd>{r.error}</dd>
                                </>
                              )}
                              {r.reads !== undefined && t.probe ? (
                                <>
                                  <dt>Reads</dt>
                                  <dd>
                                    {r.reads.toLocaleString("en-US")} (limit {t.probe})
                                  </dd>
                                </>
                              ) : null}
                            </dl>
                            <p className="why">
                              <strong>What this usually means: </strong>
                              <Cap text={t.why} />
                            </p>
                            {r.stdout ? (
                              <>
                                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13.5 }}>Your print() output</p>
                                <pre>{r.stdout}</pre>
                              </>
                            ) : null}
                            {t.trace && (
                              <>
                                <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13.5 }}>Trace it by hand: indices are on the blue plates</p>
                                <div style={{ overflowX: "auto", paddingBottom: 4 }}>
                                  <ArrayTrack values={t.trace} pointers={[]} />
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StateMark({ s, slow }: { s: Status; slow?: boolean }) {
  const map: Record<Status, [ReactNode, string]> = {
    idle: [<CircleDashed key="i" size={16} aria-hidden="true" />, "Not run"],
    running: [<LoaderCircle key="r" size={16} className="spin" aria-hidden="true" />, "Running"],
    pass: [<CircleCheck key="p" size={16} strokeWidth={2.5} aria-hidden="true" />, "Pass"],
    fail: [<CircleX key="f" size={16} strokeWidth={2.5} aria-hidden="true" />, slow ? "Too many reads" : "Wrong answer"],
    error: [<CircleAlert key="e" size={16} strokeWidth={2.5} aria-hidden="true" />, "Error"],
    timeout: [<Clock3 key="t" size={16} strokeWidth={2.5} aria-hidden="true" />, "Timed out"],
    skipped: [<CircleDashed key="s" size={16} aria-hidden="true" />, "Not run"],
  };
  const [icon, label] = map[s];
  return (
    <span className={`state state--${s}`}>
      {icon}
      {label}
    </span>
  );
}

function Runtime({ rt }: { rt: ReturnType<typeof usePython>["rt"] }) {
  const cls = rt.phase === "ready" ? "is-ready" : rt.phase === "error" ? "is-error" : rt.phase === "off" ? "" : "is-loading";
  const text =
    rt.phase === "ready"
      ? `Python ${rt.version} ready`
      : rt.phase === "fetching"
        ? "Fetching Python"
        : rt.phase === "starting"
          ? "Starting Python"
          : rt.phase === "restarting"
            ? "Restarting Python"
            : rt.phase === "error"
              ? "Python unavailable"
              : "Python waits for a wider screen";
  return (
    <span className={`runtime ${cls}`} role="status">
      <span className="runtime__dot" aria-hidden="true" />
      {text}
    </span>
  );
}

function BootPanel({ rt, retry }: { rt: ReturnType<typeof usePython>["rt"]; retry: () => void }) {
  if (rt.phase === "fetching" || rt.phase === "starting") {
    return (
      <div className="boot">
        <strong>Getting Python ready.</strong> The first time, your browser downloads about 10 MB; after that it keeps a copy and Python
        starts in a few seconds. You can read the problem and write code meanwhile.
        <div className="boot__bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${rt.phase === "fetching" ? 0.3 : 0.8})` }} />
        </div>
      </div>
    );
  }
  if (rt.phase === "restarting") {
    return (
      <div className="boot">
        <strong>Restarting Python.</strong> A test ran past its time limit, so the runner was stopped. The remaining tests continue in a moment.
      </div>
    );
  }
  if (rt.phase === "error") {
    return (
      <div className="boot boot--error" role="alert">
        <strong>{rt.online ? "Python could not start." : "You are offline."}</strong>{" "}
        {rt.online
          ? "The download may have been blocked or cut short. Your code is saved in this browser."
          : "Python needs a one-time download the first time you practise. Your code is saved in this browser; reconnect and try again."}
        <div style={{ marginTop: 10 }}>
          <button type="button" className="btn btn--sm" onClick={retry}>
            <RotateCcw size={15} strokeWidth={2.25} aria-hidden="true" /> Try again
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function HintLadder({ id, hints, opened, solution }: { id: string; hints: Hint[]; opened: number; solution: number }) {
  const [instructor, setInstructor] = useState(false);
  const [sol, setSol] = useState<{ code: string; notes: string[] } | null>(null);
  const [loadingSol, setLoadingSol] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const total = hints.length;
  const unlocked = opened >= total || instructor;

  useEffect(() => {
    try {
      setInstructor(window.sessionStorage.getItem("dsa:instructor") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  async function showSolution() {
    setLoadingSol(true);
    const { SOLUTIONS } = await STATION_SOLUTIONS[id.split("-")[0]]();
    const mod = await SOLUTIONS[solution]();
    setSol({ code: mod.code, notes: mod.notes });
    setLoadingSol(false);
    if (!instructor) updateProblem(id, { solutionOpen: true });
  }

  async function unlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (new FormData(e.currentTarget).get("passcode") as string) || "";
    if (!INSTRUCTOR_HASH) {
      setMsg("No instructor passcode is set for this build.");
      return;
    }
    if ((await sha256(`dsa-instructor:${input}`)) === INSTRUCTOR_HASH) {
      setInstructor(true);
      setShowForm(false);
      setMsg("");
      try {
        window.sessionStorage.setItem("dsa:instructor", "1");
      } catch {
        /* ignore */
      }
    } else {
      setMsg("That passcode does not match.");
    }
  }

  return (
    <section className="ladder" aria-labelledby="hints-heading">
      <h2 className="ladder__title" id="hints-heading">
        Need a hint?
        <span>
          {opened} of {total} opened
        </span>
      </h2>
      <ol className="rungs">
        {hints.map((h, k) => {
          const isOpen = k < opened;
          const isNext = k === opened;
          return (
            <li key={k} className={`rung${isOpen ? " is-open" : isNext ? "" : " is-locked"}`}>
              <span className="rung__n" aria-hidden="true">
                {k + 1}
              </span>
              <div>
                <div className="rung__head">
                  <span className="rung__name">
                    Hint {k + 1}
                    <small>{h.kind}</small>
                  </span>
                  {!isOpen &&
                    (isNext ? (
                      <button type="button" className="btn btn--sm" onClick={() => updateProblem(id, { hintsOpened: k + 1 })}>
                        Open hint {k + 1}
                      </button>
                    ) : (
                      <span className="rung__locked-why">
                        <Lock size={14} aria-hidden="true" /> Open hint {k} first
                      </span>
                    ))}
                </div>
                {isOpen && <div className="rung__body">{h.body}</div>}
              </div>
            </li>
          );
        })}
        <li className={`rung${sol ? " is-open" : unlocked ? "" : " is-locked"}`}>
          <span className="rung__n" aria-hidden="true">
            {total + 1}
          </span>
          <div>
            <div className="rung__head">
              <span className="rung__name">
                Worked solution
                <small>{instructor ? "instructor unlock" : "last resort"}</small>
              </span>
              {!sol &&
                (unlocked ? (
                  <button type="button" className="btn btn--sm" onClick={showSolution} disabled={loadingSol}>
                    {loadingSol ? "Loading" : "Show the solution"}
                  </button>
                ) : (
                  <span className="rung__locked-why">
                    <Lock size={14} aria-hidden="true" /> Opens after all {total} hints
                  </span>
                ))}
            </div>
            {sol && (
              <div className="rung__body">
                <CodeBlock code={sol.code} title="solution.py" />
                {sol.notes.map((n, k) => (
                  <p key={k}>
                    <Cap text={n} />
                  </p>
                ))}
              </div>
            )}
          </div>
        </li>
      </ol>

      <div className="instructor">
        {instructor ? (
          <span>
            <KeyRound size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px" }} /> Instructor: every solution is unlocked in this tab.
          </span>
        ) : (
          <>
            <button type="button" className="quiet" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm}>
              Instructor
            </button>
            {showForm && (
              <form onSubmit={unlock}>
                <label className="visually-hidden" htmlFor="passcode">
                  Instructor passcode
                </label>
                <input id="passcode" name="passcode" type="password" className="field" placeholder="Instructor passcode" autoComplete="off" />
                <button type="submit" className="btn btn--sm">
                  Unlock solutions
                </button>
                {msg && (
                  <span role="alert" style={{ color: "var(--red)" }}>
                    {msg}
                  </span>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
