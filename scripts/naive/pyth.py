# Naive PYTH solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def rotate(board, k):
    b = board[:]
    for _ in range(k % len(b) if b else 0):
        b.append(b.pop(0))
    return b
''', [8]),
    2: ('''
def running_totals(a):
    return [sum(a[:i + 1]) for i in range(len(a))]
''', [6]),
    3: ('''
def first_repeat(codes):
    seen = []
    for c in codes:
        if c in seen:
            return c
        seen.append(c)
    return None
''', [6]),
    4: ('''
def single_codes(codes):
    return [c for c in codes if codes.count(c) == 1]
''', [6]),
    5: ('''
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def make_train(values):
    head = None
    for v in values:
        if head is None:
            head = Node(v)
        else:
            cur = head
            while cur.next is not None:
                cur = cur.next
            cur.next = Node(v)
    return head
''', [6]),
}

# More wrong versions, run by hand: each must fail the tests named.
EXTRA = {
    "p4_toggle": ('''
def single_codes(codes):
    # switches a code in and out of a set: wrong when a code appears 3 times
    once = set()
    for c in codes:
        if c in once:
            once.remove(c)
        else:
            once.add(c)
    return [c for c in codes if c in once]
''', "fails 'Three times'"),
    "p4_first_seen": ('''
def single_codes(codes):
    # removes repeats instead of keeping only the codes seen once
    return list(dict.fromkeys(codes))
''', "fails 'A few codes', 'Order kept', 'All repeated', 'Three times' and the 300,000-code test"),
}
