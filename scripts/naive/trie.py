# Naive TRIE solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
class Trie:
    # a plain list of words, scanned for every question
    def __init__(self):
        self.words = []
    def insert(self, word):
        if word not in self.words:
            self.words.append(word)
    def search(self, word):
        return word in self.words
    def starts_with(self, prefix):
        return any(w.startswith(prefix) for w in self.words)
''', [7]),
    2: ('''
class CountingTrie:
    # a dict of word -> copies; count_prefix scans every word
    def __init__(self):
        self.d = {}
    def insert(self, word):
        self.d[word] = self.d.get(word, 0) + 1
    def count(self, word):
        return self.d.get(word, 0)
    def count_prefix(self, prefix):
        return sum(c for w, c in self.d.items() if w.startswith(prefix))
    def remove(self, word):
        if self.d.get(word, 0) == 0:
            return False
        self.d[word] -= 1
        return True
''', [7]),
    3: ('''
class Node:
    def __init__(self):
        self.children = {}
        self.words = []

class SearchBox:
    # a trie, but every suggestion visits the whole branch
    def __init__(self, pairs):
        self.root = Node()
        for word, count in pairs:
            node = self.root
            for ch in word:
                node = node.children.setdefault(ch, Node())
            node.words.append((-count, word))
    def suggest(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return []
        found, stack = [], [node]
        while stack:
            n = stack.pop()
            found.extend(n.words)
            stack.extend(n.children.values())
        found.sort()
        return [w for _, w in found[:3]]
''', [5]),
    4: ('''
class RNode:
    def __init__(self):
        self.kids = {}
        self.end = False

class RadixTrie:
    # a plain trie: one letter per edge, never compressed
    def __init__(self):
        self.root = RNode()
    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.kids:
                node.kids[ch] = (ch, RNode())
            node = node.kids[ch][1]
        node.end = True
    def _walk(self, s):
        node = self.root
        for ch in s:
            e = node.kids.get(ch)
            if e is None:
                return None
            node = e[1]
        return node
    def search(self, word):
        n = self._walk(word)
        return n is not None and n.end
    def starts_with(self, prefix):
        return self._walk(prefix) is not None
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
''', [0, 1, 2, 3, 4, 6, 7]),
    5: ('''
def max_xor(nums):
    # every pair
    best = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] ^ nums[j] > best:
                best = nums[i] ^ nums[j]
    return best
''', [8]),
}

# A second wrong version for P4, run by hand: compressed, but starts_with only stops on nodes.
NAIVE_P4_EDGE = '''
class RNode:
    def __init__(self):
        self.kids = {}
        self.end = False

class RadixTrie:
    def __init__(self):
        self.root = RNode()
    def insert(self, word):
        node, i = self.root, 0
        while i < len(word):
            ch = word[i]
            if ch not in node.kids:
                leaf = RNode(); leaf.end = True
                node.kids[ch] = (word[i:], leaf); return
            label, child = node.kids[ch]
            j = 0
            while j < len(label) and i + j < len(word) and label[j] == word[i + j]:
                j += 1
            if j < len(label):
                mid = RNode()
                mid.kids[label[j]] = (label[j:], child)
                node.kids[ch] = (label[:j], mid)
                child = mid
            node, i = child, i + j
        node.end = True
    def _walk(self, s):
        node, i = self.root, 0
        while i < len(s):
            e = node.kids.get(s[i])
            if e is None or not s.startswith(e[0], i):
                return None
            node, i = e[1], i + len(e[0])
        return node
    def search(self, word):
        n = self._walk(word)
        return n is not None and n.end
    def starts_with(self, prefix):
        return self._walk(prefix) is not None
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
'''
