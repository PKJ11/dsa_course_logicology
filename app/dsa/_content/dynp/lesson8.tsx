import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BagFigure } from "./figures";

export default function Lesson8() {
  return (
    <>
      <p className="lesson__lede">
        A bag that holds a fixed weight, and items with weights and values: which items should go in? This is the knapsack problem. Its family
        includes paying an amount with coins, splitting a load into two equal halves, and counting the ways to do any of these. One table, read
        in slightly different ways, solves them all.
      </p>

      <h2 id="zero-one">The 0/1 knapsack</h2>
      <p>
        There are n items; item i weighs <M>wᵢ</M> kilograms (a whole number) and is worth <M>vᵢ</M>. The bag holds at most W kilograms. Each
        item is taken whole or not at all, at most once: hence &ldquo;0/1&rdquo;. Find the largest total value that fits. GRDY-5 showed that no
        greedy rule solves this.
      </p>
      <p>
        Let <code>best[i][x]</code> be the best value using only the first i items, in a bag of x kilograms. Look at the last of those items. It
        is either skipped, and the best is <code>best[i - 1][x]</code>, or taken, if it fits, and then the other items share the{" "}
        <M>x − wᵢ</M> kilograms left: <code>best[i - 1][x - w] + v</code>. Each case uses the best for a smaller problem (lesson 1&rsquo;s
        argument), so <code>best[i][x]</code> is the larger of the two. Row 0, with no items, is all 0.
      </p>
      <BagFigure />
      <p>
        The table has <M>(n + 1)(W + 1)</M> cells, each worked out from two cells of the row above: <M>O(n · W)</M> time.
      </p>

      <h2 id="row">One row, right to left</h2>
      <p>
        Row i reads only row i − 1, so one list can hold the rows one after another (lesson 3). But a cell reads a cell further left, at{" "}
        <M>x − w</M>, and that cell must still hold the <em>old</em> row&rsquo;s value. Going from the largest bag down to the smallest makes sure
        of it: the cells to the left have not been updated yet. The second version of the figure shows this.
      </p>
      <CodeBlock
        title="knapsack.py"
        code={`def knapsack(items, cap):
    best = [0] * (cap + 1)
    for w, v in items:
        for x in range(cap, w - 1, -1):    # right to left
            best[x] = max(best[x], best[x - w] + v)
    return best[cap]`}
      />
      <Invariant label="Direction">Right to left: each item at most once. Left to right: each item any number of times.</Invariant>

      <h2 id="unbounded">Unlimited copies</h2>
      <p>
        The third version of the figure runs the loop from left to right. Then <code>best[x - w]</code> may already include the item, and adding
        it again uses it twice. For the 0/1 knapsack that is a bug. But when each item has unlimited copies, the <strong>unbounded knapsack</strong>,
        it is exactly right: <code>best[x]</code> becomes the best for bag x with any number of copies of the items seen so far.
      </p>
      <ul>
        <li>
          <strong>Fewest coins</strong> (GRDY-5) is an unbounded problem with a minimum instead of a maximum: each coin is an item of value 1, and
          the bag must be filled exactly.
        </li>
        <li>
          <strong>At most k copies</strong> of an item (the bounded knapsack): split it into bundles of 1, 2, 4, … copies, with a last bundle for
          the rest, and treat each bundle as one 0/1 item. Any number of copies from 0 to k is a sum of some bundles, so about{" "}
          <M>log₂ k</M> items replace k (log₂ k is the number of times k can be halved before it reaches 1).
        </li>
      </ul>

      <h2 id="count">Counting and yes-or-no versions</h2>
      <p>
        <strong>Subset sum</strong> asks only whether some items weigh exactly x. Keep True or False instead of a value: <code>can[x]</code> is
        True if some of the items seen so far weigh exactly x. Python can do this very fast with one whole number used as a row of bits, where
        bit x is <code>can[x]</code> (BITS explains bits). Shifting the number left by w moves every reachable weight up by w:
      </p>
      <CodeBlock
        title="subset_sum.py"
        code={`def reachable(weights):
    can = 1                    # bit 0: weight 0 is reachable
    for w in weights:
        can |= can << w        # every old weight, plus w
    return can

def even_split(weights):       # the smallest difference
    total = sum(weights)
    can = reachable(weights)
    return min(total - 2 * x for x in range(total // 2 + 1)
               if can >> x & 1)`}
      />
      <p>
        The work is the same <M>O(n · W)</M>, but done 30 or 60 bits at a time inside C. <code>even_split</code> splits a load into two parts
        whose weights differ as little as possible: the lighter part weighs some reachable x at most half the total.
      </p>
      <p>
        <strong>Counting</strong> replaces the maximum with a sum: the number of ways to make x. Here the order of the two loops matters.
      </p>
      <ul>
        <li>
          Items (or coins) on the <em>outside</em>, amounts inside: each way is counted once as a set, because the coins are added one value at a
          time and never in another order. Paying 4 with coins 1, 2 and 3 has 4 ways.
        </li>
        <li>
          Amounts on the outside, coins inside: every <em>order</em> is counted separately, as in the footbridge of RECR-P2, where 1 + 2 and 2 +
          1 are different orders. Paying 4 has 7 orders.
        </li>
      </ul>
      <p>Both are right; they answer different questions. Read the problem carefully to see which one it asks.</p>

      <h2 id="pseudo">Why big capacities are hard</h2>
      <p>
        <M>O(n · W)</M> looks polynomial, but W is a number, not a count of items. Writing W takes only about <M>log₂ W</M> binary digits (the number of times W can be halved), so doubling
        the <em>length</em> of the input can square W and the time. Such a method is called <strong>pseudo-polynomial</strong>. With weights near
        a billion, the table is far too big. In fact the 0/1 knapsack is NP-hard (HARD-1): no method that is polynomial in the length of the
        input is known. Useful alternatives:
      </p>
      <ul>
        <li>
          <strong>Small values, big weights:</strong> swap the roles. <code>lightest[v]</code> is the least weight that reaches total value v;
          the answer is the largest v whose weight fits. <M>O(n · V)</M> for a total value V.
        </li>
        <li>
          <strong>Few items</strong> (up to about 40): split the items into two halves and list every choice from each half, with its weight and value. That is 2 to the power
          n/2 choices per half, about a million for 40 items. Sort one list by weight and keep, for each place, the best value so far; then for each choice in the other list find the best
          partner that still fits by binary search. This is called meeting in the middle.
        </li>
        <li>
          <strong>A close answer is enough:</strong> round the values down to a coarser scale and run the values table; the result is within any
          chosen percentage of the best (HARD-4).
        </li>
      </ul>
      <Note title="Fractional is greedy, whole items are DP">
        <p>
          When items can be cut (GRDY-1), taking the best value per kilogram first is optimal. When items are whole, that rule fails and the
          table is needed. A small change in the problem moves it from one method to the other.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/8/">DYNP-P8, Ways to pay</Link>.
      </p>
    </>
  );
}
