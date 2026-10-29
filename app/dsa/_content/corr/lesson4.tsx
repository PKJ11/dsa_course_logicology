import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CoinFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Two more tools. Proof by contradiction shows a claim is true by showing that its opposite is impossible. A counterexample shows a claim
        is false with a single input.
      </p>

      <h2 id="contradiction">Proof by contradiction</h2>
      <p>To prove a claim by contradiction:</p>
      <ol>
        <li>Assume the claim is false.</li>
        <li>Reason from that assumption, one correct step at a time.</li>
        <li>Reach something impossible, such as a number that is both even and odd.</li>
      </ol>
      <p>
        Every step was correct, so the only thing that can be wrong is the assumption. So the claim is true. This method suits claims of the
        form &ldquo;there is no …&rdquo; or &ldquo;it is impossible to …&rdquo;, which are hard to prove directly. The proof that sorting needs about{" "}
        <M>n log n</M> comparisons, n times the number of times n can be halved (SORT-5), has this shape.
      </p>

      <h2 id="pigeonhole">Example: a repeat must exist</h2>
      <p>
        Claim: if a list holds 11 whole numbers, each from 1 to 10, then some number appears at least twice.
      </p>
      <p>
        Assume the opposite: all 11 numbers are different. There are only 10 possible values, from 1 to 10. Eleven different numbers would need
        11 different values. That is impossible. So the assumption was false, and some number must repeat.
      </p>
      <p>
        This is called the <em>pigeonhole principle</em>: if you put more items than boxes, some box gets two items. It proves that a repeat{" "}
        <em>exists</em>, without saying which number repeats. It shows up in hashing (HASH), in cycle detection, and in many proofs that a task needs at least a certain number of steps.
      </p>
      <Invariant label="Rule">
        If <M>n + 1</M> items go into <M>n</M> boxes, at least one box holds two items.
      </Invariant>

      <h2 id="counterexample">One counterexample is enough</h2>
      <p>
        A claim like &ldquo;this function is correct&rdquo; is about <em>every</em> valid input. To prove it false, you need only <em>one</em> valid
        input where it fails. That input is called a <em>counterexample</em>.
      </p>
      <p>
        The two directions are not equal. A thousand passing inputs do not prove a function correct. One failing input proves it wrong. So when you
        suspect a claim, the fastest way to decide is often to look for a counterexample first. If you cannot find one, the search usually
        shows you why the claim is true, and that becomes the proof.
      </p>

      <h2 id="coins">Example: making change with coins</h2>
      <p>
        Claim: to make an amount with the fewest coins, always take the biggest coin that fits, and repeat. This is called a <em>greedy</em>{" "}
        method: it makes the choice that looks best right now, and never goes back. With Indian coins of 1, 2, 5 and 10 rupees, it works. But
        is it true for every set of coins? Step through the figure, which uses coins of 1, 3 and 4.
      </p>

      <CoinFigure />

      <p>
        For 7, greedy takes 4 and then 3, which is best. For 6, greedy takes 4, 1 and 1: three coins. But 3 + 3 makes 6 with two. So the claim is
        false, and the amount 6 with coins 1, 3, 4 is a counterexample. The GRDY station shows how to prove when greedy methods <em>do</em> work,
        and DYNP shows how to solve this coin problem correctly.
      </p>

      <h2 id="finding">How to find a counterexample</h2>
      <ul>
        <li>
          <strong>Try the edges first.</strong> Empty input, one value, all values equal, negative numbers, the answer at the very start or end.
        </li>
        <li>
          <strong>Try all small inputs.</strong> Many bugs show up on inputs of size 3 or 4. A loop can try every small input in a fraction of a
          second, as the next lesson shows.
        </li>
        <li>
          <strong>Test the reasoning.</strong> Find the step in the argument you are least sure of, and build an input that breaks exactly that
          step.
        </li>
      </ul>
      <CodeBlock
        code={`from itertools import product

# Try every list of length 0 to 4 with values 0 to 3.
for n in range(5):
    for a in product(range(4), repeat=n):
        a = list(a)
        if fast(a) != slow(a):
            print("counterexample:", a)`}
      />
      <Note title="Practice problem 4">
        <p>
          The practice for this lesson gives you four functions that each have a bug. For each one, you return an input that breaks it. That is
          exactly the skill this lesson teaches.
        </p>
      </Note>
    </>
  );
}
