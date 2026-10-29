// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def delete(root, key):
    parent, node = None, root
    while node is not None and node.value != key:
        parent = node
        node = node.left if key < node.value else node.right
    if node is None:
        return root                       # key is not in the tree
    if node.left is not None and node.right is not None:
        sp, s = node, node.right          # successor: right once,
        while s.left is not None:         # then left all the way
            sp, s = s, s.left
        node.value = s.value              # take the successor's key
        parent, node = sp, s              # and remove its node instead
    child = node.left if node.left is not None else node.right
    if parent is None:
        return child                      # the root itself was removed
    if parent.left is node:
        parent.left = child
    else:
        parent.right = child
    return root
`;

export const notes = [
  "Finding the key walks one path down: O(h) for a tree of height h. `parent` is kept because removing a node means changing one link in its parent.",
  "A node with two children cannot simply be cut out. Its successor, the smallest key in its right subtree, is bigger than everything on the left and smaller than everything else on the right, so it can take the node's place.",
  "The successor has no left child (otherwise that child would be smaller). So after copying its key, removing the successor's node is the easy case: at most one child.",
  "In the easy case, the node's only child (or None) is linked into the parent on the same side. If the node was the root, that child is the new root, which is why the function returns a root.",
  "Every step walks down the tree once more at most: O(h) in total. With 100,000 random keys, h is about 40; for a path-shaped tree it would be n (BALT fixes this).",
];
