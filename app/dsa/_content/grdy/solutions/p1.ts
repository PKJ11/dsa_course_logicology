// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def how_much(capacity, items):
    # positions, most value per kg first
    order = sorted(range(len(items)), key=lambda i: items[i][1] / items[i][0], reverse=True)
    take = [0] * len(items)           # kilograms of each item, in the order given
    for i in order:
        if capacity <= 0:
            break                     # the bag is full
        take[i] = min(items[i][0], capacity)   # all of it, or what fits
        capacity -= take[i]
    return take
`;

export const notes = [
  "Think of the bag as `capacity` separate kilograms. Each kilogram is worth the value per kg of whatever fills it, so the best bag fills every kilogram with the best value per kg still available. That is exactly what taking items in order of `value / weight` does.",
  "Sort the positions, not the items, so each amount can be written at its item's own place in the answer. Only the last item taken can be cut: every item before it fitted whole. After it the bag is full and the loop stops; the rest stay 0.",
  "The exchange proof (lesson 2): if a best bag held less of a better item than it could, swapping one kilogram of a worse item for it would not lower the value. When two items have the same value per kg, either can be cut: the tests check the value of the plan, so any best plan passes.",
  "Sorting is O(n log n) and the walk O(n). Sorting by value or by weight alone fails: see the tests \"Valuable but heavy\" and \"Light but cheap\".",
];
