import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { SpaceFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Programs use memory as well as time. Space cost is counted the same way as time: how much memory the program needs, as a function of{" "}
        <M>n</M>, using the same O, Ω and Θ.
      </p>

      <h2 id="memory">Counting memory</h2>
      <p>
        One number, one name, or one reference counts as one unit of memory. A list of <M>n</M> numbers is <M>Θ(n)</M>. An <M>n × n</M> grid is{" "}
        <M>Θ(n²)</M>. A dictionary with <M>k</M> keys is <M>Θ(k)</M>.
      </p>
      <p>
        Memory limits are usually less tight than time limits, but they are real. A grid of 100,000 by 100,000 numbers is 10 billion values,
        which will not fit in a laptop&rsquo;s memory.
      </p>

      <h2 id="extra">Input space and extra space</h2>
      <p>
        The input itself already takes space. Usually we count only the <em>extra</em> space: the memory the algorithm uses on top of its
        input. Compare two ways to reverse a list:
      </p>
      <CodeBlock
        code={`def reversed_copy(a):
    return a[::-1]            # a new list: Θ(n) extra space

def reverse_in_place(a):
    i, j = 0, len(a) - 1      # two names: Θ(1) extra space
    while i < j:
        a[i], a[j] = a[j], a[i]
        i += 1
        j -= 1`}
      />
      <p>
        An algorithm that uses only <M>O(1)</M> extra space is called <em>in place</em>. It changes its input instead of building a new one. That
        saves memory, but the caller loses the original order. Say clearly in your spec which one your function does.
      </p>

      <h2 id="stack">The call stack uses space</h2>
      <p>
        Each function call that has not returned yet keeps a <em>frame</em> in memory: its arguments and local names. A recursive function that
        goes <M>d</M> calls deep keeps <M>d</M> frames at once. Step through the same sum written both ways:
      </p>

      <SpaceFigure />

      <p>
        Both versions take <M>Θ(n)</M> time. The loop uses <M>Θ(1)</M> extra space. The recursion uses <M>Θ(n)</M> extra space, one frame per
        value. This is easy to miss, because there is no list in the code.
      </p>
      <Note title="Python's depth limit" warn>
        <p>
          Python stops a recursion at about 1,000 frames deep and raises <code>RecursionError</code>. So the recursive sum fails for a list of
          5,000 values, even though the loop has no trouble. <Link href="/dsa/recr/2/">RECR-2</Link> looks at the call stack in detail.
        </p>
      </Note>
      <p>
        Recursion that halves its input, like binary search written recursively, is only <M>log₂ n</M> frames deep. For a million values that is
        about 20 frames, which is no problem.
      </p>

      <h2 id="trade">Trading space for time</h2>
      <p>
        Many fast algorithms use extra memory to save time. Finding a repeated value shows the trade clearly:
      </p>
      <ul>
        <li>Compare every pair: <M>Θ(n²)</M> time, <M>Θ(1)</M> extra space.</li>
        <li>Sort a copy, then compare neighbours: <M>Θ(n log n)</M> time, <M>Θ(n)</M> extra space.</li>
        <li>Keep a set of values seen so far: <M>Θ(n)</M> time on average, <M>Θ(n)</M> extra space.</li>
      </ul>
      <p>
        Usually the set is the right choice. When memory is very tight, or the input is too big to hold twice, the other two matter. The
        dynamic programming stations use this trade all the time: they store answers to small problems so that they never work them out
        twice.
      </p>
      <p>
        Now try <Link href="/dsa/bigo/practice/3/">BIGO-P3, Keep the first of each</Link>. A little extra space makes it fast.
      </p>
    </>
  );
}
