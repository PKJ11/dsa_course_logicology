// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def reverse_groups(head, k):
    dummy = Node(None, head)
    before = dummy                    # the node just before the next group
    while True:
        end = before
        for _ in range(k):            # look k nodes ahead
            end = end.next
            if end is None:
                return dummy.next     # a short last group stays as it is
        first, after = before.next, end.next
        prev, cur = after, first      # first will point to after
        while cur is not after:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        before.next = prev            # prev: the group's new first node
        before = first                # first is now the group's last node
`;

export const notes = [
  "The dummy node gives the first group a node before it, so the head is not a special case. The answer is `dummy.next`.",
  "Before reversing a group, count k nodes ahead. If the list ends first, the rest is a short group, and it stays as it is.",
  "`prev` starts at `after`, the node just after the group. So when the loop turns the group's first node round, it already points to `after`. No extra step joins the group to the rest.",
  "`before.next = prev` joins the group to the part before it. Then `before` moves to `first`, which is now the group's last node.",
  "Each node is passed once while counting ahead and once while reversing: O(n) time. Only a few names are used: O(1) extra space.",
];
