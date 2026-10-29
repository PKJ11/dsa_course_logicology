// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def second_largest(speeds):
    first = speeds[0]
    second = None
    # Invariant: first is the largest value seen so far;
    # second is the largest value seen that is below first, or None.
    for x in speeds[1:]:
        if x > first:
            second = first     # the old best is now second
            first = x
        elif x < first and (second is None or x > second):
            second = x
        # x == first: the same speed, nothing changes
    return second
`;

export const notes = [
  "Start: after looking at `speeds[0]` only, the largest value is `speeds[0]` and there is no smaller value yet. So the invariant holds with `first = speeds[0]` and `second = None`.",
  "Keep: a new value `x` is bigger than `first`, equal to it, or smaller. If bigger, the old `first` is now the largest value below `x`, so it becomes `second`. If equal, nothing changes. If smaller, `x` replaces `second` only when it beats it.",
  "Finish: when the loop ends, every value has been seen, so `second` is the largest value below the largest of all. That is the second largest different speed, or None if all speeds are equal.",
  "Starting `first` and `second` at 0 breaks when all speeds are negative. Starting from the list's own first value avoids that.",
  "The loop looks at each value once, so the time grows in proportion to the number of speeds. `speeds[1:]` makes a copy; `for i in range(1, len(speeds))` avoids it if memory matters.",
];
