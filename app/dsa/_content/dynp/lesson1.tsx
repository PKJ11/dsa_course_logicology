import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CoinFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Dynamic programming, or DP, solves a problem from the answers to smaller problems of the same kind, and it saves each of those answers
        so that no smaller problem is solved twice. This lesson shows when that works, and how to describe a DP clearly before writing any
        code.
      </p>

      <h2 id="smaller">A problem made of smaller ones</h2>
      <p>
        GRDY-5 showed that greedy change fails with the coins 1, 3 and 4: for 6 it gives 4 + 1 + 1, but 3 + 3 uses fewer coins. To find the true
        fewest number of coins, think about the first coin. It is 1, 3 or 4. Whatever it is, the rest of the coins must make the amount that is
        left, and they should do it with as few coins as possible.
      </p>
      <p>
        Write <M>f(x)</M> for the fewest coins that make the amount x. Then <M>f(0) = 0</M>, and for x &gt; 0, <M>f(x)</M> is 1 plus the
        smallest of the values <M>f(x − c)</M>, over every coin <M>c ≤ x</M>.
      </p>
      <p>
        Why is this right? Take a best way to make x, and remove its first coin c. The coins that are left make <M>x − c</M>. They must be a
        best way to make <M>x − c</M>: if there were a way with fewer coins, putting c in front of it would make x with fewer coins than the
        best way, which is impossible. So the best for x is one coin plus the best for some <M>x − c</M>, and the rule tries every c.
      </p>
      <CodeBlock
        title="fewest_plain.py"
        code={`def f(x, coins=(1, 3, 4)):
    if x == 0:
        return 0
    return 1 + min(f(x - c, coins) for c in coins if c <= x)`}
      />
      <p>This is correct, and very slow. The figure shows why.</p>

      <h2 id="again">The same question again</h2>
      <CoinFigure />
      <p>
        A <strong>subproblem</strong> is a smaller problem of the same kind, such as <M>f(2)</M> inside <M>f(5)</M>. In the first version of the
        figure, the plain recursion asks for <M>f(1)</M> four times and works it out from scratch each time. When the same subproblems come up
        again and again like this, they are called <strong>overlapping subproblems</strong>.
      </p>
      <p>
        The number of calls grows by about 1.38 times for every 1 added to the amount: 15 calls for 5, 168 for 10, 2,550,408 for 30. But the
        number of <em>different</em> questions is only <M>x + 1</M>: the amounts 0 to x. The second version of the figure asks each question
        once, smallest first, and writes the answer in a row. Every answer it needs is already in the row. That is dynamic programming.
      </p>
      <Invariant label="Cost">DP cost = the number of different subproblems × the work for each one.</Invariant>
      <p>
        For the coins that is <M>(x + 1) × k</M> steps for k coin values, or <M>O(x · k)</M>. For an amount of 30 and three coins, about 93
        steps instead of 2.5 million calls.
      </p>

      <h2 id="properties">Two properties</h2>
      <p>DP works when a problem has two properties.</p>
      <ol>
        <li>
          <strong>Optimal substructure.</strong> A best answer to the problem is made of best answers to subproblems. The argument above, with the
          first coin removed, proves this for the coins. It is the step that most needs a proof, because it is not always true.
        </li>
        <li>
          <strong>Overlapping subproblems.</strong> The same subproblems are needed many times. Without this, saving answers does not help.
        </li>
      </ol>
      <p>
        An example without the first property: the <em>longest</em> route between two stations that never visits a station twice. The longest
        route from A to B and the longest route from B to C may pass through the same station, so joining them can break the rule about visiting
        a station twice. A best route is not made of best smaller routes. No DP over the stations works here, and no fast method is known at all
        (HARD).
      </p>
      <p>
        An example without the second property: merge sort. Its two halves are different parts of the list, and no part is ever sorted twice.
        Plain recursion is already efficient, and a store of answers would only use memory. This is the line between divide and conquer (DVCQ)
        and DP.
      </p>
      <p>
        Counting problems, such as the number of ways to make an amount, need a property of the same kind: the ways split into groups that do
        not overlap and leave nothing out (one group for each first coin, say), and each group is counted by a subproblem. Then the count is a
        sum of smaller counts.
      </p>

      <h2 id="recipe">States and rules</h2>
      <p>Every DP in this station is described in the same five steps. Write them down before writing code.</p>
      <ol>
        <li>
          <strong>State.</strong> Say in words what one subproblem is: &ldquo;<M>f(x)</M> = the fewest coins that make x&rdquo;. A vague state is
          the most common cause of a wrong DP.
        </li>
        <li>
          <strong>Rule.</strong> How a state&rsquo;s answer comes from smaller states. Usually: look at the first or the last choice, and try
          every possibility. This rule is also called the <em>recurrence</em>.
        </li>
        <li>
          <strong>Base cases.</strong> The smallest states, answered directly: <M>f(0) = 0</M>.
        </li>
        <li>
          <strong>Order.</strong> Each state must use only states that are &ldquo;smaller&rdquo; in some fixed sense, so that the rule never goes
          round in a circle. Draw each state as a point, with an arrow to each state it uses. The arrows must never form a loop. Such a picture is
          called a <strong>DAG</strong>, a directed acyclic graph: directed because the arrows have a direction, acyclic because there are no
          loops.
        </li>
        <li>
          <strong>Answer.</strong> Which state, or which mix of states, is the answer: here <M>f(amount)</M>.
        </li>
      </ol>
      <p>
        The cost follows from steps 1 and 2: count the states and the work in the rule. Space is the number of states kept, which lesson 3 often
        cuts down.
      </p>
      <Note title="Where the name comes from">
        <p>
          Richard Bellman chose the name in the 1950s. &ldquo;Programming&rdquo; then meant planning with a table, as in a train timetable, not
          writing code; &ldquo;dynamic&rdquo; referred to decisions made in stages. The name says little about the method, which is simply:
          solve each subproblem once and keep the answer.
        </p>
      </Note>

      <h2 id="compare">DP, greedy, divide and conquer</h2>
      <div className="tt-wrap">
      <table className="tt">
        <caption className="visually-hidden">Greedy, divide and conquer and dynamic programming compared</caption>
        <thead>
          <tr>
            <th>Method</th>
            <th>Subproblems</th>
            <th>Choices</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Greedy (GRDY)</td>
            <td>One, after one fixed choice</td>
            <td>Makes one choice and never looks back; needs a proof that it is safe</td>
          </tr>
          <tr>
            <td>Divide and conquer (DVCQ)</td>
            <td>Separate parts that do not overlap</td>
            <td>Usually none: the split is fixed</td>
          </tr>
          <tr>
            <td>Dynamic programming</td>
            <td>Many, shared by many choices</td>
            <td>Tries every choice, but solves each subproblem once</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p>
        So DP is a careful search of every choice, made fast by sharing. When a greedy rule can be proved, it is usually faster still; when it
        cannot, DP is the next tool to try. The next two lessons show the two ways to share answers: keep the recursion and remember answers
        (lesson 2), or fill a table with loops (lesson 3).
      </p>
      <p>
        Now try <Link href="/dsa/dynp/practice/1/">DYNP-P1, Shapes of a search tree</Link>.
      </p>
    </>
  );
}
