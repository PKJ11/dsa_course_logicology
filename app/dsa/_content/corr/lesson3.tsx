import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SquareFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Many claims in this course are about every size of input: every list, every n. You cannot check them all one by one. Induction proves
        such a claim with two short arguments.
      </p>

      <h2 id="idea">Proving a claim for every n</h2>
      <p>
        Suppose you have a claim about a whole number <M>n</M>, written <M>P(n)</M>. To prove that <M>P(n)</M> is true for every <M>n</M> of 1 or more, prove
        two things:
      </p>
      <ol>
        <li>
          <strong>Base case.</strong> <M>P(1)</M> is true.
        </li>
        <li>
          <strong>Inductive step.</strong> For any <M>k</M> of 1 or more: if <M>P(k)</M> is true, then <M>P(k + 1)</M> is true.
        </li>
      </ol>
      <p>
        Why is that enough? The base case gives <M>P(1)</M>. The step, used with <M>k = 1</M>, then gives <M>P(2)</M>. Used again with <M>k = 2</M>, it
        gives <M>P(3)</M>. This continues with no gaps, so every <M>n</M> is reached.
      </p>
      <p>
        In the step, you <em>assume</em> <M>P(k)</M> and use it. This assumption is called the <em>inductive hypothesis</em>. It is allowed:
        you are not assuming the whole claim, only that it holds for one value of <M>k</M>, and showing that it then also holds for the next.
      </p>

      <h2 id="odd">Example: adding odd numbers</h2>
      <p>
        Claim: <M>1 + 3 + 5 + … + (2n − 1) = n²</M>. In words, the first <M>n</M> odd numbers add up to <M>n</M> squared, <M>n × n</M>. Step through the figure
        first: it builds the sum as a square, one odd number at a time.
      </p>

      <SquareFigure />

      <p>Now the proof in words:</p>
      <ul>
        <li>
          <strong>Base case.</strong> For <M>n = 1</M>, the sum is 1, and <M>1² = 1</M>.
        </li>
        <li>
          <strong>Step.</strong> Assume the first <M>k</M> odd numbers add up to <M>k²</M>. The next odd number is <M>2k + 1</M>. So the first{" "}
          <M>k + 1</M> odd numbers add up to <M>k² + 2k + 1</M>, which is <M>(k + 1)²</M>.
        </li>
      </ul>
      <Invariant label="Rule">Base case, then step from k to k + 1. Together they prove the claim for every n.</Invariant>

      <h2 id="strong">Strong induction</h2>
      <p>
        Sometimes <M>P(k + 1)</M> depends not on <M>P(k)</M> but on some smaller case, such as <M>P(k / 2)</M>. Then use <em>strong induction</em>: in
        the step, assume the claim for <em>every</em> value from 1 to <M>k</M>, not only for <M>k</M>. It is just as valid, and it fits algorithms that
        cut a problem in half.
      </p>
      <p>
        Example. Claim: every whole number <M>n</M> of 2 or more can be written as a product of primes. If <M>n</M> is prime, it is its own product. If not,
        then <M>n = a × b</M> with both <M>a</M> and <M>b</M> between 2 and <M>n − 1</M>. By the strong hypothesis, both <M>a</M> and <M>b</M> are products of
        primes, so <M>n</M> is too.
      </p>

      <h2 id="code">Induction proves recursive code</h2>
      <p>
        A recursive function calls itself on a smaller input. Proving it correct is induction on the size of the input: the base case of the
        proof is the base case of the code.
      </p>
      <CodeBlock
        code={`def power(x, n):
    """Promise: returns x to the power n, for any whole n >= 0."""
    if n == 0:
        return 1
    half = power(x, n // 2)
    if n % 2 == 0:
        return half * half
    return half * half * x`}
      />
      <ul>
        <li>
          <strong>Base case.</strong> <M>n = 0</M>: it returns 1, and <M>x⁰ = 1</M> (x to the power 0 is 1).
        </li>
        <li>
          <strong>Step (strong).</strong> Take <M>n</M> of 1 or more, and assume the function is correct for every smaller power. Then{" "}
          <code>half</code> is <M>x</M> to the power <M>⌊n/2⌋</M>, where <M>⌊ ⌋</M> means round down. If <M>n</M> is even, <M>n = 2⌊n/2⌋</M>, so{" "}
          <code>half * half</code> is <M>xⁿ</M>, n copies of x multiplied together. If <M>n</M> is odd, <M>n = 2⌊n/2⌋ + 1</M>, so one more <code>* x</code> is needed.
        </li>
      </ul>
      <p>
        Notice what the proof did <em>not</em> do. It never followed the calls down to the bottom. It assumed that the smaller call is correct, because the
        hypothesis allows that. This is how to think about recursion in RECR: assume the smaller call is correct, and check only one level.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <Note title="Forgetting the base case" warn>
        <p>
          A step with no base case proves nothing. In code, a missing base case means the function calls itself forever, until Python stops it
          with a <code>RecursionError</code>.
        </p>
      </Note>
      <Note title="A step that does not work for every k" warn>
        <p>
          The step must hold for <em>every</em> <M>k</M>, including the smallest. A well-known false &ldquo;proof&rdquo; claims that all horses are the
          same colour. Its step takes a group of k + 1 horses and splits it into two overlapping groups of k horses each. For k = 1, a group of 2 horses splits into two groups of 1, which do not overlap, so the step fails there without saying so. Check your step on the smallest case
          by hand.
        </p>
      </Note>
    </>
  );
}
