"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { LEGS, STATIONS, lessonHref, practiceHref, type Station } from "../_data/syllabus";
import { lessonState, useProgress, type LessonState, type Progress } from "../_lib/progress";
import { META } from "../_content/registry";

// Lesson tables for stations that are written.
const WRITTEN = META;

function Mark({ state, solved, seen }: { state?: LessonState; solved?: boolean; seen?: boolean }) {
  if (solved !== undefined)
    return (
      <span className={`mark ${solved ? "mark--solved" : seen ? "mark--part" : "mark--todo"}`}>
        <span className="mark__glyph" aria-hidden="true" />
        <span className="mark__label">{solved ? (seen ? "Solved, solution seen" : "Solved") : seen ? "Solution seen" : "Not solved"}</span>
      </span>
    );
  const label = state === "done" ? "Completed" : state === "part" ? "Started" : "Not started";
  return (
    <span className={`mark mark--${state}`}>
      <span className="mark__glyph" aria-hidden="true" />
      <span className="mark__label">{label}</span>
    </span>
  );
}

function stationStats(p: Progress, code: string) {
  const w = WRITTEN[code];
  if (!w) return null;
  const completed = w.lessons.filter((l) => lessonState(p, l.figures) === "done").length;
  const started = w.lessons.some((l) => lessonState(p, l.figures) !== "todo");
  const solved = w.problems.filter((q) => p.problems[`${code}-P${q.n}`]?.solved).length;
  const minutes = w.lessons.reduce((m, l) => m + l.minutes, 0);
  return { completed, started, solved, minutes, lessons: w.lessons.length, problems: w.problems.length };
}

export function CourseMap() {
  const p = useProgress();
  const stop = p.lastStop;
  const hereCode = stop ? stop.lesson.split("-")[0] : STATIONS.find((s) => s.open)?.code;
  const firstOpen = STATIONS.find((s) => s.open && !s.optional) ?? STATIONS.find((s) => s.open)!;
  const warmUp = STATIONS.find((s) => s.open && s.optional);
  const cardCode = hereCode && WRITTEN[hereCode] ? hereCode : firstOpen.code;
  const bs = stationStats(p, cardCode)!;
  const leg = Object.keys(WRITTEN)
    .map((c) => stationStats(p, c)!)
    .reduce((a, b) => ({ completed: a.completed + b.completed, lessons: a.lessons + b.lessons, solved: a.solved + b.solved, problems: a.problems + b.problems }), {
      completed: 0,
      lessons: 0,
      solved: 0,
      problems: 0,
    });

  return (
    <div className="wrap map">
      <aside className="map__aside" aria-label="Your journey">
        <section className="status-card" aria-labelledby="running-status">
          <h2 className="status-card__head" id="running-status" style={{ margin: 0 }}>
            Running status
          </h2>
          <div className="status-card__body">
            {stop ? (
              <>
                <p>
                  <span className="status-card__big">
                    {stop.lesson}, step {stop.step + 1}
                  </span>
                  is where you stopped, in figure {stop.fig}.
                </p>
                <Link className="btn btn--board" href={`${lessonHref(stop.lesson.split("-")[0], Number(stop.lesson.split("-")[1]))}#${stop.fig}:${stop.step + 1}`}>
                  Resume at {stop.lesson}
                  <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <p>
                  <span className="status-card__big">Nothing completed yet</span>
                  {firstOpen.code} is the first station on the line. Lessons are short, and every figure steps forward one move at a time.
                </p>
                <Link className="btn btn--board" href={lessonHref(firstOpen.code, 1)}>
                  Start at {firstOpen.code}-1
                  <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
                </Link>
                {warmUp && (
                  <p style={{ margin: "12px 0 0", fontSize: 14.5 }}>
                    New to Python?{" "}
                    <Link className="link" href={lessonHref(warmUp.code, 1)}>
                      Warm up at {warmUp.code}-1 first
                    </Link>
                    .
                  </p>
                )}
              </>
            )}
          </div>
        </section>
        <section className="status-card" aria-labelledby="your-progress">
          <h2 className="status-card__head" id="your-progress" style={{ margin: 0 }}>
            {cardCode} so far
          </h2>
          <div className="status-card__body">
            <p style={{ margin: "0 0 6px" }}>
              <b className="num">{bs.completed}</b> of {bs.lessons} lessons completed
            </p>
            <p style={{ margin: 0 }}>
              <b className="num">{bs.solved}</b> of {bs.problems} problems solved
            </p>
            <p style={{ margin: "12px 0 0", paddingTop: 10, borderTop: "1px solid var(--rule-soft)" }}>
              All open stations: <b className="num">{leg.completed}</b> of {leg.lessons} lessons, <b className="num">{leg.solved}</b> of {leg.problems}{" "}
              problems
            </p>
            <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "var(--ink-3)" }}>
              A lesson counts once every figure is stepped to its end; a problem, once all its tests pass. Saved in this browser only.
            </p>
          </div>
        </section>
        <ul className="legend" aria-label="Key">
          <li>
            <Mark state="done" /> every figure stepped to the end
          </li>
          <li>
            <Mark state="part" /> some steps taken
          </li>
          <li>
            <Mark state="todo" />
          </li>
        </ul>
      </aside>

      <div className="map__line">
        {LEGS.map((leg) => {
          const stations = STATIONS.filter((s) => s.leg === leg.id);
          const lessons = stations.reduce((n, s) => n + s.lessons.length, 0);
          return (
            <section key={leg.id} className={`leg${leg.live ? "" : " is-later"}`} aria-labelledby={`leg-${leg.id}`}>
              <div className="leg__head" id={`leg-${leg.id}-head`}>
                <span className="leg__letter" aria-hidden="true">
                  {leg.id}
                </span>
                <h2 className="leg__name" id={`leg-${leg.id}`}>
                  <span className="visually-hidden">Leg {leg.id}: </span>
                  {leg.name}
                </h2>
                {leg.live ? <span className="tag tag--live">Open</span> : <span className="tag">Coming soon</span>}
                <span className="leg__meta num">
                  {stations.length} stations · {lessons} lessons
                </span>
              </div>
              <ol className="stations">
                {stations.map((s) => (
                  <StationRow key={s.code} s={s} here={s.code === hereCode} p={p} />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StationRow({ s, here, p }: { s: Station; here: boolean; p: Progress }) {
  const w = WRITTEN[s.code];
  const stats = stationStats(p, s.code);
  // Only the station you are at starts with its timetable open; the rest open on request.
  const [open, setOpen] = useState(here);
  useEffect(() => {
    if (here) setOpen(true);
  }, [here]);
  const done = !!stats && stats.completed === stats.lessons && stats.solved === stats.problems;
  const cls = ["station", s.open ? "is-open" : "is-shut", here ? "is-here" : "", done ? "is-done" : ""].filter(Boolean).join(" ");
  const tableId = `tt-${s.code}`;

  return (
    <li className={cls} id={s.code}>
      <div className="station__rail" aria-hidden="true">
        <span className="station__node" />
      </div>
      <div className="station__main">
        <div className="station__line">
          <span className={`plate plate--md${s.open ? "" : " plate--muted"}`}>{s.code}</span>
          <h3 className="station__name">
            {s.open ? <Link href={lessonHref(s.code, 1)}>{s.name}</Link> : s.name}
            {s.optional && <small>optional warm-up</small>}
            {s.terminus && <small>last station</small>}
            {here && <small style={{ color: "var(--blue)", fontWeight: 700 }}>you are here</small>}
          </h3>
          <span className="station__meta num">
            {stats ? (
              `${stats.completed}/${stats.lessons} lessons · ${stats.solved}/${stats.problems} problems · ${stats.minutes} min`
            ) : (
              <button type="button" className="station__toggle" aria-expanded={open} aria-controls={tableId} onClick={() => setOpen((o) => !o)}>
                {s.lessons.length} lessons{LEGS.find((l) => l.id === s.leg)?.live ? " · opens soon" : ""}
                <ChevronDown size={15} strokeWidth={2.5} aria-hidden="true" />
              </button>
            )}
          </span>
        </div>
        {w && (
          <button type="button" className="station__toggle" aria-expanded={open} aria-controls={tableId} onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "Show"} timetable
            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
        {open && (
          <div className="lessons-tt" id={tableId}>
            <div className="tt-wrap">
              <table className="tt">
                <caption className="visually-hidden">
                  {s.code} {s.name}: lessons{w ? " and problems" : ""}
                </caption>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>{w ? "Lesson or problem" : "Lesson"}</th>
                    {w && <th className="r hide-sm">Min</th>}
                    {w && <th>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {w
                    ? (
                        <>
                          {w.lessons.map((l) => (
                            <tr key={l.n}>
                              <td>
                                <b>
                                  {s.code}-{l.n}
                                </b>
                              </td>
                              <td>
                                <Link href={lessonHref(s.code, l.n)}>{l.title}</Link>
                              </td>
                              <td className="r hide-sm">{l.minutes}</td>
                              <td>
                                <Mark state={lessonState(p, l.figures)} />
                              </td>
                            </tr>
                          ))}
                          {w.problems.map((q) => (
                            <tr key={`p${q.n}`}>
                              <td>
                                <b>
                                  {s.code}-P{q.n}
                                </b>
                              </td>
                              <td>
                                <Link href={practiceHref(s.code, q.n)}>{q.title}</Link>
                              </td>
                              <td className="r hide-sm">Practice</td>
                              <td>
                                <Mark solved={!!p.problems[`${s.code}-P${q.n}`]?.solved} seen={!!p.problems[`${s.code}-P${q.n}`]?.solutionOpen} />
                              </td>
                            </tr>
                          ))}
                        </>
                      )
                    : s.lessons.map((t, k) => (
                        <tr key={k}>
                          <td>
                            <b style={{ color: "var(--ink-3)" }}>
                              {s.code}-{k + 1}
                            </b>
                          </td>
                          <td style={{ color: "var(--ink-2)" }}>{t}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
