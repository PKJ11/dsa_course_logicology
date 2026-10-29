import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CountFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        How many 1 bits does a number have? The count is called the <strong>population count</strong>, or popcount. It answers questions such
        as &ldquo;how many items are in this subset?&rdquo; and &ldquo;in how many places do these two numbers differ?&rdquo;. This lesson
        counts bits in four ways, from the plain loop to counting every number up to n at once.
      </p>

      <h2 id="count">Counting the 1 bits</h2>
      <p>
        The plain way looks at every place: add the last bit, shift it off, and repeat until nothing is left. That is one step per place, so{" "}
        <M>O(B)</M> for a number of B bits, even if it has only a few 1s.
      </p>
      <CodeBlock
        title="count.py"
        code={`def ones_plain(x):           # x >= 0
    count = 0
    while x:
        count += x & 1
        x >>= 1
    return count

def ones_drop(x):            # x >= 0
    count = 0
    while x:
        x &= x - 1           # drop the lowest 1 bit
        count += 1
    return count`}
      />
      <p>
        The second version uses the method from lesson 3. <code>x &amp;= x - 1</code> removes one 1 bit each time, so the loop runs once per 1
        bit, not once per place. This is often called Kernighan&rsquo;s method. The first version of the figure steps through it.
      </p>
      <CountFigure />
      <p>
        In practice, call Python&rsquo;s own method: <code>x.bit_count()</code> (Python 3.10 and later) counts in C, and most processors have
        a single instruction for it, called POPCNT. <code>bin(x).count(&quot;1&quot;)</code> also works and is fast. For a negative number,
        both count the 1s of its size, not of its endless two&rsquo;s complement pattern: <code>(-6).bit_count()</code> is 2.
      </p>

      <h2 id="parallel">Counting in parallel</h2>
      <p>
        How do libraries and processors count without a loop? They count in many small groups at once. Take 180, <code>10 11 01 00</code>,
        split into pairs of bits.
      </p>
      <ol>
        <li>
          <strong>Count each pair.</strong> A pair <code>ab</code> holds the value 2a + b, and its count is a + b, so subtracting a gives the
          count. One subtraction does this for every pair at once: the pairs become <code>01 10 01 00</code>, that is, counts 1, 2, 1, 0.
        </li>
        <li>
          <strong>Add neighbouring pairs into fours.</strong> This gives <code>0011 0001</code>: counts 3 and 1.
        </li>
        <li>
          <strong>Add the two fours.</strong> This gives 4.
        </li>
      </ol>
      <CodeBlock
        title="parallel.py"
        code={`x = 0b10110100                # 180
m1, m2 = 0b01010101, 0b00110011
y = x - (x >> 1 & m1)         # 01 10 01 00
z = (y & m2) + (y >> 2 & m2)  # 0011 0001
(z + (z >> 4)) & 0b1111       # 4`}
      />
      <p>
        Each step halves the number of groups, so a 64-bit word needs only 6 steps, with no loop over its bits. The masks <code>0x5555…</code>,{" "}
        <code>0x3333…</code> and <code>0x0F0F…</code> in C popcount code come from exactly these steps. In Python, use{" "}
        <code>bit_count()</code>; this is how it can be done in a few machine steps.
      </p>

      <h2 id="table">Counts for every number</h2>
      <p>
        Sometimes you need the count for every number from 0 to n, for example to sort subsets by size. Each count can be built from a smaller
        one. <code>i &gt;&gt; 1</code> is i with its last bit removed, and that last bit is <code>i &amp; 1</code>:
      </p>
      <Invariant label="Rule">ones[i] = ones[i &gt;&gt; 1] + (i &amp; 1)</Invariant>
      <p>
        Since <code>i &gt;&gt; 1</code> is smaller than i, its count is already in the table when the loop reaches i. This is a small dynamic
        programming table (DYNP-3): one addition per number, <M>O(n)</M> in all. The second version of the figure fills it for 0 to 15.
        Another rule that works is <code>ones[i] = ones[i &amp; (i - 1)] + 1</code>: drop the lowest 1 and add one.
      </p>

      <h2 id="pattern">The pattern in each place</h2>
      <p>
        What if n is as large as <M>10¹⁸</M> (a 1 followed by 18 zeros, a billion billion)? A table, or a count for each number, is far too slow. Look at one
        place at a time instead. Write 0, 1, 2, 3, … in binary, one under another, and read down a single place:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <thead>
            <tr>
              <th className="num">n</th>
              <th className="num">place 2</th>
              <th className="num">place 1</th>
              <th className="num">place 0</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="num">0</td>
              <td className="num">0</td>
              <td className="num">0</td>
              <td className="num">0</td>
            </tr>
            <tr>
              <td className="num">1</td>
              <td className="num">0</td>
              <td className="num">0</td>
              <td className="num">1</td>
            </tr>
            <tr>
              <td className="num">2</td>
              <td className="num">0</td>
              <td className="num">1</td>
              <td className="num">0</td>
            </tr>
            <tr>
              <td className="num">3</td>
              <td className="num">0</td>
              <td className="num">1</td>
              <td className="num">1</td>
            </tr>
            <tr>
              <td className="num">4</td>
              <td className="num">1</td>
              <td className="num">0</td>
              <td className="num">0</td>
            </tr>
            <tr>
              <td className="num">5</td>
              <td className="num">1</td>
              <td className="num">0</td>
              <td className="num">1</td>
            </tr>
            <tr>
              <td className="num">6</td>
              <td className="num">1</td>
              <td className="num">1</td>
              <td className="num">0</td>
            </tr>
            <tr>
              <td className="num">7</td>
              <td className="num">1</td>
              <td className="num">1</td>
              <td className="num">1</td>
            </tr>
            <tr>
              <td className="num">8</td>
              <td className="num">0</td>
              <td className="num">0</td>
              <td className="num">0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Place 0 goes 0, 1, 0, 1, …. Place 1 goes 0, 0, 1, 1, and repeats. Place 2 has four 0s, then four 1s. In general, place k repeats a
        cycle of <M>2ᵏ⁺¹</M> numbers: <M>2ᵏ</M> zeros, then <M>2ᵏ</M> ones. So the numbers 0 to n hold some whole cycles, each with exactly{" "}
        <M>2ᵏ</M> ones in place k, plus part of one more cycle at the end. Counting place by place takes one step per place of n:{" "}
        <M>O(log n)</M> steps, about 60 for <M>10¹⁸</M>, instead of <M>10¹⁸</M>. BITS-P4 asks you to work out both parts.
      </p>
      <p>
        A quick check: 0 to <M>2ᵏ − 1</M> is every pattern of k bits, and each place is 1 in exactly half of them. So together they have{" "}
        <M>k · 2ᵏ⁻¹</M> ones. For k = 3 (0 to 7) that is 3 · 4 = 12.
      </p>

      <h2 id="uses">Parity, distance and other counts</h2>
      <ul>
        <li>
          <strong>Parity</strong> is whether the count of 1s is odd: <code>x.bit_count() &amp; 1</code>. A parity bit added to stored or sent
          data catches any single flipped bit, because the flip changes the parity.
        </li>
        <li>
          <strong>Hamming distance</strong> is the number of places where two numbers differ: <code>(x ^ y).bit_count()</code>. It measures how
          far apart two codes are, and error-correcting codes keep their codes far apart.
        </li>
        <li>
          <strong>The length</strong> <code>x.bit_length()</code> is the position of the highest 1 plus one. For a power of 2, it gives the
          exact <M>log₂</M>: <code>(1024).bit_length() - 1</code> is 10.
        </li>
        <li>
          <strong>0s at the bottom</strong> (lesson 3): <code>(x &amp; -x).bit_length() - 1</code>. This tells how many times 2 divides x.
        </li>
      </ul>
      <Note title="Where popcount is used">
        <p>
          Chess programs store the board as 64-bit numbers, one bit per square, and count pieces with popcount. Databases keep a row of bits
          for each value of a column and count matching rows with popcount. Both run the parallel method of this lesson, in one instruction.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bits/practice/4/">BITS-P4, All the 1 bits up to n</Link>.
      </p>
    </>
  );
}
