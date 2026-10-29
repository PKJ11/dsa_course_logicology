"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { lessonState, useProgress, figureDone } from "../_lib/progress";
import { lessonHref, practiceHref, stationHref, type Station } from "../_data/syllabus";

type L = { n: number; title: string; figures: string[] };

// A station name at the end of the route strip may wrap, but never inside a hyphenated term ("Big-O").
function endName(name: string) {
  return name.split(/(\S*-\S*)/).map((part, k) => (part.includes("-") ? <span key={k} className="nowrap">{part}</span> : part));
}

export function RouteStrip({
  station,
  lessons,
  current,
  prev,
  next,
}: {
  station: string;
  lessons: L[];
  current: number;
  prev?: Station;
  next?: Station;
}) {
  const p = useProgress();
  return (
    <nav className="route" aria-label={`${station} lessons`}>
      <div className="wrap route__inner">
        {prev ? (
          <Link className="route__end" href={stationHref(prev)}>
            <ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" />
            <span className="plate plate--sm">{prev.code}</span>
            <small>{endName(prev.name)}</small>
          </Link>
        ) : (
          <span />
        )}
        <ol className="route__stops">
          {lessons.map((l) => {
            const st = lessonState(p, l.figures);
            const here = l.n === current;
            return (
              <li key={l.n} className={`route__stop${here ? " is-here" : ""}${st === "done" ? " is-done" : ""}`}>
                <Link href={lessonHref(station, l.n)} aria-current={here ? "page" : undefined} title={l.title}>
                  <span className="route__dot" aria-hidden="true" />
                  <span className="route__label">
                    {station}-{l.n}
                    <span className="visually-hidden">
                      {" "}
                      {l.title}
                      {st === "done" ? ", completed" : st === "part" ? ", started" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        {next ? (
          <Link className="route__end route__end--next" href={stationHref(next)}>
            <small>{endName(next.name)}</small>
            <span className="plate plate--sm">{next.code}</span>
            <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}

export function PracticeStrip({
  station,
  stationName,
  problems,
  current,
}: {
  station: string;
  stationName: string;
  problems: { n: number; title: string }[];
  current: number;
}) {
  const p = useProgress();
  const next = problems.find((q) => q.n === current + 1);
  return (
    <nav className="route route--practice" aria-label={`${station} practice problems`}>
      <div className="wrap route__inner">
        <Link className="route__end" href={`/dsa/#${station}`}>
          <ChevronLeft size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="plate plate--sm">{station}</span>
          <small>Lessons</small>
        </Link>
        <ol className="route__stops">
          {problems.map((q) => {
            const here = q.n === current;
            const solved = !!p.problems[`${station}-P${q.n}`]?.solved;
            return (
              <li key={q.n} className={`route__stop${here ? " is-here" : ""}${solved ? " is-done" : ""}`}>
                <Link href={practiceHref(station, q.n)} aria-current={here ? "page" : undefined} title={q.title}>
                  <span className="route__dot" aria-hidden="true" />
                  <span className="route__label">
                    {station}-P{q.n}
                    <span className="visually-hidden">
                      {" "}
                      {q.title}
                      {solved ? ", solved" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="route__end route__end--next">
          {next ? (
            <Link className="btn btn--board btn--sm" href={practiceHref(station, next.n)}>
              Next problem
              <ChevronRight size={17} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          ) : (
            <Link className="btn btn--sm" href={`/dsa/#${station}`}>
              Back to the line
              <ChevronRight size={17} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export function ContentsRail({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    // Open beside the column on wide screens, folded above it on narrow ones.
    setOpen(window.matchMedia("(min-width: 1121px)").matches);
  }, []);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);
  const list = (
    <ul className="rail-list">
      {sections.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <aside className="lesson__rail">
      <nav aria-label="In this lesson">
        <details className="rail-details" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
          <summary>
            In this lesson <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <p className="rail-title">In this lesson</p>
          {list}
        </details>
      </nav>
    </aside>
  );
}

export function LessonClose({
  station,
  lesson,
  figures,
  practice,
  next,
  nextStation,
}: {
  station: string;
  lesson: L;
  figures: string[];
  practice?: { n: number; title: string };
  next?: L;
  nextStation?: Station;
}) {
  const p = useProgress();
  const done = figures.filter((f) => figureDone(p, f)).length;
  const all = done === figures.length;
  return (
    <section className="close wide" aria-label="Where next">
      <p className="close__status">
        <span className={`mark ${all ? "mark--done" : done ? "mark--part" : "mark--todo"}`}>
          <span className="mark__glyph" aria-hidden="true" />
          {all
            ? `${station}-${lesson.n} completed: you stepped through every figure to its last step.`
            : `${station}-${lesson.n} counts as completed once you step through ${figures.length === 1 ? "the figure" : `all ${figures.length} figures`} to the last step.`}
        </span>
      </p>
      <div className="close__grid">
        {practice && (
          <Link className="depart depart--board" href={practiceHref(station, practice.n)}>
            <span className="plate plate--md">
              {station}-P{practice.n}
            </span>
            <span className="depart__name">Practice: {practice.title}</span>
            <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        )}
        {next ? (
          <Link className="depart" href={lessonHref(station, next.n)}>
            <span className="plate plate--md">
              {station}-{next.n}
            </span>
            <span className="depart__name">
              <span className="visually-hidden">Next lesson: </span>
              {next.title}
            </span>
            <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        ) : nextStation ? (
          <Link className="depart" href={stationHref(nextStation)}>
            <span className="plate plate--md">{nextStation.code}</span>
            <span className="depart__name">
              <span className="visually-hidden">Next station: </span>
              {nextStation.name}
              {nextStation.open ? "" : " (opens later)"}
            </span>
            <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function Body({ children }: { children: ReactNode }) {
  // A timetable wider than the screen scrolls inside its own box; say so under it, as wide figures and code do.
  useEffect(() => {
    const wraps = [...document.querySelectorAll<HTMLElement>(".lesson__body .tt-wrap")];
    const hints = wraps.map((w) => {
      const p = document.createElement("p");
      p.className = "follow__hint table__hint";
      p.setAttribute("aria-hidden", "true");
      p.textContent = "Wider than the screen: swipe sideways to see the rest.";
      w.after(p);
      return p;
    });
    const check = () => wraps.forEach((w, k) => (hints[k].hidden = w.scrollWidth <= w.clientWidth + 1));
    check();
    const ro = new ResizeObserver(check);
    wraps.forEach((w) => ro.observe(w));
    return () => {
      ro.disconnect();
      hints.forEach((h) => h.remove());
    };
  }, []);
  return <article className="lesson__body">{children}</article>;
}
