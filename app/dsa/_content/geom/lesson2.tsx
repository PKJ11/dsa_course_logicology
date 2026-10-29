import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MeetFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Do two line pieces meet? The question sounds like it needs line equations, slopes and division. It does not: four signs of cross products
        answer it, exactly, with whole numbers. The hard part is the special cases, where a point lies exactly on a line.
      </p>

      <h2 id="orient">Orientation</h2>
      <p>
        The <strong>orientation</strong> of three points A, B, C is the sign of <M>cross(A, B, C)</M> from lesson 1:
      </p>
      <ul>
        <li>positive: A → B → C turns left (counterclockwise), so C is on the left of the line through A and B, looking from A towards B;</li>
        <li>negative: the turn goes right (clockwise);</li>
        <li>zero: the three points lie on one line (they are <strong>collinear</strong>).</li>
      </ul>
      <p>
        A <strong>line</strong> goes on forever in both directions; a <strong>line piece</strong> (a segment) AB stops at A and B. Orientation is
        about the line; whether a point is on the <em>piece</em> needs one more check.
      </p>

      <h2 id="meet">Do two pieces meet?</h2>
      <p>
        Take pieces AB and CD. If C and D are on opposite sides of the line AB, then the piece CD crosses that line somewhere. That alone is not
        enough: the crossing point may lie beyond A or B. But if also A and B are on opposite sides of the line CD, the crossing point lies on
        both pieces.
      </p>
      <Invariant label="Crossing">If C and D are strictly on opposite sides of AB, and A and B strictly on opposite sides of CD, the pieces cross at exactly one point.</Invariant>
      <p>
        In signs: <M>cross(A, B, C)</M> and <M>cross(A, B, D)</M> have opposite signs, and so do <M>cross(C, D, A)</M> and{" "}
        <M>cross(C, D, B)</M>. Step through the first two variants of the figure: in &ldquo;Miss&rdquo; only the first test passes.
      </p>
      <MeetFigure />

      <h2 id="zero">When an orientation is 0</h2>
      <p>
        If one orientation is 0, say <M>cross(A, B, C) = 0</M>, then C is on the line AB. It is on the <em>piece</em> AB exactly when it lies in
        the box with corners A and B: its x between A.x and B.x, and its y between A.y and B.y. Checking only x is wrong for an upright piece,
        where every x is the same.
      </p>
      <CodeBlock
        code={`def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def within(p, q, r):            # r is in the box with corners p and q
    return (min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and
            min(p[1], q[1]) <= r[1] <= max(p[1], q[1]))

def pieces_meet(a, b, c, d):
    d1, d2 = cross(a, b, c), cross(a, b, d)
    d3, d4 = cross(c, d, a), cross(c, d, b)
    if ((d1 > 0 > d2) or (d1 < 0 < d2)) and ((d3 > 0 > d4) or (d3 < 0 < d4)):
        return True                         # a proper crossing
    return ((d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or
            (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)))`}
      />
      <p>
        Why the second part is enough. If the pieces meet but do not cross properly, the meeting point is an end of one of them: it is A, B, C or
        D, or the pieces lie on one line and overlap, and then an end of one lies on the other. In each case one orientation is 0 and that end is
        in the other piece&rsquo;s box. The other way round, a 0 orientation with the end in the box means that end lies on the other piece.
      </p>
      <p>
        Cases to test, with the variants &ldquo;Touch&rdquo; and &ldquo;One line&rdquo; of the figure:
      </p>
      <ul>
        <li>an end of one piece on the middle of the other (a T shape);</li>
        <li>two pieces that share only an end;</li>
        <li>
          two pieces on one line: they may be apart, touch at one end, or overlap along a stretch. All four orientations are 0, so only the boxes
          decide;
        </li>
        <li>a &ldquo;piece&rdquo; whose two ends are equal: a single point;</li>
        <li>upright pieces, where all x are equal.</li>
      </ul>
      <p>
        To tell <em>one</em> common point from <em>many</em> (the practice problem): if the four points are not all on one line, the pieces share at
        most one point. If they are all on one line, measure each piece along the line (by x, or by y for an upright line) and compare the
        overlap of the two ranges: empty, a single value, or longer.
      </p>

      <h2 id="where">Where they cross</h2>
      <p>
        Write the pieces as <M>A + t·r</M> and <M>C + u·s</M>, with <M>r = B − A</M>, <M>s = D − C</M>, and <M>t</M>, <M>u</M> between 0 and 1.
        Taking the cross product of both sides of <M>A + t·r = C + u·s</M> with <M>s</M> removes <M>u</M> (because <M>cross(s, s) = 0</M>):
      </p>
      <p>
        <M>t = cross(C − A, s) / cross(r, s)</M>.
      </p>
      <p>
        If <M>cross(r, s) = 0</M>, the pieces are parallel and there is no single crossing point. Otherwise the point is <M>A + t·r</M>. With{" "}
        <code>fractions.Fraction</code> it is exact:
      </p>
      <CodeBlock
        code={`from fractions import Fraction

def crossing_point(a, b, c, d):
    r = (b[0] - a[0], b[1] - a[1])
    s = (d[0] - c[0], d[1] - c[1])
    den = r[0] * s[1] - r[1] * s[0]
    if den == 0:
        return None                          # parallel lines
    t = Fraction((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0], den)
    return (a[0] + t * r[0], a[1] + t * r[1])

crossing_point((0, 0), (4, 4), (0, 4), (4, 0))   # (Fraction(2, 1), Fraction(2, 1))`}
      />
      <p>Only the yes-or-no question needs no division at all, which is why the orientation test is preferred.</p>

      <h2 id="inside">Is a point inside a polygon?</h2>
      <p>
        Send a ray (a half-line) from the point P to the right, and count how many edges of the polygon it crosses. Each crossing moves between
        inside and outside, and far to the right is outside, so P is inside exactly when the count is odd. This is the{" "}
        <strong>ray casting</strong> or even-odd rule.
      </p>
      <ul>
        <li>
          <strong>First check the edges:</strong> if P lies on an edge (orientation 0 and inside the box), answer &ldquo;on the edge&rdquo;.
        </li>
        <li>
          <strong>Corners on the ray:</strong> count an edge only when exactly one of its ends is strictly above P (<code>(y1 &gt; py) != (y2 &gt; py)</code>
          ). A corner the ray passes through is then counted once or not at all, correctly, and flat edges are never counted.
        </li>
        <li>
          <strong>No division:</strong> for an edge going up from <M>(x₁, y₁)</M> to <M>(x₂, y₂)</M>, the ray meets it to the right of P exactly
          when P is on its left: <M>cross(P₁, P₂, P) &gt; 0</M>. For an edge going down, the sign flips.
        </li>
      </ul>
      <CodeBlock
        code={`def where(poly, p):
    n = len(poly)
    inside = False
    for k in range(n):
        a, b = poly[k], poly[(k + 1) % n]
        if cross(a, b, p) == 0 and within(a, b, p):
            return "edge"
        if (a[1] > p[1]) != (b[1] > p[1]):       # the edge spans p's height
            c = cross(a, b, p)
            if (c > 0) == (b[1] > a[1]):        # it crosses to the right of p
                inside = not inside
    return "inside" if inside else "outside"`}
      />
      <p>
        Each test is <M>O(n)</M> for <M>n</M> corners. For a convex polygon, binary search over the corners answers in <M>O(log n)</M>.
      </p>
      <Note title="The winding number">
        <p>
          Instead of flipping a flag, add +1 for an edge going up and −1 for one going down. The total is the <em>winding number</em>: how many
          times the edge goes round P. It agrees with ray casting for simple polygons, and also gives sensible answers for shapes whose edges
          cross themselves. Libraries such as <code>shapely</code> do all of this for real maps, with floats and careful tolerances.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/geom/practice/2/">GEOM-P2, Do two tracks meet?</Link>.
      </p>
    </>
  );
}
