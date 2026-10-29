import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ForestFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Some problems split things into groups that only ever join together, never split apart: friends of friends, connected places on a map,
        pixels of one colour. Union-find keeps track of such groups with two operations, and both are almost free.
      </p>

      <h2 id="job">Groups that only merge</h2>
      <p>
        Two sets are <strong>disjoint</strong> when they have no element in common. A collection of disjoint sets is also called a{" "}
        <strong>partition</strong>: every element is in exactly one set. Number the elements 0 to <M>n − 1</M>. At the start each element is in a
        set of its own. We want two operations:
      </p>
      <ul>
        <li>
          <code>find(x)</code>: which set is <M>x</M> in? The answer is one chosen element of the set, called its{" "}
          <strong>representative</strong>. The name itself does not matter; what matters is that <code>find(x) == find(y)</code> exactly when{" "}
          <M>x</M> and <M>y</M> are in the same set.
        </li>
        <li>
          <code>union(a, b)</code>: join the set of <M>a</M> and the set of <M>b</M> into one.
        </li>
      </ul>
      <p>
        The structure is called <strong>union-find</strong>, or a <strong>disjoint-set union</strong> (DSU). It cannot split a set again, and it
        cannot list a set&rsquo;s elements quickly. It does one thing, and does it very fast.
      </p>

      <h2 id="labels">A label per element</h2>
      <p>
        The first idea is a list <code>label</code> where <code>label[x]</code> is the representative of <M>x</M>&rsquo;s set. Then{" "}
        <code>find</code> is one read. But <code>union</code> must change the label of every element of one set, and the only way to find them
        all is to read the whole list. Step through the second variant of the figure: every union costs <M>n</M> reads, so <M>n</M> unions cost{" "}
        <M>
          n<sup>2</sup>
        </M>{" "}
        (n times n).
      </p>

      <h2 id="forest">A forest of parent pointers</h2>
      <p>
        The better idea is to store each set as a tree, where every element points to a <strong>parent</strong> in the same set, and the root
        points to itself. The root is the representative. A collection of trees is called a <strong>forest</strong>. One list stores the whole
        forest: <code>parent[x]</code> is the parent of <M>x</M>.
      </p>
      <ul>
        <li>
          <code>find(x)</code>: follow parents up from <M>x</M> until an element is its own parent. Return it.
        </li>
        <li>
          <code>union(a, b)</code>: find the two roots. If they are different, make one root point to the other. That is a single change to the
          list.
        </li>
      </ul>
      <ForestFigure />
      <Invariant>Two elements are in the same set exactly when following parents from each reaches the same root.</Invariant>
      <p>
        Why does this stay true? A union changes only the parent of a root. Every element that reached the old root now reaches the new root, one
        step further up, and nothing else changes. So the two sets become one, and every other set is untouched.
      </p>
      <p>
        Unlike the trees of TREE and BALT, the order inside these trees means nothing, and a node may have any number of children. Only the
        root matters. The links also point upwards, from child to parent, so a node never needs to know its children.
      </p>

      <h2 id="code">The code</h2>
      <CodeBlock
        code={`class DSU:
    def __init__(self, n):
        self.parent = list(range(n))   # everyone is a root

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False               # already in one set
        self.parent[ra] = rb
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)`}
      />
      <p>
        Returning <code>False</code> when the two elements are already together is a small, useful habit: lesson 5 uses it to find cycles.{" "}
        <code>list(range(n))</code> builds <code>[0, 1, …, n − 1]</code>, so every element starts as its own parent.
      </p>
      <p>
        A union now costs two finds and one change. But a find costs the height of the tree, and nothing so far stops a tree from growing into
        one long path of <M>n</M> nodes. The next two lessons add two simple rules that keep the trees almost flat.
      </p>
      <Note title="Where union-find is used">
        <p>
          Kruskal&rsquo;s algorithm for the cheapest network of roads (SPAN) and connected parts of a graph as edges arrive; grouping pixels of
          an image; merging accounts that share an email address; and type checkers and compilers that decide which names must have the same
          type. Lesson 5 shows several of these.
        </p>
      </Note>
    </>
  );
}
