import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { QueensFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        Listing every possible choice is often far too slow. But many branches of the decision tree can be seen to fail early on. Pruning means
        noticing that, and not going down those branches at all.
      </p>

      <h2 id="idea">Stop as soon as a branch cannot work</h2>
      <p>
        A backtracking search builds an answer one decision at a time. After each decision, check whether the partial answer can still lead to a
        full answer. If it cannot, return at once. Everything below that point in the tree is skipped. This is called <em>pruning</em>, as in
        cutting branches off a tree.
      </p>

      <h2 id="queens">Example: placing queens</h2>
      <p>
        Place <M>n</M> chess queens on an <M>n × n</M> board so that no two attack each other. A queen attacks along its row, its column and both
        diagonals. Since no two queens can share a row, place exactly one queen in each row, top to bottom. The decision for each row is which
        column to use.
      </p>

      <QueensFigure />

      <p>
        Place one queen per row. Keep three sets: the columns in use, the down-right diagonals in use and the down-left diagonals in use. For row{" "}
        <M>r</M>, try each column <M>c</M>, and skip it at once if it clashes:
      </p>
      <CodeBlock
        code={`if c in cols or r - c in d1 or r + c in d2:
    continue                  # prune: clashes already`}
      />
      <p>
        If it does not clash, add <M>c</M>, <M>r − c</M> and <M>r + c</M> to the three sets, place the queens of the next row, then remove the
        three again. When every row has a queen, count one answer. Writing the whole search is{" "}
        <Link href="/dsa/recr/practice/5/">RECR-P5</Link>.
      </p>
      <p>
        Two squares are on the same down-right diagonal exactly when <M>r − c</M> is the same for both, and on the same down-left diagonal when{" "}
        <M>r + c</M> is the same. Keeping these in sets makes each check <M>O(1)</M>, instead of comparing with every queen placed so far.
      </p>

      <h2 id="gain">How much pruning saves</h2>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Boards checked with and without pruning</caption>
          <thead>
            <tr>
              <th className="r">n</th>
              <th className="r">Every board, one queen per row (nⁿ: n copies of n multiplied together)</th>
              <th className="r">Nodes visited with pruning</th>
              <th className="r">Solutions</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="r">4</td><td className="r">256</td><td className="r">17</td><td className="r">2</td></tr>
            <tr><td className="r">8</td><td className="r">16,777,216</td><td className="r">2,057</td><td className="r">92</td></tr>
            <tr><td className="r">10</td><td className="r">10,000,000,000</td><td className="r">35,539</td><td className="r">724</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The worst case is still exponential, so pruning does not change the Big-O bound you can prove. But in practice it can make the
        difference between an answer in under a second and no answer in your lifetime. The earlier a branch that cannot succeed is spotted, the bigger the saving.
      </p>

      <h2 id="kinds">Kinds of pruning</h2>
      <ul>
        <li>
          <strong>Rule broken:</strong> the partial answer already breaks a rule, like two queens that clash.
        </li>
        <li>
          <strong>Cannot reach the goal:</strong> for &ldquo;pick items that add up to exactly <M>T</M>&rdquo; with positive items, stop when the sum
          passes <M>T</M>. With the items sorted, you can also stop the loop at the first item that is too big.
        </li>
        <li>
          <strong>Cannot beat the best:</strong> when looking for the best answer, stop when even the best possible finish of this branch is worse
          than the best answer found so far. This is called <em>branch and bound</em>.
        </li>
        <li>
          <strong>Repeats:</strong> with repeated items, such as [1, 1, 2], skip an item when it equals the one just tried at the same level, so the
          same group is not listed twice.
        </li>
      </ul>
      <Note title="Pruning must never cut an answer">
        <p>
          A prune is a claim: nothing below this point can work. If the claim is wrong, the search silently misses answers, and no error appears.
          Test a pruned search against the plain version on small inputs (<Link href="/dsa/corr/5/#stress">CORR-5</Link>).
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/recr/practice/5/">RECR-P5, Queens on the yard</Link>.
      </p>
    </>
  );
}
