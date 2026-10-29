// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def max_min(values):
    n = len(values)
    if n % 2:                       # odd: the first value starts both
        big = small = values[0]
        start = 1
    else:                           # even: the first two are a pair
        if values[0] < values[1]:
            small, big = values[0], values[1]
        else:
            small, big = values[1], values[0]
        start = 2
    for i in range(start, n - 1, 2):
        a, b = values[i], values[i + 1]
        if a < b:                   # 1 comparison inside the pair
            a, b = b, a             # now a >= b
        if a > big:                 # the larger can only be the largest
            big = a
        if b < small:               # the smaller can only be the smallest
            small = b
    return (big, small)
`;

export const notes = [
  "Each pair costs 3 comparisons: one inside the pair, then its larger value against `big` and its smaller value against `small`. The larger value of a pair can never be the smallest overall, so it is never compared with `small`, and the other way round.",
  "With an odd n the first value starts as both `big` and `small` and the rest pair up: 3(n − 1)/2 comparisons. With an even n the first pair costs 1, and the other (n − 2)/2 pairs cost 3 each: 3n/2 − 2. Both are within `3 * n // 2`.",
  "This is the divide and conquer bound written as a loop: each pair is a part of 2 values, solved with 1 comparison, and joining it to the rest costs 2. It is known that no method can use fewer than about 3n/2 − 2 comparisons in the worst case.",
  "A recursive split into halves gives the same count only when every part has an even size: a part of 3 values costs 3 comparisons, the same as a pair plus a single value, and those losses add up (about 1.65n on 100,000 values).",
];
