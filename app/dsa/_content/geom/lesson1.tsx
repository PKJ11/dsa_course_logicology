import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { CrossFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Computational geometry solves problems about points, lines and shapes: maps, games, robots, chip layouts. Almost all of it rests on one
        small formula, the cross product, which tells you whether a turn goes left or right and how much area two steps enclose. With whole-number
        coordinates it is exact, and that matters more here than anywhere else in the course.
      </p>

      <h2 id="vectors">Points and vectors</h2>
      <p>
        A <strong>point</strong> is a place, given by two coordinates <M>(x, y)</M>: x goes right and y goes up. A <strong>vector</strong> is a
        step: how far to move in x and in y. The step from point A to point B is <M>B − A = (B.x − A.x, B.y − A.y)</M>. In Python a pair{" "}
        <code>(x, y)</code> works for both.
      </p>
      <ul>
        <li>Adding a vector to a point moves the point: <M>A + (B − A) = B</M>.</li>
        <li>Two vectors add coordinate by coordinate; multiplying by a number stretches a vector.</li>
        <li>
          The length of <M>v = (x, y)</M> is <M>√(x² + y²)</M>, written <code>math.hypot(x, y)</code>. To <em>compare</em> lengths, compare{" "}
          <M>x² + y²</M> instead: no square root, so the answer stays a whole number (DVCQ-4 did this for distances).
        </li>
      </ul>

      <h2 id="dot">The dot product</h2>
      <p>
        The <strong>dot product</strong> of <M>a = (a.x, a.y)</M> and <M>b = (b.x, b.y)</M> is <M>a·b = a.x·b.x + a.y·b.y</M>. It equals{" "}
        <M>|a| · |b| · cos θ</M>, where <M>|a|</M> is the length of a, θ (theta) is the angle between the two vectors, and cos θ is the
        cosine of that angle. Only its sign is
        needed most of the time:
      </p>
      <ul>
        <li>positive: the angle is less than 90°, so the vectors point roughly the same way;</li>
        <li>zero: they are at right angles;</li>
        <li>negative: the angle is more than 90°.</li>
      </ul>
      <p>
        For example, the point of a line piece AB that is closest to a point P: it lies beyond B if <M>(P − B)·(B − A) &gt; 0</M>, before A if{" "}
        <M>(P − A)·(B − A) &lt; 0</M>, and between them otherwise.
      </p>

      <h2 id="cross">The cross product</h2>
      <p>
        The <strong>cross product</strong> of a and b, for vectors in the plane, is the single number
      </p>
      <Invariant label="Cross">cross(a, b) = a.x · b.y − a.y · b.x</Invariant>
      <ul>
        <li>
          <strong>Its size</strong> is the area of the parallelogram with sides a and b (<M>|a| · |b| · sin θ</M>, with sin θ the sine of the angle).
        </li>
        <li>
          <strong>Its sign</strong> is the direction of the turn from a to b. Positive: counterclockwise, so b points to the left of a. Negative:
          clockwise, to the right. Zero: a and b lie along one line (or one of them is zero).
        </li>
      </ul>
      <p>
        Why the area? Start with <M>a = (a.x, 0)</M> along the x-axis. The parallelogram has base <M>a.x</M> and height <M>b.y</M>, so its area is{" "}
        <M>a.x · b.y</M>, which is the formula with <M>a.y = 0</M>. Turning both vectors by the same angle changes neither the area nor the
        formula&rsquo;s value, so the formula holds for every a. The sign follows the same way: with a along the x-axis, b points left of a
        exactly when <M>b.y &gt; 0</M>.
      </p>
      <p>
        Swapping the two vectors flips the sign: <M>cross(b, a) = −cross(a, b)</M>. For three points O, A, B, write{" "}
        <M>cross(O, A, B)</M> for <M>cross(A − O, B − O)</M>. Step through the figure.
      </p>
      <CrossFigure />
      <CodeBlock
        code={`def cross(o, a, b):
    """> 0: o -> a -> b turns left;  < 0: right;  0: one line."""
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])`}
      />

      <h2 id="exact">Whole numbers, not floats</h2>
      <p>
        Geometry programs often decide something from a sign: left or right, inside or outside. With floats a value that should be 0 can come out
        as <code>1e-17</code>, or a tiny positive value can round to 0, and then the program takes the wrong branch. In <code>0.1 + 0.2 == 0.3</code>{" "}
        Python answers False.
      </p>
      <ul>
        <li>
          Keep coordinates as whole numbers when the input allows it. The cross product of whole numbers is a whole number, and Python&rsquo;s
          whole numbers are exact at any size: with coordinates up to <M>10⁹</M> the products reach <M>10¹⁸</M>, with no rounding at all.
        </li>
        <li>
          When division is needed (an intersection point), use <code>fractions.Fraction</code>, which keeps an exact numerator and denominator
          (lesson 2).
        </li>
        <li>
          When floats cannot be avoided (angles, square roots), compare with a small tolerance, such as <code>abs(v) &lt; 1e-9</code>, and know
          that the tolerance is a guess.
        </li>
      </ul>
      <p>
        A float has about 16 significant digits. For coordinates near <M>10¹⁷</M>, <M>10¹⁷ · 10¹⁷</M> and <M>(10¹⁷ + 1)(10¹⁷ − 1)</M> are
        both stored as <code>1e34</code>, although they differ by 1. Lesson 2&rsquo;s practice problem has such a test.
      </p>

      <h2 id="area">The area of a polygon</h2>
      <p>
        A <strong>polygon</strong> is given by its corners <M>P<sub>0</sub>, P<sub>1</sub>, …, P<sub>n−1</sub></M> in order around the edge; it is{" "}
        <strong>simple</strong> if its edges meet only at shared corners. Split it into the triangles <M>P<sub>0</sub>, P<sub>k</sub>, P<sub>k+1</sub></M> and add their
        cross products. Triangles that cover a spot outside the polygon come in with a minus sign and cancel out (the fourth variant of the
        figure shows one). Using the point (0, 0) instead of <M>P<sub>0</sub></M> gives the same total and a shorter formula, the{" "}
        <strong>shoelace formula</strong>. The bars | … | mean the value without its sign:
      </p>
      <p>
        <M>2 · area = |</M> <M>(x<sub>0</sub>y<sub>1</sub> − x<sub>1</sub>y<sub>0</sub>)</M> <M>+ (x<sub>1</sub>y<sub>2</sub> − x<sub>2</sub>y<sub>1</sub>)</M> <M>+ …</M>{" "}
        <M>
          + (x<sub>n−1</sub>y<sub>0</sub> − x<sub>0</sub>y<sub>n−1</sub>) |
        </M>
      </p>
      <CodeBlock
        code={`def twice_area(poly):
    s = 0
    for k in range(len(poly)):
        x1, y1 = poly[k]
        x2, y2 = poly[(k + 1) % len(poly)]   # the last edge closes the loop
        s += x1 * y2 - x2 * y1
    return s          # > 0 counterclockwise, < 0 clockwise`}
      />
      <p>
        The sign tells the direction: positive when the corners go counterclockwise. Many algorithms need corners in a known direction, and this
        is how to check. It costs <M>O(n)</M>. Keep the doubled area: it is always a whole number, while the area may end in .5.
      </p>

      <h2 id="pick">Points inside: Pick&rsquo;s theorem</h2>
      <p>
        For a simple polygon whose corners have whole-number coordinates, let <M>A</M> be its area, <M>B</M> the number of whole-number points on
        its edges, and <M>I</M> the number strictly inside. Georg Pick (1899) proved:
      </p>
      <Invariant label="Pick">A = I + B/2 − 1, so I = (2A − B + 2) / 2.</Invariant>
      <p>
        <M>B</M> is easy to count. An edge from <M>(x₁, y₁)</M> to <M>(x₂, y₂)</M> passes through <M>gcd(|x₂ − x₁|, |y₂ − y₁|) + 1</M> whole-number
        points, counting both ends (gcd is the greatest common divisor, MATH-1). The points on it are evenly spaced, every <M>1/g</M> of the way,
        where g is that gcd. Counting each corner once, <M>B</M> is the sum of the gcds over all edges.
      </p>
      <p>
        Check it on the square with corners (0, 0) and (4, 4): <M>2A = 32</M>, <M>B = 16</M>, so <M>I = (32 − 16 + 2)/2 = 9</M>, the points{" "}
        <M>(1..3, 1..3)</M>.
      </p>
      <Note title="Why Pick's theorem holds, in outline">
        <p>
          Give each whole-number point a share of the area: 1 if it is inside, 1/2 if it is on an edge, and less at a corner. Both sides of the
          formula add up correctly when two polygons are glued along an edge, so it is enough to check rectangles and right triangles, and every
          simple polygon can be cut into triangles. The full proof is in most books on discrete geometry. The theorem fails for polygons with holes
          and in three dimensions.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/geom/practice/1/">GEOM-P1, Points inside a field</Link>.
      </p>
    </>
  );
}
