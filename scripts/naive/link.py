# Naive and buggy LINK solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def remove_all(head, x):
    # forgets the head: only ever looks at cur.next
    if head is None:
        return None
    cur = head
    while cur.next is not None:
        if cur.next.value == x:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head
''', [1, 3, 7]),
    2: ('''
class Line:
    def __init__(self):
        self.a = []
    def add_first(self, x):
        self.a.insert(0, x)
    def add_last(self, x):
        self.a.append(x)
    def remove_first(self):
        return self.a.pop(0) if self.a else None
    def remove_last(self):
        return self.a.pop() if self.a else None
    def __len__(self):
        return len(self.a)
    def to_list(self):
        return list(self.a)
''', [6]),
    3: ('''
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

def reverse_between(head, left, right):
    vals = []
    while head is not None:
        vals.append(head.value)
        head = head.next
    vals[left - 1:right] = vals[left - 1:right][::-1]
    dummy = tail = Node(None)
    for v in vals:
        tail.next = Node(v)
        tail = tail.next
    return dummy.next
''', [6]),
    4: ('''
def reverse_groups(head, k):
    # reverses the short last group too
    dummy_next = None
    before = None
    cur = head
    while cur is not None:
        first = cur
        prev = None
        n = 0
        while cur is not None and n < k:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
            n += 1
        if before is None:
            dummy_next = prev
        else:
            before.next = prev
        before = first
    return dummy_next
''', [0, 4, 7]),
    5: ('''
def loop_start(head):
    seen = set()
    while head is not None:
        if head in seen:
            return head
        seen.add(head)
        head = head.next
    return None
''', [0, 3, 8]),
    6: ('''
def sort_list(head):
    # insertion sort on the list: O(n^2)
    dummy = type(head)(None) if head is not None else None
    if head is None:
        return None
    cur = head
    while cur is not None:
        nxt = cur.next
        p = dummy
        while p.next is not None and p.next.value <= cur.value:
            p = p.next
        cur.next = p.next
        p.next = cur
        cur = nxt
    return dummy.next
''', [8]),
}
