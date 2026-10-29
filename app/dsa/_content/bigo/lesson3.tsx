import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { GrowthFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A handful of growth rates cover almost every algorithm in this course. Once you know them well, you can read a problem&rsquo;s limits and
        know at once which rates can work.
      </p>

      <h2 id="ladder">The usual classes</h2>
      <p>From slowest growing to fastest growing:</p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Common growth classes with examples</caption>
          <thead>
            <tr>
              <th>Class</th>
              <th>Name</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><M>1</M></td><td>constant</td><td>read <code>a[i]</code>; look up a key in a dict</td></tr>
            <tr><td><M>log n</M></td><td>logarithmic</td><td>binary search</td></tr>
            <tr><td><M>n</M></td><td>linear</td><td>one pass over a list</td></tr>
            <tr><td><M>n log n</M></td><td>linearithmic</td><td>merge sort; <code>sorted()</code></td></tr>
            <tr><td><M>n²</M></td><td>quadratic</td><td>check every pair</td></tr>
            <tr><td><M>n³</M></td><td>cubic</td><td>check every triple; simple matrix multiply</td></tr>
            <tr><td><M>2ⁿ</M></td><td>exponential</td><td>try every subset</td></tr>
            <tr><td><M>n!</M></td><td>factorial</td><td>try every order</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Each class eventually beats every class below it in the table, whatever the constants are. For example, <M>1,000 n</M> is smaller than{" "}
        <M>n²</M> once <M>n</M> is more than 1,000.
      </p>

      <h2 id="table">What n can each class handle?</h2>
      <p>Step through the table. Each step picks a bigger <M>n</M> and shows how long each class would take.</p>

      <GrowthFigure />

      <p>
        This gives a useful habit. Read the limits first. Plain Python does roughly 10 million simple steps a second. So, for a few seconds of
        time:
      </p>
      <ul>
        <li>
          <M>n</M> up to about 10: <M>n!</M> may be fine.
        </li>
        <li>
          <M>n</M> up to about 20: <M>2ⁿ</M> is fine.
        </li>
        <li>
          <M>n</M> up to about 300: <M>n³</M> is fine.
        </li>
        <li>
          <M>n</M> up to about 3,000: <M>n²</M> is fine.
        </li>
        <li>
          <M>n</M> up to 1,000,000: you need <M>n log n</M> or better.
        </li>
      </ul>
      <Invariant label="Rule">The limits in a problem statement tell you which growth rate the intended answer has.</Invariant>

      <h2 id="logs">Where log n comes from</h2>
      <p>
        <M>log₂ n</M> is how many times you can halve <M>n</M> before you reach 1. Halve 1,000,000 twenty times and you reach 1, so{" "}
        <M>log₂ 1,000,000 ≈ 20</M>. That is why it grows so slowly: doubling <M>n</M> adds only 1.
      </p>
      <p>A log appears whenever the work cuts the problem by a fixed fraction each step. Two common shapes:</p>
      <CodeBlock
        code={`while n > 1:          # runs about log2(n) times
    n = n // 2

i = 1
while i < n:          # also about log2(n) times
    i = i * 2`}
      />
      <p>
        <M>n log n</M> usually means <M>log n</M> levels of work, with <M>n</M> steps at each level. Merge sort is the standard example, and lesson
        5 shows why.
      </p>

      <h2 id="exp">Exponential and factorial</h2>
      <p>
        <M>2ⁿ</M> doubles every time <M>n</M> grows by 1. It appears when each of <M>n</M> items is either in or out: a list of 30 items has{" "}
        <M>2³⁰</M>, about a billion, subsets. <M>n!</M> (read &ldquo;n factorial&rdquo;, which is <M>1 × 2 × … × n</M>) counts the orders of{" "}
        <M>n</M> items: 10 items have 3,628,800 orders, and 15 have over a trillion.
      </p>
      <Note title="Exponential is not always hopeless">
        <p>
          Some problems have no known fast method (the HARD station explains this). Then a well-pruned <M>2ⁿ</M> search for small <M>n</M> is the
          right tool. <Link href="/dsa/recr/5/">RECR-5</Link> shows how pruning cuts the search.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bigo/practice/1/">BIGO-P1, Two loads that add up</Link>. The limits rule out checking every pair.
      </p>
    </>
  );
}
