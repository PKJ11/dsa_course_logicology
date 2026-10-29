// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def rotate(board, k):
    if not board:                   # avoid k % 0
        return []
    k %= len(board)                 # rotating by len(board) changes nothing
    return board[k:] + board[:k]    # two slices: both are new lists
`;

export const notes = [
  "The rotated board starts at index `k` and wraps round to the front. `board[k:]` is the part from `k` to the end, and `board[:k]` is the part before `k`. Joining them with `+` makes the answer.",
  "`k %= len(board)` keeps only the remainder. Rotating by 6 on a board of 4 is the same as rotating by 2. Without it, `board[6:]` is empty and nothing would move.",
  "Slices are copies, so `board` itself never changes. The whole job reads each value once, so it takes time in proportion to the length of the board.",
  "Moving one value at a time with `board.append(board.pop(0))`, `k` times, also gives the right answer. But each `pop(0)` moves every other value one place left, so for a million entries it is far too slow.",
];
