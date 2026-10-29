// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def build_tree(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}   # value -> in-order place
    nxt = 0                                          # next root in pre-order

    def make(lo, hi):                    # the subtree for inorder[lo..hi]
        nonlocal nxt
        if lo > hi:
            return None
        v = preorder[nxt]
        nxt += 1
        node = TreeNode(v)
        node.left = make(lo, where[v] - 1)
        node.right = make(where[v] + 1, hi)
        return node

    return make(0, len(inorder) - 1)
`;

export const notes = [
  "Pre-order lists a root before its subtrees, so the next unused pre-order value is always the root of the subtree being built.",
  "In in-order, that root splits its range: everything left of it is its left subtree, everything right of it is its right subtree.",
  "`make` builds the left subtree before the right one. That is the order pre-order lists them, so the shared index `nxt` always points at the right value.",
  "The dict finds each root's in-order place in O(1), so the whole rebuild is O(n). Using `inorder.index(v)` instead costs O(n) per node, O(n²) for a long path.",
  "The recursion is as deep as the tree. For trees thousands of levels deep, the same idea works with an explicit stack.",
];
