// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class _Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                    # key -> node
        self.front = _Node()             # sentinel: most recent side
        self.back = _Node()              # sentinel: least recent side
        self.front.next = self.back
        self.back.prev = self.front

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, node):
        node.prev = self.front
        node.next = self.front.next
        self.front.next.prev = node
        self.front.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)               # a use: move to the front
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self.map.get(key)
        if node is not None:
            node.value = value
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) == self.cap:
            old = self.back.prev         # least recently used
            self._unlink(old)
            del self.map[old.key]
        node = _Node(key, value)
        self.map[key] = node
        self._push_front(node)
`;

export const notes = [
  "The dict finds a key's node in O(1). The two-way list keeps the order of use: just after `front` is the most recent, just before `back` the least recent.",
  "Removing a node you hold takes O(1) in a two-way list: its two neighbours point past it. The sentinels mean there is always a neighbour on both sides, so there are no special cases for an empty cache or for the ends.",
  "Each node stores its key, so the node thrown out at the back can also be deleted from the dict.",
  "`self.map.get(key)` returns None for a missing key, and a node is never None, so values like 0 or None are still found correctly.",
  "Every call does one dict lookup and a fixed number of reference changes: O(1) on average. In real code, `functools.lru_cache` or `OrderedDict.move_to_end` do this for you.",
];
