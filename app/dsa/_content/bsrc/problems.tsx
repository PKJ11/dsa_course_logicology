import { CodeBlock } from "../../_components/Code";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

import type { Problem } from "../types";

export type { Hint, Problem, TestCase } from "../types";

const COUNTING = (
  <p>
    In the large tests, the list counts every value you read from it. A binary search stays well under the limit. Anything that goes
    through the whole list goes over it. This includes <code>in</code>, <code>.index()</code>, <code>list(…)</code>, <code>sorted(…)</code> and
    slicing.
  </p>
);

export const BSRC_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Find the platform",
    fn: "search",
    lessons: [1, 2],
    starter: `def search(platforms, target):
    # platforms is sorted from smallest to largest, with no repeats.
    # Return the index of target, or -1 if it is not there.
    pass
`,
    statement: (
      <>
        <p>
          A station lists its platform numbers from smallest to largest, with no repeats. You are given this list, <code>platforms</code>, and a
          platform number, <code>target</code>. Return the index where <code>target</code> is in the list. If it is not in the list, return{" "}
          <code>-1</code>.
        </p>
        <CodeBlock
          code={`search([3, 7, 11, 14, 19], 14)   # 3
search([3, 7, 11, 14, 19], 12)   # -1
search([], 5)                    # -1`}
        />
        {COUNTING}
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000,000 platforms. At most 25 reads on the large tests.</li>
          <li>The list may be empty.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            If you read the value in the middle of the list, you know which half the target cannot be in. Use two indices, <code>lo</code> and{" "}
            <code>hi</code>, to mark the part of the list where the target could still be.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Start with <code>lo = 0</code> and <code>hi = len(platforms) - 1</code>, and loop while <code>lo &lt;= hi</code>. Compare{" "}
              <code>platforms[mid]</code> with the target:
            </p>
            <ul>
              <li>If they are equal, return <code>mid</code>.</li>
              <li>If <code>platforms[mid]</code> is smaller, the target is to the right of <code>mid</code>.</li>
              <li>If it is bigger, the target is to the left of <code>mid</code>.</li>
            </ul>
            <p>
              In both of the last two cases, <code>mid</code> itself is ruled out. If the loop ends without returning, the window is empty, so the
              target is not in the list.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if platforms[mid] == target: return mid
    if platforms[mid] < target: lo = mid + 1
    else: hi = mid - 1
return -1`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "First and last train",
    fn: "first_and_last",
    lessons: [3],
    starter: `def first_and_last(times, t):
    # times is sorted (the same value may repeat).
    # Return [first index of t, last index of t], or [-1, -1].
    pass
`,
    statement: (
      <>
        <p>
          A timetable lists departure times from earliest to latest. Several trains can leave at the same time, so a time can appear more than
          once. You are given the list <code>times</code> and a time <code>t</code>. Return a list <code>[first, last]</code>: the first index and the
          last index where <code>t</code> appears. If <code>t</code> is not in the list, return <code>[-1, -1]</code>.
        </p>
        <CodeBlock
          code={`first_and_last([2, 4, 4, 7, 7, 7, 7, 9, 12], 7)   # [3, 6]
first_and_last([1, 3, 5, 8], 5)                  # [2, 2]
first_and_last([1, 3, 5, 8], 4)                  # [-1, -1]`}
        />
        <p>Your search must stay fast even when <code>t</code> appears half a million times.</p>
        {COUNTING}
        <h2>Limits</h2>
        <ul>
          <li>Up to about 600,000 times. At most 60 reads on the large tests.</li>
          <li>Return a list of two integers.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Don&rsquo;t search for <code>t</code> itself. Instead, ask a yes-or-no question about each index, and search for the point where the
            answer changes from F to T. Which question changes exactly at the first copy of <code>t</code>?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The first copy is the first index where <code>times[i] &gt;= t</code>. The index just after the last copy is the first index where{" "}
              <code>times[i] &gt; t</code>. Write one search for the first T, using a half-open window with <code>hi = len(times)</code>. Then run it
              with each of the two questions.
            </p>
            <p>
              The first search always returns an index, even when <code>t</code> is not in the list. So check that the index is inside the list and
              that the value there is <code>t</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def first_true(ok):                # ok(i) goes F..F T..T
    lo, hi = 0, len(times)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else: lo = mid + 1
    return lo

first = first_true(lambda i: times[i] >= t)
if first == len(times) or times[first] != t: return [-1, -1]
last = first_true(lambda i: times[i] > t) - 1
return [first, last]`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Parcel van capacity",
    fn: "min_capacity",
    lessons: [4],
    starter: `def min_capacity(parcels, days):
    # parcels must leave in this order; one van trip per day.
    # Return the smallest capacity that sends everything within days.
    pass
`,
    statement: (
      <>
        <p>
          A parcel office must send a row of parcels, with weights <code>parcels</code>, in the order they were booked. One van leaves each day.
          It carries the next few parcels in the row, as long as their total weight is not more than its capacity. Parcels cannot be split, and
          their order cannot change.
        </p>
        <p>
          Return the smallest whole-number capacity that sends every parcel within <code>days</code> days.
        </p>
        <CodeBlock
          code={`min_capacity([3, 2, 2, 4, 1, 4], 3)   # 6: [3, 2], [2, 4], [1, 4]
min_capacity([5, 1, 4], 1)            # 10
min_capacity([1, 9, 1, 9, 1], 2)      # 11: [1, 9, 1], [9, 1]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>1 to 50,000 parcels, each weighing from 1 to 500,000.</li>
          <li><code>days</code> is at least 1. The large tests must finish within a few seconds.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            It is hard to find the best capacity directly. But it is easy to check whether one given capacity is enough. And if a capacity is
            enough, every bigger capacity is enough too.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write <code>days_needed(cap)</code>. It fills each day&rsquo;s van as full as possible and counts the days. Then use binary search on the
              capacity. The smallest possible answer is <code>max(parcels)</code>, and <code>sum(parcels)</code> always works.
            </p>
            <p>
              This is a search for the first T. The question is <code>days_needed(mid) &lt;= days</code>. When <code>mid</code> works, keep it.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo, hi = max(parcels), sum(parcels)
while lo < hi:
    mid = (lo + hi) // 2
    if days_needed(mid) <= days: hi = mid
    else: lo = mid + 1
return lo`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Integer square root",
    fn: "isqrt",
    lessons: [5, 6],
    blocked: ["math.isqrt"],
    starter: `def isqrt(n):
    # Return the largest whole number r with r * r <= n.
    pass
`,
    statement: (
      <>
        <p>
          You are given a whole number <code>n</code>, which is 0 or more. Return the largest whole number <code>r</code> with{" "}
          <code>r * r &lt;= n</code>. This is the square root of <code>n</code>, rounded down. Your answer must be exact, even for numbers much
          bigger than a float can store.
        </p>
        <CodeBlock
          code={`isqrt(16)          # 4
isqrt(17)          # 4
isqrt(10**30 - 1)  # 999999999999999`}
        />
        <p>
          <code>math.isqrt</code> is switched off for this problem. Build it yourself with binary search.
        </p>
        <h2>Limits</h2>
        <ul>
          <li><code>n</code> is 0 or more, with up to about 41 digits.</li>
          <li>Return an <code>int</code>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            The question &ldquo;is <code>r * r &lt;= n</code>?&rdquo; is true for small <code>r</code> and false for big <code>r</code>. You want the last{" "}
            <code>r</code> where it is true. Python integers are exact at any size, so do not use floats.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Search the range <code>[0, n]</code>. When <code>mid * mid &lt;= n</code>, <code>mid</code> might be the answer, so keep it with{" "}
              <code>lo = mid</code>. Otherwise, set <code>hi = mid - 1</code>.
            </p>
            <p>
              Because <code>lo</code> keeps <code>mid</code>, make <code>mid</code> round up: <code>(lo + hi + 1) // 2</code>. If it rounds down, the loop
              gets stuck when two values are left (see lesson 6).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo, hi = 0, n
while lo < hi:
    mid = (lo + hi + 1) // 2
    if mid * mid <= n: lo = mid
    else: hi = mid - 1
return lo`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The rotated timetable",
    fn: "search_rotated",
    lessons: [2, 6],
    starter: `def search_rotated(a, target):
    # a was sorted with no repeats, then rotated.
    # Return the index of target, or -1.
    pass
`,
    statement: (
      <>
        <p>
          The stop numbers of a circular route were stored from smallest to largest, with no repeats. Then the list was rotated: some values from
          the start were moved to the end. For example, <code>[3, 5, 9, 12, 15, 18, 22]</code> might become <code>[15, 18, 22, 3, 5, 9, 12]</code>.
          You are not told where the rotation happened. Return the index of <code>target</code>, or <code>-1</code> if it is not in the list.
        </p>
        <CodeBlock
          code={`search_rotated([15, 18, 22, 3, 5, 9, 12], 5)    # 4
search_rotated([15, 18, 22, 3, 5, 9, 12], 13)   # -1
search_rotated([1, 2, 3, 4, 5], 4)              # 3 (not rotated)`}
        />
        {COUNTING}
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000,000 values, all different. At most 80 reads on the large tests.</li>
          <li>The list may not be rotated at all, and it may be empty.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Split the window at <code>mid</code>. The list has at most one place where the values drop. So at least one of the two halves has no
            drop in it, which means it is sorted. Which half is it? Compare the values at its two ends.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Use a closed window, <code>[lo, hi]</code>. If <code>a[mid]</code> is the target, return <code>mid</code>. Otherwise:
            </p>
            <ul>
              <li>
                If <code>a[lo] &lt;= a[mid]</code>, the left half is sorted. If <code>a[lo] &lt;= target &lt; a[mid]</code>, search the left half.
                Otherwise, search the right half.
              </li>
              <li>
                If not, the right half is sorted. If <code>a[mid] &lt; target &lt;= a[hi]</code>, search the right half. Otherwise, search the left
                half.
              </li>
            </ul>
            <p>The invariant is the same as in lesson 2: if the target is in the list, it is inside <code>a[lo..hi]</code>.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target: return mid
    if a[lo] <= a[mid]:                 # left half sorted
        if a[lo] <= target < a[mid]: hi = mid - 1
        else: lo = mid + 1
    else:                               # right half sorted
        if a[mid] < target <= a[hi]: lo = mid + 1
        else: hi = mid - 1
return -1`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
