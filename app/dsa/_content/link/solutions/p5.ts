// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def loop_start(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:              # they met inside the loop
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p                  # first node of the loop
    return None                       # fast reached the end
`;

export const notes = [
  "If there is no loop, `fast` reaches None and the function returns None.",
  "If there is a loop, both names end up in it. Each pass the gap between them shrinks by one, so `fast` cannot jump over `slow`: they meet within one trip round the loop.",
  "Say there are a nodes before the loop and the loop has length L. When they meet, `slow` has taken s steps and `fast` 2s. The extra s steps were whole trips round the loop, so s is a multiple of L.",
  "`p` reaches the loop's first node after a steps. By then `slow` has taken s + a steps in total: a steps to reach the loop plus whole trips round it. So `slow` is also at the loop's first node, and they meet there.",
  "O(n) time and two names, so O(1) extra space. Comparing with `is` works even when values repeat.",
];
