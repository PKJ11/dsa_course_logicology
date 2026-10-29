import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RankFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        A find goes up from an element to its root, so its cost is the height of the tree. Union decides which root goes below the other. Always
        putting the smaller tree below keeps every tree&rsquo;s height at most log₂ n.
      </p>

      <h2 id="tall">How trees grow tall</h2>
      <p>
        The code of lesson 1 always makes the first root point to the second. Step through the first variant: the unions{" "}
        <code>union(0, 1)</code>, <code>union(0, 2)</code>, …, <code>union(0, 7)</code> each put the whole tree so far below a single new element.
        The result is one path, and a find from its bottom goes up through <M>n − 1</M> parents. Repeat that find <M>n</M> times and the work is about{" "}
        <M>
          n<sup>2</sup>
        </M>
        , no better than the label list.
      </p>
      <p>The mistake is putting a big tree under a small one. Every element of the big tree gets one step further from the root.</p>

      <RankFigure />

      <h2 id="rank">The smaller tree goes below</h2>
      <p>
        <strong>Union by rank</strong> gives every root a number called its <strong>rank</strong>, which starts at 0. When two roots join:
      </p>
      <ul>
        <li>if their ranks differ, the root with the smaller rank points to the other one, and no rank changes;</li>
        <li>if their ranks are equal, either one can go below, and the rank of the root that stays on top goes up by 1.</li>
      </ul>
      <p>
        Without path compression (lesson 3), the rank of a root is exactly the height of its tree. Joining a shorter tree under a taller one
        leaves the height as it was. Only two trees of equal height make a taller one, and only by 1. In the figure, the same unions that made a
        path now make a tree of height 1.
      </p>
      <CodeBlock
        code={`def __init__(self, n):
    self.parent = list(range(n))
    self.rank = [0] * n

def union(self, a, b):
    ra, rb = self.find(a), self.find(b)
    if ra == rb:
        return False
    if self.rank[ra] > self.rank[rb]:
        ra, rb = rb, ra            # ra has the smaller rank
    self.parent[ra] = rb
    if self.rank[ra] == self.rank[rb]:
        self.rank[rb] += 1
    return True`}
      />

      <h2 id="proof">Why the height is at most log₂ n</h2>
      <Invariant>
        A root of rank r has at least 2<sup>r</sup> elements in its tree.
      </Invariant>
      <p>
        Here 2<sup>r</sup> means <M>r</M> twos multiplied together (and 2⁰ is 1). Proof by induction on the number of unions. At the start every root has
        rank 0 and one element, and{" "}
        <M>
          2<sup>0</sup> = 1
        </M>
        . A union of roots with different ranks does not change any rank, and the root on top only gains elements. A union of two roots that
        both have rank <M>r</M> makes a root of rank <M>r + 1</M>, and its tree holds both trees: at least{" "}
        <M>
          2<sup>r</sup> + 2<sup>r</sup> = 2<sup>r+1</sup>
        </M>{" "}
        elements.
      </p>
      <p>
        There are only <M>n</M> elements, so{" "}
        <M>
          2<sup>r</sup> ≤ n
        </M>
        , which means <M>r ≤ log₂ n</M>. The height of a tree is never more than the rank of its root, so every find goes up at most{" "}
        <M>log₂ n</M> parents: 20 for a million elements. The third variant shows the tallest case for 8 elements: unions of equal pairs, then
        equal fours, give height 3 = log₂ 8.
      </p>

      <h2 id="size">Union by size</h2>
      <p>
        Instead of a rank, a root can store the <strong>size</strong> of its tree, the number of its elements. The root of the smaller tree goes
        below, and the sizes are added. The same proof works: an element moves one level further from its root only when its tree is joined to
        one at least as large, so its tree at least doubles each time, and that can happen at most <M>log₂ n</M> times.
      </p>
      <CodeBlock
        code={`def union(self, a, b):
    ra, rb = self.find(a), self.find(b)
    if ra == rb:
        return False
    if self.size[ra] > self.size[rb]:
        ra, rb = rb, ra            # ra is the smaller tree
    self.parent[ra] = rb
    self.size[rb] += self.size[ra]
    return True`}
      />
      <p>
        Size has a bonus: <code>size[find(x)]</code> is the number of elements in <M>x</M>&rsquo;s set, which many problems ask for. Practice
        DSUF-P2 needs it. Rank uses less memory in theory (a rank never exceeds <M>log₂ n</M>, so it fits in a byte), which does not matter in
        Python.
      </p>
      <Note title="Only the roots need it">
        <p>
          The rank or size of an element that is no longer a root is never read again. There is no need to update or clear it.
        </p>
      </Note>
    </>
  );
}
