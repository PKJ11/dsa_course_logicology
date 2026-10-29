import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BoundaryFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        The search from the first two lessons finds <em>a</em> copy of the target. But often we need a specific copy: the first one, the last
        one, or the number of copies. This lesson shows a different way to think about binary search, which the rest of this station uses.
      </p>

      <h2 id="duplicates">When the target appears more than once</h2>
      <p>
        Take <code>t = 7</code>. The basic search returns whichever 7 it happens to land on. On the 16-value list in the figure below, it lands on
        index 3, the first copy, but only by luck. On <code>[7, 7, 7, 7, 7]</code> it returns index 2. Which copy you get depends on the length of
        the list, not on what you asked for. Code that depends on this will break.
      </p>
      <p>
        One fix is to find any 7 and then step left until the value changes. But that costs one read for each copy. If the list has a million
        7s, it costs a million reads, and the search is no longer <M>O(log n)</M>. We want to find the first 7 in <M>O(log n)</M> reads, however
        many copies there are.
      </p>

      <h2 id="predicate">Search for a boundary, not a value</h2>
      <p>Instead of asking &ldquo;is this the target?&rdquo;, ask a yes-or-no question about each index:</p>
      <Invariant label="Question">
        <code>a[i] &gt;= t</code> gives F F … F T T … T. The first 7 is the first T.
      </Invariant>
      <p>
        Because <code>a</code> is sorted, once <code>a[i] &gt;= t</code> is true, it stays true for every later index. So the answers are a block of F
        (false) followed by a block of T (true). There is exactly one point where F changes to T, and binary search can find it. If the value at
        that point equals <code>t</code>, it is the first copy. If not, <code>t</code> is not in the list.
      </p>
      <p>
        To find the <em>last</em> copy, ask <code>a[i] &gt; t</code> instead. Its first T is the first value bigger than <code>t</code>. So the last copy of{" "}
        <code>t</code>, if there is one, is just before it. The number of copies is the distance between these two points.
      </p>

      <BoundaryFigure />

      <p>
        Look at the row of F and T labels under the list. A label changes from <code>?</code> to F or T only when the search has proved it. The
        window is exactly the part still marked <code>?</code>.
      </p>

      <h2 id="half-open">The half-open window</h2>
      <p>
        This search is simplest with a <em>half-open</em> window, written <code>[lo, hi)</code>. Here <code>lo</code> is the first index we have not
        settled yet, and <code>hi</code> is the first index we know is T. At the start <code>hi = n</code>, which is one past the end of the list.
        It stands for &ldquo;no T found yet&rdquo;.
      </p>
      <CodeBlock
        title="first_true.py"
        code={`def first_at_least(a, t):
    """Smallest i with a[i] >= t, or len(a) if there is none."""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] >= t:
            hi = mid          # mid may be the first T: keep it
        else:
            lo = mid + 1      # mid is F: drop it
    return lo                 # lo == hi: the boundary`}
        mark={[7, 9]}
      />
      <Invariant>
        Every index before <code>lo</code> is F. Every index from <code>hi</code> onwards is T.
      </Invariant>
      <p>
        At the start, both parts of this statement are about empty ranges, so they are true. If <code>mid</code> is T, every index from{" "}
        <code>mid</code> onwards is T, so we set <code>hi = mid</code>. If <code>mid</code> is F, every index up to <code>mid</code> is F, so we set{" "}
        <code>lo = mid + 1</code>. Since <code>lo ≤ mid &lt; hi</code>, both updates make the window smaller. When <code>lo == hi</code>, nothing is
        unknown, and <code>lo</code> is the boundary.
      </p>
      <p>
        Notice the difference between the two updates. <code>hi = mid</code> keeps <code>mid</code>, because it might be the answer.{" "}
        <code>lo = mid + 1</code> removes <code>mid</code>, because an F is never the answer. Lesson 6 shows what goes wrong if you mix these up.
      </p>

      <h2 id="bisect">bisect_left and bisect_right</h2>
      <p>This loop is almost exactly what Python&rsquo;s <code>bisect</code> module does:</p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">The bisect functions and the questions they search</caption>
          <thead>
            <tr>
              <th>Call</th>
              <th>Returns the first index where</th>
              <th>Use it for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>bisect_left(a, t)</code></td>
              <td><code>a[i] &gt;= t</code></td>
              <td>the first copy of t, or where to insert t before equal values</td>
            </tr>
            <tr>
              <td><code>bisect_right(a, t)</code></td>
              <td><code>a[i] &gt; t</code></td>
              <td>one past the last copy, or where to insert t after equal values</td>
            </tr>
            <tr>
              <td><code>bisect_right − bisect_left</code></td>
              <td>(a count, not an index)</td>
              <td>the number of copies of t, in <M>O(log n)</M></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Both functions accept <code>lo</code> and <code>hi</code> arguments to search only part of a list. Since Python 3.10, they also accept a{" "}
        <code>key</code> function, so you can search a list of records sorted by one field. <code>insort</code> inserts a value and keeps the list
        sorted. Finding the place takes <M>O(log n)</M>, but moving the later items along takes <M>O(n)</M>. So <code>insort</code> does not make a
        list into a fast sorted container.
      </p>
      <Note title="The bigger idea">
        <p>
          Nothing in <code>first_at_least</code> needs a list. It only needs a range of indices in order, and a yes-or-no question whose answers go
          from F to T. The next lesson removes the list completely.
        </p>
      </Note>
    </>
  );
}
