import { CodeBlock } from "../../_components/Code";
import { Note } from "../../_components/Prose";
import { NodeFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Linked lists, trees and graphs are built from small objects that refer to each other. This lesson shows how to make such objects in
        Python with a class.
      </p>

      <h2 id="class">A class is a new kind of value</h2>
      <p>
        Python has built-in kinds of value: numbers, strings, lists. A <em>class</em> lets you define a new kind. Each value made from a class is
        called an <em>object</em>, and each object has its own named parts, called <em>attributes</em>.
      </p>
      <CodeBlock
        code={`class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(2, 5)
p.x          # 2
p.y = 7      # attributes can be changed`}
      />
      <p>
        <code>Point(2, 5)</code> makes a new object and then runs <code>__init__</code> on it. Inside the class, <code>self</code> is the object being
        set up. So <code>self.x = x</code> stores the value of <code>x</code> in the new object.
      </p>

      <h2 id="node">A node class</h2>
      <p>
        A <em>node</em> is an object that holds a value and a reference to another node. Joining nodes this way makes a chain, called a linked
        list. The last node refers to <code>None</code>, which marks the end.
      </p>
      <p>
        Step through the figure. It builds three nodes, then visits them in order. Each box is a node: the value on the left, and on the right a
        dot with an arrow for <code>next</code>. The tags under the nodes show which node each name refers to.
      </p>

      <NodeFigure />

      <h2 id="references">Names refer to objects</h2>
      <p>
        Just as with lists, a name refers to an object; it does not contain it. <code>cur = head</code> makes <code>cur</code> refer to the same node
        as <code>head</code>. Moving <code>cur</code> later does not move <code>head</code>. But changing an attribute through either name changes the
        one shared object:
      </p>
      <CodeBlock
        code={`cur = head
cur.value = 99
print(head.value)     # 99: same node

cur = cur.next        # cur moves on
print(head.value)     # still 99: head did not move`}
      />
      <p>
        Use <code>is</code> to ask whether two names refer to the same object, and <code>is None</code> to test for the end of a chain.{" "}
        <code>==</code> asks a different question: whether two values are equal.
      </p>

      <h2 id="walking">Walking along the nodes</h2>
      <p>Every linked structure in the course uses this loop. Learn how it is written:</p>
      <CodeBlock
        code={`def to_list(head):
    out = []
    cur = head
    while cur is not None:
        out.append(cur.value)
        cur = cur.next
    return out`}
        mark={[6]}
      />
      <Note title="Forgetting to move on" warn>
        <p>
          If you leave out line 6, <code>cur</code> never changes, and the loop runs forever. If you write <code>head = head.next</code> instead of
          using a second name, you lose your only way back to the first node.
        </p>
      </Note>

      <h2 id="repr">Printing your objects</h2>
      <p>
        By default, <code>print(node)</code> shows something like <code>&lt;Node object at 0x7f…&gt;</code>, which does not help. Define{" "}
        <code>__repr__</code> to choose what is shown:
      </p>
      <CodeBlock
        code={`class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

    def __repr__(self):
        return f"Node({self.value})"

print(Node(3))      # Node(3)`}
      />
      <p>
        The <code>f&quot;…&quot;</code> is an f-string. Python replaces anything in curly brackets with its value. Here <code>__init__</code> also has a
        default for <code>next</code>, so <code>Node(3, other)</code> makes a node that points to <code>other</code> in one step.
      </p>
    </>
  );
}
