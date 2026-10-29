// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def multiply(x, y):
    def school(a, b):               # the O(n²) method, for short parts
        res = [0] * (len(a) + len(b) - 1)
        for i, d in enumerate(a):
            if d:
                for j, e in enumerate(b):
                    res[i + j] += d * e
        return res

    def kara(a, b):                 # same length; lowest digit first; no carries
        n = len(a)
        if n <= 32:
            return school(a, b)
        m = n // 2
        a0, a1, b0, b1 = a[:m], a[m:], b[:m], b[m:]
        z0 = kara(a0, b0)           # low × low
        z2 = kara(a1, b1)           # high × high
        s = [u + v for u, v in zip(a1, a0 + [0])]   # a1 may be one longer
        t = [u + v for u, v in zip(b1, b0 + [0])]
        z1 = kara(s, t)             # (low + high)(low + high)
        for k, v in enumerate(z0):
            z1[k] -= v
        for k, v in enumerate(z2):
            z1[k] -= v              # now the middle part: a0·b1 + a1·b0
        res = [0] * (2 * n - 1)
        for k, v in enumerate(z0):
            res[k] += v
        for k, v in enumerate(z1):
            res[k + m] += v
        for k, v in enumerate(z2):
            res[k + 2 * m] += v
        return res

    a = x[::-1]                     # position k is worth 10 ** k
    b = y[::-1]
    n = max(len(a), len(b))
    a += [0] * (n - len(a))
    b += [0] * (n - len(b))
    out = []
    carry = 0
    for v in kara(a, b):            # carry once, at the end
        carry, d = divmod(v + carry, 10)
        out.append(d)
    while carry:
        carry, d = divmod(carry, 10)
        out.append(d)
    while len(out) > 1 and out[-1] == 0:
        out.pop()
    return out[::-1]
`;

export const notes = [
  "Reversed, a digit list is the list of coefficients of a polynomial in 10: entry k is worth 10ᵏ. Multiplying the polynomials and carrying once at the end gives the product. Entries in between may be far above 9; Python integers do not overflow.",
  "With halves a0, a1 and b0, b1 (low parts first), Karatsuba's three products are z0 = a0·b0, z2 = a1·b1 and z1 = (a0 + a1)(b0 + b1) − z0 − z2, which equals a0·b1 + a1·b0. They go in at positions 0, m and 2m, because the high halves are worth 10ᵐ. No carrying inside the recursion means the subtraction never needs to borrow.",
  "When n is odd, the high half is one longer; padding the low half with one 0 lets the sums be added position by position. The parts stay the same length, so the recursion never has to pad again.",
  "Below 32 digits the schoolbook loop is faster than more recursion, because each call has a fixed cost. With this cutoff, two 12,000-digit numbers take about 10 million digit products instead of 144 million. T(n) = 3 T(n/2) + O(n) = O(n to the power log₂ 3), about n¹·⁵⁸⁵.",
];
