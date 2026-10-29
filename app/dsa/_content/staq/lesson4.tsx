import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RingFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A circular buffer is a queue kept in a list of fixed size. When it reaches the end of the list, it carries on from the start. Nothing
        ever moves, and the memory never grows.
      </p>

      <h2 id="fixed">A queue in a fixed list</h2>
      <p>
        Lesson 3 showed that a list is a slow queue because items move when the front one leaves. A different plan: let the items stay where they
        are, and move a marker instead. Keep two numbers:
      </p>
      <ul>
        <li>
          <code>head</code>: the place of the front item;
        </li>
        <li>
          <code>count</code>: how many items are in the queue.
        </li>
      </ul>
      <p>
        To leave, read the item at <code>head</code> and move <code>head</code> one place on. To join, write the item just after the last one. But
        the markers only ever move forwards, so they soon reach the end of the list, even if the start of the list is empty again.
      </p>

      <h2 id="wrap">Wrapping round with %</h2>
      <p>
        The answer is to treat the list as a circle: after the last place comes place 0 again. The <code>%</code> operator (remainder after
        division) does this. With a list of size <code>cap</code>, the place after <code>k</code> is <code>(k + 1) % cap</code>. For{" "}
        <code>k = cap - 1</code> this is 0.
      </p>
      <Invariant>
        The items, front to back, are at places head, head + 1, …, head + count − 1, each taken % cap.
      </Invariant>
      <p>
        So the next free place is <code>(head + count) % cap</code>. Step through a buffer of 6 slots. Watch the pushes wrap round to the start:
      </p>

      <RingFigure />

      <p>Here is <code>push</code>. The buffer keeps a list <code>slots</code> of size <code>cap</code>, and the two numbers:</p>
      <CodeBlock
        code={`def push(self, x):
    if self.count == len(self.slots):
        return False                  # full
    free = (self.head + self.count) % len(self.slots)
    self.slots[free] = x
    self.count += 1
    return True`}
      />
      <p>
        <code>pop</code> works the other way round. If <code>count</code> is 0, return <code>None</code>. Otherwise read the item at{" "}
        <code>head</code>, set that slot to <code>None</code>, move <code>head</code> one place on with <code>%</code>, and take 1 from{" "}
        <code>count</code>. Setting the slot to <code>None</code> is not needed for correctness, but it lets Python free a large item as soon as
        it leaves. STAQ-P4 asks you to write the whole class.
      </p>
      <p>Every operation is a few sums and one list access: <M>O(1)</M>, with no exceptions and no growing.</p>

      <h2 id="full">Full or empty?</h2>
      <p>
        When the buffer is full, the next free place <code>(head + count) % cap</code> is <code>head</code> itself. When it is empty, it is also{" "}
        <code>head</code>. So the two places alone cannot tell full from empty. Keeping <code>count</code> solves this.
      </p>
      <Note title="Another common design">
        <p>
          Some buffers keep <code>head</code> and <code>tail</code> (the next free place) instead of a count, and leave one slot always empty.
          Then <code>head == tail</code> means empty and <code>(tail + 1) % cap == head</code> means full. It wastes one slot but needs no count.
          Both designs are fine; pick one and keep to it.
        </p>
      </Note>
      <p>What should happen on a push when the buffer is full? There are two usual choices:</p>
      <ul>
        <li>
          <strong>Refuse it</strong>, as above: the caller must wait. Used where no item may be lost.
        </li>
        <li>
          <strong>Overwrite the oldest item:</strong> write at <code>head</code>, then move <code>head</code> on. Used for &ldquo;the last
          1,000 readings&rdquo;. This is what <code>deque(maxlen=n)</code> does.
        </li>
      </ul>

      <h2 id="uses">Where they are used</h2>
      <p>
        Circular buffers are used wherever data flows at a steady rate and memory must stay fixed: sound and video playback, keyboard input,
        network cards, and logs that keep only recent lines. They need no memory after they are created, which matters in small devices.
      </p>
      <p>
        Now try <Link href="/dsa/staq/practice/4/">STAQ-P4, A ring of platforms</Link>.
      </p>
    </>
  );
}
