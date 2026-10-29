// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def merge_sort(a):
    if len(a) <= 1:
        return list(a)                 # a copy, already sorted
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # ties take the left: stable
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])               # one of these is empty
    out.extend(right[j:])
    return out
`;

export const notes = [
  "Correct by strong induction on the length: lists of 0 or 1 values are sorted; for longer lists both halves are shorter, so they come back sorted, and merging two sorted lists gives a sorted list.",
  "The merge moves one value per pass, so each level of the recursion does O(n) work in total. There are about log₂ n levels: O(n log n) time on every input.",
  "The slices `a[:mid]` and `a[mid:]` copy, which adds O(n) per level: still O(n log n). Passing index ranges instead saves that copying but not the merge buffer, so merge sort needs O(n) extra space either way.",
  "`list(a)` in the base case returns a new list, so the caller's list is never changed or shared.",
];
