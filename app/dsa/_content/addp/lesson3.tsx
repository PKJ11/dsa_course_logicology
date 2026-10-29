import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { JoinFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Some problems work on a row of things that are joined or cut in some order: piles merged with their neighbours, matrices multiplied
        two at a time, a rail cut at marked places. The natural state is a stretch of the row, from position i to position j, and the table
        is filled from short stretches to long ones.
      </p>

      <h2 id="stretch">States that are stretches</h2>
      <p>
        An <strong>interval</strong> (or stretch) is a run of neighbouring positions <M>i, i + 1, …, j</M> of the row. Interval DP keeps one
        answer per stretch, <code>best[i][j]</code>, in the upper half of a square table: row i, column j, with <M>i ≤ j</M>. A row of n
        things has <M>n(n + 1)/2</M> stretches.
      </p>
      <p>
        The rule always has the same shape. The last action on a stretch splits it in two at some place k, into i..k and k+1..j. Each side is
        a shorter stretch, solved separately, and the split itself has a cost. Try every k and keep the best:
      </p>
      <Invariant label="Rule">best[i][j] = the best over k of best[i][k] + best[k + 1][j] + cost of the last step on i..j</Invariant>
      <p>
        The idea that makes this work: think about the <em>last</em> step, not the first. The first join of a pile row can happen anywhere and
        leaves a messy row behind. The last join always puts together two neighbouring blocks, each made only from its own piles.
      </p>

      <h2 id="piles">Joining piles</h2>
      <p>
        A row of piles of stones is joined into one pile. Each step joins two neighbouring piles and costs the size of the new pile. The order
        matters: joining 4, 1, 3 as (4 + 1) then + 3 costs 5 + 8 = 13, while 4 + (1 + 3) costs 4 + 8 = 12. Whatever the order, the last join
        makes the whole stretch, so it costs the sum of piles i to j. Before that, the two blocks were built separately. So:
      </p>
      <Invariant label="Piles">best[i][j] = (pile i + … + pile j) + the smallest best[i][k] + best[k + 1][j], over i ≤ k &lt; j</Invariant>
      <p>
        A single pile costs nothing: <code>best[i][i] = 0</code>. The second version of the figure fills the same table row by row, which
        breaks. Step through both.
      </p>
      <JoinFigure />
      <CodeBlock
        title="join_piles.py"
        code={`from itertools import accumulate

def join_cost(a):
    n = len(a)
    pre = [0, *accumulate(a)]            # pre[j + 1] - pre[i] = a[i] + ... + a[j]
    best = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):       # shorter stretches first
        for i in range(n - length + 1):
            j = i + length - 1
            best[i][j] = pre[j + 1] - pre[i] + min(
                best[i][k] + best[k + 1][j] for k in range(i, j))
    return best[0][n - 1] if n else 0`}
      />
      <p>
        The sum of a stretch comes from prefix sums (ARRS-4) in <M>O(1)</M>, so the cost of a stretch never adds a loop.
      </p>

      <h2 id="order">Why shorter stretches go first</h2>
      <p>
        <code>best[i][j]</code> reads <code>best[i][k]</code> and <code>best[k + 1][j]</code>. Both are strictly shorter than i..j, because
        k &lt; j and k + 1 &gt; i. So if every stretch of length L − 1 or less is finished before any stretch of length L, every value read is
        final. This is a proof by induction on the length (CORR-3): stretches of length 1 are right by the base case, and a stretch of length L
        reads only shorter, finished stretches.
      </p>
      <p>
        The usual row-by-row order fails, as the figure shows: <code>best[0][2]</code> needs <code>best[1][2]</code>, which sits in a later
        row. Two other orders work: the rows from the bottom up (i from n − 1 down to 0, j rising), and the columns from left to right (j
        rising, i from j down to 0). Both finish every cell to the left and below before the cell itself. Memoisation finds a right order by
        itself.
      </p>

      <h2 id="family">The same shape elsewhere</h2>
      <ul>
        <li>
          <strong>Multiplying a chain of matrices.</strong> Multiplying a p × q matrix by a q × r one takes p · q · r multiplications. For
          A · B · C, the brackets change the work but not the result. With sizes <M>d₀ × d₁, d₁ × d₂, …</M>, the last multiplication of i..j
          joins i..k with k+1..j and costs <M>dᵢ · dₖ₊₁ · dⱼ₊₁</M> (counting the matrices from 0). The same table, with a different cost.
        </li>
        <li>
          <strong>Cutting a rail.</strong> Cuts are made at marked places, and each cut costs the length of the piece being cut. The first cut
          of a piece splits it into two pieces cut separately, so here the useful step is the first, not the last. That is the practice
          problem: the stretches are between neighbouring marks.
        </li>
        <li>
          <strong>Palindromes.</strong> The longest palindrome hidden in a string as a subsequence: <code>best[i][j]</code> is 2 +{" "}
          <code>best[i + 1][j − 1]</code> when the end letters match, and otherwise the better of dropping one end. No split loop, so{" "}
          <M>O(n²)</M>.
        </li>
        <li>
          <strong>Search trees with known lookups.</strong> Keys with known lookup counts: choose the root of each stretch of keys to make the
          total depth of lookups smallest (an optimal binary search tree). Knuth found it in 1971, together with the speed-up of lesson 6.
        </li>
        <li>
          <strong>Cutting a polygon into triangles,</strong> and many “remove items from a row in the best order” puzzles, where the useful
          question is which item goes <em>last</em>, because it splits the row into two independent sides.
        </li>
      </ul>

      <h2 id="cost">Cost, and memoised recursion</h2>
      <p>
        About <M>n²/2</M> cells, each trying up to n splits: <M>O(n³)</M> time (n · n · n) and <M>O(n²)</M> memory (n · n). The exact count is about <M>n³/6</M>{" "}
        split checks. In Python that is fine for a few hundred positions: 150 positions make about 560,000 checks, well under a second; 1,000
        would make about 170 million, far too slow. Lesson 6 shows when the split range can be narrowed to reach <M>O(n²)</M>.
      </p>
      <p>
        Memoised recursion is a natural way to write interval DP: <code>solve(i, j)</code> calls <code>solve(i, k)</code> and{" "}
        <code>solve(k + 1, j)</code>. Its depth is at most the length of the row, because each call is on a shorter stretch. With{" "}
        <code>functools.cache</code> keep that under about 200 in the browser (DYNP-2). The practice problem has at most 150 marks, so
        memoised recursion is fine there.
      </p>
      <Note title="Python detail">
        <p>
          <code>min(... for k in range(i, j))</code> runs its loop inside one C call per cell, which is about twice as fast as a written loop
          with an <code>if</code>. Keep the table as a list of lists: <code>best[i][k]</code> is a fast lookup, and a dict keyed by{" "}
          <code>(i, k)</code> is several times slower.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/addp/practice/3/">ADDP-P3, Cutting a rail</Link>.
      </p>
    </>
  );
}
