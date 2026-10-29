import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ReadFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A Python list keeps its items side by side. A linked list does not. Each item sits in its own small object, called a node, and each node
        tells you where the next one is. This changes which jobs are fast and which are slow.
      </p>

      <h2 id="node">A node and its next</h2>
      <p>
        You met the node class in PYTH-5. A node holds two things: a value, and a reference to the next node. The last node&rsquo;s{" "}
        <code>next</code> is <code>None</code>. That is how you know the list has ended.
      </p>
      <CodeBlock
        code={`class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

head = Node(3, Node(8, Node(5)))    # 3 -> 8 -> 5 -> None`}
      />
      <p>
        The list as a whole is just a reference to its first node. This first node is called the <em>head</em>. If you have the head, you can reach
        every node by following <code>next</code> again and again. If you lose every reference to the head, you lose the list.
      </p>
      <p>
        A <em>reference</em> is how Python names an object. <code>a = b</code> does not copy a node; it makes <code>a</code> refer to the same node as{" "}
        <code>b</code>. So <code>cur = cur.next</code> moves the name <code>cur</code> on by one node. It does not change any node.
      </p>

      <h2 id="memory">A block against a chain</h2>
      <p>
        A Python list keeps references to its items in one block of memory, one after another. To read item <M>k</M>, Python works out its place
        directly: the start of the block, plus <M>k</M> places. That takes the same time for any <M>k</M>.
      </p>
      <p>
        Nodes can be anywhere in memory. Nothing says where node 4 is, except node 3. So to read item <M>k</M> you must start at the head and follow{" "}
        <code>next</code> <M>k</M> times. Step through both:
      </p>

      <ReadFigure />

      <Invariant label="Rule">A linked list is only reachable from its head. Every node is found by following next from there.</Invariant>

      <h2 id="costs">What is fast and what is slow</h2>
      <p>
        Here <M>n</M> is the number of items. &ldquo;A node you hold&rdquo; means you already have a reference to it, for example in a name like{" "}
        <code>cur</code>.
      </p>
      <div className="tt-wrap">
      <table className="tt">
        <caption className="visually-hidden">Cost of common jobs on a Python list and on a linked list</caption>
        <thead>
          <tr>
            <th>Job</th>
            <th>Python list</th>
            <th>Linked list</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Read item k</td>
            <td>
              <M>O(1)</M>
            </td>
            <td>
              <M>O(k)</M>
            </td>
          </tr>
          <tr>
            <td>Add or remove at the front</td>
            <td>
              <M>O(n)</M>: every item moves
            </td>
            <td>
              <M>O(1)</M>
            </td>
          </tr>
          <tr>
            <td>Add or remove at the end</td>
            <td>
              <M>O(1)</M> on average
            </td>
            <td>
              <M>O(1)</M> if you keep a <code>tail</code> name, else <M>O(n)</M>
            </td>
          </tr>
          <tr>
            <td>Insert or delete next to a node you hold</td>
            <td>
              <M>O(n)</M>: items after it move
            </td>
            <td>
              <M>O(1)</M>
            </td>
          </tr>
          <tr>
            <td>Find a value</td>
            <td>
              <M>O(n)</M>
            </td>
            <td>
              <M>O(n)</M>
            </td>
          </tr>
          <tr>
            <td>Memory per item</td>
            <td>one reference</td>
            <td>a whole object: value, next, and the extra data Python keeps for every object</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p>
        So a linked list is good when you change the list in the middle often, and you already hold the place to change. It is bad when you read
        by position.
      </p>

      <h2 id="python">Linked lists in Python</h2>
      <p>
        Python has no built-in linked list class, and in everyday Python code you rarely need one. A list, or <code>collections.deque</code>{" "}
        (lesson 3), is usually faster, for two reasons. The items sit close together in memory. And their methods are built into Python and
        written in C, a language that runs much faster than Python code.
      </p>
      <p>Linked lists still matter, for three reasons:</p>
      <ul>
        <li>
          The same idea, objects joined by references, is how trees and graphs are built. The TREE, HEAP and GRPH stations all depend on it.
        </li>
        <li>
          Some structures need to remove an item from the middle in <M>O(1)</M>. A cache that drops the least recently used item (HASH-7) does
          this with a two-way linked list.
        </li>
        <li>Linked list problems train you to change references carefully, in the right order. That skill carries over to all pointer work.</li>
      </ul>
      <Note title="Walking safely">
        <p>
          A walk stops at <code>None</code>. Write it as <code>while cur is not None:</code>. If you check <code>cur.next</code> instead, you must
          first be sure that <code>cur</code> itself is not <code>None</code>, or Python raises <code>AttributeError</code>.
        </p>
      </Note>
    </>
  );
}
