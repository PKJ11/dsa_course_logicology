import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SubsetFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Number some items 0, 1, 2, …. Then any subset of them can be stored as one whole number: bit i is 1 when item i is in the subset. The
        operators of lesson 2 become set operations, and counting from 0 to <M>2ⁿ − 1</M> lists every subset. This is the first step towards
        bitmask DP (ADDP-4).
      </p>

      <h2 id="sets">A set in one number</h2>
      <p>
        A number used this way is called a <strong>bitmask</strong>. With items a, b, c as places 0, 1, 2, the number 5 (<code>101</code>) is
        the subset {"{a, c}"}, and 0 is the empty subset. Every set operation is one operator:
      </p>
      <CodeBlock
        title="sets.py"
        code={`s >> i & 1           # is item i in s?
s | (1 << i)         # add item i
s & ~(1 << i)        # remove item i
a | b                # union: in a or in b
a & b                # common part: in both
a & ~b               # in a but not in b
full = (1 << n) - 1  # all n items
full ^ s             # the items not in s
s.bit_count()        # how many items
a & b == a           # is a a subset of b?`}
      />
      <p>
        For up to a few dozen items this is faster than a Python <code>set</code>, uses far less memory, and a bitmask can be a dict key
        directly, because it is just a number.
      </p>

      <h2 id="all">Every subset</h2>
      <p>
        n items have <M>2ⁿ</M> subsets: each item is in or out, and the choices multiply. Their bitmasks are exactly the numbers 0 to{" "}
        <M>2ⁿ − 1</M>, so <code>for mask in range(1 &lt;&lt; n)</code> visits every subset once. Reading the items of each mask takes n steps,
        so working on every subset this way costs <M>O(2ⁿ · n)</M>.
      </p>
      <p>
        Often a subset&rsquo;s answer can be built from a smaller subset&rsquo;s answer instead. Remove the lowest item:{" "}
        <code>mask ^ low</code>, where <code>low = mask &amp; -mask</code> (lesson 3), is a smaller number, so its answer is already known. The
        first version of the figure fills in the weight of every subset this way, with one addition each.
      </p>
      <SubsetFigure />
      <CodeBlock
        title="subset_sums.py"
        code={`def subset_sums(w):
    n = len(w)
    sums = [0] * (1 << n)
    for mask in range(1, 1 << n):
        low = mask & -mask              # the lowest item's bit
        i = low.bit_length() - 1        # ... and its number
        sums[mask] = sums[mask ^ low] + w[i]
    return sums

subset_sums([5, 3, 8])   # [0, 5, 3, 8, 8, 13, 11, 16]`}
      />
      <p>
        This is <M>O(2ⁿ)</M>. A shorter way gives the same list: start with <code>[0]</code>, and for each item add a copy of the list with
        the item&rsquo;s weight added to every sum (<code>sums += [s + v for s in sums]</code>). After the first k items, the list holds the
        sums of all subsets of those k items.
      </p>

      <h2 id="sub">Submasks</h2>
      <p>
        Sometimes you need every subset of one given subset: the <strong>submasks</strong> of a mask. Counting from 0 to mask and skipping the
        numbers with a 1 outside the mask wastes most of the steps. This loop visits only the submasks, largest first:
      </p>
      <CodeBlock
        title="submasks.py"
        code={`def submasks(mask):
    sub = mask
    while True:
        yield sub
        if sub == 0:
            break
        sub = (sub - 1) & mask`}
      />
      <p>
        <strong>Why does it work?</strong> <code>sub - 1</code> turns the lowest 1 of sub into 0 and sets every place below it to 1. Then{" "}
        <code>&amp; mask</code> clears the places that are not in the mask. If you look only at the mask&rsquo;s own places, this is exactly
        subtracting 1 from a smaller number. So the loop counts down through every pattern of the mask&rsquo;s places, from all of them to none.
        The second version of the figure lists the 8 submasks of <code>1101</code>.
      </p>
      <Invariant label="Cost">Over all masks of n items, the submask loops make 3ⁿ steps in all, not 4ⁿ.</Invariant>
      <p>
        Here <M>3ⁿ</M> means 3 to the power n. Why 3? For each pair (mask, submask), each item is in one of three states: not in the mask, in
        the mask but not in the submask, or in both. Every pattern of n such states is one pair, so there are exactly <M>3ⁿ</M> pairs. For
        n = 15 that is about 14 million, against about a billion for every pair of masks. Bitmask DP (ADDP-4) often loops over submasks like
        this.
      </p>
      <p>
        To list only the subsets of size k, start with the k lowest items, <code>(1 &lt;&lt; k) - 1</code>, and step to the next number with
        as many 1s (lesson 3), or use <code>itertools.combinations(range(n), k)</code>.
      </p>

      <h2 id="middle">Meeting in the middle</h2>
      <p>
        Is there a subset of 40 numbers that adds up to exactly t? There are <M>2⁴⁰</M>, about a million million, subsets: far too many. But
        each subset is a part from the first 20 numbers plus a part from the last 20. So:
      </p>
      <ol>
        <li>List the sums of all subsets of the first half: <M>2²⁰</M>, about a million.</li>
        <li>Put the sums of all subsets of the second half in a Python <code>set</code>.</li>
        <li>For each sum s of the first half, check whether <M>t − s</M> is in the set.</li>
      </ol>
      <p>
        That is about two million steps instead of a million million. In general, <M>O(2ⁿ)</M> becomes about <M>O(2ⁿᐟ²)</M>, 2 to the power
        n/2: the square root of the work, paid for with the memory for one half&rsquo;s sums. The method is called{" "}
        <strong>meeting in the middle</strong>. DYNP-8 mentioned it for the knapsack with few items. For the <em>closest</em> sum to t, a set is
        not enough: sort one half&rsquo;s sums and use binary search (BSRC) to find the best partner for each sum of the other half. That is
        BITS-P5.
      </p>

      <h2 id="limits">How far subsets go</h2>
      <p>
        In Python, simple work on <M>2²⁰</M> (about a million) subsets takes under a second. <M>2²⁵</M> (about 33 million) takes many
        seconds, and <M>2³⁰</M> (about a billion) is out of reach. So plain subset listing suits about 20 items, and meeting in the middle about 40.
      </p>
      <Note title="Subsets against orders">
        <p>
          Many problems that seem to need every order of n items need only every subset. The shortest route through n cities is the classic
          case: trying every order costs <M>n!</M> (n × (n − 1) × … × 1), which is about 2.4 × 10¹⁸ for 20 cities. A DP over subsets, which
          remembers only which cities have been visited and where the route ends, needs about <M>2ⁿ · n²</M> steps, about 400 million. ADDP-4
          builds it.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bits/practice/5/">BITS-P5, The closest subset sum</Link>.
      </p>
    </>
  );
}
