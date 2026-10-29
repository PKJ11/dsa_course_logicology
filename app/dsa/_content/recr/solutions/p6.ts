// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def depth_sum(nested):
    total = 0
    stack = [(nested, 0)]            # the outer list itself is at depth 0
    while stack:
        v, d = stack.pop()
        if isinstance(v, list):
            for item in v:
                stack.append((item, d + 1))   # its items are one level deeper
        else:
            total += v * d
    return total
`;

export const notes = [
  "The list `stack` does the job of Python's call stack, so 2,000 levels of nesting are no problem. It can hold as many items as memory allows.",
  "Each item goes on the stack together with its depth, as a pair. That pair is what a recursive version would keep in its parameter `d`.",
  "The outer list is pushed with depth 0, so the numbers directly inside it get depth 1. The order of popping does not matter here, because addition gives the same total in any order.",
  "`for item in v` reads the input list without changing it, and `pop()` takes from `stack`, not from the input. So `nested` is left as it was.",
  "Each number and each list is pushed once and popped once, so the time grows in step with the number of items. `pop()` from the end takes one step; `pop(0)` would move every item each time.",
];
