// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def are_shortest(n, edges, s, d):
    if d[s] != 0:
        return False
    tight = [[] for _ in range(n)]         # lines with d[v] == d[u] + w
    for u, v, w in edges:
        if d[u] is None:
            continue                       # lines out of unreachable stations
        if d[v] is None or d[u] + w < d[v]:
            return False                   # this line gives a shorter way to v
        if d[u] + w == d[v]:
            tight[u].append(v)
    # every station with a number must be reached from s along tight lines
    seen = [False] * n
    seen[s] = True
    q = deque([s])
    while q:
        u = q.popleft()
        for v in tight[u]:
            if not seen[v]:
                seen[v] = True
                q.append(v)
    return all(seen[v] == (d[v] is not None) for v in range(n))
`;

export const notes = [
  "Two facts make a list d the true distances. First, no line can make anything shorter: d[v] <= d[u] + w for every line u → v from a reachable station. Along a shortest route to any v this gives d[v] <= the true distance, step by step from d[s] = 0.",
  "Second, every value is made by a real route. Each tight line (d[v] == d[u] + w) adds exactly its time, so if v is reached from s along tight lines, d[v] is the time of that route, which is at least the true distance. Both together give d[v] equal to the true distance.",
  "Checking only that each value has some tight line coming in is not enough. With lines of 0 minutes, tight lines can go round a loop that never starts from s (the test 'Zero-minute lines in a loop'). The breadth-first search along tight lines is what rules that out.",
  "A station that cannot be reached must be None, and the search along tight lines also checks that: it reaches exactly the stations with numbers. Every line is read once and the search is O(V + E), with no heap. Running Dijkstra's method and comparing is also correct, and costs O((V + E) log V).",
];
