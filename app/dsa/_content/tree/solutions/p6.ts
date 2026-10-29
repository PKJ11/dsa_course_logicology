// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def serialize(root):
    out = []

    def write(node):
        if node is None:
            out.append('#')               # a marker for a missing child
            return
        out.append(str(node.value))
        write(node.left)
        write(node.right)

    write(root)
    return ' '.join(out)


def deserialize(data):
    tokens = iter(data.split())

    def read():
        t = next(tokens)
        if t == '#':
            return None
        node = TreeNode(int(t))
        node.left = read()                # same order as write
        node.right = read()
        return node

    return read()
`;

export const notes = [
  "Pre-order with a marker for every missing child records the shape completely: when the reader meets a marker, it knows that subtree is finished.",
  "The reader consumes tokens in exactly the order the writer produced them: node, then its whole left subtree, then its whole right subtree.",
  "Tokens are separated by spaces, so values with several digits or a minus sign survive. `int(t)` turns each one back into a number.",
  "The parts are collected in a list and joined once, and tokens are read with an iterator: both sides are O(n). A tree with n nodes writes n values and n + 1 markers.",
];
