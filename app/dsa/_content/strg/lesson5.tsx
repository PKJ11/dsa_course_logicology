import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SuffixFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Sort all the endings of a string, and many questions about its pieces become easy: where a pattern occurs, which piece repeats, how many
        different pieces there are. The sorted list of endings is the suffix array. With a second list, the lcp array, it does most of what a
        suffix tree does, in a fraction of the memory.
      </p>

      <h2 id="sa">Sorted endings</h2>
      <p>
        A <strong>suffix</strong> of s is an ending of it: <code>s[i:]</code> for some place <M>i</M>. A string of <M>n</M> letters has{" "}
        <M>n</M> non-empty suffixes, one per place. The <strong>suffix array</strong> lists the places in the alphabetical order of their
        suffixes.
      </p>
      <CodeBlock
        code={`s = "banana"
# 5  a
# 3  ana
# 1  anana
# 0  banana
# 4  na
# 2  nana
# the suffix array is [5, 3, 1, 0, 4, 2]`}
      />
      <p>
        In alphabetical order, a string comes before every longer string that starts with it: <code>&quot;a&quot;</code> &lt;{" "}
        <code>&quot;ana&quot;</code>. Python compares strings this way.
      </p>
      <p>
        <Link href="/dsa/trie/4/">TRIE-4</Link> mentioned the <em>suffix tree</em>, the compressed trie of all suffixes. The suffix array is the
        order of that tree&rsquo;s leaves, read from left to right. It is a plain list of <M>n</M> numbers, while a suffix tree in Python needs
        many objects per letter.
      </p>
      <p>
        The one-line way, <code>sorted(range(n), key=lambda i: s[i:])</code>, is correct, but each key is a copy of a suffix: <M>n²/2</M>{" "}
        letters of memory in all, and comparing two long suffixes can take <M>O(n)</M>. For a string like <code>&quot;aaaa…&quot;</code> of
        100,000 letters that is 5 billion letters of copies. It is fine for a few thousand letters.
      </p>

      <h2 id="double">Prefix doubling</h2>
      <p>
        The faster method sorts by the first letter, then by the first 2 letters, then 4, 8, and so on. After each round, every suffix gets a{" "}
        <strong>rank</strong>: its place in the order so far, with equal ranks for suffixes whose first <M>k</M> letters are the same. A suffix
        shorter than <M>k</M> just uses all its letters.
      </p>
      <Invariant label="Doubling">The first 2k letters of suffix i are its first k letters, followed by the first k letters of suffix i + k.</Invariant>
      <p>
        Both halves already have ranks from the last round. So sorting by the pair <M>(rank[i], rank[i + k])</M> sorts by the first{" "}
        <M>2k</M> letters, without looking at a single letter. When <M>i + k</M> is past the end, use −1: nothing comes before everything.
        Step through the first variant.
      </p>
      <SuffixFigure />
      <CodeBlock
        code={`# one round: rank[i] orders the suffixes by their first k letters
key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
sa.sort(key=key)                   # now sorted by their first 2k letters
new = [0] * n
for r in range(1, n):              # equal pairs, equal ranks
    new[sa[r]] = new[sa[r - 1]] + (key(sa[r - 1]) != key(sa[r]))
rank = new                         # then k doubles, until all ranks differ`}
      />
      <p>
        <strong>Cost.</strong> After round <M>t</M> the order is right for the first <M>2<sup>t</sup></M> letters, so after about{" "}
        <M>log₂ n</M> rounds (how many times you can double 1 before passing <M>n</M>) all ranks differ. On ordinary text it stops much sooner,
        once the first few letters already tell the suffixes apart. Each round here sorts with <code>sort()</code>, <M>O(n log n)</M>, so the
        whole method is <M>O(n log² n)</M> (n times log n times log n). In Python this is the practical choice: the sort runs in C.
      </p>
      <p>
        The ranks are whole numbers below <M>n</M>, so each round can use radix sort instead (<Link href="/dsa/sort/6/">SORT-6</Link>): a
        counting sort by the second number, then a stable counting sort by the first. That makes a round <M>O(n)</M> and the method{" "}
        <M>O(n log n)</M>. Faster still are methods that build the array in <M>O(n)</M>, such as SA-IS (2009); they are used in DNA tools and
        in compression.
      </p>

      <h2 id="find">Finding a pattern</h2>
      <p>
        Every place where a pattern P occurs is the start of a suffix that begins with P. In sorted order, those suffixes form one unbroken block.
        Binary search finds the block&rsquo;s two ends (<Link href="/dsa/bsrc/3/">BSRC-3</Link>), comparing P with the first <M>m</M> letters
        of a suffix at each step: <M>O(m log n)</M> per search, after one sort.
      </p>
      <CodeBlock
        code={`from bisect import bisect_left, bisect_right

def places(s, sa, p):
    first = lambda i: s[i:i + len(p)]
    lo = bisect_left(sa, p, key=first)     # key= needs Python 3.10+
    hi = bisect_right(sa, p, key=first)
    return sorted(sa[lo:hi])`}
      />

      <h2 id="lcp">The lcp array and Kasai&rsquo;s method</h2>
      <p>
        The <strong>lcp array</strong> stores, for each row of the suffix array after the first, the length of the longest common prefix (the
        shared start) of that suffix and the one in the row above. For banana: <code>[–, 1, 3, 0, 0, 2]</code>. Comparing each pair of rows from
        scratch costs <M>O(n²)</M> on <code>&quot;aaaa…&quot;</code>.
      </p>
      <p>
        Kasai&rsquo;s method (2001) visits the suffixes in the order of the text, <M>i = 0, 1, 2, …</M>, not in sorted order, and keeps the last
        answer <M>h</M>.
      </p>
      <Invariant label="Kasai">
        If suffix i shares <span className="nowrap">h &gt; 0</span> letters with the row above it, then suffix <span className="nowrap">i + 1</span> shares at least <span className="nowrap">h − 1</span> letters with the row
        above it.
      </Invariant>
      <p>
        Proof. Let j be the suffix in the row above i, sharing <M>h</M> letters. Drop the first letter of both: suffixes <M>j + 1</M> and{" "}
        <M>i + 1</M> share <M>h − 1</M> letters, and <M>j + 1</M> still comes first (they had the same first letter, so the rest decided the
        order). Every suffix between them in sorted order also starts with those <M>h − 1</M> letters, because sorted order keeps strings with a
        common start together. In particular the row directly above <M>i + 1</M> does.
      </p>
      <CodeBlock
        code={`# suffix i, in text order; h is carried over from suffix i - 1
j = sa[rank[i] - 1]                # the suffix in the row above
while i + h < n and j + h < n and s[i + h] == s[j + h]:
    h += 1
lcp[rank[i]] = h
if h > 0:
    h -= 1                         # the next answer is at least h - 1`}
      />
      <p>
        <strong>Cost.</strong> <M>h</M> never goes above <M>n</M> and drops by at most 1 per suffix, at most <M>n</M> times in all. So it can
        rise at most <M>2n</M> times, and the whole array costs <M>O(n)</M>. Step through the second variant of the figure.
      </p>

      <h2 id="uses">What the two arrays answer</h2>
      <ul>
        <li>
          <strong>The longest piece that occurs twice:</strong> the largest lcp value, at the rows that have it.
        </li>
        <li>
          <strong>The number of different pieces:</strong> suffix <code>sa[r]</code> has <M>n − sa[r]</M> starts, and <code>lcp[r]</code> of them
          were already counted with the row above. So the count is <M>n(n + 1)/2</M> minus the sum of the lcp array.
        </li>
        <li>
          <strong>The common start of any two suffixes:</strong> the smallest lcp value in the rows between them. With a sparse table over the lcp
          array (<Link href="/dsa/rngq/2/">RNGQ-2</Link>), each such question costs <M>O(1)</M>.
        </li>
        <li>
          <strong>The longest piece two strings share:</strong> build the arrays for <code>a + &quot;#&quot; + b</code> and take the largest lcp
          between two neighbouring rows where one suffix starts in a and the other in b.
        </li>
      </ul>
      <Note title="Compression">
        <p>
          The Burrows–Wheeler transform, used by the <code>bzip2</code> program, writes down the letter just before each suffix, in suffix-array
          order. Letters that come before similar endings end up next to each other, so the result has long runs that compress well, and it can
          be turned back into the original text.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/strg/practice/5/">STRG-P5, Sorted endings</Link>.
      </p>
    </>
  );
}
