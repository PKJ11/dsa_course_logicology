import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SqrtFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Cut the list into blocks of about √n values and keep one summary per block. Every range is then a few whole blocks plus two short
        pieces. It is slower than a segment tree, O(√n) instead of O(log n), but it is simple and it bends to questions that trees handle badly.
      </p>

      <h2 id="blocks">Blocks</h2>
      <p>
        The <strong>square root</strong> of <M>n</M>, written <M>√n</M>, is the number with <M>√n × √n = n</M>. For example, √100 = 10, because 10 × 10 = 100, and
        √1,000,000 = 1,000. Cut the list into blocks of <M>b</M> values, about <M>√n</M>, so there are about <M>√n</M> blocks too. For each block keep a
        summary: its sum, its minimum, or whatever the question needs. Position <M>i</M> is in block <code>i // b</code>.
      </p>
      <p>A range question is answered in three parts:</p>
      <ul>
        <li>the start of the range, inside its first block: read those cells one by one;</li>
        <li>the whole blocks in the middle: read their summaries;</li>
        <li>the end of the range, inside its last block: read those cells one by one.</li>
      </ul>
      <SqrtFigure />
      <Invariant>A range touches at most two partial blocks and at most n / b whole blocks.</Invariant>
      <p>
        So a question costs at most <M>2b + n/b</M> steps. A change to one value updates the value and its block&rsquo;s summary: <M>O(1)</M> for a
        sum (add the difference), or <M>O(b)</M> to recompute a minimum.
      </p>

      <h2 id="size">Choosing the block size</h2>
      <p>
        Small blocks make the partial pieces short but give many whole blocks; big blocks do the opposite. The total <M>b + n/b</M> is smallest
        when the two parts are equal, <M>b = n/b</M>, that is <M>b = √n</M>. Then a question costs <M>O(√n)</M>. For a million values that is
        about 3,000 steps, against about 40 for a segment tree, and a million for a plain scan.
      </p>
      <p>
        In practice, measure: in Python, reading a block&rsquo;s cells with a built-in such as <code>sum(a[i:j])</code> runs in C and is much
        faster than a loop over summaries, so somewhat larger blocks often win.
      </p>

      <h2 id="lazy">Range changes on blocks</h2>
      <p>
        Lazy tags (lesson 5) are simple here: one tag per block. To add <M>v</M> to a range, add it to the cells of the two partial pieces (and
        fix those blocks&rsquo; summaries), and add <M>v</M> to the tag of every whole block in between, which also shifts that block&rsquo;s
        summary. The true value of a cell is its stored value plus its block&rsquo;s tag.
      </p>
      <CodeBlock
        title="blocks.py"
        code={`class Blocks:                       # range add, range maximum
    def __init__(self, a):
        self.a = list(a)
        self.b = b = max(1, int(len(a) ** 0.5))
        self.tag = [0] * ((len(a) + b - 1) // b)
        self.top = [max(self.a[i:i + b]) for i in range(0, len(a), b)]

    def add(self, l, r, v):             # a[l:r] += v
        b, a = self.b, self.a
        while l < r and l % b:          # the start, cell by cell
            a[l] += v; l += 1
        self._fix((l - 1) // b)
        while l + b <= r:               # whole blocks: just the tag
            self.tag[l // b] += v; l += b
        k = l // b
        while l < r:                    # the end, cell by cell
            a[l] += v; l += 1
        self._fix(k)

    def _fix(self, k):                  # recompute one block's maximum
        if 0 <= k < len(self.top):
            b = self.b
            self.top[k] = max(self.a[k * b:(k + 1) * b])`}
      />
      <p>
        <code>top[k]</code> stores the largest stored value of block <M>k</M>, without its tag; the true largest is{" "}
        <code>top[k] + tag[k]</code>. A question does the same three parts as before, adding each block&rsquo;s tag. Practice RNGQ-P6 completes
        this class.
      </p>

      <h2 id="when">When to use it</h2>
      <ul>
        <li>
          <strong>Odd questions.</strong> &ldquo;How many values in <code>a[l:r]</code> are less than <M>x</M>?&rdquo;, with changes. Keep each
          block sorted: a whole block answers with a binary search (BSRC), a partial piece with a scan. A segment tree would need a sorted list
          at every node.
        </li>
        <li>
          <strong>Mo&rsquo;s algorithm.</strong> When all the questions are known in advance, sort them by the block of their start, then by
          their end. Moving the range from one question to the next then adds and removes only about <M>√n</M> cells on average, so questions
          such as &ldquo;how many different values are in this range?&rdquo; cost <M>O((n + q)√n)</M> for <M>q</M> questions.
        </li>
        <li>
          <strong>A quick first version.</strong> It is easy to get right. If it is fast enough, it may be all you need; if not, it is a
          reliable check for a faster tree.
        </li>
      </ul>
      <Note title="The same idea elsewhere">
        <p>
          Splitting work into √n groups appears in many places: the skip list of BALT-6 with two levels, &ldquo;baby-step giant-step&rdquo; for
          discrete logarithms (MATH), and rebuilding a structure from scratch after every √n changes.
        </p>
      </Note>
    </>
  );
}
