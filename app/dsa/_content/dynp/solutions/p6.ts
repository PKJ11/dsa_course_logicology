// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import bisect

def nest(boxes):
    # widths rising; equal widths with heights falling,
    # so two boxes of the same width can never chain
    order = sorted(boxes, key=lambda b: (b[0], -b[1]))
    # tails[k] = smallest last height of a chain of k + 1
    tails = []
    for w, h in order:
        k = bisect.bisect_left(tails, h)   # strictly rising
        if k == len(tails):
            tails.append(h)
        else:
            tails[k] = h
    return len(tails)
`;

export const notes = [
  "After sorting by width, a chain of boxes is a strictly rising run of heights (a subsequence, not necessarily neighbours), as long as boxes of equal width cannot both be in it. Sorting equal widths by falling height makes sure of that: their heights can never rise.",
  "The longest strictly rising subsequence is lesson 6's method: `tails[k]` is the smallest height that ends a chain of k + 1 boxes. `bisect_left` finds the first tail that is not smaller than h; h replaces it, or extends the longest chain.",
  "`tails` stays sorted, so each step is one binary search: O(n log n) with the sort. The O(n²) table that checks every earlier box is too slow for 100,000 boxes.",
  "`tails` is not itself a chain of boxes. To rebuild a chain, store for each box the box before it (lesson 9).",
];
