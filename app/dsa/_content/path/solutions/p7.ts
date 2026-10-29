// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def moves_needed(start, goal, walls):
    blocked = set(map(tuple, walls))
    gx, gy = goal
    def h(x, y):                           # a guess that is never too high
        return abs(x - gx) + abs(y - gy)
    start = tuple(start)
    g = {start: 0}                         # best moves found so far
    heap = [(h(*start), 0, start)]         # (f, -g, square)
    while heap:
        f, neg, p = heapq.heappop(heap)
        d = -neg
        if d > g[p]:
            continue                       # an old entry
        if p == (gx, gy):
            return d
        x, y = p
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q in blocked:
                continue
            if d + 1 < g.get(q, d + 2):
                g[q] = d + 1
                heapq.heappush(heap, (d + 1 + h(*q), -(d + 1), q))
    return -1
`;

export const notes = [
  "A* is Dijkstra's method ordered by f = g + h instead of g, where g is the moves made so far and h is a guess of the moves still needed. The Manhattan distance |x − gx| + |y − gy| is never more than the true number of moves (each move changes x or y by 1), and it changes by at most 1 per move, so the first time the goal comes out of the heap its g is the fewest moves (lesson 7).",
  "The grid is endless, so it cannot be stored as a list. A dict `g` holds only the squares reached so far, and a set holds the walls. The problem promises the goal can be reached, so the search always ends.",
  "Ties matter. On an open grid, every square in the box between start and goal has the same f. The entries are (f, −g, square), so among equal f the square with the larger g, the one nearer the goal, comes out first, and the search walks straight to the goal. With (f, g, square) the smaller g comes first, and A* fills the whole box (1.44 million squares in the diagonal test).",
  "Breadth-first search finds the same answers, but it looks at every square closer than the goal: about 2 · d² squares for a goal d moves away. With no walls A* looks at about d squares; walls make it look at more, but only near the walls.",
];
