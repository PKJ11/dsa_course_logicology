// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import random


class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height


class SkipList:
    MAX = 20

    def __init__(self):
        self.head = SkipNode(None, self.MAX)

    def _before(self, key):
        """The last node with a key smaller than key, on every level."""
        node, path = self.head, [None] * self.MAX
        for lv in range(self.MAX - 1, -1, -1):
            nxt = node.next[lv]
            while nxt is not None and nxt.key < key:
                node = nxt
                nxt = node.next[lv]
            path[lv] = node
        return path

    def contains(self, key):
        nxt = self._before(key)[0].next[0]
        return nxt is not None and nxt.key == key

    def first_at_least(self, key):
        nxt = self._before(key)[0].next[0]
        return None if nxt is None else nxt.key

    def add(self, key):
        path = self._before(key)
        nxt = path[0].next[0]
        if nxt is not None and nxt.key == key:
            return
        height = 1
        while height < self.MAX and random.random() < 0.5:
            height += 1
        node = SkipNode(key, height)
        for lv in range(height):
            node.next[lv] = path[lv].next[lv]
            path[lv].next[lv] = node

    def remove(self, key):
        path = self._before(key)
        node = path[0].next[0]
        if node is None or node.key != key:
            return False
        for lv in range(len(node.next)):
            if path[lv].next[lv] is node:
                path[lv].next[lv] = node.next[lv]
        return True
`;

export const notes = [
  "All four methods share one search, `_before`. It returns, for each level, the last node whose key is smaller than `key`. The head counts as smaller than everything, so its key (None) is never compared.",
  "On level 0, the node right after `path[0]` is the first key that is at least `key`. That one fact answers `contains` and `first_at_least`.",
  "`add` flips a fair coin to choose the height, then links the new node in after `path[lv]` on each of its levels: two assignments per level, as in a linked-list insert.",
  "`remove` links around the node on every level where it appears. The node is then unreachable and Python frees it.",
  "Expected cost: about log₂ n levels with about 2 nodes looked at per level, so O(log n) per operation, and about 2n links in total. Twenty levels are plenty for a million keys.",
];
