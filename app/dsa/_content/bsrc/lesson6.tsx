import { CodeBlock } from "../../_components/Code";
import { Invariant, Note } from "../../_components/Prose";
import { TrapFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Almost every binary search bug is an off-by-one error. The window starts one position too wide, the loop stops one step too early, or a
        pointer does not move. You can avoid all of them with one convention, one rounding rule and a short checklist.
      </p>

      <h2 id="conventions">Pick one convention</h2>
      <p>
        You have seen two kinds of window. Each one works correctly on its own. Most bugs happen when code mixes a line from one kind with a line
        from the other.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">The closed and half-open conventions compared</caption>
          <thead>
            <tr>
              <th></th>
              <th>Closed window [lo, hi]</th>
              <th>Half-open window [lo, hi)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>hi starts at</strong></td><td><code>len(a) - 1</code></td><td><code>len(a)</code></td></tr>
            <tr><td><strong>Loop while</strong></td><td><code>lo &lt;= hi</code></td><td><code>lo &lt; hi</code></td></tr>
            <tr><td><strong>Empty when</strong></td><td><code>lo == hi + 1</code></td><td><code>lo == hi</code></td></tr>
            <tr><td><strong>Moving hi</strong></td><td><code>hi = mid - 1</code></td><td><code>hi = mid</code></td></tr>
            <tr><td><strong>Moving lo</strong></td><td><code>lo = mid + 1</code></td><td><code>lo = mid + 1</code></td></tr>
            <tr><td><strong>Best for</strong></td><td>finding an exact value</td><td>finding a boundary (the first T)</td></tr>
          </tbody>
        </table>
      </div>
      <p>Choose one for each problem, write a comment saying which one you chose, and check every line against its column.</p>

      <h2 id="trap">The lo = mid trap</h2>
      <p>
        Here is a search for the first T that looks correct but is broken. It uses <code>lo = mid</code> where it should use{" "}
        <code>lo = mid + 1</code>:
      </p>
      <CodeBlock
        title="trap.py"
        code={`lo, hi = 0, len(a) - 1
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] < t:
        lo = mid          # should be mid + 1
    else:
        hi = mid`}
        mark={[5]}
      />
      <p>
        With a large window it seems to work. The problem appears when only two positions are left, so <code>hi == lo + 1</code>. Then{" "}
        <code>mid = (lo + lo + 1) // 2 = lo</code>, because <code>//</code> rounds down. If <code>a[mid] &lt; t</code>, the update sets <code>lo</code> to
        the value it already has. Nothing changes, so the loop runs forever. Step through it below, then switch to the fixed version.
      </p>

      <TrapFigure />

      <p>
        In the terms of lesson 2, the invariant is fine here. What fails is the proof that the loop stops: the window does not get smaller when{" "}
        <code>mid == lo</code>. That is why the checklist below asks you to test a two-element window by hand.
      </p>

      <h2 id="rounding">Rounding mid up</h2>
      <p>
        Sometimes <code>lo = mid</code> is exactly right. When you search for the <em>last</em> T in T … T F … F, a T at <code>mid</code> might be the
        answer, so <code>lo</code> must keep it. In that case, make <code>mid</code> round <em>up</em>, so that it can never equal <code>lo</code>:
      </p>
      <CodeBlock
        title="last_true.py"
        code={`def last_true(lo, hi, ok):
    """Largest x in [lo, hi] with ok(x), given ok(lo) is True."""
    while lo < hi:
        mid = (lo + hi + 1) // 2   # rounds up: lo < mid <= hi
        if ok(mid):
            lo = mid               # mid may be the last T: keep it
        else:
            hi = mid - 1           # mid is F: drop it
    return lo`}
        mark={[4]}
      />
      <Invariant label="Rule">
        Round <code>mid</code> away from the side that keeps it. If <code>hi</code> keeps <code>mid</code>, round down. If <code>lo</code> keeps{" "}
        <code>mid</code>, round up.
      </Invariant>
      <p>
        The whole-number square root from the last lesson is <code>last_true(0, n, lambda r: r * r &lt;= n)</code>.
      </p>

      <h2 id="checklist">A checklist for every search</h2>
      <ol>
        <li>
          <strong>Write the invariant.</strong> What do <code>lo</code> and <code>hi</code> mean? For example: &ldquo;every index before <code>lo</code> is F,
          and every index from <code>hi</code> onwards is T&rdquo;. You can check a sentence like that.
        </li>
        <li>
          <strong>Check the start.</strong> Do the first values of <code>lo</code> and <code>hi</code> make the invariant true, even when the answer is
          &ldquo;none&rdquo;? (For example, <code>hi = len(a)</code>, not <code>len(a) - 1</code>.)
        </li>
        <li>
          <strong>Check each branch.</strong> Does it keep the invariant true, given what the comparison just told you about <code>mid</code>?
        </li>
        <li>
          <strong>Check that the window shrinks.</strong> Try a two-element window by hand. Does every branch make it smaller?
        </li>
        <li>
          <strong>Check the end.</strong> When the loop stops, what does <code>lo</code> mean? Do you still need to check that it is inside the list,
          or that it equals the target?
        </li>
        <li>
          <strong>Test the edge cases:</strong> lists of length 0, 1 and 2; the target at the first and last position; and a missing target that is
          smaller than all the values, between two values, or larger than all the values.
        </li>
      </ol>

      <h2 id="overflow">A note on overflow</h2>
      <p>
        Python integers have no maximum size, so <code>(lo + hi) // 2</code> is always safe in Python. In C, C++ and Java, <code>lo + hi</code> can be
        larger than the biggest allowed <code>int</code> when both are above about 1.07 billion. The result wraps around and <code>mid</code> becomes
        negative. In 2006, Joshua Bloch reported that the binary search in Java&rsquo;s standard library had had this bug for about nine years.
        The usual fix is <code>mid = lo + (hi - lo) / 2</code>. You don&rsquo;t need it in Python, but you will need it when you write the same loop
        in another language.
      </p>
      <Note title="Station complete">
        <p>
          You have now learned the whole tool: exact search, boundary search, searching on the answer, real-number bisection, and the rules that
          keep them correct. The practice problems for this station use all of them. The next station, <strong>RECR</strong>, uses a related idea:
          splitting a problem into smaller parts.
        </p>
      </Note>
    </>
  );
}
