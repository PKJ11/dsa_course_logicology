// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TaskQueue:
    def __init__(self):
        self.heap = []          # entries [priority, count, task]
        self.entry = {}         # task -> its live entry
        self.count = 0          # arrival number, to break ties

    def add(self, task, priority):
        if task in self.entry:
            self.entry.pop(task)[2] = None      # mark the old entry removed
        e = [priority, self.count, task]
        self.count += 1
        self.entry[task] = e
        a = self.heap
        a.append(e)
        i = len(a) - 1
        while i > 0:
            p = (i - 1) // 2
            if a[i] < a[p]:
                a[i], a[p] = a[p], a[i]
                i = p
            else:
                break

    def remove(self, task):
        if task not in self.entry:
            return False
        self.entry.pop(task)[2] = None          # lazy: leave it in the heap
        return True

    def _pop(self):
        a = self.heap
        last = a.pop()
        if not a:
            return last
        top = a[0]
        a[0] = last
        i, n = 0, len(a)
        while True:
            l = 2 * i + 1
            if l >= n:
                break
            c = l + 1 if l + 1 < n and a[l + 1] < a[l] else l
            if a[c] < a[i]:
                a[i], a[c] = a[c], a[i]
                i = c
            else:
                break
        return top

    def pop(self):
        while self.heap:
            e = self._pop()
            if e[2] is not None:                # skip removed entries
                del self.entry[e[2]]
                return e[2]
        return None

    def __len__(self):
        return len(self.entry)
`;

export const notes = [
  "Each entry is a list [priority, count, task]. Lists compare item by item, so a smaller priority wins, and on equal priorities the smaller count (the earlier arrival) wins. The counts are all different, so the task names are never compared.",
  "Removing an entry from the middle of a heap would mean finding it first: O(n). Instead, `remove` sets the entry's task to None and leaves it where it is. `pop` throws such entries away when they reach the top. This is the method in the heapq documentation.",
  "Changing a priority is a remove followed by a fresh add, so the task gets a new count: it goes behind tasks that already had that priority.",
  "The dict `entry` gives each task's live entry in O(1), and `len` counts only live tasks. Every operation is O(log n), counting each removed entry's single trip out of the heap.",
  "With heapq allowed, `_pop` and the sift-up are `heapq.heappop` and `heapq.heappush` on the same list.",
];
