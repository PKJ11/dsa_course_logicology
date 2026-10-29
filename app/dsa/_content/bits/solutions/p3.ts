// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def next_same_ones(x):
    low = x & -x                  # the lowest 1 bit
    up = x + low                  # clears the lowest run, sets the 0 above it
    gone = x ^ up                 # the run and the new 1: run length + 1 ones
    rest = gone >> (low.bit_length() + 1)   # run length - 1 ones, at the bottom
    return up | rest
`;

export const notes = [
  "Lesson 3 explains why the answer moves the top 1 of the lowest run up one place and puts the rest of the run at the bottom.",
  "Adding `low` to x carries through the lowest run of 1s: every 1 of the run becomes 0, and the 0 just above the run becomes 1. That is `up`, the top part of the answer.",
  "`x ^ up` marks every place that changed: the r places of the run and the new place above it, so r + 1 ones starting at the place of `low`. Shifting right by that place plus 2 leaves r − 1 ones at the bottom: the rest of the run.",
  "The work is a few operations on whole numbers, each O(B) for a B-bit number, whatever the distance to the answer. The well-known C version writes the last shift as a division, `(gone >> 2) // low`, because C has no `bit_length`.",
];
