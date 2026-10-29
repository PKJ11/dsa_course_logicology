import { CodeBlock } from "../../_components/Code";
import { M, Note } from "../../_components/Prose";
import { AutoFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        A search box that suggests words as you type is the job tries are best known for. All the words that start with what you typed sit in
        one branch of the trie, below one node. Find that node, then visit the branch.
      </p>

      <h2 id="walk">Walk, then collect</h2>
      <p>Autocomplete has two parts:</p>
      <ol>
        <li>Walk the prefix, exactly as in a prefix search. If a letter is missing, there are no suggestions.</li>
        <li>
          Visit every node below the prefix node, and collect the word of every tagged node. Visiting each node of a tree once is called a{" "}
          <strong>traversal</strong>; going as deep as possible before going back up is a <strong>depth-first</strong> traversal (TREE).
        </li>
      </ol>
      <AutoFigure />
      <p>
        The walk never looks at the <code>to</code> branch: it cannot hold a word that starts with <code>te</code>. The work is the length of the
        prefix plus the size of the branch below it.
      </p>
      <p>
        The nodes do not store their words, so the traversal builds each word as it goes: the word of a child is the parent&rsquo;s word plus the
        letter on the edge. Here is a version with an explicit stack instead of recursion, so a very long word cannot reach the recursion limit:
      </p>
      <CodeBlock
        code={`def complete(self, prefix, k=None):
    node = self._walk(prefix)
    if node is None:
        return []
    out = []
    stack = [(node, prefix)]
    while stack:
        node, word = stack.pop()
        if node.end:
            out.append(word)
            if len(out) == k:
                break
        # push in reverse order, so 'a' comes off the stack first
        for ch in sorted(node.children, reverse=True):
            stack.append((node.children[ch], word + ch))
    return out`}
      />

      <h2 id="order">Why the order is alphabetical</h2>
      <p>
        Two facts give alphabetical order. First, a node&rsquo;s word comes before every word below it, because a word comes before any longer
        word that starts with it (<code>tea</code> before <code>team</code>). The code collects a node before pushing its children. Second,
        children are visited in alphabetical order of their letters, and every word in the <code>a</code> branch comes before every word in the{" "}
        <code>b</code> branch, because they first differ at that letter.
      </p>
      <p>
        So the depth-first order is the sorted order, and asking for only the first <M>k</M> words lets the walk stop early (the &ldquo;At most
        2&rdquo; variant). Sorting the children costs a little at each node; a node has at most 26 children, so it is a constant. A dict keeps
        keys in the order they were inserted, not in alphabetical order, which is why the code sorts them.
      </p>

      <h2 id="best">The best few, not all</h2>
      <p>
        A real search box shows the few <em>most popular</em> words, not the first few in alphabetical order. Say each word has a count, the
        number of times people searched for it, and the box shows the 3 with the highest counts. Visiting the whole branch is now unavoidable: the
        most popular word could be anywhere in it. After typing one letter, the branch holds about a twenty-sixth of all the words.
      </p>
      <p>
        The fix is to do the work once, when words are inserted. Every node keeps its own short list: the best 3 words in its branch. When a word
        is inserted, it can only enter the lists of the nodes on its own path, so the insert walks its path and offers the word to each list.
      </p>
      <CodeBlock
        code={`def insert(self, word, count):
    node = self.root
    for ch in word:
        node = node.children.setdefault(ch, TrieNode())
        # keep the 3 best (count, word) pairs: highest count,
        # then alphabetical order for equal counts
        node.best.append((-count, word))
        node.best.sort()
        del node.best[3:]
    node.end = True

def suggest(self, prefix):
    node = self._walk(prefix)
    return [] if node is None else [w for _, w in node.best]`}
      />
      <p>
        Storing <code>-count</code> makes the plain sort put the highest count first, and for equal counts the words come out in alphabetical
        order. Sorting a list of at most 4 pairs is a constant amount of work.
      </p>
      <p>
        Now a suggestion costs <M>O(L)</M>: walk the prefix and read the list. An insert costs <M>O(L · k)</M> for lists of length <M>k</M>, and
        the memory grows by <M>k</M> entries per node. This is a common trade: more work and memory when storing, so that the frequent question is
        cheap. Practice TRIE-P3 builds this search box.
      </p>

      <h2 id="other">A sorted list does this too</h2>
      <p>
        For plain alphabetical suggestions, a sorted list of words is a strong rival. All words that start with a prefix sit together in the
        sorted list, and binary search finds where they begin: <code>bisect.bisect_left(words, prefix)</code>. Read forward from there while the
        words still start with the prefix:
      </p>
      <CodeBlock
        code={`import bisect

def complete(words, prefix, k):  # words is sorted
    i = bisect.bisect_left(words, prefix)
    out = []
    while i < len(words) and words[i].startswith(prefix) and len(out) < k:
        out.append(words[i])
        i += 1
    return out`}
      />
      <p>
        This costs <M>O(L log n + k)</M>, uses far less memory than a trie of Python objects, and the list is quick to build with one sort. It is
        a good choice when the words rarely change. Tries win when words are added and removed often (inserting into a sorted list shifts{" "}
        <M>O(n)</M> items), when the counts change, and when the trie stores extra facts at each node, such as the best-3 lists.
      </p>
      <Note title="Typing one letter at a time">
        <p>
          In a search box the prefix grows by one letter per key press. Keep the node for the prefix typed so far; the next letter is then one
          step down from it, not a new walk from the root. Backspace goes back to the previous node, so keep the path in a list.
        </p>
      </Note>
    </>
  );
}
