import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ManacherFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        <Link href="/dsa/arrs/6/">ARRS-6</Link> checked whether one string is a palindrome with two pointers. Finding <em>every</em> palindrome
        inside a string looks like <M>O(n²)</M> work, because there can be that many. Manacher&rsquo;s method (1975) finds them all, described by
        one number per centre, in <M>O(n)</M>, using the fact that a palindrome is its own mirror image.
      </p>

      <h2 id="centres">Palindromes around a centre</h2>
      <p>
        Every palindrome has a <strong>centre</strong>. A palindrome of odd length, like <code>&quot;aba&quot;</code>, is centred on a letter.
        One of even length, like <code>&quot;abba&quot;</code>, is centred on the gap between two letters. If a palindrome is centred at some
        point, removing its first and last letters leaves a shorter palindrome with the same centre. So the palindromes around one centre are
        nested, and one number describes them all:
      </p>
      <ul>
        <li>
          <M>d₁[i]</M>: how many odd-length palindromes are centred on letter <M>i</M>. The longest is <M>s[i − d₁[i] + 1 .. i + d₁[i] − 1]</M>,
          with <M>2·d₁[i] − 1</M> letters.
        </li>
        <li>
          <M>d₂[i]</M>: how many even-length palindromes are centred on the gap just before letter <M>i</M>. The longest is{" "}
          <M>s[i − d₂[i] .. i + d₂[i] − 1]</M>, with <M>2·d₂[i]</M> letters.
        </li>
      </ul>
      <p>
        The simple way grows each palindrome from its centre, one pair of letters at a time, until the pair differs or the string ends. There
        are <M>2n − 1</M> centres. On ordinary text each one stops quickly, but on <code>&quot;aaaa…&quot;</code> the centre in the middle grows{" "}
        <M>n/2</M> times, and the total is about <M>n²/4</M> comparisons: 2.5 billion for 100,000 letters.
      </p>

      <h2 id="mirror">The mirror rule</h2>
      <p>
        Manacher&rsquo;s method goes through the centres from left to right and keeps the <strong>box</strong> <M>[l, r]</M>: of the palindromes
        found so far, the one whose right end <M>r</M> is furthest right.
      </p>
      <p>
        Take a centre <M>i</M> inside the box. The box is a palindrome, so reading it from the right gives the same letters as reading from the
        left: the letter at <M>l + t</M> equals the letter at <M>r − t</M>. Centre <M>i</M> has a mirror centre <M>j = l + r − i</M> on the
        other side of the box&rsquo;s middle, and <M>d₁[j]</M> is already known. Every palindrome around <M>j</M> that lies inside the box has
        a mirror image around <M>i</M>, of the same length.
      </p>
      <Invariant label="Mirror rule">
        If i is inside the box <span className="nowrap">[l, r]</span> and <span className="nowrap">j = l + r − i</span>, then <span className="nowrap">d₁[i] ≥ min(d₁[j], r − i + 1)</span>, with equality when
        j&rsquo;s palindrome ends before the box does.
      </Invariant>
      <ul>
        <li>
          <strong>j&rsquo;s longest palindrome ends inside the box</strong> (<M>d₁[j] &lt; r − i + 1</M>): just outside it on both sides are two
          letters that differ, and both are inside the box. Their mirror images are the two letters just outside the palindrome around <M>i</M>,
          so they differ too. Then <M>d₁[i] = d₁[j]</M>, with no comparisons.
        </li>
        <li>
          <strong>Otherwise:</strong> the mirror gives the palindrome around <M>i</M> up to the box&rsquo;s right end, <M>d₁[i] ≥ r − i + 1</M>,
          but nothing is known past <M>r</M>. Compare from there.
        </li>
      </ul>
      <p>For a centre outside the box, grow from the centre as the simple way does. When a palindrome reaches past <M>r</M>, it becomes the box.</p>
      <CodeBlock
        code={`# one centre i, with the box [l, r] from the centres before it
k = 1 if i > r else min(d1[l + r - i], r - i + 1)   # the mirror rule
while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:
    k += 1                          # grow past what the box gives
d1[i] = k
if i + k - 1 > r:                   # reaches further right
    l, r = i - k + 1, i + k - 1`}
      />
      <p>
        Step through the figure. In <code>&quot;abacabad&quot;</code>, the palindrome <code>&quot;abacaba&quot;</code> around place 3 becomes
        the box, and places 4, 5 and 6 read their answers from places 2, 1 and 0.
      </p>
      <ManacherFigure />

      <h2 id="linear">Why it is O(n)</h2>
      <p>
        The same count as for the Z-algorithm (lesson 3). A comparison inside the <code>while</code> loop either fails, at most once per centre,
        or succeeds. A successful comparison at centre <M>i</M> looks at the letter <M>i + k</M>, which is past <M>r</M>: the mirror rule already
        covered everything up to <M>r</M>. After the loop, <M>r</M> moves at least that far. <M>r</M> never moves left and stays below <M>n</M>,
        so there are at most <M>n</M> successful comparisons in all, and the method costs <M>O(n)</M> time and <M>O(n)</M> memory.
      </p>

      <h2 id="even">Even lengths, and one array for both</h2>
      <p>
        Even lengths work the same way, centred on the gap before each place i.
      </p>
      <p>
        Three things change: k starts at 0 outside the box, the mirror of the gap before i is the gap before{" "}
        <code>l + r - i + 1</code>, and the letters compared are <code>s[i - k - 1]</code> and <code>s[i + k]</code>. A palindrome then reaches
        from <code>i - k</code> to <code>i + k - 1</code>, which is the new box when it goes past r. STRG-P6 needs both kinds, and the two sums
        below.
      </p>
      <p>
        A common shortcut avoids the second function. Put a character that is not in s between every two letters and at both ends:{" "}
        <code>&quot;abba&quot;</code> becomes <code>&quot;#a#b#b#a#&quot;</code>. Now every palindrome of s, odd or even, is an odd palindrome
        of the new string centred on a letter or on a <code>#</code>, and one run of the odd-length method finds them all. In the new string,{" "}
        <M>d₁[i] − 1</M> is the length of the longest palindrome of s with that centre.
      </p>

      <h2 id="uses">What the radii give you</h2>
      <ul>
        <li>
          <strong>The longest palindrome:</strong> the largest <M>2·d₁[i] − 1</M> or <M>2·d₂[i]</M>, read off in one pass.
        </li>
        <li>
          <strong>How many palindromes, counted by position:</strong> <M>sum(d₁) + sum(d₂)</M>. In <code>&quot;aaa&quot;</code> that is{" "}
          <M>(1 + 2 + 1) + (0 + 1 + 1) = 6</M>: three of length 1, two of length 2, one of length 3. The count can be close to <M>n²/2</M>,
          but it is found in <M>O(n)</M>.
        </li>
        <li>
          <strong>Is <M>s[a..b]</M> a palindrome?</strong> Look at its centre: it is one exactly when the palindrome around that centre reaches{" "}
          <M>a</M>. Each question then costs <M>O(1)</M>.
        </li>
        <li>
          <strong>The shortest palindrome made by adding letters to the front:</strong> find the longest palindrome that starts at place 0. Either
          Manacher&rsquo;s array or KMP&rsquo;s table of <code>s + &quot;#&quot; + s[::-1]</code> gives it.
        </li>
      </ul>
      <Note title="Other ways to the same answers">
        <p>
          A DP table <code>pal[a][b]</code> (DYNP) answers every &ldquo;is this piece a palindrome?&rdquo; question in <M>O(n²)</M> time and
          memory. Hashing the string and its reverse (lesson 4) checks one piece in <M>O(1)</M> and finds the longest palindrome by binary
          search in <M>O(n log n)</M>, with a small chance of error. To count the <em>different</em> palindromes, the palindromic tree
          (eertree, 2015) adds one node per new palindrome; a string of <M>n</M> letters has at most <M>n</M> different non-empty ones.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/strg/practice/6/">STRG-P6, Palindromes in a string</Link>.
      </p>
    </>
  );
}
