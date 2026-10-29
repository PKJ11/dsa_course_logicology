import { CodeBlock } from "../../_components/Code";
import { Invariant, Note } from "../../_components/Prose";
import { SpecFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Before you can show that code is correct, you need to say exactly what it should do. That statement is called a specification, or
        spec. Without one, &ldquo;correct&rdquo; has no meaning.
      </p>

      <h2 id="spec">A promise about inputs and outputs</h2>
      <p>
        A <em>specification</em> describes what a function must do, without saying how. It has two parts:
      </p>
      <ul>
        <li>
          the <strong>input condition</strong>: what must be true of the inputs before the call;
        </li>
        <li>
          the <strong>promise</strong>: what will be true of the answer, if the input condition was true.
        </li>
      </ul>
      <p>Here is a spec for a function that finds the largest value in a list:</p>
      <CodeBlock
        code={`def largest(a):
    """Input condition: a is a list of numbers, and it is not empty.
    Promise: returns m, where m is in a,
             and no value in a is bigger than m."""`}
      />
      <p>
        A function is <em>correct</em> if, for every input that meets the input condition, the promise holds. Not for most inputs. For every
        one.
      </p>

      <h2 id="conditions">Input conditions and promises</h2>
      <p>
        Each side has its own job. The caller must meet the input condition. The function must keep the promise. If the caller passes an
        empty list, the spec promises nothing, and the function may do anything: return a wrong value, or raise an error.
      </p>
      <p>
        Notice that the promise has two parts, and both are needed. &ldquo;No value in <code>a</code> is bigger than <code>m</code>&rdquo; alone is
        true for <code>m = 1,000,000</code>. &ldquo;<code>m</code> is in <code>a</code>&rdquo; rules that out. A weak spec lets wrong code pass.
      </p>
      <p>
        Step through the figure. It runs two versions of <code>largest</code> on five inputs and checks each part of the promise. One version
        starts with <code>best = 0</code>. Find the input that breaks it.
      </p>

      <SpecFigure />

      <Invariant label="Rule">
        A function is correct when every input that meets the input condition gets an answer that keeps the promise.
      </Invariant>

      <h2 id="edges">Edge cases</h2>
      <p>
        Most bugs show up at the edges of the input condition: the smallest inputs and the unusual ones. The version with <code>best = 0</code> works
        on every list that holds a positive number. It fails only when every value is negative. A few random tests could easily miss that.
      </p>
      <p>Before writing any code, list the edge cases the spec allows. For a list, ask:</p>
      <ul>
        <li>Can it be empty? Can it have just one value?</li>
        <li>Can values repeat? Can they be negative, or zero?</li>
        <li>Is the answer at the very start, or the very end?</li>
        <li>What happens with the largest input the limits allow?</li>
      </ul>
      <p>
        The test rows in every practice problem start with exactly these cases. Each one exists because students got it wrong.
      </p>

      <h2 id="stops">The right answer, and it stops</h2>
      <p>Showing that a function is correct has two parts:</p>
      <ol>
        <li>
          <strong>If it returns, the answer keeps the promise.</strong> This is called <em>partial correctness</em>.
        </li>
        <li>
          <strong>It always returns.</strong> It never runs forever. This is called <em>termination</em>.
        </li>
      </ol>
      <p>
        You need both. A loop that never ends never returns a wrong answer, so it is partially correct, but it is still useless. The next lesson
        shows how to prove each part for a loop.
      </p>
      <Note title="Specs in practice problems">
        <p>
          Each problem statement in this course is a spec. The examples, the &ldquo;Limits&rdquo; list and phrases like &ldquo;the list may be
          empty&rdquo; are its input condition. Read them before you write code, and turn each one into a question: what should happen then?
        </p>
      </Note>
    </>
  );
}
