import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { HuffmanFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Text is stored as bits. If common letters get short codes and rare letters get long ones, the text takes fewer bits. Huffman coding finds
        the best such codes with a short greedy method: keep joining the two rarest things. It is used inside zip files, PNG images and many
        other formats.
      </p>

      <h2 id="codes">Codes of different lengths</h2>
      <p>
        A <strong>code</strong> gives each letter a string of bits. With 6 letters, 3 bits each is enough (2³ = 2 × 2 × 2 = 8
        patterns). A text of 100 letters then takes 300 bits. But if the letter <code>f</code> makes up 45 of those 100 letters, giving it
        a 1-bit code saves 90 bits at once, even if rare letters need 4 bits.
      </p>
      <p>
        The difficulty is reading the bits back. If <code>f</code> is <code>0</code> and <code>a</code> is <code>01</code>, then{" "}
        <code>01</code> could be <code>a</code>, or <code>f</code> followed by some code that starts with <code>1</code>. Morse code solves this
        with pauses between letters. A better way needs no pauses at all.
      </p>

      <h2 id="prefix">Prefix-free codes are trees</h2>
      <p>
        A code is <strong>prefix-free</strong> when no letter&rsquo;s code is the start of another letter&rsquo;s code. Then the reader always
        knows where a code ends: as soon as the bits read so far form a whole code, that is the letter, because no longer code starts the same
        way.
      </p>
      <p>
        A prefix-free code is the same thing as a binary tree with the letters at the leaves. A letter&rsquo;s code is its path from the top:{" "}
        <code>0</code> for each step to the left, <code>1</code> for each step to the right. No code can be the start of another, because a leaf
        has nothing below it. Reading bits is walking down the tree, as the figure&rsquo;s &ldquo;Decode&rdquo; variant shows.
      </p>
      <p>
        The number of bits for the whole text is the <strong>cost</strong> of the tree: for each letter, its count times its depth (the length of
        its code). Huffman&rsquo;s method finds a tree with the smallest cost.
      </p>
      <p>
        In a best tree, every inner node has two children. If one had a single child, that node could be removed and everything below it moved
        up one level: every code under it gets one bit shorter, and the code stays prefix-free.
      </p>

      <h2 id="build">Building the tree</h2>
      <p>
        David Huffman found the method in 1952, as a student. Start with one tree per letter, weighed by its count. Then repeat until one tree is
        left:
      </p>
      <ol>
        <li>take out the two lightest trees;</li>
        <li>join them under a new node whose weight is the sum of theirs;</li>
        <li>put the new tree back.</li>
      </ol>

      <HuffmanFigure />

      <p>
        The greedy choice is &ldquo;join the two lightest&rdquo;. A tree that is joined early ends up deep, so its letters get long codes. Joining
        the light ones first gives long codes only to rare letters.
      </p>
      <p>
        A useful fact: every time two trees are joined, every letter inside them moves one level deeper, which adds the new node&rsquo;s weight
        to the cost. So the cost of the final tree is the <strong>sum of the weights of all the joined nodes</strong>. In the figure,{" "}
        <M>14 + 25 + 30 + 55 + 100 = 224</M>.
      </p>

      <h2 id="why">Why it is the best</h2>
      <p>The proof has the two parts from lesson 1: the first choice is safe, and what is left is the same kind of problem.</p>
      <p>
        <strong>The choice is safe (an exchange).</strong> Let <M>x</M> and <M>y</M> be the two rarest letters. Take any best tree. Its deepest
        level has two leaves with the same parent, say <M>a</M> and <M>b</M> (every inner node has two children). Swap <M>x</M> with <M>a</M>.{" "}
        <M>x</M> is at least as rare as <M>a</M>, and <M>a</M> was at least as deep as <M>x</M>, so the rarer letter moved down and the more
        common one moved up. The cost changes by{" "}
        <M>(count(a) − count(x)) × (depth(x) − depth(a))</M>, a number that is not negative times one that is not positive, so the cost does
        not go up. Do the same with <M>y</M> and <M>b</M>. Now there is a best tree where <M>x</M> and <M>y</M> are children of the same node, at the bottom.
      </p>
      <p>
        <strong>What is left is the same problem.</strong> Join <M>x</M> and <M>y</M> into one new letter <M>z</M> with{" "}
        <M>count(z) = count(x) + count(y)</M>. Any tree for the smaller set of letters becomes a tree for the full set by hanging <M>x</M> and{" "}
        <M>y</M> under <M>z</M>, and that adds exactly <M>count(x) + count(y)</M> to the cost. The amount added is the same whatever the tree,
        so the best tree for the smaller set gives the best tree for the full set. Huffman&rsquo;s method then solves the smaller set the same
        way, and induction (CORR-3) finishes the proof.
      </p>
      <Invariant label="Huffman">Some best tree has the two rarest letters as children of the same node, at the bottom.</Invariant>

      <h2 id="code">The code</h2>
      <CodeBlock
        title="huffman.py"
        code={`import heapq

def huffman_bits(counts):
    # counts: letter -> count
    heap = list(counts.values())
    heapq.heapify(heap)
    total = 0
    while len(heap) > 1:
        # the two lightest
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        # every letter under them
        total += a + b
        # moves one level down
        heapq.heappush(heap, a + b)
    return total`}
      />
      <p>
        This returns only the cost. To get the codes themselves, the heap must hold the trees too, as entries <code>(weight, n, tree)</code>.
        The number <code>n</code> is a counter that goes up by one for each entry: when two weights are equal, Python compares the counters and
        never has to compare two trees (HEAP-4 used the same idea). Then walk the final tree, adding <code>0</code> to the code when going left
        and <code>1</code> when going right.
      </p>
      <p>
        With <M>k</M> different letters there are <M>k − 1</M> joins, each costing <M>O(log k)</M> with a heap, so the build is{" "}
        <M>O(k log k)</M>. If the counts arrive already sorted, two plain queues do it in <M>O(k)</M>: joined trees are made in order of weight,
        so they can wait in a second queue, and the lightest tree is always at the front of one of the two queues.
      </p>
      <Note title="Ties, one letter, and how good it is">
        <p>
          When weights are equal, different choices give different trees, and so different codes, but they all have the same, smallest cost. A
          text with only one letter needs a code of at least 1 bit, so give it <code>0</code>.
        </p>
        <p>
          Huffman codes are the best codes that give each letter its own whole number of bits. Formats such as zip (DEFLATE) and PNG use them.
          Methods that do not give each letter a whole number of bits (arithmetic coding) can do slightly better on very uneven counts.
        </p>
      </Note>
    </>
  );
}
