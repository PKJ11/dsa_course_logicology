// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def power_mod(x, n, m):
    if n == 0:
        return 1 % m                  # 1 % 1 is 0
    half = power_mod(x, n // 2, m)    # one call, not two
    result = half * half % m
    if n % 2 == 1:
        result = result * (x % m) % m
    return result
`;

export const notes = [
  "With half = x to the power n // 2, xⁿ is half × half when n is even, and half × half × x when n is odd. Each call halves n, so there are about log₂ n + 1 calls: about 60 for n = 10¹⁸ (a 1 followed by 18 zeros), and the stack is only that deep.",
  "Taking % m after every multiplication keeps the numbers below m × m, so each multiplication is a small, fast step. The remainder at the end is the same, because (a × b) % m = ((a % m) × (b % m)) % m.",
  "The base case returns `1 % m`, not 1. For m = 1 every answer is 0.",
  "`half` is computed once and squared. Writing `power_mod(x, n // 2, m) * power_mod(x, n // 2, m)` makes two calls at every level, which adds up to about n calls again.",
  "The same idea as a loop reads the bits of n from the lowest: square x each pass, and multiply it into the result when the bit is 1. Python's `pow(x, n, m)` works this way.",
];
