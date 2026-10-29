// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def two_sat(n, rules):
    N = 2 * n                              # 2(k-1): k is yes; 2(k-1)+1: k is no
    def node(lit):
        return 2 * (lit - 1) if lit > 0 else 2 * (-lit - 1) + 1
    adj = [[] for _ in range(N)]
    for a, b in rules:
        x, y = node(a), node(b)
        adj[x ^ 1].append(y)               # not a -> b
        adj[y ^ 1].append(x)               # not b -> a
    # Tarjan's method with our own stack of (vertex, iterator)
    index = [0] * N
    low = [0] * N
    on = [False] * N
    comp = [-1] * N
    stack = []
    t = 0
    count = 0
    for s in range(N):
        if index[s]:
            continue
        t += 1
        index[s] = low[s] = t
        stack.append(s)
        on[s] = True
        path = [(s, iter(adj[s]))]
        while path:
            u, it = path[-1]
            for v in it:
                if not index[v]:
                    t += 1
                    index[v] = low[v] = t
                    stack.append(v)
                    on[v] = True
                    path.append((v, iter(adj[v])))
                    break
                if on[v]:
                    low[u] = min(low[u], index[v])
            else:
                path.pop()
                if path:
                    p = path[-1][0]
                    low[p] = min(low[p], low[u])
                if low[u] == index[u]:     # u is the first of its group
                    while True:
                        x = stack.pop()
                        on[x] = False
                        comp[x] = count
                        if x == u:
                            break
                    count += 1
    ans = []
    for k in range(n):
        yes, no = comp[2 * k], comp[2 * k + 1]
        if yes == no:
            return None
        ans.append(yes < no)               # Tarjan numbers later groups first
    return ans
`;

export const notes = [
  "Each rule 'a or b' becomes two edges of the implication graph: not a → b and not b → a. An edge x → y means: if x holds, y must hold. With yes and no for each question side by side, the opposite of vertex x is x ^ 1.",
  "If 'k is yes' and 'k is no' are in the same strongly connected group, each forces the other, so no choice works: return None. Lesson 4 proves the other direction too: if no question has both in one group, a choice exists.",
  "The choice: answer yes when the group of 'k is yes' comes later in topological order than the group of 'k is no'. Tarjan's method finishes groups from the last to the first in topological order, so a smaller Tarjan number means later: yes < no.",
  "Why it works, in short: the implication graph is symmetric (x → y exactly when not y → not x), so choosing the later group of each pair never makes a true condition force a false one (lesson 4 has the proof).",
  "One search over 2n vertices and 2m edges: O(n + m). The search uses its own stack, because the implication graph of a chain of rules is a path 100,000 vertices long.",
];
