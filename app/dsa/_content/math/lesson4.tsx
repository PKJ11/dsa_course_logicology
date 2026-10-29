import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SieveFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A <strong>prime</strong> is a whole number above 1 whose only divisors are 1 and itself: 2, 3, 5, 7, 11, …. Every whole number above 1
        is a product of primes in exactly one way, so primes are the building blocks of the whole numbers. This lesson tests single numbers,
        then finds all the primes up to n at once with a method more than 2,000 years old.
      </p>

      <h2 id="trial">Testing one number</h2>
      <p>
        To test whether n is prime, try dividing it by 2, 3, 4, …. You can stop at <M>√n</M>, the square root of n. If n = a · b with a ≤ b,
        then a · a ≤ a · b = n, so a ≤ √n: every factor pair has one member at most <M>√n</M>.
      </p>
      <CodeBlock
        title="is_prime.py"
        code={`from math import isqrt

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, isqrt(n) + 1):
        if n % d == 0:
            return False
    return True`}
      />
      <p>
        <code>math.isqrt(n)</code> is the square root rounded down, <M>⌊√n⌋</M>, computed exactly for whole numbers of any size.{" "}
        <code>int(n ** 0.5)</code> goes through a float and can be off by one for large n. Trial division costs <M>O(√n)</M>: for{" "}
        <M>n = 10¹²</M> that is up to a million divisions for one number.
      </p>

      <h2 id="sieve">Crossing out multiples</h2>
      <p>
        To find <em>every</em> prime up to n, Eratosthenes (about 240 BC) turned the question round. Instead of testing each number for
        divisors, take each prime and cross out its multiples. Whatever is never crossed out has no smaller prime divisor, so it is prime.
      </p>
      <SieveFigure />
      <p>Two details make it fast.</p>
      <ul>
        <li>
          <strong>Start at p · p.</strong> A smaller multiple p · j, with j &lt; p, has a prime factor smaller than p (a factor of j), so it was
          crossed out already.
        </li>
        <li>
          <strong>Stop at √n.</strong> Every crossed-out number up to n has a prime factor at most <M>√n</M>, by the factor-pair argument
          above. So after the primes up to <M>√n</M>, nothing new is crossed out.
        </li>
      </ul>
      <CodeBlock
        title="sieve.py"
        code={`from math import isqrt

def primes_upto(n):
    is_p = bytearray([1]) * (n + 1)   # one byte per number
    is_p[0] = is_p[1] = 0
    for p in range(2, isqrt(n) + 1):
        if is_p[p]:
            count = len(range(p * p, n + 1, p))
            is_p[p * p::p] = bytes(count)   # cross out
    return [i for i in range(n + 1) if is_p[i]]`}
      />
      <p>
        The slice <code>is_p[p * p::p]</code> is every p-th entry from <M>p²</M> to the end, and <code>bytes(count)</code> is that many zero
        bytes. Assigning one to the other crosses out all the multiples in one step that runs in C, which is many times faster than a Python
        loop over them.
      </p>

      <h2 id="cost">What the sieve costs</h2>
      <p>
        Prime p crosses out about n / p numbers, so the total is about <M>n · (1/2 + 1/3 + 1/5 + 1/7 + …)</M> over the primes up to{" "}
        <M>√n</M>. This sum of 1/p over primes grows like <M>ln ln n</M>, where ln is the natural logarithm, so the sieve is{" "}
        <M>O(n log log n)</M>. That is nearly <M>O(n)</M>: for <M>n = 10⁹</M>, <M>ln ln n</M> is only about 3.
      </p>
      <Invariant label="Cost">Sieve up to n: O(n log log n) time and n bytes of memory.</Invariant>
      <p>
        Memory is the real limit: one byte per number is 100 MB for <M>n = 10⁸</M>. Storing only odd numbers halves it, and one bit per number
        (BITS) divides it by 8. How many primes are there? About <M>n / ln n</M> up to n (the prime number theorem): 78,498 up to a million,
        and 50,847,534 up to a billion.
      </p>

      <h2 id="factor">Smallest factors</h2>
      <p>
        Instead of a yes-or-no mark, the sieve can store each number&rsquo;s <strong>smallest prime factor</strong>: when prime p crosses out a
        number for the first time, p is its smallest prime factor. Then any number up to n can be broken into primes with one division per
        factor, as the second version of the figure shows for 45.
      </p>
      <CodeBlock
        title="factorise.py"
        code={`from math import isqrt

def smallest_factors(n):
    spf = list(range(n + 1))       # spf[x] = x until crossed out
    for p in range(2, isqrt(n) + 1):
        if spf[p] == p:            # p is prime
            for q in range(p * p, n + 1, p):
                if spf[q] == q:
                    spf[q] = p
    return spf

def factorise(x, spf):
    out = []
    while x > 1:
        out.append(spf[x])
        x //= spf[x]
    return out                     # factorise(45, spf) == [3, 3, 5]`}
      />
      <p>
        Each division at least halves x, so factorising takes <M>O(log x)</M> steps after the sieve. A variant called the linear sieve crosses out
        each number exactly once, from its smallest prime factor, and runs in <M>O(n)</M>.
      </p>

      <h2 id="segment">Primes in a far window</h2>
      <p>
        What are the primes between <M>10¹² − 10⁶</M> and <M>10¹²</M>? A sieve up to <M>10¹²</M> needs a million million bytes. But only the
        window needs marks. Every composite number in it has a prime factor at most <M>√10¹² = 10⁶</M>. So:
      </p>
      <ol>
        <li>sieve the small primes, up to <M>√hi</M>;</li>
        <li>
          for each small prime p, cross out its multiples inside the window. The first multiple of p that is at least lo is{" "}
          <code>(lo + p - 1) // p * p</code> (lo rounded up to a multiple of p), but never start below <M>p²</M>, or p itself would be crossed
          out.
        </li>
      </ol>
      <p>
        This is a <strong>segmented sieve</strong>. Its memory is about <M>√hi</M> plus the width of the window, and its time is about the
        window&rsquo;s sieve plus one division per small prime. MATH-P4 asks you to write it.
      </p>
      <Note title="Testing one huge number">
        <p>
          For a single number of 20 or 200 digits, neither trial division nor a sieve works. The Miller–Rabin test (HARD-5) uses a few fast
          modular powers (lesson 3) and is used by every cryptography library. Python has no built-in prime test; the SymPy library has{" "}
          <code>sympy.isprime</code>.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/math/practice/4/">MATH-P4, Primes in a window</Link>.
      </p>
    </>
  );
}
