import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, Note } from "../../_components/Prose";
import { TestRunFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Every station ends with practice problems that run your Python in the browser. This lesson explains what you will see there, and how
        to use it when your code does not work yet.
      </p>

      <h2 id="screen">The practice screen</h2>
      <p>
        The problem is on the left. On the right is an editor with starter code, and a <strong>Run tests</strong> button. The starter code has the
        function name the tests look for. Keep that name and its parameters.
      </p>
      <p>
        The first time you open practice, the browser downloads Python, which is about 10 MB. After that it is stored by the browser. Your code
        is saved in this browser as you type. Practice needs a laptop or desktop; on a phone you can read the problem and the hints.
      </p>

      <h2 id="rows">Reading a test row</h2>
      <p>
        Each test calls your function once and compares what it returns with the expected answer. Results appear as rows in a timetable.
        Step through the figure to see a test run on a function with a hidden bug.
      </p>

      <TestRunFigure />

      <p>A red row opens to show four things:</p>
      <ul>
        <li>the input that was used;</li>
        <li>what your function returned, next to what was expected;</li>
        <li>anything your code printed;</li>
        <li>
          a short note on <strong>what this failure usually means</strong>. Every test has one. They are written by the course author for the
          mistakes students really make.
        </li>
      </ul>
      <p>
        Rows run in order, from the simplest case to the hardest. Fix the first red row first. Later rows often fail for the same reason.
      </p>

      <h2 id="limits">Read limits and time limits</h2>
      <p>Some tests check how fast your code is, not only whether it is right.</p>
      <ul>
        <li>
          <strong>Time limits.</strong> Each test has a few seconds. If your code is still running when the time is up, the row says &ldquo;Timed
          out&rdquo;. Either the code has a loop that never ends, or it does far too much work for a large input.
        </li>
        <li>
          <strong>Read limits.</strong> In some problems the input list counts how many values you read from it. A row then shows, for example,
          &ldquo;20 / 25&rdquo;: 20 reads, with a limit of 25. Going through the whole list goes over the limit, even if the answer is right.
        </li>
        <li>
          <strong>Switched-off tools.</strong> Some problems switch off a built-in tool, such as <code>sorted()</code>, because the point is to build
          it yourself. The problem statement says so.
        </li>
      </ul>
      <Invariant label="Rule">A correct answer that is too slow does not pass. Good code is right, and fast enough for the limits.</Invariant>

      <h2 id="help">Hints and the solution</h2>
      <p>
        Each problem has three hints, opened one at a time. The first is a <strong>nudge</strong> in the right direction. The second describes
        the <strong>approach</strong>. The third is <strong>pseudocode</strong>: the steps in plain words, close to code. Open one, then try again
        before opening the next.
      </p>
      <p>
        The full worked solution unlocks after all three hints are open. The course map records honestly that you saw it. That is fine: read
        it, close it, and write the code again yourself the next day.
      </p>

      <h2 id="debugging">Finding a bug with print</h2>
      <p>
        When a row fails and you cannot see why, add <code>print</code> lines to your function and run the tests again. The output appears in
        the failing row.
      </p>
      <CodeBlock
        code={`def largest(a):
    best = 0
    for x in a:
        print("x =", x, "best =", best)    # remove when fixed
        if x > best:
            best = x
    return best`}
        mark={[4]}
      />
      <Note title="Print a little">
        <p>
          On a large test, a <code>print</code> inside a loop can produce a million lines and run out of time. Print while you fix the small
          tests, then remove the lines.
        </p>
      </Note>
      <p>
        Now try the first practice problem: <Link href="/dsa/pyth/practice/1/">PYTH-P1, Rotate the departure board</Link>.
      </p>
    </>
  );
}
