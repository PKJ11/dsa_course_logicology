import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { LevelFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        BIGO-6 gave the master theorem for recurrences of the form T(n) = a T(n/b) + nᵈ. Real methods do not always fit that form: the work
        outside the calls may have a log in it, or the two parts may have different sizes. This lesson shows how to get the recurrence from
        code, how to handle those two cases, and how to check an answer by measuring.
      </p>

      <h2 id="code">From code to recurrence</h2>
      <p>To write the recurrence of a recursive function, read three things off the code:</p>
      <ul>
        <li>
          <strong>How many recursive calls</strong> one call makes. That is <M>a</M>.
        </li>
        <li>
          <strong>How big each call&rsquo;s input is</strong>, compared with the original. Halves give <M>n/2</M>, so <M>b = 2</M>.
        </li>
        <li>
          <strong>How much work one call does outside its recursive calls</strong>: splitting, joining, copying. Call it <M>f(n)</M>.
        </li>
      </ul>
      <p>
        Then <M>T(n) = a T(n/b) + f(n)</M>. Watch for hidden work. A slice such as <code>a[:mid]</code> copies <M>mid</M> values, so it costs{" "}
        <M>O(n)</M>, not <M>O(1)</M> (BIGO-8). A call that sorts its part costs <M>O(n log n)</M>. A loop over the part costs <M>O(n)</M>.
      </p>
      <CodeBlock
        title="three_shapes.py"
        code={`def find(a, x, lo, hi):          # 1 call on half: T(n) = T(n/2) + 1
    ...

def total(a):                     # 2 calls on halves, plus 2 slices:
    if len(a) == 1:               # T(n) = 2 T(n/2) + n
        return a[0]
    mid = len(a) // 2
    return total(a[:mid]) + total(a[mid:])

def strip_sorted(points):         # 2 calls, plus a sort of the part:
    ...                           # T(n) = 2 T(n/2) + n log n`}
      />
      <p>
        <strong>Floors and ceilings do not matter.</strong> A list of 7 values splits into 3 and 4, not two halves of 3.5. Writing{" "}
        <M>T(⌊n/2⌋) + T(⌈n/2⌉)</M> (⌊ ⌋ means round down, ⌈ ⌉ means round up) gives the same Θ answer as <M>2 T(n/2)</M>. The same is true
        of the base case: any fixed size and any fixed cost give the same answer.
      </p>

      <h2 id="log">Work with a log factor</h2>
      <p>
        Suppose each call sorts its part before combining, so <M>T(n) = 2 T(n/2) + n log n</M>. Here <M>a = 2</M> and <M>b = 2</M>, but{" "}
        <M>f(n) = n log n</M> is not a power of n, so the basic theorem does not apply. Add up the levels instead. Level k has 2ᵏ parts of
        size n/2ᵏ, each doing about (n/2ᵏ) log₂(n/2ᵏ) work, so the level does <M>n (log₂ n − k)</M>. Step through the third variant of the
        figure.
      </p>
      <p>
        The levels shrink only slowly, so they do not form a series where the top term wins. Their sum is n × (log₂ n + (log₂ n − 1) + … + 1),
        about <M>n (log₂ n)² / 2</M>. So <M>T(n) = Θ(n log² n)</M>, where log² n means (log n)²: log n multiplied by log n.
      </p>
      <Invariant label="Rule">
        When a = bᵈ and the work outside the calls is nᵈ (log n)ᵖ, the total is nᵈ (log n)<sup>p + 1</sup>: one more log.
      </Invariant>
      <p>
        This is the case where every level costs about the same. When <M>a</M> is less than <M>bᵈ</M> the top level still wins, so the total
        is Θ of the top level&rsquo;s work, log factor included. When <M>a</M> is greater than <M>bᵈ</M> the bottom level still wins, and the
        total is <M>Θ(n to the power log<sub>b</sub> a)</M>. Here log<sub>b</sub> a, the logarithm of a in base b, is the power that b must be
        raised to to give a.
      </p>
      <p>
        Lesson 4 meets this case. The closest-pair method sorts the points near the dividing line by y. Sorting them again in every call
        gives <M>n log² n</M>; passing the points up already sorted, as merge sort does, brings the work outside the calls down to{" "}
        <M>O(n)</M> and the total to <M>n log n</M>.
      </p>

      <h2 id="unequal">Parts of different sizes</h2>
      <p>
        Lesson 6 has a recurrence with two different calls: <M>T(n) = T(n/5) + T(7n/10) + O(n)</M>. The master theorem needs equal parts.
        Draw the recursion tree and add up the levels. Step through the first two variants of the figure.
      </p>

      <LevelFigure />

      <p>The figure shows the general rule. Add up the fractions of n that the calls receive.</p>
      <ul>
        <li>
          <strong>They add up to less than 1</strong>, as with 1/5 + 7/10 = 9/10. Each level does 9/10 of the work of the level above, so the
          levels form a shrinking series (BIGO-6) and the top level wins: <M>T(n) = O(n)</M>. The constant is 1 / (1 − 9/10) = 10.
        </li>
        <li>
          <strong>They add up to exactly 1</strong>, as with 1/3 + 2/3. Every full level does n work, and the number of levels is a fixed
          multiple of log n: <M>T(n) = Θ(n log n)</M>. The same holds for any fixed split, such as 1/10 and 9/10. This is why quicksort is{" "}
          <M>O(n log n)</M> whenever every pivot leaves at least a fixed fraction on each side.
        </li>
        <li>
          <strong>They add up to more than 1</strong>, as with <M>T(n) = 2 T(n/2) + T(n/4) + n</M>: 1/2 + 1/2 + 1/4 = 5/4. The levels grow,
          and the leaves win.
        </li>
      </ul>
      <Note title="The Akra–Bazzi method">
        <p>
          A general theorem by Akra and Bazzi (1998) solves <M>T(n) = Σ aᵢ T(bᵢ n) + f(n)</M> for any number of calls of different sizes (Σ
          means &ldquo;add up over all i&rdquo;). Find the number p for which the sum of aᵢ × bᵢᵖ is exactly 1; the answer is then n to the power
          p, times a correction that depends on f. For T(n/5) + T(7n/10) + n, p is below 1, and the total is Θ(n). The level picture above is
          enough for every recurrence in this course.
        </p>
      </Note>

      <h2 id="examples">Worked examples</h2>
      <ul>
        <li>
          <strong>Skyline</strong> (practice problem 2): split the buildings in half, find the outline of each half, then merge the two outlines
          in one pass from left to right, much like merging two sorted lists. <M>T(n) = 2 T(n/2) + O(n)</M>, so <M>O(n log n)</M>.
        </li>
        <li>
          <strong>Strassen&rsquo;s matrix multiplication</strong>: multiplying two n × n matrices directly takes about n³ steps. Strassen (1969)
          splits each matrix into four blocks and needs 7 block products instead of 8, plus additions that cost <M>O(n²)</M>.{" "}
          <M>T(n) = 7 T(n/2) + n²</M>: 7 &gt; 2² = 4, so the leaves win, and the cost is n to the power log₂ 7, about n²·⁸¹. Lesson 5 uses the
          same idea on numbers.
        </li>
        <li>
          <strong>Quickselect with the worst pivots</strong>: each round drops only the pivot, so <M>T(n) = T(n − 1) + n</M>. The size shrinks
          by subtraction, not division, so unroll it: n + (n − 1) + … + 1 = n(n + 1)/2, which is <M>O(n²)</M>.
        </li>
        <li>
          <strong>Closest pair with a strip sorted in every call</strong>: <M>2 T(n/2) + n log n</M>, so <M>Θ(n log² n)</M>. Sorted once:{" "}
          <M>2 T(n/2) + n</M>, so <M>Θ(n log n)</M>.
        </li>
        <li>
          <strong>Median of medians</strong>: <M>T(n/5) + T(7n/10) + n</M>, so <M>O(n)</M>.
        </li>
      </ul>

      <h2 id="measure">Checking by measuring</h2>
      <p>
        A cost can be checked by counting. Add a counter for the main operation, run the method on inputs of size n and 2n, and compare.
        Doubling n doubles an <M>O(n)</M> count, multiplies an <M>O(n²)</M> count by 4, and an <M>O(n log n)</M> count by a little more than
        2. A count that grows as n to the power c multiplies by 2 to the power c.
      </p>
      <CodeBlock
        title="doubling.py"
        code={`import math

def count_calls(n, a, b):
    """How many calls a recursion makes: a calls, each on n // b."""
    if n <= 1:
        return 1
    return 1 + a * count_calls(n // b, a, b)

for n in (1024, 2048, 4096):
    c = count_calls(n, 3, 2)
    print(n, c, round(math.log2(c / count_calls(n // 2, 3, 2)), 3))
# 1024 88573 1.585 ... each doubling multiplies the count by 3:
# 2 to the power 1.585, as log2(3) = 1.585 predicts`}
      />
      <p>
        Count operations rather than seconds when you can. Timings jump about with other programs, caches and Python&rsquo;s memory
        manager, while a count is exact. The practice tests for problems 1 and 6 count comparisons for this reason.
      </p>
    </>
  );
}
