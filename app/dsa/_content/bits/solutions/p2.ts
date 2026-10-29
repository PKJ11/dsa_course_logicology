// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def from_gray(g):
    n = g
    s = 1
    while s < g.bit_length():
        n ^= n >> s     # each bit now covers 2 * s bits of g
        s *= 2
    return n
`;

export const notes = [
  "Bit k of n is the xor of the bits of g from the top down to place k: a running xor from the top. Written out, n is `g ^ (g >> 1) ^ (g >> 2) ^ …`, one term for every bit of g.",
  "The loop builds that running xor in doubling blocks. At the start each bit of n covers 1 bit of g. After `n ^= n >> s` it covers 2·s bits: its own block and the block of s bits just above. After about log₂ B rounds, each bit covers every bit above it.",
  "For a million bits that is 20 shifts, each of which copies the number once: about 20 million bit steps, done 30 bits at a time in C. One shift per bit would be a million shifts of a million bits.",
  "The same doubling method makes a running sum of bits, or any running xor of a row packed into one number, in O(log B) whole-number operations.",
];
