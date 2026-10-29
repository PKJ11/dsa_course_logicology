// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def fits(text, pat):
    s = pat + "\\0" + text            # "\\0" is in neither string
    n = len(s)
    z = [0] * n
    l = r = 0                          # the box [l, r)
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    m = len(pat)
    return z[m + 1:]                   # one value per place of text
`;

export const notes = [
  "Z[i] of the joined string pat + separator + text is the length of the longest start of the joined string that begins at place i. For a place of the text, that start can never run across the separator, so it is a start of the pattern: exactly what is asked.",
  "The separator must be a character that occurs in neither string; the problem uses lower-case letters, so '\\0' (the character with code 0) is safe. Without it, a match could run from the end of the pattern into the text.",
  "The box [l, r) is the match found so far that reaches furthest right. Inside it, the answer at i starts from the answer at i − l (lesson 3), so each letter is compared successfully at most once: O(n + m) in all.",
  "The answer at place i is never more than the letters left in the text, len(text) − i; the end of the joined string stops the while loop.",
];
