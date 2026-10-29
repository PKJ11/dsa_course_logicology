import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { InsertFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Changing a linked list means changing a few <code>next</code> references. Each change is quick. The hard part is doing the changes in the
        right order, so that no part of the list is lost on the way.
      </p>

      <h2 id="insert">Insert after a node</h2>
      <p>
        Say <code>cur</code> refers to a node, and you want a new node just after it. Two references must change: the new node must point to
        whatever came after <code>cur</code>, and <code>cur</code> must point to the new node.
      </p>
      <p>
        The order matters. <code>cur.next</code> is the only reference to the rest of the list. If you change it first, the rest is gone. So first
        let the new node take a copy of that reference, then change <code>cur.next</code>. Step through both orders:
      </p>

      <InsertFigure />

      <Invariant label="Rule">Before you change a reference, make sure something else still refers to what it pointed to.</Invariant>
      <p>
        Neither order needs a loop, so insertion after a node you hold is <M>O(1)</M>, however long the list is. Finding that node in the first
        place may take a walk, which is <M>O(n)</M>.
      </p>

      <h2 id="delete">Delete after a node</h2>
      <p>
        To delete a node, make the node <em>before</em> it skip over it: <code>cur.next = cur.next.next</code>. The deleted node is still in memory
        for a moment, but nothing refers to it. Python counts references to every object, and when the count reaches zero it frees the object. You
        never free a node yourself.
      </p>
      <p>
        Note that you need the node before the one you delete. In a one-way list, a node does not know what comes before it. This is why a walk
        that deletes usually looks one node ahead:
      </p>
      <CodeBlock
        code={`cur = head
while cur.next is not None:
    if cur.next.value == x:
        cur.next = cur.next.next    # delete; do not move on yet
    else:
        cur = cur.next`}
      />
      <p>
        After a delete, <code>cur</code> stays where it is, because its new <code>next</code> has not been checked yet. Moving on would skip it.
        If two nodes in a row hold <code>x</code>, that skip would leave the second one in the list.
      </p>

      <h2 id="head">The head is a special case</h2>
      <p>
        The code above never checks the head itself, because the head has no node before it. Deleting the head means changing the name{" "}
        <code>head</code>, not a <code>next</code> reference:
      </p>
      <CodeBlock
        code={`while head is not None and head.value == x:
    head = head.next
# ...then the loop above, starting at the new head`}
      />
      <p>
        This works, but it is two pieces of code for one job. Inserting at the front has the same problem. Special cases like this are where most
        linked list bugs come from.
      </p>

      <h2 id="dummy">A dummy node removes it</h2>
      <p>
        The fix is to put an extra node in front of the head. It holds no real value. It is called a <em>dummy</em> node (or a sentinel). Now every
        real node, the head included, has a node before it, so one loop handles all of them. The walk starts at the dummy:
      </p>
      <CodeBlock
        code={`dummy = Node(None, head)    # holds no real value
cur = dummy                 # start one node before the head`}
      />
      <p>
        Then run the delete loop from above. At the end, return <code>dummy.next</code>, not the old <code>head</code>: if the old head was
        deleted, <code>dummy.next</code> is the new one. The dummy node costs one extra object, and the head is no longer a special case. Lesson 6
        uses a dummy node again, to build a new list.
      </p>
      <Note title="Check these cases every time">
        <ul>
          <li>The list is empty: the head is <code>None</code>.</li>
          <li>The list has one node.</li>
          <li>The change happens at the head, or at the last node.</li>
          <li>The same value appears twice in a row.</li>
        </ul>
      </Note>
      <p>
        Now try <Link href="/dsa/link/practice/1/">LINK-P1, Remove a station</Link>.
      </p>
    </>
  );
}
