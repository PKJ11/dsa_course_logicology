import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { SerialFigure } from "./figures";

export default function Lesson7() {
  return (
    <>
      <p className="lesson__lede">
        A tree in memory is a web of objects joined by references. To save it to a file or send it to another computer, it must become a flat piece
        of text, and then be rebuilt exactly. Turning a structure into text is called serialisation; turning the text back is called
        deserialisation.
      </p>

      <h2 id="why">Why write a tree as text</h2>
      <p>
        A reference only means something inside the running program. Write a node to a file and its <code>left</code> and <code>right</code> are
        meaningless addresses. So the text must describe the shape in some other way. Many everyday formats are serialised trees: a JSON file, an
        HTML page, the folders in a zip file.
      </p>
      <p>
        Lesson 3 showed that one traversal list does not fix a tree, but two do. Two lists would mean writing every value twice, and the values would
        have to be different. A better idea fixes the tree with one list.
      </p>

      <h2 id="markers">Pre-order with markers</h2>
      <p>
        Write the tree in pre-order, and also write a marker, such as <code>#</code>, wherever a child is missing. The markers say exactly where each
        subtree ends, so the reader never has to guess. Step through the first variant:
      </p>

      <SerialFigure />

      <CodeBlock
        code={`def serialize(root):
    out = []
    def write(node):
        if node is None:
            out.append('#')
            return
        out.append(str(node.value))
        write(node.left)
        write(node.right)
    write(root)
    return ' '.join(out)          # '1 2 # # 3 4 # # 5 # #'`}
      />
      <p>
        A tree with <M>n</M> nodes has exactly <M>n + 1</M> missing children. (Each of the <M>n</M> nodes has 2 child places, <M>2n</M> in all, and{" "}
        <M>n − 1</M> of them are filled by the edges; <M>2n − (n − 1) = n + 1</M>.) So the text has <M>2n + 1</M> tokens. The parts are collected in
        a list and joined once at the end; adding to a string with <code>+=</code> in a loop can copy the string again and again.
      </p>
      <Invariant label="Rule">Pre-order with a marker for every missing child fixes the tree exactly, even when values repeat.</Invariant>

      <h2 id="read">Reading it back</h2>
      <p>
        Read the tokens in the same order they were written, with the same rule. A marker means &ldquo;no node here&rdquo;. A value means
        &ldquo;make a node, then read its left subtree, then its right subtree&rdquo;. Step through the second variant.
      </p>
      <CodeBlock
        code={`def deserialize(data):
    tokens = iter(data.split())
    def read():
        t = next(tokens)
        if t == '#':
            return None
        node = TreeNode(int(t))
        node.left = read()
        node.right = read()
        return node
    return read()`}
      />
      <p>
        <code>iter(...)</code> makes an iterator, and each <code>next(tokens)</code> takes the next token. All the calls share the one iterator, so
        each token is used exactly once, in order. This is the same shared position as <code>nxt</code> in lesson 3.
      </p>
      <p>
        Why is the result right? By induction on the size of the tree: <code>read()</code> consumes exactly the tokens that <code>write</code>{" "}
        produced for one subtree, and returns that subtree. For a marker, that is one token. For a node, it is the value, then (by induction) exactly
        the left subtree&rsquo;s tokens, then exactly the right subtree&rsquo;s. Both functions are <M>O(n)</M>.
      </p>
      <Note title="Splitting into tokens">
        <p>
          Split on spaces, not into single characters. A value like <code>-12</code> is three characters but one token. If values could contain
          spaces (strings, say), you would need quoting or a length before each value. Real formats like JSON handle this for you.
        </p>
      </Note>

      <h2 id="formats">Other formats</h2>
      <ul>
        <li>
          <strong>Level order with markers</strong>, the format the practice problems use: <code>[1, 2, 3, None, None, 4, 5]</code>. It is easy to
          read by eye. Trailing markers can be dropped, because the reader can tell that the list has run out.
        </li>
        <li>
          <strong>Nested brackets</strong>: <code>1(2)(3(4)(5))</code>, or nested lists <code>[1, [2], [3, [4], [5]]]</code>. These read like the
          tree&rsquo;s shape. JSON is this idea with names for the parts.
        </li>
        <li>
          <strong>An array for a complete tree</strong>: if every level is full except the last (filled from the left), no markers are needed at
          all. Store the values level by level; the children of position <M>i</M> are at <M>2i + 1</M> and <M>2i + 2</M>. Heaps are stored exactly
          like this (HEAP station).
        </li>
      </ul>
      <p>
        Python&rsquo;s <code>pickle</code> module can save almost any object, trees included, but it is Python-only and must never be used on data
        from strangers: loading a pickle can run code. <code>json</code> is safe and works across languages, but it handles only dicts, lists,
        strings, numbers and booleans, so a tree must first be turned into nested lists or dicts.
      </p>
      <Note title="Deep trees again">
        <p>
          The recursive versions above go one call deeper per level, so a path-shaped tree thousands of levels deep breaks them, as in lesson 1.
          Both can be rewritten with your own stack. <code>json.loads</code> has a similar limit: very deeply nested JSON raises{" "}
          <code>RecursionError</code>.
        </p>
      </Note>
    </>
  );
}
