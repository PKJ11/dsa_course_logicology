// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def flow_value(n, lines, flow, s, t):
    if len(flow) != len(lines):
        return None
    net = [0] * n                          # flow out minus flow in
    for (u, v, c), f in zip(lines, flow):
        if f < 0 or f > c:                 # the capacity rule
            return None
        net[u] += f
        net[v] -= f
    for v in range(n):
        if v != s and v != t and net[v] != 0:
            return None                    # conservation is broken at v
    return net[s]
`;

export const notes = [
  "Both rules are checked in one pass over the lines. The capacity rule looks at one line at a time. Conservation needs, for each station, the total in and the total out, so keep one running number per station: out minus in.",
  "A line from u to itself adds f to net[u] and takes it away again, so it never breaks conservation, though it must still keep within its capacity.",
  "The value is the flow out of s minus the flow into s. Adding up net over all stations gives 0 (each line adds f once and takes it once), and every station but s and t has net 0, so net[s] = −net[t]: what leaves the source is what reaches the sink.",
  "O(V + E). Looping over all lines once for each station to find its in and out is O(V · E), which is 10 billion steps on the big tests.",
];
