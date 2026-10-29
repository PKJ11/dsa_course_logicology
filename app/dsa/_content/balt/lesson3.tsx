import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { AvlFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        The AVL tree (Adelson-Velsky and Landis, 1962) was the first balanced search tree. It asks every node to be nearly balanced, and repairs
        the tree with at most one single or double rotation after each insert.
      </p>

      <h2 id="rule">The AVL rule</h2>
      <p>
        The <strong>balance</strong> of a node is the height of its left subtree minus the height of its right subtree. An empty subtree has
        height −1, so a leaf has balance 0. A balance of +1 means the left side is one level taller; −1 means the right side is.
      </p>
      <Invariant label="Invariant">At every node, the two subtrees differ in height by at most 1: the balance is −1, 0 or +1.</Invariant>
      <p>
        The rule holds at <em>every</em> node, not only the root. A tree whose root has two subtrees of equal height can still be badly unbalanced
        lower down. Practice BALT-P1 checks this rule for a whole tree in one pass.
      </p>
      <p>
        Each node stores its own height, so a balance can be worked out in <M>O(1)</M> from its two children. After a change, only the heights of
        nodes on the changed path can be wrong, and they are fixed on the way back up.
      </p>

      <h2 id="insert">Insert and the four cases</h2>
      <p>
        Insert the key as in a plain search tree, as a new leaf. That can only change the heights of the nodes on the path from the root to the new
        leaf. Walk back up that path, updating each height. Stop at the first node whose balance has become +2 or −2; call it <code>z</code>.
        Step through the figure: the first variant inserts 1 to 7 in order, and the second needs a double rotation.
      </p>

      <AvlFigure />

      <p>
        The new key went into one of <code>z</code>&rsquo;s subtrees, then into one of that child&rsquo;s subtrees. That gives four cases, named
        by the two directions:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">The four AVL cases and their fixes</caption>
          <thead>
            <tr>
              <th>Case</th>
              <th>Where the new key went</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Left-left</td>
              <td>left of z, then left of its child (outside)</td>
              <td>rotate right at z</td>
            </tr>
            <tr>
              <td>Right-right</td>
              <td>right, then right (outside)</td>
              <td>rotate left at z</td>
            </tr>
            <tr>
              <td>Left-right</td>
              <td>left, then right (inside)</td>
              <td>rotate left at the child, then right at z</td>
            </tr>
            <tr>
              <td>Right-left</td>
              <td>right, then left (inside)</td>
              <td>rotate right at the child, then left at z</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        After the fix, the subtree that <code>z</code> used to be the top of has exactly the height it had <em>before</em> the insert. So no
        node above it changes height, and the walk up can stop. An insert therefore does at most one single or one double rotation, plus{" "}
        <M>O(h)</M> work to walk down and back up.
      </p>
      <p>
        Why that height? In the left-left case, before the insert, <code>z</code>&rsquo;s left subtree had height <M>k + 1</M> and its right
        subtree height <M>k</M>. The insert raised the left side to <M>k + 2</M>. The rotation lifts the left child to the top with two subtrees of
        height <M>k + 1</M>, so the top has height <M>k + 2</M>: the same as before the insert. The other cases work the same way.
      </p>

      <h2 id="height">Why the height is O(log n)</h2>
      <p>
        Let <M>N(h)</M> be the smallest number of nodes an AVL tree of height <M>h</M> can have. The thinnest such tree has a root, one subtree
        of height <M>h − 1</M> and, as the rule allows, the other of height <M>h − 2</M>. Both subtrees are as thin as possible too, so:
      </p>
      <CodeBlock
        code={`N(0) = 1,   N(1) = 2,   N(h) = 1 + N(h - 1) + N(h - 2)
N:  1, 2, 4, 7, 12, 20, 33, 54, 88, ...`}
      />
      <p>
        Add 1 to each number and you get 2, 3, 5, 8, 13, 21, 34, 55, 89: the Fibonacci numbers, where each number is the sum of the two before
        it. Fibonacci numbers grow by a factor of about <M>φ ≈ 1.618</M> (the golden ratio) at each step, so{" "}
        <M>
          N(h) + 1 ≥ φ<sup>h</sup>
        </M>{" "}
        (<M>h</M> copies of φ multiplied together). Taking logarithms of both sides gives:
      </p>
      <Invariant label="Height">An AVL tree with n keys has height below 1.44 log₂(n + 2): at most 44% more than the best possible.</Invariant>
      <p>
        For a million keys, that is a height of at most 28, against 19 for a perfect tree and up to 999,999 for a plain search tree. Search, insert and
        delete are all <M>O(log n)</M> in the worst case.
      </p>

      <h2 id="code">The code</h2>
      <p>
        A recursive insert is the easiest to get right. Each call returns the new top of its subtree, so the parent&rsquo;s link is fixed by the
        assignment in the caller. The recursion is as deep as the tree, which is at most about 28 for a million keys.
      </p>
      <CodeBlock
        code={`def h(node):
    return node.height if node is not None else -1

def update(node):  # height from the two children
    node.height = 1 + max(h(node.left), h(node.right))

def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update(y)  # y first: it is now below x
    update(x)
    return x

def rebalance(node):
    update(node)
    balance = h(node.left) - h(node.right)
    if balance > 1:  # left side too tall
        if h(node.left.left) < h(node.left.right):
            # inside: make it outside
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if balance < -1:  # right side too tall (mirror)
        if h(node.right.right) < h(node.right.left):
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node`}
      />
      <p>
        <code>rotate_left</code> is the mirror of <code>rotate_right</code>. Insert then goes down as in TREE-4, and on the way back calls{" "}
        <code>rebalance</code> on every node of the path: <code>node.left = insert(node.left, key)</code>, then{" "}
        <code>return rebalance(node)</code>. Calling <code>rebalance</code> on nodes that are fine just updates their height. Practice BALT-P3 asks
        you to write the whole insert.
      </p>

      <h2 id="delete">Deleting</h2>
      <p>
        Delete as in a plain search tree (TREE-5), then walk back up from the node that was actually removed, calling <code>rebalance</code> at
        each node. One difference: after a delete, a rotation can make the subtree one level <em>shorter</em> than before, so the node above may
        now be out of balance too. A delete can need a rotation at every level of the path: <M>O(log n)</M> rotations, still <M>O(log n)</M>{" "}
        time.
      </p>
      <Note title="When the two subtrees of the child are equal">
        <p>
          After a delete (never after an insert), the taller child of <code>z</code> can have two subtrees of equal height. Then use a single
          rotation. The code above does this: it only rotates the child first when the inside subtree is strictly taller.
        </p>
      </Note>
    </>
  );
}
