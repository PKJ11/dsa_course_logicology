// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def cheapest_trip(x, c):
    n = len(x)
    best = [0] * n
    ms = [-2 * x[0]]                   # line k: y = ms[k] * X + bs[k]
    bs = [x[0] * x[0]]
    head = 0
    for j in range(1, n):
        X = x[j]
        # queries move right: drop lines from the front once the next one is lower
        while head + 1 < len(ms) and ms[head + 1] * X + bs[head + 1] <= ms[head] * X + bs[head]:
            head += 1
        best[j] = ms[head] * X + bs[head] + X * X + c
        m, b = -2 * X, best[j] + X * X
        # slopes fall: the last line is never lowest if the new one passes under it
        # before it passes under the line before it
        while len(ms) - head >= 2 and (b - bs[-2]) * (ms[-2] - ms[-1]) <= (bs[-1] - bs[-2]) * (ms[-2] - m):
            ms.pop()
            bs.pop()
        ms.append(m)
        bs.append(b)
    return best[n - 1]
`;

export const notes = [
  "best[j] = x[j]² + c + the smallest (−2·x[i]) · x[j] + (best[i] + x[i]²) over earlier stops i (lesson 6). Each earlier stop is a line with slope −2·x[i] and height best[i] + x[i]², read at X = x[j].",
  "Positions rise, so the slopes fall and the questions move right. The kept lines are a list with a front index head. For a question, the front moves on while the next line is at least as low at X: it will never be needed again.",
  "A new line removes the last kept line while it passes under the line before it no later than the last line does. With slopes m1 > m2 > m3 the test is (b3 − b1)(m1 − m2) ≤ (b2 − b1)(m1 − m3), the two crossing points compared by multiplying across, so no division and no rounding.",
  "Each line is added once and removed at most once: O(n) in all, against O(n²) for trying every earlier stop.",
];
