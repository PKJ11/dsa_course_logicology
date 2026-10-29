// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def has_pair_sum(a, target):
    seen = set()
    for x in a:
        if target - x in seen:   # a partner seen earlier
            return True
        seen.add(x)              # add only after checking
    return False
`;

export const notes = [
  "For each load `x`, the only partner that works is `target - x`. The set holds every load before `x`, so the check asks exactly: did a partner appear at an earlier position?",
  "Checking before adding is what keeps the two positions different. With `[5, 1]` and target 10, `seen` is empty when 5 is checked, so 5 cannot pair with itself. With `[5, 3, 5]`, the second 5 finds the first one.",
  "Every pair is found: when the later of the two loads is reached, the earlier one is already in the set.",
  "Cost: one pass, with an O(1) average set check each time, so O(n) time on average and O(n) extra space. Checking every pair is n(n − 1) / 2 additions, about 5 billion for 100,000 loads.",
  "Another way: sort a copy, then move two pointers in from the ends (ARRS-2). That is O(n log n) time. It is the better choice when you also need the pair itself in sorted order.",
];
