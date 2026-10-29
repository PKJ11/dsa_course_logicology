// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def lca(root, p, q):
    def find(node):
        # None if neither p nor q is below node; otherwise a node that matters
        if node is None or node.value == p or node.value == q:
            return node
        a = find(node.left)
        b = find(node.right)
        if a is not None and b is not None:
            return node                   # p on one side, q on the other
        return a if a is not None else b

    return find(root).value
`;

export const notes = [
  "`find(node)` reports what it found below `node`: nothing (None), one of the two targets, or, once both have been seen on different sides, their common ancestor.",
  "The first node whose left and right calls both return something has p on one side and q on the other. It is the lowest such node, because the calls return from the bottom up.",
  "If a node holds p (or q), it is returned at once without looking below it. That is correct even if the other value is below it, because then this node is the answer: a node counts as its own ancestor.",
  "Each node is visited at most once: O(n) time and O(h) stack depth. In a search tree you could steer by comparing values (lesson 6) and only walk one path, O(h).",
];
