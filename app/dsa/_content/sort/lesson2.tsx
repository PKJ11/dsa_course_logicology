import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { MergeFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Merge sort splits the list in half, sorts each half, and merges the two sorted halves into one. It takes <M>O(n log n)</M> time on every
        input, and it is stable.
      </p>

      <h2 id="merge">Merging two sorted lists</h2>
      <p>
        The key step is the merge. Given two sorted lists, the smallest value overall is at the front of one of them. Take it, and repeat.
      </p>

      <MergeFigure />

      <p>
        Keep an index <code>i</code> into <code>left</code> and <code>j</code> into <code>right</code>. While both lists have values left, one
        pass of the merge does this:
      </p>
      <CodeBlock
        code={`if left[i] <= right[j]:      # <= keeps it stable
    out.append(left[i]); i += 1
else:
    out.append(right[j]); j += 1`}
      />
      <p>
        When one list runs out, copy what is left of the other to the end of <code>out</code>. Each pass of the loop moves one value to <code>out</code>, so merging lists of total length <M>n</M> takes <M>O(n)</M> time. Using{" "}
        <code>&lt;=</code> rather than <code>&lt;</code> means that on a tie, the value from the left list goes first. That is what makes merge sort
        stable.
      </p>

      <h2 id="sort">The whole sort</h2>
      <p>
        A list of 0 or 1 values is already sorted: return a copy of it. A longer list is split at its middle index, each half is sorted by a
        recursive call, and the two sorted halves are merged. Writing it is <Link href="/dsa/sort/practice/2/">SORT-P2</Link>.
      </p>
      <p>
        Why it is correct, by strong induction on the length (<Link href="/dsa/corr/3/#strong">CORR-3</Link>): a list of 0 or 1 values is sorted.
        For a longer list, both halves are shorter, so the recursive calls return them sorted, and merging two sorted lists gives a sorted list
        of all the values.
      </p>

      <h2 id="cost">Why it is n log n</h2>
      <p>
        The cost is <M>T(n) = 2T(n/2) + n</M>. <Link href="/dsa/bigo/5/">BIGO-5</Link> solved this with a recursion tree: <M>log₂ n</M> levels,
        with <M>n</M> work of merging on each level, so <M>Θ(n log n)</M>: Θ means the cost grows exactly this fast, no faster and no slower. The split does not depend on the values, so this holds for every input:
        sorted, reversed or random.
      </p>
      <p>
        Merge sort needs more memory. The merge writes into a new list, so merge sort needs <M>O(n)</M> extra space. In-place merging exists, but it is
        complicated and slower in practice.
      </p>

      <h2 id="inversions">Counting inversions while merging</h2>
      <p>
        An <em>inversion</em> is a pair of positions <M>i &lt; j</M> with <M>a[i] &gt; a[j]</M> (lesson 1). Counting them pair by pair is{" "}
        <M>O(n²)</M>. Merge sort can count them while it merges, with no extra pass. When the merge takes <code>right[j]</code> while <code>left[i]</code> is still waiting,{" "}
        <code>right[j]</code> is smaller than <code>left[i]</code> and every value after it in <code>left</code>. Each of those pairs is an inversion,
        so add <code>len(left) - i</code> to the count.
      </p>
      <Note title="Where merge sort is the best choice">
        <p>
          Merge sort only reads its input from front to back. That makes it the usual choice for data too large for memory, read from disk in
          sorted runs, and for linked lists (LINK station), where splitting and merging need no extra space.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/sort/practice/2/">SORT-P2, Merge sort</Link> and{" "}
        <Link href="/dsa/sort/practice/3/">SORT-P3, How far out of order</Link>.
      </p>
    </>
  );
}
