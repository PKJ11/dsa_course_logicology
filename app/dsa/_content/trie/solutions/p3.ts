// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
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
`;

export const notes = [
  "The answer for a prefix depends only on the words in that prefix's branch, so each node keeps the best three words of its branch, worked out when the words are added.",
  "A word belongs to the branches of exactly the nodes on its own path. So adding a word offers it to the lists of those nodes only: append, sort the four pairs, keep three.",
  "Storing `(-count, word)` lets the ordinary tuple sort do the ordering: the highest count has the smallest negative number, and for equal counts the words are compared alphabetically.",
  "Building costs O(total letters), with a constant-size sort at each step. A suggestion walks the prefix and reads a list: O(L), however many words match. Visiting the branch on every call would cost as much as the branch is large.",
];
