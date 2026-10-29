// A small Python highlighter for lesson code. It runs at build time, so lessons ship as plain HTML.

import { CodeHint } from "./CodeHint";

const KW = new Set("and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield".split(" "));
const BI = new Set("len range print min max sum abs int float str list dict set tuple sorted enumerate zip any all bisect bisect_left bisect_right insort math isqrt sqrt".split(" "));

type Tok = { t: string; c?: string };

// comment | double- or single-quoted string | number | name | space | anything else
const TOKEN = String.raw`(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d[\d_]*(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)`;

export function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  const re = new RegExp(TOKEN, "g");
  let m: RegExpExecArray | null;
  let prev = "";
  while ((m = re.exec(line))) {
    const [s, com, str, num, id] = m;
    if (com) out.push({ t: s, c: "tk-com" });
    else if (str) out.push({ t: s, c: "tk-str" });
    else if (num) out.push({ t: s, c: "tk-num" });
    else if (id) {
      if (KW.has(id)) out.push({ t: s, c: "tk-kw" });
      else if (prev === "def" || prev === "class") out.push({ t: s, c: "tk-fn" });
      else if (BI.has(id)) out.push({ t: s, c: "tk-bi" });
      else out.push({ t: s });
      prev = id;
      continue;
    } else out.push({ t: s });
    if (!/^\s+$/.test(s)) prev = "";
  }
  return out;
}

export function CodeBlock({ code, title, mark = [] }: { code: string; title?: string; mark?: number[] }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className="code wide">
      {title && (
        <figcaption className="code__head">
          <span>{title}</span>
          <span>Python</span>
        </figcaption>
      )}
      <pre>
        <code>
          {lines.map((l, i) => (
            <span key={i} className={`ln${mark.includes(i + 1) ? " is-mark" : ""}`}>
              {tokenize(l).map((tk, j) =>
                tk.c ? (
                  <span key={j} className={tk.c}>
                    {tk.t}
                  </span>
                ) : (
                  tk.t
                ),
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      <CodeHint />
    </figure>
  );
}
