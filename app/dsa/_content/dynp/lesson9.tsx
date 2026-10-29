import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BackFigure } from "./figures";

export default function Lesson9() {
  return (
    <>
      <p className="lesson__lede">
        A DP table holds values: the LCS length, the best total. Usually you also want the thing itself: the letters, the items, the route.
        This lesson shows how to get it by walking back through the table, how to store choices when walking back is hard, and what to do when
        memory is short.
      </p>

      <h2 id="value">A number is not a choice</h2>
      <p>
        Every cell&rsquo;s value came from one of a few cells, through one of a few choices: take or skip, match or drop. The table does not record
        which. But the rule can be checked again: if a cell&rsquo;s value equals what one choice would give, that choice is a valid way to reach
        it. Starting from the answer cell and repeating this check leads back to a base case, and the choices met on the way make up an answer.
      </p>
      <Invariant label="Walk">At each cell, pick a choice that explains its value, then move to the cell that choice came from.</Invariant>

      <h2 id="walk">Walking back</h2>
      <p>
        For the LCS (lesson 7): at cell <M>(i, j)</M>, if the last letters are equal, the letter is in the LCS; collect it and move diagonally.
        Otherwise move to whichever of the cell above and the cell to the left holds the larger value; on a tie, either one is fine. The letters
        come out last first, so reverse them at the end. Step through the first version of the figure.
      </p>
      <BackFigure />
      <CodeBlock
        title="lcs.py"
        code={`def lcs(a, b):
    n, m = len(a), len(b)
    L = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])
    out = []
    i, j = n, m
    while i > 0 and j > 0:              # walk back
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif L[i - 1][j] >= L[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(out))`}
      />
      <p>
        Each step moves up, left or both, so the walk takes at most <M>n + m</M> steps: nothing next to the <M>O(n · m)</M> table. The walk
        needs the whole table, so the two-row version of lesson 7 is not enough here.
      </p>

      <h2 id="bag">Which items?</h2>
      <p>
        For the knapsack (lesson 8), keep every row. At row i with x kilograms left, compare <code>best[i][x]</code> with the cell above,{" "}
        <code>best[i - 1][x]</code>. If they are equal, the best value is possible without item i: skip it and move up. If not, item i must have
        been taken: collect it, and move up to <M>x − wᵢ</M> kilograms. The second version of the figure walks back from 9 and finds B and C.
      </p>
      <p>
        The same check works for any table: compare the cell with what each choice would give. Writing the knapsack walk is DYNP-P9.
      </p>
      <Note title="Ties">
        <p>
          When two choices give the same value, either leads to a best answer, and different tie rules give different answers. If a problem wants
          one particular answer, such as the first in alphabetical order, the tie rule must be designed for it. Usually that means building the
          answer from the front, with a table of suffixes, so that the earliest choice can be made first.
        </p>
      </Note>

      <h2 id="store">Storing the choice</h2>
      <p>
        Sometimes checking the rule again is slow or awkward. Then store the choice as the table is filled: a second table, or for 1-D problems a
        list <code>prev</code>, where <code>prev[i]</code> says which state the best answer at i came from. Walking back is then following{" "}
        <code>prev</code> until it runs out.
      </p>
      <p>
        The <M>O(n log n)</M> increasing subsequence (lesson 6) needs this, because <code>tails</code> is not itself a subsequence. Keep the{" "}
        <em>position</em> of each tail, and for each value the position of the value before it:
      </p>
      <CodeBlock
        title="lis.py"
        code={`from bisect import bisect_left

def lis(a):
    tail_val, tail_pos = [], []  # tails, and where they are
    prev = [-1] * len(a)          # the value before, in its run
    for i, x in enumerate(a):
        k = bisect_left(tail_val, x)
        if k > 0:
            prev[i] = tail_pos[k - 1]
        if k == len(tail_val):
            tail_val.append(x)
            tail_pos.append(i)
        else:
            tail_val[k] = x
            tail_pos[k] = i
    out = []
    i = tail_pos[-1] if a else -1
    while i != -1:
        out.append(a[i])
        i = prev[i]
    return out[::-1]`}
      />
      <p>
        When x arrives and <code>bisect_left</code> returns k, it extends a subsequence of length k that ends at{" "}
        <code>tail_pos[k - 1]</code>, so that is its <code>prev</code>. Later changes to <code>tails</code> do not change <code>prev[i]</code>,
        so each chain stays valid. The extra cost is one list of n positions.
      </p>

      <h2 id="space">Rebuilding with little memory</h2>
      <p>
        Keeping the whole table costs <M>O(n · m)</M> memory: 100 million numbers for two strings of 10,000 letters, too much for Python lists.
        There are three ways out.
      </p>
      <ul>
        <li>
          <strong>Store one bit per cell</strong> for the choice, instead of a number. That is about 8 times smaller than a table of 8-byte
          numbers, and much smaller than a table of Python objects. A <code>bytearray</code> or a whole number used as bits (BITS) holds them.
        </li>
        <li>
          <strong>Divide and conquer</strong> (Hirschberg&rsquo;s method, 1975). Fill the length table for the top half of a&rsquo;s letters
          forwards, and for the bottom half backwards (on the reversed strings), keeping one row each. Where the two middle rows add up to the
          LCS length, the LCS crosses the middle: split b there and solve the two halves the same way (DVCQ). The time stays <M>O(n · m)</M>,
          about twice the work, and the space is <M>O(n + m)</M>.
        </li>
        <li>
          <strong>Keep some rows only</strong> (checkpoints): keep every k-th row, and refill the rows between two checkpoints when the walk needs
          them. With k near √n (the square root of n), the memory is <M>O(√n · m)</M> and the time about doubles.
        </li>
      </ul>
      <Note title="Counting best answers">
        <p>
          How many different best answers are there? That is one more DP over the same table: the number of best ways to reach a cell is the sum
          of the counts of the cells whose choice gives its value. Count paths, not strings: two different paths can spell the same subsequence.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/9/">DYNP-P9, Which items to pack</Link>. This is the last lesson of the station; advanced DP (on
        trees, on intervals, over subsets) comes in ADDP, after the graph stations.
      </p>
    </>
  );
}
