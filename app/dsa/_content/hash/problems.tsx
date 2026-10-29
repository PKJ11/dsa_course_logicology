import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

const H = `def h1(word):
    # First hash function (given). Do not change it.
    total = 0
    for ch in word:
        total = (total * 31 + ord(ch)) % 2**32
    return total


def h2(word):
    # Second hash function (given). "| 1" sets the lowest
    # bit to 1, so the result is always odd.
    total = 0
    for ch in word:
        total = (total * 37 + ord(ch)) % 2**32
    return total | 1

`;

function OpsNote() {
  return (
    <p>
      The tests make an object and call its methods in order. A test shows the list of calls, and compares the list of everything they returned
      (methods that return nothing give <code>None</code>).
    </p>
  );
}

export const HASH_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "A table of buckets",
    fn: "ChainMap",
    lessons: [1, 2],
    starter: `class ChainMap:
    # A hash table with chaining. Do not use dict or set.

    def __init__(self):
        # Start with 8 empty buckets.
        pass

    def put(self, key, value):
        # Add key with value, or replace the value if key is there.
        # If the number of keys is now bigger than the number of
        # buckets, double the buckets and move every key.
        pass

    def get(self, key, default=None):
        pass

    def remove(self, key):
        # Return True if key was removed, False if it was not there.
        pass

    def __len__(self):
        pass

    def buckets(self):
        # The keys in each bucket, as a list of lists.
        pass
`,
    statement: (
      <>
        <p>
          Build a hash table that uses chaining (lesson 2). Do not use Python&rsquo;s <code>dict</code> or <code>set</code>: the point is to build
          one. Use Python&rsquo;s own <code>hash(key)</code> for the hash.
        </p>
        <ul>
          <li>
            A new table has 8 buckets. A key goes in bucket <code>hash(key) % m</code>, where <code>m</code> is the number of buckets.
          </li>
          <li>A new key goes at the end of its bucket&rsquo;s chain.</li>
          <li>
            After a <code>put</code> adds a new key, if the number of keys <M>n</M> is now bigger than <M>m</M>, double <M>m</M>. Then move every key
            to its new bucket: take the old buckets in order (0 first), and each chain from front to back.
          </li>
          <li>The table never shrinks.</li>
          <li>
            <code>buckets()</code> returns the keys in each bucket, for example <code>[[], [9], [], [3, 11]]</code>.
          </li>
        </ul>
        <CodeBlock
          code={`T = ChainMap()
T.put('NDLS', 1); T.put('BCT', 2)
T.get('NDLS')      # 1
T.get('MAS')       # None
T.remove('BCT')    # True
len(T)             # 1`}
        />
        <OpsNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 keys. Every method except buckets() must take O(1) time on average.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Keep a list of <M>m</M> lists. Every method starts the same way: <code>bucket = self.b[hash(key) % self.m]</code>. Then it walks that one
            short list.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store each key and value as a small list <code>[key, value]</code>, so <code>put</code> can change the value in place. Keep a count{" "}
              <code>n</code> that <code>put</code> and <code>remove</code> update.
            </p>
            <p>
              To grow, keep the old list of buckets, make <code>2 * m</code> empty ones, and append every pair to its new bucket. Each key&rsquo;s bucket
              changes because <code>m</code> changed.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`put(key, value):
    bucket = b[hash(key) % m]
    for pair in bucket:
        if pair[0] == key: pair[1] = value; return
    bucket.append([key, value]); n += 1
    if n > m:
        old = b; m = 2 * m; b = m empty lists
        for chain in old:
            for pair in chain:
                b[hash(pair[0]) % m].append(pair)`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Probing with markers",
    fn: "ProbeTable",
    lessons: [3],
    starter: `class ProbeTable:
    # Open addressing with linear probing. One key per slot.
    # A slot holds None (empty), 'DEL' (a deleted marker) or a key.

    def __init__(self, m):
        pass

    def insert(self, key):
        # Return the slot that now holds key, or -1 if there is no room.
        pass

    def contains(self, key):
        pass

    def remove(self, key):
        # Return True if key was removed, False if it was not there.
        pass

    def slots(self):
        # All m slots, as a list.
        pass
`,
    statement: (
      <>
        <p>
          Build the table from the figure in lesson 3: <code>m</code> slots, keys are whole numbers, and a key&rsquo;s home slot is{" "}
          <code>key % m</code>. If a slot is taken, try the next one, <code>(i + 1) % m</code>. The table never grows.
        </p>
        <ul>
          <li>
            <code>contains</code> starts at the home slot and probes until it finds the key (True) or an empty slot (False). It skips{" "}
            <code>&apos;DEL&apos;</code> markers. It never looks at more than <code>m</code> slots.
          </li>
          <li>
            <code>remove</code> finds the key the same way and puts <code>&apos;DEL&apos;</code> in its slot.
          </li>
          <li>
            <code>insert</code> does nothing if the key is already there, and returns its slot. Otherwise it puts the key in the first{" "}
            <code>&apos;DEL&apos;</code> slot it passed, or else in the empty slot where it stopped, and returns that slot. If it finds neither in{" "}
            <code>m</code> probes, it returns <code>-1</code>.
          </li>
        </ul>
        <CodeBlock
          code={`T = ProbeTable(10)
T.insert(23); T.insert(43); T.insert(13)   # 3, 4, 5
T.remove(43)                               # True
T.slots()
# [None, None, None, 23, 'DEL', 13,
#  None, None, None, None]
T.contains(13)                             # True`}
        />
        <OpsNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 131,072 slots and 100,000 keys. Keys may be negative.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            All three methods walk the same path: start at <code>key % m</code> and step with <code>(i + 1) % m</code>, at most <code>m</code> times.
            What should each one do when it meets a marker?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write one helper <code>_find(key)</code> that returns the key&rsquo;s slot or <code>-1</code>: stop at <code>None</code>, skip{" "}
              <code>&apos;DEL&apos;</code>, stop when the slot holds the key. <code>contains</code> and <code>remove</code> use it.
            </p>
            <p>
              <code>insert</code> walks the same path but remembers the first marker in a name <code>free</code>. It may not use the marker straight
              away: the key could still be further on. Only at an empty slot (or after <code>m</code> probes) is the key known to be missing.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`insert(key):
    i = key % m; free = -1
    repeat m times:
        if s[i] is None: if free < 0: free = i
                         stop
        if s[i] == 'DEL': if free < 0: free = i
        elif s[i] == key: return i
        i = (i + 1) % m
    if free >= 0: s[free] = key
    return free`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Longest run",
    fn: "longest_run",
    lessons: [5, 6],
    blocked: ["sorted"],
    starter: `def longest_run(nums):
    # Length of the longest run of consecutive whole numbers
    # (like 4, 5, 6, 7) that can be made from values in nums.
    pass
`,
    statement: (
      <>
        <p>
          Given a list of whole numbers in any order, return the length of the longest run of consecutive numbers among them. A run is a set of
          numbers like 4, 5, 6, 7, where each is one more than the one before.
        </p>
        <CodeBlock
          code={`longest_run([100, 4, 200, 1, 3, 2])   # 4  (1, 2, 3, 4)
longest_run([1, 2, 2, 3])             # 3  (repeats once)
longest_run([])                       # 0`}
        />
        <p>
          Sorting would make this easy, but it costs <M>O(n log n)</M>. Do it in <M>O(n)</M> on average. <code>sorted()</code> and{" "}
          <code>.sort()</code> are switched off.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 numbers.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Put the numbers in a set. Now &ldquo;is x + 1 here?&rdquo; is an O(1) question. Where should you start counting a run?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Only start counting at a number <code>x</code> where <code>x - 1</code> is <em>not</em> in the set: the smallest number of its run.
              From there, count up while <code>x + 1</code>, <code>x + 2</code>, … are in the set.
            </p>
            <p>
              Each number is then counted once, inside the one run it belongs to. If you start counting at every number instead, a run of length{" "}
              <M>n</M> costs <M>n + (n − 1) + … + 1</M> steps, which is <M>O(n²)</M>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`s = set(nums); best = 0
for x in s:
    if x - 1 not in s:
        y = x
        while y + 1 in s: y += 1
        best = max(best, y - x + 1)
return best`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Stretches that add up to k",
    fn: "count_sums",
    lessons: [6],
    starter: `def count_sums(a, k):
    # How many stretches of neighbouring values (at least one value)
    # add up to exactly k?
    pass
`,
    statement: (
      <>
        <p>
          A <em>stretch</em> is one or more neighbouring values of <code>a</code>, like <code>a[2]</code>, <code>a[3]</code>, <code>a[4]</code>.
          Count the stretches whose values add up to exactly <code>k</code>. Values can be negative.
        </p>
        <CodeBlock
          code={`count_sums([1, 1, 1], 2)        # 2: [1, 1] twice
count_sums([1, 2, 3], 3)        # 2: [1, 2] and [3]
count_sums([1, -1, 0], 0)       # 3: [1, -1], [0], [1, -1, 0]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values. There are about <M>n²/2</M> stretches, so you cannot try them all.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Let <code>p</code> be the running total (the prefix sum) after each value. The stretch from just after place <code>i</code> up to place{" "}
            <code>j</code> adds up to <code>p[j] − p[i]</code>. When is that equal to <code>k</code>?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              A stretch ending at the current place adds up to <code>k</code> exactly when an earlier prefix sum equals <code>total − k</code>. So
              keep a dict that counts how often each prefix sum has appeared so far, and add <code>seen[total − k]</code> at every step.
            </p>
            <p>
              Start the dict with <code>{"{0: 1}"}</code>: the total before any value is 0, which lets a stretch start at place 0. Look up first, then
              store the current total, so a stretch is never empty.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`seen = {0: 1}; total = count = 0
for x in a:
    total += x
    count += seen.get(total - k, 0)
    seen[total] = seen.get(total, 0) + 1
return count`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "An LRU cache",
    fn: "LRUCache",
    lessons: [7],
    blocked: ["collections.OrderedDict"],
    starter: `class LRUCache:
    # Keeps at most capacity items. When full, a new key throws out
    # the least recently used one. get and put both count as a use.

    def __init__(self, capacity):
        pass

    def get(self, key):
        # The value for key, or -1 if key is not in the cache.
        pass

    def put(self, key, value):
        pass
`,
    statement: (
      <>
        <p>
          Build an LRU cache (lesson 7). It holds at most <code>capacity</code> keys, each with a value.
        </p>
        <ul>
          <li>
            <code>get(key)</code> returns the value, or <code>-1</code> if the key is not there. A successful get makes the key the most recently
            used.
          </li>
          <li>
            <code>put(key, value)</code> sets the value and makes the key the most recently used. If the key is new and the cache is full, first
            throw out the least recently used key.
          </li>
          <li>Both methods must take O(1) time on average.</li>
        </ul>
        <CodeBlock
          code={`C = LRUCache(2)
C.put(1, 1); C.put(2, 2)
C.get(1)       # 1   (now 2 is the least recently used)
C.put(3, 3)    # throws out 2
C.get(2)       # -1`}
        />
        <p>
          <code>collections.OrderedDict</code> is switched off: build the two-way list yourself.
        </p>
        <OpsNote />
        <h2>Limits</h2>
        <ul>
          <li>Capacity up to 50,000; up to 200,000 calls.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            You need two things in O(1): find a key, and move it to the &ldquo;most recent&rdquo; end of an order. A dict does the first. What
            structure lets you take an item out of the middle in O(1)?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a two-way linked list with two sentinel nodes, <code>front</code> and <code>back</code> (LINK-3 and LINK-P2). The node just after{" "}
              <code>front</code> is the most recent; the node just before <code>back</code> is the least recent.
            </p>
            <p>
              A dict maps each key to its node. Each node stores its key too, so that when you throw out the last node you can delete its key from
              the dict. A use is: unlink the node, then insert it after <code>front</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`get(key):
    node = map.get(key); if node is None: return -1
    unlink(node); push_front(node); return node.value
put(key, value):
    if key in map:
        node.value = value; unlink; push_front; return
    if len(map) == capacity:
        old = back.prev; unlink(old); del map[old.key]
    node = Node(key, value); map[key] = node; push_front(node)`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "A Bloom filter",
    fn: "Bloom",
    lessons: [8],
    starter: `import math

${H}
class Bloom:
    def __init__(self, m, k):
        # m bits, all 0, and k hash positions per word.
        pass

    def add(self, word):
        pass

    def might_contain(self, word):
        # False means surely not added. True means maybe.
        pass

    def bits(self):
        # The positions of the bits that are 1, smallest first.
        pass

    def false_rate(self, n):
        # The expected false positive rate after n words are added.
        pass
`,
    statement: (
      <>
        <p>
          Build the Bloom filter from lesson 8. It has <code>m</code> bits and uses <code>k</code> positions per word. The two hash functions{" "}
          <code>h1</code> and <code>h2</code> are given in the starter code. The positions for a word are
        </p>
        <CodeBlock code={`(h1(word) + i * h2(word)) % m      for i = 0, 1, …, k − 1`} />
        <p>
          This trick, called double hashing, makes <code>k</code> positions from just two hash values.
        </p>
        <ul>
          <li>
            <code>add(word)</code> sets the word&rsquo;s <code>k</code> bits to 1.
          </li>
          <li>
            <code>might_contain(word)</code> is True only if all <code>k</code> of its bits are 1.
          </li>
          <li>
            <code>bits()</code> lists the positions that are 1, smallest first.
          </li>
          <li>
            <code>false_rate(n)</code> returns the expected false positive rate after <code>n</code> words (lesson 8). In Python it is{" "}
            <code>(1 - math.exp(-k * n / m)) ** k</code>. Here <code>math.exp(x)</code> is the number e (about 2.718) raised to the power x, and{" "}
            <code>** k</code> raises the result to the power k.
          </li>
        </ul>
        <CodeBlock
          code={`B = Bloom(16, 3)
B.add('cat'); B.add('dog'); B.add('owl')
B.bits()                  # [0, 2, 3, 4, 6, 10, 11, 12]
B.might_contain('fox')    # False
B.might_contain('bee')    # True: a false positive`}
        />
        <p>Store bits, not words: the tests check that false positives happen exactly where they should.</p>
        <OpsNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 1,000,000 bits and 100,000 words.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Keep the bits in a list of <code>m</code> zeros, or a <code>bytearray(m)</code>, which is smaller. Both <code>add</code> and{" "}
            <code>might_contain</code> need the same <code>k</code> positions, so write a helper for them.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The helper computes <code>a = h1(word)</code> and <code>b = h2(word)</code> once, then returns <code>(a + i * b) % m</code> for{" "}
              <code>i</code> in <code>range(k)</code>.
            </p>
            <p>
              <code>might_contain</code> is <code>all(...)</code> over those positions. <code>bits()</code> walks the positions 0 to <code>m − 1</code> in
              order, so the list comes out sorted.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`__init__: self.m, self.k = m, k; self.b = bytearray(m)
pos(word): a, b = h1(word), h2(word)
           return [(a + i * b) % m for i in range(k)]
add: for p in pos(word): b[p] = 1
might_contain: return all(b[p] for p in pos(word))
bits: return [i for i in range(m) if b[i]]
false_rate(n): return (1 - math.exp(-k * n / m)) ** k`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
