import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PrefixFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        This station is about questions on a stretch of a list: the total of these values, the smallest of them. Answering each question by
        reading the stretch costs O(n). With some work done in advance, the answer can cost O(1) or O(log n). The simplest case is a total over a
        list that never changes, and the tool is one you have met before: prefix sums.
      </p>

      <h2 id="idea">Range questions</h2>
      <p>
        A <strong>range</strong> is a stretch of neighbouring positions of a list. In this station, as in Python&rsquo;s slices, the range{" "}
        <code>a[l:r]</code> means positions <M>l</M> up to but not including <M>r</M>: it has <M>r − l</M> values. Leaving out the last position
        is called a <strong>half-open</strong> range (BSRC). It makes lengths and joins simple: <code>a[l:m]</code> and <code>a[m:r]</code>{" "}
        together are exactly <code>a[l:r]</code>.
      </p>
      <p>
        A <strong>range query</strong> asks a question about one range, such as its sum or its minimum. The lessons ahead differ in two things:
        which questions they answer, and whether the list may change between questions.
      </p>
      <ul>
        <li>Prefix sums (this lesson): sums, list fixed. O(1) per question.</li>
        <li>Sparse table (lesson 2): minimum or maximum, list fixed. O(1) per question.</li>
        <li>Fenwick tree (lesson 3): sums, single values change. O(log n) for both.</li>
        <li>Segment tree (lessons 4 and 5): almost any question, single values or whole ranges change. O(log n).</li>
        <li>Square-root decomposition (lesson 6): a simpler, slower method that bends to odd questions. O(√n).</li>
      </ul>

      <h2 id="prefix">Prefix sums</h2>
      <p>
        ARRS-4 built the list of <strong>prefix sums</strong>: <code>p[k]</code> is the total of the first <M>k</M> values,{" "}
        <code>a[0] + … + a[k − 1]</code>, with <code>p[0] = 0</code>. The total of a range is then the difference of two prefix sums: the first{" "}
        <M>r</M> values, minus the first <M>l</M>.
      </p>
      <Invariant>sum(a[l:r]) = p[r] − p[l]</Invariant>
      <PrefixFigure />
      <p>
        Building <code>p</code> takes one addition per value, <M>O(n)</M>. After that, every range total costs two reads and a subtraction,{" "}
        <M>O(1)</M>, whatever the length of the range. HASH-6 used the same identity, turned around, to count ranges with a given total.
      </p>
      <p>
        The method needs subtraction to undo addition. It works for sums, for XOR (since <code>x ^ x = 0</code>, TRIE-5) and for counts, but not
        for minimum: knowing the smallest of the first 7 values and of the first 2 says nothing about the smallest of positions 2 to 6. Lesson 2
        handles minimum.
      </p>

      <h2 id="diff">Adding to ranges</h2>
      <p>
        Now turn the question round. The list changes by many updates of the form &ldquo;add <M>v</M> to every value in <code>a[l:r]</code>
        &rdquo;, and the final list is needed only after all of them. Doing each add with a loop costs <M>O(n)</M>.
      </p>
      <p>
        As in ARRS-4, keep a <strong>difference list</strong> <code>d</code> of length <M>n + 1</M>, all zeros. For each update, do{" "}
        <code>d[l] += v</code> and <code>d[r] -= v</code>. At the end, the running total of <code>d</code> is the list of changes:{" "}
        <code>a[k]</code> grows by <code>d[0] + … + d[k]</code>. The first change switches the add on at position <M>l</M>, and the second
        switches it off at <M>r</M>. Step through &ldquo;Adding to ranges&rdquo;.
      </p>
      <p>
        So each update is <M>O(1)</M>, and the final pass is <M>O(n)</M>. The difference list and the prefix sum undo each other: the
        differences of the prefix sums give back the list, and the other way round. Practice RNGQ-P1 uses both.
      </p>

      <h2 id="grid">Two dimensions</h2>
      <p>
        For a grid, let <code>P[i][j]</code> be the total of the rectangle of the first <M>i</M> rows and first <M>j</M> columns. Any rectangle
        is then a sum and difference of four corners. Rows <M>r1</M> to <M>r2 − 1</M> and columns <M>c1</M> to <M>c2 − 1</M> total:
      </p>
      <CodeBlock code={`P[r2][c2] - P[r1][c2] - P[r2][c1] + P[r1][c1]`} />
      <p>
        The two subtractions both remove the top-left corner rectangle, so it is added back once. Building <code>P</code> uses the same rule:
      </p>
      <CodeBlock code={`P[i + 1][j + 1] = g[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]`} />
      <p>
        An image filter that averages a box around every pixel uses exactly this (a &ldquo;summed-area table&rdquo;).
      </p>

      <h2 id="python">In Python</h2>
      <CodeBlock
        code={`from itertools import accumulate

a = [3, 1, 4, 1, 5, 9, 2]
p = [0, *accumulate(a)]      # [0, 3, 4, 8, 9, 14, 23, 25]
p[5] - p[2]                  # 10, the total of a[2:5]

# the difference list, then the running total
d = [0] * (len(a) + 1)
for l, r, v in [(1, 4, 2), (3, 7, 5)]:
    d[l] += v
    d[r] -= v
changes = list(accumulate(d))[:-1]`}
      />
      <p>
        <code>itertools.accumulate</code> gives running totals, computed in C, so it is faster than a Python loop. <code>[0, *accumulate(a)]</code>{" "}
        puts a 0 in front of them: the <code>*</code> spreads the running totals into the new list.
      </p>
      <Note title="Big numbers and floats">
        <p>
          Python&rsquo;s integers never overflow, so prefix sums of big numbers are exact. With floats, <code>p[r] − p[l]</code> can lose
          accuracy when the totals are much larger than the range&rsquo;s own sum; <code>math.fsum</code> on the slice is exact but costs{" "}
          <M>O(n)</M>.
        </p>
      </Note>
    </>
  );
}
