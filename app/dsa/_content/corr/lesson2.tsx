import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MaxInvariantFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A loop changes its values many times, so it is hard to reason about all at once. The method is to find one statement about those values
        that is true every time the loop reaches its first line. Then you only have to reason about one pass.
      </p>

      <h2 id="idea">A statement that stays true</h2>
      <p>
        A <em>loop invariant</em> is a statement about the loop&rsquo;s values that is true at the start of every pass. The values change, but
        the statement stays true.
      </p>
      <p>Here is the loop for the largest value, with its invariant written as a comment:</p>
      <CodeBlock
        code={`def largest(a):
    best = a[0]
    i = 1
    # Invariant: best is the largest of a[0..i-1]
    while i < len(a):
        if a[i] > best:
            best = a[i]
        i += 1
    return best`}
        mark={[4]}
      />
      <p>
        <code>a[0..i-1]</code> means the values from index 0 to index <code>i - 1</code>, both included. These are the values the loop has already
        looked at.
      </p>

      <h2 id="three">Three things to prove</h2>
      <p>To use an invariant, you prove three things:</p>
      <ol>
        <li>
          <strong>Start.</strong> The statement is true before the first pass.
        </li>
        <li>
          <strong>Keep.</strong> If it is true at the start of a pass, it is still true at the start of the next pass.
        </li>
        <li>
          <strong>Finish.</strong> When the loop ends, the statement, together with the reason the loop ended, gives the promise in the spec.
        </li>
      </ol>
      <p>
        Parts 1 and 2 together show that the statement is true at the start of every pass, however many passes there are. This is the same
        idea as proof by induction, which lesson 3 covers.
      </p>

      <h2 id="example">Example: the largest value</h2>
      <ol>
        <li>
          <strong>Start.</strong> Before the first pass, <code>i = 1</code> and <code>best = a[0]</code>. The only value seen is <code>a[0]</code>, and it
          is the largest of itself. True.
        </li>
        <li>
          <strong>Keep.</strong> Suppose <code>best</code> is the largest of <code>a[0..i-1]</code>. The pass compares <code>a[i]</code> with{" "}
          <code>best</code> and keeps the bigger one. So afterwards <code>best</code> is the largest of <code>a[0..i]</code>. Then <code>i</code> goes up by 1,
          and the statement reads the same as before. True.
        </li>
        <li>
          <strong>Finish.</strong> The loop ends when <code>i = len(a)</code>. Then the invariant says <code>best</code> is the largest of{" "}
          <code>a[0..len(a)-1]</code>, which is the whole list. That is the promise.
        </li>
      </ol>
      <p>
        Step through the figure. The blue bracket covers the values already seen, and the check under the list tests the invariant after every
        step. Then switch to the version that starts with <code>best = 0</code> on a list of negative numbers. Part 1 fails at once, and nothing
        later repairs it.
      </p>

      <MaxInvariantFigure />

      <h2 id="choosing">Choosing a good invariant</h2>
      <p>
        A useful invariant usually describes <em>the part of the job already done</em>. Ask: &ldquo;if I stopped the loop right now, what would I
        know?&rdquo; Some patterns come up often:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Common invariants</caption>
          <thead>
            <tr>
              <th>Loop</th>
              <th>Invariant</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Running total</td><td><code>s</code> is the sum of <code>a[0..i-1]</code></td></tr>
            <tr><td>Binary search</td><td>if <code>t</code> is in <code>a</code>, it is in <code>a[lo..hi]</code></td></tr>
            <tr><td>Insertion sort</td><td><code>a[0..i-1]</code> is sorted</td></tr>
            <tr><td>Partition</td><td>everything left of <code>i</code> is small; everything from <code>i</code> to <code>j - 1</code> is large</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Sometimes the obvious statement is too weak to prove part 2. Then you must make it say <em>more</em>. For example, to track the best sum
        of a stretch of consecutive values, &ldquo;<code>best</code> is the best sum so far&rdquo; is not enough. You also need a second statement:
        &ldquo;<code>cur</code> is the best sum of a stretch that <em>ends</em> at the current value&rdquo;. Practice problem 5 uses exactly this.
      </p>

      <h2 id="stopping">Proving the loop stops</h2>
      <p>
        An invariant shows that the answer is right <em>if</em> the loop ends. To show it does end, find a whole number that gets smaller on
        every pass and can never go below zero. Such a number is sometimes called a <em>variant</em>.
      </p>
      <p>
        In the loop above, the number is <M>len(a) − i</M>. Every pass adds 1 to <code>i</code>, so it gets smaller by 1. It starts at <M>n − 1</M> and
        cannot go below 0. So there are at most <M>n − 1</M> passes. In <Link href="/dsa/bsrc/2/#termination">binary search</Link> the number is the
        size of the window.
      </p>
      <Note title="When no number gets smaller" warn>
        <p>
          If you cannot find such a number, look for a pass that changes nothing. That is where a loop can run forever. The{" "}
          <code>lo = mid</code> mistake in BSRC-6 is this kind of bug.
        </p>
      </Note>
    </>
  );
}
