import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const HARD_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "An answer from a yes/no helper",
    fn: "find_assignment",
    lessons: [1],
    starter: `def find_assignment(n, clauses, sat):
    # Variables 1..n. A clause is a list of literals:
    # k means "x_k is True", -k means "x_k is False".
    # sat(formula) returns True if some assignment makes
    # every clause of formula true. Return a list of n
    # values (True/False), or None if there is none.
    # Ask sat at most n + 1 times.
    pass
`,
    statement: (
      <>
        <p>
          A formula has variables x₁ … xₙ and a list of clauses. A clause is a list of literals: <code>k</code> means “xₖ is True” and{" "}
          <code>-k</code> means “xₖ is False”, and a clause holds when at least one of its literals holds. You are given a helper{" "}
          <code>sat(formula)</code> that answers only True or False: can some assignment make every clause of <code>formula</code> hold?
        </p>
        <p>
          Return an assignment as a list of n values, <code>answer[k - 1]</code> for xₖ, that makes every clause hold, or <code>None</code> if
          there is none. Call <code>sat</code> at most n + 1 times.
        </p>
        <CodeBlock
          code={`find_assignment(2, [[1, 2], [-1]], sat)   # [False, True]
find_assignment(1, [[1], [-1]], sat)      # None`}
        />
        <p>
          Each test reports two facts: whether your answer is right (<code>'satisfied'</code>, or <code>'no assignment'</code> for None), and
          whether <code>sat</code> was called at most n + 1 times. Any right assignment passes.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 60 variables, so trying all 2ⁿ assignments (n twos multiplied together) is impossible.</li>
          <li>Give <code>sat</code> a list of clauses, each a list of literals from 1 to n or −1 to −n.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 1, “Finding an answer with a yes/no helper”: fix the variables one at a time, asking each time whether an answer still exists.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Ask about the formula itself first. If the answer is no, return None. Otherwise keep a list of the clauses plus the choices so far.
              For each variable x, ask whether an answer exists with the clause <code>[x]</code> added.
            </p>
            <p>
              If yes, add <code>[x]</code> for good and record True. If no, add <code>[-x]</code> and record False without asking: an answer
              exists with the earlier choices, and it cannot have x True.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if not sat(clauses): return None
fixed = list(clauses); answer = []
for x in 1 .. n:
    if sat(fixed + [[x]]):
        fixed.append([x]);  answer.append(True)
    else:
        fixed.append([-x]); answer.append(False)
return answer`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Three groups as a formula",
    fn: "colouring_formula",
    lessons: [2],
    starter: `def colouring_formula(n, edges):
    # Vertices 0..n-1, edges as (u, v) pairs.
    # Variable 3*v + c + 1 means "vertex v is in group c"
    # (c = 0, 1 or 2). Return a list of clauses (lists of
    # literals) that can all be made true exactly when the
    # graph splits into 3 groups with no edge inside one.
    pass
`,
    statement: (
      <>
        <p>
          Can the vertices of a graph be split into three groups, 0, 1 and 2, so that no edge joins two vertices of the same group? Do not answer
          the question: write it as a formula, the way lesson 2 reduces problems to SAT.
        </p>
        <p>
          Use variable <code>3 * v + c + 1</code> for “vertex v is in group c”. Return a list of clauses; a clause is a list of literals,{" "}
          <code>k</code> for “variable k is True” and <code>-k</code> for “variable k is False”. The formula must be satisfiable exactly when the
          split exists, and every assignment that satisfies it must describe a split: each vertex has at least one True group variable, and
          giving each vertex any one of its True groups puts no edge inside a group.
        </p>
        <CodeBlock
          code={`colouring_formula(2, [(0, 1)])
# for example
# [[1, 2, 3], [4, 5, 6], [-1, -4], [-2, -5], [-3, -6]]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 3,000 vertices. At most 4n + 3E clauses: the formula must be built in polynomial time and stay small.</li>
          <li>Edges join two different vertices, and no edge is listed twice.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Two kinds of rule: every vertex is in some group, and the two ends of an edge are not in the same group (lesson 2, “Reducing to SAT”).</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              For each vertex v: one clause <code>[x(v, 0), x(v, 1), x(v, 2)]</code>, “at least one group”. For each edge (u, v) and each group
              c: the clause <code>[-x(u, c), -x(v, c)]</code>, “not both in group c”.
            </p>
            <p>
              That is n + 3E clauses. “At most one group per vertex” is not needed: if a vertex has two True groups, either can be used, because
              the edge clauses forbid every shared group with a neighbour.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`x(v, c) = 3 * v + c + 1
formula = [[x(v, 0), x(v, 1), x(v, 2)] for each v]
for each edge (u, v):
    for c in 0, 1, 2:
        formula.append([-x(u, c), -x(v, c)])
return formula`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The most valuable load",
    fn: "best_value",
    lessons: [3],
    starter: `def best_value(items, cap):
    # items: (weight, value) pairs, weights at least 1.
    # Return the largest total value of items whose total
    # weight is at most cap (each item used at most once).
    pass
`,
    statement: (
      <>
        <p>
          A wagon can carry <code>cap</code> kilograms. Each item <code>(weight, value)</code> can be loaded once or not at all. Return the largest
          total value that fits. This is the 0/1 knapsack (DYNP-8), but with numbers far too large for a table.
        </p>
        <CodeBlock
          code={`best_value([(1, 2), (10, 15)], 10)            # 15
best_value([(6, 30), (5, 24), (5, 24)], 10)    # 48`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100 items; weights and values up to about 10⁹; cap up to about 5 × 10¹⁰.</li>
          <li>A table by weight or by value is far too big, and trying all 2ⁿ choices is impossible. Branch and bound with a good bound works.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 3: search take/leave choices depth first, and cut a branch when its bound is not above the best value found.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the items by value per kilogram, best first (compare exactly with <code>Fraction(v, w)</code>, or <code>v1 * w2</code> against{" "}
              <code>v2 * w1</code>). Search in that order, trying “take” before “leave”.
            </p>
            <p>
              Bound at item k with <code>room</code> left: add the next items whole while they fit; for the first that does not, add{" "}
              <code>v * room // w</code>, the part that fills the room. Since best is a whole number, rounding down keeps the bound safe.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`sort items by value/weight, largest first
best = 0
go(k, room, value):
    best = max(best, value)
    if k == n or bound(k, room, value) <= best: return
    w, v = items[k]
    if w <= room: go(k + 1, room - w, value + v)
    go(k + 1, room, value)
go(0, cap, 0); return best`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Balancing the machines",
    fn: "schedule",
    lessons: [4],
    starter: `def schedule(jobs, m):
    # jobs: lengths of the jobs. m machines, numbered 0..m-1.
    # Return a list: the machine for each job, so that the
    # busiest machine's total is at most 4/3 of the best.
    pass
`,
    statement: (
      <>
        <p>
          There are m identical machines and a list of job lengths. Each job runs on one machine, and each machine runs its jobs one after
          another. Return, for each job in the given order, the number of its machine (0 to m − 1). The busiest machine’s total must be at most
          4/3 of the smallest possible.
        </p>
        <CodeBlock
          code={`schedule([1, 1, 1, 1, 1, 1, 3], 3)
# for example [1, 1, 1, 2, 2, 2, 0]:
# each machine then has a total of 3, the best possible`}
        />
        <p>
          Many answers are right. Each test checks only that your list is a valid assignment and that the busiest total is at most 4/3 of the
          best possible (known for each test).
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 jobs and 10,000 machines. Finding the least loaded machine by looking at all of them, for every job, is too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 4, “Balancing machines”: longest job first, each onto the machine with the smallest total so far.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the job numbers by length, longest first (sort the positions, so you can still answer in the given order). Keep the machines in
              a heap of <code>(total, machine)</code> pairs (HEAP-4).
            </p>
            <p>
              For each job, pop the least loaded machine, record it for the job, and push it back with its new total. Each job costs{" "}
              <code>O(log m)</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = job positions sorted by length, longest first
heap = [(0, k) for k in range(m)]
answer = [0] * len(jobs)
for j in order:
    total, k = heappop(heap)
    answer[j] = k
    heappush(heap, (total + jobs[j], k))
return answer`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Prime or not",
    fn: "is_prime",
    lessons: [5],
    starter: `def is_prime(n):
    # n: a whole number from 0 to below 3 * 10**24.
    # Return True if n is prime, False otherwise.
    pass
`,
    statement: (
      <>
        <p>
          Return whether a whole number n is prime, for any n from 0 up to just below 3 × 10²⁴. The answer must always be right: no chance of
          error is allowed.
        </p>
        <CodeBlock
          code={`is_prime(97)     # True
is_prime(561)    # False: 3 · 11 · 17
is_prime(2047)   # False: 23 · 89`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Trial division up to √n is far too slow for large n.</li>
          <li>Some tests ask about thousands of numbers at once.</li>
          <li>The numbers include composites built to fool weaker tests: Carmichael numbers, and numbers that pass the strong test for many bases.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 5: the Miller–Rabin test with the fixed bases that are known to catch every composite in this range.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Handle n &lt; 2, and n divisible by one of the bases 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41 (prime only if n equals it).
              Then write <code>n - 1 = d * 2**s</code> with d odd.
            </p>
            <p>
              For each base a: <code>x = pow(a, d, n)</code>. If x is 1 or n − 1, a proves nothing. Otherwise square x up to s − 1 times; if it
              never becomes n − 1, n is composite. If every base passes, n is prime (exactly, below 3.3 × 10²⁴).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for p in BASES: if n % p == 0: return n == p
d, s = n - 1, 0; while d even: d //= 2; s += 1
for a in BASES:
    x = pow(a, d, n)
    if x in (1, n - 1): continue
    repeat s - 1 times:
        x = x * x % n
        if x == n - 1: break
    else: return False
return True`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
