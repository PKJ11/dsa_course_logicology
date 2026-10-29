// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def is_sorted(times):
    for i in range(1, len(times)):
        if times[i - 1] > times[i]:   # one pair out of order is enough
            return False
    return True                       # no pair was out of order
`;

export const notes = [
  "A list is in order exactly when every pair of neighbours is in order. A list of n values has n - 1 such pairs, and the loop checks each one once.",
  "`i` starts at 1, so `times[i - 1]` is always a real index. For an empty list or a single time, `range(1, len(times))` is empty, the loop does nothing, and the answer is True. That matches the spec: no pair is out of order.",
  "Use `>` to spot a bad pair. Equal times are allowed, so a pair is only bad when the first time is strictly bigger.",
  "`return False` inside the loop stops at the first bad pair. `return True` must come after the loop, not inside it, or the function would decide after looking at one pair.",
  "`times == sorted(times)` also gives the right answer, but it builds a sorted copy first. That takes more time and more memory than one pass.",
];
