import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ZFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        The Z-algorithm answers a different question from KMP&rsquo;s table, in the same <M>O(n)</M> time: at each place of a string, how long a
        start of the whole string begins there? It is often easier to remember and to get right, and it reuses its own earlier answers in a way
        that is easy to see.
      </p>

      <h2 id="z">The Z-array</h2>
      <p>
        For a string s with <M>n</M> letters, <M>Z[i]</M> is the length of the longest piece starting at place <M>i</M> that is also a start of
        s. In other words, the longest common prefix of s and <code>s[i:]</code>. A <strong>common prefix</strong> of two strings is a start
        they share.
      </p>
      <CodeBlock
        code={`s   a  a  b  a  a  b  a  a
Z   –  1  0  5  1  0  2  1
# Z[3] = 5: s[3:] = "aabaa" begins with "aabaa", the first 5 letters of s
# Z[2] = 0: s[2] = "b" but s[0] = "a"`}
      />
      <p>
        <M>Z[0]</M> would be <M>n</M>, the whole string; it is usually left out or set to 0. Working out each <M>Z[i]</M> on its own, letter by
        letter, costs <M>O(n²)</M> on a string like <code>&quot;aaaa…&quot;</code>, where every answer is long.
      </p>

      <h2 id="box">The box</h2>
      <p>
        The method keeps the <strong>box</strong> <M>[l, r)</M>: of all the matches found so far (pieces <M>s[i..i + Z[i])</M>), the one that
        reaches furthest right. The box is a copy of the start of s: <M>s[l..r) = s[0..r − l)</M>.
      </p>
      <p>
        Now take a place <M>i</M> inside the box, <M>l &lt; i &lt; r</M>. Because the box is a copy, the letters from <M>i</M> to <M>r</M> are
        the same as the letters from <M>i − l</M> to <M>r − l</M>, and <M>Z[i − l]</M> is already known.
      </p>
      <Invariant label="Box rule">
        If i is inside the box <span className="nowrap">[l, r)</span>, then <span className="nowrap">Z[i] ≥ min(r − i, Z[i − l])</span>, and if{" "}
        <span className="nowrap">Z[i − l] &lt; r − i</span>, then <span className="nowrap">Z[i] = Z[i − l]</span> exactly.
      </Invariant>
      <ul>
        <li>
          <strong>If <M>Z[i − l] &lt; r − i</M>:</strong> the match at <M>i − l</M> stops inside the copy, at a letter that differs from the
          start of s. The same letter appears at the same spot after <M>i</M>, so the match at <M>i</M> stops there too. No comparisons are
          needed.
        </li>
        <li>
          <strong>Otherwise:</strong> the first <M>r − i</M> letters are known to match, but nothing is known past <M>r</M>. Compare from there
          on, letter by letter.
        </li>
      </ul>
      <p>For a place outside the box, compare from the start. Whenever a match reaches past <M>r</M>, it becomes the new box.</p>
      <CodeBlock
        code={`# one place i, with the box [l, r) from the places before it
if i < r:
    z[i] = min(r - i, z[i - l])     # the box rule
while i + z[i] < n and s[z[i]] == s[i + z[i]]:
    z[i] += 1                       # compare on, letter by letter
if i + z[i] > r:                    # this match reaches further right
    l, r = i, i + z[i]`}
      />
      <p>
        The code does not check the case <M>Z[i − l] &lt; r − i</M> on its own: there, the first comparison of the <code>while</code> loop fails
        at once. Step through the figure. Places 4 and 5 copy their answers from places 1 and 2 with no comparisons; places 6 and 7 start from
        what the box gives and find nothing left to compare.
      </p>
      <ZFigure />

      <h2 id="linear">Why it is O(n)</h2>
      <p>
        Count the comparisons in the <code>while</code> loop. Each one either fails, which happens at most once per place (<M>n</M> in all), or
        succeeds. A comparison that succeeds looks at the letter <M>s[i + Z[i]]</M>, which is at or past <M>r</M>: everything before{" "}
        <M>r</M> is covered by the box rule. So each success pushes the right end of the match past the old <M>r</M>, and then <M>r</M> moves
        there. <M>r</M> never moves left and never goes past <M>n</M>, so there are at most <M>n</M> successes. In all, at most <M>2n</M>{" "}
        comparisons: <M>O(n)</M> time.
      </p>

      <h2 id="match">Matching with a separator</h2>
      <p>
        To find a pattern P (length <M>m</M>) in a text T, build the Z-array of <code>P + &quot;$&quot; + T</code>, where <code>$</code> is a
        letter that occurs in neither. No match can run across the <code>$</code>, so no value is more than <M>m</M>. P occurs at place{" "}
        <M>i</M> of T exactly when the value at place <M>m + 1 + i</M> of the joined string is <M>m</M>.
      </p>
      <p>
        The same values tell you more than KMP&rsquo;s places: <M>z[m + 1 + i]</M> is how much of the start of P begins at place <M>i</M> of T,
        even where P does not fully occur. STRG-P3 asks for those values, so it needs the whole method: the loop over every place i with the
        step above, starting from <M>l = r = 0</M>.
      </p>
      <Note title="Without the joined string">
        <p>
          You can also keep the Z-array of P alone and run the box rule over T, comparing T&rsquo;s letters with P&rsquo;s. That saves the copy
          of T, which matters when T is very large.
        </p>
      </Note>

      <h2 id="compare">Z or π?</h2>
      <ul>
        <li>
          Both cost <M>O(n + m)</M> and use the same amortised count: a pointer that only moves one way.
        </li>
        <li>
          Each can be built from the other in <M>O(n)</M>. For example, a match at place <M>i</M> of length <M>Z[i]</M> means that the start of s
          of that length ends at place <M>i + Z[i] − 1</M>, so <M>π[i + Z[i] − 1] ≥ Z[i]</M>.
        </li>
        <li>
          π suits text that arrives one letter at a time (a stream); Z needs the whole string first.
        </li>
        <li>
          Z is handy for questions about starts: the shortest period is the smallest <M>i</M> with <M>i + Z[i] = n</M>; and the number of
          different pieces of a string can be counted by adding letters one at a time and taking the Z-array of the reversed string each time
          (<M>O(n²)</M> in all, fine for a few thousand letters).
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/strg/practice/3/">STRG-P3, How much of the pattern fits</Link>.
      </p>
    </>
  );
}
