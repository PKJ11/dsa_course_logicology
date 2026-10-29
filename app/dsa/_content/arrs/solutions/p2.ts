// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def longest_unique(s):
    last = {}              # character -> the last index it was seen at
    lo = 0
    best = 0
    for hi, ch in enumerate(s):
        if ch in last and last[ch] >= lo:
            lo = last[ch] + 1          # jump past the earlier copy
        last[ch] = hi
        best = max(best, hi - lo + 1)
    return best
`;

export const notes = [
  "Invariant: after each pass, s[lo..hi] has no repeated character, and it is the longest such run that ends at hi.",
  "When ch is already in the window, at index last[ch], every window that ends at hi and still holds that earlier copy has a repeat. So the window must start at last[ch] + 1 or later, and starting exactly there is the longest choice.",
  "`last[ch] >= lo` matters. An index from before the window is old news; jumping to it would move lo backwards. In \"abba\", the final 'a' was last seen at 0, but the window already starts at 2.",
  "lo and hi only move forwards, so the work is O(n) with O(1) dictionary steps on average. The dictionary holds at most one entry per different character.",
];
