import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MedianFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Values arrive one at a time, and after each one you want the median of everything so far. Two heaps facing each other answer this in{" "}
        <M>O(log n)</M> per value and <M>O(1)</M> per question.
      </p>

      <h2 id="problem">The problem</h2>
      <p>
        The <strong>median</strong> of a list is its middle value once sorted. With an even number of values there are two middle values, and the
        median is their average. Unlike the average of all values, the median is not pulled far by a few extreme values, which is why it is used
        for response times, prices and sensor readings.
      </p>
      <p>
        Simple answers are slow. Sorting after every new value costs <M>O(n log n)</M> each time. Keeping one sorted list and inserting each value
        in its place costs <M>O(n)</M> per insert, because the values after it must shift. With <M>n</M> values, that is{" "}
        <M>
          O(n<sup>2</sup>)
        </M>{" "}
        in total (<M>n</M> times <M>n</M>).
      </p>

      <h2 id="two">Two heaps</h2>
      <p>
        The median only depends on the values in the middle. So split the values into two halves: <code>low</code>, the smaller half, and{" "}
        <code>high</code>, the larger half. Keep <code>low</code> as a max-heap (its largest value on top) and <code>high</code> as a min-heap
        (its smallest value on top). The two tops are then the two values nearest the middle.
      </p>
      <Invariant label="Invariant">Every value in low is at most every value in high, and low has as many values as high, or one more.</Invariant>
      <p>
        With that, the median is the top of <code>low</code> when the count is odd, and the average of the two tops when it is even. To add a
        value <M>x</M>:
      </p>
      <ol>
        <li>
          If <code>low</code> is empty or <M>x</M> is at most the top of <code>low</code>, push it into <code>low</code>; otherwise push it into{" "}
          <code>high</code>. This keeps the first half of the invariant.
        </li>
        <li>
          If <code>low</code> now has two more values than <code>high</code>, move the top of <code>low</code> to <code>high</code>. If{" "}
          <code>high</code> now has more than <code>low</code>, move the top of <code>high</code> to <code>low</code>. Moving a top across keeps
          the order: it is the value closest to the other half.
        </li>
      </ol>
      <p>Step through the figure with the stream 5, 15, 1, 3, 8, 7, 9, 10.</p>

      <MedianFigure />

      <h2 id="code">The code and its cost</h2>
      <CodeBlock
        code={`import heapq

class MedianFinder:
    def __init__(self):
        # max-heap of the smaller half, as negated values
        self.low = []
        self.high = []  # min-heap of the larger half

    def add(self, x):
        if not self.low or x <= -self.low[0]:
            heapq.heappush(self.low, -x)
        else:
            heapq.heappush(self.high, x)
        if len(self.low) > len(self.high) + 1:
            heapq.heappush(self.high, -heapq.heappop(self.low))
        elif len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2`}
      />
      <p>
        Each <code>add</code> does at most three heap operations, so it costs <M>O(log n)</M>. Each <code>median</code> reads two tops:{" "}
        <M>O(1)</M>. For <M>n</M> values the total is <M>O(n log n)</M>, against{" "}
        <M>
          O(n<sup>2</sup>)
        </M>{" "}
        for the sorted list. Practice HEAP-P6 checks this by counting comparisons.
      </p>

      <h2 id="more">Other orders and windows</h2>
      <ul>
        <li>
          <strong>Any position, not just the middle.</strong> To track the 90th percentile, keep <code>low</code> at 90% of the values instead of
          half. The same two-heap idea works for any fixed fraction.
        </li>
        <li>
          <strong>A sliding window.</strong> For the median of the last <M>w</M> values only, values must also leave. Use lazy removal (lesson 4):
          count the values that should leave each heap and drop them when they reach a top. Each step is still <M>O(log w)</M> on average.
        </li>
        <li>
          <strong>The k-th smallest of a fixed list.</strong> If all the values are there at the start and you need one order position once,
          quickselect (DVCQ) does it in <M>O(n)</M> on average, with no heap.
        </li>
      </ul>
      <Note title="In practice">
        <p>
          A sorted list with <code>bisect.insort</code> is <M>O(n)</M> per insert, but the shifting is fast machine code, so for tens of thousands
          of values it can be as quick as two heaps in Python. The heaps win as <M>n</M> grows, and their cost does not depend on luck.
        </p>
      </Note>
    </>
  );
}
