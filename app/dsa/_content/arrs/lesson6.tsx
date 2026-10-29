import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { PalindromeFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        A string is an array of characters. Everything in this station works on strings: indexes, slices, two pointers and windows. The one big
        difference is that a Python string cannot be changed.
      </p>

      <h2 id="immutable">Strings cannot change</h2>
      <p>
        <code>s[0] = &quot;X&quot;</code> is an error. Every operation that seems to change a string, such as <code>s + t</code>, <code>s.upper()</code>{" "}
        or <code>s.replace(…)</code>, builds a new one. So:
      </p>
      <ul>
        <li>
          Building a string piece by piece with <code>+=</code> can cost <M>O(n²)</M> (n times n): each step may copy the whole string so far. Collect the pieces in a list and call{" "}
          <code>&quot;&quot;.join(parts)</code> once (<Link href="/dsa/bigo/8/">BIGO-8</Link>).
        </li>
        <li>
          To change characters in place, turn the string into a list with <code>list(s)</code>, change the list, then join it.
        </li>
        <li>
          Slices copy. <code>s[1:]</code> is a new string of <M>n − 1</M> characters.
        </li>
      </ul>

      <h2 id="chars">Characters are numbers</h2>
      <p>
        Each character has a number, its <em>code point</em>. <code>ord(&quot;a&quot;)</code> is 97 and <code>chr(97)</code> is <code>&quot;a&quot;</code>.
        The letters a to z have neighbouring numbers, so <code>ord(ch) - ord(&quot;a&quot;)</code> turns a lower-case letter into 0 to 25. That makes a
        list of 26 counts work like a small, fast dictionary:
      </p>
      <CodeBlock
        code={`def is_anagram(s, t):            # same letters, any order
    if len(s) != len(t):
        return False
    count = [0] * 26
    for ch in s:
        count[ord(ch) - ord("a")] += 1
    for ch in t:
        count[ord(ch) - ord("a")] -= 1
    return all(c == 0 for c in count)`}
      />
      <p>
        This is <M>O(n)</M> time and <M>O(1)</M> extra space, because the list is always 26 long. Sorting both strings and comparing also works, in{" "}
        <M>O(n log n)</M>. <code>collections.Counter(s) == Counter(t)</code> is the short Python version, and it works for any characters.
      </p>

      <h2 id="palindromes">Palindromes</h2>
      <p>
        A <em>palindrome</em> reads the same forwards and backwards, like <code>&quot;level&quot;</code>. The quick test is <code>s == s[::-1]</code>,
        which builds a reversed copy. Two pointers do it without a copy, and they can skip characters that should be ignored:
      </p>

      <PalindromeFigure />

      <CodeBlock
        code={`def is_palindrome(s):
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if not s[lo].isalnum():
            lo += 1
        elif not s[hi].isalnum():
            hi -= 1
        elif s[lo].lower() != s[hi].lower():
            return False
        else:
            lo += 1
            hi -= 1
    return True`}
      />
      <p>
        The pointers always close in, so the loop runs at most <M>n</M> times. A practice twist: what if you may delete one character? At the first
        mismatch, you must delete either <code>s[lo]</code> or <code>s[hi]</code>. Try both, and check the rest with plain two pointers.
      </p>

      <h2 id="searching">Searching inside a string</h2>
      <p>
        <code>t in s</code> and <code>s.find(t)</code> look for one string inside another. In the worst case the simple method compares{" "}
        <M>len(t)</M> characters at each of about <M>len(s)</M> places, which is <M>O(n × m)</M>. CPython uses a faster method in practice. The STRG
        station covers methods that guarantee <M>O(n + m)</M>, such as KMP and the Z-function.
      </p>
      <Note title="Unicode">
        <p>
          Python strings hold any Unicode character, not just a to z. <code>len(&quot;é&quot;)</code> can be 1 or 2, depending on how the é was typed.
          Problems in this course use plain lower-case letters unless they say otherwise.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/arrs/practice/5/">ARRS-P5, Nearly a palindrome</Link>.
      </p>
    </>
  );
}
