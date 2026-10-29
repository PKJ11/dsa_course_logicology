// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def two_teams(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    side = [-1] * n
    parent = [-1] * n
    for s in range(n):                 # every part of the graph
        if side[s] != -1:
            continue
        side[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if side[v] == -1:
                    side[v] = 1 - side[u]
                    parent[v] = u
                    q.append(v)
                elif side[v] == side[u]:
                    # u and v are on the same level: walk up until the routes meet
                    a, b = [u], [v]
                    while a[-1] != b[-1]:
                        a.append(parent[a[-1]])
                        b.append(parent[b[-1]])
                    return (False, a + b[-2::-1])
    return (True, side)
`;

export const notes = [
  "Breadth-first search gives each vertex the team opposite to the vertex that reached it, so a vertex's team is its level's parity (even or odd distance from the start). Every part of the graph gets its own start.",
  "An edge that joins two vertices of the same team must join two vertices of the same level: BFS levels of two neighbours differ by at most 1, and equal parity then means equal level.",
  "Both vertices are k levels below the place where their routes from the start meet. Walking up both lists of parents one step at a time reaches that place at the same moment. The cycle is u up to the meeting place, down to v, and the edge v–u back: k + k + 1 edges, an odd number.",
  "`a + b[-2::-1]` joins the two walks: a runs from u up to the meeting place, and b reversed (without its last item, the meeting place again) runs down to v. The whole method is O(V + E), with no recursion.",
];
