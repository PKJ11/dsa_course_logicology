import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { StrFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        Comparing two strings is one of the most used DPs: it finds what two files have in common, suggests spellings, and lines up DNA. The
        state is a pair of prefixes, one from each string, so the table has a row for each prefix of one string and a column for each prefix of
        the other.
      </p>

      <h2 id="prefixes">Two strings, one table</h2>
      <p>
        Let the strings be a, with n letters, and b, with m letters. The state <M>(i, j)</M> stands for the first i letters of a and the first j
        letters of b: <code>a[:i]</code> and <code>b[:j]</code>. Both i and j start at 0, the empty prefix, so the table has <M>(n + 1)</M> rows
        and <M>(m + 1)</M> columns. Row 0 and column 0 are the base cases: one of the two prefixes is empty.
      </p>
      <p>
        The rules below look at the <em>last</em> letters of the two prefixes, <code>a[i - 1]</code> and <code>b[j - 1]</code>, and read only the
        cell above, the cell to the left, and the cell above-left. So row by row, left to right, is a safe order.
      </p>

      <h2 id="lcs">Longest common subsequence</h2>
      <p>
        A <strong>common subsequence</strong> of a and b is a subsequence of both (lesson 6: letters kept in order, with skips). The longest
        common subsequence, or <strong>LCS</strong>, of ABCBDAB and BDCABA has length 4: for example BCBA. Let <code>L[i][j]</code> be the LCS
        length of <code>a[:i]</code> and <code>b[:j]</code>.
      </p>
      <ul>
        <li>
          <strong>The last letters are equal.</strong> Then <code>L[i][j] = L[i - 1][j - 1] + 1</code>. It is at least that, because the shared
          letter can be added to an LCS of the two shorter prefixes. It is not more, because removing the last letter of any common subsequence
          of <code>a[:i]</code> and <code>b[:j]</code> leaves a common subsequence of <code>a[:i - 1]</code> and <code>b[:j - 1]</code>: the
          letters left were matched to positions before the removed letter&rsquo;s positions.
        </li>
        <li>
          <strong>The last letters differ.</strong> A common subsequence cannot use both of them, since both would have to be its last letter.
          So it fits in <code>a[:i - 1]</code> and <code>b[:j]</code>, or in <code>a[:i]</code> and <code>b[:j - 1]</code>:{" "}
          <code>L[i][j]</code> is the larger of the cell above and the cell to the left.
        </li>
      </ul>
      <StrFigure />
      <CodeBlock
        title="lcs_length.py"
        code={`def lcs_length(a, b):
    prev = [0] * (len(b) + 1)          # row 0
    for x in a:
        cur = [0]                      # column 0
        for j, y in enumerate(b):
            if x == y:
                cur.append(prev[j] + 1)
            else:
                cur.append(max(prev[j + 1], cur[j]))
        prev = cur
    return prev[-1]`}
      />
      <Invariant label="Pairs">L[i][j] depends only on the last letters of the two prefixes and three smaller cells.</Invariant>

      <h2 id="edit">Edit distance</h2>
      <p>
        The <strong>edit distance</strong> (or Levenshtein distance) from a to b is the fewest edits that turn a into b, where an edit inserts a
        letter, deletes a letter, or replaces one letter with another. From kitten to sitting it is 3: replace k with s, replace e with i, insert
        g.
      </p>
      <p>
        Let <code>D[i][j]</code> be the edit distance from <code>a[:i]</code> to <code>b[:j]</code>. Row 0 is j (insert every letter), column 0
        is i (delete every letter). For the other cells, think about what a best list of edits does at the end of the two prefixes:
      </p>
      <ul>
        <li>
          if the last letters are equal, they can simply be kept: <code>D[i - 1][j - 1]</code>;
        </li>
        <li>
          otherwise the last edit is one of three, each costing 1: replace a&rsquo;s last letter with b&rsquo;s (above-left), delete a&rsquo;s last
          letter (above), or insert b&rsquo;s last letter (left). Take the cheapest.
        </li>
      </ul>
      <p>
        The second version of the figure fills the table from horse to ros. A diagonal arrow is a kept letter or a replacement, an up arrow a
        delete, a left arrow an insert. Writing this as code is DYNP-P7.
      </p>
      <Note title="Is keeping equal letters always safe?">
        <p>
          Yes. If a best list of edits did something else with two equal last letters, changing it to keep them never costs more. This is an
          exchange argument (GRDY-2). It is why the equal case needs no minimum over three cells.
        </p>
      </Note>

      <h2 id="cost">Time and space</h2>
      <p>
        Both tables have <M>(n + 1)(m + 1)</M> cells and each takes <M>O(1)</M> time: <M>O(n · m)</M>. Each row needs only the row above, so two
        rows give the length or the distance in <M>O(m)</M> space; making b the shorter string makes it <M>O(min(n, m))</M>.
      </p>
      <p>
        For two strings of 1,000 letters that is a million cells, under a second in Python. For two files of 100,000 lines it is 10 billion
        cells, which is too many. Tools that compare similar files use the fact that the answer is small: when the two are at most d edits
        apart, only cells within d of the diagonal matter, and the work drops to about <M>O((n + m) · d)</M>. Myers&rsquo; method, used by{" "}
        <code>git diff</code>, works this way.
      </p>

      <h2 id="uses">Where they are used</h2>
      <ul>
        <li>
          <strong>Comparing files.</strong> The lines kept in a diff are a longest common subsequence of the two files&rsquo; lines; the rest are
          shown as removed or added.
        </li>
        <li>
          <strong>Spelling.</strong> A spell checker suggests dictionary words within edit distance 1 or 2 of the typed word.
        </li>
        <li>
          <strong>DNA and proteins.</strong> Alignment uses the same table with scores: a reward for a match, a cost for a mismatch and for a gap
          (the Needleman–Wunsch method). Finding the best matching <em>part</em> of two long sequences is a small change to the rule (the
          Smith–Waterman method).
        </li>
      </ul>
      <Note title="Python's difflib">
        <p>
          <code>difflib.SequenceMatcher</code> does not compute an LCS. It looks for the longest block of matching items, then repeats on each
          side. Its output often looks more natural to people, but it is not always the shortest diff. Use it for display, not when you need the
          exact LCS length.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/7/">DYNP-P7, Edit distance</Link>.
      </p>
    </>
  );
}
