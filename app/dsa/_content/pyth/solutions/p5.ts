// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def make_train(values):
    head = tail = None
    for v in values:
        node = Node(v)
        if head is None:
            head = node            # the first node is the head
        else:
            tail.next = node       # link it after the current last node
        tail = node                # the new node is now the last one
    return head
`;

export const notes = [
  "`tail` always refers to the last node made so far. Linking a new node after it is one step, so building the whole train takes one pass.",
  "Without `tail`, you would walk from the head to the end before each new node. That is 1 + 2 + … + n steps, about n²/2 (n times n, halved): 5 billion for 100,000 values.",
  "Another way: build the train backwards. Go through `values` from the end, and put each new node in front: `node = Node(v); node.next = head; head = node`. That also takes one pass.",
  "For an empty list the loop never runs, so `head` is still `None`, which is the right answer.",
];
