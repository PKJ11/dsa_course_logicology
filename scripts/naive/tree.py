# Naive and buggy TREE solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def level_order(root):
    # recursive: one call deeper per level
    out = []
    def go(node, d):
        if node is None:
            return
        if d == len(out):
            out.append([])
        out[d].append(node.value)
        go(node.left, d + 1)
        go(node.right, d + 1)
    go(root, 0)
    return out
''', [7]),
    2: ('''
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def build_tree(preorder, inorder):
    # off by one: gives the left subtree one pre-order value too few
    if not preorder:
        return None
    v = preorder[0]
    i = inorder.index(v)
    node = TreeNode(v)
    node.left = build_tree(preorder[1:i], inorder[:i])
    node.right = build_tree(preorder[i:], inorder[i + 1:])
    return node
''', [0, 3]),
    3: ('''
def is_bst(root):
    # only compares each node with its own children
    if root is None:
        return True
    if root.left is not None and root.left.value >= root.value:
        return False
    if root.right is not None and root.right.value <= root.value:
        return False
    return is_bst(root.left) and is_bst(root.right)
''', [4, 6]),
    4: ('''
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def delete(root, key):
    # collects the keys and rebuilds a balanced tree: wrong shape, and O(n) per delete
    keys = []
    stack, cur = [], root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        if cur.value != key:
            keys.append(cur.value)
        cur = cur.right
    def make(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(keys[mid], make(lo, mid - 1), make(mid + 1, hi))
    return make(0, len(keys) - 1)
''', [0, 2, 8]),
    5: ('''
def lca(root, p, q):
    # steers by value, which only works in a search tree
    node = root
    while node is not None:
        if p < node.value and q < node.value:
            node = node.left
        elif p > node.value and q > node.value:
            node = node.right
        else:
            return node.value
''', [5, 6]),
    6: ('''
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

def serialize(root):
    # values only, in level order: the shape is lost
    out, q = [], [root]
    while q:
        n = q.pop(0)
        if n is not None:
            out.append(str(n.value))
            q.append(n.left)
            q.append(n.right)
    return ' '.join(out)

def deserialize(data):
    vals = [int(t) for t in data.split()]
    if not vals:
        return None
    nodes = [TreeNode(v) for v in vals]
    for i, n in enumerate(nodes):
        if 2 * i + 1 < len(nodes):
            n.left = nodes[2 * i + 1]
        if 2 * i + 2 < len(nodes):
            n.right = nodes[2 * i + 2]
    return nodes[0]
''', [0, 4]),
}
