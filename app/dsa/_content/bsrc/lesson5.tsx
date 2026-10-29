import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SqrtFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Sometimes the answer is a real number, like 1.41421&hellip;, and not a whole number. Then there is no &ldquo;next candidate&rdquo; to step
        to. The window still halves, but it never shrinks to a single point, so you must decide when it is small enough. You also need to
        remember that computers store real numbers with limited precision.
      </p>

      <h2 id="continuous">When the answer is a real number</h2>
      <p>
        Suppose we want the number <M>x</M> with <M>x² = 2</M>. On the range <M>[0, 2]</M>, <M>x²</M> goes up as <M>x</M> goes up. It is below 2
        at <M>x = 0</M> and above 2 at <M>x = 2</M>, so the answer is somewhere in between. This method is called <em>bisection</em>. It keeps a
        window that contains the answer and halves it, just like before. The difference is that there is no <code>+ 1</code>: the new end of the
        window is <code>mid</code> itself.
      </p>
      <Invariant>
        <code>lo² &lt; 2 ≤ hi²</code>, so √2 is always in <code>[lo, hi]</code>.
      </Invariant>
      <CodeBlock
        title="bisect_sqrt.py"
        code={`def sqrt_bisect(x, steps=100):
    lo, hi = 0.0, max(1.0, x)
    for _ in range(steps):
        mid = (lo + hi) / 2
        if mid * mid < x:
            lo = mid
        else:
            hi = mid
    return lo`}
        mark={[3]}
      />

      <SqrtFigure />

      <p>
        The &ldquo;settled digits&rdquo; in the figure are the digits that <code>lo</code> and <code>hi</code> now share. Each step adds about a third
        of a decimal digit, because <M>log₁₀ 2 ≈ 0.3</M>. So ten halvings give about three more correct digits.
      </p>

      <h2 id="stopping">When to stop</h2>
      <p>
        After <M>k</M> steps, the window is <M>(hi − lo) / 2<sup>k</sup></M> wide. To make it smaller than a tolerance <M>ε</M>, starting from
        width <M>W</M>, takes <M>⌈log₂(W/ε)⌉</M> steps. Going from width 2 down to <M>10⁻⁹</M> takes 31 steps.
      </p>
      <p>
        So the safest way to stop is to count steps, as the code above does. It is tempting to write a loop like{" "}
        <code>while hi - lo &gt; 1e-17</code> instead. But that loop can run forever, as the next section explains.
      </p>

      <h2 id="floats">Computer numbers are not exact</h2>
      <p>
        A Python <code>float</code> stores about 16 significant digits (53 binary digits). Near 1.414, the gap between one float and the next is
        about <M>2.2 × 10⁻¹⁶</M>. When <code>lo</code> and <code>hi</code> are next to each other, <code>(lo + hi) / 2</code> rounds back to one of
        them. The window stops shrinking, and <code>hi - lo</code> stays at about <M>2.2 × 10⁻¹⁶</M>, which is never smaller than{" "}
        <M>10⁻¹⁷</M>. So the loop never ends.
      </p>
      <p>
        A fixed count of 100 steps is always enough for a float. After about 60 halvings, <code>lo</code> and <code>hi</code> are neighbouring
        floats, and the extra steps do no harm.
      </p>
      <Note title="Absolute or relative tolerance" warn>
        <p>
          A tolerance of <M>10⁻⁹</M> makes no sense for an answer near <M>10¹²</M>. Floats near <M>10¹²</M> are about <M>10⁻⁴</M> apart, so the
          window can never be that small. When you don&rsquo;t know the size of the answer, compare <code>hi - lo</code> with{" "}
          <code>1e-9 * max(1, abs(lo))</code>, or count steps.
        </p>
      </Note>
      <p>
        Limited precision also causes problems with big whole numbers. For big integers, <code>int(math.sqrt(n))</code> is often wrong, because{" "}
        <code>n</code> is rounded to a float before the square root is taken:
      </p>
      <CodeBlock
        title="python"
        code={`>>> import math
>>> n = 10**30 - 1
>>> int(math.sqrt(n))      # rounded: n became 10**30
1000000000000000
>>> math.isqrt(n)          # exact
999999999999999`}
      />

      <h2 id="integers">Whole-number answers, exactly</h2>
      <p>
        When the answer is a whole number, search the whole numbers and avoid floats completely. The square root of <M>n</M>, rounded down, is
        the largest <M>r</M> with <M>r² ≤ n</M>. The test <code>r * r &lt;= n</code> is true for small <M>r</M> and false for large <M>r</M>, so the
        answers go T … T F … F. Python&rsquo;s integers never overflow or round, so the search is exact for any size of <M>n</M>.
      </p>
      <p>
        This is a search for the <em>last</em> T, which needs one detail that you will see in the next lesson. Python has this built in as{" "}
        <code>math.isqrt</code>. It uses Newton&rsquo;s method, which is even faster. In the practice problem you build it yourself with binary
        search, and <code>math.isqrt</code> is switched off.
      </p>
      <p>
        The general rule: use real-number bisection when the answer is truly continuous, such as a time, an angle or a rate. When the answer is a
        whole number, or can be made one (for example, counting in paise instead of rupees), search the whole numbers. It is exact, and it always
        ends.
      </p>
    </>
  );
}
