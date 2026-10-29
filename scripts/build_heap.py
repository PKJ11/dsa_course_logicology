import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "heap"

SIFT = """
def sift_down(a, i, n):
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

def sift_up(a, i):
    while i > 0:
        p = (i - 1) // 2
        if a[i] < a[p]:
            a[i], a[p] = a[p], a[i]
            i = p
        else:
            return
"""

MINHEAP = SIFT + """
class MinHeap:
    def __init__(self):
        self.a = []

    def __len__(self):
        return len(self.a)

    def peek(self):
        return self.a[0]

    def push(self, x):
        self.a.append(x)
        sift_up(self.a, len(self.a) - 1)

    def pop(self):
        a = self.a
        last = a.pop()
        if not a:
            return last
        top = a[0]
        a[0] = last
        sift_down(a, 0, len(a))
        return top
"""

# P1 a min-heap class
OPS = "(lambda H: [getattr(H, op[0])(*op[1:]) for op in args[0]])(MinHeap())"
SORTS = "(lambda H: (lambda xs: [[H.push(x) for x in xs], [H.pop() for _ in xs]][1])(args[0]))(MinHeap())"
CNT = ("(lambda H: (lambda xs: [[H.push(x) for x in xs], (lambda out: [out == sorted(args[0]), comparisons() <= 4 * len(xs) * __import__('math').log2(len(xs))])"
       "(plain([H.pop() for _ in xs]))][1])(counted(args[0])))(MinHeap())")
BIG = "(lambda H: (lambda xs: [[H.push(x) for x in xs], (lambda out: [out[:5], out[-1], all(out[i] <= out[i + 1] for i in range(len(out) - 1))])([H.pop() for _ in xs])][1])(args[0]))(MinHeap())"
build(S, 1, "MinHeap", [
    {"name": "Push, then pop", "args": "([('push', 5), ('push', 3), ('push', 8), ('push', 1), ('pop',), ('pop',), ('pop',), ('pop',)],)", "expr": OPS,
     "show": "push 5, 3, 8, 1; then pop four times (push returns None)", "why": "pop always returns the smallest value left: 1, 3, 5, 8."},
    {"name": "peek and len", "args": "([('push', 4), ('push', 2), ('peek',), ('__len__',), ('pop',), ('__len__',), ('peek',)],)", "expr": OPS,
     "show": "push 4, 2; peek; len(h); pop; len(h); peek", "why": "peek returns the smallest without removing it: [None, None, 2, 2, 2, 1, 4]."},
    {"name": "Repeated values", "args": "([('push', 2), ('push', 2), ('push', 1), ('push', 2), ('pop',), ('pop',), ('pop',), ('pop',)],)", "expr": OPS,
     "show": "push 2, 2, 1, 2; pop four times", "why": "Equal values are fine in a heap: 1, 2, 2, 2. A parent only has to be no bigger than its children."},
    {"name": "Negative values", "args": "([('push', -3), ('push', 10), ('push', -7), ('pop',), ('push', -20), ('pop',), ('pop',)],)", "expr": OPS,
     "show": "push -3, 10, -7; pop; push -20; pop; pop", "why": "[None, None, None, -7, None, -20, -3]."},
    {"name": "Pushes and pops mixed", "args": "([('push', 9), ('push', 4), ('pop',), ('push', 7), ('push', 1), ('push', 6), ('pop',), ('pop',), ('push', 0), ('peek',), ('__len__',)],)", "expr": OPS,
     "show": "push 9, 4; pop; push 7, 1, 6; pop; pop; push 0; peek; len(h)",
     "why": "[None, None, 4, None, None, None, 1, 6, None, 0, 3]. If a later pop is wrong, an earlier pop may have left the list out of heap order: after moving the last value to the top, sift it down to the smaller child each time."},
    {"name": "Heap sort", "args": "([(k * 37) % 101 for k in range(100)],)", "expr": f"{SORTS} == sorted(args[0])", "expect": "True",
     "show": "push 100 values in a mixed order, pop them all: sorted?", "why": "Popping everything gives the values in increasing order (this is heap sort, SORT-4)."},
    {"name": "Comparisons", "args": "(list(range(5_000, 0, -1)),)", "expr": CNT, "timeout": 4000,
     "show": "push 5,000 values from 5,000 down to 1, then pop them all: [sorted?, at most 4 n log₂ n comparisons?]",
     "why": "Each push and pop should compare only along one path of the tree: O(log n) comparisons. Finding the smallest with min() or a scan of the list costs n comparisons per pop, about 12.5 million here."},
    {"name": "30,000 values", "args": "([(k * 7919) % 30_011 for k in range(30_000)],)", "expr": BIG, "timeout": 4000,
     "show": "push 30,000 values, then pop them all: [first five, last, in order?]",
     "why": "60,000 operations at O(log n) each. If this timed out, look for list.insert, list.pop(0), sorting, or a scan of the whole list inside push or pop."},
], trusted=MINHEAP)

# P2 heapify in place, O(n)
OKHEAP = "all(a[(i - 1) // 2] <= a[i] for i in range(1, len(a)))"
HY = f"(lambda a: [heapify(a), {OKHEAP}, sorted(a) == sorted(args[0])][1:])(list(args[0]))"
HC = f"(lambda a: [heapify(a), comparisons() <= 3 * len(a), (lambda a: {OKHEAP})(plain(a))][1:])(counted(args[0]))"
build(S, 2, "heapify", [
    {"name": "Small list", "args": "([5, 3, 8, 1, 9, 2],)", "expr": HY, "show": "heapify [5, 3, 8, 1, 9, 2]: [is it now a min-heap?, same values?]",
     "why": "After heapify(a), every a[i] must be at least its parent a[(i - 1) // 2]. Work in place: change the list you were given, and return nothing."},
    {"name": "Empty and one", "args": "()", "expr": "(lambda a, b: [heapify(a), heapify(b), a, b][2:])([], [7])", "show": "heapify [] and [7]", "why": "Nothing to do: [] and [7]. Lists of length 0 and 1 are already heaps."},
    {"name": "Already a heap", "args": "([1, 2, 3, 4, 5, 6, 7],)", "expr": HY, "show": "heapify [1, 2, 3, 4, 5, 6, 7]", "why": "A sorted list is already a min-heap, and stays one."},
    {"name": "Decreasing", "args": "([8, 7, 6, 5, 4, 3, 2, 1],)", "expr": HY, "show": "heapify [8, 7, 6, 5, 4, 3, 2, 1] (lesson 3's figure)",
     "why": "Every value has to move. Sift down from the last parent, position n // 2 − 1, back to the root."},
    {"name": "Repeated values", "args": "([3, 1, 3, 1, 3, 1, 2],)", "expr": HY, "show": "heapify [3, 1, 3, 1, 3, 1, 2]", "why": "Equal values may stay in either order; only the parent ≤ child rule matters."},
    {"name": "Kept in place", "args": "([4, 1, 3],)", "expr": "(lambda a: [heapify(a), a[0]][1])(list(args[0]))", "show": "heapify [4, 1, 3], then read a[0] from the same list",
     "why": "The smallest value, 1, must be at a[0] of the list you were given. If you built a new list, the caller never sees it."},
    {"name": "Comparisons, decreasing", "args": "(list(range(10_000, 0, -1)),)", "expr": HC, "timeout": 4000,
     "show": "heapify 10,000 values from 10,000 down to 1: [at most 3n comparisons?, a heap?]",
     "why": "Sifting down from the middle costs fewer than 2n comparisons (lesson 3). Pushing the values one at a time and sifting each one up costs about n log₂ n here, around 110,000, because every new value moves up to the root."},
    {"name": "Comparisons, mixed", "args": "([(k * 7919) % 10_007 for k in range(10_000)],)", "expr": HC, "timeout": 4000,
     "show": "heapify 10,000 values in a mixed order: [at most 3n comparisons?, a heap?]", "why": "O(n) comparisons whatever the order."},
    {"name": "200,000 values", "args": "([(k * 7919) % 200_003 for k in range(200_000)],)", "expr": f"(lambda a: [heapify(a), a[0], {OKHEAP}][1:])(list(args[0]))", "timeout": 3000,
     "show": "heapify 200,000 values: [smallest, a heap?]", "why": "O(n) work. If this timed out, the code may sort, or copy slices of the list inside the loop."},
], trusted=SIFT + """
def heapify(a):
    for i in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, i, len(a))
""")

TASKQ = """
class TaskQueue:
    def __init__(self):
        self.heap = []
        self.entry = {}
        self.count = 0

    def add(self, task, priority):
        if task in self.entry:
            self.entry.pop(task)[2] = None
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
        self.entry.pop(task)[2] = None
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
            if e[2] is not None:
                del self.entry[e[2]]
                return e[2]
        return None

    def __len__(self):
        return len(self.entry)
"""

# P3 a task queue: priorities, ties by arrival, change and remove
TQ = "(lambda Q: [getattr(Q, op[0])(*op[1:]) for op in args[0]])(TaskQueue())"
TBIG = ("(lambda Q: [[Q.add(f't{k}', (k * 7919) % 1_000) for k in range(30_000)], [Q.remove(f't{k}') for k in range(0, 30_000, 3)], "
        "[Q.add(f't{k}', 500) for k in range(1, 30_000, 7)], len(Q), (lambda out: [out[:4], out[-1], len(out)])([Q.pop() for _ in range(len(Q))]), Q.pop()][3:])(TaskQueue())")
build(S, 3, "TaskQueue", [
    {"name": "Lowest priority first", "args": "([('add', 'write', 3), ('add', 'fix', 1), ('add', 'review', 2), ('pop',), ('pop',), ('pop',), ('pop',)],)", "expr": TQ,
     "show": "add write (3), fix (1), review (2); pop four times (add returns None)",
     "why": "The smallest priority number comes out first: fix, review, write. Popping an empty queue returns None."},
    {"name": "Ties: first come, first served", "args": "([('add', 'a', 5), ('add', 'b', 5), ('add', 'c', 5), ('add', 'd', 1), ('pop',), ('pop',), ('pop',), ('pop',)],)", "expr": TQ,
     "show": "add a, b, c with priority 5, then d with 1; pop four times",
     "why": "d first, then a, b, c in the order they were added. A heap alone does not keep that order; store a counter in each entry, as in (priority, count, task)."},
    {"name": "Remove", "args": "([('add', 'x', 2), ('add', 'y', 1), ('add', 'z', 3), ('remove', 'y'), ('remove', 'q'), ('__len__',), ('pop',), ('pop',), ('pop',)],)", "expr": TQ,
     "show": "add x (2), y (1), z (3); remove y; remove q (not there); len(q); pop three times",
     "why": "remove returns True for y and False for q, and len counts only the tasks still waiting: [None, None, None, True, False, 2, 'x', 'z', None]. A removed task must never come out of pop."},
    {"name": "Change a priority", "args": "([('add', 'a', 4), ('add', 'b', 2), ('add', 'a', 1), ('__len__',), ('pop',), ('pop',), ('pop',)],)", "expr": TQ,
     "show": "add a (4), b (2); add a again with priority 1; len(q); pop three times",
     "why": "Adding a task that is already waiting changes its priority: a now comes first, and only once. [None, None, None, 2, 'a', 'b', None]."},
    {"name": "Changed task goes to the back of its tie", "args": "([('add', 'p', 1), ('add', 'q', 1), ('add', 'p', 1), ('pop',), ('pop',)],)", "expr": TQ,
     "show": "add p (1), q (1); add p again with priority 1; pop twice",
     "why": "Changing a priority counts as a new arrival, so p now comes after q: ['q', 'p'] at the end."},
    {"name": "Remove, then add back", "args": "([('add', 'm', 2), ('remove', 'm'), ('remove', 'm'), ('add', 'm', 9), ('add', 'n', 3), ('pop',), ('pop',), ('__len__',)],)", "expr": TQ,
     "show": "add m (2); remove m twice; add m (9), n (3); pop twice; len(q)",
     "why": "The second remove returns False. The old entry for m must not come back: [None, True, False, None, None, 'n', 'm', 0]."},
    {"name": "30,000 tasks", "args": "()", "expr": TBIG, "timeout": 4000,
     "show": "add 30,000 tasks, remove every third, change the priority of every seventh, pop them all: [len, first four out, last out, how many out, pop on empty]",
     "why": "Each operation should cost O(log n). Removing by searching the heap list, or finding the smallest by a scan, costs O(n) each and runs out of time."},
], trusted=TASKQ)

TOPK = SIFT + """
def top_k(nums, k):
    if k == 0:
        return []
    h = list(nums[:k])
    for i in range(k // 2 - 1, -1, -1):
        sift_down(h, i, k)
    for x in nums[k:]:
        if x > h[0]:
            h[0] = x
            sift_down(h, 0, k)
    out = []
    n = k
    while n:
        out.append(h[0])
        n -= 1
        h[0] = h[n]
        sift_down(h, 0, n)
    out.reverse()
    return out
"""

# P4 top k
TK = "top_k(args[0], args[1])"
TKC = "(lambda xs: (lambda out: [plain(out), comparisons() <= 3 * len(xs)])(top_k(xs, args[1])))(counted(args[0]))"
build(S, 4, "top_k", [
    {"name": "Three largest", "args": "([5, 1, 9, 3, 7, 2, 8, 6], 3)", "expr": TK, "show": "nums [5, 1, 9, 3, 7, 2, 8, 6], k = 3", "why": "The three largest, largest first: [9, 8, 7]."},
    {"name": "k = 1", "args": "([4, -2, 11, 0], 1)", "expr": TK, "show": "nums [4, -2, 11, 0], k = 1", "why": "[11]."},
    {"name": "k = 0", "args": "([4, 2], 0)", "expr": TK, "show": "nums [4, 2], k = 0", "why": "No values: []."},
    {"name": "All of them", "args": "([3, 1, 2], 3)", "expr": TK, "show": "nums [3, 1, 2], k = 3", "why": "Every value, largest first: [3, 2, 1]."},
    {"name": "Repeated values", "args": "([5, 5, 1, 5, 2], 2)", "expr": TK, "show": "nums [5, 5, 1, 5, 2], k = 2", "why": "Repeats count separately: [5, 5]."},
    {"name": "Negative values", "args": "([-8, -3, -10, -1], 2)", "expr": TK, "show": "nums [-8, -3, -10, -1], k = 2", "why": "[-1, -3]."},
    {"name": "Comparisons", "args": "([(k * 7919) % 20_011 for k in range(20_000)], 10)", "expr": TKC, "timeout": 4000,
     "show": "20,000 values, k = 10: [the answer, at most 3n comparisons?]",
     "why": "Keep the 10 largest so far in a min-heap of size k: most values need one comparison with the heap's top. Sorting all 20,000 values costs about n log₂ n, around 280,000 comparisons, and calling max() k times costs k · n = 200,000."},
    {"name": "200,000 values", "args": "([(k * 7919) % 200_003 for k in range(200_000)], 100)", "expr": TK, "timeout": 3000,
     "show": "200,000 values, k = 100", "why": "O(n log k). If this timed out, look for sorting or a scan of the whole list inside a loop."},
], trusted=TOPK)

MERGE = """
def merge_k(lists):
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
            h[0] = (lists[li][j + 1], li, j + 1)
        else:
            n -= 1
            h[0] = h[n]
            h.pop()
        down(0)
    return out
"""

# P5 merge k sorted lists
MK = "merge_k(args[0])"
MKC = ("(lambda ls: (lambda out: (lambda c, p: [len(p), p[:5], p[-3:], all(p[i] <= p[i + 1] for i in range(len(p) - 1)), c <= 3 * 20_000 * __import__('math').log2(100)])"
       "(comparisons(), plain(out)))(merge_k(ls)))([counted(range(i, 20_000, 100)) for i in range(100)])")
build(S, 5, "merge_k", [
    {"name": "Three lists", "args": "([[1, 4, 7], [2, 5, 8], [0, 6]],)", "expr": MK, "show": "[[1, 4, 7], [2, 5, 8], [0, 6]] (lesson 5's figure)", "why": "[0, 1, 2, 4, 5, 6, 7, 8]."},
    {"name": "Empty lists", "args": "([[], [3], [], [1, 2]],)", "expr": MK, "show": "[[], [3], [], [1, 2]]", "why": "Skip empty lists when you fill the heap: [1, 2, 3]."},
    {"name": "No lists", "args": "([],)", "expr": MK, "show": "[]", "why": "Nothing to merge: []."},
    {"name": "One list", "args": "([[2, 4, 6]],)", "expr": MK, "show": "[[2, 4, 6]]", "why": "[2, 4, 6]."},
    {"name": "Different lengths", "args": "([[1], [2, 3, 4, 5, 6], [0, 10]],)", "expr": MK, "show": "[[1], [2, 3, 4, 5, 6], [0, 10]]",
     "why": "When a list runs out, its place in the heap is simply not refilled: [0, 1, 2, 3, 4, 5, 6, 10]."},
    {"name": "Ties", "args": "([[1, 3, 3], [3, 3], [2, 3]],)", "expr": MK, "show": "[[1, 3, 3], [3, 3], [2, 3]]",
     "why": "[1, 2, 3, 3, 3, 3, 3]. If you store (value, list number, position) in the heap, ties on value are broken by the list number, so the values themselves never need to be compared as anything but numbers."},
    {"name": "Comparisons", "args": "()", "expr": MKC, "timeout": 4000,
     "show": "100 sorted lists of 200 values each: [length, first five, last three, in order?, at most 3 n log₂ k comparisons?]",
     "why": "A heap of the k front values costs O(log k) comparisons per value taken. Scanning all k fronts to find the smallest costs k comparisons per value: 2,000,000 here."},
    {"name": "60,000 values", "args": "([list(range(i, 60_000, 300)) for i in range(300)],)", "expr": "(lambda out: [len(out), out[:3], out[-1], out == list(range(60_000))])(merge_k(args[0]))", "timeout": 4000,
     "show": "300 sorted lists of 200 values: [length, first three, last, equal to 0 … 59,999?]", "why": "O(n log k) in total. If this timed out, look for a scan of all k lists for every value."},
], trusted=MERGE)

MEDIAN = """
def _up(a, i):
    while i > 0:
        p = (i - 1) // 2
        if a[i] < a[p]:
            a[i], a[p] = a[p], a[i]
            i = p
        else:
            return

def _down(a, i):
    n = len(a)
    while True:
        l = 2 * i + 1
        if l >= n:
            return
        c = l + 1 if l + 1 < n and a[l + 1] < a[l] else l
        if a[c] < a[i]:
            a[i], a[c] = a[c], a[i]
            i = c
        else:
            return

def _push(a, x):
    a.append(x)
    _up(a, len(a) - 1)

def _pop(a):
    last = a.pop()
    if not a:
        return last
    top = a[0]
    a[0] = last
    _down(a, 0)
    return top

class MedianFinder:
    def __init__(self):
        self.low = []      # max-heap of the smaller half, stored negated
        self.high = []     # min-heap of the larger half

    def add(self, x):
        if not self.low or x <= -self.low[0]:
            _push(self.low, -x)
        else:
            _push(self.high, x)
        if len(self.low) > len(self.high) + 1:
            _push(self.high, -_pop(self.low))
        elif len(self.high) > len(self.low):
            _push(self.low, -_pop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
"""

# P6 median of a stream
MD = "(lambda M: [getattr(M, op[0])(*op[1:]) for op in args[0]])(MedianFinder())"
MDC = ("(lambda M: (lambda xs: (lambda meds: [len(meds), meds[:4], meds[-1], sum(meds), comparisons() <= 6 * len(xs) * __import__('math').log2(len(xs))])"
       "([(M.add(x), float(M.median()))[1] for x in xs]))(counted(args[0])))(MedianFinder())")
build(S, 6, "MedianFinder", [
    {"name": "Odd and even", "args": "([('add', 5), ('median',), ('add', 15), ('median',), ('add', 1), ('median',), ('add', 3), ('median',)],)", "expr": MD,
     "show": "add 5; median; add 15; median; add 1; median; add 3; median (add returns None)",
     "why": "5.0, then (5 + 15) / 2 = 10.0, then 5.0 (the middle of 1, 5, 15), then (3 + 5) / 2 = 4.0."},
    {"name": "Lesson 6's stream", "args": "([('add', x) if i % 2 == 0 else ('median',) for i, x in enumerate([5, 0, 15, 0, 1, 0, 3, 0, 8, 0, 7, 0, 9, 0, 10, 0])],)", "expr": MD,
     "show": "add 5, 15, 1, 3, 8, 7, 9, 10, asking for the median after each",
     "why": "Medians 5.0, 10.0, 5.0, 4.0, 5.0, 6.0, 7.0, 7.5. If they drift, check that the two halves never differ in size by more than one, and that every value in the lower half is at most every value in the upper half."},
    {"name": "Repeated values", "args": "([('add', 2), ('add', 2), ('add', 2), ('median',), ('add', 1), ('median',)],)", "expr": MD,
     "show": "add 2, 2, 2; median; add 1; median", "why": "[None, None, None, 2.0, None, 2.0]."},
    {"name": "Negative values", "args": "([('add', -5), ('add', -1), ('median',), ('add', -10), ('median',)],)", "expr": MD,
     "show": "add -5, -1; median; add -10; median", "why": "(-5 + -1) / 2 = -3.0, then -5.0."},
    {"name": "Increasing", "args": "([('add', x) for x in range(1, 8)] + [('median',)],)", "expr": MD, "show": "add 1 to 7 in order; median",
     "why": "4.0. Every new value is the biggest so far, so values must keep moving from the upper half to the lower half to keep the sizes even."},
    {"name": "Decreasing", "args": "([('add', x) for x in range(8, 0, -1)] + [('median',)],)", "expr": MD, "show": "add 8 down to 1; median", "why": "(4 + 5) / 2 = 4.5."},
    {"name": "Comparisons", "args": "([(k * 7919) % 3_001 for k in range(3_000)],)", "expr": MDC, "timeout": 4000,
     "show": "add 3,000 values, asking for the median after each: [how many, first four, last, sum, at most 6 n log₂ n comparisons?]",
     "why": "Each add moves a value through a heap or two: O(log n) comparisons. Keeping one list sorted with a scan, or sorting after each add, costs O(n) comparisons per add, millions in total here."},
    {"name": "50,000 values", "args": "([(k * 7919) % 50_021 for k in range(50_000)],)", "expr": "(lambda M: [(M.add(x), M.median())[1] for x in args[0]][-3:])(MedianFinder())", "timeout": 4000,
     "show": "add 50,000 values with a median after each: the last three medians", "why": "O(log n) per add and O(1) per median. If this timed out, the median may be computed by sorting or scanning."},
], trusted=MEDIAN)
