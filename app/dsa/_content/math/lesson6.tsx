import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PascalFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        How many ways are there to choose 3 coaches out of 8? Counting questions like this come up whenever an algorithm&rsquo;s cost depends on
        how many cases there are, and as problems in their own right. This lesson builds the main counting tool, the number of combinations,
        and shows how to compute it exactly, modulo a prime, and for huge numbers.
      </p>

      <h2 id="count">Choosing k of n</h2>
      <p>
        <strong>n factorial</strong>, written n!, is 1 · 2 · … · n, the number of orders of n different items: n choices for the first place,
        n − 1 for the second, and so on. By agreement 0! = 1 (there is one order of no items). The number of ways to fill k places in order from
        n items is <M>n · (n − 1) · … · (n − k + 1)</M>, which is <M>n! / (n − k)!</M>.
      </p>
      <p>
        If the order does not matter, each set of k items has been counted once for each of its k! orders. So the number of ways to{" "}
        <em>choose</em> k items from n, read &ldquo;n choose k&rdquo; and written C(n, k) here, is
      </p>
      <Invariant label="Choose">C(n, k) = n! / (k! · (n − k)!)</Invariant>
      <p>
        C(5, 2) = 120 / (2 · 6) = 10, and C(8, 3) = 56. Choosing k items to take is the same as choosing n − k to leave, so C(n, k) = C(n, n −
        k). Python has <code>math.comb(n, k)</code>, <code>math.perm(n, k)</code> (ordered, so <code>math.perm(5, 2)</code> is 20) and{" "}
        <code>math.factorial(n)</code>, all exact.
      </p>
      <CodeBlock
        title="comb.py"
        code={`def comb(n, k):
    if not 0 <= k <= n:
        return 0
    k = min(k, n - k)
    c = 1
    for i in range(k):
        c = c * (n - i) // (i + 1)   # always a whole number
    return c`}
      />
      <p>
        After step i, c is C(n, i + 1), a whole number, so the division is always exact. Multiplying before dividing keeps it so.
      </p>

      <h2 id="pascal">Pascal&rsquo;s rule</h2>
      <Invariant label="Pascal">C(n, k) = C(n − 1, k − 1) + C(n − 1, k)</Invariant>
      <p>
        <strong>Why?</strong> Look at one particular item, the last one. A choice of k items from n either takes it, and then the other k − 1
        come from the other n − 1 items, or leaves it, and then all k come from those n − 1. Every choice is in exactly one of the two groups.
        Written as a table, each number is the sum of the one above it and the one above-left: Pascal&rsquo;s triangle.
      </p>
      <PascalFigure />
      <p>
        Row n adds up to <M>2ⁿ</M>, because together the row counts every subset of n items (BITS-5). The rows are also the numbers in{" "}
        <M>(x + y)ⁿ</M> written out: <M>(x + y)³ = x³ + 3x²y + 3xy² + y³</M>, with 1, 3, 3, 1 from row 3. This is the binomial theorem, and it
        is why C(n, k) is also called a binomial coefficient.
      </p>
      <p>
        The rule uses only addition, so it works modulo any m, prime or not. Building the table up to row n costs <M>O(n²)</M>, which is fine
        for n up to a few thousand:
      </p>
      <CodeBlock
        title="pascal_mod.py"
        code={`def pascal_mod(n, m):
    C = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        C[i][0] = 1 % m
        for k in range(1, i + 1):
            C[i][k] = (C[i - 1][k - 1] + C[i - 1][k]) % m
    return C`}
      />

      <h2 id="mod">Counts modulo a prime</h2>
      <p>
        For n up to a million, the table has too many cells. Use the factorial formula instead, modulo a prime p that is bigger than n. Lesson
        2 says you cannot simply divide remainders, but lesson 5 says that dividing by a means multiplying by its inverse. So
      </p>
      <Invariant label="Mod p">C(n, k) ≡ n! · inverse(k!) · inverse((n − k)!)  (mod p)</Invariant>
      <p>
        Work out the factorials 0!, 1!, …, N! modulo p once, and their inverses with lesson 5&rsquo;s method (one <code>pow</code> for N!,
        then down). After that, each C(n, k) is two multiplications. That is <M>O(N)</M> to prepare and <M>O(1)</M> per question. MATH-P6
        asks for it. Why must p be bigger than n? If p ≤ n, then p divides n!, so n! leaves 0 and has no inverse.
      </p>

      <h2 id="lucas">Huge n, small p</h2>
      <p>
        When n is <M>10¹⁸</M> and p is small, factorials are out of reach. Lucas&rsquo;s theorem (Édouard Lucas, 1878) helps: write n and k in
        base p, as digits <M>n₀, n₁, …</M> and <M>k₀, k₁, …</M>. Then
      </p>
      <Invariant label="Lucas">C(n, k) ≡ C(n₀, k₀) · C(n₁, k₁) · C(n₂, k₂) · …  (mod p)</Invariant>
      <p>
        Each small C(nᵢ, kᵢ) has both numbers below p, so the method above handles it. For p = 2 the digits are bits, and C(1, 0) = C(1, 1) =
        C(0, 0) = 1 while C(0, 1) = 0. So C(n, k) is odd exactly when no bit of k is 1 where n has a 0, that is, when{" "}
        <code>k &amp; n == k</code>. The second version of the figure shows the pattern this makes.
      </p>

      <h2 id="patterns">Counting patterns</h2>
      <ul>
        <li>
          <strong>Paths in a grid.</strong> A path that goes r steps down and c steps right is a choice of which r of its r + c steps go
          down: C(r + c, r). DYNP-5 counted the same paths with a table, which also handles blocked cells.
        </li>
        <li>
          <strong>Sharing out.</strong> The ways to give n identical sweets to k children are C(n + k − 1, k − 1). Write the sweets as n dots
          in a row; the k − 1 dividers between the children go in any of the n + k − 1 places.
        </li>
        <li>
          <strong>Brackets and trees.</strong> The number of search-tree shapes with n keys (DYNP-P1) is the Catalan number C(2n, n) / (n +
          1).
        </li>
        <li>
          <strong>Counting with overlaps.</strong> To count the items in A or B, add the two counts and take away the items counted twice.
          Writing |A| for the number of items in A: |A or B| = |A| + |B| − |A and B|. This is the start of inclusion–exclusion.
        </li>
      </ul>
      <Note title="How big C(n, k) gets">
        <p>
          C(n, n/2) is about <M>2ⁿ / √(πn/2)</M>, where π (pi) is about 3.14: not far below <M>2ⁿ</M>, the total for the whole row. So &ldquo;try every half of the items&rdquo;
          is barely cheaper than &ldquo;try every subset&rdquo;. C(100, 50) has 30 digits, and C(10⁶, 500,000) about 300,000 digits.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/math/practice/6/">MATH-P6, Combinations modulo a prime</Link>.
      </p>
    </>
  );
}
