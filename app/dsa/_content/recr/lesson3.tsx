import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { FibFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        When a function makes more than one recursive call, the calls form a tree. Drawing the tree shows how many calls there are, and often
        shows that the same small problem is being solved again and again.
      </p>

      <h2 id="tree">Drawing the calls</h2>
      <p>
        The Fibonacci numbers are 0, 1, 1, 2, 3, 5, 8, …: each one is the sum of the two before it. Written straight from that rule:
      </p>
      <CodeBlock
        code={`def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`}
      />
      <p>
        Each call with <M>n</M> of 2 or more makes two calls. Draw each call as a box, with the calls it makes below it. That picture is the{" "}
        <em>recursion tree</em>. Python visits it from left to right, going all the way down each branch first.
      </p>

      <FibFigure />

      <h2 id="cost">Counting the calls</h2>
      <p>
        Let <M>C(n)</M> be the number of calls <code>fib(n)</code> makes. Then <M>C(n) = 1 + C(n − 1) + C(n − 2)</M>, which grows at least as fast as
        the Fibonacci numbers themselves. Those grow by a factor of about 1.618 each step. So <code>fib(n)</code> takes about <M>1.6ⁿ</M> calls (n copies of 1.6 multiplied together):
        exponential. <code>fib(30)</code> makes about 2.7 million calls, and <code>fib(50)</code> would take hours.
      </p>
      <p>
        The tree also shows why: <code>fib(3)</code> is worked out twice inside <code>fib(5)</code>, and <code>fib(2)</code> three times. The number of{" "}
        <em>different</em> problems is only <M>n + 1</M>: <code>fib(0)</code> to <code>fib(n)</code>. All the rest is repeated work.
      </p>

      <h2 id="memo">Remember answers: memoisation</h2>
      <p>
        <em>Memoisation</em> means storing each answer the first time it is worked out, and looking it up after that. Step through the second
        version of the figure.
      </p>
      <CodeBlock
        code={`memo = {}
def fib(n):
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]`}
      />
      <p>
        Now each of the <M>n + 1</M> problems is solved once. Every other call is a dictionary lookup. That is <M>O(n)</M> calls instead of about{" "}
        <M>1.6ⁿ</M>. Python can add the memo for you:
      </p>
      <CodeBlock
        code={`from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)`}
      />
      <Note title="When memoisation helps">
        <p>
          It helps only when the same arguments come up again: <em>overlapping subproblems</em>. Merge sort&rsquo;s calls never repeat, so a memo
          would only waste memory. Overlapping subproblems are the starting point of dynamic programming, in the DYNP station.
        </p>
      </Note>

      <h2 id="shapes">Common tree shapes</h2>
      <ul>
        <li>
          <strong>A chain</strong> (one call, shrinking by 1): <M>n</M> calls. A recursive sum.
        </li>
        <li>
          <strong>A halving chain</strong> (one call on half): <M>log n</M> calls. Fast power, binary search.
        </li>
        <li>
          <strong>A balanced binary tree</strong> (two calls on halves): about <M>2n</M> calls in all, in <M>log n</M> levels. Merge sort.
        </li>
        <li>
          <strong>A full binary tree of depth n</strong> (two calls shrinking by 1): <M>2ⁿ</M> calls, n twos multiplied together. Subsets, in lesson 4.
        </li>
      </ul>
      <p>
        <Link href="/dsa/bigo/5/">BIGO-5</Link> turns these trees into exact costs. Now try{" "}
        <Link href="/dsa/recr/practice/2/">RECR-P2, Steps on the footbridge</Link>.
      </p>
    </>
  );
}
