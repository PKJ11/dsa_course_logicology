import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SelectFigure } from "./figures";

export default function Lesson8() {
  return (
    <>
      <p className="lesson__lede">
        Sometimes you need only one value from the sorted order, such as the median or the tenth smallest. Sorting everything costs{" "}
        <M>O(n log n)</M>. Quickselect finds it in <M>O(n)</M> on average, by partitioning and then keeping only the side that holds the answer.
      </p>

      <h2 id="problem">The k-th smallest</h2>
      <p>
        Given a list and a position <M>k</M> (counting from 0), find the value that would be at index <M>k</M> if the list were sorted. For{" "}
        <M>k = 0</M> that is the minimum, which one pass finds. For the median, <M>k = n // 2</M>, there is no such shortcut.
      </p>

      <h2 id="idea">Partition, then keep one side</h2>
      <p>
        Partition around a pivot, as in lesson 3. The pivot lands at its final index <M>p</M>. If <M>p = k</M>, the pivot is the answer. If{" "}
        <M>k &lt; p</M>, the answer is among the values to the left; otherwise it is to the right. Unlike quick sort, only one side is searched again.
      </p>

      <SelectFigure />

      <p>
        Keep the range <code>a[lo..hi]</code> that must hold the answer. Pick a random pivot in it and partition the range (lesson 3); the pivot
        lands at index <code>p</code>. Then one round narrows the range:
      </p>
      <CodeBlock
        code={`if p == k:
    return a[p]
if k < p:
    hi = p - 1
else:
    lo = p + 1`}
      />
      <p>
        Repeat until the pivot lands at <M>k</M>. Writing the whole method, without changing the input, is{" "}
        <Link href="/dsa/sort/practice/4/">SORT-P4</Link>.
      </p>
      <Invariant>The value we want is at an index between lo and hi.</Invariant>

      <h2 id="cost">Why it is O(n) on average</h2>
      <p>
        With a random pivot, the pivot lands in the middle half of the range at least half the time. When it does, at most three quarters of the
        range is kept. So on average, every two rounds shrink the range to at most three quarters of its size. A round costs at most the size of
        its range. The total is at most <M>2 × (n + (3/4)n + (3/4)²n + …)</M>, where <M>(3/4)²</M> is 3/4 × 3/4. Each term is three quarters of the one before, so the sum in brackets
        stays below <M>4n</M>, and the total below <M>8n</M>. That is <M>O(n)</M> expected time.
      </p>
      <p>
        The worst case, with very unlucky pivots, is still <M>O(n²)</M>. A method called &ldquo;median of medians&rdquo; picks a pivot that is always
        good enough, giving <M>O(n)</M> in the worst case. It is slower in practice and rarely used, but it proves that selection really is
        easier than sorting.
      </p>

      <h2 id="equal">Many equal values</h2>
      <p>
        If the list is a million copies of the same value, Lomuto&rsquo;s partition puts all of them on one side every time, and quickselect takes{" "}
        <M>O(n²)</M>. Use a three-way partition: less than, equal to, and greater than the pivot. If <M>k</M> falls in the equal part, the answer is
        the pivot, and you stop.
      </p>

      <h2 id="others">Other ways</h2>
      <ul>
        <li>
          Sort and index: <code>sorted(a)[k]</code>. <M>O(n log n)</M>, but simple and often fast enough.
        </li>
        <li>
          A heap of size <M>k + 1</M>: keep the <M>k + 1</M> smallest seen so far. <M>O(n log k)</M>, and it works on a stream of values that does not
          fit in memory. <code>heapq.nsmallest(k + 1, a)[-1]</code> does this.
        </li>
      </ul>
      <Note title="Changing the input">
        <p>
          Quickselect rearranges the list it works on. If the caller needs the original order, work on a copy. A copy costs <M>O(n)</M>, which does
          not change the overall cost.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/sort/practice/4/">SORT-P4, The k-th fastest</Link>.
      </p>
    </>
  );
}
