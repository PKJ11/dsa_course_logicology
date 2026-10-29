// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def spiral(grid):
    if not grid:
        return []
    out = []
    top, bottom = 0, len(grid) - 1
    left, right = 0, len(grid[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):        # top row
            out.append(grid[top][c])
        top += 1
        for r in range(top, bottom + 1):        # right column
            out.append(grid[r][right])
        right -= 1
        if top <= bottom:                       # bottom row, if any left
            for c in range(right, left - 1, -1):
                out.append(grid[bottom][c])
            bottom -= 1
        if left <= right:                       # left column, if any left
            for r in range(bottom, top - 1, -1):
                out.append(grid[r][left])
            left += 1
    return out
`;

export const notes = [
  "The four limits mark the ring that is not finished yet. Each side is walked once and then its limit moves in, so no cell is visited twice.",
  "The two checks in the middle handle a single leftover row or column. After the top row of a one-row ring, top > bottom, so the bottom row (the same row) must not be walked back.",
  "Every cell is appended exactly once: O(R × C) time, and no extra space beyond the answer.",
  "Test grids that are not square, such as 3 × 4 and 4 × 3. A square grid hides the missing-check bug.",
];
