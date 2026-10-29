import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { LisFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        The longest increasing subsequence is a classic DP with two solutions: a simple table that takes <M>O(n²)</M> time (time that grows with n multiplied by n), and a cleverer one
        with binary search that takes <M>O(n log n)</M>. The second shows how a DP can keep a different kind of state to go faster.
      </p>

      <h2 id="problem">The problem</h2>
      <p>
        A <strong>subsequence</strong> of a list keeps some of its values in their original order and skips the others. It differs from a
        stretch (DVCQ-1), whose values must be side by side. In <code>[5, 2, 8, 6, 3, 6, 9, 7]</code>, both <code>[2, 3, 6, 9]</code> and{" "}
        <code>[5, 6, 9]</code> are subsequences. A subsequence is <strong>increasing</strong> (here: strictly rising) if each value is larger
        than the one before it. Find the length of the longest one.
      </p>
      <p>
        A list of n values has <M>2ⁿ</M> subsequences (each value is kept or skipped, so n twos multiplied together), so trying them all is hopeless beyond about 25 values.
      </p>

      <h2 id="square">The O(n²) table</h2>
      <p>
        The best subsequence can end anywhere, so fix where it ends (lesson 4). Let <code>len[i]</code> be the length of the longest increasing
        subsequence that ends with the value at position i. The value before <code>a[i]</code> in such a subsequence is some <code>a[j]</code>{" "}
        with <M>j &lt; i</M> and <code>a[j] &lt; a[i]</code>, and the part up to it must be as long as possible. So <code>len[i]</code> is 1 plus
        the largest <code>len[j]</code> over those j, or just 1 if there are none. The answer is the largest <code>len[i]</code>.
      </p>
      <LisFigure />
      <CodeBlock
        title="lis_square.py"
        code={`def lis_length(a):
    length = [1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j] < a[i] and length[j] + 1 > length[i]:
                length[i] = length[j] + 1
    return max(length, default=0)`}
      />
      <p>
        Every pair <M>j &lt; i</M> is checked once: about <M>n²/2</M> comparisons, half of n multiplied by n. For 10,000 values that is 50 million, a few seconds in
        Python; for 100,000 values it is far too slow.
      </p>

      <h2 id="tails">Tails and binary search</h2>
      <p>
        The second version of the figure keeps a different list. <code>tails[k]</code> is the smallest value that ends an increasing subsequence
        of length <M>k + 1</M> among the values seen so far. A small last value is better than a large one, because more later values can follow
        it. For each new value x, find the first tail that is not smaller than x. If there is none, x extends the longest subsequence; otherwise
        x replaces that tail.
      </p>
      <CodeBlock
        title="lis_tails.py"
        code={`from bisect import bisect_left

def lis_length(a):
    tails = []
    for x in a:
        k = bisect_left(tails, x)   # first tail >= x
        if k == len(tails):
            tails.append(x)          # a longer subsequence
        else:
            tails[k] = x             # a smaller end for length k + 1
    return len(tails)`}
      />
      <p>
        <code>tails</code> always rises (proved below), so <code>bisect_left</code> can search it (BSRC). Each value costs one binary search:{" "}
        <M>O(n log n)</M> in all, about 1.7 million comparisons for 100,000 values instead of 5 billion.
      </p>
      <Invariant label="Tails">tails[k] is the smallest value that ends an increasing subsequence of length k + 1 so far.</Invariant>

      <h2 id="proof">Why the tails method is right</h2>
      <p>Two facts, each kept true after every value.</p>
      <ol>
        <li>
          <strong>
            <code>tails</code> rises strictly.
          </strong>{" "}
          Take a subsequence of length <M>k + 2</M> that ends with <code>tails[k + 1]</code>. Its value before the last is smaller than{" "}
          <code>tails[k + 1]</code>, and it ends a subsequence of length <M>k + 1</M>. So the smallest such end, <code>tails[k]</code>, is smaller
          than <code>tails[k + 1]</code> too.
        </li>
        <li>
          <strong>Each update is right.</strong> A new value x can extend a subsequence of length m exactly when some subsequence of length m ends
          with a value smaller than x, that is, when <code>tails[m − 1] &lt; x</code>. Since <code>tails</code> rises, these are the first k
          positions, where k = <code>bisect_left(tails, x)</code>. So x ends a subsequence of length <M>k + 1</M> and no longer. If{" "}
          <code>tails[k]</code> exists, it is at least x, so x is the new smallest end for that length. Other entries do not change: x cannot end
          a longer subsequence, and for shorter lengths the old ends are already smaller than x.
        </li>
      </ol>
      <p>
        After the last value, the longest length with an entry in <code>tails</code> is the answer. Note that <code>tails</code> is a list of
        ends of <em>different</em> subsequences: it is often not a subsequence of the input at all. Lesson 9 shows how to rebuild a real one.
      </p>

      <h2 id="variants">Variants</h2>
      <ul>
        <li>
          <strong>Never falling</strong> (equal values allowed): use <code>bisect_right</code>, so an equal value extends instead of replacing.
        </li>
        <li>
          <strong>Longest decreasing:</strong> run the same code on the negated values, <code>[-x for x in a]</code>.
        </li>
        <li>
          <strong>Two sizes at once</strong>, such as boxes that must be smaller in width and height: sort by one size, then find an increasing
          subsequence of the other. Equal first sizes need care: DYNP-P6.
        </li>
        <li>
          <strong>The fewest falling subsequences that together use every value</strong> equals the length of the longest increasing
          subsequence. The card game patience shows why: deal the values one by one onto piles, each onto the first pile whose top is at least as
          large, or onto a new pile. Each pile is a falling subsequence, the number of piles is the answer, and the tops of the piles are exactly{" "}
          <code>tails</code>.
        </li>
      </ul>
      <Note title="A guaranteed length">
        <p>
          Erdős and Szekeres proved in 1935 that any list of more than <M>(r − 1)(s − 1)</M> different numbers has an increasing subsequence of
          length r or a decreasing one of length s. So any 10 different numbers contain a rising or a falling subsequence of length 4. The proof
          gives each value the pair (longest increasing ending here, longest decreasing ending here) and shows no two values share a pair.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/6/">DYNP-P6, Nesting boxes</Link>.
      </p>
    </>
  );
}
