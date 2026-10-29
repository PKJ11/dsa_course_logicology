import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MomFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Quickselect (SORT-8) finds the k-th smallest value in O(n) time on average, but bad pivots make it O(n²). In 1973 Blum, Floyd, Pratt,
        Rivest and Tarjan found a way to choose a pivot that is always good enough. It makes selection O(n) in the worst case, and the proof is
        a short use of the recurrences from lesson 2.
      </p>

      <h2 id="select">Selection, again</h2>
      <p>
        <strong>Selection</strong> means: given n values and a number k, find the value that would be at position k if the list were sorted (k
        = 0 is the smallest). The median is the case k = n // 2. Sorting first costs <M>O(n log n)</M>. Quickselect does better:
      </p>
      <ol>
        <li>Choose a pivot value.</li>
        <li>
          Split the values into three groups: smaller than the pivot, equal to it, and larger (a three-way partition, SORT-8).
        </li>
        <li>
          If k falls among the smaller values, repeat on them. If it falls among the equal values, the pivot is the answer. Otherwise repeat on
          the larger values, with k reduced by the number of values dropped.
        </li>
      </ol>
      <p>
        Each round costs <M>O(m)</M> on m values. If every pivot dropped only one value, the rounds would cost n + (n − 1) + … + 1, which is{" "}
        <M>O(n²)</M>. Step through the &ldquo;First value&rdquo; variant of the figure: a sorted list with the first value as pivot does exactly
        that. A random pivot makes this very unlikely, but not impossible, and a fixed rule such as &ldquo;the first value&rdquo; or &ldquo;the
        middle value&rdquo; can always be beaten by a list built against it.
      </p>

      <h2 id="pivot">A pivot with a guarantee</h2>
      <p>The median of medians method chooses the pivot like this:</p>
      <ol>
        <li>Put the values in groups of 5 (the last group may be shorter).</li>
        <li>Find the median of each group, by sorting the group: at most 10 comparisons for 5 values.</li>
        <li>
          Find the median of those medians by calling <strong>select itself</strong> on them, with k = the middle position. There are about n/5
          medians.
        </li>
        <li>Use that value as the pivot for the round.</li>
      </ol>
      <p>Step through &ldquo;Median of medians&rdquo;.</p>

      <MomFigure />

      <h2 id="proof">Why it is linear</h2>
      <p>
        There are about n/5 groups. The pivot is the median of their medians, so in at least half of the groups the median is at most the
        pivot. In each of those groups, the median and the two values below it are at most the pivot: 3 values per group. That is at least 3 ×
        (n/10) = 3n/10 values that are at most the pivot. The same argument gives 3n/10 values that are at least the pivot.
      </p>
      <Invariant label="Guarantee">At least 3n/10 values are on each side of the pivot, so a round keeps at most 7n/10.</Invariant>
      <p>
        (Exactly: the last group may be short, and the pivot&rsquo;s own group counts once, so the bound is 3n/10 − 6; this changes nothing
        below.) Now add up the work of one call on n values:
      </p>
      <ul>
        <li>sorting the groups and taking their medians: <M>O(n)</M>;</li>
        <li>
          select on the n/5 medians: <M>T(n/5)</M>;
        </li>
        <li>the three-way partition: <M>O(n)</M>;</li>
        <li>
          select on the side that is kept, at most 7n/10 values: <M>T(7n/10)</M>.
        </li>
      </ul>
      <p>
        So <M>T(n) ≤ T(n/5) + T(7n/10) + O(n)</M>. This is the first variant of lesson 2&rsquo;s figure: the two parts add up to 9/10 of n, so each
        level of the recursion tree does at most 9/10 of the work of the level above, and the total is at most 10 times the top level. So{" "}
        <M>T(n) = O(n)</M>, in the worst case.
      </p>
      <p>
        Selection is therefore easier than sorting. Sorting by comparisons needs about n log₂ n comparisons in the worst case (SORT-5), while
        selection needs only <M>O(n)</M>.
      </p>

      <h2 id="five">Why groups of five</h2>
      <ul>
        <li>
          <strong>Groups of 3:</strong> half the groups give 2 values each, so only n/3 values are certain to be on one side. A round can keep
          2n/3, and <M>T(n) = T(n/3) + T(2n/3) + O(n)</M>. The parts add up to exactly 1, which gives <M>Θ(n log n)</M> (the second variant of
          lesson 2&rsquo;s figure). Not linear.
        </li>
        <li>
          <strong>Groups of 5:</strong> 1/5 + 7/10 = 9/10, less than 1. Linear.
        </li>
        <li>
          <strong>Groups of 7:</strong> half the groups give 4 values each, so 2n/7 are dropped and at most 5n/7 kept: 1/7 + 5/7 = 6/7. Also
          linear. Larger groups cost more to sort but give a smaller recursion.
        </li>
      </ul>
      <p>Five is the smallest odd group size for which the simple argument works. Odd sizes give each group a single middle value.</p>
      <CodeBlock
        title="group_median.py"
        code={`def median_of_group(g):
    """The middle value of a short list, by insertion sort (SORT-1)."""
    g = list(g)
    for i in range(1, len(g)):
        x = g[i]
        j = i - 1
        while j >= 0 and x < g[j]:     # at most 10 comparisons for 5 values
            g[j + 1] = g[j]
            j -= 1
        g[j + 1] = x
    return g[(len(g) - 1) // 2]`}
      />
      <p>
        Sorting 5 values by insertion takes at most 10 comparisons. A cleverer order finds the median of 5 with only 6, which lowers the
        constant but not the O(n).
      </p>

      <h2 id="practice">In practice</h2>
      <p>
        The guarantee costs extra comparisons. Counting them, a careful version makes about 8 per value on typical lists, while quickselect with
        random pivots makes about 3. So libraries use a mix:
      </p>
      <ul>
        <li>
          <strong>Introselect</strong> (Musser, 1997) runs quickselect with a cheap pivot and switches to median of medians only if the list
          is not shrinking fast enough. It is <M>O(n)</M> in the worst case and fast on typical lists. C++&rsquo;s{" "}
          <code>std::nth_element</code> and NumPy&rsquo;s <code>numpy.partition</code> are built on it.
        </li>
        <li>
          Python&rsquo;s standard library has no selection function. <code>statistics.median</code> sorts, and <code>heapq.nsmallest(k + 1, a)</code>{" "}
          is <M>O(n log k)</M> (HEAP-5). For one median of a list that fits in memory, <code>sorted(a)[k]</code> runs in C and is usually fast
          enough.
        </li>
        <li>
          The <strong>Floyd–Rivest</strong> method (1975) picks its pivots from a small random sample and needs only about n + min(k, n − k)
          comparisons on average, close to the least possible.
        </li>
      </ul>
      <Note title="Counting the comparisons">
        <p>
          A timer cannot show that a Python method is linear: sorting runs in fast C code, so on lists that fit in memory it can beat a linear
          method written in Python. Counting comparisons can. Practice problem 6 counts them: a linear method makes about the same number per
          value on a short list and on a long one, while sorting makes more per value as the list grows (about log₂ n of them).
        </p>
      </Note>
    </>
  );
}
