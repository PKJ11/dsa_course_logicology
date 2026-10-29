import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { TreeFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A tree has no cycles, so it splits cleanly at every vertex: what happens below a vertex does not depend on anything outside, except
        through that one vertex. That makes trees the easiest place to do dynamic programming. Each vertex gets an answer for the part of the
        tree below it, built from its children’s answers.
      </p>

      <h2 id="subtrees">A state for each subtree</h2>
      <p>
        Pick any vertex as the top of the tree and call it the <strong>root</strong> (TREE-1). Every other vertex then has one{" "}
        <strong>parent</strong>, the next vertex on the way up, and its <strong>children</strong> are the vertices just below it. The{" "}
        <strong>subtree</strong> of v is v together with everything below it.
      </p>
      <p>
        Two subtrees of different children of v share no vertex, and no edge joins them: every edge from inside a child’s subtree to the rest of
        the tree goes through that child and v. So a question about v’s subtree usually splits into the same question for each child’s
        subtree, plus a decision about v itself. That is the DP state: <strong>one answer (or a few) per subtree</strong>.
      </p>
      <p>
        The order of work follows from it. A vertex needs its children’s answers first, so the vertices are handled children first, root last.
        This is a <strong>post-order</strong> (TREE-2). There are n states and each child is read once by its parent, so tree DPs usually cost{" "}
        <M>O(n)</M>.
      </p>

      <h2 id="staff">Take or skip</h2>
      <p>
        A line of stations forms a tree of roads. Each station has a value, and you want to staff some of them, but never two stations joined by
        a road. What is the largest total value? On a general graph this is the maximum weight independent set, an NP-hard problem (HARD-1). On a
        tree it takes one pass.
      </p>
      <p>
        One answer per subtree is not enough, because the parent needs to know whether the child itself was staffed. So keep two:
      </p>
      <ul>
        <li>
          <code>take(v)</code>: the best total in v’s subtree when v is staffed. Then no child may be staffed, so add the value of v and each
          child’s <code>skip</code>.
        </li>
        <li>
          <code>skip(v)</code>: the best total when v is not staffed. Then each child is free, so add the better of each child’s two answers.
        </li>
      </ul>
      <p>
        Why is that right? A choice in v’s subtree is a choice of v plus a separate choice in each child’s subtree. The only rule that links them
        is the road between v and a child. Once v’s own choice is fixed, the children no longer affect each other, so each can be made as good as
        possible on its own. The answer is the better of the root’s two values. Step through the figure; then switch it to rerooting, which is
        the last section.
      </p>
      <TreeFigure />
      <CodeBlock
        title="staff_recursive.py"
        code={`def best_staffing(children, value, root=0):
    def solve(v):                 # (take, skip) for v's subtree
        take, skip = value[v], 0
        for c in children[v]:
            t, s = solve(c)
            take += s             # v staffed: c is not
            skip += max(t, s)     # v not staffed: c is free
        return take, skip
    return max(solve(root))`}
      />
      <p>
        To list the staffed stations, walk back down from the root, as the figure’s last step does: if the root takes, its children skip;
        a child that may choose takes its better answer, and so on down.
      </p>

      <h2 id="order">Without recursion</h2>
      <p>
        The recursive version is short, but its depth is the height of the tree. A path of 100,000 stations is a tree too, and Python stops at
        about 1,000 nested calls (RECR-2). In the browser the limit is lower still. So for big trees, make the order by hand:
      </p>
      <ol>
        <li>Go through the tree from the root in BFS order (GRPH-2). Each vertex is listed after its parent, and you note each vertex’s parent.</li>
        <li>Go through that list backwards. Now each vertex comes after all of its children: a valid children-first order.</li>
      </ol>
      <CodeBlock
        title="staff_loop.py"
        code={`def best_staffing(n, roads, value):
    adj = [[] for _ in range(n)]
    for u, v in roads:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    order = [0]
    for v in order:                   # BFS: each parent before its children
        for c in adj[v]:
            if c != parent[v]:
                parent[c] = v
                order.append(c)
    take = value[:]
    skip = [0] * n
    for v in reversed(order):         # each child before its parent
        p = parent[v]
        if p >= 0:
            take[p] += skip[v]
            skip[p] += max(take[v], skip[v])
    return max(take[0], skip[0])`}
      />
      <p>
        Two details. The <code>for v in order</code> loop sees the items appended during the loop, so it walks the whole tree. And the test{" "}
        <code>c != parent[v]</code> stops the search going back up the road it came down; in a tree that is the only way back to a vertex
        already listed. Instead of the parent asking each child, each child here pushes its answers up to its parent. The sums come out the same.
      </p>

      <h2 id="more">Other answers per subtree</h2>
      <ul>
        <li>
          <strong>Sizes.</strong> <code>size(v) = 1 + size</code> of each child: the number of vertices in each subtree, in one backward pass.
        </li>
        <li>
          <strong>The longest route (the diameter).</strong> Keep <code>deep(v)</code>, the longest way down from v. The longest route that has v
          as its highest vertex goes down through v’s two deepest children, so it is the sum of the two largest <code>deep(c) + 1</code> values.
          The diameter is the largest of these over all v.
        </li>
        <li>
          <strong>The fewest guards on roads.</strong> To cover every road with a guard at one of its ends (a vertex cover, FLOW-5), keep{" "}
          <code>with(v)</code> and <code>without(v)</code>. If v has no guard, every child must have one.
        </li>
        <li>
          <strong>A budget spread over a tree.</strong> When the state is (v, how many vertices chosen inside v’s subtree), a parent joins its
          children’s tables one at a time. Joining tables of sizes a and b costs about a × b. Count it as pairs of vertices: each pair (x, y) is
          paid for once, at the vertex where their subtrees first meet. So the whole tree costs <M>O(n²)</M> (n · n), not the <M>O(n³)</M> (n · n · n) that a quick
          count suggests.
        </li>
      </ul>

      <h2 id="reroot">Every station as the top</h2>
      <p>
        Some questions ask for an answer at <em>every</em> vertex as if it were the root. For example: for each station, the total distance to
        all the other stations. Running the one-root DP from every vertex costs <M>n × O(n) = O(n²)</M>. <strong>Rerooting</strong> does it in{" "}
        <M>O(n)</M> with two passes:
      </p>
      <ol>
        <li>
          <strong>Up (children first),</strong> with root r: <code>size(v)</code>, and <code>down(v)</code>, the total distance from v to the
          vertices of its subtree. Each vertex in a child c’s subtree is one road further from v than from c, so{" "}
          <code>down(v)</code> adds <code>down(c) + size(c)</code> over the children.
        </li>
        <li>
          <strong>Down (parents first):</strong> <code>total(r) = down(r)</code>. Then move the answer from each parent p to each child c.
        </li>
      </ol>
      <Invariant label="Reroot">total(c) = total(p) − size(c) + (n − size(c)) = total(p) + n − 2 · size(c)</Invariant>
      <p>
        <strong>Why.</strong> Take the distances from p and change the start to c, one road further down. The <code>size(c)</code> vertices in
        c’s subtree are reached from c without the road p–c, so each is exactly 1 closer. Every other vertex, <M>n − size(c)</M> of them, is
        reached from c by first going up to p, so each is exactly 1 further. No vertex is in both groups. With roads of different lengths, the
        change is the length of the road p–c instead of 1, which is the practice problem.
      </p>
      <p>
        The pattern is general. Pass 1 computes each answer looking down. Pass 2 gives each child the answer for “everything that is not in my
        subtree”, which the parent can build from its own answer and its other children. When the combining step cannot be undone (a maximum
        rather than a sum), keep the best and second-best child values, so that a child that gave the best can be given the second-best.
      </p>
      <Note title="Python’s tools">
        <p>
          <code>sys.setrecursionlimit</code> lets recursive tree DPs go deeper in CPython, but the C stack can still run out, and the browser’s
          limit is lower. The list-based order above has no limit. <code>networkx</code> has tree helpers, but a tree DP is usually a dozen lines
          on plain lists.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/addp/practice/1/">ADDP-P1, Total distance from every station</Link>.
      </p>
    </>
  );
}
