// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def single_codes(codes):
    counts = {}
    for c in codes:
        counts[c] = counts.get(c, 0) + 1    # 0 the first time a code is seen
    return [c for c in codes if counts[c] == 1]
`;

export const notes = [
  "Two passes. The first counts every code with a dictionary. Only after it can you know which codes appear once.",
  "The second pass goes through `codes` again, in order, and keeps each code whose count is 1. A code that appears once is met once, so nothing is kept twice.",
  "Cost: one dictionary update and one dictionary read per code, so time in proportion to the number of codes.",
  "`collections.Counter(codes)` does the first pass in one line. Avoid `codes.count(c)` inside the second pass: each call goes through the whole list, so the work grows with the square of the length.",
];
