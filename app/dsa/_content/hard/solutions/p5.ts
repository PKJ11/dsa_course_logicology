// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `BASES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]

def is_prime(n):
    if n < 2:
        return False
    for p in BASES:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:                  # n - 1 = d * 2**s with d odd
        d //= 2
        s += 1
    for a in BASES:
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue                   # a does not prove anything
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False               # a is a witness: n is composite
    return True
`;

export const notes = [
  "Miller–Rabin with fixed bases (lesson 5). Small cases first: below 2 is not prime, and a number divisible by one of the bases is prime only if it is that base.",
  "n − 1 = d · 2^s with d odd. For each base a, x = a^d mod n. If x is 1 or n − 1, a proves nothing. Otherwise x is squared up to s − 1 times; reaching n − 1 means a proves nothing, and never reaching it means a is a witness: n is composite.",
  "For a prime n, every base passes, because modulo a prime only 1 and −1 square to 1. For composites, the 13 prime bases 2 to 41 are known (by computer search) to include a witness for every n below about 3.3 × 10²⁴, so the answer is exact in this range. The first 12 bases are not enough: 318,665,857,834,031,151,167,461 fools them all.",
  "Each base costs one pow(a, d, n) and at most s squarings: O(log n) multiplications of numbers of about 80 bits.",
];
