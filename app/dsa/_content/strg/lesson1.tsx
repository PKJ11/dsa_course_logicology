import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { NaiveFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Finding a word inside a longer text is one of the oldest jobs a computer does: a search box, a virus scanner, a DNA lab. This lesson
        starts with the simplest method, counts what it costs, and points at the information it throws away. The next three lessons use that
        information.
      </p>

      <h2 id="words">Text, pattern and places</h2>
      <p>
        The <strong>text</strong> T is the long string we search in, with <M>n</M> letters. The <strong>pattern</strong> P is the string we
        look for, with <M>m</M> letters, and <M>m ≤ n</M>. P <strong>occurs at place</strong> <M>i</M> when{" "}
        <code>T[i:i+m] == P</code>: the <M>m</M> letters of T starting at place <M>i</M> are exactly P. In the figures, the row T is the text and
        the row P is the pattern.
      </p>
      <p>
        There are <M>n − m + 1</M> places where P could start: 0, 1, …, <M>n − m</M>. At a later place P would stick out past the end of T.
        Occurrences can overlap: in <code>&quot;aaaa&quot;</code>, the pattern <code>&quot;aa&quot;</code> occurs at places 0, 1 and 2.
      </p>
      <p>
        <Link href="/dsa/arrs/6/">ARRS-6</Link> met this search as <code>p in t</code> and <code>t.find(p)</code>. This station looks at how
        such a search works inside, and at methods whose cost is guaranteed.
      </p>

      <h2 id="naive">Try every place</h2>
      <p>
        The <strong>naive method</strong> tries every place in turn. At each place it compares P with T letter by letter from the left, and stops
        at the first pair that differs. If all <M>m</M> pairs are equal, it reports the place.
      </p>
      <CodeBlock
        code={`def find_all(t, p):
    n, m = len(t), len(p)
    found = []
    for i in range(n - m + 1):        # every place P could start
        j = 0
        while j < m and t[i + j] == p[j]:
            j += 1
        if j == m:                    # all m letters matched
            found.append(i)
    return found`}
      />
      <p>
        Two details are easy to get wrong. The loop runs to <code>n - m + 1</code>, so the last place, <M>n − m</M>, is tried. And after a match
        P moves on by one place, not by <M>m</M>, so overlapping occurrences are found. Step through both variants of the figure.
      </p>
      <NaiveFigure />

      <h2 id="cost">What it costs</h2>
      <p>
        Each place costs at most <M>m</M> comparisons, so the whole search costs at most <M>(n − m + 1) · m</M>, which is <M>O(n · m)</M>. The
        figure&rsquo;s second variant reaches this bound: in <code>&quot;aaaaaaaa&quot;</code> every place matches <code>&quot;aaa&quot;</code>{" "}
        and fails on the last letter. With a text of a million letters and a pattern of a thousand, that is about a billion comparisons.
      </p>
      <p>
        On ordinary text the naive method is much better than its bound. If the letters were random, picked from an alphabet of <M>σ</M> letters
        (σ is the Greek letter sigma), the first comparison at a place fails with chance <M>1 − 1/σ</M>, the second is reached with chance{" "}
        <M>1/σ</M>, the third with chance <M>1/σ²</M> (σ² is σ times σ), and so on. The expected comparisons per place are{" "}
        <M>1 + 1/σ + 1/σ² + … &lt; σ/(σ − 1)</M>, which is less than 2 for every alphabet of two or more letters. So on random text the
        naive search costs <M>O(n)</M>. The trouble is text that is not random: long runs of one letter, repeated blocks in DNA, or input chosen by
        someone who wants your program to be slow.
      </p>

      <h2 id="waste">What the naive method forgets</h2>
      <p>
        Look at place 0 of the worst case. The method compared <code>T[0..2]</code> with <code>&quot;aaa&quot;</code> and they matched. Then it
        moved to place 1 and compared <code>T[1]</code> and <code>T[2]</code> again, though it already knew both were <code>&quot;a&quot;</code>.
      </p>
      <Invariant label="Key idea">After j letters of P have matched at place i, we know T[i..i+j−1] exactly: it is P[0..j−1].</Invariant>
      <p>
        That knowledge comes from the pattern alone, so it can be worked out before the search starts. If the text never has to be read twice,
        the search costs <M>O(n + m)</M>. There are two classic ways to use this:
      </p>
      <ul>
        <li>
          <strong>KMP</strong> (lesson 2) works out, for every j, how far P can slide after a mismatch without missing an occurrence.
        </li>
        <li>
          <strong>The Z-algorithm</strong> (lesson 3) works out, for every place, how long a start of P begins there.
        </li>
      </ul>
      <p>
        A third way, the <strong>rolling hash</strong> (lesson 4), avoids comparing letters at most places at all.
      </p>
      <Note title="Comparing from the right">
        <p>
          The Boyer–Moore method compares P with T from P&rsquo;s <em>last</em> letter. If the text letter there does not occur in P at all, P can
          jump forward by <M>m</M> places at once. On ordinary text with long patterns it often reads only about <M>n/m</M> letters of T, fewer
          than any left-to-right method. Its simpler form, Boyer–Moore–Horspool, keeps only this &ldquo;bad letter&rdquo; jump. Tools such as{" "}
          <code>grep</code> use ideas from it.
        </p>
      </Note>

      <h2 id="python">Python&rsquo;s own tools</h2>
      <CodeBlock
        code={`t = "abcabcab"
"cab" in t              # True
t.find("cab")           # 2: the first place, or -1
t.find("cab", 3)        # 5: the first place from 3 on
t.index("xyz")          # ValueError instead of -1
t.count("aa")           # counts without overlap: "aaaa".count("aa") is 2

import re
[m.start() for m in re.finditer("(?=aa)", "aaaa")]   # [0, 1, 2]`}
      />
      <ul>
        <li>
          <code>in</code>, <code>find</code>, <code>index</code> and <code>count</code> run in C, so they are much faster than a Python loop.
          CPython mixes methods: for short patterns a fast form of Boyer–Moore–Horspool, and since Python 3.10, for long patterns, the{" "}
          <em>two-way</em> method of Crochemore and Perrin, which is <M>O(n + m)</M> in the worst case.
        </li>
        <li>
          <code>count</code> does not count overlapping occurrences. To find every place, call <code>find</code> again from one place after the
          last hit, or use <code>re.finditer</code> with a <em>lookahead</em>, <code>(?=…)</code>, which matches without using up any letters.
        </li>
        <li>
          In a regular expression, <code>.</code> matches any one character. So <code>re.finditer(&quot;(?=c.b)&quot;, t)</code> finds
          &ldquo;c, any letter, b&rdquo; at every place. Regular expressions can also be very slow on some patterns, because Python&rsquo;s{" "}
          <code>re</code> tries the choices one after another.
        </li>
      </ul>
      <p>
        One call of <code>find</code> is fast. A <em>loop</em> of calls can still be slow: if P occurs at almost every place of T, each call
        checks all <M>m</M> letters again. Lesson 2&rsquo;s practice problem has exactly such a test.
      </p>
      <p>
        Now try <Link href="/dsa/strg/practice/1/">STRG-P1, Patterns with blanks</Link>.
      </p>
    </>
  );
}
