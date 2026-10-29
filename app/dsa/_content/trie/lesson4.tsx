import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { RadixFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        In a plain trie, long words make long chains of nodes with one child each. A compressed trie replaces each chain with a single edge
        labelled with a whole string. It stores the same words with far fewer nodes, and the number of nodes no longer depends on how long the
        words are.
      </p>

      <h2 id="waste">Nodes that do no work</h2>
      <p>
        Look at a node that is not the end of a word and has exactly one child. A search that reaches it has only one way to go. The node holds
        no information that its child does not hold. A chain of such nodes is common: in a dictionary of English words, most of the nodes near
        the bottom are like this, because once a few letters are read, usually only one word is left.
      </p>
      <p>
        A <strong>compressed trie</strong> (also called a <strong>radix tree</strong>, or a Patricia trie) merges each such chain into one edge,
        and labels the edge with all of the chain&rsquo;s letters. Step through &ldquo;Merge the chains&rdquo;.
      </p>

      <RadixFigure />

      <p>The rules for a compressed trie are:</p>
      <ul>
        <li>An edge is labelled with a non-empty string, not just one letter.</li>
        <li>The labels of the edges below a node all start with different letters. So the next letter of a search picks at most one edge.</li>
        <li>Every node except the root is the end of a word or has at least two children.</li>
      </ul>

      <h2 id="bound">At most 2n nodes</h2>
      <Invariant label="Size">A compressed trie of n words has at most 2n nodes, whatever the length of the words.</Invariant>
      <p>
        Proof. Every node with no children is the end of a word (otherwise the third rule would fail), so there are at most <M>n</M> such
        nodes, called <strong>leaves</strong>. Now count the nodes with two or more children, the <strong>branch nodes</strong>. Each branch node
        splits the paths below it into at least two, and in a tree with <M>b</M> leaves there are at most <M>b − 1</M> such splits. So there are
        fewer than <M>n</M> branch nodes. Every other node is the end of a word, and each word has only one end node. Adding up: every node is the
        root, a word end, or a branch node, so there are at most <M>1 + n + (n − 1) = 2n</M> nodes.
      </p>
      <p>
        A plain trie can have one node per letter: 10,000 words of length 20 can need 200,000 nodes, where the compressed trie needs at most
        20,000. The letters are still stored, on the edges. To avoid copying them, an edge can store three numbers instead of a string: which word
        the letters come from, and where they start and end in it.
      </p>

      <h2 id="insert">Insert splits an edge</h2>
      <p>
        Searching a compressed trie works as before, but an edge is matched string by string. At each node, pick the edge whose label starts with
        the next letter, then check that the word continues with the whole label. Three cases:
      </p>
      <ul>
        <li>The word continues with the whole label: follow the edge.</li>
        <li>
          The word ends inside the label (searching for <code>toa</code> on the edge <code>ast</code>). Then no node stands for the word, so it
          is not stored, but it <em>is</em> a prefix of a stored word: <code>starts_with</code> says yes.
        </li>
        <li>The word and the label differ at some letter. Then the word is not there.</li>
      </ul>
      <p>
        Insert follows the same walk. When the word and a label part ways in the middle, as <code>toad</code> does with <code>ast</code> in the
        second variant, the edge is <strong>split</strong>: a new node takes the shared part of the label (<code>a</code>), the old child hangs
        below it with the rest (<code>st</code>), and the rest of the word becomes a new edge (<code>d</code>). If the word ends exactly at the
        split, the new node itself is tagged and nothing else is added.
      </p>
      <CodeBlock
        code={`class RNode:
    def __init__(self):
        self.kids = {}     # first letter -> (label, RNode)
        self.end = False

def insert(root, word):
    node, i = root, 0
    while i < len(word):
        ch = word[i]
        if ch not in node.kids:
            leaf = RNode()
            leaf.end = True
            node.kids[ch] = (word[i:], leaf)   # a new edge
            return
        label, child = node.kids[ch]
        j = 0   # how many letters the word and label share
        while j < len(label) and i + j < len(word) and label[j] == word[i + j]:
            j += 1
        if j < len(label):                     # split the edge
            mid = RNode()
            mid.kids[label[j]] = (label[j:], child)
            node.kids[ch] = (label[:j], mid)
            child = mid
        node, i = child, i + j
    node.end = True`}
      />
      <p>
        Each step reads letters of the word that it has not read before, so insert and search still cost <M>O(L)</M>. Delete is the opposite of
        a split: after removing a word, a node that is no longer a word end and has only one child is merged with that child, joining the two
        labels.
      </p>

      <h2 id="uses">Where they are used</h2>
      <ul>
        <li>
          <strong>Network routers</strong> look up the longest stored prefix of an address&rsquo;s bits, to choose where to send a packet. Their
          tables are compressed tries of bits (lesson 5 shows tries of bits).
        </li>
        <li>
          <strong>Databases and key-value stores</strong>: Redis keeps its keys in a radix tree, and Ethereum stores its state in a variant
          called a Merkle Patricia trie.
        </li>
        <li>
          <strong>Suffix trees</strong>: the compressed trie of all the suffixes (the endings) of one text. It finds any pattern in the text in
          time that depends only on the length of the pattern. STRG comes back to this idea.
        </li>
      </ul>
      <Note title="Is the compression worth it in Python?">
        <p>
          It saves nodes, and each Python object is large, so for long words it saves a lot of memory. It also makes the code longer, and the
          slicing in <code>word[i:]</code> copies letters. For short words, such as the words of a dictionary, a plain dict-of-dicts trie is
          often fast enough and much simpler. Practice TRIE-P4 builds the compressed version.
        </p>
      </Note>
    </>
  );
}
