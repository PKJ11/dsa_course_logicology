// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:   # stop at the first value <= key
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
`;

export const notes = [
  "Invariant: at the start of pass i, a[0..i-1] holds the first i values in sorted order. The pass slides a[i] left past every bigger value, so after it a[0..i] is sorted.",
  "Each move of the inner loop fixes one inversion, a pair in the wrong order. So the total time is O(n + I) for I inversions.",
  "In the nearly sorted test, every value is at most 3 places from where it belongs, so I is at most 3n and the sort takes O(n). Selection sort would still make n(n − 1) / 2 comparisons.",
  "`a[j] > key`, not `>=`, means equal values never pass each other. That makes the sort stable, and saves moves.",
];
