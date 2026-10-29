import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TwoPointerFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Two pointers are two indexes that move through a list, usually towards each other or in the same direction. On a sorted list they can
        replace a check of every pair. The time then grows in step with n, written <M>O(n)</M>, instead of with n times n, written{" "}
        <M>O(n²)</M>.
      </p>

      <h2 id="pair">Finding a pair in a sorted list</h2>
      <p>
        You have a sorted list and a target. Is there a pair of values, at different positions, that adds up to the target? Checking every pair
        takes about <M>n² / 2</M> additions (n times n, halved). Two pointers need at most <M>n − 1</M> moves.
      </p>
      <p>
        Put <code>lo</code> at the first index and <code>hi</code> at the last. While <M>lo &lt; hi</M>, add the two values. If the sum is the
        target, you have found the pair. Otherwise, one pointer moves:
      </p>
      <CodeBlock
        code={`s = a[lo] + a[hi]
if s > target:
    hi -= 1          # a[hi] is too big for any partner
else:
    lo += 1          # a[lo] is too small for any partner`}
      />
      <p>
        When the two pointers meet, no pair is left to check, and there is no answer. Writing the whole function is{" "}
        <Link href="/dsa/arrs/practice/1/">ARRS-P1</Link>.
      </p>

      <TwoPointerFigure />

      <h2 id="why">Why it never skips the answer</h2>
      <p>Each move rules out one value for good. The proof is an invariant (CORR-2):</p>
      <Invariant>If a pair exists, both of its values are inside a[lo..hi].</Invariant>
      <ul>
        <li>
          <strong>Start.</strong> The window is the whole list, so the statement is true.
        </li>
        <li>
          <strong>Keep.</strong> Suppose <M>a[lo] + a[hi] &gt; target</M>. Every other value in the window is at least <M>a[lo]</M>, because the list
          is sorted. So <M>a[hi]</M> plus any partner in the window is too big, and <M>a[hi]</M> is in no pair. Dropping it keeps the statement true.
          The case &ldquo;too small&rdquo; is the mirror image.
        </li>
        <li>
          <strong>Finish.</strong> When <M>lo = hi</M> the window holds one value, which cannot make a pair on its own. So no pair exists.
        </li>
      </ul>
      <p>
        Each pass moves <code>lo</code> or <code>hi</code> by one, so the window shrinks by one each time: at most <M>n − 1</M> passes. The method
        needs the list to be sorted. On an unsorted list, sort first (<M>O(n log n)</M>) or use a set (<Link href="/dsa/bigo/practice/1/">BIGO-P1</Link>).
      </p>

      <h2 id="same">Pointers in the same direction</h2>
      <p>
        The other common shape has a slow pointer and a fast pointer, both moving right. The fast one reads every value. The slow one marks where
        the next value to keep should go. Removing repeats from a sorted list, in place:
      </p>
      <CodeBlock
        code={`def remove_repeats(a):
    w = 0                        # a[0..w-1] is the answer so far
    for r in range(len(a)):
        if w == 0 or a[r] != a[w - 1]:
            a[w] = a[r]
            w += 1
    del a[w:]                    # drop what is left over`}
      />
      <p>
        <code>w</code> never passes <code>r</code>, so the writes never cover a value that has not been read yet. This is <M>O(n)</M> time and{" "}
        <M>O(1)</M> extra space. Calling <code>a.remove(x)</code> in a loop instead would be <M>O(n²)</M>: each call can shift up to n values.
      </p>

      <h2 id="when">When to reach for two pointers</h2>
      <ul>
        <li>The list is sorted, or can be sorted, and you want pairs that meet a condition.</li>
        <li>You need to change a list in place with <M>O(1)</M> extra space.</li>
        <li>You compare a sequence with its own reverse, as in palindromes (lesson 6).</li>
        <li>You merge two sorted lists, with one pointer in each (SORT-2).</li>
      </ul>
      <Note title="The three-way split">
        <p>
          <Link href="/dsa/corr/practice/3/">CORR-P3</Link> used three pointers to split a list into 0s, 1s and 2s. The same idea splits a list
          around a chosen value in quick sort (SORT-3).
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/arrs/practice/1/">ARRS-P1, Two timings that match</Link>.
      </p>
    </>
  );
}
