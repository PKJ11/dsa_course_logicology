import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SubFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        You have met this method already: binary search keeps one half of a list, and merge sort sorts two halves and joins them. This lesson
        names the pattern, shows how to work out its cost from a tree of calls, and uses it on a new problem, where the hard part is the step
        that joins the two answers.
      </p>

      <h2 id="steps">Divide, conquer, combine</h2>
      <p>A divide and conquer method has three steps:</p>
      <ol>
        <li>
          <strong>Divide</strong> the problem into smaller problems of the same kind, usually two halves.
        </li>
        <li>
          <strong>Conquer</strong> each smaller problem by calling the same method on it (recursion, RECR-1). A problem small enough to solve
          directly is the <strong>base case</strong>.
        </li>
        <li>
          <strong>Combine</strong> the answers of the smaller problems into the answer of the whole problem.
        </li>
      </ol>
      <p>
        Merge sort (SORT-2) splits the list in half, sorts both halves, and merges them. Quicksort (SORT-3) does its work in the divide step,
        by partitioning, and has nothing left to combine. Binary search (BSRC) divides and then conquers only one of the halves. The pattern
        is the same each time; what changes is where the work is done.
      </p>
      <Invariant label="Pattern">Solve two halves the same way, then do one cheap pass to join their answers.</Invariant>

      <h2 id="stretch">The largest sum of a stretch</h2>
      <p>
        A <strong>stretch</strong> is a run of neighbouring values in a list, such as positions 3 to 6. Given a list of numbers, some of them
        negative, which stretch has the largest sum? Trying every stretch costs <M>O(n²)</M>: there are about n²/2 of them, and a running sum
        gives each one in a single step.
      </p>
      <p>
        Divide and conquer: split the list at the middle. The best stretch is in one of three places. It lies entirely in the left half, or
        entirely in the right half, or it <strong>crosses the middle</strong>, using the last position of the left half and the first
        position of the right half. The first two are the same problem on a smaller list, so recursion solves them. Only the third needs new
        work.
      </p>
      <p>
        A crossing stretch is a stretch that ends at the middle, joined to a stretch that starts just after it. The two parts do not affect
        each other, so take the best of each: walk left from the middle keeping a running sum and its largest value, then walk right in the
        same way. One pass over the part, so the combine step costs <M>O(n)</M>.
      </p>

      <SubFigure />

      <CodeBlock
        title="best_stretch.py"
        code={`def best_stretch(a, lo=0, hi=None):
    """Largest sum of a non-empty stretch of a[lo:hi]."""
    if hi is None:
        hi = len(a)
    if hi - lo == 1:                     # base case: one value
        return a[lo]
    mid = (lo + hi) // 2
    left = best_stretch(a, lo, mid)      # conquer each half
    right = best_stretch(a, mid, hi)
    # combine: the best stretch that ends at mid - 1 ...
    s, best_l = 0, float("-inf")
    for i in range(mid - 1, lo - 1, -1):
        s += a[i]
        best_l = max(best_l, s)
    # ... joined to the best stretch that starts at mid
    s, best_r = 0, float("-inf")
    for j in range(mid, hi):
        s += a[j]
        best_r = max(best_r, s)
    return max(left, right, best_l + best_r)`}
      />
      <p>
        The function passes <code>lo</code> and <code>hi</code> rather than slices, so no part of the list is copied. The recursion is only
        about log₂ n calls deep (log₂ n is the number of times n can be halved before it reaches 1), so Python&rsquo;s limit of 1,000 nested
        calls is never a problem here: a list of a million values needs about 20.
      </p>
      <Note title="A faster method exists">
        <p>
          Kadane&rsquo;s method solves this problem in <M>O(n)</M> with one pass: keep the best sum of a stretch that ends at the current
          position, which is either the current value alone or the current value added to the previous best. It is a small example of dynamic
          programming (DYNP). Divide and conquer is not always the fastest method; it is a way of thinking that often finds a good one.
        </p>
      </Note>

      <h2 id="cost">Cost from the recursion tree</h2>
      <p>
        Draw every call as a node, with its two smaller calls below it: this is the <strong>recursion tree</strong> (RECR-3, BIGO-5). For the
        best stretch, the top call does <M>O(n)</M> work outside its recursive calls (the two walks). Its two children each do work for{" "}
        <M>n/2</M> values, so together they also do <M>O(n)</M>. The same holds on every level. The parts halve until they have one value, so
        there are about log₂ n levels, and the total is <M>O(n log n)</M>.
      </p>
      <p>As a formula, write T(n) for the time on n values. Then</p>
      <p>
        <M>T(n) = 2 T(n/2) + O(n)</M>, with <M>T(1) = O(1)</M>.
      </p>
      <p>
        This is a <strong>recurrence</strong>: it gives the cost of a problem in terms of the cost of smaller ones. Merge sort has the same
        recurrence, so it has the same cost. Lesson 2 gives a rule that solves a whole family of recurrences at once.
      </p>

      <h2 id="pairs">Fewer comparisons: largest and smallest</h2>
      <p>
        Divide and conquer can also save a constant factor. Finding the largest value of n values takes <M>n − 1</M> comparisons, and so
        does the smallest. Doing both separately costs <M>2n − 2</M>. Can the two searches share work?
      </p>
      <p>
        Divide the list in half, find the largest and smallest of each half, then combine with 2 comparisons: the larger of the two largest,
        and the smaller of the two smallest. A part of 2 values needs only 1 comparison, because the larger one cannot be the smallest.
        When n is a power of two this gives T(2) = 1 and T(n) = 2 T(n/2) + 2, which adds up to <M>3n/2 − 2</M>.
      </p>
      <p>
        The same saving without recursion: take the values two at a time. Compare the two values of a pair with each other (1 comparison),
        then the larger with the largest so far and the smaller with the smallest so far (2 more). That is 3 comparisons for every 2 values.
        No method can do better: it is known that every method needs at least about 3n/2 comparisons. Practice problem 1 asks for this.
      </p>

      <h2 id="when">When it helps</h2>
      <ul>
        <li>
          <strong>The combine step must be cheap.</strong> If joining two halves cost <M>O(n²)</M>, the whole method would cost at least that.
          Most good divide and conquer methods combine in <M>O(n)</M> or less.
        </li>
        <li>
          <strong>The parts should be about the same size.</strong> Splitting off one value at a time gives n levels, not log₂ n. That is
          quicksort&rsquo;s worst case (SORT-3), and lesson 6 deals with it for selection.
        </li>
        <li>
          <strong>The smaller problems should not overlap.</strong> When the same smaller problem is solved again and again, as in the plain
          recursive Fibonacci (RECR-3), the right tool is to remember answers: dynamic programming (DYNP).
        </li>
        <li>
          <strong>Small parts are often solved directly.</strong> Below some size, a simple method is faster than more recursion. Python&rsquo;s
          own sort uses insertion sort on short runs, and lesson 5 switches to the schoolbook method on short numbers.
        </li>
      </ul>
    </>
  );
}
