// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def find_every(text, pat):
    m = len(pat)
    # pi[i]: length of the longest border of pat[0..i]
    pi = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pat[i] != pat[k]:
            k = pi[k - 1]              # the next shorter border
        if pat[i] == pat[k]:
            k += 1
        pi[i] = k
    found = []
    j = 0                              # letters of pat matched so far
    for i, ch in enumerate(text):
        while j > 0 and ch != pat[j]:
            j = pi[j - 1]              # slide pat; i stays
        if ch == pat[j]:
            j += 1
            if j == m:                 # pat ends at place i
                found.append(i - m + 1)
                j = pi[m - 1]          # keep the longest border matched
    return found
`;

export const notes = [
  "First the border table π of the pattern (lesson 2), in O(m): k is the border being grown, and on a mismatch it drops to the next shorter border, π[k − 1].",
  "Then one pass over the text. j counts the letters of the pattern matched so far. On a mismatch the pattern slides so that its longest border lines up (j = π[j − 1]); the place i in the text never moves back.",
  "After a full match, j = π[m − 1] keeps the longest border matched, so the next match can start inside this one: overlapping places are all found.",
  "Each letter of the text is matched at most once, and each slide moves the pattern right, so the whole search makes at most 2n + 2m comparisons: O(n + m).",
  "Why not a loop of text.find(pat, i + 1)? Each call is fast, but each one checks all m letters of the match again. With 500,001 matches of 500,000 letters that is about 250 billion letter checks.",
];
