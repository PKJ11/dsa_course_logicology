// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def running_totals(a):
    out = []
    s = 0                  # total of the values seen so far
    for x in a:
        s += x
        out.append(s)      # entry i is a[0] + ... + a[i]
    return out
`;

export const notes = [
  "The idea: each total is the previous total plus one more value. So keep the total in `s` and add one value per step.",
  "This statement stays true at the end of every pass: `s` is the sum of the values seen so far, and `out` holds one total for each of them. CORR-2 calls this a loop invariant.",
  "Cost: one pass, so time in proportion to `len(a)`. `sum(a[:i + 1])` for each `i` gives the same answer, but adds up about n²/2 values (n times n, halved): 20 billion for 200,000 values.",
  "With the library: `from itertools import accumulate`, then `return list(accumulate(a))`.",
];
