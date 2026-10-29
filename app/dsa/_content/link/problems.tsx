import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

const NODE = `class Node:
    # The tests build your list from nodes of this shape.
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

`;

function TestsNote() {
  return (
    <p>
      The tests build the list from nodes with a <code>value</code> and a <code>next</code>, pass you the head, then walk from the head you return,
      following <code>next</code>, and compare the values they find. An empty list is <code>None</code>.
    </p>
  );
}

export const LINK_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Remove a station",
    fn: "remove_all",
    lessons: [1, 2],
    starter: `${NODE}
def remove_all(head, x):
    # Remove every node whose value is x.
    # Return the head of the list that is left.
    pass
`,
    statement: (
      <>
        <p>
          A linked list holds the stations on a route. Remove every node whose value is <code>x</code>, and return the head of what is left. The
          other nodes keep their order.
        </p>
        <CodeBlock
          code={`list 1, 2, 6, 3, 4, 5, 6, remove 6   ->  1, 2, 3, 4, 5
list 6, 6, 1, 6, remove 6            ->  1
list 7, 7, 7, remove 7               ->  None (empty)`}
        />
        <TestsNote />
        <p>Change the links of the nodes you are given. Do not build a new list.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 nodes.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>To remove a node you change the node before it. What do you do when the node to remove is the head, which has no node before it?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Put a dummy node in front of the head (lesson 2). Walk with <code>cur</code> starting at the dummy, and look one node ahead at{" "}
              <code>cur.next</code>. If it holds <code>x</code>, skip it. Otherwise move <code>cur</code> on.
            </p>
            <p>
              After a skip, do not move <code>cur</code>: its new <code>next</code> has not been checked. At the end, return <code>dummy.next</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`dummy = Node(None, head)
cur = dummy
while cur.next is not None:
    if cur.next.value == x: cur.next = cur.next.next
    else: cur = cur.next
return dummy.next`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "A two-way line",
    fn: "Line",
    lessons: [3],
    blocked: ["collections.deque"],
    starter: `class Line:
    # A line of values you can add to and remove from at both ends.
    # Every method must take O(1) time.

    def __init__(self):
        pass

    def add_first(self, x):
        pass

    def add_last(self, x):
        pass

    def remove_first(self):
        # Remove and return the first value, or return None if empty.
        pass

    def remove_last(self):
        # Remove and return the last value, or return None if empty.
        pass

    def __len__(self):
        pass

    def to_list(self):
        # The values from first to last, as a Python list.
        pass
`,
    statement: (
      <>
        <p>
          Build a class <code>Line</code>: a line of values that can grow and shrink at both ends. Every method except <code>to_list</code> must
          take <M>O(1)</M> time, however long the line is.
        </p>
        <CodeBlock
          code={`L = Line()
L.add_last(1); L.add_last(2); L.add_first(0)
L.to_list()        # [0, 1, 2]
L.remove_first()   # 0
L.remove_last()    # 2
len(L)             # 1
L.remove_last()    # 1
L.remove_last()    # None: the line is empty`}
        />
        <p>
          <code>collections.deque</code> does exactly this, so it is switched off. Build it yourself from nodes. A Python list will not do either:{" "}
          <code>insert(0, x)</code> and <code>pop(0)</code> move every item, so they are <M>O(n)</M>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 operations in one test.</li>
          <li>The tests call the methods and compare what each one returns.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Removing the last node of a one-way list needs the node before it, which means a walk. What extra reference would let the last node
            tell you which node comes before it?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Use a two-way list: each node has <code>prev</code> and <code>next</code>. Put two sentinel nodes at the ends that are never removed
              (lesson 3). Then every real node has a node on each side, and adding or removing never needs a special case.
            </p>
            <p>
              Keep a count, updated by every add and remove, so <code>__len__</code> is <M>O(1)</M>. The line is empty when the count is 0.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`__init__: front, back = sentinel nodes; front.next = back; back.prev = front; n = 0
insert x between a and b:
    node.prev, node.next = a, b; a.next = node; b.prev = node; n += 1
remove node:
    node.prev.next = node.next; node.next.prev = node.prev; n -= 1
add_first = insert between front and front.next
remove_last = if n == 0: None, else remove back.prev`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Reverse a section",
    fn: "reverse_between",
    lessons: [4],
    starter: `${NODE}
def reverse_between(head, left, right):
    # Reverse the nodes at positions left to right (counting from 1).
    # Return the head of the whole list.
    pass
`,
    statement: (
      <>
        <p>
          Reverse only the part of the list from position <code>left</code> to position <code>right</code>, both included. Positions count from
          1. The nodes before and after that part stay where they are. Return the head of the whole list.
        </p>
        <CodeBlock
          code={`list 1, 2, 3, 4, 5, left 2, right 4   ->  1, 4, 3, 2, 5
list 1, 2, 3, 4, 5, left 1, right 3   ->  3, 2, 1, 4, 5`}
        />
        <TestsNote />
        <p>Relink the nodes you are given; do not copy values into new nodes.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes.</li>
          <li>
            <code>left</code> is at least 1, <code>right</code> is at least <code>left</code>, and <code>right</code> is at most the number of
            nodes.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Draw four nodes: the one just before the part, the first and last nodes of the part, and the one just after it. Which references must
            change at the edges?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Use a dummy node before the head, so a node before the part always exists, even when <code>left</code> is 1. Walk{" "}
              <code>left - 1</code> steps to reach <code>before</code>. Remember <code>first = before.next</code>.
            </p>
            <p>
              Run the reversing loop <code>right - left + 1</code> times. After it, <code>prev</code> is the part&rsquo;s new first node and{" "}
              <code>cur</code> is the node after the part. Link <code>before</code> to <code>prev</code> and <code>first</code> to <code>cur</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`dummy = Node(None, head); before = dummy
repeat left - 1 times: before = before.next
first = before.next
prev, cur = None, first
repeat right - left + 1 times:
    nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
before.next = prev
first.next = cur
return dummy.next`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Turn each group round",
    fn: "reverse_groups",
    lessons: [4],
    starter: `${NODE}
def reverse_groups(head, k):
    # Reverse each full group of k nodes.
    # A short last group stays as it is.
    # Return the head of the whole list.
    pass
`,
    statement: (
      <>
        <p>
          Split the list into groups of <code>k</code> nodes, starting at the head. Reverse the nodes inside each full group. If the last group has
          fewer than <code>k</code> nodes, leave it as it is. Return the head of the whole list.
        </p>
        <CodeBlock
          code={`list 1, 2, 3, 4, 5, 6, 7, 8, k 3   ->  3, 2, 1, 6, 5, 4, 7, 8
list 1, 2, 3, 4, 5, 6, k 2         ->  2, 1, 4, 3, 6, 5
list 1, 2, 3, k 5                  ->  1, 2, 3`}
        />
        <TestsNote />
        <p>Relink the nodes you are given; do not copy values into new nodes. Use O(1) extra space.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes.</li>
          <li>
            <code>k</code> is at least 1.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Do one group at a time. It is LINK-P3 again, with <code>left</code> and <code>right</code> moving along the list. Before you reverse a
            group, how do you know it is full?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Put a dummy node before the head. Keep a name <code>before</code> for the node just before the next group. From{" "}
              <code>before</code>, walk <code>k</code> nodes ahead. If you reach <code>None</code> first, the rest is a short group: stop and return{" "}
              <code>dummy.next</code>.
            </p>
            <p>
              Otherwise reverse the <code>k</code> nodes with the loop from lesson 4. The group&rsquo;s old first node is now its last node. Link it to
              the node after the group, link <code>before</code> to the group&rsquo;s new first node, and move <code>before</code> to the old first
              node.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`dummy = Node(None, head); before = dummy
repeat:
    end = before; walk end k nodes on
    if the list ends first: return dummy.next
    first = before.next; after = end.next
    prev, cur = after, first
    while cur is not after:
        nxt = cur.next; cur.next = prev; prev, cur = cur, nxt
    before.next = prev
    before = first`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Where the loop starts",
    fn: "loop_start",
    lessons: [5],
    starter: `${NODE}
def loop_start(head):
    # If following next ever comes back to an earlier node,
    # return the first node of that loop. Otherwise return None.
    pass
`,
    statement: (
      <>
        <p>
          A linked list may have a loop: its last node points back to an earlier node instead of <code>None</code>. If it does, return the first
          node of the loop. If it does not, return <code>None</code>.
        </p>
        <CodeBlock
          code={`5 -> 1 -> 8 -> 3 -> 7 -> 2 -> 6 -> 4
               ^                   |
               +-------------------+
loop_start(head)   # the node holding 3`}
        />
        <p>
          Return the node itself, not its value: the tests check which node you return by its position. Use <M>O(1)</M> extra space. To make that
          fair, the nodes in the tests cannot be put in a set or used as dictionary keys: trying raises <code>TypeError: unhashable type</code>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes.</li>
          <li>Values can repeat, so you cannot find the loop by looking at values.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Two names moving at different speeds along a loop must meet. Lesson 5 shows what you can learn from where they meet, and from the head.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              First part: <code>slow</code> moves one node and <code>fast</code> two. If <code>fast</code> reaches the end, there is no loop. If{" "}
              <code>slow is fast</code>, there is.
            </p>
            <p>
              Second part: start <code>p</code> at the head. Move <code>p</code> and <code>slow</code> one node at a time until <code>p is slow</code>.
              That node is the start of the loop. Compare with <code>is</code>, never by value.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`slow = fast = head
while fast is not None and fast.next is not None:
    slow, fast = slow.next, fast.next.next
    if slow is fast:
        p = head
        while p is not slow: p, slow = p.next, slow.next
        return p
return None`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Sort the train",
    fn: "sort_list",
    lessons: [5, 6],
    blocked: ["sorted"],
    starter: `${NODE}
def sort_list(head):
    # Sort the list into increasing order by relinking its nodes.
    # Return the new head.
    pass
`,
    statement: (
      <>
        <p>Sort a linked list into increasing order and return the new head. Relink the nodes you are given; do not make new ones.</p>
        <CodeBlock
          code={`list 4, 2, 1, 3      ->  1, 2, 3, 4
list 3, 1, 3, 1, 2   ->  1, 1, 2, 3, 3`}
        />
        <TestsNote />
        <p>
          <code>sorted()</code> and <code>.sort()</code> are switched off. Your sort must be <M>O(n log n)</M>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes, with whole-number values between −1,000,000 and 1,000,000.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Which O(n log n) sort only walks forwards and never needs to reach an item by its position?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Merge sort. Split the list in the middle with <code>slow</code> and <code>fast</code>, cut it by setting the middle node&rsquo;s{" "}
              <code>next</code> to <code>None</code>, sort both halves, and merge them with a dummy node (lesson 6).
            </p>
            <p>
              Start <code>fast</code> at <code>head.next</code>, so that with two nodes <code>slow</code> stops on the first one. Otherwise a
              two-node list never gets smaller.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`sort_list(head):
    if head is None or head.next is None: return head
    slow, fast = head, head.next
    while fast and fast.next: slow, fast = slow.next, fast.next.next
    second = slow.next; slow.next = None
    return merge(sort_list(head), sort_list(second))`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
