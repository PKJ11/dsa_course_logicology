import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MrFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Sometimes a random choice works as well as a clever one. Randomised algorithms make random choices as they run, and their guarantees are about every input:
        on any input, the time is small on average, or the chance of a wrong answer is tiny and can be made as small as you like. This is the
        last lesson of the course.
      </p>

      <h2 id="kinds">Two kinds of random algorithm</h2>
      <ul>
        <li>
          <strong>Always right, time random</strong> (called Las Vegas): quicksort and quickselect with random pivots (SORT-3, SORT-8). The
          answer is always correct; the guarantee is on the <strong>expected</strong> time, the average over the random choices (MATH-7).
        </li>
        <li>
          <strong>Always fast, rarely wrong</strong> (called Monte Carlo): a Bloom filter (HASH-8), Freivalds’s check, the Miller–Rabin test,
          Karger’s cut. The time is fixed; the guarantee is a bound on the chance of a wrong answer.
        </li>
      </ul>
      <p>
        The randomness is in the method, not in the input: no input is bad for it, because the random choices are made after the input is fixed. A
        Monte Carlo method run k times independently has a chance of error that shrinks like the k-th power of one run’s chance. This is called{" "}
        <strong>amplification</strong>.
      </p>

      <h2 id="pivots">Random pivots</h2>
      <p>
        Why does quicksort with a random pivot make about <M>2n ln n</M> comparisons on average, for every input? Name the values by their
        sorted order, <M>z₁ &lt; z₂ &lt; … &lt; zₙ</M>. Two values zᵢ and zⱼ (i &lt; j) are compared only if one of them is the first pivot
        chosen among <M>zᵢ, …, zⱼ</M>: until then they stay in the same part, and once a value between them is chosen, they go to different
        parts. Each of these <M>j − i + 1</M> values is equally likely to be first, so the chance is <M>2/(j − i + 1)</M>. Adding up over all
        pairs (the expected count is the sum of the chances, MATH-7) gives less than <M>2n(1 + 1/2 + … + 1/n)</M>, which is about{" "}
        <M>2n ln n</M>.
      </p>

      <h2 id="freivalds">Checking a product</h2>
      <p>
        Is <M>A · B = C</M> for three n × n matrices? Multiplying A by B costs about <M>n³</M> steps (n · n · n). Freivalds (1977): pick a random vector r of
        0s and 1s and compare <M>A · (B · r)</M> with <M>C · r</M>. Each is two matrix-vector products, <M>O(n²)</M>.
      </p>
      <CodeBlock
        title="freivalds.py"
        code={`def same_product(A, B, C, rounds, rand):
    # rand() returns 0 or 1; a wrong C escapes each round with chance at most 1/2
    n = len(A)
    for _ in range(rounds):
        r = [rand() for _ in range(n)]
        Br = [sum(B[i][k] * r[k] for k in range(n)) for i in range(n)]
        ABr = [sum(A[i][k] * Br[k] for k in range(n)) for i in range(n)]
        Cr = [sum(C[i][k] * r[k] for k in range(n)) for i in range(n)]
        if ABr != Cr:
            return False                 # certainly A·B != C
    return True                          # A·B == C, wrong with chance <= 2**-rounds`}
      />
      <p>
        <strong>Why at most 1/2.</strong> If <M>A · B ≠ C</M>, the difference <M>D = A · B − C</M> has some entry <M>dᵢⱼ ≠ 0</M>. Entry i of{" "}
        <M>D · r</M> is <M>dᵢⱼ · rⱼ</M> plus a sum s that does not involve rⱼ. Fix every other entry of r; of the two choices of rⱼ, at most one
        makes <M>dᵢⱼ · rⱼ + s = 0</M>. So <M>D · r = 0</M> has chance at most 1/2. A “no” answer is always right; a “yes” after 20 rounds is
        wrong with chance at most <M>2⁻²⁰</M>, about one in a million.
      </p>

      <h2 id="prime">Prime or not: Miller–Rabin</h2>
      <p>
        MATH-5’s Fermat test checks <M>aⁿ⁻¹ mod n = 1</M>: true for every a when n is prime. But Carmichael numbers such as 561 pass it for
        every a that shares no factor with them. Miller (1976) and Rabin (1980) added a second fact about primes:
      </p>
      <Invariant label="Roots">Modulo a prime n, the only numbers whose square is 1 are 1 and n − 1 (that is, −1).</Invariant>
      <p>
        (If <M>x² − 1 = (x − 1)(x + 1)</M> is a multiple of a prime, one of the two factors is.) So write <M>n − 1 = d · 2ˢ</M> with d odd,
        and look at <M>aᵈ, a²ᵈ, a⁴ᵈ, …, aⁿ⁻¹</M>, each the square of the one before, all modulo n. For a prime, the list either starts at 1 or
        reaches n − 1 before it reaches 1. If instead a value other than ±1 squares to 1, or the last value is not 1, then n is certainly not
        prime and a is a <strong>witness</strong>. The figure shows a prime, the Carmichael number 561, and 2047, which fools base 2.
      </p>
      <MrFigure />
      <p>
        <strong>How often it errs.</strong> For an odd composite n, at most a quarter of the bases from 1 to n − 1 are <strong>strong liars</strong>{" "}
        (bases that pass). So k random bases all pass with chance at most <M>(1/4)ᵏ</M>: 20 bases give less than one chance in 10¹² (a million million). Each base
        costs one <code>pow(a, d, n)</code> and s squarings, <M>O(log n)</M> multiplications (MATH-3).
      </p>
      <p>
        For numbers of a bounded size, no luck is needed at all. Searches by computer found the smallest composite that fools every one of the
        first k prime bases. Below <M>3.3 × 10²⁴</M> (33 followed by 23 zeros), the 13 bases 2, 3, 5, …, 41 catch every composite, so the test becomes exact. This is{" "}
        <strong>derandomisation</strong>: a fixed set of choices proved to work for every input in range. The practice problem uses it.
      </p>

      <h2 id="cut">Karger’s minimum cut</h2>
      <p>
        A <strong>cut</strong> of an undirected graph splits its vertices into two non-empty sides; its size is the number of edges between them.
        FLOW-4 finds the smallest cut between two given vertices with a flow. Karger (1993) finds the smallest cut overall with random choices:
      </p>
      <ol>
        <li>pick an edge at random and <strong>contract</strong> it: merge its two ends into one vertex, keep all other edges (repeats too), drop loops;</li>
        <li>repeat until two vertices are left; the edges between them are a cut.</li>
      </ol>
      <p>
        <strong>Why it often works.</strong> Fix a smallest cut, of size c. Every vertex has at least c edges (else its own edges would be a
        smaller cut), so with v vertices left there are at least <M>c · v / 2</M> edges, and the chance of contracting one of the cut’s c edges
        is at most <M>2/v</M>. The cut survives all contractions with chance at least{" "}
        <M>(1 − 2/n)(1 − 2/(n − 1)) … (1 − 2/3)</M>, and this product equals <M>2 / (n(n − 1))</M>. Repeating about <M>n² ln n</M> times and keeping the smallest cut found
        misses with chance about <M>1/n²</M>. Karger and Stein made it faster by sharing the early contractions between runs.
      </p>

      <h2 id="luck">Testing without luck</h2>
      <p>
        A test that passes or fails by chance is useless (MATH-7). The practice pages of this course test random code in three ways: pass the
        random function in, so a test can script its choices (MATH-P7); check a property that holds for every outcome; or, as here, remove the
        randomness by a proof. In your own code, <code>random.seed(…)</code> makes runs repeatable, <code>random.Random(seed)</code> gives a
        generator of your own, and <code>secrets</code> gives numbers nobody can predict, for passwords and keys.
      </p>
      <Note title="The last lesson">
        <p>
          This is the last lesson. The course went from lists and binary search to problems nobody knows how to solve fast, and the methods
          that get useful answers anyway. Going back to any station, and its practice problems, is a good way to remember it.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/hard/practice/5/">HARD-P5, Prime or not</Link>.
      </p>
    </>
  );
}
