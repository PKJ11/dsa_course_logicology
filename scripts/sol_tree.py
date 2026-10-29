from solgen import write_station

NODE = '''class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

'''

write_station("tree", 7, {
    1: (NODE + '''
from collections import deque


def level_order(root):
    if root is None:
        return []
    out = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # exactly the nodes of this level
            node = q.popleft()
            level.append(node.value)
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)
        out.append(level)
    return out
''', [
        "A queue hands nodes back in the order they went in. Children go in after their parent, so the tree comes out one level at a time, each level from left to right.",
        "`len(q)` is read once, when the `for` loop starts. At that moment the queue holds exactly one level, so the loop takes that level and no more. Children added during the loop wait for the next round.",
        "Each node goes into the queue once and comes out once: O(n) time. The queue holds at most one or two levels, which for a full tree is about n/2 nodes.",
        "There is no recursion, so a path 5,000 levels deep is no problem. `deque.popleft()` is O(1); `list.pop(0)` would be O(n).",
    ]),
    2: (NODE + '''
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
''', [
        "Pre-order lists a root before its subtrees, so the next unused pre-order value is always the root of the subtree being built.",
        "In in-order, that root splits its range: everything left of it is its left subtree, everything right of it is its right subtree.",
        "`make` builds the left subtree before the right one. That is the order pre-order lists them, so the shared index `nxt` always points at the right value.",
        "The dict finds each root's in-order place in O(1), so the whole rebuild is O(n). Using `inorder.index(v)` instead costs O(n) per node, O(n²) for a long path.",
        "The recursion is as deep as the tree. For trees thousands of levels deep, the same idea works with an explicit stack.",
    ]),
    3: (NODE + '''
def is_bst(root):
    stack = [(root, None, None)]          # node, lower limit, upper limit
    while stack:
        node, lo, hi = stack.pop()
        if node is None:
            continue
        if lo is not None and node.value <= lo:
            return False
        if hi is not None and node.value >= hi:
            return False
        stack.append((node.left, lo, node.value))    # left: below this key
        stack.append((node.right, node.value, hi))   # right: above this key
    return True
''', [
        "The search tree rule is about whole subtrees, not just children. So each node carries the range of keys it may hold: above every ancestor it is right of, below every ancestor it is left of.",
        "Going left, the current key becomes the new upper limit; going right, it becomes the new lower limit. The other limit is passed on unchanged.",
        "None means no limit. Starting with numbers like ±10⁹ fails for bigger keys; `float('inf')` also works, but None needs no special value.",
        "Each node is checked once: O(n) time, and the stack holds O(h) entries for a tree of height h.",
        "An equally good check: an in-order walk of a search tree gives strictly increasing keys. Walk it and compare each key with the one before.",
    ]),
    4: (NODE + '''
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
''', [
        "Finding the key walks one path down: O(h) for a tree of height h. `parent` is kept because removing a node means changing one link in its parent.",
        "A node with two children cannot simply be cut out. Its successor, the smallest key in its right subtree, is bigger than everything on the left and smaller than everything else on the right, so it can take the node's place.",
        "The successor has no left child (otherwise that child would be smaller). So after copying its key, removing the successor's node is the easy case: at most one child.",
        "In the easy case, the node's only child (or None) is linked into the parent on the same side. If the node was the root, that child is the new root, which is why the function returns a root.",
        "Every step walks down the tree once more at most: O(h) in total. With 100,000 random keys, h is about 40; for a path-shaped tree it would be n (BALT fixes this).",
    ]),
    5: (NODE + '''
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
''', [
        "`find(node)` reports what it found below `node`: nothing (None), one of the two targets, or, once both have been seen on different sides, their common ancestor.",
        "The first node whose left and right calls both return something has p on one side and q on the other. It is the lowest such node, because the calls return from the bottom up.",
        "If a node holds p (or q), it is returned at once without looking below it. That is correct even if the other value is below it, because then this node is the answer: a node counts as its own ancestor.",
        "Each node is visited at most once: O(n) time and O(h) stack depth. In a search tree you could steer by comparing values (lesson 6) and only walk one path, O(h).",
    ]),
    6: (NODE + '''
def serialize(root):
    out = []

    def write(node):
        if node is None:
            out.append('#')               # a marker for a missing child
            return
        out.append(str(node.value))
        write(node.left)
        write(node.right)

    write(root)
    return ' '.join(out)


def deserialize(data):
    tokens = iter(data.split())

    def read():
        t = next(tokens)
        if t == '#':
            return None
        node = TreeNode(int(t))
        node.left = read()                # same order as write
        node.right = read()
        return node

    return read()
''', [
        "Pre-order with a marker for every missing child records the shape completely: when the reader meets a marker, it knows that subtree is finished.",
        "The reader consumes tokens in exactly the order the writer produced them: node, then its whole left subtree, then its whole right subtree.",
        "Tokens are separated by spaces, so values with several digits or a minus sign survive. `int(t)` turns each one back into a number.",
        "The parts are collected in a list and joined once, and tokens are read with an iterator: both sides are O(n). A tree with n nodes writes n values and n + 1 markers.",
    ]),
})
