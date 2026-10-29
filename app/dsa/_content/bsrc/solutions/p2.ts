export const code = `def first_at_least(times, t):
    """Smallest i with times[i] >= t, or len(times)."""
    lo, hi = 0, len(times)              # half-open window [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if times[mid] >= t:
            hi = mid
        else:
            lo = mid + 1
    return lo

def first_greater(times, t):
    """Smallest i with times[i] > t, or len(times)."""
    lo, hi = 0, len(times)
    while lo < hi:
        mid = (lo + hi) // 2
        if times[mid] > t:
            hi = mid
        else:
            lo = mid + 1
    return lo

def first_and_last(times, t):
    first = first_at_least(times, t)
    if first == len(times) or times[first] != t:
        return [-1, -1]
    return [first, first_greater(times, t) - 1]
`;

export const notes = [
  "This uses two boundary searches. `first_at_least` finds the point where the answers to `times[i] >= t` change from F to T. `first_greater` does the same for `times[i] > t`. The copies of `t` are exactly between these two points.",
  "Invariant for both: every index before `lo` is F, and every index from `hi` onwards is T. `hi` starts at `len(times)`, so that 'no T at all' is a possible answer.",
  "The check after the first search matters. The boundary exists even when `t` is not in the list. So check that `first` is a valid index and that `times[first] == t` before you use it.",
  "How many reads: two searches of about log₂ n reads each, however many copies there are. With the library: `bisect_left(times, t)` and `bisect_right(times, t) - 1`.",
];
