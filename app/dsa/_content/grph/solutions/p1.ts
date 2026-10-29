// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def direct_lines(n, edges, queries):
    adj = [set() for _ in range(n)]    # one set of neighbours per vertex
    for u, v in edges:
        adj[u].add(v)                  # lines go both ways
        adj[v].add(u)
    return [v in adj[u] for u, v in queries]
`;

export const notes = [
  "Adjacency sets: one set of neighbours per vertex. Building them reads each edge once, O(V + E) time and memory. A repeated edge is stored once, because a set keeps one copy.",
  "`v in adj[u]` asks a set, which takes about the same time however many neighbours u has (HASH). With lists, the same question reads the list from the start: on the hub test that is up to 200,000 reads per question.",
  "An adjacency matrix also answers in O(1), but it needs n² entries: 10¹⁰ for 100,000 vertices. Sets need memory only for the edges that exist.",
  "Another way is one set of pairs: `lines = {(u, v) for u, v in edges} | {(v, u) for u, v in edges}`, then `(u, v) in lines`. It is just as fast; the sets per vertex also give the neighbours, which a search needs.",
];
