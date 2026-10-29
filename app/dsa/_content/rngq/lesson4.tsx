import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SegmentFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A segment tree stores the answer for a range, then for each half of it, then for each quarter, down to single values. Any range can be
        made from O(log n) of these pieces, and changing one value changes only one piece per level. It works for sums, minimums and almost any
        other way of combining values.
      </p>

      <h2 id="tree">A tree of ranges</h2>
      <p>
        The root covers the whole list. Every node that covers more than one position has two children: the left half of its range and the right
        half. The leaves cover one position each, and they are the values themselves. Every node stores the answer for its range, here the sum,
        found from its two children.
      </p>
      <p>
        In the figure, the array cells are the leaves, and every bar above them is a node over exactly the cells it covers; the two bars just
        below a bar are its children. With <M>n</M> leaves there are <M>n − 1</M> other nodes, and about <M>log₂ n</M> levels.
      </p>
      <Invariant>Every node holds the sum of the values in its range, which is the sum of its two children.</Invariant>

      <SegmentFigure />

      <h2 id="ask">Asking</h2>
      <p>To find the sum of a range, start at the root and, at each node, compare its range with the asked range:</p>
      <ul>
        <li>no overlap: contribute nothing, and do not go below;</li>
        <li>the node&rsquo;s range lies completely inside: contribute its stored sum, and do not go below;</li>
        <li>partly inside: ask both children and add their answers.</li>
      </ul>
      <p>
        Why <M>O(log n)</M>? On any level, the nodes that are only partly inside must contain one of the two ends of the asked range, so there are
        at most two of them. Only those are opened, so each level has at most four nodes visited, and there are about <M>log₂ n</M> levels.
        Step through &ldquo;Sum of a[2:7]&rdquo;.
      </p>

      <h2 id="update">Changing a value</h2>
      <p>
        Changing <code>a[i]</code> changes the sum of every node whose range contains <M>i</M>: exactly one node per level, on the path from the
        leaf up to the root. Recompute each from its two children, from the bottom up. That is <M>O(log n)</M>.
      </p>

      <h2 id="code">Stored in a list</h2>
      <p>
        Like a heap (HEAP-1), the tree fits in a list with no links. A short and fast way, often used in Python, puts the <M>n</M> leaves at
        positions <M>n</M> to <M>2n − 1</M> and the node at position <M>k</M> above its children at <M>2k</M> and <M>2k + 1</M>. Position 1 is
        the root, and position 0 is not used.
      </p>
      <CodeBlock
        title="segment_tree.py"
        code={`class SumTree:
    def __init__(self, a):
        n = self.n = len(a)
        t = self.t = [0] * n + list(a)        # leaves at n .. 2n - 1
        for k in range(n - 1, 0, -1):
            t[k] = t[2 * k] + t[2 * k + 1]

    def set(self, i, v):                      # a[i] = v
        t = self.t
        k = i + self.n
        t[k] = v
        while k > 1:
            k //= 2
            t[k] = t[2 * k] + t[2 * k + 1]

    def total(self, l, r):                    # sum of a[l:r]
        t = self.t
        s = 0
        l += self.n
        r += self.n
        while l < r:
            if l & 1:                         # l is a right child
                s += t[l]
                l += 1
            if r & 1:                         # r - 1 is a left child
                r -= 1
                s += t[r]
            l //= 2
            r //= 2
        return s`}
      />
      <p>
        This version works from the leaves upwards, and it works for any <M>n</M>, not only powers of two. The two ends of the range move up one
        level per step. When the left end is a right child, its parent reaches outside the range, so the node is added on its own and the end
        moves one place right; the right end does the same, mirrored. It visits the same <M>O(log n)</M> nodes as the top-down walk of the
        figure, without recursion. <code>l &amp; 1</code> is 1 when <M>l</M> is odd.
      </p>

      <h2 id="combine">Any operation that combines</h2>
      <p>
        Nothing above needs subtraction. Replace <code>+</code> by any operation that can join the answers of two neighbouring ranges, and the
        tree works the same way. Such an operation must be <strong>associative</strong>: <M>(x ∘ y) ∘ z = x ∘ (y ∘ z)</M>, so that the order in
        which pieces are joined does not matter (∘ stands for the operation). For example:
      </p>
      <ul>
        <li>
          minimum or maximum (use <code>min</code>, and start the total at <code>float(&quot;inf&quot;)</code> instead of 0);
        </li>
        <li>greatest common divisor;</li>
        <li>the number of times the maximum appears, stored as a pair (maximum, count);</li>
        <li>the largest total of a stretch inside the range, stored as four numbers per node.</li>
      </ul>
      <p>
        If the operation is not commutative (<M>x ∘ y</M> differs from <M>y ∘ x</M>, as for joining strings), keep the left and right pieces
        apart in <code>total</code> and join them in order. Practice RNGQ-P4 asks for a minimum tree with changes.
      </p>
      <Note title="Segment tree or Fenwick tree?">
        <p>
          For sums with single-value changes, a Fenwick tree is shorter, uses half the memory and is a little faster. A segment tree handles
          minimum and maximum with changes, operations without an inverse, and (lesson 5) changes to whole ranges.
        </p>
      </Note>
    </>
  );
}
