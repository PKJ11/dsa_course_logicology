// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def most_collected(n, streets, value, s):
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]
    for u, v in streets:
        out[u].append(v)
        back[v].append(u)
    # Pass 1 (Kosaraju): finish order of a search from s, without recursion.
    seen = [False] * n
    finish = []
    seen[s] = True
    stack = [(s, 0)]
    while stack:
        v, i = stack[-1]
        if i < len(out[v]):
            stack[-1] = (v, i + 1)
            u = out[v][i]
            if not seen[u]:
                seen[u] = True
                stack.append((u, 0))
        else:
            stack.pop()
            finish.append(v)
    # Pass 2: reversed streets, latest finish first; groups come out in topological order.
    group = [-1] * n
    k = 0
    for v in reversed(finish):
        if group[v] != -1:
            continue
        group[v] = k
        todo = [v]
        while todo:
            x = todo.pop()
            for u in back[x]:
                if seen[u] and group[u] == -1:
                    group[u] = k
                    todo.append(u)
        k += 1
    worth = [0] * k                    # total value inside each group
    members = [[] for _ in range(k)]
    for v in finish:
        worth[group[v]] += value[v]
        members[group[v]].append(v)
    best = [0] * k                     # best[g]: the most collected from group g on
    # every street goes to the same group or a later one, so fill from the last group back
    for g in range(k - 1, -1, -1):
        m = 0
        for v in members[g]:
            for u in out[v]:
                h = group[u]
                if h != g and best[h] > m:
                    m = best[h]
        best[g] = worth[g] + m
    return best[group[s]]
`;

export const notes = [
  "Inside a group of junctions that reach each other both ways (CONN-1), the van can visit every junction and still leave by any street out of the group. So each group is worth the sum of its values, and the question becomes the most valuable route in the DAG of groups (lesson 2).",
  "Kosaraju's method (CONN-2), written with explicit stacks: pass 1 searches from s and records the finish order; pass 2 takes the junctions by latest finish first and gives each new group everything it reaches along reversed streets. Only junctions seen in pass 1 (reachable from s) take part. The groups come out in topological order: every street goes to the same group or a later one.",
  "So the groups are settled from the last to the first. best[g] is the group's worth plus the largest best of a group one street away (0 if none). The answer is best of s's group.",
  "Cost: O(V + E). A search that never repeats a junction misses routes that go into a loop and come back out; a rule that adds values along a walk never stops on a loop.",
];
