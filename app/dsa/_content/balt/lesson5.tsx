import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BtreeFigure } from "./figures";

export default function Lesson5() {
  return (
    <>
      <p className="lesson__lede">
        When a tree is too big for memory and lives on a disk, the cost that matters is the number of times you read from the disk. A B-tree puts
        hundreds of keys in each node, so it is only three or four levels deep even for a billion keys. Almost every database uses one.
      </p>

      <h2 id="disks">Reading from a disk</h2>
      <p>
        A disk (a hard disk or an SSD) does not read single values. It reads a whole <strong>block</strong>, usually 4 to 16 KB, at a time. One
        block read from an SSD takes about 0.1 milliseconds, roughly a thousand times longer than reading from memory; a spinning hard disk takes
        about 10 milliseconds. So for data on a disk, a good measure of cost is the number of blocks read, not the number of comparisons.
      </p>
      <p>
        A balanced binary tree with a billion keys has a height of at least 29. If every node is a separate block, one search reads about 30
        blocks. The fix is to make each node fill a whole block. A 16 KB block can hold about a thousand keys and links, so each node can have
        about a thousand children. Then three levels hold a billion keys, and the top one or two levels are small enough to stay in memory.
      </p>

      <h2 id="rules">The B-tree rules</h2>
      <p>
        A B-tree (Bayer and McCreight, 1972) has a number <M>t</M> of at least 2, called its <strong>minimum degree</strong>. Each node holds a
        sorted list of keys, and a node that is not a leaf has one more child than it has keys. The keys split the range of values: everything in
        the first child is smaller than the first key, everything in the second child lies between the first and second keys, and so on.
      </p>
      <ol>
        <li>
          Every node holds at most <M>2t − 1</M> keys. Every node except the root holds at least <M>t − 1</M>.
        </li>
        <li>A node with k keys that is not a leaf has exactly k + 1 children.</li>
        <li>All leaves are at the same depth.</li>
      </ol>
      <p>
        The figure uses <M>t = 2</M>: each node holds 1 to 3 keys and has 2 to 4 children. This small case is called a 2-3-4 tree. Real B-trees
        use <M>t</M> in the hundreds.
      </p>
      <p>
        How tall can it get? The root has at least 1 key and 2 children, and every other node has at least <M>t</M> children. So level <M>d</M>{" "}
        has at least{" "}
        <M>
          2t<sup>d−1</sup>
        </M>{" "}
        nodes (<M>d − 1</M> copies of <M>t</M> multiplied together, then doubled), each with at least <M>t − 1</M> keys. Adding up gives{" "}
        <M>
          n ≥ 2t<sup>h</sup> − 1
        </M>
        , so:
      </p>
      <Invariant label="Height">A B-tree with n keys has height at most log<sub>t</sub>((n + 1) / 2): the number of times you can divide (n + 1)/2 by t.</Invariant>
      <p>
        With <M>t = 1,000</M> and a billion keys, that is a height of at most 2, so 3 levels.
      </p>

      <h2 id="search">Search</h2>
      <p>
        Read the root. Find the first key that is at least the key you want (binary search inside the node, or a plain scan for small nodes). If
        it is equal, stop. Otherwise go down into the child just before that key, and repeat. Step through the second variant of the figure.
      </p>

      <BtreeFigure />

      <p>
        A search reads one node per level: <M>O(log<sub>t</sub> n)</M> disk reads, where <M>log<sub>t</sub> n</M> is the number of times you can divide <M>n</M> by <M>t</M>. Inside each node the work is <M>O(log t)</M> with binary search, so
        the total number of comparisons is <M>O(log n)</M>, as for a binary tree. What fell is the number of disk reads.
      </p>

      <h2 id="insert">Insert with splits</h2>
      <p>
        A new key always goes into a leaf, in order. The problem is a full leaf. The fix is to <strong>split</strong> it: a full node with{" "}
        <M>2t − 1</M> keys becomes two nodes of <M>t − 1</M> keys each, and its middle key moves up into the parent. Then the parent gains a key,
        so it must have room.
      </p>
      <p>
        The simplest way to make sure of that is to split on the way down (the method in CLRS, the textbook <em>Introduction to Algorithms</em>):
        whenever the search for the key&rsquo;s place is about to step into a full node, split that node first. Then the parent of every split
        has room. If the root itself is full, split it first and put its middle key in a new root. That is the only way the tree gets taller,
        and it adds one level to every path at once, so all the leaves stay at the same depth. The first variant of the figure inserts 10 to 100
        this way.
      </p>
      <CodeBlock
        code={`# parent.kids[i] is full: 2t - 1 keys
def split_child(parent, i):
    full = parent.kids[i]
    right = BNode(full.keys[t:], full.kids[t:])
    # the middle key goes up
    parent.keys.insert(i, full.keys[t - 1])
    parent.kids.insert(i + 1, right)
    full.keys = full.keys[:t - 1]
    full.kids = full.kids[:t]`}
      />
      <p>
        Each split costs <M>O(t)</M> and there is at most one per level, so an insert costs <M>O(t log<sub>t</sub> n)</M> work and <M>O(log<sub>t</sub> n)</M> disk
        reads and writes. Another common method splits on the way back up instead: put the key in the leaf, and if the leaf now has too many
        keys, split it and push the middle key up, repeating as far as needed. Both give valid B-trees; practice BALT-P5 accepts either.
      </p>
      <p>
        Deleting is the reverse: a node that would drop below <M>t − 1</M> keys first borrows a key from a sibling, or merges with a sibling and
        pulls a key down from the parent. If the root loses its last key, its single child becomes the new root, and the tree gets one level
        shorter.
      </p>

      <h2 id="bplus">B+ trees in databases</h2>
      <p>
        Most databases and file systems use a variant called the <strong>B+ tree</strong>. All the keys and their data are stored in the leaves.
        The nodes above hold only copies of some keys, to guide the search, so more of them fit in a block. The leaves are also linked to each
        other in order, so reading every key between a and b is one search followed by a walk along the leaves.
      </p>
      <Note title="In Python">
        <p>
          Python has no B-tree class, but you use one whenever you use the <code>sqlite3</code> module: SQLite stores every table and every index
          as a B-tree in its file. PostgreSQL, MySQL and the file systems NTFS and Btrfs use B-trees or B+ trees too.
        </p>
      </Note>
    </>
  );
}
