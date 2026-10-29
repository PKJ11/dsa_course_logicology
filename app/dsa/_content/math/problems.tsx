import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";
import t7 from "./tests/p7.json";

export const MATH_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Paying with two coins",
    fn: "pay_ways",
    lessons: [1],
    blocked: ["pow"],
    starter: `def pay_ways(a, b, amount):
    # Return how many pairs (x, y) of whole numbers,
    # both at least 0, have a*x + b*y == amount.
    pass
`,
    statement: (
      <>
        <p>
          You have as many coins of value <code>a</code> and of value <code>b</code> as you like. Return the number of ways to pay exactly{" "}
          <code>amount</code>: the number of pairs (x, y) of whole numbers, both 0 or more, with <code>a * x + b * y == amount</code>.
        </p>
        <CodeBlock
          code={`pay_ways(3, 5, 30)    # 3: (10, 0), (5, 3), (0, 6)
pay_ways(4, 6, 9)     # 0: 4x + 6y is always even
pay_ways(3, 5, 7)     # 0
pay_ways(3, 5, 0)     # 1: no coins`}
        />
        <p>
          <code>pow()</code> is switched off for this problem, so its inverse shortcut (lesson 5) is not available: use the extended Euclidean
          algorithm from lesson 1.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            <code>a</code> and <code>b</code> are from 1 to about 10¹⁸ (a 1 followed by 18 zeros); <code>amount</code> is from 0 to 10³⁶ (a 1
            followed by 36 zeros).
          </li>
          <li>Trying every number of a-coins is far too slow for big amounts. The tests with big numbers have 2 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Let g = gcd(a, b). If g does not divide <code>amount</code>, the answer is 0. Otherwise divide a, b and the amount by g. Now find
            the smallest x that is 0 or more and makes <code>amount - a * x</code> a multiple of b.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The extended algorithm gives x₀ with a · x₀ + b · y₀ = 1 (after dividing by g). Then a · (x₀ · amount) leaves the same remainder
              as amount when divided by b, so the smallest good x is <code>x0 * amount % b</code>.
            </p>
            <p>
              The good values of x are that one, then every b more (lesson 1: x + t · b). Each one needs y = (amount − a · x) / b to be 0 or more,
              that is, a · x ≤ amount. Count how many fit with one division.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`g, x0 = gcd of a and b, with a*x0 + b*y0 == g
if amount % g != 0: return 0
a, b, amount = a // g, b // g, amount // g
first = x0 * amount % b        # smallest x >= 0
if a * first > amount: return 0
return (amount - a * first) // (a * b) + 1`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Pairs that add to a multiple",
    fn: "pairs_to_multiple",
    lessons: [2],
    starter: `def pairs_to_multiple(a, k):
    # Return how many pairs i < j have
    # (a[i] + a[j]) % k == 0.
    pass
`,
    statement: (
      <>
        <p>
          Return how many pairs of positions <code>i &lt; j</code> in the list <code>a</code> have a sum <code>a[i] + a[j]</code> that is a
          multiple of <code>k</code>.
        </p>
        <CodeBlock
          code={`pairs_to_multiple([1, 2, 3, 4, 5], 3)   # 4
pairs_to_multiple([-1, 1, -5, 7], 6)    # 3
pairs_to_multiple([5] * 10, 10)         # 45`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>a</code> has up to 200,000 whole numbers, which may be negative and may be very large. <code>k</code> is from 1 to about a
            million.
          </li>
          <li>Checking every pair is far too slow for 200,000 numbers (about 20 billion pairs). The big tests have 3 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Whether a pair works depends only on the two remainders after dividing by k. How many numbers have each remainder?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Count the remainders in a dict. A number with remainder r pairs with every number of remainder <code>(k - r) % k</code>. For two
              different remainders r and s, that is <code>count[r] * count[s]</code> pairs; count each such pair of classes once, for example
              only when r &lt; s.
            </p>
            <p>
              Remainder 0 pairs with itself, and so does k / 2 when k is even. A class of c numbers paired with itself gives c · (c − 1) / 2
              pairs. Python&rsquo;s <code>%</code> already gives remainders from 0 to k − 1 for negative numbers.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`count = how many numbers have each remainder v % k
total = 0
for each remainder r in count:
    s = (k - r) % k
    if r < s:  total += count[r] * count[s]
    if r == s: total += count[r] * (count[r] - 1) // 2
return total`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The footbridge, 10¹⁸ steps",
    fn: "ways_mod",
    lessons: [3],
    starter: `def ways_mod(n, steps, m):
    # Return the number of ways to go up exactly
    # n steps with moves from the list steps,
    # modulo m.
    pass
`,
    statement: (
      <>
        <p>
          RECR-P2 counted the ways to go up a footbridge of <code>n</code> steps with moves of 1, 2 or 3. Now the allowed moves are given in the
          list <code>steps</code>, and <code>n</code> can be enormous. Return the number of different sequences of moves that end exactly at the
          top, modulo <code>m</code> (the remainder after dividing by <code>m</code>).
        </p>
        <CodeBlock
          code={`ways_mod(4, [1, 2, 3], 1000)     # 7
ways_mod(10, [1, 2], 10 ** 9)    # 89
ways_mod(7, [2], 100)            # 0
ways_mod(0, [1, 2, 3], 1000)     # 1`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>n</code> is from 0 to 10¹⁸ (a 1 followed by 18 zeros). <code>steps</code> holds 1 to 10 different moves, each from 1 to 10. <code>m</code> is from 1 to
            about 10¹⁸.
          </li>
          <li>A loop over every step is far too slow for n = 10¹⁸. The big tests have 2 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Let w(n) be the answer. Then w(n) is the sum of w(n − s) over the allowed moves s, with w(0) = 1 and w of a negative number 0. This
            is a linear rule over the last k = max(steps) values: lesson 3 turns such a rule into a k × k matrix.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep the column (w(n), w(n − 1), …, w(n − k + 1)). Build a k × k matrix M whose top row has a 1 in column s − 1 for each allowed
              move s, and whose row i (for i from 1 to k − 1) has a single 1 in column i − 1, which shifts the values down.
            </p>
            <p>
              The starting column, for n = 0, is (1, 0, …, 0). So w(n) is the top-left entry of Mⁿ (M to the power n). Raise M to the power n
              by squaring, taking <code>% m</code> after every product. Remember that the answer for n = 0 must also be reduced modulo m.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`k = max(steps)
M = k x k zeros
for s in steps: M[0][s - 1] = 1
for i in 1 .. k-1: M[i][i - 1] = 1
R = identity matrix (k x k)
while n > 0:
    if n is odd: R = R * M  (mod m)
    M = M * M  (mod m)
    n = n // 2
return R[0][0] % m`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Primes in a window",
    fn: "primes_between",
    lessons: [4],
    starter: `def primes_between(lo, hi):
    # Return the list of primes p with
    # lo <= p <= hi, smallest first.
    pass
`,
    statement: (
      <>
        <p>
          Return every prime <code>p</code> with <code>lo &lt;= p &lt;= hi</code>, as a list from smallest to largest.
        </p>
        <CodeBlock
          code={`primes_between(10, 30)    # [11, 13, 17, 19, 23, 29]
primes_between(91, 91)    # []: 91 = 7 * 13
primes_between(0, 2)      # [2]
primes_between(30, 10)    # []`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>hi</code> is at most 10¹² (a million million), and the window <code>hi - lo</code> is at most about 2,000,000. <code>lo</code>{" "}
            may be below 2, or bigger than <code>hi</code>.
          </li>
          <li>
            A sieve up to <code>hi</code> needs far too much memory, and testing each number by trial division is far too slow. The big tests
            have 4 seconds each.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Every composite number in the window has a prime factor at most √hi, which is at most 10⁶. Find those small primes first, then use
            them on the window only.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sieve the primes up to <code>math.isqrt(hi)</code> (lesson 4). Then make a <code>bytearray</code> of 1s, one entry per number from
              lo to hi, where entry i stands for lo + i.
            </p>
            <p>
              For each small prime p, the first multiple to cross out is the larger of p · p and lo rounded up to a multiple of p, which is{" "}
              <code>(lo + p - 1) // p * p</code>. Cross out every p-th entry from there with one slice assignment. Treat lo below 2 as 2.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`lo = max(lo, 2)
if hi < lo: return []
small = primes up to isqrt(hi)        # plain sieve
mark = [1] * (hi - lo + 1)            # bytearray
for p in small:
    start = max(p * p, (lo + p - 1) // p * p)
    cross out mark[start - lo], every p-th, up to hi
return [lo + i for each i with mark[i] == 1]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "The Chinese remainder theorem",
    fn: "crt",
    lessons: [5],
    starter: `def crt(rems, mods):
    # Return the smallest x >= 0 with
    # x % mods[i] == rems[i] for every i,
    # or None if there is no such x.
    pass
`,
    statement: (
      <>
        <p>
          Return the smallest whole number <code>x</code>, 0 or more, with <code>x % mods[i] == rems[i]</code> for every position{" "}
          <code>i</code>. If no such number exists, return <code>None</code>. The moduli may share factors.
        </p>
        <CodeBlock
          code={`crt([2, 3], [3, 5])         # 8
crt([2, 3, 2], [3, 5, 7])   # 23
crt([1, 3], [4, 6])         # 9
crt([1, 2], [4, 6])         # None: odd and even
crt([], [])                 # 0`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 2,000 conditions. Each modulus is from 1 to about 10¹⁸ (a 1 followed by 18 zeros), and each remainder is from 0 to its modulus minus 1. The answer can have
            thousands of digits; Python&rsquo;s whole numbers hold it exactly.
          </li>
          <li>
            <code>pow(a, -1, m)</code> and <code>math.gcd</code> are allowed. <code>pow(a, -1, m)</code> raises <code>ValueError</code> when a
            and m share a factor, so divide by the gcd first.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Combine the conditions one at a time. After some of them, the numbers that meet all of them so far are x, x + L, x + 2L, …, where L
            is the lcm of the moduli used so far. Start with x = 0 and L = 1.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              To add the condition (r, n), look for t with (x + L · t) % n == r, that is, L · t ≡ r − x (mod n). Let g = gcd(L, n). If g
              does not divide r − x, return None.
            </p>
            <p>
              Otherwise divide by g: (L / g) · t ≡ (r − x) / g modulo n / g, and L / g now has an inverse modulo n / g. Then the new x is x + L
              · t, and the new L is L · (n / g), which is lcm(L, n). Keep x below L.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`x, L = 0, 1
for r, n in zip(rems, mods):
    g = gcd(L, n)
    if (r - x) % g != 0: return None
    n2 = n // g
    t = (r - x) // g * inverse(L // g, n2) % n2
    x = x + L * t
    L = L * n2
    x = x % L
return x`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Combinations modulo a prime",
    fn: "comb_mod",
    lessons: [6],
    blocked: ["math.comb", "math.factorial", "math.perm"],
    starter: `def comb_mod(queries, p):
    # queries is a list of (n, k) pairs.
    # Return the list of C(n, k) % p, in order.
    pass
`,
    statement: (
      <>
        <p>
          For each pair <code>(n, k)</code> in <code>queries</code>, work out C(n, k), the number of ways to choose k items from n, modulo the
          prime <code>p</code>. Return the answers as a list, in the same order. C(n, k) is 0 when k is bigger than n.
        </p>
        <CodeBlock
          code={`comb_mod([(5, 2), (6, 3), (4, 0)], 1_000_000_007)
# [10, 20, 1]
comb_mod([(3, 5)], 1_000_000_007)    # [0]`}
        />
        <p>
          <code>math.comb</code>, <code>math.factorial</code> and <code>math.perm</code> are switched off. <code>pow</code> is allowed.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 100,000 queries, with 0 ≤ k and n up to 1,000,000. <code>p</code> is a prime bigger than every n.
          </li>
          <li>Working out each answer from scratch is too slow for 100,000 queries. The big tests have 6 seconds each.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            C(n, k) = n! / (k! · (n − k)!). Dividing modulo p means multiplying by an inverse (lesson 5). What could you work out once and use for
            every query?
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Let N be the largest n in the queries. Build <code>fact[i] = i! % p</code> for i from 0 to N with one loop.
            </p>
            <p>
              For the inverses, compute <code>inv[N] = pow(fact[N], p - 2, p)</code> (Fermat, lesson 5), then go down:{" "}
              <code>inv[i - 1] = inv[i] * i % p</code>, because 1 / (i − 1)! = i / i!. Each query is then{" "}
              <code>fact[n] * inv[k] * inv[n - k] % p</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`N = largest n (0 if there are no queries)
fact[0..N]: fact[i] = fact[i-1] * i % p
inv[N] = pow(fact[N], p - 2, p)
for i from N down to 1: inv[i-1] = inv[i] * i % p
answer for (n, k):
    0 if k > n
    else fact[n] * inv[k] % p * inv[n-k] % p`}
          />
        ),
      },
    ],
    tests: t6,
  },
  {
    n: 7,
    title: "A fair sample from a stream",
    fn: "sample",
    lessons: [7],
    starter: `def sample(stream, k, rand):
    # Reservoir sampling: return a list of k
    # items of the stream. rand(m) returns a
    # whole number from 0 to m - 1.
    pass
`,
    statement: (
      <>
        <p>
          Choose <code>k</code> items fairly from <code>stream</code>, which can be read only once, item by item, and whose length is not known
          in advance. Use reservoir sampling exactly as lesson 7 describes, with the random function you are given:
        </p>
        <ul>
          <li>keep the first <code>k</code> items, in slots 0 to k − 1, in order;</li>
          <li>
            for each later item, the one at position <code>i</code> (counting from 0), call <code>rand(i + 1)</code> once to get{" "}
            <code>j</code> from 0 to i; if <code>j &lt; k</code>, put the item in slot <code>j</code>.
          </li>
        </ul>
        <p>
          Return the list of slots. If the stream has fewer than <code>k</code> items, return all of them. Do not call <code>rand</code> for
          the first <code>k</code> items.
        </p>
        <CodeBlock
          code={`# rand returns 1, 0, 3, 2 in turn
sample(iter("abcdef"), 2, rand)   # ['d', 'c']
sample(iter([7, 8]), 5, rand)     # [7, 8]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            The stream may be a generator: it has no <code>len()</code>, and it can be looped over only once. It has up to 300,000 items.
          </li>
          <li>
            The tests pass fixed &ldquo;random&rdquo; answers, so the right sample is known exactly. Two tests try every possible run of answers
            and check that every set of items is chosen equally often.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            Loop over the stream with <code>enumerate</code>, so you know each item&rsquo;s position i. The first k items always go in; after
            that, one call to <code>rand</code> decides each item.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a list <code>kept</code>. While i &lt; k, append the item. Otherwise call <code>j = rand(i + 1)</code>; if j &lt; k, set{" "}
              <code>kept[j]</code> to the item.
            </p>
            <p>
              The argument must be i + 1 (there are i + 1 items so far), not i: with i, the chance would be k / i, too big, and the last item
              read would be favoured.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`kept = []
for i, item in enumerate(stream):
    if i < k:
        kept.append(item)
    else:
        j = rand(i + 1)
        if j < k: kept[j] = item
return kept`}
          />
        ),
      },
    ],
    tests: t7,
  },
];
