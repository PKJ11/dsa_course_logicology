// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def rotate(root, key, side):
    parent, node = None, root
    while node.value != key:                 # walk down, remembering the parent
        parent = node
        node = node.left if key < node.value else node.right

    if side == 'right':
        up = node.left
        node.left = up.right                 # the middle subtree moves across
        up.right = node
    else:
        up = node.right
        node.right = up.left
        up.left = node

    if parent is None:                       # node was the root
        return up
    if parent.left is node:
        parent.left = up
    else:
        parent.right = up
    return root
`;

export const notes = [
  "The search is the one from TREE-4, with one extra variable: the parent of the current node. A rotation needs it, because the parent's link must move from the old top to the new one.",
  "The rotation itself is lesson 2's three assignments. The middle subtree changes parent; the other two stay where they are.",
  "`parent.left is node` compares the objects themselves. Comparing values would also work here, because all keys are different.",
  "Finding the node costs O(h); the rotation costs O(1). No node is created or copied, so the same node objects make up the tree before and after.",
];
