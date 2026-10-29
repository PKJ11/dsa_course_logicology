// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def subsets(items):
    out = []
    chosen = []
    def go(i):
        if i == len(items):
            out.append(chosen[:])     # a copy: chosen keeps changing
            return
        chosen.append(items[i])       # take items[i]
        go(i + 1)
        chosen.pop()                  # undo
        go(i + 1)                     # skip items[i]
    go(0)
    return out
`;

export const notes = [
  "Every subset is one path through n yes-or-no choices. The recursion visits every path once, so it records every subset exactly once.",
  "Choose, explore, undo: each `append` is matched by a `pop` after the call, so when `go(i)` returns, `chosen` is as it was. That is what lets one shared list serve every branch.",
  "Items are always taken in index order, so each subset keeps the input order.",
  "There are 2ⁿ subsets (n twos multiplied together) and each copy is up to n long: O(n × 2ⁿ) time and space for the answer. The recursion itself is only n + 1 deep.",
  "A loop version: start with [[]], and for each item, add a copy of every subset so far with that item appended.",
];
