import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { IntervalFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        One room, many booking requests, and no two bookings may overlap. Which ones should be accepted to fit in as many as possible? Three
        natural greedy rules exist, and only one of them is right. This lesson proves it with a second kind of argument, &ldquo;greedy stays
        ahead&rdquo;, and then solves a related problem: how few platforms a station needs.
      </p>

      <h2 id="problem">The most bookings</h2>
      <p>
        Each booking is an <strong>interval</strong> of time: it starts at <M>s</M> and ends at <M>e</M>. We treat it as half-open, as Python
        slices are: it includes <M>s</M> but not <M>e</M>. So a booking that ends at 5 and one that starts at 5 do not overlap, and both can be
        accepted. Two bookings overlap when each one starts before the other ends.
      </p>
      <p>The task: choose as many bookings as possible, with no two overlapping. Only the number of bookings counts, not their lengths.</p>

      <h2 id="rules">Three rules that look right</h2>
      <p>Go through the bookings in some order, and accept each one that does not overlap a booking already accepted. In which order?</p>
      <ul>
        <li>
          <strong>Starts first.</strong> Fill the room from the beginning of the day.
        </li>
        <li>
          <strong>Shortest first.</strong> Short bookings use up little of the room.
        </li>
        <li>
          <strong>Ends first.</strong> Free the room again as early as possible.
        </li>
      </ul>
      <p>The figure runs all three on the same six bookings. Use the variants to switch between them.</p>

      <IntervalFigure />

      <p>
        A booking that starts first may run all day and block everything. A short booking may sit across the boundary of two others that fit
        together. Each wrong rule fails on a small example, which is all it takes to reject it (CORR-4). Ends first gives 4 here, and it is
        always right.
      </p>
      <CodeBlock
        title="bookings.py"
        code={`def most_bookings(bookings):
    # bookings: a list of (start, end) pairs
    count = 0
    # the room is free from here
    free = float("-inf")
    for start, end in sorted(bookings, key=lambda b: b[1]):
        # fits after the last choice
        if start >= free:
            count += 1
            free = end
    return count`}
      />
      <p>
        Sorting by end costs <M>O(n log n)</M>, and the walk is <M>O(n)</M>. The variable <code>free</code> is the end of the last accepted
        booking. Because bookings are taken in order of their end, a new booking overlaps an accepted one exactly when it starts before{" "}
        <code>free</code>, so one comparison checks it against all of them.
      </p>

      <h2 id="ahead">Greedy stays ahead</h2>
      <p>
        Let the greedy method accept k bookings, <M>g₁, g₂, …, gₖ</M>, in the order it took them, which is also their order in time: g₁ is
        its first booking, g₂ its second, and so on. Let <M>b₁, b₂, …, bₘ</M> be any best set of m bookings, sorted by time in the same way.
        We want to show <M>k = m</M>.
      </p>
      <Invariant label="Ahead">For every i, the greedy method&rsquo;s i-th booking ends no later than the best set&rsquo;s i-th booking.</Invariant>
      <p>Proof by induction on i (CORR-3):</p>
      <ul>
        <li>
          <strong>i = 1.</strong> <M>g₁</M> ends first of all the bookings, so it ends no later than <M>b₁</M>.
        </li>
        <li>
          <strong>From i to i + 1.</strong> <M>bᵢ₊₁</M> starts no earlier than <M>bᵢ</M> ends, and <M>bᵢ</M> ends no earlier than <M>gᵢ</M>. So{" "}
          <M>bᵢ₊₁</M> starts no earlier than <M>gᵢ</M> ends: it was still allowed when greedy chose its next booking. Greedy took the allowed booking that
          ends first, so <M>gᵢ₊₁</M> ends no later than <M>bᵢ₊₁</M>.
        </li>
      </ul>
      <p>
        Now suppose the best set had more bookings, <M>m &gt; k</M>. Then <M>bₖ₊₁</M> starts no earlier than <M>bₖ</M> ends, which is no earlier than when{" "}
        <M>gₖ</M> ends. So <M>bₖ₊₁</M> fits after greedy&rsquo;s last booking, and greedy would have accepted it, or some other booking. Greedy
        stopped at <M>k</M>, so this cannot happen. So <M>k = m</M>.
      </p>
      <p>
        &ldquo;Stays ahead&rdquo; compares the two answers piece by piece and shows that greedy is never behind. An exchange argument works here
        too: in a best set, replace the booking that ends first with <M>g₁</M>; it ends even earlier, so it overlaps nothing new. Use whichever
        argument is easier for the problem in front of you.
      </p>

      <h2 id="platforms">Fewest platforms</h2>
      <p>
        A different question about intervals. Trains arrive and leave at given times; each is in the station from its arrival up to, not
        including, its departure. Each platform holds one train at a time. How many platforms are needed? Switch the figure to
        &ldquo;Platforms&rdquo;.
      </p>
      <p>
        <strong>A lower bound.</strong> Call the largest number of trains in the station at the same moment the <strong>depth</strong>. Any
        plan needs at least that many platforms, because those trains each need their own.
      </p>
      <p>
        <strong>The greedy method.</strong> Take the trains in order of arrival. Put each on a platform that is already free, if there is one;
        otherwise open a new platform. It never opens more than the depth: when it opens platform <M>k</M>, the other <M>k − 1</M> are all
        busy at that moment, and the new train is there too, so <M>k</M> trains are in at once, and <M>k</M> is at most the depth. The lower
        bound says no plan can do better, so the greedy method is best.
      </p>
      <p>
        To find a free platform fast, keep the departure times of the busy platforms in a min-heap (HEAP-4). If the earliest departure is no
        later than the new arrival, that platform is free: replace its time with the new train&rsquo;s departure. Otherwise push a new time.
        At the end the heap holds one time per platform. That is <M>O(n log n)</M> in all.
      </p>
      <p>
        A second method finds the depth directly. Make a list of events, +1 at each arrival and −1 at each departure, sort them by time, and keep
        a running count; the largest count is the answer. When a departure and an arrival happen at the same time, the departure must come first,
        because the platform is free again the moment its train leaves.
      </p>
      <Note title="Mind the ends">
        <p>
          Whether an interval includes its end is part of the problem. If a platform needed a minute to clear, a train leaving at 5 and one
          arriving at 5 could not share it, and the answer could change. Most interval bugs are at these ends.
        </p>
      </Note>

      <h2 id="family">Related problems</h2>
      <ul>
        <li>
          <strong>Fewest points that hit every interval</strong> (for example, the fewest times to check a set of machines while each is
          running): sort by end, and put a point at the end of each interval that no point has hit yet. The proof is the same as above.
        </li>
        <li>
          <strong>Covering a stretch with the fewest intervals</strong> (cover the time from 0 to T): among the intervals that start no later
          than the point already covered, take the one that reaches furthest, and repeat.
        </li>
        <li>
          <strong>Merging overlapping intervals:</strong> sort by start, and join each interval to the last merged one while they overlap.
        </li>
        <li>
          <strong>Bookings with values</strong> (the most money, not the most bookings): no greedy rule works. It needs dynamic programming
          over the bookings sorted by end, with a binary search for the last booking that fits before each one (DYNP, BSRC).
        </li>
      </ul>
    </>
  );
}
