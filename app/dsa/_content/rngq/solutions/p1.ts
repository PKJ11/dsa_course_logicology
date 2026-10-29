// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def after_adds(n, adds, queries):
    d = [0] * (n + 1)            # the difference list
    for l, r, v in adds:
        d[l] += v                # from l on, v more
        d[r] -= v                # from r on, v less again
    p = [0] * (n + 1)            # prefix sums of the final list
    run = 0
    for k in range(n):
        run += d[k]              # run is now a[k]
        p[k + 1] = p[k] + run
    return [p[r] - p[l] for l, r in queries]
`;

export const notes = [
  "Each add changes only two cells of the difference list d. The running total of d at position k is the sum of every add that has started and not yet ended there, which is exactly the final a[k].",
  "The same loop builds the prefix sums p of the final list, so every query is p[r] − p[l], the first r values minus the first l.",
  "An add that runs to the end changes d[n], which the loop never reads. An empty range changes d[l] and d[l] back again.",
  "O(1) per add, one O(n) pass, O(1) per query. `itertools.accumulate` can do both running totals in C, which is faster still.",
];
