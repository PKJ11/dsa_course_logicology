import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const PYTH_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Rotate the departure board",
    fn: "rotate",
    lessons: [1, 6],
    starter: `def rotate(board, k):
    # Return a new list: board rotated left by k places.
    # Do not change board itself.
    pass
`,
    statement: (
      <>
        <p>
          A departure board shows a list of station codes. Every few minutes the board rotates: the first entry moves to the end. You are given
          the list <code>board</code> and a whole number <code>k</code> (0 or more). Return a <strong>new</strong> list that shows the board after it
          has rotated left <code>k</code> times. Do not change <code>board</code> itself.
        </p>
        <CodeBlock
          code={`rotate(["BCT", "HWH", "MAS", "SBC"], 1)
# ["HWH", "MAS", "SBC", "BCT"]
rotate(["BCT", "HWH", "MAS", "SBC"], 2)
# ["MAS", "SBC", "BCT", "HWH"]
rotate(["BCT", "HWH", "MAS", "SBC"], 6)
# the same as rotating by 2`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000,000 entries. <code>k</code> can be bigger than the length of the board.</li>
          <li>The board may be empty.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            After the rotation, the board starts with <code>board[k]</code> and ends with the values that were in front of it. Which two slices
            are those?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The answer is the part from index <code>k</code> to the end, followed by the part before index <code>k</code>. Join two lists with{" "}
              <code>+</code>.
            </p>
            <p>
              Rotating a board of length <code>n</code> by <code>n</code> gives the same board. So only the remainder <code>k % n</code> matters. But
              check for an empty board first: <code>k % 0</code> is an error.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if board is empty: return []
k = k % len(board)
return board[k:] + board[:k]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Running totals",
    fn: "running_totals",
    lessons: [2, 3],
    starter: `def running_totals(a):
    # Entry i of the answer is a[0] + a[1] + ... + a[i].
    pass
`,
    statement: (
      <>
        <p>
          A train picks up and drops off passengers at each station. The list <code>a</code> holds the change at each station: a positive number
          means people got on, and a negative number means people got off. Return a new list where entry <code>i</code> is the total change up to
          and including station <code>i</code>.
        </p>
        <CodeBlock
          code={`running_totals([4, 9, 2])        # [4, 13, 15]
running_totals([3, -5, 4, -1])   # [3, -2, 2, 1]
running_totals([])               # []`}
        />
        <p>These totals are called <em>prefix sums</em>. They come back in ARRS-4, where they answer range questions in constant time: the same few steps, however long the list.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 values.</li>
          <li>Return a new list; do not change <code>a</code>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Each total is the previous total plus one more value. You never need to add up the earlier values again.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep one name, <code>s</code>, for the total so far, starting at 0. Go through <code>a</code> once. For each value, add it to{" "}
            <code>s</code>, then append <code>s</code> to the answer list.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`out = []
s = 0
for x in a:
    s = s + x
    append s to out
return out`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The first repeated code",
    fn: "first_repeat",
    lessons: [4],
    starter: `def first_repeat(codes):
    # Return the first code that is seen for a second time,
    # reading left to right. Return None if no code repeats.
    pass
`,
    statement: (
      <>
        <p>
          A signal box logs the code of each train as it passes. Reading the log from left to right, find the first code that you see for the
          second time. Return that code, or <code>None</code> if every code is different.
        </p>
        <CodeBlock
          code={`first_repeat(["BCT", "HWH", "MAS", "HWH", "BCT"])   # "HWH"
first_repeat(["A", "B", "B", "A"])                 # "B"
first_repeat(["BCT", "HWH"])                       # None`}
        />
        <p>
          In the second example, A appears first, but B is the first code to appear again. Codes are compared exactly, so{" "}
          <code>&quot;bct&quot;</code> and <code>&quot;BCT&quot;</code> are different.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to about 100,000 codes.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>As you read the log, remember every code you have already seen. Which kind of collection answers &ldquo;have I seen this?&rdquo; quickly?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Use a set. For each code, first check whether it is in the set. If it is, this is the first repeat, so return it. If not, add it to the
            set and go on. If the loop ends, nothing repeated.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`seen = empty set
for c in codes:
    if c in seen: return c
    add c to seen
return None`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The codes seen once",
    fn: "single_codes",
    lessons: [4],
    starter: `def single_codes(codes):
    # Return the codes that appear exactly once,
    # in the order they appear in codes.
    pass
`,
    statement: (
      <>
        <p>
          A log lists the station code of every train that passed. Return a list of the codes that appear <strong>exactly once</strong> in the log,
          in the order they appear.
        </p>
        <CodeBlock
          code={`single_codes(["BCT", "HWH", "BCT", "MAS", "HWH", "SBC"])
# ["MAS", "SBC"]
single_codes(["A", "B", "A", "B"])    # []
single_codes([])                      # []`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to about 300,000 codes.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>You cannot know that a code appears only once until you have seen the whole log. So first count, then choose.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Count every code with a dictionary, as in lesson 4. Then go through <code>codes</code> a second time and keep each code whose count is 1.
            The second pass keeps the log&rsquo;s order. Avoid <code>codes.count(c)</code>: it goes through the whole list every time you call it.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`counts = an empty dictionary
for each code c:
    add 1 to counts[c] (starting from 0)
return [c for c in codes if counts[c] == 1]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Build a train",
    fn: "make_train",
    lessons: [5],
    starter: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def make_train(values):
    # Link one Node per value, in order.
    # Return the first node, or None if values is empty.
    pass
`,
    statement: (
      <>
        <p>
          The starter code defines a <code>Node</code> class. Write <code>make_train(values)</code>: make one node for each value, in the same order,
          and link each node to the next through its <code>next</code> attribute. The last node&rsquo;s <code>next</code> stays <code>None</code>.
          Return the first node (the head), or <code>None</code> if <code>values</code> is empty.
        </p>
        <CodeBlock
          code={`head = make_train([3, 8, 5])
head.value             # 3
head.next.value        # 8
head.next.next.value   # 5
head.next.next.next    # None`}
        />
        <p>
          The tests walk along your nodes from the head, following <code>next</code>, and compare the values they find. Keep the class name and
          the attribute names <code>value</code> and <code>next</code>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 values.</li>
          <li>Do not change the list <code>values</code>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Each new node goes after the last node made so far. If you had to find the last node by walking from the head every time, the work
            would grow with every node. Can you keep a name that already refers to it?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep two names: <code>head</code> for the first node and <code>tail</code> for the last one. Both start as <code>None</code>. For each value,
            make a node. If <code>head</code> is <code>None</code>, this is the first node, so it is the head. Otherwise set{" "}
            <code>tail.next</code> to the new node. In both cases, the new node becomes the tail.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`head = tail = None
for v in values:
    node = Node(v)
    if head is None: head = node
    else: tail.next = node
    tail = node
return head`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
