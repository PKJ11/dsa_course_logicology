import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { FailFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A greedy rule is easy to invent and easy to believe. Many are wrong. This lesson shows typical failures, a test that decides when the
        &ldquo;largest coin first&rdquo; rule is safe, a cheap way to catch a wrong rule before trusting it, and the structure that makes greedy
        always right.
      </p>

      <h2 id="fails">Counterexamples</h2>
      <p>
        A <strong>counterexample</strong> is one input on which the rule gives a worse answer than the best one. One counterexample is enough to
        show that a rule is wrong (CORR-4). The figure shows two.
      </p>

      <FailFigure />

      <ul>
        <li>
          <strong>Coins 1, 3 and 4.</strong> The largest coin first makes 6 as 4 + 1 + 1, but 3 + 3 uses two coins. Taking the 4 first leaves 2,
          which needs two 1s.
        </li>
        <li>
          <strong>Whole items.</strong> Lesson 1&rsquo;s rule (the most value per kg) fails when items cannot be cut. The exchange in lesson 2
          moved one kilogram at a time, and that is not allowed here.
        </li>
      </ul>
      <p>Other well-known failures:</p>
      <ul>
        <li>
          <strong>Bookings with values</strong> (lesson 3): ends first ignores the money.
        </li>
        <li>
          <strong>Visiting every city on the shortest round trip:</strong> always going to the nearest city not yet visited can produce a trip
          far longer than the best one.
        </li>
        <li>
          <strong>Colouring a map with the fewest colours</strong> by giving each region the first colour its neighbours do not use: the answer
          depends on the order, and can be far from the fewest.
        </li>
      </ul>
      <p>
        In every case, a choice that looked best now removed a better choice later, and greedy never goes back. That is the difference from
        dynamic programming, which keeps the best answer for every smaller problem, and from backtracking, which tries the other choices.
      </p>

      <h2 id="coins">Which coin systems are safe</h2>
      <p>
        A coin system is called <strong>canonical</strong> when the largest coin first gives the fewest coins for every amount. India&rsquo;s
        coins and notes (1, 2, 5, 10, 20, 50, 100, 200, 500) are canonical, and so are most countries&rsquo;. The system 1, 3, 4 is not.
      </p>
      <p>
        Checking every amount is impossible: there are infinitely many. But a theorem by Kozen and Zaks (1994) limits the search. If the system
        is not canonical, the smallest amount where greedy fails is less than the sum of the two largest coins.
      </p>
      <Invariant label="Coins">If greedy change ever fails, it fails for some amount below the sum of the two largest coins.</Invariant>
      <p>
        So it is enough to compare the greedy answer with the true fewest number of coins for every amount below that sum. The fewest coins for
        every amount up to a limit can be found with a short loop, because the best way to make <M>x</M> uses some last coin <M>c</M>, and
        before it, the best way to make <M>x − c</M>:
      </p>
      <CodeBlock
        title="fewest.py"
        code={`def fewest_coins(coins, limit):
    # fewest[x] = the fewest coins that make x, for x < limit
    fewest = [0] * limit
    for x in range(1, limit):
        fewest[x] = 1 + min(fewest[x - c] for c in coins if c <= x)
    return fewest`}
      />
      <p>
        This assumes a coin of 1, so every amount can be made. It costs <M>O(limit × number of coins)</M>. This loop is the first example of
        dynamic programming, the subject of DYNP: it reuses the answers for smaller amounts instead of searching again.
      </p>

      <h2 id="test">Testing a greedy idea</h2>
      <p>
        Before trying to prove a rule, try to break it. Write a brute force that tries every possible answer, run both on thousands of small random
        inputs, and compare (CORR-5). Small inputs are enough: almost every wrong rule fails on an input of five or six items, and the program
        prints it.
      </p>
      <CodeBlock
        title="try_rule.py"
        code={`import random
from itertools import combinations

def best_by_brute_force(items, cap):
    best = 0
    for k in range(len(items) + 1):
        for pick in combinations(items, k):
            if sum(w for w, v in pick) <= cap:
                best = max(best, sum(v for w, v in pick))
    return best

# greedy(items, cap) is the rule being tested
for trial in range(10_000):
    items = [(random.randint(1, 6), random.randint(1, 9))
             for _ in range(5)]
    if greedy(items, 8) != best_by_brute_force(items, 8):
        print("counterexample:", items)
        break`}
      />
      <p>
        If the test finds nothing, the rule may still be wrong for larger inputs, so it is not a proof. But a rule that survives is worth trying
        to prove, with an exchange argument or by showing that greedy stays ahead.
      </p>

      <h2 id="matroid">When greedy always works</h2>
      <p>
        There is a kind of structure on which greedy is always right. Say some sets of items are <strong>allowed</strong>, with two rules:
      </p>
      <ol>
        <li>every part of an allowed set is allowed (taking an item out never breaks anything);</li>
        <li>
          if one allowed set is smaller than another, some item of the larger one can be added to the smaller one, and the result is still
          allowed.
        </li>
      </ol>
      <p>
        Such a structure is called a <strong>matroid</strong>. For a matroid, this greedy method finds the allowed set with the largest total
        weight, whatever the weights are: go through the items from heaviest to lightest, and add each one that keeps the set allowed. The proof
        is an exchange argument that uses rule 2.
      </p>
      <ul>
        <li>
          <strong>A matroid:</strong> the sets of edges of a graph that contain no loop. That is why Kruskal&rsquo;s method, which takes edges
          from cheapest to most expensive and skips any that close a loop, finds a cheapest spanning tree (SPAN-2).
        </li>
        <li>
          <strong>Not a matroid:</strong> the sets of items that fit in a bag. One heavy item fits, and so do two light ones; but neither light
          item can be added to the heavy one. Rule 2 fails, and so does greedy.
        </li>
      </ul>
      <p>
        Interval scheduling and Huffman coding are not matroids, yet greedy works for them: their own exchange arguments do the job. A matroid is
        a sufficient reason for greedy to work, not the only one.
      </p>

      <h2 id="next">What to do instead</h2>
      <ul>
        <li>
          <strong>Dynamic programming</strong> (DYNP): when the problem breaks into smaller problems of the same kind, keep the best answer to
          each, as the coin loop above does. The 0/1 knapsack, coin change and bookings with values are all solved this way.
        </li>
        <li>
          <strong>Backtracking with pruning</strong> (RECR-5): try the choices, and stop early when a branch cannot beat the best answer found.
          A greedy answer is a good first &ldquo;best so far&rdquo;.
        </li>
        <li>
          <strong>Greedy as an approximation</strong> (HARD-4): for some hard problems greedy cannot be best, but it is provably close. For the
          0/1 knapsack, the better of &ldquo;greedy by value per kg&rdquo; and &ldquo;the single most valuable item that fits&rdquo; is always at
          least half of the best.
        </li>
      </ul>
      <Note title="Greedy inside other methods">
        <p>
          Many well-known methods are greedy inside: Dijkstra&rsquo;s shortest paths (PATH-3) always settles the nearest place not yet
          settled; Prim and Kruskal (SPAN) take the cheapest safe edge. Each comes with its own exchange proof, and each fails when its
          conditions are broken. Dijkstra, for example, fails when some roads have negative lengths.
        </p>
      </Note>
    </>
  );
}
