import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { CompressFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A find goes up a path to the root anyway. On the way back, it can point every node on that path straight at the root. The next find from
        any of those nodes then takes one step.
      </p>

      <h2 id="idea">Shorten the path while you use it</h2>
      <p>
        The parent of a node can be any element of the same set: the invariant of lesson 1 only needs every node to reach the right root.
        Pointing a node directly at its root keeps that true, and makes the node&rsquo;s path as short as possible. Doing this for every node on
        the path of a find is called <strong>path compression</strong>.
      </p>
      <p>
        Everything below a re-pointed node moves up with it, because its own parent pointer is unchanged. Step through the figure: one find from
        the bottom of a tall tree shortens the paths of four elements, including 5, which was not even on the path.
      </p>

      <CompressFigure />

      <h2 id="code">Two passes, or one</h2>
      <p>Full compression walks the path twice: once to find the root, and once more to re-point every node on it.</p>
      <CodeBlock
        code={`def find(self, x):
    root = x
    while self.parent[root] != root:     # first pass: find the root
        root = self.parent[root]
    while self.parent[x] != root:        # second pass: re-point
        self.parent[x], x = root, self.parent[x]
    return root`}
      />
      <p>
        The last line does two things at once. Python works out the whole right side first, so it reads the old parent of <M>x</M> before
        anything changes; then it points <M>x</M> at the root and moves <M>x</M> up to that old parent.
      </p>
      <p>
        <strong>Path halving</strong> (the second variant) does the job in one pass: every node it visits is pointed at its grandparent, and the
        walk jumps to that grandparent. It does not shorten the path all the way at once, but repeated finds do, and the cost bound of lesson 4
        is the same.
      </p>
      <CodeBlock
        code={`def find(self, x):
    p = self.parent
    while p[x] != x:
        p[x] = p[p[x]]       # point at the grandparent
        x = p[x]
    return x`}
      />

      <h2 id="together">Using both</h2>
      <p>
        Path compression works with union by rank without any change. Compression only moves nodes closer to their root; it never changes which
        node is a root, and it never changes a rank. So after compression a rank is no longer the exact height, only an upper bound on it, and
        the proof of lesson 2 still holds.
      </p>
      <p>
        Each method alone already gives <M>O(log n)</M> per operation: union by rank in the worst case, path compression on average over a long
        run of operations. Together they give much more than either: an average cost that is at most 4 or 5 steps for any input that fits in a
        computer. Lesson 4 explains that claim.
      </p>
      <CodeBlock
        title="dsu.py"
        code={`class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        p = self.parent
        while p[x] != x:
            p[x] = p[p[x]]
            x = p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] > self.size[rb]:
            ra, rb = rb, ra
        self.parent[ra] = rb
        self.size[rb] += self.size[ra]
        return True`}
      />
      <p>This short class is the version to remember. It is about fifteen lines and handles millions of operations a second in C, and hundreds of thousands in Python.</p>

      <h2 id="recursion">A warning about recursion</h2>
      <p>Many books write compression as a recursive function, which is short and clear:</p>
      <CodeBlock
        code={`def find(self, x):
    if self.parent[x] != x:
        self.parent[x] = self.find(self.parent[x])
    return self.parent[x]`}
      />
      <p>
        With union by rank the trees are at most <M>log₂ n</M> tall, so the recursion is never deep. Without a union rule, a single find can
        meet a path of 100,000 nodes, and Python stops with a <code>RecursionError</code> at about 1,000 levels. The loop versions above have no
        such limit. Practice DSUF-P1 has a test that builds exactly such a path.
      </p>
      <Note title="Why not compress in union?">
        <p>
          Union calls find on both elements, so it already compresses both paths. Nothing else is needed.
        </p>
      </Note>
    </>
  );
}
