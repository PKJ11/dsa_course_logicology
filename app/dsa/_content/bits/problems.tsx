import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const BITS_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Wrap to w bits",
    fn: "wrap",
    lessons: [1],
    starter: `def wrap(x, w):
    # Return the number a w-bit machine stores
    # for x, read as two's complement.
    pass
`,
    statement: (
      <>
        <p>
          A machine that stores whole numbers in <code>w</code> bits keeps only the lowest <code>w</code> bits of a result, and reads them as
          two&rsquo;s complement: the top place (place <code>w - 1</code>) is worth minus 2 to the power <code>w - 1</code>. Return the number
          it ends up with for the whole number <code>x</code>.
        </p>
        <CodeBlock
          code={`wrap(200, 8)        # -56: 11001000 is -128 + 72
wrap(127, 8)        # 127
wrap(261, 8)        # 5: only the lowest 8 bits stay
wrap(-129, 8)       # 127
wrap(2 ** 31, 32)   # -2147483648`}
        />
        <p>
          <code>x</code> may be negative. Python&rsquo;s bit operators treat a negative number as two&rsquo;s complement with endless 1s on the
          left (lesson 1), so masks work on it directly.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            <code>w</code> is from 1 to 200. <code>x</code> can be any whole number, including very large and negative ones.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Do it in two parts. First keep only the lowest <code>w</code> bits, as a number from 0 to 2ʷ − 1 (2 to the power w, minus 1). Then
            decide what the top bit means.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>x &amp; ((1 &lt;&lt; w) - 1)</code> keeps the lowest <code>w</code> bits, for negative <code>x</code> too. Call it{" "}
              <code>u</code>.
            </p>
            <p>
              Reading <code>u</code> as an ordinary number counts the top place as plus 2ʷ⁻¹. Two&rsquo;s complement counts it as minus 2ʷ⁻¹: a
              difference of 2ʷ. So if the top bit of <code>u</code> is 1, subtract <code>1 &lt;&lt; w</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`u = x AND (2**w - 1)          # lowest w bits
if bit w - 1 of u is 1:
    u = u - 2**w
return u`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "From Gray code",
    fn: "from_gray",
    lessons: [2],
    starter: `def from_gray(g):
    # Return the n whose Gray code is g:
    # n ^ (n >> 1) == g.
    pass
`,
    statement: (
      <>
        <p>
          The Gray code of a whole number <code>n</code> is <code>n ^ (n &gt;&gt; 1)</code> (lesson 2). Given a Gray code <code>g</code>,
          return the <code>n</code> it came from. There is always exactly one.
        </p>
        <CodeBlock
          code={`from_gray(6)     # 4, because 4 ^ 2 == 6
from_gray(0)     # 0
from_gray(7)     # 5: 101 ^ 010 == 111`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>g</code> is 0 or more, with up to 1,000,000 bits. The two biggest tests have 2 seconds each.
          </li>
          <li>
            A loop that shifts <code>g</code> one place at a time is too slow for a million bits: each shift copies the whole number.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Work from the top bit down. The top bit of <code>n</code> is the top bit of <code>g</code>. How is each lower bit of <code>n</code>{" "}
            found from the bit of <code>n</code> above it and the bit of <code>g</code> in the same place?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Bit k of <code>n</code> is the xor of all the bits of <code>g</code> from the top down to place k. So <code>n</code> is{" "}
              <code>g ^ (g &gt;&gt; 1) ^ (g &gt;&gt; 2) ^ (g &gt;&gt; 3) ^ …</code>, with one shift for every bit: far too many for a million
              bits.
            </p>
            <p>
              Build it in blocks that double. After <code>n = g ^ (g &gt;&gt; 1)</code>, each bit of <code>n</code> is the xor of 2 bits of{" "}
              <code>g</code>. Then <code>n ^ (n &gt;&gt; 2)</code> is the xor of 4 bits, then <code>n ^ (n &gt;&gt; 4)</code> of 8, and so on.
              About 20 shifts cover a million bits.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`n = g
s = 1
while s < number of bits of g:
    n = n XOR (n >> s)   # each bit: 2*s bits of g
    s = s * 2
return n`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The next number with as many 1s",
    fn: "next_same_ones",
    lessons: [3],
    starter: `def next_same_ones(x):
    # Return the smallest number bigger than x
    # with the same number of 1 bits.
    pass
`,
    statement: (
      <>
        <p>
          Return the smallest whole number bigger than <code>x</code> that has the same number of 1 bits as <code>x</code>.
        </p>
        <CodeBlock
          code={`next_same_ones(6)      # 9:  110 -> 1001
next_same_ones(7)      # 11: 111 -> 1011
next_same_ones(156)    # 163: 10011100 -> 10100011`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>x</code> is at least 1, with up to about 100,000 bits.
          </li>
          <li>
            The answer can be very far from <code>x</code> (for <code>2 ** 40 - 1</code> it is about 550 billion bigger), so trying{" "}
            <code>x + 1</code>, <code>x + 2</code>, … is too slow. Build the answer from the bits of <code>x</code>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Lesson 3 describes the answer: find the lowest run of 1s, move its top 1 up one place, and put the rest of the run at the bottom.
            Which bit methods from lesson 3 find the run?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>low = x &amp; -x</code> is the lowest 1 bit. <code>up = x + low</code> carries through the lowest run: the run becomes 0s
              and the 0 above it becomes 1. That is the top part of the answer.
            </p>
            <p>
              <code>x ^ up</code> has a 1 in every place that changed: the whole run and the new 1 above it. That is the run length plus one 1s,
              starting at the place of <code>low</code>. You need the run length minus one 1s at the bottom, so shift these down by the place of{" "}
              <code>low</code> plus 2.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`low  = x AND -x                    # lowest 1 bit
up   = x + low                      # run cleared, next place set
gone = x XOR up                     # run plus the new 1
p    = place of low                 # low.bit_length() - 1
rest = gone >> (p + 2)              # run length - 1 ones
return up OR rest`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "All the 1 bits up to n",
    fn: "ones_upto",
    lessons: [4],
    starter: `def ones_upto(n):
    # Return the total number of 1 bits in
    # all the numbers 0, 1, 2, ..., n.
    pass
`,
    statement: (
      <>
        <p>
          Write every whole number from 0 to <code>n</code> in binary. Return how many 1 bits there are in all of them together.
        </p>
        <CodeBlock
          code={`ones_upto(5)     # 7: 0, 1, 10, 11, 100, 101
ones_upto(7)     # 12
ones_upto(0)     # 0`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is from 0 to 10¹⁰⁰ (a 1 followed by 100 zeros). Counting the bits of every number is far too slow above a few
            million.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Count one place at a time. Lesson 4 shows that place k repeats a cycle: 2ᵏ zeros, then 2ᵏ ones. How many whole cycles fit in the
            numbers 0 to n, and what is left over?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              There are <code>n + 1</code> numbers. For place k the cycle is <code>c = 2 ** (k + 1)</code> long. The whole cycles,{" "}
              <code>(n + 1) // c</code> of them, give <code>2 ** k</code> ones each.
            </p>
            <p>
              The last, unfinished cycle has <code>r = (n + 1) % c</code> numbers. Its first <code>2 ** k</code> numbers have a 0 in place k and
              the rest have a 1, so it adds <code>r - 2 ** k</code> ones if that is more than 0, and none otherwise. Stop when{" "}
              <code>2 ** k</code> is bigger than <code>n</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`total = 0
k = 0
while 2**k <= n:
    c = 2**(k + 1)
    total += ((n + 1) // c) * 2**k
    total += max(0, (n + 1) % c - 2**k)
    k += 1
return total`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The closest subset sum",
    fn: "closest_sum",
    lessons: [5],
    starter: `def closest_sum(a, target):
    # Return the smallest possible
    # abs(sum of some items of a - target).
    pass
`,
    statement: (
      <>
        <p>
          Choose some of the numbers in the list <code>a</code> (any of them, or none). Return how close their sum can get to{" "}
          <code>target</code>: the smallest possible value of <code>abs(sum - target)</code>. The empty choice has sum 0.
        </p>
        <CodeBlock
          code={`closest_sum([3, 9, 14], 20)    # 3: 17 or 23
closest_sum([3, 9, 14], 23)    # 0: 9 + 14
closest_sum([-7, 4, 10], 2)    # 1: -7 + 10 = 3
closest_sum([], 5)             # 5`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>a</code> has up to 36 numbers, each from −10¹² to 10¹² (minus and plus a million million). <code>target</code> is a whole
            number of the same size or larger.
          </li>
          <li>
            36 numbers have 2³⁶, about 69 billion, subsets: listing them all is far too slow. The biggest tests have 5 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Split the list into two halves. Every choice is a choice from the first half plus a choice from the second half. How many sums does
            each half have?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              List all subset sums of each half (lesson 5): at most 2¹⁸ = 262,144 each. Sort the sums of the second half.
            </p>
            <p>
              For each sum <code>s</code> of the first half, the best partner is the sum of the second half nearest to <code>target - s</code>.
              Find it with <code>bisect_left</code>: check the sum at that position and the one just before it. Remember that a position equal
              to the length of the list has no sum.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`left  = all subset sums of a[:len(a)//2]
right = sorted(all subset sums of a[len(a)//2:])
best = abs(target)
for s in left:
    i = bisect_left(right, target - s)
    if i < len(right):
        best = min(best, s + right[i] - target)
    if i > 0:
        best = min(best, target - s - right[i-1])
return best`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
