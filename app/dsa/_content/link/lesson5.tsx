import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RunnersFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Two names walk along the same list at different speeds. The gap between them tells you things that one walk alone cannot: where the middle
        is, and whether the list goes round in a loop.
      </p>

      <h2 id="middle">The middle node</h2>
      <p>
        To find the middle node, you could count the nodes, then walk half that many. That is two walks. With two names you need only one:{" "}
        <code>slow</code> moves one node per pass and <code>fast</code> moves two. When <code>fast</code> reaches the end, <code>slow</code> has
        gone half as far.
      </p>
      <CodeBlock
        code={`slow = fast = head
while fast is not None and fast.next is not None:
    slow = slow.next
    fast = fast.next.next
return slow`}
      />
      <p>
        The loop checks <code>fast.next</code> as well as <code>fast</code>, because <code>fast</code> takes two steps at once and must not step
        off the end. With an even number of nodes, <code>slow</code> stops on the second of the two middle nodes. To stop on the first, start{" "}
        <code>fast</code> at <code>head.next</code>.
      </p>

      <RunnersFigure />

      <h2 id="loop">Does the list have a loop?</h2>
      <p>
        A bug, or bad input, can make a list&rsquo;s last node point back to an earlier node. Then the list has a <em>loop</em> (also called a
        cycle), and a walk that waits for <code>None</code> never ends. How can you tell, without storing every node you have seen?
      </p>
      <p>
        Run <code>slow</code> and <code>fast</code> as before. If there is no loop, <code>fast</code> reaches <code>None</code>. If there is a
        loop, both names end up going round it, and <code>fast</code> catches <code>slow</code> from behind. Switch the figure to &ldquo;Find a
        loop&rdquo; to watch.
      </p>
      <CodeBlock
        code={`slow = fast = head
while fast is not None and fast.next is not None:
    slow, fast = slow.next, fast.next.next
    if slow is fast:
        return True      # they met: there is a loop
return False             # fast reached the end: no loop`}
      />
      <p>
        Why must they meet, and not jump past each other? Once both are in the loop, look at how many nodes <code>fast</code> is behind{" "}
        <code>slow</code>. Each pass, <code>slow</code> moves 1 and <code>fast</code> moves 2, so the gap shrinks by exactly 1. A gap that shrinks
        by 1 each time cannot skip over 0. It reaches 0 within one trip round the loop.
      </p>
      <p>
        So the number of passes is at most the number of nodes before the loop, plus the loop&rsquo;s length: <M>O(n)</M> time. Only two names
        are stored: <M>O(1)</M> space. Storing every visited node in a set also works in <M>O(n)</M> time, but needs <M>O(n)</M> space. This
        method is known as Floyd&rsquo;s cycle detection, after Robert Floyd.
      </p>

      <h2 id="start">Where the loop starts</h2>
      <p>
        After they meet, put a new name <code>p</code> at the head. Move <code>p</code> and <code>slow</code> one node at a time. They meet exactly
        at the first node of the loop.
      </p>
      <p>
        Here is why. Call the number of nodes before the loop <M>a</M>, and the length of the loop <M>L</M>.
      </p>
      <ul>
        <li>
          When the two names met, <code>slow</code> had taken some number of steps, call it <M>s</M>. <code>fast</code> had taken <M>2s</M>, twice as many.
        </li>
        <li>
          <code>fast</code> took <M>s</M> more steps than <code>slow</code> and ended on the same node. Those extra steps were whole trips round
          the loop. So <M>s</M> is a whole number of loop lengths: <M>s = kL</M>, which means <M>k</M> times <M>L</M>, for some whole number <M>k</M>.
        </li>
        <li>
          Now <code>p</code> walks <M>a</M> steps from the head and arrives at the loop&rsquo;s first node. In the same time, <code>slow</code> has
          taken <M>s + a</M> steps in total. That is <M>a</M> steps to reach the loop, plus <M>kL</M> steps, which is whole trips round it. So{" "}
          <code>slow</code> is also at the loop&rsquo;s first node.
        </li>
      </ul>
      <Invariant label="Rule">After the meeting, the head and the meeting point are the same number of steps from the start of the loop.</Invariant>
      <p>
        So the code has two parts. The first is the meeting loop from above. When <code>slow is fast</code>, start the second part: put{" "}
        <code>p</code> at the head, and move <code>p</code> and <code>slow</code> one node at a time while <code>p is not slow</code>. Where they
        stop is the first node of the loop. If <code>fast</code> reaches the end instead, there is no loop. LINK-P5 asks you to write both parts.
      </p>

      <h2 id="gap">A fixed gap: k-th from the end</h2>
      <p>
        The two names can also keep a fixed gap instead of different speeds. To find the <M>k</M>-th node from the end in one walk, move{" "}
        <code>fast</code> <M>k</M> nodes ahead first. Then move both one node at a time. When <code>fast</code> reaches <code>None</code>,{" "}
        <code>slow</code> is <M>k</M> nodes from the end.
      </p>
      <Note title="Use is to compare nodes">
        <p>
          Write <code>slow is fast</code>. You are asking whether they are the same node, not whether they hold equal values.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/link/practice/5/">LINK-P5, Where the loop starts</Link>.
      </p>
    </>
  );
}
