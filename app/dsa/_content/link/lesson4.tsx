import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ReverseFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        To reverse a linked list, you do not move any values. You turn every <code>next</code> reference round, so that it points to the node
        before. It is the standard practice task for changing references in the right order.
      </p>

      <h2 id="three">Three names: prev, cur, nxt</h2>
      <p>
        Walk along the list once. At each node, point its <code>next</code> back at the node before it. To do this you need three names:
      </p>
      <ul>
        <li>
          <code>cur</code>: the node you are working on.
        </li>
        <li>
          <code>prev</code>: the node before it, which <code>cur.next</code> should now point to.
        </li>
        <li>
          <code>nxt</code>: the node after it. You must save this before you change <code>cur.next</code>, because <code>cur.next</code> is the
          only reference to the rest of the list.
        </li>
      </ul>
      <p>Step through it, then try the version that forgets to save the next node:</p>

      <ReverseFigure />

      <h2 id="proof">Why it is correct</h2>
      <p>The loop keeps one fact true at the start of every pass:</p>
      <Invariant>
        prev is the head of the reversed part, and cur is the head of the part still to do. Together they hold every node once.
      </Invariant>
      <ul>
        <li>
          <strong>At the start:</strong> nothing is reversed (<code>prev</code> is None) and everything is still to do (<code>cur</code> is the
          head). The fact is true.
        </li>
        <li>
          <strong>Each pass:</strong> one node moves from the front of the to-do part to the front of the reversed part. Its <code>next</code> now
          points to the old <code>prev</code>, which is exactly what the reversed part needs. <code>nxt</code> keeps the to-do part reachable. The
          fact stays true.
        </li>
        <li>
          <strong>At the end:</strong> <code>cur</code> is None, so the to-do part is empty, and <code>prev</code> is the head of the whole reversed
          list. Return it.
        </li>
      </ul>
      <p>
        Each node is handled once, with a fixed amount of work, so the time is <M>O(n)</M>. Only three names are used, whatever the length, so the
        extra space is <M>O(1)</M>. This is called reversing <em>in place</em>.
      </p>

      <h2 id="recursive">The recursive version</h2>
      <p>Reversing also has a short recursive form. Let the recursive call reverse the rest of the list. Then attach the first node at the end:</p>
      <CodeBlock
        code={`def reverse(head):
    if head is None or head.next is None:
        return head
    new_head = reverse(head.next)   # the rest, reversed
    head.next.next = head           # the old second node now points back at head
    head.next = None
    return new_head`}
      />
      <p>
        <code>head.next</code> still refers to the old second node, which is now the <em>last</em> node of the reversed rest. So{" "}
        <code>head.next.next = head</code> puts <code>head</code> after it.
      </p>
      <Note title="Too deep for long lists" warn>
        <p>
          The recursion goes one call deeper for every node. Python stops at about 1,000 calls (RECR-2), so this version fails with{" "}
          <code>RecursionError</code> on a list of a few thousand nodes. It also uses <M>O(n)</M> space for the calls. Use the loop.
        </p>
      </Note>

      <h2 id="part">Reversing part of a list</h2>
      <p>
        A common variation is to reverse only the nodes from position <code>left</code> to position <code>right</code>, leaving the rest in place.
        It needs two extra references:
      </p>
      <ul>
        <li>
          the node just <em>before</em> the part, so it can be pointed at the part&rsquo;s new first node. A dummy node (lesson 2) makes sure this
          node exists even when <code>left</code> is 1;
        </li>
        <li>
          the part&rsquo;s old first node. After the reversal it is the part&rsquo;s last node, and it must point to the node just{" "}
          <em>after</em> the part.
        </li>
      </ul>
      <p>
        In between, run the same loop as above, but only <code>right - left + 1</code> times. Draw the four nodes on paper before you code: the one
        before, the first and last of the part, and the one after.
      </p>
      <p>
        Now try <Link href="/dsa/link/practice/3/">LINK-P3, Reverse a section</Link>, then{" "}
        <Link href="/dsa/link/practice/4/">LINK-P4, Turn each group round</Link>, which reverses every group of <M>k</M> nodes.
      </p>
    </>
  );
}
