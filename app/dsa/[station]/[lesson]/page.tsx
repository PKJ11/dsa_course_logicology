import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs, PlatformBar } from "../../_components/Frame";
import { StationBoard } from "../../_components/Board";
import { Body, ContentsRail, LessonClose, RouteStrip } from "../../_components/LessonShell";
import { neighbours, stationByCode } from "../../_data/syllabus";
import { META } from "../../_content/registry";
import { BODIES } from "../../_content/bodies";

const CONTENT = Object.fromEntries(Object.entries(META).map(([code, m]) => [code, { ...m, bodies: BODIES[code] }]));

export function generateStaticParams() {
  return Object.entries(CONTENT).flatMap(([code, c]) => c.lessons.map((l) => ({ station: code.toLowerCase(), lesson: String(l.n) })));
}

type Params = { station: string; lesson: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { station, lesson } = await params;
  const code = station.toUpperCase();
  const l = CONTENT[code]?.lessons.find((x) => String(x.n) === lesson);
  return { title: l ? `${code}-${l.n} ${l.title}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { station, lesson } = await params;
  const code = station.toUpperCase();
  const s = stationByCode(code);
  const c = CONTENT[code];
  const meta = c?.lessons.find((x) => String(x.n) === lesson);
  if (!s || !c || !meta) notFound();
  const Lesson = c.bodies[meta.n];
  const { prev, next } = neighbours(code);
  const nextLesson = c.lessons.find((x) => x.n === meta.n + 1);
  const practice = meta.practice ? c.problems.find((p) => p.n === meta.practice) : undefined;
  const route = c.lessons.map((l) => ({ n: l.n, title: l.title, figures: l.figures }));

  return (
    <>
      <PlatformBar />
      <Crumbs
        items={[
          { label: "kartikvyas.in", href: "/" },
          { label: "DSA", href: "/dsa/" },
          { label: `${s.code} ${s.name}`, href: `/dsa/#${s.code}` },
          { label: `${s.code}-${meta.n}` },
        ]}
      />
      <StationBoard
        plate={`${s.code}-${meta.n}`}
        title={meta.boardTitle ?? meta.title}
        sub={[s.name, `Lesson ${meta.n} of ${c.lessons.length}`, `${meta.minutes} min`]}
      />
      <RouteStrip station={s.code} lessons={route} current={meta.n} prev={prev} next={next} />
      <main className="wrap lesson" id="main">
        <ContentsRail sections={meta.sections} />
        <Body>
          <Lesson />
          <LessonClose
            station={s.code}
            lesson={{ n: meta.n, title: meta.title, figures: meta.figures }}
            figures={meta.figures}
            practice={practice}
            next={nextLesson ? { n: nextLesson.n, title: nextLesson.title, figures: nextLesson.figures } : undefined}
            nextStation={next}
          />
        </Body>
      </main>
    </>
  );
}
