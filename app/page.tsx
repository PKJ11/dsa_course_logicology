import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlatformBar } from "./dsa/_components/Frame";
import { STATIONS, TOTAL_LESSONS } from "./dsa/_data/syllabus";
import "./dsa/dsa.css";

// Stand-in for the kartikvyas.in home page. Only the DSA card is part of this build; the grey cards mark
// where the platform's existing institution cards sit.

export default function PlatformHome() {
  return (
    <div className="dsa" style={{ background: "#fafafa" }}>
      <PlatformBar current="home" />
      <main className="wrap" style={{ padding: "40px var(--gutter) 80px" }}>
        <h1 style={{ fontFamily: "system-ui, sans-serif", fontWeight: 650, fontSize: 28, margin: "0 0 6px", fontVariationSettings: "normal" }}>
          Courses and institutions
        </h1>
        <p style={{ fontFamily: "system-ui, sans-serif", color: "#555", margin: "0 0 28px", fontSize: 15 }}>
          Stand-in for the platform home page. Only the DSA card belongs to this build.
        </p>
        <div className="home-grid">
          <Link href="/dsa/" className="dsa-card">
            <span className="dsa-card__board">
              <span className="plate plate--md">DSA</span>
              <span className="dsa-card__title">Data Structures and Algorithms</span>
            </span>
            <span className="dsa-card__body">
              <span className="dsa-card__line" aria-hidden="true">
                {STATIONS.slice(0, 7).map((s) => (
                  <i key={s.code} className={s.open ? "is-open" : undefined} />
                ))}
              </span>
              <span className="dsa-card__meta num">
                Self-paced · {STATIONS.length} stations · {TOTAL_LESSONS} lessons
              </span>
              <span className="dsa-card__cta">
                Open the line <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" />
              </span>
            </span>
          </Link>
          {["Institution card", "Institution card"].map((t, k) => (
            <div key={k} className="ghost-card" aria-hidden="true">
              {t}
              <small>existing platform card</small>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
