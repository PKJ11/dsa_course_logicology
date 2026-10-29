from solgen import write_station

write_station("heap", 6, {
    1: ('''class MinHeap:
    def __init__(self):
        self.a = []                      # the heap, stored level by level

    def __len__(self):
        return len(self.a)

    def peek(self):
        return self.a[0]                 # the root is the smallest

    def push(self, x):
        a = self.a
        a.append(x)                      # the next free place on the bottom level
        i = len(a) - 1
        while i > 0:                     # sift up
            p = (i - 1) // 2
            if a[i] < a[p]:
                a[i], a[p] = a[p], a[i]
                i = p
            else:
                break

    def pop(self):
        a = self.a
        last = a.pop()                   # take the last value off the end
        if not a:
            return last                  # it was the only one
        top = a[0]
        a[0] = last                      # put it in the root's place
        i, n = 0, len(a)
        while True:                      # sift down
            l = 2 * i + 1
            if l >= n:
                break
            c = l                        # the smaller child
            if l + 1 < n and a[l + 1] < a[l]:
                c = l + 1
            if a[c] < a[i]:
                a[i], a[c] = a[c], a[i]
                i = c
            else:
                break
        return top
''', [
        "The heap lives in a plain list: the children of position i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2. No node objects or links are needed.",
        "`push` adds the value at the end, which keeps the tree complete, then swaps it upwards while it is smaller than its parent. Only the path from the new leaf to the root can be out of order.",
        "`pop` takes the root, moves the last value into its place, then swaps it downwards with its smaller child until neither child is smaller. Swapping with the smaller child is what keeps both children's subtrees in order.",
        "The tree has about log₂ n levels, so push and pop cost O(log n) comparisons and swaps; `peek` and `len` are O(1).",
    ]),
    2: ('''def sift_down(a, i, n):
    while True:
        l = 2 * i + 1
        if l >= n:
            return
        c = l
        if l + 1 < n and a[l + 1] < a[l]:
            c = l + 1
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return


def heapify(a):
    # positions n // 2 .. n - 1 are leaves: already heaps of one value
    for i in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, i, len(a))
''', [
        "Work from the last parent back to the root. When `sift_down(a, i, n)` runs, both children of i are already the roots of heaps, so pushing a[i] down to its place makes the subtree at i a heap too.",
        "Most nodes are near the bottom, where a sift-down is short. Half the nodes are leaves (no work), a quarter sift down at most one level, an eighth at most two, and so on. The total is less than n swaps and less than 2n comparisons: O(n).",
        "Pushing the values one by one sifts each new value up, and on a decreasing list every value moves up to the root: O(n log n).",
        "The list is changed in place and nothing is returned, the same as `heapq.heapify`.",
    ]),
    3: ('''class TaskQueue:
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
''', [
        "Each entry is a list [priority, count, task]. Lists compare item by item, so a smaller priority wins, and on equal priorities the smaller count (the earlier arrival) wins. The counts are all different, so the task names are never compared.",
        "Removing an entry from the middle of a heap would mean finding it first: O(n). Instead, `remove` sets the entry's task to None and leaves it where it is. `pop` throws such entries away when they reach the top. This is the method in the heapq documentation.",
        "Changing a priority is a remove followed by a fresh add, so the task gets a new count: it goes behind tasks that already had that priority.",
        "The dict `entry` gives each task's live entry in O(1), and `len` counts only live tasks. Every operation is O(log n), counting each removed entry's single trip out of the heap.",
        "With heapq allowed, `_pop` and the sift-up are `heapq.heappop` and `heapq.heappush` on the same list.",
    ]),
    4: ('''def sift_down(h, i, n):
    while True:
        l = 2 * i + 1
        if l >= n:
            return
        c = l
        if l + 1 < n and h[l + 1] < h[l]:
            c = l + 1
        if h[c] < h[i]:
            h[i], h[c] = h[c], h[i]
            i = c
        else:
            return


def top_k(nums, k):
    if k == 0:
        return []
    h = list(nums[:k])                       # a min-heap of the k largest so far
    for i in range(k // 2 - 1, -1, -1):
        sift_down(h, i, k)
    for x in nums[k:]:
        if x > h[0]:                         # bigger than the smallest of them
            h[0] = x
            sift_down(h, 0, k)
    out = []
    n = k
    while n:                                 # pop smallest first ...
        out.append(h[0])
        n -= 1
        h[0] = h[n]
        sift_down(h, 0, n)
    out.reverse()                            # ... then reverse: largest first
    return out
''', [
        "Keep the k largest values seen so far in a min-heap. Its root is the smallest of them: the value to beat.",
        "A new value that is not bigger than the root cannot be among the k largest, and costs one comparison. A bigger value replaces the root and sifts down: O(log k).",
        "For values in a random order, replacements become rare as the scan goes on, so the total is close to n comparisons. In the worst case (increasing input) it is O(n log k). Space is O(k), so this also works on a stream too big to keep.",
        "At the end, popping the heap gives the k values smallest first; reversing gives largest first. With heapq this whole function is `heapq.nlargest(k, nums)`.",
    ]),
    5: ('''def merge_k(lists):
    # heap entries (value, list number, position in that list)
    h = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    n = len(h)

    def down(i):
        while True:
            l = 2 * i + 1
            if l >= n:
                return
            c = l + 1 if l + 1 < n and h[l + 1] < h[l] else l
            if h[c] < h[i]:
                h[i], h[c] = h[c], h[i]
                i = c
            else:
                return

    for i in range(n // 2 - 1, -1, -1):
        down(i)
    out = []
    while n:
        v, li, j = h[0]
        out.append(v)
        if j + 1 < len(lists[li]):
            h[0] = (lists[li][j + 1], li, j + 1)   # the next value from that list
        else:
            n -= 1                                 # that list is used up
            h[0] = h[n]
            h.pop()
        down(0)
    return out
''', [
        "The heap holds one entry per list that still has values: its front value, plus where it came from. The smallest of all the front values is always at the root.",
        "Take the root, then replace it with the next value from the same list and sift down. When a list runs out, move the last entry into the root instead and shrink the heap.",
        "Entries are tuples, so equal values are ordered by list number and the comparison never needs anything else. n values each cost O(log k): O(n log k) in total, with O(k) extra space besides the output.",
        "`heapq.merge(*lists)` does the same job lazily: it returns an iterator, so it can merge files too big for memory.",
    ]),
    6: ('''def push(a, x):
    a.append(x)
    i = len(a) - 1
    while i > 0:
        p = (i - 1) // 2
        if a[i] < a[p]:
            a[i], a[p] = a[p], a[i]
            i = p
        else:
            return


def pop(a):
    last = a.pop()
    if not a:
        return last
    top = a[0]
    a[0] = last
    i, n = 0, len(a)
    while True:
        l = 2 * i + 1
        if l >= n:
            return top
        c = l + 1 if l + 1 < n and a[l + 1] < a[l] else l
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return top


class MedianFinder:
    def __init__(self):
        self.low = []        # the smaller half, as a max-heap of negated values
        self.high = []       # the larger half, as a min-heap

    def add(self, x):
        if not self.low or x <= -self.low[0]:
            push(self.low, -x)
        else:
            push(self.high, x)
        # keep the sizes equal, or low one bigger
        if len(self.low) > len(self.high) + 1:
            push(self.high, -pop(self.low))
        elif len(self.high) > len(self.low):
            push(self.low, -pop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
''', [
        "Two halves: `low` holds the smaller values and `high` the larger ones. Every value in low is at most every value in high, and low has the same size as high or one more.",
        "Then the median is at the tops: the top of low when the count is odd, or the average of the two tops when it is even. `median` is O(1).",
        "There is only a min-heap here, so low stores negated values: the smallest of the negated values is the largest of the real ones. In Python 3.14 the heapq module also has `heappush_max` and `heappop_max` for this.",
        "`add` puts the value in the correct half (one comparison with low's top), then moves at most one value across to fix the sizes. That is a constant number of pushes and pops: O(log n).",
    ]),
})
