# Naive and buggy BALT solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def is_balanced(root):
    # only checks the root
    def height(n):
        return -1 if n is None else 1 + max(height(n.left), height(n.right))
    if root is None:
        return True
    return abs(height(root.left) - height(root.right)) <= 1
''', [4]),
    2: ('''
def rotate(root, key, side):
    # rotates, but forgets to fix the parent's link
    node = root
    while node.value != key:
        node = node.left if key < node.value else node.right
    if side == 'right':
        up = node.left
        node.left = up.right
        up.right = node
    else:
        up = node.right
        node.right = up.left
        up.left = node
    return root if node is not root else up
''', [2, 3, 4, 5, 7]),
    3: ('''
class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0

def avl_insert(root, key):
    # a plain search tree: no rebalancing
    if root is None:
        return AVLNode(key)
    node = root
    while True:
        side = 'left' if key < node.value else 'right'
        nxt = getattr(node, side)
        if nxt is None:
            setattr(node, side, AVLNode(key))
            return root
        node = nxt
''', [0, 1, 2, 3, 4, 5, 6, 7, 8]),
    4: ('''
class RBNode:
    def __init__(self, value, red=True):
        self.value = value
        self.red = red
        self.left = None
        self.right = None

def rb_insert(root, key):
    # a plain search tree with every node black
    new = RBNode(key, red=False)
    if root is None:
        return new
    node = root
    while True:
        side = 'left' if key < node.value else 'right'
        nxt = getattr(node, side)
        if nxt is None:
            setattr(node, side, new)
            return root
        node = nxt
''', [1, 2, 3, 4, 5, 6, 7]),
    5: ('''
class BNode:
    def __init__(self, keys=None, kids=None):
        self.keys = keys if keys is not None else []
        self.kids = kids if kids is not None else []

def btree_insert(root, key):
    # one leaf that never splits
    if root is None:
        return BNode([key])
    if key not in root.keys:
        root.keys.append(key)
        root.keys.sort()
    return root
''', [2, 3, 4, 5, 6, 7]),
    6: ('''
class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height

class SkipList:
    # a plain sorted linked list on level 0 only
    MAX = 20
    def __init__(self):
        self.head = SkipNode(None, self.MAX)
    def _before(self, key):
        node = self.head
        while node.next[0] is not None and node.next[0].key < key:
            node = node.next[0]
        return node
    def contains(self, key):
        n = self._before(key).next[0]
        return n is not None and n.key == key
    def first_at_least(self, key):
        n = self._before(key).next[0]
        return None if n is None else n.key
    def add(self, key):
        p = self._before(key)
        if p.next[0] is not None and p.next[0].key == key:
            return
        node = SkipNode(key, 1)
        node.next[0] = p.next[0]
        p.next[0] = node
    def remove(self, key):
        p = self._before(key)
        n = p.next[0]
        if n is None or n.key != key:
            return False
        p.next[0] = n.next[0]
        return True
''', [6, 7]),
}
