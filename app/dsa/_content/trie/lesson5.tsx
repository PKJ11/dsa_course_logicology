import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { XorFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A trie works on any sequence of symbols, and a number written in binary is a sequence of 0s and 1s. A trie of numbers, read from the
        highest bit down, answers questions about XOR that would otherwise need every pair of numbers.
      </p>

      <h2 id="bits">Numbers as words of bits</h2>
      <p>
        In binary, every digit is a <strong>bit</strong>, 0 or 1, and the digits are worth 1, 2, 4, 8, … from the right: the bit in place{" "}
        <M>k</M> (counting from 0 on the right) is worth{" "}
        <M>
          2<sup>k</sup>
        </M>
        , that is, <M>k</M> twos multiplied together (and 2⁰ is 1). So <code>1010</code> is 8 + 2 = 10. In Python, <code>bin(10)</code> gives{" "}
        <code>&apos;0b1010&apos;</code>, and <code>x &gt;&gt; k &amp; 1</code> reads bit <M>k</M> of <M>x</M>: <code>&gt;&gt; k</code> shifts the
        bits <M>k</M> places to the right, and <code>&amp; 1</code> keeps only the last one.
      </p>
      <p>
        <strong>XOR</strong> (&ldquo;exclusive or&rdquo;, written <code>^</code> in Python) combines two numbers bit by bit: a result bit is 1
        when the two bits differ, and 0 when they are the same. So <code>0011 ^ 1001 = 1010</code>, that is, 3 XOR 9 = 10. Two facts are used
        often: <code>x ^ x = 0</code>, and <code>x ^ 0 = x</code>.
      </p>
      <p>
        To store numbers in a trie, write them all with the same number of bits, <M>B</M>, highest bit first. Each number becomes a word of
        exactly <M>B</M> letters over the alphabet 0 and 1, and every leaf is on the bottom level. Numbers below about a billion fit in 30 bits,
        since{" "}
        <M>
          2<sup>30</sup>
        </M>{" "}
        = 1,073,741,824.
      </p>

      <h2 id="greedy">The best partner, bit by bit</h2>
      <p>
        The question: given a number <M>x</M>, which stored number <M>y</M> makes <code>x ^ y</code> as large as possible? Trying every <M>y</M>{" "}
        costs <M>O(n)</M>. The trie does it in <M>B</M> steps. Walk down from the root. At each level, look at <M>x</M>&rsquo;s bit, and take the
        edge with the <em>opposite</em> bit if it exists, because that makes this result bit 1. If it does not exist, take the other edge, and
        this result bit is 0.
      </p>

      <XorFigure />

      <p>Why is it right to grab a 1 in the highest place, even if it leads to 0s everywhere below? Because one bit outweighs all the bits below it:</p>
      <Invariant label="Reason">
        2<sup>k</sup> is more than 2<sup>k−1</sup> + … + 2 + 1, which equals 2<sup>k</sup> − 1.
      </Invariant>
      <p>
        So any number with a 1 in place <M>k</M> beats any number with a 0 there, if they agree in the higher places. The walk fixes the result
        one bit at a time, from the top, and each choice is the best possible given the bits above it. A choice that looks good now and is
        never wrong later is called a <strong>greedy</strong> choice; GRDY studies when such choices are safe.
      </p>
      <p>
        The largest XOR of <em>any two</em> stored numbers is then the largest best-partner result over all the numbers (the third variant). It
        is enough to compare each number with the numbers inserted before it: insert the numbers one by one, and before inserting <M>x</M>, find
        its best partner among those already stored.
      </p>

      <h2 id="code">The code and its cost</h2>
      <CodeBlock
        code={`B = 30  # numbers below 2**30

def max_xor(nums):
    root = [None, None]          # a node: [child for 0, child for 1]
    best = 0
    for i, x in enumerate(nums):
        if i > 0:                # best partner among earlier numbers
            node, r = root, 0
            for k in range(B - 1, -1, -1):
                b = x >> k & 1
                if node[1 - b] is not None:   # the opposite bit
                    r |= 1 << k               # this result bit is 1
                    node = node[1 - b]
                else:
                    node = node[b]
            best = max(best, r)
        node = root              # insert x
        for k in range(B - 1, -1, -1):
            b = x >> k & 1
            if node[b] is None:
                node[b] = [None, None]
            node = node[b]
    return best`}
      />
      <p>
        A node with only two possible children can be a list of two items instead of a dict, which is smaller and faster. <code>1 &lt;&lt; k</code>{" "}
        is{" "}
        <M>
          2<sup>k</sup>
        </M>
        , and <code>r |= 1 &lt;&lt; k</code> sets bit <M>k</M> of <M>r</M> to 1 (<code>|</code> is bitwise &ldquo;or&rdquo;).
      </p>
      <p>
        Each number costs one walk down and one insert, <M>2B</M> steps, so the total is <M>O(n · B)</M> time and at most <M>n · B</M> nodes. For
        100,000 numbers of 30 bits that is about 6 million steps, against about 5 billion pairs for the direct method. Practice TRIE-P5 asks for
        this.
      </p>

      <h2 id="more">Other questions it answers</h2>
      <ul>
        <li>
          <strong>The largest XOR of a stretch of a list.</strong> Let <M>p[i]</M> be the XOR of the first <M>i</M> items. Because{" "}
          <code>x ^ x = 0</code>, the XOR of items <M>i</M> to <M>j − 1</M> is <code>p[j] ^ p[i]</code>: the shared start cancels out. This is
          the prefix-sum idea of HASH-6 with XOR in place of plus. So the answer is the largest XOR of two prefix values, the same problem.
        </li>
        <li>
          <strong>Counting pairs with XOR below a limit.</strong> Keep a count on every node, as in lesson 2. Walking down beside the limit, each
          step can add a whole branch&rsquo;s count at once.
        </li>
        <li>
          <strong>Removing numbers.</strong> With counts, delete subtracts 1 along the path, and the walk only takes edges whose count is above
          0.
        </li>
      </ul>
      <Note title="A method without a trie">
        <p>
          The largest XOR can also be built one bit at a time with a set. For each place from the top, guess that the answer has a 1 there,
          put the top bits of every number into a set, and check whether two of them XOR to the guess (look up <code>guess ^ a</code> for each{" "}
          <code>a</code>). It is also <M>O(n · B)</M> and uses less memory. The trie is easier to extend to the other questions above.
        </p>
      </Note>
    </>
  );
}
