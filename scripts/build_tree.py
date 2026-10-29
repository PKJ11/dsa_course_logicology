from tb import build

S = "tree"
NODE = """
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right
"""
FIG = "[8, 3, 10, 1, 6, 14, 4, 7, 13]"   # the lessons' tree, as BST insert order
KEYS = "[(k * 7919) % 100_003 for k in range(100_000)]"   # 100,000 different keys in a scattered order

# P1 level by level (deep trees, so no recursion)
LO = "level_order(tree(args[0]))"
build(S, 1, "level_order", [
    {"name": "Small tree", "args": "([3, 9, 20, None, None, 15, 7],)", "expr": LO, "show": "tree 3; 9, 20; 15, 7 (level-order list [3, 9, 20, None, None, 15, 7])",
     "why": "One list per level, left to right: [[3], [9, 20], [15, 7]]. If you got one flat list, record where each level ends: take exactly len(queue) nodes per round."},
    {"name": "Empty tree", "args": "([],)", "expr": LO, "show": "empty tree (root is None)", "why": "No levels: []. Check for None before putting the root in the queue."},
    {"name": "One node", "args": "([5],)", "expr": LO, "show": "a single node 5", "why": "[[5]]."},
    {"name": "The lessons' tree", "args": f"({FIG},)", "expr": "level_order(bst(args[0]))", "show": "the tree from the lessons: 8; 3, 10; 1, 6, 14; 4, 7, 13",
     "why": "Children are added left child first, so each level reads left to right: [[8], [3, 10], [1, 6, 14], [4, 7, 13]]."},
    {"name": "Gaps", "args": "([1, 2, 3, None, 4, None, 5],)", "expr": LO, "show": "tree [1, 2, 3, None, 4, None, 5]",
     "why": "Missing children leave no holes: [[1], [2, 3], [4, 5]]. Only real nodes go in the queue."},
    {"name": "Leaning left", "args": "([1, 2, None, 3, None, 4],)", "expr": LO, "show": "a path 1, 2, 3, 4 going left", "why": "One node per level: [[1], [2], [3], [4]]."},
    {"name": "Perfect tree of 15", "args": "(list(range(1, 16)),)", "expr": LO, "show": "values 1 to 15 filling four levels", "why": "Level sizes 1, 2, 4 and 8."},
    {"name": "5,000 levels", "args": "([v for k in range(5_000) for v in (None, k)][1:],)", "expr": "(lambda r: [len(r), r[:3], r[-1]])(level_order(tree(args[0])))", "timeout": 3000,
     "show": "a path 5,000 levels deep: 0, then 1 as its right child, then 2, and so on. Shows [number of levels, first three, last]",
     "why": "A recursive solution goes one call deeper per level and stops with RecursionError (Python's limit is about 1,000 calls). A queue has no such limit."},
    {"name": "100,000 nodes", "args": "()", "expr": "(lambda r: [len(r), [len(x) for x in r[-3:]], sum(r[-1])])(level_order(tree(list(range(100_000)))))", "timeout": 3000,
     "show": "a full tree of 100,000 nodes: [number of levels, sizes of the last three levels, sum of the last level]",
     "why": "Each node is put in the queue and taken out once: O(n). If this timed out, the queue may be a list with pop(0), which moves every item each time; use collections.deque."},
], trusted=NODE + """
from collections import deque

def level_order(root):
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.value)
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)
        out.append(level)
    return out
""")

# P2 rebuild a tree from pre-order and in-order
BT = "levels(build_tree(args[0], args[1]))"
build(S, 2, "build_tree", [
    {"name": "Small tree", "args": "([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])", "expr": BT, "show": "preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7]; shows the answer level by level",
     "why": "3 is the root (first in pre-order). In in-order, 9 is left of 3 and 15, 20, 7 are right of it. The answer is [3, 9, 20, None, None, 15, 7] level by level."},
    {"name": "Empty", "args": "([], [])", "expr": BT, "show": "two empty lists", "why": "No values, no tree: return None."},
    {"name": "One node", "args": "([1], [1])", "expr": BT, "show": "preorder [1], inorder [1]", "why": "A single node with no children."},
    {"name": "The lessons' tree", "args": "([8, 3, 1, 6, 4, 7, 10, 14, 13], [1, 3, 4, 6, 7, 8, 10, 13, 14])", "expr": BT,
     "show": "the lessons' tree: preorder [8, 3, 1, 6, 4, 7, 10, 14, 13], inorder [1, 3, 4, 6, 7, 8, 10, 13, 14]",
     "why": "The figure in lesson 3 steps through this exact case. If the right side is wrong, check how many pre-order values belong to the left subtree: as many as there are in-order values left of the root."},
    {"name": "Path to the left", "args": "([4, 3, 2, 1], [1, 2, 3, 4])", "expr": BT, "show": "preorder [4, 3, 2, 1], inorder [1, 2, 3, 4]",
     "why": "Every node has only a left child. The right part of each in-order range is empty, so the right child is None."},
    {"name": "Path to the right", "args": "([1, 2, 3], [1, 2, 3])", "expr": BT, "show": "preorder [1, 2, 3], inorder [1, 2, 3]",
     "why": "Every node has only a right child: the left part of each in-order range is empty."},
    {"name": "Not a search tree", "args": "([5, -2, 7, 0, 9], [7, -2, 0, 5, 9])", "expr": BT, "show": "preorder [5, -2, 7, 0, 9], inorder [7, -2, 0, 5, 9]",
     "why": "The values are not in sorted order, so you cannot compare values with the root. Find the root's position in the in-order list."},
    {"name": "100,000 nodes", "args": f"({KEYS},)", "expr": "(lambda t: (lambda r: [len(inorder(r)), height(r), levels(r)[:5], preorder(r) == p])(build_tree(p := preorder(t), inorder(t))))(bst(args[0]))", "timeout": 5000,
     "show": "a search tree of 100,000 nodes: [size, height, first five level-order values, same pre-order?]",
     "why": "Look up each root's in-order position in a dict built once: O(n) in total. Calling inorder.index() each time, or slicing the lists, costs O(n) per node in the worst case."},
], trusted=NODE + """
def build_tree(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}
    nxt = 0
    def make(lo, hi):
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
""")

# P3 is it a binary search tree?
IB = "is_bst(tree(args[0]))"
SWAP = "(lambda r: (lambda ns: (lambda x, y: [setattr(ns[7_000], 'value', y), setattr(ns[7_001], 'value', x), is_bst(r)][2])(ns[7_000].value, ns[7_001].value))(tnodes(r)))(bst(args[0]))"
build(S, 3, "is_bst", [
    {"name": "The lessons' tree", "args": f"({FIG},)", "expr": "is_bst(bst(args[0]))", "show": "the lessons' tree (8; 3, 10; 1, 6, 14; 4, 7, 13)", "why": "A true search tree: True."},
    {"name": "Empty tree", "args": "([],)", "expr": IB, "show": "empty tree", "why": "An empty tree breaks no rule: True."},
    {"name": "One node", "args": "([7],)", "expr": IB, "show": "a single node", "why": "True."},
    {"name": "Wrong child", "args": "([5, 1, 4, None, None, 3, 6],)", "expr": IB, "show": "tree [5, 1, 4, None, None, 3, 6]", "why": "4 is the right child of 5 but smaller than 5: False."},
    {"name": "Wrong grandchild", "args": "([5, 4, 6, None, None, 3, 7],)", "expr": IB, "show": "tree [5, 4, 6, None, None, 3, 7]",
     "why": "Each node is fine next to its own children, but 3 sits in the right subtree of 5 and is smaller than 5: False. Checking only parent against child misses this. Pass down the range of values each subtree may hold."},
    {"name": "Equal keys", "args": "([2, 2, 2],)", "expr": IB, "show": "tree [2, 2, 2]", "why": "Keys must be different: left smaller, right bigger, strictly. False."},
    {"name": "Too big on the left", "args": "([10, 5, 15, 1, 12],)", "expr": IB, "show": "tree [10, 5, 15, 1, 12]", "why": "12 is in the left subtree of 10 but bigger than 10: False."},
    {"name": "Negative keys", "args": "([0, -10, 10, -20, -5, 5, 20],)", "expr": IB, "show": "tree [0, -10, 10, -20, -5, 5, 20]",
     "why": "A true search tree: True. If you got False, your starting range may begin at 0 or -1. Use None, or float('inf') and -float('inf'), for 'no limit'."},
    {"name": "Huge keys", "args": "([10**12, -10**12, 10**15],)", "expr": IB, "show": "tree [10¹², −10¹², 10¹⁵]", "why": "True. A starting range like ±10⁹ is too narrow."},
    {"name": "100,000 nodes, correct", "args": f"({KEYS},)", "expr": "is_bst(bst(args[0]))", "timeout": 3000, "show": "a search tree of 100,000 nodes", "why": "True, in one O(n) pass."},
    {"name": "100,000 nodes, two keys swapped", "args": f"({KEYS},)", "expr": SWAP, "timeout": 3000,
     "show": "the same tree, with the 7,000th and 7,001st smallest keys swapped",
     "why": "False. Somewhere deep in the tree two neighbouring keys are in the wrong order. A full check of ranges (or of the in-order sequence) finds it."},
], trusted=NODE + """
def is_bst(root):
    stack = [(root, None, None)]
    while stack:
        node, lo, hi = stack.pop()
        if node is None:
            continue
        if (lo is not None and node.value <= lo) or (hi is not None and node.value >= hi):
            return False
        stack.append((node.left, lo, node.value))
        stack.append((node.right, node.value, hi))
    return True
""")

# P4 delete a key from a binary search tree
DL = "levels(delete(bst(args[0]), args[1]))"
build(S, 4, "delete", [
    {"name": "A leaf", "args": f"({FIG}, 4)", "expr": DL, "show": "the lessons' tree; delete 4 (a leaf)", "why": "The leaf just goes: 6 keeps only its right child 7."},
    {"name": "One child", "args": f"({FIG}, 10)", "expr": DL, "show": "the lessons' tree; delete 10 (one child, 14)",
     "why": "10's only child, 14 (with 13 under it), takes 10's place as the right child of 8."},
    {"name": "Two children", "args": f"({FIG}, 3)", "expr": DL, "show": "the lessons' tree; delete 3 (two children)",
     "why": "3's successor is the smallest key in its right subtree: 4. Put 4 where 3 was, then delete 4 from the right subtree. Use the successor, not the predecessor, or the shape differs."},
    {"name": "The root", "args": f"({FIG}, 8)", "expr": DL, "show": "the lessons' tree; delete 8 (the root)",
     "why": "The successor is 10, which has a right child 14. 10 moves up to the root, and 14 takes 10's old place. Return the new root."},
    {"name": "Missing key", "args": f"({FIG}, 5)", "expr": DL, "show": "the lessons' tree; delete 5 (not there)", "why": "Nothing changes."},
    {"name": "Only node", "args": "([7], 7)", "expr": DL, "show": "a single node 7; delete 7", "why": "The tree becomes empty: return None."},
    {"name": "Empty tree", "args": "([], 3)", "expr": DL, "show": "empty tree; delete 3", "why": "Return None."},
    {"name": "Many deletes", "args": f"({FIG}, [8, 3, 13, 10, 1])", "expr": "levels(__import__('functools').reduce(delete, args[1], bst(args[0])))",
     "show": "the lessons' tree; delete 8, 3, 13, 10, 1 in turn", "why": "Each delete starts from the root the previous one returned. If a later delete fails, an earlier one probably left a wrong link."},
    {"name": "100,000 nodes, 20,000 deletes", "args": f"({KEYS},)", "timeout": 4000,
     "expr": "(lambda r: (lambda v: [len(v), v[:4], all(v[i] < v[i + 1] for i in range(len(v) - 1))])(inorder(r)))(__import__('functools').reduce(delete, args[0][::5], bst(args[0])))",
     "show": "a search tree of 100,000 keys; delete every fifth key: [size, smallest four, still in order?]",
     "why": "Each delete walks one path down the tree: O(h), about 40 steps here. If this timed out, the code may rebuild the tree, or search all of it, for every delete."},
], trusted=NODE + """
def delete(root, key):
    parent, node = None, root
    while node is not None and node.value != key:
        parent, node = node, (node.left if key < node.value else node.right)
    if node is None:
        return root
    if node.left is not None and node.right is not None:
        sp, s = node, node.right
        while s.left is not None:
            sp, s = s, s.left
        node.value = s.value
        parent, node = sp, s
    child = node.left if node.left is not None else node.right
    if parent is None:
        return child
    if parent.left is node:
        parent.left = child
    else:
        parent.right = child
    return root
""")

# P5 lowest common ancestor in any binary tree
LT = "[3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]"
LC = "lca(tree(args[0]), args[1], args[2])"
BIGLCA = "(lambda r: [lca(r, args[0][99_999], args[0][99_998]), lca(r, args[0][70_000], args[0][99_000]), lca(r, args[0][5], args[0][5])])(tree(args[0]))"
build(S, 5, "lca", [
    {"name": "Split below the root", "args": f"({FIG}, 4, 7)", "expr": "lca(bst(args[0]), args[1], args[2])", "show": "the lessons' tree; p = 4, q = 7",
     "why": "4 and 7 are the children of 6, so the answer is 6."},
    {"name": "Far apart", "args": f"({FIG}, 4, 13)", "expr": "lca(bst(args[0]), args[1], args[2])", "show": "the lessons' tree; p = 4, q = 13",
     "why": "4 is on the left of the root and 13 on the right: the answer is the root, 8."},
    {"name": "One is above the other", "args": f"({FIG}, 3, 7)", "expr": "lca(bst(args[0]), args[1], args[2])", "show": "the lessons' tree; p = 3, q = 7",
     "why": "3 is an ancestor of 7. A node counts as its own ancestor, so the answer is 3."},
    {"name": "The same node", "args": f"({FIG}, 14, 14)", "expr": "lca(bst(args[0]), args[1], args[2])", "show": "the lessons' tree; p = q = 14", "why": "The answer is 14 itself."},
    {"name": "Not a search tree", "args": f"({LT}, 5, 1)", "expr": LC, "show": "tree [3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]; p = 5, q = 1",
     "why": "This tree is not sorted, so comparing values with the root tells you nothing. 5 is in the left subtree of 3 and 1 in the right: the answer is 3."},
    {"name": "Deep in one side", "args": f"({LT}, 7, 4)", "expr": LC, "show": "the same tree; p = 7, q = 4", "why": "7 and 4 are the children of 2: the answer is 2."},
    {"name": "Ancestor, not sorted", "args": f"({LT}, 5, 4)", "expr": LC, "show": "the same tree; p = 5, q = 4", "why": "5 is above 4: the answer is 5."},
    {"name": "100,000 nodes", "args": "([(k * 7919) % 100_003 for k in range(100_000)],)", "expr": BIGLCA, "timeout": 3000,
     "show": "a full tree of 100,000 nodes with scattered values: three questions",
     "why": "One search of the tree is O(n). If this timed out, the code may search the whole tree again at every node, O(n²) or O(n·h)."},
], trusted=NODE + """
def lca(root, p, q):
    # iterative: parents by a walk from the root, then climb
    parent = {root.value: None}
    stack = [root]
    while stack:
        n = stack.pop()
        for c in (n.left, n.right):
            if c is not None:
                parent[c.value] = n.value
                stack.append(c)
    seen = set()
    while p is not None:
        seen.add(p)
        p = parent[p]
    while q not in seen:
        q = parent[q]
    return q
""")

# P6 write a tree as text and read it back
RT = "(lambda t: (lambda s: [isinstance(s, str), levels(deserialize(s))])(serialize(t)))(tree(args[0]))"
build(S, 6, "serialize", [
    {"name": "Small tree", "args": "([1, 2, 3, None, None, 4, 5],)", "expr": RT, "show": "tree [1, 2, 3, None, None, 4, 5]: [serialize gives a str?, the tree deserialize rebuilds]",
     "why": "deserialize(serialize(t)) must give back the same shape and values. If the shape is wrong, the text does not record where children are missing: write a marker for every None."},
    {"name": "Empty tree", "args": "([],)", "expr": RT, "show": "empty tree", "why": "serialize(None) must still return a string (it may be a single marker), and deserialize must turn it back into None."},
    {"name": "One node", "args": "([0],)", "expr": RT, "show": "a single node 0", "why": "The value 0 must survive: check 'is None', not truth."},
    {"name": "Long and negative values", "args": "([-12, 345, None, 0, -6789],)", "expr": RT, "show": "tree [-12, 345, None, 0, -6789]",
     "why": "Values can have several digits and a minus sign. Split the text into tokens (for example with str.split), not into single characters."},
    {"name": "Same values, different shapes", "args": "()", "expr": "serialize(tree([1, 1, None, 1])) != serialize(tree([1, None, 1, 1]))", "expect": "True",
     "show": "two trees with three 1s each, shaped differently: are their strings different?",
     "why": "The text must record the shape, not only the values. Listing the values alone gives the same text for both."},
    {"name": "Path 300 deep", "args": "(list(range(300)),)", "expr": "(lambda t: levels(deserialize(serialize(t))) == levels(t))(bst(args[0]))", "expect": "True",
     "show": "keys 0 … 299 inserted in order (each node only has a right child): same tree after the round trip?",
     "why": "300 levels is fine for recursion. If this failed but small trees pass, the reading side may not consume the markers in the same order the writing side made them."},
    {"name": "100,000 nodes", "args": f"({KEYS},)", "expr": "(lambda t: (lambda r: [len(inorder(r)), levels(r) == levels(t)])(deserialize(serialize(t))))(bst(args[0]))", "timeout": 6000,
     "show": "a search tree of 100,000 nodes: [size after the round trip, same tree?]",
     "why": "Writing and reading should both be O(n). Building the string with += in a loop, or reading tokens with list.pop(0), can make it O(n²). Collect the parts in a list and join them; read with an index or an iterator."},
], trusted=NODE + """
def serialize(root):
    out, stack = [], [root]
    while stack:
        n = stack.pop()
        if n is None:
            out.append('#')
        else:
            out.append(str(n.value))
            stack.append(n.right)
            stack.append(n.left)
    return ' '.join(out)

def deserialize(data):
    it = iter(data.split())
    def make():
        t = next(it)
        if t == '#':
            return None
        node = TreeNode(int(t))
        node.left = make()
        node.right = make()
        return node
    return make()
""")
