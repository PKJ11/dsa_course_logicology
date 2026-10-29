import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { MemoryFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        An array is a row of equal-sized slots, side by side in memory. That one fact explains why reading any position is instant, why
        inserting at the front is slow, and why appending is usually fast.
      </p>

      <h2 id="slots">Slots side by side</h2>
      <p>
        Computer memory is a long row of numbered bytes. The number of a byte is its <em>address</em>. An array takes one unbroken stretch of that
        row and splits it into slots of the same size. If the array starts at address <M>s</M> and each slot is <M>w</M> bytes, then slot{" "}
        <M>i</M> starts at:
      </p>
      <p style={{ textAlign: "center" }}>
        <M>address of a[i] = s + i × w</M>
      </p>
      <p>
        One multiplication and one addition find any slot. The computer does not walk past the slots before it. That is why <code>a[i]</code>{" "}
        is <M>O(1)</M> for every <M>i</M>. It is also why indexes start at 0: index 0 is the start itself.
      </p>

      <MemoryFigure />

      <h2 id="python">What a Python list holds</h2>
      <p>
        A Python list can hold values of different types and sizes: <code>[3, &quot;BCT&quot;, [1, 2]]</code>. Its slots cannot all be the size of the
        largest value. So each slot holds a <em>reference</em>: the address of the value, which is stored somewhere else. All references are the
        same size, so the address formula still works.
      </p>
      <p>Two things follow:</p>
      <ul>
        <li>Reading <code>a[i]</code> takes two hops: one to the slot, and one to the value. It is still <M>O(1)</M>.</li>
        <li>
          Copying a list copies the references, not the values. <code>b = a[:]</code> makes a new list whose slots point at the same objects. This
          is called a <em>shallow copy</em>.
        </li>
      </ul>
      <Note title="When you need packed numbers">
        <p>
          Python&rsquo;s <code>array</code> module and the NumPy library store the numbers themselves in the slots. They use far less memory and can
          be much faster for numeric work. The algorithms in this course work the same way on both.
        </p>
      </Note>

      <h2 id="insert">Inserting and deleting in the middle</h2>
      <p>
        The slots must stay side by side, with no gaps. To insert at index <M>i</M>, every value from <M>i</M> to the end moves one slot to the
        right first. To delete at index <M>i</M>, every later value moves one slot to the left. Step through the second version of the figure.
      </p>
      <p>
        So <code>a.insert(i, x)</code>, <code>a.pop(i)</code> and <code>del a[i]</code> cost <M>O(n − i)</M>. At the end of the list they are{" "}
        <M>O(1)</M>; at the front they are <M>O(n)</M>.
      </p>
      <CodeBlock
        code={`a.append(x)       # O(1) amortised
a.pop()           # O(1)
a.insert(0, x)    # O(n): everything moves right
a.pop(0)          # O(n): everything moves left`}
      />
      <p>
        If you need to add or remove at both ends, use <code>collections.deque</code> (<Link href="/dsa/bigo/8/">BIGO-8</Link>). If you need to
        insert in the middle often, an array is the wrong structure, and the LINK and BALT stations offer others.
      </p>

      <h2 id="dynamic">Dynamic arrays</h2>
      <p>
        A plain array has a fixed size. A Python list is a <em>dynamic array</em>: it keeps some spare slots at the end, and when they run out it
        moves to a bigger block. <Link href="/dsa/bigo/7/">BIGO-7</Link> proves that if the block grows by a fixed factor, appending costs{" "}
        <M>O(1)</M> on average.
      </p>
      <p>
        You can see the spare room with <code>sys.getsizeof(a)</code>, which grows in jumps rather than by one slot at a time. If you know the
        final size in advance, <code>[0] * n</code> makes the whole list in one step.
      </p>
      <Note title="A mistake with 2-D lists" warn>
        <p>
          <code>[[0] * 3] * 4</code> makes a list of four references to the <strong>same</strong> inner list. Changing one row changes all four. Use{" "}
          <code>[[0] * 3 for _ in range(4)]</code>, which makes four separate rows. Lesson 5 uses grids like this.
        </p>
      </Note>
    </>
  );
}
