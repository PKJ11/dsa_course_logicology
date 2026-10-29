import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { InvFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        SORT-2 counted inversions while merge sort ran. This lesson looks at why that count is right, and then uses the same idea for three
        new questions: a count for every value, pairs with a different rule, and a distance between two rankings. The combine step does all the work, and it costs
        only O(n).
      </p>

      <h2 id="recap">Counting while merging, again</h2>
      <p>
        An <strong>inversion</strong> is a pair of positions <M>i &lt; j</M> with <M>a[i] &gt; a[j]</M>: a bigger value before a smaller one
        (SORT-1). A sorted list has none, and a reversed list of n values has all n(n − 1)/2 pairs. Checking every pair costs <M>O(n²)</M>.
      </p>
      <p>
        Split the list in half. Every inversion has both values in the left half, or both in the right half, or one in each. Recursion counts
        the first two kinds. For the third kind the order inside each half no longer matters, because every left value still comes before
        every right value. So each half may be sorted first, and then one merge counts the pairs. Step through &ldquo;Whole sort&rdquo;.
      </p>

      <InvFigure />

      <Invariant label="Each once">An inversion is counted at the one merge where its two values first fall into different halves.</Invariant>
      <p>
        Why exactly once: two positions are in the same part at the top and in different parts at the bottom. Going down the tree, there is
        exactly one call where they are split apart, and only that call&rsquo;s merge sees them as a left value and a right value. So no
        inversion is missed and none is counted twice. The cost is merge sort&rsquo;s: <M>T(n) = 2 T(n/2) + O(n)</M>, which is{" "}
        <M>O(n log n)</M>.
      </p>
      <p>
        Equal values are not inversions. On a tie, take the left value first; then a right value equal to a left one is never counted as
        smaller.
      </p>

      <h2 id="each">A count for every value</h2>
      <p>
        A harder question: for each position, how many smaller values come after it? For <code>[5, 2, 6, 1]</code> the answer is{" "}
        <code>[2, 1, 1, 0]</code>. The total of these counts is the number of inversions, but now each value needs its own count.
      </p>
      <p>
        Look at the merge from the left value&rsquo;s side, as &ldquo;One merge&rdquo; does. When a left value is placed, the right values placed
        before it are exactly the right values smaller than it, and they all came after it in the list. So add <code>j</code>, the number of
        right values taken so far, to that value&rsquo;s count. SORT-2 added the count at the other moment: when a right value is placed, it is
        smaller than every left value still waiting. Both moments give the same total, but only the first gives each value its own count.
      </p>
      <p>
        One more detail. Merge sort moves values around, so a count must stay with its value. Sort a list of positions instead of the values,
        comparing <code>a[p]</code> for positions p, and keep the counts in a list indexed by the original position. Practice problem 3 asks
        for this.
      </p>

      <h2 id="double">A different rule for pairs</h2>
      <p>
        Count the pairs <M>i &lt; j</M> with <M>a[i] &gt; 2 × a[j]</M>. The split still works: count inside each half, then the pairs that
        cross. But the merge can no longer count them as it goes, because the merge order follows <M>a[i] &gt; a[j]</M>, not{" "}
        <M>a[i] &gt; 2 × a[j]</M>. Count them in a separate pass first, while both halves are sorted:
      </p>
      <CodeBlock
        title="double_pairs.py"
        code={`def cross_pairs(left, right):
    """Pairs (x in left, y in right) with x > 2 * y; both lists sorted."""
    count = 0
    j = 0
    for x in left:                     # x only grows, so j only moves right
        while j < len(right) and x > 2 * right[j]:
            j += 1
        count += j                     # right[0..j-1] all fit with x
    return count`}
      />
      <p>
        <code>j</code> never moves back, so the pass costs <M>O(n)</M>, and the whole method stays at <M>O(n log n)</M>. This is the general
        shape: when the counting rule and the sorting rule differ, count with a two-pointer walk over the sorted halves, then merge.
      </p>

      <h2 id="rank">Comparing two rankings</h2>
      <p>
        Two judges rank the same 5 trains by punctuality. How different are their rankings? Count the pairs of trains that the judges put in
        opposite orders. This number is the <strong>Kendall tau distance</strong>. It is 0 when the rankings agree and n(n − 1)/2 when one is the
        reverse of the other.
      </p>
      <p>
        To compute it, rename the trains by their place in the first judge&rsquo;s list (the first train becomes 0, the second 1, and so on),
        write the second judge&rsquo;s list with the new names, and count its inversions. A pair in opposite orders is exactly an inversion of
        that list. Search engines and recommender systems compare rankings this way, and the same count measures how far a list is from
        sorted: insertion sort makes exactly one move per inversion (SORT-1).
      </p>

      <h2 id="fenwick">Another way: a Fenwick tree</h2>
      <p>
        RNGQ-3 counted inversions with a Fenwick tree. Read the list from right to left, and keep a count of how many times each value has
        been seen so far. For each value, the number of smaller values already seen is a prefix sum over the counts: exactly the smaller values
        to its right. Then record the value. Each step is <M>O(log n)</M>.
      </p>
      <p>
        Values can be large or negative, so first replace each value by its rank among the distinct values (0 for the smallest, 1 for the
        next, and so on). This step is called <strong>coordinate compression</strong> and costs one sort. Both methods are{" "}
        <M>O(n log n)</M>. The merge method needs no compression and works with any values that can be compared; the Fenwick method also
        answers questions while values keep arriving.
      </p>
      <Note title="Sorted lists and insert">
        <p>
          A third idea keeps the values seen so far in a sorted list, finds each new value&rsquo;s place with <code>bisect</code> (BSRC), and
          inserts it. Finding the place is <M>O(log n)</M>, but <code>list.insert</code> shifts every later value along, which is{" "}
          <M>O(n)</M>. The shifting is fast C code, so this looks quick on random data, but on a list that is already in order every insert
          lands at the front, and n inserts cost <M>O(n²)</M>.
        </p>
      </Note>
    </>
  );
}
