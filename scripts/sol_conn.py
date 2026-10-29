from solgen import write_station

P2 = '''def scc(n, streets):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]          # the streets turned round
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)
    # first search: the finish order, with a stack of (vertex, iterator)
    seen = [False] * n
    order = []
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(out[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(out[v])))
                    break
            else:
                stack.pop()
                order.append(u)            # u finishes
    # second pass: latest finish first, along the turned-round streets
    group = [-1] * n
    c = 0
    for s in reversed(order):
        if group[s] != -1:
            continue
        group[s] = c
        stack = [s]
        while stack:
            u = stack.pop()
            for v in back[u]:
                if group[v] == -1:
                    group[v] = c
                    stack.append(v)
        c += 1                             # one search, one group
    return group
'''

write_station("conn", 4, {
    1: ('''def group_of(n, streets, s):
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
''', [
        "v is in the group of s exactly when s reaches v and v reaches s. The first search answers the first question for every v at once.",
        "For the second question, turn every street round. A path from v to s along the streets is a path from s to v along the turned-round streets, so one more search from s answers it for every v at once.",
        "Two searches and one pass over the junctions: O(V + E). Going through 0 to n − 1 at the end gives the answer in increasing order with no sort.",
        "The searches use a list as a stack, not recursion, because a ring of 100,000 junctions is 100,000 calls deep. Any order of search works here: only what is reached matters, not the order.",
    ]),
    2: (P2, [
        "This is Kosaraju's method (lesson 2). The first search records the order in which vertices finish. Lesson 2 proves that if a street leads from group X to a different group Y, the last finish in X is later than the last finish in Y.",
        "So the vertex that finished last is in a group that no other group's street leads into: a first group in topological order. Searching from it along the turned-round streets reaches exactly its own group, because any street that leaves the group in the turned-round graph would be a street into the group in the real one.",
        "Then take the next vertex (by latest finish) that has no group yet, and repeat. Streets to groups already found are ignored, which is why each later search also stays inside its own group. The groups are found in topological order, so numbering them 0, 1, 2, … as they are found gives group[u] <= group[v] for every street.",
        "Both passes use their own stack. The first needs the (vertex, iterator) form from GRPH-P3, because the finish order matters; the second only needs to reach, so a plain stack is enough. O(V + E) in all.",
        "Tarjan's method also works in one search, but it finishes the groups in reverse topological order: with Tarjan, return count − 1 − c.",
    ]),
    3: ('''def weak_points(n, lines):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(lines):
        if u != v:                         # a line to itself joins nothing
            adj[u].append((v, i))
            adj[v].append((u, i))
    disc = [0] * n                         # discovery number; 0 = not reached
    low = [0] * n
    cut = [False] * n
    bridges = []
    t = 0
    for s in range(n):
        if disc[s]:
            continue
        t += 1
        disc[s] = low[s] = t
        children = 0
        stack = [(s, -1, iter(adj[s]))]    # (station, line it came by, iterator)
        while stack:
            u, came, it = stack[-1]
            for v, i in it:
                if i == came:
                    continue               # not the line we arrived by
                if disc[v]:
                    low[u] = min(low[u], disc[v])
                else:
                    t += 1
                    disc[v] = low[v] = t
                    stack.append((v, i, iter(adj[v])))
                    break
            else:
                stack.pop()                # u is finished
                if stack:
                    p = stack[-1][0]
                    low[p] = min(low[p], low[u])
                    if low[u] > disc[p]:
                        bridges.append(came)
                    if p == s:
                        children += 1
                    elif low[u] >= disc[p]:
                        cut[p] = True
        if children >= 2:
            cut[s] = True
    bridges.sort()
    return bridges, [v for v in range(n) if cut[v]]
''', [
        "In a search of an undirected network every line is a tree line or a line back up to a station still on the path (GRPH-3). low[u] is the smallest discovery number that u's part of the search tree can reach with one line back up.",
        "The tree line p–v is a bridge exactly when low[v] > disc[p]: nothing in v's part has a line back to p or above, so closing p–v cuts that part off. If some line did lead back to p or above, it would make a loop with p–v, and a line on a loop is never a bridge.",
        "A station p other than the start is a cut station exactly when some child v has low[v] >= disc[p]: v's part can get back to p but not above it, so closing p cuts that part off from the stations above p. The start has nothing above it; it is a cut station when it has two or more children, because the search could not get from one child's part to the other's except through the start.",
        "Skip the line you arrived by, by its position, not the parent station. A second line to the parent is a real second way, and then neither line is a bridge.",
        "Each station is pushed once and each line is looked at twice (once from each end): O(V + E). The stack holds the line each station came by, so the bridge can be reported by its position.",
    ]),
    4: ('''def two_sat(n, rules):
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
''', [
        "Each rule 'a or b' becomes two edges of the implication graph: not a → b and not b → a. An edge x → y means: if x holds, y must hold. With yes and no for each question side by side, the opposite of vertex x is x ^ 1.",
        "If 'k is yes' and 'k is no' are in the same strongly connected group, each forces the other, so no choice works: return None. Lesson 4 proves the other direction too: if no question has both in one group, a choice exists.",
        "The choice: answer yes when the group of 'k is yes' comes later in topological order than the group of 'k is no'. Tarjan's method finishes groups from the last to the first in topological order, so a smaller Tarjan number means later: yes < no.",
        "Why it works, in short: the implication graph is symmetric (x → y exactly when not y → not x), so choosing the later group of each pair never makes a true condition force a false one (lesson 4 has the proof).",
        "One search over 2n vertices and 2m edges: O(n + m). The search uses its own stack, because the implication graph of a chain of rules is a path 100,000 vertices long.",
    ]),
})
