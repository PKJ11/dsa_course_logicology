import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { HeapFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Heap sort turns the list into a heap, a tree shape kept inside the list itself, where the largest value is always at the top. Then it
        takes the top off again and again. It is <M>O(n log n)</M> in every case and needs no extra list.
      </p>

      <h2 id="heap">A tree inside a list</h2>
      <p>
        Read a list as a tree: position 0 is the top (the <em>root</em>), and the <em>children</em> of position <M>i</M> are at <M>2i + 1</M> and{" "}
        <M>2i + 2</M>. Its <em>parent</em> is at <M>(i − 1) // 2</M>. No pointers are stored; the positions are worked out by arithmetic. This tree is
        always as full as possible, so its height is about <M>log₂ n</M>.
      </p>
      <Invariant label="Max-heap">Every parent is at least as big as each of its children.</Invariant>
      <p>
        It follows that the root holds the largest value. The HEAP station covers heaps in full; this lesson uses just enough for sorting.
      </p>

      <h2 id="sift">Sifting down</h2>
      <p>
        Suppose both subtrees below position <M>i</M> are already heaps, but <code>a[i]</code> may be too small. Swap it with its larger child, and
        repeat from there, until it is at least as big as its children or has none. This is <em>sifting down</em>. It moves down at most one level
        per swap, so it costs <M>O(log n)</M>.
      </p>
      <CodeBlock
        code={`def sift_down(a, i, size):
    while True:
        big = i
        for c in (2 * i + 1, 2 * i + 2):
            if c < size and a[c] > a[big]:
                big = c
        if big == i:
            return
        a[i], a[big] = a[big], a[i]
        i = big`}
      />

      <HeapFigure />

      <h2 id="sort">The sort</h2>
      <CodeBlock
        code={`def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):   # build the heap
        sift_down(a, i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]        # largest to the back
        sift_down(a, 0, end)               # fix the smaller heap`}
      />
      <p>
        <strong>Building.</strong> Positions from <M>n // 2</M> on have no children, so they are already tiny heaps. Sift down each other position,
        from the last parent back to the root. Each sift starts with heaps below it, as required. This takes <M>O(n)</M> in total, not{" "}
        <M>O(n log n)</M>, because most positions are near the bottom and sift only a short way. The HEAP station proves it.
      </p>
      <p>
        <strong>Sorting.</strong> Swap the root, the largest value, with the last value in the heap. That value is now in its final place. The heap
        is one shorter, and only the new root may be out of place, so one sift-down fixes it. <M>n − 1</M> rounds of <M>O(log n)</M>.
      </p>

      <h2 id="compare">Heap sort against the others</h2>
      <ul>
        <li>
          Like merge sort, it is <M>O(n log n)</M> in the worst case. Unlike merge sort, it needs only <M>O(1)</M> extra space.
        </li>
        <li>Like quick sort, it sorts in place. Unlike quick sort, it has no bad inputs.</li>
        <li>
          It is not stable, and it reads the list in a scattered order, which is slow on real memory. In practice quick sort is usually faster.
        </li>
      </ul>
      <Note title="Introsort">
        <p>
          C++&rsquo;s <code>std::sort</code> starts with quick sort, switches to heap sort if the recursion gets too deep (a sign of bad pivots), and
          uses insertion sort for short parts. Each method handles the case where the others are slow.
        </p>
      </Note>
      <p>
        Heaps return in <Link href="/dsa/sort/8/">lesson 8</Link> as another way to find the <M>k</M> smallest values.
      </p>
    </>
  );
}
