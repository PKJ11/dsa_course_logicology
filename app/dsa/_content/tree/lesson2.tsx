import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TraversalFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A list has one natural order: front to back. A tree has several. Visiting every node once, in some fixed order, is called a traversal. The
        four common orders each suit different jobs.
      </p>

      <h2 id="depth">Pre-order, in-order, post-order</h2>
      <p>
        The first three orders all go deep first: they finish one subtree completely before starting the other. They differ only in when the node
        itself is visited, compared with its two subtrees:
      </p>
      <ul>
        <li>
          <strong>Pre-order:</strong> the node, then the left subtree, then the right subtree.
        </li>
        <li>
          <strong>In-order:</strong> the left subtree, then the node, then the right subtree.
        </li>
        <li>
          <strong>Post-order:</strong> the left subtree, then the right subtree, then the node.
        </li>
      </ul>
      <p>Step through each order on the same tree:</p>

      <TraversalFigure />

      <p>In code, the three orders are the same function with the visit in a different place:</p>
      <CodeBlock
        code={`def preorder(node, out):
    if node is None:
        return
    out.append(node.value)        # before the subtrees
    preorder(node.left, out)
    preorder(node.right, out)

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)
    out.append(node.value)        # between them
    inorder(node.right, out)

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.value)        # after them`}
      />
      <p>Each order has typical uses:</p>
      <ul>
        <li>
          <strong>Pre-order</strong> handles a node before its children: copying a tree, or writing it out so it can be rebuilt (lesson 7).
        </li>
        <li>
          <strong>In-order</strong> on a search tree gives the keys in sorted order (lesson 4).
        </li>
        <li>
          <strong>Post-order</strong> handles a node after its children: computing heights or sizes, freeing a tree, or adding up the sizes of
          folders, where each folder&rsquo;s size needs its contents first.
        </li>
      </ul>

      <h2 id="level">Level order with a queue</h2>
      <p>
        The fourth order goes across instead of down: level 0, then level 1, then level 2, each from left to right. It is also called{" "}
        <em>breadth-first</em>. A queue (STAQ-3) does the work. Take a node from the front, visit it, and add its children to the back. Children
        always join behind every node of the current level, so levels come out in order.
      </p>
      <CodeBlock
        code={`from collections import deque

def level_order(root):
    out = []
    q = deque([root] if root is not None else [])
    while q:
        node = q.popleft()
        out.append(node.value)
        if node.left is not None:
            q.append(node.left)
        if node.right is not None:
            q.append(node.right)
    return out`}
      />
      <p>
        To split the output into one list per level, take exactly <code>len(q)</code> nodes in each round, counted before the round starts. At that
        moment the queue holds exactly one level. Practice TREE-P1 asks for this.
      </p>

      <h2 id="stack">Without recursion</h2>
      <p>
        The recursive versions go <M>h + 1</M> calls deep, so a path-shaped tree with thousands of levels breaks them (lesson 1). Any recursion can
        be replaced by a stack you keep yourself (RECR-6). Pre-order is the easiest. Push the right child before the left, so that the left comes
        off the stack first:
      </p>
      <CodeBlock
        code={`def preorder(root):
    out, stack = [], [root] if root is not None else []
    while stack:
        node = stack.pop()
        out.append(node.value)
        if node.right is not None:
            stack.append(node.right)   # pushed first, used later
        if node.left is not None:
            stack.append(node.left)
    return out`}
      />
      <p>
        In-order needs more care, because a node is visited only after its whole left subtree. Walk left as far as possible, pushing every node on
        the way. Then pop one, visit it, and move to its right child to start again:
      </p>
      <CodeBlock
        code={`def inorder(root):
    out, stack, cur = [], [], root
    while stack or cur is not None:
        while cur is not None:         # go left, remembering the way back
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()              # its left subtree is done
        out.append(cur.value)
        cur = cur.right                # now do its right subtree
    return out`}
      />
      <Invariant label="Invariant">In the in-order loop, the stack holds exactly the nodes whose left subtree is being visited and who are still waiting to be visited themselves.</Invariant>
      <p>
        A post-order without recursion can be made from the pre-order trick: visit node, right, left (push left first), then reverse the output.
        That gives left, right, node.
      </p>

      <h2 id="cost">Cost and when to use which</h2>
      <p>
        Every traversal visits each node once and follows each edge a fixed number of times, so all four take <M>O(n)</M> time. Their extra space
        differs:
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Extra space used by each traversal</caption>
          <thead>
            <tr>
              <th>Traversal</th>
              <th>Extra space</th>
              <th>Worst shape</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pre-, in- or post-order (recursion or a stack)</td>
              <td>
                <M>O(h)</M>: one path from the root
              </td>
              <td>A path: <M>O(n)</M></td>
            </tr>
            <tr>
              <td>Level order (a queue)</td>
              <td>
                <M>O(w)</M>: the widest level
              </td>
              <td>
                A full tree: its last level holds about <M>n/2</M> nodes
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        So the two families are good at opposite shapes: going deep is cheap on a bushy tree with short paths, and going across is cheap on a
        narrow, deep tree. Choose by the job first (does it need levels, or children before parents?), and by the shape second.
      </p>
      <Note title="The same orders in graphs">
        <p>
          Going deep first and going across first are the two great ways to explore any network of nodes, not only trees. The GRPH station calls
          them depth-first search and breadth-first search. The only addition there is a set of visited nodes, because a graph can lead back to a
          node already seen.
        </p>
      </Note>
    </>
  );
}
