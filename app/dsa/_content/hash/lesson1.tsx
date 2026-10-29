import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BucketFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A Python list finds an item by its position. Often you want to find it by a name instead: the price of a ticket from its code, or the
        count of a word. A hash table does this in <M>O(1)</M> time on average. Python&rsquo;s <code>dict</code> and <code>set</code> are hash
        tables.
      </p>

      <h2 id="table">What a hash table does</h2>
      <p>
        A hash table stores <em>keys</em>, and usually a <em>value</em> with each key. It answers three questions quickly: add this key, find
        this key, remove this key.
      </p>
      <p>
        Inside, it is an array of <M>m</M> places called <em>buckets</em>, numbered 0 to <M>m − 1</M>. The key idea is to work out, from the key
        alone, which bucket the key belongs in. Then a find does not search the whole table. It goes straight to one bucket.
      </p>
      <CodeBlock
        code={`fares = {}                 # an empty dict: a hash table
fares['NDLS'] = 450        # add a key with a value
fares['NDLS']              # 450: find it by its key
'BCT' in fares             # False
del fares['NDLS']          # remove it`}
      />

      <h2 id="function">A hash function</h2>
      <p>
        A <em>hash function</em> turns a key into a whole number, called its <em>hash</em>. The table then takes the remainder after dividing by{" "}
        <M>m</M>, written <code>hash % m</code>. The remainder is always between 0 and <M>m − 1</M>, so it is a bucket number.
      </p>
      <p>
        The figure hashes four short words into 7 buckets. <code>ord(ch)</code> gives the code number of a letter: <code>ord(&apos;a&apos;)</code>{" "}
        is 97. Step through both versions and compare where the words land:
      </p>

      <BucketFigure />

      <p>
        When two keys land in the same bucket, it is called a <em>collision</em>. With more keys than buckets, collisions cannot be avoided, so
        every hash table needs a plan for them. Lessons 2 and 3 show the two usual plans.
      </p>
      <Invariant label="Rule">The same key must always give the same hash. Otherwise a find looks in a different bucket from the one the key went into.</Invariant>

      <h2 id="good">What makes a hash function good</h2>
      <p>A good hash function has three properties:</p>
      <ul>
        <li>
          <strong>It is fixed.</strong> The same key always gives the same number, while it is in the table.
        </li>
        <li>
          <strong>It is fast.</strong> Hashing a key of length <M>L</M> should take <M>O(L)</M> time, one pass over the key.
        </li>
        <li>
          <strong>It spreads keys evenly.</strong> Keys that look alike, such as <code>cat</code> and <code>act</code>, or 100 and 101, should land
          in buckets that look unrelated.
        </li>
      </ul>
      <p>
        Adding the letter codes fails the third test: it ignores the order of the letters. Multiplying the total by a number like 31 before adding
        each letter fixes this. The first letter ends up multiplied by 31 many times, the last letter once, so moving a letter changes the result.
        Java hashes its strings in exactly this way. The method has a name: a <em>polynomial hash</em>, because the result is{" "}
        <M>c₀·31<sup>L−1</sup> + c₁·31<sup>L−2</sup> + … + c<sub>L−1</sub></M>. Here <M>c₀</M> is the first letter&rsquo;s code, and{" "}
        <M>31<sup>L−1</sup></M> means <M>L − 1</M> copies of 31 multiplied together (and 31⁰ is 1).
      </p>
      <p>
        The choice of <M>m</M> matters too. If <M>m</M> is 10, then <code>k % 10</code> keeps only the last digit of <M>k</M>. Keys like 10, 20, 30
        would all collide. A prime <M>m</M>, or a hash that mixes all the digits first, avoids this.
      </p>

      <h2 id="python">hash() in Python</h2>
      <p>
        Python has a built-in <code>hash(x)</code>. A <code>dict</code> calls it on every key. Some things to know:
      </p>
      <CodeBlock
        code={`hash(42)          # 42: a small whole number is its own hash
hash(-1)          # -2: a quirk; inside CPython, -1 means "error"
hash(1.0)         # 1: equal numbers have equal hashes, so
{1: 'a'}[1.0]     # 'a': 1 and 1.0 are the same key
hash((2, 3))      # works: a tuple of hashable items is hashable
hash([2, 3])      # TypeError: unhashable type: 'list'`}
      />
      <p>
        A list can change after you add it to a table. Its hash would then change too, and the table would look in the wrong bucket. So Python
        refuses to hash lists, dicts and sets. Their fixed versions, <code>tuple</code> and <code>frozenset</code>, are hashable. Things that can be
        hashed are called <em>hashable</em>.
      </p>
      <p>Your own classes follow one rule:</p>
      <Invariant label="Rule">If a == b, then hash(a) must equal hash(b).</Invariant>
      <p>
        By default, an object is equal only to itself, and its hash comes from its identity. If you define <code>__eq__</code> to compare by value,
        Python sets <code>__hash__</code> to <code>None</code>, so the objects become unhashable. That stops you from breaking the rule by
        accident. To make them hashable again, define <code>__hash__</code> from the same fields that <code>__eq__</code> compares:
      </p>
      <CodeBlock
        code={`class Station:
    def __init__(self, code, name):
        self.code, self.name = code, name
    def __eq__(self, other):
        return isinstance(other, Station) and self.code == other.code
    def __hash__(self):
        return hash(self.code)      # the same field __eq__ uses`}
      />
      <Note title="Different runs, different hashes">
        <p>
          Run <code>hash(&apos;cat&apos;)</code> twice in two separate Python programs and you will get two different numbers. Python mixes a
          random number into string hashes each time it starts. Lesson 4 explains why. Inside one run, the hash never changes, which is all a table
          needs.
        </p>
      </Note>
    </>
  );
}
