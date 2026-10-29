import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ChoiceFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Some problems ask for every possible choice: every group of items, or every order of them. Recursion builds these one decision at a
        time, and the calls form a decision tree with one answer at each leaf.
      </p>

      <h2 id="subsets">Subsets: take it or skip it</h2>
      <p>
        A <em>subset</em> of a list is any selection of its items, from none to all. For each item there are exactly two choices: take it or skip it.
        A recursive function makes the choice for item <M>i</M>, then calls itself for item <M>i + 1</M>.
      </p>
      <p>
        Keep the items chosen so far in one list, <code>chosen</code>. A helper <code>go(i)</code> makes the choice for item <M>i</M>. Here is that
        choice:
      </p>
      <CodeBlock
        code={`chosen.append(items[i])      # take items[i]
go(i + 1)
chosen.pop()                 # undo the choice
go(i + 1)                    # skip items[i]`}
      />
      <p>
        When <M>i</M> reaches the number of items, every item has been decided: record a copy of <code>chosen</code> and return. Writing the whole
        function is <Link href="/dsa/recr/practice/3/">RECR-P3</Link>.
      </p>

      <ChoiceFigure />

      <h2 id="pattern">Choose, explore, undo</h2>
      <p>
        <code>chosen</code> is one shared list. Every call adds to it before going deeper, and removes the same item after coming back. This
        pattern is called <em>backtracking</em>:
      </p>
      <Invariant>When go(i) returns, chosen is exactly as it was when go(i) was called.</Invariant>
      <p>
        Two details matter. Record <code>chosen[:]</code>, a copy: <code>chosen</code> itself keeps changing, and storing it would store the same list
        many times. And every <code>append</code> must have a matching <code>pop</code> on every path, or the choices from one branch are still in
        <code>chosen</code> when the next branch starts.
      </p>

      <h2 id="perms">Orders: pick an unused item</h2>
      <p>
        An order of all the items is called a <em>permutation</em>. To build one, fill the first place with any item, the second with any item not
        yet used, and so on. Keep a record of which items are used. Step through the second version of the figure.
      </p>
      <p>
        A list <code>used</code> of True and False values records which items are already placed. One call fills the next place: it tries every
        item that is not used yet, and undoes each try before the next one.
      </p>
      <CodeBlock
        code={`for i in range(len(items)):
    if not used[i]:
        used[i] = True
        chosen.append(items[i])
        go()                  # fill the next place
        chosen.pop()          # undo, in reverse order
        used[i] = False`}
      />
      <p>
        When <code>chosen</code> holds every item, record a copy of it and return. Writing the whole function is{" "}
        <Link href="/dsa/recr/practice/4/">RECR-P4</Link>.
      </p>

      <h2 id="counting">How many answers</h2>
      <ul>
        <li>
          Subsets: 2 choices for each of <M>n</M> items, so <M>2ⁿ</M> subsets (n twos multiplied together).
        </li>
        <li>
          Orders: <M>n</M> choices for the first place, <M>n − 1</M> for the second, and so on, so <M>n! = n × (n − 1) × … × 1</M>, read &ldquo;n factorial&rdquo;.
        </li>
        <li>
          Choosing <M>k</M> of <M>n</M> items, ignoring order: <M>C(n, k) = n! / (k! (n − k)!)</M>. In the subset tree, stop taking items once you
          have <M>k</M>.
        </li>
      </ul>
      <p>
        Each answer takes <M>O(n)</M> to copy, so listing all subsets takes time in proportion to <M>n × 2ⁿ</M>, written <M>O(n × 2ⁿ)</M>, and all orders <M>O(n × n!)</M>. Nothing can do better
        when you must list them all, because the output itself is that big. From <BIGO3 />, that means <M>n</M> of about 20 at most for subsets, and{" "}
        about 9 at most for orders.
      </p>
      <Note title="Python's own tools">
        <p>
          <code>itertools.combinations</code>, <code>itertools.permutations</code> and <code>itertools.product</code> do these jobs in C. Use them in
          real code. Build them by hand first, because the hand-built version is the one you can change: add a rule, cut a branch, or stop
          early (lesson 5).
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/recr/practice/3/">RECR-P3, Every group of coaches</Link> and{" "}
        <Link href="/dsa/recr/practice/4/">RECR-P4, Every running order</Link>.
      </p>
    </>
  );
}

function BIGO3() {
  return <Link href="/dsa/bigo/3/#table">BIGO-3</Link>;
}
