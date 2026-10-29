// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def largest_square(rows):
    if not rows:
        return 0
    w = len(rows[0])
    # side[c + 1] = the largest free square whose
    # bottom-right corner is at column c of this row
    prev = [0] * (w + 1)
    best = 0
    for line in rows:
        cur = [0] * (w + 1)
        for c in range(w):
            if line[c] == ".":
                s = 1 + min(prev[c],       # above-left
                            prev[c + 1],   # above
                            cur[c])        # left
                cur[c + 1] = s
                best = max(best, s)
        prev = cur
    return best
`;

export const notes = [
  "The state is a cell, and the value is the side of the largest free square whose bottom-right corner is that cell. The answer is the largest value in the table.",
  "If a free cell has squares of sides a (above), b (left) and c (above-left) ending at its neighbours, the largest square ending at it has side 1 + min(a, b, c). It cannot be bigger, because one of the three neighbours' squares would then be bigger too; and the three squares together cover a square of that size.",
  "The extra 0 at the start of each row stands for the cells left of column 0, so the first column needs no special case. Only the row above is needed, so two rows are kept: O(width) space and O(rows × width) time.",
];
