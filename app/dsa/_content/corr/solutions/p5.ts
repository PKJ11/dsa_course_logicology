// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def best_stretch(a):
    best = cur = a[0]
    # cur: the best total of a stretch that ends at the current section
    # best: the best total of any stretch seen so far
    for x in a[1:]:
        cur = max(x, cur + x)    # start again at x, or extend
        best = max(best, cur)
    return best
`;

export const notes = [
  "The claim, for each i: after handling section i, `cur` is the best total of a stretch that ends exactly at section i. The proof is by induction on i.",
  "Base case, i = 0: the only stretch ending at 0 is `a[0]` itself, and `cur` starts as `a[0]`.",
  "Step: a stretch ending at i is either section i alone, or a stretch ending at i - 1 with section i added. The best of the second kind uses the best stretch ending at i - 1, which is the old `cur`. So the best of both kinds is `max(x, cur + x)`.",
  "Every stretch ends at some section, and `best` keeps the largest `cur` over all of them. So at the end, `best` is the largest total of any stretch.",
  "Starting `best` at 0 would allow an empty stretch and return 0 for an all-negative list. Starting at `a[0]` keeps every stretch at least one value long.",
  "One pass with two numbers: the time grows in proportion to n. Trying every start and end takes about n² / 2 sums (n squared, halved). This method is known as Kadane's algorithm. The DYNP station builds on the same idea.",
];
