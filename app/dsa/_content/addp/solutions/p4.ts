// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def fewest_wagons(weights, cap):
    n = len(weights)
    if n == 0:
        return 0
    full = 1 << n
    best = [(n + 1, 0)] * full          # (wagons used, load of the last wagon)
    best[0] = (1, 0)
    for mask in range(full):
        t, load = best[mask]
        for i in range(n):
            if not mask >> i & 1:
                w = weights[i]
                c = (t, load + w) if load + w <= cap else (t + 1, w)
                if c < best[mask | 1 << i]:
                    best[mask | 1 << i] = c
    return best[full - 1][0]
`;

export const notes = [
  "Wagons are loaded one after another. Any packing can be produced this way: list the parcels of the first wagon, then the second, and so on. So the fewest wagons is found by trying loading orders, and two orders that have loaded the same set of parcels can be merged into one state (lesson 4).",
  "For each mask of loaded parcels, keep the best pair (wagons used, weight in the last wagon), fewer wagons first and then a lighter last wagon. Among states with the same wagon count, a lighter last wagon can always do at least as well later, so the smallest pair is the only one worth keeping.",
  "Adding parcel i: into the last wagon if it fits, else into a new wagon. Python's tuple comparison picks the better pair. Masks rise as parcels are added, so the plain loop order is right.",
  "Cost: 2ⁿ · n, about a million steps for 16 parcels. The submask method of lesson 4 makes 3ⁿ steps, 43 million for 16.",
];
