// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from collections import deque


def window_max(a, k):
    dq = deque()                      # places; values go down front to back
    out = []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()                  # can never be the biggest again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()              # the front has left the window
        if i >= k - 1:
            out.append(a[dq[0]])
    return out
`;

export const notes = [
  "A value that is at most a newer value can never again be the biggest in a window: the newer value is at least as big and stays longer. So it is removed from the back.",
  "After that, the values in the deque go down from front to back, so the front is the biggest value still in the window.",
  "The window moves one place per step, so at most one place leaves the front per step. A single `if` is enough there.",
  "Each place enters the deque once and leaves at most once: O(n) time in total, whatever k is. The deque holds at most k places.",
];
