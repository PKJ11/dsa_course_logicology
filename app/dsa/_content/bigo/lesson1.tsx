import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CountFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Two programs can both be correct while one takes a second and the other takes a day. To compare them before you run them, count the
        steps each one takes, and see how that count grows as the input grows.
      </p>

      <h2 id="why">Why count steps, not seconds</h2>
      <p>
        You could time a program with a stopwatch. But the time depends on the computer, on what else it is doing, and on the language. A
        faster laptop makes every program faster, and it does not tell you which program is better.
      </p>
      <p>
        So we count <em>steps</em> instead. The count depends only on the program and its input. We write <M>n</M> for the size of the input, such
        as the length of a list. Then we ask: as <M>n</M> grows, how fast does the number of steps grow?
      </p>

      <h2 id="model">What counts as one step</h2>
      <p>One step is any small action that takes about the same time whatever the input is. For example:</p>
      <ul>
        <li>adding, comparing or assigning two numbers;</li>
        <li>reading or writing <code>a[i]</code>;</li>
        <li>calling a function (not counting the work inside it) and returning.</li>
      </ul>
      <p>
        Some single lines of Python are <strong>not</strong> one step. <code>x in a</code> on a list checks values one by one, so it can take{" "}
        <M>n</M> steps. <code>a[1:]</code> copies <M>n − 1</M> values. <code>sorted(a)</code> takes about <M>n log₂ n</M> steps. Lesson 8 lists these
        hidden costs.
      </p>
      <p>
        We do not try to count exactly. Whether a comparison is one step or three does not change how the count <em>grows</em>. That is why the
        next lesson drops the constant numbers.
      </p>

      <h2 id="loops">Loops multiply</h2>
      <p>
        A loop that runs <M>n</M> times, doing a few steps each time, does about <M>n</M> steps. A loop inside a loop runs its inner part{" "}
        <M>n</M> times for each of the <M>n</M> outer passes, which is <M>n × n = n²</M> steps. Step through the three versions:
      </p>

      <CountFigure />

      <p>
        The third version is common. It compares each pair of values once: the inner loop starts after <code>i</code>. Its inner loop runs{" "}
        <M>n − 1</M>, then <M>n − 2</M>, and so on down to 0 times. The sum is:
      </p>
      <Invariant label="Sum">
        0 + 1 + 2 + … + (n − 1) = n(n − 1) / 2
      </Invariant>
      <p>
        Here is why. Write the sum forwards and backwards, one under the other. Each of the <M>n</M> columns adds up to <M>n − 1</M>, so two copies
        of the sum make <M>n(n − 1)</M>. One copy is half of that. For <M>n = 4</M> it gives 6. For <M>n = 1,000</M> it gives 499,500, which is
        about half of <M>n²</M>.
      </p>
      <Note title="Loops one after another add">
        <p>
          Two loops that run one after the other, not one inside the other, add their steps. A loop of <M>n</M> passes followed by another of{" "}
          <M>n</M> passes is <M>2n</M> steps, not <M>n²</M>.
        </p>
      </Note>

      <h2 id="cases">Best, worst and average case</h2>
      <p>The step count can depend on the values, not only on <M>n</M>. Take a search that stops when it finds the target:</p>
      <CodeBlock
        code={`def find(a, t):
    for i in range(len(a)):
        if a[i] == t:
            return i
    return -1`}
      />
      <ul>
        <li>
          <strong>Best case:</strong> the target is at index 0. One comparison.
        </li>
        <li>
          <strong>Worst case:</strong> the target is missing. <M>n</M> comparisons.
        </li>
        <li>
          <strong>Average case:</strong> if the target is in the list and every position is equally likely, about <M>n/2</M> comparisons.
        </li>
      </ul>
      <p>
        Unless we say otherwise, this course gives the <strong>worst case</strong>. It is a promise: the program never takes longer than this.
        The best case is rarely useful, because it describes the luckiest input. The average case needs a guess about what inputs are likely,
        and that guess may be wrong. In practice the tests try hard to give you the worst case.
      </p>
      <p>
        Now try <Link href="/dsa/bigo/practice/2/">BIGO-P2, Count the steps</Link>. It asks you to count a loop like this without running it.
      </p>
    </>
  );
}
