import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

function HalfOpen({ what }: { what: string }) {
  return (
    <p>
      Times are half-open, as in Python slices: <code>(s, e)</code> includes <code>s</code> but not <code>e</code>. So {what} that ends at 5 and
      one that starts at 5 do not overlap.
    </p>
  );
}

export const GRDY_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "How much of each item",
    fn: "how_much",
    lessons: [1],
    starter: `def how_much(capacity, items):
    # items: a list of (weight, value). Any part of an item
    # may be taken. Return a list with the kilograms taken of
    # each item, in the order given, for the most valuable bag.
    pass
`,
    statement: (
      <>
        <p>
          A bag holds <code>capacity</code> kg. Each item is a pair <code>(weight, value)</code>, and any part of an item may be taken: x kg of
          an item is worth <code>x * value / weight</code>. Lesson 1 worked out the largest value. Here, return the plan itself: a list with one
          number per item, in the order the items are given, saying how many kilograms of that item go in the bag.
        </p>
        <CodeBlock
          code={`how_much(8, [(5, 10), (4, 7), (3, 3), (2, 5)])
# [5, 1, 0, 2]: all of the first and last items,
# 1 kg of the second; worth 10 + 1.75 + 5 = 16.75`}
        />
        <p>
          Each amount must be between 0 and its item&rsquo;s weight, and the amounts together must fit in the bag. Any plan with the largest
          value passes: the tests report the value of your plan (compared to 9 significant figures), or what is wrong with it. Every weight is a
          whole number of at least 1, every value a whole number of at least 0, and <code>capacity</code> is at least 0.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 items. Aim for <M>O(n log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The rule is lesson 1&rsquo;s: best value per kg first. The new part is remembering where each item was.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the positions 0 to n − 1 by <code>value / weight</code> of their items, largest first, instead of sorting the items. Start
              with a list of zeros.
            </p>
            <p>
              Go through the sorted positions: give each item all of its weight while it fits, then what is left of the bag to the first item
              that does not fit, and stop.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`take = [0] * len(items)
for i in positions, by items[i] value / weight, largest first:
    if capacity == 0: stop
    take[i] = min(weight of item i, capacity)
    capacity -= take[i]
return take`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The least lateness",
    fn: "least_lateness",
    lessons: [2],
    starter: `def least_lateness(jobs):
    # jobs: a list of (length, deadline). One machine runs them one
    # after another from time 0. Return the smallest possible value of
    # the largest lateness.
    pass
`,
    statement: (
      <>
        <p>
          One machine runs jobs one after another, starting at time 0, with no gaps. Each job is a pair <code>(length, deadline)</code>. A job that
          finishes at time <M>f</M> is late by <code>max(0, f - deadline)</code>. Choose the order of the jobs so that the largest lateness is as
          small as possible, and return that largest lateness.
        </p>
        <CodeBlock
          code={`least_lateness([(3, 6), (2, 2), (1, 9), (4, 8)])
# 1: run (2, 2), (3, 6), (4, 8), (1, 9);
# they finish at 2, 5, 9 and 10`}
        />
        <p>
          Return 0 when every job can finish on time, and for an empty list. Lengths are at least 1; deadlines are at least 0.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 jobs. Trying every order is impossible; aim for <M>O(n log n)</M>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 2 swapped neighbours that were in the wrong order. Which order did the swaps lead to?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Run the jobs in order of deadline, earliest first. Swapping two neighbours that break this order never makes the largest lateness
              worse, so this order is a best one.
            </p>
            <p>Then walk once: keep the time <code>t</code> at which the current job finishes, and the largest <code>t - deadline</code> so far.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`t = worst = 0
for length, due in jobs sorted by due:
    t += length
    worst = max(worst, t - due)
return worst`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The most bookings",
    fn: "most_bookings",
    lessons: [3],
    starter: `def most_bookings(bookings):
    # bookings: a list of (start, end). Return the positions (indices)
    # of as many bookings as possible, no two overlapping, listed in
    # time order.
    pass
`,
    statement: (
      <>
        <p>
          Each booking for one room is a pair <code>(start, end)</code> with <code>start &lt; end</code>. Choose as many bookings as possible so
          that no two overlap. Return a list of their positions in <code>bookings</code> (counted from 0), in time order: each chosen booking
          ends no later than the next one starts.
        </p>
        <CodeBlock
          code={`most_bookings([(0, 7), (1, 3), (3, 5), (5, 8), (7, 9), (8, 11)])
# [1, 2, 3, 5]: (1, 3), (3, 5), (5, 8), (8, 11)`}
        />
        <HalfOpen what="a booking" />
        <p>
          There can be more than one best choice; any of them is accepted. The tests check how many you chose, and that the choice is allowed (real
          positions, none twice, in time order, no overlaps). Times are whole numbers and can be below 0.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 bookings. Aim for <M>O(n log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Of the three rules in lesson 3 (starts first, shortest first, ends first), only one is always right.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the <em>positions</em> <code>0 .. n - 1</code> by the end time of their booking, so you still know each booking&rsquo;s
              position. Keep <code>free</code>, the end of the last booking chosen.
            </p>
            <p>
              A booking fits when its start is at least <code>free</code>. Choose it and move <code>free</code> to its end. Because the bookings
              are taken in order of end, the chosen ones come out in time order.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`order = positions sorted by bookings[i][1]
chosen = []; free = minus infinity
for i in order:
    start, end = bookings[i]
    if start >= free:
        chosen.append(i); free = end
return chosen`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Fewest platforms",
    fn: "platforms",
    lessons: [3],
    starter: `def platforms(trains):
    # trains: a list of (arrive, depart). Return the fewest platforms
    # so that no two trains share a platform at the same time.
    pass
`,
    statement: (
      <>
        <p>
          Each train is a pair <code>(arrive, depart)</code> with <code>arrive &lt; depart</code>: it is in the station from <code>arrive</code>{" "}
          up to, but not including, <code>depart</code>. A platform can hold one train at a time. Return the fewest platforms that are enough for
          all the trains.
        </p>
        <CodeBlock
          code={`platforms([(0, 4), (1, 3), (2, 6), (3, 5),
           (5, 8), (6, 9), (7, 10)])
# 3: at time 2, three trains are in at once`}
        />
        <HalfOpen what="a train" />
        <p>
          That is, a platform is free again the moment its train leaves. The trains can come in any order. Return 0 for an empty list.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 trains. Aim for <M>O(n log n)</M>.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The answer is the largest number of trains in the station at the same moment. Can you find it without checking every pair of trains?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Take the trains in order of arrival. Keep the departure times of the busy platforms in a min-heap (<code>heapq</code>). If the
              earliest departure is no later than the new arrival, that platform is free: replace its departure with the new one. Otherwise push a
              new departure. The heap&rsquo;s final size is the answer.
            </p>
            <p>
              Another way: sort all arrivals and all departures as events and keep a running count. At the same time, count the departure before
              the arrival.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`busy = []                     # a min-heap of departures
for arrive, depart in sorted(trains):
    if busy and busy[0] <= arrive:
        heapreplace(busy, depart)  # reuse that platform
    else:
        heappush(busy, depart)     # open a new one
return len(busy)`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Huffman codes",
    fn: "huffman",
    lessons: [4],
    starter: `def huffman(counts):
    # counts: a dict letter -> how many times it appears.
    # Return a dict letter -> code, a string of '0' and '1', so that
    # no code is the start of another and the total bits are fewest.
    pass
`,
    statement: (
      <>
        <p>
          <code>counts</code> maps each letter to how often it appears in a text. A letter can be any string, such as <code>&apos;a&apos;</code>{" "}
          or a whole word. Return a dict that gives each letter a code: a non-empty string of <code>&apos;0&apos;</code> and{" "}
          <code>&apos;1&apos;</code>. The codes must be prefix-free (no code is the start of another), and the total number of bits,{" "}
          <code>sum(counts[x] * len(code[x]))</code>, must be as small as possible.
        </p>
        <CodeBlock
          code={`huffman({'a': 5, 'b': 9, 'c': 12, 'd': 13, 'e': 16, 'f': 45})
# for example {'f': '0', 'c': '100', 'd': '101',
#   'a': '1100', 'b': '1101', 'e': '111'}: 224 bits`}
        />
        <p>
          When counts are equal, several sets of codes are equally good; any of them is accepted. The tests check the letters, that every code is
          made of <code>0</code> and <code>1</code>, that no code starts another, and the total number of bits. With only one letter, give it the
          code <code>&apos;0&apos;</code>. Every count is at least 1.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 50,000 letters. Aim for <M>O(k log k)</M> for <M>k</M> letters.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Start with one tree per letter. Which two trees should be joined first?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep the trees in a heap of <code>(weight, n, tree)</code>, where <code>n</code> is a counter that makes every entry different, so
              Python never compares two trees. A leaf can be the letter itself; a joined tree can be a pair <code>(left, right)</code>.
            </p>
            <p>
              Pop the two lightest, push their join with the summed weight, and repeat until one tree is left. Then walk it with a stack of{" "}
              <code>(tree, code so far)</code>: add <code>&apos;0&apos;</code> going left and <code>&apos;1&apos;</code> going right; a leaf gets
              the code so far.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`heap = [(w, n, letter) for n, (letter, w) in ...]
heapify(heap)
if one entry: return {letter: '0'}
while len(heap) > 1:
    wa, _, a = heappop(heap); wb, _, b = heappop(heap)
    heappush(heap, (wa + wb, next counter, (a, b)))
walk from the top: pair -> (left, code + '0'),
                          (right, code + '1')
                   letter -> codes[letter] = code`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "When greedy change fails",
    fn: "first_failure",
    lessons: [5],
    starter: `def first_failure(coins):
    # coins: different coin values, one of them 1.
    # Return the smallest amount for which "the largest coin that
    # fits, again and again" uses more coins than needed, or None.
    pass
`,
    statement: (
      <>
        <p>
          <code>coins</code> lists the coin values of a country, all different, in any order, and one of them is 1. To pay an amount, the greedy
          method takes the largest coin that fits, again and again. Return the smallest amount (at least 1) for which the greedy method uses more
          coins than the fewest possible. If the greedy method is always best, return <code>None</code>.
        </p>
        <CodeBlock
          code={`first_failure([1, 3, 4])   # 6: greedy 4+1+1, best 3+3
first_failure([1, 2, 5, 10, 20, 50, 100, 200, 500])   # None`}
        />
        <p>
          Lesson 5 gives the fact you need: if greedy ever fails, it fails for some amount below the sum of the two largest coins.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 16 coins, the largest up to 100,000. Aim for <M>O(L × k)</M>, where <M>L</M> is the sum of the two largest coins and{" "}
            <M>k</M> the number of coins.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            You need two numbers for every amount below the bound: how many coins greedy uses, and the fewest possible. The second one can be built
            from the answers for smaller amounts.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the coins. Let <code>limit</code> be the sum of the two largest (with one coin, return <code>None</code>). Fill a list{" "}
              <code>fewest</code> for amounts <code>0 .. limit - 1</code>: <code>fewest[0] = 0</code>, and <code>fewest[x]</code> is 1 plus the
              smallest <code>fewest[x - c]</code> over coins <code>c &lt;= x</code>.
            </p>
            <p>
              For the greedy count, go through the coins from largest to smallest, adding <code>x // c</code> and keeping <code>x % c</code>.
              Return the first amount where the greedy count is larger.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`coins sorted; if one coin: return None
limit = coins[-1] + coins[-2]
fewest = [0] * limit
for x in 1 .. limit - 1:
    fewest[x] = 1 + min(fewest[x - c] for c <= x)
    g = greedy count of x (largest coin first, // and %)
    if g > fewest[x]: return x
return None`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
