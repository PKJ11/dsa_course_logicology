// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from math import gcd

def crt(rems, mods):
    x, L = 0, 1             # every x + t*L meets the conditions so far
    for r, n in zip(rems, mods):
        g = gcd(L, n)
        if (r - x) % g:
            return None     # the conditions disagree modulo g
        n2 = n // g
        # x + L*t = r (mod n)  ->  (L/g) * t = (r - x)/g (mod n/g)
        t = (r - x) // g * pow(L // g, -1, n2) % n2 if n2 > 1 else 0
        x += L * t
        L *= n2             # L is now lcm of the moduli so far
        x %= L
    return x
`;

export const notes = [
  "After some conditions, the numbers meeting all of them are x, x + L, x + 2L, …, where L is their lcm. With no conditions, x = 0 and L = 1. Each new condition (r, n) picks out some of those numbers.",
  "We need t with L·t ≡ r − x (mod n). If g = gcd(L, n) does not divide r − x, no t exists, because L·t − (r − x) would have to be a multiple of n, hence of g. Otherwise divide by g: L/g and n/g have no common factor, so L/g has an inverse modulo n/g (lesson 5).",
  "Then x + L·t meets the new condition, and the answers repeat every L·(n/g) = lcm(L, n). `x %= L` keeps the smallest one. When n/g is 1, the new condition adds nothing, and t = 0.",
  "If the moduli were assumed to have no common factor, `pow(L, -1, n)` would raise ValueError on the tests whose moduli share factors. The numbers grow to thousands of digits, but there are only 2,000 rounds of a few big-number operations.",
];
