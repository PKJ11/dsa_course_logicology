from solgen import write_station

write_station("recr", 6, {
    1: ('''def power_mod(x, n, m):
    if n == 0:
        return 1 % m                  # 1 % 1 is 0
    half = power_mod(x, n // 2, m)    # one call, not two
    result = half * half % m
    if n % 2 == 1:
        result = result * (x % m) % m
    return result
''', [
        "With half = x to the power n // 2, xⁿ is half × half when n is even, and half × half × x when n is odd. Each call halves n, so there are about log₂ n + 1 calls: about 60 for n = 10¹⁸ (a 1 followed by 18 zeros), and the stack is only that deep.",
        "Taking % m after every multiplication keeps the numbers below m × m, so each multiplication is a small, fast step. The remainder at the end is the same, because (a × b) % m = ((a % m) × (b % m)) % m.",
        "The base case returns `1 % m`, not 1. For m = 1 every answer is 0.",
        "`half` is computed once and squared. Writing `power_mod(x, n // 2, m) * power_mod(x, n // 2, m)` makes two calls at every level, which adds up to about n calls again.",
        "The same idea as a loop reads the bits of n from the lowest: square x each pass, and multiply it into the result when the bit is 1. Python's `pow(x, n, m)` works this way.",
    ]),
    2: ('''def count_ways(n):
    a, b, c = 1, 0, 0      # count_ways(0), count_ways(-1), count_ways(-2)
    for _ in range(n):
        a, b, c = a + b + c, a, b
    return a
''', [
        "The first move is 1, 2 or 3 steps, and what is left is a smaller staircase. So count_ways(n) = count_ways(n − 1) + count_ways(n − 2) + count_ways(n − 3). Each sequence of moves is counted once, by its first move.",
        "count_ways(0) = 1 (the empty sequence) and there are no ways to go up a negative number of steps. Starting with b = c = 0 for the heights −1 and −2 makes the first few passes come out right without special cases.",
        "Plain recursion repeats the same heights, a tree of about 1.84ⁿ calls (n copies of 1.84 multiplied together). A memo makes it O(n) calls, but n = 10,000 frames deep is too deep for Python.",
        "The loop fills the answers from the bottom up and keeps only the last three: O(n) additions and O(1) names. (The numbers themselves grow to thousands of digits, so each addition costs a little more as n grows.)",
    ]),
    3: ('''def subsets(items):
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
''', [
        "Every subset is one path through n yes-or-no choices. The recursion visits every path once, so it records every subset exactly once.",
        "Choose, explore, undo: each `append` is matched by a `pop` after the call, so when `go(i)` returns, `chosen` is as it was. That is what lets one shared list serve every branch.",
        "Items are always taken in index order, so each subset keeps the input order.",
        "There are 2ⁿ subsets (n twos multiplied together) and each copy is up to n long: O(n × 2ⁿ) time and space for the answer. The recursion itself is only n + 1 deep.",
        "A loop version: start with [[]], and for each item, add a copy of every subset so far with that item appended.",
    ]),
    4: ('''def orders(items):
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
''', [
        "Each level fills one place. The loop tries every item that is not used yet, so the first place has n choices, the next n − 1, and so on: n! = n × (n − 1) × … × 1 orders, each found once.",
        "`used` makes the check O(1). Checking `items[i] in chosen` also works for distinct items, but it is O(n) per check.",
        "Undo in the reverse order of doing: pop from `chosen`, then clear `used[i]`. After the loop, the state is exactly as it was when `go()` was called.",
        "Listing all orders takes O(n × n!) time. For 8 items that is 40,320 orders.",
        "For orders with repeated items, sort them first and skip an item when it equals the previous one and that one is not used. Otherwise the same order is listed many times.",
    ]),
    5: ('''def n_queens(n):
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
''', [
        "One queen per row is forced, because two queens in a row would clash. So the search decides one column per row, top to bottom.",
        "Squares on one down-right diagonal share the same r − c; squares on one down-left diagonal share r + c. Three sets make each clash check O(1).",
        "Pruning at the first clash means a branch is dropped as soon as it fails, not after the whole board is filled. For n = 10 the search makes about 35,000 calls instead of trying 10¹⁰ boards (ten billion).",
        "`nonlocal count` lets the inner function change the outer name. Returning a count from `go` and adding the results also works.",
    ]),
    6: ('''def depth_sum(nested):
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
''', [
        "The list `stack` does the job of Python's call stack, so 2,000 levels of nesting are no problem. It can hold as many items as memory allows.",
        "Each item goes on the stack together with its depth, as a pair. That pair is what a recursive version would keep in its parameter `d`.",
        "The outer list is pushed with depth 0, so the numbers directly inside it get depth 1. The order of popping does not matter here, because addition gives the same total in any order.",
        "`for item in v` reads the input list without changing it, and `pop()` takes from `stack`, not from the input. So `nested` is left as it was.",
        "Each number and each list is pushed once and popped once, so the time grows in step with the number of items. `pop()` from the end takes one step; `pop(0)` would move every item each time.",
    ]),
})
