// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class _Node:
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
`;

export const notes = [
  "Each node knows both neighbours (`prev` and `next`), so the last node can be removed without walking to find the node before it.",
  "The two sentinels are never removed. Every real node always has a node on each side, so `_insert_between` and `_remove` need no special cases for an empty line or for the ends.",
  "Every method changes a fixed number of references: O(1). `to_list` walks the line, O(n), which is fine because its answer has n values.",
  "The count `n` is updated by every add and remove, so `len()` is O(1), and `n == 0` tells you the line is empty.",
  "This is how `collections.deque` works, except that each of its nodes holds a block of 64 values (lesson 3).",
];
