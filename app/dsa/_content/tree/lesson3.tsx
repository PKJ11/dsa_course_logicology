import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RebuildFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        One traversal list does not tell you the tree: many trees give the same pre-order. But two lists together can. This lesson rebuilds a tree
        from its pre-order and in-order lists, proves the answer is the only one, and shows which pairs of lists are enough.
      </p>

      <h2 id="idea">Two lists fix the tree</h2>
      <p>
        Suppose all values are different, and you have the tree&rsquo;s pre-order and in-order lists. Two facts from lesson 2 do all the work:
      </p>
      <ol>
        <li>
          <strong>Pre-order starts with the root.</strong> After the root come all the values of the left subtree, then all the values of the right
          subtree.
        </li>
        <li>
          <strong>In-order has the root in the middle.</strong> Every value before the root is in the left subtree, and every value after it is in
          the right subtree.
        </li>
      </ol>
      <p>
        So: read the root from the front of pre-order. Find it in in-order. The number of values to its left, say <M>L</M>, is the size of the left
        subtree. Then the next <M>L</M> pre-order values are the left subtree&rsquo;s pre-order, and the rest are the right subtree&rsquo;s. Now
        you have the same problem twice, on two smaller pairs of lists.
      </p>
      <Invariant label="Rule">With different values, pre-order plus in-order fixes exactly one binary tree.</Invariant>
      <p>
        Why only one? By induction on the number of nodes (proving it for small trees first, then for bigger ones using the smaller cases). An empty
        list gives only the empty tree. For a bigger tree, the root is forced: it is the first pre-order value. Its left and right subtrees have
        forced lists, as shown above, and each is smaller, so each is a single tree by induction. So the whole tree is forced.
      </p>

      <h2 id="steps">Step by step</h2>
      <p>
        The figure rebuilds the tree from lessons 1 and 2. The <code>nxt</code> pointer moves along pre-order, one root at a time. The window shows
        which part of in-order the current subtree covers.
      </p>

      <RebuildFigure />

      <p>
        Notice two things. First, the pre-order list is used strictly from left to right, never jumping. That is because the recursion builds each
        left subtree completely before the right one, which is exactly the order pre-order lists them. Second, the in-order list is never changed or
        copied. Each subtree is just a range <code>lo..hi</code> of it.
      </p>

      <h2 id="code">The code and its cost</h2>
      <CodeBlock
        code={`def build_tree(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}   # value -> in-order place
    nxt = 0

    def make(lo, hi):                    # build the subtree for inorder[lo..hi]
        nonlocal nxt
        if lo > hi:
            return None                  # an empty range is an empty tree
        v = preorder[nxt]
        nxt += 1
        node = TreeNode(v)
        node.left = make(lo, where[v] - 1)
        node.right = make(where[v] + 1, hi)
        return node

    return make(0, len(inorder) - 1)`}
      />
      <p>
        <code>nonlocal nxt</code> lets the inner function change the outer variable <code>nxt</code>, so all the calls share one position in
        pre-order.
      </p>
      <p>
        Each call makes one node, plus empty calls at the missing children, so there are about <M>2n</M> calls, each <M>O(1)</M>. With the dict the
        rebuild takes <M>O(n)</M> time. A common shortcut, slicing the lists and calling <code>inorder.index(v)</code> in each call, costs{" "}
        <M>O(n)</M> per call on a path-shaped tree, so <M>O(n²)</M> in all. The recursion is <M>h + 1</M> calls deep, as usual.
      </p>

      <h2 id="limits">Which pairs work</h2>
      <ul>
        <li>
          <strong>Post-order and in-order</strong> also work. Post-order ends with the root, so take roots from the back, and build each right
          subtree before the left one.
        </li>
        <li>
          <strong>Level order and in-order</strong> also work: the first value of level order is the root.
        </li>
        <li>
          <strong>Pre-order and post-order</strong> do not, in general. The tree &ldquo;1 with left child 2&rdquo; and the tree &ldquo;1 with right
          child 2&rdquo; both have pre-order [1, 2] and post-order [2, 1]. Without in-order, nothing says which side a lone child is on. (If every
          node has 0 or 2 children, the pair does work.)
        </li>
        <li>
          <strong>Repeated values</strong> break all of this: in the list [1, 1], which 1 is the root of in-order? The rule needs different values.
        </li>
      </ul>
      <Note title="A search tree needs only one list">
        <p>
          For a binary search tree (lesson 4), the in-order list is just the values in sorted order. So the pre-order list alone fixes the tree:
          sort it to get the in-order list, then rebuild. A cleverer version skips the sort. It passes down the range of values a subtree may hold,
          and takes pre-order values while they fit, which makes it <M>O(n)</M>.
        </p>
      </Note>
    </>
  );
}
