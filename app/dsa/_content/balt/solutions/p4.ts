// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class RBNode:
    def __init__(self, value, red=True):
        self.value = value
        self.red = red
        self.left = None
        self.right = None


def is_red(node):
    return node is not None and node.red


def rotate_left(h):
    x = h.right
    h.right = x.left
    x.left = h
    x.red = h.red                    # x takes h's place and colour
    h.red = True
    return x


def rotate_right(h):
    x = h.left
    h.left = x.right
    x.right = h
    x.red = h.red
    h.red = True
    return x


def flip_colours(h):
    h.red = True
    h.left.red = False
    h.right.red = False


def put(h, key):
    if h is None:
        return RBNode(key)           # new nodes are red
    if key < h.value:
        h.left = put(h.left, key)
    elif key > h.value:
        h.right = put(h.right, key)
    if is_red(h.right) and not is_red(h.left):
        h = rotate_left(h)
    if is_red(h.left) and is_red(h.left.left):
        h = rotate_right(h)
    if is_red(h.left) and is_red(h.right):
        flip_colours(h)
    return h


def rb_insert(root, key):
    root = put(root, key)
    root.red = False                 # rule 2
    return root
`;

export const notes = [
  "This is the left-leaning red-black tree from lesson 4: one extra rule (a red node is always a left child) makes the repair three checks on the way back up.",
  "Check 1 turns a red right child into a red left child. Check 2 fixes two reds in a row on the left by lifting the middle one. Check 3 splits a node whose two children are red: they become black and the node turns red, which passes the problem one level up.",
  "Rotations hand the old top's colour to the node that comes up and make the old top red, so the black counts on every path stay the same.",
  "The tree obeys all four rules after every insert, and its height is at most 2 log₂(n + 1). Each insert is O(log n).",
  "The CLRS version with parent links and the uncle cases is longer but equally correct; the tests accept any tree that obeys the rules.",
];
