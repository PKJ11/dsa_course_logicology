// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def n_queens(n):
    cols, d1, d2 = set(), set(), set()
    count = 0
    def go(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue                       # prune
            cols.add(c); d1.add(r - c); d2.add(r + c)
            go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
    go(0)
    return count
`;

export const notes = [
  "One queen per row is forced, because two queens in a row would clash. So the search decides one column per row, top to bottom.",
  "Squares on one down-right diagonal share the same r − c; squares on one down-left diagonal share r + c. Three sets make each clash check O(1).",
  "Pruning at the first clash means a branch is dropped as soon as it fails, not after the whole board is filled. For n = 10 the search makes about 35,000 calls instead of trying 10¹⁰ boards (ten billion).",
  "`nonlocal count` lets the inner function change the outer name. Returning a count from `go` and adding the results also works.",
];
