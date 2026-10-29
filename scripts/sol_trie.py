from solgen import write_station

write_station("trie", 5, {
    1: ('''class TrieNode:
    def __init__(self):
        self.children = {}  # letter -> TrieNode
        self.end = False    # does a stored word end here?


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()   # a new prefix
            node = node.children[ch]
        node.end = True                          # tag the end of the word

    def _walk(self, s):
        # the node for prefix s, or None if some letter is missing
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None
''', [
        "Each node keeps its children in a dict from letter to node, and a flag for the end of a word. The letter is the dict key, so the node does not store it.",
        "`insert` follows one child per letter, creating the missing ones, and sets `end` on the last node. Inserting the same word again changes nothing.",
        "`search` and `starts_with` share one walk. A missing child means no stored word starts with these letters. If the walk succeeds, `starts_with` is true, and `search` also needs the end mark, because the letters may only be the start of a longer word.",
        "Every operation costs O(L) for a word of length L: one dict lookup per letter, whatever the number of stored words.",
    ]),
    2: ('''class Node:
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
''', [
        "Every node counts the stored words whose path goes through it. A node's count is then exactly the number of stored words that start with its prefix, so `count_prefix` is a walk plus one read.",
        "`copies` on the last node counts the copies of that exact word, which is what `count` returns.",
        "`remove` checks first that a copy exists, because changing counts for a word that is not stored would corrupt every node on its path. Then it subtracts 1 along the path. When a child's count reaches 0, nothing is stored below it, so the whole branch is deleted at once and the walk can stop.",
        "All four operations cost O(L). Deleting empty branches keeps the trie from growing with words that were removed.",
    ]),
    3: ('''class Node:
    def __init__(self):
        self.children = {}
        self.best = []   # up to 3 (-count, word) pairs from this branch


class SearchBox:
    def __init__(self, pairs):
        self.root = Node()
        for word, count in pairs:
            node = self.root
            for ch in word:
                nxt = node.children.get(ch)
                if nxt is None:
                    nxt = node.children[ch] = Node()
                node = nxt
                # every node on the word's path may want this word
                node.best.append((-count, word))
                node.best.sort()
                del node.best[3:]

    def suggest(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return []
        return [w for _, w in node.best]
''', [
        "The answer for a prefix depends only on the words in that prefix's branch, so each node keeps the best three words of its branch, worked out when the words are added.",
        "A word belongs to the branches of exactly the nodes on its own path. So adding a word offers it to the lists of those nodes only: append, sort the four pairs, keep three.",
        "Storing `(-count, word)` lets the ordinary tuple sort do the ordering: the highest count has the smallest negative number, and for equal counts the words are compared alphabetically.",
        "Building costs O(total letters), with a constant-size sort at each step. A suggestion walks the prefix and reads a list: O(L), however many words match. Visiting the branch on every call would cost as much as the branch is large.",
    ]),
    4: ('''class RNode:
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
''', [
        "Edges are keyed by the first letter of their label, so the next letter of the word picks at most one edge, as in a plain trie.",
        "`insert` counts the letters the word shares with that edge's label. If the whole label matches, it moves on. If they part in the middle, the edge is split: a middle node takes the shared part, the old child hangs below it with the rest of the label, and the walk continues from the middle node. Whatever is left of the word becomes one new edge, so no chain of one-child nodes is ever created.",
        "A word that ends exactly at a split (to inside toast) makes the middle node a word end and adds nothing else.",
        "`_find` reports whether the string ended inside an edge. `starts_with` only needs the covered part of the label to match; `search` needs to stop exactly on a node marked as a word end.",
        "Each step reads letters of the word not read before, so every operation is O(L) (the slices copy letters too, still O(L)). Every non-root node is a word end or a branch, so there are at most 2n nodes.",
    ]),
    5: ('''def max_xor(nums):
    B = max(nums).bit_length()    # bits needed for the largest number
    root = [None, None]           # [child for bit 0, child for bit 1]
    best = 0
    for i, x in enumerate(nums):
        if i:                     # best partner among earlier numbers
            node, r = root, 0
            for k in range(B - 1, -1, -1):
                b = x >> k & 1
                if node[1 - b] is not None:
                    r |= 1 << k   # the bits differ: result bit is 1
                    node = node[1 - b]
                else:
                    node = node[b]
            if r > best:
                best = r
        node = root               # insert x, highest bit first
        for k in range(B - 1, -1, -1):
            b = x >> k & 1
            if node[b] is None:
                node[b] = [None, None]
            node = node[b]
    return best
''', [
        "Every number is written with the same number of bits, B, highest bit first, and stored as a path of B edges. A node is a list of two children, which is smaller and faster than a dict.",
        "For a number x, the walk takes the child with the opposite bit whenever it exists, because that sets this bit of the result to 1, and one bit is worth more than all the lower bits together. So the walk ends at the stored number that makes x ^ y largest.",
        "Querying each number before inserting it compares it with every earlier number, so every pair is covered once and a number is never paired with itself.",
        "Each number costs two walks of B steps: O(n · B) time, against O(n²) for trying every pair. With 20,000 numbers that is about 1.2 million steps instead of 200 million XORs.",
    ]),
})
