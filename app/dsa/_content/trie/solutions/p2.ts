// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self):
        self.children = {}
        self.count = 0    # words that pass through this node
        self.copies = 0   # words that end here


class CountingTrie:
    def __init__(self):
        self.root = Node()

    def insert(self, word):
        node = self.root
        node.count += 1
        for ch in word:
            nxt = node.children.get(ch)
            if nxt is None:
                nxt = node.children[ch] = Node()
            node = nxt
            node.count += 1
        node.copies += 1

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def count(self, word):
        node = self._walk(word)
        return 0 if node is None else node.copies

    def count_prefix(self, prefix):
        node = self._walk(prefix)
        return 0 if node is None else node.count

    def remove(self, word):
        if self.count(word) == 0:
            return False                 # nothing to remove: change nothing
        node = self.root
        node.count -= 1
        for ch in word:
            nxt = node.children[ch]
            nxt.count -= 1
            if nxt.count == 0:           # no word passes through any more
                del node.children[ch]    # drop the whole branch
                return True
            node = nxt
        node.copies -= 1
        return True
`;

export const notes = [
  "Every node counts the stored words whose path goes through it. A node's count is then exactly the number of stored words that start with its prefix, so `count_prefix` is a walk plus one read.",
  "`copies` on the last node counts the copies of that exact word, which is what `count` returns.",
  "`remove` checks first that a copy exists, because changing counts for a word that is not stored would corrupt every node on its path. Then it subtracts 1 along the path. When a child's count reaches 0, nothing is stored below it, so the whole branch is deleted at once and the walk can stop.",
  "All four operations cost O(L). Deleting empty branches keeps the trie from growing with words that were removed.",
];
