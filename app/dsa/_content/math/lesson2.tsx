import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ClockFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Modular arithmetic is arithmetic with remainders. It keeps numbers small however long a calculation runs, and it is behind hash tables,
        check digits, random number generators and the &ldquo;answer modulo 1,000,000,007&rdquo; of many problems. This lesson gives its rules
        and shows why they are safe to use.
      </p>

      <h2 id="clock">Arithmetic on a clock</h2>
      <p>
        Fix a whole number m above 1, called the <strong>modulus</strong>. The remainder after dividing by m is always one of 0, 1, …, m − 1,
        so the remainders go round like the hours on a clock with m places: after m − 1 comes 0 again. &ldquo;a modulo m&rdquo; means the
        remainder of a after dividing by m, which Python writes <code>a % m</code>.
      </p>
      <p>
        Two numbers with the same remainder sit at the same place on the clock. We write
      </p>
      <Invariant label="Notation">a ≡ b (mod m) means a % m == b % m, that is, m divides a − b</Invariant>
      <p>
        and read it &ldquo;a is congruent to b modulo m&rdquo;. So 9 ≡ 2 (mod 7), and 24 ≡ 0 (mod 12). Negative numbers are on the clock too:
        <span className="nowrap">−3 ≡ 4 (mod 7)</span>, because <span className="nowrap">−3 − 4 = −7</span> is a multiple of 7.
      </p>
      <ClockFigure />
      <p>
        In Python, <code>a % m</code> is always between 0 and m − 1 when m is above 0, even for negative a: <code>-3 % 7</code> is 4. In C,
        Java and JavaScript, <code>-3 % 7</code> is −3, and code in those languages writes <code>((a % m) + m) % m</code> to get 4.
      </p>

      <h2 id="rules">Take the remainder at every step</h2>
      <p>Adding, subtracting and multiplying give the same remainder whether you take remainders before or after:</p>
      <Invariant label="Rules">
        <span className="nowrap">(a + b) % m</span>, <span className="nowrap">(a − b) % m</span> and <span className="nowrap">(a · b) % m</span> depend only on <span className="nowrap">a % m</span> and <span className="nowrap">b % m</span>
      </Invariant>
      <p>
        <strong>Why?</strong> Write <M>a = q · m + r</M> and <M>b = p · m + s</M>, where r and s are the remainders. Then{" "}
        <M>a + b = (q + p) · m + (r + s)</M>, so <M>a + b</M> and <M>r + s</M> differ by a multiple of m and have the same remainder. For
        the product, <M>a · b = (q · p · m + q · s + p · r) · m + r · s</M>, which is <M>r · s</M> plus a multiple of m. Subtraction works
        like addition.
      </p>
      <p>
        So a long calculation can take <code>% m</code> after every step, and every number in it stays below m (below <M>m²</M> just before
        a reduction). The final remainder is the same as if you had worked with the full numbers and taken the remainder at the end:
      </p>
      <CodeBlock
        title="factorial_mod.py"
        code={`def factorial_mod(n, m):
    result = 1
    for i in range(2, n + 1):
        result = result * i % m    # stays below m
    return result

factorial_mod(100_000, 1_000_000_007)`}
      />
      <p>Two things do <em>not</em> work this way.</p>
      <ul>
        <li>
          <strong>Division.</strong> 6 / 2 = 3, but modulo 4, 6 is 2, and 2 / 2 = 1, which is not 3. Dividing needs an inverse, and not every
          number has one (lesson 5).
        </li>
        <li>
          <strong>Exponents.</strong> You may reduce the base of a power, but not the exponent: <M>2⁵ = 32</M> leaves 2 modulo 3. Reducing the
          exponent 5 modulo 3 gives 2, and <M>2² = 4</M> leaves 1, a different answer. (For a prime modulus there is a rule for exponents:
          lesson 5.)
        </li>
      </ul>

      <h2 id="why">Why reduce in Python</h2>
      <p>
        Python&rsquo;s whole numbers never overflow, so why reduce at all? Because huge numbers are slow. 100,000! (the product 1 · 2 · … ·
        100,000) has 456,574 digits, and each multiplication of such a number costs time in proportion to its length. On a laptop the loop above
        takes about 0.01 seconds with <code>% m</code> after each step, and over 2 seconds without it. The longer the loop, the bigger the
        gap.
      </p>
      <p>
        In C, Java and other languages with 64-bit numbers, reducing is not optional: the product of two remainders must fit in 64 bits. That is
        why problems so often use m = 1,000,000,007. It is below <M>2³⁰</M> (2 to the power 30), so the product of two remainders is below{" "}
        <M>2⁶⁰</M> and fits easily. It is also a prime, which lesson 5 needs for division. 998,244,353 is another common prime modulus.
      </p>
      <Note title="Answers modulo a prime">
        <p>
          When a problem says &ldquo;return the count modulo 1,000,000,007&rdquo; (DYNP-P3), the exact count is too big to print. Reduce after
          every addition and multiplication, and the rules above guarantee the right remainder. Python still lets you check a small case with
          the exact number.
        </p>
      </Note>

      <h2 id="classes">Counting by remainder</h2>
      <p>
        The numbers with the same remainder form a <strong>class</strong>: modulo 3, the classes are {"{…, 0, 3, 6, …}"},{" "}
        {"{…, 1, 4, 7, …}"} and {"{…, 2, 5, 8, …}"}. For questions about sums and products modulo m, all the numbers in a class behave the
        same, so you only need to know how many numbers fall in each class.
      </p>
      <p>
        For example, a + b is a multiple of k exactly when <code>(a % k + b % k) % k == 0</code>: the remainders add up to 0 or to k. So a
        number with remainder r pairs with the numbers of remainder <code>(k - r) % k</code>. Remainder 0 pairs with itself, and so does k / 2
        when k is even. Counting the numbers in each class, instead of looking at every pair, is MATH-P2.
      </p>

      <h2 id="uses">Where remainders are used</h2>
      <ul>
        <li>
          <strong>Hash tables</strong> put a key in bucket <code>hash(key) % m</code> (HASH-1), and good hash functions are built from
          multiplying and adding modulo a prime (HASH-4).
        </li>
        <li>
          <strong>Check digits</strong> catch typing mistakes. An ISBN-10 is valid when a weighted sum of its digits is a multiple of 11; bank
          card numbers use the Luhn rule, with a multiple of 10.
        </li>
        <li>
          <strong>Repeating things:</strong> the day of the week n days from now is <code>(today + n) % 7</code>; a ring buffer moves to{" "}
          <code>(i + 1) % size</code> (STAQ-4).
        </li>
        <li>
          <strong>Random number generators.</strong> A linear congruential generator makes each number from the last as{" "}
          <code>(a * x + c) % m</code>. MATH-P7&rsquo;s tests use one so that their &ldquo;random&rdquo; choices are the same every time.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/math/practice/2/">MATH-P2, Pairs that add to a multiple</Link>.
      </p>
    </>
  );
}
