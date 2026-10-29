import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TabFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Tabulation fills the table of answers with loops, smallest states first, instead of with recursive calls. It has no depth limit, it is
        usually faster, and it makes it easy to keep only the part of the table that is still needed.
      </p>

      <h2 id="order">Fill in a safe order</h2>
      <p>
        A loop has to choose the order of the states itself. The order is safe if every state comes after all the states its rule reads. In the
        DAG of lesson 1 (states as points, arrows to the states each one uses), that means following the arrows backwards. Such an order is
        called a <strong>topological order</strong> (GRPH-5 finds one for any DAG). For most DP problems it is easy to see:
      </p>
      <ul>
        <li>an amount x uses smaller amounts, so go from 0 upwards (GRDY-5&rsquo;s fewest-coins loop does this);</li>
        <li>a grid cell uses the cell above and the cell to its left, so go row by row, left to right;</li>
        <li>a suffix (the items from i to the end) uses shorter suffixes, so go from the end backwards.</li>
      </ul>
      <Invariant label="Order">When a cell is filled, every cell its rule reads is already filled.</Invariant>

      <h2 id="rows">Row by row</h2>
      <p>Here is lesson 2&rsquo;s grid count as a loop. Step through the first version of the figure.</p>
      <CodeBlock
        title="grid_paths_table.py"
        code={`def grid_paths(rows, cols):
    paths = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            paths[r][c] = paths[r - 1][c] + paths[r][c - 1]
    return paths[rows - 1][cols - 1]`}
      />
      <TabFigure />
      <p>
        Each cell is filled once, from two cells that are already filled: <M>O(rows × cols)</M> time and no calls at all. The base cases (the top
        row and the left column) are set before the loop starts, here by filling the whole table with 1s.
      </p>
      <Note title="A Python trap: copies of one row" warn>
        <p>
          <code>[[1] * cols] * rows</code> looks like a table, but it is one row listed <code>rows</code> times: changing{" "}
          <code>paths[1][2]</code> changes every row. Build each row separately, with <code>[[1] * cols for _ in range(rows)]</code>.
        </p>
      </Note>

      <h2 id="space">Keep only what you need</h2>
      <p>
        Row r reads only row r − 1. So once row r is done, rows before r − 1 are never read again. Keeping two rows, or even one, is enough. The
        second version of the figure keeps one list and updates it in place: before <code>row[c]</code> is changed it still holds the value from
        the row above, and <code>row[c - 1]</code> to its left has already been updated.
      </p>
      <CodeBlock
        title="grid_paths_row.py"
        code={`def grid_paths(rows, cols):
    row = [1] * cols                   # row 0
    for _ in range(1, rows):
        for c in range(1, cols):
            row[c] += row[c - 1]       # above + left
    return row[-1]`}
      />
      <p>
        The time is unchanged and the space drops from <M>O(rows × cols)</M> to <M>O(cols)</M>. Fibonacci with two names (RECR-6) is the same
        idea with a row of length 2. Before doing this, check two things:
      </p>
      <ul>
        <li>
          <strong>The direction of the inner loop.</strong> Updating in place is right only if every cell read is either an old value that has
          not been overwritten yet, or a new value that should be read. Lesson 8 shows a case where going the wrong way gives a different answer.
        </li>
        <li>
          <strong>Whether you need the choices.</strong> Rebuilding the answer itself, not just its value, needs the old rows (lesson 9).
        </li>
      </ul>

      <h2 id="push">Pulling and pushing</h2>
      <p>
        The loops above <em>pull</em>: each state reads the states it depends on. The other way is to <em>push</em>: when a state&rsquo;s answer
        is final, add it to every state that uses it. Counting the ways up the footbridge of RECR-P2 (moves of 1, 2 or 3 steps), pushed:
      </p>
      <CodeBlock
        title="footbridge_push.py"
        code={`def ways_up(n):
    ways = [1] + [0] * n
    for i in range(n):                 # ways[i] is final here
        for step in (1, 2, 3):
            if i + step <= n:
                ways[i + step] += ways[i]
    return ways[n]`}
      />
      <p>
        Both give the same answers. Pushing is easier when it is simpler to list where you can go from a state than where you could have come
        from, as in games and in walks on a grid with unusual moves.
      </p>

      <h2 id="choose">Memoisation or tabulation?</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Memoisation and tabulation compared</caption>
          <thead>
            <tr>
              <th />
              <th>Memoisation</th>
              <th>Tabulation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Writing it</td>
              <td>Copy the rule; no order to think about</td>
              <td>Choose a safe order and the base cases</td>
            </tr>
            <tr>
              <td>States worked out</td>
              <td>Only those the answer needs</td>
              <td>All of them</td>
            </tr>
            <tr>
              <td>Depth</td>
              <td>Can hit the recursion limit</td>
              <td>No limit</td>
            </tr>
            <tr>
              <td>Speed</td>
              <td>Slower: a call and a lookup per state</td>
              <td>Faster: list reads in a loop</td>
            </tr>
            <tr>
              <td>Saving memory</td>
              <td>Hard: the memo keeps everything</td>
              <td>Easy: keep only the last rows</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        A good habit: write the memoised version first, because it follows the rule directly, and test it on small inputs. If the inputs are
        large, turn it into a table. Use memoisation for good when the needed states are few and scattered (lesson 2&rsquo;s{" "}
        <M>f(n // 2) + f(n // 3)</M>), or when the order is hard to see.
      </p>
      <p>
        Now try <Link href="/dsa/dynp/practice/3/">DYNP-P3, Ways to decode</Link>, where the input is far too long for recursion.
      </p>
    </>
  );
}
