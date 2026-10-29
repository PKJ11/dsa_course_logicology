// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def wrap(x, w):
    u = x & ((1 << w) - 1)     # the lowest w bits, 0 to 2**w - 1
    if u >> (w - 1) & 1:       # top bit set: it is worth -2**(w-1)
        u -= 1 << w
    return u
`;

export const notes = [
  "`(1 << w) - 1` is a mask of w ones. `&` with it keeps the lowest w bits of x, exactly as a w-bit machine does. It works for negative x too, because Python treats a negative number as having endless 1s on the left.",
  "Read as an ordinary number, the top place counts plus 2 to the power w − 1. Two's complement counts it as minus that, which is 2 to the power w less. So when the top bit is 1, subtract `1 << w`.",
  "Another way to write the same thing: `u = (x + (1 << (w - 1))) % (1 << w) - (1 << (w - 1))`. It shifts the range −2ʷ⁻¹ … 2ʷ⁻¹ − 1 up to 0 … 2ʷ − 1, takes the remainder, and shifts back.",
  "For whole bytes, `int.from_bytes(u.to_bytes(w // 8, 'big'), 'big', signed=True)` gives the same answer, but only when w is a multiple of 8.",
];
