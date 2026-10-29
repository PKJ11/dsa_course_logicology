import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SiftFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Every heap operation follows the same plan: first keep the shape complete by working at the end of the list, then repair the order by
        moving one value up or down a single path. These two repairs are called sift up and sift down.
      </p>

      <h2 id="push">Push: sift up</h2>
      <p>
        To add a value, append it to the list. That puts it in the next free place on the bottom level, so the tree stays complete. Now only one
        pair can break the rule: the new value and its parent. If the new value is smaller, swap the two, and check again one level up. Stop when
        the parent is not bigger, or at the root.
      </p>
      <p>Step through the first variant: pushing 2 into a heap of 7 values.</p>

      <SiftFigure />

      <Invariant label="Invariant">During a sift, the heap rule holds everywhere except between the moving value and the node next to it on its path.</Invariant>
      <p>
        Why is a swap safe for the rest of the tree? When the moving value <M>x</M> swaps with its parent <M>p</M>, <M>p</M> moves down into{" "}
        <M>x</M>&rsquo;s old place. Every value below that place was already below <M>p</M> before the push, and the rule says a value is at
        most everything below it. So <M>p</M> fits in its new place, and the only pair left to check is <M>x</M> and its new parent.
      </p>

      <h2 id="pop">Pop: sift down</h2>
      <p>
        To take out the smallest value, read it from the root. That leaves a hole at the top. Fill it with the last value of the list (and remove
        that last place), so the tree stays complete. That value is probably too big for the root, so sift it down: compare it with its two
        children, and if the smaller child is smaller than it, swap with that child and repeat one level down. Stop when neither child is
        smaller, or at a leaf. Step through the second variant.
      </p>
      <p>
        It must be the <em>smaller</em> child. After the swap, that child becomes the parent of the other child, so it has to be the smaller of
        the two.
      </p>

      <h2 id="code">The code</h2>
      <CodeBlock
        code={`def sift_up(a, i):
    while i > 0:
        p = (i - 1) // 2
        if a[i] < a[p]:
            a[i], a[p] = a[p], a[i]
            i = p
        else:
            return

def sift_down(a, i, n):  # the heap is a[0:n]
    while True:
        c = 2 * i + 1  # left child
        if c >= n:
            return  # a leaf
        if c + 1 < n and a[c + 1] < a[c]:
            c += 1  # the right child is smaller
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return

def push(a, x):
    a.append(x)
    sift_up(a, len(a) - 1)

def pop(a):  # a must not be empty
    last = a.pop()
    if not a:
        return last
    top = a[0]
    a[0] = last
    sift_down(a, 0, len(a))
    return top`}
      />
      <p>
        <code>a[i], a[p] = a[p], a[i]</code> swaps two items in one line: Python builds the pair on the right first, then assigns it. Practice
        HEAP-P1 asks you to wrap these in a class.
      </p>

      <h2 id="cost">Cost, and two shortcuts</h2>
      <p>
        A sift moves along one path, and the tree has <M>log₂ n</M> levels (rounded down). Sift up makes one comparison per level and sift down
        at most two. So push and pop cost <M>O(log n)</M> in the worst case, and looking at the smallest value is <M>O(1)</M>.
      </p>
      <p>
        On random input, push is even cheaper on average: half of all nodes are leaves and a quarter are one level above them, so a new value
        usually stops after a level or two. The average is a constant number of comparisons.
      </p>
      <p>Two combined operations save work, and Python has both:</p>
      <ul>
        <li>
          <strong>Replace</strong> (pop, then push): put the new value straight into the root and sift it down. One sift instead of two.{" "}
          <code>heapq.heapreplace(a, x)</code>.
        </li>
        <li>
          <strong>Push-pop</strong> (push, then pop): if the new value is not bigger than the root, it would come straight back out, so return it
          and leave the heap alone. Otherwise do a replace. <code>heapq.heappushpop(a, x)</code>.
        </li>
      </ul>
      <Note title="A faster sift down">
        <p>
          Python&rsquo;s own <code>heapq</code> sifts down differently: it moves the hole all the way to a leaf, always toward the smaller child
          (one comparison per level), then puts the value in and sifts it up a little. The value from the end is usually big, so it belongs near
          the bottom anyway, and this saves about half the comparisons. Floyd suggested this method in 1964.
        </p>
      </Note>
    </>
  );
}
