import { Children, type ReactNode } from "react";

// Pieces of a formula or a readout that must not break across lines on a phone: an indexed term such as d[i][j]
// or opt[i + 1][j], a short bracketed group such as (V + E) or [2, 3, 6], and a short item between " · " marks.
// Everything else can still break, so a long line wraps instead of pushing the page sideways.
// Kept on one line: indexed terms (d[i][j]), short calls and groups ((1, 2)), and arrows with their two ends (0 → 1).
const GLUE = /([^\s([]*(?:\[[^\]]{1,20}\])+|[A-Za-z]*\([^()]{0,26}\)|\[[^\]]{0,26}\]|[^\s,:;]{1,8} [→←↔] [^\s,:;]{1,8})/;

function glue(text: string, key: string): ReactNode[] {
  return text.split(GLUE).map((p, k) =>
    k % 2 && p ? (
      <span key={`${key}-${k}`} className="nowrap">
        {p}
      </span>
    ) : (
      p
    ),
  );
}

export function keepTogether(text: string): ReactNode[] {
  return text.split(/( · )/).flatMap((item, k): ReactNode[] =>
    k % 2 ? [item] : item.length <= 24 ? [<span key={`i${k}`} className="nowrap">{item}</span>] : glue(item, `g${k}`),
  );
}

/** Children with every plain string glued (terms and groups only). Not keepTogether: a short string between two
 *  `nowrap` spans would become one more unbreakable piece, and the whole band would turn into a single line. */
function together(children: ReactNode): ReactNode {
  return Children.map(children, (c) => (typeof c === "string" ? glue(c, "t") : c));
}

export function Invariant({ children, label = "Invariant" }: { children: ReactNode; label?: string }) {
  return (
    <aside className="invariant" aria-label={label}>
      <span className="plate plate--sm" aria-hidden="true">
        {label.toUpperCase()}
      </span>
      <p className="invariant__text">{together(children)}</p>
    </aside>
  );
}

export function Note({ title, children, warn }: { title: string; children: ReactNode; warn?: boolean }) {
  return (
    <aside className={`note${warn ? " note--warn" : ""}`}>
      <p className="note__title">{title}</p>
      {children}
    </aside>
  );
}

export function M({ children }: { children: ReactNode }) {
  return <span className="math">{together(children)}</span>;
}
