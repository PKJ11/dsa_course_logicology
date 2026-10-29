import { CodeBlock } from "../../_components/Code";
import { Invariant, Note } from "../../_components/Prose";
import { StressFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Tests and proofs do different jobs. A test can show that code is wrong. Only a proof can show that it is right. Good programmers use both, and
        they choose their tests with a plan.
      </p>

      <h2 id="limits">What tests can and cannot show</h2>
      <p>
        A test checks one input. If it fails, you have a counterexample, and the code is wrong. If it passes, you have learned only that the
        code works for that one input. A function for lists of up to a million values has more possible inputs than any set of tests (a <em>test suite</em>) could ever
        cover.
      </p>
      <Invariant label="Rule">Testing can show that bugs exist. It cannot show that they do not.</Invariant>
      <p>
        That does not make tests weak. Most bugs are found by tests, quickly and cheaply. But a test suite can only find the bugs that its inputs reach, and someone
        chose those inputs. The rest of this lesson is about choosing them well.
      </p>

      <h2 id="choosing">Choosing tests</h2>
      <p>Good tests come from the spec and from the code:</p>
      <ul>
        <li>
          <strong>From the spec:</strong> the edges of the input condition. Empty, one value, all equal, smallest and largest values allowed.
        </li>
        <li>
          <strong>From the code:</strong> each branch of every <code>if</code>, a loop that runs zero times, once, and many times.
        </li>
        <li>
          <strong>From the proof:</strong> the cases where the reasoning was hardest. If the invariant argument needed care when{" "}
          <code>lo == hi</code>, test that case.
        </li>
        <li>
          <strong>For speed:</strong> the largest input allowed, built so that slow code does the most work.
        </li>
      </ul>
      <p>The practice tests in this course are built in exactly this order, which is why each row has a name.</p>

      <h2 id="stress">Stress testing</h2>
      <p>
        Often you can write two versions of a function: a <em>slow</em> one that is obviously correct, such as checking every pair, and the{" "}
        <em>fast</em> one you actually want. Then let the computer compare them on thousands of small random inputs. This is called{" "}
        <em>stress testing</em>.
      </p>
      <CodeBlock
        code={`import random

def slow(a):                      # obviously correct: compare every pair
    return any(a[i] == a[j] for i in range(len(a)) for j in range(i + 1, len(a)))

for trial in range(10_000):
    n = random.randint(0, 6)
    a = [random.randint(0, 9) for _ in range(n)]
    if fast(a) != slow(a):
        print("found one:", a)
        break`}
      />
      <p>
        Small inputs with small values are best. Repeats and edge cases come up often, and a failing input is easy to read. Step through the
        figure, where a <code>fast</code> that compares only neighbours is run beside a <code>slow</code> that compares every pair.
      </p>

      <StressFigure />

      <h2 id="shrinking">Making a failing input small</h2>
      <p>
        A failing input with 50 values tells you that something is wrong, but not what. So make it smaller. Remove one value. If the test still
        fails, keep the smaller input. If it now passes, put the value back and try removing a different one. Stop when no single removal keeps
        the failure. This is called <em>shrinking</em>.
      </p>
      <p>
        The result, here <code>[1, 7, 1]</code>, usually shows the bug at once: two equal values that are not neighbours. Add it to your
        tests, so that if the bug comes back, a test fails.
      </p>
      <Note title="The slow version can be wrong too">
        <p>
          When the two versions disagree, check the slow one as well. Keep it as simple as possible, so that it is easy to see that it is
          right.
        </p>
      </Note>

      <h2 id="both">Use both</h2>
      <p>
        Prove the idea: the invariant, why the loop stops, the cost. Then test the code, because a correct idea can still be typed wrongly. A
        proof checks the reasoning; tests check the typing. Each catches mistakes the other misses.
      </p>
      <p>
        From here on, every station gives you both. The lessons prove why each algorithm works. The practice tests try to break your version
        of it.
      </p>
    </>
  );
}
