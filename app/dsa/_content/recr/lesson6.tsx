import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { FlattenFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Every recursive function can be rewritten as a loop. Sometimes the loop is simpler. Sometimes it is needed, because the recursion would
        be deeper than Python allows. The tool that makes it work is a stack that you keep yourself.
      </p>

      <h2 id="simple">When a loop is enough</h2>
      <p>
        If a function makes one recursive call and that call is the last thing it does, it is really a loop. The parameters just change on each
        pass:
      </p>
      <CodeBlock
        code={`def gcd(a, b):                # recursive
    return a if b == 0 else gcd(b, a % b)

def gcd(a, b):                # the same, as a loop
    while b != 0:
        a, b = b, a % b
    return a`}
      />
      <p>
        If the work happens on the way back up, as in <code>fact</code>, change the order and do the work on the way forward: start a running product at
        1 and multiply by 1, 2, …, <M>n</M>.
      </p>

      <h2 id="bottom-up">Memoised recursion as a table</h2>
      <p>
        A memoised function (lesson 3) fills in answers for small arguments first, then bigger ones. A loop can fill the same table in the same
        order, smallest first. This is called working <em>bottom-up</em>:
      </p>
      <CodeBlock
        code={`def fib(n):
    if n < 2:
        return n
    prev, cur = 0, 1                # fib(0), fib(1)
    for _ in range(n - 1):
        prev, cur = cur, prev + cur
    return cur`}
      />
      <p>
        No recursion, so no depth limit. And because each value needs only the two before it, the table shrinks to two names: <M>O(1)</M> space.
        The DYNP station is built on this step.
      </p>

      <h2 id="stack">Your own stack</h2>
      <p>
        When a function makes several calls, or must come back to finish work, a plain loop is not enough. Use a list as a stack: push what is
        left to do, and pop the next job off the top. Python&rsquo;s call stack did exactly this; now you do it, with no depth limit. Step through
        both versions:
      </p>

      <FlattenFigure />

      <p>
        The items are pushed in reverse order so that the first one is popped first. This keeps the same left-to-right order as the recursive
        version. If the order does not matter, you can skip the reverse.
      </p>

      <h2 id="when">When to switch</h2>
      <ul>
        <li>The depth can grow with the input, as with long linked lists, deep nesting or tall trees. Then use a loop or your own stack.</li>
        <li>The depth stays small, like <M>log n</M> or a short search. Then recursion is fine, and often clearer.</li>
        <li>Speed matters a lot. A Python function call costs more than a loop pass, so a loop can be a few times faster.</li>
      </ul>
      <Note title="Coming back to finish work">
        <p>
          Some recursive functions do work after their calls return, such as visiting a tree&rsquo;s left side, then the node, then the right side.
          To copy that with a stack, push a marker that says &ldquo;come back to this node&rdquo; along with the jobs. The TREE station shows this for
          tree walks.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/recr/practice/6/">RECR-P6, Parcels inside parcels</Link> and{" "}
        <Link href="/dsa/recr/practice/2/">RECR-P2, Steps on the footbridge</Link>.
      </p>
    </>
  );
}
