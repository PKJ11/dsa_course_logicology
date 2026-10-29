import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

export const STRG_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Patterns with blanks",
    fn: "find_all",
    lessons: [1],
    starter: `def find_all(text, pat):
    # Return every place i (in increasing order) where pat
    # fits text starting at i. A "?" in pat matches any one
    # letter. Places may overlap.
    pass
`,
    statement: (
      <>
        <p>
          A pattern can have blanks, written <code>?</code>, that match any one letter. Return every place <code>i</code> where the pattern fits
          the text: <code>text[i + j] == pat[j]</code> for every <code>j</code> where <code>pat[j]</code> is not <code>?</code>. List the places
          in increasing order. Places may overlap, and the pattern must fit inside the text.
        </p>
        <CodeBlock
          code={`find_all("abcabcab", "cab")    # [2, 5]
find_all("banana", "?an")      # [0, 2]
find_all("aaaa", "aa")         # [0, 1, 2]
find_all("ab", "abc")          # []`}
        />
        <p>
          The text has lower-case letters, and may also contain <code>?</code>; only a <code>?</code> in the pattern is a blank. The pattern has
          at least one character.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>The text has up to 20,000 letters and the pattern up to 20. The naive method of lesson 1 is fast enough.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Lesson 1&rsquo;s naive method, with one change in the comparison. Which places must you try, from the first to the last?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Try every place <code>i</code> from 0 to <code>n - m</code> (that is <code>range(n - m + 1)</code>). At each place, compare from the
              left, and treat a <code>?</code> in the pattern as equal to anything.
            </p>
            <p>After a match, go on to place <code>i + 1</code>, not <code>i + m</code>, so overlapping matches are found.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`for i in 0 .. n - m:
    j = 0
    while j < m and (pat[j] is "?" or text[i+j] == pat[j]):
        j += 1
    if j == m: add i`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Every place, fast",
    fn: "find_every",
    lessons: [2],
    starter: `def find_every(text, pat):
    # Return every place where pat occurs in text, in
    # increasing order. Occurrences may overlap.
    pass
`,
    statement: (
      <>
        <p>
          Return every place <code>i</code> where <code>text[i:i + len(pat)] == pat</code>, in increasing order. Occurrences may overlap, and
          there may be very many of them.
        </p>
        <CodeBlock
          code={`find_every("abababac", "ababac")   # [2]
find_every("aaaaa", "aa")           # [0, 1, 2, 3]
find_every("abacabab", "ab")        # [0, 4, 6]`}
        />
        <p>Both strings have lower-case letters, and the pattern has at least one.</p>
        <h2>Limits</h2>
        <ul>
          <li>The text has up to 1,000,000 letters and the pattern up to 500,000. The big tests have 4 seconds each.</li>
          <li>
            One test has 500,001 overlapping occurrences of a pattern of 500,000 letters. A loop that calls <code>find</code> again after each
            hit, or compares a slice at every place, does about 250 billion steps there.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Build KMP&rsquo;s border table of the pattern (lesson 2), then read the text once without ever stepping back.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>pi[i]</code> is the length of the longest border of <code>pat[0..i]</code>. Build it with a pointer <code>k</code> that grows by
              one or drops to <code>pi[k - 1]</code>.
            </p>
            <p>
              Then go through the text with <code>j</code>, the number of letters matched. On a mismatch, <code>j = pi[j - 1]</code> until the
              letters agree or <code>j</code> is 0. After a full match, record the place and set <code>j = pi[m - 1]</code>, so the next match can
              overlap.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`pi = border table of pat
j = 0
for i, ch in enumerate(text):
    while j > 0 and ch != pat[j]: j = pi[j - 1]
    if ch == pat[j]: j += 1
    if j == m: add i - m + 1;  j = pi[m - 1]`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "How much of the pattern fits",
    fn: "fits",
    lessons: [3],
    starter: `def fits(text, pat):
    # Return a list with one number per place i of text:
    # the length of the longest start of pat that begins
    # at text[i].
    pass
`,
    statement: (
      <>
        <p>
          For every place <code>i</code> of the text, find how much of the pattern fits there: the largest <code>k</code> such that{" "}
          <code>text[i:i + k] == pat[:k]</code>. Return these numbers as a list, one per place of the text. An answer is 0 when the first letters
          differ, and can never be more than the letters left in the text.
        </p>
        <CodeBlock
          code={`fits("aabxaab", "aab")   # [3, 1, 0, 0, 3, 1, 0]
fits("xxaba", "abab")     # [0, 0, 3, 0, 1]
fits("ab", "abab")        # [2, 0]`}
        />
        <p>Both strings have lower-case letters, and the pattern has at least one.</p>
        <h2>Limits</h2>
        <ul>
          <li>The text has up to 500,000 letters and the pattern up to 100,000. The big tests have 3 seconds each.</li>
          <li>Comparing letter by letter at every place is too slow when the answers are long.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>This is the Z-array (lesson 3) of a string made from the pattern and the text.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Build <code>s = pat + sep + text</code>, where <code>sep</code> is a character in neither string (such as <code>&quot;\0&quot;</code>
              ). Its Z-value at place <code>len(pat) + 1 + i</code> is exactly the answer for place <code>i</code> of the text: the separator stops
              any match from running past the end of the pattern.
            </p>
            <p>Compute the Z-array with the box rule so the whole run is O(n + m).</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`s = pat + "\\0" + text;  z = [0] * len(s);  l = r = 0
for i in 1 .. len(s) - 1:
    if i < r: z[i] = min(r - i, z[i - l])
    while i + z[i] < len(s) and s[z[i]] == s[i + z[i]]: z[i] += 1
    if i + z[i] > r: l, r = i, i + z[i]
return z[len(pat) + 1:]`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "The longest repeated piece",
    fn: "longest_repeat",
    lessons: [4],
    starter: `def longest_repeat(s):
    # Return the longest piece of s that occurs at least
    # twice (the copies may overlap). If several pieces have
    # that length, return the one that first occurs earliest.
    # Return "" if no letter repeats.
    pass
`,
    statement: (
      <>
        <p>
          Return the longest piece (a run of neighbouring letters) of <code>s</code> that occurs at two or more places. The two copies may
          overlap. If several different pieces have that length, return the one whose first occurrence is earliest in <code>s</code>: in{" "}
          <code>&quot;cdqcdabqab&quot;</code> both <code>&quot;cd&quot;</code> and <code>&quot;ab&quot;</code> repeat, and{" "}
          <code>&quot;cd&quot;</code> is seen first. If no piece repeats at all, return <code>&quot;&quot;</code>.
        </p>
        <CodeBlock
          code={`longest_repeat("banana")       # "ana"
longest_repeat("aaaa")         # "aaa"
longest_repeat("cdqcdabqab")   # "cd"
longest_repeat("abcd")         # ""`}
        />
        <p>
          The string has lower-case letters. If you use a rolling hash, use a large prime modulus such as <code>(1 &lt;&lt; 61) - 1</code>, and
          compare the letters when two hashes are equal: one test is built to make weak hashes give the same value for different pieces.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 letters. The big tests have 4 to 5 seconds each.</li>
          <li>The answer can be almost as long as the string, so building a slice for every piece of every length you try is too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            If a piece of length L occurs twice, so does a piece of length L − 1. So you can binary search on the length (BSRC-4), if you can
            check one length quickly.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Build prefix hashes once (lesson 4), so the hash of any piece is <code>(H[i + L] - H[i] * P[L]) % M</code> in O(1). To check a
              length L, go through all pieces of length L and keep a dict from hash to the first place it was seen. A hash seen before (with the
              same letters) is a repeat; the smallest such first place is the tie rule&rsquo;s answer.
            </p>
            <p>Binary search the largest L that has a repeat, then return the piece at its smallest first place.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`H, P = prefix hashes and powers of B, mod M
def first_repeat(L):
    first = {};  best = -1
    for i in 0 .. n - L:
        h = hash of s[i:i+L]
        if h not in first: first[h] = i
        elif s[first[h]:first[h]+L] == s[i:i+L]:
            best = smallest of best and first[h]
    return best
binary search the largest L with first_repeat(L) >= 0`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Sorted endings",
    fn: "suffix_lcp",
    lessons: [5],
    starter: `def suffix_lcp(s):
    # Return (sa, lcp): sa lists the start of every suffix
    # of s in alphabetical order of the suffixes; lcp[r] is
    # the length of the common start of the suffixes at
    # sa[r - 1] and sa[r], and lcp[0] is 0.
    pass
`,
    statement: (
      <>
        <p>
          Return a pair <code>(sa, lcp)</code>. <code>sa</code> is the suffix array of <code>s</code>: the places <code>0 .. n − 1</code> in
          the alphabetical order of the suffixes <code>s[i:]</code> that start there. <code>lcp[r]</code>, for <code>r ≥ 1</code>, is the length
          of the longest common prefix (shared start) of the suffixes in rows <code>r − 1</code> and <code>r</code>; <code>lcp[0]</code> is 0.
        </p>
        <CodeBlock
          code={`suffix_lcp("banana")
# ([5, 3, 1, 0, 4, 2], [0, 1, 3, 0, 0, 2])
suffix_lcp("aaaa")
# ([3, 2, 1, 0], [0, 1, 2, 3])`}
        />
        <p>
          The string has at least one lower-case letter. A shorter suffix comes before a longer one that starts with it, as in Python&rsquo;s own
          string order.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 letters. The big tests have 5 seconds each.</li>
          <li>
            Sorting with <code>key=lambda i: s[i:]</code> copies every suffix (5 billion letters for 100,000 of one letter), and comparing two
            neighbouring rows from scratch is O(n²) there. <code>sorted</code> and <code>.sort()</code> are allowed.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Prefix doubling for the order, then Kasai&rsquo;s method for the lcp array (lesson 5).</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Start with each suffix&rsquo;s rank equal to its first letter. In each round, sort the starts by the pair{" "}
              <code>(rank[i], rank[i + k])</code>, using −1 (or 0, with ranks shifted up by one) when <code>i + k</code> is past the end. Then give
              equal pairs equal new ranks. Double <code>k</code>, and stop when all ranks differ.
            </p>
            <p>
              For lcp, go through the suffixes in text order, comparing each with the row above it, and start each comparison from the last answer
              minus one.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`rank = letter codes;  k = 1
loop:
    sort sa by (rank[i], rank[i+k] or -1)
    new ranks: +1 whenever the pair changes
    stop if all n ranks differ;  k *= 2
h = 0
for i in 0 .. n-1 (text order):
    if i is in row 0: h = 0; continue
    j = start in the row above
    while s[i+h] == s[j+h]: h += 1
    lcp[row of i] = h;  h = max(h - 1, 0)`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Palindromes in a string",
    fn: "palindromes",
    lessons: [6],
    starter: `def palindromes(s):
    # Return (count, longest): how many pieces of s are
    # palindromes, counted by position, and the longest
    # palindromic piece (the earliest one if there is a tie).
    pass
`,
    statement: (
      <>
        <p>
          Return a pair <code>(count, longest)</code>. <code>count</code> is the number of pieces <code>s[a:b]</code> (with <code>a &lt; b</code>)
          that are palindromes; pieces with the same letters at different places count separately. <code>longest</code> is the longest
          palindromic piece; if there is a tie, the one that starts earliest.
        </p>
        <CodeBlock
          code={`palindromes("aaa")       # (6, "aaa")
palindromes("abba")      # (6, "abba")
palindromes("abaxcdc")   # (9, "aba")`}
        />
        <p>The string has at least one lower-case letter.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 letters. The big tests have 4 seconds each.</li>
          <li>The count can be about 20 billion; growing each palindrome from its centre is too slow when there are that many.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Manacher&rsquo;s method (lesson 6) gives, for each centre, how many palindromes are centred there. Both parts of the answer come from those numbers.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Compute <code>d1</code> (odd lengths, centred on a letter) and <code>d2</code> (even lengths, centred just before a letter) with the
              mirror rule. The count is <code>sum(d1) + sum(d2)</code>.
            </p>
            <p>
              The longest palindrome at centre <code>i</code> has <code>2 * d1[i] - 1</code> letters from <code>i - d1[i] + 1</code>, or{" "}
              <code>2 * d2[i]</code> letters from <code>i - d2[i]</code>. Keep the longest, and on a tie the smaller start.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`l, r = 0, -1
for i in 0 .. n-1:
    k = 1 if i > r else min(d1[l + r - i], r - i + 1)
    while s[i-k] == s[i+k] (inside s): k += 1
    d1[i] = k
    if i + k - 1 > r: l, r = i - k + 1, i + k - 1
the same for d2, with mirror d2[l + r - i + 1]
count = sum(d1) + sum(d2);  pick the longest`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
