// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def ones_upto(n):
    total = 0
    k = 0
    while (1 << k) <= n:
        cycle = 1 << (k + 1)              # place k: 2**k zeros, then 2**k ones
        whole = (n + 1) // cycle          # finished cycles in 0..n
        total += whole * (1 << k)
        left = (n + 1) % cycle            # numbers in the unfinished cycle
        total += max(0, left - (1 << k))  # its last part has 1s in place k
        k += 1
    return total
`;

export const notes = [
  "Count place by place, not number by number. Among 0, 1, 2, …, place k shows 2ᵏ zeros, then 2ᵏ ones, and repeats, so it repeats every 2ᵏ⁺¹ numbers.",
  "The n + 1 numbers 0 to n hold `(n + 1) // cycle` finished cycles, each with 2ᵏ ones in place k. The unfinished cycle has `left` numbers; its first 2ᵏ have a 0 in place k and the rest have a 1.",
  "Places with 2ᵏ above n are 0 in every number, so the loop stops there. That is about log₂ n rounds: 60 for 10¹⁸, 333 for 10¹⁰⁰.",
  "Check: for n = 2ᵏ − 1 every place is 1 in exactly half the numbers, so the answer is k · 2ᵏ⁻¹. For n = 7 that is 12.",
];
