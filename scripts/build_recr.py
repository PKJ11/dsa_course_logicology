from tb import build

S = "recr"

# P1 power_mod (pow blocked)
build(S, 1, "power_mod", [
    {"name": "Small", "args": "(3, 4, 5)", "show": "power_mod(3, 4, 5)", "why": "3⁴ = 3 × 3 × 3 × 3 = 81, and 81 % 5 = 1. If this fails, check the base case and the odd case."},
    {"name": "Odd power", "args": "(2, 13, 1000)", "show": "power_mod(2, 13, 1000)",
     "why": "2¹³ (13 twos multiplied together) = 8192, so the answer is 192. An odd n needs one extra factor of x: half × half × x, where half is x to the power n // 2. If you got 96 or 384, that extra x is missing or doubled."},
    {"name": "Power 0", "args": "(7, 0, 13)", "show": "power_mod(7, 0, 13)", "why": "Anything to the power 0 is 1, and 1 % 13 = 1."},
    {"name": "Modulus 1", "args": "(7, 0, 1)", "show": "power_mod(7, 0, 1)",
     "why": "Every number % 1 is 0, even 7⁰ = 1 (any number to the power 0 is 1). If you got 1, the base case returns 1 without taking % m. Return 1 % m."},
    {"name": "x bigger than m", "args": "(123_456_789, 5, 1_000)", "show": "power_mod(123456789, 5, 1000)",
     "why": "Take x % m first, so the numbers you multiply stay below m. The answer is 789⁵ % 1000 = 949, where 789⁵ is five copies of 789 multiplied together."},
    {"name": "x is 0", "args": "(0, 10, 7)", "show": "power_mod(0, 10, 7)", "why": "0 to any power above 0 is 0. If you got 1, the code returns 1 too early, for example when x is 0 or when the half is 0. Only n == 0 should give 1 % m."},
    {"name": "n = 10⁹", "args": "(2, 10 ** 9, 1_000_000_007)", "timeout": 2000, "show": "power_mod(2, 10**9, 1000000007)",
     "why": "Multiplying n times is a billion steps. Halve n at each call instead: about 30 calls. If this timed out, the code may call itself twice, power(x, n // 2) * power(x, n // 2), which brings back n calls. Store the half in a name."},
    {"name": "n = 10¹⁸", "args": "(987_654_321, 10 ** 18, 999_999_937)", "timeout": 2000, "show": "power_mod(987654321, 10**18, 999999937)",
     "why": "About 60 halvings. Take % m after every multiplication, or the numbers grow to millions of digits. x ** n % m would compute the huge power first."},
], trusted="""
def power_mod(x, n, m):
    r = 1 % m
    x %= m
    while n:
        if n & 1:
            r = r * x % m
        x = x * x % m
        n >>= 1
    return r
""")

# P2 count_ways: steps of 1, 2 or 3
build(S, 2, "count_ways", [
    {"name": "Small heights", "args": "()", "expr": "[count_ways(k) for k in range(1, 6)]", "expect": "[1, 2, 4, 7, 13]", "show": "count_ways(1) … count_ways(5)",
     "why": "count_ways(4) = count_ways(3) + count_ways(2) + count_ways(1) = 4 + 2 + 1 = 7: the first move is 1, 2 or 3 steps, and the rest is a smaller staircase. Check the base cases if the first few are wrong."},
    {"name": "Height 0", "args": "(0,)", "show": "count_ways(0)",
     "why": "There is exactly one way to go up 0 steps: make no moves. count_ways(0) = 1 is also what makes count_ways(3) = 4 come out right (the move '3' then leaves 0)."},
    {"name": "Height 10", "args": "(10,)", "show": "count_ways(10)", "why": "274. If you got 89, the code only allows steps of 1 and 2."},
    {"name": "Height 35", "args": "(35,)", "timeout": 3000, "show": "count_ways(35)",
     "why": "Plain recursion makes about 1.84³⁵ calls (35 copies of 1.84 multiplied together), over a billion: the same heights are worked out again and again. Remember each answer (a memo), or fill a table from the bottom up."},
    {"name": "Height 10,000", "args": "(10_000,)", "expr": "(lambda r: [len(str(r)), r % 1_000_000_007])(count_ways(args[0]))", "timeout": 4000, "show": "count_ways(10000): checks the number of digits and the remainder by 1,000,000,007",
     "why": "A memoised recursion would be 10,000 calls deep, far past Python's limit of about 1,000, and fails with RecursionError. Work bottom-up with a loop, keeping just the last three answers."},
], trusted="""
def count_ways(n):
    a, b, c = 1, 0, 0      # count_ways(0), count_ways(-1), count_ways(-2)
    for _ in range(n):
        a, b, c = a + b + c, a, b
    return a
""")

# P3 subsets
SUBS = "sorted(subsets(args[0]))"
build(S, 3, "subsets", [
    {"name": "Three coaches", "args": "(['A', 'B', 'C'],)", "expr": SUBS, "show": "items = ['A', 'B', 'C']; your answer, sorted",
     "why": "8 groups, from [] to ['A', 'B', 'C']. If some appear twice, or some are the same list, you stored chosen itself instead of a copy chosen[:]."},
    {"name": "None", "args": "([],)", "expr": SUBS, "show": "items = []", "why": "The empty list has one subset: the empty one. Return [[]], not []."},
    {"name": "One", "args": "(['X'],)", "expr": SUBS, "show": "items = ['X']", "why": "[] and ['X']: two subsets. If one is missing, the code records a subset only on one branch: both the take and the skip branch must reach the base case."},
    {"name": "Items keep their order", "args": "(['C', 'A', 'B'],)", "expr": SUBS, "show": "items = ['C', 'A', 'B']; your answer, sorted",
     "why": "Inside each group, keep the items in the order they appear in the input: ['C', 'B'], not ['B', 'C']. The groups themselves may come in any order."},
    {"name": "Count", "args": "(list('ABCDEFGH'),)", "expr": "len(subsets(args[0]))", "show": "len(subsets(8 items))",
     "why": "8 items give 2⁸ = 256 groups (8 twos multiplied together). If you got fewer, a choice is not undone: each append to chosen needs a pop after the call returns."},
    {"name": "Input not changed", "args": "(['A', 'B'],)", "expr": "(lambda a: [len(subsets(a)), a])(args[0])", "show": "a = ['A', 'B']; returns [len(subsets(a)), a]",
     "why": "Leave the input list alone. Build the groups in a separate list."},
    {"name": "16 coaches", "args": "(list('ABCDEFGHIJKLMNOP'),)", "expr": "(lambda r: [len(r), len(set(map(tuple, r))), sum(map(len, r))])(subsets(args[0]))", "timeout": 5000,
     "show": "16 items: [number of groups, number of different groups, total length]",
     "why": "2¹⁶ (16 twos multiplied together) = 65,536 groups, all different, with 524,288 items in total: each item is in half of the groups. If this is slow, check that each group is copied once, when it is recorded, not at every step."},
], trusted="""
def subsets(items):
    out = []
    chosen = []
    def go(i):
        if i == len(items):
            out.append(chosen[:])
            return
        chosen.append(items[i])
        go(i + 1)
        chosen.pop()
        go(i + 1)
    go(0)
    return out
""")

# P4 orders (itertools.permutations blocked)
ORDS = "sorted(orders(args[0]))"
build(S, 4, "orders", [
    {"name": "Three trains", "args": "([1, 2, 3],)", "expr": ORDS, "show": "items = [1, 2, 3]; your answer, sorted",
     "why": "3! = 6 orders. If you see [1, 1, 1] or similar, the code does not track which items are used. If lists are repeated or empty, store a copy of chosen."},
    {"name": "None", "args": "([],)", "expr": ORDS, "show": "items = []", "why": "There is one way to order nothing: [[]]. If you got [], the base case is never reached for an empty list: check len(chosen) == len(items) before the loop."},
    {"name": "One", "args": "(['x'],)", "expr": ORDS, "show": "items = ['x']", "why": "One item has one order: [['x']]. If you got [] or [[]], the base case records too early or never; if you got [['x'], ['x']], an item is used twice."},
    {"name": "Count for 6", "args": "(list(range(6)),)", "expr": "len(orders(args[0]))", "show": "len(orders(6 items))",
     "why": "6! = 720. If you got 46,656 (6⁶, six copies of 6 multiplied together), the code allows an item to be used twice."},
    {"name": "Input not changed", "args": "([3, 1, 2],)", "expr": "(lambda a: [len(orders(a)), a])(args[0])", "show": "a = [3, 1, 2]; returns [len(orders(a)), a]",
     "why": "If you swap items inside the input to build orders, swap them back. Or work with a separate list."},
    {"name": "8 trains", "args": "(list(range(8)),)", "expr": "(lambda r: [len(r), len(set(map(tuple, r))), all(sorted(p) == list(range(8)) for p in r[:100])])(orders(args[0]))", "timeout": 6000,
     "show": "8 items: [number of orders, number of different orders, first 100 are real orders]",
     "why": "8! = 40,320 orders, all different. Checking 'if x not in chosen' on a list is fine for 8 items, but a used list of True/False is O(1)."},
], trusted="""
def orders(items):
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
                chosen.pop()
                used[i] = False
    go()
    return out
""")

# P5 n_queens
build(S, 5, "n_queens", [
    {"name": "4 by 4", "args": "(4,)", "show": "n_queens(4)", "why": "Two solutions, mirror images of each other. If you got 0, check the diagonal test: r - c and r + c."},
    {"name": "1 by 1", "args": "(1,)", "show": "n_queens(1)", "why": "One queen on one square: 1 solution."},
    {"name": "2 and 3", "args": "()", "expr": "[n_queens(2), n_queens(3)]", "expect": "[0, 0]", "show": "n_queens(2) and n_queens(3)",
     "why": "No solutions. If you got more than 0, a clash is missed: queens in neighbouring rows can be on the same diagonal."},
    {"name": "6 by 6", "args": "(6,)", "show": "n_queens(6)", "why": "4 solutions. If you got more, a set entry was not removed when backtracking."},
    {"name": "8 by 8", "args": "(8,)", "timeout": 4000, "show": "n_queens(8)",
     "why": "92. Trying all 8⁸ = 16.7 million boards (8 copies of 8 multiplied together) and checking each one is too slow. Place one queen per row, and skip a column as soon as it clashes."},
    {"name": "10 by 10", "args": "(10,)", "timeout": 6000, "show": "n_queens(10)",
     "why": "724. About 35,000 calls with pruning. If this timed out, the clash check may loop over all placed queens; three sets make it O(1)."},
], trusted="""
def n_queens(n):
    cols, d1, d2 = set(), set(), set()
    count = 0
    def go(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
    go(0)
    return count
""")

# P6 depth sum (re-posed 2026-10-26: flatten itself is the RECR-6.1 trace)
DEEP = "(__import__('functools').reduce(lambda acc, k: [k, acc], range(2_000), []),)"
build(S, 6, "depth_sum", [
    {"name": "Nested parcels", "args": "([1, [2, [3, 4]], 5],)", "show": "nested = [1, [2, [3, 4]], 5]",
     "why": "1 and 5 are at depth 1, 2 is at depth 2, and 3 and 4 are at depth 3: 1 + 5 + 2 × 2 + 3 × 3 + 4 × 3 = 31. If you got 15, every number was counted at depth 1: keep each item's depth with it on your stack. If you got more than 31, the depth starts too high or goes up twice for one level."},
    {"name": "Empty", "args": "([],)", "show": "nested = []",
     "why": "No numbers: 0. If this failed with an error, the code reads nested[0] or pops from an empty stack. If it returned None, return the total after the loop."},
    {"name": "Empty inner lists", "args": "([[], [[]], [1, []]],)", "show": "nested = [[], [[]], [1, []]]",
     "why": "Only 1 is a number. It is inside one inner list, so its depth is 2: 1 × 2 = 2. Empty lists add nothing. If you got 1, the items of a list do not get a depth one more than the list's own."},
    {"name": "Already flat", "args": "([4, 5, 6],)", "show": "nested = [4, 5, 6]",
     "why": "Every number is at depth 1: 4 + 5 + 6 = 15. If you got 30 or 0, the depth of the numbers directly in nested is not 1."},
    {"name": "Input not changed", "args": "([1, [2, 3]],)", "expr": "(lambda a: [depth_sum(a), a])(args[0])", "show": "a = [1, [2, 3]]; returns [depth_sum(a), a]",
     "why": "1 + 2 × 2 + 3 × 2 = 11, and the input must be left alone. If the second list changed, the code popped from the input lists. Push items onto your own stack instead."},
    {"name": "2,000 levels deep", "args": DEEP, "timeout": 4000,
     "show": "nested = [1999, [1998, [1997, … [0, []] …]]]: 1999 at depth 1, 0 at depth 2,000",
     "why": "A recursive version needs one frame per level: 2,000 frames, far past Python's limit of about 1,000, so it fails with RecursionError. Keep your own stack of (item, depth) pairs in a list (lesson 6)."},
    {"name": "100,000 numbers", "args": "([[i, [i + 1, i + 2]] for i in range(0, 99_999, 3)],)", "timeout": 4000,
     "show": "33,333 small parcels, 99,999 numbers in all",
     "why": "Each item should be pushed and popped once. If this timed out, the code may use stack.pop(0) or insert(0, …), which take time in proportion to the stack's length on every call."},
], trusted="""
def depth_sum(nested):
    total = 0
    stack = [(nested, 0)]
    while stack:
        v, d = stack.pop()
        if isinstance(v, list):
            for item in v:
                stack.append((item, d + 1))
        else:
            total += v * d
    return total
""")
