import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { GridFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        Mazes, maps, game boards and images are grids. ARRS-5 moved through a grid square by square with a list of moves and a bounds check.
        That is already a graph search; this lesson says so and uses a graph&rsquo;s words for it, and then shows a method that solves many harder grid puzzles: searching a
        graph of states instead of squares.
      </p>

      <h2 id="cells">Squares as vertices</h2>
      <p>
        Each open square <code>(r, c)</code> is a vertex. Its neighbours are the open squares one move away: up, down, left and right (or eight
        directions, if diagonal moves are allowed). Walls are not vertices. There is no need to build adjacency lists: the neighbours are worked
        out when they are needed, with ARRS-5&rsquo;s moves.
      </p>
      <ul>
        <li>
          An R × C grid has R · C vertices (R times C) and fewer than 2 · R · C edges (each square has at most 4 neighbours, and each edge has two ends), so
          a search costs <M>O(R · C)</M>.
        </li>
        <li>
          A square can be stored as the pair <code>(r, c)</code>, or as one number <code>r * C + c</code>, which is smaller and works with
          plain lists. <code>divmod(k, C)</code> turns the number back into <code>(r, c)</code>.
        </li>
        <li>Moves need not be steps: a knight&rsquo;s moves on a chessboard give a different graph on the same squares.</li>
      </ul>

      <h2 id="moves">Fewest moves</h2>
      <p>The fewest moves from one square to every other is lesson 2&rsquo;s BFS, with the neighbours worked out on the spot:</p>
      <CodeBlock
        code={`from collections import deque

MOVES = ((-1, 0), (1, 0), (0, -1), (0, 1))

def grid_dist(grid, r0, c0):
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    dist[r0][c0] = 0
    q = deque([(r0, c0)])
    while q:
        r, c = q.popleft()
        for dr, dc in MOVES:
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == '.' \\
                    and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist`}
      />
      <p>
        The figure shows each wave of the search as one step: all the squares at distance 1, then 2, and so on. To get the route, keep each
        square&rsquo;s parent, as in lesson 2.
      </p>
      <GridFigure />
      <Note title="Remember: negative indexes do not fail" warn>
        <p>
          As ARRS-5 warned, <code>grid[-1][c]</code> quietly reads the last row. Check <code>0 &lt;= nr</code> as well as{" "}
          <code>nr &lt; R</code>, or put a border of walls round the grid so every real square has four neighbours inside it.
        </p>
      </Note>

      <h2 id="islands">Flood fill and islands</h2>
      <p>
        <strong>Flood fill</strong> (the paint-bucket tool) changes every square joined to a starting square: a search that marks what it reaches.
        To count <strong>islands</strong> (groups of land squares joined up, down, left or right), scan the grid row by row; each land square not
        yet marked starts a new island, and a search from it marks the whole island. That is lesson 3&rsquo;s count of connected parts, and the
        figure&rsquo;s third variant shows it.
      </p>
      <ul>
        <li>
          Use a queue or your own stack. A recursive flood fill on a 1,000 × 1,000 grid of land would go a million calls deep.
        </li>
        <li>
          Marking by changing the grid (land to water) saves the memory of a <code>seen</code> table, but destroys the input. Do it only on a
          copy, or when the problem allows it.
        </li>
        <li>
          DSUF-P4 counted islands while land was <em>added</em> one square at a time; there union-find is better, because a new search after
          every square would cost O(R · C) each time.
        </li>
      </ul>

      <h2 id="many">Many starts</h2>
      <p>
        Lesson 2&rsquo;s several starts are common on grids: the distance from every square to the nearest exit, or how many minutes a fire
        takes to reach each square when it starts in several places. Put every start in the queue at distance 0, then run one BFS. The largest
        distance is the time the last square is reached. Running one search per start would multiply the work by the number of starts.
      </p>

      <h2 id="states">When the square is not enough</h2>
      <p>
        Many puzzles add a rule: you may break through up to k walls, you carry keys that open doors, or a move depends on which way you are
        facing. Then &ldquo;I am on square (r, c)&rdquo; does not say what you can still do. Two visits to the same square with different keys
        are different situations.
      </p>
      <Invariant label="States">Search a graph whose vertices are states: everything that decides what you can do next.</Invariant>
      <p>
        For walls to break, a state is <code>(r, c, walls used)</code>, and a move onto a wall leads to a state with one more wall used. For keys,
        a state is the square and the set of keys held, often as a bitmask (BITS-5). BFS on states gives the fewest moves, in time proportional to
        the number of states: R · C · (k + 1) for walls, R · C · 2<sup>keys</sup> (2 to the power of the number of keys) for keys. Only the
        states that can actually be reached are ever created.
      </p>
      <ul>
        <li>
          Mark states, not squares: <code>seen</code> becomes a set of tuples, or a table with one more dimension. Marking only squares loses
          visits that arrive later with more wall breaks left, and gives wrong answers.
        </li>
        <li>
          When moves have different costs (mud costs 3, road costs 1), the fewest moves is no longer the cheapest route, and BFS is not enough.
          PATH-2 handles costs of 0 and 1, and PATH-3 (Dijkstra) any costs that are not negative.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/grph/practice/7/">GRPH-P7, Through the walls</Link>.
      </p>
    </>
  );
}
