import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SweepFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A sweep line turns a problem about a whole plane into a sequence of small updates. A vertical line moves from left to right and stops
        only where something changes. At each stop the program updates a small ordered list. This lesson uses it to answer &ldquo;do any two of
        these n pieces meet?&rdquo; in <M>O(n log n)</M> instead of checking all <M>n²/2</M> pairs.
      </p>

      <h2 id="idea">Sweeping</h2>
      <p>Every sweep has the same three parts:</p>
      <ul>
        <li>
          <strong>Events:</strong> the x values where something starts, ends or changes, sorted. Between two events nothing interesting happens,
          so the line jumps from event to event.
        </li>
        <li>
          <strong>The status:</strong> what the line currently crosses, kept in a structure that suits the question (a count, a heap, an ordered
          list).
        </li>
        <li>
          <strong>The invariant:</strong> a promise about the status that holds at every stop, and that makes the answer easy to read off.
        </li>
      </ul>
      <p>
        Ties between events at the same x need a rule, chosen for the problem. Whether a piece that ends at x and one that starts at x count as
        meeting decides which comes first.
      </p>

      <h2 id="met">Sweeps you have met</h2>
      <ul>
        <li>
          <Link href="/dsa/grdy/3/">GRDY-3</Link>, the fewest platforms: events are arrivals and departures, the status is a count, and departures
          come first at equal times because the bookings are half-open.
        </li>
        <li>
          <Link href="/dsa/dvcq/4/">DVCQ-4</Link>, the closest pair: a sweep that keeps the recent points ordered by y finds it in{" "}
          <M>O(n log n)</M>, as that lesson&rsquo;s note said.
        </li>
        <li>DVCQ-P2, the skyline: events are the walls of buildings, and the status is the set of heights the line crosses.</li>
        <li>
          The area covered by many rectangles: events are their left and right sides, and the status is a segment tree over y (
          <Link href="/dsa/rngq/4/">RNGQ-4</Link>) that knows how much of the line is covered.
        </li>
      </ul>

      <h2 id="any">Do any two pieces meet?</h2>
      <p>
        Michael Shamos and Dan Hoey (1976) used a sweep for this question. The status is the list of pieces the line crosses, ordered from the
        lowest to the highest at the line&rsquo;s current x.
      </p>
      <ul>
        <li>
          <strong>Events:</strong> each piece starts at its left end and ends at its right end. Sort the events by x; at equal x, starts before
          ends (so pieces that touch at a shared end are both in the list at the same time), and starts from the lowest up.
        </li>
        <li>
          <strong>A start:</strong> find the new piece&rsquo;s place in the list by its left end, and check it against its new neighbours, the
          piece just below and the piece just above. If its left end lies exactly on a piece in the list, those two meet.
        </li>
        <li>
          <strong>An end:</strong> remove the piece. The pieces that were just below and just above it are now neighbours: check them.
        </li>
        <li>Stop at the first check that finds two pieces that meet. If no check ever does, no two pieces meet.</li>
      </ul>
      <p>
        Comparing heights needs no division: a point P is below a piece from A to B (with A to the left) exactly when{" "}
        <M>cross(A, B, P) &lt; 0</M>. An upright piece is compared by its range of y. Step through the figure. In the first variant the crossing
        is found when a removal makes two pieces neighbours.
      </p>
      <SweepFigure />

      <h2 id="proof">Why neighbours are enough</h2>
      <Invariant label="Sweep">If two pieces meet, then just before the line reaches the leftmost meeting point, those two pieces are next to each other in the list.</Invariant>
      <p>
        Let q be the meeting point furthest to the left (the lowest one, if several share that x), and let s and t be two pieces that meet at q.
        Left of q no two pieces meet, so up to q the list is in the right order: no two pieces swap places without crossing. Suppose a third piece
        u were between s and t in the list just before q. Close to q, s and t come together, so u would have to pass through q too, or cross s or
        t before q. Either way two pieces would meet at q or to its left, which goes against the choice of q, unless u ends before q. So once the
        pieces between s and t have ended, s and t are neighbours, and the event that made them neighbours (a start of s or t, or the removal of
        the last piece between them) checked them.
      </p>
      <p>
        If s or t starts exactly at q, its left end lies on the other piece, and the search for its place in the list finds that (or the check with
        its neighbour does). Pieces that overlap along a line are found the same way: the later one starts on the earlier one.
      </p>
      <p>
        <strong>Cost.</strong> <M>2n</M> events, each with one search in the list and at most two checks. With a balanced search tree (BALT) as the
        list, each event is <M>O(log n)</M>, so the sweep is <M>O(n log n)</M> after sorting.
      </p>

      <h2 id="python">The ordered list in Python</h2>
      <p>
        Python has no balanced search tree. A plain list works well in practice: find the place with your own binary search (the comparison
        depends on the line&rsquo;s position, so <code>bisect</code> with a fixed key does not fit), then <code>insert</code> or <code>pop</code>.
        Those two move up to <M>n</M> references, which is <M>O(n)</M>, but the move is a single fast copy in C, so tens of thousands of pieces are
        quick.
      </p>
      <CodeBlock
        code={`def below(p, t):                  # is point p below piece t at p's x?
    a, b = left[t], right[t]          # the ends, left one first
    if a[0] == b[0]:                  # an upright piece: compare y ranges
        return True if p[1] < a[1] else (False if p[1] > b[1] else None)
    c = cross(a, b, p)
    return None if c == 0 else c < 0  # None: p is on the piece

# a start of piece i: binary search its place by its left end
lo, hi = 0, len(active)
while lo < hi:
    mid = (lo + hi) // 2
    r = below(left[i], active[mid])
    if r is None:
        return (i, active[mid])       # the start lies on a piece
    if r:
        hi = mid
    else:
        lo = mid + 1
active.insert(lo, i)
# ... then check active[lo - 1] and active[lo + 1] against i`}
      />
      <p>
        To remove a piece at its right end, find it the same way with its right end as the point (or with <code>active.index(i)</code>, which
        is <M>O(n)</M> per removal and becomes slow for large inputs). Outside the practice pages, the <code>sortedcontainers</code> package
        gives a sorted list with fast inserts.
      </p>

      <h2 id="more">Every crossing, and other sweeps</h2>
      <Note title="Reporting every crossing">
        <p>
          The Bentley–Ottmann method (1979) lists all <M>k</M> meeting points. Each crossing found becomes a new event, a point where two
          neighbours swap places in the list, and the events wait in a heap. It costs <M>O((n + k) log n)</M>. Its crossing points are fractions,
          so exact arithmetic (or great care with floats) is needed. Checking all pairs, <M>O(n²)</M>, is better when <M>k</M> is close to{" "}
          <M>n²</M>.
        </p>
      </Note>
      <ul>
        <li>
          <strong>A line that turns:</strong> some problems sweep a ray around a point by angle instead of a line by x, for example to see which
          walls are visible from a spot.
        </li>
        <li>
          <strong>Time as the sweep:</strong> events in time order with a status that changes, as in simulations and in the scheduling problems
          of GRDY.
        </li>
        <li>
          <strong>Higher dimensions:</strong> a plane sweeping through space, with a 2-D sweep as its status, solves 3-D problems the same way.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/geom/practice/4/">GEOM-P4, Any two tracks crossing?</Link>.
      </p>
    </>
  );
}
