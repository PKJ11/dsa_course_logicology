import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

function NoHeapq({ first = false }: { first?: boolean }) {
  return (
    <p>
      The <code>heapq</code> module is switched off for this problem: write the heap yourself. A heap is a plain list with sift up and sift down
      (lessons 1 and 2){first ? "." : "; you can copy your class from HEAP-P1."}
    </p>
  );
}

function Counted() {
  return (
    <p>
      One test passes in numbers that count how often they are compared with <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> or{" "}
      <code>&gt;=</code>. They behave like ordinary numbers otherwise. This is how the tests tell an <M>O(log n)</M> heap step from an{" "}
      <M>O(n)</M> scan, which a timer cannot always do.
    </p>
  );
}

export const HEAP_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "A min-heap",
    fn: "MinHeap",
    lessons: [1, 2],
    blocked: ["heapq"],
    starter: `class MinHeap:
    def __init__(self):
        self.a = []

    def __len__(self):
        # how many values are in the heap
        pass

    def peek(self):
        # the smallest value, without removing it
        pass

    def push(self, x):
        pass

    def pop(self):
        # remove and return the smallest value
        pass
`,
    statement: (
      <>
        <p>
          Write a min-heap class stored in a Python list (lessons 1 and 2). <code>push(x)</code> adds a value, <code>pop()</code> removes and
          returns the smallest value, <code>peek()</code> returns the smallest value without removing it, and <code>len(h)</code> gives the number
          of values.
        </p>
        <CodeBlock
          code={`h = MinHeap()
h.push(5); h.push(3); h.push(8)
h.peek()     # 3
h.pop()      # 3
h.pop()      # 5
len(h)       # 1`}
        />
        <p>Values can repeat. The tests never call <code>pop</code> or <code>peek</code> on an empty heap.</p>
        <NoHeapq first />
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 30,000 values. <code>push</code> and <code>pop</code> should take <M>O(log n)</M> time and comparisons.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Adding at the end of the list and removing from the end are both <M>O(1)</M> and keep the tree complete. Which value must you then move, and in which direction?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>push</code>: append the value, then sift it up. While it is smaller than its parent at <code>(i - 1) // 2</code>, swap the two
              and move up.
            </p>
            <p>
              <code>pop</code>: remember <code>a[0]</code>, take the last value off the list with <code>a.pop()</code>, and put it at position 0
              (unless the list is now empty). Then sift it down: find the smaller of its children at <code>2i + 1</code> and <code>2i + 2</code>; if
              that child is smaller than it, swap and carry on from there.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`push(x): a.append(x); i = len(a) - 1
    while i > 0 and a[i] < a[(i - 1) // 2]:
        swap a[i] and its parent; i = (i - 1) // 2

pop(): last = a.pop()
    if a is empty: return last
    top = a[0]; a[0] = last; i = 0
    loop: c = the smaller child of i (stop if none)
          if a[c] < a[i]: swap; i = c
          else: stop
    return top`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Build a heap in O(n)",
    fn: "heapify",
    lessons: [3],
    blocked: ["heapq"],
    starter: `def heapify(a):
    # Rearrange the list a, in place, into a min-heap.
    # Return nothing.
    pass
`,
    statement: (
      <>
        <p>
          Rearrange a list, in place, so that it becomes a min-heap: every <code>a[i]</code> is at least its parent{" "}
          <code>a[(i - 1) // 2]</code>. Change the list you are given and return nothing, as <code>heapq.heapify</code> does.
        </p>
        <CodeBlock
          code={`a = [5, 3, 8, 1, 9, 2]
heapify(a)
# a is now a min-heap, for example [1, 3, 2, 5, 9, 8]`}
        />
        <p>Any arrangement that obeys the heap rule passes. The tests check the rule, not one exact list.</p>
        <NoHeapq />
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values. Use at most <M>3n</M> comparisons: pushing the values one at a time is not fast enough.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The second half of the list is all leaves, and a single value is already a heap. Which positions need work, and in which order?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write <code>sift_down(a, i, n)</code> as in HEAP-P1&rsquo;s <code>pop</code>. Then call it for every position from{" "}
              <code>len(a) // 2 - 1</code> down to 0.
            </p>
            <p>
              Going backwards matters: when you sift down position i, both of its children must already be the tops of heaps. Lesson 3 shows why
              the total work is less than 2n comparisons.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for i from len(a) // 2 - 1 down to 0:
    sift_down(a, i, len(a))`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "A task queue",
    fn: "TaskQueue",
    lessons: [4],
    blocked: ["heapq"],
    starter: `class TaskQueue:
    def __init__(self):
        pass

    def add(self, task, priority):
        # add a task, or change the priority of a waiting task
        pass

    def remove(self, task):
        # True if the task was waiting, False if not
        pass

    def pop(self):
        # the waiting task with the smallest priority, or None
        pass

    def __len__(self):
        # how many tasks are waiting
        pass
`,
    statement: (
      <>
        <p>Build a priority queue of named tasks (lesson 4). A smaller priority number means more urgent.</p>
        <ul>
          <li>
            <code>add(task, priority)</code>: add a task. If the task is already waiting, change its priority instead; this counts as a new
            arrival.
          </li>
          <li>
            <code>remove(task)</code>: take a waiting task out. Return <code>True</code>, or <code>False</code> if it was not waiting.
          </li>
          <li>
            <code>pop()</code>: remove and return the waiting task with the smallest priority. If several tasks share that priority, return the
            one that arrived first. Return <code>None</code> if nothing is waiting.
          </li>
          <li>
            <code>len(q)</code>: the number of waiting tasks.
          </li>
        </ul>
        <CodeBlock
          code={`q = TaskQueue()
q.add('write', 3); q.add('fix', 1); q.add('test', 3)
q.pop()            # 'fix'
q.remove('write')  # True
q.pop()            # 'test'
q.pop()            # None`}
        />
        <p>Task names are strings; priorities are integers.</p>
        <NoHeapq />
        <h2>Limits</h2>
        <ul>
          <li>Up to 30,000 tasks and about 70,000 operations; each should take <M>O(log n)</M> time.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Ties need an order, and removal from the middle of a heap is slow. What if a heap entry carried an arrival number, and a removed entry simply stayed in the heap, marked as dead?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store entries as lists <code>[priority, count, task]</code> in a heap, where <code>count</code> goes up by one on every add. Lists
              compare item by item, so ties are broken by arrival. Keep a dict from task to its live entry.
            </p>
            <p>
              To remove a task, look up its entry and set the task part to <code>None</code>. To change a priority, remove and add again. In{" "}
              <code>pop</code>, keep popping the heap until you reach an entry whose task is not <code>None</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`add(task, p): if task in entry: entry.pop(task)[2] = None
    e = [p, count, task]; count += 1
    entry[task] = e; heap push e

remove(task): if task not in entry: return False
    entry.pop(task)[2] = None; return True

pop(): while heap: e = heap pop
           if e[2] is not None: del entry[e[2]]; return e[2]
       return None
len: len(entry)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The k largest",
    fn: "top_k",
    lessons: [5],
    blocked: ["heapq"],
    starter: `def top_k(nums, k):
    # Return the k largest values of nums, largest first.
    pass
`,
    statement: (
      <>
        <p>
          Return the <code>k</code> largest values of <code>nums</code>, largest first. Repeated values count separately. <code>k</code> is between
          0 and <code>len(nums)</code>.
        </p>
        <CodeBlock
          code={`top_k([5, 1, 9, 3, 7, 2, 8, 6], 3)   ->  [9, 8, 7]
top_k([5, 5, 1, 5, 2], 2)            ->  [5, 5]`}
        />
        <NoHeapq />
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values. With 20,000 values and k = 10, use at most <M>3n</M> comparisons. Sorting all the values uses too many, and so
            does calling <code>max()</code> k times.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>To decide whether a new value belongs among the k largest so far, you only need to compare it with one of them. Which one, and how do you find it quickly?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep the k largest so far in a <em>min</em>-heap of size k. Its root is the smallest of them. For each later value: if it is bigger
              than the root, it replaces the root, which then sifts down. Otherwise skip it, after one comparison.
            </p>
            <p>At the end, pop the heap k times (smallest first) and reverse the result.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if k == 0: return []
h = nums[:k]; heapify h
for x in nums[k:]:
    if x > h[0]: h[0] = x; sift_down(h, 0)
out = pop h until empty (smallest first)
return reversed out`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Merge k sorted lists",
    fn: "merge_k",
    lessons: [5],
    blocked: ["heapq"],
    starter: `def merge_k(lists):
    # Each list is sorted. Return one sorted list
    # holding every value of every list.
    pass
`,
    statement: (
      <>
        <p>
          You are given a list of sorted lists. Return one sorted list that holds all their values. Some lists may be empty, and there may be no
          lists at all.
        </p>
        <CodeBlock
          code={`merge_k([[1, 4, 7], [2, 5, 8], [0, 6]])  ->  [0, 1, 2, 4, 5, 6, 7, 8]
merge_k([[], [3], [1, 2]])               ->  [1, 2, 3]`}
        />
        <NoHeapq />
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 60,000 values in up to 300 lists. Use <M>O(n log k)</M> comparisons for n values in k lists.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The next value of the answer is always the front value of one of the lists. How can you find the smallest of k front values without looking at all k each time?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Put one entry per non-empty list in a min-heap: <code>(value, list number, position)</code>. Tuples compare item by item, so ties on
              value are settled by the list number.
            </p>
            <p>
              Repeat: take the smallest entry and append its value to the answer. If its list has a next value, put that entry in the heap in its
              place; otherwise the heap shrinks by one.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`h = [(l[0], i, 0) for each non-empty list l, number i]
heapify h; out = []
while h:
    v, i, j = smallest entry (the root)
    out.append(v)
    if j + 1 < len(lists[i]):
        replace the root with (lists[i][j+1], i, j+1)
    else: remove the root
    sift down from the root
return out`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Median of a stream",
    fn: "MedianFinder",
    lessons: [6],
    blocked: ["heapq", "bisect"],
    starter: `class MedianFinder:
    def __init__(self):
        pass

    def add(self, x):
        pass

    def median(self):
        # the median of every value added so far, as a float
        pass
`,
    statement: (
      <>
        <p>
          Values arrive one at a time. After any of them, you may be asked for the <strong>median</strong> of all values so far: the middle value
          once they are sorted, or the average of the two middle values when the count is even. Return it as a float.
        </p>
        <CodeBlock
          code={`m = MedianFinder()
m.add(5);  m.median()    # 5.0
m.add(15); m.median()    # 10.0
m.add(1);  m.median()    # 5.0
m.add(3);  m.median()    # 4.0`}
        />
        <p><code>median</code> is only called after at least one <code>add</code>. Values are integers and can repeat.</p>
        <p>
          The modules <code>heapq</code> and <code>bisect</code> are switched off.
        </p>
        <Counted />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 50,000 values, with a median after each. <code>add</code> should take <M>O(log n)</M> comparisons and <code>median</code>{" "}
            <M>O(1)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The median only depends on the largest value of the smaller half and the smallest value of the larger half. Which structure gives you a largest value, or a smallest value, at once?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep two heaps. <code>low</code> holds the smaller half as a max-heap (store <code>-x</code> in a min-heap). <code>high</code> holds
              the larger half as a min-heap. Keep two promises: every value in low is at most every value in high, and low has the same size as
              high or one more.
            </p>
            <p>
              To add x: if low is empty or x is at most low&rsquo;s top, push it into low, else into high. Then, if low has two more than high,
              move low&rsquo;s top to high; if high is bigger than low, move high&rsquo;s top to low.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`add(x):
    if low empty or x <= -low[0]: push(low, -x)
    else: push(high, x)
    if len(low) > len(high) + 1: push(high, -pop(low))
    elif len(high) > len(low): push(low, -pop(high))

median():
    if len(low) > len(high): return float(-low[0])
    return (-low[0] + high[0]) / 2`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
