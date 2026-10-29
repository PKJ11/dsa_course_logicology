import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BuildFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Given a whole list at once, you could push its values into a heap one at a time, for <M>O(n log n)</M> work. There is a better way: fix
        the list from the bottom up, in place, in <M>O(n)</M>. The proof is a short sum.
      </p>

      <h2 id="two">Two ways to build</h2>
      <p>
        <strong>One at a time.</strong> Treat the start of the list as a heap that grows: for each position <M>i</M> from 1 to <M>n − 1</M>, sift
        position <M>i</M> up. Each sift costs up to the depth of the node, and most nodes are deep, so this costs <M>O(n log n)</M> in the worst
        case (a decreasing list, where every value moves up to the root).
      </p>
      <p>
        <strong>Bottom up.</strong> The second half of the list, positions <code>n // 2</code> to <M>n − 1</M>, are leaves, and a single value is
        already a heap. Now walk backwards from the last parent, position <code>n // 2 - 1</code>, to the root, and sift each position down.
      </p>
      <CodeBlock
        code={`def heapify(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n)`}
      />
      <p>Step through both on the same list, 8 down to 1, and compare the comparison counts.</p>

      <BuildFigure />

      <h2 id="why">Why bottom-up works</h2>
      <Invariant label="Invariant">Before position i is sifted down, the subtrees under each of its children are already heaps.</Invariant>
      <p>
        That holds at the start, because the children of the last parent are leaves. Sifting position <M>i</M> down then makes the subtree under{" "}
        <M>i</M> a heap: it is exactly the situation of a pop, where the root is out of place and both subtrees below it are heaps. Positions are
        handled from the end backwards, so the children of <M>i</M> (at <M>2i + 1</M> and <M>2i + 2</M>, which are bigger numbers) are always
        done first. When position 0 is done, the whole list is a heap.
      </p>

      <h2 id="sum">Adding up the work</h2>
      <p>
        A sift down from a node costs at most its <strong>height</strong>: the number of levels below it. The reason is that most nodes have a
        small height. In a complete tree of <M>n</M> nodes:
      </p>
      <ul>
        <li>about <M>n/2</M> nodes are leaves (height 0) and cost nothing;</li>
        <li>
          about <M>n/4</M> have height 1, about <M>n/8</M> have height 2, and in general about{" "}
          <M>
            n/2<sup>h+1</sup>
          </M>{" "}
          have height <M>h</M> (that is, <M>n</M> halved <M>h + 1</M> times).
        </li>
      </ul>
      <p>So the total number of swaps is at most:</p>
      <CodeBlock
        code={`  n/4·1 + n/8·2 + n/16·3 + ...
= n · (1/4 + 2/8 + 3/16 + ...)
= n · 1`}
      />
      <p>
        The series in brackets adds up to exactly 1. One way to see it: write <M>2/8</M> as <M>1/8 + 1/8</M>, <M>3/16</M> as{" "}
        <M>1/16 + 1/16 + 1/16</M>, and so on, then regroup into the sums <M>1/4 + 1/8 + 1/16 + … = 1/2</M>,{" "}
        <M>1/8 + 1/16 + … = 1/4</M>, <M>1/16 + … = 1/8</M>, which together make <M>1/2 + 1/4 + 1/8 + … = 1</M>.
      </p>
      <Invariant label="Cost">Bottom-up heapify makes fewer than n swaps and fewer than 2n comparisons: O(n).</Invariant>
      <p>
        The one-at-a-time build loses because it does the opposite: the many nodes near the bottom are the ones that may travel far (up to the
        root), and the few nodes near the top travel little.
      </p>

      <h2 id="uses">Where it is used</h2>
      <ul>
        <li>
          <code>heapq.heapify(a)</code> does exactly this, in place, in <M>O(n)</M>. Use it instead of pushing values one by one when you have
          them all at the start.
        </li>
        <li>Heap sort (SORT-4) starts with this build, then pops <M>n</M> times. The build is <M>O(n)</M>; the pops are <M>O(n log n)</M>.</li>
        <li>
          Getting the <M>k</M> smallest values of a list: heapify, then pop <M>k</M> times, is <M>O(n + k log n)</M> (lesson 5).
        </li>
      </ul>
      <Note title="Is O(n) the best possible?">
        <p>
          Yes: any method has to look at every value at least once. And a heap is far easier to build than a sorted list, which needs{" "}
          <M>O(n log n)</M> comparisons (SORT-5). That gap is the difference between &ldquo;the smallest is on top&rdquo; and &ldquo;everything
          is in order&rdquo;.
        </p>
      </Note>
    </>
  );
}
