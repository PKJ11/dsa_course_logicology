import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BnbFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        An NP-hard problem has no known fast method for every input, but most inputs are not the worst case. Branch and bound searches every
        possible answer in principle, and skips whole groups of answers that provably cannot win. It always finds the best answer; how long
        it takes depends on how close its estimates are to the true values.
      </p>

      <h2 id="search">Search with a bound</h2>
      <p>
        RECR-5 searched a tree of choices and cut branches early. For an optimisation problem (here a maximum) the tree is the same: each node
        fixes a few more choices (take this item or not), and the leaves are complete answers. Two numbers drive the search:
      </p>
      <ul>
        <li>
          <strong>best</strong>: the value of the best complete answer found so far. Every answer found is a real one, so the best answer is at
          least this.
        </li>
        <li>
          <strong>bound(node)</strong>: a number that no complete answer below this node can beat. It is an optimistic estimate, worked out
          quickly.
        </li>
      </ul>
      <Invariant label="Prune">If bound(node) ≤ best, nothing below the node can do better than best: skip the whole branch.</Invariant>
      <p>
        That is the whole method. Its correctness rests on one property of the bound: it must never be too small. A bound that is sometimes too
        small can throw away the best answer. A bound that is too large is safe, only slower.
      </p>
      <CodeBlock
        title="branch_and_bound.py"
        code={`def branch_and_bound(root, children, bound, value, complete):
    best = None
    stack = [root]                       # depth-first
    while stack:
        node = stack.pop()
        if complete(node):
            if best is None or value(node) > best:
                best = value(node)
            continue
        if best is not None and bound(node) <= best:
            continue                     # pruned: no answer below can win
        stack.extend(children(node))
    return best`}
      />

      <h2 id="safe">Why the bound is safe</h2>
      <p>
        For the 0/1 knapsack, sort the items by value per kilogram, best first. At a node, the items before position k are decided and{" "}
        <code>room</code> kilograms are left. The bound fills the room with the undecided items in that order, and when the next item no longer
        fits, takes the fraction of it that fills the room exactly.
      </p>
      <p>
        <strong>Why no real packing can beat it.</strong> Any real packing below the node uses whole undecided items within the room. That is
        also allowed in the fractional problem, where items may be cut. GRDY-1 proved that for the fractional problem, filling by best value per
        kilogram is optimal (an exchange argument). So the fractional value is at least the value of every whole-item packing: the bound is
        never too small. Round it down, since real values are whole numbers.
      </p>
      <p>
        Step through the figure. The four items are sorted by value per kilogram; the tags are the bounds. Then switch to the weaker bound,
        which adds up all the undecided values whatever they weigh. It is also safe, but it prunes far less.
      </p>
      <BnbFigure />

      <h2 id="order">Which node next</h2>
      <ul>
        <li>
          <strong>Depth first</strong> (a stack, or recursion), taking items before leaving them: it reaches complete answers quickly, so best
          becomes useful early, and it needs memory only for one path.
        </li>
        <li>
          <strong>Best first</strong>: keep the open nodes in a heap (HEAP-4) by bound, and always expand the one with the highest bound. It never expands a
          node whose bound is below the final answer, so it visits the fewest nodes, but the heap can grow very large.
        </li>
        <li>
          <strong>A good start:</strong> setting best to a greedy answer before the search (GRDY-5) lets pruning begin at the root.
        </li>
      </ul>

      <h2 id="cost">How fast it is</h2>
      <p>
        In the worst case, branch and bound visits exponentially many nodes: the problem is NP-hard, and some inputs defeat any known bound. In
        practice the bound decides everything. With items whose values have little to do with their weights, a hundred items take under a
        thousand nodes. When every item has almost the same value per kilogram, many branches have bounds just above the best, and the search grows; the
        practice tests include one such case of 60 items that needs about 5,600 nodes. A weak bound is slower on every test: on the same tests it
        passes two million nodes without finishing.
      </p>
      <p>
        The work per node matters too. The fractional bound costs <M>O(n)</M> to work out; prefix sums of the sorted weights and values plus a
        binary search (BSRC) bring it to <M>O(log n)</M>.
      </p>

      <h2 id="beyond">Beyond the knapsack</h2>
      <ul>
        <li>
          <strong>Travelling salesman:</strong> a cheapest spanning tree of the cities not yet visited (SPAN) gives a bound for the rest of the
          tour; sharper bounds use “one-trees” and penalties on vertex degrees.
        </li>
        <li>
          <strong>Integer programming:</strong> many problems can be written as a linear program (straight-line constraints and a straight-line
          goal) whose variables must be whole numbers. Dropping the whole-number rule gives a problem solvable in polynomial time, and its
          answer is a bound, just as cutting items was. Solvers branch on a variable with a fractional value. SciPy’s{" "}
          <code>scipy.optimize.milp</code> and OR-Tools do this, adding extra constraints (“cuts”) that bring the bound closer to the best answer.
        </li>
        <li>
          <strong>Games:</strong> alpha-beta pruning in chess programs is branch and bound for a game tree.
        </li>
      </ul>
      <Note title="Bounds from both sides">
        <p>
          A search that is stopped early still reports something useful: its best answer, and the largest bound among the open nodes. The true
          best lies between them, so you know how far from the best you are. Solvers report this as the “gap”.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/hard/practice/3/">HARD-P3, The most valuable load</Link>.
      </p>
    </>
  );
}
