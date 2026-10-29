import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { StabilityFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        When records are sorted by one field, several records can have the same value in that field. A stable sort keeps those records in the
        order they came in. Python&rsquo;s sort is stable, and that makes sorting by several fields simple.
      </p>

      <h2 id="stable">What stable means</h2>
      <p>
        A sort is <em>stable</em> if any two records with equal keys come out in the same order as they went in. The key is the part used for
        comparing, such as the platform number of a train. Step through both sorts:
      </p>

      <StabilityFigure />

      <p>
        Insertion sort and merge sort are stable: they only move a record past records with a strictly larger key. Selection sort, quick sort and
        heap sort are not, because their long-distance swaps can jump a record over an equal one.
      </p>

      <h2 id="python">sorted() and list.sort()</h2>
      <CodeBlock
        code={`sorted(a)                  # a new sorted list; a is unchanged
a.sort()                   # sorts a in place, returns None
sorted(a, reverse=True)    # largest first, still stable
sorted(trains, key=lambda t: t.platform)`}
      />
      <p>
        Both use Timsort: a merge sort that first finds runs that are already in order, so it is <M>O(n)</M> on sorted or nearly sorted data and{" "}
        <M>O(n log n)</M> in the worst case. It is stable. It needs up to <M>O(n)</M> extra space.
      </p>
      <p>
        <code>key=</code> takes a function. It is called once per item, and the items are sorted by what it returns. This is faster and simpler than
        writing a comparison function. <code>a.sort()</code> returns <code>None</code>, so <code>a = a.sort()</code> loses your list.
      </p>

      <h2 id="multi">Sorting by several fields</h2>
      <p>Suppose trains must be ordered by platform, and trains on the same platform by departure time. Two ways:</p>
      <CodeBlock
        code={`# 1. One sort, with a tuple key: compares platform, then time
sorted(trains, key=lambda t: (t.platform, t.time))

# 2. Two stable sorts: the LAST sort is the main one
s = sorted(trains, key=lambda t: t.time)
s = sorted(s, key=lambda t: t.platform)`}
      />
      <p>
        The second way works because of stability: the platform sort keeps the time order among trains on the same platform. It is useful when one
        field must go the other way. For numbers, negate the key: <code>key=lambda t: (t.platform, -t.time)</code>. Strings cannot be negated; stability gives a way to do it
        then, which <Link href="/dsa/sort/practice/6/">SORT-P6</Link> asks you to find.
      </p>

      <h2 id="patterns">Useful patterns</h2>
      <ul>
        <li>
          <code>sorted(range(n), key=lambda i: a[i])</code> gives the positions in sorted order, called an <em>argsort</em>. Ties keep the smaller index
          first.
        </li>
        <li>
          <code>operator.itemgetter(1)</code> and <code>operator.attrgetter(&quot;time&quot;)</code> are fast ready-made key functions.
        </li>
        <li>
          <code>min</code>, <code>max</code> and <code>heapq.nsmallest</code> take <code>key=</code> too. If you only need the smallest few, do not sort
          everything (lesson 8).
        </li>
      </ul>
      <Note title="Comparing mixed types" warn>
        <p>
          Python 3 refuses to compare unrelated types, so sorting <code>[3, &quot;a&quot;]</code> raises <code>TypeError</code>. Floats can also go wrong:{" "}
          <code>float(&quot;nan&quot;)</code> is not less than, equal to or greater than anything, and a list with a NaN may come back only partly
          sorted.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/sort/practice/6/">SORT-P6, The departure board</Link>.
      </p>
    </>
  );
}
