// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def count_inversions(a):
    def go(a):                          # returns (sorted copy, inversions)
        if len(a) <= 1:
            return list(a), 0
        mid = len(a) // 2
        left, x = go(a[:mid])
        right, y = go(a[mid:])
        out = []
        count = x + y
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                out.append(left[i])
                i += 1
            else:
                out.append(right[j])
                j += 1
                count += len(left) - i  # right[j] beats every waiting left value
        out.extend(left[i:])
        out.extend(right[j:])
        return out, count
    return go(a)[1]
`;

export const notes = [
  "Every inversion (i < j, a[i] > a[j]) has both positions in the left half, both in the right half, or one in each. The recursive calls count the first two kinds.",
  "For the cross pairs: the halves are sorted, and sorting a half does not change which left value is bigger than which right value. When right[j] is taken while left[i] waits, right[j] is smaller than left[i], left[i + 1], …, which is len(left) − i inversions.",
  "On a tie the left value is taken first, so equal values are never counted.",
  "The work is merge sort's: O(n log n), instead of O(n²), n times n, for checking every pair.",
];
