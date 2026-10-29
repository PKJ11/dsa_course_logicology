// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def group_of(n, streets, s):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]          # the streets turned round
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)

    def reach(adj):                        # everything reachable from s
        seen = [False] * n
        seen[s] = True
        stack = [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
        return seen

    f = reach(out)                         # s can drive to v
    b = reach(back)                        # v can drive to s
    return [v for v in range(n) if f[v] and b[v]]
`;

export const notes = [
  "v is in the group of s exactly when s reaches v and v reaches s. The first search answers the first question for every v at once.",
  "For the second question, turn every street round. A path from v to s along the streets is a path from s to v along the turned-round streets, so one more search from s answers it for every v at once.",
  "Two searches and one pass over the junctions: O(V + E). Going through 0 to n − 1 at the end gives the answer in increasing order with no sort.",
  "The searches use a list as a stack, not recursion, because a ring of 100,000 junctions is 100,000 calls deep. Any order of search works here: only what is reached matters, not the order.",
];
