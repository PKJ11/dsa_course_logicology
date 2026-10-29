import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

export const RECR_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Power on a clock",
    fn: "power_mod",
    lessons: [1, 2],
    blocked: ["pow"],
    starter: `def power_mod(x, n, m):
    # Return (x to the power n) % m.
    # pow() is switched off: build it yourself.
    pass
`,
    statement: (
      <>
        <p>
          A clock with <code>m</code> hours wraps round to 0 after <code>m - 1</code>. Working &ldquo;on the clock&rdquo; means keeping only the
          remainder after dividing by <code>m</code>. Return <code>x</code> to the power <code>n</code>, on a clock of <code>m</code>: that is,{" "}
          <code>(x ** n) % m</code>.
        </p>
        <CodeBlock
          code={`power_mod(3, 4, 5)       # 81 % 5 = 1
power_mod(2, 13, 1000)   # 8192 % 1000 = 192
power_mod(7, 0, 13)      # 1`}
        />
        <p>
          <code>pow()</code> is switched off for this problem. <code>x ** n</code> works for small <code>n</code>, but for <code>n = 10¹⁸</code> (a 1 followed by 18 zeros) the
          number could have about 9 billion billion digits, far more than any computer can store.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            <code>x</code> is from 0 to 10⁹ (a billion), <code>n</code> from 0 to 10¹⁸ (a billion billion), and <code>m</code> from 1 to 10⁹.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 1 halves the power at each call. And you may take the remainder by m after every multiplication: the final remainder is the same.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              If <code>n</code> is even, <M>xⁿ = half × half</M>, where <code>half</code> is <M>x</M> to the power <M>n/2</M>. If it is odd, multiply by one more <code>x</code>. Work out{" "}
              <code>half = power_mod(x, n // 2, m)</code> <strong>once</strong>, then square it. Calling it twice brings back <code>n</code> calls.
            </p>
            <p>
              Base case: <code>n == 0</code> gives <code>1 % m</code>, which is 0 when <code>m == 1</code>. Take <code>% m</code> after each
              multiplication so every number stays below <M>m × m</M>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if n == 0: return 1 % m
half = power_mod(x, n // 2, m)
result = half * half % m
if n is odd: result = result * (x % m) % m
return result`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Steps on the footbridge",
    fn: "count_ways",
    lessons: [3, 6],
    starter: `def count_ways(n):
    # Number of ways to go up n steps,
    # moving up 1, 2 or 3 steps at a time.
    pass
`,
    statement: (
      <>
        <p>
          A footbridge has <code>n</code> steps. Each move takes you up 1, 2 or 3 steps. Return the number of different sequences of moves that take
          you from the bottom to exactly the top.
        </p>
        <CodeBlock
          code={`count_ways(3)    # 4: 1+1+1, 1+2, 2+1, 3
count_ways(4)    # 7
count_ways(0)    # 1: the empty sequence`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is up to 10,000. The answer has thousands of digits; Python&rsquo;s whole numbers can hold it exactly.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Think about the first move. After a first move of 1, 2 or 3 steps, what is left is a smaller staircase of the same kind.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>count_ways(n) = count_ways(n - 1) + count_ways(n - 2) + count_ways(n - 3)</code>, with <code>count_ways(0) = 1</code> and no ways for negative heights.
              Written as plain recursion this is a tree of about 1.84ⁿ calls, n copies of 1.84 multiplied together (lesson 3).
            </p>
            <p>
              A memo fixes the repeats, but recursion 10,000 deep breaks Python&rsquo;s limit. So fill the answers from the bottom up with a loop, and
              keep only the last three (lesson 6).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`a, b, c = 1, 0, 0      # count_ways(0), count_ways(-1), count_ways(-2)
repeat n times:
    a, b, c = a + b + c, a, b
return a`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Every group of coaches",
    fn: "subsets",
    lessons: [4],
    blocked: ["itertools.combinations", "itertools.product"],
    starter: `def subsets(items):
    # Return a list of every subset of items.
    # Inside each subset, keep the input order.
    pass
`,
    statement: (
      <>
        <p>
          A train is being put together from the coaches in <code>items</code>. Return every possible group of coaches: every subset, from the empty one to
          all of them. Each subset is a list that keeps the coaches in the same order as <code>items</code>. The subsets themselves may be in any
          order.
        </p>
        <CodeBlock
          code={`subsets(["A", "B"])
# [["A", "B"], ["A"], ["B"], []]  (any order of the four)
subsets([])    # [[]]`}
        />
        <p>
          <code>itertools.combinations</code> and <code>itertools.product</code> are switched off. The tests sort your answer before comparing it.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 16 items, all different.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Each item is either in a subset or not. Make that choice for item 0, then item 1, and so on. When every item is decided, you have one subset.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Write an inner function <code>go(i)</code> that decides item <code>i</code>, using one shared list <code>chosen</code>. Take the item (append),
            call <code>go(i + 1)</code>, undo (pop), then call <code>go(i + 1)</code> again to skip it. When <code>i == len(items)</code>, record{" "}
            <code>chosen[:]</code>, a copy.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`out = []; chosen = []
def go(i):
    if i == len(items): append a copy of chosen to out; return
    chosen.append(items[i]); go(i + 1); chosen.pop()
    go(i + 1)
go(0); return out`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Every running order",
    fn: "orders",
    lessons: [4],
    blocked: ["itertools.permutations"],
    starter: `def orders(items):
    # Return a list of every order of items.
    pass
`,
    statement: (
      <>
        <p>
          A set of trains must leave one after another. Return every possible running order: every permutation of <code>items</code>, as a list of
          lists. The orders may be in any order.
        </p>
        <CodeBlock
          code={`orders([1, 2, 3])
# [[1, 2, 3], [1, 3, 2], [2, 1, 3],
#  [2, 3, 1], [3, 1, 2], [3, 2, 1]]
orders([])    # [[]]`}
        />
        <p>
          <code>itertools.permutations</code> is switched off. Do not change <code>items</code>. The tests sort your answer before comparing it.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 8 items, all different.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Fill the places one at a time. The first place can hold any item; each later place can hold any item not used yet.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep <code>chosen</code> (the order so far) and <code>used</code> (a list of <code>True</code>/<code>False</code>, one per item). In{" "}
            <code>go()</code>, loop over the items. For each unused one: mark it used, append it, call <code>go()</code>, then pop it and mark it unused
            again. When <code>chosen</code> is full, record a copy.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def go():
    if len(chosen) == len(items): record chosen[:]; return
    for i in range(len(items)):
        if not used[i]:
            used[i] = True; chosen.append(items[i])
            go()
            chosen.pop(); used[i] = False`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Queens on the yard",
    fn: "n_queens",
    lessons: [5],
    starter: `def n_queens(n):
    # Return how many ways n queens can be placed on an
    # n x n board with no two in the same row, column
    # or diagonal.
    pass
`,
    statement: (
      <>
        <p>
          Return the number of ways to place <code>n</code> queens on an <code>n × n</code> board so that no two share a row, a column or a diagonal.
          Lesson 5 explains the rules and the search.
        </p>
        <CodeBlock
          code={`n_queens(4)    # 2
n_queens(8)    # 92
n_queens(3)    # 0`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is from 1 to 10.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>There is exactly one queen in each row. So the search decides a column for row 0, then row 1, and so on. Stop going down a branch as soon as the new queen clashes.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep three sets: the columns in use, the values <code>r - c</code> in use, and the values <code>r + c</code> in use. Two queens share a
            diagonal exactly when one of those two values is the same. Then a clash check is three set lookups. Add to the sets before going to the
            next row, and remove after coming back.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def go(r):
    if r == n: count += 1; return
    for c in range(n):
        if c, r - c or r + c is in use: continue
        mark c, r - c, r + c as used
        go(r + 1)
        unmark them`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Parcels inside parcels",
    fn: "depth_sum",
    lessons: [6],
    starter: `def depth_sum(nested):
    # nested is a list of whole numbers and lists,
    # nested to any depth. Return the sum of each
    # number multiplied by its depth.
    pass
`,
    statement: (
      <>
        <p>
          Parcels are packed inside parcels. <code>nested</code> is a list whose items are whole numbers or more lists like it, nested to any depth.
          The <em>depth</em> of a number is how many lists it is inside: a number directly in <code>nested</code> has depth 1, a number in a list
          inside <code>nested</code> has depth 2, and so on. Return the sum of every number multiplied by its depth. Do not change{" "}
          <code>nested</code>.
        </p>
        <CodeBlock
          code={`depth_sum([1, [2, [3, 4]], 5])
# 1×1 + 2×2 + 3×3 + 4×3 + 5×1 = 31
depth_sum([[], [[]], [1, []]])    # 1×2 = 2`}
        />
        <p>One test is nested 2,000 levels deep. Read lesson 6 before you start.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 numbers, and nesting up to 2,000 deep.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A recursive version is easy to write, but 2,000 levels means 2,000 frames, and Python stops at about 1,000. Keep your own stack in a list.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Lesson 6&rsquo;s stack held items only. Here each item also needs its depth, so push pairs: <code>(item, depth)</code>. Start with{" "}
            <code>[(nested, 0)]</code>. Pop a pair. If the item is a list, push each of its items with the depth plus 1. If it is a number, add the
            number times its depth to the total. The order does not matter, because the total is the same in any order.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`total = 0; stack = [(nested, 0)]
while stack:
    v, d = stack.pop()
    if v is a list: push (item, d + 1) for each item of v
    else: total += v * d
return total`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
