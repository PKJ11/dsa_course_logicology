import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RbFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        A red-black tree gives every node one extra bit, a colour, and keeps four rules about the colours. The rules are looser than the AVL rule,
        so the tree is a little taller, but it needs fewer rotations. Java&rsquo;s <code>TreeMap</code> and most C++ <code>std::map</code>{" "}
        libraries are red-black trees.
      </p>

      <h2 id="rules">The four rules</h2>
      <p>
        Every node is either red or black. The names are just labels for the two values of one bit (in Python, a field <code>red</code> that is{" "}
        <code>True</code> or <code>False</code>). In the figure the colour is shown as a tag, R or B, because this course uses the colour red only
        for mistakes.
      </p>
      <ol>
        <li>Every node is red or black.</li>
        <li>The root is black.</li>
        <li>A red node never has a red child.</li>
        <li>
          Every path from a node down to a missing child passes the same number of black nodes. A missing child counts as black. This number is
          the node&rsquo;s <strong>black height</strong>.
        </li>
      </ol>
      <p>Step through the first variant of the figure to see each rule on a real tree.</p>

      <RbFigure />

      <h2 id="height">Why the height is O(log n)</h2>
      <p>
        First, a subtree whose top has black height <M>b</M> holds at least{" "}
        <M>
          2<sup>b</sup> − 1
        </M>{" "}
        nodes (<M>b</M> twos multiplied together, minus 1). Proof by induction on the height: each child has black height at least{" "}
        <M>b − 1</M>, so by induction holds at least{" "}
        <M>
          2<sup>b−1</sup> − 1
        </M>{" "}
        nodes, and the two children plus the top give at least{" "}
        <M>
          2 · (2<sup>b−1</sup> − 1) + 1 = 2<sup>b</sup> − 1
        </M>
        .
      </p>
      <p>
        Second, by rule 3, at least half the nodes on any path down from the root are black. So if the tree has height <M>h</M>, the root has
        black height at least <M>h/2</M>. Put together:{" "}
        <M>
          n ≥ 2<sup>h/2</sup> − 1
        </M>
        , and taking logarithms:
      </p>
      <Invariant label="Height">A red-black tree with n keys has height at most 2 log₂(n + 1).</Invariant>
      <p>
        That is looser than the AVL bound (1.44 log₂ n): for a million keys, a height of up to 39 instead of 28. In practice red-black trees are
        usually much shorter than the bound.
      </p>

      <h2 id="insert">Insert: recolour or rotate</h2>
      <p>
        Insert the key as in a plain search tree, as a red leaf. A red node does not change any black count, so rule 4 still holds. Only two rules
        can break: rule 2, if the new node is the root, and rule 3, if its parent is red. While the node <code>z</code> and its parent are both
        red, look at the <strong>uncle</strong>, the parent&rsquo;s sibling:
      </p>
      <ul>
        <li>
          <strong>Uncle red: recolour.</strong> Make the parent and the uncle black and the grandparent red. Every path through the grandparent
          still passes the same number of black nodes. But the grandparent may now be red under a red parent, so repeat from the grandparent, two
          levels up.
        </li>
        <li>
          <strong>Uncle black (or missing): rotate.</strong> If <code>z</code> is on the inside, first rotate at the parent to move it to the
          outside (as in the double rotation of BALT-2). Then make the parent black and the grandparent red, and rotate at the grandparent. The
          parent comes up as a black top over two red children, and the loop ends.
        </li>
      </ul>
      <p>Finally, colour the root black. Step through the second variant to see both cases while inserting 1 to 8.</p>
      <p>
        Cost: the recolour case moves two levels up each time, so it runs at most <M>O(log n)</M> times, and the rotate case happens at most once.
        So an insert is <M>O(log n)</M> with at most two rotations. A delete has more cases but also needs at most three rotations.
      </p>
      <Note title="Red-black trees are B-trees in disguise">
        <p>
          Merge each black node with its red children into one big node. You get a node with 1, 2 or 3 keys, and, by rule 4, all the leaves end at
          the same depth. That is exactly a B-tree with up to 3 keys per node, also called a 2-3-4 tree (BALT-5). Recolouring corresponds to
          splitting a full node, and the rules are the B-tree rules written for a binary tree.
        </p>
      </Note>

      <h2 id="llrb">A shorter version</h2>
      <p>
        The rules above leave many cases. Robert Sedgewick&rsquo;s <strong>left-leaning red-black tree</strong> (2008) adds one more rule, a red
        node is always a left child, and the insert becomes three checks on the way back up a recursive insert:
      </p>
      <CodeBlock
        code={`def is_red(node):
    return node is not None and node.red

# inside the recursive insert, after inserting below node:
if is_red(node.right) and not is_red(node.left):
    # a red link leans right: turn it left
    node = rotate_left(node)
if is_red(node.left) and is_red(node.left.left):
    node = rotate_right(node)  # two reds in a row on the left
if is_red(node.left) and is_red(node.right):
    flip_colours(node)  # children black, node red
return node`}
      />
      <p>
        Here a rotation also passes the colour: the node that comes up takes the old top&rsquo;s colour, and the old top becomes red.{" "}
        <code>flip_colours</code> makes both children black and the node red. New nodes are red, and the outer function colours the root black
        at the end. The result obeys all four rules, so practice BALT-P4 accepts it, or any other correct red-black insert.
      </p>

      <h2 id="compare">AVL or red-black?</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">AVL trees compared with red-black trees</caption>
          <thead>
            <tr>
              <th></th>
              <th>AVL</th>
              <th>Red-black</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Height bound</td>
              <td>1.44 log₂ n</td>
              <td>2 log₂ n</td>
            </tr>
            <tr>
              <td>Rotations per insert</td>
              <td>at most 2</td>
              <td>at most 2</td>
            </tr>
            <tr>
              <td>Rotations per delete</td>
              <td>up to O(log n)</td>
              <td>at most 3</td>
            </tr>
            <tr>
              <td>Extra data per node</td>
              <td>a height (or a balance)</td>
              <td>one bit</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Both are <M>O(log n)</M> for every job. AVL trees are a little shorter, so searches are a little faster. Red-black trees change less on
        delete. That suits libraries, where updates are frequent and other data may point into the tree.
      </p>
    </>
  );
}
