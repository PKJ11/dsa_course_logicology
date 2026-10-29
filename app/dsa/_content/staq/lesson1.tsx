import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { StackFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A stack is a pile of items where you can only reach the top one. You add to the top and take from the top. So the last item in is the
        first item out. This one rule turns out to fit a surprising number of problems.
      </p>

      <h2 id="stack">What a stack is</h2>
      <p>A stack has three operations:</p>
      <ul>
        <li>
          <strong>push:</strong> put an item on top;
        </li>
        <li>
          <strong>pop:</strong> take the top item off and give it back;
        </li>
        <li>
          <strong>peek:</strong> look at the top item without taking it off.
        </li>
      </ul>
      <p>
        There is no way to reach an item lower down, except by popping everything above it. This rule is called <em>last in, first out</em>, or
        LIFO for short.
      </p>
      <Invariant label="Rule">The item you pop is always the one pushed most recently, among those still on the stack.</Invariant>

      <h2 id="list">A Python list is a stack</h2>
      <p>
        Python has no separate stack class, because a list already works as one. Treat the <em>end</em> of the list as the top: <code>append</code>{" "}
        pushes, <code>pop()</code> pops, and <code>stack[-1]</code> peeks. Step through a short run:
      </p>

      <StackFigure />

      <p>
        All three operations work at the end of the list, so no other item moves. Each one is <M>O(1)</M>. (<code>append</code> is <M>O(1)</M> on
        average: once in a while the list grows its block of memory, as BIGO-7 and ARRS-1 showed.)
      </p>
      <Note title="Use the end, not the front" warn>
        <p>
          <code>insert(0, x)</code> and <code>pop(0)</code> also give you a stack, with the front of the list as the top. But every other item must
          move one place each time, so each call is <M>O(n)</M>. Always use the end.
        </p>
      </Note>

      <h2 id="uses">Where stacks appear</h2>
      <ul>
        <li>
          <strong>Undo:</strong> each change is pushed. Undo pops the most recent one.
        </li>
        <li>
          <strong>Function calls:</strong> Python keeps a stack of calls that have started but not finished (RECR-2). The function running now is
          on top.
        </li>
        <li>
          <strong>Nesting:</strong> brackets, tags in a web page, folders inside folders. The thing that was opened last must be closed first
          (lesson 2).
        </li>
        <li>
          <strong>Going back:</strong> a search that tries a path, and goes back one step when it cannot go on (depth-first search, in GRPH), keeps the
          path on a stack.
        </li>
      </ul>
      <p>
        A good sign that a stack fits: you need to come back to things in the reverse of the order you met them.
      </p>

      <h2 id="empty">The empty stack</h2>
      <p>
        <code>pop()</code> and <code>stack[-1]</code> on an empty list raise <code>IndexError</code>. Most stack bugs are one of these. Check first,
        using the fact that an empty list counts as false:
      </p>
      <CodeBlock
        code={`if stack:                # not empty
    top = stack.pop()
else:
    ...                  # decide what an empty stack means here`}
      />
      <p>
        Often the empty case is an answer, not an error. In lesson 2, a closing bracket that arrives when the stack is empty means the text is not
        balanced.
      </p>
    </>
  );
}
