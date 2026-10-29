// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def remove_all(head, x):
    dummy = Node(None, head)      # every real node now has a node before it
    cur = dummy
    while cur.next is not None:
        if cur.next.value == x:
            cur.next = cur.next.next  # skip it; check the new cur.next next time
        else:
            cur = cur.next
    return dummy.next             # the head may have been removed
`;

export const notes = [
  "To remove a node you change the node before it, so the walk looks one node ahead: `cur.next` is the node being checked.",
  "The dummy node in front of the head means the head is checked like every other node. Without it you need a separate loop for the head.",
  "After a removal `cur` stays put, because its new `next` has not been checked. Moving on would skip a second `x` in a row.",
  "Return `dummy.next`, not `head`: if the old head held `x`, `dummy.next` is the new head (or None).",
  "One walk: O(n) time and O(1) extra space. Removed nodes are freed by Python once nothing refers to them.",
];
