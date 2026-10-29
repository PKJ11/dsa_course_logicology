import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { UsesFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Union-find answers one kind of question: as connections arrive, which things are now connected? Many problems turn out to be this
        question in disguise. This lesson shows the common patterns.
      </p>

      <h2 id="groups">Counting groups</h2>
      <p>
        Keep a counter of sets. It starts at <M>n</M>, and every union that really joins two sets (returns <code>True</code>) takes 1 away. At
        any moment the counter is the number of groups. In graph terms (GRPH), the elements are <strong>vertices</strong>, the connections are{" "}
        <strong>edges</strong>, and the groups are the <strong>connected components</strong>.
      </p>
      <p>
        A search of the graph (breadth-first or depth-first, GRPH) also finds the components, in <M>O(n + m)</M> time for <M>m</M> edges. Union-find
        wins when the edges arrive one at a time and the question is asked after each one: a search would have to start again every time.
      </p>

      <UsesFigure />

      <h2 id="cycles">Finding cycles</h2>
      <p>
        A <strong>cycle</strong> is a loop: a way to leave a vertex along edges and come back without using an edge twice. When an edge joins two
        vertices that are already connected, there was already a path between them, and the new edge closes that path into a cycle. So{" "}
        <code>union</code> returning <code>False</code> means &ldquo;this edge makes a cycle&rdquo;. Step through &ldquo;Roads one by one&rdquo;.
      </p>
      <p>
        This is the heart of Kruskal&rsquo;s algorithm for the cheapest set of edges that connects every vertex (SPAN): take the edges from
        cheapest to most expensive, and keep an edge only if <code>union</code> returns <code>True</code>.
      </p>

      <h2 id="grid">Grids and islands</h2>
      <p>
        A grid of <M>R</M> rows and <M>C</M> columns becomes a list of elements by numbering the cells row by row: cell <M>(r, c)</M> is element{" "}
        <M>r · C + c</M>. Two land cells that touch belong to the same island, so union each land cell with its land neighbours. When the cells
        are visited in order, it is enough to look up and to the left (the second variant): the neighbours below and to the right will look back.
      </p>
      <CodeBlock
        code={`def count_islands(grid):          # a list of strings of '0' and '1'
    R, C = len(grid), len(grid[0])
    d = DSU(R * C)
    islands = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] != '1':
                continue
            islands += 1                # a new island of one cell
            for nr, nc in ((r - 1, c), (r, c - 1)):
                if nr >= 0 and nc >= 0 and grid[nr][nc] == '1':
                    if d.union(r * C + c, nr * C + nc):
                        islands -= 1    # two islands became one
    return islands`}
      />
      <p>
        For a fixed map, a search is just as good. Union-find is the right tool when land appears one cell at a time and the count is wanted
        after each change. Practice DSUF-P4 asks for exactly that.
      </p>

      <h2 id="names">Elements that are not numbers</h2>
      <p>
        When the elements are names (variables, email addresses, words), keep the parents in a dict instead of a list. An element enters the
        structure the first time it is seen:
      </p>
      <CodeBlock
        code={`parent = {}

def find(x):
    parent.setdefault(x, x)       # a new name is its own root
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[ra] = rb`}
      />
      <p>
        A common use is checking a list of facts such as <code>a == b</code> and <code>a != c</code>. Union every pair that must be equal, then
        check that no &ldquo;not equal&rdquo; pair has ended up in one set. Practice DSUF-P5 does this.
      </p>
      <p>
        A further step, called <strong>weighted union-find</strong>, stores a number on every parent link as well, such as &ldquo;this element is
        3 more than its parent&rdquo; or &ldquo;this currency is worth 2.5 of its parent&rdquo;. Find adds up (or multiplies) the numbers along
        the path, and compression keeps the totals. It answers questions like &ldquo;how many rupees is one euro, given these exchange
        rates?&rdquo;.
      </p>

      <h2 id="limits">What union-find cannot do</h2>
      <ul>
        <li>
          <strong>Split a set.</strong> There is no cheap way to undo a union. If edges are removed over time, one method is to read the removals
          backwards: in reverse, every removal becomes an addition.
        </li>
        <li>
          <strong>List a set&rsquo;s elements.</strong> The links point up, so a set cannot be walked from its root. If the members are needed,
          keep a list at each root and join the lists in union, always moving the shorter list into the longer one. Each element then moves at
          most <M>log₂ n</M> times, by the argument of lesson 2.
        </li>
        <li>
          <strong>Find a path.</strong> Union-find says two vertices are connected, not how. For the route itself, search the graph (GRPH).
        </li>
      </ul>
      <Note title="SciPy has one">
        <p>
          Python&rsquo;s standard library has no union-find. SciPy has <code>scipy.cluster.hierarchy.DisjointSet</code>, and its sparse graph
          tools have <code>connected_components</code>. In interviews and contests, people write the fifteen-line class from lesson 3.
        </p>
      </Note>
    </>
  );
}
