import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SkipFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        A skip list (William Pugh, 1990) reaches the same <M>O(log n)</M> search time as a balanced tree with no rotations and no colours. It
        stacks a few sorted linked lists on top of each other and uses coin flips to decide which keys go in the upper lists.
      </p>

      <h2 id="lanes">Linked lists with levels that skip ahead</h2>
      <p>
        Searching a sorted linked list is slow: you can only move one node at a time, so finding a key costs <M>O(n)</M>. Now add a second list
        above it that holds every other key, with each upper node linked to the node below it holding the same key. Search the upper list first,
        and go down only near the end. That roughly halves the work. Add a third list holding every fourth key, and so on.
      </p>
      <p>
        Each of these lists is a <strong>level</strong>. Level 0 holds every key. Each key has a <strong>tower</strong> of nodes, one on each level
        from 0 up to its own height. In code, a node holds its key and a list <code>next</code> of links, one per level of its tower:{" "}
        <code>node.next[i]</code> is the next node on level <M>i</M>. A head node with a link on every level starts all the lists.
      </p>
      <CodeBlock
        code={`class SkipNode:
    def __init__(self, key, height):
        self.key = key
        self.next = [None] * height  # one link per level

class SkipList:
    MAX = 20  # enough levels for about a million keys
    def __init__(self):
        self.head = SkipNode(None, self.MAX)`}
      />

      <h2 id="search">Search</h2>
      <p>
        Start at the head, on the top level. On each level, move right while the next key is smaller than the key you want. When the next key is
        too big, or there is none, go down one level and carry on from the same node. On level 0, the next node holds the key if it is in the
        list. Step through the first variant.
      </p>

      <SkipFigure />

      <CodeBlock
        code={`def contains(self, key):
    node = self.head
    for level in range(self.MAX - 1, -1, -1):
        while (node.next[level] is not None
               and node.next[level].key < key):
            node = node.next[level]
    node = node.next[0]
    return node is not None and node.key == key`}
      />
      <Invariant label="Invariant">At every moment of a search, the current node&rsquo;s key is smaller than the key we want, so the key can only be further right.</Invariant>

      <h2 id="insert">Insert with coin flips</h2>
      <p>
        To insert a key, search for it as above, and on each level remember the last node visited: the node whose link will point to the new
        node on that level. Then choose the new key&rsquo;s height by flipping a coin: it gets level 0, and on each heads it also gets the next
        level up, until the first tails. Finally, on each of its levels, link it in after the remembered node, as in a linked-list insert. Step
        through the second variant.
      </p>
      <CodeBlock
        code={`import random

def random_height(self):
    h = 1
    while h < self.MAX and random.random() < 0.5:  # heads
        h += 1
    return h`}
      />
      <p>
        Deleting works the same way: search, remembering the last node on each level, then on each level where the next node holds the key, link
        around it. No other node changes. Nothing ever needs rebalancing, because the heights were chosen at random and do not depend on the
        order of the inserts.
      </p>

      <h2 id="cost">Expected cost</h2>
      <p>
        A key reaches level 1 with chance 1/2, level 2 with chance 1/4, and level <M>i</M> with chance{" "}
        <M>
          1/2<sup>i</sup>
        </M>{" "}
        (<M>i</M> halves multiplied together). So about <M>n/2</M> keys are on level 1, <M>n/4</M> on level 2, and the top
        level that is not empty is near <M>log₂ n</M>. The towers have an expected height of 2, so the whole list uses about <M>2n</M> links:{" "}
        <M>O(n)</M> space.
      </p>
      <p>
        For the search, trace its path backwards, from the end on level 0 back to the head. At each node, the path came either from the left
        (on the same level) or from above. A node is entered from above exactly when its tower continues upwards, which happens with chance 1/2.
        So on each level the backward path takes, on average, 1 step left before it goes up. With about <M>log₂ n</M> levels, a search looks at
        about <M>2 log₂ n</M> nodes on average.
      </p>
      <p>
        These are <strong>expected</strong> costs: averages over the coin flips, for any input. Unlike a plain search tree, no input order is
        bad. Very unlucky flips could still make one search slow, but the chance of a search taking much longer than <M>O(log n)</M> falls
        very fast; for a list of a million keys it is far too small to matter.
      </p>

      <h2 id="python">In Python</h2>
      <p>
        Python has no skip list in its standard library. They appear in other systems: Redis keeps its sorted sets in skip lists, and
        Java&rsquo;s <code>ConcurrentSkipListMap</code> uses one because many threads can change different parts of a skip list at the same time
        more easily than a tree that rotates.
      </p>
      <Note title="Choosing among the balanced structures">
        <p>
          In memory, a red-black or AVL tree gives guaranteed <M>O(log n)</M>; a skip list gives expected <M>O(log n)</M> with simpler code. On
          disk, use a B-tree. In everyday Python, a <code>dict</code> plus a sorted list with <code>bisect</code> is usually fast enough, and
          practice BALT-P6 blocks <code>bisect</code> so that you build the real thing.
        </p>
      </Note>
    </>
  );
}
