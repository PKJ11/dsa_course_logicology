// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def search(platforms, target):
    lo, hi = 0, len(platforms) - 1      # closed window [lo, hi]
    while lo <= hi:
        mid = (lo + hi) // 2
        value = platforms[mid]          # one read per pass
        if value == target:
            return mid
        elif value < target:
            lo = mid + 1                # platforms[lo..mid] are all < target
        else:
            hi = mid - 1                # platforms[mid..hi] are all > target
    return -1                           # empty window: target is absent
`;

export const notes = [
  "Invariant: if `target` is anywhere in `platforms`, it is in `platforms[lo..hi]`. It is true at the start, because the window is the whole list. Each branch keeps it true, because the list is sorted. So when the window is empty, the target is not in the list.",
  "Why it stops: the window size, `hi - lo + 1`, gets at least one smaller on every pass, because both updates remove `mid`.",
  "How many reads: at most ⌊log₂ n⌋ + 1 passes, so 20 reads for a million platforms. Storing `platforms[mid]` in `value` means one read per pass. Reading it twice would still pass the tests, at about 40 reads, but one read is a good habit when reads are slow.",
  "With the library: `i = bisect_left(platforms, target)`, then `return i if i < len(platforms) and platforms[i] == target else -1`.",
];
