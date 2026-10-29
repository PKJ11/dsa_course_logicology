// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def find_all(text, pat):
    n, m = len(text), len(pat)
    found = []
    for i in range(n - m + 1):         # every place, including n - m
        j = 0
        while j < m and (pat[j] == "?" or text[i + j] == pat[j]):
            j += 1
        if j == m:                     # every letter matched or was a blank
            found.append(i)
    return found                       # move on by 1, so overlaps are found
`;

export const notes = [
  "The naive method from lesson 1, with one change: a ? in the pattern matches whatever letter is under it. Only the pattern's ? is a blank; a ? in the text is an ordinary letter.",
  "range(n - m + 1) tries the last place, n − m. When the pattern is longer than the text, the range is empty and the answer is [].",
  "After a match, the loop simply goes on to i + 1, so overlapping matches are reported.",
  "Cost: at most m comparisons per place, O(n · m) in all, which is fine for these sizes. A regular expression with a lookahead does the same job in C: [m.start() for m in re.finditer('(?=' + pat.replace('?', '.') + ')', text)].",
  "KMP and the Z-algorithm do not handle blanks directly, because a border of a pattern with blanks is not well defined. Faster methods for blanks exist (splitting the pattern at the blanks, or the fast Fourier transform), but they are beyond this lesson.",
];
