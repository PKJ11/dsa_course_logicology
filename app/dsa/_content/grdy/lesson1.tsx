import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BagFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A greedy algorithm builds its answer one piece at a time. At each step it takes the piece that looks best right now, and it never goes
        back to change an earlier choice. This is fast and simple. It is also often wrong, so the real skill is knowing when it is right.
      </p>

      <h2 id="idea">Build the answer one piece at a time</h2>
      <p>Many problems ask for the best answer out of a huge number of possible answers:</p>
      <ul>
        <li>the most meetings that fit in one room;</li>
        <li>the fewest coins that make an amount;</li>
        <li>the shortest code for each letter of a text.</li>
      </ul>
      <p>
        Trying every possible answer is usually far too slow: there are 2ⁿ ways (n twos multiplied together) to choose some of n things. A{" "}
        <strong>greedy algorithm</strong> makes one choice, then the next, then the next, each time by a simple rule such as &ldquo;the
        cheapest&rdquo;, &ldquo;the one that ends first&rdquo; or &ldquo;the largest that fits&rdquo;. It never tries the other choices, and it
        never undoes one.
      </p>
      <Invariant label="Greedy">Make the choice that looks best now, keep it, and solve what is left.</Invariant>

      <h2 id="bag">A bag that holds 8 kg</h2>
      <p>
        A bag holds 8 kg. There are four items, each with a weight and a value. Any part of an item may be taken, like rice from a sack: half of
        an item weighs half as much and is worth half as much. The goal is the most valuable bag. This is the <strong>fractional knapsack</strong>{" "}
        problem (a knapsack is a bag).
      </p>
      <p>
        Three greedy rules come to mind: the most valuable item first, the lightest item first, or the most <em>value per kg</em> first. The
        figure tries each one. Only the third is always right.
      </p>

      <BagFigure />

      <p>
        Why value per kg? Think of the bag as 8 separate kilograms to fill. Each kilogram can hold some part of some item, and its worth is that
        item&rsquo;s value per kg. To make the total as large as possible, fill every kilogram with the best value per kg still available. That
        is exactly what the rule does. Being able to cut items matters here: lesson 5 shows that the same rule fails when items must be taken
        whole.
      </p>

      <h2 id="two">The two things greedy needs</h2>
      <p>A greedy algorithm gives the best answer when two things are true.</p>
      <ol>
        <li>
          <strong>The greedy choice is safe.</strong> There is a best answer that contains the first choice the rule makes. So taking it cannot
          shut out every best answer. (In the bag: some best bag contains as much as possible of the item with the most value per kg.)
        </li>
        <li>
          <strong>What is left is the same kind of problem.</strong> After the choice, the rest of the answer must be a best answer to the
          smaller problem that remains. This is called <strong>optimal substructure</strong>. (In the bag: after taking that item, the best way
          to fill the remaining space is the same question with less room and one item fewer.)
        </li>
      </ol>
      <p>
        Together they give a proof by induction (CORR-3): the first choice is safe, the rest is a smaller problem of the same kind, so the same
        rule handles it, and so on down to an empty problem. Dynamic programming (DYNP) needs the second property too; what greedy adds is the
        first one, which lets it try one choice instead of all of them.
      </p>
      <p>
        The first property is the hard part, and it is where most wrong greedy ideas break. Lesson 2 shows the standard way to prove it: the{" "}
        <strong>exchange argument</strong>.
      </p>

      <h2 id="cost">Cost</h2>
      <p>
        Most greedy algorithms have the same shape: sort the pieces by the rule, then walk through them once, taking each piece that still fits.
        Sorting costs <M>O(n log n)</M> and the walk costs <M>O(n)</M>, so the whole thing is <M>O(n log n)</M>.
      </p>
      <p>
        When the rule changes as choices are made (the best piece depends on what was taken before), a heap gives the best piece in{" "}
        <M>O(log n)</M> each time (HEAP-4). Huffman coding in lesson 4 works that way. A union-find (DSUF) is the other common helper: Kruskal&rsquo;s
        method for spanning trees takes the cheapest edge that does not close a loop.
      </p>

      <h2 id="python">In Python</h2>
      <CodeBlock
        title="bag.py"
        code={`def best_bag(capacity, items):         # items: (weight, value)
    order = sorted(items, key=lambda it: it[1] / it[0],
                   reverse=True)          # most value per kg first
    total = 0.0
    for weight, value in order:
        if capacity == 0:
            break
        take = min(weight, capacity)      # all of it, or what fits
        total += value * take / weight
        capacity -= take
    return total`}
      />
      <p>
        <code>sorted</code> with a <code>key</code> sorts by the value the key function returns; <code>reverse=True</code> puts the largest
        first. Only the last item taken can be cut, because every item before it fitted whole.
      </p>
      <Note title="Sorting is not always needed">
        <p>
          Sorting all n items is more than the fractional knapsack needs. The item that gets cut can be found in <M>O(n)</M> with a selection
          method like quickselect (SORT-8): the items with more value per kg than it all go in whole, and their order does not matter. In
          practice, sorting is simpler and fast enough.
        </p>
      </Note>
    </>
  );
}
