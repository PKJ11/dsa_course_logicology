import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { LruFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        A cache keeps a few answers close by, so they do not have to be fetched or worked out again. When it is full, it must choose what to throw
        out. The usual choice is the item used longest ago. Building this with every step in <M>O(1)</M> needs two structures working together: a
        dict and a two-way linked list.
      </p>

      <h2 id="cache">What a cache is</h2>
      <p>
        Reading from a disk or a far-away server is slow. Recomputing a hard result is slow too. A <em>cache</em> keeps recent results in fast
        memory. Your web browser keeps recent pages, a database keeps recent disk blocks, and a processor keeps recent memory.
      </p>
      <p>
        Memory is limited, so a cache holds at most some number of items, its <em>capacity</em>. When a new item arrives and the cache is full, one
        item must be thrown out. This is called <em>eviction</em>. A good rule throws out an item that is unlikely to be needed soon. The most
        common rule is <em>least recently used</em>, LRU: throw out the item whose last use is furthest in the past. It works because programs tend
        to reuse what they used recently.
      </p>
      <p>The cache needs two jobs:</p>
      <ul>
        <li>
          <code>get(key)</code>: return the value, or say it is missing. A successful get counts as a use.
        </li>
        <li>
          <code>put(key, value)</code>: store the value; this is also a use. If the key is new and the cache is full, evict the least recently used
          key first.
        </li>
      </ul>

      <h2 id="design">A dict and a two-way list</h2>
      <p>Each job needs two things to be fast:</p>
      <ol>
        <li>Find a key. A dict does this in <M>O(1)</M> on average.</li>
        <li>
          Keep the keys in order of last use, and move any key to the &ldquo;most recent&rdquo; end in <M>O(1)</M>. A Python list cannot do this:
          taking an item out of the middle moves every item after it, <M>O(n)</M>.
        </li>
      </ol>
      <p>
        A two-way linked list (LINK-3) can remove a node from the middle in <M>O(1)</M>, if you already hold that node. And the dict can hand you
        the node. So the dict maps each key to its node, and the nodes form a two-way list in order of use. Two sentinel nodes,{" "}
        <code>front</code> and <code>back</code>, sit at the ends (LINK-3), so every real node always has neighbours on both sides.
      </p>
      <Invariant label="Invariant">The node just after front is the most recently used; the node just before back is the least recently used; the dict holds exactly the nodes in the list.</Invariant>

      <h2 id="ops">get and put</h2>
      <p>Step through a cache with room for 3 items:</p>

      <LruFigure />

      <p>Every job is made of three small moves:</p>
      <CodeBlock
        code={`def _unlink(self, node):            # take a node out: O(1)
    node.prev.next = node.next
    node.next.prev = node.prev

def _push_front(self, node):        # put a node just after front: O(1)
    node.prev = self.front
    node.next = self.front.next
    self.front.next.prev = node
    self.front.next = node

def get(self, key):
    node = self.map.get(key)
    if node is None:
        return -1
    self._unlink(node)              # a use: move it to the front
    self._push_front(node)
    return node.value`}
      />
      <p>
        <code>put</code> on an existing key changes the value and moves the node to the front. On a new key with a full cache, it takes the node{" "}
        <code>back.prev</code>, unlinks it and deletes its key from the dict. For that last step, each node stores its own key as well as its value.
        Then it makes the new node, puts it in the dict, and pushes it to the front.
      </p>
      <p>
        Each job is one dict lookup plus a fixed number of reference changes, so <code>get</code> and <code>put</code> both take <M>O(1)</M> on
        average. The space is <M>O(capacity)</M>: one dict entry and one node per item.
      </p>
      <Note title="Why not a list of keys?">
        <p>
          Keeping the keys in a Python list in order of use looks simpler. But every use calls <code>list.remove(key)</code>, which searches the list
          and shifts the rest: <M>O(capacity)</M>. With a capacity of 50,000 and 200,000 calls, that is billions of steps. Practice HASH-P5 has a test
          for exactly this.
        </p>
      </Note>

      <h2 id="python">Python&rsquo;s own tools</h2>
      <p>
        <code>functools.lru_cache</code> wraps a function and caches its results by its arguments, with LRU eviction. Inside, it uses exactly this
        design: a dict plus a two-way circular list.
      </p>
      <CodeBlock
        code={`from functools import lru_cache

@lru_cache(maxsize=1000)
def fare(src, dst):
    ...                         # slow work, done once per (src, dst)

fare.cache_info()               # hits, misses, maxsize, currsize`}
      />
      <p>
        The arguments become the dict key, so they must be hashable. <code>maxsize=None</code> keeps everything and never evicts; the shorter{" "}
        <code>functools.cache</code> means the same thing. The DYNP station uses it to remember answers (memoisation).
      </p>
      <p>
        <code>collections.OrderedDict</code> is a dict that keeps its own order and can change it: <code>move_to_end(key)</code> makes a key the
        newest in <M>O(1)</M>, and <code>popitem(last=False)</code> removes the oldest. An LRU cache takes about ten lines with it. It too is a dict
        plus a two-way list inside.
      </p>
    </>
  );
}
