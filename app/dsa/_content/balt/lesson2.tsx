import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RotateFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A rotation is the basic repair tool of a balanced tree. It changes three links, lifts one node and lowers another, and keeps every key in
        order. AVL trees and red-black trees are both built on it.
      </p>

      <h2 id="what">What a rotation does</h2>
      <p>
        Take a node <code>y</code> and its left child <code>x</code>. A <strong>right rotation</strong> at <code>y</code> lifts <code>x</code>{" "}
        into <code>y</code>&rsquo;s place and puts <code>y</code> below <code>x</code>, on its right. A <strong>left rotation</strong> is the
        mirror image: it lifts the right child. Each rotation undoes the other.
      </p>
      <p>
        Below <code>x</code> and <code>y</code> hang three subtrees (some may be empty). In a right rotation, call them A (left of{" "}
        <code>x</code>), B (right of <code>x</code>) and C (right of <code>y</code>). A stays with <code>x</code> and C stays with{" "}
        <code>y</code>. Only B changes parent: it moves from <code>x</code> to <code>y</code>. So the nodes in A go up one level, the nodes in C go
        down one level, and B stays at the same depth. That is how a rotation shortens a tall side.
      </p>

      <RotateFigure />

      <h2 id="code">The code</h2>
      <p>The rotation itself is three assignments. Here are both directions, for nodes with <code>left</code> and <code>right</code> fields:</p>
      <CodeBlock
        code={`def rotate_right(y):
    x = y.left
    y.left = x.right  # B moves across
    x.right = y
    return x  # the new top of this part

def rotate_left(y):
    x = y.right
    y.right = x.left  # B moves across
    x.left = y
    return x`}
      />
      <p>
        The function returns the new top, and the caller must link it in where <code>y</code> was: as the root, or as the left or right child of{" "}
        <code>y</code>&rsquo;s parent. Forgetting that link is the most common rotation bug: the parent still points at <code>y</code>, and{" "}
        <code>x</code> with all of A is lost from the tree. In recursive code the fix is natural, because the caller writes{" "}
        <code>node.left = rotate_right(node.left)</code>. Practice BALT-P2 asks you to rotate deep inside a tree and fix the parent&rsquo;s link.
      </p>
      <p>
        A rotation reads and writes a fixed number of fields, whatever the size of the subtrees, so it costs <M>O(1)</M>. If nodes store extra
        data that depends on their subtree (a height, a count of nodes), only <code>x</code> and <code>y</code> need updating, and{" "}
        <code>y</code> must be updated first, because it is now below <code>x</code>.
      </p>

      <h2 id="order">Why the order survives</h2>
      <p>
        Before a right rotation, the in-order list is A, <code>x</code>, B, <code>y</code>, C: every key of A is smaller than <code>x</code>, B
        lies between <code>x</code> and <code>y</code>, and C is bigger than <code>y</code>. After the rotation, in-order lists <code>x</code>
        &rsquo;s left subtree (A), then <code>x</code>, then <code>x</code>&rsquo;s right subtree, which is <code>y</code> with B on its left and
        C on its right: A, <code>x</code>, B, <code>y</code>, C. The same list.
      </p>
      <Invariant label="Rule">A rotation changes the shape of the tree but never its in-order list, so the result is still a search tree.</Invariant>
      <p>
        The rest of the tree does not notice either. Keys outside this part relate to it only through the whole range of keys it holds, and the
        rotation keeps the same keys in the same part.
      </p>

      <h2 id="double">Double rotations</h2>
      <p>
        One rotation fixes a tree that is tall on the <em>outside</em>: the left child&rsquo;s left subtree, or the right child&rsquo;s right
        subtree. It does not fix a tree that is tall on the <em>inside</em>: the left child&rsquo;s right subtree. A right rotation moves that
        inside subtree (B) across without lifting it, so the tree just leans the other way. The third variant of the figure shows the fix: first
        rotate left at the child, which turns the inside case into the outside case, then rotate right at the top.
      </p>
      <CodeBlock
        code={`def rotate_left_right(z):
    z.left = rotate_left(z.left)
    return rotate_right(z)

def rotate_right_left(z):  # the mirror image
    z.right = rotate_right(z.right)
    return rotate_left(z)`}
      />
      <p>
        The result puts the middle key of the three on top, with the smaller one on its left and the bigger one on its right. It is still{" "}
        <M>O(1)</M>: six links.
      </p>
      <Note title="Rotations are enough">
        <p>
          Any search tree on a set of keys can be turned into any other search tree on the same keys using at most <M>2n − 6</M> rotations when <M>n</M> is at
          least 11 (Sleator, Tarjan and Thurston, 1988). So rotations are a complete toolkit for reshaping a tree. Balanced trees use only a few of them per insert or
          delete.
        </p>
      </Note>
    </>
  );
}
