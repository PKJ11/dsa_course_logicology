from solgen import write_station

NODE = '''class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

'''

write_station("link", 6, {
    1: (NODE + '''
def remove_all(head, x):
    dummy = Node(None, head)      # every real node now has a node before it
    cur = dummy
    while cur.next is not None:
        if cur.next.value == x:
            cur.next = cur.next.next  # skip it; check the new cur.next next time
        else:
            cur = cur.next
    return dummy.next             # the head may have been removed
''', [
        "To remove a node you change the node before it, so the walk looks one node ahead: `cur.next` is the node being checked.",
        "The dummy node in front of the head means the head is checked like every other node. Without it you need a separate loop for the head.",
        "After a removal `cur` stays put, because its new `next` has not been checked. Moving on would skip a second `x` in a row.",
        "Return `dummy.next`, not `head`: if the old head held `x`, `dummy.next` is the new head (or None).",
        "One walk: O(n) time and O(1) extra space. Removed nodes are freed by Python once nothing refers to them.",
    ]),
    2: ('''class _Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


class Line:
    def __init__(self):
        self.front = _Node(None)      # sentinel before the first value
        self.back = _Node(None)       # sentinel after the last value
        self.front.next = self.back
        self.back.prev = self.front
        self.n = 0

    def _insert_between(self, a, b, x):
        node = _Node(x)
        node.prev, node.next = a, b   # the new node's own links first
        a.next = node
        b.prev = node
        self.n += 1

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
        self.n -= 1
        return node.value

    def add_first(self, x):
        self._insert_between(self.front, self.front.next, x)

    def add_last(self, x):
        self._insert_between(self.back.prev, self.back, x)

    def remove_first(self):
        return None if self.n == 0 else self._remove(self.front.next)

    def remove_last(self):
        return None if self.n == 0 else self._remove(self.back.prev)

    def __len__(self):
        return self.n

    def to_list(self):
        out = []
        cur = self.front.next
        while cur is not self.back:
            out.append(cur.value)
            cur = cur.next
        return out
''', [
        "Each node knows both neighbours (`prev` and `next`), so the last node can be removed without walking to find the node before it.",
        "The two sentinels are never removed. Every real node always has a node on each side, so `_insert_between` and `_remove` need no special cases for an empty line or for the ends.",
        "Every method changes a fixed number of references: O(1). `to_list` walks the line, O(n), which is fine because its answer has n values.",
        "The count `n` is updated by every add and remove, so `len()` is O(1), and `n == 0` tells you the line is empty.",
        "This is how `collections.deque` works, except that each of its nodes holds a block of 64 values (lesson 3).",
    ]),
    3: (NODE + '''
def reverse_between(head, left, right):
    dummy = Node(None, head)
    before = dummy
    for _ in range(left - 1):     # the node just before the part
        before = before.next
    first = before.next           # will be the part's last node
    prev, cur = None, first
    for _ in range(right - left + 1):
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    before.next = prev            # prev: the part's new first node
    first.next = cur              # cur: the node just after the part
    return dummy.next
''', [
        "The dummy node makes sure a node before the part always exists, even when `left` is 1. Then the head is not a special case, and the answer is `dummy.next`.",
        "The middle is the reversing loop from lesson 4, run exactly `right - left + 1` times. After it, `prev` is the part's new first node and `cur` is the first node after the part (or None).",
        "Two links join the part back in: `before.next = prev` at the front, and `first.next = cur` at the back. `first` was the part's first node and is now its last.",
        "One walk of at most n steps: O(n) time, O(1) extra space.",
    ]),
    4: (NODE + '''
def reverse_groups(head, k):
    dummy = Node(None, head)
    before = dummy                    # the node just before the next group
    while True:
        end = before
        for _ in range(k):            # look k nodes ahead
            end = end.next
            if end is None:
                return dummy.next     # a short last group stays as it is
        first, after = before.next, end.next
        prev, cur = after, first      # first will point to after
        while cur is not after:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        before.next = prev            # prev: the group's new first node
        before = first                # first is now the group's last node
''', [
        "The dummy node gives the first group a node before it, so the head is not a special case. The answer is `dummy.next`.",
        "Before reversing a group, count k nodes ahead. If the list ends first, the rest is a short group, and it stays as it is.",
        "`prev` starts at `after`, the node just after the group. So when the loop turns the group's first node round, it already points to `after`. No extra step joins the group to the rest.",
        "`before.next = prev` joins the group to the part before it. Then `before` moves to `first`, which is now the group's last node.",
        "Each node is passed once while counting ahead and once while reversing: O(n) time. Only a few names are used: O(1) extra space.",
    ]),
    5: ('''def loop_start(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:              # they met inside the loop
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p                  # first node of the loop
    return None                       # fast reached the end
''', [
        "If there is no loop, `fast` reaches None and the function returns None.",
        "If there is a loop, both names end up in it. Each pass the gap between them shrinks by one, so `fast` cannot jump over `slow`: they meet within one trip round the loop.",
        "Say there are a nodes before the loop and the loop has length L. When they meet, `slow` has taken s steps and `fast` 2s. The extra s steps were whole trips round the loop, so s is a multiple of L.",
        "`p` reaches the loop's first node after a steps. By then `slow` has taken s + a steps in total: a steps to reach the loop plus whole trips round it. So `slow` is also at the loop's first node, and they meet there.",
        "O(n) time and two names, so O(1) extra space. Comparing with `is` works even when values repeat.",
    ]),
    6: (NODE + '''
def merge(a, b):
    dummy = tail = Node(None)
    while a is not None and b is not None:
        if a.value <= b.value:        # <= keeps equal values in order
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next


def sort_list(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next      # slow stops on the first middle node
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None                  # cut the list in two
    return merge(sort_list(head), sort_list(second))
''', [
        "Merge sort: split at the middle, sort both halves, merge. A list of zero or one nodes is already sorted.",
        "`fast` starts at `head.next`, so with two nodes `slow` stays on the first and the list splits into one and one. Starting both at `head` would leave a two-node list unsplit for ever.",
        "The merge relinks nodes with a dummy node and a `tail`. When one list runs out, the rest of the other is attached in one step.",
        "There are about log₂ n levels of halving, and each level does O(n) work, so the time is O(n log n). The recursion is only about log₂ n calls deep, and no extra arrays are needed.",
    ]),
})
