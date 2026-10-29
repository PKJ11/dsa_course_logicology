// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque

def cheaper_tree(n, tree, extra):
    adj = [[] for _ in range(n)]
    total = 0
    for u, v, w in tree:
        adj[u].append((v, w))
        adj[v].append((u, w))
        total += w
    a, b, w = extra
    if a == b:
        return total                       # a loop joins nothing new
    # heaviest[x]: the most expensive line on the tree path from a to x
    heaviest = [None] * n
    heaviest[a] = float('-inf')
    q = deque([a])
    while q:
        u = q.popleft()
        if u == b:
            break
        for v, c in adj[u]:
            if heaviest[v] is None:
                heaviest[v] = max(heaviest[u], c)
                q.append(v)
    h = heaviest[b]
    return total - h + w if w < h else total
`;

export const notes = [
  "The new line a–b closes exactly one loop: the tree path from a to b, plus the new line. Any spanning tree of these n lines leaves out exactly one line of that loop, because leaving out a line elsewhere would leave the loop whole, or cut the tree in two.",
  "So the cheapest choice leaves out the most expensive line of the loop. If that is the new line, the old tree stays; otherwise swap the most expensive tree line on the path for the new one. This is the cycle property of lesson 1.",
  "In a tree there is only one path between two stations, so any search from a finds it. Carrying the most expensive line seen so far along the search gives the answer for b directly, without rebuilding the path. Each station is reached once: O(n).",
  "The search uses a queue, not recursion, because the path can be 100,000 stations long. A depth-first search with your own stack works just as well.",
];
