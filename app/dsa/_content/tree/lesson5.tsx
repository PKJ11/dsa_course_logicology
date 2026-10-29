import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DeleteFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Finding the next bigger key, and deleting a key, are the two harder jobs in a search tree. They are linked: the hard case of deletion is
        solved by the next bigger key, called the successor.
      </p>

      <h2 id="minmax">Smallest, largest, next</h2>
      <p>
        In a BST, the smallest key is at the end of the path that always goes left, and the largest at the end of the path that always goes right.
        The <em>successor</em> of a key is the next bigger key in the tree: the key that comes right after it in in-order. The{" "}
        <em>predecessor</em> is the next smaller one.
      </p>
      <CodeBlock
        code={`def smallest(node):
    while node.left is not None:
        node = node.left
    return node`}
      />

      <h2 id="successor">Finding the successor</h2>
      <p>There are two cases, depending on whether the node has a right subtree.</p>
      <ol>
        <li>
          <strong>It has a right subtree.</strong> Every key bigger than the node, and close to it, is in there. The successor is the smallest key in
          the right subtree: go right once, then left as far as possible. In the lessons&rsquo; tree, the successor of 3 is 4 (right to 6, then
          left to 4).
        </li>
        <li>
          <strong>It has no right subtree.</strong> Then the successor is above it: the nearest ancestor that the node is in the <em>left</em>{" "}
          subtree of. In the tree, 7 has no right child. Going up, 7 is right of 6, and 6 is right of 3, but 3 is left of 8. So the successor of 7 is
          8.
        </li>
      </ol>
      <p>
        Without parent links, case 2 is found by searching from the root and remembering the last node where the search went left:
      </p>
      <CodeBlock
        code={`def successor(root, key):
    best, node = None, root
    while node is not None:
        if key < node.value:
            best = node             # a candidate; look for a smaller one
            node = node.left
        else:
            node = node.right
    return best                     # None if key is the largest`}
      />
      <p>
        This version handles both cases at once, and even works for a key that is not in the tree. Each step goes one level down: <M>O(h)</M>.
      </p>

      <h2 id="delete">Deleting: three cases</h2>
      <p>
        First find the node, keeping track of its parent. Then what you do depends on how many children the node has. Step through all three:
      </p>

      <DeleteFigure />

      <ul>
        <li>
          <strong>No children:</strong> remove it, by setting the parent&rsquo;s link to <code>None</code>.
        </li>
        <li>
          <strong>One child:</strong> the child takes the node&rsquo;s place. Link the parent straight to the child. The child&rsquo;s whole subtree
          was on the correct side of the parent before, and still is.
        </li>
        <li>
          <strong>Two children:</strong> the node cannot just be cut out, since it has two subtrees to hand on and only one place to put them.
          Instead, copy its successor&rsquo;s key into it, and delete the successor&rsquo;s old node.
        </li>
      </ul>
      <p>Why is the two-children case correct, and why does it end?</p>
      <ul>
        <li>
          The successor <M>s</M> is the smallest key in the right subtree. So <M>s</M> is bigger than every key in the left subtree (they are all
          smaller than the deleted key), and smaller than every other key in the right subtree. Putting <M>s</M> in the node keeps the rule.
        </li>
        <li>
          The successor&rsquo;s node has no left child: a left child would be an even smaller key in the right subtree. So removing it is one of
          the two easy cases. There is no chain of further deletions.
        </li>
      </ul>
      <Invariant label="Cost">Deletion walks down to the node, then on down to its successor: one path in total, O(h).</Invariant>
      <p>
        Using the predecessor (the largest key in the left subtree) works just as well. Practice TREE-P4 asks for the successor so that the tests can
        check one exact shape. Some libraries switch between the two, so that many deletions do not make one side of the tree lopsided.
      </p>
      <Note title="Deleting the root">
        <p>
          If the node to delete is the root and it has at most one child, there is no parent to update: the child itself becomes the new root. That
          is why a delete function returns the root, and why you call it as <code>root = delete(root, key)</code>.
        </p>
      </Note>

      <h2 id="python">Sorted containers in Python</h2>
      <p>
        Python has no search tree in its standard library. For ordered data, the usual tools are a sorted list kept in order with the{" "}
        <code>bisect</code> module (BSRC), and <code>heapq</code> when you only need the smallest item (HEAP station). Inserting into a sorted list
        is <M>O(n)</M>, but the moving is done in C, so it is fast for lists of up to about a million items.
      </p>
      <p>
        The widely used third-party package <code>sortedcontainers</code> offers <code>SortedList</code>, <code>SortedDict</code> and{" "}
        <code>SortedSet</code>. Inside, it is a list of sorted lists, not a tree, and it is often faster than a tree in Python. Other languages ship
        balanced trees: Java&rsquo;s <code>TreeMap</code> and C++&rsquo;s <code>std::map</code> are red-black trees (BALT station).
      </p>
    </>
  );
}
