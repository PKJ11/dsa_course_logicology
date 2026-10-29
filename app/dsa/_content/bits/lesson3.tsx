import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MaskFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A mask is a number whose 1 bits pick the places you want to work on. With a mask and one operator from lesson 2 you can test, set, clear
        or flip any bits you choose. This lesson also covers two short methods with the lowest 1 bit that appear in many algorithms.
      </p>

      <h2 id="one">One bit at a time</h2>
      <p>
        The mask for place k is <code>1 &lt;&lt; k</code>: a single 1 in place k. Each move uses the rule of its operator for the places where
        the mask has a 1, and leaves the other places alone:
      </p>
      <CodeBlock
        title="one_bit.py"
        code={`x & (1 << k) != 0     # test: is place k a 1?
x >> k & 1            # the same test, as 0 or 1
x | (1 << k)          # set place k to 1
x & ~(1 << k)         # clear place k to 0
x ^ (1 << k)          # flip place k`}
      />
      <MaskFigure />
      <p>
        To clear a place, the mask is turned around first: <code>~(1 &lt;&lt; k)</code> has a 1 in every place except k, so <code>&amp;</code>{" "}
        keeps everything except place k. A mask with several 1s works on several places at once: <code>x &amp; 0xFF</code> keeps the lowest 8
        bits, and <code>x | 0b1010</code> sets places 1 and 3.
      </p>

      <h2 id="fields">Fields of several bits</h2>
      <p>
        Many formats pack several small values into one number, each in its own group of places, called a <strong>field</strong>. A colour such
        as <code>0x3366CC</code> holds red, green and blue in 8 bits each. To read the field of width w that starts at place lo, shift it down
        to place 0 and keep w bits. To write it, clear the field, then <code>|</code> in the new value moved up to place lo:
      </p>
      <CodeBlock
        title="fields.py"
        code={`def get_field(x, lo, w):
    return x >> lo & ((1 << w) - 1)

def set_field(x, lo, w, v):
    mask = ((1 << w) - 1) << lo
    return x & ~mask | (v << lo)

colour = 0x3366CC
get_field(colour, 16, 8)    # 0x33 = 51: red
get_field(colour, 8, 8)     # 0x66 = 102: green`}
      />
      <p>
        Other examples are Unix file permissions (<code>0o755</code> is three fields of 3 bits: read, write and run for the owner, the group
        and everyone else), the parts of a 32-bit network address, and the sign, power and fraction of a floating-point number. In Python,{" "}
        <code>enum.Flag</code> gives names to single-bit flags, so code can say <code>Perm.READ | Perm.WRITE</code> instead of <code>6</code>.
      </p>

      <h2 id="lowest">The lowest 1 bit</h2>
      <p>
        Subtracting 1 from x borrows from the lowest 1 bit: that 1 becomes 0, every 0 below it becomes 1, and the places above it do not
        change. So x and x − 1 agree above the lowest 1 and never share a 1 from there down. That gives two short methods, shown in the second and third
        versions of the figure:
      </p>
      <Invariant label="Lowest 1">x &amp; (x − 1) drops the lowest 1 bit. x &amp; −x keeps only the lowest 1 bit.</Invariant>
      <p>
        The second one works because <M>−x = ~x + 1</M> (lesson 1). Flipping makes the 0s below the lowest 1 into 1s; adding 1 carries
        through them and stops at the lowest 1&rsquo;s place. So <M>−x</M> has the same lowest 1 as x with 0s below it, and every bit above it
        is the opposite of x&rsquo;s. Only that one place is 1 in both. The Fenwick tree of RNGQ-3 moves through its array with exactly this,{" "}
        <code>i &amp; -i</code>.
      </p>
      <ul>
        <li>
          <strong>Is x a power of 2?</strong> A power of 2 has a single 1, so dropping it leaves 0: <code>x &gt; 0 and x &amp; (x - 1) == 0</code>.
        </li>
        <li>
          <strong>How many 0s at the bottom?</strong> <code>(x &amp; -x).bit_length() - 1</code>, for x above 0. 88 is <code>1011000</code>,
          so the answer is 3.
        </li>
        <li>
          <strong>The lowest 0 bit:</strong> <code>x | (x + 1)</code> sets it to 1, because adding 1 carries through the 1s at the bottom and
          stops at the lowest 0. <code>~x &amp; (x + 1)</code> keeps only that place.
        </li>
        <li>
          <strong>The highest 1 bit:</strong> <code>1 &lt;&lt; (x.bit_length() - 1)</code>.
        </li>
      </ul>

      <h2 id="next">The next number with as many 1s</h2>
      <p>
        Lesson 5 will treat a number as a subset: bit i says whether item i is in it. Then the numbers with exactly k ones are the subsets of
        size k. Listing them smallest first needs a step from a number to the next larger number with the same count of 1s. Take{" "}
        <code>10011100</code>, which has four 1s.
      </p>
      <ul>
        <li>
          Find the <strong>lowest run</strong> of 1s: the 1s from the lowest 1 bit upwards, until the first 0. Here it is <code>111</code> in
          places 2 to 4.
        </li>
        <li>Move the top 1 of the run up one place, into the 0 just above it (place 5).</li>
        <li>Move the other 1s of the run (two of them) down to the very bottom (places 0 and 1).</li>
      </ul>
      <p>
        The result is <code>10100011</code>. <strong>Why is it the next one?</strong> A larger number with the same count must turn some 0 into
        a 1, and to stay as small as possible that 0 must be as low as possible, with every place above it unchanged. The 1 it gains has to come
        from a place below it, so the 0 must have a 1 below it. The lowest such 0 is the one just above the lowest run. After that, the 1s
        that are left should be as low as possible: at the bottom.
      </p>
      <p>
        Each part of this uses a method from this lesson: <code>x &amp; -x</code> finds the lowest 1, and adding it to x carries through the
        run, clearing it and setting the 0 above. Putting the rest of the run at the bottom is BITS-P3. This step is often called
        Gosper&rsquo;s hack, after Bill Gosper, who wrote it down in 1972.
      </p>

      <h2 id="tricks">Bit methods: when to use them</h2>
      <p>
        Bit methods common in C and in processors include swapping two numbers with three xors, the smaller of two numbers without an{" "}
        <code>if</code>, and multiplying by shifting. In Python these give no speed and make code harder to read: write{" "}
        <code>a, b = b, a</code>, <code>min(a, b)</code> and <code>x * 2</code>. Python spends its time on running each line, not on the
        arithmetic itself.
      </p>
      <Note title="When bits do help in Python">
        <p>
          They help when one operator replaces a whole loop. Lesson 5 stores a set of up to a few dozen items in one number, so a union is one{" "}
          <code>|</code>. DYNP-8 used one whole number as a row of thousands of True and False values, so <code>can |= can &lt;&lt; w</code>{" "}
          updated the whole row in C. And huge numbers can hold millions of bits in little memory, with operators that work on 30 bits at a time.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bits/practice/3/">BITS-P3, The next number with as many 1s</Link>.
      </p>
    </>
  );
}
