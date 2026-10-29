// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def arrange_board(trains):
    by_time = sorted(trains, key=lambda t: t[2], reverse=True)
    board = sorted(by_time, key=lambda t: t[1])
    return [t[0] for t in board]
`;

export const notes = [
  "Sort by the less important field first and the most important field last. The second sort is stable, so among trains on the same platform the time order from the first sort is kept.",
  "`reverse=True` gives the latest time first, and Python keeps equal items in their original order even when reversing, so trains with the same time keep their input order.",
  "'HH:MM' strings sort correctly as text because they have a fixed length and leading zeros. '9:05' without the zero would sort after '10:30'.",
  "A one-sort version converts the time to minutes and negates it: `key=lambda t: (t[1], -minutes(t[2]))`.",
  "Two sorts are O(n log n). `sorted()` returns new lists, so `trains` is unchanged.",
];
