import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RecTreeFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A loop&rsquo;s cost is a sum. A recursive function&rsquo;s cost is harder, because it calls itself. Its cost is written as an equation
        called a <em>recurrence</em>, and this lesson shows two ways to solve one.
      </p>

      <h2 id="idea">Cost described by itself</h2>
      <p>Here is merge sort in outline. SORT-2 builds it in full.</p>
      <CodeBlock
        code={`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])        # T(n/2)
    right = merge_sort(a[mid:])       # T(n/2)
    return merge(left, right)         # about n steps`}
      />
      <p>
        Let <M>T(n)</M> be the number of steps for a list of <M>n</M> values. The function makes two calls on half the list, and does about{" "}
        <M>n</M> steps of its own (the slices and the merge). So:
      </p>
      <Invariant label="Recurrence">T(n) = 2T(n/2) + n, and T(1) = 1</Invariant>
      <p>
        The second part, <M>T(1) = 1</M>, is the base case: a list of one value costs a constant amount. A recurrence is not an answer yet. We
        want a plain formula for <M>T(n)</M>.
      </p>

      <h2 id="unroll">Unrolling</h2>
      <p>
        One way is to replace <M>T</M> by its own definition again and again, and look for a pattern. Take <M>n</M> to be a power of 2, so the
        halves are always whole:
      </p>
      <CodeBlock
        code={`T(n) = 2T(n/2) + n
     = 2[2T(n/4) + n/2] + n  = 4T(n/4) + 2n
     = 4[2T(n/8) + n/4] + 2n = 8T(n/8) + 3n
     ...
     = 2^k T(n/2^k) + k·n      # 2^k: k twos multiplied together`}
      />
      <p>
        Here <code>2^k</code> means <M>2ᵏ</M>, k twos multiplied together. The halving stops when <M>n/2ᵏ = 1</M>, which is when <M>k = log₂ n</M>. Put that in: <M>T(n) = n × T(1) + n log₂ n = n + n log₂ n</M>.
        So <M>T(n)</M> is <M>Θ(n log n)</M>.
      </p>
      <p>
        A pattern spotted this way is a guess. To be sure, prove it by induction (<Link href="/dsa/corr/3/">CORR-3</Link>): assume the formula
        for <M>n/2</M>, and show it holds for <M>n</M>.
      </p>

      <h2 id="tree">The recursion tree</h2>
      <p>
        A picture often makes the pattern obvious. Draw each call as a box, with the calls it makes below it. Write next to each box the work
        it does itself, not counting its calls. Then add up the tree one level at a time.
      </p>

      <RecTreeFigure />

      <p>
        The two trees have the same work at the top, <M>n</M>, but very different totals. Halving gives <M>log₂ n</M> levels. Shrinking by one
        gives <M>n</M> levels. Most of the difference between fast and slow divide-and-conquer comes down to this.
      </p>

      <h2 id="examples">Four recurrences to know</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Common recurrences and their solutions</caption>
          <thead>
            <tr>
              <th>Recurrence</th>
              <th>Solution</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><M>T(n) = T(n/2) + 1</M></td><td><M>Θ(log n)</M></td><td>binary search</td></tr>
            <tr><td><M>T(n) = 2T(n/2) + n</M></td><td><M>Θ(n log n)</M></td><td>merge sort</td></tr>
            <tr><td><M>T(n) = T(n − 1) + 1</M></td><td><M>Θ(n)</M></td><td>recursive sum of a list</td></tr>
            <tr><td><M>T(n) = T(n − 1) + n</M></td><td><M>Θ(n²)</M></td><td>selection sort; quick sort&rsquo;s worst case</td></tr>
            <tr><td><M>T(n) = 2T(n − 1) + 1</M></td><td><M>Θ(2ⁿ)</M></td><td>towers of Hanoi; listing every subset</td></tr>
          </tbody>
        </table>
      </div>
      <Note title="Rounding">
        <p>
          When <M>n</M> is odd, the halves are <M>⌊n/2⌋</M> and <M>⌈n/2⌉</M> (rounded down and rounded up). This changes the answer by at most a
          constant factor, so we can safely pretend <M>n</M> is a power of 2.
        </p>
      </Note>
      <p>
        Lesson 6 gives a shortcut for the first two rows and many more like them.
      </p>
    </>
  );
}
