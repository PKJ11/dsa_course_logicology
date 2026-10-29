import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "balt"
FIG = "[8, 3, 10, 1, 6, 14, 4, 7, 13]"   # the TREE lessons' tree, as BST insert order
KEYS = "[(k * 7919) % 100_003 for k in range(100_000)]"   # 100,000 different keys in a scattered order
HALF = "[(k * 7919) % 100_003 for k in range(50_000)]"
SMALL = "[(k * 7919) % 100_003 for k in range(10_000)]"
RED = "__import__('functools').reduce"


def fib_preorder(h):
    """Pre-order keys of the thinnest AVL tree of height h (a Fibonacci tree), keys 0.. in in-order."""
    def size(h):
        return 0 if h < 0 else 1 if h == 0 else 1 + size(h - 1) + size(h - 2)
    out = []
    def make(h, lo):
        if h < 0:
            return
        if h == 0:
            out.append(lo)
            return
        left = size(h - 1)
        out.append(lo + left)
        make(h - 1, lo)
        make(h - 2, lo + left + 1)
    make(h, 0)
    return out


FIB10 = fib_preorder(10)

# P1 is the tree height-balanced?
IB = "is_balanced(tree(args[0]))"
build(S, 1, "is_balanced", [
    {"name": "Balanced", "args": "([3, 9, 20, None, None, 15, 7],)", "expr": IB, "show": "tree [3, 9, 20, None, None, 15, 7]",
     "why": "Every node's two subtrees differ in height by at most 1: True."},
    {"name": "Empty tree", "args": "([],)", "expr": IB, "show": "empty tree (root is None)", "why": "An empty tree breaks no rule: True."},
    {"name": "One node", "args": "([1],)", "expr": IB, "show": "a single node", "why": "Both subtrees are empty (height −1 each): True."},
    {"name": "Leaning left", "args": "([1, 2, 2, 3, 3, None, None, 4, 4],)", "expr": IB, "show": "tree [1, 2, 2, 3, 3, None, None, 4, 4]",
     "why": "At the root, the left subtree has height 2 and the right subtree height 0: they differ by 2. False."},
    {"name": "Root fine, lower node not", "args": "([0, 1, 2, 3, None, None, 4, 5, None, None, 6],)", "expr": IB,
     "show": "tree [0, 1, 2, 3, None, None, 4, 5, None, None, 6]: two paths of 3 nodes hanging from the root",
     "why": "The root's two subtrees both have height 2, so the root is fine. But node 1 has a left subtree of height 1 and no right subtree (height −1): they differ by 2. The rule must hold at every node: False."},
    {"name": "A path of three", "args": "([1, None, 2, None, 3],)", "expr": IB, "show": "tree [1, None, 2, None, 3]", "why": "At 1: left height −1, right height 1. False."},
    {"name": "Thinnest AVL tree", "args": f"({FIB10},)", "expr": "is_balanced(bst(args[0]))",
     "show": "the thinnest tree of height 10 that obeys the rule (232 nodes; its leaves are at depths 5 to 10)",
     "why": "Every node has subtrees whose heights differ by exactly 1 or 0: True. If you got False, you may be comparing the depths of leaves. Leaves can be far apart in depth; the rule is about the heights of the two subtrees at each node."},
    {"name": "Perfect tree", "args": "()", "expr": "is_balanced(tree(list(range(2 ** 17 - 1))))", "timeout": 3000,
     "show": "a perfect tree of 131,071 nodes (17 full levels)",
     "why": "True. Work out each height once, from the bottom up: O(n). Calling a separate height function at every node costs O(n log n) here, and O(n²) on a long path."},
    {"name": "50,000 random keys", "args": f"({HALF},)", "expr": "is_balanced(bst(args[0]))", "timeout": 3000,
     "show": "a plain search tree built from 50,000 keys in a scattered order",
     "why": "False. A plain search tree from random keys is short on average, but somewhere a node's subtrees differ by 2 or more."},
], trusted="""
def is_balanced(root):
    h = {None: -1}
    order, stack = [], [root] if root is not None else []
    while stack:
        n = stack.pop()
        order.append(n)
        for c in (n.left, n.right):
            if c is not None:
                stack.append(c)
    for n in reversed(order):
        a, b = h[n.left], h[n.right]
        if abs(a - b) > 1:
            return False
        h[n] = 1 + max(a, b)
    return True
""")

# P2 rotate at a key, fixing the parent's link
RT = "levels(rotate(bst(args[0]), args[1], args[2]))"
SAME = "(lambda r: (lambda before: (lambda nr: [levels(nr), sorted(map(id, tnodes(nr))) == before])(rotate(r, args[1], args[2])))(sorted(map(id, tnodes(r)))))(bst(args[0]))"
BIGROT = ("(lambda r: (lambda n: (lambda nr: (lambda v: [n.value, len(v), all(v[i] < v[i + 1] for i in range(len(v) - 1)), height(nr)])(inorder(nr)))"
          "(rotate(r, n.value, 'right')))(next(x for x in tnodes(r)[30_000:] if x.left is not None)))(bst(args[0]))")
build(S, 2, "rotate", [
    {"name": "Right at the root", "args": "([6, 4, 7, 2, 5], 6, 'right')", "expr": RT, "show": "tree 6; 4, 7; 2, 5 (from lesson 2); rotate right at 6",
     "why": "4 comes up and becomes the root; 5 moves across to be 6's left child. Level order: [4, 2, 6, None, None, 5, 7]. Return the new root."},
    {"name": "Left at the root", "args": "([4, 2, 6, 5, 7], 4, 'left')", "expr": RT, "show": "tree 4; 2, 6; 5, 7; rotate left at 4",
     "why": "6 comes up; 5 moves across to be 4's right child: [6, 4, 7, 2, 5]."},
    {"name": "A left child, deeper down", "args": f"({FIG}, 3, 'left')", "expr": RT, "show": "the TREE lessons' tree (8; 3, 10; 1, 6, 14; 4, 7, 13); rotate left at 3",
     "why": "6 comes up in 3's place, so 8's left child must now be 6. If 8 still points to 3, the parent's link was not fixed, and 6 with its subtree is lost."},
    {"name": "A right child, deeper down", "args": f"({FIG}, 10, 'left')", "expr": RT, "show": "the same tree; rotate left at 10",
     "why": "14 comes up in 10's place, so 8's right child must become 14, with 10 as 14's left child and 13 as 10's right child."},
    {"name": "Right, near a leaf", "args": f"({FIG}, 14, 'right')", "expr": RT, "show": "the same tree; rotate right at 14",
     "why": "13 comes up as 10's right child, and 14 becomes 13's right child."},
    {"name": "Same nodes", "args": f"({FIG}, 6, 'right')", "expr": SAME, "show": "the same tree; rotate right at 6: [the tree, made of the same node objects?]",
     "why": "A rotation only changes links. If the second value is False, the code built new nodes instead of moving the old ones."},
    {"name": "There and back", "args": "([6, 4, 7, 2, 5],)", "expr": "levels(rotate(rotate(bst(args[0]), 6, 'right'), 4, 'left'))",
     "show": "tree 6; 4, 7; 2, 5; rotate right at 6, then left at 4", "why": "A left rotation undoes a right rotation: the tree is back to [6, 4, 7, 2, 5]."},
    {"name": "50,000 nodes", "args": f"({HALF},)", "expr": BIGROT, "timeout": 4000,
     "show": "a search tree of 50,000 keys; rotate right at a node deep in the tree: [its key, size, still in order?, height]",
     "why": "Finding the node walks one path, O(h); the rotation itself is O(1). If the size dropped, a link was lost; if the order broke, a subtree was attached on the wrong side."},
], trusted="""
def rotate(root, key, side):
    parent, node = None, root
    while node.value != key:
        parent, node = node, (node.left if key < node.value else node.right)
    if side == 'right':
        up = node.left
        node.left = up.right
        up.right = node
    else:
        up = node.right
        node.right = up.left
        up.left = node
    if parent is None:
        return up
    if parent.left is node:
        parent.left = up
    else:
        parent.right = up
    return root
""")

AVL = """
class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0

def h(n):
    return n.height if n is not None else -1

def update(n):
    n.height = 1 + max(h(n.left), h(n.right))

def rot_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update(y)
    update(x)
    return x

def rot_left(y):
    x = y.right
    y.right = x.left
    x.left = y
    update(y)
    update(x)
    return x

def rebalance(n):
    update(n)
    b = h(n.left) - h(n.right)
    if b > 1:
        if h(n.left.left) < h(n.left.right):
            n.left = rot_left(n.left)
        return rot_right(n)
    if b < -1:
        if h(n.right.right) < h(n.right.left):
            n.right = rot_right(n.right)
        return rot_left(n)
    return n

def avl_insert(root, key):
    if root is None:
        return AVLNode(key)
    if key < root.value:
        root.left = avl_insert(root.left, key)
    elif key > root.value:
        root.right = avl_insert(root.right, key)
    else:
        return root
    return rebalance(root)
"""

# P3 AVL insert
AI = f"levels(free({RED}(avl_insert, args[0], None)))"
AIS = f"(lambda r: [height(r), unbalanced(r), inorder(r) == sorted(args[0])])(free({RED}(avl_insert, args[0], None)))"
build(S, 3, "avl_insert", [
    {"name": "Three in order", "args": "([1, 2, 3],)", "expr": AI, "show": "insert 1, 2, 3 into an empty tree; shows the tree level by level",
     "why": "After 3, node 1 has balance −2 (right-right case). A left rotation at 1 makes 2 the root: [2, 1, 3]."},
    {"name": "Left-left", "args": "([3, 2, 1],)", "expr": AI, "show": "insert 3, 2, 1", "why": "Mirror case: a right rotation at 3 gives [2, 1, 3]."},
    {"name": "Left-right", "args": "([3, 1, 2],)", "expr": AI, "show": "insert 3, 1, 2",
     "why": "2 went left, then right: the inside case. Rotate left at 1, then right at 3: [2, 1, 3]. A single right rotation at 3 gives [1, None, 3, 2] instead, which is still unbalanced."},
    {"name": "Right-left", "args": "([1, 3, 2],)", "expr": AI, "show": "insert 1, 3, 2", "why": "Rotate right at 3, then left at 1: [2, 1, 3]."},
    {"name": "The lesson's double rotation", "args": "([50, 20, 80, 10, 30, 25],)", "expr": AI, "show": "insert 50, 20, 80, 10, 30, 25 (lesson 3's figure)",
     "why": "25 makes 50 unbalanced (+2) through 20 (−1): left-right. The result is [30, 20, 50, 10, 25, None, 80]."},
    {"name": "1 to 7", "args": "(list(range(1, 8)),)", "expr": AI, "show": "insert 1 to 7 in order",
     "why": "A perfect tree: [4, 2, 6, 1, 3, 5, 7]. If the shape is different but balanced, check that the walk back up updates every height on the path, lowest first."},
    {"name": "Mixed order, 20 keys", "args": "([41, 20, 65, 11, 29, 50, 26, 23, 55, 70, 1, 2, 3, 90, 85, 33, 34, 35, 60, 61],)", "expr": AI,
     "show": "20 keys in a mixed order; shows the exact tree",
     "why": "An AVL insert is fully determined by the keys and their order, so the shape must match exactly. Find the first insert where your tree differs: the four cases and the height updates are the usual suspects."},
    {"name": "1 to 1,000 in order", "args": "(list(range(1, 1_001)),)", "expr": AIS, "show": "insert 1 to 1,000 in order: [height, unbalanced nodes, still in order?]",
     "why": "A plain search tree would be a path of height 999. An AVL tree must stay at height 9, with no unbalanced nodes."},
    {"name": "10,000 keys", "args": f"({SMALL},)", "expr": AIS, "timeout": 4000,
     "show": "insert 10,000 keys in a scattered order: [height, unbalanced nodes, still in order?]",
     "why": "Each insert is O(log n). If this timed out, the code may work out heights by walking whole subtrees instead of storing them in the nodes."},
], trusted=AVL)

RB = """
class RBNode:
    def __init__(self, value, red=True):
        self.value = value
        self.red = red
        self.left = None
        self.right = None

def is_red(n):
    return n is not None and n.red

def rot_left(h):
    x = h.right
    h.right = x.left
    x.left = h
    x.red = h.red
    h.red = True
    return x

def rot_right(h):
    x = h.left
    h.left = x.right
    x.right = h
    x.red = h.red
    h.red = True
    return x

def flip(h):
    h.red = True
    h.left.red = False
    h.right.red = False

def put(h, key):
    if h is None:
        return RBNode(key)
    if key < h.value:
        h.left = put(h.left, key)
    elif key > h.value:
        h.right = put(h.right, key)
    if is_red(h.right) and not is_red(h.left):
        h = rot_left(h)
    if is_red(h.left) and is_red(h.left.left):
        h = rot_right(h)
    if is_red(h.left) and is_red(h.right):
        flip(h)
    return h

def rb_insert(root, key):
    root = put(root, key)
    root.red = False
    return root
"""

# P4 red-black insert: any correct red-black tree passes
RI = f"(lambda r: [rb_check(r), inorder(r)])(free({RED}(rb_insert, args[0], None)))"
RIB = f"(lambda r: [rb_check(r), height(r) <= 2 * __import__('math').log2(len(args[0]) + 1), inorder(r) == sorted(args[0])])(free({RED}(rb_insert, args[0], None)))"
build(S, 4, "rb_insert", [
    {"name": "One key", "args": "([5],)", "expr": RI, "show": "insert 5: [rule check, keys in order]", "why": "A single node must be black (rule 2): new nodes start red, so colour the root black at the end."},
    {"name": "Three in order", "args": "([1, 2, 3],)", "expr": RI, "show": "insert 1, 2, 3: [rule check, keys in order]",
     "why": "Without any repair the tree is a path, and the black counts differ under 1. Each check names the first rule broken."},
    {"name": "1 to 8", "args": "(list(range(1, 9)),)", "expr": RI, "show": "insert 1 to 8 (lesson 4's figure)", "why": "'ok' means all four rules hold."},
    {"name": "8 down to 1", "args": "(list(range(8, 0, -1)),)", "expr": RI, "show": "insert 8, 7, …, 1", "why": "The mirror image: rotations go the other way."},
    {"name": "Zigzag", "args": "([10, 5, 7, 6, 8, 20, 15, 17, 16, 30, 1],)", "expr": RI, "show": "insert 10, 5, 7, 6, 8, 20, 15, 17, 16, 30, 1",
     "why": "Many keys land on the inside of a red parent, which needs a rotation at the parent first (or, in the left-leaning version, a left rotation)."},
    {"name": "Same keys, colours kept", "args": "([41, 38, 31, 12, 19, 8],)", "expr": RI, "show": "insert 41, 38, 31, 12, 19, 8 (an exercise from CLRS)",
     "why": "If a rotation forgets to move the colours along with the nodes, the black counts end up different on two sides."},
    {"name": "1 to 1,000 in order", "args": "(list(range(1, 1_001)),)", "expr": RIB, "show": "insert 1 to 1,000: [rule check, height ≤ 2 log₂(n + 1)?, still in order?]",
     "why": "Sorted keys are the worst case for a plain search tree. A red-black tree keeps its height at most 2 log₂(n + 1), about 19.9 here."},
    {"name": "10,000 keys", "args": f"({SMALL},)", "expr": RIB, "timeout": 4000,
     "show": "insert 10,000 keys in a scattered order: [rule check, height within the bound?, still in order?]",
     "why": "Each insert is O(log n). If this timed out, look for a loop that walks the whole tree on each insert."},
], trusted=RB)

BT = """
class BNode:
    def __init__(self, keys=None, kids=None):
        self.keys = keys if keys is not None else []
        self.kids = kids if kids is not None else []

def split(parent, i):
    full = parent.kids[i]
    right = BNode(full.keys[2:], full.kids[2:])
    parent.keys.insert(i, full.keys[1])
    parent.kids.insert(i + 1, right)
    full.keys = full.keys[:1]
    full.kids = full.kids[:2]

def btree_insert(root, key):
    if root is None:
        return BNode([key])
    if len(root.keys) == 3:
        root = BNode([], [root])
        split(root, 0)
    node = root
    while node.kids:
        i = 0
        while i < len(node.keys) and key > node.keys[i]:
            i += 1
        if i < len(node.keys) and node.keys[i] == key:
            return root
        if len(node.kids[i].keys) == 3:
            split(node, i)
            if key == node.keys[i]:
                return root
            if key > node.keys[i]:
                i += 1
        node = node.kids[i]
    if key not in node.keys:
        node.keys.append(key)
        node.keys.sort()
    return root
"""

# P5 B-tree insert (1 to 3 keys per node): any correct B-tree passes
BI = f"(lambda r: [bcheck(r), bkeys(r)])(free({RED}(btree_insert, args[0], None)))"
BIB = (f"(lambda r: [bcheck(r), bheight(r) <= __import__('math').log2((len(args[0]) + 1) / 2), bkeys(r) == sorted(args[0])])"
       f"(free({RED}(btree_insert, args[0], None)))")
build(S, 5, "btree_insert", [
    {"name": "One key", "args": "([7],)", "expr": BI, "show": "insert 7 into an empty tree (None): [rule check, keys in order]", "why": "The first key makes a root that is also a leaf: BNode([7])."},
    {"name": "Three keys", "args": "([20, 10, 30],)", "expr": BI, "show": "insert 20, 10, 30", "why": "All three fit in one node, in order: [10, 20, 30]."},
    {"name": "The fourth key splits", "args": "([10, 20, 30, 40],)", "expr": f"(lambda r: [bcheck(r), bkeys(r), bheight(r)])(free({RED}(btree_insert, args[0], None)))",
     "show": "insert 10, 20, 30, 40: [rule check, keys, height]", "why": "A node holds at most 3 keys, so the fourth forces a split: the tree gets a new root and height 1."},
    {"name": "10 to 100", "args": "(list(range(10, 101, 10)),)", "expr": BI, "show": "insert 10, 20, …, 100 (lesson 5's figure)",
     "why": "'ok' means every rule holds. If a leaf is at the wrong depth, a split probably added a level somewhere other than the root."},
    {"name": "100 down to 1", "args": "(list(range(100, 0, -1)),)", "expr": BI, "show": "insert 100, 99, …, 1",
     "why": "Keys arrive at the far left every time. Check that a split puts the middle key into the parent at the right position and the new node right after the old one."},
    {"name": "Repeated keys", "args": "([5, 3, 5, 8, 3, 1, 8],)", "expr": BI, "show": "insert 5, 3, 5, 8, 3, 1, 8", "why": "A key that is already in the tree is not added again: the keys are [1, 3, 5, 8]."},
    {"name": "2,000 mixed keys", "args": "([(k * 37) % 2_003 for k in range(2_000)],)", "expr": BIB,
     "show": "insert 2,000 keys in a scattered order: [rule check, height within the bound?, keys in order?]",
     "why": "With at least 2 children per node, the height is at most log₂((n + 1) / 2)."},
    {"name": "20,000 in order", "args": "(list(range(20_000)),)", "expr": BIB, "timeout": 7000,
     "show": "insert 0 to 19,999 in increasing order: [rule check, height within the bound?, keys in order?]",
     "why": "Each insert visits one node per level. If this timed out, the code may scan or copy the whole tree on each insert."},
], trusted=BT)

SKIP = """
import random

class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height

class SkipList:
    MAX = 20

    def __init__(self):
        self.head = SkipNode(None, self.MAX)

    def _before(self, key):
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
        h = 1
        while h < self.MAX and random.random() < 0.5:
            h += 1
        node = SkipNode(key, h)
        for lv in range(h):
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
"""

# P6 a skip list
OPS = "(lambda S: [getattr(S, op[0])(*op[1:]) for op in args[0]])(free(SkipList()))"
SHAPE = "(lambda S: [[S.add(k) for k in args[0]], (lambda c: [c[0], 0.4 < c[1] / c[0] < 0.6, 0.15 < c[2] / c[0] < 0.35])(skip_counts(S))][1])(free(SkipList()))"
BIGS = ("(lambda S: [[S.add(k) for k in args[0]], [S.remove(k) for k in args[0][::3]], "
        "[sum(S.contains(k) for k in range(0, 60_000, 7)), sum(x for x in (S.first_at_least(k) for k in range(5, 60_000, 11)) if x is not None)]][2])(free(SkipList()))")
build(S, 6, "SkipList", [
    {"name": "Add and find", "args": "([('add', 5), ('add', 1), ('add', 9), ('contains', 5), ('contains', 4), ('contains', 9), ('contains', 1)],)", "expr": OPS,
     "show": "add 5, 1, 9; then contains 5, 4, 9, 1 (add returns None)", "why": "[None, None, None, True, False, True, True]."},
    {"name": "Empty list", "args": "([('contains', 3), ('first_at_least', 3), ('remove', 3)],)", "expr": OPS,
     "show": "a new list: contains 3, first_at_least 3, remove 3", "why": "Nothing is there: [False, None, False]. Check for None before reading .key."},
    {"name": "Remove", "args": "([('add', 4), ('add', 2), ('add', 7), ('remove', 4), ('contains', 4), ('contains', 2), ('contains', 7), ('remove', 4)],)", "expr": OPS,
     "show": "add 4, 2, 7; remove 4; contains 4, 2, 7; remove 4 again", "why": "remove returns True when the key was there, then False the second time: [None, None, None, True, False, True, True, False]. 4 must be unlinked on every level of its tower."},
    {"name": "First key at least x", "args": "([('add', 10), ('add', 20), ('add', 30), ('first_at_least', 15), ('first_at_least', 20), ('first_at_least', 5), ('first_at_least', 31)],)", "expr": OPS,
     "show": "add 10, 20, 30; first_at_least 15, 20, 5, 31", "why": "The smallest key ≥ x: 20, 20 (an exact match counts), 10, and None (nothing that big)."},
    {"name": "Repeats", "args": "([('add', 3), ('add', 3), ('remove', 3), ('contains', 3)],)", "expr": OPS,
     "show": "add 3 twice; remove 3; contains 3", "why": "A key is stored once, so one remove takes it out: [None, None, True, False]."},
    {"name": "Negative keys", "args": "([('add', -5), ('add', 0), ('add', -12), ('first_at_least', -6), ('first_at_least', -100), ('contains', -12)],)", "expr": OPS,
     "show": "add -5, 0, -12; first_at_least -6, -100; contains -12", "why": "[None, None, None, -5, -12, True]. The head's key is None, so never compare it."},
    {"name": "The shape", "args": "([(k * 7919) % 20_011 for k in range(20_000)],)", "expr": SHAPE, "timeout": 5000,
     "show": "add 20,000 keys, then count the nodes on levels 0, 1 and 2: [level 0 count, about half on level 1?, about a quarter on level 2?]",
     "why": "Level 0 must hold all 20,000 keys. A key should go up one more level on each heads of a fair coin, so about 1/2 of the keys reach level 1 and 1/4 reach level 2. Use random.random() < 0.5."},
    {"name": "Big", "args": "([(k * 7919) % 60_013 for k in range(30_000)],)", "expr": BIGS, "timeout": 8000,
     "show": "add 30,000 keys, remove every third one, then 8,572 contains and 5,455 first_at_least queries: [how many found, sum of the answers]",
     "why": "Each operation should take O(log n) on average. If this timed out, the search may walk along level 0 only, which is O(n)."},
], trusted=SKIP)
