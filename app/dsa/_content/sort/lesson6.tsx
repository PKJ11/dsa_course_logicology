import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { CountingFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        When the values are whole numbers in a small range, you can sort without comparing at all. Count how many times each value appears, then
        write them out in order. This runs in linear time.
      </p>

      <h2 id="counting">Counting sort</h2>
      <p>
        Suppose every value is a whole number from 0 to <M>k − 1</M>. Make a list of <M>k</M> counters. One pass over the input counts each value.
        Then go through the counters in order and write each value as many times as it was counted.
      </p>

      <CountingFigure />

      <p>
        When every value is a whole number from 0 to <M>k − 1</M>, make a list <code>count</code> of <M>k</M> zeros. One pass over the input adds
        1 to <code>count[v]</code> for each value <code>v</code>. A second pass goes through <M>v</M> = 0, 1, …, <M>k − 1</M> and writes each{" "}
        <code>v</code> out <code>count[v]</code> times. Writing it is <Link href="/dsa/sort/practice/5/">SORT-P5</Link>.
      </p>
      <p>
        One pass of <M>n</M> and one pass of <M>k</M>: <M>O(n + k)</M> time and <M>O(k)</M> extra space for the counters. When <M>k</M> is no bigger
        than about <M>n</M>, that is <M>O(n)</M>. When <M>k</M> is huge, for example values up to a billion, the counter list is the problem, and a
        comparison sort is better.
      </p>

      <h2 id="stable">A stable version, for records</h2>
      <p>
        Real data is usually records sorted by a key, such as trains by platform number. Writing out &ldquo;the value <M>v</M>, <M>count[v]</M>{" "}
        times&rdquo; loses the records. Instead, turn the counts into starting positions, then place each record:
      </p>
      <CodeBlock
        code={`def counting_sort_by(recs, key, k):
    count = [0] * k
    for r in recs:
        count[key(r)] += 1
    start = [0] * k                   # where each key's block begins
    for v in range(1, k):
        start[v] = start[v - 1] + count[v - 1]
    out = [None] * len(recs)
    for r in recs:                    # in input order: stable
        out[start[key(r)]] = r
        start[key(r)] += 1
    return out`}
      />
      <p>
        <code>start</code> is a prefix sum of the counts (<Link href="/dsa/arrs/4/">ARRS-4</Link>). Records are placed in the order they arrive, so
        records with equal keys keep their order. The sort is stable, which radix sort depends on.
      </p>

      <h2 id="radix">Radix sort</h2>
      <p>
        Numbers up to a billion are too spread out for one counting sort. But each digit is only 0 to 9. Radix sort sorts by the last digit, then
        by the one before it, and so on, with a stable counting sort each time. Step through the second version of the figure.
      </p>
      <p>
        Why it works: after sorting by the last <M>t</M> digits, the list is in order of those <M>t</M> digits. The next pass sorts by digit{" "}
        <M>t + 1</M>. Values that tie on that digit keep their order from before, because the pass is stable, so they stay ordered by their
        last <M>t</M> digits. By induction, after all <M>d</M> passes the list is sorted.
      </p>
      <p>
        Cost: <M>d</M> passes of <M>O(n + b)</M>, where <M>b</M> is the base (10 for decimal digits). Using base 2¹⁶ (16 twos multiplied together, 65,536) for 32-bit numbers needs only 2
        passes.
      </p>
      <Note title="When to use them">
        <p>
          In Python, <code>sorted()</code> runs in C and is very fast, so counting sort wins mainly when <M>n</M> is large and <M>k</M> is small: ages,
          exam marks, letters. Radix sort matters most in lower-level languages and for fixed-width keys, such as strings of equal length (STRG
          station, suffix arrays).
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/sort/practice/5/">SORT-P5, Passenger ages</Link>.
      </p>
    </>
  );
}
