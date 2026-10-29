import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ApproxFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        When the best answer is too expensive to find, settle for a good one, but not on faith: an approximation algorithm comes with a proof
        that its answer is never worse than a fixed factor times the best, on every input, even though the best is never computed.
      </p>

      <h2 id="ratio">A guarantee instead of the best</h2>
      <p>
        For a problem where smaller is better, a method has <strong>approximation ratio</strong> ρ (the Greek letter rho) if, for every input,
      </p>
      <Invariant label="Ratio">answer ≤ ρ × best possible answer</Invariant>
      <p>
        For problems where larger is better, the answer is at least the best divided by ρ, or at least <M>(1 − ε)</M> times the best for a small
        ε (epsilon). The difficulty is that the best answer is unknown; the proofs compare the method’s answer with a{" "}
        <strong>lower bound</strong> on the best (for a smallest-is-best problem), something easy to compute that the best can never go under.
        Each proof below finds such a bound first.
      </p>

      <h2 id="cover">Vertex cover within 2</h2>
      <p>
        Go through the edges. When an edge has neither end in the cover, put both ends in. Step through the first version of the figure.
      </p>
      <ApproxFigure />
      <CodeBlock
        title="cover_within_2.py"
        code={`def cover_within_2(n, edges):
    cover = set()
    for u, v in edges:
        if u not in cover and v not in cover:
            cover.add(u)                 # take both ends of an edge
            cover.add(v)                 # that nothing covers yet
    return cover`}
      />
      <p>
        <strong>Why within 2.</strong> The edges that put vertices in the cover share no vertex: each was chosen when neither end was in the
        cover yet. So they form a matching (FLOW-5) of, say, M edges, and the cover has exactly 2M vertices. Any cover, the best included, needs
        one end of each of those M edges, and no vertex is an end of two of them, so the best cover has at least M vertices. Hence{" "}
        <M>2M ≤ 2 × best</M>. The result is a cover, because an edge left uncovered would have been taken.
      </p>
      <p>
        No method with a fixed ratio below 2 is known for vertex cover in general graphs. Taking only one end of each edge, or first the
        vertex that touches the most edges, sounds smarter but has no fixed ratio at all: on a star, one end per edge can take every leaf.
      </p>

      <h2 id="tour">A round trip within 2</h2>
      <p>
        For the travelling salesman with the <strong>triangle rule</strong> (going straight from a to c is never longer than going through
        b, true for distances on a map), the second version of the figure builds a tour from a cheapest spanning tree:
      </p>
      <ol>
        <li>Build a cheapest spanning tree (SPAN-2 or SPAN-3).</li>
        <li>Walk round it depth-first, along each edge twice: the walk costs exactly 2 × the tree.</li>
        <li>Visit the cities in the order the walk first reaches them, going straight to the next new city.</li>
      </ol>
      <p>
        <strong>Why within 2.</strong> Remove one edge from the best tour: the rest is a spanning tree, so the cheapest tree costs at most the
        best tour. The walk costs 2 × tree ≤ 2 × best. Each straight step of step 3 replaces a stretch of the walk, and by the triangle rule it
        is never longer. So the tour costs at most 2 × best.
      </p>
      <p>
        Christofides’s method (1976) adds a cheapest matching on the tree’s odd-degree vertices and reaches 1.5. Without the triangle rule, no
        ratio at all is possible unless P = NP: lesson 2’s reduction from Hamiltonian cycle can be made with “missing” pairs so long that any
        method within a factor ρ would detect a Hamiltonian cycle.
      </p>

      <h2 id="load">Balancing machines</h2>
      <p>
        n jobs with given lengths must run on m identical machines; each machine runs its jobs one after another. Make the busiest machine’s
        total, the <strong>makespan</strong>, as small as possible. It is NP-hard (partition is the case m = 2). Two lower bounds on the best:
        the average load, <M>total / m</M>, and the longest single job.
      </p>
      <p>
        <strong>List scheduling</strong> (Graham, 1966): take the jobs in the given order, each onto the machine that is least loaded so far.
        Look at the job j that finishes last. When it was placed, its machine was the least loaded, so at most the average of the other jobs:{" "}
        <M>start ≤ (total − pⱼ)/m</M>, where pⱼ is the length of job j. So the makespan is at most{" "}
        <M>total/m + pⱼ(1 − 1/m)</M> <M>≤ best + best × (1 − 1/m)</M>: within{" "}
        <M>2 − 1/m</M>.
      </p>
      <p>
        <strong>Longest first</strong> (Graham, 1969): sort the jobs from longest to shortest, then do list scheduling. Its ratio is{" "}
        <M>4/3 − 1/(3m)</M>. In outline: remove every job placed after the job j that finishes last; that leaves the makespan the same and only
        lowers the best, and now j is the shortest job. If j is at most a third of the best, the argument above gives at most{" "}
        <M>best + best/3</M>. If j is longer than a third, every job is, so the best schedule has at most two jobs per machine, and for such
        inputs longest-first is exactly optimal. The practice problem asks for this, with a heap of machines by load (HEAP-4) so that each
        placement costs <M>O(log m)</M>.
      </p>

      <h2 id="knap">The knapsack within any percentage</h2>
      <p>
        GRDY-5 said that for the 0/1 knapsack, the better of “greedy by value per kilogram” and “the single most valuable item that fits” is at
        least half the best. <strong>Why:</strong> greedy’s items plus the first item that did not fit are worth at least the fractional
        optimum (lesson 3), which is at least the best. So greedy plus that one item is at least the best, and the larger of the two is at least
        half of it.
      </p>
      <p>
        Better still, any ratio <M>1 − ε</M> can be reached. Let V be the largest single value that fits, and <M>K = εV/n</M>. Round every value
        down to a whole number of K’s, <M>⌊v / K⌋</M>, which is at most <M>n/ε</M>. Run the table by values from DYNP-8 (the least weight for
        each total value) on the rounded values: <M>O(n² · n/ε) = O(n³/ε)</M>. Each item loses less than K by rounding, so a packing loses less
        than <M>nK = εV ≤ ε × best</M>. A method whose time is polynomial in both n and <M>1/ε</M> like this is called a{" "}
        <strong>fully polynomial-time approximation scheme</strong> (FPTAS).
      </p>

      <h2 id="limits">Set cover, and the limits</h2>
      <p>
        <strong>Set cover:</strong> given sets of elements, pick the fewest sets that cover every element. Greedy picks, again and again, the
        set covering the most elements not yet covered. <strong>Ratio ln n</strong> (the natural logarithm of n, about 2.3 × the number of
        digits of n). Why, in outline: when k elements are still uncovered, the best answer covers them with “best” sets, so some set covers at
        least k / best of them, and greedy takes a set at least that good. Charging each newly covered element its share, the k-th element from
        the end costs at most best / k; adding up over k gives{" "}
        <M>best × (1 + 1/2 + … + 1/n) ≈ best × ln n</M>.
      </p>
      <p>
        Some ratios cannot be improved unless P = NP. Set cover cannot beat about ln n; vertex cover cannot go below about 1.36, and many
        believe 2 is the true limit; the general travelling salesman has no ratio at all. These limits come from the PCP theorem (1992), a
        strengthening of Cook–Levin which shows that certificates can be checked by reading only a few of their bits.
      </p>
      <Note title="In practice">
        <p>
          A guarantee is a worst case. Greedy and local improvement (swap two jobs, reverse a stretch of a tour) are usually much closer to the
          best than their ratios say, and a lower bound computed on the actual input tells you how close.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/hard/practice/4/">HARD-P4, Balancing the machines</Link>.
      </p>
    </>
  );
}
