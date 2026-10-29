import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";

export const TRIE_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "A trie",
    fn: "Trie",
    lessons: [1, 2],
    starter: `class TrieNode:
    def __init__(self):
        self.children = {}  # letter -> TrieNode
        self.end = False    # does a stored word end here?


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        pass

    def search(self, word):
        # True if word was inserted
        pass

    def starts_with(self, prefix):
        # True if some inserted word starts with prefix
        pass
`,
    statement: (
      <>
        <p>
          Write a trie class (lessons 1 and 2). <code>insert(word)</code> stores a word. <code>search(word)</code> returns <code>True</code> if
          the word was inserted. <code>starts_with(prefix)</code> returns <code>True</code> if at least one inserted word starts with the prefix.
        </p>
        <CodeBlock
          code={`t = Trie()
t.insert("apple")
t.search("apple")       # True
t.search("app")         # False: only a prefix
t.starts_with("app")    # True
t.insert("app")
t.search("app")         # True`}
        />
        <p>Words and prefixes are non-empty and use the letters a to z. The same word may be inserted more than once.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 30,000 words and 60,000 searches, each word at most 7 letters. Every operation should take <M>O(L)</M> time for a word of length{" "}
            <M>L</M>, whatever the number of stored words.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>All three methods walk from the root, one child per letter. What is different is what they do when a child is missing, and what they check at the end.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>insert</code>: for each letter, create the child if it is missing, then move to it. At the end, set <code>end = True</code>.
            </p>
            <p>
              Write one helper that walks a string and returns the last node, or <code>None</code> as soon as a child is missing. Then{" "}
              <code>search</code> is &ldquo;the node exists and its <code>end</code> is true&rdquo;, and <code>starts_with</code> is &ldquo;the
              node exists&rdquo;.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`insert(word): node = root
    for ch in word:
        if ch not in node.children: node.children[ch] = TrieNode()
        node = node.children[ch]
    node.end = True

walk(s): node = root
    for ch in s:
        node = node.children.get(ch)
        if node is None: return None
    return node

search(word):       n = walk(word); return n is not None and n.end
starts_with(prefix): return walk(prefix) is not None`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Counting words and prefixes",
    fn: "CountingTrie",
    lessons: [2],
    starter: `class Node:
    def __init__(self):
        self.children = {}
        self.count = 0    # words that pass through this node
        self.copies = 0   # words that end here


class CountingTrie:
    def __init__(self):
        self.root = Node()

    def insert(self, word):
        pass

    def count(self, word):
        # how many copies of word are stored
        pass

    def count_prefix(self, prefix):
        # how many stored words (with copies) start with prefix
        pass

    def remove(self, word):
        # remove one copy; return True, or False if there was none
        pass
`,
    statement: (
      <>
        <p>
          Write a trie that stores words with repeats, and counts them. <code>insert(word)</code> adds one copy of a word. <code>count(word)</code>{" "}
          returns how many copies of the word are stored. <code>count_prefix(prefix)</code> returns how many stored words start with the prefix,
          counting every copy. <code>remove(word)</code> removes one copy and returns <code>True</code>; if no copy is stored it changes nothing
          and returns <code>False</code>.
        </p>
        <CodeBlock
          code={`t = CountingTrie()
t.insert("apple"); t.insert("apple"); t.insert("app")
t.count("apple")         # 2
t.count_prefix("ap")     # 3
t.remove("apple")        # True
t.count_prefix("ap")     # 2
t.remove("ap")           # False: ap was never inserted`}
        />
        <p>Words and prefixes are non-empty and use the letters a to z.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 20,000 inserts, 10,000 removes and 25,000 counts, words of at most 6 letters. Every operation should take <M>O(L)</M> time:{" "}
            <code>count_prefix</code> must not visit the words below the prefix one by one.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>If every node knew how many stored words pass through it, what would <code>count_prefix</code> have to do after walking the prefix?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>insert</code> adds 1 to <code>count</code> on every node of the path (the root too), and 1 to <code>copies</code> on the last
              node. Then <code>count_prefix</code> walks the prefix and returns the last node&rsquo;s <code>count</code>, and <code>count</code>{" "}
              returns its <code>copies</code> (0 if the walk falls off).
            </p>
            <p>
              <code>remove</code>: first check that <code>count(word)</code> is above 0. Then walk again, taking 1 from every <code>count</code>{" "}
              and 1 from the last node&rsquo;s <code>copies</code>. If a child&rsquo;s count drops to 0, no word passes through it: delete it from
              its parent and stop.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`remove(word):
    if count(word) == 0: return False
    node = root; node.count -= 1
    for ch in word:
        child = node.children[ch]
        child.count -= 1
        if child.count == 0:
            del node.children[ch]; return True
        node = child
    node.copies -= 1
    return True`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Search box suggestions",
    fn: "SearchBox",
    lessons: [3],
    starter: `class SearchBox:
    def __init__(self, pairs):
        # pairs: a list of (word, count); every word appears once
        pass

    def suggest(self, prefix):
        # up to 3 words that start with prefix:
        # highest count first, alphabetical order for equal counts
        pass
`,
    statement: (
      <>
        <p>
          A search box shows suggestions while you type. <code>SearchBox(pairs)</code> receives every word with its count (how often people
          searched for it). <code>suggest(prefix)</code> returns the three words with the highest counts among the words that start with the
          prefix, highest first. Equal counts are broken by alphabetical order. If fewer than three words match, return them all; if none match,
          return <code>[]</code>.
        </p>
        <CodeBlock
          code={`b = SearchBox([("tea", 5), ("ten", 9), ("team", 2),
               ("to", 7), ("toe", 1)])
b.suggest("te")    # ['ten', 'tea', 'team']
b.suggest("t")     # ['ten', 'to', 'tea']
b.suggest("to")    # ['to', 'toe']
b.suggest("x")     # []`}
        />
        <p>A word counts as starting with itself. Words and prefixes are non-empty and use the letters a to z.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 20,000 words of at most 8 letters, and 20,000 suggestions.</li>
          <li>
            A suggestion must not depend on how many words match: it should cost <M>O(L)</M> for a prefix of length <M>L</M>. Building the
            search box may cost more.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            One letter can match a thousand words, and the best three could be anywhere among them. Can the answer for each prefix be ready before
            anyone asks?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Build a trie. Give every node a list <code>best</code> of at most three <code>(-count, word)</code> pairs. When you insert a word,
              add its pair to the list of every node on its path, sort the list, and keep the first three. The minus sign makes the plain sort
              put the highest count first, and equal counts fall back to comparing the words.
            </p>
            <p>
              <code>suggest</code> walks the prefix and returns the words of that node&rsquo;s list. Sorting a list of four pairs is constant
              work.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`__init__(pairs): root = Node()
    for word, count in pairs:
        node = root
        for ch in word:
            node = child of node for ch (create if missing)
            node.best.append((-count, word))
            node.best.sort(); del node.best[3:]

suggest(prefix): walk the prefix (return [] if it falls off)
    return [w for _, w in node.best]`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "A compressed trie",
    fn: "RadixTrie",
    lessons: [4],
    starter: `class RNode:
    def __init__(self):
        self.kids = {}    # first letter of label -> (label, RNode)
        self.end = False


class RadixTrie:
    def __init__(self):
        self.root = RNode()

    def insert(self, word):
        pass

    def search(self, word):
        pass

    def starts_with(self, prefix):
        pass

    def labels(self):
        # Given: the edge labels, depth first, in alphabetical order.
        out = []
        stack = [(None, self.root)]
        while stack:
            label, node = stack.pop()
            if label is not None:
                out.append(label)
            for ch in sorted(node.kids, reverse=True):
                stack.append(node.kids[ch])
        return out
`,
    statement: (
      <>
        <p>
          Write a compressed trie (lesson 4): each edge carries a string, the labels below a node start with different letters, and every node
          except the root is the end of a word or has at least two children. Store edges as the starter does: <code>node.kids</code> maps the
          first letter of a label to the pair <code>(label, child)</code>. <code>insert</code>, <code>search</code> and{" "}
          <code>starts_with</code> work as in TRIE-P1.
        </p>
        <p>
          The method <code>labels()</code> is given. It lists the edge labels depth first, in alphabetical order, so the tests can see the shape
          of your trie.
        </p>
        <CodeBlock
          code={`t = RadixTrie()
for w in ["bus", "tea", "team", "ten", "to", "toast"]:
    t.insert(w)
t.labels()
# ['bus', 't', 'e', 'a', 'm', 'n', 'o', 'ast']
t.starts_with("toa")   # True: ends inside the edge 'ast'
t.search("toa")        # False`}
        />
        <p>Words and prefixes are non-empty and use the letters a to z. The same word may be inserted twice.</p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 20,000 words of at most 8 letters. Each operation should take <M>O(L)</M> time, and the trie must have at most 2n nodes for n
            different words.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            At each node only one edge can start with the next letter. Count how many letters the word and that edge&rsquo;s label share. What do
            you do if it is the whole label, and what if it is less?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              <code>insert</code>: keep a node and a position <code>i</code> in the word. If no edge starts with <code>word[i]</code>, add the
              edge <code>(word[i:], new leaf)</code> and stop. Otherwise count the shared letters <code>j</code>. If <code>j</code> is less than
              the label&rsquo;s length, split: a new middle node gets the edge <code>(label[j:], old child)</code>, and the parent&rsquo;s edge
              becomes <code>(label[:j], middle)</code>. Move to the child (or the middle node) and add <code>j</code> to <code>i</code>. When the
              word is used up, mark the node as a word end.
            </p>
            <p>
              Searching: the same walk, but never change anything. If the string runs out in the middle of a label, <code>search</code> is false
              and <code>starts_with</code> is true, provided the covered part of the label matches.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`insert(word): node, i = root, 0
    while i < len(word):
        if word[i] not in node.kids:
            node.kids[word[i]] = (word[i:], leaf marked end); return
        label, child = node.kids[word[i]]
        j = shared letters of label and word[i:]
        if j < len(label):
            mid = RNode(); mid.kids[label[j]] = (label[j:], child)
            node.kids[word[i]] = (label[:j], mid); child = mid
        node, i = child, i + j
    node.end = True`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The largest XOR of two numbers",
    fn: "max_xor",
    lessons: [5],
    starter: `def max_xor(nums):
    # the largest a ^ b over two different positions of nums
    pass
`,
    statement: (
      <>
        <p>
          Return the largest value of <code>nums[i] ^ nums[j]</code> for two different positions <code>i</code> and <code>j</code>. <code>^</code>{" "}
          is XOR: a result bit is 1 where the two numbers&rsquo; bits differ.
        </p>
        <CodeBlock
          code={`max_xor([3, 10, 5, 25, 2, 8])   # 28, from 5 ^ 25
max_xor([1, 2])                 # 3
max_xor([7, 7, 7])              # 0`}
        />
        <p>
          In binary, 5 is <code>00101</code> and 25 is <code>11001</code>, so 5 ^ 25 is <code>11100</code>, which is 16 + 8 + 4 = 28.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            2 to 20,000 numbers, each from 0 to 2<sup>30</sup> − 1 (at most 30 bits). Comparing every pair is too slow; aim for{" "}
            <M>O(n · B)</M> with <M>B</M> bits.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A 1 in the highest bit of the result beats any mix of lower bits. For one number x, which stored number gives the highest possible top bit, then the next?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store the numbers in a trie of bits, highest bit first, with every number written with the same number of bits (30, or{" "}
              <code>max(nums).bit_length()</code>). A node can be a list <code>[child for 0, child for 1]</code>.
            </p>
            <p>
              For each number <code>x</code>, walk down from the root: at bit <code>k</code>, if the child for the opposite of{" "}
              <code>x &gt;&gt; k &amp; 1</code> exists, go there and add <code>1 &lt;&lt; k</code> to the result; otherwise take the other
              child. Insert the numbers one at a time and query each before inserting it, so every pair is considered once.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`B = max(nums).bit_length(); root = [None, None]; best = 0
for each x in nums:
    if root has children:
        node, r = root, 0
        for k from B - 1 down to 0:
            b = x >> k & 1
            if node[1 - b]: r += 1 << k; node = node[1 - b]
            else: node = node[b]
        best = max(best, r)
    insert x: for k from B - 1 down to 0, create node[b] if missing
return best`}
          />
        ),
      },
    ],
    tests: t5,
  },
];
