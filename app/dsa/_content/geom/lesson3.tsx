import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { HullFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        The convex hull of some points is the smallest convex polygon that holds them all. It is the first thing to
        compute for many geometry problems, and Andrew&rsquo;s method finds it with one sort and two walks, using nothing but the cross product.
      </p>

      <h2 id="what">What a hull is</h2>
      <p>
        A shape is <strong>convex</strong> if the straight piece between any two of its points stays inside it: a square or a circle, but not a
        star or a crescent. The <strong>convex hull</strong> of a set of points is the smallest convex polygon that contains them all. Its corners
        are some of the points; the rest are inside it or on its edges.
      </p>
      <p>
        Walking round a convex polygon counterclockwise, every corner turns left. A corner where the walk turns right, or goes straight on, is
        not needed. The practice problem leaves out points that lie on an edge but are not corners, so only real turns count.
      </p>

      <h2 id="wrap">Gift wrapping</h2>
      <p>
        The most direct method, the <strong>gift wrapping</strong> or Jarvis march (1973): start at the lowest point, which must be a corner.
        From the current corner, the next corner is the point that every other point is to the left of (compare candidates with the cross
        product). Repeat until you are back at the start.
      </p>
      <p>
        Each step looks at all <M>n</M> points, and there is one step per corner, so the cost is <M>O(n · h)</M>, where <M>h</M> is the number
        of corners. That is fast when the hull is small, and <M>O(n²)</M> when every point is a corner, as for points on a circle or on the
        curve <M>y = x²</M>.
      </p>

      <h2 id="chain">Andrew&rsquo;s monotone chain</h2>
      <p>
        A.M. Andrew&rsquo;s method (1979) sorts the points by x (and by y when x is equal). The leftmost and the rightmost points are corners, and
        they split the hull into a <strong>lower hull</strong> and an <strong>upper hull</strong>. Build the lower hull by walking left to right
        with a stack:
      </p>
      <ul>
        <li>before pushing a point p, look at the last two points on the stack, q and r;</li>
        <li>if q → r → p does not turn left (cross product ≤ 0), r is not a corner: pop it, and look again;</li>
        <li>then push p.</li>
      </ul>
      <p>The upper hull is the same walk from right to left. Step through the figure.</p>
      <HullFigure />
      <CodeBlock
        code={`# the lower hull: pts sorted by x, then y, with repeats removed
lower = []
for p in pts:
    while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
        lower.pop()                  # not a left turn: not a corner
    lower.append(p)`}
      />
      <p>
        The upper hull is the same loop over the points in reverse order; joining the two lists, without repeating the two end points, gives the
        hull counterclockwise. <strong>Details that matter.</strong> <code>&lt;= 0</code> removes points on an edge; with <code>&lt; 0</code> they stay in as extra
        &ldquo;corners&rdquo;. Repeated points must go (the <code>set</code>), or the cross product of a point with its copy is 0 in confusing
        places. If all points lie on one line, the result is just the two ends. The result starts at the leftmost point; rotate it if you need
        another start.
      </p>

      <h2 id="why">Why it works</h2>
      <Invariant label="Chain">After the walk has reached p, the stack holds the lower hull of the points up to p, from left to right.</Invariant>
      <p>
        By induction. A point popped while p is added lies on or above the line from the point below it on the stack to p, so it is inside the
        hull of the points up to p, or on its edge: it can never be a corner later either, because hulls only grow. The points that stay turn left
        at every step, so they form a convex chain, and every point so far is on or above it. That is exactly the lower hull.
      </p>
      <p>
        <strong>Cost.</strong> Sorting is <M>O(n log n)</M>. In each walk every point is pushed once and popped at most once, so the walks are{" "}
        <M>O(n)</M>. In Python the sort runs in C, so the walks dominate for a few hundred thousand points.
      </p>
      <Note title="Other methods">
        <p>
          <strong>Graham&rsquo;s scan</strong> (1972), the first <M>O(n log n)</M> method, sorts by angle around the lowest point and makes one
          walk; sorting by angle needs care with ties, which is why Andrew&rsquo;s plain x-sort is popular. <strong>Chan&rsquo;s method</strong>{" "}
          (1996) combines gift wrapping with small hulls and costs <M>O(n log h)</M>, the best possible when the answer is small.
          Quickhull, used by many libraries such as SciPy&rsquo;s <code>ConvexHull</code>, works like quicksort.
        </p>
      </Note>

      <h2 id="bound">Why n log n is needed</h2>
      <p>
        Any hull method that compares only can be used to sort. Given numbers <M>x₁, …, xₙ</M>, make the points <M>(xᵢ, xᵢ²)</M>. They lie on the
        curve <M>y = x²</M>, which bends upwards, so every point is a corner, and the hull lists them in order of x. So computing a hull is at
        least as hard as sorting, which needs <M>Ω(n log n)</M> comparisons (SORT-5). The practice tests use exactly these points to catch gift
        wrapping.
      </p>

      <h2 id="uses">What hulls are for</h2>
      <ul>
        <li>
          <strong>The two points farthest apart</strong> are both corners of the hull. Two pointers that go round the hull together (the
          &ldquo;rotating calipers&rdquo;) find them in <M>O(h)</M> after the hull.
        </li>
        <li>
          <strong>Collisions in games:</strong> testing whether two convex shapes overlap is much cheaper than for general shapes.
        </li>
        <li>
          <strong>Optimisation:</strong> the best of many straight-line costs at each x lies on a hull. Keeping only the lines on that hull
          speeds up some dynamic programs (ADDP-6).
        </li>
        <li>
          <strong>Outliers and shapes of data:</strong> peeling hulls layer by layer finds the most central points.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/geom/practice/3/">GEOM-P3, The fence around the stations</Link>.
      </p>
    </>
  );
}
