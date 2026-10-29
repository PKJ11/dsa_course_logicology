import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { PartsFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A linked list joins each node to one next node. A tree lets a node lead to several nodes. Trees hold anything with a top-down shape: folders
        on a disk, the parts of a web page, the moves of a game. This lesson gives the words used for trees, and the main tool for working with
        them: recursion.
      </p>

      <h2 id="words">Root, children, leaves</h2>
      <p>Step through the figure. Each step names one part of the tree.</p>

      <PartsFigure />

      <p>The words, in one place:</p>
      <ul>
        <li>
          <strong>Node</strong> and <strong>edge</strong>: the boxes, and the lines joining a node to a node below it.
        </li>
        <li>
          <strong>Root</strong>: the one node with nothing above it. <strong>Parent</strong> and <strong>child</strong>: the two ends of an edge,
          upper and lower. <strong>Leaf</strong>: a node with no children.
        </li>
        <li>
          <strong>Depth</strong> of a node: the number of edges from the root down to it. <strong>Level</strong>: all the nodes with the same depth.
        </li>
        <li>
          <strong>Height</strong> of the tree: the largest depth of any node. A tree with one node has height 0. An empty tree has height −1 by
          convention, which makes the formulas below work.
        </li>
        <li>
          <strong>Subtree</strong> of a node: that node and everything below it. <strong>Ancestors</strong> of a node: the nodes on its path up to
          the root. <strong>Descendants</strong>: the nodes in its subtree.
        </li>
      </ul>
      <Invariant label="Rule">Every node except the root has exactly one parent. So a tree with n nodes has exactly n − 1 edges, and there is exactly one path from the root to each node.</Invariant>

      <h2 id="binary">Binary trees in Python</h2>
      <p>
        In a <em>binary tree</em>, each node has at most two children, called <em>left</em> and <em>right</em>. Left and right are different
        places: a node with only a left child is a different tree from a node with only a right child. In Python, a node is a small object, like a
        linked-list node with two references instead of one:
      </p>
      <CodeBlock
        code={`class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left          # the left child, or None
        self.right = right        # the right child, or None

root = TreeNode(8, TreeNode(3), TreeNode(10))`}
      />
      <p>
        The tree as a whole is a reference to its root; an empty tree is <code>None</code>. The practice problems write a tree as a level-order list:
        the values level by level, left to right, with <code>None</code> where a child is missing. <code>[8, 3, 10, None, 6]</code> is 8 with
        children 3 and 10, where 3 has only a right child, 6.
      </p>

      <h2 id="shapes">Height and the number of nodes</h2>
      <p>
        Level <M>d</M> of a binary tree holds at most <M>2<sup>d</sup></M> nodes (<M>d</M> twos multiplied together; 2⁰ is 1): 1 root, at most 2 children, at most 4 grandchildren, and so on, doubling at
        each level. So a tree of height <M>h</M> has at most <M>1 + 2 + 4 + … + 2<sup>h</sup> = 2<sup>h+1</sup> − 1</M> nodes. A tree with every level completely
        full is called <em>perfect</em>.
      </p>
      <p>
        Turn this around. A tree with <M>n</M> nodes has height at least <M>log₂ n</M> rounded down. (Recall that <M>log₂ n</M> is the number of
        times you can halve <M>n</M> before reaching 1.) At the other end, a tree where every node has one child is a path, with height{" "}
        <M>n − 1</M>.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Height of a binary tree with one million nodes, for different shapes</caption>
          <thead>
            <tr>
              <th>Shape of a tree with 1,000,000 nodes</th>
              <th className="num">Height</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>As full as possible (every level full except the last)</td>
              <td className="num">19</td>
            </tr>
            <tr>
              <td>A search tree built from keys in random order (lesson 4)</td>
              <td className="num">about 50</td>
            </tr>
            <tr>
              <td>A path: one child per node</td>
              <td className="num">999,999</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Much of this station and the next one is about that gap. Many tree jobs walk one path from the root, so they cost <M>O(h)</M>. That is{" "}
        <M>O(log n)</M> for a short, bushy tree, and <M>O(n)</M> for a path.
      </p>
      <p>
        Two more shape words appear often. A <em>full</em> binary tree is one where every node has 0 or 2 children. A <em>complete</em> binary tree
        has every level full except possibly the last, which is filled from the left. Heaps (HEAP station) are complete trees.
      </p>

      <h2 id="recursion">Thinking recursively</h2>
      <p>
        A subtree is itself a tree. So a question about a tree can often be answered from the same question about its two subtrees. The empty tree
        is the base case. The second variant of the figure computes the height this way. Here are three such functions:
      </p>
      <CodeBlock
        code={`def size(node):
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)

def height(node):
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))

def total(node):
    if node is None:
        return 0
    return node.value + total(node.left) + total(node.right)`}
      />
      <p>
        Each function calls itself once for each child, so every node is visited once: <M>O(n)</M> time. The calls waiting at any moment form a path
        from the root, so the recursion goes <M>h + 1</M> calls deep (RECR-2). That is the hidden cost of recursion on trees.
      </p>
      <Note title="Deep trees and RecursionError" warn>
        <p>
          Python stops a recursion at about 1,000 calls deep. A bushy tree with a million nodes is only about 20 levels deep, so recursion is fine.
          But a path-shaped tree with 5,000 nodes makes these functions fail with <code>RecursionError</code>. Lesson 2 shows how to walk a tree
          with your own stack or queue instead, which has no such limit.
        </p>
      </Note>
    </>
  );
}
