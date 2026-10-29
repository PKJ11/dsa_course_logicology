import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PowerFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        RECR-1 raised x to the power n by halving n, with about <M>log₂ n</M> calls, and RECR-P1 asked for it modulo m. This lesson writes the
        same idea as a loop over the bits of n, and then uses it for something bigger: powers of matrices, which reach the
        millionth term of a rule such as Fibonacci&rsquo;s, or the 10¹⁸th (10¹⁸ is a 1 followed by 18 zeros), in a few dozen steps.
      </p>

      <h2 id="bits">Powers from the bits of n</h2>
      <p>
        Write n in binary (BITS-1). 13 is <code>1101</code>, which is 8 + 4 + 1, so <M>x¹³ = x⁸ · x⁴ · x¹</M>. The powers <M>x¹, x², x⁴, x⁸,
        …</M> each come from squaring the one before: multiplying two equal powers adds their exponents, and <M>2ᵏ + 2ᵏ = 2ᵏ⁺¹</M>. So go
        through the bits of n from
        the lowest: keep squaring a running power, and multiply it into the result whenever the bit is 1.
      </p>
      <PowerFigure />
      <CodeBlock
        title="power_mod.py"
        code={`def power_mod(x, n, m):
    result = 1 % m
    x %= m
    while n:
        if n & 1:                  # this bit of n is 1
            result = result * x % m
        x = x * x % m              # x to the next power of 2
        n >>= 1
    return result`}
      />
      <Invariant label="Cost">About log₂ n squarings and at most as many products: O(log n) multiplications.</Invariant>
      <p>
        For <M>n = 10¹⁸</M> (a 1 followed by 18 zeros) that is about 60 squarings, against <M>10¹⁸</M> multiplications for a plain loop. The
        recursive version of RECR-1 does the same work, from the top bit down.
      </p>

      <h2 id="mod">With a modulus</h2>
      <p>
        Lesson 2 showed that a remainder can be taken after every product, so every number in the loop stays below m. Without the modulus,{" "}
        <M>3¹⁰⁰⁰⁰⁰⁰</M> (a million 3s multiplied together) has 477,122 digits, and the last few squarings alone take real time. With it, each step is a product of two small
        numbers.
      </p>
      <p>
        Python&rsquo;s built-in <code>pow(x, n, m)</code> does exactly this, in C. It also accepts n = −1 for the inverse modulo m (lesson 5).
        Always use the three-argument form: <code>pow(x, n) % m</code> works out the full power first.
      </p>

      <h2 id="matrices">Powers of a matrix</h2>
      <p>
        The loop above only multiplies, and it only needs the multiplication to be <strong>associative</strong>:{" "}
        <M>(A · B) · C = A · (B · C)</M>, so the products can be grouped in any way. Matrices (square tables of numbers) are multiplied that way
        too: entry (i, j) of A · B is the sum over t of <M>A[i][t] · B[t][j]</M>. The order of the two factors matters for matrices, but
        grouping does not, and the power loop never changes the order.
      </p>
      <p>
        The Fibonacci numbers are <span className="nowrap">F(0) = 0</span>, <span className="nowrap">F(1) = 1</span>, and each next one is the sum of the two before. Let M be the 2 × 2 matrix with rows (1,
        1) and (1, 0). Then
      </p>
      <Invariant label="Fibonacci">
        Mᵏ has rows <span className="nowrap">(F(k+1), F(k))</span> and <span className="nowrap">(F(k), F(k−1))</span>
      </Invariant>
      <p>
        <strong>Why?</strong> For k = 1 it is M itself. If it holds for k, multiply by M: the new top row is (F(k+1) + F(k), F(k+1)), which is
        (F(k+2), F(k+1)), and the bottom row is (F(k) + F(k−1), F(k)), which is (F(k+1), F(k)). So it holds for k + 1 too. The second version of
        the figure builds <M>M¹³</M> from <M>M¹, M⁴, M⁸</M>.
      </p>
      <CodeBlock
        title="fib_mod.py"
        code={`def mat_mul(A, B, m):
    k = len(A)
    return [[sum(A[i][t] * B[t][j] for t in range(k)) % m
             for j in range(k)] for i in range(k)]

def mat_pow(A, n, m):
    k = len(A)
    R = [[int(i == j) for j in range(k)] for i in range(k)]
    while n:
        if n & 1:
            R = mat_mul(R, A, m)
        A = mat_mul(A, A, m)
        n >>= 1
    return R

def fib_mod(n, m):
    return mat_pow([[1, 1], [1, 0]], n, m)[0][1] % m`}
      />
      <p>
        R starts as the <strong>identity matrix</strong>, with 1s on the diagonal and 0s elsewhere: it plays the part of the 1 in{" "}
        <code>result = 1</code>, since multiplying by it changes nothing. A product of two k × k matrices takes <M>k³</M> multiplications, so a
        power costs <M>O(k³ log n)</M>.
      </p>

      <h2 id="recurrences">Any linear rule</h2>
      <p>
        The same works for any rule where the next term is a fixed sum of multiples of the last k terms. RECR-P2 counted the ways to go up n
        steps with moves of 1, 2 or 3: <M>w(n) = w(n − 1) + w(n − 2) + w(n − 3)</M>. Keep the last three terms as a column (w(n), w(n − 1),
        w(n − 2)). One step of the rule turns it into (w(n + 1), w(n), w(n − 1)), and that is multiplying by a 3 × 3 matrix:
      </p>
      <ul>
        <li>its top row is (1, 1, 1): the new term adds up the last three;</li>
        <li>its other rows are (1, 0, 0) and (0, 1, 0): they copy w(n) and w(n − 1) one place down.</li>
      </ul>
      <p>
        So the nth term is an entry of this matrix to the power n, times the starting column. MATH-P3 builds such a matrix for any set of
        allowed moves. The top row has a 1 for each allowed move and a 0 for each move that is not allowed.
      </p>
      <Note title="Fast doubling">
        <p>
          For Fibonacci alone there is a shortcut with fewer multiplications: F(2k) = F(k) · (2 · F(k+1) − F(k)) and F(2k + 1) = F(k)² +
          F(k+1)². Going through the bits of n from the top, each step doubles k (and adds 1 when the bit is 1). It is the matrix method with the
          repeated entries removed.
        </p>
      </Note>

      <h2 id="uses">Where fast powers are used</h2>
      <ul>
        <li>
          <strong>Cryptography.</strong> RSA encrypts a message m as <M>mᵉ</M> modulo a number of about 600 digits, and key exchange computes{" "}
          <M>gᵃ</M> modulo a large prime. Both are fast powers with exponents of hundreds of digits.
        </li>
        <li>
          <strong>Testing for primes.</strong> Lesson 5&rsquo;s Fermat rule and the Miller–Rabin test (HARD-5) check a number with a few
          modular powers, far faster than trying divisors.
        </li>
        <li>
          <strong>Counting walks.</strong> In a graph (GRPH-1), entry (i, j) of the adjacency matrix to the power n is the number of walks of
          exactly n edges from i to j.
        </li>
        <li>
          <strong>Repeating remainders.</strong> Fibonacci numbers modulo m repeat in a cycle (modulo 10, every 60 terms). Matrix powers find any
          term without knowing the cycle.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/math/practice/3/">MATH-P3, The footbridge, 10¹⁸ steps</Link>.
      </p>
    </>
  );
}
