import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { GridFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        When a state needs two numbers, the table becomes a grid. The input is often a grid too, such as a map or a board, and then the table
        has the same shape as the input. This lesson fills such tables, and shows what to do when no safe order exists.
      </p>

      <h2 id="two">Two numbers per state</h2>
      <p>
        A state <M>(r, c)</M> is a cell: row r, column c. The rule says how a cell&rsquo;s answer comes from other cells. If every cell reads only
        cells above it or to its left, filling row by row, left to right, is a safe order (lesson 3). The cost is the number of cells times the
        work per cell, usually <M>O(rows × cols)</M>.
      </p>
      <p>
        States with two numbers also appear without any grid in the input: a position in each of two strings (lesson 7), or an item and a weight
        (lesson 8). The same picture, and the same order, work for those.
      </p>

      <h2 id="cheap">The cheapest path</h2>
      <p>
        Each cell of a grid has a cost. A route starts at the top-left cell, moves only right or down, and ends at the bottom-right cell. Its cost
        is the sum of the costs of the cells it visits. Find the cheapest route.
      </p>
      <p>
        Let <code>cheap[r][c]</code> be the cheapest cost of a route from the start to cell (r, c). The last move into (r, c) came from above or
        from the left. Whichever it was, the route up to that cell must itself be the cheapest to that cell; otherwise swapping in a cheaper one
        would make a cheaper route to (r, c). So:
      </p>
      <CodeBlock
        code={`cheap[r][c] = cost[r][c] + min(cheap[r - 1][c],
                                cheap[r][c - 1])`}
      />
      <p>
        Cells on the top row have no cell above; cells in the left column have no cell to the left. Step through the first version of the
        figure. Each arrow points to the neighbour the value came from.
      </p>
      <GridFigure />
      <CodeBlock
        title="cheapest_path.py"
        code={`def cheapest_path(cost):
    rows, cols = len(cost), len(cost[0])
    INF = float("inf")
    above = [INF] * cols           # a row above the grid
    for r in range(rows):
        row = [0] * cols
        for c in range(cols):
            left = row[c - 1] if c > 0 else INF
            best = min(above[c], left)
            if r == 0 and c == 0:
                best = 0               # the start
            row[c] = cost[r][c] + best
        above = row
    return above[-1]`}
      />
      <p>
        The row of infinities above the grid stands for cells that cannot be reached, so the top row needs no separate case. Two rows are kept:{" "}
        <M>O(rows × cols)</M> time, <M>O(cols)</M> space.
      </p>

      <h2 id="count">Counting paths</h2>
      <p>
        To count routes instead of finding the cheapest, add instead of taking the smallest: the routes into (r, c) are the routes into the cell
        above plus the routes into the cell to the left. The two groups do not overlap, because their last moves differ. A blocked cell has no
        routes through it, so its count is 0. The second version of the figure fills this table.
      </p>
      <p>
        Without blocked cells, the count for an r × c grid has a formula: a route is a list of <M>r − 1</M> down moves and <M>c − 1</M> right
        moves in some order, and the number of such orders is <code>math.comb(r + c - 2, r - 1)</code>. For 4 rows and 5 columns that is 35
        (MATH-6 explains <code>comb</code>). Blocked cells break the formula, but not the table.
      </p>
      <Invariant label="Grid">A cell&rsquo;s value comes from the cells a route could have come from just before it.</Invariant>

      <h2 id="shape">When the order is not obvious</h2>
      <ul>
        <li>
          <strong>Moves up and right</strong> (from the bottom-left corner): cells read the cell below and the cell to the left, so fill from the
          bottom row upwards. The safe order follows the moves.
        </li>
        <li>
          <strong>Moves in all four directions</strong>: a cell can depend on a cell that depends on it, so there is no safe order at all. The
          states form a graph with loops, not a DAG. The cheapest route is then a shortest-path problem, solved with Dijkstra&rsquo;s method
          (PATH-3) rather than a table.
        </li>
        <li>
          <strong>The answer depends on what comes later.</strong> In some puzzles you walk through a grid and must never run out of health. The
          health you need at a cell depends on the cells after it, so the table is filled backwards, from the end to the start.
        </li>
      </ul>

      <h2 id="more">Other grid problems</h2>
      <ul>
        <li>
          <strong>A triangle of numbers</strong>, each row one longer than the one above; move down to either of the two numbers below. Filling
          from the bottom row upwards leaves the answer at the top, with no special cases.
        </li>
        <li>
          <strong>Squares and rectangles of free cells.</strong> The largest free square ending at a cell depends on three neighbours
          (DYNP-P5). The largest free rectangle needs a different method: one row at a time, using the largest rectangle under a bar chart (STAQ-5).
        </li>
        <li>
          <strong>Two walkers at once</strong>, such as two people collecting coins on their way down the grid. The state must say where both are:
          three numbers (the step, and the two columns), because the two walkers are at the same step.
        </li>
      </ul>
      <Note title="Big grids in Python">
        <p>
          A Python loop does about 10 to 30 million simple steps a second. A grid of 1,000 × 1,000 cells is a million cells, which is fine; 10,000
          × 10,000 is a hundred million, which takes minutes. Libraries such as NumPy can fill a whole row at once in C when the rule allows it.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/dynp/practice/5/">DYNP-P5, The largest free square</Link>.
      </p>
    </>
  );
}
