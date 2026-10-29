import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BloomFigure } from "./figures";

export default function Lesson8() {
  return (
    <>
      <p className="lesson__lede">
        A set of a million long strings takes a lot of memory. A Bloom filter answers &ldquo;have I seen this?&rdquo; using about 10 bits per item,
        whatever the size of the items. The cost is that it is sometimes wrong, but only in one direction, and you can choose how often.
      </p>

      <h2 id="bits">Bits instead of keys</h2>
      <p>
        A Bloom filter (named after Burton Bloom, 1970) is an array of <M>m</M> bits, all 0 at the start, together with <M>k</M> different hash
        functions. Each hash function maps an item to a position from 0 to <M>m − 1</M>.
      </p>
      <ul>
        <li>
          <strong>Add</strong> an item: compute its <M>k</M> positions and set those bits to 1.
        </li>
        <li>
          <strong>Ask</strong> about an item: compute its <M>k</M> positions. If any of those bits is 0, say &ldquo;no&rdquo;. If all are 1, say
          &ldquo;maybe&rdquo;.
        </li>
      </ul>
      <p>
        The filter never stores the items. It cannot list them, and it does not care how long they are. Step through three adds and three
        questions:
      </p>

      <BloomFigure />

      <p>
        The <M>k</M> hash functions do not need to be truly different functions. A trick called <em>double hashing</em> makes all <M>k</M>{" "}
        positions from two hash values <M>a</M> and <M>b</M>: the positions are <M>a, a + b, a + 2b, …</M>, each taken <code>% m</code>. This is
        what the figure and practice HASH-P6 use.
      </p>
      <CodeBlock
        code={`def positions(word, m, k):
    a, b = h1(word), h2(word)            # two hash values
    return [(a + i * b) % m for i in range(k)]`}
      />

      <h2 id="answers">No is sure, yes is maybe</h2>
      <p>
        When an item is added, its bits become 1, and nothing ever sets a bit back to 0. So if any of an item&rsquo;s bits is 0, the item was surely
        never added. A &ldquo;no&rdquo; is always right.
      </p>
      <p>
        A &ldquo;maybe&rdquo; can be wrong. Other items may have set all <M>k</M> bits between them, as <code>owl</code> and <code>dog</code> did for{" "}
        <code>bee</code> in the figure. A wrong &ldquo;maybe&rdquo; is called a <em>false positive</em>. The opposite mistake, a wrong
        &ldquo;no&rdquo;, is called a <em>false negative</em>, and a Bloom filter never makes it.
      </p>
      <Invariant label="Rule">A Bloom filter has no false negatives. It may have false positives, and their rate depends on m, n and k.</Invariant>
      <p>
        You cannot remove an item. Clearing its bits might clear a bit that another item needs, and that would create a false negative. A{" "}
        <em>counting Bloom filter</em> keeps a small counter instead of each bit: add raises the counters, remove lowers them, and a position counts
        as set while its counter is above 0.
      </p>

      <h2 id="maths">How often it is wrong</h2>
      <p>
        Assume each hash position is a random bit, as in lesson 2. One position misses a particular bit with chance <M>1 − 1/m</M>. Adding{" "}
        <M>n</M> items makes <M>k·n</M> positions, so the bit is still 0 with chance <M>(1 − 1/m)<sup>k·n</sup></M>. That means <M>k·n</M> copies of <M>1 − 1/m</M> multiplied together.
      </p>
      <p>
        There is a simpler form. The number <M>e</M>, about 2.718, has this property: when <M>m</M> is large, <M>(1 − 1/m)<sup>m</sup></M> is very close to{" "}
        <M>1/e</M>. So the chance that a bit is still 0 is close to <M>e<sup>−k·n/m</sup></M>, which means 1 divided by <M>e</M> raised to the power{" "}
        <M>k·n/m</M>. In Python this is <code>math.exp(-k * n / m)</code>.
      </p>
      <p>
        An item that was never added gets a false &ldquo;maybe&rdquo; when all <M>k</M> of its bits are 1. Treating the bits as independent, that
        happens with chance
      </p>
      <CodeBlock code={`rate = (1 - math.exp(-k * n / m)) ** k     # about the false positive rate`} />
      <p>
        Here <code>** k</code> raises the result to the power <M>k</M>: it multiplies the result by itself <M>k</M> times. Too few hash functions,
        and each question checks too few bits. Too many, and the array fills with 1s. The best number turns out to be{" "}
        <M>k = (m/n) · ln 2</M>, about <M>0.69 · m/n</M>, where <M>ln 2 ≈ 0.693</M> is the power you raise <M>e</M> to in order to get 2. With that{" "}
        <M>k</M>, about half the bits end up as 1. The table shows the rate for a few sizes:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">False positive rate for a few filter sizes, with the best number of hash functions</caption>
          <thead>
            <tr>
              <th className="num">Bits per item (m/n)</th>
              <th className="num">Best k</th>
              <th className="num">False positive rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="num">8</td>
              <td className="num">6</td>
              <td className="num">2.2%</td>
            </tr>
            <tr>
              <td className="num">10</td>
              <td className="num">7</td>
              <td className="num">0.82%</td>
            </tr>
            <tr>
              <td className="num">16</td>
              <td className="num">11</td>
              <td className="num">0.046%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        About 9.6 bits per item give a 1% rate, and every extra 4.8 bits per item divide the rate by 10. Compare a Python set of short strings,
        which needs roughly 100 bytes, or 800 bits, per item. Both <code>add</code> and the question take <M>O(k)</M> time, whatever the number of
        items.
      </p>
      <Note title="Plan the size first" warn>
        <p>
          The array size is fixed when the filter is made. If you add many more items than planned, the bits fill up and the false positive rate
          climbs towards 100%. Choose <M>m</M> from the largest <M>n</M> you expect and the rate you can accept.
        </p>
      </Note>

      <h2 id="uses">Where they are used</h2>
      <p>A Bloom filter is useful when a &ldquo;no&rdquo; saves slow work, and an occasional wrong &ldquo;maybe&rdquo; only costs a little time:</p>
      <ul>
        <li>
          <strong>Databases</strong> such as LevelDB, RocksDB and Cassandra keep a filter for each file on disk. Before reading a file to look for a
          key, they ask its filter. A &ldquo;no&rdquo; skips the slow disk read.
        </li>
        <li>
          <strong>Web caches</strong> use a filter to avoid storing pages that are asked for only once: a page is stored on its second request, when
          the filter already says &ldquo;maybe&rdquo;.
        </li>
        <li>
          <strong>Spell checkers and blocklists</strong> keep a large list of words or bad addresses in little memory. A &ldquo;maybe&rdquo; is
          then checked against the full list, which is rarely needed.
        </li>
      </ul>
      <p>
        In each case a false positive leads to a check that was not needed, never to a wrong final answer. That is the rule for using a Bloom
        filter: let it rule things out, and confirm what it lets through.
      </p>
    </>
  );
}
