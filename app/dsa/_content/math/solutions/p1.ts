// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def pay_ways(a, b, amount):
    # extended Euclid: r0 = gcd(a, b) = a*x0 + b*(something)
    r0, r1, x0, x1 = a, b, 1, 0
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        x0, x1 = x1, x0 - q * x1
    g = r0
    if amount % g:
        return 0                       # every a*x + b*y is a multiple of g
    a, b, amount = a // g, b // g, amount // g
    first = x0 * amount % b            # smallest x >= 0 that works
    if a * first > amount:
        return 0                       # even that x leaves y below 0
    return (amount - a * first) // (a * b) + 1
`;

export const notes = [
  "Every a·x + b·y is a multiple of g = gcd(a, b), so if g does not divide the amount there is no way at all. Otherwise divide everything by g; the ways do not change.",
  "Now gcd(a, b) = 1, and the extended algorithm gave a · x0 + b · y0 = 1. So a · x0 leaves remainder 1 when divided by b, and a · (x0 · amount) leaves the same remainder as the amount. That means x = x0 · amount works modulo b, and `x0 * amount % b` is the smallest such x that is 0 or more (Python's % is never negative here).",
  "The other good x are first + b, first + 2b, … (lesson 1). Each needs y = (amount − a·x) / b ≥ 0, that is, a·x ≤ amount. Going from one to the next uses a·b more of the amount, so the count is `(amount - a*first) // (a*b) + 1`.",
  "Only the x part of the extended algorithm is needed, so y is not tracked. The loop makes O(log min(a, b)) steps: about 80 for two Fibonacci numbers near 10¹⁷.",
];
