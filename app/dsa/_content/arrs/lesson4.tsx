import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PrefixFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Some problems ask many questions about ranges of one list: the sum from index l to index r, again and again. Some apply many changes to
        ranges. Doing each one value by value is slow. One pass of preparation makes each one cost <M>O(1)</M>.
      </p>

      <h2 id="prefix">Prefix sums</h2>
      <p>
        Build a list <code>P</code> of length <M>n + 1</M>, where <code>P[i]</code> is the sum of the first <M>i</M> values. So <code>P[0] = 0</code>{" "}
        and <code>P[i + 1] = P[i] + a[i]</code>. You built the same totals in <Link href="/dsa/pyth/practice/2/">PYTH-P2</Link>; the extra 0 at the
        front is what makes the next step neat.
      </p>
      <Invariant label="Range sum">sum of a[l..r] = P[r + 1] − P[l]</Invariant>
      <p>
        <code>P[r + 1]</code> adds up <code>a[0]</code> to <code>a[r]</code>. <code>P[l]</code> adds up <code>a[0]</code> to <code>a[l − 1]</code>. Take
        one from the other and only <code>a[l]</code> to <code>a[r]</code> is left. Thanks to <code>P[0] = 0</code>, the formula also works for{" "}
        <M>l = 0</M>, with no special case.
      </p>

      <PrefixFigure />

      <CodeBlock
        code={`from itertools import accumulate
P = [0] + list(accumulate(a))          # O(n), once

def range_sum(l, r):                    # O(1), each time
    return P[r + 1] - P[l]`}
      />
      <p>
        With <M>q</M> questions, this is <M>O(n + q)</M> in total, instead of <M>O(n × q)</M>. The same idea works for anything you can
        &ldquo;take away&rdquo;: counts, or XOR (BITS station). It does not work for the minimum, because a minimum cannot be undone. Range minimums
        need the structures in the RNGQ station.
      </p>

      <h2 id="counting">Counting with prefix sums</h2>
      <p>
        Prefix sums also count ranges. A run <code>a[l..r]</code> adds up to <M>k</M> exactly when <M>P[r + 1] − P[l] = k</M>, which means{" "}
        <M>P[l] = P[r + 1] − k</M>. So go through <code>P</code> once, keeping a dictionary of how many times each earlier value has appeared:
      </p>
      <CodeBlock
        code={`def count_runs(a, k):
    seen = {0: 1}           # P[0] = 0 has appeared once
    s = 0
    count = 0
    for x in a:
        s += x              # s is the next prefix sum
        count += seen.get(s - k, 0)
        seen[s] = seen.get(s, 0) + 1
    return count`}
      />
      <p>
        This works with negative values too, where a sliding window (lesson 3) fails. It is <M>O(n)</M> on average.
      </p>

      <h2 id="diff">Difference arrays</h2>
      <p>
        Now the opposite job. You start with a list of zeros and get many updates of the form &ldquo;add <M>k</M> to every value from{" "}
        <M>l</M> to <M>r</M>&rdquo;. At the end you want the final list. Step through the second version of the figure.
      </p>
      <p>
        Keep a difference list <code>d</code> of length <M>n + 1</M>. For each update, do <code>d[l] += k</code> and <code>d[r + 1] -= k</code>. At the
        end, the running total of <code>d</code> gives the final values. The <M>+k</M> starts the change at <M>l</M>, and the running total carries
        it along until the <M>−k</M> cancels it after <M>r</M>.
      </p>
      <CodeBlock
        code={`d[l] += k            # one update: O(1)
d[r + 1] -= k`}
      />
      <p>
        After the last update, one pass of running totals over <code>d</code> gives the final list, in <M>O(n)</M>. Putting the whole method
        together is <Link href="/dsa/arrs/practice/3/">ARRS-P3</Link>.
      </p>
      <Note title="Two views of one idea">
        <p>
          The running total of <code>d</code> is the list, and the differences between neighbours of the list are <code>d</code>. Prefix sums and
          difference arrays undo each other, like adding up and taking away.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/arrs/practice/3/">ARRS-P3, Passengers on each section</Link>.
      </p>
    </>
  );
}
