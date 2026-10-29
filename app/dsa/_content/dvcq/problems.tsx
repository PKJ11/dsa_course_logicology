import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

function Counted({ what }: { what: string }) {
  return (
    <p>
      The tests pass {what} as special number objects that count every comparison made with them (<code>&lt;</code>, <code>&lt;=</code>,{" "}
      <code>&gt;</code>, <code>&gt;=</code>; <code>==</code> is not counted). They behave like normal numbers, and <code>max()</code> and{" "}
      <code>min()</code> count too. Return the values you were given, not copies made with <code>int()</code>.
    </p>
  );
}

export const DVCQ_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Largest and smallest together",
    fn: "max_min",
    lessons: [1],
    starter: `def max_min(values):
    # Return (largest, smallest), using at most 3 * n // 2
    # comparisons, where n = len(values).
    pass
`,
    statement: (
      <>
        <p>
          Return the pair <code>(largest, smallest)</code> of a list of at least one number. Finding each one separately takes <M>2n − 2</M>{" "}
          comparisons. Do it with at most <code>3 * n // 2</code> comparisons, where n is the number of values (3n/2, rounded down).
        </p>
        <CodeBlock
          code={`max_min([3, 7, 1, 9, 4])   # (9, 1), at most 7 comparisons
max_min([5])               # (5, 5), no comparisons needed`}
        />
        <Counted what="the values" />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 values, in any order. The limit on comparisons holds for every n, odd or even.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Compare two values with each other first. The larger one cannot be the smallest, and the smaller one cannot be the largest.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Take the values two at a time. For each pair, 1 comparison finds its larger and smaller value; then compare the larger with the
              largest so far and the smaller with the smallest so far. That is 3 comparisons for every 2 values.
            </p>
            <p>
              Start so that the rest pairs up exactly: with an odd n, the first value is both the largest and the smallest so far (0
              comparisons); with an even n, the first two values are the first pair (1 comparison). A recursive split also works if the left
              part always has an even size; halves of odd size waste comparisons.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if n is odd: big = small = values[0]; start = 1
else: big, small = the larger and smaller of values[0], values[1]
      start = 2
for i = start, start + 2, ... while i + 1 < n:
    a, b = values[i], values[i + 1]
    if a < b: swap them, so that a >= b
    if a > big: big = a
    if b < small: small = b
return (big, small)`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The skyline",
    fn: "skyline",
    lessons: [1, 2],
    starter: `def skyline(buildings):
    # buildings: a list of (left, right, height).
    # Return the outline as a list of (x, height) points.
    pass
`,
    statement: (
      <>
        <p>
          Seen from far away, a row of buildings makes one outline against the sky. Each building is a rectangle standing on the ground,
          given as <code>(left, right, height)</code>: it covers the x values from <code>left</code> up to, but not including,{" "}
          <code>right</code>. Return the outline as a list of <strong>key points</strong> <code>(x, h)</code>: at x the outline&rsquo;s height
          changes to h. Between buildings the height is 0.
        </p>
        <CodeBlock
          code={`skyline([(2, 9, 10), (3, 7, 15), (5, 12, 12),
         (15, 20, 10), (19, 24, 8)])
# [(2, 10), (3, 15), (7, 12), (12, 0),
#  (15, 10), (20, 8), (24, 0)]`}
        />
        <ul>
          <li>The points are sorted by x, and there is exactly one point for each x where the height changes.</li>
          <li>Two neighbouring points never have the same height: if the height does not change at some x, there is no point there.</li>
          <li>The last point has height 0. No buildings give <code>[]</code>.</li>
        </ul>
        <p>Points may be tuples or lists. All numbers are whole numbers, <code>left &lt; right</code>, and every height is at least 1.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 50,000 buildings, in any order. Aim for <M>O(n log n)</M>: divide and conquer, as lesson 2&rsquo;s first worked example
            describes.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            One building&rsquo;s outline is two points: <code>(left, height)</code> and <code>(right, 0)</code>. If you had the outlines of the
            two halves of the list, how would you join them?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Split the buildings in half, find each half&rsquo;s outline by recursion, and merge the two outlines like two sorted lists, by x.
              Keep the current height of each outline (<code>hp</code> and <code>hq</code>, both 0 at the start). At each x, update the height of
              the outline (or outlines) that has a point there; the merged height is the larger of the two.
            </p>
            <p>
              When both outlines have a point at the same x, take both at once. Add a point only when the merged height differs from the last
              point&rsquo;s height. The merge is <M>O(n)</M>, so <M>T(n) = 2 T(n/2) + O(n)</M>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def merge(p, q):
    out = []; i = j = 0; hp = hq = 0
    while i < len(p) or j < len(q):
        if q is used up, or p[i].x < q[j].x: x, hp = p[i]; i += 1
        elif p is used up, or q[j].x < p[i].x: x, hq = q[j]; j += 1
        else: x, hp = p[i]; hq = q[j].h; i += 1; j += 1
        h = max(hp, hq)
        if out is empty or out[-1].h != h: out.append((x, h))
    return out

def solve(lo, hi):     # buildings[lo:hi]
    one building: [(left, h), (right, 0)]
    otherwise: merge(solve(lo, mid), solve(mid, hi))`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Smaller values to the right",
    fn: "smaller_after",
    lessons: [3],
    starter: `def smaller_after(values):
    # For each position i, how many later values are smaller
    # than values[i]? Return the counts as a list.
    pass
`,
    statement: (
      <>
        <p>
          For every position <code>i</code> of a list of numbers, count the positions <code>j &gt; i</code> with{" "}
          <code>values[j] &lt; values[i]</code>. Return the counts as a list of the same length.
        </p>
        <CodeBlock
          code={`smaller_after([5, 2, 6, 1])   # [2, 1, 1, 0]
smaller_after([3, 3, 3])      # [0, 0, 0]: equal is not smaller`}
        />
        <p>The counts add up to the number of inversions of the list (lesson 3). The values may be negative and may repeat.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values, in any order, including an order that is already sorted. Aim for <M>O(n log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            In merge sort, when a value from the left half is placed into the merged list, which right-half values have already been placed?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Merge sort a list of positions, comparing <code>values[p]</code>. When a left position is placed, the <code>j</code> right
              positions already placed hold smaller values that came later in the list: add <code>j</code> to that position&rsquo;s count. On a
              tie, place the left position first, so equal values are not counted.
            </p>
            <p>
              A bottom-up merge sort (widths 1, 2, 4, …) needs no recursion. A Fenwick tree over the ranks of the values, read from right to
              left, also works (RNGQ-3).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`counts = [0] * n; idx = [0, 1, ..., n - 1]
for width = 1, 2, 4, ... while width < n:
    for each pair of runs idx[lo:mid], idx[mid:hi]:
        merge them by values[...]; j = right positions placed so far
        when placing left position p: counts[p] += j
return counts`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The closest pair",
    fn: "closest_pair",
    lessons: [4],
    starter: `def closest_pair(points):
    # points: a list of (x, y) with whole-number coordinates.
    # Return (i, j): the positions of two different points
    # that are as close together as any two points.
    pass
`,
    statement: (
      <>
        <p>
          Given at least two points <code>(x, y)</code> with whole-number coordinates, return a pair of positions <code>(i, j)</code>, with{" "}
          <code>i != j</code>, of two points that are closest together. If several pairs are equally close, return any of them.
        </p>
        <CodeBlock
          code={`closest_pair([(0, 0), (5, 1), (1, 1), (9, 9)])
# (0, 2), or (2, 0)`}
        />
        <p>
          Compare squared distances, <code>dx * dx + dy * dy</code>: they stay whole numbers, so there is no rounding. Two positions may hold
          the same point; their distance is 0. The tests check that your two positions are different and that their squared distance is the
          smallest possible.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 40,000 points, with coordinates up to about 50 million. Many points may have the same x. Aim for <M>O(n log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Work with positions so the answer can be reported: sort the positions by their point once, and keep the x and y values in lists in
            that order.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Recurse on ranges of the sorted order; three or fewer points are a base case (check every pair). Each call returns its positions
              sorted by y, by merging the two halves&rsquo; lists, so no call sorts by y again.
            </p>
            <p>
              Keep the best squared distance found so far, <code>best</code>, shared by all calls. After the two halves, build the strip: the
              points whose <code>(x − line)²</code> is below <code>best</code>. Walk it in y order and compare each point with the next 7 at most,
              stopping when <code>dy²</code> reaches <code>best</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = positions sorted by point; xs, ys in that order
best = [infinity, a, b]
def solve(lo, hi):            # returns lo..hi-1 sorted by y
    if hi - lo <= 3: check all pairs; return them sorted by y
    mid = (lo + hi) // 2; line = xs[mid]
    by_y = merge(solve(lo, mid), solve(mid, hi)) by y
    strip = [k in by_y with (xs[k] - line)**2 < best]
    for each k in strip, and each of the next 7 after it:
        stop if dy * dy >= best; else update best
    return by_y
solve(0, n); return (order[a], order[b])`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Multiplying digit lists",
    fn: "multiply",
    lessons: [5],
    starter: `def multiply(x, y):
    # x, y: lists of decimal digits, most significant first,
    # such as [1, 3, 2, 1] for 1321. Return x * y the same way.
    pass
`,
    statement: (
      <>
        <p>
          A whole number is given as a list of its decimal digits, most significant first: <code>[1, 3, 2, 1]</code> is 1321. Multiply two such
          numbers and return the product in the same form, with no leading zeros (zero itself is <code>[0]</code>).
        </p>
        <CodeBlock
          code={`multiply([1, 3, 2, 1], [2, 2, 1, 3])   # [2, 9, 2, 3, 3, 7, 3]
multiply([9, 9], [0])                  # [0]`}
        />
        <p>
          This problem is about writing Karatsuba&rsquo;s method yourself, so work on the digits. Do not turn the lists into Python{" "}
          <code>int</code>s: Python&rsquo;s own multiplication already uses Karatsuba&rsquo;s method in C (lesson 5), so that would skip the
          exercise. The tests cannot check this; it is up to you.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 12,000 digits in each number. The schoolbook method, <M>O(n²)</M>, is too slow for the largest test; aim for{" "}
            <M>O(n¹·⁵⁸⁵)</M>.
          </li>
          <li>The inputs have no leading zeros, except the number 0 itself.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Reverse both lists so that position k holds the digit worth 10ᵏ. Then multiplying is like multiplying polynomials, and the carries
            can wait until the very end.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Pad both reversed lists to the same length n. To multiply two such lists, split each at m = n // 2 into a low part (positions 0 to
              m − 1) and a high part. Compute <code>z0 = low × low</code>, <code>z2 = high × high</code> and{" "}
              <code>z1 = (low + high) × (low + high)</code>, adding the parts position by position. Subtract <code>z0</code> and{" "}
              <code>z2</code> from <code>z1</code>, then add <code>z0</code> at position 0, <code>z1</code> at position m and <code>z2</code>{" "}
              at position 2m. Entries may go above 9 for a while; the carries at the end fix that.
            </p>
            <p>
              Below about 32 digits, use the schoolbook double loop instead of recursing. At the end, carry from the lowest position up,
              remove leading zeros, and reverse.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def kara(a, b):                 # same length n, lowest digit first
    if n <= 32: return schoolbook(a, b)   # res[i + j] += a[i] * b[j]
    m = n // 2
    z0 = kara(a[:m], b[:m]); z2 = kara(a[m:], b[m:])
    sa = a[:m] added to a[m:], position by position
    sb = b[:m] added to b[m:], position by position
    z1 = kara(sa, sb), then subtract z0 and z2 from it
    res = [0] * (2n - 1); add z0 at 0, z1 at m, z2 at 2m
    return res
then: carry, strip leading zeros, reverse`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Select in linear time",
    fn: "select",
    lessons: [6],
    blocked: ["sorted", "heapq", "random.random", "random.randrange", "random.randint", "random.choice", "random.shuffle", "random.sample"],
    starter: `def select(values, k):
    # Return the value that would be at position k if values
    # were sorted (k = 0 is the smallest), in O(n) worst-case
    # time, with median of medians.
    pass
`,
    statement: (
      <>
        <p>
          Return the value that would be at position <code>k</code> if <code>values</code> were sorted, with <code>0 &lt;= k &lt; n</code>. Use
          median of medians to choose pivots, so that the method is <M>O(n)</M> even on the worst lists.
        </p>
        <CodeBlock
          code={`select([7, 2, 9, 4, 1], 2)     # 4
select([5, 1, 5, 1, 5, 3], 3)  # 5`}
        />
        <Counted what="the larger lists' values" />
        <ul>
          <li>On every list, your method may make at most 20n comparisons.</li>
          <li>
            The comparisons per value must stay flat as the list grows: for a list 32 times longer, at most 25% more per value. Sorting fails
            this, because it makes about log₂ n comparisons per value.
          </li>
        </ul>
        <p>
          <code>sorted()</code>, <code>.sort()</code>, <code>heapq</code> and the functions of <code>random</code> are switched off. Lists of 5
          values or fewer can be sorted by hand (insertion sort).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 64,000 values. Lists may be sorted, reversed, all equal, or built to beat a simple pivot rule.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Quickselect with a three-way partition (smaller, equal, larger) is the frame. Only the choice of pivot changes: it must leave at
            least 3n/10 values on each side.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              To choose the pivot, cut the list into groups of 5 (the last may be shorter), sort each group by insertion sort, and collect each
              group&rsquo;s middle value. Call <code>select</code> on that list of medians, with k = its middle position. The result is the
              pivot.
            </p>
            <p>
              Partition with one counted comparison per value where you can: test <code>x &lt; p</code> first, then <code>x == p</code> (not
              counted), and treat the rest as larger. Keep looping on the side that holds k; a loop instead of a recursive call on the kept side
              keeps the recursion shallow.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def select(values, k):
    loop:
        if len(values) <= 5: insertion sort; return values[k]
        meds = [middle of sorted group] for each group of 5
        p = select(meds, (len(meds) - 1) // 2)
        lo = [x < p]; eq = how many x == p; hi = the rest
        if k < len(lo): values = lo
        elif k < len(lo) + eq: return p
        else: k -= len(lo) + eq; values = hi`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
