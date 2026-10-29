import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BstFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A sorted list finds a key fast with binary search, but inserting a key moves everything after it. A hash table inserts fast, but keeps no
        order. A binary search tree keeps its keys in order and can also insert quickly, as long as it stays short.
      </p>

      <h2 id="rule">The search tree rule</h2>
      <p>A binary search tree (BST) is a binary tree with keys in its nodes that obeys one rule at every node:</p>
      <Invariant label="Invariant">Every key in a node&rsquo;s left subtree is smaller than the node&rsquo;s key, and every key in its right subtree is bigger.</Invariant>
      <p>
        The rule is about whole subtrees, not just children. In the tree from lesson 1, 7 is in the left subtree of 8, so 7 must be smaller than 8,
        even though 7 is far below it. Practice TREE-P3 tests exactly this point.
      </p>
      <p>
        A useful fact follows: <strong>an in-order walk of a BST gives the keys in increasing order.</strong> Proof by induction: in-order lists the
        left subtree (sorted, by induction, and all smaller than the root), then the root, then the right subtree (sorted, and all bigger). Joined,
        that is sorted. So a BST is a sorted list stored as a tree. Keys are usually all different; if a tree must hold repeats, pick one side for
        them (say, equal keys go right) and keep to it.
      </p>

      <h2 id="search">Search</h2>
      <p>
        At each node, compare the key you want with the node&rsquo;s key. If they are equal, you are done. If yours is smaller, it can only be in
        the left subtree; if bigger, only in the right. Either way, one whole subtree is ruled out, as in binary search. Step through a search, then
        an insert:
      </p>

      <BstFigure />

      <CodeBlock
        code={`def search(root, key):
    node = root
    while node is not None and node.value != key:
        node = node.left if key < node.value else node.right
    return node                     # the node holding key, or None`}
      />
      <p>
        The smallest key is found by going left until there is no left child; the largest, by going right. All three walk one path down from the
        root, so they cost <M>O(h)</M>, where <M>h</M> is the height.
      </p>

      <h2 id="insert">Insert</h2>
      <p>
        To insert a key, search for it. If it is already there, stop. Otherwise the search ends by stepping off the tree, onto a missing child.
        That empty place is exactly where the key belongs, so a new leaf goes there. Nothing else in the tree moves.
      </p>
      <CodeBlock
        code={`def insert(root, key):
    new = TreeNode(key)
    if root is None:
        return new                  # the new node is the whole tree
    node = root
    while True:
        if key == node.value:
            return root             # already there
        side = 'left' if key < node.value else 'right'
        child = getattr(node, side)
        if child is None:
            setattr(node, side, new)
            return root
        node = child`}
      />
      <p>
        <code>getattr(node, side)</code> reads the attribute whose name is in the string <code>side</code>, and <code>setattr</code> sets it. They
        let one piece of code handle both directions. Insert also walks one path: <M>O(h)</M>.
      </p>

      <h2 id="height">Everything depends on the height</h2>
      <p>
        The third variant of the figure inserts 1 to 6 in order. Each new key is the biggest so far, so it goes right at every node, and the tree
        becomes a path of height <M>n − 1</M>. Then search and insert cost <M>O(n)</M>, no better than a plain list. Sorted input, which is common
        in practice, is the worst case.
      </p>
      <p>
        With keys inserted in a random order, the tree is short on average: a node&rsquo;s expected depth is about <M>2 ln n</M>, which is about{" "}
        <M>1.39 log₂ n</M>, and the expected height is about <M>4.3 ln n</M>. (Here <M>ln n</M> is the natural logarithm, the power you raise{" "}
        <M>e ≈ 2.718</M> to in order to get <M>n</M>.) For a million keys, that is a typical depth of about 28 and a height of about 50. But you
        rarely control the order of the input. The BALT station shows trees that rebalance themselves, keeping <M>h = O(log n)</M> whatever the
        order.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">A balanced search tree compared with a sorted list and a hash table</caption>
          <thead>
            <tr>
              <th>Job</th>
              <th>Sorted list</th>
              <th>Hash table</th>
              <th>Balanced BST</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Find a key</td>
              <td>
                <M>O(log n)</M>
              </td>
              <td>
                <M>O(1)</M> average
              </td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>Insert or delete</td>
              <td>
                <M>O(n)</M>
              </td>
              <td>
                <M>O(1)</M> average
              </td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>Smallest, largest, next bigger</td>
              <td>
                <M>O(1)</M> or <M>O(log n)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>All keys between a and b</td>
              <td>
                <M>O(log n + k)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
              <td>
                <M>O(log n + k)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Here <M>k</M> is the number of keys reported. A BST is the only one of the three that is fast at everything, as long as it is balanced.
        Choose a hash table when you only need to find keys, and a balanced tree when order matters too.
      </p>
      <Note title="A BST and binary search">
        <p>
          A perfectly balanced BST built from a sorted list stores the choices of binary search: the root is the middle value, its children the
          middles of the two halves, and so on. Searching the tree makes exactly the comparisons binary search would make (BSRC).
        </p>
      </Note>
    </>
  );
}
