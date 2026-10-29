import { Invariant, M, Note } from "../../_components/Prose";
import { CostFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        With union by rank and path compression together, one find can still take log₂ n steps. But over a long run of operations, the average
        is so small that it is at most 4 or 5 for any n that will ever be used. This lesson shows the numbers and the idea of the proof.
      </p>

      <h2 id="amortised">Cost over many operations</h2>
      <p>
        Path compression makes a slow find speed up the finds after it. So the right question is not &ldquo;how slow can one find be?&rdquo; but
        &ldquo;how much do <M>m</M> operations cost together?&rdquo;. The total divided by <M>m</M> is called the <strong>amortised</strong> cost
        of an operation: the cost shared out over the whole run, as BIGO-7 did for appending to a list. It is a guarantee about every run of
        operations, not an average over random inputs.
      </p>

      <h2 id="measured">What the numbers show</h2>
      <p>
        The figure shows numbers measured by a short program: the average number of parent steps per operation, for growing <M>n</M>, and for
        four versions of union-find: with neither rule, with union by rank only, with path compression only, and with both.
      </p>
      <CostFigure />
      <ul>
        <li>
          <strong>Chain of unions.</strong> With no rule, the path grows to length <M>n − 1</M> and the average grows with <M>n</M>: thousands of
          steps per operation. Either rule alone fixes this order of operations.
        </li>
        <li>
          <strong>Equal unions.</strong> This order makes rank-only trees as tall as the proof of lesson 2 allows, so rank alone grows like{" "}
          <M>log₂ n</M>. With compression, each long find flattens its path, and the average stays below 2.
        </li>
      </ul>

      <h2 id="logstar">The iterated logarithm</h2>
      <p>
        The first proof of the bound (by Hopcroft and Ullman, 1973) uses a function that grows extremely slowly. <M>log* n</M> (&ldquo;log
        star&rdquo;) is the number of times you must take <M>log₂</M>, one after another, before the result is 1 or less. The third variant of
        the figure counts it for{" "}
        <M>
          n = 2<sup>65536</sup>
        </M>{" "}
        (2 to the power 65,536): 5 times. For any <M>n</M> that fits in a computer, <M>log* n ≤ 5</M>: log* n is at most 5.
      </p>
      <Invariant label="Bound">m operations on n elements cost O((m + n) · log* n) parent steps in total.</Invariant>
      <p>The proof sketch has three facts and one way of counting.</p>
      <ol>
        <li>
          <strong>Ranks go up along every path.</strong> A parent always has a higher rank than its child. Union puts a lower rank under a higher
          one (or raises the top one), and compression only gives a node a new parent further up the same path, which has an even higher rank.
        </li>
        <li>
          <strong>High ranks are rare.</strong> By lesson 2, a node that reached rank <M>r</M> had at least{" "}
          <M>
            2<sup>r</sup>
          </M>{" "}
          elements below it at that moment, and two nodes of the same rank never share those elements. So at most{" "}
          <M>
            n / 2<sup>r</sup>
          </M>{" "}
          nodes ever have rank <M>r</M>.
        </li>
        <li>
          <strong>Put the ranks into groups</strong> whose ends grow as fast as possible: ranks 0 to 1, then 2, then 3 to 4, then 5 to 16, then 17
          to 65,536. Each group ends at 2 to the power of the previous end. There are at most <M>log* n + 1</M> groups.
        </li>
      </ol>
      <p>
        Now count the parent steps of one find. A step from a node whose parent is in a <em>higher</em> group, or whose parent is the root, is
        paid by the find: there are at most <M>log* n + 2</M> such steps, because ranks only go up along the path. Every other step is paid by
        the node itself. Each time a node pays, compression gives it a new parent with a higher rank in the same group, or in a higher one. A group
        from rank <M>k + 1</M> to{" "}
        <M>
          2<sup>k</sup>
        </M>{" "}
        lets a node pay at most{" "}
        <M>
          2<sup>k</sup>
        </M>{" "}
        times before its parent leaves the group, and after that the find pays for it. By fact 2, at most{" "}
        <M>
          n / 2<sup>k</sup>
        </M>{" "}
        nodes have a rank in that group, so the nodes of one group pay at most <M>n</M> steps in all, and all groups together at most{" "}
        <M>n · (log* n + 1)</M>. Add the finds&rsquo; own share, <M>m · (log* n + 2)</M>, and the bound follows.
      </p>

      <h2 id="alpha">The exact bound</h2>
      <p>
        In 1975 Robert Tarjan proved a sharper bound: <M>O(m · α(n))</M>, where α is the <strong>inverse Ackermann function</strong>. The
        Ackermann function grows faster than any tower of powers, so its inverse grows even more slowly than <M>log* n</M>: α(n) is at most 4 for
        every n below a number far too large to write down. He also proved that no method of this kind can do better, so the bound is exact.
      </p>
      <p>
        In practice, treat both find and union as <M>O(1)</M>: a constant that is at most about 4 or 5. That is what &ldquo;nearly O(1)&rdquo;
        means.
      </p>
      <Note title="One slow find is still possible">
        <p>
          The bound is about the total. A single find can still go up about <M>log₂ n</M> parents, for example the first find after many equal
          unions. If one operation must never be slow (a real-time system), this matters; for a program that runs many operations, it does not.
        </p>
      </Note>
    </>
  );
}
