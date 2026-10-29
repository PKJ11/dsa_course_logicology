import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { ShapeFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A binary search tree finds, inserts and deletes a key by walking one path down from the root. So its speed depends on one number: its
        height. This station is about trees that keep their height small, whatever order the keys arrive in.
      </p>

      <h2 id="cost">The height is the cost</h2>
      <p>
        Recall from TREE-4: search, insert, delete, smallest, largest and successor each walk one path down the tree. Each step down costs{" "}
        <M>O(1)</M>, and a path has at most <M>h + 1</M> nodes, where <M>h</M> is the height (the number of edges on the longest path from the
        root down). So every one of these jobs costs <M>O(h)</M>.
      </p>
      <p>
        How small can <M>h</M> be? Level 0 holds at most 1 node, level 1 at most 2, level 2 at most 4, and level <M>d</M> at most{" "}
        <M>
          2<sup>d</sup>
        </M>{" "}
        (<M>d</M> twos multiplied together). A tree of height <M>h</M> therefore holds at most{" "}
        <M>
          1 + 2 + 4 + … + 2<sup>h</sup> = 2<sup>h+1</sup> − 1
        </M>{" "}
        nodes. Turned around: a tree with <M>n</M> nodes has height at least <M>log₂(n + 1) − 1</M>, rounded up. Here <M>log₂ n</M> is the number
        of times you can halve <M>n</M> before you reach 1. For a million keys the smallest possible height is 19.
      </p>
      <p>
        So the best a binary search tree can do is <M>O(log n)</M> per job. The question is how to stay close to that best.
      </p>

      <h2 id="worst">The worst case is common</h2>
      <p>Step through the figure. The first variant inserts the keys 1 to 7 in sorted order; the second builds a tree from the same keys by always taking the middle key first.</p>

      <ShapeFigure />

      <p>
        Sorted order gives the worst possible tree: a path. Each new key is bigger than all the others, so it goes right at every node. The height
        is <M>n − 1</M>, and inserting all <M>n</M> keys costs <M>0 + 1 + 2 + … + (n − 1)</M> comparisons, which is about{" "}
        <M>
          n<sup>2</sup>/2
        </M>{" "}
        (<M>n</M> times <M>n</M>, halved). For 100,000 keys that is 5 billion comparisons.
      </p>
      <p>
        Sorted input is not rare. Order numbers, timestamps, roll numbers and dates usually arrive in increasing order. Nearly sorted input is
        almost as bad. Keys that arrive in a random order give a short tree on average (height about <M>4.3 ln n</M>, TREE-4), but a program
        cannot choose the order of its input.
      </p>
      <Invariant label="Goal">A balanced tree keeps its height at O(log n) after every insert and delete, whatever the order of the keys.</Invariant>

      <h2 id="perfect">Perfect balance is too strict</h2>
      <p>
        The second variant shows how to build the shortest tree from a sorted list: take the middle key as the root, then build the left half and
        the right half the same way. Each key is placed once, so this costs <M>O(n)</M>.
      </p>
      <CodeBlock
        code={`def build(keys, lo, hi):  # keys[lo..hi] is sorted
    if lo > hi:
        return None
    mid = (lo + hi) // 2
    node = TreeNode(keys[mid])
    node.left = build(keys, lo, mid - 1)
    node.right = build(keys, mid + 1, hi)
    return node`}
      />
      <p>
        So why not keep the tree perfect after every insert? Because one insert can force a change everywhere. Call a tree complete when
        every level is full except the last, and the last fills from the left. Take the complete tree of 1 to 7 from the figure and insert 8. The
        complete tree of 1 to 8 has 5 at the root and 3 and 7 below it: every one of the old seven nodes now holds a different key. That is{" "}
        <M>O(n)</M> work for a single insert.
      </p>
      <p>
        The way out is to ask for less. A tree is <strong>balanced</strong> if its height is at most a fixed number times <M>log₂ n</M>, for
        example <M>2 log₂ n</M>. That small amount of slack is enough to repair the tree in <M>O(log n)</M> time after each change.
      </p>

      <h2 id="families">Three ways to stay short</h2>
      <p>The rest of this station shows the three main ideas.</p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Three families of balanced search structures</caption>
          <thead>
            <tr>
              <th>Idea</th>
              <th>Structures</th>
              <th>Lessons</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rotate: move a few links to lift one side and lower the other</td>
              <td>AVL trees, red-black trees</td>
              <td>BALT-2, 3, 4</td>
            </tr>
            <tr>
              <td>Many keys per node, and grow only at the root</td>
              <td>B-trees, 2-3 trees</td>
              <td>BALT-5</td>
            </tr>
            <tr>
              <td>Use randomness, so that no input order is bad on average</td>
              <td>Skip lists (and treaps)</td>
              <td>BALT-6</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        A fourth idea, rebuilding only the part of the tree that has become too lopsided, gives scapegoat trees. It is less common, so this course
        leaves it out.
      </p>
      <Note title="In Python">
        <p>
          Python&rsquo;s standard library has no balanced search tree. The usual choices are a <code>dict</code> or <code>set</code> when you only
          need to find keys, and a sorted list with the <code>bisect</code> module when you also need order. <code>bisect.insort</code> finds the
          place in <M>O(log n)</M> but then shifts the rest of the list, which is <M>O(n)</M>; the shift is fast machine code, so this is fine up
          to about a million keys. The widely used <code>sortedcontainers</code> package (not part of Python itself) stores a list of short sorted
          lists to make inserts cheaper.
        </p>
      </Note>
    </>
  );
}
