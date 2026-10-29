import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TopFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Two common jobs need only a small heap, however big the input: picking the <M>k</M> largest values, and merging <M>k</M> sorted lists. In
        both, the heap holds <M>k</M> items, so each step costs <M>O(log k)</M> instead of <M>O(log n)</M>.
      </p>

      <h2 id="topk">The k largest</h2>
      <p>
        To find the <M>k</M> largest values, it seems natural to use a max-heap. Do the opposite: keep the <M>k</M> largest values{" "}
        <em>seen so far</em> in a <strong>min</strong>-heap. Its root is the smallest of them, the value a newcomer has to beat.
      </p>
      <Invariant label="Invariant">After each value of the input, the heap holds the k largest values seen so far, with the smallest of them at the root.</Invariant>
      <p>
        For each new value: if it is not bigger than the root, at least <M>k</M> values seen so far beat it, so it cannot be in the answer; skip
        it after one comparison. If it is bigger, the root can no longer be in the answer: replace the root with the new value and sift down.
        Step through the first variant.
      </p>

      <TopFigure />

      <CodeBlock
        code={`import heapq

def top_k(nums, k):
    h = nums[:k]
    heapq.heapify(h)
    for x in nums[k:]:
        if x > h[0]:
            heapq.heapreplace(h, x)  # pop the smallest, push x
    return sorted(h, reverse=True)`}
      />
      <p>
        The cost is <M>O(n log k)</M> time and <M>O(k)</M> extra space. The input can be a stream too big to hold in memory, such as the lines of
        a huge log file: only <M>k</M> values are kept. On input in random order the newcomers rarely win, so the work is close to one comparison
        per value.
      </p>

      <h2 id="choose">Choosing a method</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Ways to find the k largest values</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>Time</th>
              <th>Extra space</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sort everything, take k</td>
              <td>
                <M>O(n log n)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
            <tr>
              <td>Min-heap of size k</td>
              <td>
                <M>O(n log k)</M>
              </td>
              <td>
                <M>O(k)</M>
              </td>
            </tr>
            <tr>
              <td>Heapify all (a max-heap), pop k</td>
              <td>
                <M>O(n + k log n)</M>
              </td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
            <tr>
              <td>Quickselect, then sort the k</td>
              <td>
                <M>O(n + k log k)</M> on average
              </td>
              <td>
                <M>O(n)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        When <M>k</M> is small, the size-k heap is the usual choice. When <M>k</M> is close to <M>n</M>, just sort. Quickselect (DVCQ) is the
        fastest on average but needs the whole input in memory.
      </p>

      <h2 id="merge">Merging k sorted lists</h2>
      <p>
        SORT-2 merged two sorted lists by comparing their front values. With <M>k</M> lists, finding the smallest front value by looking at all{" "}
        <M>k</M> costs <M>O(k)</M> per output value, <M>O(nk)</M> in total. A min-heap of the front values finds it in <M>O(log k)</M>:
      </p>
      <ol>
        <li>Put the front value of each non-empty list in a min-heap, together with which list it came from.</li>
        <li>Pop the smallest entry and append its value to the output.</li>
        <li>If that list has a next value, push it. Repeat until the heap is empty.</li>
      </ol>
      <p>
        Step through the second variant. Each of the <M>n</M> values goes into the heap once and out once: <M>O(n log k)</M> time, and{" "}
        <M>O(k)</M> space besides the output.
      </p>
      <CodeBlock
        code={`def merge_k(lists):
    h = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    heapq.heapify(h)
    out = []
    while h:
        v, i, j = h[0]
        out.append(v)
        if j + 1 < len(lists[i]):
            heapq.heapreplace(h, (lists[i][j + 1], i, j + 1))
        else:
            heapq.heappop(h)
    return out`}
      />
      <p>
        The entries are <code>(value, list number, position)</code>. When two values are equal, the list number settles the order, so the
        comparison never reaches anything that cannot be compared.
      </p>

      <h2 id="python">In Python</h2>
      <ul>
        <li>
          <code>heapq.nlargest(k, xs)</code> and <code>heapq.nsmallest(k, xs)</code> use the size-k heap, and also accept a <code>key</code>{" "}
          function, as <code>sorted</code> does. For <M>k = 1</M> use <code>max</code> or <code>min</code>; when <M>k</M> is near <M>n</M>, use{" "}
          <code>sorted</code>.
        </li>
        <li>
          <code>heapq.merge(*iterables)</code> merges lazily: it returns an iterator and reads each input only as far as it needs. That makes it
          the tool for <strong>external sorting</strong>: sort chunks of a file too big for memory, write each sorted chunk to disk, then merge
          the chunks with one pass.
        </li>
      </ul>
      <Note title="Why a min-heap for the largest?">
        <p>
          The heap&rsquo;s job here is to answer one question quickly: &ldquo;what is the weakest member of the current top k?&rdquo; That is the
          smallest of them, so it belongs at the root of a min-heap. A max-heap would put the strongest member on top, which is never the one you
          need to compare with or throw out.
        </p>
      </Note>
    </>
  );
}
