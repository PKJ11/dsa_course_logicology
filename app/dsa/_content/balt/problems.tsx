import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

const NODE = `class TreeNode:
    # The tests build your tree from nodes of this shape.
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

`;

function TreesNote() {
  return (
    <p>
      The tests write a tree as a level-order list: the values level by level, left to right, with <code>None</code> where a child is missing. So{" "}
      <code>[3, 9, 20, None, None, 15, 7]</code> is 3 with children 9 and 20, where 20 has children 15 and 7. An empty tree is <code>None</code>.
    </p>
  );
}

function YourTreeNote() {
  return (
    <p>
      The tests start from an empty tree (<code>None</code>), insert the keys one at a time with <code>root = f(root, key)</code>, and then read
      your tree through <code>.value</code>, <code>.left</code> and <code>.right</code>. Keep those field names.
    </p>
  );
}

export const BALT_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Is it balanced?",
    fn: "is_balanced",
    lessons: [1, 3],
    starter: `${NODE}
def is_balanced(root):
    # Return True if at every node the heights of the two
    # subtrees differ by at most 1, and False otherwise.
    pass
`,
    statement: (
      <>
        <p>
          A binary tree is <strong>height-balanced</strong> if at every node the heights of its left and right subtrees differ by at most 1. This
          is the AVL rule from lesson 3. An empty subtree has height −1. Return <code>True</code> if the tree is height-balanced and{" "}
          <code>False</code> if not.
        </p>
        <CodeBlock
          code={`tree [3, 9, 20, None, None, 15, 7]        ->  True
tree [1, 2, 2, 3, 3, None, None, 4, 4]    ->  False
empty tree                                ->  True`}
        />
        <TreesNote />
        <p>The values are not sorted: this can be any binary tree.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 131,071 nodes, at most 300 levels deep, so recursion is fine.</li>
          <li>Your solution should take <M>O(n)</M> time: work out each height once.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Checking only the root is not enough: the rule must hold at every node. And a node needs the heights of both its subtrees. Which order of visiting nodes gives you the children before their parent?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write one recursive function that returns the height of a subtree, and also finds out whether it is balanced. For an empty subtree
              return −1. Otherwise get the two heights from the children, check that they differ by at most 1, and return{" "}
              <code>1 + max(left, right)</code>.
            </p>
            <p>
              To report &ldquo;not balanced&rdquo;, return a special value such as <code>None</code> and pass it straight up. Then each node is
              visited once: <M>O(n)</M>. Calling a separate <code>height()</code> at every node visits the lower nodes again and again.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`check(node):            # height, or None if unbalanced
    if node is None: return -1
    a = check(node.left);  if a is None: return None
    b = check(node.right); if b is None: return None
    if abs(a - b) > 1: return None
    return 1 + max(a, b)

is_balanced(root): return check(root) is not None`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Rotate at a key",
    fn: "rotate",
    lessons: [2],
    starter: `${NODE}
def rotate(root, key, side):
    # Rotate the search tree at the node holding key.
    # side is 'left' or 'right'. Return the root of the whole tree.
    pass
`,
    statement: (
      <>
        <p>
          You are given the root of a binary search tree, a key that is in the tree, and a side, <code>&apos;left&apos;</code> or{" "}
          <code>&apos;right&apos;</code>. Do that rotation (lesson 2) at the node holding the key, and return the root of the whole tree.
        </p>
        <CodeBlock
          code={`#        6                    4
#       / \\                  / \\
#      4   7       ->       2   6
#     / \\                      / \\
#    2   5                    5   7
rotate(root, 6, 'right')     # returns the node 4`}
        />
        <p>
          A right rotation lifts the node&rsquo;s left child; a left rotation lifts its right child. The child that comes up is always there. If
          the node has a parent, the parent must now point to the child that came up. Move the existing nodes; do not build new ones.
        </p>
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 50,000 nodes; all keys are different.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The rotation itself is three assignments (lesson 2). What else points at the node you rotate, and must change when another node takes its place?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Search for the key as in TREE-4, and remember the parent of each node you visit. Then rotate at the node and get back the node that
              came up.
            </p>
            <p>
              If there was no parent, the node was the root, so the new root is the node that came up. Otherwise check whether the node was the
              parent&rsquo;s left or right child (<code>parent.left is node</code>), and point that link at the node that came up.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`parent = None; node = root
while node.value != key:
    parent = node
    node = node.left if key < node.value else node.right
if side == 'right':
    up = node.left;  node.left = up.right;  up.right = node
else:
    up = node.right; node.right = up.left;  up.left = node
if parent is None: return up
if parent.left is node: parent.left = up
else: parent.right = up
return root`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "AVL insert",
    fn: "avl_insert",
    lessons: [2, 3],
    starter: `class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0          # a leaf has height 0


def avl_insert(root, key):
    # Insert key into the AVL tree and return the new root.
    pass
`,
    statement: (
      <>
        <p>
          Write the insert of an AVL tree (lesson 3). <code>avl_insert(root, key)</code> inserts the key into the tree whose root is{" "}
          <code>root</code> (<code>None</code> for an empty tree) and returns the new root. After every insert, every node must obey the AVL rule:
          its two subtrees differ in height by at most 1.
        </p>
        <CodeBlock
          code={`root = None
for key in [1, 2, 3]:
    root = avl_insert(root, key)
# root is 2, with children 1 and 3`}
        />
        <YourTreeNote />
        <p>
          An AVL insert is fully determined by the keys and their order, so the tests check the exact shape of small trees, and the height and
          balance of big ones. All keys are different.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 10,000 inserts; each one should take <M>O(log n)</M> time.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Insert as in a plain search tree, then repair on the way back up. A recursive insert that returns the new top of each subtree makes &ldquo;on the way back up&rdquo; easy.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Store each node&rsquo;s height (−1 for <code>None</code>). Write <code>rotate_left</code> and <code>rotate_right</code> that also
              update the heights of the two nodes, lower one first.
            </p>
            <p>
              Write <code>rebalance(node)</code>: update its height and compute its balance. If the balance is +2, the left side is too tall; if
              the left child leans right (its right subtree is taller), rotate left at the child first; then rotate right at the node. Mirror this
              for −2. Return the new top. The insert recurses into one side, assigns the result back to that link, and returns{" "}
              <code>rebalance(node)</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`insert(node, key):
    if node is None: return AVLNode(key)
    if key < node.value: node.left = insert(node.left, key)
    else:                node.right = insert(node.right, key)
    update(node)              # 1 + max of child heights
    b = h(node.left) - h(node.right)
    if b > 1:
        if h(node.left.left) < h(node.left.right):
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if b < -1: (the mirror image)
    return node`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Red-black insert",
    fn: "rb_insert",
    lessons: [4],
    starter: `class RBNode:
    def __init__(self, value, red=True):
        self.value = value
        self.red = red           # True for red, False for black
        self.left = None
        self.right = None


def rb_insert(root, key):
    # Insert key into the red-black tree and return the new root.
    pass
`,
    statement: (
      <>
        <p>
          Write the insert of a red-black tree (lesson 4). <code>rb_insert(root, key)</code> inserts the key into the tree whose root is{" "}
          <code>root</code> (<code>None</code> for an empty tree) and returns the new root. Each node has a field <code>red</code>:{" "}
          <code>True</code> for red, <code>False</code> for black. After every insert the tree must obey the four rules:
        </p>
        <ol>
          <li>Every node is red or black.</li>
          <li>The root is black.</li>
          <li>A red node never has a red child.</li>
          <li>Every path from a node down to a missing child passes the same number of black nodes.</li>
        </ol>
        <YourTreeNote />
        <p>
          Different correct methods give different trees, so the tests do not check the exact shape. They check the four rules, that the keys
          are all there in order, and that the height is at most <M>2 log₂(n + 1)</M>. The left-leaning version from lesson 4 is accepted. All
          keys are different.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 10,000 inserts; each one should take <M>O(log n)</M> time.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>New nodes are red, so the black counts never change on insert. Only &ldquo;red under red&rdquo; and &ldquo;the root is red&rdquo; can go wrong, and both can be repaired on the way back up.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              The shortest correct code is the left-leaning version. Insert recursively, as for the AVL tree. On the way back up, at each node: if
              the right child is red and the left is not, rotate left; if the left child and its left child are both red, rotate right; if both
              children are red, flip the colours (children black, node red).
            </p>
            <p>
              In each rotation the node that comes up takes the old top&rsquo;s colour and the old top becomes red. After the whole insert,
              colour the root black.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`put(h, key):
    if h is None: return RBNode(key)            # red
    if key < h.value: h.left = put(h.left, key)
    else:             h.right = put(h.right, key)
    if red(h.right) and not red(h.left): h = rotate_left(h)
    if red(h.left) and red(h.left.left): h = rotate_right(h)
    if red(h.left) and red(h.right): flip(h)
    return h

rotate_left(h): x = h.right; h.right = x.left; x.left = h
                x.red = h.red; h.red = True; return x
rb_insert(root, key):
    root = put(root, key); root.red = False; return root`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "B-tree insert",
    fn: "btree_insert",
    lessons: [5],
    starter: `class BNode:
    def __init__(self, keys=None, kids=None):
        self.keys = keys if keys is not None else []    # sorted keys
        self.kids = kids if kids is not None else []    # [] for a leaf


def btree_insert(root, key):
    # Insert key into the B-tree (1 to 3 keys per node)
    # and return the root.
    pass
`,
    statement: (
      <>
        <p>
          Write the insert of a B-tree in which every node holds 1 to 3 keys (lesson 5, with <M>t = 2</M>). A node is a <code>BNode</code> with a
          sorted list <code>keys</code> and a list <code>kids</code> of children, empty for a leaf. <code>btree_insert(root, key)</code> inserts
          the key into the tree whose root is <code>root</code> (<code>None</code> for an empty tree) and returns the root. If the key is already
          in the tree, change nothing.
        </p>
        <p>After every insert the tree must obey the rules:</p>
        <ul>
          <li>every node holds 1 to 3 keys, in increasing order;</li>
          <li>a node with k keys that is not a leaf has k + 1 children, and the keys of each child lie between the keys on either side of it;</li>
          <li>all leaves are at the same depth.</li>
        </ul>
        <CodeBlock
          code={`root = None
for key in [10, 20, 30, 40]:
    root = btree_insert(root, key)
# one possible answer: root.keys == [20],
# root.kids hold [10] and [30, 40]`}
        />
        <p>
          Splitting on the way down (as in the lesson) and splitting on the way back up both give valid trees, so the tests check the rules, the
          keys and the height, not the exact shape.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 20,000 inserts; each one should take <M>O(log n)</M> time.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Keys only ever go into a leaf. The trouble is a full node. If you split every full node you are about to step into, will there always be room for a key that moves up?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write <code>split(parent, i)</code> for a full child <code>parent.kids[i]</code> (3 keys): its middle key goes into{" "}
              <code>parent.keys</code> at position <code>i</code>, its last key and last two children become a new node placed at{" "}
              <code>parent.kids[i + 1]</code>, and it keeps its first key and first two children.
            </p>
            <p>
              Insert: if the root is full, make a new root with the old root as its only child and split that child. Then walk down: at each node
              find the child the key belongs in; if that child is full, split it first and decide again which of the two halves to enter. At the
              leaf, put the key in its sorted place.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if root is None: return BNode([key])
if len(root.keys) == 3:
    root = BNode([], [root]); split(root, 0)
node = root
while node.kids:
    i = number of keys in node.keys smaller than key
    if key == node.keys[i] (when i < len): return root
    if len(node.kids[i].keys) == 3:
        split(node, i)
        if key == node.keys[i]: return root
        if key > node.keys[i]: i += 1
    node = node.kids[i]
put key into node.keys in sorted order (if not there)
return root`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "A skip list",
    fn: "SkipList",
    lessons: [6],
    blocked: ["bisect"],
    starter: `import random


class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height   # next[i]: the next node on level i


class SkipList:
    MAX = 20

    def __init__(self):
        self.head = SkipNode(None, self.MAX)

    def add(self, key):
        pass

    def contains(self, key):
        pass

    def remove(self, key):
        pass

    def first_at_least(self, key):
        pass
`,
    statement: (
      <>
        <p>Build a skip list (lesson 6) of different keys, with these methods:</p>
        <ul>
          <li>
            <code>add(key)</code>: put the key in. If it is already there, do nothing.
          </li>
          <li>
            <code>contains(key)</code>: <code>True</code> if the key is there.
          </li>
          <li>
            <code>remove(key)</code>: take the key out and return <code>True</code>; return <code>False</code> if it was not there.
          </li>
          <li>
            <code>first_at_least(key)</code>: the smallest key that is at least <code>key</code>, or <code>None</code> if there is none.
          </li>
        </ul>
        <CodeBlock
          code={`s = SkipList()
s.add(10); s.add(20); s.add(30)
s.first_at_least(15)    # 20
s.first_at_least(31)    # None
s.remove(20)            # True`}
        />
        <p>
          Keep the shape from the starter code: <code>self.head</code> is a node whose list <code>next</code> has one link per level, and each
          key&rsquo;s node has a list <code>next</code> as long as its tower. One test walks your levels through <code>head.next[0]</code>,{" "}
          <code>head.next[1]</code> and <code>head.next[2]</code>: level 0 must hold every key in order. Give each new key a tower: start at level
          0, then flip a fair coin (<code>random.random() &lt; 0.5</code> means heads). Each heads adds one level, and the first tails stops. So
          about half the keys reach level 1, and about a quarter reach level 2. The <code>bisect</code> module is switched off.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 30,000 keys and about 50,000 operations; each should take <M>O(log n)</M> time on average.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Every method starts with the same search. If that search records the last node it visited on each level, add and remove become a few linked-list link changes per level.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write a helper <code>_before(key)</code>: start at the head on the top level; on each level move right while the next key is
              smaller than <code>key</code>; record the node you stop at in a list <code>path[level]</code>; go down. Then{" "}
              <code>path[0].next[0]</code> is the first node with a key at least <code>key</code>. That answers <code>contains</code> and{" "}
              <code>first_at_least</code>.
            </p>
            <p>
              For <code>add</code>, flip coins for the height, make the node, and on each of its levels link it in after <code>path[level]</code>.
              For <code>remove</code>, on each level where <code>path[level].next[level]</code> is the node, link around it.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`_before(key):
    node = head; path = [None] * MAX
    for lv from MAX - 1 down to 0:
        while node.next[lv] and node.next[lv].key < key:
            node = node.next[lv]
        path[lv] = node
    return path

add(key):
    path = _before(key)
    if path[0].next[0] holds key: return
    h = 1; while h < MAX and random.random() < 0.5: h += 1
    new = SkipNode(key, h)
    for lv in range(h):
        new.next[lv] = path[lv].next[lv]
        path[lv].next[lv] = new`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
