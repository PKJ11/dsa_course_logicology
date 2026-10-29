import type { Metadata } from "next";
import { Crumbs, PlatformBar } from "./_components/Frame";
import { StationBoard } from "./_components/Board";
import { CourseMap } from "./_components/CourseMap";
import { LEGS, STATIONS, TOTAL_LESSONS } from "./_data/syllabus";

export const metadata: Metadata = { title: { absolute: "DSA · kartikvyas.in" } };

export default function LinePage() {
  return (
    <>
      <PlatformBar />
      <Crumbs items={[{ label: "kartikvyas.in", href: "/" }, { label: "DSA" }]} />
      <StationBoard
        plate="DSA"
        title="The line"
        sub={["Data Structures and Algorithms", `${STATIONS.length} stations`, `${LEGS.length} legs`, `${TOTAL_LESSONS} lessons`]}
      />
      <main id="main">
        <CourseMap />
      </main>
    </>
  );
}
