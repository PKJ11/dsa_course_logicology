import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DictFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A list finds a value by its position. A dictionary finds a value by a key, such as a name or a code, and it does this without searching
        through the other keys. Many practice problems in this course depend on this fact.
      </p>

      <h2 id="dict">Dictionaries</h2>
      <p>
        A <em>dictionary</em> (<code>dict</code>) stores pairs. Each pair has a <em>key</em> and a <em>value</em>. You look up a value by its key,
        the way you look up a word in a real dictionary to find its meaning.
      </p>
      <CodeBlock
        code={`platform = {"BCT": 3, "HWH": 9}
platform["BCT"]            # 3
platform["MAS"] = 5        # add a new pair
"HWH" in platform          # True: is "HWH" a key?
platform.get("NDLS", 0)    # 0: the key is missing, so use the default
for code, p in platform.items():
    print(code, p)`}
      />
      <p>
        Reading a missing key with square brackets, as in <code>platform[&quot;NDLS&quot;]</code>, raises a <code>KeyError</code>. Use{" "}
        <code>in</code> or <code>.get</code> when a key might be missing. A key must be a value that cannot change, such as a number, a string or a
        tuple. A list cannot be a key.
      </p>

      <h2 id="counting">Counting with a dictionary</h2>
      <p>
        Counting how often each value appears is one of the most common jobs in this course. Step through the figure to see it done with{" "}
        <code>.get</code>.
      </p>

      <DictFigure />

      <p>
        Python also has a ready-made counter. <code>Counter</code> from the <code>collections</code> module does the same thing in one line:
      </p>
      <CodeBlock
        code={`from collections import Counter
Counter(["BCT", "HWH", "BCT"])     # Counter({'BCT': 2, 'HWH': 1})`}
      />

      <h2 id="sets">Sets</h2>
      <p>
        A <em>set</em> holds values with no repeats and no order. Its main use is a fast answer to one question: is this value in the set?
      </p>
      <CodeBlock
        code={`seen = set()          # an empty set ({} would make an empty dict)
seen.add("BCT")
seen.add("BCT")       # already there, so nothing changes
"BCT" in seen         # True
len(seen)             # 1
set([3, 1, 3, 2])     # {1, 2, 3}: repeats removed`}
      />
      <p>
        A set has no index. <code>seen[0]</code> is an error, because the values have no positions.
      </p>

      <h2 id="tuples">Tuples</h2>
      <p>
        A <em>tuple</em> is like a list that cannot be changed. You write it with round brackets. Use a tuple for a small group of values that
        belong together, such as a row and a column.
      </p>
      <CodeBlock
        code={`cell = (2, 5)
row, col = cell       # unpacking: row = 2, col = 5
visited = {(0, 0), (2, 5)}    # tuples can go in a set
a, b = b, a           # swap two names; Python builds a tuple to do it`}
      />

      <h2 id="costs">How fast each one is</h2>
      <p>
        This table is the reason dictionaries and sets matter. Here <M>n</M> is the number of values stored. &ldquo;Average&rdquo; means
        typical behaviour; the HASH station explains the rare slow case.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Cost of common operations</caption>
          <thead>
            <tr>
              <th>Operation</th>
              <th>list</th>
              <th>dict or set (average)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>x in c</code> (c is the list, dict or set)</td><td>checks values one by one, up to <M>n</M></td><td>about the same time for any <M>n</M></td></tr>
            <tr><td>add a value</td><td><code>append</code>: fast</td><td><code>add</code> or <code>d[k] = v</code>: fast</td></tr>
            <tr><td>remove a value</td><td>up to <M>n</M> moves</td><td>fast</td></tr>
            <tr><td>read by position</td><td><code>a[i]</code>: fast</td><td>not possible</td></tr>
          </tbody>
        </table>
      </div>
      <Invariant label="Rule">
        If you check <code>x in something</code> inside a loop, that something should be a set or a dict, not a list.
      </Invariant>
      <Note title="Why this matters">
        <p>
          A loop over <M>n</M> values that checks <code>x in a_list</code> each time does up to <M>n × n</M> checks. For <M>n</M> = 100,000 that is 10
          billion checks, which takes minutes. With a set it takes a fraction of a second. BIGO-1 shows how to count this.
        </p>
      </Note>
    </>
  );
}
