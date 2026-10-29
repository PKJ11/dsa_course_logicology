import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { HalvingFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A sorted list provides some information with every value. If you read a value from the middle, you can infer information about
        the values above and below it. Binary search uses this information to make searching fast and efficient.
      </p>

      <h2 id="question">The problem</h2>
      <p>
        You have a list <code>a</code> of <M>n</M> numbers, sorted from smallest to largest, and a target value <code>t</code>. Find an index{" "}
        <code>i</code> where <code>a[i] == t</code>. If <code>t</code> is not in the list, return <code>-1</code>.
      </p>
      <p>
        The simple way is to check each value from the left until you find <code>t</code> or reach the end. This is called a linear scan.
        In the worst case it reads all <M>n</M> values. It does not use the fact that the list is sorted.
      </p>
      <p>
        The sorting gives us extra information. Say you are looking for 25, and you read <code>a[7] = 31</code>. The list is sorted, so every
        value after index 7 is bigger than 31, which means it is also bigger than 25. With one read, you have ruled out half the list.
      </p>

      <h2 id="halving">Rule out half with each read</h2>
      <p>
        Keep track of the part of the list where <code>t</code> could still be. We call this part the <em>window</em>. It runs from index{" "}
        <code>lo</code> to index <code>hi</code>. At the start, the window is the whole list.
      </p>
      <p>
        Then repeat these steps. Find the middle index of the window, <code>mid</code>, and compare <code>a[mid]</code> with <code>t</code>:
      </p>
      <ul>
        <li>
          If <code>a[mid] == t</code>, you have found it. Return <code>mid</code>.
        </li>
        <li>
          If <code>a[mid] &lt; t</code>, then <code>t</code> must be to the right of <code>mid</code>. Every value from <code>lo</code> to <code>mid</code> is at
          most <code>a[mid]</code>, so none of them can be <code>t</code>. Set <code>lo = mid + 1</code>.
        </li>
        <li>
          If <code>a[mid] &gt; t</code>, then <code>t</code> must be to the left of <code>mid</code>, for the same reason. Set <code>hi = mid - 1</code>.
        </li>
      </ul>
      <p>If the window becomes empty, <code>t</code> is not in the list.</p>
      <p>
        Try it in the figure below. Each pointer (<code>lo</code>, <code>mid</code> and <code>hi</code>) moves along its own track under the list.
        Shaded cells have been ruled out. Also try the target that is not in the list, and watch the window shrink to nothing.
      </p>

      <HalvingFigure />

      <CodeBlock
        title="search.py"
        code={`def search(a, t):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == t:
            return mid
        elif a[mid] < t:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`}
        mark={[4]}
      />
      <p>
        Line 4 finds the middle of the window. The rest of the code only moves <code>lo</code> and <code>hi</code>. The next lesson proves that
        these moves are correct.
      </p>

      <h2 id="cost">How many reads it takes</h2>
      <p>
        Each read cuts the window at least in half. If the window has <M>m</M> values, the part that is left has at most <M>m/2</M> values
        (rounded down). So after <M>k</M> reads, at most <M>n / 2<sup>k</sup></M> values are left. The loop stops when no values are left.
        This means the worst case is:
      </p>
      <Invariant label="Cost">
        Worst case: <code>⌊log₂ n⌋ + 1</code> reads, which is <code>O(log n)</code>.
      </Invariant>
      <p>
        Here <M>log₂ n</M> means &ldquo;how many times you can halve <M>n</M> before you reach 1&rdquo;. For example, <M>log₂ 16 = 4</M>, because
        16 → 8 → 4 → 2 → 1. The symbols <M>⌊ ⌋</M> mean &ldquo;round down&rdquo;.
      </p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Worst-case reads, linear scan against binary search</caption>
          <thead>
            <tr>
              <th className="r">List size n</th>
              <th className="r">Linear scan, worst case</th>
              <th className="r">Binary search, worst case</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="r">16</td><td className="r">16</td><td className="r">5</td></tr>
            <tr><td className="r">1,000</td><td className="r">1,000</td><td className="r">10</td></tr>
            <tr><td className="r">1,000,000</td><td className="r">1,000,000</td><td className="r">20</td></tr>
            <tr><td className="r">1,000,000,000</td><td className="r">1,000,000,000</td><td className="r">30</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        When the list becomes 1,000 times bigger, binary search needs only about 10 more reads. This is why logarithmic time is so fast.
      </p>
      <p>
        There is one hidden cost: the list must already be sorted. Sorting takes <M>O(n log n)</M> time, which is much more than one linear scan.
        So binary search is worth it when the data is already sorted, or when you sort it once and then search it many times. Sorting a list
        just to search it once is usually slower than a linear scan.
      </p>

      <h2 id="lower-bound">Why you cannot do better</h2>
      <p>Can any method find <code>t</code> with fewer reads? Not if it only compares <code>t</code> with values in the list.</p>
      <p>
        Think of the search as a game of yes-or-no questions. There are <M>n + 1</M> possible answers: <code>t</code> can be at any of the <M>n</M>{" "}
        positions, or it can be missing. Each question can at best cut the possible answers in half. So <M>k</M> questions can tell apart at
        most <M>2<sup>k</sup></M> answers. To be sure of the answer, we need <M>2<sup>k</sup> ≥ n + 1</M>, which means <M>k ≥ log₂(n + 1)</M>.
      </p>
      <p>
        Binary search uses <M>⌊log₂ n⌋ + 1</M> reads. For every <M>n ≥ 1</M>, this is the same as <M>⌈log₂(n + 1)⌉</M> (where <M>⌈ ⌉</M> means
        &ldquo;round up&rdquo;), which is exactly the lower limit. So no method that only compares values can beat binary search.
      </p>
      <Note title="Methods that do more than compare">
        <p>
          This limit only applies to methods that compare values. Interpolation search also uses the size of the values to guess where{" "}
          <code>t</code> is, the way you open a dictionary near the end to find a word starting with W. On evenly spread data it needs about{" "}
          <M>O(log log n)</M> reads on average. On unevenly spread data it can need <M>O(n)</M> reads. Binary search always stays within{" "}
          <M>O(log n)</M>.
        </p>
      </Note>

      <h2 id="python">In Python</h2>
      <p>
        Python has binary search built in, in the <code>bisect</code> module. <code>bisect_left(a, t)</code> returns the first index where <code>t</code>{" "}
        could be inserted while keeping <code>a</code> sorted. If <code>t</code> is in the list, that is where it is:
      </p>
      <CodeBlock
        title="with bisect"
        code={`from bisect import bisect_left

def search(a, t):
    i = bisect_left(a, t)
    return i if i < len(a) and a[i] == t else -1`}
      />
      <p>
        Two warnings. First, <code>t in a</code> and <code>a.index(t)</code> check a list one value at a time. Python does not know that your list is
        sorted. Second, write the loop yourself before you use <code>bisect</code>. The practice tests accept both, but the next five lessons
        build on the loop.
      </p>
      <p>
        Next, you will prove that the loop is correct. That is the only way to be sure that the <code>+ 1</code> and <code>- 1</code> are in the
        right places. The <Link href="/dsa/bsrc/3/#bisect">third lesson</Link> covers <code>bisect</code> in more detail.
      </p>
    </>
  );
}
