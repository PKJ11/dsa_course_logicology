import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RollFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Comparing two numbers takes one step; comparing two strings of length <M>m</M> can take <M>m</M>. A <em>rolling hash</em> turns every
        piece of the text into a number, and moves from one piece to the next in <M>O(1)</M>. The Rabin–Karp method (1987) uses it to compare
        letters only where the numbers agree.
      </p>

      <h2 id="idea">Compare numbers, not letters</h2>
      <p>
        <Link href="/dsa/hash/1/">HASH-1</Link> built the <em>polynomial hash</em> of a string: treat the letter codes <M>c₀, c₁, …</M> as the
        digits of a number in base <M>B</M>,
      </p>
      <p>
        <M>h(s) = c<sub>0</sub>·B<sup>m−1</sup> + c<sub>1</sub>·B<sup>m−2</sup> + … + c<sub>m−1</sub>,</M>
      </p>
      <p>
        and keep only the remainder after dividing by a large prime <M>M</M>, called the <strong>modulus</strong>. Here{" "}
        <M>B<sup>m−1</sup></M> means <M>m − 1</M> copies of <M>B</M> multiplied together. <Link href="/dsa/math/2/">MATH-2</Link> showed that
        you can take the remainder after every addition and multiplication and still get the right remainder at the end, so the numbers stay
        small.
      </p>
      <p>
        If two strings are equal, their hashes are equal. The other way round is not guaranteed: two different strings can have the same hash,
        which is called a <strong>collision</strong>. So equal hashes mean &ldquo;probably equal&rdquo;, and different hashes mean
        &ldquo;certainly different&rdquo;.
      </p>

      <h2 id="roll">Rolling the hash</h2>
      <p>
        Take the piece of T at place <M>i</M>, <M>T[i..i+m−1]</M>, and the next piece, <M>T[i+1..i+m]</M>. They share <M>m − 1</M> letters. In
        base 10 with the digits <code>31415926</code> and <M>m = 3</M>, going from 314 to 141 means: take away the first digit&rsquo;s worth
        (300), multiply by 10, add the new digit (1). The same works in any base:
      </p>
      <Invariant label="Roll">
        <span className="nowrap">h(next) =</span> <span className="nowrap">(h(this) − T[i] · B<sup>m−1</sup>) · B</span> <span className="nowrap">+ T[i + m]</span>, all modulo M.
      </Invariant>
      <p>
        Here <M>B<sup>m−1</sup></M> means m − 1 copies of B multiplied together. With <M>B<sup>m−1</sup> mod M</M> worked out once, each roll costs a few multiplications: <M>O(1)</M>, whatever <M>m</M> is. The
        Rabin–Karp method rolls through the whole text and compares letters only where the hash equals the pattern&rsquo;s hash. Step through
        the figure; it uses digits and <M>M = 13</M> so that the numbers are easy to check.
      </p>
      <RollFigure />
      <CodeBlock
        code={`def rabin_karp(t, p, B=131, M=(1 << 61) - 1):
    n, m = len(t), len(p)
    if m > n:
        return []
    top = pow(B, m - 1, M)            # B to the power m-1, mod M
    hp = ht = 0
    for k in range(m):
        hp = (hp * B + ord(p[k])) % M
        ht = (ht * B + ord(t[k])) % M
    found = []
    for i in range(n - m + 1):
        if ht == hp and t[i:i + m] == p:      # check the letters
            found.append(i)
        if i + m < n:                         # roll to place i + 1
            ht = ((ht - ord(t[i]) * top) * B + ord(t[i + m])) % M
    return found`}
      />
      <p>
        <code>(1 &lt;&lt; 61) - 1</code> is <M>2<sup>61</sup> − 1</M>, a prime. Python&rsquo;s <code>%</code> always gives a result from 0 to{" "}
        <M>M − 1</M>, even when the number before it is negative, so the subtraction needs no extra care.
      </p>
      <p>
        <strong>Cost.</strong> The rolls cost <M>O(n + m)</M>. Each letter check costs <M>O(m)</M>, and it runs at every true occurrence and at
        every collision. With few collisions the total is <M>O(n + m + m · k)</M>, where <M>k</M> is the number of occurrences. If the pattern
        occurs at almost every place, checking letters every time is <M>O(n · m)</M> again; then either trust the hash (and accept a tiny chance
        of error) or use KMP.
      </p>

      <h2 id="collide">How often hashes collide</h2>
      <p>
        Take two different strings x and y of length <M>m</M>, and pick the base B at random from 0 to <M>M − 1</M>. The difference{" "}
        <M>h(x) − h(y)</M> is a polynomial in B of degree at most <M>m − 1</M> that is not zero everywhere (the two strings differ in some
        letter). Modulo a prime, such a polynomial has at most <M>m − 1</M> roots: values of B that make it 0 (the same fact as for ordinary
        polynomials, because division works modulo a prime, MATH-5). So:
      </p>
      <Invariant label="Collision chance">For a random base, two different strings of length m collide with chance at most (m − 1) / M.</Invariant>
      <p>
        Over all <M>n</M> places of a search, the chance of any collision is at most <M>n · m / M</M>. With <M>n = m = 10⁶</M> and{" "}
        <M>M ≈ 2.3 × 10¹⁸</M>, that is less than one in a million. With <M>M = 10⁹ + 7</M> it is useless: <M>10¹² / 10⁹</M> is more than 1.
      </p>
      <p>
        A different danger comes from comparing many pieces with each other, as the practice problem does. With <M>k</M> different pieces, there
        are about <M>k²/2</M> pairs, and each pair can collide. By the birthday problem (MATH-7), with a modulus near <M>10⁹</M> a collision
        becomes likely once there are about 50,000 pieces. With <M>2<sup>61</sup> − 1</M>, it takes a few billion.
      </p>
      <Note title="Hashes that can be attacked" warn>
        <p>
          The bound needs a base chosen at random <em>after</em> the input is fixed. With a fixed, published base, someone can build two strings
          with the same hash. A famous case: hashing in C or C++ with arithmetic modulo <M>2<sup>64</sup></M> (where numbers simply wrap around)
          fails for <em>every</em> odd base on the Thue–Morse string, built by starting with <code>&quot;a&quot;</code> and appending the string
          with a and b swapped, again and again (<code>a, ab, abba, abbabaab, …</code>). A modulus of <M>2<sup>64</sup></M> is not prime, and the
          string of length 1,024 and its swapped copy already collide. The practice tests include this string.
        </p>
      </Note>

      <h2 id="prefix">Hashes of every piece</h2>
      <p>
        Store the hash of every start of the string, <M>H[k] = h(s[0..k))</M>, and the powers <M>B<sup>k</sup> mod M</M>. Then the hash of any
        piece <M>s[l..r)</M> is
      </p>
      <p>
        <M>h(s[l..r)) = H[r] − H[l] · B<sup>r−l</sup> (mod M)</M>,
      </p>
      <p>
        because <M>H[r]</M> is <M>H[l]</M> moved up by <M>r − l</M> places plus the piece itself. Building the two lists costs <M>O(n)</M>; each
        piece&rsquo;s hash then costs <M>O(1)</M>. This answers many questions quickly:
      </p>
      <ul>
        <li>
          <strong>Are two pieces equal?</strong> Compare their hashes.
        </li>
        <li>
          <strong>The longest common prefix of two pieces:</strong> binary search on the length (BSRC-4), comparing hashes: <M>O(log n)</M>.
        </li>
        <li>
          <strong>The longest piece that occurs twice:</strong> if some piece of length <M>L</M> occurs twice, then so does a piece of every
          shorter length (its start). So binary search on <M>L</M>, and for each <M>L</M> put the hashes of all pieces of length <M>L</M> in a
          set: <M>O(n log n)</M>. This is the practice problem.
        </li>
        <li>
          <strong>Is a piece a palindrome?</strong> Also hash the reversed string, and compare the hash of the piece with the hash of its mirror
          piece.
        </li>
      </ul>
      <CodeBlock
        code={`def prefix_hashes(s, B, M):
    H = [0] * (len(s) + 1)
    P = [1] * (len(s) + 1)
    for k, ch in enumerate(s):
        H[k + 1] = (H[k] * B + ord(ch)) % M
        P[k + 1] = P[k] * B % M
    return H, P

def piece(H, P, M, l, r):           # hash of s[l:r]
    return (H[r] - H[l] * P[r - l]) % M`}
      />

      <h2 id="choices">Choosing the base and the modulus</h2>
      <ul>
        <li>
          <strong>The modulus:</strong> a large prime. In Python, whole numbers never overflow, so <M>2<sup>61</sup> − 1</M> works directly, and
          products of two such numbers are still fast. Some people use two moduli near <M>10⁹</M> at once (a <em>double hash</em>), which in
          other languages fits 64-bit arithmetic.
        </li>
        <li>
          <strong>The base:</strong> larger than every letter code, and chosen at random when the program starts, for example{" "}
          <code>random.randrange(256, M - 1)</code>. A fixed base is fine for practice, but not for input that someone can choose against you.
        </li>
        <li>
          <strong>Many patterns of one length:</strong> put the patterns&rsquo; hashes in a set and roll through the text once. Each place costs
          one set lookup, for any number of patterns.
        </li>
        <li>
          <strong>Python&rsquo;s own <code>hash()</code></strong> on strings is salted at random each time Python starts (HASH-4), so it changes
          between runs, and it cannot be rolled.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/strg/practice/4/">STRG-P4, The longest repeated piece</Link>.
      </p>
    </>
  );
}
