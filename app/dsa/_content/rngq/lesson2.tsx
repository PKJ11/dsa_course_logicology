import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SparseFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        For the smallest value in a range there is no subtraction to undo a prefix. But if the list never changes, a table of the minimum of
        every block whose length is a power of two answers any range with just two reads.
      </p>

      <h2 id="min">The smallest value in a range</h2>
      <p>
        The question: given a list that never changes, what is <code>min(a[l:r])</code>? Many questions are of this kind, often called{" "}
        <strong>RMQ</strong> (range minimum query): the lowest price in a period, the shallowest point between two places, and, inside other
        algorithms, the lowest common ancestor of two tree nodes (STRG uses it with suffix arrays).
      </p>
      <p>
        <code>min(a[l:r])</code> in Python costs <M>O(r − l)</M>. Storing the answer for every pair <M>(l, r)</M> answers in <M>O(1)</M>, but
        there are about{" "}
        <M>
          n<sup>2</sup> / 2
        </M>{" "}
        (n times n, halved) pairs: for a million values, half a million million answers. The sparse table stores only <M>n log₂ n</M> of them and still answers in{" "}
        <M>O(1)</M>.
      </p>

      <h2 id="table">The table</h2>
      <p>
        A <strong>power of two</strong> is 1, 2, 4, 8, …: some number k of twos multiplied together (and 2⁰ is 1), written{" "}
        <M>
          2<sup>k</sup>
        </M>
        . Row <M>k</M> of the table holds, for every start <M>i</M>, the minimum of the block of length{" "}
        <M>
          2<sup>k</sup>
        </M>{" "}
        that starts at <M>i</M>.
      </p>
      <ul>
        <li>Row 0 is the list itself (blocks of length 1).</li>
        <li>
          Each block of row <M>k</M> is two blocks of row <M>k − 1</M> side by side, so its minimum is the smaller of their two minimums: row{" "}
          <M>k</M> at <M>i</M> is the smaller of row <M>k − 1</M> at <M>i</M> and at <M>i + h</M>, where <M>h</M> is half the block length.
        </li>
      </ul>
      <SparseFigure />
      <p>
        There are about <M>log₂ n</M> rows of at most <M>n</M> entries, each found with one comparison, so the build costs{" "}
        <M>O(n log n)</M> time and memory. For a million values that is 20 million entries: a lot for Python lists, but fine for a few hundred
        thousand.
      </p>

      <h2 id="ask">Answering with two blocks</h2>
      <p>
        For a range of length <M>L = r − l</M>, take the largest power of two that fits:{" "}
        <M>
          2<sup>k</sup> ≤ L
        </M>
        . Two blocks of that length cover the range: one that starts at <M>l</M>, and one that ends at <M>r − 1</M>, so it starts at{" "}
        <M>
          r − 2<sup>k</sup>
        </M>
        . Since{" "}
        <M>
          2 · 2<sup>k</sup> &gt; L
        </M>
        , together they leave no gap. They may overlap, and that does not matter:
      </p>
      <Invariant>min(a[l:r]) = min(t[k][l], t[k][r − 2ᵏ]), where 2ᵏ is the largest power of two at most r − l.</Invariant>
      <p>
        A value in both blocks is counted twice, and a minimum does not care: <code>min(x, x) = x</code>. Python gives <M>k</M> directly:{" "}
        <code>(r - l).bit_length() - 1</code> is the position of the highest 1 bit of the length, which is <M>⌊log₂ L⌋</M> (log₂ rounded down).
        So a question costs two reads and one comparison: <M>O(1)</M>.
      </p>
      <CodeBlock
        code={`def build(a):
    t = [a[:]]
    k = 1
    while 1 << k <= len(a):
        prev, h = t[-1], 1 << (k - 1)
        t.append([min(prev[i], prev[i + h])
                  for i in range(len(a) - (1 << k) + 1)])
        k += 1
    return t

def query(t, l, r):          # min of a[l:r], with l < r
    k = (r - l).bit_length() - 1
    return min(t[k][l], t[k][r - (1 << k)])`}
      />
      <p>
        <code>1 &lt;&lt; k</code> is{" "}
        <M>
          2<sup>k</sup>
        </M>
        : the bit 1 moved <M>k</M> places to the left. Row <M>k</M> has{" "}
        <M>
          n − 2<sup>k</sup> + 1
        </M>{" "}
        entries, one per block that fits.
      </p>

      <h2 id="which">Which operations work</h2>
      <p>The overlap method needs an operation where repeating a value changes nothing. Such an operation is called <strong>idempotent</strong>:</p>
      <ul>
        <li>minimum and maximum;</li>
        <li>greatest common divisor (MATH): <code>gcd(x, x) = x</code>;</li>
        <li>bitwise and, bitwise or.</li>
      </ul>
      <p>
        Sums are not idempotent: an overlapping value would be counted twice. A sparse table can still answer a sum by splitting the range into
        blocks that do not overlap, one per 1 bit of the length, in <M>O(log n)</M>, but prefix sums already do it in <M>O(1)</M>.
      </p>
      <Note title="When the list changes">
        <p>
          Changing one value can change about <M>n</M> entries of the table (every block that contains it). If the list changes, use a segment
          tree (lesson 4) instead: <M>O(log n)</M> for both questions and changes.
        </p>
      </Note>
    </>
  );
}
