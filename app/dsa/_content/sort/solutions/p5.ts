// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def sort_ages(ages):
    count = [0] * 151                 # ages 0 to 150
    for x in ages:
        count[x] += 1
    out = []
    for v in range(151):
        out.extend([v] * count[v])
    return out
`;

export const notes = [
  "No two ages are ever compared, so the n log n lower bound of lesson 5 does not apply.",
  "Two passes: n to count, and 151 to write out. That is O(n + k) time with k = 151, and O(k) extra space for the counters.",
  "`out.extend([v] * count[v])` adds all copies of v in one step, which in Python is much faster than appending them one by one.",
  "This version loses nothing because the values are the records. To sort records by age, use the stable version from lesson 6 with starting positions.",
];
