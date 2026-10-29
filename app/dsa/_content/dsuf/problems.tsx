import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

function NoRecursion() {
  return (
    <p>
      Some tests join long chains. Write <code>find</code> with a loop, or make sure your trees stay short (lessons 2 and 3): a recursive{" "}
      <code>find</code> on a path of 100,000 nodes stops with <code>RecursionError</code>.
    </p>
  );
}

export const DSUF_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Union-find",
    fn: "DSU",
    lessons: [1, 2, 3],
    starter: `class DSU:
    def __init__(self, n):
        # elements 0 to n - 1, each in a set of its own
        pass

    def find(self, x):
        # the representative (root) of x's set
        pass

    def union(self, a, b):
        # join the two sets; False if they were already one
        pass

    def connected(self, a, b):
        pass

    def size(self, x):
        # how many elements are in x's set
        pass

    def groups(self):
        # how many sets there are now
        pass
`,
    statement: (
      <>
        <p>
          Write a union-find class for the elements 0 to <code>n - 1</code> (lessons 1 to 3). At the start every element is in a set of its own.
        </p>
        <ul>
          <li>
            <code>find(x)</code> returns the representative of <code>x</code>&rsquo;s set: the same element for every member of the set.
          </li>
          <li>
            <code>union(a, b)</code> joins the two sets and returns <code>True</code>, or returns <code>False</code> if <code>a</code> and{" "}
            <code>b</code> were already in one set.
          </li>
          <li>
            <code>connected(a, b)</code> says whether they are in one set, <code>size(x)</code> is the number of elements in <code>x</code>
            &rsquo;s set, and <code>groups()</code> is the number of sets.
          </li>
        </ul>
        <CodeBlock
          code={`d = DSU(5)
d.union(0, 1)        # True
d.union(1, 0)        # False: already together
d.union(1, 2)        # True
d.connected(0, 2)    # True
d.size(2)            # 3
d.groups()           # 3: {0, 1, 2}, {3}, {4}`}
        />
        <NoRecursion />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 elements and about a million operations. Use union by size or rank, and path compression: every operation should
            cost nearly <M>O(1)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Store one parent for every element, in a list. Which element should a set&rsquo;s representative be, and how does every member reach it?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep <code>parent</code> (each element starts as its own parent), <code>sz</code> (1 for each) and a counter of sets.{" "}
              <code>find</code> goes up through the parents to the root; on the way, point each node at its grandparent (path halving).
            </p>
            <p>
              <code>union</code> finds both roots. If they are the same, return <code>False</code>. Otherwise put the root of the smaller set
              under the other, add the sizes, take 1 from the counter, and return <code>True</code>. <code>size(x)</code> reads the size at{" "}
              <code>find(x)</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`find(x): while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
         return x

union(a, b): ra, rb = find(a), find(b)
    if ra == rb: return False
    if sz[ra] > sz[rb]: swap ra and rb
    parent[ra] = rb; sz[rb] += sz[ra]; sets -= 1
    return True`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The largest group so far",
    fn: "largest_after_each",
    lessons: [2],
    starter: `def largest_after_each(n, pairs):
    # n people, 0 to n - 1. Each pair (a, b) means a and b
    # are now in the same group (and so are their groups).
    # Return the size of the largest group after each pair.
    pass
`,
    statement: (
      <>
        <p>
          There are <code>n</code> people, numbered 0 to <code>n - 1</code>, each in a group of their own. Pairs arrive one at a time; a pair{" "}
          <code>(a, b)</code> joins the group of <code>a</code> and the group of <code>b</code> into one. Return a list with one number per
          pair: the size of the largest group just after that pair.
        </p>
        <CodeBlock
          code={`largest_after_each(5, [(0, 1), (2, 3), (1, 2), (3, 4)])
# [2, 2, 4, 5]`}
        />
        <p>A pair may join people who are already in one group, or a person with themselves; then nothing changes.</p>
        <NoRecursion />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 people and 200,000 pairs. Looking through all the groups after each pair is too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Groups only ever grow. So can the largest group ever get smaller? What is the only group that can become the new largest after a pair?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Use union-find with union by size. Keep the largest size seen so far in a variable. After a union that really joins two groups, the
            only new size is the size of the joined group: compare it with the largest so far. Append the largest after every pair.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`parent = [0, 1, …, n - 1]; size = [1] * n; best = 1; out = []
for a, b in pairs:
    ra, rb = find(a), find(b)
    if ra != rb:
        put the smaller root under the other; add the sizes
        best = max(best, size of the joined root)
    out.append(best)
return out`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The road that closes a loop",
    fn: "first_cycle",
    lessons: [5],
    starter: `def first_cycle(n, roads):
    # places 0 to n - 1; roads arrive in order, each a pair (a, b).
    # Return the position of the first road that joins two places
    # that are already connected, or -1 if there is none.
    pass
`,
    statement: (
      <>
        <p>
          There are <code>n</code> places, numbered 0 to <code>n - 1</code>, and no roads. Roads are built one at a time, in the order of the
          list. A road <code>(a, b)</code> connects <code>a</code> and <code>b</code> in both directions. Return the position in the list of the
          first road that closes a loop: a road between two places that could already reach each other. Return <code>-1</code> if no road does.
        </p>
        <CodeBlock
          code={`first_cycle(4, [(0, 1), (1, 2), (2, 0), (2, 3)])    # 2
first_cycle(4, [(0, 1), (1, 2), (2, 3)])            # -1`}
        />
        <p>
          A road from a place to itself, <code>(a, a)</code>, closes a loop at once. So does a second road between the same two places.
        </p>
        <NoRecursion />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 places and 200,000 roads.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>When does a new road close a loop? Think about what was true of its two ends just before it was built.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            A road closes a loop exactly when its two ends are already in one group. Keep the groups in a union-find. For each road, in order,
            find both roots: if they are equal, return the road&rsquo;s position; otherwise join them. If the loop ends, return -1.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for k, (a, b) in enumerate(roads):
    ra, rb = find(a), find(b)
    if ra == rb: return k
    join ra and rb (smaller under larger)
return -1`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Islands rising",
    fn: "islands_after_each",
    lessons: [5],
    starter: `def islands_after_each(rows, cols, cells):
    # A map of rows x cols, all water at the start.
    # cells: a list of (r, c); each becomes land, in order.
    # Return the number of islands after each one.
    pass
`,
    statement: (
      <>
        <p>
          A map has <code>rows</code> rows and <code>cols</code> columns, and starts as all water. One by one, the cells in <code>cells</code>{" "}
          rise and become land. Land cells that share a side (up, down, left or right) belong to the same island; touching at a corner does not
          count. Return the number of islands after each cell rises.
        </p>
        <CodeBlock
          code={`islands_after_each(3, 3, [(0, 0), (0, 1), (1, 2), (2, 1), (1, 1)])
# [1, 1, 2, 3, 1]`}
        />
        <p>A cell may appear more than once; if it is already land, nothing changes.</p>
        <NoRecursion />
        <h2>Limits</h2>
        <ul>
          <li>The map has up to 100,000 cells, and up to 100,000 cells rise. Counting the islands from scratch after each one is too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>When one cell rises, the count goes up by 1, then down by 1 for each separate island it touches. How do you tell whether two neighbours are on separate islands?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Number cell <code>(r, c)</code> as <code>r * cols + c</code>, and keep a union-find of the land cells only (a dict works well:{" "}
              <code>parent</code> holds a cell once it is land). When a new cell rises, add 1 to the count. Then, for each of its four neighbours
              that is inside the map and already land, union them; every union that returns <code>True</code> takes 1 off the count.
            </p>
            <p>
              Check the row and column of a neighbour, not just its number: <code>r * cols + c + 1</code> is on the next row when{" "}
              <code>c</code> is the last column.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for r, c in cells:
    i = r * cols + c
    if i is not land yet:
        make i land (its own root); count += 1
        for (nr, nc) in the four neighbours:
            if inside the map and land:
                if union(i, nr * cols + nc): count -= 1
    out.append(count)`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Equal and not equal",
    fn: "consistent",
    lessons: [5],
    starter: `def consistent(facts):
    # facts: strings like "a==b" or "a!=b", where a and b are
    # names. Return True if all the facts can be true at once.
    pass
`,
    statement: (
      <>
        <p>
          Each fact says that two names are equal (<code>&quot;a==b&quot;</code>) or not equal (<code>&quot;a!=b&quot;</code>). Equal is
          what you expect: if a equals b and b equals c, then a equals c. Return <code>True</code> if all the facts can hold at the same time,
          and <code>False</code> if they contradict each other.
        </p>
        <CodeBlock
          code={`consistent(["a==b", "b==c", "a!=c"])    # False
consistent(["a==b", "c!=a", "c==d"])    # True
consistent(["x!=x"])                    # False`}
        />
        <p>
          Names are made of the letters a to z and can be longer than one letter, such as <code>&quot;delhi==dilli&quot;</code>. There are no
          spaces.
        </p>
        <NoRecursion />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 facts and about 200,000 different names.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The equal facts split the names into groups. When exactly does a not-equal fact make the whole list impossible?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Go through the facts twice. First, union the two names of every <code>==</code> fact, using a union-find over a dict (lesson 5),
              so names need no numbers. Then check every <code>!=</code> fact: if its two names have the same root, return <code>False</code>.
            </p>
            <p>Checking the != facts as you meet them is wrong: an equal fact later in the list can still join their names.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`parent = {}
find(x): parent.setdefault(x, x); go up with halving; return root
for f in facts:
    if "==" in f: a, b = f.split("=="); union(a, b)
for f in facts:
    if "!=" in f: a, b = f.split("!=")
        if find(a) == find(b): return False
return True`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
