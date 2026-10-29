from tb import build

S = "link"
NODE = """
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next
"""

# P1 remove every node holding x
R = "walk(remove_all(chain(args[0]), args[1]))"
build(S, 1, "remove_all", [
    {"name": "In the middle", "args": "([1, 2, 6, 3, 4, 5, 6],  6)", "expr": R, "show": "list 1, 2, 6, 3, 4, 5, 6; remove 6",
     "why": "Both 6s go, and the order of the rest stays the same. If only the first 6 went, the walk stopped after one delete."},
    {"name": "At the head", "args": "([6, 6, 1, 6], 6)", "expr": R, "show": "list 6, 6, 1, 6; remove 6",
     "why": "The first two nodes go, so the head changes. If you got [6, 1] or [6, 6, 1], the code never checks the head itself. A dummy node in front of the head fixes this (lesson 2). Return dummy.next, not the old head."},
    {"name": "Two in a row", "args": "([1, 2, 2, 3], 2)", "expr": R, "show": "list 1, 2, 2, 3; remove 2",
     "why": "After a delete, do not move cur on: its new next has not been checked yet. If you got [1, 2, 3], the code moved on and skipped the second 2."},
    {"name": "Every node", "args": "([7, 7, 7], 7)", "expr": R, "show": "list 7, 7, 7; remove 7",
     "why": "Nothing is left, so return None (the walk of None is []). An AttributeError on None means the code read .next of a None."},
    {"name": "Empty list", "args": "([], 4)", "expr": R, "show": "empty list (head is None); remove 4", "why": "An empty list stays empty. Return None."},
    {"name": "Not there", "args": "([1, 2, 3], 9)", "expr": R, "show": "list 1, 2, 3; remove 9", "why": "9 is not in the list, so nothing changes: 1, 2, 3. If a node is missing, the code deleted without checking the value first."},
    {"name": "Last node", "args": "([1, 2, 3], 3)", "expr": R, "show": "list 1, 2, 3; remove 3",
     "why": "The last node goes, so 2's next becomes None. Check that the loop stops when cur.next is None, not one step later."},
    {"name": "Same nodes", "args": "([6, 1, 2],)", "expr": "(lambda h: remove_all(h, 6) is h.next)(chain(args[0]))", "expect": "True",
     "show": "list 6, 1, 2; remove 6; is the result the old second node?",
     "why": "Change the links of the nodes you were given; do not build a new list. The answer's head should be the very node that held 1."},
    {"name": "200,000 nodes", "args": "([(3, 5, 8)[k * k % 7 % 3] for k in range(200_000)], 5)", "expr": "(lambda r: [len(r), sum(r), r[:5]])(walk(remove_all(chain(args[0]), args[1])))", "timeout": 4000,
     "show": "200,000 nodes holding 3, 5 or 8; remove 5. Checks [length, sum, first five]",
     "why": "One walk is O(n). If this timed out, the code may copy the values into a Python list and call .remove() for each match, which is O(n) per remove."},
], trusted=NODE + """
def remove_all(head, x):
    dummy = Node(None, head)
    cur = dummy
    while cur.next is not None:
        if cur.next.value == x:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next
""")

# P2 a two-way line with O(1) ends
OPS = "(lambda L: [getattr(L, op[0])(*op[1:]) for op in args[0]])(Line())"
BIG_FRONT = ("(lambda L: [[L.add_first(k) for k in range(200_000)], len(L), sum(L.remove_last() for _ in range(199_990)), L.to_list()][1:])(Line())")
BIG_MIX = ("(lambda L: [[(L.add_last(k), L.add_first(-k)) for k in range(100_000)], [L.remove_first() for _ in range(5)], "
           "[L.remove_last() for _ in range(5)], len(L)][1:])(Line())")
build(S, 2, "Line", [
    {"name": "Add at both ends", "args": "([['add_last', 1], ['add_last', 2], ['add_first', 0], ['to_list']],)", "expr": OPS,
     "show": "add_last(1), add_last(2), add_first(0), to_list()",
     "why": "The adds return None, and to_list() gives the values from front to back: [0, 1, 2]. If you see [1, 2, 0] or [2, 1, 0], add_first or add_last links at the wrong end."},
    {"name": "Remove from both ends", "args": "([['add_last', 'A'], ['add_last', 'B'], ['add_last', 'C'], ['remove_first'], ['remove_last'], ['to_list']],)", "expr": OPS,
     "show": "add_last 'A', 'B', 'C'; remove_first(); remove_last(); to_list()",
     "why": "remove_first() returns 'A' and remove_last() returns 'C', leaving ['B']. Return the removed value, not the node."},
    {"name": "Empty line", "args": "([['remove_first'], ['remove_last'], ['to_list'], ['__len__']],)", "expr": OPS,
     "show": "on a new Line: remove_first(), remove_last(), to_list(), len()",
     "why": "Removing from an empty line returns None. With sentinel nodes, the line is empty when front.next is back. An AttributeError here means the code removed a sentinel or read .value of None."},
    {"name": "Down to empty and back", "args": "([['add_last', 5], ['remove_first'], ['to_list'], ['add_first', 7], ['add_last', 8], ['remove_last'], ['remove_last'], ['remove_last'], ['__len__']],)", "expr": OPS,
     "show": "add 5, remove it, then add 7 and 8 and remove three times",
     "why": "After the last real node goes, the line must be fully empty again: both ends must forget the old node. If 5 comes back later, one end still referred to it."},
    {"name": "Length", "args": "([['add_first', 1], ['add_first', 2], ['add_last', 3], ['__len__'], ['remove_last'], ['__len__']],)", "expr": OPS,
     "show": "three adds, len(), one remove, len()",
     "why": "len() should be 3, then 2. Keep a count that every add and remove updates; counting by walking is O(n)."},
    {"name": "Mixed", "args": "([['add_last', 1], ['add_first', 2], ['add_last', 3], ['add_first', 4], ['remove_last'], ['remove_first'], ['add_last', 5], ['to_list']],)", "expr": OPS,
     "show": "a mix of adds and removes, then to_list()",
     "why": "The line goes 1 → 2,1 → 2,1,3 → 4,2,1,3, loses 3 and 4, then gains 5: [2, 1, 5]. Draw the line after each step to find the first wrong one."},
    {"name": "200,000 at the front", "args": "()", "expr": BIG_FRONT, "timeout": 4000,
     "show": "add_first 0 … 199,999, then remove_last 199,990 times: [length, sum removed, what is left]",
     "why": "Every operation must be O(1). list.insert(0, x) moves every item, so 200,000 of them take minutes. A one-way list makes remove_last a walk to the end. Keep prev links, or sentinels at both ends."},
    {"name": "Both ends, 200,000 adds", "args": "()", "expr": BIG_MIX, "timeout": 4000,
     "show": "100,000 add_last and 100,000 add_first, then 5 removes at each end: [front five, back five, length]",
     "why": "The front holds −99999, −99998, … and the back 99999, 99998, …. If this timed out, some operation walks the line."},
], trusted="""
class _N:
    __slots__ = ("value", "prev", "next")
    def __init__(self, value):
        self.value = value
        self.prev = self.next = None

class Line:
    def __init__(self):
        self.front, self.back = _N(None), _N(None)
        self.front.next, self.back.prev = self.back, self.front
        self.n = 0
    def _between(self, a, b, x):
        node = _N(x)
        node.prev, node.next = a, b
        a.next = b.prev = node
        self.n += 1
    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev
        self.n -= 1
        return node.value
    def add_first(self, x): self._between(self.front, self.front.next, x)
    def add_last(self, x): self._between(self.back.prev, self.back, x)
    def remove_first(self): return None if self.n == 0 else self._remove(self.front.next)
    def remove_last(self): return None if self.n == 0 else self._remove(self.back.prev)
    def __len__(self): return self.n
    def to_list(self):
        out, cur = [], self.front.next
        while cur is not self.back:
            out.append(cur.value)
            cur = cur.next
        return out
""")

# P3 reverse positions left..right (1-based)
RB = "walk(reverse_between(chain(args[0]), args[1], args[2]))"
build(S, 3, "reverse_between", [
    {"name": "Middle part", "args": "([1, 2, 3, 4, 5], 2, 4)", "expr": RB, "show": "list 1, 2, 3, 4, 5; left = 2, right = 4",
     "why": "Positions count from 1, so 2, 3, 4 are reversed: 1, 4, 3, 2, 5. If 5 is missing, the part's old first node (2) was not linked to the node after the part."},
    {"name": "From the head", "args": "([1, 2, 3, 4, 5], 1, 3)", "expr": RB, "show": "list 1, 2, 3, 4, 5; left = 1, right = 3",
     "why": "3, 2, 1, 4, 5. The head changes. A dummy node before the head gives the part a node before it even when left is 1."},
    {"name": "To the end", "args": "([1, 2, 3, 4, 5], 3, 5)", "expr": RB, "show": "list 1, 2, 3, 4, 5; left = 3, right = 5",
     "why": "1, 2, 5, 4, 3. The node after the part is None, and the old first node of the part (3) must now point to None."},
    {"name": "Whole list", "args": "([1, 2, 3], 1, 3)", "expr": RB, "show": "list 1, 2, 3; left = 1, right = 3", "why": "The whole list reversed: 3, 2, 1."},
    {"name": "left equals right", "args": "([1, 2, 3], 2, 2)", "expr": RB, "show": "list 1, 2, 3; left = right = 2", "why": "A part of one node: nothing changes."},
    {"name": "One node", "args": "([7], 1, 1)", "expr": RB, "show": "list 7; left = right = 1", "why": "Nothing changes; the head is still 7."},
    {"name": "Same nodes", "args": "([1, 2, 3, 4],)", "expr": "(lambda ns: (lambda r: [r is ns[0], r.next is ns[2], r.next.next is ns[1]])(reverse_between(ns[0], 2, 3)))(nodes(chain(args[0])))",
     "expect": "[True, True, True]", "show": "list 1, 2, 3, 4; left = 2, right = 3; are the original nodes reused?",
     "why": "Relink the nodes you were given; do not copy values into new nodes. The head stays the node holding 1, followed by the old third node, then the old second."},
    {"name": "100,000 nodes", "args": "(list(range(100_000)), 2, 99_999)", "expr": "(lambda r: [len(r), r[:3], r[-3:]])(walk(reverse_between(chain(args[0]), args[1], args[2])))", "timeout": 4000,
     "show": "list 0 … 99,999; left = 2, right = 99,999: [length, first three, last three]",
     "why": "One walk, O(n). A recursive helper fails with RecursionError at this length; use a loop."},
], trusted=NODE + """
def reverse_between(head, left, right):
    dummy = Node(None, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    first = before.next
    prev, cur = None, first
    for _ in range(right - left + 1):
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    before.next = prev
    first.next = cur
    return dummy.next
""")

# P4 reverse every full group of k nodes; a short last group stays as it is
RG = "walk(reverse_groups(chain(args[0]), args[1]))"
build(S, 4, "reverse_groups", [
    {"name": "Groups of three", "args": "([1, 2, 3, 4, 5, 6, 7, 8], 3)", "expr": RG, "show": "list 1 … 8; k = 3",
     "why": "Two full groups are reversed: 3, 2, 1 and 6, 5, 4. The last group, 7, 8, has only two nodes, so it stays in order. If you got 8, 7 at the end, the code also reversed the short group: count k nodes ahead before you reverse."},
    {"name": "Groups of two", "args": "([1, 2, 3, 4, 5, 6], 2)", "expr": RG, "show": "list 1 … 6; k = 2",
     "why": "Every group is full: 2, 1, 4, 3, 6, 5. If the list stops after 2, 1, the end of a reversed group was not linked to the start of the next group."},
    {"name": "k is 1", "args": "([4, 5, 6], 1)", "expr": RG, "show": "list 4, 5, 6; k = 1", "why": "Each group is one node, and one node reversed is itself. Nothing changes."},
    {"name": "k is the length", "args": "([1, 2, 3, 4], 4)", "expr": RG, "show": "list 1, 2, 3, 4; k = 4",
     "why": "There is one full group, so the whole list is reversed: 4, 3, 2, 1. The old head is now last, so its next must be None."},
    {"name": "k is more than the length", "args": "([1, 2, 3], 5)", "expr": RG, "show": "list 1, 2, 3; k = 5",
     "why": "There is no full group, so nothing is reversed. An AttributeError means the code walked past the end while counting ahead: stop when it reaches None."},
    {"name": "Empty", "args": "([], 2)", "expr": RG, "show": "empty list; k = 2", "why": "An empty list has no groups. Return None."},
    {"name": "Same nodes", "args": "([1, 2, 3, 4],)", "expr": "(lambda ns: (lambda r: [r is ns[1], r.next is ns[0], r.next.next is ns[3]])(reverse_groups(ns[0], 2)))(nodes(chain(args[0])))",
     "expect": "[True, True, True]", "show": "list 1, 2, 3, 4; k = 2; are the original nodes reused?",
     "why": "Relink the nodes you were given; do not copy values into new nodes. The answer starts with the old second node, then the old head, then the old fourth node."},
    {"name": "100,000 nodes", "args": "(list(range(100_000)), 7)", "expr": "(lambda r: [len(r), r[:3], r[-3:]])(walk(reverse_groups(chain(args[0]), args[1])))", "timeout": 4000,
     "show": "list 0 … 99,999; k = 7: [length, first three, last three]",
     "why": "100,000 is 14,285 groups of 7 and 5 nodes left over, so the list ends 99,997, 99,998, 99,999 in order. Each node is counted once and reversed once: O(n). A recursive version goes one call deeper per group and fails with RecursionError here."},
], trusted=NODE + """
def reverse_groups(head, k):
    dummy = Node(None, head)
    before = dummy
    while True:
        end = before
        for _ in range(k):
            end = end.next
            if end is None:
                return dummy.next
        first, after = before.next, end.next
        prev, cur = after, first
        while cur is not after:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        before.next = prev
        before = first
""")

# P5 first node of the loop (nodes are not hashable)
LS = "(lambda h: place(h, loop_start(h)))(chain(args[0], args[1], False))"
build(S, 5, "loop_start", [
    {"name": "The figure's list", "args": "([5, 1, 8, 3, 7, 2, 6, 4], 3)", "expr": LS, "show": "list 5, 1, 8, 3, 7, 2, 6, 4; the last node points back to position 3. Shows the position of the node you return",
     "why": "The loop starts at position 3 (the node holding 3; positions count from 0). If you got the position where slow and fast met (5), the second part is missing: move p from the head and slow from the meeting point, one node at a time."},
    {"name": "No loop", "args": "([1, 2, 3], None)", "expr": LS, "show": "list 1, 2, 3 with no loop",
     "why": "fast reaches None, so there is no loop: return None. An AttributeError means fast.next.next was read when fast.next was None."},
    {"name": "Empty", "args": "([], None)", "expr": LS, "show": "empty list", "why": "No nodes, no loop: return None."},
    {"name": "One node, pointing to itself", "args": "([7], 0)", "expr": LS, "show": "one node whose next is itself", "why": "The loop starts at the head, position 0."},
    {"name": "One node, no loop", "args": "([7], None)", "expr": LS, "show": "one node whose next is None", "why": "Return None."},
    {"name": "Whole list is the loop", "args": "([1, 2, 3, 4], 0)", "expr": LS, "show": "list 1, 2, 3, 4; the last node points back to the head",
     "why": "There are no nodes before the loop, so p starts on the answer. Check that the second part compares before it moves: while p is not slow."},
    {"name": "Last node points to itself", "args": "([1, 2, 3, 4, 5], 4)", "expr": LS, "show": "list 1, 2, 3, 4, 5; the last node's next is itself", "why": "A loop of length 1 at position 4."},
    {"name": "Same values everywhere", "args": "([2, 2, 2, 2, 2, 2], 2)", "expr": LS, "show": "six nodes all holding 2; the last points back to position 2",
     "why": "Every value is 2, so you cannot find the loop by values. Compare nodes with is: slow is fast, p is slow."},
    {"name": "100,000 nodes", "args": "(list(range(100_000)), 31_416)", "expr": LS, "timeout": 4000, "show": "100,000 nodes; the last points back to position 31,416",
     "why": "Floyd's method takes O(n) steps. Keeping visited nodes in a list and checking 'node in seen' is O(n) per check, so O(n²) in total (n multiplied by n)."},
], trusted="""
def loop_start(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None
""")

# P6 sort a linked list (sorted blocked)
SL = "walk(sort_list(chain(args[0])))"
ORDERED = "(lambda r: [len(r), sum(r), r[:3], all(r[i] <= r[i + 1] for i in range(len(r) - 1))])(walk(sort_list(chain(args[0]))))"
build(S, 6, "sort_list", [
    {"name": "Four values", "args": "([4, 2, 1, 3],)", "expr": SL, "show": "list 4, 2, 1, 3",
     "why": "The answer is 1, 2, 3, 4. If a value is missing, the merge lost the rest of one list: when one list runs out, attach the rest of the other."},
    {"name": "Empty", "args": "([],)", "expr": SL, "show": "empty list", "why": "An empty list is already sorted: return None. An AttributeError means the code read head.next when head was None."},
    {"name": "One", "args": "([5],)", "expr": SL, "show": "list 5", "why": "One node is already sorted."},
    {"name": "Two, wrong way round", "args": "([2, 1],)", "expr": SL, "show": "list 2, 1",
     "why": "1, 2. If this never finishes or hits RecursionError, the split never makes the list smaller: with two nodes, slow must stop on the first one. Start fast at head.next."},
    {"name": "Repeats", "args": "([3, 1, 3, 1, 2],)", "expr": SL, "show": "list 3, 1, 3, 1, 2", "why": "1, 1, 2, 3, 3. Equal values must all be kept."},
    {"name": "Already sorted", "args": "([1, 2, 3, 4, 5, 6],)", "expr": SL, "show": "list 1 … 6", "why": "A sorted list stays the same: 1 … 6. If this one times out or hits RecursionError, the split does not halve the list."},
    {"name": "Negative values", "args": "([0, -5, 12, -1, 7],)", "expr": SL, "show": "list 0, −5, 12, −1, 7",
     "why": "The answer is −5, −1, 0, 7, 12. Values below 0 sort like any others. A merge that starts with a smallest value of 0, or uses 0 as \"nothing yet\", puts them in the wrong place."},
    {"name": "Same nodes", "args": "([3, 1, 2],)", "expr": "(lambda ns: set(map(id, nodes(sort_list(ns[0])))) == set(map(id, ns)))(nodes(chain(args[0])))", "expect": "True",
     "show": "list 3, 1, 2; are the answer's nodes the ones you were given?",
     "why": "Sort by relinking the nodes; do not build new nodes. If this fails, the code makes new Node objects."},
    {"name": "100,000 values", "args": "([(k * 7919 + 13) % 2_000_003 - 1_000_001 for k in range(100_000)],)", "expr": ORDERED, "timeout": 6000,
     "show": "100,000 random values: [length, sum, first three, in order?]",
     "why": "Merge sort is O(n log n): about 1.7 million steps here. Insertion sort on a linked list is O(n²) (n multiplied by n), about 5 billion steps, and times out."},
], trusted=NODE + """
def merge(a, b):
    dummy = tail = Node(None)
    while a is not None and b is not None:
        if a.value <= b.value:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next

def sort_list(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None
    return merge(sort_list(head), sort_list(second))
""")
