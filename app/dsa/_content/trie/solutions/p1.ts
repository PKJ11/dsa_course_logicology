// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TrieNode:
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
`;

export const notes = [
  "Each node keeps its children in a dict from letter to node, and a flag for the end of a word. The letter is the dict key, so the node does not store it.",
  "`insert` follows one child per letter, creating the missing ones, and sets `end` on the last node. Inserting the same word again changes nothing.",
  "`search` and `starts_with` share one walk. A missing child means no stored word starts with these letters. If the walk succeeds, `starts_with` is true, and `search` also needs the end mark, because the letters may only be the start of a longer word.",
  "Every operation costs O(L) for a word of length L: one dict lookup per letter, whatever the number of stored words.",
];
