import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { EuclidFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Number theory studies whole numbers: which ones divide which, what is left over, and what that tells us. This station collects the parts
        that algorithms use most. It starts with the oldest algorithm still in daily use, Euclid&rsquo;s method for the greatest common divisor,
        written down more than 2,000 years ago.
      </p>

      <h2 id="divides">Divisors and remainders</h2>
      <p>
        A whole number d <strong>divides</strong> a if a is d times some whole number: 3 divides 12, and 5 does not. We say d is a{" "}
        <strong>divisor</strong> of a, and a is a <strong>multiple</strong> of d. Every whole number divides 0, because 0 = d · 0.
      </p>
      <p>
        When d does not divide a, there is a remainder. For any a and any d above 0 there is exactly one way to write
      </p>
      <Invariant label="Division">a = q · d + r, with 0 ≤ r &lt; d</Invariant>
      <p>
        q is the <strong>quotient</strong> and r the <strong>remainder</strong>. In Python, <code>a // d</code> is q and <code>a % d</code> is
        r, and <code>divmod(a, d)</code> gives both. Python keeps r between 0 and d − 1 even when a is negative, so q rounds down:{" "}
        <code>divmod(-17, 5)</code> is <code>(-4, 3)</code>, because −17 = −4 · 5 + 3. Lesson 2 comes back to this.
      </p>

      <h2 id="euclid">Euclid&rsquo;s algorithm</h2>
      <p>
        The <strong>greatest common divisor</strong> of a and b, written gcd(a, b), is the largest number that divides both. gcd(12, 18) is 6.
        Listing all the divisors works for small numbers, but not for numbers with 50 digits. Euclid&rsquo;s method rests on one fact:
      </p>
      <Invariant label="Rule">
        <span className="nowrap">gcd(a, b)</span> = <span className="nowrap">gcd(b, a % b)</span>, and <span className="nowrap">gcd(a, 0) = a</span>
      </Invariant>
      <p>
        <strong>Why?</strong> Write a = q · b + r. If d divides a and b, it divides r = a − q · b too. If d divides b and r, it divides a = q ·
        b + r too. So the pairs (a, b) and (b, r) have exactly the same common divisors, and so the same greatest one. And every number
        divides 0, so the common divisors of a and 0 are the divisors of a, and the greatest is a itself.
      </p>
      <EuclidFigure />
      <CodeBlock
        title="gcd.py"
        code={`def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

gcd(1071, 462)     # 21`}
      />
      <p>
        If a is smaller than b, the first step just swaps them, because <code>a % b</code> is a. Python has it built in:{" "}
        <code>math.gcd(a, b)</code>, which also takes more than two numbers (<code>math.gcd(12, 18, 27)</code> is 3, in Python 3.9 and later).
      </p>

      <h2 id="fast">Why it is fast</h2>
      <p>
        Each step replaces a by a % b, and a % b is always less than half of a. If b is at most half of a, the remainder is below b, so below
        half. If b is more than half of a, b fits only once, and the remainder a − b is below half. So every two steps the larger number at least
        halves, and the loop makes at most about <M>2 log₂ a</M> steps (<M>log₂ a</M> is how many times you can halve a before reaching 1).
      </p>
      <p>
        The worst case is two Fibonacci numbers in a row, where every quotient is 1 (the second version of the figure). From this, Gabriel
        Lamé proved in 1844 that the number of steps is at most 5 times the number of digits of the smaller number. For 100-digit numbers that
        is at most 500 divisions.
      </p>

      <h2 id="lcm">The least common multiple</h2>
      <p>
        The <strong>least common multiple</strong>, lcm(a, b), is the smallest number above 0 that both a and b divide. Write g = gcd(a, b),
        a = g · s and b = g · t. Then s and t have no common divisor above 1, so a multiple of both a and b must be a multiple of
        g · s · t. That number is a multiple of both, so it is the least one, and g · s · t = a · b / g:
      </p>
      <Invariant label="LCM">lcm(a, b) = a · b / gcd(a, b)</Invariant>
      <p>
        Compute it as <code>a // gcd(a, b) * b</code>: dividing first keeps the numbers smaller, which matters in languages with fixed-size
        numbers. Python has <code>math.lcm</code>. If one train leaves every 12 minutes and another every 18, they leave together every
        lcm(12, 18) = 36 minutes. Fractions use the gcd too: 6/8 in lowest terms divides both by gcd(6, 8) = 2, and{" "}
        <code>fractions.Fraction(6, 8)</code> does it for you.
      </p>

      <h2 id="bezout">The extended algorithm</h2>
      <p>
        Euclid&rsquo;s steps can also find whole numbers x and y, some of them negative, with
      </p>
      <Invariant label="Bézout">a · x + b · y = gcd(a, b)</Invariant>
      <p>
        This is called Bézout&rsquo;s identity. The method keeps, beside each remainder r, an x and a y with r = a · x + b · y. The first two
        rows are a = a · 1 + b · 0 and b = a · 0 + b · 1. Each new remainder is the row two above minus q times the row above, and doing the
        same to x and y keeps the rule true. When the remainder reaches 0, the row above holds the gcd and its x and y. The third version of the
        figure steps through it.
      </p>
      <CodeBlock
        title="ext_gcd.py"
        code={`def ext_gcd(a, b):
    """Return (g, x, y) with a*x + b*y == g == gcd(a, b)."""
    x0, y0, x1, y1 = 1, 0, 0, 1
    while b:
        q = a // b
        a, b = b, a - q * b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0

ext_gcd(240, 46)     # (2, -9, 47)`}
      />
      <p>
        <strong>Equations in whole numbers.</strong> When can <M>a · x + b · y = c</M> be solved in whole numbers? Every a · x + b · y is a
        multiple of g = gcd(a, b), so c must be a multiple of g. If it is, multiply Bézout&rsquo;s x and y by c / g to get one solution. Then
        every other solution is
      </p>
      <Invariant label="All">x + t · (b / g),   y − t · (a / g),   for any whole number t</Invariant>
      <p>
        Adding <M>b / g</M> to x adds <M>a · b / g</M> to the total, and taking <M>a / g</M> from y takes the same amount away. So the solutions
        are evenly spaced, and you can count the ones in any range with one division instead of a loop. MATH-P1 counts the ways to pay an amount
        with two coins this way. Lesson 5 uses the same algorithm to divide in modular arithmetic.
      </p>
      <Note title="Amounts that cannot be paid">
        <p>
          With coins of 3 and 5, the amounts 1, 2, 4 and 7 cannot be paid, but every amount from 8 upwards can. For two coins a and b with
          gcd 1, the largest amount that cannot be paid is a · b − a − b (J. J. Sylvester, 1884). With more than two coins there is no such
          formula; GRDY-5 and DYNP-1 count coins with tables instead.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/math/practice/1/">MATH-P1, Paying with two coins</Link>.
      </p>
    </>
  );
}
