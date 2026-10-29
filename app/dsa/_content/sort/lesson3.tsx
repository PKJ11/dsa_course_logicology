import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PartitionFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Quick sort picks one value, the pivot, and moves every smaller value to its left and every other value to its right. Then the pivot is in
        its final place, and each side is sorted the same way. It sorts in place and is very fast on average.
      </p>

      <h2 id="partition">Partitioning</h2>
      <p>
        Splitting a list around a pivot is called <em>partitioning</em>. The simplest method, Lomuto&rsquo;s, uses the last value as the pivot and one
        pass from left to right:
      </p>
      <CodeBlock
        code={`def partition(a, lo, hi):
    p = a[hi]                 # the pivot
    i = lo
    for j in range(lo, hi):
        if a[j] < p:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i] # pivot to its final place
    return i`}
      />
      <Invariant>a[lo..i-1] are less than p, and a[i..j-1] are at least p.</Invariant>
      <p>
        Each pass looks at <code>a[j]</code>. If it is small, it swaps to position <code>i</code>, the end of the small part, and <code>i</code> moves on.
        Either way <code>j</code> moves on, so the invariant holds. At the end, swapping the pivot into position <code>i</code> puts it between the two
        parts.
      </p>

      <PartitionFigure />

      <h2 id="sort">The whole sort</h2>
      <CodeBlock
        code={`def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    k = partition(a, lo, hi)
    quick_sort(a, lo, k - 1)
    quick_sort(a, k + 1, hi)`}
      />
      <p>
        Unlike merge sort, all the work happens before the recursive calls, and nothing needs merging afterwards. The pivot is in its final place
        and never moves again.
      </p>

      <h2 id="cost">Good and bad pivots</h2>
      <p>
        If every pivot splits its part roughly in half, the cost is <M>T(n) = 2T(n/2) + n</M>, which is <M>O(n log n)</M>. If every pivot is the
        largest or smallest value, each split leaves <M>n − 1</M> values on one side: <M>T(n) = T(n − 1) + n</M>, which is <M>O(n²)</M>. Step
        through the second version of the figure: with the last value as pivot, an already sorted list is the worst case.
      </p>
      <p>
        The fix is to choose the pivot at random (swap a random value into position <code>hi</code> first). Then no input is always bad. The
        expected number of comparisons is about <M>1.39 n log₂ n</M> (1.39 times n times the number of times n can be halved), for every input. Even a split as uneven as 10% and 90% at every level still
        gives <M>O(n log n)</M>: the levels go down by a factor of 0.9, so there are only about <M>log n</M> of them.
      </p>

      <h2 id="repeats">Many equal values</h2>
      <p>
        Lomuto&rsquo;s partition puts values equal to the pivot all on one side. If every value is the same, every split is as bad as possible, and
        quick sort becomes <M>O(n²)</M> again, even with random pivots. The fix is a three-way partition: less than, equal to, and greater than the
        pivot. It is the same three-part split as <Link href="/dsa/corr/practice/3/">CORR-P3</Link>. The equal part is already in place and is
        never sorted again.
      </p>
      <Note title="In practice">
        <p>
          Quick sort is in place and its inner loop is very simple, which makes it fast on real machines. Its recursion depth is{" "}
          <M>O(log n)</M> on average; recursing on the smaller side first keeps the depth <M>O(log n)</M> always. C&rsquo;s <code>qsort</code> and many
          other libraries are based on it. Python chose merge-based Timsort instead, because it is stable.
        </p>
      </Note>
      <p>
        Lesson 8 uses partitioning to find one value without sorting. Try <Link href="/dsa/sort/practice/4/">SORT-P4, The k-th fastest</Link> after it.
      </p>
    </>
  );
}
