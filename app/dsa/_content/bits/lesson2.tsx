import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { OpFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Python has six operators that work on the bits of whole numbers. Four of them combine two numbers place by place; two of them move bits
        to other places. Each one is a single fast step for numbers that fit in a machine word, and every method in this station is built from
        them.
      </p>

      <h2 id="and-or">And, or, xor</h2>
      <p>
        <code>&amp;</code>, <code>|</code> and <code>^</code> look at the two numbers one place at a time. The result bit in each place
        depends only on the two bits in that place, so there are no carries, unlike in addition:
      </p>
      <div className="tt-wrap">
      <table className="tt">
        <thead>
          <tr>
            <th>bits</th>
            <th className="num">a &amp; b (and)</th>
            <th className="num">a | b (or)</th>
            <th className="num">a ^ b (xor)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>0, 0</td><td className="num">0</td><td className="num">0</td><td className="num">0</td></tr>
          <tr><td>0, 1</td><td className="num">0</td><td className="num">1</td><td className="num">1</td></tr>
          <tr><td>1, 0</td><td className="num">0</td><td className="num">1</td><td className="num">1</td></tr>
          <tr><td>1, 1</td><td className="num">1</td><td className="num">1</td><td className="num">0</td></tr>
        </tbody>
      </table>
      </div>
      <p>
        <strong>And</strong> gives 1 only where both bits are 1. <strong>Or</strong> gives 1 where either bit is 1. <strong>Exclusive or</strong>{" "}
        (xor) gives 1 where the bits differ. Step through each one in the figure.
      </p>
      <OpFigure />
      <p>
        TRIE-5 introduced xor for the bitwise trie. Three of its facts are used again and again: <code>x ^ x</code> is 0, <code>x ^ 0</code>{" "}
        is x, and the order does not matter (<code>a ^ b ^ c</code> is the same in any order). So if every value in a list appears twice except
        one, the xor of the whole list is that one value: each pair cancels out.
      </p>
      <p>
        These operators also work on Python&rsquo;s negative numbers, using the endless 1s of lesson 1: <code>-6 &amp; 0xFF</code> is 250.
        Python&rsquo;s <code>set</code> uses the same symbols for the same ideas: <code>&amp;</code> is the common part, <code>|</code> is
        everything in either, and <code>^</code> is everything in exactly one. Lesson 5 uses this link to store a whole set in one number.
      </p>

      <h2 id="not">Not</h2>
      <p>
        <code>~x</code> flips every bit. With Python&rsquo;s endless bits, this always gives <code>-x - 1</code>: <code>~0</code> is −1, and{" "}
        <code>~45</code> is −46. To flip only the lowest w bits, xor with a mask of w ones instead: <code>x ^ ((1 &lt;&lt; w) - 1)</code>. For 8
        bits that is <code>x ^ 0xFF</code>, so 45 becomes 210.
      </p>

      <h2 id="shifts">Shifts</h2>
      <p>
        <code>x &lt;&lt; k</code> moves every bit k places to the left, and 0s come in at the right. Each bit is now worth <M>2ᵏ</M> times as
        much, so <code>x &lt;&lt; k</code> equals <M>x · 2ᵏ</M>. <code>x &gt;&gt; k</code> moves every bit k places to the right, and the lowest
        k bits are lost. It equals <code>x // 2**k</code>: divide by <M>2ᵏ</M> and round down. For negative numbers it also rounds down, so{" "}
        <code>-7 &gt;&gt; 1</code> is −4, just like <code>-7 // 2</code>. The fourth version of the figure shows both shifts.
      </p>
      <Invariant label="Shifts">x &lt;&lt; k is x · 2ᵏ, and x &gt;&gt; k is x // 2ᵏ (rounded down), for every whole number x.</Invariant>
      <p>
        Together with <code>&amp;</code>, shifts read single bits: <code>x &gt;&gt; k &amp; 1</code> is bit k of x. <code>1 &lt;&lt; k</code>{" "}
        is the number with a single 1 in place k, which is <M>2ᵏ</M>.
      </p>

      <h2 id="order">Brackets and cost</h2>
      <p>
        Python works out arithmetic before shifts, shifts before <code>&amp;</code>, then <code>^</code>, then <code>|</code>, and comparisons
        last. Some results surprise people:
      </p>
      <CodeBlock
        title="order.py"
        code={`1 << k - 1        # 1 << (k - 1), not (1 << k) - 1
x & mask + 1      # x & (mask + 1)
x & 1 == 0        # (x & 1) == 0 in Python
                  # (in C it means x & (1 == 0))
(1 << k) - 1      # k ones: write the brackets`}
      />
      <p>When in doubt, add brackets. They do not slow the code, and they make the meaning plain to the reader.</p>
      <p>
        <strong>Cost.</strong> A processor does <code>&amp;</code>, <code>|</code>, <code>^</code> and shifts on a 64-bit word in one step.
        Python stores a whole number as a list of pieces of about 30 bits each, and these operators run a fast loop over the pieces in C. So for
        a number of B bits each operator costs <M>O(B)</M>, about B / 30 machine steps, and for numbers below about a billion it is one step.
        This matters for huge numbers: a loop that shifts a million-bit number one place at a time does a million shifts, and each shift copies
        all million bits.
      </p>

      <h2 id="gray">Gray codes</h2>
      <p>
        When you count 3 → 4 in binary, three bits change at once: <code>011</code> → <code>100</code>. A sensor that reads a position from
        several bits may catch some of them changed and some not, and read a number that is far off. A <strong>Gray code</strong> orders the
        numbers so that neighbours differ in exactly one bit. The usual one is
      </p>
      <Invariant label="Gray">gray(n) = n ^ (n &gt;&gt; 1)</Invariant>
      <p>
        So gray(0) to gray(7) are <code>000 001 011 010 110 111 101 100</code>. <strong>Why do neighbours differ in one bit?</strong> Bit k of
        gray(n) is bit k of n xor bit k + 1 of n. Going from n to n + 1, the lowest 0 of n (say in place t) becomes 1, and the 1s below it
        become 0s; nothing above place t changes. For a place below t, both bit k and bit k + 1 of n flip, so their xor stays the same. At
        place t, bit t flips but bit t + 1 does not, so that xor changes. Above t nothing changes. So exactly one bit of the Gray code changes:
        the bit in place t.
      </p>
      <p>
        <strong>Reading a Gray code back.</strong> The top bit of n is the top bit of g. Going down, each bit of n is the bit of n just above it
        xor the bit of g in this place. So bit k of n is the xor of all the bits of g from the top down to place k: a running xor, the same idea
        as a running total. Done one bit at a time, this costs one shift of the whole number per bit, which is slow for huge numbers (see the
        cost above). A running xor can also be built from blocks that double in size; BITS-P2 asks you to find how.
      </p>
      <Note title="Where Gray codes are used">
        <p>
          Position sensors on rotating shafts, error-tolerant radio signals, and listing all subsets so that each one differs from the last by
          one item. In the Tower of Hanoi puzzle, the bit that changes in the Gray code at step n says which disc to move.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bits/practice/2/">BITS-P2, From Gray code</Link>.
      </p>
    </>
  );
}
