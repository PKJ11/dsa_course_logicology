import type { ReactNode } from "react";

export function StationBoard({
  plate,
  title,
  sub,
  aside,
  compact,
  headingLevel = 1,
}: {
  plate: string;
  title: string;
  sub?: ReactNode[];
  aside?: ReactNode;
  compact?: boolean;
  headingLevel?: 1 | 2;
}) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={`board${compact ? " board--compact" : ""}`}>
      <div className="wrap board__inner">
        <span className={`plate ${compact ? "plate--md" : "plate--lg"}`}>{plate}</span>
        <H className="board__title">{title}</H>
        {sub && sub.length > 0 && (
          <p className="board__sub">
            {sub.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </p>
        )}
        {aside && <div className="board__aside">{aside}</div>}
      </div>
    </div>
  );
}
