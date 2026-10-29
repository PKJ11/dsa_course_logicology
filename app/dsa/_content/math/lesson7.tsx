import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ChanceFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        Many algorithms use random choices: a random pivot (SORT-3), a hash function chosen at random (HASH-4), the coin flips of a skip list
        (BALT-6). To say how fast they are, or how often they go wrong, you need a few tools from probability. This lesson gives those tools,
        then uses them for two classic tasks: shuffling fairly, and sampling from a stream.
      </p>

      <h2 id="chance">Chances as fractions</h2>
      <p>
        When every outcome is equally likely, the <strong>probability</strong> (chance) of an event is the number of outcomes where it happens,
        divided by the number of all outcomes. Two dice have 6 · 6 = 36 outcomes, and 6 of them add up to 7, so the chance of a 7 is 6/36 =
        1/6. A chance is always between 0 (never) and 1 (always).
      </p>
      <ul>
        <li>
          <strong>Not:</strong> the chance that an event does <em>not</em> happen is 1 minus its chance.
        </li>
        <li>
          <strong>Both:</strong> if two events are <strong>independent</strong> (knowing one tells you nothing about the other), the chance of
          both is the product: two coin flips both heads, 1/2 · 1/2 = 1/4.
        </li>
        <li>
          <strong>At least one:</strong> is often easiest as &ldquo;not none&rdquo;. The chance of at least one 6 in four rolls is 1 − (5/6)⁴,
          about 0.52.
        </li>
      </ul>

      <h2 id="expect">Expected value</h2>
      <p>
        The <strong>expected value</strong> of a random number is its average over all outcomes, each weighted by its chance. A die gives 1 to
        6, each with chance 1/6, so its expected value is (1 + 2 + … + 6) / 6 = 3.5. When we say random quicksort makes about{" "}
        <M>1.39 n log₂ n</M> comparisons, we mean the expected number.
      </p>
      <Invariant label="Linearity">The expected value of a sum is the sum of the expected values, always.</Invariant>
      <p>
        This holds even when the parts depend on each other, which makes it the most useful rule here. The usual method is to write a count as
        a sum of <strong>indicators</strong>: numbers that are 1 if something happens and 0 if not. The expected value of an indicator is just
        the chance that it happens.
      </p>
      <ul>
        <li>
          <strong>Items left in place by a shuffle.</strong> Item i stays in its place with chance 1/n. There are n items, so on average n ·
          1/n = 1 item stays in place, whatever n is. Working this out from all n! orders directly is much harder.
        </li>
        <li>
          <strong>Colliding keys in a hash table.</strong> n keys go into m buckets at random. Each of the C(n, 2) pairs (lesson 6) lands in
          the same bucket with chance 1/m, so the expected number of colliding pairs is C(n, 2) / m.
        </li>
      </ul>

      <h2 id="repeats">Repeats and waiting</h2>
      <p>
        <strong>The birthday problem.</strong> Pick k values at random from d possible values. The chance that all are different is (1 − 1/d)
        · <span className="nowrap">(1 − 2/d)</span> · … · <span className="nowrap">(1 − (k − 1)/d)</span>: the second value must avoid the first, the third must avoid two, and so on. With d = 365 days, 23
        people already give a better than even chance that two share a birthday. In general a repeat becomes likely after about{" "}
        <M>√d</M> values (about <M>1.18 √d</M> for an even chance), far fewer than d.
      </p>
      <p>
        This matters for hashing. With 32-bit hash values (d about 4.3 billion), two keys share a hash after only about 77,000 keys; with 64-bit
        values, after about 5 billion. So a program that treats equal hashes as equal keys will be wrong sooner than d suggests.
      </p>
      <p>
        <strong>Waiting for success.</strong> If each try succeeds with chance p, independently, the expected number of tries is 1/p: a die
        needs 6 rolls on average to show a 6. To see <em>every</em> one of n values, the wait is n/n + n/(n − 1) + … + n/1, about{" "}
        <M>n ln n</M> (ln is the natural logarithm): about 519 draws for n = 100. This is the coupon collector&rsquo;s problem.
      </p>

      <h2 id="shuffle">A fair shuffle</h2>
      <p>
        A shuffle is <strong>fair</strong> if every order of the n items has the same chance, 1/n!. The Fisher–Yates shuffle (1938, written
        for computers by Durstenfeld in 1964) does it in one pass:
      </p>
      <CodeBlock
        title="shuffle.py"
        code={`import random

def shuffle(a):
    for i in range(len(a) - 1, 0, -1):
        j = random.randint(0, i)     # 0 to i, both included
        a[i], a[j] = a[j], a[i]`}
      />
      <p>
        <strong>Why is it fair?</strong> The last place gets each of the n items with chance 1/n. Then the place before it gets each of the
        remaining n − 1 with chance 1/(n − 1), and so on. So any one order has chance <M>(1/n) · (1/(n − 1)) · … · (1/1) = 1/n!</M>. The figure
        steps through it, then counts the orders that a common mistake produces.
      </p>
      <ChanceFigure />
      <p>
        The mistake swaps every place with a random place chosen from <em>all</em> n. That makes <M>nⁿ</M> equally likely runs, and for n above
        2, <M>nⁿ</M> is not a multiple of n!, so the orders cannot all be equally likely. Python&rsquo;s <code>random.shuffle</code> is
        Fisher–Yates, and <code>random.sample(items, k)</code> picks k items fairly.
      </p>

      <h2 id="sample">Sampling a stream</h2>
      <p>
        Now pick k items fairly from a stream: a sequence read once, item by item, whose length you do not know in advance (lines of a huge
        log, for example). <strong>Reservoir sampling</strong> keeps k slots. The first k items fill them. For each later item i (counting from
        0), pick j at random from 0 to i; if j &lt; k, the item replaces slot j, and otherwise it is skipped. The third version of the figure
        steps through it.
      </p>
      <Invariant label="Claim">After i + 1 items, each of them is in the sample with chance k / (i + 1).</Invariant>
      <p>
        <strong>Why?</strong> By induction on i. The new item i goes in with chance k / (i + 1), because j &lt; k for k of the i + 1 values.
        An older item was in the sample with chance k / i before this step. It is thrown out only if j hits its own slot, which has chance 1 /
        (i + 1). So it stays with chance <M>k/i · (1 − 1/(i + 1)) = k/i · i/(i + 1) = k/(i + 1)</M>. MATH-P7 asks for the code, with the random
        numbers passed in so the tests can check it.
      </p>

      <h2 id="random">Randomness in code</h2>
      <ul>
        <li>
          <strong>Pseudo-random numbers.</strong> Python&rsquo;s <code>random</code> module computes its numbers from a starting value, the{" "}
          <strong>seed</strong>. <code>random.seed(42)</code> makes every run produce the same numbers, which makes bugs repeatable. For
          passwords and keys, use the <code>secrets</code> module instead, whose numbers cannot be predicted.
        </li>
        <li>
          <strong>Two kinds of random algorithm.</strong> Some are always right and only their time is random, like quickselect with a random
          pivot (SORT-8). Others are always fast and wrong with a small chance, like a Bloom filter&rsquo;s false positives (HASH-8) or the
          Miller–Rabin prime test. HARD-5 studies both.
        </li>
        <li>
          <strong>Testing random code.</strong> A test must not pass or fail by luck. Pass the random function in, so a test can give fixed
          choices; or fix the seed; or check a property that holds for every outcome. MATH-P7&rsquo;s tests do all three: they even try every
          possible run of choices and count the results.
        </li>
      </ul>
      <Note title="Random input against a random algorithm">
        <p>
          &ldquo;Quicksort with the first element as pivot is fast on random input&rdquo; is a claim about the input, and an attacker can send
          sorted input. &ldquo;Quicksort with a random pivot is fast on every input, on average over its own choices&rdquo; holds whoever
          chooses the input. Random choices inside the algorithm are the stronger guarantee.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/math/practice/7/">MATH-P7, A fair sample from a stream</Link>.
      </p>
    </>
  );
}
