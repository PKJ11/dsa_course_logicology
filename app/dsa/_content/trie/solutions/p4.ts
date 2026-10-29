// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class RNode:
    def __init__(self):
        self.kids = {}    # first letter of label -> (label, RNode)
        self.end = False


class RadixTrie:
    def __init__(self):
        self.root = RNode()

    def insert(self, word):
        node, i = self.root, 0
        while i < len(word):
            ch = word[i]
            if ch not in node.kids:
                leaf = RNode()
                leaf.end = True
                node.kids[ch] = (word[i:], leaf)   # the rest of the word
                return
            label, child = node.kids[ch]
            j = 0                                  # letters shared
            while j < len(label) and i + j < len(word) and label[j] == word[i + j]:
                j += 1
            if j < len(label):                     # split the edge
                mid = RNode()
                mid.kids[label[j]] = (label[j:], child)
                node.kids[ch] = (label[:j], mid)
                child = mid
            node, i = child, i + j
        node.end = True

    def _find(self, s):
        # (node, inside): the node reached, and whether s ended inside
        # the edge above it. (None, False) if s is not in the trie.
        node, i = self.root, 0
        while i < len(s):
            e = node.kids.get(s[i])
            if e is None:
                return None, False
            label, child = e
            rest = len(s) - i
            if not s.startswith(label[:rest], i):
                return None, False
            if rest < len(label):
                return child, True
            node, i = child, i + len(label)
        return node, False

    def search(self, word):
        node, inside = self._find(word)
        return node is not None and not inside and node.end

    def starts_with(self, prefix):
        return self._find(prefix)[0] is not None

    def labels(self):
        out = []
        stack = [(None, self.root)]
        while stack:
            label, node = stack.pop()
            if label is not None:
                out.append(label)
            for ch in sorted(node.kids, reverse=True):
                stack.append(node.kids[ch])
        return out
`;

export const notes = [
  "Edges are keyed by the first letter of their label, so the next letter of the word picks at most one edge, as in a plain trie.",
  "`insert` counts the letters the word shares with that edge's label. If the whole label matches, it moves on. If they part in the middle, the edge is split: a middle node takes the shared part, the old child hangs below it with the rest of the label, and the walk continues from the middle node. Whatever is left of the word becomes one new edge, so no chain of one-child nodes is ever created.",
  "A word that ends exactly at a split (to inside toast) makes the middle node a word end and adds nothing else.",
  "`_find` reports whether the string ended inside an edge. `starts_with` only needs the covered part of the label to match; `search` needs to stop exactly on a node marked as a word end.",
  "Each step reads letters of the word not read before, so every operation is O(L) (the slices copy letters too, still O(L)). Every non-root node is a word end or a branch, so there are at most 2n nodes.",
];
