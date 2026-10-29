import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { ScanFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Brackets come in pairs, and the pair opened last must be closed first. That is exactly the stack rule. The same idea lets a program work out
        the value of a sum like 5 + (1 + 2) × 4 in one pass.
      </p>

      <h2 id="brackets">Matching brackets</h2>
      <p>
        Text is <em>balanced</em> if every opening bracket <code>( [ {"{"}</code> has a matching closing bracket <code>) ] {"}"}</code> after it, and
        pairs do not cross. <code>{"{[()()]}"}</code> is balanced. <code>([)]</code> is not: the <code>)</code> closes the <code>(</code> while the{" "}
        <code>[</code> inside it is still open.
      </p>
      <p>Read the text from left to right with a stack:</p>
      <ul>
        <li>An opening bracket: push it.</li>
        <li>
          A closing bracket: the stack must not be empty, and its top must be the matching opening bracket. If so, pop it. If not, stop: the text is
          not balanced.
        </li>
        <li>At the end: the stack must be empty. Anything left was opened and never closed.</li>
      </ul>

      <ScanFigure />

      <p>The step for a closing bracket is the one that needs care. A dict gives the opening bracket that each closing bracket needs:</p>
      <CodeBlock
        code={`pair = {')': '(', ']': '[', '}': '{'}

# c is a closing bracket
if not stack or stack.pop() != pair[c]:
    return False      # nothing is open, or the wrong kind is`}
      />
      <p>
        <code>not stack</code> is checked first, so <code>pop()</code> never runs on an empty stack. After the loop, return{" "}
        <code>not stack</code>: the text is balanced only if nothing is left open. STAQ-P1 asks you to put the whole function together.
      </p>
      <p>
        Each character is pushed at most once and popped at most once, so the time is <M>O(n)</M> for a text of <M>n</M> characters. The stack can
        hold up to <M>n</M> items, when every character opens a bracket.
      </p>

      <h2 id="why">Why a stack fits this job</h2>
      <p>
        Counting is not enough. Counting opens and closes of each kind would accept <code>([)]</code>, which has one of each. The order matters:
        a closing bracket must match the most recent bracket that is still open. &ldquo;Most recent still open&rdquo; is the top of a stack.
      </p>
      <p>
        If the text has only one kind of bracket, a single counter does work: add 1 for <code>(</code>, take 1 for <code>)</code>, and the count
        must never go below 0 and must end at 0. A counter is a stack whose items are all the same, so only its size matters.
      </p>

      <h2 id="postfix">Postfix expressions</h2>
      <p>
        In normal writing an operator sits between its two numbers: <code>1 + 2</code>. In <em>postfix</em> it comes after them: <code>1 2 +</code>.
        Postfix needs no brackets and no rules about which operator goes first. <code>5 1 2 + 4 * + 3 -</code> means 5 + (1 + 2) × 4 − 3, which is
        14.
      </p>
      <p>
        To work out a postfix expression, push each number. When an operator arrives, pop two numbers, apply the operator, and push the result.
        At the end, the one number left is the answer. Switch the figure above to &ldquo;Postfix sum&rdquo; to watch.
      </p>
      <Note title="Pop order matters" warn>
        <p>
          The first number you pop is the <em>right-hand</em> one. For <code>10 3 -</code>, you pop 3, then 10, and compute 10 − 3. Getting this
          backwards breaks <code>-</code> and <code>/</code>, but not <code>+</code> or <code>*</code>, so test with subtraction.
        </p>
      </Note>

      <h2 id="infix">From normal order to postfix</h2>
      <p>
        Calculators and compilers read normal (infix) expressions by turning them into postfix first. The usual method is Dijkstra&rsquo;s{" "}
        <em>shunting-yard</em> algorithm. It uses a stack for operators:
      </p>
      <ul>
        <li>A number goes straight to the output.</li>
        <li>
          An operator first pops to the output every operator on the stack that should be done before it (a stronger one, like <code>*</code> over{" "}
          <code>+</code>, or an equal one, since <code>-</code> and <code>/</code> work left to right). Then it is pushed.
        </li>
        <li>
          <code>(</code> is pushed. <code>)</code> pops operators to the output until the matching <code>(</code>, which is thrown away.
        </li>
        <li>At the end, pop everything left to the output.</li>
      </ul>
      <p>
        For <code>5 + (1 + 2) * 4</code> the output is <code>5 1 2 + 4 * +</code>. Each token is pushed and popped at most once, so this is also{" "}
        <M>O(n)</M>.
      </p>
      <p>
        Now try <Link href="/dsa/staq/practice/1/">STAQ-P1, Brackets in order</Link> and{" "}
        <Link href="/dsa/staq/practice/2/">STAQ-P2, The postfix calculator</Link>.
      </p>
    </>
  );
}
