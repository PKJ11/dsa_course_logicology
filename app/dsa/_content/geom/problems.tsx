import { CodeBlock } from "../../_components/Code";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";

export const GEOM_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Points inside a field",
    fn: "inside_points",
    lessons: [1],
    starter: `def inside_points(poly):
    # poly: the corners (x, y) of a simple polygon, in order
    # round its edge (either direction). Return how many
    # whole-number points lie strictly inside it.
    pass
`,
    statement: (
      <>
        <p>
          A field on a map is a simple polygon: its edges meet only at shared corners. You get its corners as <code>(x, y)</code> pairs of whole
          numbers, in order round the edge, clockwise or counterclockwise. Return how many points with whole-number coordinates lie strictly
          inside the field (not on an edge).
        </p>
        <CodeBlock
          code={`inside_points([(0, 0), (4, 0), (4, 4), (0, 4)])   # 9
inside_points([(0, 0), (5, 0), (0, 5)])           # 6
inside_points([(0, 0), (1, 0), (0, 1)])           # 0`}
        />
        <p>A corner may lie on the straight line between its two neighbours. The polygon has at least three corners and some area.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 100,000 corners, with coordinates up to about 10¹⁰ in size. Trying every point of the map is far too slow.</li>
          <li>Keep to whole numbers: a float area loses digits here.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Pick&rsquo;s theorem (lesson 1) links the area, the points on the edges and the points inside.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Twice the area is the absolute value of the shoelace sum, <code>x1 * y2 - x2 * y1</code> over all edges (the last edge goes from the
              last corner back to the first).
            </p>
            <p>
              An edge with steps dx and dy holds <code>gcd(abs(dx), abs(dy))</code> whole-number points if you count only one of its ends; add
              these up for B. Then <code>I = (2A - B + 2) // 2</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`s = b = 0
for each edge (x1, y1) -> (x2, y2), wrapping round:
    s += x1 * y2 - x2 * y1
    b += gcd(abs(x2 - x1), abs(y2 - y1))
return (abs(s) - b + 2) // 2`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "Do two tracks meet?",
    fn: "meet",
    lessons: [2],
    starter: `def meet(a, b, c, d):
    # Pieces AB and CD; each point is an (x, y) pair of
    # whole numbers. Return 0 if they share no point, 1 if
    # they share exactly one, 2 if they share more than one.
    pass
`,
    statement: (
      <>
        <p>
          Two straight pieces of track run from <code>a</code> to <code>b</code> and from <code>c</code> to <code>d</code>. Return 0 if they
          have no point in common, 1 if they have exactly one, and 2 if they share more than one point (they lie on one line and overlap along a
          stretch).
        </p>
        <CodeBlock
          code={`meet((0, 0), (4, 4), (0, 4), (4, 0))   # 1: they cross at (2, 2)
meet((0, 0), (2, 2), (2, 2), (4, 0))   # 1: a shared end
meet((0, 0), (3, 3), (1, 1), (5, 5))   # 2: they overlap
meet((0, 0), (1, 1), (2, 2), (3, 3))   # 0: one line, apart`}
        />
        <p>
          A piece may be a single point (both its ends equal). Pieces may be upright. Coordinates can be as large as 10¹⁷, where floats are not
          exact.
        </p>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Four orientations (lesson 2), plus a check of where a point lies when an orientation is 0.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Handle single points first. Then, if C and D both have orientation 0 against AB, all four points are on one line: compare the two
              pieces as ranges along the line (by x, or by y if the line is upright).
            </p>
            <p>
              Otherwise they share at most one point: a proper crossing (each piece has its ends strictly on opposite sides of the other) or an end
              of one lying on the other (orientation 0 and inside its box).
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`d1, d2 = cross(a, b, c), cross(a, b, d)
d3, d4 = cross(c, d, a), cross(c, d, b)
if d1 == d2 == 0:     # one line (after single points)
    overlap of [min, max] ranges: none 0, a point 1, else 2
if d1, d2 opposite signs and d3, d4 opposite signs: 1
if some di == 0 and that end is in the other's box: 1
return 0`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "The fence around the stations",
    fn: "hull",
    lessons: [3],
    starter: `def hull(points):
    # Return the corners of the convex hull, counterclockwise,
    # starting from the lowest point (the leftmost of the
    # lowest, if several). Leave out points on an edge.
    pass
`,
    statement: (
      <>
        <p>
          Stations stand at whole-number points. A straight-sided fence must enclose them all and be as short as possible: it is the convex
          hull. Return its corners counterclockwise, starting from the point with the smallest y (the smallest x among those, if several). Points
          that lie on an edge between two corners are not corners. Repeated points count once.
        </p>
        <CodeBlock
          code={`hull([(0, 0), (2, 0), (2, 2), (0, 2), (1, 1)])
# [(0, 0), (2, 0), (2, 2), (0, 2)]
hull([(0, 0), (1, 0), (2, 0), (2, 2), (0, 2)])
# [(0, 0), (2, 0), (2, 2), (0, 2)]
hull([(2, 2), (0, 0), (5, 5)])   # [(0, 0), (5, 5)]`}
        />
        <p>If all the points lie on one line, return its two ends (the lower one first); if there is only one point, return it alone.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 points, with coordinates up to 10⁹. The big tests have 5 seconds each.</li>
          <li>On one test every point is a corner, so gift wrapping (O(n · h)) is too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Andrew&rsquo;s monotone chain (lesson 3): sort, then one walk for the lower hull and one for the upper.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Sort the distinct points. Walk left to right with a stack, popping while the last two points and the new one do not turn left
              (cross ≤ 0); that gives the lower hull. Walk right to left the same way for the upper hull.
            </p>
            <p>Join them without repeating the two ends, then rotate the list so that it starts at the lowest (then leftmost) corner.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`pts = sorted(set(points))
lower = [];  for p in pts: pop while cross(lower[-2], lower[-1], p) <= 0; push p
upper = [];  for p in reversed(pts): the same
h = lower[:-1] + upper[:-1]   (or pts itself if 2 or fewer)
k = position of min by (y, x);  return h[k:] + h[:k]`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "Any two tracks crossing?",
    fn: "any_crossing",
    lessons: [4],
    starter: `def any_crossing(segs):
    # segs: pieces ((x1, y1), (x2, y2)). Return (i, j), the
    # positions of two different pieces that share a point,
    # or None if no two pieces share a point.
    pass
`,
    statement: (
      <>
        <p>
          A map has straight pieces of track, each given by its two ends. Two pieces meet if they share any point: they cross, touch, share an
          end or overlap. Return the positions <code>(i, j)</code> of any two different pieces that meet, or <code>None</code> if no two meet.
          When several pairs meet, any one of them is accepted; the tests check that the two pieces you name really share a point.
        </p>
        <CodeBlock
          code={`any_crossing([((0, 0), (4, 4)), ((0, 4), (4, 0))])   # (0, 1)
any_crossing([((0, 0), (1, 0)), ((2, 0), (3, 0))])   # None
any_crossing([((0, 0), (2, 2)), ((2, 2), (4, 0))])   # (0, 1)`}
        />
        <p>Each piece has two different ends, given in either order. Pieces may be upright. Coordinates are whole numbers up to about 3 million.</p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 20,002 pieces. The big tests have 4 seconds each.</li>
          <li>Checking every pair is 200 million pair checks, far too slow.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>The Shamos–Hoey sweep (lesson 4): only pieces that are next to each other on the sweep line need checking.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Make events for the left end (start) and right end (finish) of each piece, sorted by x with starts before finishes at equal x. Keep
              a list of the pieces the line crosses, from the lowest up.
            </p>
            <p>
              At a start, find the place by binary search, comparing the new left end with each piece by the cross product (an upright piece by
              its y range); if the point lies on a piece, you are done. Insert, then check the new neighbours. At a finish, remove the piece and
              check the two pieces that become neighbours.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`events = (x, 0 start / 1 finish, y, i), sorted
for each event:
    start:  place = binary search with below(left[i], t)
            (on a piece -> return it); insert;
            check i with active[place - 1] and active[place + 1]
    finish: find i (binary search with right[i]); remove;
            check the two new neighbours
return None`}
          />
        ),
      },
    ],
    tests: t4,
  },
];
