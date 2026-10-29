import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const CORR_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Is the timetable in order?",
    fn: "is_sorted",
    lessons: [1],
    starter: `def is_sorted(times):
    # Return True if each time is at most the next one.
    pass
`,
    statement: (
      <>
        <p>
          A timetable lists departure times as whole numbers, such as <code>905</code> for 9:05. Return <code>True</code> if the times are in order:
          each time is at most the time after it. Otherwise return <code>False</code>.
        </p>
        <CodeBlock
          code={`is_sorted([905, 1010, 1130])    # True
is_sorted([905, 1130, 1010])    # False
is_sorted([905, 905, 1010])     # True: equal times are fine
is_sorted([])                   # True`}
        />
        <p>
          Before you code, write the spec for yourself, as in lesson 1. What should happen for an empty list, or a list with one time? Both are
          in order, because no pair of times is out of order.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 500,000 times.</li>
          <li>Do not change <code>times</code>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A list is in order exactly when every pair of neighbours is in order. How many neighbouring pairs does a list of n values have?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Look at each pair <code>times[i - 1]</code>, <code>times[i]</code> for <code>i</code> from 1 to <code>len(times) - 1</code>. If one pair has
            the bigger value first, return <code>False</code> at once. If the loop finishes, every pair was fine, so return <code>True</code>. An empty
            list or a single time has no pairs, so the loop does nothing and the answer is <code>True</code>.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for i from 1 to len(times) - 1:
    if times[i - 1] > times[i]: return False
return True`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The second fastest train",
    fn: "second_largest",
    lessons: [1, 2],
    starter: `def second_largest(speeds):
    # Return the second largest different speed,
    # or None if there are fewer than two different speeds.
    pass
`,
    statement: (
      <>
        <p>
          The list <code>speeds</code> holds the top speed of each train. Return the second largest <strong>different</strong> speed. Equal values
          count as one speed. If there are fewer than two different speeds, return <code>None</code>.
        </p>
        <CodeBlock
          code={`second_largest([110, 130, 90, 120])   # 120
second_largest([130, 110, 130])       # 110: 130 counts once
second_largest([100, 100])            # None
second_largest([75])                  # None`}
        />
        <p>
          Solve it in one pass, as in lesson 2. Keep two names, the best and the second best seen so far. Write down the invariant they keep,
          then check that every step keeps it.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000,000 speeds. The list has at least one speed.</li>
          <li>Speeds can be negative. Do not sort or change <code>speeds</code>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Write the invariant first: &ldquo;<code>first</code> is the largest value seen so far, and <code>second</code> is the largest value seen so far
            that is smaller than <code>first</code>, or <code>None</code>.&rdquo; Now ask what each new value can do to that statement.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>A new value <code>x</code> falls into one of three cases:</p>
            <ul>
              <li>
                <code>x &gt; first</code>: the old <code>first</code> becomes the second best, and <code>x</code> becomes the best.
              </li>
              <li>
                <code>x == first</code>: nothing changes. It is the same speed.
              </li>
              <li>
                <code>x &lt; first</code>: if <code>second</code> is <code>None</code> or <code>x &gt; second</code>, then <code>x</code> is the new second best.
              </li>
            </ul>
            <p>
              Start with <code>first = speeds[0]</code> and <code>second = None</code>. Do not start either at 0, or negative speeds go wrong.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`first = speeds[0]
second = None
for x in speeds[1:]:
    if x > first:
        second = first
        first = x
    else if x < first and (second is None or x > second):
        second = x
return second`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Three classes of coach",
    fn: "sort_coaches",
    lessons: [2],
    blocked: ["sorted"],
    starter: `def sort_coaches(coaches):
    # Each coach is 0, 1 or 2. Rearrange the list itself
    # so that all 0s come first, then 1s, then 2s.
    # Return nothing.
    pass
`,
    statement: (
      <>
        <p>
          A train has coaches of three classes, written as 0, 1 and 2. Rearrange the list <code>coaches</code> <strong>in place</strong> so that every 0
          comes first, then every 1, then every 2. &ldquo;In place&rdquo; means you change the list you were given, by swapping values inside it.
          You do not build a new list.
        </p>
        <CodeBlock
          code={`c = [2, 0, 1, 2, 0]
sort_coaches(c)
c    # [0, 0, 1, 2, 2]`}
        />
        <p>
          <code>sorted</code> and <code>.sort()</code> are switched off for this problem. Use one pass and three positions in the list. The point is
          the invariant: write down what is true of each part of the list at the start of every pass.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 300,000 coaches. Each value is 0, 1 or 2.</li>
          <li>The tests read the list after your function returns.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Split the list into four parts: the 0s found so far, the 1s found so far, the coaches not yet looked at, and the 2s found so far. Where
            does each part start and end?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep three positions: <code>lo</code>, <code>i</code> and <code>hi</code>. The invariant is: <code>coaches[0..lo-1]</code> are 0s,{" "}
              <code>coaches[lo..i-1]</code> are 1s, <code>coaches[i..hi]</code> are not looked at yet, and <code>coaches[hi+1..]</code> are 2s.
            </p>
            <p>
              Look at <code>coaches[i]</code>. A 0 is swapped to position <code>lo</code>, and both <code>lo</code> and <code>i</code> move on. A 1 stays, and{" "}
              <code>i</code> moves on. A 2 is swapped to position <code>hi</code>, and only <code>hi</code> moves back. Do not move <code>i</code> here: the
              value that came from <code>hi</code> has not been looked at yet.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo = 0; i = 0; hi = len(coaches) - 1
while i <= hi:
    if coaches[i] == 0:
        swap coaches[lo] and coaches[i]; lo += 1; i += 1
    else if coaches[i] == 1:
        i += 1
    else:
        swap coaches[i] and coaches[hi]; hi -= 1`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Break these functions",
    fn: "counterexample",
    lessons: [4, 5],
    starter: `def counterexample(which):
    # Return an input list that makes function number
    # 'which' (1, 2, 3 or 4) give the wrong answer.
    if which == 1:
        return []
    if which == 2:
        return []
    if which == 3:
        return []
    if which == 4:
        return []
`,
    statement: (
      <>
        <p>
          Each function below has a bug. For each one, find an input list that makes it give the wrong answer. This is a counterexample, as in
          lesson 4. Write <code>counterexample(which)</code> so that it returns your list for function number <code>which</code>.
        </p>
        <CodeBlock
          code={`# 1. Should return how many times the list goes up
#    from one value to the next.
def count_rises(a):
    count = 0
    for i in range(1, len(a) - 1):
        if a[i] > a[i - 1]:
            count += 1
    return count

# 2. Should return True if the list is in order.
def is_sorted(a):
    return len(a) == 0 or a[0] <= a[-1]

# 3. Should return the index of the first place where
#    the largest value appears (the list is not empty).
def first_max_index(a):
    best = 0
    for i in range(len(a)):
        if a[i] >= a[best]:
            best = i
    return best

# 4. Should return the second largest different value
#    (the list has at least two different values).
def second_best(a):
    return sorted(a)[-2]`}
        />
        <p>
          Your list must meet each function&rsquo;s input condition. Use only whole numbers. For functions 2 and 3, the list must not be empty, and
          for function 4 it must hold at least two different values. The tests run the correct version beside the buggy one and check that the
          answers differ.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Return a list (not a tuple) for each of the four.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            For each function, find the one thing it assumes that is not always true. Then build the smallest input that breaks that assumption.
            Lesson 4 lists the inputs to try first: negative numbers, repeats, values at the ends and values in the middle.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <ul>
            <li>1 stops one pair early. It is wrong when the last value is bigger than the one before it.</li>
            <li>2 checks only the two ends. It is wrong when the ends are in order but a middle pair is not.</li>
            <li>3 moves on when a value is equal to the best, not only bigger. It is wrong when the largest value appears twice.</li>
            <li>4 does not remove repeats. It is wrong when the largest value appears twice.</li>
          </ul>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`1: a rise at the very end, such as [1, 2]
2: ends in order, middle not, such as [1, 3, 2, 4]
3: the largest value twice, such as [5, 5]
4: the largest twice, plus a smaller value, such as [5, 5, 3]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The best stretch of line",
    fn: "best_stretch",
    lessons: [2, 3],
    starter: `def best_stretch(a):
    # Return the largest sum of a run of neighbouring values
    # (at least one value).
    pass
`,
    statement: (
      <>
        <p>
          A line is split into sections. The list <code>a</code> holds the minutes each section gains (a positive number) or loses (a negative number)
          against the timetable. A <em>stretch</em> is a run of one or more neighbouring sections. Return the largest total of any stretch.
        </p>
        <CodeBlock
          code={`best_stretch([2, -5, 3, 4, -1, 2, -6, 1])
# 8, from the stretch 3, 4, -1, 2
best_stretch([-4, -2, -7])
# -2: a stretch has at least one value`}
        />
        <p>
          The fast answer uses one pass. To trust it, you need a proof. Lesson 3&rsquo;s induction gives one: assume you know the best stretch that
          ends at section <code>i - 1</code>, and show how to get the best stretch that ends at section <code>i</code>.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 values. The list has at least one value.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Every stretch ends somewhere. Let <code>cur</code> be the best total of a stretch that ends exactly at the current section. How does{" "}
            <code>cur</code> for section <code>i</code> depend on <code>cur</code> for section <code>i - 1</code>?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              A stretch ending at section <code>i</code> is either section <code>i</code> alone, or a stretch ending at <code>i - 1</code> with section{" "}
              <code>i</code> added. The best of the second kind uses the best stretch ending at <code>i - 1</code>. So{" "}
              <code>cur = max(a[i], cur + a[i])</code>.
            </p>
            <p>
              Keep a second name, <code>best</code>, for the largest <code>cur</code> seen so far. Start both at <code>a[0]</code>, not at 0.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`best = cur = a[0]
for x in a[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)
return best`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
