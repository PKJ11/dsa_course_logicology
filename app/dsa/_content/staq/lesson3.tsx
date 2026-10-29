import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { QueueFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A queue works like a line of people: you join at the back and leave from the front, so the first item in is the first out. In Python,
        use <code>collections.deque</code> for a queue, not a list.
      </p>

      <h2 id="queue">First in, first out</h2>
      <p>A queue has two main operations:</p>
      <ul>
        <li>
          <strong>enqueue</strong> (join): add an item at the back;
        </li>
        <li>
          <strong>dequeue</strong> (leave): take the item at the front.
        </li>
      </ul>
      <Invariant label="Rule">Items leave in the same order they joined: first in, first out (FIFO).</Invariant>
      <p>
        A stack gives back the newest item; a queue gives back the oldest. Use a queue when things must be handled in the order they arrived.
      </p>

      <h2 id="pop0">Why list.pop(0) is slow</h2>
      <p>
        A list can act as a queue: <code>append</code> to join and <code>pop(0)</code> to leave. It gives the right answers. But a list keeps its
        items from place 0 with no gaps, so after the front item leaves, every other item moves one place to the left. Step through it, then switch
        to the deque:
      </p>

      <QueueFigure />

      <p>
        With <M>n</M> items waiting, each <code>pop(0)</code> moves <M>n − 1</M> items: <M>O(n)</M>. A program that puts <M>n</M> items through
        the queue then does about <M>n² / 2</M> moves (n multiplied by n, then halved). For 100,000 items that is 5 billion moves.
      </p>

      <h2 id="deque">collections.deque</h2>
      <p>
        A <code>deque</code> (double-ended queue) adds and removes at both ends in <M>O(1)</M>. Inside, it is a two-way linked list of blocks of 64
        items (LINK-3), so taking from the front never moves other items.
      </p>
      <CodeBlock
        code={`from collections import deque

q = deque()
q.append('A')          # join at the back
q.append('B')
q.popleft()            # 'A': leave from the front
q[0]                   # look at the front without removing it
len(q), bool(q)        # size, and whether it has anything in it

d = deque(maxlen=3)    # keeps only the 3 newest items
for x in range(5):
    d.append(x)        # d is now deque([2, 3, 4])`}
      />
      <p>
        A deque also has <code>appendleft</code> and <code>pop</code>, so it works as a stack too. What it does badly is reach the middle:{" "}
        <code>q[k]</code> is <M>O(n)</M> for <M>k</M> far from both ends. Use a list when you read by position, and a deque when you work at the
        ends.
      </p>
      <Note title="queue.Queue is something else">
        <p>
          The <code>queue</code> module&rsquo;s <code>Queue</code> class is for passing items between threads that run at the same time. It adds
          locking, which makes it slower. For an ordinary queue in one program, use <code>deque</code>.
        </p>
      </Note>

      <h2 id="uses">Where queues appear</h2>
      <ul>
        <li>
          <strong>Breadth-first search</strong> (GRPH): visit the places one step away, then two steps away, and so on. A queue keeps them in that
          order.
        </li>
        <li>
          <strong>Jobs waiting for a worker:</strong> print jobs, requests to a web server.
        </li>
        <li>
          <strong>Recent events:</strong> keep events in time order; drop old ones from the front when they get too old. This is the idea behind
          STAQ-P3.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/staq/practice/3/">STAQ-P3, Recent pings</Link>.
      </p>
    </>
  );
}
