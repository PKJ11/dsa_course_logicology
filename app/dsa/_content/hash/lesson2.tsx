import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ChainFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        The simplest plan for collisions: let a bucket hold more than one key. Each bucket keeps a short list of its keys, called a chain. This plan
        is called chaining.
      </p>

      <h2 id="chains">A chain in every bucket</h2>
      <p>
        Every job starts the same way. Hash the key, take <code>% m</code>, and go to that one bucket. Then walk its chain and compare each key
        with <code>==</code>:
      </p>
      <ul>
        <li>
          <strong>Find:</strong> walk the chain until you meet the key, or the chain ends.
        </li>
        <li>
          <strong>Insert:</strong> find first. If the key is there, change its value. If not, add it to the chain.
        </li>
        <li>
          <strong>Remove:</strong> find it, then take it out of the chain.
        </li>
      </ul>
      <p>
        The chain can be a Python list, or a linked list as in the LINK station. Step through some inserts, finds and a removal. Then switch to
        &ldquo;Grow the table&rdquo;:
      </p>

      <ChainFigure />

      <p>A small version in Python:</p>
      <CodeBlock
        code={`class ChainTable:
    def __init__(self, m=8):
        self.b = [[] for _ in range(m)]     # m empty chains

    def find(self, key):
        for k, v in self.b[hash(key) % len(self.b)]:
            if k == key:
                return v
        return None`}
      />
      <p>
        The hash only chooses where to look. Whether a key matches is decided by <code>==</code>. Two different keys can have the same hash, so a
        table must never treat equal hashes as equal keys.
      </p>

      <h2 id="cost">The load factor and the cost</h2>
      <p>
        The cost of a job is one hash, plus the walk along one chain. So the question is: how long is a chain?
      </p>
      <p>
        The <em>load factor</em> is the number of keys divided by the number of buckets. It is written <M>α</M> (the Greek letter alpha):{" "}
        <M>α = n / m</M>. With 6 keys in 5 buckets, <M>α = 1.2</M>.
      </p>
      <p>
        To reason about chain lengths, assume the hash spreads keys perfectly: each key is equally likely to land in any of the <M>m</M> buckets,
        whatever the other keys did. Real hash functions are not perfect, but good ones behave close to this.
      </p>
      <p>
        Now look for a key <M>x</M> that is not in the table. Its search walks the whole of one chain. Each of the <M>n</M> keys in the table is in
        that chain with chance <M>1/m</M>. Adding these chances up, the chain is expected to hold <M>n · (1/m) = α</M> keys. So a search for a
        missing key costs <M>O(1 + α)</M> on average: 1 for the hash, <M>α</M> for the walk.
      </p>
      <p>
        A search for a key that is there stops part way along its chain. On average it passes about half of the other keys in the chain, so it
        costs about <M>1 + α/2</M>. That is also <M>O(1 + α)</M>.
      </p>
      <Invariant label="Cost">Every job costs O(1 + α) on average. Keep α below a fixed number, and every job is O(1) on average.</Invariant>

      <h2 id="grow">Growing the table</h2>
      <p>
        As keys arrive, <M>n</M> grows, and with it <M>α</M>. To keep <M>α</M> small, the table grows: when <M>α</M> passes a limit, make a new
        array with twice as many buckets and move every key. A key&rsquo;s bucket depends on <M>m</M>, so every key must be hashed again into the
        new array. This is called <em>rehashing</em>.
      </p>
      <p>
        One growth moves all <M>n</M> keys, which costs <M>O(n)</M>. But growths are rare. Suppose the table starts with 8 buckets and doubles when{" "}
        <M>n</M> passes <M>m</M>. By the time it holds <M>n</M> keys, the growths have moved at most <M>8 + 16 + 32 + … + n</M> keys, which is less
        than <M>2n</M>. Shared out over the <M>n</M> inserts, that is less than 2 moves per insert. So insert is <M>O(1)</M> on average over a
        sequence of inserts. This kind of &ldquo;average over a sequence&rdquo; cost is called <em>amortised</em> cost (ARRS-1 and BIGO-7 used the same argument
        for a growing list).
      </p>
      <Note title="Shrinking">
        <p>
          Removing keys lowers <M>α</M>, which is harmless for speed. Many tables, including Python&rsquo;s dict, never shrink on removal; they
          shrink only when they are rebuilt. If a table does shrink, it should wait until it is about a quarter full. Shrinking at half full could
          make one insert and one remove, repeated, grow and shrink the table every time.
        </p>
      </Note>

      <h2 id="worst">The worst case</h2>
      <p>
        The <M>O(1)</M> is an average, and it depends on the hash spreading the keys. If every key lands in the same bucket, the table becomes one
        long chain, and every job costs <M>O(n)</M>. Inserting <M>n</M> keys then costs <M>1 + 2 + … + n</M>, which is <M>O(n²)</M>.
      </p>
      <p>
        This happens with a poor hash function, or when someone chooses the keys on purpose to collide. Lesson 4 shows that attack and the
        defence. Java&rsquo;s <code>HashMap</code> adds a second defence: when one chain grows past 8 keys, it turns that chain into a balanced
        search tree (BALT station), so even the worst chain costs only <M>O(log n)</M>.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Cost of hash table jobs with chaining</caption>
          <thead>
            <tr>
              <th>Job</th>
              <th>Average</th>
              <th>Worst case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Find, insert, remove</td>
              <td>
                <M>O(1)</M>, with <M>α</M> kept small
              </td>
              <td>
                <M>O(n)</M>: all keys in one chain
              </td>
            </tr>
            <tr>
              <td>Grow the table</td>
              <td>
                <M>O(1)</M> per insert, amortised
              </td>
              <td>
                <M>O(n)</M> for the one insert that triggers it
              </td>
            </tr>
            <tr>
              <td>Visit every key</td>
              <td>
                <M>O(n + m)</M>
              </td>
              <td>
                <M>O(n + m)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
