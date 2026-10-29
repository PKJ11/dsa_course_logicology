import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

export const SORT_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Nearly in order",
    fn: "insertion_sort",
    lessons: [1],
    blocked: ["sorted"],
    starter: `def insertion_sort(a):
    # Sort the list a in place, smallest first.
    # Return nothing.
    pass
`,
    statement: (
      <>
        <p>
          Write insertion sort. Sort the list <code>a</code> <strong>in place</strong>: change the list you were given, and return nothing.
        </p>
        <CodeBlock
          code={`a = [29, 10, 14, 37, 13, 5, 21]
insertion_sort(a)
a    # [5, 10, 13, 14, 21, 29, 37]`}
        />
        <p>
          One test is a list of 100,000 values that is nearly in order: no value is more than 3 places from where it belongs. Lesson 1 explains
          why insertion sort is fast there and selection sort is not. <code>sorted()</code> and <code>.sort()</code> are switched off.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 2,000 values in any order, or up to 100,000 values that are nearly in order.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Keep the left part sorted. Take the next value and move it left, past every bigger value, until it meets a value that is not bigger.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            For each <code>i</code> from 1 on, save <code>key = a[i]</code>. Walk <code>j</code> left from <code>i - 1</code>, moving each value bigger
            than <code>key</code> one place right. Stop at the first value that is not bigger, or at the front. Write <code>key</code> into the gap at{" "}
            <code>j + 1</code>. Stopping early is what makes nearly sorted input fast.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for i from 1 to len(a) - 1:
    key = a[i]; j = i - 1
    while j >= 0 and a[j] > key:
        a[j + 1] = a[j]; j -= 1
    a[j + 1] = key`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Merge sort",
    fn: "merge_sort",
    lessons: [2],
    blocked: ["sorted"],
    starter: `def merge_sort(a):
    # Return a new list with the values of a, sorted.
    pass
`,
    statement: (
      <>
        <p>
          Write merge sort. Return a <strong>new</strong> sorted list, and leave <code>a</code> unchanged. <code>sorted()</code> and{" "}
          <code>.sort()</code> are switched off.
        </p>
        <CodeBlock
          code={`merge_sort([38, 27, 43, 3, 9, 82, 10, 15])
# [3, 9, 10, 15, 27, 38, 43, 82]
merge_sort([])    # []`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 whole numbers, in any order.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Two parts: a <code>merge</code> of two sorted lists, and a recursive function that splits, sorts each half, and merges.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Base case: a list of 0 or 1 values; return a copy. Otherwise split at <code>mid = len(a) // 2</code>, sort both halves, and merge them with
            two indexes <code>i</code> and <code>j</code>. Take the smaller front value each time, using <code>&lt;=</code> so ties take the left one.
            When one list runs out, add the rest of the other. Do not use <code>pop(0)</code>: it is O(n) each time.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if len(a) <= 1: return a copy of a
left = merge_sort(a[:mid]); right = merge_sort(a[mid:])
i = j = 0; out = []
while both have values left:
    take the smaller of left[i], right[j] (left on a tie)
add the rest of left and right to out
return out`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "How far out of order",
    fn: "count_inversions",
    lessons: [2],
    starter: `def count_inversions(a):
    # Count pairs i < j with a[i] > a[j].
    pass
`,
    statement: (
      <>
        <p>
          A timetable lists trains in the order they are booked to leave. The list <code>a</code> holds the order in which they really left. Count
          how far out of order it is: the number of <em>inversions</em>, pairs of positions <code>i &lt; j</code> with <code>a[i] &gt; a[j]</code>.
        </p>
        <CodeBlock
          code={`count_inversions([2, 4, 1, 3, 5])
# 3: (2, 1), (4, 1), (4, 3)
count_inversions([5, 4, 3, 2, 1])    # 10
count_inversions([2, 2, 1])
# 2: equal values are not out of order`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 values. The answer can be up to about 5 billion; Python&rsquo;s whole numbers handle that.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Checking every pair is too slow. Merge sort compares values from the left half with values from the right half. Can it count the pairs that are out of order as it goes?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Every inversion is inside the left half, inside the right half, or across the two. Count the first two recursively. For the third, merge:
            when you take <code>right[j]</code> while <code>left[i]</code> is still waiting, <code>right[j]</code> is smaller than <code>left[i]</code> and
            every later value of <code>left</code>. That is <code>len(left) - i</code> inversions at once. Take from the left on ties, so equal values
            are not counted.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`def go(a): return (sorted copy of a, inversions in a)
    if len(a) <= 1: return (a copy, 0)
    left, x = go(a[:mid]); right, y = go(a[mid:])
    merge them; each time right[j] is taken:
        count += len(left) - i
    return (merged, x + y + count)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The k-th fastest",
    fn: "kth_smallest",
    lessons: [3, 8],
    blocked: ["sorted", "heapq"],
    starter: `def kth_smallest(a, k):
    # Return the value that would be at index k
    # if a were sorted. Do not change a.
    pass
`,
    statement: (
      <>
        <p>
          The list <code>a</code> holds journey times. Return the value that would be at index <code>k</code> (counting from 0) if the list were
          sorted. Do not change <code>a</code>. <code>sorted()</code>, <code>.sort()</code> and <code>heapq</code> are switched off.
        </p>
        <CodeBlock
          code={`kth_smallest([29, 10, 14, 37, 13, 5, 33, 18, 21], 4)   # 18
kth_smallest([4, 9, 1, 7], 0)                          # 1`}
        />
        <p>The tests include a list that is already sorted and a list where every value is the same.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 500,000 values. <code>k</code> is at least 0 and less than <code>len(a)</code>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Partition around a pivot. The pivot&rsquo;s final position tells you which side holds index k. Keep only that side.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Pick the pivot at random, with <code>random.choice</code>. Then split the values into three lists: less than, equal to, and greater than
              the pivot. If <code>k</code> falls in the &ldquo;less&rdquo; part, repeat there. If it falls in the &ldquo;equal&rdquo; part, the pivot is the
              answer. Otherwise repeat in the &ldquo;greater&rdquo; part, with <code>k</code> reduced by the sizes of the other two.
            </p>
            <p>The equal part is what handles a list of identical values. The random pivot is what handles a sorted list.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`loop:
    p = random value of a
    less = [x < p]; equal = [x == p]; more = [x > p]
    if k < len(less): a = less
    else if k < len(less) + len(equal): return p
    else: k -= len(less) + len(equal); a = more`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Passenger ages",
    fn: "sort_ages",
    lessons: [6],
    blocked: ["sorted"],
    starter: `def sort_ages(ages):
    # Every age is a whole number from 0 to 150.
    # Return a new list of the ages, sorted.
    pass
`,
    statement: (
      <>
        <p>
          A count of all passengers lists each one&rsquo;s age, a whole number from 0 to 150. Return a new list of the ages in order, smallest first.
          <code> sorted()</code> and <code>.sort()</code> are switched off, and a comparison sort in Python is too slow for one and a half million ages.
        </p>
        <CodeBlock
          code={`sort_ages([34, 7, 61, 7, 0, 34, 150])
# [0, 7, 7, 34, 34, 61, 150]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,500,034 ages.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>There are only 151 possible ages. Instead of comparing ages, count how many passengers have each age.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Make <code>count = [0] * 151</code>. One pass adds 1 to <code>count[x]</code> for each age. Then, for each age <code>v</code> from 0 to 150,
            add <code>count[v]</code> copies of <code>v</code> to the answer. <code>out.extend([v] * count[v])</code> does that quickly.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`count = [0] * 151
for x in ages: count[x] += 1
out = []
for v from 0 to 150: add count[v] copies of v to out
return out`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "The departure board",
    fn: "arrange_board",
    lessons: [7],
    starter: `def arrange_board(trains):
    # trains: a list of [name, platform, time],
    # with time as "HH:MM". Return the names in board order.
    pass
`,
    statement: (
      <>
        <p>
          Each train is a list <code>[name, platform, time]</code>, where <code>time</code> is a string like <code>&quot;09:05&quot;</code>. Return the
          names in the order the board shows them:
        </p>
        <ul>
          <li>by platform, lowest first;</li>
          <li>on the same platform, the <strong>latest</strong> time first;</li>
          <li>trains with the same platform and time stay in their input order.</li>
        </ul>
        <CodeBlock
          code={`arrange_board([["Rajdhani", 3, "16:55"],
               ["Shatabdi", 1, "06:00"],
               ["Duronto", 3, "23:10"],
               ["Garib Rath", 1, "17:40"],
               ["Mail", 2, "09:15"]])
# ["Garib Rath", "Shatabdi", "Mail",
#  "Duronto", "Rajdhani"]`}
        />
        <p>
          You may use <code>sorted()</code> here. The point is to use its stability and its <code>key=</code> well. Do not change{" "}
          <code>trains</code>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 trains.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>One field goes up and the other goes down, and a time string cannot be negated. Lesson 7 shows how two stable sorts solve this.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Sort by the less important field first, then by the more important one. First sort by time with <code>reverse=True</code>. Python keeps
            equal items in order even with <code>reverse=True</code>. Then sort that result by platform. The second sort is stable, so within each
            platform the time order stays. Finally, take the names.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`by_time = sorted(trains, key=time, reverse=True)
board = sorted(by_time, key=platform)
return [name of each train in board]`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
