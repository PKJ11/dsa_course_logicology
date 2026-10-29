from solgen import write_station

NODE = '''class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

'''

write_station("balt", 6, {
    1: (NODE + '''
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
''', [
        "One post-order pass: each call needs the heights of both children before it can judge its own node, so children are checked before their parent.",
        "`check` returns two things in one value: a height when the subtree is balanced, and `None` when it is not. `None` is passed straight up, so the search stops at the first broken node.",
        "Each node is visited once: O(n) time, and O(h) space for the recursion. The limits promise at most 300 levels, well under Python's limit of about 1,000 calls.",
        "A common mistake is to call a separate `height(node)` at every node. That visits the nodes of each subtree once for every ancestor: O(n log n) for a balanced tree and O(n²) for a path.",
    ]),
    2: (NODE + '''
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
''', [
        "The search is the one from TREE-4, with one extra variable: the parent of the current node. A rotation needs it, because the parent's link must move from the old top to the new one.",
        "The rotation itself is lesson 2's three assignments. The middle subtree changes parent; the other two stay where they are.",
        "`parent.left is node` compares the objects themselves. Comparing values would also work here, because all keys are different.",
        "Finding the node costs O(h); the rotation costs O(1). No node is created or copied, so the same node objects make up the tree before and after.",
    ]),
    3: ('''class AVLNode:
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
''', [
        "The insert is the plain recursive search-tree insert. Each call returns the new top of its subtree, and the caller stores it (`root.left = avl_insert(...)`), so a rotation anywhere below is linked in correctly.",
        "`rebalance` runs on every node of the path, from the new leaf upwards. For most nodes it only updates the height. At the first node whose balance is ±2 it rotates, and after that the heights above stay the same, so later calls change nothing.",
        "The inside case is detected by comparing the two subtrees of the taller child: if the inside one is taller, rotate at the child first. Using `<` (not `<=`) also handles the equal case correctly, which only happens after deletes.",
        "Heights are stored, so each balance is O(1), and an insert is O(log n). The recursion is as deep as the tree: at most about 1.44 log₂ n, which is 23 for 50,000 keys.",
    ]),
    4: ('''class RBNode:
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
''', [
        "This is the left-leaning red-black tree from lesson 4: one extra rule (a red node is always a left child) makes the repair three checks on the way back up.",
        "Check 1 turns a red right child into a red left child. Check 2 fixes two reds in a row on the left by lifting the middle one. Check 3 splits a node whose two children are red: they become black and the node turns red, which passes the problem one level up.",
        "Rotations hand the old top's colour to the node that comes up and make the old top red, so the black counts on every path stay the same.",
        "The tree obeys all four rules after every insert, and its height is at most 2 log₂(n + 1). Each insert is O(log n).",
        "The CLRS version with parent links and the uncle cases is longer but equally correct; the tests accept any tree that obeys the rules.",
    ]),
    5: ('''class BNode:
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
''', [
        "This splits on the way down. Before stepping into a full child, split it, so its parent always has room for the middle key. That is why the walk never needs to come back up.",
        "A full root is split by giving it a new, empty parent first. That adds one level above every leaf at once, so all leaves stay at the same depth.",
        "After a split, the middle key now sits at `node.keys[i]`. Compare once more to choose between the two halves (or stop, if it is the key itself).",
        "Each node has at most 3 keys, so all the list work inside a node is O(1). The walk visits one node per level, and the height is at most log₂((n + 1) / 2): O(log n) per insert.",
    ]),
    6: ('''import random


class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height


class SkipList:
    MAX = 20

    def __init__(self):
        self.head = SkipNode(None, self.MAX)

    def _before(self, key):
        """The last node with a key smaller than key, on every level."""
        node, path = self.head, [None] * self.MAX
        for lv in range(self.MAX - 1, -1, -1):
            nxt = node.next[lv]
            while nxt is not None and nxt.key < key:
                node = nxt
                nxt = node.next[lv]
            path[lv] = node
        return path

    def contains(self, key):
        nxt = self._before(key)[0].next[0]
        return nxt is not None and nxt.key == key

    def first_at_least(self, key):
        nxt = self._before(key)[0].next[0]
        return None if nxt is None else nxt.key

    def add(self, key):
        path = self._before(key)
        nxt = path[0].next[0]
        if nxt is not None and nxt.key == key:
            return
        height = 1
        while height < self.MAX and random.random() < 0.5:
            height += 1
        node = SkipNode(key, height)
        for lv in range(height):
            node.next[lv] = path[lv].next[lv]
            path[lv].next[lv] = node

    def remove(self, key):
        path = self._before(key)
        node = path[0].next[0]
        if node is None or node.key != key:
            return False
        for lv in range(len(node.next)):
            if path[lv].next[lv] is node:
                path[lv].next[lv] = node.next[lv]
        return True
''', [
        "All four methods share one search, `_before`. It returns, for each level, the last node whose key is smaller than `key`. The head counts as smaller than everything, so its key (None) is never compared.",
        "On level 0, the node right after `path[0]` is the first key that is at least `key`. That one fact answers `contains` and `first_at_least`.",
        "`add` flips a fair coin to choose the height, then links the new node in after `path[lv]` on each of its levels: two assignments per level, as in a linked-list insert.",
        "`remove` links around the node on every level where it appears. The node is then unreachable and Python frees it.",
        "Expected cost: about log₂ n levels with about 2 nodes looked at per level, so O(log n) per operation, and about 2n links in total. Twenty levels are plenty for a million keys.",
    ]),
})
