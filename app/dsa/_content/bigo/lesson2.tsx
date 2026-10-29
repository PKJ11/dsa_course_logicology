import { M, Note } from "../../_components/Prose";
import { BoundFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Exact step counts are long and hard to compare. Big-O keeps only the part of the count that matters for large inputs: how fast it
        grows. This lesson gives the exact definitions, because you will need them to prove costs, not just guess them.
      </p>

      <h2 id="idea">Keep only the part that grows fastest</h2>
      <p>
        Suppose a program takes <M>3n² + 10n + 50</M> steps. For <M>n = 1,000</M>, the <M>3n²</M> part is 3,000,000, the <M>10n</M> part is
        10,000 and the 50 is just 50. As <M>n</M> grows, the <M>n²</M> part matters more and more, and the rest matters less and less.
      </p>
      <p>
        The number 3 in front also matters less than it looks. It changes with the computer and the language. What does not change is the
        shape: double <M>n</M>, and <M>n²</M> grows four times. So we say the program takes <M>O(n²)</M> time, read as &ldquo;order n
        squared&rdquo;.
      </p>

      <h2 id="bigo">Big-O: an upper bound</h2>
      <p>
        Let <M>f(n)</M> be the number of steps, and <M>g(n)</M> a simple function such as <M>n</M> or <M>n²</M>.
      </p>
      <Note title="Definition">
        <p>
          <M>f(n)</M> is <M>O(g(n))</M> if there are two fixed numbers, <M>c &gt; 0</M> and <M>n₀</M>, such that <M>f(n) ≤ c × g(n)</M> for every{" "}
          <M>n ≥ n₀</M>.
        </p>
      </Note>
      <p>
        In words: from some size <M>n₀</M> on, <M>f</M> is never more than a fixed multiple of <M>g</M>. What happens for small <M>n</M> does not
        matter. To prove a Big-O claim, you find a <M>c</M> and an <M>n₀</M> that work. Step through the figure to try three choices.
      </p>

      <BoundFigure />

      <p>
        The second choice shows something important. With <M>c = 3</M>, the bound never holds. That does not mean the claim is false. It only
        means that <M>c</M> was too small. You only need <strong>one</strong> pair <M>c</M>, <M>n₀</M> that works.
      </p>

      <h2 id="omega">Ω and Θ</h2>
      <p>Big-O says &ldquo;at most&rdquo;. Two related words say &ldquo;at least&rdquo; and &ldquo;exactly&rdquo;:</p>
      <ul>
        <li>
          <strong>Ω (big omega), a lower bound.</strong> <M>f(n)</M> is <M>Ω(g(n))</M> if <M>f(n) ≥ c × g(n)</M> for all <M>n ≥ n₀</M>, for some{" "}
          <M>c &gt; 0</M>.
        </li>
        <li>
          <strong>Θ (big theta), a tight bound.</strong> <M>f(n)</M> is <M>Θ(g(n))</M> if it is both <M>O(g(n))</M> and <M>Ω(g(n))</M>. It grows at
          exactly the rate of <M>g</M>, up to a constant.
        </li>
      </ul>
      <p>
        <M>3n + 5</M> is <M>O(n)</M>, <M>O(n²)</M> and <M>O(2ⁿ)</M>: all three are true, because Big-O is only an upper bound. But it is{" "}
        <M>Θ(n)</M> only. When people say &ldquo;this is O(n)&rdquo; they usually mean <M>Θ(n)</M>. In this course we say Θ when the bound is
        tight and it matters.
      </p>
      <p>
        These bounds describe a <em>function</em>, not a case. &ldquo;The worst case is <M>Θ(n)</M>&rdquo; and &ldquo;the best case is{" "}
        <M>Θ(1)</M>&rdquo; are both true of a linear search. <M>Θ(1)</M> means a constant number of steps, whatever <M>n</M> is.
      </p>

      <h2 id="rules">Rules for working it out</h2>
      <p>Each rule below follows from the definition. Together they cover almost every program you will meet.</p>
      <ol>
        <li>
          <strong>Drop constant factors.</strong> <M>5n</M> is <M>Θ(n)</M>. Take <M>c = 5</M>.
        </li>
        <li>
          <strong>Keep only the biggest term.</strong> <M>n² + 100n</M> is <M>Θ(n²)</M>, because <M>100n ≤ n²</M> once <M>n ≥ 100</M>, so the total
          is at most <M>2n²</M> from there on.
        </li>
        <li>
          <strong>Steps one after another add.</strong> <M>O(n) + O(n²)</M> is <M>O(n²)</M>.
        </li>
        <li>
          <strong>Nested work multiplies.</strong> A loop of <M>n</M> passes that does <M>O(log n)</M> work in each pass is <M>O(n log n)</M>.
        </li>
        <li>
          <strong>The base of a log does not matter.</strong> <M>log₂ n</M> and <M>log₁₀ n</M> differ by a fixed factor of about 3.3, so both are{" "}
          <M>Θ(log n)</M>.
        </li>
      </ol>

      <h2 id="traps">Common mistakes</h2>
      <ul>
        <li>
          <strong>Two different sizes.</strong> A loop over a list of length <M>n</M> inside a loop over a list of length <M>m</M> is{" "}
          <M>O(n × m)</M>, not <M>O(n²)</M>. Keep both letters.
        </li>
        <li>
          <strong>Big-O is not speed on small inputs.</strong> An <M>O(n)</M> method with a large constant can be slower than an{" "}
          <M>O(n²)</M> one for <M>n = 20</M>. Big-O only says which is smaller for large <M>n</M>.
        </li>
        <li>
          <strong>Hidden loops.</strong> One line of Python can be a loop: <code>x in a</code>, <code>a.index(x)</code>, <code>a[i:j]</code>,{" "}
          <code>sum(a)</code>. Count them.
        </li>
      </ul>
    </>
  );
}
