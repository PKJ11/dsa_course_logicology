// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def almost_palindrome(s):
    def pal(lo, hi):                  # is s[lo..hi] a palindrome?
        while lo < hi:
            if s[lo] != s[hi]:
                return False
            lo += 1
            hi -= 1
        return True

    lo, hi = 0, len(s) - 1
    while lo < hi:
        if s[lo] != s[hi]:
            return pal(lo + 1, hi) or pal(lo, hi - 1)
        lo += 1
        hi -= 1
    return True
`;

export const notes = [
  "While the ends match, they can stay: deleting a character elsewhere does not change that they mirror each other. So the first mismatch is the first place where a deletion is needed.",
  "At that mismatch, s[lo] and s[hi] cannot both stay. One deletion is allowed, so it must be one of these two. The rest must then be a palindrome with no more deletions, which pal checks.",
  "Both pal calls together are O(n), and they run at most once. The whole function is O(n) time and O(1) extra space, because pal works on indexes, not on copies.",
  "A short version is `t == t[::-1]` on the two candidate slices. It is also O(n), but each slice copies part of the string.",
];
