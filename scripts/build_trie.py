import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "trie"

# Pseudo-random lowercase words of 2 to 7 letters, built inside the test's args.
def gen(lo, hi, mult=2654435761, minlen=2):
    return f"[''.join(chr(97 + (k * {mult} >> (5 * j)) % 26) for j in range({minlen} + k % 6)) for k in range({lo}, {hi})]"

TRIE = """
class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def _walk(self, s):
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
"""

OPS = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[0]])(Trie())"
BIG1 = "(lambda T: [[T.insert(w) for w in args[0]], sum(T.search(q) for q in args[1]), sum(T.starts_with(p) for p in args[2])][1:])(Trie())"
build(S, 1, "Trie", [
    {"name": "Word and prefix", "args": "([('insert', 'apple'), ('search', 'apple'), ('search', 'app'), ('starts_with', 'app'), ('insert', 'app'), ('search', 'app')],)", "expr": OPS,
     "show": "insert apple; search apple; search app; starts_with app; insert app; search app",
     "why": "[None, True, False, True, None, True]. app is only a prefix until it is inserted itself: search must check the end mark of the last node, not only that the letters exist."},
    {"name": "Shared paths", "args": "([('insert', 'tea'), ('insert', 'ten'), ('insert', 'to'), ('search', 'tea'), ('search', 'ten'), ('search', 'te'), ('starts_with', 'te'), ('starts_with', 'to')],)", "expr": OPS,
     "show": "insert tea, ten, to; search tea, ten, te; starts_with te, to",
     "why": "[None, None, None, True, True, False, True, True]. tea and ten share the nodes t and te; inserting ten must not remove tea's end mark."},
    {"name": "Empty trie", "args": "([('search', 'a'), ('starts_with', 'a')],)", "expr": OPS,
     "show": "search a and starts_with a on an empty trie", "why": "[False, False]. Nothing is stored, so the root has no children."},
    {"name": "Longer than any word", "args": "([('insert', 'tea'), ('search', 'teas'), ('starts_with', 'teas'), ('starts_with', 'tex')],)", "expr": OPS,
     "show": "insert tea; search teas; starts_with teas, tex",
     "why": "[None, False, False, False]. The walk falls off the trie at the s of teas: the node tea has no child s. Check for a missing child at every letter."},
    {"name": "Inserted twice", "args": "([('insert', 'go'), ('insert', 'go'), ('search', 'go'), ('search', 'g'), ('starts_with', 'g')],)", "expr": OPS,
     "show": "insert go twice; search go, g; starts_with g", "why": "[None, None, True, False, True]. A second insert of the same word changes nothing."},
    {"name": "Word inside a word", "args": "([('insert', 'inn'), ('insert', 'in'), ('search', 'in'), ('search', 'inn'), ('search', 'i')],)", "expr": OPS,
     "show": "insert inn, then in; search in, inn, i",
     "why": "[None, None, True, True, False]. Inserting in after inn creates no node: it only marks the existing node in as the end of a word."},
    {"name": "One letter words", "args": "([('insert', 'a'), ('insert', 'b'), ('search', 'a'), ('search', 'c'), ('starts_with', 'b')],)", "expr": OPS,
     "show": "insert a, b; search a, c; starts_with b", "why": "[None, None, True, False, True]."},
    {"name": "30,000 words", "args": f"({gen(0, 30000)}, {gen(15000, 45000)}, {gen(40000, 70000, 40503, 1)})", "expr": BIG1, "timeout": 4000,
     "show": "insert 30,000 words; then 30,000 searches and 30,000 prefix searches: [how many searches say True, how many prefix searches say True]",
     "why": "Each operation should cost one step per letter of the word. Scanning a list of all the words for each query is about a billion steps here."},
], trusted=TRIE)

COUNTING = """
class Node:
    def __init__(self):
        self.children = {}
        self.count = 0
        self.copies = 0

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
            return False
        node = self.root
        node.count -= 1
        for ch in word:
            nxt = node.children[ch]
            nxt.count -= 1
            if nxt.count == 0:
                del node.children[ch]
                return True
            node = nxt
        node.copies -= 1
        return True
"""

OPS2 = "(lambda T: [getattr(T, op[0])(*op[1:]) for op in args[0]])(CountingTrie())"
BIG2 = ("(lambda T: [[T.insert(w) for w in args[0]], sum(T.remove(w) for w in args[1]), sum(T.count(w) for w in args[0][:5000]),"
        " sum(T.count_prefix(p) for p in args[2]), [T.count_prefix(p) for p in args[2][:6]]][1:])(CountingTrie())")
build(S, 2, "CountingTrie", [
    {"name": "Counts", "args": "([('insert', 'apple'), ('insert', 'apple'), ('insert', 'app'), ('count', 'apple'), ('count', 'app'), ('count', 'ap'), ('count_prefix', 'ap'), ('count_prefix', 'appl')],)", "expr": OPS2,
     "show": "insert apple, apple, app; count apple, app, ap; count_prefix ap, appl",
     "why": "[None, None, None, 2, 1, 0, 3, 2]. count_prefix counts every copy of every word that starts with the prefix: apple twice and app once start with ap."},
    {"name": "Remove one copy", "args": "([('insert', 'a'), ('insert', 'a'), ('insert', 'a'), ('remove', 'a'), ('count', 'a'), ('count_prefix', 'a')],)", "expr": OPS2,
     "show": "insert a three times; remove a; count a; count_prefix a", "why": "[None, None, None, True, 2, 2]. remove takes away one copy, not all of them."},
    {"name": "Remove a missing word", "args": "([('insert', 'tea'), ('remove', 'te'), ('remove', 'teas'), ('remove', 'x'), ('count_prefix', 'te'), ('count', 'tea')],)", "expr": OPS2,
     "show": "insert tea; remove te, teas, x; count_prefix te; count tea",
     "why": "[None, False, False, False, 1, 1]. te is only a prefix and was never inserted. Check that the word has a copy before changing any counts, or the counts on the path go wrong."},
    {"name": "Removed completely", "args": "([('insert', 'ten'), ('remove', 'ten'), ('count_prefix', 'te'), ('count_prefix', 't'), ('count', 'ten'), ('remove', 'ten')],)", "expr": OPS2,
     "show": "insert ten; remove ten; count_prefix te, t; count ten; remove ten again",
     "why": "[None, True, 0, 0, 0, False]. After the only copy is gone, no word starts with te or t any more."},
    {"name": "Word inside a word", "args": "([('insert', 'in'), ('insert', 'inn'), ('remove', 'in'), ('count', 'inn'), ('count', 'in'), ('count_prefix', 'in'), ('count_prefix', 'i')],)", "expr": OPS2,
     "show": "insert in, inn; remove in; count inn, in; count_prefix in, i",
     "why": "[None, None, True, 1, 0, 1, 1]. Removing in must keep the node in, because inn still passes through it."},
    {"name": "Insert after remove", "args": "([('insert', 'go'), ('remove', 'go'), ('insert', 'gone'), ('count_prefix', 'go'), ('count', 'go'), ('insert', 'go'), ('count_prefix', 'go')],)", "expr": OPS2,
     "show": "insert go; remove go; insert gone; count_prefix go; count go; insert go; count_prefix go",
     "why": "[None, True, None, 1, 0, None, 2]. If remove deletes nodes, a later insert must be able to create them again."},
    {"name": "Many words", "args": "([('insert', w) for w in ['tea', 'ten', 'tend', 'to', 'tea', 'i', 'in', 'inn']] + [('count_prefix', p) for p in ['t', 'te', 'ten', 'i', 'in', 'x', 'tea']],)", "expr": OPS2,
     "show": "insert tea, ten, tend, to, tea, i, in, inn; count_prefix t, te, ten, i, in, x, tea",
     "why": "Eight inserts return None, then [5, 4, 2, 3, 2, 0, 2]."},
    {"name": "20,000 words", "args": f"({gen(0, 20000, 2654435761, 1)}, {gen(0, 10000, 2654435761, 1)}, {gen(30000, 50000, 40503, 1)})", "expr": BIG2, "timeout": 4000,
     "show": "insert 20,000 words, remove 10,000 of them, then count 5,000 words and 20,000 prefixes: [removed, sum of counts, sum of prefix counts, the first six prefix counts]",
     "why": "Each operation should cost one step per letter. Keeping a plain list or dict of words and scanning it for every count_prefix is hundreds of millions of steps here."},
], trusted=COUNTING)

SEARCHBOX = """
class Node:
    def __init__(self):
        self.children = {}
        self.best = []

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
"""

SB = "(lambda B: [B.suggest(p) for p in args[1]])(SearchBox(args[0]))"
SBIG = "(lambda B: (lambda R: [len(R), sum(len(r) for r in R), R[:4]])([B.suggest(p) for p in args[1]]))(SearchBox(args[0]))"
WORDS3 = f"[w for w in dict.fromkeys({gen(0, 20000, 2654435761, 2)}) if w[0] != 'z']"
PAIRS3 = f"(lambda ws: [(w, (k * 7919) % 1000 + 10) for k, w in enumerate(ws)] + [('z' + w, 1 + k % 5) for k, w in enumerate(ws[:60])])({WORDS3})"
build(S, 3, "SearchBox", [
    {"name": "The example", "args": "([('tea', 5), ('ten', 9), ('team', 2), ('to', 7), ('toe', 1)], ['te', 't', 'to', 'x'])", "expr": SB,
     "show": "words tea 5, ten 9, team 2, to 7, toe 1; suggest te, t, to, x",
     "why": "[['ten', 'tea', 'team'], ['ten', 'to', 'tea'], ['to', 'toe'], []]. Highest count first, at most three, and only words that start with the prefix."},
    {"name": "Equal counts", "args": "([('cat', 4), ('car', 4), ('cab', 4), ('cap', 4), ('cot', 9)], ['ca', 'c'])", "expr": SB,
     "show": "cat, car, cab, cap all 4, cot 9; suggest ca, c",
     "why": "[['cab', 'cap', 'car'], ['cot', 'cab', 'cap']]. When counts are equal, alphabetical order decides."},
    {"name": "The prefix is a word", "args": "([('in', 1), ('inn', 3), ('ink', 2), ('i', 5)], ['in', 'i', 'inn'])", "expr": SB,
     "show": "in 1, inn 3, ink 2, i 5; suggest in, i, inn",
     "why": "[['inn', 'ink', 'in'], ['i', 'inn', 'ink'], ['inn']]. A word counts as starting with itself."},
    {"name": "Longer than any word", "args": "([('go', 3), ('gone', 1)], ['gonee', 'gox', 'g'])", "expr": SB,
     "show": "go 3, gone 1; suggest gonee, gox, g", "why": "[[], [], ['go', 'gone']]. If the walk falls off the trie, there are no suggestions."},
    {"name": "Order of adding", "args": "([('b', 1), ('ba', 2), ('bb', 3), ('bc', 4), ('bd', 5), ('be', 6)], ['b', 'bc'])", "expr": SB,
     "show": "b 1, ba 2, bb 3, bc 4, bd 5, be 6 (added from lowest to highest count); suggest b, bc",
     "why": "[['be', 'bd', 'bc'], ['bc']]. Later words can push earlier ones out of a node's best three."},
    {"name": "One letter typed", "args": f"({PAIRS3}, [chr(97 + k % 25) for k in range(20000)])", "expr": SBIG, "timeout": 4000,
     "show": "about 19,000 words with counts; 20,000 suggestions for one-letter prefixes: [answers, total words suggested, the first four answers]",
     "why": "After one letter, the branch holds hundreds of words. Visiting the whole branch for every suggestion is millions of steps; keep the best three at every node when the words are added, so a suggestion only walks the prefix."},
    {"name": "A rare prefix", "args": f"({PAIRS3}, ['z'] * 20000)", "expr": SBIG, "timeout": 4000,
     "show": "the same words; 20,000 suggestions for z, whose words have the lowest counts: [answers, total, the first four answers]",
     "why": "If you sorted all the words by count once and scan that list for each prefix, the words starting with z are at the very end, so every suggestion reads all the words."},
], trusted=SEARCHBOX)

RADIX = """
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
                leaf = RNode()
                leaf.end = True
                node.kids[ch] = (word[i:], leaf)
                return
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

    def _find(self, s):
        node, i = self.root, 0
        while i < len(s):
            e = node.kids.get(s[i])
            if e is None:
                return None, False
            label, child = e
            if not s.startswith(label[:len(s) - i], i):
                return None, False
            if len(s) - i < len(label):
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
"""

RT = "(lambda T: [[T.insert(w) for w in args[0]], T.labels()][1])(RadixTrie())"
RQ = "(lambda T: [[T.insert(w) for w in args[0]], [T.search(q) for q in args[1]], [T.starts_with(q) for q in args[1]]][1:])(RadixTrie())"
RBIG = ("(lambda T: [[T.insert(w) for w in args[0]], len(T.labels()), len(T.labels()) <= 2 * len(set(args[0])), sum(T.search(q) for q in args[1]),"
        " sum(T.starts_with(q[:4]) for q in args[1])][1:])(RadixTrie())")
build(S, 4, "RadixTrie", [
    {"name": "The lesson's words", "args": "(['bus', 'tea', 'team', 'ten', 'to', 'toast'],)", "expr": RT,
     "show": "insert bus, tea, team, ten, to, toast; labels()",
     "why": "['bus', 't', 'e', 'a', 'm', 'n', 'o', 'ast']: the chains b-u-s and a-s-t became single edges. If you see one letter per edge, chains were not merged: a new word's remaining letters should go on one new edge."},
    {"name": "Split an edge", "args": "(['bus', 'tea', 'team', 'ten', 'to', 'toast', 'toad'],)", "expr": RT,
     "show": "the same words, then toad; labels()",
     "why": "[..., 'o', 'a', 'd', 'st']: toad leaves the edge ast after the a, so the edge splits into a (a new node) with st and d below it."},
    {"name": "Word ends inside an edge", "args": "(['toast', 'to'],)", "expr": RT,
     "show": "insert toast, then to; labels()", "why": "['to', 'ast']. to ends in the middle of the edge toast: split it there and mark the new node as a word end."},
    {"name": "One word", "args": "(['hello'],)", "expr": RT, "show": "insert hello; labels()", "why": "['hello']. One word is one edge from the root."},
    {"name": "Order does not matter", "args": "(['toast', 'ten', 'bus', 'team', 'to', 'tea'],)", "expr": RT,
     "show": "the lesson's words in a different order; labels()", "why": "The same compressed trie as the first test: ['bus', 't', 'e', 'a', 'm', 'n', 'o', 'ast']."},
    {"name": "Search inside an edge", "args": "(['toast', 'tea', 'hello'], ['toast', 'toa', 'to', 'tob', 'toasts', 'hell', 'hello', 'h', 'tea', 'te', 'x'])", "expr": RQ,
     "show": "insert toast, tea, hello; then search and starts_with for toast, toa, to, tob, toasts, hell, hello, h, tea, te, x",
     "why": "search is True only for toast, hello and tea. starts_with is also True for toa, to, hell, h and te: a prefix may end in the middle of an edge, so compare only the part of the label that the prefix covers."},
    {"name": "Inserted twice", "args": "(['abc', 'abc', 'ab', 'ab'],)", "expr": RT, "show": "insert abc, abc, ab, ab; labels()", "why": "['ab', 'c']. Inserting a word that is already there changes nothing."},
    {"name": "20,000 words", "args": f"({gen(0, 20000, 2654435761, 3)}, {gen(10000, 30000, 2654435761, 3)})", "expr": RBIG, "timeout": 4000,
     "show": "insert 20,000 words; [number of edges, at most 2n?, how many of 20,000 searches say True, how many of their 4-letter prefixes are found]",
     "why": "A compressed trie has at most 2n nodes. If the number of edges is much larger, chains of one-child nodes were not merged."},
], trusted=RADIX)

MAXXOR = """
def max_xor(nums):
    B = max(nums).bit_length()
    root = [None, None]
    best = 0
    for i, x in enumerate(nums):
        if i:
            node, r = root, 0
            for k in range(B - 1, -1, -1):
                b = x >> k & 1
                if node[1 - b] is not None:
                    r |= 1 << k
                    node = node[1 - b]
                else:
                    node = node[b]
            if r > best:
                best = r
        node = root
        for k in range(B - 1, -1, -1):
            b = x >> k & 1
            if node[b] is None:
                node[b] = [None, None]
            node = node[b]
    return best
"""

build(S, 5, "max_xor", [
    {"name": "Six numbers", "args": "([3, 10, 5, 25, 2, 8],)", "show": "max_xor([3, 10, 5, 25, 2, 8])", "why": "5 ^ 25 = 00101 ^ 11001 = 11100 = 28."},
    {"name": "The lesson's numbers", "args": "([3, 10, 5, 9, 6],)", "show": "max_xor([3, 10, 5, 9, 6])", "why": "5 ^ 10 = 0101 ^ 1010 = 1111 = 15."},
    {"name": "Two numbers", "args": "([1, 2],)", "show": "max_xor([1, 2])", "why": "With two numbers, the answer is their XOR: 01 ^ 10 = 11 = 3."},
    {"name": "All the same", "args": "([7, 7, 7],)", "show": "max_xor([7, 7, 7])", "why": "x ^ x = 0 for every pair."},
    {"name": "Zeros", "args": "([0, 0],)", "show": "max_xor([0, 0])", "why": "0. Watch out for max(nums).bit_length() being 0: the walk then has no bits at all, which is fine."},
    {"name": "Large values", "args": "([2**30 - 1, 0, 12345, 2**29],)", "show": "max_xor([2**30 - 1, 0, 12345, 2**29])",
     "why": "(2³⁰ − 1) ^ 0 = 1,073,741,823. All 30 bits matter: if you used fewer bits, the top ones were lost."},
    {"name": "Powers of two", "args": "([1, 2, 4, 8, 16, 32, 64],)", "show": "max_xor([1, 2, 4, 8, 16, 32, 64])", "why": "64 ^ 32 = 96. No two powers share a bit."},
    {"name": "The opposite bit is missing", "args": "([8, 9, 10, 11],)", "show": "max_xor([8, 9, 10, 11])",
     "why": "All four start with bit 8, so the top result bit is 0 for every pair. The best is 8 ^ 11 = 1000 ^ 1011 = 0011 = 3, or 9 ^ 10."},
    {"name": "20,000 numbers", "args": "([(k * 2654435761) % (2**30) for k in range(1, 20001)],)", "timeout": 4000,
     "show": "max_xor of 20,000 numbers below 2³⁰",
     "why": "Comparing every pair is 200 million XORs. A trie of bits needs about 20,000 × 60 steps."},
], trusted=MAXXOR)
