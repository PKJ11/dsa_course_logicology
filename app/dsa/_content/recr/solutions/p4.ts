// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def orders(items):
    out = []
    chosen = []
    used = [False] * len(items)
    def go():
        if len(chosen) == len(items):
            out.append(chosen[:])
            return
        for i in range(len(items)):
            if not used[i]:
                used[i] = True
                chosen.append(items[i])
                go()
                chosen.pop()          # undo in reverse order
                used[i] = False
    go()
    return out
`;

export const notes = [
  "Each level fills one place. The loop tries every item that is not used yet, so the first place has n choices, the next n − 1, and so on: n! = n × (n − 1) × … × 1 orders, each found once.",
  "`used` makes the check O(1). Checking `items[i] in chosen` also works for distinct items, but it is O(n) per check.",
  "Undo in the reverse order of doing: pop from `chosen`, then clear `used[i]`. After the loop, the state is exactly as it was when `go()` was called.",
  "Listing all orders takes O(n × n!) time. For 8 items that is 40,320 orders.",
  "For orders with repeated items, sort them first and skip an item when it equals the previous one and that one is not used. Otherwise the same order is listed many times.",
];
