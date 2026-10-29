import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, PlatformBar } from "../../../_components/Frame";
import { StationBoard } from "../../../_components/Board";
import { Practice } from "../../../_components/Practice";
import { PracticeStrip } from "../../../_components/LessonShell";
import { lessonHref, practiceHref, stationByCode } from "../../../_data/syllabus";
import { META } from "../../../_content/registry";
import { DEFS } from "../../../_content/defs";

const CONTENT = Object.fromEntries(Object.entries(DEFS).map(([code, problems]) => [code, { problems, lessons: META[code].lessons }]));

export function generateStaticParams() {
  return Object.entries(CONTENT).flatMap(([code, c]) => c.problems.map((p) => ({ station: code.toLowerCase(), problem: String(p.n) })));
}

type Params = { station: string; problem: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { station, problem } = await params;
  const code = station.toUpperCase();
  const p = CONTENT[code]?.problems.find((x) => String(x.n) === problem);
  return { title: p ? `${code}-P${p.n} ${p.title}` : "Practice" };
}

export default async function PracticePage({ params }: { params: Promise<Params> }) {
  const { station, problem } = await params;
  const code = station.toUpperCase();
  const s = stationByCode(code);
  const c = CONTENT[code];
  const p = c?.problems.find((x) => String(x.n) === problem);
  if (!s || !c || !p) notFound();
  const id = `${s.code}-P${p.n}`;
  const nextP = c.problems.find((x) => x.n === p.n + 1);
  const next = nextP
    ? { href: practiceHref(s.code, nextP.n), label: `Next: ${s.code}-P${nextP.n}` }
    : { href: `/dsa/#${s.code}`, label: "Back to the line" };

  const lessonLinks = (
    <>
      Builds on{" "}
      {p.lessons.map((n, k) => {
        const l = c.lessons.find((x) => x.n === n)!;
        return (
          <span key={n}>
            {k > 0 && " and "}
            <Link className="link" href={lessonHref(s.code, n)}>
              {s.code}-{n} {l.title}
            </Link>
          </span>
        );
      })}
      .
    </>
  );

  return (
    <>
      <PlatformBar />
      <Crumbs
        items={[
          { label: "kartikvyas.in", href: "/" },
          { label: "DSA", href: "/dsa/" },
          { label: `${s.code} ${s.name}`, href: `/dsa/#${s.code}` },
          { label: id },
        ]}
      />
      <StationBoard compact plate={id} title={p.title} sub={[`Practice ${p.n} of ${c.problems.length}`, s.name, `${p.tests.length} tests`]} />
      <PracticeStrip station={s.code} stationName={s.name} problems={c.problems.map((q) => ({ n: q.n, title: q.title }))} current={p.n} />
      <main id="main" className="practice-wrap">
        <Practice
          id={id}
          fn={p.fn}
          starter={p.starter}
          blocked={p.blocked}
          tests={p.tests}
          hints={p.hints}
          solution={p.n}
          statement={p.statement}
          next={next}
          lessonLinks={lessonLinks}
        />
      </main>
    </>
  );
}
