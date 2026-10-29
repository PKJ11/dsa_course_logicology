// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class BNode:
    def __init__(self, keys=None, kids=None):
        self.keys = keys if keys is not None else []
        self.kids = kids if kids is not None else []


def split(parent, i):
    full = parent.kids[i]                     # 3 keys
    right = BNode(full.keys[2:], full.kids[2:])
    parent.keys.insert(i, full.keys[1])       # the middle key goes up
    parent.kids.insert(i + 1, right)
    full.keys = full.keys[:1]
    full.kids = full.kids[:2]


def btree_insert(root, key):
    if root is None:
        return BNode([key])
    if len(root.keys) == 3:                   # the only way to grow taller
        root = BNode([], [root])
        split(root, 0)
    node = root
    while node.kids:
        i = 0
        while i < len(node.keys) and key > node.keys[i]:
            i += 1
        if i < len(node.keys) and node.keys[i] == key:
            return root                       # already there
        if len(node.kids[i].keys) == 3:
            split(node, i)                    # make room before stepping in
            if key == node.keys[i]:
                return root
            if key > node.keys[i]:
                i += 1
        node = node.kids[i]
    if key not in node.keys:
        node.keys.append(key)
        node.keys.sort()
    return root
`;

export const notes = [
  "This splits on the way down. Before stepping into a full child, split it, so its parent always has room for the middle key. That is why the walk never needs to come back up.",
  "A full root is split by giving it a new, empty parent first. That adds one level above every leaf at once, so all leaves stay at the same depth.",
  "After a split, the middle key now sits at `node.keys[i]`. Compare once more to choose between the two halves (or stop, if it is the key itself).",
  "Each node has at most 3 keys, so all the list work inside a node is O(1). The walk visits one node per level, and the height is at most log₂((n + 1) / 2): O(log n) per insert.",
];
