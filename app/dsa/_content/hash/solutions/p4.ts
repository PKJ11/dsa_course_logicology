// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def count_sums(a, k):
    seen = {0: 1}          # prefix sum -> how many times it has appeared
    total = count = 0
    for x in a:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
`;

export const notes = [
  "Write p for the running total. The stretch after place i up to place j adds up to p[j] − p[i]. It equals k exactly when p[i] = p[j] − k.",
  "So at each place j, the number of good stretches ending there is the number of earlier totals equal to `total - k`. The dict holds those counts.",
  "`{0: 1}` stands for the total before the first value, so stretches that start at place 0 are counted. Looking up before storing makes sure a stretch has at least one value.",
  "One pass with O(1) dict work per value: O(n) time on average and O(n) extra space. This works with negative values, where a sliding window does not.",
];
