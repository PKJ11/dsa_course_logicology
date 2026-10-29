import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SwapFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A greedy rule can look right and still be wrong, so it needs a proof. The most common proof is an exchange argument. Take any best
        answer, and change it step by step into the greedy answer, without ever making it worse. Then the greedy answer is at least as good as
        the best one, so it is a best answer too.
      </p>

      <h2 id="proof">How to prove a greedy method</h2>
      <p>
        Call the greedy answer <M>G</M>. Let <M>B</M> be any best answer; we know nothing about it except that no answer beats it. If{" "}
        <M>B</M> already equals <M>G</M>, there is nothing to prove. Otherwise, find a place where <M>B</M> does something the greedy rule would
        not do, and <strong>exchange</strong> it: change that part of <M>B</M> to what greedy does. Then show two things:
      </p>
      <ul>
        <li>the changed answer is still allowed (it breaks no rule of the problem);</li>
        <li>it is no worse than <M>B</M>.</li>
      </ul>
      <p>
        The changed answer is still a best answer, and it is one step closer to <M>G</M>. Repeat until it equals <M>G</M>. Nothing was lost on
        the way, so <M>G</M> is as good as <M>B</M>.
      </p>

      <h2 id="wait">Shortest job first</h2>
      <p>
        Jobs wait for one machine, which runs them one after another with no gaps. A job&rsquo;s owner waits until the job finishes. In which
        order should the jobs run so that the <em>total</em> waiting time, the sum of all the finish times, is as small as possible? The greedy
        rule: the shortest job first. The figure starts from an order that breaks the rule and repairs it, one swap of neighbours at a time.
      </p>

      <SwapFigure />

      <p>
        <strong>The exchange.</strong> Suppose a job <M>x</M> runs just before a shorter job <M>y</M>. Swap them. Every other job finishes at the
        same time as before, because the two together still take the same time. <M>y</M> now finishes earlier, by the length of <M>x</M>.{" "}
        <M>x</M> finishes later, by the length of <M>y</M>. So the total changes by <M>len(y) − len(x)</M>, which is negative (len(x) means the length of x).
      </p>
      <p>
        So an order with a longer job just before a shorter one is never the best: one swap improves it. A best order therefore has no such pair,
        which means it runs the jobs from shortest to longest. (Jobs of equal length can go in either order; the total is the same.)
      </p>
      <p>
        The same result in one line. Call the job that runs first j₁, the second j₂, and so on up to jₙ: the small number is the job&rsquo;s
        place in the order. The first job&rsquo;s length is part of every job&rsquo;s finish time, the second job&rsquo;s length is part of all
        but one, and so on. So the total is <M>n · len(j₁) + (n − 1) · len(j₂) + … + 1 · len(jₙ)</M>, where the dot · means times. The largest
        multiplier should go with the shortest job.
      </p>
      <CodeBlock
        title="wait.py"
        code={`def least_total_wait(lengths):
    t = total = 0
    for length in sorted(lengths):   # shortest first
        t += length                  # this job finishes at t
        total += t
    return total`}
      />

      <h2 id="late">Earliest deadline first</h2>
      <p>
        Now each job also has a deadline. A job that finishes after its deadline is <strong>late</strong> by the difference; one that finishes on
        time is late by 0. The goal: make the <em>largest</em> lateness as small as possible. The greedy rule: run the jobs in order of
        deadline, earliest first. Switch the figure to &ldquo;Least lateness&rdquo;.
      </p>
      <p>
        <strong>The exchange.</strong> Suppose <M>x</M> runs just before <M>y</M>, but <M>y</M> is due earlier. Let <M>f</M> be the time at which
        the second of the two finishes. Swap them:
      </p>
      <ul>
        <li>
          <M>y</M> now finishes earlier than before, so it is late by no more than before.
        </li>
        <li>
          <M>x</M> now finishes at <M>f</M>, so it is late by <M>f − due(x)</M> (due(x) is the deadline of x), or not at all. Before the swap, <M>y</M> finished at{" "}
          <M>f</M> and was late by <M>f − due(y)</M>, which is more, because <M>due(y) &lt; due(x)</M>.
        </li>
        <li>No other job moves.</li>
      </ul>
      <p>
        So the largest lateness does not go up. Repeating the swap turns any order into the deadline order without making it worse, so the
        deadline order is a best order. Notice that this proof says &ldquo;no worse&rdquo;, not &ldquo;better&rdquo;: that is enough.
      </p>
      <Note title="Rules that look just as good, and fail">
        <p>
          <strong>Shortest first:</strong> a 1-hour job due in 100 hours and a 10-hour job due in 10 hours. Shortest first makes the long job
          late by 1; deadline first makes nothing late.
        </p>
        <p>
          <strong>Least slack first</strong> (slack is the deadline minus the length: how long the job can wait): a 1-hour job due at 2 (slack
          1) and a 10-hour job due at 10 (slack 0). Least slack first runs the long job first, and the short one is late by 9. Deadline first
          makes the long one late by only 1.
        </p>
      </Note>

      <h2 id="recipe">The recipe</h2>
      <Invariant label="Exchange">Any best answer can be changed, one exchange at a time, into the greedy answer without getting worse.</Invariant>
      <ol>
        <li>Say exactly what the greedy algorithm chooses.</li>
        <li>Take any best answer. Find the first place where it differs from the greedy answer.</li>
        <li>Exchange: change that part to the greedy choice. Show the result is still allowed and no worse.</li>
        <li>Each exchange brings the answer closer to the greedy one, so after a finite number of them they are equal.</li>
      </ol>
      <p>
        A neat way to count &ldquo;closer&rdquo; for orders is the number of <strong>inversions</strong>: pairs that are in the opposite order to
        the greedy order (SORT-1). Swapping an out-of-order pair of neighbours removes exactly one inversion, so at most{" "}
        <M>n(n − 1) / 2</M> swaps are needed. The proof only needs the swaps to exist; nobody has to carry them out.
      </p>

      <h2 id="bag">Back to the bag</h2>
      <p>
        Lesson 1&rsquo;s rule (the most value per kg first) has an exchange proof too. Suppose a best bag holds less of the item with the most
        value per kg than it could. Then the bag either has empty space, or it holds a kilogram of some other item. Replace that kilogram (or fill
        that space) with a kilogram of the best item. The weight stays within the limit, and the value goes up or stays the same. Repeat until the
        bag matches the greedy bag.
      </p>
      <p>
        This argument cuts a kilogram out of an item. When items must be taken whole, the exchange is not allowed, and indeed the rule fails
        (lesson 5).
      </p>
    </>
  );
}
