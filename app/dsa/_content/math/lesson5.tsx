import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { InverseFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Lesson 2 could add, subtract and multiply remainders, but not divide. This lesson shows when division modulo m is possible, three ways
        to do it, and how to solve several &ldquo;x leaves this remainder&rdquo; conditions at once.
      </p>

      <h2 id="divide">Dividing on a clock</h2>
      <p>
        Dividing by a is the same as multiplying by a number that undoes multiplying by a. Modulo m, such a number is called an{" "}
        <strong>inverse</strong> of a:
      </p>
      <Invariant label="Inverse">y is an inverse of a modulo m when a · y ≡ 1 (mod m)</Invariant>
      <p>
        Modulo 7, the inverse of 3 is 5, because 3 · 5 = 15 = 2 · 7 + 1. So &ldquo;divide by 3&rdquo; modulo 7 means &ldquo;multiply by 5&rdquo;:
        6 / 3 = 2, and indeed 6 · 5 = 30, which leaves 2. Step through the tables in the figure.
      </p>
      <InverseFigure />
      <p>
        <strong>When does an inverse exist?</strong> Exactly when gcd(a, m) = 1, that is, when a and m have no common divisor above 1. If they
        share a divisor g above 1, then a · y − q · m is a multiple of g for every y and q, so it is never 1. If gcd(a, m) = 1, the next section
        finds the inverse. So modulo a prime p, every a from 1 to p − 1 has an inverse; modulo 8, only the odd numbers do.
      </p>

      <h2 id="euclid">Inverses from Euclid</h2>
      <p>
        Lesson 1&rsquo;s extended algorithm finds x and y with a · x + m · y = gcd(a, m). If the gcd is 1, then a · x = 1 − m · y, which leaves 1
        modulo m. So x is the inverse:
      </p>
      <CodeBlock
        title="inverse.py"
        code={`def inverse(a, m):
    g, x, _ = ext_gcd(a, m)      # lesson 1
    if g != 1:
        raise ValueError("no inverse")
    return x % m                 # x may be negative

inverse(3, 7)       # 5
pow(3, -1, 7)       # 5: built in, Python 3.8 and later`}
      />
      <p>
        <code>pow(a, -1, m)</code> raises <code>ValueError</code> when there is no inverse. It works for any m, not only primes, and takes{" "}
        <M>O(log m)</M> steps, like Euclid&rsquo;s algorithm.
      </p>

      <h2 id="fermat">Fermat&rsquo;s little theorem</h2>
      <p>For a prime modulus there is a second way, from a rule found by Pierre de Fermat in 1640:</p>
      <Invariant label="Fermat">If p is prime and p does not divide a, then aᵖ⁻¹ ≡ 1 (mod p)</Invariant>
      <p>
        Here <M>aᵖ⁻¹</M> means a to the power p − 1. <strong>Why?</strong> Look at the row of a in the modulo 7 table: a · 1, a · 2, …, a · (p −
        1) leave the remainders 1 to p − 1, each exactly once, in a new order. (Two of them cannot be equal, because a has an inverse that would
        undo the difference.) So their product leaves the same remainder as 1 · 2 · … · (p − 1). That product is{" "}
        <M>aᵖ⁻¹ · (p − 1)!</M>, and <M>(p − 1)!</M> has an inverse, so it cancels and leaves <M>aᵖ⁻¹ ≡ 1</M>.
      </p>
      <p>
        So <M>a · aᵖ⁻² ≡ 1</M>, and the inverse of a is <code>pow(a, p - 2, p)</code>, one fast power (lesson 3). The rule also explains lesson
        2&rsquo;s warning about exponents: modulo a prime p, and for a base that p does not divide, an exponent may be reduced modulo p − 1.
      </p>
      <Note title="A quick test that a number is not prime">
        <p>
          If <code>pow(a, n - 1, n)</code> is not 1 for some a, then n is certainly not prime. The reverse is not quite true: rare numbers
          such as 561 = 3 · 11 · 17 pass for every a with no common factor. The Miller–Rabin test (HARD-5) adds a check that no composite
          number passes for most a.
        </p>
      </Note>

      <h2 id="many">Many inverses at once</h2>
      <p>
        Lesson 6 needs the inverses of many numbers modulo the same prime p. Calling <code>pow</code> for each costs <M>O(log p)</M> each.
        There is a rule that gives all the inverses of 1 to n in <M>O(n)</M>:
      </p>
      <Invariant label="Rule">inv[i] = −(p // i) · inv[p % i]  (mod p)</Invariant>
      <p>
        <strong>Why?</strong> p = (p // i) · i + (p % i), so modulo p, 0 ≡ (p // i) · i + (p % i). Multiply both sides by inv[i] and by
        inv[p % i]: 0 ≡ (p // i) · inv[p % i] + inv[i]. Since p % i is smaller than i, its inverse is already known. For factorials there is an
        even simpler way: work out the inverse of n! once with <code>pow</code>, then go down, because the inverse of (i − 1)! is the inverse
        of i! times i.
      </p>

      <h2 id="crt">The Chinese remainder theorem</h2>
      <p>
        A number leaves remainder 2 when divided by 3, and remainder 3 when divided by 5. What is it? The third version of the figure places
        each x from 0 to 14 by its two remainders, and every cell is hit exactly once.
      </p>
      <Invariant label="CRT">If m and n have no common divisor above 1, then for any r and s exactly one x from 0 to m·n − 1 has x % m = r and x % n = s.</Invariant>
      <p>
        <strong>Finding it.</strong> The numbers with x % m = r are r, r + m, r + 2m, …, that is, x = r + m · t. The second condition says m · t
        ≡ s − r (mod n). Since m has an inverse modulo n, t = (s − r) · inverse(m, n) % n. Then x = r + m · t, and adding any multiple of m ·
        n gives the other solutions.
      </p>
      <p>
        <strong>When the moduli share a divisor</strong> g = gcd(m, n), the two conditions must agree modulo g: x % 4 = 1 says x is odd, and x
        % 6 = 2 says x is even, so no x has both. If they agree, divide the equation for t by g, solve modulo n / g, and the answers repeat
        every lcm(m, n). Several conditions are combined one at a time: after each one, the answers are x, x + L, x + 2L, …, where L is the
        lcm of the moduli so far. MATH-P5 asks for exactly this.
      </p>
      <Note title="Where it is used">
        <p>
          RSA decrypts about four times faster by working modulo the two secret primes separately and joining the results with this theorem.
          Big-number libraries multiply huge numbers modulo several primes and join the results. The name comes from a puzzle in the Chinese
          book <em>Sunzi Suanjing</em> (about the 4th century): a number leaves 2, 3 and 2 when divided by 3, 5 and 7. The answer is 23.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/math/practice/5/">MATH-P5, The Chinese remainder theorem</Link>.
      </p>
    </>
  );
}
