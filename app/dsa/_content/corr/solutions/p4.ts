// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def counterexample(which):
    if which == 1:
        return [1, 2]        # the only rise is the last pair
    if which == 2:
        return [1, 3, 2, 4]  # ends in order, middle not
    if which == 3:
        return [5, 5]        # a tie for the largest
    if which == 4:
        return [5, 5, 3]     # sorted(a)[-2] is 5, the answer is 3
`;

export const notes = [
  "1: `count_rises` loops over `range(1, len(a) - 1)`, which stops one index early, so the last pair is never compared. [1, 2] has one rise, but the loop runs over `range(1, 1)`, which is empty, and returns 0.",
  "2: `is_sorted` checks only `a[0] <= a[-1]`. In [1, 3, 2, 4], 1 <= 4, but 3 > 2. A list is in order only when every pair of neighbours is.",
  "3: `first_max_index` uses `>=`, so on a tie it moves to the later index. In [5, 5] the first largest value is at index 0, but it returns 1. With `>` it would be right.",
  "4: `second_best` forgets that equal values are one speed. In [5, 5, 3], the sorted list is [3, 5, 5] and `[-2]` is 5. The second largest different value is 3.",
  "Each answer is as small as it can be. Small counterexamples are easier to read and easier to turn into a test, as lesson 5 explains.",
];
