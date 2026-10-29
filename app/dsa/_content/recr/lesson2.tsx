import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { StackFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        When a function calls another function, the first one must wait and later carry on where it stopped. Python keeps track of all the
        waiting calls on the call stack. Recursion is just many calls to the same function on that stack.
      </p>

      <h2 id="frames">Frames</h2>
      <p>
        Each call gets a <em>frame</em>: a small record that holds the call&rsquo;s own local names (its parameters and variables) and the place in
        the code where it is. You met frames in <Link href="/dsa/pyth/3/">PYTH-3</Link>. When a function calls another, Python puts a new frame on
        top. When a call returns, its frame is removed and the frame below carries on. This is a <em>stack</em>: the last frame added is the first
        one removed.
      </p>
      <p>
        So each recursive call has its own <code>n</code>. The <code>n</code> in <code>fact(3)</code> and the <code>n</code> in <code>fact(2)</code> are
        different names in different frames, even though the code is the same.
      </p>

      <StackFigure />

      <h2 id="two-halves">Work on the way down, work on the way up</h2>
      <p>
        Code before the recursive call runs on the way down, from the first call to the base case. Code after it runs on the way back up, in
        reverse order. Compare:
      </p>
      <CodeBlock
        code={`def down(n):
    if n == 0:
        return
    print(n)        # before the call: prints 3, 2, 1
    down(n - 1)

def up(n):
    if n == 0:
        return
    up(n - 1)
    print(n)        # after the call: prints 1, 2, 3`}
      />
      <p>
        In <code>fact</code>, the multiplication happens on the way up. Each frame waits for the answer from below, then multiplies by its own{" "}
        <code>n</code>.
      </p>

      <h2 id="depth">Depth is space</h2>
      <p>
        The largest number of frames on the stack at once is the <em>depth</em> of the recursion. Each frame uses memory, so the depth is extra
        space (<Link href="/dsa/bigo/4/">BIGO-4</Link>):
      </p>
      <ul>
        <li>
          <code>fact(n)</code> goes <M>n</M> deep: <M>O(n)</M> extra space.
        </li>
        <li>
          <code>power(x, n)</code> from lesson 1 goes about <M>log₂ n</M> deep: <M>O(log n)</M>.
        </li>
        <li>
          A function that makes two calls, one after the other, is only as deep as its longest chain of calls, not as deep as its number of calls.
          The first call finishes and its frames are gone before the second starts.
        </li>
      </ul>
      <Note title="Python's limit" warn>
        <p>
          Python allows about 1,000 frames. <code>sys.setrecursionlimit</code> can raise this, but each frame also uses part of a fixed block of
          memory, and a very deep recursion can crash Python instead of raising an error. For depths in the thousands or more, use a loop and your
          own stack (lesson 6).
        </p>
      </Note>

      <h2 id="tail">Why Python does not remove the last call</h2>
      <p>
        In <code>return f(n - 1)</code>, the call is the last thing the function does. Some languages then reuse the frame, so this kind of
        recursion uses no extra space. Python does not do this, on purpose, so that error messages show every call. In Python, write such a
        function as a loop.
      </p>
      <p>
        Now try <Link href="/dsa/recr/practice/1/">RECR-P1, Power on a clock</Link>: its recursion is only about 60 frames deep, even for{" "}
        <M>n = 10¹⁸</M> (a 1 followed by 18 zeros).
      </p>
    </>
  );
}
