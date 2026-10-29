// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def balanced(s):
    pair = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in pair:
            if not stack or stack.pop() != pair[c]:
                return False          # nothing open, or the wrong kind
    return not stack                  # anything left was never closed
`;

export const notes = [
  "A closing bracket must match the most recent bracket that is still open, and that is always the top of the stack.",
  "Three ways to fail: a closing bracket with nothing open, a closing bracket of the wrong kind, or open brackets left at the end.",
  "`not stack or stack.pop() != pair[c]` checks for empty first, so `pop()` is never called on an empty list.",
  "Each character is pushed and popped at most once: O(n) time. The stack can hold up to n items. No recursion, so 100,000 levels of nesting are fine.",
];
