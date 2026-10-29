import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SatFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        Some planning problems are a list of yes-or-no questions with rules between them. When each rule names at most two conditions, the
        strongly connected groups of one graph decide whether all the rules can hold, and give the answers if they can. This is 2-SAT.
      </p>

      <h2 id="rules">Rules with two conditions</h2>
      <p>
        There are n questions x₁, …, xₙ, each answered yes (True) or no (False). A <strong>condition</strong> is either xᵢ (&ldquo;question i is
        yes&rdquo;) or its opposite ¬xᵢ (&ldquo;question i is no&rdquo;); the sign ¬ is read &ldquo;not&rdquo;. A <strong>rule</strong> is
        &ldquo;a or b&rdquo; for two conditions a and b: at least one of them must hold. The task is to answer every question so that every rule
        holds, or to say that no set of answers does.
      </p>
      <p>Many kinds of rule fit this shape:</p>
      <ul>
        <li>&ldquo;x must be yes&rdquo; is (x or x).</li>
        <li>&ldquo;not both x and y&rdquo; is (¬x or ¬y).</li>
        <li>&ldquo;if x then y&rdquo; is (¬x or y).</li>
        <li>&ldquo;x and y are answered the same&rdquo; is two rules: (¬x or y) and (x or ¬y).</li>
      </ul>
      <p>
        Example: each of n trains runs on the morning or the evening timetable, and some pairs of trains cannot both run in the same slot. Trying
        every set of answers means 2ⁿ sets (n twos multiplied together): over a million for n = 20, far too many for n = 100.
      </p>

      <h2 id="graph">The implication graph</h2>
      <p>
        The rule (a or b) says two things. If a is false, b must hold. If b is false, a must hold. Write &ldquo;if x holds, y must hold&rdquo; as an
        edge x → y. Then each rule gives two edges:
      </p>
      <Invariant label="Rule">(a or b) gives the edges ¬a → b and ¬b → a.</Invariant>
      <p>
        The <strong>implication graph</strong> has 2n vertices, one for each condition, and 2 edges per rule. A path x → … → y means: if x holds,
        then y must hold too, by following the rules one at a time. The graph has a useful mirror shape: the two edges of each rule mirror each
        other, so there is an edge x → y exactly when there is an edge ¬y → ¬x, and the same holds for paths. The figure puts each condition
        opposite its negation, so each edge has its mirror edge on the opposite side.
      </p>
      <SatFigure />
      <CodeBlock
        code={`def node(lit):                 # x_k is 2(k-1), not x_k is 2(k-1) + 1
    return 2 * (lit - 1) if lit > 0 else 2 * (-lit - 1) + 1

adj = [[] for _ in range(2 * n)]
for a, b in rules:
    x, y = node(a), node(b)
    adj[x ^ 1].append(y)       # not a -> b
    adj[y ^ 1].append(x)       # not b -> a`}
      />
      <p>
        Numbering x<sub>k</sub> as 2(k − 1) and ¬x<sub>k</sub> as the next number makes the opposite of vertex x simply <code>x ^ 1</code>, which
        flips the lowest bit (BITS-2).
      </p>

      <h2 id="test">When there is no answer</h2>
      <Invariant label="Test">The rules can all hold exactly when no question has x and ¬x in the same strongly connected group.</Invariant>
      <p>
        <strong>If x and ¬x are in one group,</strong> there are paths x → … → ¬x and ¬x → … → x. Answering yes forces x to be false, and
        answering no forces it to be true. Neither works, so there is no answer. The figure&rsquo;s second variant shows this, with a and ¬a marked
        red: the rules are broken whatever you choose.
      </p>
      <p>
        <strong>If no question has both in one group,</strong> the next section builds a set of answers that keeps every rule, which proves the
        other direction.
      </p>

      <h2 id="choose">Choosing the answers</h2>
      <p>
        Number the groups in topological order (lesson 1): every edge goes from a group to the same group or a later one. For each question, make
        true the condition whose group comes <em>later</em>:
      </p>
      <Invariant label="Choose">x is yes exactly when the group of x comes after the group of ¬x.</Invariant>
      <p>
        <strong>Why every rule holds.</strong> Take a rule (a or b), and suppose both a and b came out false. Then the group of ¬a comes after the
        group of a, and the group of ¬b after the group of b. The rule gives the edge ¬a → b, so group(b) is at or after group(¬a); and it gives
        ¬b → a, so group(a) is at or after group(¬b). Putting the four facts in a row:
      </p>
      <Invariant label="So">
        <span className="nowrap">group(a) &lt; group(¬a)</span> <span className="nowrap">≤ group(b) &lt; group(¬b)</span>{" "}
        <span className="nowrap">≤ group(a)</span>
      </Invariant>
      <p>
        That says group(a) comes before itself, which is impossible. So at least one of a and b is true, for every rule.
      </p>
      <p>
        <strong>With Tarjan&rsquo;s method</strong> the groups come out in reverse topological order (lesson 2), so a <em>smaller</em> Tarjan
        number means <em>later</em>: answer yes when <code>comp[x] &lt; comp[x ^ 1]</code>. With Kosaraju&rsquo;s method the numbers are already in
        topological order: yes when <code>comp[x] &gt; comp[x ^ 1]</code>. Getting this the wrong way round gives answers that break rules.
      </p>
      <p>
        <strong>Cost.</strong> 2n vertices and 2m edges for m rules, and one search for groups: <M>O(n + m)</M>. The search must not use
        recursion: a chain of rules makes a path in the implication graph as long as the whole graph. Now try{" "}
        <Link href="/dsa/conn/practice/4/">CONN-P4, Yes-or-no rules</Link>.
      </p>
      <Note title="A slower method that also works">
        <p>
          An older method guesses yes for a question, follows every rule this forces, and if two forced answers clash, takes the guess back and
          tries no. For 2-SAT this is correct, because the rules a guess does not touch are left as they were. But each guess can follow a long
          chain before it clashes, so it can cost <M>O(n · m)</M>. CONN-P4 has a test built for that. A method that guesses and never takes a
          guess back is simply wrong.
        </p>
      </Note>

      <h2 id="three">Rules of three conditions are much harder</h2>
      <p>
        With rules of three conditions, such as (a or b or c), the problem is called 3-SAT, and no method is known that is much faster than trying
        a large share of the 2ⁿ answers. 3-SAT is NP-complete: HARD-1 explains what that means, and why a fast method for it would give fast
        methods for thousands of other problems. The step from two to three conditions is the step from one rule&rsquo;s &ldquo;if this then
        that&rdquo; to a real choice: (a or b or c) does not force anything when one condition is false.
      </p>
      <ul>
        <li>
          <strong>Uses of 2-SAT.</strong> Placing labels on a map (each label above or below its point, no two overlapping), choosing one of two
          slots for each task with clashes, and the &ldquo;teams&rdquo; of GRPH-6 (x and y on different teams is (x or y) and (¬x or ¬y)).
        </li>
        <li>
          <strong>Counting answers.</strong> Finding one answer is fast, but counting how many answers 2-SAT rules have is as hard as the hardest
          counting problems. The groups give one answer, not all of them.
        </li>
      </ul>
    </>
  );
}
