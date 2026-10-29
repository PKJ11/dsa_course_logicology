// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def fewest_moves(grid, k):
    R, C = len(grid), len(grid[0])
    # least[r][c]: the fewest walls used by any visit to (r, c) so far
    least = [[k + 1] * C for _ in range(R)]
    least[0][0] = 0
    q = deque([(0, 0, 0)])             # (row, column, walls used)
    moves = 0
    while q:
        for _ in range(len(q)):        # every state that is \`moves\` away
            r, c, used = q.popleft()
            if r == R - 1 and c == C - 1:
                return moves
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < R and 0 <= nc < C:
                    w = used + (grid[nr][nc] == '#')
                    if w < least[nr][nc]:   # only a visit with fewer walls used can help
                        least[nr][nc] = w
                        q.append((nr, nc, w))
        moves += 1
    return -1
`;

export const notes = [
  "The vertices of this graph are states (row, column, walls used), not squares. Two visits to the same square with different walls used are different situations: one can still break walls that the other cannot (the test 'One visit per square is not enough').",
  "Breadth-first search reaches states in order of moves. So when a square is reached again, it is never by fewer moves. That later visit is useful only if it has used fewer walls; `least` keeps the fewest walls seen at each square and lets only such visits in.",
  "Each square can be entered at most k + 1 times (walls used k, k − 1, …, 0, each smaller than the last), so the search is O(R · C · (k + 1)). A table `seen[r][c][w]` of all states works too, and costs the same.",
  "The loop `for _ in range(len(q))` takes the queue one level at a time, so `moves` is the distance of every state in that level. Storing the distance inside each queue entry works just as well.",
];
