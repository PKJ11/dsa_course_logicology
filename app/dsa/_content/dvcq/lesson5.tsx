import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { KaraFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Multiplying two n-digit numbers the way it is taught at school takes about n² single-digit products. For centuries nobody knew a
        faster way. In 1960 Anatoly Karatsuba, a student in Moscow, found one with a small piece of algebra: three multiplications of half-size
        numbers instead of four.
      </p>

      <h2 id="school">Multiplying digit by digit</h2>
      <p>
        The schoolbook method multiplies every digit of one number by every digit of the other, writes the products in shifted rows, and adds
        the rows. Two numbers of n digits give n × n = n² digit products, plus the additions, so it costs <M>O(n²)</M>.
      </p>
      <p>
        For numbers of a few digits that is nothing. But cryptography multiplies numbers of hundreds of digits, and computing π to a million
        places multiplies numbers of a million digits. There, n² is a trillion, and the method matters.
      </p>

      <h2 id="split">Splitting does not help by itself</h2>
      <p>
        Split each number into a high half and a low half. With m digits in the low half, write <M>x = a × 10ᵐ + b</M> and{" "}
        <M>y = c × 10ᵐ + d</M>. For 1321 and 2213 with m = 2: a = 13, b = 21, c = 22, d = 13. Then
      </p>
      <p>
        <M>x × y</M> = <M>(a × c) × 10²ᵐ</M> + <M>(a × d + b × c) × 10ᵐ</M> + <M>b × d</M>.
      </p>
      <p>
        Multiplying by 10ᵐ only adds m zeros at the end, which costs <M>O(n)</M>, and so do the additions. So one product of n digits needs
        four products of n/2 digits: <M>T(n) = 4 T(n/2) + O(n)</M>. Since 4 &gt; 2¹, the leaves win (BIGO-6), and the cost is n to the power
        log₂ 4, which is <M>n²</M>. No better than school. Step through &ldquo;Plain split: 4 products&rdquo; in the figure: the 16 one-digit
        products at the bottom are exactly the schoolbook&rsquo;s 16.
      </p>

      <h2 id="three">Three products instead of four</h2>
      <p>
        The middle part needs only the sum <M>a × d + b × c</M>, not the two products on their own. Karatsuba noticed that
      </p>
      <p>
        <M>(a + b) × (c + d)</M> = <M>a × c + a × d</M> + <M>b × c + b × d</M>,
      </p>
      <p>so</p>
      <Invariant label="Identity">
        <span className="nowrap">a × d + b × c</span> = <span className="nowrap">(a + b) × (c + d)</span> − <span className="nowrap">a × c</span> −{" "}
        <span className="nowrap">b × d</span>
      </Invariant>
      <p>
        The products <M>a × c</M> and <M>b × d</M> are needed anyway. So three products are enough: <M>a × c</M>, <M>b × d</M> and{" "}
        <M>(a + b) × (c + d)</M>. The price is a few extra additions and subtractions, which cost <M>O(n)</M>. The sums <M>a + b</M> and{" "}
        <M>c + d</M> may have one digit more than the halves, which does not change the cost.
      </p>

      <KaraFigure />

      <p>
        Now <M>T(n) = 3 T(n/2) + O(n)</M>. Since 3 &gt; 2¹, the leaves win again, but there are fewer of them: the bottom level has 3 to the
        power log₂ n products, which equals n to the power log₂ 3. So Karatsuba&rsquo;s method costs <M>O(n¹·⁵⁸⁵)</M>, because log₂ 3 ≈ 1.585.
        For a million digits, n² is 10¹² and n¹·⁵⁸⁵ is about 3 × 10⁹, over 300 times less.
      </p>

      <h2 id="code">The code</h2>
      <p>
        Here is the method on Python integers, to show its shape. Python&rsquo;s <code>*</code> is used only when one side is a single
        digit, or a power of ten (which only adds zeros). <code>divmod(x, p)</code> gives the high and low halves: <code>x // p</code> and{" "}
        <code>x % p</code>.
      </p>
      <CodeBlock
        title="karatsuba.py"
        code={`def karatsuba(x, y):
    """x * y for whole numbers x, y >= 0."""
    if x < 10 or y < 10:
        return x * y                    # a single digit: multiply directly
    m = max(len(str(x)), len(str(y))) // 2
    p = 10 ** m
    a, b = divmod(x, p)                 # x = a * p + b
    c, d = divmod(y, p)                 # y = c * p + d
    ac = karatsuba(a, c)
    bd = karatsuba(b, d)
    middle = karatsuba(a + b, c + d) - ac - bd     # = a*d + b*c
    return ac * p * p + middle * p + bd`}
      />
      <p>
        In practice the recursion stops well before single digits. A call has a fixed cost (splitting, the three calls, the additions), so on
        short numbers the schoolbook method is faster. Real programs switch to it below a cutoff, typically a few dozen digits. With digit
        lists in Python, a cutoff of about 32 digits works well: practice problem 5 asks you to multiply digit lists this way.
      </p>
      <Note title="Digit lists as sums of powers of ten">
        <p>
          A list of digits <code>[d₀, d₁, d₂, …]</code>, lowest digit first, stands for d₀ + d₁ × 10 + d₂ × 10² + …. Multiplying two such
          lists is like multiplying two polynomials: entry k of the product collects every <code>x[i] × y[j]</code> with i + j = k. Do the
          whole multiplication on these sums first, where an entry may go above 9, and carry once at the end. Then the subtraction in this identity
          never needs to borrow.
        </p>
      </Note>

      <h2 id="python">Python&rsquo;s own integers</h2>
      <p>
        Python&rsquo;s <code>int</code> has no size limit, and CPython already uses Karatsuba&rsquo;s method when both numbers are longer than
        70 of its internal digits (each internal digit holds 30 bits, so this is about 630 decimal digits). Below that it uses the schoolbook
        method, just as the cutoff above. So for real work, use <code>*</code>: it runs in C.
      </p>
      <ul>
        <li>
          <strong>Toom–Cook</strong> splits into 3 parts and needs 5 products instead of 9: n to the power log₃ 5, about n¹·⁴⁶⁵.
        </li>
        <li>
          <strong>Methods based on the fast Fourier transform</strong> (Schönhage and Strassen, 1971) reach about n log n log log n. The
          library GMP uses all of these, each above its own cutoff. In 2019 Harvey and van der Hoeven reached <M>O(n log n)</M>.
        </li>
        <li>
          Converting a huge <code>int</code> to text is also costly. Since Python 3.11, <code>str()</code> refuses numbers longer than 4,300
          digits unless you raise the limit with <code>sys.set_int_max_str_digits</code>, because a very slow conversion could be used to slow
          down a server.
        </li>
      </ul>
      <p>
        The same idea, saving one product out of several, gave Strassen&rsquo;s matrix multiplication (lesson 2), with 7 block products instead
        of 8.
      </p>
    </>
  );
}
