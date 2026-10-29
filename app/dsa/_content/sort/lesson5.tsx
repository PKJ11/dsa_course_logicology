import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { DecisionFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Merge sort and heap sort take <M>O(n log n)</M>. Could another method do better? Not if it learns about the values only by comparing
        them. This lesson proves it, and the proof is short.
      </p>

      <h2 id="model">Sorting by comparing</h2>
      <p>
        A <em>comparison sort</em> learns about the values only by asking questions of the form &ldquo;is <M>x &lt; y</M>?&rdquo;. Every sort so far
        in this station is one. It may move values around however it likes, but its choices can depend only on the answers it has had.
      </p>

      <h2 id="tree">The decision tree</h2>
      <p>
        So any comparison sort, run on lists of a fixed length <M>n</M>, can be drawn as a tree. Each box is a comparison. The answer picks the left
        or right branch. A leaf is reached when the sort knows the order. Step through the tree for three values:
      </p>

      <DecisionFigure />

      <p>
        The number of comparisons on an input is the length of its path from the top to a leaf. The worst case is the longest path: the{" "}
        <em>height</em> of the tree.
      </p>

      <h2 id="proof">The proof</h2>
      <ol>
        <li>
          The values could arrive in any of <M>n!</M> orders. Each order needs a different rearrangement to sort it, so each must reach a different
          leaf. The tree has at least <M>n!</M> leaves.
        </li>
        <li>
          Each comparison has two answers, so a tree of height <M>h</M> has at most <M>2ʰ</M> leaves (h twos multiplied together).
        </li>
        <li>
          So <M>2ʰ</M> is at least <M>n!</M>, which means <M>h</M> is at least <M>log₂(n!)</M>: the number of times <M>n!</M> can be halved.
        </li>
        <li>
          At least half of the numbers <M>1, 2, …, n</M> are <M>n/2</M> or more, so <M>n!</M> is at least <M>(n/2)<sup>n/2</sup></M>: n/2 copies of n/2 multiplied together. Then{" "}
          <M>log₂(n!)</M> is at least <M>(n/2) log₂(n/2)</M>, which grows like <M>n log n</M>. This is written <M>Ω(n log n)</M>: Ω means &ldquo;at least this fast, for large n&rdquo;.
        </li>
      </ol>
      <Invariant label="Theorem">Every comparison sort makes Ω(n log n) comparisons in the worst case.</Invariant>
      <p>
        Merge sort and heap sort meet this bound, so they are <em>optimal</em> among comparison sorts. No comparison sort can beat them by more
        than a constant factor (a fixed multiple), unless it does something other than compare.
      </p>

      <h2 id="beyond">Sorting faster than the bound</h2>
      <p>The proof assumes the sort learns only from comparisons. There are two ways to do better:</p>
      <ul>
        <li>
          <strong>Use the values themselves.</strong> If the values are small whole numbers, they can be used as list positions. Counting sort and
          radix sort (lesson 6) do this and run in <M>O(n)</M> for suitable inputs.
        </li>
        <li>
          <strong>Use what you know about the input.</strong> On a nearly sorted list, insertion sort is <M>O(n + I)</M> (lesson 1). The bound is
          about the worst case over all inputs, not about every input.
        </li>
      </ul>
      <Note title="The same idea elsewhere">
        <p>
          The same counting argument shows that searching a sorted list by comparisons needs <M>Ω(log n)</M> comparisons: there are <M>n + 1</M>{" "}
          possible answers, so the tree needs that many leaves. Binary search (<Link href="/dsa/bsrc/1/">BSRC-1</Link>) is optimal. Hashing beats it
          by not comparing.
        </p>
      </Note>
    </>
  );
}
