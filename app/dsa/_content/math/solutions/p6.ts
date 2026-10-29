// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def comb_mod(queries, p):
    top = max((n for n, k in queries), default=0)
    fact = [1] * (top + 1)
    for i in range(1, top + 1):
        fact[i] = fact[i - 1] * i % p
    inv = [1] * (top + 1)              # inv[i] = 1 / i! modulo p
    inv[top] = pow(fact[top], p - 2, p)
    for i in range(top, 0, -1):
        inv[i - 1] = inv[i] * i % p    # 1/(i-1)! = i / i!
    out = []
    for n, k in queries:
        if k < 0 or k > n:
            out.append(0)
        else:
            out.append(fact[n] * inv[k] % p * inv[n - k] % p)
    return out
`;

export const notes = [
  "C(n, k) = n! / (k! · (n − k)!). Modulo a prime p bigger than n, none of these factorials is a multiple of p, so each has an inverse, and dividing means multiplying by it (lesson 5).",
  "The factorials up to the largest n take one loop. For the inverses, one `pow(fact[top], p - 2, p)` gives 1/top! by Fermat's rule, and each smaller one follows from 1/(i − 1)! = i · (1/i!). So all the inverses cost one fast power plus one multiplication each.",
  "After that, each query is two multiplications: O(N + q) in all, about 0.3 seconds for N = 10⁶ and 100,000 queries. Computing each C(n, k) from scratch could take up to 600,000 steps per query.",
  "The prime is an argument, so nothing is fixed to 1,000,000,007. If p could be at most n, Lucas's theorem (lesson 6) would be needed instead.",
];
