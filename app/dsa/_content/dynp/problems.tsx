import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";
import t7 from "./tests/p7.json";
import t8 from "./tests/p8.json";
import t9 from "./tests/p9.json";

function Deep() {
  return (
    <li>
      Python stops at about 1,000 nested calls, and a function wrapped in <code>functools.cache</code> stops after a few hundred in the browser.
      The big tests need far more than that, so memoised recursion fails them. Fill a table with a loop (lesson 3).
    </li>
  );
}

export const DYNP_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Shapes of a search tree",
    fn: "shapes",
    lessons: [1],
    blocked: ["math.comb", "math.factorial", "math.perm"],
    starter: `def shapes(n):
    # Return how many different binary search
    # trees hold the keys 1, 2, ..., n.
    pass
`,
    statement: (
      <>
        <p>
          A binary search tree (TREE-3) can hold the same keys in many shapes. Return how many different binary search trees hold the keys 1, 2,
          …, <code>n</code>. Two trees are different if their shapes are different.
        </p>
        <CodeBlock
          code={`shapes(3)    # 5
shapes(0)    # 1: the empty tree
shapes(4)    # 14`}
        />
        <p>
          A formula for this count exists, so <code>math.comb</code>, <code>math.factorial</code> and <code>math.perm</code> are switched off.
          Work it out from smaller counts.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is from 0 to 200. The answers have up to 117 digits; Python&rsquo;s whole numbers hold them exactly.
          </li>
          <li>Memoised recursion is fine here: it goes at most 200 calls deep.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Choose the root. If the root is key r, which keys go in the left subtree and which in the right? Does it matter what the keys are,
            or only how many there are?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              With root r, the left subtree holds the r − 1 smaller keys and the right subtree the n − r larger ones. Any left shape can go with any
              right shape, so root r gives <code>shapes(r - 1) * shapes(n - r)</code> trees. Add this up over every root.
            </p>
            <p>
              Plain recursion asks for the same small counts again and again (about 3ⁿ calls). There are only n + 1 different questions: keep each
              answer in a list, filled from 0 keys upwards.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`count = list of n + 1 ones      # 0 and 1 key: 1 shape
for m = 2 to n:
    count[m] = sum over left = 0 .. m - 1 of
               count[left] * count[m - 1 - left]
return count[n]`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Exchanging a coin",
    fn: "exchange",
    lessons: [2],
    starter: `def exchange(n):
    # Return the most rupees you can get
    # for a coin with the number n on it.
    pass
`,
    statement: (
      <>
        <p>
          A bank will exchange a coin with the number <code>n</code> on it for three coins: <code>n // 2</code>, <code>n // 3</code> and{" "}
          <code>n // 4</code> (each divided and rounded down). You can also sell any coin for as many rupees as its number. You may exchange the new
          coins again, as often as you like. Return the most rupees you can end up with.
        </p>
        <CodeBlock
          code={`exchange(12)   # 13: 12 -> 6, 4, 3; sell all three
exchange(11)   # 11: 5 + 3 + 2 = 10, so sell it
exchange(24)   # 27`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is from 0 to 10¹⁸ (a 1 followed by 18 zeros). A list with one entry for every number up to <code>n</code> would never fit
            in memory.
          </li>
          <li>The tests call your function many times in a row, with different values of n.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            The best you can get for a coin depends only on its number. For coin m, either sell it, or exchange it and do the best you can with
            each of the three new coins.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>best(m) = max(m, best(m // 2) + best(m // 3) + best(m // 4))</code>, with <code>best(0) = 0</code>. Plain recursion repeats
              work: m // 2 // 3 and m // 3 // 2 are the same number.
            </p>
            <p>
              Remember each answer in a dict (or use <code>functools.cache</code>). Starting from n, the recursion only reaches numbers of the form
              n divided by 2s, 3s and 4s: a few thousand at most, even for n = 10¹⁸. A table from 0 to n is the wrong tool here.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`memo = empty dict
best(m):
    if m == 0: return 0
    if m not in memo:
        memo[m] = max(m, best(m // 2) + best(m // 3)
                         + best(m // 4))
    return memo[m]
return best(n)`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Ways to decode",
    fn: "decode_ways",
    lessons: [3],
    starter: `def decode_ways(s):
    # s is a string of digits. Return the number of
    # ways to read it as letters (A = 1, ..., Z = 26),
    # as a remainder after dividing by 1,000,000,007.
    pass
`,
    statement: (
      <>
        <p>
          A message of capital letters was turned into digits with A = 1, B = 2, …, Z = 26, and the numbers were written one after another with
          no spaces. Given the digits <code>s</code>, return the number of different ways to read them as letters.
        </p>
        <CodeBlock
          code={`decode_ways("226")    # 3: 2 2 6, 22 6, 2 26
decode_ways("10")     # 1: only 10 (J)
decode_ways("06")     # 0: 06 is not a letter`}
        />
        <ul>
          <li>A letter is 1 to 9 (one digit) or 10 to 26 (two digits). A 0 can only be the second digit of 10 or 20.</li>
          <li>
            The count can have thousands of digits. Return the <strong>remainder</strong> after dividing it by 1,000,000,007:{" "}
            <code>count % 1_000_000_007</code>. You may take the remainder after every addition; the result is the same.
          </li>
        </ul>
        <h2>Limits</h2>
        <ul>
          <li>
            <code>s</code> has 1 to 100,000 digits.
          </li>
          <Deep />
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Think about the last letter of a reading of the first i digits. It is made of the last digit alone, or of the last two digits
            together. What is left before it?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Let <code>ways[i]</code> be the number of readings of the first i digits, with <code>ways[0] = 1</code> (the empty prefix). Then{" "}
              <code>ways[i]</code> is <code>ways[i - 1]</code> if digit i − 1 is not 0, plus <code>ways[i - 2]</code> if the two digits before
              position i make a number from 10 to 26.
            </p>
            <p>Fill this with a loop from i = 1 upwards. Each entry needs only the two before it, so two names are enough.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`before, cur = 1, 1       # ways for i - 2 and i - 1
for i = 1 to len(s):
    ways = 0
    if s[i - 1] != "0": ways += cur
    if i >= 2 and "10" <= s[i - 2:i] <= "26":
        ways += before
    before, cur = cur, ways % 1_000_000_007
return cur`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Season tickets",
    fn: "season_tickets",
    lessons: [4],
    starter: `def season_tickets(days, passes):
    # days: the days you travel, rising, all different.
    # passes: a list of (length, price).
    # Return the least total price that covers every
    # travel day.
    pass
`,
    statement: (
      <>
        <p>
          You know the days on which you will travel by train: <code>days</code>, a rising list of different whole numbers. The railway sells
          passes, given as <code>(length, price)</code>: a pass bought on day d lets you travel on days d, d + 1, …, d + length − 1. You may buy any
          pass any number of times. Return the least total price that lets you travel on every day in <code>days</code>.
        </p>
        <CodeBlock
          code={`season_tickets([1, 4, 6, 7, 8, 20],
               [(1, 2), (7, 7), (30, 15)])
# 11: a 1-day ticket on day 1, a 7-day pass
# from day 4 (covers 4 to 10), a 1-day on day 20`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 travel days, each from 1 to 2,000,000,000; up to 6 passes, each with a length of at least 1. A table with one entry per
            calendar day is far too big.
          </li>
          <li>
            Aim for about <M>O(n · p · log n)</M> for n trips and p passes. <code>bisect</code> is allowed.
          </li>
          <Deep />
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Look at the first trip that is not covered yet. Some pass must cover it, and it is never worse to buy that pass on the day of that
            trip. Which trips does it cover, and what is left?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Let <code>best[i]</code> be the least price that covers trips i, i + 1, …, n − 1, with <code>best[n] = 0</code>. A pass of length L
              bought on <code>days[i]</code> covers every trip before the day <code>days[i] + L</code>; let j be the first trip on or after that
              day. Then <code>best[i]</code> is the smallest <code>price + best[j]</code> over all passes.
            </p>
            <p>
              Fill <code>best</code> from the last trip backwards. Find j with <code>bisect.bisect_left(days, days[i] + L)</code>, not by walking
              forward one trip at a time: a long pass would make that walk O(n) for every trip.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`best = list of n + 1 zeros
for i = n - 1 down to 0:
    best[i] = infinity
    for (length, price) in passes:
        j = bisect_left(days, days[i] + length)
        best[i] = min(best[i], price + best[j])
return best[0]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The largest free square",
    fn: "largest_square",
    lessons: [5],
    starter: `def largest_square(rows):
    # rows: a list of equal-length strings of
    # "." (free) and "#" (track).
    # Return the side of the largest square of
    # free cells.
    pass
`,
    statement: (
      <>
        <p>
          A railway yard is drawn as a grid: <code>rows</code> is a list of strings of the same length, where <code>&quot;.&quot;</code> is a free
          cell and <code>&quot;#&quot;</code> is a cell with track on it. Return the side length of the largest square made only of free cells.
          The square&rsquo;s sides run along the grid.
        </p>
        <CodeBlock
          code={`largest_square(["#..#.",
                ".....",
                ".#...",
                ".#..."])    # 3
largest_square(["##", "##"])  # 0
largest_square([])            # 0`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 700 rows of 700 cells. Aim for one pass over the cells, a few steps each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            For each free cell, ask: what is the largest free square whose <strong>bottom-right</strong> corner is this cell? How does it depend on
            the same question for the cells just above, just to the left, and above-left?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Let <code>side[r][c]</code> be that size, and 0 for a track cell. For a free cell it is 1 plus the smallest of the three neighbours&rsquo;
              values (above, left, above-left), with cells outside the grid counting as 0. The answer is the largest value in the table.
            </p>
            <p>
              Why the smallest? A square of side k ending here needs squares of side k − 1 ending at all three neighbours. Fill the table row by
              row; only the row above is needed.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`prev = zeros, width + 1     # prev[c + 1]: row above
best = 0
for each row:
    cur = zeros, width + 1
    for c in 0 .. width - 1:
        if row[c] == ".":
            cur[c + 1] = 1 + min(prev[c], prev[c + 1],
                                 cur[c])
            best = max(best, cur[c + 1])
    prev = cur
return best`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Nesting boxes",
    fn: "nest",
    lessons: [6],
    starter: `def nest(boxes):
    # boxes: a list of (width, height).
    # Return the longest chain of boxes that fit
    # one inside the next.
    pass
`,
    statement: (
      <>
        <p>
          Each box is given as <code>(width, height)</code>. A box fits inside another if its width <strong>and</strong> its height are both
          strictly smaller. Boxes cannot be turned. Return the largest number of boxes that can be put one inside the next, like a set of
          nesting dolls.
        </p>
        <CodeBlock
          code={`nest([(5, 4), (6, 4), (6, 7), (2, 3)])   # 3
# (2, 3) inside (5, 4) inside (6, 7)
nest([(3, 1), (3, 2), (3, 3)])           # 1`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 boxes, with sides from 1 to 1,000,000. Comparing every pair (<M>O(n²)</M>, n times n steps) is too slow; aim for <M>O(n log n)</M>.{" "}
            <code>sorted</code> and <code>bisect</code> are allowed.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Sort the boxes by width. Then a chain is a run of boxes, left to right in this order, whose heights rise. Which lesson finds the longest
            such run? What goes wrong with boxes of equal width?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort by width rising, and for equal widths by height <strong>falling</strong>. Then two boxes of the same width can never both be in a
              rising run of heights, and every strictly rising run of heights is a real chain.
            </p>
            <p>
              Now find the longest strictly increasing subsequence of the heights with the tails list and <code>bisect_left</code> (lesson 6):{" "}
              <M>O(n log n)</M>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`sort boxes by (width, -height)
tails = []
for (w, h) in boxes:
    k = bisect_left(tails, h)
    if k == len(tails): tails.append(h)
    else: tails[k] = h
return len(tails)`}
          />
        ),
      },
    ],
    tests: t6,
  },
  {
    n: 7,
    title: "Edit distance",
    fn: "edit_distance",
    lessons: [7],
    starter: `def edit_distance(a, b):
    # Return the fewest single-letter edits (insert,
    # delete or replace) that turn a into b.
    pass
`,
    statement: (
      <>
        <p>
          An <strong>edit</strong> is one of three changes to a string: insert a letter anywhere, delete a letter, or replace a letter with another.
          Return the fewest edits that turn <code>a</code> into <code>b</code>. This number is the <strong>edit distance</strong> (also called the
          Levenshtein distance).
        </p>
        <CodeBlock
          code={`edit_distance("kitten", "sitting")  # 3
# k -> s, e -> i, insert g
edit_distance("horse", "ros")       # 3
edit_distance("", "abc")            # 3`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Each string has up to 1,000 letters. Aim for <M>O(len(a) × len(b))</M>.
          </li>
          <Deep />
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Let <code>d[i][j]</code> be the edit distance between the first i letters of a and the first j letters of b. Look at the last letters of
            the two prefixes. If they are equal, what is <code>d[i][j]</code>? If not, what could the last edit have been?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Row 0 is <code>d[0][j] = j</code> (insert j letters) and column 0 is <code>d[i][0] = i</code> (delete i letters). If{" "}
              <code>a[i - 1] == b[j - 1]</code>, then <code>d[i][j] = d[i - 1][j - 1]</code>. Otherwise it is 1 plus the smallest of{" "}
              <code>d[i - 1][j - 1]</code> (replace), <code>d[i - 1][j]</code> (delete) and <code>d[i][j - 1]</code> (insert).
            </p>
            <p>Fill the table row by row. Each row needs only the row above, so two rows are enough.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`prev = [0, 1, ..., len(b)]
for i = 1 to len(a):
    cur = [i] + zeros
    for j = 1 to len(b):
        if a[i - 1] == b[j - 1]: cur[j] = prev[j - 1]
        else: cur[j] = 1 + min(prev[j - 1], prev[j],
                               cur[j - 1])
    prev = cur
return prev[len(b)]`}
          />
        ),
      },
    ],
    tests: t7,
  },
  {
    n: 8,
    title: "Ways to pay",
    fn: "ways_to_pay",
    lessons: [8],
    starter: `def ways_to_pay(amount, coins):
    # coins: different values, each available in any
    # number. Return how many different sets of coins
    # add up to amount (order does not matter).
    pass
`,
    statement: (
      <>
        <p>
          You have as many coins as you like of each value in <code>coins</code> (all different, all at least 1). Return the number of different
          ways to pay exactly <code>amount</code>. Only how many coins of each value you use matters, not their order: 1 + 2 and 2 + 1 are the same
          way.
        </p>
        <CodeBlock
          code={`ways_to_pay(5, [1, 2, 5])     # 4
# 5, 2+2+1, 2+1+1+1, 1+1+1+1+1
ways_to_pay(4, [1, 2, 3])     # 4, not 7
ways_to_pay(0, [7])           # 1: pay with nothing`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>amount</code> is up to 100,000 and there are up to 30 coin values. The counts can be very large; Python&rsquo;s whole numbers hold
            them exactly.
          </li>
          <Deep />
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Counting orders is easy and wrong. To count each set once, decide the coins one value at a time: first how many of the first value, then
            how many of the second, and so on.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep one list, <code>ways[x]</code> = the number of ways to pay x with the coin values handled so far, starting with{" "}
              <code>ways[0] = 1</code>. Add the coin values one at a time. For a coin c, go through x from c upwards and add{" "}
              <code>ways[x - c]</code> to <code>ways[x]</code>.
            </p>
            <p>
              The loop over coins must be the <strong>outer</strong> loop. Going upwards inside lets a coin be used again (lesson 8). With the
              amounts on the outside, you count every order separately.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`ways = [1] + zeros, amount
for c in coins:
    for x = c to amount:
        ways[x] += ways[x - c]
return ways[amount]`}
          />
        ),
      },
    ],
    tests: t8,
  },
  {
    n: 9,
    title: "Which items to pack",
    fn: "pack",
    lessons: [8, 9],
    starter: `def pack(items, cap):
    # items: a list of (weight, value).
    # Return the positions of the items in a best
    # choice that weighs at most cap.
    pass
`,
    statement: (
      <>
        <p>
          Each item is <code>(weight, value)</code>, with whole-number weights. Choose items whose weights add up to at most <code>cap</code> and
          whose values add up to as much as possible. Each item can be taken at most once. Return the <strong>positions</strong> of the chosen
          items in <code>items</code>, as a list in any order.
        </p>
        <CodeBlock
          code={`pack([(3, 4), (4, 5), (2, 3)], 7)   # [0, 1]
# weight 3 + 4 = 7, value 4 + 5 = 9
pack([(5, 10)], 4)                  # []`}
        />
        <p>
          When several choices have the best value, any of them is accepted. The tests check the facts of your answer: every position is valid and
          used once, the weight fits, and the total value is the best possible.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200 items, with weights from 1 to 100 and <code>cap</code> up to 3,000. Trying every choice (2²⁰⁰ of them, 200 twos multiplied together) is impossible.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            First find the best value with the knapsack table of lesson 8. Then ask, for the last item: does the best value change if this item is
            not allowed?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep the whole table: <code>best[i][x]</code> = the best value from the first i items in a bag of x kilograms. Row i is row i − 1 with
              item i − 1 taken wherever that helps.
            </p>
            <p>
              Then walk back from <code>best[n][cap]</code>. At row i with x kilograms left, if <code>best[i][x] == best[i - 1][x]</code> the item
              is not needed: move up. Otherwise it was taken: record position i − 1 and move to <code>x - weight</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`best = [row of cap + 1 zeros]
for (w, v) in items:
    row = copy of best[-1]
    for x = w to cap:
        row[x] = max(row[x], best[-1][x - w] + v)
    append row to best
x, chosen = cap, []
for i = n down to 1:
    if best[i][x] != best[i - 1][x]:
        chosen.append(i - 1); x -= weight of item i - 1
return chosen`}
          />
        ),
      },
    ],
    tests: t9,
  },
];
