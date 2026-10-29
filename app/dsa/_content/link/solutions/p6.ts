// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def merge(a, b):
    dummy = tail = Node(None)
    while a is not None and b is not None:
        if a.value <= b.value:        # <= keeps equal values in order
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next


def sort_list(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next      # slow stops on the first middle node
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None                  # cut the list in two
    return merge(sort_list(head), sort_list(second))
`;

export const notes = [
  "Merge sort: split at the middle, sort both halves, merge. A list of zero or one nodes is already sorted.",
  "`fast` starts at `head.next`, so with two nodes `slow` stays on the first and the list splits into one and one. Starting both at `head` would leave a two-node list unsplit for ever.",
  "The merge relinks nodes with a dummy node and a `tail`. When one list runs out, the rest of the other is attached in one step.",
  "There are about log₂ n levels of halving, and each level does O(n) work, so the time is O(n log n). The recursion is only about log₂ n calls deep, and no extra arrays are needed.",
];
