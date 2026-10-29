import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const BIGO_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Two loads that add up",
    fn: "has_pair_sum",
    lessons: [3, 4],
    starter: `def has_pair_sum(a, target):
    # Return True if two values at different positions
    # add up to target.
    pass
`,
    statement: (
      <>
        <p>
          A goods yard has a list <code>a</code> of wagon loads. Return <code>True</code> if two loads at <strong>different positions</strong> add up
          to exactly <code>target</code>, and <code>False</code> otherwise.
        </p>
        <CodeBlock
          code={`has_pair_sum([40, 25, 60, 15], 75)
# True: 60 + 15
has_pair_sum([40, 25, 60, 15], 50)
# False: there is only one 25
has_pair_sum([5, 3, 5], 10)
# True: two different 5s`}
        />
        <p>
          Checking every pair is correct, but it takes about n × n steps: <code>Θ(n²)</code>. Read the limits and work out, as in lesson 3, whether that is fast enough.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 loads. Loads and the target are whole numbers, and may be negative.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            For a load <code>x</code>, the only partner that works is <code>target - x</code>. So the question for each <code>x</code> is: have I
            already seen <code>target - x</code>?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <p>
            Go through the list once, keeping a set of the loads seen so far. For each <code>x</code>, first check whether <code>target - x</code> is
            in the set. If it is, return <code>True</code>. Only then add <code>x</code>. Checking before adding stops a load from pairing with
            itself. This is <code>O(n)</code> time on average and <code>O(n)</code> extra space, which is lesson 4&rsquo;s trade.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`seen = empty set
for x in a:
    if target - x in seen: return True
    add x to seen
return False`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Count the steps",
    fn: "count_steps",
    lessons: [1, 2],
    starter: `def count_steps(n):
    # Return what work(n) returns, without running the loops.
    pass
`,
    statement: (
      <>
        <p>Here is a function that counts its own steps:</p>
        <CodeBlock
          code={`def work(n):
    count = 0
    for i in range(n):
        for j in range(i, n):
            count += 1
    for k in range(n):
        count += 2
    return count`}
        />
        <p>
          Write <code>count_steps(n)</code>, which returns exactly what <code>work(n)</code> returns. Running the loops is far too slow for the
          large tests, so find a formula.
        </p>
        <CodeBlock
          code={`count_steps(0)    # 0
count_steps(1)    # 3
count_steps(3)    # 12`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is a whole number from 0 up to 10<sup>18</sup> (a 1 followed by 18 zeros). Return an <code>int</code>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Count the two parts separately and add them. For the first part, how many times does the inner loop run when i is 0? When i is 1? When i is n − 1?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The inner loop runs <code>n - i</code> times, so the first part adds <code>n + (n - 1) + … + 1</code>. Lesson 1 shows that this sum is{" "}
              <code>n(n + 1) / 2</code>. The second part adds 2 on each of <code>n</code> passes.
            </p>
            <p>
              Use <code>//</code>, not <code>/</code>. <code>/</code> always gives a float, and a float cannot hold an 18-digit answer exactly.{" "}
              <code>n(n + 1)</code> is always even, so <code>//</code> loses nothing.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: <CodeBlock code={`return n * (n + 1) // 2 + 2 * n`} />,
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Keep the first of each",
    fn: "dedupe",
    lessons: [4, 8],
    starter: `def dedupe(codes):
    # Return a new list with each code once,
    # in the order of its first appearance.
    pass
`,
    statement: (
      <>
        <p>
          A log of station codes has many repeats. Return a new list that keeps the <strong>first</strong> appearance of each code and drops the
          later ones. Keep the codes in the order they first appeared. Do not change <code>codes</code>.
        </p>
        <CodeBlock
          code={`dedupe(["BCT", "HWH", "BCT", "MAS", "HWH"])
# ["BCT", "HWH", "MAS"]
dedupe([])    # []`}
        />
        <p>
          <code>list(set(codes))</code> removes repeats but loses the order. Lesson 8 explains why <code>if c not in out</code> is too slow here.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 codes.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>You need two things: the answer list, in order, and a fast way to ask &ldquo;have I kept this code already?&rdquo;. One structure cannot do both well. Use two.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep a list <code>out</code> for the answer and a set <code>seen</code> beside it. For each code, if it is not in <code>seen</code>, add it
            to both. Checking the set is <code>O(1)</code> on average, so the whole pass is <code>O(n)</code>. The set costs <code>O(n)</code> extra
            space.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`seen = empty set; out = []
for c in codes:
    if c not in seen:
        add c to seen
        append c to out
return out`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "A growing platform",
    fn: "DynArray",
    lessons: [7],
    starter: `class DynArray:
    def __init__(self):
        self.capacity = 1        # room in slots
        self.size = 0            # values stored
        self.copies = 0          # values copied, in total
        self.slots = [None] * self.capacity

    def append(self, x):
        # If slots is full, make a list twice as long,
        # copy the values across, and count the copies.
        # Then write x into the next free slot.
        pass

    def get(self, i):
        return self.slots[i]
`,
    statement: (
      <>
        <p>
          Build the growing list from lesson 7 yourself. A <code>DynArray</code> keeps its values in <code>self.slots</code>, a Python list whose
          length is always <code>self.capacity</code>. Unused slots hold <code>None</code>.
        </p>
        <p>
          Write <code>append(x)</code>. If the slots are full (<code>size == capacity</code>), make a new list of <code>None</code>s twice as long,
          copy the stored values into it one by one, and add the number of values copied to <code>self.copies</code>. Then write <code>x</code> into
          the next free slot.
        </p>
        <CodeBlock
          code={`d = DynArray()
for x in [10, 20, 30, 40, 50]:
    d.append(x)
d.size, d.capacity, d.copies   # (5, 8, 7): copies of 1, 2 and 4
d.get(4)                       # 50`}
        />
        <p>
          Do not call <code>append</code> on <code>self.slots</code>. The point is to see what Python&rsquo;s own list does for you. The tests check
          the three counters and read every value back.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 appends.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Only two things happen in an append: sometimes a grow-and-copy, and always one write at index <code>size</code>.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            When <code>self.size == self.capacity</code>, make <code>new = [None] * (2 * self.capacity)</code>. Copy each value from{" "}
            <code>self.slots[0]</code> to <code>self.slots[size - 1]</code> into <code>new</code>, and add <code>self.size</code> to{" "}
            <code>self.copies</code>. Then replace <code>self.slots</code> and double <code>self.capacity</code>. After that, write{" "}
            <code>self.slots[self.size] = x</code> and add 1 to <code>self.size</code>.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if size == capacity:
    new = [None] * (2 * capacity)
    for i from 0 to size - 1: new[i] = slots[i]
    copies += size
    slots = new; capacity *= 2
slots[size] = x
size += 1`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Solve the recurrence",
    fn: "master",
    lessons: [5, 6],
    starter: `import math

def master(a, b, d):
    # T(n) = a T(n/b) + n**d is Θ(n**p * (log n)**k).
    # (** means "to the power".) Return (p, k), k is 0 or 1.
    pass
`,
    statement: (
      <>
        <p>
          Write the master theorem from lesson 6 as a function. Given whole numbers <code>a</code> (at least 1), <code>b</code> (at least 2) and <code>d</code> (0 or more), the recurrence{" "}
          <M>T(n) = a T(n/b) + n<sup>d</sup></M> is <M>Θ(n<sup>p</sup> (log n)<sup>k</sup>)</M>, where a power such as <M>n<sup>p</sup></M> means n raised to the power p. Return the pair <code>(p, k)</code>:
        </p>
        <ul>
          <li>
            <code>k</code> is 1 if there is a log factor, and 0 if not.
          </li>
          <li>
            <code>p</code> is the power of <code>n</code>. When it is <M>log<sub>b</sub> a</M> (the power b must be raised to, to give a), round it to 3 decimal places with{" "}
            <code>round(p, 3)</code>.
          </li>
        </ul>
        <CodeBlock
          code={`master(2, 2, 1)   # (1, 1): n log n
master(4, 2, 1)   # (2.0, 0): n²
master(3, 2, 1)   # (1.585, 0)
master(2, 2, 2)   # (2, 0): n²`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>a</code> and <code>b</code> are at most 1,000, and <code>d</code> is at most 5.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Everything depends on one comparison: <code>a</code> against <code>b ** d</code>. Which level of the tree decides the total in each case?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              If <code>a &lt; b ** d</code>, the top level decides: <code>(d, 0)</code>. If they are equal, every level is the same: <code>(d, 1)</code>.
              If <code>a &gt; b ** d</code>, the bottom level decides: <code>p</code> is <M>log<sub>b</sub> a</M>, with no log factor.
            </p>
            <p>
              Compare <code>a</code> with <code>b ** d</code> as whole numbers. They are exact. <code>math.log(a, b)</code> is a float and can be off in
              the last digit, which is why you round it.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if a < b ** d: return (d, 0)
if a == b ** d: return (d, 1)
return (round(math.log(a, b), 3), 0)`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
