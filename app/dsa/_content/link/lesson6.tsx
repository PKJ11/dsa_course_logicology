import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { MergeFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Two sorted linked lists can be merged into one sorted list without making a single new node. You only change <code>next</code>{" "}
        references. This is the main step of merge sort, and on a linked list it needs no extra arrays.
      </p>

      <h2 id="merge">Merging two sorted lists</h2>
      <p>
        You met merging in SORT-2, on Python lists. The idea is the same: the smallest value left is at the front of one of the two lists, so
        compare the two fronts and take the smaller one.
      </p>
      <p>
        On a linked list, &ldquo;take&rdquo; means &ldquo;link it onto the end of the result&rdquo;. Keep a name <code>tail</code> for the last node of
        the result, and start the result with a dummy node (lesson 2), so that the first node is not a special case:
      </p>

      <MergeFigure />

      <p>
        When one list runs out, the rest of the other list is already sorted and already linked. One assignment attaches all of it. Each pass of
        the loop does a fixed amount of work and moves one node, so merging lists of lengths <M>n</M> and <M>m</M> takes <M>O(n + m)</M> time and{" "}
        <M>O(1)</M> extra space.
      </p>

      <h2 id="stable">Ties and stability</h2>
      <p>
        The merge takes from <code>a</code> when <code>a.value &lt;= b.value</code>, using <code>&lt;=</code> and not <code>&lt;</code>. When two
        values are equal, the one from the first list goes first. So items with equal values keep their order. A sort that keeps equal items in
        their original order is called <em>stable</em> (SORT-7). With <code>&lt;</code> the merge would still sort, but it would not be stable.
      </p>

      <h2 id="sort">Merge sort on a linked list</h2>
      <p>Merge sort has three steps: split the list into two halves, sort each half, and merge them.</p>
      <ul>
        <li>
          <strong>Split:</strong> find the middle with <code>slow</code> and <code>fast</code> (lesson 5), then cut the list there by setting the
          middle node&rsquo;s <code>next</code> to <code>None</code>. Use the version where <code>slow</code> stops on the <em>first</em> middle
          node, or a list of two nodes never splits.
        </li>
        <li>
          <strong>Sort each half:</strong> call merge sort on each one. A list of zero or one nodes is already sorted.
        </li>
        <li>
          <strong>Merge:</strong> the merge above.
        </li>
      </ul>
      <p>The split is the step that is easy to get wrong:</p>
      <CodeBlock
        code={`slow, fast = head, head.next   # slow stops on the first middle node
while fast is not None and fast.next is not None:
    slow, fast = slow.next, fast.next.next
second = slow.next
slow.next = None               # cut the list in two`}
      />
      <p>
        Now <code>head</code> and <code>second</code> are two lists of about half the length. Sort each one with a recursive call, and merge the two
        results. LINK-P6 asks you to put the whole sort together.
      </p>
      <p>
        Each level of halving touches every node once, to split and to merge, and there are about <M>log₂ n</M> levels (the number of times you
        can halve <M>n</M>). So the time is <M>O(n log n)</M>, the same as merge sort on an array.
      </p>
      <p>
        The recursion is only about <M>log₂ n</M> calls deep: 17 for 100,000 nodes. That is well inside Python&rsquo;s limit. And there is no
        extra array for the merge, which on a Python list needs <M>O(n)</M> extra space.
      </p>
      <Note title="Why not quicksort here?">
        <p>
          Quicksort needs to reach items by position and swap them, which is slow on a linked list. Merge sort only walks forwards and relinks
          nodes, which a linked list does well.
        </p>
      </Note>

      <h2 id="when">When to use a linked list</h2>
      <ul>
        <li>
          <strong>Use one</strong> when you hold references to nodes and must insert or remove next to them in <M>O(1)</M>: caches that move an
          item to the front (HASH-7), lists that are split and joined often, or the lists inside other structures, such as the buckets of a hash
          table (HASH-2).
        </li>
        <li>
          <strong>Do not use one</strong> when you read by position, or just add and remove at the ends. A Python list or a deque is faster and
          smaller.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/link/practice/6/">LINK-P6, Sort the train</Link>.
      </p>
    </>
  );
}
