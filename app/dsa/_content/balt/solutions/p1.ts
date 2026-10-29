// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def is_balanced(root):
    def check(node):                 # its height, or None if unbalanced
        if node is None:
            return -1
        a = check(node.left)
        if a is None:
            return None
        b = check(node.right)
        if b is None:
            return None
        if abs(a - b) > 1:
            return None
        return 1 + max(a, b)

    return check(root) is not None
`;

export const notes = [
  "One post-order pass: each call needs the heights of both children before it can judge its own node, so children are checked before their parent.",
  "`check` returns two things in one value: a height when the subtree is balanced, and `None` when it is not. `None` is passed straight up, so the search stops at the first broken node.",
  "Each node is visited once: O(n) time, and O(h) space for the recursion. The limits promise at most 300 levels, well under Python's limit of about 1,000 calls.",
  "A common mistake is to call a separate `height(node)` at every node. That visits the nodes of each subtree once for every ancestor: O(n log n) for a balanced tree and O(n²) for a path.",
];
