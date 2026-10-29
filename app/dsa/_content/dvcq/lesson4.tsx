import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PairFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Given many points on a map, which two are closest together? Checking every pair is slow for a large map. Divide and conquer splits
        the points with a line, solves each side, and then has to check only a thin strip along the line, with at most seven comparisons per
        point.
      </p>

      <h2 id="problem">The problem</h2>
      <p>
        Each point has two coordinates, <M>(x, y)</M>: how far right and how far up it is. The distance between two points is found with
        Pythagoras&rsquo; theorem. If they are <M>dx</M> apart across and <M>dy</M> apart up, the distance is the square root of{" "}
        <M>dx² + dy²</M>. Python has it as <code>math.dist(p, q)</code>.
      </p>
      <p>
        To compare distances, the square root is not needed: a smaller distance always has a smaller square. With whole-number coordinates,
        comparing <M>dx² + dy²</M> keeps everything exact, with no rounding. The practice problem does this.
      </p>
      <p>
        There are n(n − 1)/2 pairs, so checking all of them costs <M>O(n²)</M>. For 100,000 points that is about 5 billion distances. The
        method below needs <M>O(n log n)</M>, about 2 million steps.
      </p>

      <h2 id="split">Split by a vertical line</h2>
      <p>
        Sort the points by x once, at the start. Then:
      </p>
      <ol>
        <li>
          <strong>Divide:</strong> draw a vertical line through the middle, so that half of the points are on each side.
        </li>
        <li>
          <strong>Conquer:</strong> find the closest pair on the left and the closest pair on the right, by recursion. Two or three points are a
          base case: check every pair.
        </li>
        <li>
          <strong>Combine:</strong> let δ (the Greek letter delta) be the smaller of the two answers. The closest pair overall is either that
          pair, or a pair with one point on each side that is closer than δ.
        </li>
      </ol>
      <p>
        The figure runs the method on 12 points. Step through &ldquo;Divide and conquer&rdquo; and watch the combine step.
      </p>

      <PairFigure />

      <h2 id="strip">The strip</h2>
      <p>
        A pair with one point on each side, closer than δ, cannot have a point further than δ from the line: that point would already be more
        than δ from anything on the other side. So only the points within δ of the line matter. They form a <strong>strip</strong> 2δ wide.
      </p>
      <p>
        The strip can still hold every point, for example when all the points are close to the line. So &ldquo;check every pair in the strip&rdquo;
        is no good. Instead, list the strip&rsquo;s points in order of y, from bottom to top, and compare each point only with the points
        just above it in that list. As soon as a point is δ or more higher, stop: every later point is higher still.
      </p>
      <Invariant label="Strip">In the strip, sorted by y, each point needs to be compared with at most the next 7.</Invariant>

      <h2 id="seven">Why seven checks are enough</h2>
      <p>
        Take a point P in the strip. A partner above P that is closer than δ is less than δ higher, and within δ of the line on either side.
        So it lies in a box δ tall and 2δ wide, sitting on P&rsquo;s height. Step through &ldquo;Why few checks&rdquo;.
      </p>
      <ul>
        <li>Cut the box into 8 squares of side δ/2: 4 across and 2 up. Each square is entirely on one side of the line.</li>
        <li>
          The longest distance inside one square is its diagonal: δ/2 × √2, about 0.71 δ. That is less than δ.
        </li>
        <li>
          Two points in the same square would be on the same side and closer than δ. But δ is the smallest distance on each side. So each
          square holds at most one point.
        </li>
        <li>
          So the box holds at most 8 points, P included. In the strip sorted by y, every point in the box comes within the 7 places after P.
        </li>
      </ul>
      <p>
        The number 7 is only a bound used in the proof; a careful count brings it lower, but any fixed number gives the same cost. The code
        stops even earlier, as soon as a point is δ higher. What matters is that each point needs only a fixed number of comparisons, so the
        strip costs <M>O(n)</M>.
      </p>

      <h2 id="code">The code and its cost</h2>
      <p>
        The strip must be sorted by y. Sorting it again in every call would cost <M>O(n log n)</M> per call and <M>O(n log² n)</M> in all
        (lesson 2). Instead, each call returns its points sorted by y, and the parent merges the two lists, exactly as merge sort does. The
        work outside the calls is then <M>O(n)</M>, and <M>T(n) = 2 T(n/2) + O(n) = O(n log n)</M>.
      </p>
      <CodeBlock
        title="closest.py"
        code={`import heapq
import math

def closest(points):
    """The smallest distance between two of the points (at least 2)."""
    best = math.inf

    def solve(p):                       # p is sorted by x; returns p sorted by y
        nonlocal best
        if len(p) <= 3:
            for i in range(len(p)):
                for j in range(i + 1, len(p)):
                    best = min(best, math.dist(p[i], p[j]))
            return sorted(p, key=lambda q: q[1])
        mid = len(p) // 2
        line = p[mid][0]                # x of the dividing line
        left = solve(p[:mid])
        right = solve(p[mid:])
        by_y = list(heapq.merge(left, right, key=lambda q: q[1]))
        strip = [q for q in by_y if abs(q[0] - line) < best]
        for i, q in enumerate(strip):
            for r in strip[i + 1:i + 8]:     # at most 7 points above q
                if r[1] - q[1] >= best:
                    break                    # every later point is higher
                best = min(best, math.dist(q, r))
        return by_y

    solve(sorted(points))
    return best`}
      />
      <p>
        <code>best</code> is shared by all the calls, so the right half already uses the left half&rsquo;s answer to prune. Points with the same x
        are fine: sorting by x and then y gives a fixed order, and the split is by position in that order, so each side gets exactly half the
        points even when many have the same x. The recursion is about log₂ n calls deep.
      </p>
      <Note title="A simpler sweep, and where it fails">
        <p>
          A popular shortcut sorts the points by x and compares each point with the following points while their x is less than the best
          distance away. On random points it is fast. But if many points share almost the same x, such as points along a vertical road, every
          point is compared with nearly every other, and it takes <M>O(n²)</M>. The strip&rsquo;s sort by y is what prevents this. A sweep that
          keeps the nearby points in a tree sorted by y does achieve <M>O(n log n)</M> (GEOM-4).
        </p>
      </Note>
      <p>
        This is the method of Shamos and Hoey (1975). It is the base of many problems in computational geometry (GEOM), and it also works in
        three or more dimensions, with a slab instead of a strip.
      </p>
    </>
  );
}
