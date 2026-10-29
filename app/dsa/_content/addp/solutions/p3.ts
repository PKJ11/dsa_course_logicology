// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def cheapest_cuts(length, marks):
    p = [0] + sorted(marks) + [length]
    m = len(p)
    best = [[0] * m for _ in range(m)]       # best[i][j]: cut the piece p[i]..p[j] at every mark inside
    for gap in range(2, m):                  # shorter pieces first
        for i in range(m - gap):
            j = i + gap
            best[i][j] = p[j] - p[i] + min(best[i][k] + best[k][j] for k in range(i + 1, j))
    return best[0][m - 1]
`;

export const notes = [
  "Sort the marks and add the two ends: p[0] = 0, then the marks, then length. Every piece made during the cutting is a stretch from p[i] to p[j], and it still has to be cut at the points strictly between i and j.",
  "The first cut on the piece p[i]..p[j] is at some p[k] with i < k < j. It costs the length p[j] − p[i] whatever k is, and leaves two pieces that are cut independently. So best[i][j] = p[j] − p[i] + the smallest best[i][k] + best[k][j]; a piece with no point inside costs 0.",
  "The table is filled by gap = j − i, shortest first, so both smaller pieces are ready (lesson 3). Cost: O(m³) for m points, about 560,000 split checks for 150 marks.",
  "Knuth's rule (lesson 6) holds for this cost too and would bring it to O(m²). Memoised recursion on (i, j) is also fine at this size.",
];
