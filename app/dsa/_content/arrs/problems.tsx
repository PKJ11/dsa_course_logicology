import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const ARRS_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Two timings that match",
    fn: "pair_with_sum",
    lessons: [2],
    starter: `def pair_with_sum(a, target):
    # a is sorted, and its values are all different.
    # Return [i, j] (i < j) with a[i] + a[j] == target and
    # the smallest possible i, or [] if there is no pair.
    pass
`,
    statement: (
      <>
        <p>
          The list <code>a</code> holds journey times in minutes, sorted from shortest to longest, with no two the same. Find two journeys that
          together take exactly <code>target</code> minutes. Return their indices as <code>[i, j]</code> with <code>i &lt; j</code>. If several pairs
          work, return the one with the <strong>smallest</strong> <code>i</code>. If none works, return <code>[]</code>.
        </p>
        <CodeBlock
          code={`pair_with_sum([2, 5, 8, 12, 16, 23, 38, 45], 31)
# [2, 5]: 8 + 23
pair_with_sum([1, 2, 3, 4, 5, 6], 7)
# [0, 5], not [1, 4] or [2, 3]
pair_with_sum([1, 4, 9], 8)    # []`}
        />
        <p>Use the sorted order. The aim is O(n) time and O(1) extra space.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 values. Values may be negative.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Look at the smallest and the largest value. If their sum is too big, can the largest value be part of any pair?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Put <code>lo</code> at the start and <code>hi</code> at the end. If the sum is too big, move <code>hi</code> left. If it is too small,
              move <code>lo</code> right. Lesson 2 proves this never skips a pair.
            </p>
            <p>
              Why is the first pair found the one with the smallest <code>i</code>? <code>lo</code> only moves past a value when that value cannot be
              in any pair. So <code>lo</code> never passes the smallest <code>i</code> that works.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo = 0; hi = len(a) - 1
while lo < hi:
    s = a[lo] + a[hi]
    if s == target: return [lo, hi]
    if s > target: hi -= 1
    else: lo += 1
return []`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The longest run of different codes",
    fn: "longest_unique",
    lessons: [3, 6],
    starter: `def longest_unique(s):
    # Return the length of the longest run of neighbouring
    # characters in s with no character repeated.
    pass
`,
    statement: (
      <>
        <p>
          A signal log is a string <code>s</code>, one character per train. Return the length of the longest run of <strong>neighbouring</strong>{" "}
          characters in which no character appears twice.
        </p>
        <CodeBlock
          code={`longest_unique("abcabcbb")   # 3: "abc"
longest_unique("pwwkew")     # 3: "wke"
longest_unique("bbbbb")      # 1
longest_unique("")           # 0`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 characters, of any kind.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Use a window <code>s[lo..hi]</code> with no repeats. Move <code>hi</code> one place each pass. When the new character is already in the window, where must <code>lo</code> go?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a dictionary <code>last</code> from each character to the index where you last saw it. When <code>s[hi]</code> was last seen at an
              index inside the window, the window must start just after that index.
            </p>
            <p>
              Careful: an old index from before the window does not count. So move <code>lo</code> only forwards:{" "}
              <code>lo = max(lo, last[ch] + 1)</code>. The string <code>&quot;abba&quot;</code> shows why.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`last = {}; lo = 0; best = 0
for hi, ch in enumerate(s):
    if ch in last and last[ch] >= lo:
        lo = last[ch] + 1
    last[ch] = hi
    best = max(best, hi - lo + 1)
return best`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Passengers on each section",
    fn: "section_loads",
    lessons: [4],
    starter: `def section_loads(n, trips):
    # Sections are numbered 0 to n - 1.
    # Each trip [l, r, k] puts k passengers on
    # every section from l to r (both included).
    # Return a list of the total on each section.
    pass
`,
    statement: (
      <>
        <p>
          A line has <code>n</code> sections, numbered 0 to <code>n - 1</code>. Each trip <code>[l, r, k]</code> is a group of <code>k</code> passengers
          who ride every section from <code>l</code> to <code>r</code>, both included. Return a list of <code>n</code> numbers: the total number of
          passengers on each section.
        </p>
        <CodeBlock
          code={`section_loads(6, [[1, 3, 4], [2, 5, 2], [0, 1, 1]])
# [1, 5, 6, 6, 2, 2]
section_loads(4, [])     # [0, 0, 0, 0]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> and the number of trips are each up to 200,000. A single trip can cover the whole line.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A trip changes the count only at two places: where it starts, and just after it ends. Everything in between is &ldquo;the same as the section before&rdquo;.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Use a difference list <code>d</code> of length <code>n + 1</code>. For each trip, add <code>k</code> at <code>d[l]</code> and take away{" "}
            <code>k</code> at <code>d[r + 1]</code>. Then go along <code>d</code> keeping a running total. The total after position <code>i</code> is the
            load on section <code>i</code>.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`d = [0] * (n + 1)
for l, r, k in trips:
    d[l] += k
    d[r + 1] -= k
running total of d[0..n-1] is the answer`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The spiral timetable",
    fn: "spiral",
    lessons: [5],
    starter: `def spiral(grid):
    # Return the values of grid in spiral order:
    # along the top, down the right, back along the bottom,
    # up the left, then the next ring in.
    pass
`,
    statement: (
      <>
        <p>
          A timetable board is a grid: a list of rows, all the same length. Return a list of its values in <strong>spiral</strong> order, going
          clockwise from the top-left corner: along the top row, down the right column, back along the bottom row, up the left column, and then
          the same for the next ring in. Do not change <code>grid</code>.
        </p>
        <CodeBlock
          code={`spiral([[1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]])        # [1, 2, 3, 6, 9, 8, 7, 4, 5]
spiral([[1, 2, 3, 4]])     # [1, 2, 3, 4]
spiral([])                 # []`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 500 rows and 500 columns. The grid need not be square.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Keep four limits: the first and last row, and the first and last column, that are not finished yet. After each side, one limit moves in.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Loop while <code>top &lt;= bottom</code> and <code>left &lt;= right</code>. Walk the top row, then move <code>top</code> down. Walk the right
            column, then move <code>right</code> left. Before walking the bottom row, check <code>top &lt;= bottom</code> again; before walking the left
            column, check <code>left &lt;= right</code> again. Without those checks, a single middle row or column is walked twice.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`top, bottom, left, right = 0, R - 1, 0, C - 1
while top <= bottom and left <= right:
    top row, left to right;      top += 1
    right column, downwards;     right -= 1
    if top <= bottom: bottom row, right to left;  bottom -= 1
    if left <= right: left column, upwards;       left += 1`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Nearly a palindrome",
    fn: "almost_palindrome",
    lessons: [2, 6],
    starter: `def almost_palindrome(s):
    # Return True if s reads the same backwards
    # after deleting at most one character.
    pass
`,
    statement: (
      <>
        <p>
          A station name is written as a string <code>s</code> of lower-case letters. Return <code>True</code> if it reads the same forwards and
          backwards after you delete <strong>at most one</strong> character. Deleting nothing is allowed.
        </p>
        <CodeBlock
          code={`almost_palindrome("abca")      # True: delete "b" (or "c")
almost_palindrome("racecar")   # True: nothing to delete
almost_palindrome("abcda")     # False: needs two deletions`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 letters.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Compare from both ends, as in lesson 6. While the ends match, no deletion is needed there. What choices do you have at the first mismatch?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            At the first mismatch, <code>s[lo] != s[hi]</code>, one of these two characters must go. So the answer is <code>True</code> exactly when{" "}
            <code>s[lo+1..hi]</code> or <code>s[lo..hi-1]</code> is a plain palindrome. Check each one with two pointers. You only ever try these two,
            so the whole job is <code>O(n)</code>. Avoid slices like <code>s[lo+1:hi+1][::-1]</code> if you can: they copy.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def pal(lo, hi): two pointers on s[lo..hi], no deletions

lo = 0; hi = len(s) - 1
while lo < hi:
    if s[lo] != s[hi]:
        return pal(lo + 1, hi) or pal(lo, hi - 1)
    lo += 1; hi -= 1
return True`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
