// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from itertools import compress
from math import isqrt

def primes_between(lo, hi):
    lo = max(lo, 2)
    if hi < lo:
        return []
    r = isqrt(hi)
    small = bytearray([1]) * (r + 1)   # plain sieve up to sqrt(hi)
    small[0] = small[1] = 0
    for p in range(2, isqrt(r) + 1):
        if small[p]:
            small[p * p::p] = bytes(len(range(p * p, r + 1, p)))
    mark = bytearray([1]) * (hi - lo + 1)   # mark[i] is for lo + i
    for p in compress(range(r + 1), small):
        start = max(p * p, (lo + p - 1) // p * p)
        if start <= hi:
            mark[start - lo::p] = bytes(len(range(start, hi + 1, p)))
    return list(compress(range(lo, hi + 1), mark))
`;

export const notes = [
  "A composite number up to hi has a prime factor at most √hi (lesson 4), so the primes up to `isqrt(hi)`, at most 10⁶, are enough to cross out every composite in the window. They come from a plain sieve.",
  "For each small prime p, the first multiple to cross out is lo rounded up to a multiple of p, `(lo + p - 1) // p * p`, but never below p·p: smaller multiples have a smaller factor, and starting below p·p could cross out p itself.",
  "Each crossing-out is one slice assignment in C. For most of the 78,498 small primes the window holds no multiple or one, so the work is about one division per small prime plus the window's own sieve.",
  "`itertools.compress(range(...), mark)` keeps the numbers whose mark is 1, also in C. Memory is about √hi + (hi − lo) bytes instead of hi bytes.",
];
