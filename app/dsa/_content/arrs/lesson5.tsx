import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { GridFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        A grid of rows and columns, also called a matrix, is stored in Python as a list of rows. Most grid problems come down to visiting the
        cells in the right order, and to keeping indexes inside the grid.
      </p>

      <h2 id="layout">A list of rows</h2>
      <CodeBlock
        code={`grid = [[1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20]]
R = len(grid)          # rows: 4
C = len(grid[0])       # columns: 5
grid[2][3]             # row 2, column 3: 14`}
      />
      <p>
        <code>grid[r]</code> is row <M>r</M>, itself a list. <code>grid[r][c]</code> is the cell in row <M>r</M> and column <M>c</M>. Always the row
        first. Mixing up <M>r</M> and <M>c</M>, or <M>R</M> and <M>C</M>, is the most common grid bug. It hides on square grids, so test on a grid
        that is not square.
      </p>

      <h2 id="orders">Orders of traversal</h2>
      <p>
        <em>Traversal</em> means visiting every cell once. Step through three common orders:
      </p>

      <GridFigure />

      <p>
        Each order visits all <M>R × C</M> cells once, so each is <M>O(R × C)</M>. The spiral needs the most care. It keeps four limits and moves
        one inwards after each side. The two checks in the middle of the loop matter when one row or one column is left over.
      </p>
      <p>Here is one side, the top row, walked from left to right. Then the top limit moves down one row:</p>
      <CodeBlock
        code={`for c in range(left, right + 1):
    visit(top, c)
top += 1`}
      />
      <p>
        The other three sides work the same way: the right column downwards (then <code>right</code> moves left), the bottom row from right to
        left (then <code>bottom</code> moves up), and the left column upwards (then <code>left</code> moves right). Repeat while{" "}
        <code>top</code> is at most <code>bottom</code> and <code>left</code> is at most <code>right</code>. Before the bottom row, check again that <code>top</code> is still at most{" "}
        <code>bottom</code>; before the left column, check that <code>left</code> is still at most <code>right</code>. Without these checks a
        single leftover row or column is visited twice. Writing the whole loop is <Link href="/dsa/arrs/practice/4/">ARRS-P4</Link>.
      </p>

      <h2 id="neighbours">Neighbours and the edges</h2>
      <p>
        Many problems look at the four cells next to <code>(r, c)</code>: up, down, left and right. Keep the four moves in a list, and check the
        limits before you read a cell:
      </p>
      <CodeBlock
        code={`MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]
for dr, dc in MOVES:
    nr, nc = r + dr, c + dc
    if 0 <= nr < R and 0 <= nc < C:
        ...  # grid[nr][nc] is a real neighbour`}
      />
      <Note title="Negative indexes do not fail" warn>
        <p>
          <code>grid[-1][c]</code> is not an error in Python. It quietly reads the last row. So a missing bounds check does not crash; it gives
          wrong answers. Always check <code>0 &lt;= nr</code> as well as <code>nr &lt; R</code>.
        </p>
      </Note>
      <p>
        Moving through a grid cell by cell like this is a graph search. The GRPH station builds on it with breadth-first and depth-first search.
      </p>

      <h2 id="transform">Turning and flipping</h2>
      <p>
        Rotating a square grid 90° clockwise sends cell <code>(r, c)</code> to <code>(c, n − 1 − r)</code>. In Python:
      </p>
      <CodeBlock
        code={`rotated = [list(row) for row in zip(*grid[::-1])]
transposed = [list(col) for col in zip(*grid)]   # rows become columns`}
      />
      <p>
        <code>zip(*grid)</code> pairs up the first items of every row, then the second items, and so on, which gives the columns. Both lines build
        a new grid in <M>O(R × C)</M> time and space. Doing it in place, with swaps, is a good exercise in index arithmetic.
      </p>
      <p>
        Now try <Link href="/dsa/arrs/practice/4/">ARRS-P4, The spiral timetable</Link>.
      </p>
    </>
  );
}
