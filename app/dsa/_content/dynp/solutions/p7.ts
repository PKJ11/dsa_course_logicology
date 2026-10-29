// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def edit_distance(a, b):
    # prev[j] = distance from a[:i - 1] to b[:j]
    prev = list(range(len(b) + 1))     # from '': insert j
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)       # to '': delete i
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]   # last letters match
            else:
                cur[j] = 1 + min(prev[j - 1],  # replace
                                 prev[j],      # delete
                                 cur[j - 1])   # insert
        prev = cur
    return prev[len(b)]
`;

export const notes = [
  "The state is a pair of prefix lengths (i, j): the fewest edits that turn the first i letters of a into the first j letters of b. Row 0 is j insertions; column 0 is i deletions.",
  "Look at the last letters. If they are equal, keep both: the cost is that of the shorter prefixes. If not, the last edit is a replacement (both prefixes shrink), a deletion of a's last letter (i shrinks), or an insertion of b's last letter (j shrinks). Take the cheapest and add 1.",
  "Each cell needs the cell above, the cell to its left and the cell above-left, so two rows are enough: O(len(a) × len(b)) time and O(len(b)) space.",
  "Memoised recursion on two 1,000-letter strings goes up to 2,000 calls deep, past Python's limit, so it fails; the loop has no such limit.",
];
