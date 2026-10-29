from solgen import write_station

write_station("bits", 5, {
    1: ('''def wrap(x, w):
    u = x & ((1 << w) - 1)     # the lowest w bits, 0 to 2**w - 1
    if u >> (w - 1) & 1:       # top bit set: it is worth -2**(w-1)
        u -= 1 << w
    return u
''', [
        "`(1 << w) - 1` is a mask of w ones. `&` with it keeps the lowest w bits of x, exactly as a w-bit machine does. It works for negative x too, because Python treats a negative number as having endless 1s on the left.",
        "Read as an ordinary number, the top place counts plus 2 to the power w − 1. Two's complement counts it as minus that, which is 2 to the power w less. So when the top bit is 1, subtract `1 << w`.",
        "Another way to write the same thing: `u = (x + (1 << (w - 1))) % (1 << w) - (1 << (w - 1))`. It shifts the range −2ʷ⁻¹ … 2ʷ⁻¹ − 1 up to 0 … 2ʷ − 1, takes the remainder, and shifts back.",
        "For whole bytes, `int.from_bytes(u.to_bytes(w // 8, 'big'), 'big', signed=True)` gives the same answer, but only when w is a multiple of 8.",
    ]),
    2: ('''def from_gray(g):
    n = g
    s = 1
    while s < g.bit_length():
        n ^= n >> s     # each bit now covers 2 * s bits of g
        s *= 2
    return n
''', [
        "Bit k of n is the xor of the bits of g from the top down to place k: a running xor from the top. Written out, n is `g ^ (g >> 1) ^ (g >> 2) ^ …`, one term for every bit of g.",
        "The loop builds that running xor in doubling blocks. At the start each bit of n covers 1 bit of g. After `n ^= n >> s` it covers 2·s bits: its own block and the block of s bits just above. After about log₂ B rounds, each bit covers every bit above it.",
        "For a million bits that is 20 shifts, each of which copies the number once: about 20 million bit steps, done 30 bits at a time in C. One shift per bit would be a million shifts of a million bits.",
        "The same doubling method makes a running sum of bits, or any running xor of a row packed into one number, in O(log B) whole-number operations.",
    ]),
    3: ('''def next_same_ones(x):
    low = x & -x                  # the lowest 1 bit
    up = x + low                  # clears the lowest run, sets the 0 above it
    gone = x ^ up                 # the run and the new 1: run length + 1 ones
    rest = gone >> (low.bit_length() + 1)   # run length - 1 ones, at the bottom
    return up | rest
''', [
        "Lesson 3 explains why the answer moves the top 1 of the lowest run up one place and puts the rest of the run at the bottom.",
        "Adding `low` to x carries through the lowest run of 1s: every 1 of the run becomes 0, and the 0 just above the run becomes 1. That is `up`, the top part of the answer.",
        "`x ^ up` marks every place that changed: the r places of the run and the new place above it, so r + 1 ones starting at the place of `low`. Shifting right by that place plus 2 leaves r − 1 ones at the bottom: the rest of the run.",
        "The work is a few operations on whole numbers, each O(B) for a B-bit number, whatever the distance to the answer. The well-known C version writes the last shift as a division, `(gone >> 2) // low`, because C has no `bit_length`.",
    ]),
    4: ('''def ones_upto(n):
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
''', [
        "Count place by place, not number by number. Among 0, 1, 2, …, place k shows 2ᵏ zeros, then 2ᵏ ones, and repeats, so it repeats every 2ᵏ⁺¹ numbers.",
        "The n + 1 numbers 0 to n hold `(n + 1) // cycle` finished cycles, each with 2ᵏ ones in place k. The unfinished cycle has `left` numbers; its first 2ᵏ have a 0 in place k and the rest have a 1.",
        "Places with 2ᵏ above n are 0 in every number, so the loop stops there. That is about log₂ n rounds: 60 for 10¹⁸, 333 for 10¹⁰⁰.",
        "Check: for n = 2ᵏ − 1 every place is 1 in exactly half the numbers, so the answer is k · 2ᵏ⁻¹. For n = 7 that is 12.",
    ]),
    5: ('''from bisect import bisect_left

def closest_sum(a, target):
    def all_sums(part):
        sums = [0]
        for v in part:
            sums += [s + v for s in sums]    # every old subset, with v added
        return sums

    half = len(a) // 2
    left = all_sums(a[:half])
    right = sorted(all_sums(a[half:]))
    best = abs(target)                       # the empty choice
    for s in left:
        i = bisect_left(right, target - s)   # first sum >= target - s
        if i < len(right):
            best = min(best, s + right[i] - target)
        if i > 0:
            best = min(best, target - s - right[i - 1])
    return best
''', [
        "Every choice of items is a choice from the first half plus a choice from the second half. Each half has at most 18 items, so at most 2¹⁸ = 262,144 subset sums. Listing them is fast; 2³⁶ would not be.",
        "`all_sums` doubles the list for each item: the old sums without the item, then the old sums with it. After all the items it holds every subset sum, in the same order as the masks 0 to 2ᵏ − 1.",
        "For a sum s from the left half, the best partner from the right half is the one nearest to `target - s`. In the sorted list it is either the first sum that is at least `target - s` (position i) or the one just before it. Both are checked; position i may be past the end.",
        "Cost: O(2ⁿᐟ² · n) for sorting and the binary searches, where 2ⁿᐟ² means 2 to the power n/2. Sorting both halves and walking them with two pointers, one from each end, also works and drops the binary searches.",
        "This is meeting in the middle: the work of 2ⁿ becomes about 2 · 2ⁿᐟ², paid for with the memory for the sums.",
    ]),
})
