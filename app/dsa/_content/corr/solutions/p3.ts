// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def sort_coaches(coaches):
    lo, i, hi = 0, 0, len(coaches) - 1
    # Invariant: coaches[0..lo-1] are 0s, coaches[lo..i-1] are 1s,
    # coaches[i..hi] are not looked at yet, coaches[hi+1..] are 2s.
    while i <= hi:
        if coaches[i] == 0:
            coaches[lo], coaches[i] = coaches[i], coaches[lo]
            lo += 1
            i += 1
        elif coaches[i] == 1:
            i += 1
        else:
            coaches[i], coaches[hi] = coaches[hi], coaches[i]
            hi -= 1            # do not move i: the new coaches[i] is unseen
`;

export const notes = [
  "Start: `lo = i = 0` and `hi = n - 1`. The 0, 1 and 2 parts are empty, and every coach is in the not-yet-seen part. The invariant holds.",
  "Keep, for a 0: the value at `lo` is a 1 (or `lo` equals `i`), so the swap puts the 0 at the end of the 0 part and the 1 at the end of the 1 part. Both `lo` and `i` move on by one.",
  "Keep, for a 2: it goes to position `hi`, the front of the 2 part. The value that comes back to `i` has not been looked at, so `i` stays where it is. Only `hi` moves.",
  "Finish: the loop ends when `i > hi`, so the not-yet-seen part is empty. By the invariant, the list is now 0s, then 1s, then 2s.",
  "It stops: every pass either moves `i` forward or moves `hi` back, so the not-yet-seen part shrinks by one each time. It takes at most n passes and uses no extra list.",
  "This is often called the Dutch national flag problem. SORT-3 uses the same three-part idea to split a list around a chosen value.",
];
