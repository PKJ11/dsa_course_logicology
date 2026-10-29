import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { GrowFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        Most calls to <code>append</code> take one step, but now and then one takes very many steps. Amortised analysis looks at the total cost of many
        operations, and shows that the average cost per operation is small, even in the worst case.
      </p>

      <h2 id="doubling">A list that grows</h2>
      <p>
        A Python list keeps its values side by side in one block of memory. That is what makes <code>a[i]</code> fast: the computer works out where
        value <M>i</M> is from where the block starts (ARRS-1). But a block cannot simply get longer, because the memory after it may already be
        in use.
      </p>
      <p>
        So a list sets aside more room than it needs. While there is spare room, <code>append</code> writes the value into it, which is one
        step. When the room runs out, the list gets a new, bigger block and copies every value across. That one append costs <M>n</M> steps.
      </p>

      <GrowFigure />

      <h2 id="aggregate">Total cost over many appends</h2>
      <p>
        Count the whole cost of <M>n</M> appends, starting from an empty list that doubles when full. Each append writes one value: <M>n</M>{" "}
        writes. The copies happen when the size reaches 1, 2, 4, 8, and so on, up to at most <M>n</M>. They copy
      </p>
      <Invariant label="Copies">1 + 2 + 4 + … + 2ᵏ = 2ᵏ⁺¹ − 1 &lt; 2n</Invariant>
      <p>
        values, where <M>2ᵏ</M> is the last copy size, which is at most <M>n</M>. So <M>n</M> appends cost fewer than <M>n + 2n = 3n</M> steps.
        Spread over <M>n</M> appends, that is fewer than 3 steps each. We say <code>append</code> is <em>amortised</em> <M>O(1)</M>.
      </p>
      <p>
        This is a worst-case promise about the total, not a guess about likely inputs. Any sequence of <M>n</M> appends costs <M>O(n)</M>.
        One single append can still cost <M>Θ(n)</M>.
      </p>

      <h2 id="bank">The banker&rsquo;s view</h2>
      <p>
        A second way to see the same result: charge every append 3 coins instead of 1. One coin pays for writing the value. The other two are
        saved with it.
      </p>
      <p>
        Just after a copy into a block of size <M>2m</M>, the list holds <M>m</M> values and has no coins saved. The next <M>m</M> appends each save
        2 coins, which is <M>2m</M> coins. At that point the block is full, and the copy of <M>2m</M> values is paid for by the <M>2m</M> saved
        coins. Coins never run out, so 3 coins per append always cover the real cost.
      </p>
      <p>
        This method is handy when the expensive step is harder to add up directly. The union-find station (DSUF) uses the same kind of
        argument.
      </p>

      <h2 id="why-double">Why double, not add 10</h2>
      <p>
        Step through the second version of the figure. If the list adds a fixed amount of room <M>k</M> each time, a copy happens every{" "}
        <M>k</M> appends, and the copies cost <M>k + 2k + 3k + …</M> up to <M>n</M>. That is about <M>n² / (2k)</M>, which is <M>Θ(n²)</M> total, or{" "}
        <M>Θ(n)</M> per append.
      </p>
      <p>
        Any growth by a fixed <em>factor</em> works: doubling, or growing by half, or by an eighth. CPython&rsquo;s list grows by about one eighth
        plus a little, which wastes less memory but copies more often. The amortised cost is still <M>O(1)</M>.
      </p>
      <Note title="Shrinking needs care">
        <p>
          If a list halved its room as soon as it was half full, a run of append, pop, append, pop at exactly that size would copy every time.
          The usual fix is to shrink only when the list is a quarter full.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bigo/practice/4/">BIGO-P4, A growing platform</Link>, where you build this list yourself and count its copies.
      </p>
    </>
  );
}
