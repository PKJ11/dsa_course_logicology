import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CountFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Many problems become one pass over the data once you have a dict or a set. This lesson collects the patterns that come up again and again:
        counting, grouping, looking for a partner, and remembering prefix sums.
      </p>

      <h2 id="count">Counting</h2>
      <p>
        To count how often each item appears, keep a dict from item to count. Step through the first variant of the figure. The second variant
        comes up in the next sections.
      </p>

      <CountFigure />

      <p>Python offers three ways to write the same loop:</p>
      <CodeBlock
        code={`counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1     # get returns 0 for a new key

from collections import defaultdict
counts = defaultdict(int)                # a missing key starts at int(), 0
for w in words:
    counts[w] += 1

from collections import Counter
counts = Counter(words)                  # the same, in one line
counts.most_common(2)                    # [('to', 2), ('be', 2)]`}
      />
      <p>
        All three take <M>O(n)</M> time on average for <M>n</M> items. <code>most_common(k)</code> picks the <M>k</M> largest counts with a heap
        (HEAP station), which costs <M>O(d log k)</M> for <M>d</M> different items, cheaper than sorting all of them.
      </p>

      <h2 id="group">Grouping by a key</h2>
      <p>
        To put items into groups, choose a <em>group key</em>: a hashable value that is the same for items in the same group and different for
        items in different groups. Then keep a dict from group key to a list of items.
      </p>
      <p>
        Example: group words that are anagrams of each other (the same letters in a different order, like <code>listen</code> and{" "}
        <code>silent</code>). Two words are anagrams exactly when their sorted letters are the same. So the sorted letters make a good group key:
      </p>
      <CodeBlock
        code={`from collections import defaultdict

def anagram_groups(words):
    groups = defaultdict(list)
    for w in words:
        groups[''.join(sorted(w))].append(w)    # 'listen' -> 'eilnst'
    return list(groups.values())`}
      />
      <p>
        Sorting a word of length <M>L</M> costs <M>O(L log L)</M>. A faster key counts the letters instead: a tuple of 26 counts, built in{" "}
        <M>O(L)</M>. The key must be a tuple, not a list, because a dict key must be hashable (lesson 1).
      </p>
      <Invariant label="Rule">A good group key is equal for two items exactly when they belong together. Then one dict lookup per item does the grouping.</Invariant>

      <h2 id="partner">Looking for a partner</h2>
      <p>
        Some problems ask for two items that fit together: two values that add up to a target, or two words that are mirror images. Trying every
        pair is <M>O(n²)</M>. Instead, walk once, and keep the items already passed in a dict or set. For each new item, work out the exact partner
        it needs, and check whether that partner was already seen. Step through the second variant of the figure.
      </p>
      <CodeBlock
        code={`def pair_with_sum(a, target):
    seen = {}                        # value -> its place
    for i, x in enumerate(a):
        if target - x in seen:
            return (seen[target - x], i)
        seen[x] = i                  # store after the check
    return None`}
      />
      <p>
        The check comes before the store. Otherwise, with target 12, a single 6 would pair with itself. The cost is one pass with <M>O(1)</M> dict
        work per item: <M>O(n)</M> on average, and <M>O(n)</M> extra space for <code>seen</code>.
      </p>

      <h2 id="prefix">Prefix sums in a dict</h2>
      <p>
        ARRS-4 used prefix sums: <M>p[j]</M> is the total of the first <M>j</M> values, and the stretch of values after place <M>i</M> up to place{" "}
        <M>j</M> adds up to <M>p[j] − p[i]</M>. Combine this with the partner idea. A stretch ending at place <M>j</M> adds up to <M>k</M> exactly
        when some earlier prefix sum equals <M>p[j] − k</M>. That earlier prefix sum is the partner.
      </p>
      <p>
        So walk once, keeping a running total, and keep a dict that counts how many times each prefix sum has appeared. At each place, the number of
        good stretches ending there is a single dict lookup. Practice HASH-P4 asks you to finish this idea. It works even with negative values,
        where the sliding window from ARRS-3 fails, because a window&rsquo;s total no longer grows as the window grows.
      </p>
      <Note title="A dict of last places">
        <p>
          A related pattern keeps, for each item, the last place it was seen. For example, to find the longest stretch of a string with no
          repeated letter, the dict tells you in <M>O(1)</M> where the previous copy of the current letter was, so you know where the stretch must
          start.
        </p>
      </Note>
    </>
  );
}
