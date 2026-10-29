import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { WindowMaxFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        A monotonic queue is a deque whose values always go down from front to back. It answers &ldquo;what is the biggest value in this
        window?&rdquo; as the window slides along a list, in <M>O(1)</M> per step on average.
      </p>

      <h2 id="problem">The biggest value in a moving window</h2>
      <p>
        A <em>window</em> is a run of <M>k</M> values next to each other in a list (ARRS-3). Slide it one place at a time from the start to the
        end, and report the biggest value in each position. For <code>[4, 2, 12, 3, 8, 5, 1, 7]</code> and <M>k = 3</M>, the answers are{" "}
        <code>[12, 12, 12, 8, 8, 7]</code>.
      </p>
      <p>
        Calling <code>max</code> on each window costs <M>k</M> steps per window, so <M>O(n × k)</M> in total. A running sum can be updated when a
        value leaves the window, but a maximum cannot: when the biggest value leaves, you do not know the next biggest.
      </p>

      <h2 id="deque">A deque kept in order</h2>
      <p>
        Keep a deque of places. A value is worth keeping only if it might still become the biggest in some later window. When a new value{" "}
        <code>x</code> arrives, every older value that is <code>&lt;= x</code> can never be the biggest again: <code>x</code> is at least as big,
        and stays in the window longer. So remove them from the back.
      </p>
      <Invariant>
        The values at the places in the deque go down from front to back, and every place is inside the window. So the front is the biggest value
        in the window.
      </Invariant>
      <p>Each step does three things:</p>
      <ul>
        <li>remove places from the back while their values are <code>&lt;= x</code>, then add the new place at the back;</li>
        <li>remove the front place if it has slid out of the window;</li>
        <li>once the first window is complete, report the value at the front.</li>
      </ul>

      <WindowMaxFigure />

      <p>
        <code>dq</code> is a <code>collections.deque</code> of places. Here are the first two parts of the step, for place <code>i</code> with
        value <code>x</code>:
      </p>
      <CodeBlock
        code={`while dq and a[dq[-1]] <= x:
    dq.pop()              # can never be the biggest again
dq.append(i)
if dq[0] <= i - k:        # the front has left the window
    dq.popleft()`}
      />
      <p>
        The third part, reporting <code>a[dq[0]]</code> once <code>i</code> reaches <code>k - 1</code>, is left to STAQ-P6.
      </p>
      <p>
        Only one place can leave the front per step, because the window moves one place at a time. That is why a single <code>if</code> is enough
        there, while the back needs a <code>while</code>.
      </p>

      <h2 id="cost">Why it is O(n)</h2>
      <p>
        The same counting as lesson 5: each place is added to the deque once and removed at most once, from one end or the other. So the whole run
        does <M>n</M> additions and at most <M>n</M> removals, at most <M>2n</M> steps in all: <M>O(n)</M>, whatever <M>k</M> is. After each step
        the deque holds at most <M>k</M> places.
      </p>

      <h2 id="compare">Other ways, and their cost</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Ways to find the maximum of every window</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>Time</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>max</code> of each window
              </td>
              <td>
                <M>O(n × k)</M>
              </td>
              <td>Fine for small k.</td>
            </tr>
            <tr>
              <td>A heap with old entries removed later</td>
              <td>
                <M>O(n log n)</M>
              </td>
              <td>Uses heaps (HEAP). Keep (value, place) pairs and drop a top that has left the window.</td>
            </tr>
            <tr>
              <td>Monotonic deque</td>
              <td>
                <M>O(n)</M>
              </td>
              <td>The best possible: every value must be read once.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note title="For the minimum, flip it">
        <p>
          For the smallest value in each window, keep the values going <em>up</em> from front to back: pop from the back while the back is{" "}
          <code>&gt;= x</code>.
        </p>
      </Note>
      <p>
        The monotonic deque also speeds up some dynamic programming, where each answer is the best of the last <M>k</M> answers. You will meet
        that in DYNP.
      </p>
      <p>
        Now try <Link href="/dsa/staq/practice/6/">STAQ-P6, Biggest in each window</Link>.
      </p>
    </>
  );
}
