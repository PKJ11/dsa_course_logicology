import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { QueueFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Python&rsquo;s <code>heapq</code> module is the heap from lessons 1 to 3, written in C, working on an ordinary list. This lesson shows
        how to use it as a <strong>priority queue</strong>: a queue where the most urgent item leaves first, whatever order the items arrived
        in.
      </p>

      <h2 id="heapq">The heapq module</h2>
      <p>
        <code>heapq</code> has no class. Its functions take a plain list and keep it in heap order, smallest at <code>a[0]</code>. Keep using
        the module&rsquo;s functions on that list; a plain <code>append</code> or <code>sort</code> breaks the heap.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">The main heapq functions</caption>
          <thead>
            <tr>
              <th>Call</th>
              <th>What it does</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>heapify(a)</code>
              </td>
              <td>turn the list into a heap, in place</td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>heappush(a, x)</code>
              </td>
              <td>add x</td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>heappop(a)</code>
              </td>
              <td>remove and return the smallest</td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>a[0]</code>
              </td>
              <td>look at the smallest</td>
              <td>
                <M>O(1)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>heapreplace(a, x)</code>
              </td>
              <td>pop, then push x (one sift)</td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>heappushpop(a, x)</code>
              </td>
              <td>push x, then pop (often no sift at all)</td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>nsmallest(k, xs)</code>, <code>nlargest(k, xs)</code>
              </td>
              <td>the k smallest or largest, in order</td>
              <td>
                <M>O(n log k)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>merge(*lists)</code>
              </td>
              <td>merge sorted inputs, lazily</td>
              <td>
                <M>O(n log k)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        code={`import heapq

a = [5, 3, 8, 1]
heapq.heapify(a)  # a is now [1, 3, 8, 5]
heapq.heappush(a, 2)
heapq.heappop(a)  # 1
heapq.heappop(a)  # 2`}
      />

      <h2 id="max">Max-heaps</h2>
      <p>
        <code>heapq</code> builds min-heaps. For numbers, the usual way to get a max-heap is to store each value negated: the smallest of the
        negated values is the largest of the real ones. Push <code>-x</code>, and negate again when you pop.
      </p>
      <CodeBlock
        code={`h = []
for x in [5, 3, 8]:
    heapq.heappush(h, -x)
-heapq.heappop(h)  # 8, the largest`}
      />
      <p>
        Python 3.14 (the version on the practice pages) also added max-heap functions: <code>heapify_max</code>, <code>heappush_max</code>,{" "}
        <code>heappop_max</code>, <code>heapreplace_max</code> and <code>heappushpop_max</code>. Older Pythons only have negation.
      </p>

      <h2 id="pq">Priority queues and ties</h2>
      <p>
        To queue tasks by priority, push tuples <code>(priority, task)</code>. Tuples compare item by item, so the smallest priority comes out
        first. Two problems appear when priorities tie:
      </p>
      <ul>
        <li>
          Python then compares the tasks themselves. If they are objects that cannot be compared (say, two dicts), you get a{" "}
          <code>TypeError</code>.
        </li>
        <li>
          Even if they can be compared, the result is not &ldquo;first come, first served&rdquo;. A heap is not <strong>stable</strong>: items
          with equal priority come out in no particular order.
        </li>
      </ul>
      <p>
        The fix for both is a counter that goes up by one with every push: store <code>(priority, count, task)</code>. Counts are all different,
        so the task is never compared, and among equal priorities the earliest arrival wins. Step through the figure.
      </p>

      <QueueFigure />

      <h2 id="remove">Changing and removing</h2>
      <p>
        A heap cannot find an item quickly, so it cannot remove one from the middle quickly either. The usual answer, given in the{" "}
        <code>heapq</code> documentation, is <strong>lazy removal</strong>: keep a dict from each task to its entry, and to remove a task, mark
        its entry as removed and leave it in the heap. When a marked entry later reaches the top, <code>pop</code> throws it away and tries
        again. To change a task&rsquo;s priority, remove it and push a new entry.
      </p>
      <CodeBlock
        code={`import heapq, itertools

heap, entry_of = [], {}
counter = itertools.count()
REMOVED = None

def add(task, priority):
    if task in entry_of:
        remove(task)
    e = [priority, next(counter), task]
    entry_of[task] = e
    heapq.heappush(heap, e)

def remove(task):
    e = entry_of.pop(task)
    e[-1] = REMOVED  # mark it; leave it in the heap

def pop():
    while heap:
        priority, count, task = heapq.heappop(heap)
        if task is not REMOVED:
            del entry_of[task]
            return task
    raise KeyError('pop from an empty priority queue')`}
      />
      <p>
        Entries are lists rather than tuples so that the mark can be written into them. Each removed entry is popped once, later, so every
        operation is still <M>O(log n)</M> on average; the heap can hold up to twice as many entries as there are live tasks before they are
        cleared out. Practice HEAP-P3 asks you to build this queue (with <code>heapq</code> switched off, so with your own heap).
      </p>

      <h2 id="other">Other tools</h2>
      <ul>
        <li>
          <code>queue.PriorityQueue</code> wraps <code>heapq</code> with a lock, for passing work between threads. In a single thread, use{" "}
          <code>heapq</code> directly: it is faster.
        </li>
        <li>
          For items that cannot be compared, the <code>dataclasses</code> module can make a class that compares only its priority field:{" "}
          <code>@dataclass(order=True)</code> with <code>item: Any = field(compare=False)</code>.
        </li>
      </ul>
      <Note title="Where priority queues appear">
        <p>
          Dijkstra&rsquo;s shortest paths and Prim&rsquo;s minimum spanning tree (Leg D) take the closest place next; event simulations take the
          earliest event; schedulers take the most urgent job; Huffman coding (GRDY) joins the two rarest symbols. All of them are a heap with
          tuples, often with lazy removal.
        </p>
      </Note>
    </>
  );
}
