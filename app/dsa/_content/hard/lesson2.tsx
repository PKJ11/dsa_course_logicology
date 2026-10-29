import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ReduceFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A reduction turns one problem into another. It is how hardness is proved: if every input of a known hard problem can be rewritten as an input of your
        problem, your problem is at least as hard. It is also a practical tool: rewrite your problem as one that has an excellent solver, and
        use the solver.
      </p>

      <h2 id="what">What a reduction is</h2>
      <p>
        A <strong>reduction</strong> from problem A to problem B is a function f that turns any question x about A into a question f(x) about B,
        such that:
      </p>
      <Invariant label="Reduction">f runs in polynomial time, and x is a yes for A ⟺ f(x) is a yes for B.</Invariant>
      <p>
        Then a method for B solves A: compute f(x), ask B. If B is fast, so is A. Turned round: if A is hard, B must be hard too. So{" "}
        <strong>to prove B is NP-hard, reduce a known NP-hard problem to B</strong>, not the other way. The direction is the most common slip.
      </p>
      <p>A proof of a reduction always has three parts:</p>
      <ol>
        <li>the construction of f(x), and why it takes polynomial time;</li>
        <li>yes for x ⟹ yes for f(x): turn an answer for x into an answer for f(x);</li>
        <li>yes for f(x) ⟹ yes for x: turn any answer for f(x) back into an answer for x.</li>
      </ol>
      <p>
        Part 3 is the one people forget. It says the construction adds no new answers: no answer for f(x) exists unless x has one.
      </p>

      <h2 id="is">3-SAT to independent set</h2>
      <p>
        An <strong>independent set</strong> is a set of vertices with no edge between any two of them. The decision problem: does a graph have an
        independent set of size k? Reduce 3-SAT to it. A clause is a bracket of conditions joined by “or”, such as (x₁ ∨ ¬x₂ ∨ x₃); ∨ means
        “or”, ∧ means “and”, ¬ means “not”. Given a formula with m clauses:
      </p>
      <ul>
        <li>for each clause, make a triangle with one vertex per condition;</li>
        <li>join every vertex x to every vertex ¬x, in any triangle;</li>
        <li>ask for an independent set of size m.</li>
      </ul>
      <ReduceFigure />
      <CodeBlock
        title="sat_to_independent.py"
        code={`def sat_to_independent_set(clauses):
    # clauses: lists of 3 literals, k for x_k and -k for not x_k
    vertices = [(c, lit) for c, clause in enumerate(clauses) for lit in clause]
    edges = []
    for i, (c1, l1) in enumerate(vertices):
        for j in range(i + 1, len(vertices)):
            c2, l2 = vertices[j]
            if c1 == c2 or l1 == -l2:     # same triangle, or opposites
                edges.append((i, j))
    return len(vertices), edges, len(clauses)   # n, edges, k`}
      />
      <p>
        The graph has <M>3m</M> vertices and at most <M>3m + (3m)²/2</M> edges, built in polynomial time. The two directions are in the figure:
        an assignment gives one true condition per triangle, which form an independent set; an independent set of size m has one vertex per
        triangle and never a condition with its opposite, so making its conditions true is consistent and satisfies every clause. Independent
        set is in NP (check the set), so it is NP-complete.
      </p>

      <h2 id="family">Independent set, vertex cover and clique</h2>
      <p>Some reductions are a single line once the right observation is made.</p>
      <ul>
        <li>
          <strong>Vertex cover.</strong> S is independent exactly when the other vertices, V − S, touch every edge: an edge with both ends outside
          the cover would have both ends in S. So a cover of size <M>V − k</M> exists ⟺ an independent set of size k exists.
        </li>
        <li>
          <strong>Clique</strong> (a set where every two vertices are joined). S is independent in G exactly when S is a clique in the{" "}
          <strong>complement</strong> of G, the graph with an edge wherever G has none.
        </li>
      </ul>
      <p>So all three are NP-complete, and a fast method for any one would give the other two.</p>

      <h2 id="more">More reductions, in outline</h2>
      <ul>
        <li>
          <strong>Three-colouring</strong> (GRPH-6’s three groups). A triangle of three special vertices fixes the meaning of the groups: True,
          False and Base. Each variable becomes a pair x, ¬x joined to each other and to Base, so one is True and the other False. Each clause
          gets a small gadget of six vertices that can be coloured exactly when at least one of its three inputs is True.
        </li>
        <li>
          <strong>Subset sum.</strong> Write numbers in base 10 with one digit place per variable and one per clause. Choosing a number means
          making a condition true; the target forces exactly one of x, ¬x per variable, and at least one true condition per clause (with
          small padding numbers). No carries can happen, so digit places act separately.
        </li>
        <li>
          <strong>Travelling salesman.</strong> From Hamiltonian cycle: give each edge of the graph length 1 and each missing pair length 2. A
          tour of length n exists ⟺ the graph has a Hamiltonian cycle. The same idea shows that no approximation ratio is possible for tours
          without the triangle rule (lesson 4).
        </li>
        <li>
          <strong>Bin packing</strong> (the fewest wagons, ADDP-P4). From partition (split numbers into two halves of equal sum): two wagons of
          half the total each are enough ⟺ the split exists.
        </li>
      </ul>
      <Note title="Strongly NP-hard">
        <p>
          Subset sum and the knapsack are NP-hard only because their numbers can be huge: with numbers below a fixed polynomial in n, the DP
          tables (DYNP-8) are polynomial. Problems that stay NP-hard even when all numbers are small, such as bin packing and the travelling
          salesman, are called <strong>strongly NP-hard</strong>: for them, no pseudo-polynomial method is expected.
        </p>
      </Note>

      <h2 id="into">Reducing to SAT</h2>
      <p>
        Cook–Levin says every problem in NP reduces to SAT. In practice, that is a way of solving: write your problem as clauses and hand them to
        a SAT solver. Modern solvers (they learn new clauses from each dead end) handle millions of clauses for many real problems: chip
        checking, timetables, puzzles. In Python, <code>pycosat</code> and <code>python-sat</code> wrap such solvers, and Google’s OR-Tools
        has CP-SAT.
      </p>
      <p>The usual building blocks, with a variable for each yes/no fact (“vertex v gets group c”):</p>
      <ul>
        <li>
          <strong>at least one</strong> of a, b, c: one clause <M>(a ∨ b ∨ c)</M>;
        </li>
        <li>
          <strong>at most one</strong>: a clause <M>(¬a ∨ ¬b)</M> for every pair;
        </li>
        <li>
          <strong>not both</strong> (a rule between two facts): <M>(¬a ∨ ¬b)</M>;
        </li>
        <li>
          <strong>if a then b</strong>: <M>(¬a ∨ b)</M>, as in 2-SAT (CONN-4).
        </li>
      </ul>
      <p>
        The practice problem asks for the formula that says “this graph splits into three groups with no edge inside a group”. Its tests check
        both directions on small graphs by solving your formula, and on large ones that a planted split passes while every broken split fails.
      </p>

      <h2 id="slips">Common slips</h2>
      <ul>
        <li>
          <strong>The wrong direction.</strong> Reducing your problem to SAT shows only that your problem is in NP, not that it is hard.
        </li>
        <li>
          <strong>Only one direction of the “⟺”.</strong> Without part 3, f could map every question to an easy yes.
        </li>
        <li>
          <strong>A construction that solves the problem.</strong> If f must find the answer to build its output, it is not polynomial, unless
          the problem was easy all along.
        </li>
        <li>
          <strong>Numbers that grow too long.</strong> A construction must write its numbers in polynomially many digits; writing a number n as n
          marks is exponential in its length.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/hard/practice/2/">HARD-P2, Three groups as a formula</Link>.
      </p>
    </>
  );
}
