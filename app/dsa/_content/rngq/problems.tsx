import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

function HalfOpen() {
  return (
    <p>
      Every range is half-open, as in Python slices: <code>(l, r)</code> means positions <code>l</code> up to but not including <code>r</code>,
      the same values as <code>a[l:r]</code>.
    </p>
  );
}

function Counted() {
  return (
    <p>
      One test passes in numbers that count how often they are compared with <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> or{" "}
      <code>&gt;=</code> (<code>min</code> and <code>max</code> compare too). They behave like ordinary numbers otherwise. This is how the tests
      tell the method apart from slower ones, which a timer cannot always do.
    </p>
  );
}

export const RNGQ_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Adds, then sums",
    fn: "after_adds",
    lessons: [1],
    starter: `def after_adds(n, adds, queries):
    # A list of n zeros. adds: (l, r, v) means add v to a[l:r].
    # After all the adds, answer each query (l, r): sum(a[l:r]).
    pass
`,
    statement: (
      <>
        <p>
          Start with a list of <code>n</code> zeros. Apply every add in <code>adds</code>: <code>(l, r, v)</code> adds <code>v</code> to each of{" "}
          <code>a[l:r]</code>. Then return a list with the answer to each query <code>(l, r)</code>: the total of <code>a[l:r]</code>.
        </p>
        <CodeBlock
          code={`after_adds(7, [(1, 4, 2), (3, 7, 5), (0, 2, 1)],
           [(0, 7), (2, 5), (3, 4), (6, 7)])
# the list becomes [1, 3, 2, 7, 5, 5, 5]
# answers: [28, 14, 7, 5]`}
        />
        <HalfOpen />
        <p>
          Values <code>v</code> can be negative, and a range can be empty (<code>l</code> equal to <code>r</code>).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 positions, 100,000 adds and 100,000 queries. Each add and each query must cost <M>O(1)</M>, plus <M>O(n)</M> once.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>All the adds come before all the questions. Which two lists from lesson 1 turn many range adds into O(1) work each, and many range sums into O(1) each?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a difference list <code>d</code> of <code>n + 1</code> zeros. For each add, <code>d[l] += v</code> and <code>d[r] -= v</code>.
            </p>
            <p>
              Then walk once: a running total of <code>d</code> gives each value <code>a[k]</code>, and a second running total gives the prefix
              sums <code>p</code>. Each query is <code>p[r] - p[l]</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`d = [0] * (n + 1)
for l, r, v in adds: d[l] += v; d[r] -= v
p = [0] * (n + 1); run = 0
for k in range(n):
    run += d[k]              # this is a[k]
    p[k + 1] = p[k] + run
return [p[r] - p[l] for l, r in queries]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The smallest in a range",
    fn: "range_min",
    lessons: [2],
    starter: `def range_min(a, queries):
    # For each (l, r) in queries, the smallest value of a[l:r].
    # a never changes. Every range has at least one value.
    pass
`,
    statement: (
      <>
        <p>
          Return a list with the smallest value of <code>a[l:r]</code> for each query <code>(l, r)</code>. The list <code>a</code> never
          changes, and every range has at least one value.
        </p>
        <CodeBlock
          code={`range_min([5, 2, 7, 4, 6, 1, 8, 3],
          [(1, 7), (2, 5), (0, 1), (6, 8)])
# [1, 4, 5, 3]`}
        />
        <HalfOpen />
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 values and 100,000 queries. Build in <M>O(n log n)</M>, then answer each query with <M>O(1)</M> comparisons: at most{" "}
            <M>n log₂ n + 2q</M> comparisons in all for <M>q</M> queries.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Any range is covered by two blocks of the same power-of-two length, one at each end. Why is it fine if they overlap?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Build the sparse table: <code>t[0]</code> is the list, and <code>t[k][i] = min(t[k-1][i], t[k-1][i + h])</code> with{" "}
              <code>h = 2 ** (k - 1)</code>, for every <code>i</code> where a block of length <code>2 ** k</code> fits.
            </p>
            <p>
              For a query, <code>k = (r - l).bit_length() - 1</code> gives the largest power of two that fits. The answer is the smaller of{" "}
              <code>t[k][l]</code> and <code>t[k][r - 2 ** k]</code>: one comparison.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`t = [list(a)]; k = 1
while 2 ** k <= len(a):
    prev, h = t[-1], 2 ** (k - 1)
    t.append([min(prev[i], prev[i + h])
              for i in range(len(a) - 2 ** k + 1)])
    k += 1
for l, r in queries:
    k = (r - l).bit_length() - 1
    answer min(t[k][l], t[k][r - 2 ** k])`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "A Fenwick tree",
    fn: "Fenwick",
    lessons: [3],
    starter: `class Fenwick:
    def __init__(self, n):
        # n values, all 0, at positions 0 to n - 1
        pass

    def add(self, i, v):
        # add v to the value at position i
        pass

    def prefix(self, i):
        # the total of positions 0 to i - 1
        pass

    def total(self, l, r):
        # the total of positions l to r - 1
        pass
`,
    statement: (
      <>
        <p>
          Write a Fenwick tree (lesson 3) for <code>n</code> values that all start at 0. Positions count from 0, as in a Python list.{" "}
          <code>add(i, v)</code> adds <code>v</code> to position <code>i</code>, <code>prefix(i)</code> is the total of the first{" "}
          <code>i</code> values, and <code>total(l, r)</code> is the total of <code>a[l:r]</code>.
        </p>
        <CodeBlock
          code={`f = Fenwick(8)
f.add(0, 5); f.add(2, 7); f.add(5, 1)
f.prefix(3)       # 12: positions 0, 1, 2
f.total(2, 6)     # 8
f.prefix(0)       # 0`}
        />
        <p>The lesson&rsquo;s tree counts positions from 1, so add 1 to a position inside your class.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 positions and 100,000 operations, mixed. Every operation should cost <M>O(log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Store <code>t[i]</code> = the total of the last <code>i &amp; -i</code> positions ending at position i (counted from 1). Which bars cover a position, and which bars make up a prefix?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a list <code>t</code> of <code>n + 1</code> zeros. <code>add(i, v)</code>: set <code>i = i + 1</code>, then while{" "}
              <code>i &lt;= n</code>, add <code>v</code> to <code>t[i]</code> and move up with <code>i += i &amp; -i</code>.
            </p>
            <p>
              <code>prefix(i)</code>: the first <code>i</code> values are positions 1 to <code>i</code> in the tree&rsquo;s counting, so start at{" "}
              <code>i</code> as it is: while <code>i &gt; 0</code>, add <code>t[i]</code> and drop the lowest bit with{" "}
              <code>i -= i &amp; -i</code>. <code>total(l, r)</code> is <code>prefix(r) - prefix(l)</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`add(i, v): i += 1
    while i <= n: t[i] += v; i += i & -i

prefix(i): s = 0
    while i > 0: s += t[i]; i -= i & -i
    return s

total(l, r): return prefix(r) - prefix(l)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The smallest, with changes",
    fn: "MinTree",
    lessons: [4],
    starter: `class MinTree:
    def __init__(self, a):
        pass

    def set(self, i, v):
        # a[i] = v
        pass

    def smallest(self, l, r):
        # the smallest value of a[l:r] (never empty)
        pass
`,
    statement: (
      <>
        <p>
          Write a segment tree (lesson 4) for the smallest value in a range, while values change. <code>MinTree(a)</code> builds it from a list;{" "}
          <code>set(i, v)</code> changes position <code>i</code> to <code>v</code>; <code>smallest(l, r)</code> returns the smallest value of{" "}
          <code>a[l:r]</code>.
        </p>
        <CodeBlock
          code={`m = MinTree([5, 2, 7, 4, 6, 1, 8, 3])
m.smallest(0, 8)    # 1
m.smallest(2, 5)    # 4
m.set(5, 9)
m.smallest(2, 8)    # 3`}
        />
        <HalfOpen />
        <p>The list can have any length, not only a power of two. Ranges are never empty.</p>
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 values and 60,000 operations. Each <code>set</code> and <code>smallest</code> should use <M>O(log n)</M> comparisons.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 4&rsquo;s sum tree works for any operation that joins two neighbouring answers. What replaces + for the smallest value, and what replaces the 0 you start a total with?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store the tree in a list of length <code>2n</code>: leaves at <code>n</code> to <code>2n - 1</code>, and{" "}
              <code>t[k] = min(t[2k], t[2k + 1])</code> for <code>k</code> from <code>n - 1</code> down to 1.
            </p>
            <p>
              <code>set</code>: change the leaf, then recompute each parent up to position 1. <code>smallest</code>: move the two ends up as in
              the lesson&rsquo;s <code>total</code>, but keep the smallest value seen instead of a sum (start with <code>None</code> or{" "}
              <code>float(&quot;inf&quot;)</code>).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`smallest(l, r): best = None; l += n; r += n
    while l < r:
        if l is odd: best = smaller of best and t[l]; l += 1
        if r is odd: r -= 1; best = smaller of best and t[r]
        l //= 2; r //= 2
    return best`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Add to a range, sum a range",
    fn: "RangeTree",
    lessons: [5],
    starter: `class RangeTree:
    def __init__(self, n):
        # n values, all 0
        pass

    def add(self, l, r, v):
        # add v to every value of a[l:r]
        pass

    def total(self, l, r):
        # the sum of a[l:r]
        pass
`,
    statement: (
      <>
        <p>
          Write a segment tree with lazy propagation (lesson 5). There are <code>n</code> values, all starting at 0.{" "}
          <code>add(l, r, v)</code> adds <code>v</code> to every value of <code>a[l:r]</code>, and <code>total(l, r)</code> returns the sum of{" "}
          <code>a[l:r]</code>. Adds and totals come mixed, in any order.
        </p>
        <CodeBlock
          code={`t = RangeTree(8)
t.add(1, 7, 3)
t.total(0, 8)     # 18
t.total(5, 7)     # 6
t.add(0, 4, 1)
t.total(3, 5)     # 7`}
        />
        <HalfOpen />
        <p>
          <code>v</code> can be negative, and a range can be empty (then <code>add</code> does nothing and <code>total</code> is 0).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values and 4,000 operations over wide ranges. Each operation should cost <M>O(log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>When an add covers a node&rsquo;s whole range, you know exactly how its sum changes. Do its children need to change right now?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep two lists of length <code>4n</code>: <code>sum</code> and <code>tag</code>. Node 1 covers <code>a[0:n]</code>; node{" "}
              <code>k</code> covering <code>a[lo:hi]</code> has children <code>2k</code> and <code>2k + 1</code> covering the two halves.
            </p>
            <p>
              Applying <code>v</code> to a node adds <code>v * (hi - lo)</code> to its sum and <code>v</code> to its tag. In <code>add</code>{" "}
              and <code>total</code>: no overlap, return; completely inside, apply (or return the sum); otherwise push the tag to both children,
              recurse into both, and (for <code>add</code>) recompute the sum from the children.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`add(l, r, v, k=1, lo=0, hi=n):
    if r <= lo or hi <= l: return
    if l <= lo and hi <= r: apply(k, hi - lo, v); return
    mid = (lo + hi) // 2; push(k, lo, mid, hi)
    add(l, r, v, 2k, lo, mid); add(l, r, v, 2k + 1, mid, hi)
    sum[k] = sum[2k] + sum[2k + 1]

push(k, lo, mid, hi): if tag[k]:
    apply(2k, mid - lo, tag[k]); apply(2k + 1, hi - mid, tag[k])
    tag[k] = 0`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Blocks: add and largest",
    fn: "Blocks",
    lessons: [6],
    starter: `class Blocks:
    def __init__(self, a):
        pass

    def add(self, l, r, v):
        # add v to every value of a[l:r]
        pass

    def largest(self, l, r):
        # the largest value of a[l:r] (never empty)
        pass
`,
    statement: (
      <>
        <p>
          Use square-root decomposition (lesson 6) for two operations on a list: <code>add(l, r, v)</code> adds <code>v</code> to every value of{" "}
          <code>a[l:r]</code>, and <code>largest(l, r)</code> returns the largest value of <code>a[l:r]</code>.
        </p>
        <CodeBlock
          code={`b = Blocks([5, 2, 7, 4, 6, 1, 8, 3])
b.largest(0, 8)     # 8
b.add(1, 7, 3)      # [5, 5, 10, 7, 9, 4, 11, 3]
b.largest(3, 6)     # 9`}
        />
        <HalfOpen />
        <p>
          Ranges for <code>largest</code> are never empty; an empty range for <code>add</code> changes nothing. A lazy segment tree also solves
          this, and passes the tests.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 160,000 values and 2,000 operations over wide ranges. Each operation should cost about <M>O(√n)</M>; looping over the whole
            range is too slow.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>With blocks of about √n values, every range is two partial blocks plus some whole blocks. What can a whole block remember, so that an add to all of it costs O(1)?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Choose <code>b = int(n ** 0.5)</code> (at least 1). Keep the values, a <code>tag</code> per block (an add not yet applied to its
              cells) and a <code>top</code> per block (its largest stored value). A value&rsquo;s true size is its stored value plus its
              block&rsquo;s tag.
            </p>
            <p>
              <code>add</code>: change the cells of the partial pieces one by one and recompute those blocks&rsquo; <code>top</code>; add{" "}
              <code>v</code> to the tag of each whole block. <code>largest</code>: check the cells of the partial pieces (plus their tags) and{" "}
              <code>top + tag</code> of each whole block.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`add(l, r, v):
    while l < r and l % b != 0: a[l] += v; l += 1
    fix the top of the block just left
    while l + b <= r: tag[l // b] += v; l += b
    while l < r: a[l] += v; l += 1
    fix the top of the block l is in

largest(l, r): the same three parts, using
    a[i] + tag[i // b] for cells, top[k] + tag[k] for blocks`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
