export const code = `def search_rotated(a, target):
    lo, hi = 0, len(a) - 1              # closed window
    while lo <= hi:
        mid = (lo + hi) // 2
        m = a[mid]
        if m == target:
            return mid
        left = a[lo]
        if left <= m:                   # a[lo..mid] is sorted
            if left <= target < m:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                           # a[mid..hi] is sorted
            if m < target <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
`;

export const notes = [
  "Key fact: if you cut a rotated sorted list anywhere, at least one of the two halves is sorted. Compare `a[lo]` with `a[mid]` to find out which: if `a[lo] <= a[mid]`, the left half has no drop in it.",
  "Inside a sorted half, two comparisons tell you whether the target is in it. If it is, search that half. If not, it can only be in the other half. Either way, the invariant from lesson 2 stays true: if the target is in the list, it is in `a[lo..hi]`.",
  "The `<=` in `left <= m` matters when `lo == mid`, because a half with one value counts as sorted. This works because all the values are different. With repeated values, such as `[1, 1, 1, 0, 1]`, you cannot tell which half is sorted, and the worst case becomes O(n).",
  "How many reads: at most three per pass, and about log₂ n passes.",
];
