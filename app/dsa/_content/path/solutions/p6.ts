// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def dag_routes(n, edges, s):
    M = 1_000_000_007
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indeg[v] += 1
    order = []                             # Kahn's method (GRPH-5)
    q = deque(v for v in range(n) if indeg[v] == 0)
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    dist = [None] * n
    ways = [0] * n
    dist[s], ways[s] = 0, 1
    for u in order:                        # every line into u is done by now
        if dist[u] is None:
            continue
        for v, w in adj[u]:
            nd = dist[u] + w
            if dist[v] is None or nd < dist[v]:
                dist[v], ways[v] = nd, ways[u]    # a cheaper way: start counting again
            elif nd == dist[v]:
                ways[v] = (ways[v] + ways[u]) % M  # just as cheap: add its routes
    return (dist, ways)
`;

export const notes = [
  "In a DAG, a topological order puts every line forward. Going through the stations in that order, all lines into a station have been offered before the station is reached, so its time and its count are final when its own lines are handled. That is the DP order of DYNP-3, and why negative times are no problem here.",
  "The count follows the time. A cheaper offer replaces both the time and the count. An equally cheap offer adds the giver's count: every cheapest route to v ends with one line into v, and the cheapest routes to v through u are exactly the cheapest routes to u, followed by that line.",
  "Stations before s in the order, and stations s cannot reach, keep None and 0. A line from such a station is skipped, because `dist[u] is None`.",
  "Kahn's method needs no recursion, so the chain of 100,000 is no problem. The whole method is O(V + E). Recursion with a memo is the same DP in the other direction (asking each station's incoming lines), but it is 100,000 calls deep on the chain.",
];
