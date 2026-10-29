// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def fastest(n, edges, s, t):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    parent = [-1] * n
    dist[s] = 0
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                       # an old entry: u was settled already
        if u == t:
            break                          # t's time is final
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                parent[v] = u
                heapq.heappush(heap, (d + w, v))
    if dist[t] == INF:
        return None
    route = [t]
    while route[-1] != s:
        route.append(parent[route[-1]])
    return (dist[t], route[::-1])
`;

export const notes = [
  "Dijkstra's method: take the unsettled station with the smallest time, settle it, and offer better times to its neighbours. With no negative times, the smallest time in the heap can never be improved later, because any other way to that station passes a station whose time is at least as big (lesson 3's proof).",
  "heapq has no 'lower this entry' operation, so a better time is pushed as a new entry and the old one stays in the heap. When an entry comes out with `d > dist[u]`, it is old: skip it. Without the skip, a station that was offered better times many times is handled many times, and each time all its lines are read again (the 'busy station' test).",
  "`parent[v]` remembers the station that gave v its best time. When t is taken out, its time is final, so the search can stop there; walking the parents back from t gives the route.",
  "Cost: each line can push one entry, so the heap holds at most E entries, and each push or pop costs O(log E) = O(log V). The total is O((V + E) log V). Scanning all stations for the smallest time instead costs O(V) per station, O(V²) in all: fine for dense networks, far too slow for 100,000 stations with few lines.",
];
