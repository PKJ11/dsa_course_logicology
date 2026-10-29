import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ProbeFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        The second plan for collisions keeps no chains at all. Every key sits in the array itself, one key per slot. When a key&rsquo;s slot is
        taken, it tries other slots in a fixed order until it finds a free one. This plan is called open addressing. Python&rsquo;s dict uses it.
      </p>

      <h2 id="probing">One key per slot</h2>
      <p>
        Each key has a <em>home slot</em>, <code>hash(key) % m</code>. If the home slot is taken, the simplest rule is to try the next slot, then
        the next, wrapping round from the last slot to slot 0. This rule is called <em>linear probing</em>. Each look at a slot is a{" "}
        <em>probe</em>.
      </p>
      <p>
        The order of slots a key tries is its <em>probe sequence</em>. Insert and find must use the same sequence. A find walks the sequence until it
        meets the key (found) or an empty slot (not there). An empty slot proves the key is missing, because the insert would have stopped at that
        slot, or earlier.
      </p>

      <ProbeFigure />

      <p>
        In the first variant, 23, 43 and 13 all have home slot 3. They fill slots 3, 4 and 5 in a row. A block of taken slots like this is called a{" "}
        <em>cluster</em>. Any new key whose home slot falls in the cluster must walk to its end, and then it makes the cluster one longer. Long
        clusters grow faster than short ones, because more home slots fall inside them. This is the main weakness of linear probing.
      </p>

      <h2 id="remove">Removing needs a marker</h2>
      <p>
        The last variant of the figure shows the problem. Emptying the slot of a removed key cuts the probe sequence of every key stored after it.
        A later find stops at the new empty slot and wrongly says &ldquo;not there&rdquo;.
      </p>
      <p>
        The fix is a <em>deleted marker</em>, often called a <em>tombstone</em>. The slot is not empty; it says &ldquo;a key was here, keep
        going&rdquo;. The three jobs treat it differently:
      </p>
      <ul>
        <li>
          <strong>Find</strong> skips markers and keeps going.
        </li>
        <li>
          <strong>Insert</strong> remembers the first marker it passes, but keeps going until an empty slot. Only then does it know the key is not
          already stored further on. Then it puts the key in the remembered marker&rsquo;s slot.
        </li>
        <li>
          <strong>Remove</strong> finds the key and puts a marker in its slot.
        </li>
      </ul>
      <CodeBlock
        code={`DEL = object()                 # a unique marker, equal to nothing else

def find(slots, key):
    m = len(slots)
    i = hash(key) % m
    for _ in range(m):             # never more than m probes
        if slots[i] is None:
            return -1              # empty: the key is not here
        if slots[i] is not DEL and slots[i] == key:
            return i
        i = (i + 1) % m
    return -1`}
      />
      <p>
        Markers still slow finds down, because finds must walk past them. When too many slots hold markers, the table is rebuilt: every live key is
        inserted into a fresh array, and the markers disappear.
      </p>

      <h2 id="load">How full is too full</h2>
      <p>
        With open addressing, the load factor <M>α = n / m</M> can never pass 1: there is one slot per key. As <M>α</M> nears 1, probe sequences get
        long. For a clean argument, imagine a perfect version of probing where every probe lands on a random slot not tried yet.
      </p>
      <p>
        Look for a missing key. The first probe hits a taken slot with chance <M>α</M>. If it does, the second probe hits a taken slot with chance
        a little less than <M>α</M>, and so on. So the chance of needing more than <M>j</M> probes is at most <M>j</M> copies of <M>α</M>{" "}
        multiplied together, written <M>α<sup>j</sup></M> (and α⁰ is 1). Adding these chances up, the expected number of probes is at most{" "}
        <M>1 + α + α² + α³ + …</M>. That sum equals <span className="nowrap"><M>1 / (1 − α)</M></span>, the standard formula for adding up powers of a number
        below 1.
      </p>
      <Invariant label="Cost">
        A miss takes at most <span className="nowrap">1 / (1 − α)</span> probes on average with ideal probing. At <span className="nowrap">α = 0.9</span> that is 10 probes; at{" "}
        <span className="nowrap">α = 0.5</span>, only 2.
      </Invariant>
      <p>
        Linear probing does worse, because of clusters. Donald Knuth worked out its averages in 1963. The table compares them, including chaining
        (lesson 2) for reference:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Average probes or comparisons for each method at three load factors</caption>
          <thead>
            <tr>
              <th>Average cost</th>
              <th className="num">α = 0.5</th>
              <th className="num">α = 0.75</th>
              <th className="num">α = 0.9</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ideal probing, miss: 1 / (1 − α)</td>
              <td className="num">2</td>
              <td className="num">4</td>
              <td className="num">10</td>
            </tr>
            <tr>
              <td>Linear probing, miss: ½(1 + 1 / (1 − α)²)</td>
              <td className="num">2.5</td>
              <td className="num">8.5</td>
              <td className="num">50.5</td>
            </tr>
            <tr>
              <td>Linear probing, hit: ½(1 + 1 / (1 − α))</td>
              <td className="num">1.5</td>
              <td className="num">2.5</td>
              <td className="num">5.5</td>
            </tr>
            <tr>
              <td>Chaining, miss: α keys compared</td>
              <td className="num">0.5</td>
              <td className="num">0.75</td>
              <td className="num">0.9</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        So open-addressing tables grow early. Python&rsquo;s dict grows when it is two-thirds full. Java&rsquo;s <code>HashMap</code> (which uses
        chaining) grows at <M>α = 0.75</M>. Growing works as in lesson 2: double the array and reinsert every live key, <M>O(1)</M> amortised per
        insert. Markers count as taken when deciding to grow, because finds must walk past them.
      </p>

      <h2 id="choices">Other probe orders</h2>
      <p>Linear probing is one choice of probe sequence. Two others are common:</p>
      <ul>
        <li>
          <strong>Quadratic probing</strong> tries home + 1, home + 4, home + 9, … (adding the square numbers). Keys that share a cluster spread out
          faster. It needs care: with a badly chosen <M>m</M>, the sequence can skip some slots for ever.
        </li>
        <li>
          <strong>Double hashing</strong> uses a second hash to choose the step size: home, home + s, home + 2s, …, where <M>s</M> comes from the
          key. Two keys with the same home slot usually get different steps, so they do not follow each other. If <M>m</M> is a power of 2 and{" "}
          <M>s</M> is odd, the sequence visits every slot. Lesson 8 uses this trick.
        </li>
      </ul>
      <p>
        Linear probing is still widely used, because it reads neighbouring slots. Neighbouring slots sit together in memory, and the processor loads
        them together, so each probe after the first is very cheap. In practice this often beats the cleverer orders.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Chaining compared with open addressing</caption>
          <thead>
            <tr>
              <th />
              <th>Chaining</th>
              <th>Open addressing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Where keys live</td>
              <td>In chains outside the array</td>
              <td>In the array itself</td>
            </tr>
            <tr>
              <td>Load factor</td>
              <td>Can pass 1; usually kept near 1</td>
              <td>Must stay below 1; usually kept below 0.7</td>
            </tr>
            <tr>
              <td>Remove</td>
              <td>Take the key out of its chain</td>
              <td>Needs a deleted marker</td>
            </tr>
            <tr>
              <td>Memory</td>
              <td>An extra node or list per key</td>
              <td>Empty slots, but no extra objects</td>
            </tr>
            <tr>
              <td>Used by</td>
              <td>Java&rsquo;s HashMap, C++&rsquo;s unordered_map</td>
              <td>Python&rsquo;s dict and set, Rust&rsquo;s HashMap</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note title="Why never more than m probes?">
        <p>
          If the table has no empty slot (only keys and markers), a find for a missing key would go round for ever. Limiting the loop to <M>m</M>{" "}
          probes stops it. A real table grows long before this, but a careful implementation still sets the limit.
        </p>
      </Note>
    </>
  );
}
