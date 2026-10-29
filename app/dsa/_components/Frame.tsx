import Link from "next/link";

// Stand-in for the kartikvyas.in bar. When this section moves into the platform, the platform's
// own bar and breadcrumb replace these two components.

export function PlatformBar({ current = "dsa" }: { current?: "home" | "dsa" }) {
  return (
    <header className="kv-bar">
      <div className="wrap kv-bar__row">
        <Link href="/" className="kv-bar__mark">
          kartikvyas.in
        </Link>
        <nav className="kv-bar__nav" aria-label="Platform">
          <Link href="/" aria-current={current === "home" ? "page" : undefined}>
            Institutions
          </Link>
          <Link href="/dsa/" aria-current={current === "dsa" ? "page" : undefined}>
            DSA
          </Link>
        </nav>
      </div>
    </header>
  );
}

export type Crumb = { label: string; href?: string };

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="wrap">
      <ol className="kv-crumbs" style={{ listStyle: "none", margin: 0 }}>
        {items.map((c, i) => (
          <li key={i} style={{ display: "contents" }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
