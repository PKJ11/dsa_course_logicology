import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { AnswerFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Some of the most useful binary searches do not search a list at all. They search through the possible answers, using a test that says
        whether an answer is good enough.
      </p>

      <h2 id="no-array">Binary search without a list</h2>
      <p>
        The last lesson ended with <code>first_at_least</code>. It needs three things: candidates in order, a yes-or-no question about each one,
        and answers that go F F … F T T … T. In that lesson, the list gave the candidates and <code>a[i] &gt;= t</code> was the question. But the
        candidates can be any range of numbers, and the question can be any test, as long as the answers follow that pattern.
      </p>

      <h2 id="monotone">The monotone test</h2>
      <p>
        These problems usually ask for the <em>smallest</em> value that works, or the <em>largest</em>. Suppose that making the value bigger can only
        help. Then the answers to &ldquo;does <M>x</M> work?&rdquo; go F … F T … T across the range, and the smallest value that works is the first
        T. A test like this is called <em>monotone</em>.
      </p>
      <Invariant label="Monotone">
        If <code>x</code> works, then every <code>y</code> bigger than <code>x</code> works too. This is what lets you skip half the candidates at each step.
      </Invariant>
      <p>So searching on the answer needs three things, and you must check each one:</p>
      <ol>
        <li>
          <strong>A range</strong> <code>[lo, hi]</code> that is sure to contain the answer, where <code>hi</code> is known to work.
        </li>
        <li>
          <strong>A test</strong> <code>works(x)</code> that is correct and fast.
        </li>
        <li>
          <strong>A proof that the test is monotone</strong>: if <code>works(x)</code> is true, then <code>works(x + 1)</code> is true.
        </li>
      </ol>

      <h2 id="parcels">The parcel van</h2>
      <p>
        A railway parcel office must send a row of parcels with weights <code>parcels</code>. They must go in the order they were booked. One van
        leaves each day. It carries the next few parcels in the row, as long as their total weight is at most its capacity <code>C</code>. What
        is the smallest <code>C</code> that sends all the parcels within <code>days</code> days?
      </p>
      <p>
        <strong>The range.</strong> The van must be able to carry the heaviest parcel, so <code>C ≥ max(parcels)</code>. A van that can carry{" "}
        <code>sum(parcels)</code> takes everything on the first day, so that capacity always works.
      </p>
      <p>
        <strong>The test.</strong> For a given <code>C</code>, fill each day&rsquo;s van as full as possible and count the days. Filling the van as much
        as possible each day is the best plan: holding a parcel back for a later day can only push the later parcels further back. If the count
        is at most <code>days</code>, then capacity <code>C</code> works.
      </p>
      <p>
        <strong>Monotone.</strong> Any loading plan that fits a van of capacity <code>C</code> also fits a bigger van. So if <code>C</code> works,{" "}
        <code>C + 1</code> works.
      </p>

      <AnswerFigure />

      <CodeBlock
        title="van.py"
        code={`def days_needed(parcels, cap):
    days, load = 1, 0
    for w in parcels:
        if load + w > cap:        # this parcel waits for tomorrow
            days, load = days + 1, 0
        load += w
    return days

def min_capacity(parcels, days):
    lo, hi = max(parcels), sum(parcels)   # hi always works
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(parcels, mid) <= days:
            hi = mid                      # mid works: answer is mid or less
        else:
            lo = mid + 1                  # mid fails: answer is more
    return lo`}
        mark={[13]}
      />
      <p>
        This loop is <code>first_at_least</code> from the last lesson, without the list. Line 13 asks the question instead of{" "}
        <code>a[mid] &gt;= t</code>.
      </p>

      <h2 id="cost">How long it takes</h2>
      <p>
        Each test goes through the parcels once, which takes <M>O(n)</M> time. The range has about <M>S = sum − max + 1</M> possible capacities,
        so the search runs about <M>log₂ S</M> tests. That is <M>O(n log S)</M> in total. Trying each capacity one by one from the smallest
        would take <M>O(n · S)</M>. With 50,000 parcels of up to 500 kg each, <M>S</M> can be 25 million. Binary search needs about 25 tests
        instead of up to 25 million.
      </p>
      <p>
        Note that <M>log S</M> depends on how large the numbers are, not on how many there are. If every weight doubles, the search needs just
        one more test.
      </p>

      <h2 id="pattern">Recognising this kind of problem</h2>
      <p>
        Look for questions like &ldquo;the minimum value such that&hellip;&rdquo; or &ldquo;the maximum value such that&hellip;&rdquo;, where
        checking one value is much easier than finding the best value directly. For example:
      </p>
      <ul>
        <li>the slowest reading speed that finishes a syllabus before the exam;</li>
        <li>the largest gap you can keep between people placed on given seats;</li>
        <li>splitting a list into <M>k</M> parts so that the largest part-sum is as small as possible;</li>
        <li>the smallest number of days after which enough trains have arrived to run a timetable.</li>
      </ul>
      <p>
        For a <em>maximum</em>, the answers go T … T F … F, and you want the last T. You can change the question so that it becomes a first-T
        search. Or you can search for the last T directly, which needs one extra step with rounding that lesson 6 explains.
      </p>
      <Note title="When the test is not monotone">
        <p>
          If the answers are not one block of F followed by one block of T, this method gives wrong answers with no warning. Before you write
          the loop, try to prove in one sentence that &ldquo;if <M>x</M> works, then <M>x + 1</M> works&rdquo;. If you cannot, binary search is
          probably the wrong tool.
        </p>
      </Note>
    </>
  );
}
