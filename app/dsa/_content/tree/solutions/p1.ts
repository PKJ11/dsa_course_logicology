// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


from collections import deque


def level_order(root):
    if root is None:
        return []
    out = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # exactly the nodes of this level
            node = q.popleft()
            level.append(node.value)
            if node.left is not None:
                q.append(node.left)
            if node.right is not None:
                q.append(node.right)
        out.append(level)
    return out
`;

export const notes = [
  "A queue hands nodes back in the order they went in. Children go in after their parent, so the tree comes out one level at a time, each level from left to right.",
  "`len(q)` is read once, when the `for` loop starts. At that moment the queue holds exactly one level, so the loop takes that level and no more. Children added during the loop wait for the next round.",
  "Each node goes into the queue once and comes out once: O(n) time. The queue holds at most one or two levels, which for a full tree is about n/2 nodes.",
  "There is no recursion, so a path 5,000 levels deep is no problem. `deque.popleft()` is O(1); `list.pop(0)` would be O(n).",
];
