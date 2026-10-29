import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ShrinkFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A recursive function solves a problem by calling itself on a smaller version of the same problem. It works when two things are true:
        the smallest problems are answered directly, and every call makes the problem smaller.
      </p>

      <h2 id="two-parts">Two parts</h2>
      <p>Every recursive function has two parts:</p>
      <ul>
        <li>
          the <strong>base case</strong>: a problem small enough to answer with no further call;
        </li>
        <li>
          the <strong>recursive case</strong>: the function calls itself on a smaller problem, then uses that answer to build its own.
        </li>
      </ul>
      <CodeBlock
        code={`def total(a):
    if not a:                    # base case: the empty list
        return 0
    return a[0] + total(a[1:])   # recursive case: a shorter list`}
        mark={[2, 4]}
      />

      <ShrinkFigure />

      <p>
        This version copies the list with <code>a[1:]</code> at each call, which makes the total work grow with n times n, <M>O(n²)</M> (<Link href="/dsa/bigo/8/">BIGO-8</Link>). It is
        written this way here because it is easy to read. Real code passes an index instead: <code>total(a, i + 1)</code>.
      </p>

      <h2 id="trust">Trust the smaller call</h2>
      <p>
        When you write the recursive case, do not trace every call in your head. Assume the call on the smaller problem returns the right
        answer. Then ask only: given that answer, how do I build mine? This is safe because of induction (<Link href="/dsa/corr/3/">CORR-3</Link>):
      </p>
      <ul>
        <li>The base case is correct: that is the base step of the proof.</li>
        <li>If the call on a smaller input is correct, the current call is correct: that is the inductive step.</li>
      </ul>
      <Invariant label="Rule">Write the base case, assume the smaller call works, and make sure every call really is smaller.</Invariant>

      <h2 id="smaller">Make sure it gets smaller</h2>
      <p>
        &ldquo;Smaller&rdquo; must mean that some whole number goes down with every call and cannot go below the base case. For <code>total</code> it is
        the length of the list. For <code>fact(n)</code> it is <M>n</M>. This is the same idea as proving a loop stops
        (<Link href="/dsa/corr/2/#stopping">CORR-2</Link>).
      </p>
      <p>Common mistakes:</p>
      <ul>
        <li>No base case, or a base case that some inputs never reach. <code>fact(-1)</code> with a base case of <code>n == 0</code> never stops.</li>
        <li>A recursive call on the same input. <code>f(n)</code> calling <code>f(n)</code> never shrinks.</li>
        <li>Forgetting to <code>return</code> the recursive answer. The call happens, but its result is thrown away and the function returns <code>None</code>.</li>
      </ul>
      <p>
        Python stops a recursion that is about 1,000 calls deep with <code>RecursionError</code>. That protects you from endless recursion, but
        it also limits correct recursion on long lists. Lesson 6 shows the fix.
      </p>

      <h2 id="halving">Shrinking by half</h2>
      <p>
        A problem that shrinks by one each time needs <M>n</M> calls. A problem that halves each time needs only about <M>log₂ n</M>, the number of times n can be halved before it reaches 1. Raising a
        number to a power is a good example:
      </p>
      <p>
        To work out <M>xⁿ</M> (n copies of x multiplied together), first work out <M>x</M> to the power <M>n // 2</M>, half of n rounded down,
        with one recursive call. Call the answer <code>half</code>. Then:
      </p>
      <CodeBlock
        code={`half = power(x, n // 2)     # one call, not two
if n % 2 == 0:
    return half * half      # an even n: two halves
return half * half * x      # an odd n needs one more x`}
      />
      <p>
        The base case is <M>n = 0</M>, where the answer is 1. <code>power(x, 1000000)</code> makes about 20 calls instead of a million multiplications. Calling <code>power(x, n // 2)</code> twice instead
        of storing it in <code>half</code> would undo the saving: the calls would double at each level, back to <M>n</M> in total.
      </p>
      <Note title="Python's own tool">
        <p>
          <code>pow(x, n, m)</code> works by halving in the same way, with the remainder by <M>m</M> taken as it goes.{" "}
          <Link href="/dsa/recr/practice/1/">RECR-P1</Link> asks you to build it yourself.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/recr/practice/1/">RECR-P1, Power on a clock</Link>.
      </p>
    </>
  );
}
