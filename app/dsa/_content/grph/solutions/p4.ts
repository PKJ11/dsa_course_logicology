// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def find_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    state = [0] * n          # 0 not reached, 1 on the current path, 2 finished
    parent = [-1] * n
    for s in range(n):
        if state[s]:
            continue
        state[s] = 1
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if state[v] == 0:
                    state[v] = 1
                    parent[v] = u
                    stack.append((v, iter(adj[v])))
                    break
                if state[v] == 1:      # an edge back to the path: a cycle
                    cyc = [u]
                    while cyc[-1] != v:
                        cyc.append(parent[cyc[-1]])
                    return cyc[::-1]
            else:
                stack.pop()
                state[u] = 2           # finished: no cycle through here
    return None
`;

export const notes = [
  "Three states. A vertex is on the current path (1) from the moment the search reaches it until it finishes; after that it is finished (2). An edge u → v with v on the path closes a cycle: v leads to u along the path, and u leads back to v.",
  "An edge to a finished vertex is never a cycle in a directed graph: everything a finished vertex can reach has been searched, and none of it led back to the path (lesson 4's proof). Treating every visited vertex as a cycle fails on the diamond test.",
  "The cycle is rebuilt from the parents: from u up the path until v, then turned round so it lists the edges in their direction. It runs from v to u, and the edge u → v closes it.",
  "Every vertex finishes at most once, so the search is O(V + E). Forgetting finished vertices (searching them again from every path) is correct but can take exponential time: the 40-layer test has 2⁴⁰ paths.",
];
