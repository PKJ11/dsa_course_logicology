import { CodeBlock } from "../../_components/Code";
import { Note } from "../../_components/Prose";
import { LoopFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Almost every algorithm in this course is a loop. This lesson shows the loops Python offers, and how to read a loop one line at a
        time.
      </p>

      <h2 id="for">Looping over values</h2>
      <p>
        A <code>for</code> loop runs its body once for each value in a list. Each time, the loop name (here <code>x</code>) refers to the next
        value. The body is the indented block under the <code>for</code> line.
      </p>
      <p>
        Step through the figure. The highlighted line is the one about to run, and the table shows every name and its value. A row turns
        yellow when its value has just changed. Then switch to the comprehension and the <code>while</code> loop.
      </p>

      <LoopFigure />

      <p>
        Reading code this way, one line and one table of values at a time, is called <em>tracing</em>. It is slow, but it is the most reliable
        way to find out what a loop really does. When a practice test fails, trace the failing input by hand.
      </p>

      <h2 id="range">Looping over indices</h2>
      <p>
        Sometimes you need the index, not only the value. For example, to compare each value with the one before it. Then loop over{" "}
        <code>range</code>:
      </p>
      <CodeBlock
        code={`range(5)          # 0, 1, 2, 3, 4
range(2, 5)       # 2, 3, 4
range(0, 10, 3)   # 0, 3, 6, 9
range(4, 0, -1)   # 4, 3, 2, 1

for i in range(1, len(a)):
    print(a[i] - a[i - 1])    # the change from the value before`}
      />
      <p>
        <code>range(start, stop)</code> stops before <code>stop</code>, just like a slice. The loop above starts at 1, so that{" "}
        <code>a[i - 1]</code> always exists.
      </p>

      <h2 id="enumerate">enumerate and zip</h2>
      <p>
        <code>enumerate</code> gives you the index and the value together. <code>zip</code> goes through two lists together, one item from each at a time, and stops at the end
        of the shorter one.
      </p>
      <CodeBlock
        code={`for i, x in enumerate(["BCT", "HWH", "MAS"]):
    print(i, x)          # 0 BCT, then 1 HWH, then 2 MAS

for x, y in zip([1, 2, 3], [10, 20, 30]):
    print(x + y)         # 11, then 22, then 33`}
      />

      <h2 id="while">while loops</h2>
      <p>
        A <code>while</code> loop repeats as long as a condition is true. Use it when you do not know in advance how many passes you need, as in
        the halving loop in the figure. Binary search is a <code>while</code> loop.
      </p>
      <Note title="A while loop that never ends" warn>
        <p>
          The body must change something the condition depends on. If <code>n</code> never got smaller, <code>while n &gt; 1</code> would run
          forever. In practice, a loop that never ends shows up as &ldquo;Timed out&rdquo;.
        </p>
      </Note>

      <h2 id="comprehensions">List comprehensions</h2>
      <p>A list comprehension builds a new list in one expression. These two pieces of code make the same list:</p>
      <CodeBlock
        code={`squares = []
for x in range(6):
    squares.append(x * x)

squares = [x * x for x in range(6)]          # [0, 1, 4, 9, 16, 25]
odd_squares = [x * x for x in range(6) if x % 2 == 1]   # [1, 9, 25]`}
      />
      <p>
        Read a comprehension from the <code>for</code>: &ldquo;for each <code>x</code> in <code>range(6)</code>, keep <code>x * x</code>&rdquo;. Use one
        when the loop only builds a list. When the loop does more than that, a plain <code>for</code> loop is easier to read.
      </p>

      <h2 id="break">break and continue</h2>
      <p>
        <code>break</code> leaves the loop at once. <code>continue</code> skips the rest of this pass and goes on to the next value.
      </p>
      <CodeBlock
        code={`for x in a:
    if x < 0:
        continue      # ignore negative values
    if x == target:
        print("found")
        break         # stop looking`}
      />
      <p>
        A <code>return</code> inside a loop in a function also ends the loop, because it ends the whole function. Most search loops in this
        course end that way.
      </p>
    </>
  );
}
