import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DictFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Python&rsquo;s dict is an open-addressing hash table (lesson 3) with two clever additions. It keeps keys in the order they were added, and it
        uses less memory than a plain table. This lesson looks inside it. Everything here describes CPython, the usual Python.
      </p>

      <h2 id="two">Two arrays</h2>
      <p>
        A plain open-addressing table stores the key, the value and the hash in every slot, including the empty ones. Since Python 3.6, a dict
        splits this into two arrays:
      </p>
      <ul>
        <li>
          <code>entries</code> lists each key&rsquo;s hash, the key and its value, in the order they were added. It has no gaps.
        </li>
        <li>
          <code>indices</code> is the hash table itself. Each slot is empty, or holds a position in <code>entries</code>. A slot is tiny: one byte
          for small dicts.
        </li>
      </ul>
      <p>
        To find a key, Python hashes it, probes <code>indices</code>, and follows each position it meets into <code>entries</code> to compare the
        key. Step through four inserts and one lookup:
      </p>

      <DictFigure />

      <p>
        Because <code>entries</code> is in insertion order, looping over a dict gives the keys in the order they were added. Since Python 3.7 this is
        a promise of the language, not just a detail of CPython. Empty slots now cost one byte instead of a whole entry, so a dict uses much less
        memory than before.
      </p>
      <p>
        Each entry keeps the key&rsquo;s hash. A probe compares the stored hash first, and only calls <code>==</code> when the hashes are equal.
        Comparing two numbers is much faster than comparing, say, two long strings. And when the dict grows, it can place every key again without
        calling <code>hash()</code> again.
      </p>

      <h2 id="probe">How Python probes</h2>
      <p>
        Linear probing would make clusters (lesson 3). Python uses a different probe sequence. With <M>2<sup>k</sup></M> slots (a power of 2, such as 8, 16 or 32), the next slot after slot{" "}
        <M>i</M> is
      </p>
      <CodeBlock
        code={`perturb >>= 5                    # drop the lowest 5 bits
i = (5 * i + perturb + 1) % 2**k`}
      />
      <p>
        <code>perturb</code> starts as the whole hash, and <code>&gt;&gt;= 5</code> shifts it right by 5 bits each time, which is the same as
        dividing by 32 and rounding down. So the first probe uses only the low bits of the hash (<code>hash % 2**k</code>), and later probes mix in
        the higher bits. Two keys with the same home slot but different hashes soon follow different paths.
      </p>
      <p>
        After a few probes, <code>perturb</code> becomes 0, and the rule is just <code>i = (5*i + 1) % 2**k</code>. In the figure the keys are
        small, so this happens at once. Does this rule ever miss a slot? No. A known result about such sequences (the Hull–Dobell theorem) says
        that <code>i → 5i + 1</code>, taken <code>% 2**k</code>, visits every slot once before repeating. With 8 slots, starting at 0:
      </p>
      <CodeBlock code={`0 → 1 → 6 → 7 → 4 → 5 → 2 → 3 → 0`} />
      <Invariant label="Rule">Every probe sequence in a dict reaches every slot, so a dict with a free slot always finds it.</Invariant>

      <h2 id="grow">When a dict grows</h2>
      <p>
        A new dict has 8 slots. It may fill only two-thirds of them, so the sixth key makes it grow. The new size is the smallest power of 2 that is
        at least three times the number of keys. Growing builds new arrays and places every entry again: <M>O(n)</M>, but rare, so inserts stay{" "}
        <M>O(1)</M> amortised (lesson 2).
      </p>
      <p>
        <code>del d[k]</code> uses the marker idea from lesson 3. The slot in <code>indices</code> gets a deleted marker, and the entry is emptied.
        Neither is reused straight away; both are cleaned up the next time the dict grows or is rebuilt. That is why a dict that grew large and
        then lost most of its keys still uses a lot of memory. <code>d = dict(d)</code> builds a compact copy.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Cost of dict operations</caption>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Average</th>
              <th>Worst case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>d[k]</code>, <code>d[k] = v</code>, <code>del d[k]</code>, <code>k in d</code>
              </td>
              <td>
                <M>O(1)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>for k in d</code>, <code>list(d)</code>, <code>d.copy()</code>
              </td>
              <td>
                <M>O(n)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
            <tr>
              <td>
                <code>len(d)</code>
              </td>
              <td>
                <M>O(1)</M>
              </td>
              <td>
                <M>O(1)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note title="Do not change a dict while looping over it">
        <p>
          Adding or removing keys inside <code>for k in d:</code> raises a <code>RuntimeError</code>: the dictionary changed size during the loop. A
          growth would move every entry, and the loop would lose its place. Loop over <code>list(d)</code> instead, which is a copy of the keys.
        </p>
      </Note>

      <h2 id="set">Sets</h2>
      <p>
        A <code>set</code> is a hash table of keys with no values. It has no <code>entries</code> array, so it does not keep insertion order: the
        order you see when you print a set comes from the slots. Its probing first checks a few neighbouring slots, as linear probing does, because
        neighbours are cheap to read. Then it jumps, as a dict does.
      </p>
      <CodeBlock
        code={`seen = set()
seen.add('NDLS')
'NDLS' in seen            # True, O(1) on average
{1, 2, 3} & {2, 3, 4}     # {2, 3}: the keys in both
{1, 2, 3} | {3, 4}        # {1, 2, 3, 4}: the keys in either
{1, 2, 3} - {2}           # {1, 3}`}
      />
      <p>
        <code>s &amp; t</code> loops over the smaller set and checks each key in the larger one, so it costs <M>O(min(len(s), len(t)))</M> on
        average. <code>s | t</code> costs <M>O(len(s) + len(t))</M>. A <code>frozenset</code> is a set that cannot change, so it is hashable and can
        itself be a dict key or a set member.
      </p>
      <p>
        The everyday lesson: <code>x in a_list</code> walks the list, <M>O(n)</M>. <code>x in a_set</code> is <M>O(1)</M> on average. If you check
        membership many times, build a set once.
      </p>
    </>
  );
}
