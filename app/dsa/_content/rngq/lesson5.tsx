import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { LazyFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Adding a value to every position of a range would change up to n leaves of a segment tree. Lazy propagation changes only the O(log n)
        nodes that cover the range, and leaves a note on each saying what the nodes below it still owe. The note is passed down only when
        someone needs to look below.
      </p>

      <h2 id="range">Changing a whole range</h2>
      <p>
        Now the operations are <code>add(l, r, v)</code>, add <M>v</M> to every value of <code>a[l:r]</code>, and <code>total(l, r)</code>, the
        sum of <code>a[l:r]</code>, mixed in any order. The difference list of lesson 1 handles the adds, but only when every question comes after
        every add. A segment tree with single-value changes would need <M>r − l</M> changes per add.
      </p>
      <p>
        The idea: a range add visits the same <M>O(log n)</M> nodes as a range question. A node that lies completely inside the range knows
        exactly how its own sum changes: by <M>v</M> times the number of positions it covers. Its children change too, but nobody has asked about
        them yet.
      </p>

      <h2 id="tags">Tags</h2>
      <p>
        So give every node a second number, a <strong>tag</strong> (also called a lazy value): an amount that must still be added to every
        position below the node, but has not reached its children yet.
      </p>
      <Invariant>
        A node&rsquo;s sum is correct for its range. Its children are correct once every tag above them has been passed down.
      </Invariant>
      <p>
        A range add then works like a range question. When a node lies completely inside the range, add <M>v</M> times its length to its sum,
        add <M>v</M> to its tag, and stop there. When it is only partly inside, go to both children and, on the way back, recompute its sum from
        theirs. Step through &ldquo;Add 3 to a[1:7]&rdquo;: two nodes get tags, and the cells below them keep their old values.
      </p>

      <LazyFigure />

      <h2 id="push">Pushing a tag down</h2>
      <p>
        Before any operation goes below a node with a tag, it <strong>pushes</strong> the tag down: each child adds the tag times its own length
        to its sum, and adds the tag to its own tag. Then the node&rsquo;s tag is cleared. Now the children are correct, and the walk can go on.
        Step through &ldquo;Then sum a[5:7]&rdquo;.
      </p>
      <p>
        A push costs <M>O(1)</M> and happens only at a node that the walk visits anyway. So the walk still visits <M>O(log n)</M> nodes, and
        both operations stay <M>O(log n)</M>, however large the ranges. A tag can wait below a node for a long time, and several adds can pile up
        in one tag, because adding is the same whatever the order: <M>+2</M> then <M>+3</M> is <M>+5</M>.
      </p>

      <h2 id="code">The code</h2>
      <CodeBlock
        title="lazy_tree.py"
        code={`class RangeTree:
    def __init__(self, n):
        self.n = n
        self.sum = [0] * (4 * n)
        self.tag = [0] * (4 * n)

    def _apply(self, k, length, v):    # node k gets +v everywhere
        self.sum[k] += v * length
        self.tag[k] += v

    def _push(self, k, lo, mid, hi):
        if self.tag[k]:
            self._apply(2 * k, mid - lo, self.tag[k])
            self._apply(2 * k + 1, hi - mid, self.tag[k])
            self.tag[k] = 0

    def add(self, l, r, v, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n                  # node k covers a[lo:hi]
        if r <= lo or hi <= l:
            return                       # no overlap
        if l <= lo and hi <= r:
            self._apply(k, hi - lo, v)   # completely inside: tag it
            return
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        self.add(l, r, v, 2 * k, lo, mid)
        self.add(l, r, v, 2 * k + 1, mid, hi)
        self.sum[k] = self.sum[2 * k] + self.sum[2 * k + 1]

    def total(self, l, r, k=1, lo=0, hi=None):
        if hi is None:
            hi = self.n
        if r <= lo or hi <= l:
            return 0
        if l <= lo and hi <= r:
            return self.sum[k]
        mid = (lo + hi) // 2
        self._push(k, lo, mid, hi)
        return (self.total(l, r, 2 * k, lo, mid)
                + self.total(l, r, 2 * k + 1, mid, hi))`}
      />
      <p>
        Here the tree is stored top-down: node 1 covers <code>a[0:n]</code>, and node <M>k</M> covering <code>a[lo:hi]</code> has children{" "}
        <M>2k</M> and <M>2k + 1</M> covering the two halves. When <M>n</M> is not a power of two the numbering has gaps, and <M>4n</M> places are
        always enough. The recursion is only about <M>log₂ n</M> deep, so Python&rsquo;s recursion limit is no problem. Practice RNGQ-P5 asks for
        this class.
      </p>
      <p>
        Other pairs of change and question work the same way, as long as a tag can be applied to a whole node in <M>O(1)</M> and two tags can be
        joined into one: &ldquo;set every value to <M>v</M>&rdquo; with sums (a later set replaces an earlier tag), or &ldquo;add <M>v</M>
        &rdquo; with minimum (the minimum grows by <M>v</M>, whatever the length).
      </p>
      <Note title="Two Fenwick trees can do it too">
        <p>
          For range add with range sum there is a neat Fenwick version: keep two Fenwick trees, one for the adds and one for the adds times their
          positions, and combine them to get prefix sums. It is shorter and faster, but it works only for this one pair of operations.
        </p>
      </Note>
    </>
  );
}
