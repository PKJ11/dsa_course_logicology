import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { BuildFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        A trie stores words by their letters. Words that start the same way share the same first nodes. This makes one question very fast that a
        hash set cannot answer well: does any stored word start with these letters?
      </p>

      <h2 id="job">Words that share a start</h2>
      <p>
        A <strong>prefix</strong> of a word is its first few letters. <code>te</code> is a prefix of <code>tea</code> and of <code>ten</code>. The
        whole word counts as a prefix of itself, and so does the empty string.
      </p>
      <p>Many programs need to answer two questions about a large set of words:</p>
      <ul>
        <li>Is this exact word stored? (A spell checker.)</li>
        <li>Does any stored word start with this prefix, and which ones? (A search box that suggests words as you type.)</li>
      </ul>
      <p>
        A Python <code>set</code> answers the first question quickly, but not the second: to find words that start with <code>te</code> it must
        look at every word. A sorted list with binary search (BSRC) can answer both, but each step of the search compares whole strings. A{" "}
        <strong>trie</strong> answers both by reading the prefix one letter at a time, and it never looks at words that do not match. The name
        comes from re<em>trie</em>val. Most people say it like &ldquo;try&rdquo;.
      </p>

      <h2 id="shape">The shape of a trie</h2>
      <p>
        A trie is a tree. Each edge (the line from a node down to a child) carries one letter, and the letters on the edges below a node are all
        different. Reading the letters on the path from the root down to a node spells a prefix, and we say the node <em>stands for</em> that
        prefix. The root stands for the empty prefix.
      </p>
      <p>
        Some prefixes are whole words and some are not. So each node also has a mark that says &ldquo;a stored word ends here&rdquo;. In the
        figures this mark is a small black <strong>end</strong> tag. Step through the figure to see five words go in.
      </p>

      <BuildFigure />

      <Invariant>Every prefix of every stored word has exactly one node, and the path from the root to it spells the prefix.</Invariant>
      <p>
        Why exactly one? Two different paths from the root must split at some node, and after the split they take edges with different letters.
        So they spell different prefixes. In the other direction, every prefix of a stored word was walked or created when the word was inserted.
      </p>
      <p>
        Notice the last two words in the figure. <code>inn</code> was inserted first and created the nodes <code>i</code>, <code>in</code> and{" "}
        <code>inn</code>. When <code>in</code> came next, its node was already there, so the insert only added the end tag. Without the tag, the
        trie could not tell the word <code>in</code> from a prefix that happens to be on the way to <code>inn</code>.
      </p>

      <h2 id="node">A node in Python</h2>
      <p>The simplest node keeps its children in a dict, from a letter to the child node, and one flag for the end of a word:</p>
      <CodeBlock
        code={`class TrieNode:
    def __init__(self):
        self.children = {}  # letter -> TrieNode
        self.end = False    # does a stored word end here?

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True`}
      />
      <p>
        Notice that the node never stores its own letter or its prefix: the letter is the key in the parent&rsquo;s dict. The figures write the
        prefix inside each node only to help you read them.
      </p>
      <p>
        Another common way is an array of 26 children, one per letter <code>a</code> to <code>z</code>, with <code>None</code> where there is no
        child. In C or Java this is faster than a hash table. In Python a dict is simpler and usually uses less memory, because most nodes have
        only one or two children.
      </p>

      <h2 id="cost">Cost and memory</h2>
      <p>
        Inserting or finding a word of length <M>L</M> takes <M>L</M> steps, one per letter, and each step is one dict lookup, which takes{" "}
        <M>O(1)</M> time on average (HASH). So both cost <M>O(L)</M>. The number of stored words, <M>n</M>, does not appear at all. A trie with a
        million words answers as fast as a trie with ten.
      </p>
      <p>
        Compare a sorted list of <M>n</M> words: binary search makes about <M>log₂ n</M> string comparisons (how many times you can halve{" "}
        <M>n</M>), and each comparison can read up to <M>L</M> letters, so <M>O(L log n)</M>. A set is also <M>O(L)</M>, because hashing a string
        reads all of its letters, but a set cannot answer prefix questions.
      </p>
      <p>
        The price is memory. The trie has one node for each different prefix, so at most <M>N + 1</M> nodes, where <M>N</M> is the total number of
        letters in all the words. In Python each node is an object with its own dict, a few hundred bytes. That is much more than the string
        itself. Lesson 4 shows how to cut the number of nodes.
      </p>
      <Note title="Python has no built-in trie">
        <p>
          The standard library has no trie. A quick version uses nested dicts only, with a special key for the end of a word:{" "}
          <code>node = node.setdefault(ch, {"{}"})</code> walks and creates in one line, and <code>node[&quot;$&quot;] = True</code> marks the
          end. This works, but a class makes the code easier to read and to extend, as the next lessons do.
        </p>
      </Note>
    </>
  );
}
