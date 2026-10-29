import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { WindowFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Many questions ask about a run of neighbouring values: the best stretch of a given length, or the longest stretch that meets a rule. A
        sliding window answers them by updating the run one value at a time, instead of starting again for each position.
      </p>

      <h2 id="fixed">A window of fixed size</h2>
      <p>
        Take the largest sum of <M>k</M> neighbouring values. Adding up each window from scratch costs <M>k</M> steps per window, which is{" "}
        <M>O(n × k)</M> in total. But two neighbouring windows share all but two values. Moving one place right adds the value that comes in
        and takes away the value that leaves.
      </p>
      <CodeBlock
        code={`def best_window(a, k):
    s = sum(a[:k])
    best = s
    for r in range(k, len(a)):
        s += a[r] - a[r - k]     # one in on the right, one out on the left
        best = max(best, s)
    return best`}
      />

      <WindowFigure />

      <h2 id="variable">A window that grows and shrinks</h2>
      <p>
        Step through the second version: the longest run whose sum is at most a limit. Now the window has no fixed size. The right end{" "}
        <code>hi</code> moves one place each pass. The left end <code>lo</code> moves only when the window breaks the rule.
      </p>
      <CodeBlock
        code={`def longest_within(a, limit):      # all values positive
    lo = 0
    s = 0
    best = 0
    for hi in range(len(a)):
        s += a[hi]
        while s > limit:              # shrink until valid again
            s -= a[lo]
            lo += 1
        best = max(best, hi - lo + 1)
    return best`}
      />
      <Invariant>After the inner loop, a[lo..hi] is the longest valid window that ends at hi.</Invariant>
      <p>
        Why is that true? Suppose a longer valid window ended at <code>hi</code>; it would start before <code>lo</code>. But <code>lo</code> only moved
        past a position when the window starting there was over the limit. With positive values, adding more values on the right only makes the
        sum bigger, so that window is still over the limit now. So no valid window starts before <code>lo</code>.
      </p>

      <h2 id="cost">Why it is O(n)</h2>
      <p>
        There is a loop inside a loop, so it looks like <M>O(n²)</M>, n times n steps. Count moves instead of passes. <code>hi</code> moves right <M>n</M> times.{" "}
        <code>lo</code> also only moves right, and never past <code>hi + 1</code>, so it moves at most <M>n</M> times in total, across all passes.
        That is at most <M>2n</M> moves: <M>O(n)</M>. Counting the total over the whole run like this is the amortised idea from{" "}
        <Link href="/dsa/bigo/7/">BIGO-7</Link>.
      </p>

      <h2 id="state">What the window remembers</h2>
      <p>
        The window needs a summary that can be updated in <M>O(1)</M> when one value enters or leaves:
      </p>
      <ul>
        <li>a running sum, for sum rules;</li>
        <li>a dictionary of counts, for rules about repeats or distinct values;</li>
        <li>a deque of candidates, for the largest value in each window (STAQ, the monotonic queue).</li>
      </ul>
      <p>
        For &ldquo;no repeated character&rdquo;, keep a dictionary from each character to how many times it is in the window, or to the last index
        where you saw it. That is the practice problem.
      </p>
      <Note title="When a window does not work" warn>
        <p>
          The shrink rule needs a property that only gets worse as the window grows. With negative numbers, adding a value can lower the sum,
          so &ldquo;shrink while too big&rdquo; may throw away the answer. Then prefix sums (lesson 4) or other tools are needed.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/arrs/practice/2/">ARRS-P2, The longest run of different codes</Link>.
      </p>
    </>
  );
}
