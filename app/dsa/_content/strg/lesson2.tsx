import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { KmpFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        KMP, named after Knuth, Morris and Pratt (1977), finds every place of a pattern in <M>O(n + m)</M> time and never reads a letter of the
        text twice. All it needs is one table about the pattern: for each start of the pattern, the length of its longest border.
      </p>

      <h2 id="borders">Borders</h2>
      <p>
        A <strong>border</strong> of a string is a piece that is both a start of it and an end of it, but not the whole string. The empty string
        (length 0) is a border of every string.
      </p>
      <ul>
        <li>
          <code>&quot;abacaba&quot;</code> has the borders <code>&quot;a&quot;</code> and <code>&quot;aba&quot;</code> (and the empty one).
        </li>
        <li>
          <code>&quot;aaaa&quot;</code> has <code>&quot;a&quot;</code>, <code>&quot;aa&quot;</code> and <code>&quot;aaa&quot;</code>: borders can
          overlap.
        </li>
        <li>
          <code>&quot;abc&quot;</code> has only the empty border.
        </li>
      </ul>
      <p>Why borders matter for searching: suppose P has matched j letters at some place, then the next letter differs.</p>
      <Invariant label="Slide rule">P can slide right to the next place where a border of the matched part lines up, and no place before it can hold P.</Invariant>
      <p>
        Here is why. The matched part of the text is exactly <M>P[0..j−1]</M>. If P occurred at a place <M>s</M> letters further right, with{" "}
        <M>0 &lt; s &lt; j</M>, then the last <M>j − s</M> letters of the matched part would equal the first <M>j − s</M> letters of P. That
        makes them a border of <M>P[0..j−1]</M> of length <M>j − s</M>. So the only places worth trying are those where a border lines up, and
        the longest border gives the smallest slide.
      </p>

      <h2 id="table">The border table π</h2>
      <p>
        For a pattern P with <M>m</M> letters, the <strong>border table</strong> (also called the prefix function or failure function) is{" "}
        <M>π[i]</M> = the length of the longest border of <M>P[0..i]</M>, the first <M>i + 1</M> letters (π is the Greek letter pi). For{" "}
        <code>&quot;abacabab&quot;</code>:
      </p>
      <CodeBlock
        code={`P   a  b  a  c  a  b  a  b
π   0  0  1  0  1  2  3  2
# π[6] = 3: "abacaba" starts and ends with "aba"
# π[7] = 2: "abacabab" starts and ends with "ab"`}
      />
      <p>Two facts about borders make the table enough for everything.</p>
      <ul>
        <li>
          <strong>A border of a border is a border.</strong> If b is a start and an end of s, and c is a start and an end of b, then c is a start
          and an end of s.
        </li>
        <li>
          <strong>Every shorter border is a border of the longest one.</strong> Two borders of s are both starts of s, so the shorter is a start
          of the longer; both are ends of s, so the shorter is also an end of the longer.
        </li>
      </ul>
      <p>
        So the borders of <M>P[0..i]</M>, from longest to shortest, have lengths <M>π[i]</M>, then <M>π[π[i] − 1]</M>, then the same step again,
        down to 0. The table lists every border, not only the longest.
      </p>

      <h2 id="build">Building π in O(m)</h2>
      <p>
        A border of <M>P[0..i]</M> of length <M>L &gt; 0</M> is a border of <M>P[0..i−1]</M> of length <M>L − 1</M>, followed by the letter{" "}
        <M>P[i]</M>, which must equal <M>P[L − 1]</M>. So try the borders of <M>P[0..i−1]</M> from the longest down, and take the first one that
        the letter <M>P[i]</M> can extend:
      </p>
      <CodeBlock
        code={`def border_table(p):
    m = len(p)
    pi = [0] * m
    k = 0                        # length of the border being grown
    for i in range(1, m):
        while k > 0 and p[i] != p[k]:
            k = pi[k - 1]        # the next shorter border
        if p[i] == p[k]:
            k += 1
        pi[i] = k
    return pi`}
      />
      <p>
        Step through the first variant. The copy of P under P shows the border being tried: its letter <M>k</M> sits under letter <M>i</M>.
      </p>
      <KmpFigure />
      <p>
        <strong>Cost.</strong> The inner <code>while</code> loop can run many times for one <M>i</M>, so the count needs care. <M>k</M> starts at
        0, grows by at most 1 for each <M>i</M>, and every turn of the <code>while</code> loop makes it smaller, but never below 0. So over the
        whole run the loop turns at most <M>m</M> times: it cannot take away more than was added. Together with one comparison per <M>i</M>, that
        is at most <M>2m</M> comparisons. This style of counting, where a cost is paid for by earlier cheap steps, is called an{" "}
        <em>amortised</em> count (BIGO-7).
      </p>

      <h2 id="search">Searching without stepping back</h2>
      <p>
        The search runs the same loop over the text. <code>j</code> is the number of letters of P matched so far. A mismatch slides P by the slide
        rule: <code>j = pi[j - 1]</code>. The place <code>i</code> in the text only moves forward.
      </p>
      <CodeBlock
        code={`# one letter ch = t[i] of the text, with j letters of P matched
while j > 0 and ch != p[j]:
    j = pi[j - 1]              # slide P; i stays
if ch == p[j]:
    j += 1                     # one more letter matched`}
      />
      <p>
        Step through the second variant. At the mismatch, five letters <code>&quot;ababa&quot;</code> had matched, and{" "}
        <M>π[4] = 3</M>: its last three letters <code>&quot;aba&quot;</code> are also P&rsquo;s first three. P slides right by 2 and those three
        letters stay matched, so nothing is compared twice.
      </p>
      <p>
        <strong>Why nothing is missed.</strong> By the slide rule, no place between the old and the new place of P can hold P. When{" "}
        <code>j</code> reaches m, P ends at place i, so it starts at <M>i − m + 1</M>; then <code>j = pi[m - 1]</code> applies the same rule,
        so overlapping occurrences are found too. Putting the table and this step together is STRG-P2.
      </p>
      <p>
        <strong>Cost.</strong> Each comparison either matches (and <code>i</code> moves right) or fails (and P slides right, or <code>i</code>{" "}
        moves right when <code>j</code> is 0). <code>i</code> moves at most <M>n</M> times, and the start of P, <code>i - j</code>, also only
        moves right, at most <M>n</M> times. So the search makes at most <M>2n</M> comparisons, and with the table, KMP costs <M>O(n + m)</M>{" "}
        time and <M>O(m)</M> extra memory. It reads the text once from left to right, so it also works on a text that arrives a piece at a time,
        such as a stream from the network.
      </p>
      <Note title="One table for both jobs">
        <p>
          Join the two strings with a letter that occurs in neither, <code>s = p + &quot;#&quot; + t</code>, and build the border table of{" "}
          <code>s</code>. No border can cross the <code>#</code>, so no entry is more than <M>m</M>, and P ends at a place of <code>t</code>{" "}
          exactly where the entry equals <M>m</M>. This is shorter to write, but it keeps a table of <M>n + m + 1</M> numbers instead of{" "}
          <M>m</M>.
        </p>
      </Note>

      <h2 id="uses">More from the table</h2>
      <ul>
        <li>
          <strong>The shortest period.</strong> The smallest <M>p &gt; 0</M> with <M>s[i] = s[i + p]</M> for every valid <M>i</M> is{" "}
          <M>m − π[m − 1]</M>. A string is a whole number of copies of a shorter block (like <code>&quot;abcabcabc&quot;</code>) exactly when this
          period is less than <M>m</M> and divides <M>m</M>.
        </li>
        <li>
          <strong>How often each start of P occurs in P.</strong> Every border chain from each <M>π[i]</M> adds one occurrence; adding them up
          for all <M>i</M> takes <M>O(m)</M>.
        </li>
        <li>
          <strong>An automaton.</strong> For a small alphabet, the table can be turned into a full &ldquo;next state&rdquo; table, so each text
          letter costs exactly one lookup.
        </li>
        <li>
          <strong>Many patterns at once.</strong> The Aho–Corasick method builds a trie of all the patterns (TRIE-1) and adds border links between
          its nodes, the same idea as π. It finds every place of every pattern in one pass over the text.
        </li>
      </ul>
      <p>
        In Python, KMP over a million letters takes about half a second, while <code>t.find(p)</code> runs in C and is far faster for one search.
        KMP wins when there are many overlapping occurrences, when the text is a stream, and when you need the table itself.
      </p>
      <p>
        Now try <Link href="/dsa/strg/practice/2/">STRG-P2, Every place, fast</Link>.
      </p>
    </>
  );
}
