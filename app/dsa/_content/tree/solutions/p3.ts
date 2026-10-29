// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def is_bst(root):
    stack = [(root, None, None)]          # node, lower limit, upper limit
    while stack:
        node, lo, hi = stack.pop()
        if node is None:
            continue
        if lo is not None and node.value <= lo:
            return False
        if hi is not None and node.value >= hi:
            return False
        stack.append((node.left, lo, node.value))    # left: below this key
        stack.append((node.right, node.value, hi))   # right: above this key
    return True
`;

export const notes = [
  "The search tree rule is about whole subtrees, not just children. So each node carries the range of keys it may hold: above every ancestor it is right of, below every ancestor it is left of.",
  "Going left, the current key becomes the new upper limit; going right, it becomes the new lower limit. The other limit is passed on unchanged.",
  "None means no limit. Starting with numbers like ±10⁹ fails for bigger keys; `float('inf')` also works, but None needs no special value.",
  "Each node is checked once: O(n) time, and the stack holds O(h) entries for a tree of height h.",
  "An equally good check: an in-order walk of a search tree gives strictly increasing keys. Walk it and compare each key with the one before.",
];
