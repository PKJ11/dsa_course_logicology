import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { FrontFigure } from "./figures";

export default function Lesson8() {
  return (
    <>
      <p className="lesson__lede">
        Python hides loops inside short lines. One innocent line inside a loop can turn a fast program into a slow one. This lesson lists the
        costs you need to know.
      </p>

      <h2 id="table">The cost of common operations</h2>
      <p>Here <M>n</M> is the size of the list, string, set or dict, and <M>k</M> is the size of a slice or of the other operand.</p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Time cost of common Python operations</caption>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Cost</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>a[i]</code>, <code>a[i] = x</code>, <code>len(a)</code></td><td><M>O(1)</M></td><td>the place is worked out directly</td></tr>
            <tr><td><code>a.append(x)</code>, <code>a.pop()</code></td><td><M>O(1)</M> amortised</td><td>lesson 7</td></tr>
            <tr><td><code>a.pop(0)</code>, <code>a.insert(0, x)</code></td><td><M>O(n)</M></td><td>every later value moves</td></tr>
            <tr><td><code>x in a</code>, <code>a.index(x)</code>, <code>a.count(x)</code>, <code>a.remove(x)</code></td><td><M>O(n)</M></td><td>checks values one by one</td></tr>
            <tr><td><code>a[i:j]</code></td><td><M>O(k)</M></td><td>copies <M>k = j − i</M> values</td></tr>
            <tr><td><code>a + b</code>, <code>sum(a)</code>, <code>min(a)</code>, <code>max(a)</code></td><td><M>O(n)</M></td><td>reads every value</td></tr>
            <tr><td><code>sorted(a)</code>, <code>a.sort()</code></td><td><M>O(n log n)</M></td><td>SORT station</td></tr>
            <tr><td><code>x in s</code>, <code>s.add(x)</code>, <code>d[k]</code></td><td><M>O(1)</M> average</td><td>hashing (HASH station)</td></tr>
            <tr><td><code>d.popleft()</code>, <code>d.appendleft(x)</code> on a deque</td><td><M>O(1)</M></td><td>a deque can grow at both ends</td></tr>
            <tr><td><code>s + t</code> on strings</td><td><M>O(n + k)</M></td><td>strings cannot change, so a new one is built</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="pop0">Removing from the front</h2>
      <p>
        Values in a list sit side by side from index 0. Remove the first one and every other value must move one place to the left. Step
        through it:
      </p>

      <FrontFigure />

      <p>
        A queue that serves people in the order they arrived takes from the front. Written with <code>pop(0)</code>, it is <M>Θ(n²)</M> overall.
        Written with <code>collections.deque</code>, it is <M>Θ(n)</M>. The STAQ station uses deques throughout.
      </p>

      <h2 id="strings">Building strings</h2>
      <p>
        A Python string cannot be changed after it is made. So <code>s = s + t</code> builds a whole new string and copies both parts into it.
        In a loop, the copies grow each time:
      </p>
      <CodeBlock
        code={`out = ""
for w in words:
    out = out + w + " "      # may copy everything so far, every time

out = " ".join(words)        # one pass: O(total length)`}
      />
      <p>
        CPython sometimes avoids the copy in the first version, but you cannot rely on it. Collect the parts in a list and join them once.
      </p>

      <h2 id="slices">Slices and copies</h2>
      <p>
        <code>a[1:]</code> looks like one step, but it copies <M>n − 1</M> values. A recursive function that passes <code>a[1:]</code> to itself does{" "}
        <M>n + (n − 1) + … + 1</M> copying in total, which grows with n times n: <M>Θ(n²)</M>. Pass an index instead:
      </p>
      <CodeBlock
        code={`def total(a):             # Θ(n²) because of the slices
    return 0 if not a else a[0] + total(a[1:])

def total(a, i=0):        # Θ(n)
    return 0 if i == len(a) else a[i] + total(a, i + 1)`}
      />

      <h2 id="in">in on a list</h2>
      <p>
        <code>x in a</code> on a list checks values one by one. Inside a loop over <M>n</M> values, it makes the whole loop <M>Θ(n²)</M>. If you
        test membership more than a few times, build a set once and test against the set.
      </p>
      <Note title="Measure when unsure">
        <p>
          When you are not sure what a line costs, time it at two sizes. Run it with <M>n</M> and with <M>2n</M>. If the time doubles, it is
          linear. If it goes up four times, it is quadratic. <code>time.perf_counter()</code> gives a precise clock.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bigo/practice/3/">BIGO-P3, Keep the first of each</Link>, where <code>in</code> on a list is the slow part.
      </p>
    </>
  );
}
