import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { DigitFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        How many numbers below 10¹⁸ (a 1 followed by 18 zeros) have digits that add up to 100? Checking each number would take millions of years. But a number is built
        from its digits one place at a time, and most of the places, once the number is known to be below the limit, can be anything. Digit DP
        counts all of them at once.
      </p>

      <h2 id="count">Counting up to N</h2>
      <p>
        The questions have the form: how many whole numbers x with <M>a ≤ x ≤ b</M> have some property of their digits? First turn the range
        into two counts from zero. Let <code>f(N)</code> be the count among 0, 1, …, N. Then the answer is{" "}
        <M>f(b) − f(a − 1)</M>: the numbers up to b, minus those below a. Watch the − 1: <M>f(b) − f(a)</M> would lose a itself.
      </p>
      <p>
        Now write N with its digits, say L of them, and think of every number from 0 to N as written with exactly L digits, with zeros in
        front when it is shorter (7 becomes 0007 when N = 2357). A number is then a choice of one digit per place, from the left.
      </p>

      <h2 id="tight">Tight or free</h2>
      <p>
        The limit “at most N” affects a place only while all the digits chosen so far equal N’s digits. Call that state{" "}
        <strong>tight</strong>. While tight, the next digit can be at most N’s digit at that place:
      </p>
      <ul>
        <li>a smaller digit makes the number smaller than N whatever comes after: the rest of the places are now <strong>free</strong>, 0 to 9 each;</li>
        <li>N’s own digit keeps the number tight;</li>
        <li>a larger digit would make the number larger than N: not allowed.</li>
      </ul>
      <p>
        Once free, always free. So every number up to N leaves the tight path at exactly one place (or never, for N itself), by choosing a
        smaller digit there. That splits the count into a few blocks of free numbers, and a free block is easy to count: for a digit sum, it is
        the number of ways r free digits can add up to t, a small table. The figure counts the numbers up to 2357 whose digits add up to 10.
      </p>
      <DigitFigure />

      <h2 id="code">The state and the code</h2>
      <p>
        In general, the state is (place, what the property needs to remember about the digits so far, tight or not). The rule tries every
        allowed digit at this place and moves to the next place. For the digit sum, “what to remember” is the sum so far:
      </p>
      <CodeBlock
        title="digit_sum.py"
        code={`from functools import cache

def count_digit_sum(N, S):
    """How many of 0, 1, ..., N have digits that add up to S."""
    digits = list(map(int, str(N)))

    @cache
    def go(pos, total, tight):
        if total > S:
            return 0                     # too big already
        if pos == len(digits):
            return 1 if total == S else 0
        top = digits[pos] if tight else 9
        return sum(go(pos + 1, total + d, tight and d == top)
                   for d in range(top + 1))
    return go(0, 0, True)`}
      />
      <Invariant label="Tight">go(pos, total, tight) counts the ways to fill places pos … L − 1 so that the whole number stays at most N, given the digits so far.</Invariant>
      <p>
        <strong>Why the memo works.</strong> When tight is False, the count depends only on how many places are left and the sum so far, not on
        which digits came before. Many different beginnings reach the same (pos, total, False), and the memo answers each of them once. When
        tight is True, the digits so far are N’s own, so there is just one such state per place.
      </p>
      <p>
        <strong>Cost.</strong> States: for N up to 10¹⁸, at most 19 places × 172 sums × 2 tight values, each trying 10 digits: about 65,000 steps
        instead of 10¹⁸. The recursion is only as deep as the number of digits, so <code>@cache</code> is safe in the browser.
      </p>

      <h2 id="started">Leading zeros</h2>
      <p>
        Writing 7 as 0007 adds zeros that are not really digits of 7. For a digit sum they do no harm. For other properties they do: “no two
        neighbouring digits are equal” would wrongly reject 7 because of “00”, and “contains the digit 0” would wrongly accept it. So add a
        fourth part to the state, <strong>started</strong>: False while only zeros have been placed. While not started, a 0 is not a digit of
        the number, so it is not compared with anything and not counted; the first nonzero digit starts the number. The number 0 itself, all
        zeros, needs a decision of its own: the practice problem counts it as a number with one digit, 0.
      </p>
      <p>
        For “no two neighbouring digits equal”, the state is (place, previous digit, tight, started). A free count also has a simple formula: a
        started number with r more free places has 9 choices at each, anything but the previous digit, so <M>9ʳ</M> ways (r nines multiplied
        together). The practice problem asks for this count in a range, with a and b up to 10¹⁸.
      </p>

      <h2 id="more">Other questions</h2>
      <ul>
        <li>
          <strong>Divisible by k:</strong> remember the number’s remainder modulo k so far; adding digit d changes remainder r to{" "}
          <M>(10r + d) mod k</M> (MATH-2). States: places × k × 2.
        </li>
        <li>
          <strong>How many times digit d appears</strong> in all numbers up to N: return two things from each state, how many numbers and how
          many d’s among them, and add them up.
        </li>
        <li>
          <strong>The k-th number with the property:</strong> count, then choose digits from the left. At each place, try digits in order and
          skip a digit whose whole free block holds fewer than the k you still need, subtracting its count. This is the same walk as the figure,
          used to find rather than to count. Or binary search on N with the count (BSRC-4).
        </li>
        <li>
          <strong>Other bases:</strong> the same method works in base 2 (counting numbers with some pattern of bits) with 2 choices per place
          instead of 10.
        </li>
      </ul>
      <Note title="Writing it as a loop">
        <p>
          The memoised version is the clearest. A table version keeps, for each place, a dictionary from (remembered value, started) to the
          count of free numbers, plus the single tight state, and moves one place to the right in each round. It avoids recursion, which matters
          only when the “digits” are many, such as a number given as a string of 10,000 digits.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/addp/practice/5/">ADDP-P5, No digit twice in a row</Link>.
      </p>
    </>
  );
}
