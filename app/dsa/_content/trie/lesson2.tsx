import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SearchFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Search follows one edge per letter, like insert, but never creates anything. Prefix search is the same walk with an easier finish. Delete
        is the only operation that needs care: it must remove the nodes that no longer lead to any word, and no others.
      </p>

      <h2 id="search">Search and prefix search</h2>
      <p>
        To search for a word, start at the root and, for each letter, follow the edge with that letter. Two things can happen:
      </p>
      <ul>
        <li>
          Some node has no edge for the next letter. Then no stored word even starts with the letters read so far, and the answer is no. Step
          through &ldquo;Search tin&rdquo;.
        </li>
        <li>
          Every letter is found. Then the answer depends on the end tag of the last node: tagged means the word is stored (&ldquo;Search
          ten&rdquo;); not tagged means it is only the start of longer words (&ldquo;Search te&rdquo;).
        </li>
      </ul>
      <p>
        A <strong>prefix search</strong> (often called <code>starts_with</code>) asks whether any stored word starts with the given letters. The
        walk is the same; the answer is yes as soon as every letter is found, tag or no tag. This needs one rule to hold, which delete must keep:
      </p>
      <Invariant>Every node lies on the path of at least one stored word: below every node there is a node with an end tag.</Invariant>

      <SearchFigure />

      <h2 id="delete">Delete without leaving waste</h2>
      <p>
        To delete a word, walk to its node and remove its end tag. That is enough to make <code>search</code> say no. But it can break the rule
        above: if the node has no children, nothing is below it any more, and <code>starts_with</code> would still say yes for the deleted word.
      </p>
      <p>
        So after removing the tag, walk back up the path. While the current node has no tag and no children, remove it from its parent. Stop at
        the first node that has a tag or another child, or at the root. Step through &ldquo;Delete in, inn&rdquo;: deleting <code>in</code> removes
        only its tag, because <code>inn</code> is below it; deleting <code>inn</code> then removes three nodes.
      </p>
      <p>
        To walk back up, remember the path on the way down: a list of (parent, letter) pairs. Nodes do not need a link to their parent. A
        recursive delete also works, because the recursion keeps the path for you; a word is rarely long enough to reach Python&rsquo;s recursion
        limit of about 1,000.
      </p>

      <h2 id="code">The code</h2>
      <CodeBlock
        code={`class Trie:
    def __init__(self):
        self.root = TrieNode()

    def _walk(self, s):
        # the node for prefix s, or None
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def delete(self, word):
        path = []           # (parent, letter) pairs
        node = self.root
        for ch in word:
            nxt = node.children.get(ch)
            if nxt is None:
                return False    # not stored
            path.append((node, ch))
            node = nxt
        if not node.end:
            return False
        node.end = False
        # remove nodes with no tag and no children
        while path and not node.end and not node.children:
            parent, ch = path.pop()
            del parent.children[ch]
            node = parent
        return True`}
      />
      <p>
        Every operation costs <M>O(L)</M> for a word of length <M>L</M>: delete walks down once and back up at most once. <code>dict.get(ch)</code>{" "}
        returns <code>None</code> when the key is missing, instead of raising an error.
      </p>

      <h2 id="counts">Counting words that pass through</h2>
      <p>
        A useful extra field is a count on every node: how many stored words have this node on their path. Insert adds 1 to every node it
        passes; delete takes 1 away. The count of a node is then the number of stored words that start with its prefix, so &ldquo;how many words
        start with <code>te</code>?&rdquo; costs <M>O(L)</M> instead of a walk over the whole branch.
      </p>
      <p>
        Counts also make delete simpler: when a child&rsquo;s count drops to 0, no word passes through it, so remove it and stop. And if the same
        word can be stored more than once, keep a number of copies at the end node instead of a <code>True</code> or <code>False</code> tag.
      </p>
      <CodeBlock
        code={`def insert(self, word):
    node = self.root
    node.count += 1
    for ch in word:
        node = node.children.setdefault(ch, TrieNode())
        node.count += 1
    node.copies += 1`}
      />
      <p>
        <code>setdefault(ch, TrieNode())</code> returns the child for <code>ch</code>, first storing the new node if there was none. It builds a
        new <code>TrieNode</code> every time, even when it is not needed; the <code>if ch not in</code> version avoids that and is a little
        faster. Practice TRIE-P2 asks for counts and copies.
      </p>
      <Note title="Keys that are not letters">
        <p>
          Nothing here needs letters. A trie works for any sequence whose items can be dict keys: the words of a sentence, the parts of a file
          path (<code>&quot;usr&quot;</code>, <code>&quot;lib&quot;</code>, <code>&quot;python3&quot;</code>), or the bits of a number (lesson 5).
        </p>
      </Note>
    </>
  );
}
