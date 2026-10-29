import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SimpleFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Sorting puts values in order, smallest first. This lesson starts with three simple methods. They are slow on large lists, but they show
        the ideas every faster sort builds on, and one of them is still the best choice for small or nearly sorted lists.
      </p>

      <h2 id="why">Why sorting matters</h2>
      <p>
        A sorted list answers many questions quickly: binary search (<Link href="/dsa/bsrc/1/">BSRC</Link>), the smallest and largest values,
        repeats (they end up side by side), and pairs that add up to a target (<Link href="/dsa/arrs/2/">ARRS-2</Link>). Many algorithms start
        with &ldquo;sort the input&rdquo;. In Python you will usually call <code>sorted()</code>, but knowing how sorts work tells you what that call
        costs and when you can do better.
      </p>

      <h2 id="three">Three simple sorts</h2>
      <p>Step through each one on the same list. Watch the counters.</p>

      <SimpleFigure />

      <h2 id="insertion">Insertion sort</h2>
      <p>
        Pass <M>i</M> takes the value <code>key = a[i]</code> and moves it left into the sorted part. This is the core of one pass, with{" "}
        <code>j</code> starting at <M>i − 1</M>:
      </p>
      <CodeBlock
        code={`while j >= 0 and a[j] > key:
    a[j + 1] = a[j]      # move the bigger value right
    j -= 1
a[j + 1] = key`}
      />
      <p>
        The passes run for <M>i</M> = 1, 2, …, <M>n − 1</M>. Writing the whole sort is <Link href="/dsa/sort/practice/1/">SORT-P1</Link>.
      </p>
      <Invariant>At the start of each pass, a[0..i-1] holds the first i values, in sorted order.</Invariant>
      <p>
        Each pass inserts <code>a[i]</code> into the sorted part, so the invariant moves on by one. When <code>i</code> reaches <M>n</M>, the whole list
        is sorted.
      </p>
      <p>
        The cost depends on the input. Call a pair of positions <M>i &lt; j</M> with <M>a[i] &gt; a[j]</M> an <em>inversion</em>: a pair in the
        wrong order. Each move in the inner loop fixes exactly one inversion. So insertion sort takes <M>O(n + I)</M> time, where <M>I</M> is the
        number of inversions: time in proportion to n plus the number of inversions. A sorted list has none, so it takes <M>O(n)</M>. A reversed list has <M>n(n − 1) / 2</M> (n times n − 1, halved), so it takes{" "}
        <M>O(n²)</M>.
      </p>

      <h2 id="selection">Selection sort and bubble sort</h2>
      <p>
        <strong>Selection sort</strong> finds the smallest value left and swaps it to the front of the unsorted part. It always makes{" "}
        <M>n(n − 1) / 2</M> comparisons, even on a sorted list. Its one strength is that it makes at most <M>n − 1</M> swaps, which matters when
        writing a value is very costly.
      </p>
      <p>
        <strong>Bubble sort</strong> swaps neighbours that are out of order, pass after pass, and can stop early after a pass with no swaps. Each
        swap also fixes exactly one inversion, so it does as many swaps as insertion sort does moves, plus more comparisons.
      </p>

      <h2 id="compare">Which to use</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">The three simple sorts compared</caption>
          <thead>
            <tr>
              <th>Sort</th>
              <th>Best case</th>
              <th>Worst case</th>
              <th>Stable?</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Insertion</td><td><M>O(n)</M>, already sorted</td><td><M>O(n²)</M></td><td>yes</td></tr>
            <tr><td>Selection</td><td><M>O(n²)</M></td><td><M>O(n²)</M></td><td>no</td></tr>
            <tr><td>Bubble</td><td><M>O(n)</M>, with early stop</td><td><M>O(n²)</M></td><td>yes</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        &ldquo;Stable&rdquo; means equal values keep their original order; lesson 7 explains why that matters. All three sort in place, with{" "}
        <M>O(1)</M> extra space.
      </p>
      <Note title="Insertion sort is still used">
        <p>
          Python&rsquo;s own sort, Timsort, uses insertion sort on short runs of up to about 64 values, because for small lists it is faster than the
          methods in the next lessons. Nearly sorted data, such as a list with a few new values added, is also a good case for it.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/sort/practice/1/">SORT-P1, Nearly in order</Link>.
      </p>
    </>
  );
}
