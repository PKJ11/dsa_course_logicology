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

export const TREE_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Level by level",
    fn: "level_order",
    lessons: [1, 2],
    starter: `${NODE}
def level_order(root):
    # Return a list with one list of values per level,
    # top level first, each level from left to right.
    pass
`,
    statement: (
      <>
        <p>
          Return the values of a binary tree level by level: a list of lists, one per level, from the root down. Inside a level, list the values
          from left to right.
        </p>
        <CodeBlock
          code={`tree [3, 9, 20, None, None, 15, 7]  ->  [[3], [9, 20], [15, 7]]
tree [1, 2, 3, None, 4, None, 5]    ->  [[1], [2, 3], [4, 5]]
empty tree                          ->  []`}
        />
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes.</li>
          <li>The tree can be 5,000 levels deep, so a recursive solution will stop with RecursionError. Use a queue.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A queue gives nodes back in the order they went in (STAQ-3). If you put children in after their parent, what order do the nodes come out in?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Start a <code>collections.deque</code> holding the root. While it is not empty, take the nodes of one level: exactly{" "}
              <code>len(queue)</code> of them, counted before the round starts. For each, record its value and add its children (left first) to the
              back.
            </p>
            <p>
              Children added during the round belong to the next level, so they wait until the next round. Use <code>popleft()</code>;{" "}
              <code>list.pop(0)</code> moves every item and is <M>O(n)</M>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`if root is None: return []
out = []; q = deque([root])
while q:
    level = []
    repeat len(q) times:
        node = q.popleft(); level.append(node.value)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    out.append(level)
return out`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Rebuild the tree",
    fn: "build_tree",
    lessons: [3],
    starter: `${NODE}
def build_tree(preorder, inorder):
    # Rebuild the tree from its pre-order and in-order lists.
    # All values are different. Return the root.
    pass
`,
    statement: (
      <>
        <p>
          You are given the pre-order list and the in-order list of a binary tree (lesson 2). All values are different. Rebuild the tree and return
          its root.
        </p>
        <CodeBlock
          code={`build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
#        3
#       / \\
#      9   20
#         /  \\
#        15   7`}
        />
        <p>The values are not sorted: this is any binary tree, not a search tree. Use the TreeNode class from the starter code.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes; the tree is at most 300 levels deep, so recursion is fine.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The first value in pre-order is the root. Where is the root in the in-order list, and what is on each side of it?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              In in-order, the values left of the root form the left subtree and the values right of it form the right subtree. In pre-order, the
              root is followed by the whole left subtree, then the whole right subtree.
            </p>
            <p>
              Build a dict from each value to its in-order position, once. Then write <code>make(lo, hi)</code> that builds the tree for the in-order
              range <code>lo..hi</code>, taking roots from pre-order one by one with a shared index. Build the left subtree before the right one, the
              same order pre-order uses.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`where = {v: i for i, v in enumerate(inorder)}; nxt = 0
make(lo, hi):
    if lo > hi: return None
    v = preorder[nxt]; nxt += 1
    node = TreeNode(v)
    node.left = make(lo, where[v] - 1)
    node.right = make(where[v] + 1, hi)
    return node
return make(0, len(inorder) - 1)`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Is it a search tree?",
    fn: "is_bst",
    lessons: [4],
    starter: `${NODE}
def is_bst(root):
    # True if every node's key is bigger than every key in its left
    # subtree and smaller than every key in its right subtree.
    pass
`,
    statement: (
      <>
        <p>
          Return True if the tree is a binary search tree (lesson 4): for every node, all keys in its left subtree are smaller than its key, and all
          keys in its right subtree are bigger. Keys must be different, so equal keys mean False.
        </p>
        <CodeBlock
          code={`tree [8, 3, 10, 1, 6, None, 14]   ->  True
tree [5, 1, 4, None, None, 3, 6]  ->  False
tree [5, 4, 6, None, None, 3, 7]  ->  False`}
        />
        <p>
          In the second tree, 4 is the right child of 5 but smaller than 5. In the third tree, every node is fine next to its own children, but 3
          is in the right subtree of 5 and is smaller than 5.
        </p>
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes, at most about 50 levels deep. Keys are whole numbers of any size.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Comparing each node only with its own children is not enough. Look at the third example: which rule does 3 break, and which node sets that rule?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Every node has a range of keys it may hold, set by its ancestors. The root may hold anything. Going left, the parent&rsquo;s key becomes
              the new upper limit; going right, it becomes the new lower limit.
            </p>
            <p>
              Walk the tree carrying <code>(node, lo, hi)</code> and check <code>lo &lt; key &lt; hi</code>. Use <code>None</code> for &ldquo;no
              limit&rdquo;, not a number like 0 or 10⁹. Another way: an in-order walk must give strictly increasing keys.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`stack = [(root, None, None)]
while stack:
    node, lo, hi = stack.pop()
    if node is None: continue
    if lo is not None and node.value <= lo: return False
    if hi is not None and node.value >= hi: return False
    stack.append((node.left, lo, node.value))
    stack.append((node.right, node.value, hi))
return True`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Delete a key",
    fn: "delete",
    lessons: [4, 5],
    starter: `${NODE}
def delete(root, key):
    # Delete key from the binary search tree, if it is there.
    # Return the root of the tree (it may change).
    pass
`,
    statement: (
      <>
        <p>
          Delete <code>key</code> from a binary search tree and return the root, which may change. If the key is not there, change nothing. Use the
          method from lesson 5, so that the tests can check the exact shape:
        </p>
        <ul>
          <li>A node with no children is removed.</li>
          <li>A node with one child is replaced by that child.</li>
          <li>
            A node with two children takes the key of its <em>successor</em>, the smallest key in its right subtree. Then the successor&rsquo;s old
            node is removed (it has at most one child, a right one).
          </li>
        </ul>
        <CodeBlock
          code={`tree from keys 8, 3, 10, 1, 6, 14, 4, 7, 13
delete 3  ->  4 takes 3's place; 6 keeps only its child 7`}
        />
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes, at most about 50 levels deep; up to 20,000 deletes in a row.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>First find the node, and remember its parent: removing a node means changing one link in its parent. Which case is the hard one?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Walk down from the root to the key, keeping <code>parent</code>. If the node has two children, find its successor (go right once, then
              left as far as possible), copy the successor&rsquo;s key into the node, and switch to removing the successor&rsquo;s node instead.
            </p>
            <p>
              Now the node to remove has at most one child. Link that child (or None) into the parent, in the same side the node was on. If the node
              was the root (no parent), the child becomes the new root.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`parent, node = None, root
while node and node.value != key:
    parent, node = node, (left or right by key)
if node is None: return root
if node has two children:
    sp, s = node, node.right
    while s.left: sp, s = s, s.left
    node.value = s.value; parent, node = sp, s
child = node.left or node.right
if parent is None: return child
if parent.left is node: parent.left = child
else: parent.right = child
return root`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Lowest common ancestor",
    fn: "lca",
    lessons: [6],
    starter: `${NODE}
def lca(root, p, q):
    # p and q are values in the tree (all values are different).
    # Return the value of their lowest common ancestor.
    pass
`,
    statement: (
      <>
        <p>
          Given a binary tree and two values <code>p</code> and <code>q</code> that are in it, return the value of their lowest common ancestor: the
          deepest node that has both in its subtree. A node counts as its own ancestor. All values are different.
        </p>
        <CodeBlock
          code={`tree [3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]
lca(root, 5, 1)  ->  3
lca(root, 7, 4)  ->  2
lca(root, 5, 4)  ->  5`}
        />
        <p>This is any binary tree, not always a search tree, so you cannot steer by comparing values.</p>
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes, at most 300 levels deep.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Ask each subtree one question: &ldquo;does p or q live in you?&rdquo; At which node do the answers from the left and the right first both say yes?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write <code>find(node)</code>: it returns None if neither value is in the subtree, the node holding <code>p</code> or <code>q</code> if
              it reaches one, and otherwise passes up what its children found. If both children return something, this node is the answer.
            </p>
            <p>
              Each node is visited once: <M>O(n)</M>. Another way: record every node&rsquo;s parent in a dict with one walk, collect <code>p</code>
              &rsquo;s ancestors in a set, then climb from <code>q</code> until you meet one.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`find(node):
    if node is None or node.value in (p, q): return node
    a = find(node.left); b = find(node.right)
    if a and b: return node
    return a or b
return find(root).value`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Write it down, read it back",
    fn: "serialize",
    lessons: [7],
    starter: `${NODE}
def serialize(root):
    # Turn the tree into a string.
    pass


def deserialize(data):
    # Turn the string back into the same tree. Return the root.
    pass
`,
    statement: (
      <>
        <p>
          Write two functions. <code>serialize(root)</code> turns a binary tree into a string. <code>deserialize(data)</code> turns that string back
          into a tree with exactly the same shape and values. You choose the format.
        </p>
        <CodeBlock
          code={`s = serialize(root)
deserialize(s)`}
        />
        <p>
          For example, <code>serialize</code> might return <code>&apos;1 2 # # 3 4 # # 5 # #&apos;</code>, and <code>deserialize</code> of that
          string must build a new tree that is the same as <code>root</code>.
        </p>
        <p>
          Values are whole numbers, possibly negative or with several digits, and may repeat. The tests only check that the round trip gives back
          the same tree, and that <code>serialize</code> returns a string.
        </p>
        <TreesNote />
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 nodes, at most 300 levels deep, so recursion is fine.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Listing only the values loses the shape. What must the string also say, so that the reader knows where a subtree ends?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Write the tree in pre-order, and write a marker such as <code>#</code> for every missing child. Separate the tokens with spaces. With the
              markers, pre-order alone fixes the tree (lesson 7).
            </p>
            <p>
              To read it, split the string into tokens and read them with an iterator, in the same order: a token is either a marker (return None) or
              a value (make a node, then read its left subtree, then its right subtree).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`serialize(node, out):
    if node is None: out.append('#'); return
    out.append(str(node.value))
    serialize(node.left); serialize(node.right)
return ' '.join(out)

deserialize: it = iter(data.split())
make(): t = next(it)
        if t == '#': return None
        node = TreeNode(int(t))
        node.left = make(); node.right = make()
        return node`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
