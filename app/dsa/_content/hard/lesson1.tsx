import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { CheckFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Every station so far ended with a method that runs in a reasonable time. Some problems seem to have no such method: the best known ones
        try a share of all possible answers, which grows exponentially. This station is about those problems: how to tell them apart, how to
        prove a problem belongs to the hard group, and what to do when it does.
      </p>

      <h2 id="kinds">Three kinds of question</h2>
      <p>The same problem can be asked in three ways. For vertex cover (FLOW-5), a set of vertices that touches every edge:</p>
      <ul>
        <li>
          <strong>Decision:</strong> is there a cover with at most k vertices? The answer is yes or no.
        </li>
        <li>
          <strong>Optimisation:</strong> how small can a cover be?
        </li>
        <li>
          <strong>Search:</strong> find a smallest cover.
        </li>
      </ul>
      <p>
        The theory works with decision questions, because yes or no answers are the simplest to compare. Little is lost: with a fast decision
        method you can find the smallest k by binary search over k (BSRC-4), and the last section shows how to find the cover itself.
      </p>

      <h2 id="p">P: answered in polynomial time</h2>
      <p>
        The size of an input is the length needed to write it down: for a graph, about V + E; for a number N, its digits, about{" "}
        <M>log₂ N</M> bits (the number of times N can be halved). A method runs in <strong>polynomial time</strong> if its steps are at most{" "}
        <M>c · nᵏ</M> for an input of size n, for some fixed numbers c and k (nᵏ is k copies of n multiplied together). <strong>P</strong> is the class of decision problems that have a
        polynomial-time method. Everything in this course up to now is in P: sorting, shortest paths, matching, maximum flow, 2-SAT.
      </p>
      <p>
        Why polynomials, and not some other limit? Two reasons. A polynomial-time method that calls a polynomial-time method a polynomial number of times
        is still polynomial, so the class is closed under combining methods. And the class is the same on every reasonable model of a computer.
        In practice, problems in P usually have methods with small k.
      </p>
      <Note title="Pseudo-polynomial is not polynomial">
        <p>
          The 0/1 knapsack table (DYNP-8) takes <M>O(n · W)</M> steps for a bag of size W. W is a number, written with about <M>log₂ W</M>{" "}
          bits, so W can be exponential in the input’s length: adding 30 bits to W multiplies the work by a billion. Such a method is called{" "}
          <strong>pseudo-polynomial</strong>. It is fast when the numbers are small, and it does not put the knapsack in P.
        </p>
      </Note>

      <h2 id="np">NP: checked in polynomial time</h2>
      <p>
        For many problems, a yes answer comes with a short proof that is easy to check. Can a graph be split into three groups with no edge
        inside a group (GRPH-6)? Finding a split may take a long search, but if someone hands you one, you check each edge once. Step through
        the figure.
      </p>
      <CheckFigure />
      <p>
        <strong>NP</strong> is the class of decision problems where every yes answer has a <strong>certificate</strong>, a proof of polynomial
        length, and a polynomial-time <strong>checker</strong> (a verifier) that accepts a correct certificate and rejects every claimed
        certificate for a no answer.
      </p>
      <Invariant label="NP">x is a yes ⟺ some certificate c of polynomial length makes check(x, c) say yes.</Invariant>
      <ul>
        <li>
          <strong>SAT</strong> (a formula of and, or and not over true/false variables: can it be made true?): the certificate is an assignment;
          check every clause. 3-SAT is SAT where each clause has three conditions (CONN-4).
        </li>
        <li>
          <strong>Hamiltonian cycle</strong> (a cycle through every vertex once): the certificate is the order of the vertices.
        </li>
        <li>
          <strong>Subset sum</strong> (do some of these numbers add up to exactly t?): the certificate is the chosen numbers.
        </li>
        <li>
          <strong>Knapsack, vertex cover, travelling salesman</strong> as decisions (“value at least v?”, “cover of at most k?”, “tour of at
          most L?”): the certificate is the packing, the cover or the tour.
        </li>
      </ul>
      <p>
        Every problem in P is in NP: the checker can ignore the certificate and solve the problem. The name NP means “nondeterministic
        polynomial”: a machine that could guess the certificate would answer in polynomial time. Note the asymmetry. A yes for SAT has a short
        proof; a no (“no assignment works”) has no known short proof. Problems whose <em>no</em> answers have short proofs form a class called
        co-NP.
      </p>

      <h2 id="complete">NP-hard and NP-complete</h2>
      <p>
        A <strong>reduction</strong> from problem A to problem B (lesson 2) is a polynomial-time way to turn any question x about A into a
        question f(x) about B with the same answer. Then a fast method for B gives a fast method for A: compute f(x) and ask B. We write{" "}
        <M>A ≤ B</M>: A is no harder than B.
      </p>
      <ul>
        <li>
          B is <strong>NP-hard</strong> if every problem in NP reduces to B. A fast method for B would give fast methods for all of NP.
        </li>
        <li>
          B is <strong>NP-complete</strong> if it is NP-hard and also in NP. These are the hardest problems in NP.
        </li>
      </ul>
      <p>
        <strong>Cook–Levin (1971, 1973): SAT is NP-complete.</strong> The proof, in outline: take any problem A in NP, with its checker. Running
        the checker on x and a certificate is a sequence of polynomially many steps, each changing a polynomial amount of memory. Write the
        whole run as a table, one row per step, one column per memory cell. Each cell of a row is decided by a few cells of the row before,
        by the checker’s fixed rules, and each such rule can be written as a handful of clauses. Add clauses that fix the input x in the first
        row and demand “yes” in the last. The certificate’s bits are left free. The formula can be made true exactly when some certificate makes
        the checker say yes, and it is of polynomial size. So A ≤ SAT.
      </p>
      <p>
        After that, one reduction is enough for each new problem: if SAT ≤ B and B is in NP, then B is NP-complete, because reductions can be
        chained. Karp (1972) did this for 21 problems, including 3-SAT, vertex cover, clique, Hamiltonian cycle, three-colouring and subset sum.
        Thousands are known now.
      </p>

      <h2 id="pnp">P against NP</h2>
      <p>
        Is P equal to NP? Nobody knows. It is the best known open question in computer science, with a million-dollar prize offered by the Clay
        Mathematics Institute. If one NP-complete problem had a polynomial method, all would. Most researchers believe P ≠ NP, partly because
        nobody has found a fast method for any of thousands of these problems, in decades of trying.
      </p>
      <p>For a programmer, “this is NP-hard” is not the end. It means: do not expect a method that is fast and exact on every input. Instead:</p>
      <ul>
        <li>
          <strong>Small inputs:</strong> exponential methods that are as small as possible, such as bitmask DP (ADDP-4) or meeting in the middle
          (BITS-5).
        </li>
        <li>
          <strong>Special cases:</strong> independent sets on trees (ADDP-1), vertex cover in bipartite graphs (FLOW-5), 2-SAT (CONN-4),
          knapsacks with small weights (DYNP-8).
        </li>
        <li>
          <strong>Exact but usually fast:</strong> branch and bound (lesson 3) and modern SAT and integer programming solvers.
        </li>
        <li>
          <strong>Close enough, with a proof:</strong> approximation algorithms (lesson 4).
        </li>
      </ul>

      <h2 id="search">Finding an answer with a yes/no helper</h2>
      <p>
        Decision questions lose little, as promised. Suppose <code>sat(F)</code> answers whether a formula F can be made true. To find an
        assignment, first ask about F itself. Then fix the variables one by one: ask whether F stays satisfiable with x₁ = True added; if yes,
        keep it, and if no, x₁ must be False. Continue with x₂ under the choices so far. The third version of the figure does this.
      </p>
      <p>
        A clause with a single condition, such as <code>[x]</code>, forces that variable: adding it to the formula is how “with x = True” is
        asked. Each question adds one such clause for every variable fixed so far.
      </p>
      <p>
        <strong>Why it is right.</strong> After each step, the formula with the choices so far is still satisfiable: either sat said so, or x =
        True was impossible while an answer existed, so that answer has x = False. After the last variable every choice is fixed and still
        satisfiable, so the choices are an answer. That is n + 1 questions. Problems where finding reduces to deciding like this are called{" "}
        <strong>self-reducible</strong>; all the NP-complete problems of this station are.
      </p>
      <p>
        Now try <Link href="/dsa/hard/practice/1/">HARD-P1, An answer from a yes/no helper</Link>.
      </p>
    </>
  );
}
