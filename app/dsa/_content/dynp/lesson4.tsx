import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { OneFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        In many DP problems the state is one number: a position in a list or a string, or an amount. The table is then a single row. The hard
        part is not the code but saying exactly what each entry means. This lesson shows four common meanings.
      </p>

      <h2 id="prefix">One answer per position</h2>
      <p>For a list of n items, the two most common states are:</p>
      <ul>
        <li>
          a <strong>prefix</strong>: the answer for the first i items, <code>a[:i]</code>, filled from i = 0 upwards;
        </li>
        <li>
          a <strong>suffix</strong>: the answer for the items from i to the end, <code>a[i:]</code>, filled from the end backwards.
        </li>
      </ul>
      <p>
        Both lead to correct methods. Choose the one that makes the rule shorter. A prefix rule usually looks at the <em>last</em> item; a suffix
        rule at the <em>first</em>.
      </p>

      <h2 id="skip">Take it or leave it</h2>
      <p>
        Choose values from a list so that no two chosen values are side by side, with the largest total. Let <code>best[i]</code> be the largest
        total using positions 0 to i. The value at position i is either skipped or taken:
      </p>
      <ul>
        <li>skipped: the best is <code>best[i - 1]</code>;</li>
        <li>
          taken: position i − 1 must be skipped, and the rest is a best choice from positions 0 to i − 2, so <code>best[i - 2] + a[i]</code>.
        </li>
      </ul>
      <p>
        Every choice falls into one of the two cases, and in each case the rest must be a best choice (lesson 1&rsquo;s argument), so{" "}
        <code>best[i]</code> is the larger of the two. Step through the first version of the figure.
      </p>
      <OneFigure />
      <CodeBlock
        title="no_neighbours.py"
        code={`def best_total(a):
    before, best = 0, 0        # best[i - 2], best[i - 1]
    for x in a:
        before, best = best, max(best, before + x)
    return best`}
      />
      <p>
        Only the last two answers are needed, so two names replace the list: <M>O(n)</M> time, <M>O(1)</M> space. Starting both at 0 stands for
        the empty prefix, which also makes an empty list return 0.
      </p>

      <h2 id="end">Fixing where it ends</h2>
      <p>
        The largest sum of a stretch (DVCQ-1) is harder to describe with prefixes: the best stretch in <code>a[:i]</code> may be far from
        position i, so it says nothing about how to extend it. The way out is to fix where the stretch ends. Let <code>end[i]</code> be the largest
        sum of a stretch that ends exactly at position i. Such a stretch is either the value <code>a[i]</code> alone, or a stretch ending at i − 1
        with <code>a[i]</code> added, and the best of those is <code>end[i - 1] + a[i]</code>. The second version of the figure fills it.
      </p>
      <CodeBlock
        title="best_stretch.py"
        code={`def best_stretch(a):
    end = best = a[0]
    for x in a[1:]:
        end = max(x, end + x)      # extend, or start again
        best = max(best, end)
    return best`}
      />
      <p>
        This is Kadane&rsquo;s method, <M>O(n)</M>. The answer is not <code>end[n − 1]</code> but the largest <code>end[i]</code>, because the
        best stretch can end anywhere.
      </p>
      <Invariant label="Ends">If the answer can end anywhere, solve for each place it could end, then take the best.</Invariant>
      <p>
        Lesson 6 uses the same idea: the longest rising subsequence that ends at position i.
      </p>

      <h2 id="split">Splitting a string</h2>
      <p>
        Can a string be cut into pieces that are all words from a given set? Let <code>ok[i]</code> be True if the first i letters can. The last
        word of such a split ends at i and starts at some j, so <code>ok[i]</code> is True if <code>ok[j]</code> is True and{" "}
        <code>s[j:i]</code> is a word, for some j. The empty prefix can always be split: <code>ok[0] = True</code>.
      </p>
      <CodeBlock
        title="word_break.py"
        code={`def can_split(s, words):
    longest = max(map(len, words), default=0)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):
            if ok[j] and s[j:i] in words:
                ok[i] = True
                break
    return ok[len(s)]`}
      />
      <p>
        Only the last <code>longest</code> places can start the last word, so for n letters and words up to L letters long there are{" "}
        <M>O(n · L)</M> checks, each taking <M>O(L)</M> to slice and hash: <M>O(n · L²)</M>, where L² means L multiplied by L. A trie of the words (TRIE) checks all the j for one
        i in a single walk, which removes one factor of L. Pass <code>words</code> as a set, so that <code>in</code> is fast.
      </p>

      <h2 id="jump">Looking further back</h2>
      <p>
        Sometimes the rule reads an entry far back, and finding it is part of the work. GRDY-3 ended with bookings that have values, where no
        greedy rule works. Sort the bookings by end time. Let <code>best[i]</code> be the largest total value from the first i bookings. Booking i
        is skipped (<code>best[i - 1]</code>), or taken, and then only bookings that end by its start can go with it. Those are a prefix of the
        sorted list, and binary search finds its length:
      </p>
      <CodeBlock
        title="bookings_with_values.py"
        code={`from bisect import bisect_right

def most_value(bookings):          # (start, end, value)
    bookings = sorted(bookings, key=lambda b: b[1])
    ends = [b[1] for b in bookings]
    best = [0] * (len(bookings) + 1)
    for i, (s, e, v) in enumerate(bookings, 1):
        p = bisect_right(ends, s, 0, i - 1)  # end <= s
        best[i] = max(best[i - 1], best[p] + v)
    return best[-1]`}
      />
      <p>
        That is <M>O(n log n)</M>: one sort and one binary search per booking. Half-open times are used, as in GRDY-3, so a booking that ends at
        5 can be followed by one that starts at 5.
      </p>
      <Note title="The best of the last k answers">
        <p>
          Another common rule is <code>best[i] = a[i] + max(best[i - k : i])</code>: jump at most k places. Taking the maximum each time costs{" "}
          <M>O(n · k)</M>. A monotonic deque of positions whose values fall from front to back (STAQ-6) gives each maximum in <M>O(1)</M> on
          average, so <M>O(n)</M> in all.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/4/">DYNP-P4, Season tickets</Link>.
      </p>
    </>
  );
}
