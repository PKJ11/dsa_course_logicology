import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { LcaFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Two nodes in a tree always share some ancestors: at least the root. The lowest one they share tells you where their paths from the root
        split. Finding it is a classic tree question, and the method depends on what the tree gives you.
      </p>

      <h2 id="what">What it is</h2>
      <p>
        The <em>lowest common ancestor</em> (LCA) of two nodes <M>p</M> and <M>q</M> is the deepest node that has both of them in its subtree. A node
        counts as being in its own subtree, so if <M>p</M> is above <M>q</M>, the answer is <M>p</M> itself.
      </p>
      <p>Some places it is used:</p>
      <ul>
        <li>
          The number of edges between two nodes is <M>depth(p) + depth(q) − 2 · depth(lca)</M>: up from <M>p</M> to the LCA, then down to{" "}
          <M>q</M>.
        </li>
        <li>The closest folder that contains two files is the LCA of the two files in the folder tree.</li>
        <li>
          Version control: <code>git merge-base</code> finds the last commit two branches share. Commits form a graph rather than a tree, but the idea
          is the same.
        </li>
      </ul>

      <h2 id="bst">In a search tree</h2>
      <p>
        In a BST, the keys say which way to go. Start at the root. If both keys are smaller than the node&rsquo;s key, both nodes are in the left
        subtree: go left. If both are bigger, go right. Otherwise they are on different sides (or one of them is this node), so the paths split
        here, and this node is the answer. Step through the first variant:
      </p>

      <LcaFigure />

      <CodeBlock
        code={`def lca_bst(root, p, q):
    node = root
    while True:
        if p < node.value and q < node.value:
            node = node.left
        elif p > node.value and q > node.value:
            node = node.right
        else:
            return node`}
      />
      <p>One path from the root: <M>O(h)</M> time and <M>O(1)</M> extra space.</p>

      <h2 id="any">In any binary tree</h2>
      <p>
        Without sorted keys, there is no way to steer, so you must search. The method is to search for both values at once, with one recursive
        function. <code>find(node)</code> reports what it found in the subtree of <code>node</code>:
      </p>
      <ul>
        <li>None, if neither value is in the subtree;</li>
        <li>the node holding <M>p</M> or <M>q</M>, if it meets one;</li>
        <li>the answer, once both values have been found on different sides of a node.</li>
      </ul>
      <CodeBlock
        code={`def lca(root, p, q):
    def find(node):
        if node is None or node.value == p or node.value == q:
            return node
        a = find(node.left)
        b = find(node.right)
        if a is not None and b is not None:
            return node             # one value on each side
        return a if a is not None else b
    return find(root)`}
      />
      <p>Step through the second variant of the figure to see the answers passed up from the bottom. Why is the result right?</p>
      <ul>
        <li>
          If <M>p</M> and <M>q</M> are in different subtrees of some node, the two calls below it each return something, and that node returns
          itself. It is the lowest such node, because calls finish from the bottom up and pass the answer on unchanged.
        </li>
        <li>
          If <M>q</M> is below <M>p</M>, the call at <M>p</M> returns <M>p</M> at once, without looking further. No other branch finds anything,
          so <M>p</M> is passed up to the root. That is correct: <M>p</M> is the answer.
        </li>
      </ul>
      <Invariant label="Cost">Each node is visited at most once: O(n) time, and O(h) for the recursion.</Invariant>
      <p>
        This version assumes both values are in the tree, as practice TREE-P5 promises. If one might be missing, the function would wrongly return
        the other one; a full solution counts how many of the two it actually found.
      </p>

      <h2 id="parents">With parent links</h2>
      <p>
        Some trees store a <code>parent</code> reference in every node. Then you can climb from <M>p</M> and <M>q</M> towards the root. Two simple
        ways:
      </p>
      <ul>
        <li>
          Collect all of <M>p</M>&rsquo;s ancestors in a set. Then climb from <M>q</M> until you reach a node in the set. <M>O(h)</M> time and space.
        </li>
        <li>
          Find both depths. Move the deeper node up until both are at the same depth, then move both up together until they meet. <M>O(h)</M> time
          and <M>O(1)</M> space. The same idea finds where two linked lists join.
        </li>
      </ul>
      <p>
        If a tree has no parent links, one traversal can record them in a dict, as the second hint of TREE-P5 suggests: the dict maps each value
        to its parent&rsquo;s value.
      </p>
      <Note title="Many questions on one tree">
        <p>
          When the same tree gets thousands of LCA questions, it pays to prepare once. <em>Binary lifting</em> stores, for each node, its ancestor
          1, 2, 4, 8, … levels up. That takes <M>O(n log n)</M> time and space once, then answers each question in <M>O(log n)</M> by climbing in
          big jumps. Another method turns LCA into a smallest-value-in-a-range question, which the RNGQ station answers in <M>O(1)</M>.
        </p>
      </Note>
    </>
  );
}
