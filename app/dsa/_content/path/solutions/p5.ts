// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import math

def cheapest_routes(n, edges, queries):
    d = [[math.inf] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]   # nxt[i][j]: the first step from i towards j
    for i in range(n):
        d[i][i] = 0
        nxt[i][i] = i
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w                    # keep the cheaper of two lines
            nxt[u][v] = v
    for k in range(n):                     # k: now allowed in the middle
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == math.inf:
                continue                   # i cannot reach k: nothing changes
            row = d[i]
            new = [dik + b if dik + b < a else a for a, b in zip(row, dk)]
            if new != row:                 # only rows that got cheaper need new first steps
                nik = nxt[i][k]            # going through k starts like going to k
                nxt[i] = [x if c == a else nik for a, c, x in zip(row, new, nxt[i])]
                d[i] = new
    if any(d[i][i] < 0 for i in range(n)):
        return None                        # a loop below 0
    out = []
    for i, j in queries:
        if d[i][j] == math.inf:
            out.append(None)
            continue
        route = [i]
        while route[-1] != j:              # follow first steps until j
            route.append(nxt[route[-1]][j])
        out.append(route)
    return out
`;

export const notes = [
  "Floyd–Warshall (lesson 5) with a second table: nxt[i][j] is the first station after i on the cheapest route found so far from i to j. A direct line sets it to j.",
  "When going through k makes d[i][j] cheaper, the new route starts the way the route from i to k starts, so nxt[i][j] becomes nxt[i][k]. Both tables are updated row by row with list comprehensions, which run at C speed; k must be the outer loop, for the reason the lesson proves.",
  "To list a route, start at i and keep taking the first step towards j. Each step lands on a station whose cheapest route to j is one line shorter, so the walk ends at j, even when some loops cost exactly 0. Following 'any line that keeps the cost' instead can go round a loop of free lines for ever (the test 'Free lines both ways').",
  "A loop below 0 shows up as d[i][i] < 0. Cost: O(n³) time and O(n²) memory for the tables, plus O(n) per route listed.",
];
