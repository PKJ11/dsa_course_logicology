import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FastFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        The time of a DP is the number of states times the work per state. Some rules look at many earlier states and keep the best one. When
        the best choice moves in a predictable way, most of those looks can be skipped. This lesson collects the speed-ups that do that, with the
        conditions that make each one safe.
      </p>

      <h2 id="where">Where the time goes</h2>
      <p>
        The DPs of this station and of DYNP have a rule of the form “the best over all choices k of (earlier answer for k + cost of the step)”.
        With n states and up to n choices each, that is <M>O(n²)</M> (n · n); with a table of stretches (lesson 3), <M>O(n³)</M> (n · n · n). The four speed-ups
        below all keep the same states and the same answers. They only stop looking at choices that can be proved not to win.
      </p>

      <h2 id="window">A sliding window of choices</h2>
      <p>
        When the choices for state i are the last k states, <code>best[i]</code> is <code>a[i]</code> plus the largest of{" "}
        <code>best[i − k]</code> to <code>best[i − 1]</code>, and the window of choices slides one step at a time. STAQ-6’s monotonic deque keeps the window’s maximum in <M>O(1)</M> per step on average, so the whole
        DP costs <M>O(n)</M> instead of <M>O(n · k)</M>. DYNP-4 used it this way. The other speed-ups work the same way: a structure, or
        a proof, that tells which choices are still worth looking at.
      </p>

      <h2 id="knuth">Knuth’s rule for interval DP</h2>
      <p>
        In joining piles (lesson 3), let <code>opt[i][j]</code> be the split k that gives <code>best[i][j]</code> (the smallest such k when
        there are ties). Knuth (1971) noticed that the split moves in one direction as the stretch grows:
      </p>
      <Invariant label="Knuth">opt[i][j − 1] ≤ opt[i][j] ≤ opt[i + 1][j]</Invariant>
      <p>
        So, when filling by length, only k from <code>opt[i][j − 1]</code> to <code>opt[i + 1][j]</code> need to be tried; both are already in
        the table. Step through the first version of the figure.
      </p>
      <FastFigure />
      <p>
        <strong>Why it is O(n²).</strong> For one length L, the ranges of the cells i = 0, 1, 2, … are{" "}
        <M>opt[i][i + L − 2] … opt[i + 1][i + L − 1]</M>. The end of one range is the start of the next, so the range sizes add up to the last
        end minus the first start, plus 1 for each cell: at most <M>2n</M>. With n lengths, that is <M>O(n²)</M> in all.
      </p>
      <p>
        <strong>When it holds.</strong> F. Yao (1980) proved the rule for the joining table of lesson 3 with any step cost{" "}
        <code>w(i, j)</code> in place of the pile sum, whenever w has two properties: it does not shrink when the stretch grows (a stretch inside another costs no more), and{" "}
        <M>w(a, c) + w(b, d) ≤ w(a, d) + w(b, c)</M> for <M>a ≤ b ≤ c ≤ d</M>, called the <strong>quadrangle inequality</strong>: two
        overlapping stretches cost no more than the outer and the inner one. The sum of a stretch meets both with equality. The proof is an
        exchange argument on the two splits; this course only states it. For a new cost, test the rule against the plain <M>O(n³)</M> table on
        random small inputs before trusting it.
      </p>
      <CodeBlock
        title="join_knuth.py"
        code={`from itertools import accumulate

def join_cost_knuth(a):
    n = len(a)
    if n < 2:
        return 0
    pre = [0, *accumulate(a)]
    best = [[0] * n for _ in range(n)]
    opt = [[i] * n for i in range(n)]    # the best split; opt[i][i] = i
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            lo, hi = opt[i][j - 1], min(opt[i + 1][j], j - 1)
            b, at = float("inf"), lo
            for k in range(lo, hi + 1):  # only the splits Knuth's rule allows
                c = best[i][k] + best[k + 1][j]
                if c < b:
                    b, at = c, k
            best[i][j] = b + pre[j + 1] - pre[i]
            opt[i][j] = at
    return best[0][n - 1]`}
      />
      <p>
        Cutting a rail (ADDP-P3) has the same shape, so it can be made <M>O(n²)</M> this way too; the practice problem is small enough for the
        plain table.
      </p>

      <h2 id="split">Divide and conquer over split points</h2>
      <p>
        Another common shape: split a row of n items into g stretches, and pay a cost <code>C(i, j)</code> for each stretch of items i to j − 1.
        With <code>layer[j]</code> the best way to split the first j items into the stretches so far, each new layer is
      </p>
      <Invariant label="Layer">new[j] = the smallest old[i] + C(i, j) over i ≤ j</Invariant>
      <p>
        which is <M>O(n²)</M> per layer. When C meets the quadrangle inequality, the best i for j never moves left as j grows. Then:
      </p>
      <ol>
        <li>work out the middle j by trying every allowed i, and note the best one, <code>at</code>;</li>
        <li>every j to its left has its best i at or before <code>at</code>, and every j to its right at or after it;</li>
        <li>solve the two halves the same way, each with its narrower range.</li>
      </ol>
      <CodeBlock
        title="split_layers.py"
        code={`from itertools import accumulate

def split_cost(a, g):
    """Split a into at most g stretches; a stretch costs the square of its sum."""
    n = len(a)
    pre = [0, *accumulate(a)]
    cost = lambda i, j: (pre[j] - pre[i]) ** 2        # the stretch a[i:j]
    INF = float("inf")
    prev = [0] + [INF] * n               # 0 stretches: only the empty start
    for _ in range(g):
        cur = [INF] * (n + 1)

        def solve(lo, hi, olo, ohi):     # fill cur[lo..hi]; their splits lie in olo..ohi
            if lo > hi:
                return
            mid = (lo + hi) // 2
            best, at = INF, olo
            for i in range(olo, min(mid, ohi) + 1):
                c = prev[i] + cost(i, mid)
                if c < best:
                    best, at = c, i
            cur[mid] = best
            solve(lo, mid - 1, olo, at)  # to the left, the split is at most at
            solve(mid + 1, hi, at, ohi)  # to the right, at least at
        solve(0, n, 0, n)
        prev = cur
    return prev[n]`}
      />
      <p>
        <strong>Cost.</strong> On each level of the recursion the ranges of i overlap only at their ends, so a level costs <M>O(n)</M>, and
        there are about <M>log₂ n</M> levels (the number of times n can be halved). So a layer costs <M>O(n log n)</M> and the whole DP{" "}
        <M>O(g · n log n)</M>, against <M>O(g · n²)</M>. The recursion is only <M>log₂ n</M> deep.
      </p>

      <h2 id="lines">Lines on a hull</h2>
      <p>
        A train stops at some of n stations at positions <M>x₀ &lt; x₁ &lt; …</M>. A run from stop i to stop j costs{" "}
        <M>(xⱼ − xᵢ)² + c</M>. Then <code>best[j]</code> is the smallest <M>best[i] + (xⱼ − xᵢ)² + c</M>. Multiply out the square:
      </p>
      <Invariant label="Lines">best[j] = xⱼ² + c + the smallest (−2xᵢ) · xⱼ + (best[i] + xᵢ²) over i &lt; j</Invariant>
      <p>
        For each earlier stop i, the part in brackets is a straight line <M>m · X + b</M> with slope <M>m = −2xᵢ</M> and height{" "}
        <M>b = best[i] + xᵢ²</M>, read at <M>X = xⱼ</M>. So each step asks: of all the lines so far, which is lowest at this X? The lowest line
        at each X forms the lower edge of all the lines, which is convex (GEOM-3); lines that are never lowest can be thrown away. This is often
        called the convex hull method for DP.
      </p>
      <p>
        Here the slopes fall as stops are added (positions rise), and the questions come at rising X. Then the useful lines can be kept in a
        deque, as the second version of the figure shows:
      </p>
      <ul>
        <li>
          <strong>Adding a line</strong> at the back: the last kept line is useless if the new line passes under the line before it no later than
          the last one does. Remove it and check again. Compare crossing points with whole numbers by multiplying across, never by dividing.
        </li>
        <li>
          <strong>A question</strong> at X: while the second line is at least as low as the first at X, remove the first. Questions only move
          right, so it will never be needed again. The answer is the first line.
        </li>
      </ul>
      <p>
        Each line enters once and leaves at most once: <M>O(n)</M> for the whole DP instead of <M>O(n²)</M>. That is the practice problem.
      </p>
      <Note title="When the questions come in any order">
        <p>
          If the questions come in any order, keep the same hull and find the answer by binary search over the crossing points:{" "}
          <M>O(log n)</M> each. If lines also arrive in any order of slope, a <strong>Li Chao tree</strong> (a segment tree over X, RNGQ-4,
          where each node keeps the one line that is lowest at its middle) handles both in <M>O(log n)</M>.
        </p>
      </Note>

      <h2 id="which">Which speed-up when</h2>
      <div className="tt-wrap">
        <table className="tt">
          <thead>
            <tr>
              <th>Rule shape</th>
              <th>Speed-up</th>
              <th>Condition</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>best of the last k</td>
              <td>monotonic deque</td>
              <td>the window slides</td>
              <td className="nowrap">O(n)</td>
            </tr>
            <tr>
              <td>stretch split at k</td>
              <td>Knuth</td>
              <td>quadrangle inequality, cost grows with the stretch</td>
              <td className="nowrap">O(n²)</td>
            </tr>
            <tr>
              <td>layers of old[i] + C(i, j)</td>
              <td>divide and conquer</td>
              <td>best i never moves left</td>
              <td className="nowrap">O(g · n log n)</td>
            </tr>
            <tr>
              <td>min of m·x + b</td>
              <td>lines in a deque</td>
              <td>slopes and questions in order</td>
              <td className="nowrap">O(n)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        In every case, check the condition, or check the fast version against the plain one on many small random inputs. A speed-up used where
        its condition fails gives wrong answers with no error to warn you.
      </p>
      <p>
        Now try <Link href="/dsa/addp/practice/6/">ADDP-P6, The cheapest trip</Link>.
      </p>
    </>
  );
}
