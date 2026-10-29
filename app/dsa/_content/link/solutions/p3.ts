// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def reverse_between(head, left, right):
    dummy = Node(None, head)
    before = dummy
    for _ in range(left - 1):     # the node just before the part
        before = before.next
    first = before.next           # will be the part's last node
    prev, cur = None, first
    for _ in range(right - left + 1):
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    before.next = prev            # prev: the part's new first node
    first.next = cur              # cur: the node just after the part
    return dummy.next
`;

export const notes = [
  "The dummy node makes sure a node before the part always exists, even when `left` is 1. Then the head is not a special case, and the answer is `dummy.next`.",
  "The middle is the reversing loop from lesson 4, run exactly `right - left + 1` times. After it, `prev` is the part's new first node and `cur` is the first node after the part (or None).",
  "Two links join the part back in: `before.next = prev` at the front, and `first.next = cur` at the back. `first` was the part's first node and is now its last.",
  "One walk of at most n steps: O(n) time, O(1) extra space.",
];
