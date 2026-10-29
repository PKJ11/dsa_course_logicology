import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FenwickFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        When the values change, prefix sums break: changing one value changes every prefix sum after it. A Fenwick tree stores a cleverly
        chosen set of partial sums, so that both a prefix sum and an update touch only about log₂ n of them. The whole structure is one list and
        two short loops.
      </p>

      <h2 id="change">Sums that change</h2>
      <p>Two operations, mixed in any order:</p>
      <ul>
        <li>
          <code>add(i, v)</code>: add <M>v</M> to the value at position <M>i</M>;
        </li>
        <li>
          <code>prefix(i)</code>: the total of the first <M>i</M> values. A range total is then <code>prefix(r) − prefix(l)</code>, as in lesson
          1.
        </li>
      </ul>
      <p>
        A plain list makes <code>add</code> cost <M>O(1)</M> and <code>prefix</code> cost <M>O(n)</M>. A list of prefix sums does the opposite.
        A <strong>Fenwick tree</strong> (Peter Fenwick, 1994; also called a <strong>binary indexed tree</strong>, BIT) makes both{" "}
        <M>O(log n)</M>.
      </p>

      <h2 id="lowbit">The lowest 1 bit</h2>
      <p>
        Count positions from 1, not 0: it makes the binary method work. Write a position <M>i</M> in binary, and look at its lowest 1 bit, the
        rightmost 1. Call its value <M>low(i)</M>. For 6 = <code>110</code> it is 2; for 7 = <code>111</code> it is 1; for 8 ={" "}
        <code>1000</code> it is 8. In Python, <code>i &amp; -i</code> gives it. (<code>&amp;</code> keeps the bits that are 1 in both numbers, and
        in the way computers store <code>-i</code>, the only 1 bit it shares with <M>i</M> is the lowest one.)
      </p>
      <Invariant>t[i] holds the total of the low(i) values that end at position i: positions i − low(i) + 1 to i.</Invariant>
      <p>
        So odd positions hold just their own value, <code>t[6]</code> holds positions 5 and 6, <code>t[4]</code> holds 1 to 4, and{" "}
        <code>t[8]</code> holds 1 to 8. The figure draws each <code>t[i]</code> as a bar that ends at position <M>i</M>, in a row for its length.
      </p>

      <FenwickFigure />

      <h2 id="ops">Prefix sum and update</h2>
      <p>
        <strong>Prefix sum.</strong> Start with <M>i</M> and add <code>t[i]</code>; it covers the last <M>low(i)</M> positions. The positions
        still missing are 1 to <M>i − low(i)</M>, so continue from there. Taking away the lowest 1 bit each time, the loop runs once per 1 bit of{" "}
        <M>i</M>: at most <M>log₂ n + 1</M> times. For 7 = <code>111</code>: <code>t[7] + t[6] + t[4]</code>.
      </p>
      <p>
        <strong>Update.</strong> Changing position <M>i</M> must change every <code>t[j]</code> whose range covers <M>i</M>. The first is{" "}
        <code>t[i]</code> itself. The next is found by <em>adding</em> the lowest 1 bit: <M>i + low(i)</M>. Each step makes the lowest 1 bit at
        least twice as large, so there are at most <M>log₂ n + 1</M> steps. For 3: <code>t[3]</code>, <code>t[4]</code>, <code>t[8]</code>.
      </p>

      <h2 id="code">The code</h2>
      <CodeBlock
        title="fenwick.py"
        code={`class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)        # t[0] is not used

    def add(self, i, v):              # position i, counted from 1
        while i <= self.n:
            self.t[i] += v
            i += i & -i               # the next bar that covers i

    def prefix(self, i):              # total of positions 1..i
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i               # drop the lowest 1 bit
        return s`}
      />
      <p>
        To use positions from 0, as Python lists do, call <code>add(i + 1, v)</code>: the total of <code>a[0:i]</code> is then{" "}
        <code>prefix(i)</code>. To build from a list of <M>n</M> values, calling <code>add</code> <M>n</M> times costs <M>O(n log n)</M>. An{" "}
        <M>O(n)</M> build copies the values into <code>t</code>, then for each <M>i</M> from 1 up adds <code>t[i]</code> into{" "}
        <code>t[i + low(i)]</code> (if that is at most <M>n</M>).
      </p>

      <h2 id="why">Why it works</h2>
      <p>
        <strong>The prefix loop covers 1 to i exactly once.</strong> Each step covers positions <M>i − low(i) + 1</M> to <M>i</M>, and then
        continues from <M>i − low(i)</M>, so the pieces are next to each other with no gap and no overlap, down to 0.
      </p>
      <p>
        <strong>The update loop finds every bar that covers i.</strong> A bar <code>t[j]</code> covers <M>i</M> when <M>j ≥ i</M> and{" "}
        <M>j − low(j) &lt; i</M>. Start at <M>j = i</M>. Adding <M>low(j)</M> clears a run of 1 bits and sets the next 0 bit above them, so the
        new <M>j</M> agrees with the old one in all higher bits and has a larger low bit: its bar reaches back past the old one. Any <M>j</M>{" "}
        skipped over would have a low bit too small to reach back to <M>i</M>. So the loop visits exactly the bars that cover <M>i</M>, one per
        row of the figure.
      </p>
      <p>
        A Fenwick tree needs an operation with an inverse (for range totals by subtraction), so it is used for sums, counts and XOR. It is
        smaller and faster than a segment tree, but less general.
      </p>
      <Note title="A common use: counting inversions">
        <p>
          To count pairs <M>i &lt; j</M> with <code>a[i] &gt; a[j]</code> (the inversions of SORT-1; SORT-2 counts them with merge sort), read the list from left to right, and
          for each value ask how many earlier values were larger: <code>prefix(max) − prefix(x)</code> on a Fenwick tree of counts. Then add 1
          at <M>x</M>. That is <M>O(n log n)</M> in all.
        </p>
      </Note>
    </>
  );
}
