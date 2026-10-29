import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_math import CLIMB, COMB, CRT, PAIRS, PAY, PRIMES, SAMPLE

S = "math"


# Pseudo-random numbers built inside a test's args (no random module, so CPython and Pyodide agree).
def spread(n, mod, sub=0, seed=1, start=0):
    return f"[(k * 6364136223846793005 + {seed} * 1442695040888963407) % 2 ** 64 % {mod} - {sub} for k in range({start}, {start + n})]"


# ---------- P1: paying with two coins ----------

build(S, 1, "pay_ways", [
    {"name": "The example", "args": "(3, 5, 30)", "show": "pay_ways(3, 5, 30)",
     "why": "3: ten 3s; five 3s and three 5s; six 5s. The number of 3s goes up by 5 from one way to the next."},
    {"name": "The gcd does not divide", "args": "(4, 6, 9)", "show": "pay_ways(4, 6, 9)",
     "why": "0. Any number of 4s and 6s adds up to an even amount, because gcd(4, 6) = 2 divides both coins. 9 is odd."},
    {"name": "Too small to pay", "args": "(3, 5, 7)", "show": "pay_ways(3, 5, 7)",
     "why": "0. gcd(3, 5) = 1 divides 7, so 3·x + 5·y = 7 has whole-number solutions (x = 4, y = −1), but none with both x and y at least 0. "
            "7 = 3·5 − 3 − 5 is the largest amount these two coins cannot pay."},
    {"name": "Nothing to pay", "args": "(3, 5, 0)", "show": "pay_ways(3, 5, 0)", "why": "1: no coins at all."},
    {"name": "Two equal coins", "args": "(4, 4, 12)", "show": "pay_ways(4, 4, 12)",
     "why": "4: (0, 3), (1, 2), (2, 1), (3, 0). The two coins are counted separately, even when they are worth the same."},
    {"name": "A coin of 1", "args": "(1, 7, 20)", "show": "pay_ways(1, 7, 20)", "why": "3: zero, one or two 7s, and 1s for the rest."},
    {"name": "A common divisor", "args": "(6, 10, 60)", "show": "pay_ways(6, 10, 60)",
     "why": "3. Divide everything by gcd(6, 10) = 2: the ways to pay 30 with 3 and 5, as in the first test."},
    {"name": "Every amount up to 40", "args": "()", "expr": "[pay_ways(3, 5, c) for c in range(41)]", "show": "[pay_ways(3, 5, c) for c in range(41)]",
     "why": "1, 0, 0, 1, 0, 1, 1, 0, 1, … From 8 upwards every amount can be paid, and the count grows by 1 every 15."},
    {"name": "Big coins", "args": "(10 ** 9 + 7, 10 ** 9 + 9, 10 ** 18)", "timeout": 2000, "show": "pay_ways(10 ** 9 + 7, 10 ** 9 + 9, 10 ** 18)",
     "why": "Trying every number of the first coin means up to a billion tries. Find one solution with the extended Euclidean algorithm, then count the rest with one division (lesson 1)."},
    {"name": "Many ways", "args": "(2, 3, 10 ** 18)", "timeout": 2000, "show": "pay_ways(2, 3, 10 ** 18)",
     "why": "About 1.7 × 10¹⁷ ways, far too many to list. The ways form a list where the number of 2s goes up by 3 each time, so one division counts them."},
    {"name": "Huge numbers", "args": "()", "timeout": 2000,
     "expr": "[pay_ways(123_456_789_123, 987_654_321_987, 10 ** 30), pay_ways(123_456_789_123, 987_654_321_987, 10 ** 30 - 1)]",
     "show": "[pay_ways(123456789123, 987654321987, 10 ** 30), pay_ways(123456789123, 987654321987, 10 ** 30 - 1)]",
     "why": "[0, 24603750]. Both coins are multiples of 3 (their gcd is 3). 10³⁰ is not a multiple of 3, so it cannot be paid at all; 10³⁰ − 1 is, and it has about 25 million ways."},
    {"name": "Fibonacci coins", "args": "(23_416_728_348_467_685, 37_889_062_373_143_906, 10 ** 36)", "timeout": 2000,
     "show": "pay_ways(F(80), F(81), 10 ** 36)",
     "why": "Two Fibonacci numbers in a row are the slowest case for Euclid's algorithm: about 80 steps here. Still instant."},
], trusted=PAY)


# ---------- P2: pairs that add up to a multiple of k ----------

build(S, 2, "pairs_to_multiple", [
    {"name": "The example", "args": "([1, 2, 3, 4, 5], 3)", "show": "pairs_to_multiple([1, 2, 3, 4, 5], 3)",
     "why": "4: 1 + 2, 1 + 5, 2 + 4 and 4 + 5. The remainders are 1, 2, 0, 1, 2, and a pair works when its remainders add up to 0 or 3."},
    {"name": "No values", "args": "([], 5)", "show": "pairs_to_multiple([], 5)", "why": "0: there are no pairs."},
    {"name": "k is 1", "args": "([4, 9, 2, 7], 1)", "show": "pairs_to_multiple([4, 9, 2, 7], 1)",
     "why": "6: every number is a multiple of 1, so every one of the 4 · 3 / 2 pairs counts."},
    {"name": "All remainder 0", "args": "([3, 6, 9, 12], 3)", "show": "pairs_to_multiple([3, 6, 9, 12], 3)",
     "why": "6. Values with remainder 0 pair with each other: c values give c · (c − 1) / 2 pairs, not c · c."},
    {"name": "Remainder k/2", "args": "([2, 4, 6, 8], 4)", "show": "pairs_to_multiple([2, 4, 6, 8], 4)",
     "why": "2: 2 + 6 and 4 + 8. Remainder 2 pairs with itself when k is 4, like remainder 0. Count each such pair once."},
    {"name": "Negative values", "args": "([-1, 1, -5, 7], 6)", "show": "pairs_to_multiple([-1, 1, -5, 7], 6)",
     "why": "3: −1 + 1 = 0, −1 + 7 = 6 and −5 + −1 = −6. In Python, -1 % 6 is 5, so −1 pairs with remainder 1, as it should."},
    {"name": "Repeated value", "args": "([5] * 10, 10)", "show": "pairs_to_multiple([5] * 10, 10)", "why": "45: every pair of the ten 5s adds up to 10."},
    {"name": "Big values", "args": f"({spread(40, 10 ** 30, sub=5 * 10 ** 29, seed=3)}, 7)", "show": "pairs_to_multiple(40 values up to 10³⁰, 7)",
     "why": "Only the remainders matter, so huge values are no harder than small ones."},
    {"name": "2,000 values", "args": f"({spread(2000, 10 ** 9, seed=5)}, 97)", "show": "pairs_to_multiple(2,000 values, 97)",
     "why": "About 2 million pairs: checking every pair still finishes at this size."},
    {"name": "200,000 values", "args": f"({spread(200_000, 10 ** 12, sub=5 * 10 ** 11, seed=7)}, 1_000_003)", "timeout": 3000,
     "show": "pairs_to_multiple(200,000 values, 1,000,003)",
     "why": "About 20 billion pairs: checking every pair is far too slow. Count how many values have each remainder; then each remainder r pairs with remainder (k − r) % k."},
    {"name": "k is 2", "args": f"({spread(200_000, 10 ** 9, seed=11)}, 2)", "timeout": 3000, "show": "pairs_to_multiple(200,000 values, 2)",
     "why": "About 10 billion pairs: even plus even and odd plus odd. Two classes, each paired with itself."},
    {"name": "All multiples of 7", "args": "([7 * k for k in range(200_000)], 7)", "timeout": 3000, "show": "pairs_to_multiple([0, 7, 14, …], 7)",
     "why": "199,999 · 200,000 / 2 = 19,999,900,000 pairs, all with remainder 0."},
], trusted=PAIRS)


# ---------- P3: ways up a footbridge, n up to 10^18 ----------

build(S, 3, "ways_mod", [
    {"name": "The example", "args": "(4, [1, 2, 3], 1000)", "show": "ways_mod(4, [1, 2, 3], 1000)",
     "why": "7: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2, 1+3, 3+1. The same answer as RECR-P2."},
    {"name": "No steps to go up", "args": "(0, [1, 2, 3], 1000)", "show": "ways_mod(0, [1, 2, 3], 1000)",
     "why": "1: the empty sequence of moves. A matrix to the power 0 is the identity matrix (1s on the diagonal)."},
    {"name": "m is 1", "args": "(5, [1, 2], 1)", "show": "ways_mod(5, [1, 2], 1)", "why": "0: every whole number leaves remainder 0 when divided by 1."},
    {"name": "Fibonacci", "args": "(10, [1, 2], 10 ** 9)", "show": "ways_mod(10, [1, 2], 10 ** 9)",
     "why": "89. With moves of 1 and 2, the counts are the Fibonacci numbers: 1, 1, 2, 3, 5, 8, …"},
    {"name": "Only 2s, odd n", "args": "(7, [2], 100)", "show": "ways_mod(7, [2], 100)", "why": "0: moves of 2 never reach an odd step."},
    {"name": "Only 2s, even n", "args": "(8, [2], 100)", "show": "ways_mod(8, [2], 100)", "why": "1: four moves of 2."},
    {"name": "Moves of 3 and 5", "args": "(30, [3, 5], 10 ** 9)", "show": "ways_mod(30, [3, 5], 10 ** 9)",
     "why": "The matrix is 5 × 5, the size of the largest move. Moves 1, 2 and 4 are not allowed, so their places in the top row are 0."},
    {"name": "The first 20", "args": "()", "expr": "[ways_mod(n, [1, 2, 3], 10 ** 9) for n in range(20)]",
     "show": "[ways_mod(n, [1, 2, 3], 10 ** 9) for n in range(20)]",
     "why": "1, 1, 2, 4, 7, 13, 24, …: each count is the sum of the three before it."},
    {"name": "A million steps", "args": "(10 ** 6, [1, 2, 3], 1_000_000_007)", "timeout": 2000, "show": "ways_mod(10 ** 6, [1, 2, 3], 1_000_000_007)",
     "why": "A loop over every step still finishes here, if it takes the remainder each time. Without the remainder, the numbers grow to about 265,000 digits."},
    {"name": "10¹⁸ steps", "args": "(10 ** 18, [1, 2, 3], 1_000_000_007)", "timeout": 2000, "show": "ways_mod(10 ** 18, [1, 2, 3], 1_000_000_007)",
     "why": "A loop over 10¹⁸ steps never finishes. Raise the 3 × 3 matrix to the power n by squaring: about 60 squarings and at most 60 more products (lesson 3)."},
    {"name": "Ten moves, a huge m", "args": "(10 ** 18, list(range(1, 11)), 10 ** 18 + 9)", "timeout": 2000,
     "show": "ways_mod(10 ** 18, [1, 2, …, 10], 10 ** 18 + 9)",
     "why": "A 10 × 10 matrix and products near 10³⁶. Python's whole numbers hold them exactly; take the remainder after every product."},
    {"name": "Unusual moves", "args": "(2 ** 60 - 1, [1, 4, 9], 998_244_353)", "timeout": 2000, "show": "ways_mod(2 ** 60 - 1, [1, 4, 9], 998244353)",
     "why": "n has 60 bits, all 1s, so every squaring is also multiplied into the answer."},
    {"name": "The last digit of a Fibonacci number", "args": "(10 ** 18, [1, 2], 10)", "timeout": 2000, "show": "ways_mod(10 ** 18, [1, 2], 10)",
     "why": "The last digit of the Fibonacci number F(10¹⁸ + 1). Small moduli work the same way."},
], trusted=CLIMB)


# ---------- P4: primes in a window ----------

build(S, 4, "primes_between", [
    {"name": "The example", "args": "(10, 30)", "show": "primes_between(10, 30)", "why": "[11, 13, 17, 19, 23, 29]."},
    {"name": "Empty window", "args": "(30, 10)", "show": "primes_between(30, 10)", "why": "[]: lo is bigger than hi, so no numbers are in the window."},
    {"name": "Below 2", "args": "()", "expr": "[primes_between(0, 1), primes_between(-10, 2)]", "show": "[primes_between(0, 1), primes_between(-10, 2)]",
     "why": "[[], [2]]. 0 and 1 are not prime, and neither are negative numbers. 2 is the smallest prime."},
    {"name": "One prime", "args": "(97, 97)", "show": "primes_between(97, 97)", "why": "[97]: lo and hi are both included."},
    {"name": "One composite", "args": "(91, 91)", "show": "primes_between(91, 91)", "why": "[]: 91 = 7 × 13."},
    {"name": "A square of a prime", "args": "(120, 130)", "show": "primes_between(120, 130)",
     "why": "[127]. 121 = 11 × 11: when you cross out the multiples of a prime p, start from p · p, and include it."},
    {"name": "Up to 100", "args": "(1, 100)", "show": "primes_between(1, 100)", "why": "The 25 primes below 100."},
    {"name": "Near a billion", "args": "(10 ** 9, 10 ** 9 + 1000)", "show": "primes_between(10 ** 9, 10 ** 9 + 1000)",
     "why": "Crossing out needs the primes up to √(10⁹ + 1000), about 31,623, and their multiples inside the window."},
    {"name": "Up to two million", "args": "(0, 2_000_000)", "timeout": 4000,
     "expr": "(lambda p: [len(p), p[:5], p[-3:]])(primes_between(*args))",
     "show": "primes_between(0, 2_000_000); shows [how many, the first 5, the last 3]",
     "why": "148,933 primes. Testing each number by trial division takes about 200 million divisions. A sieve crosses out multiples instead: about n log log n steps (lesson 4)."},
    {"name": "A window below 10¹²", "args": "(10 ** 12 - 10 ** 6, 10 ** 12)", "timeout": 4000,
     "expr": "(lambda p: [len(p), p[:3], p[-3:]])(primes_between(*args))",
     "show": "primes_between(10 ** 12 - 10 ** 6, 10 ** 12); shows [how many, the first 3, the last 3]",
     "why": "A list of 10¹² flags does not fit in memory. Sieve the primes up to √hi = 10⁶ first, then cross out their multiples in the window only: a segmented sieve."},
    {"name": "A thin window", "args": "(999_999_000_000, 999_999_100_000)", "timeout": 4000,
     "expr": "(lambda p: [len(p), sum(p) % 1_000_000_007])(primes_between(*args))",
     "show": "primes_between(999,999,000,000, 999,999,100,000); shows [how many, their sum's remainder after dividing by 1,000,000,007]",
     "why": "100,001 numbers. For most primes p up to 10⁶ the window holds no multiple at all, or one: find the first multiple with a division, not with a loop."},
    {"name": "2 only", "args": "(2, 2)", "show": "primes_between(2, 2)", "why": "[2]: the only even prime."},
], trusted=PRIMES)


# ---------- P5: the Chinese remainder theorem ----------

BIG_MODS = "[10 ** 6 + k for k in range(2000)]"
BIG_X = "7 ** 6000 + 12345"
build(S, 5, "crt", [
    {"name": "The example", "args": "([2, 3], [3, 5])", "show": "crt([2, 3], [3, 5])",
     "why": "8: 8 % 3 = 2 and 8 % 5 = 3. Every 15 (3 × 5) numbers there is exactly one such x."},
    {"name": "Sunzi's problem", "args": "([2, 3, 2], [3, 5, 7])", "show": "crt([2, 3, 2], [3, 5, 7])",
     "why": "23. This puzzle is from a Chinese book of about the 4th century, which gave the method its name."},
    {"name": "No rules", "args": "([], [])", "show": "crt([], [])", "why": "0: with no rules, every x works, and the smallest is 0."},
    {"name": "Moduli with a common factor", "args": "([1, 3], [4, 6])", "show": "crt([1, 3], [4, 6])",
     "why": "9. 4 and 6 share the factor 2. Both rules say x is odd, so they agree, and the answers repeat every lcm(4, 6) = 12."},
    {"name": "Rules that disagree", "args": "([1, 2], [4, 6])", "show": "crt([1, 2], [4, 6])",
     "why": "None. x % 4 = 1 says x is odd; x % 6 = 2 says x is even. When the moduli share a factor g, the remainders must agree modulo g."},
    {"name": "Modulus 1", "args": "([0, 4], [1, 9])", "show": "crt([0, 4], [1, 9])", "why": "4. Every number leaves remainder 0 when divided by 1, so that rule changes nothing."},
    {"name": "The same modulus twice", "args": "()", "expr": "[crt([3, 3], [7, 7]), crt([3, 4], [7, 7])]", "show": "[crt([3, 3], [7, 7]), crt([3, 4], [7, 7])]",
     "why": "[3, None]: the same rule twice is fine; two different remainders for the same modulus cannot both hold."},
    {"name": "One modulus divides another", "args": "([5, 1], [12, 4])", "show": "crt([5, 1], [12, 4])",
     "why": "5. 5 % 12 = 5 and 5 % 4 = 1, so the second rule follows from the first."},
    {"name": "Five rules", "args": "([1, 2, 3, 4, 5], [2, 3, 5, 7, 11])", "show": "crt([1, 2, 3, 4, 5], [2, 3, 5, 7, 11])",
     "why": "Combine the rules one at a time: after each one, the answers so far are x, x + m, x + 2m, … where m is the lcm of the moduli used so far."},
    {"name": "Two moduli near 10¹⁸", "args": "([123_456_789_012_345_678, 987_654_321_098_765_432], [10 ** 18 + 3, 10 ** 18 + 9])", "timeout": 2000,
     "show": "crt([123456789012345678, 987654321098765432], [10 ** 18 + 3, 10 ** 18 + 9])",
     "why": "The answer is below about 10³⁶. Trying x = r, r + m, r + 2m, … would take up to 10¹⁸ tries; a modular inverse finds the right one at once (lesson 5)."},
    {"name": "2,000 rules", "args": f"([({BIG_X}) % n for n in {BIG_MODS}], {BIG_MODS})", "timeout": 3000,
     "expr": "(lambda x: [x % 1_000_000_007, x.bit_length(), all(x % n == r for r, n in zip(*args))])(crt(*args))",
     "show": "crt for the moduli 1,000,000 to 1,001,999 (many share factors); shows [x % 1,000,000,007, bit_length, are all rules met?]",
     "why": "The moduli share many factors, so a method that assumes they have no common factor fails here (pow(a, -1, n) raises ValueError when there is no inverse). Divide by the gcd first."},
    {"name": "2,000 rules, one wrong", "args": f"([({BIG_X}) % n + (k == 1000) for k, n in enumerate({BIG_MODS})], {BIG_MODS})", "timeout": 3000,
     "show": "crt for the same moduli, with one remainder changed by 1",
     "why": "None. Rule 1000 now disagrees with the others on some shared factor. Your code must notice when (r − x) is not divisible by the gcd."},
], trusted=CRT)


# ---------- P6: combinations modulo a prime ----------

BIG_Q = "[((k * 7919) % 1_000_001, (k * 104729) % 600_001) for k in range(100_000)]"
build(S, 6, "comb_mod", [
    {"name": "The example", "args": "([(5, 2), (6, 3), (4, 0)], 1_000_000_007)", "show": "comb_mod([(5, 2), (6, 3), (4, 0)], 1_000_000_007)",
     "why": "[10, 20, 1]. C(5, 2) = 5 · 4 / 2 = 10, and there is one way to choose nothing."},
    {"name": "More than n", "args": "([(3, 5)], 1_000_000_007)", "show": "comb_mod([(3, 5)], 1_000_000_007)",
     "why": "[0]: you cannot choose 5 items from 3."},
    {"name": "Nothing from nothing", "args": "([(0, 0)], 1_000_000_007)", "show": "comb_mod([(0, 0)], 1_000_000_007)", "why": "[1]: 0! = 1."},
    {"name": "Row 10", "args": "([(10, k) for k in range(11)], 1_000_000_007)", "show": "comb_mod([(10, 0), (10, 1), …, (10, 10)], 1_000_000_007)",
     "why": "Row 10 of Pascal's triangle: 1, 10, 45, 120, 210, 252, 210, … The row is the same read from either end."},
    {"name": "A big count", "args": "([(100, 50)], 1_000_000_007)", "show": "comb_mod([(100, 50)], 1_000_000_007)",
     "why": "C(100, 50) has 30 digits; this is its remainder. Dividing remainders is not allowed: multiply by the modular inverses of the factorials instead."},
    {"name": "Another prime", "args": "([(1000, 500), (999, 1), (12, 6)], 998_244_353)", "show": "comb_mod([(1000, 500), (999, 1), (12, 6)], 998_244_353)",
     "why": "The prime is an argument, so do not write 1,000,000,007 into your code."},
    {"name": "A small prime", "args": "([(1000, 3), (1008, 504), (500, 250)], 1009)", "show": "comb_mod([(1000, 3), (1008, 504), (500, 250)], 1009)",
     "why": "p = 1009 is still bigger than every n, so every factorial up to 1008 has an inverse."},
    {"name": "No queries", "args": "([], 1_000_000_007)", "show": "comb_mod([], 1_000_000_007)", "why": "[]."},
    {"name": "100,000 queries", "args": f"({BIG_Q}, 1_000_000_007)", "timeout": 6000,
     "expr": "(lambda r: [len(r), sum(r) % 1_000_000_007, r[:4], r[-3:]])(comb_mod(*args))",
     "show": "comb_mod(100,000 queries with n up to 1,000,000); shows [how many, sum % p, the first 4, the last 3]",
     "why": "Working each answer out from scratch costs up to 600,000 multiplications per query. Build the factorials and their inverses once (two loops of a million steps), then each query is two multiplications."},
    {"name": "The middle of row 10⁶", "args": "([(10 ** 6, 500_000), (10 ** 6, 1), (10 ** 6, 10 ** 6)], 1_000_000_007)", "timeout": 6000,
     "show": "comb_mod([(10 ** 6, 500000), (10 ** 6, 1), (10 ** 6, 10 ** 6)], 1_000_000_007)",
     "why": "C(10⁶, 500,000) has about 300,000 digits. Even computed once, the exact number is slow; the factorial remainders give it at once."},
], trusted=COMB)


# ---------- P7: a fair sample from a stream ----------

def lcg(seed):
    return f"(lambda s: lambda m: (s.__setitem__(0, (s[0] * 1103515245 + 12345) % 2147483648), s[0] % m)[1])([{seed}])"

def picks(lst):
    return f"(lambda it: lambda m: next(it) % m)(iter({lst}))"

FAIR = ("(lambda C: sorted(C.values()))(__import__('collections').Counter(frozenset(sample(iter({items}), {k}, "
        "(lambda it: lambda m: next(it) % m)(iter(seq)))) for seq in __import__('itertools').product({ranges})))")
build(S, 7, "sample", [
    {"name": "The example", "args": f"(iter('abcdef'), 2, {picks([1, 0, 3, 2])})", "show": "sample(iter('abcdef'), 2, rand), where rand returns 1, 0, 3, 2",
     "why": "['d', 'c']. a and b fill the two slots. c: rand(3) is 1, so c replaces slot 1. d: rand(4) is 0, so d replaces slot 0. e: rand(5) is 3, not below 2, so e is skipped. f: rand(6) is 2, skipped."},
    {"name": "Fewer items than k", "args": "(iter([7, 8]), 5, lambda m: 1 // 0)", "show": "sample(iter([7, 8]), 5, rand)",
     "why": "[7, 8]: every item is kept. rand must not be called for the first k items; here rand raises an error if it is called."},
    {"name": "k is 0", "args": f"(iter(range(10)), 0, {lcg(3)})", "show": "sample(iter(range(10)), 0, rand)", "why": "[]: a sample of no items."},
    {"name": "Which calls to rand", "args": "()",
     "expr": "(lambda calls: [sample(iter(range(7)), 3, lambda m: (calls.append(m), 0)[1]), calls])([])",
     "show": "sample(iter(range(7)), 3, rand), where rand records its argument and returns 0; shows [the sample, the arguments]",
     "why": "[[6, 1, 2], [4, 5, 6, 7]]: for item i (counting from 0) after the first k, call rand(i + 1) exactly once. Every answer 0 replaces slot 0."},
    {"name": "Every outcome, 5 items", "args": "()", "expr": FAIR.format(items="'abcde'", k=2, ranges="range(3), range(4), range(5)"),
     "show": "every possible run of rand for 5 items and k = 2; shows how often each pair of items is chosen",
     "why": "[6, 6, …, 6]: there are 3 × 4 × 5 = 60 runs, and each of the 10 pairs comes out in exactly 6. This is the proof that the sample is fair, checked by trying every run."},
    {"name": "Every outcome, 6 items", "args": "()", "expr": FAIR.format(items="range(6)", k=3, ranges="range(4), range(5), range(6)"),
     "show": "every possible run of rand for 6 items and k = 3; shows how often each set of 3 items is chosen",
     "why": "120 runs, and each of the 20 sets of 3 comes out in exactly 6. A rule such as \"replace with chance 1/2\" gives some sets more often."},
    {"name": "A hundred items", "args": f"(iter(range(100)), 5, {lcg(7)})", "show": "sample(iter(range(100)), 5, rand)",
     "why": "The test's rand gives a fixed list of answers, so the right sample is known exactly. If yours differs, check the order of the slots and the argument of rand."},
    {"name": "A generator", "args": f"((x * x for x in range(50)), 4, {lcg(11)})", "show": "sample((x * x for x in range(50)), 4, rand)",
     "why": "The stream is a generator: it has no len() and can be read only once. Loop over it one item at a time."},
    {"name": "300,000 items", "args": f"(iter(range(300_000)), 10, {lcg(13)})", "timeout": 3000, "show": "sample(iter(range(300_000)), 10, rand)",
     "why": "One call to rand per item and O(1) work each: about 300,000 steps. Keeping all the items costs memory you do not need."},
], trusted=SAMPLE)
