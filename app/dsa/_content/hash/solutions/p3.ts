// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:           # x starts a run
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best
`;

export const notes = [
  "The set removes repeats and makes every `in` check O(1) on average.",
  "A run is counted only from its smallest number, the one whose `x - 1` is missing. So the inner `while` loop visits each number at most once over the whole run of the function.",
  "In total: n steps to build the set, n checks of `x - 1`, and at most n steps of counting. That is O(n) on average.",
  "Without the start check, a run of 200,000 numbers is counted from each of its numbers: about 20 billion steps.",
];
