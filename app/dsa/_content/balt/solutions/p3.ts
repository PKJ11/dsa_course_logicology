// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0


def h(node):
    return node.height if node is not None else -1


def update(node):
    node.height = 1 + max(h(node.left), h(node.right))


def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update(y)                        # y is now below x: update it first
    update(x)
    return x


def rotate_left(y):
    x = y.right
    y.right = x.left
    x.left = y
    update(y)
    update(x)
    return x


def rebalance(node):
    update(node)
    balance = h(node.left) - h(node.right)
    if balance > 1:                  # left side two taller
        if h(node.left.left) < h(node.left.right):
            node.left = rotate_left(node.left)      # inside case
        return rotate_right(node)
    if balance < -1:                 # right side two taller
        if h(node.right.right) < h(node.right.left):
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


def avl_insert(root, key):
    if root is None:
        return AVLNode(key)
    if key < root.value:
        root.left = avl_insert(root.left, key)
    elif key > root.value:
        root.right = avl_insert(root.right, key)
    else:
        return root                  # already there
    return rebalance(root)
`;

export const notes = [
  "The insert is the plain recursive search-tree insert. Each call returns the new top of its subtree, and the caller stores it (`root.left = avl_insert(...)`), so a rotation anywhere below is linked in correctly.",
  "`rebalance` runs on every node of the path, from the new leaf upwards. For most nodes it only updates the height. At the first node whose balance is ±2 it rotates, and after that the heights above stay the same, so later calls change nothing.",
  "The inside case is detected by comparing the two subtrees of the taller child: if the inside one is taller, rotate at the child first. Using `<` (not `<=`) also handles the equal case correctly, which only happens after deletes.",
  "Heights are stored, so each balance is O(1), and an insert is O(log n). The recursion is as deep as the tree: at most about 1.44 log₂ n, which is 23 for 50,000 keys.",
];
