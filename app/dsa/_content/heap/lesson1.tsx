import { Invariant, M, Note } from "../../_components/Prose";
import { PropertyFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        Many programs only ever need the smallest item: the next event in a simulation, the most urgent task, the closest unvisited place on a
        map. A heap is built for exactly that job. It finds the smallest item in <M>O(1)</M> and adds or removes an item in <M>O(log n)</M>, and
        it is stored in a plain list.
      </p>

      <h2 id="job">A structure for the smallest value</h2>
      <p>Compare the simple choices for a collection where you keep adding items and taking out the smallest one:</p>
      <div className="tt-wrap">
        <table className="tt">
          <caption className="visually-hidden">Costs of adding and taking the smallest item</caption>
          <thead>
            <tr>
              <th>Structure</th>
              <th>Add</th>
              <th>Take the smallest</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unsorted list</td>
              <td>
                <M>O(1)</M>
              </td>
              <td>
                <M>O(n)</M> (scan for it)
              </td>
            </tr>
            <tr>
              <td>Sorted list</td>
              <td>
                <M>O(n)</M> (shift to make room)
              </td>
              <td>
                <M>O(1)</M> (from the end)
              </td>
            </tr>
            <tr>
              <td>Balanced search tree (BALT)</td>
              <td>
                <M>O(log n)</M>
              </td>
              <td>
                <M>O(log n)</M>
              </td>
            </tr>
            <tr>
              <td>Binary heap</td>
              <td>
                <M>O(log n)</M>
              </td>
              <td>
                <M>O(log n)</M>, and looking at it is <M>O(1)</M>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        A balanced tree matches the heap&rsquo;s cost, but it keeps the whole collection in order, which is more than this job needs. A heap keeps
        only enough order to know the smallest item. That makes it simpler, smaller and faster in practice.
      </p>

      <h2 id="rule">The heap rule</h2>
      <p>
        A binary heap is a binary tree with two properties. The first is about its <strong>shape</strong>: it is a <strong>complete</strong>{" "}
        tree, meaning every level is full except perhaps the last, and the last level is filled from the left with no gaps. The second is about
        its <strong>order</strong>:
      </p>
      <Invariant label="Invariant">In a min-heap, every node&rsquo;s value is at most the values of its children.</Invariant>
      <p>
        From the rule, the root holds the smallest value. Proof: take any node and walk up from it to the root. Each step goes to a parent, whose
        value is at most the child&rsquo;s, so the values never grow on the way up. So the root is at most every node.
      </p>
      <p>
        A <strong>max-heap</strong> uses the opposite rule (every parent is at least its children), so its root holds the largest value. Heap
        sort in SORT-4 used a max-heap. This station uses min-heaps, as Python&rsquo;s <code>heapq</code> does.
      </p>

      <h2 id="list">A tree stored in a list</h2>
      <p>
        Because the tree is complete, there is no need for nodes and links. Write the values level by level, left to right, into a list. The
        positions then give the shape. Step through the figure:
      </p>

      <PropertyFigure />

      <ul>
        <li>
          The root is at position 0.
        </li>
        <li>
          The children of position <M>i</M> are at <M>2i + 1</M> and <M>2i + 2</M>, if those are less than <M>n</M>.
        </li>
        <li>
          The parent of position <M>i</M> is at <code>(i - 1) // 2</code> (<code>//</code> divides and rounds down).
        </li>
        <li>
          Positions <code>n // 2</code> to <M>n − 1</M> are leaves: the second half of the list has no children.
        </li>
      </ul>
      <p>
        Why do these formulas work? Level <M>d</M> holds{" "}
        <M>
          2<sup>d</sup>
        </M>{" "}
        positions (<M>d</M> twos multiplied together; 2⁰ is 1), starting at position{" "}
        <M>
          2<sup>d</sup> − 1
        </M>
        . The node at position <M>i</M> has <M>i</M> nodes before it in the list; its children come right after the children of all those
        nodes, two each, so the first child lands at <M>2i + 1</M>.
      </p>
      <p>
        A complete tree with <M>n</M> nodes has height <M>log₂ n</M> rounded down: 3 for 8 to 15 nodes, 19 for a million. Every operation in
        this station walks one path, so this height is what makes them fast.
      </p>

      <h2 id="not">What a heap does not tell you</h2>
      <p>
        A heap is much weaker than a sorted list. Siblings are in no order: in the figure, 3 is to the left of 2. And a value deep in one
        branch can be smaller than a value higher up in another branch: in the heap <code>[1, 5, 2, 6, 7, 3]</code>, 3 is two levels down but
        smaller than 5, which is one level down. So a heap cannot:
      </p>
      <ul>
        <li>
          find an arbitrary value faster than <M>O(n)</M>: the rule rules out very little;
        </li>
        <li>
          list the values in order without taking them out one by one. The second smallest is one of the root&rsquo;s two children, but the
          third smallest could be a child of either of them, and the choices grow further down.
        </li>
      </ul>
      <Note title="Not the same heap">
        <p>
          The word heap also names the area of memory where a program creates objects at run time. The two have nothing to do with each other.
        </p>
      </Note>
    </>
  );
}
