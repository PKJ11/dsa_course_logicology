import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BinFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A computer stores every whole number as a row of bits: digits that are 0 or 1. This lesson shows how a row of bits stands for a
        number, how negative numbers are stored, and what happens when a number does not fit. The rest of this station builds on it.
      </p>

      <h2 id="places">Places worth powers of 2</h2>
      <p>
        In the numbers we write every day, each place is worth ten times the place on its right: ones, tens, hundreds. In <strong>binary</strong>,
        each place is worth <em>two</em> times the place on its right: 1, 2, 4, 8, 16, and so on. Each digit is a <strong>bit</strong>, 0 or 1.
      </p>
      <p>
        Number the places from the right, starting at 0. Place k is worth <M>2ᵏ</M>, which means k twos multiplied together: place 3 is
        worth <M>2³ = 8</M>, and place 0 is worth <M>2⁰ = 1</M>. A number is the sum of the worths of the places that hold a 1. So{" "}
        <code>101101</code> is <M>32 + 8 + 4 + 1 = 45</M>.
      </p>
      <p>
        To write a number in binary, look at its last bit first. A number is odd exactly when place 0 holds 1, because every other place is
        worth an even amount. Then halve the number, rounding down: this removes place 0, and every other bit moves one place to the right.
        Repeat until nothing is left. In this station, bits are always written highest place first, as Python prints them, and the plate over
        each bit is its place number, so place 0 is at the right.
      </p>
      <BinFigure />
      <p>
        How many places does a number need? With k places you can write every number from 0 to <M>2ᵏ − 1</M>, which is <M>2ᵏ</M> numbers in
        all. So a number x above 0 needs <M>⌊log₂ x⌋ + 1</M> places. Here <M>log₂ x</M> is the power you must raise 2 to in order to get x (how
        many times you can halve x before you reach 1), and <M>⌊ ⌋</M> means &ldquo;round down&rdquo;. 45 lies between <M>2⁵ = 32</M> and{" "}
        <M>2⁶ = 64</M>, so it needs 6 places.
      </p>

      <h2 id="python">Binary in Python</h2>
      <CodeBlock
        title="binary.py"
        code={`bin(45)              # '0b101101'  (0b means binary)
0b101101             # 45: a binary number in code
int("101101", 2)     # 45: read a string of bits
format(45, "08b")    # '00101101': 8 places, 0s in front
f"{45:08b}"          # the same, in an f-string
(45).bit_length()    # 6: the places 45 needs`}
      />
      <p>
        Hexadecimal (base 16) writes four bits as one digit, 0 to 9 then a to f: <code>0xFF</code> is 255, which is eight 1s, and{" "}
        <code>0x2D</code> is 45. It is a short way to write long rows of bits, so masks are often written in it.
      </p>

      <h2 id="fixed">A fixed number of bits</h2>
      <p>
        A processor works on rows of a fixed length: 8, 16, 32 or 64 bits. A row of 8 bits is a <strong>byte</strong>. An 8-bit row holds 0 to
        255. Add 1 to 255 (eight 1s) and every place carries; the last carry has no place to go and is dropped, so the result is 0. In other
        words, fixed-width arithmetic keeps only the remainder after dividing by <M>2⁸ = 256</M>. Languages such as C, Java and Go, and
        libraries such as NumPy, work this way.
      </p>
      <p>
        Python&rsquo;s own whole numbers are different: they grow to as many bits as they need. <code>2 ** 100</code> is exact. To get the
        fixed-width result in Python, keep the lowest bits yourself with a mask (lesson 3): <code>(255 + 1) &amp; 0xFF</code> is 0.
      </p>

      <h2 id="negative">Negative numbers</h2>
      <p>
        A simple idea is to use the top bit for the sign and the rest for the size. It has two problems: there are two zeros (+0 and −0), and
        adding a negative number needs different rules from adding a positive one. Computers use a better scheme called{" "}
        <strong>two&rsquo;s complement</strong>.
      </p>
      <Invariant label="Rule">In w-bit two&rsquo;s complement, the top place is worth −2ʷ⁻¹ instead of +2ʷ⁻¹. Every other place keeps its usual worth.</Invariant>
      <p>
        Here <M>2ʷ⁻¹</M> means 2 to the power w − 1. In 8 bits the top place, place 7, is worth −128. So <code>11111010</code> is{" "}
        <M>−128 + 64 + 32 + 16 + 8 + 2 = −6</M>, and <code>01111111</code> is 127. The 8-bit numbers run from −128 (<code>10000000</code>) to
        127. The top bit still tells you the sign: it is 1 exactly for the negative numbers.
      </p>
      <p>
        <strong>To negate a number, flip every bit and add 1.</strong> Why does this work? Flipping every bit of x gives a number{" "}
        <M>~x</M> (read &ldquo;not x&rdquo;) whose bits are 1 exactly where x has 0. So <M>x + ~x</M> has a 1 in every place, and all 1s is{" "}
        <M>−128 + 127 = −1</M>. From <M>x + ~x = −1</M> we get <M>~x = −x − 1</M>, so <M>−x = ~x + 1</M>. The second version of the figure
        steps through −6.
      </p>
      <p>
        The great advantage is that adding works the same way for every number. The circuit that adds two rows of bits needs no special case for
        negative numbers: in the figure, 6 + (−6) gives 0 once the carry out of the top place is dropped. Subtraction is adding the negation.
      </p>
      <p>
        Fixed widths can still <strong>overflow</strong>. In 8 bits, 127 + 1 is <code>10000000</code>, which is −128, as the third version of
        the figure shows. In 32 bits, 2,147,483,647 + 1 becomes −2,147,483,648. Overflow causes real bugs: a 32-bit counter of milliseconds runs
        out after about 24.8 days, and the middle of a binary search, <M>(lo + hi) / 2</M>, can overflow in C or Java when lo and hi are large
        (BSRC-6 gives the usual fix, <M>lo + (hi − lo) / 2</M>, for those languages).
      </p>
      <Note title="Reading a pattern as a signed number">
        <p>
          Given the 8 bits of a pattern as a number from 0 to 255, read it as two&rsquo;s complement like this. If the top bit is 0, the value is
          the number itself. If it is 1, the top place should have counted −128 instead of +128, a difference of 256, so subtract 256. For
          example, 250 is <code>11111010</code>, and 250 − 256 = −6. For whole bytes, Python can also do it with{" "}
          <code>int.from_bytes(data, &quot;big&quot;, signed=True)</code>.
        </p>
      </Note>

      <h2 id="endless">Python&rsquo;s endless bits</h2>
      <p>
        Python&rsquo;s whole numbers have no top place, so how can they be negative? Python&rsquo;s bit operators act as if every number had
        endless bits to the left. A number that is 0 or more has endless 0s there. A negative number has endless 1s: −6 is{" "}
        <code>…11111010</code>. This is two&rsquo;s complement with no width at all, and every rule above still holds. In particular,{" "}
        <code>~x</code> is always <code>-x - 1</code>.
      </p>
      <CodeBlock
        title="negative.py"
        code={`~6                # -7
-6 & 0xFF         # 250: the lowest 8 bits of -6
bin(-6 & 0xFF)    # '0b11111010'
bin(-6)           # '-0b110': a sign and the size,
                  # not the bit pattern`}
      />
      <p>
        Note the last line: <code>bin</code> of a negative number prints a minus sign and the bits of its size, not the two&rsquo;s complement
        pattern. To see the pattern, mask it to a width first. Masking also works on numbers too big for that width: the mask keeps the lowest
        bits, exactly as a fixed-width machine does.
      </p>
      <p>
        Now try <Link href="/dsa/bits/practice/1/">BITS-P1, Wrap to w bits</Link>: what does a w-bit machine store for any whole number?
      </p>
    </>
  );
}
