import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { InvariantFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Binary search is easy to describe, but it is easy to get wrong in code. Being extra careful with the <code>+ 1</code> and{" "}
        <code>- 1</code> is not enough. The reliable way is to write down one statement that stays true for the whole loop, and then prove
        that it does.
      </p>

      <h2 id="claim">The statement we keep true</h2>
      <p>A statement that stays true every time a loop runs is called a <em>loop invariant</em>. For binary search, it is this:</p>
      <Invariant>
        If <code>t</code> is anywhere in <code>a</code>, then it is in <code>a[lo..hi]</code>.
      </Invariant>
      <p>
        Read it carefully. It does not say that <code>t</code> is in the window, because <code>t</code> may not be in the list at all. It says that
        the window never loses <code>t</code>. Every position outside <code>a[lo..hi]</code> has been <em>proved</em> not to hold <code>t</code>. That
        is what the shaded cells in the figures mean. They do not mean &ldquo;we have not looked there&rdquo;. They mean &ldquo;we know{" "}
        <code>t</code> is not there&rdquo;.
      </p>

      <h2 id="proof">Proving the loop is correct</h2>
      <p>
        We prove a loop invariant in three parts. (The <Link href="/dsa/#CORR">Correctness</Link> station covers this method in general.)
      </p>
      <CodeBlock
        title="search.py"
        code={`def search(a, t):
    lo, hi = 0, len(a) - 1          # start: the window is all of a
    while lo <= hi:
        mid = (lo + hi) // 2        # lo <= mid <= hi
        if a[mid] == t:
            return mid
        elif a[mid] < t:
            lo = mid + 1            # a[lo..mid] are all < t
        else:
            hi = mid - 1            # a[mid..hi] are all > t
    return -1                       # empty window: t is not in a`}
      />
      <ol>
        <li>
          <strong>It is true at the start.</strong> With <code>lo = 0</code> and <code>hi = n - 1</code>, the window is the whole list. If <code>t</code>{" "}
          is in <code>a</code>, it is in the window.
        </li>
        <li>
          <strong>Each pass keeps it true.</strong> Suppose it is true at the start of a pass, and <code>a[mid] &lt; t</code>. The list is sorted, so
          every value from <code>a[lo]</code> to <code>a[mid]</code> is at most <code>a[mid]</code>, which is less than <code>t</code>. None of them can be{" "}
          <code>t</code>. So if <code>t</code> was in <code>a[lo..hi]</code>, it is in <code>a[mid+1..hi]</code>. Setting <code>lo = mid + 1</code> keeps the
          statement true. The case <code>a[mid] &gt; t</code> works the same way on the other side.
        </li>
        <li>
          <strong>It gives the right answer at the end.</strong> The loop ends in one of two ways. Either it returns <code>mid</code> with{" "}
          <code>a[mid] == t</code>, which is clearly right. Or the window is empty, because <code>lo &gt; hi</code>. An empty window holds nothing,
          so by the invariant <code>t</code> is not in <code>a</code>, and <code>-1</code> is the right answer.
        </li>
      </ol>
      <p>
        The proof used three facts: <code>a</code> is sorted, <code>mid</code> is inside the window, and each branch removes only positions that cannot
        hold <code>t</code>. If you change any line of the code, you can check which part of the proof still holds.
      </p>

      <h2 id="termination">Why the loop stops</h2>
      <p>
        A correct invariant is not enough on its own. A loop that never ends never gives a wrong answer, but it is still broken. We also need
        to show that the loop stops. To do that, find a whole number that gets smaller on every pass and can never go below zero.
      </p>
      <p>
        Here, that number is the size of the window, <M>hi − lo + 1</M>. Since <M>lo ≤ mid ≤ hi</M>, both updates remove <code>mid</code> from
        the window. So the window gets at least one smaller on every pass. A whole number that keeps getting smaller, and cannot go below zero,
        must stop. So the loop ends.
      </p>
      <Note title="Correct, but it never ends" warn>
        <p>
          If you write <code>hi = mid</code> instead of <code>hi = mid - 1</code>, the invariant is still true: you just kept a position you did not
          need. But when <code>lo == hi</code> and <code>a[mid] &gt; t</code>, the update changes nothing, and the loop runs forever. A correct loop
          needs both proofs: the invariant, and a number that keeps getting smaller.
        </p>
      </Note>

      <h2 id="broken">Breaking it on purpose</h2>
      <p>Here is a bug that looks harmless. Someone shortens the code to two branches and removes the equality check:</p>
      <CodeBlock
        title="search_buggy.py"
        code={`while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] < t:
        lo = mid + 1
    else:
        hi = mid - 1        # also runs when a[mid] == t
return -1`}
        mark={[6]}
      />
      <p>
        Where does the proof fail? In part 2, when <code>a[mid] == t</code>. The else branch removes <code>mid</code>, which is the one position
        that holds <code>t</code>. Switch the figure below to the buggy version, and step until the window loses the target. The invariant
        check turns red at that exact step, long before the wrong answer appears.
      </p>

      <InvariantFigure />

      <p>
        This is a good habit to build. When a binary search gives a wrong answer, do not change the indices at random until the tests pass.
        Write down the invariant, and find the line where it stops being true.
      </p>
    </>
  );
}
