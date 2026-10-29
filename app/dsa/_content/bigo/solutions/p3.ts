// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def dedupe(codes):
    seen = set()
    out = []
    for c in codes:
        if c not in seen:    # O(1) on average
            seen.add(c)
            out.append(c)
    return out
`;

export const notes = [
  "The list `out` keeps the order. The set `seen` answers \"kept already?\" quickly. Each structure does the job it is good at.",
  "Each code is checked once and added at most once, so the pass is O(n) on average, with O(n) extra space for the set.",
  "`if c not in out` gives the same answer, but `in` on a list checks values one by one. With 50,000 kept codes, each check is up to 50,000 steps, so the whole loop is about n² / 4 steps.",
  "Python's dicts keep the order in which keys were added, so `list(dict.fromkeys(codes))` is a one-line version of the same idea.",
];
