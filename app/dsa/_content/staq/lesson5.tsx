import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { NextGreaterFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A monotonic stack is an ordinary stack with one extra rule: its values always go in one direction, for example always down from bottom to
        top. With that rule, many &ldquo;find the next bigger value&rdquo; questions can be answered in one pass.
      </p>

      <h2 id="problem">The next bigger value</h2>
      <p>
        For each value in a list, find the first value to its right that is bigger. If there is none, the answer is −1. For{" "}
        <code>[2, 7, 3, 5, 4, 6, 1]</code> the answers are <code>[7, -1, 5, 6, 6, -1, -1]</code>.
      </p>
      <p>
        The direct way looks to the right from every place until it finds something bigger. When the list goes down, such as{" "}
        <code>[9, 8, 7, …, 1]</code>, every search runs to the end, so the total is about <M>n² / 2</M> steps (n multiplied by n, then halved): <M>O(n²)</M>.
      </p>

      <h2 id="stack">Keep a stack in order</h2>
      <p>
        Ask the question the other way. Walk from left to right, and keep a stack of places that are still waiting for their answer. When a new value
        arrives, it is the answer for every waiting place whose value is smaller. Those places are all at the top of the stack, so pop them.
      </p>
      <NextGreaterFigure />
      <Invariant>The values at the places on the stack go down from bottom to top.</Invariant>
      <p>
        Why does this stay true? A new value pops everything on top that is smaller, so when it is pushed, the value below it is at least as big.
        And why are the smaller values all at the top? Because the values go down towards the top, the first value that is not smaller stops the
        popping, and everything below it is bigger still.
      </p>
      <p>
        Start with every answer set to −1 and an empty stack. Then, for each place <code>i</code> with value <code>x</code>, do this step:
      </p>
      <CodeBlock
        code={`while stack and a[stack[-1]] < x:
    answer[stack.pop()] = x     # x is the answer for that place
stack.append(i)                 # i now waits for its answer`}
      />
      <p>Places still on the stack at the end keep −1. STAQ-P5 asks a question of this kind.</p>
      <p>
        The stack holds <em>places</em>, not values, because the answer must be written at the right place. You can always read the value with{" "}
        <code>a[place]</code>.
      </p>

      <h2 id="cost">Why it is O(n)</h2>
      <p>
        There is a loop inside a loop, which often means <M>O(n²)</M>: time that grows with n multiplied by n. Not here. Count the work by place instead of by pass: each place is pushed
        exactly once, and popped at most once. So there are at most <M>n</M> pushes and <M>n</M> pops in the whole run, however they are spread
        over the passes. The total is <M>O(n)</M>.
      </p>
      <p>
        This way of counting, where you add up the work over the whole run instead of taking the worst pass, is amortised analysis (BIGO-7). One
        pass may pop many places, but only because earlier passes pushed them without popping.
      </p>

      <h2 id="family">The same idea, other questions</h2>
      <ul>
        <li>
          <strong>Next smaller value:</strong> keep the values going <em>up</em> from bottom to top, and pop while the top is bigger.
        </li>
        <li>
          <strong>Previous bigger value:</strong> when you push place <code>i</code>, the place just below it on the stack is the nearest bigger
          value to its left (or there is none, if the stack was empty).
        </li>
        <li>
          <strong>Distance instead of value:</strong> write <code>i - place</code> instead of <code>x</code>. &ldquo;How many days until a warmer
          day?&rdquo; is this question.
        </li>
        <li>
          <strong>Largest rectangle under a bar chart:</strong> each bar spreads left and right until it meets a shorter bar. The previous and next
          smaller bars give both edges, again in <M>O(n)</M>.
        </li>
      </ul>
      <Note title="Which way, and strict or not?">
        <p>
          Decide two things before you code: is the stack going up or down, and do you pop on <code>&lt;</code> or <code>&lt;=</code>? With equal
          values these give different answers. For &ldquo;strictly bigger&rdquo;, pop while the top is <code>&lt; x</code>, so equal values wait.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/staq/practice/5/">STAQ-P5, Next taller signal</Link>.
      </p>
    </>
  );
}
