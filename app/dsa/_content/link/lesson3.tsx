import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { TwoWayFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A one-way list can only be walked forwards, and to delete a node you need the node before it. Give each node a second reference, to the node
        before it. Then you can walk both ways, and delete a node without the one before it.
      </p>

      <h2 id="prev">A second reference: prev</h2>
      <p>
        In a <em>doubly linked list</em> (a two-way list), each node has <code>next</code> and also <code>prev</code>. The first node&rsquo;s{" "}
        <code>prev</code> is <code>None</code>, and so is the last node&rsquo;s <code>next</code>.
      </p>
      <CodeBlock
        code={`class Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None`}
      />
      <p>
        Now a node knows both its neighbours. If you hold a reference to a node, you can remove it in <M>O(1)</M> without any walk: tell its two
        neighbours to point past it. Step through it:
      </p>

      <TwoWayFigure />

      <p>
        Every change now touches two references for each link, one in each direction. Inserting a node between <code>a</code> and{" "}
        <code>b</code> sets four: the new node&rsquo;s <code>prev</code> and <code>next</code>, then <code>a.next</code> and <code>b.prev</code>. The
        rule from lesson 2 still holds: set the new node&rsquo;s own references first, while <code>a</code> and <code>b</code> still point to each
        other.
      </p>

      <h2 id="sentinels">Sentinel nodes at both ends</h2>
      <p>
        The removal code above fails at the ends: if <code>node</code> is the first node, <code>node.prev</code> is <code>None</code>, and{" "}
        <code>None.next</code> raises an error. The fix is the dummy node from lesson 2, now at both ends. Two extra nodes, often called{" "}
        <em>sentinels</em>, sit before the first real node and after the last one, and they are never removed:
      </p>
      <CodeBlock
        code={`class Line:
    def __init__(self):
        self.front = Node(None)       # sentinel before the first real node
        self.back = Node(None)        # sentinel after the last real node
        self.front.next = self.back
        self.back.prev = self.front

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
        return node.value`}
      />
      <p>
        Every real node now has a real node or a sentinel on each side, so <code>_remove</code> works for every real node with no checks. To add
        a value, insert a new node between two nodes as above, setting its own two references first. Adding at the front means inserting
        between <code>front</code> and <code>front.next</code>; adding at the back means inserting between <code>back.prev</code> and{" "}
        <code>back</code>. The list is empty exactly when <code>front.next is back</code>.
      </p>

      <h2 id="circular">Circular lists</h2>
      <p>
        In a <em>circular list</em>, the last node&rsquo;s <code>next</code> refers back to the first node instead of <code>None</code>. There is
        no end, so a walk must decide when to stop: usually when it comes back to the node it started from. The figure&rsquo;s second version
        shows this.
      </p>
      <p>
        Circular lists suit things that take turns over and over, such as players in a game or jobs that share a processor. If you keep a reference
        to the <em>last</em> node, you have both ends at once: the first node is <code>last.next</code>. The sentinel version above becomes circular in
        the same way if one sentinel is used as both the front and the back.
      </p>
      <Note title="Compare nodes with is" warn>
        <p>
          To check &ldquo;is this the node I started at?&rdquo;, write <code>cur is start</code>. <code>==</code> asks whether two objects are
          equal, and two different nodes may hold the same value.
        </p>
      </Note>

      <h2 id="deque">How Python&rsquo;s deque is built</h2>
      <p>
        <code>collections.deque</code> (say &ldquo;deck&rdquo;, short for double-ended queue) adds and removes at both ends in <M>O(1)</M>. Inside,
        it is a two-way linked list. But each node does not hold one item: it holds a block of 64 items. This keeps most of the speed of a list,
        because items sit close together, and keeps the <M>O(1)</M> ends of a linked list.
      </p>
      <p>
        The cost is in the middle: <code>d[k]</code> must skip whole blocks to reach item <M>k</M>, so it is <M>O(n)</M> in the worst case, not{" "}
        <M>O(1)</M>. Use a deque for work at the ends. STAQ-3 uses it as a queue.
      </p>
      <p>
        Now try <Link href="/dsa/link/practice/2/">LINK-P2, A two-way line</Link>.
      </p>
    </>
  );
}
