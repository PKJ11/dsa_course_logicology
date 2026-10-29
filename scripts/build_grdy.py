import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build

S = "grdy"

# Pseudo-random numbers built inside a test's args (no random module, so CPython and Pyodide agree).
def nums(n, m, mod, add=0, seed=13):
    return f"[(k * {m} + {seed}) % {mod} + {add} for k in range({n})]"

BAG = """
def how_much(capacity, items):
    order = sorted(range(len(items)), key=lambda i: items[i][1] / items[i][0], reverse=True)
    take = [0] * len(items)
    for i in order:
        if capacity <= 0:
            break
        take[i] = min(items[i][0], capacity)
        capacity -= take[i]
    return take
"""

# The plan is checked, not compared with one answer (README rule 11): a list of the right length, each amount
# between 0 and its item's weight, the total weight within the bag, and the value it is worth.
PLAN = ("(lambda cap, items, t: 'the answer must be a list with one amount per item' if not isinstance(t, (list, tuple)) or len(t) != len(items) "
        "else 'every amount must be between 0 and the weight of its item' if any(not (-1e-9 <= x <= w + 1e-9) for x, (w, v) in zip(t, items)) "
        "else 'the amounts weigh more than the bag holds' if sum(t) > cap + 1e-6 "
        "else sum(x * v / w for x, (w, v) in zip(t, items)))(args[0], args[1], how_much(args[0], list(args[1])))")

BIG_ITEMS = f"list(zip({nums(200_000, 7919, 50, 1)}, {nums(200_000, 104729, 1000, 0, 7)}))"


def t1(name, cap, items, why, **kw):
    return {"name": name, "args": f"({cap}, {items})", "expr": PLAN, "show": f"how_much({cap}, {items})", "why": why, **kw}


build(S, 1, "how_much", [
    t1("The example", 8, [(5, 10), (4, 7), (3, 3), (2, 5)],
       "Worth 16.75: all 5 kg of (5, 10), 1 kg of (4, 7) and all 2 kg of (2, 5), so [5, 1, 0, 2]. Each test reports the value of your plan, or what is wrong with it. Taking the most valuable or the lightest item first is worth less."),
    t1("Everything fits", 20, [(5, 10), (4, 7), (3, 3), (2, 5)],
       "Worth 25: the items weigh 14 kg together, so all of every item goes in: [5, 4, 3, 2]. Stop when the items run out, not only when the bag is full."),
    t1("Cut the only item", 3, [(10, 50)], "Worth 15: take 3 of the 10 kg, [3]. An amount can be part of an item."),
    t1("An empty bag", 0, [(1, 9), (2, 4)], "Worth 0: nothing fits in a bag that holds 0 kg, so [0, 0]."),
    t1("No items", 10, [], "Worth 0: the plan is the empty list."),
    t1("Valuable but heavy", 10, [(10, 60), (3, 30), (3, 30), (3, 30)],
       "Worth 96: the three 3 kg items (10 per kg) and 1 kg of the 10 kg item (6 per kg), [1, 3, 3, 3]. The most valuable item first is worth only 60."),
    t1("Light but cheap", 6, [(1, 1), (1, 1), (1, 1), (6, 30)],
       "Worth 30: all 6 kg of the item worth 5 per kg, [0, 0, 0, 6]. The lightest first is worth 3 + 15 = 18."),
    t1("Amounts in the order given", 7, [(1, 1), (4, 20), (2, 2), (3, 15)],
       "Worth 35: [0, 4, 0, 3]. The answer gives each item's amount at that item's own position, not in the sorted order."),
    t1("Items worth nothing", 5, [(2, 0), (4, 8), (1, 0)], "Worth 8. Items worth 0 can go in or stay out; they never change the value."),
    {"name": "200,000 items", "args": f"(2_500_000, {BIG_ITEMS})", "expr": PLAN, "timeout": 3000,
     "show": "a bag of 2,500,000 kg and 200,000 items weighing about 5,000,000 kg in all",
     "why": "About half the items go in. Sort the positions once, O(n log n). Picking the best remaining item with a full scan each time is O(n) per item, about 10 billion steps here."},
], trusted=BAG)

LATE = """
def least_lateness(jobs):
    t = worst = 0
    for length, due in sorted(jobs, key=lambda j: j[1]):
        t += length
        worst = max(worst, t - due)
    return worst
"""

BIG_JOBS = f"list(zip({nums(200_000, 7919, 20, 1)}, {nums(200_000, 104729, 2_100_000, 0, 7)}))"
build(S, 2, "least_lateness", [
    {"name": "The example", "args": "([(3, 6), (2, 2), (1, 9), (4, 8)],)", "show": "least_lateness([(3, 6), (2, 2), (1, 9), (4, 8)])",
     "why": "1: in deadline order (B, A, D, C) the jobs finish at 2, 5, 9 and 10, so D and C are each 1 late. The order given makes B 3 late."},
    {"name": "All on time", "args": "([(2, 10), (3, 5), (1, 2)],)", "show": "least_lateness([(2, 10), (3, 5), (1, 2)])",
     "why": "0: in deadline order they finish at 1, 4 and 6, all on time. A job that finishes early is late by 0, not by a negative amount."},
    {"name": "No jobs", "args": "([],)", "show": "least_lateness([])", "why": "0."},
    {"name": "One late job", "args": "([(5, 3)],)", "show": "least_lateness([(5, 3)])", "why": "2: it finishes at 5, due at 3."},
    {"name": "Shortest first is wrong", "args": "([(1, 100), (10, 10)],)", "show": "least_lateness([(1, 100), (10, 10)])",
     "why": "0: the long job is due first, so it goes first. Shortest first makes it 1 late."},
    {"name": "Least slack first is wrong", "args": "([(1, 2), (10, 10)],)", "show": "least_lateness([(1, 2), (10, 10)])",
     "why": "1: the short job first (due at 2), then the long one finishes at 11. Least slack first (deadline minus length) runs the long job first and makes the short one 9 late."},
    {"name": "Same deadlines", "args": "([(2, 4), (2, 4), (2, 4)],)", "show": "least_lateness([(2, 4), (2, 4), (2, 4)])",
     "why": "2: whatever the order, the last job finishes at 6, due at 4."},
    {"name": "Deadline 0", "args": "([(1, 0), (2, 0), (3, 5)],)", "show": "least_lateness([(1, 0), (2, 0), (3, 5)])",
     "why": "3: the two jobs due at 0 finish at 1 and 3, then the third finishes at 6, 1 late. The largest lateness is 3."},
    {"name": "Nine jobs", "args": "([(4, 20), (1, 3), (6, 25), (2, 4), (3, 12), (5, 30), (2, 9), (7, 18), (1, 1)],)",
     "show": "least_lateness([(4, 20), (1, 3), (6, 25), (2, 4), (3, 12), (5, 30), (2, 9), (7, 18), (1, 1)])",
     "why": "The checked answer comes from trying all 362,880 orders. Sort by deadline and walk once, keeping the finish time."},
    {"name": "200,000 jobs", "args": f"({BIG_JOBS},)", "timeout": 3000,
     "show": "200,000 jobs of length 1 to 20 with deadlines up to 2,100,000",
     "why": "Sort by deadline once: O(n log n). Finding the earliest remaining deadline with a scan each time is O(n²)."},
], trusted=LATE)

BOOK = """
def most_bookings(bookings):
    order = sorted(range(len(bookings)), key=lambda i: bookings[i][1])
    out, free = [], float("-inf")
    for i in order:
        s, e = bookings[i]
        if s >= free:
            out.append(i)
            free = e
    return out
"""

# [how many chosen, are they a valid choice (real indices, no repeats, in time order, no overlaps)]
CHECK = ("(lambda b: (lambda res: [len(res), len(set(res)) == len(res) and all(0 <= i < len(b) for i in res)"
         " and all(b[res[k]][1] <= b[res[k + 1]][0] for k in range(len(res) - 1))])(most_bookings(list(b))))(args[0])")
BIG_BOOK = f"[(s, s + d) for s, d in zip({nums(200_000, 7919, 1_000_000)}, {nums(200_000, 104729, 60, 1, 7)})]"
build(S, 3, "most_bookings", [
    {"name": "The example", "args": "([(0, 7), (1, 3), (3, 5), (5, 8), (7, 9), (8, 11)],)", "expr": CHECK,
     "show": "most_bookings([(0, 7), (1, 3), (3, 5), (5, 8), (7, 9), (8, 11)]): [how many, a valid choice?]",
     "why": "4, for example [1, 2, 3, 5]: B, C, D and F. Starting first takes A and blocks three others; shortest first takes E, which overlaps D and F."},
    {"name": "No bookings", "args": "([],)", "expr": CHECK, "show": "most_bookings([]): [how many, a valid choice?]", "why": "[0, True]: an empty list."},
    {"name": "Touching ends", "args": "([(5, 10), (0, 5), (10, 15)],)", "expr": CHECK, "show": "most_bookings([(5, 10), (0, 5), (10, 15)]): [how many, a valid choice?]",
     "why": "3: a booking that ends at 5 and one that starts at 5 do not overlap (start <=, not <). The answer must list them in time order: [1, 0, 2]."},
    {"name": "One long, many short", "args": "([(0, 100), (10, 20), (20, 30), (30, 40)],)", "expr": CHECK,
     "show": "most_bookings([(0, 100), (10, 20), (20, 30), (30, 40)]): [how many, a valid choice?]", "why": "3: the long one starts first but blocks the other three."},
    {"name": "Short in the middle", "args": "([(0, 6), (5, 8), (7, 13)],)", "expr": CHECK,
     "show": "most_bookings([(0, 6), (5, 8), (7, 13)]): [how many, a valid choice?]", "why": "2: the short (5, 8) overlaps both others, which fit together."},
    {"name": "Copies", "args": "([(1, 4), (1, 4), (1, 4), (4, 6)],)", "expr": CHECK,
     "show": "most_bookings([(1, 4), (1, 4), (1, 4), (4, 6)]): [how many, a valid choice?]", "why": "2: only one of the three identical bookings can be chosen. Return each index at most once."},
    {"name": "Nested", "args": "([(0, 10), (1, 9), (2, 8), (3, 7), (4, 6)],)", "expr": CHECK,
     "show": "most_bookings([(0, 10), (1, 9), (2, 8), (3, 7), (4, 6)]): [how many, a valid choice?]", "why": "1: they all overlap. The innermost ends first."},
    {"name": "Negative times", "args": "([(-5, -2), (-3, 1), (-2, 0), (0, 3)],)", "expr": CHECK,
     "show": "most_bookings([(-5, -2), (-3, 1), (-2, 0), (0, 3)]): [how many, a valid choice?]",
     "why": "3: (-5, -2), (-2, 0), (0, 3). Do not start with 'free = 0'; times can be below 0."},
    {"name": "200,000 bookings", "args": f"({BIG_BOOK},)", "expr": CHECK, "timeout": 3000,
     "show": "200,000 bookings of length 1 to 60 between 0 and 1,000,060: [how many, a valid choice?]",
     "why": "Sort by end once: O(n log n). Looking through every booking for the next one to take costs O(n) per choice."},
], trusted=BOOK)

PLAT = """
import heapq
def platforms(trains):
    busy = []
    for a, d in sorted(trains):
        if busy and busy[0] <= a:
            heapq.heapreplace(busy, d)
        else:
            heapq.heappush(busy, d)
    return len(busy)
"""

BIG_TRAINS = f"[(a, a + d) for a, d in zip({nums(200_000, 7919, 1_000_000)}, {nums(200_000, 104729, 600, 1, 7)})]"
build(S, 4, "platforms", [
    {"name": "The example", "args": "([(0, 4), (1, 3), (2, 6), (3, 5), (5, 8), (6, 9), (7, 10)],)", "show": "platforms([(0, 4), (1, 3), (2, 6), (3, 5), (5, 8), (6, 9), (7, 10)])",
     "why": "3: at time 2, three trains are in the station."},
    {"name": "No trains", "args": "([],)", "show": "platforms([])", "why": "0."},
    {"name": "One train", "args": "([(10, 20)],)", "show": "platforms([(10, 20)])", "why": "1."},
    {"name": "Leaves as the next arrives", "args": "([(5, 10), (0, 5), (10, 12)],)", "show": "platforms([(5, 10), (0, 5), (10, 12)])",
     "why": "1: a platform is free again the moment its train leaves, so a train leaving at 5 and one arriving at 5 can share it. Count departures before arrivals at the same time."},
    {"name": "All at once", "args": "([(0, 5), (0, 5), (0, 5), (0, 5)],)", "show": "platforms([(0, 5), (0, 5), (0, 5), (0, 5)])", "why": "4: all four trains are in the station from 0 to 5, so each needs its own platform."},
    {"name": "Not sorted", "args": "([(9, 12), (1, 3), (2, 10), (4, 6), (11, 13), (5, 7)],)", "show": "platforms([(9, 12), (1, 3), (2, 10), (4, 6), (11, 13), (5, 7)])",
     "why": "3: at time 5 the trains (2, 10), (4, 6) and (5, 7) are all in. The trains come in any order; sort them by arrival first."},
    {"name": "A long stay", "args": "([(0, 100), (1, 2), (2, 3), (3, 4), (50, 60)],)", "show": "platforms([(0, 100), (1, 2), (2, 3), (3, 4), (50, 60)])",
     "why": "2: the long train keeps one platform all day; the others can share the second one."},
    {"name": "200,000 trains", "args": f"({BIG_TRAINS},)", "timeout": 3000,
     "show": "200,000 trains staying 1 to 600 minutes between 0 and 1,000,600",
     "why": "Sort once and use a heap (or a sorted list of events): O(n log n). Counting, for every train, how many others are in at its arrival is O(n²)."},
], trusted=PLAT)

HUFF = """
import heapq
def huffman(counts):
    heap = [(w, k, s) for k, (s, w) in enumerate(counts.items())]
    heapq.heapify(heap)
    if len(heap) == 1:
        return {heap[0][2]: "0"}
    k = len(heap)
    while len(heap) > 1:
        wa, _, a = heapq.heappop(heap)
        wb, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (wa + wb, k, (a, b)))
        k += 1
    codes = {}
    stack = [(heap[0][2], "")]
    while stack:
        t, path = stack.pop()
        if isinstance(t, tuple):
            stack.append((t[0], path + "0"))
            stack.append((t[1], path + "1"))
        else:
            codes[t] = path
    return codes
"""

# [same letters?, every code a non-empty string of 0s and 1s?, prefix-free?, total bits]
HCHECK = ("(lambda c: (lambda r: [sorted(r) == sorted(c), all(isinstance(x, str) and x != '' and set(x) <= {'0', '1'} for x in r.values()),"
          " (lambda s: all(not s[k + 1].startswith(s[k]) for k in range(len(s) - 1)))(sorted(r.values())),"
          " sum(c[k] * len(r[k]) for k in c)])(huffman(dict(c))))(args[0])")
SHOWH = "[same letters?, all codes made of 0 and 1?, no code starts another?, total bits]"
BIG_COUNTS = f"{{f'w{{k}}': x for k, x in enumerate({nums(50_000, 7919, 100_000, 1)})}}"
build(S, 5, "huffman", [
    {"name": "The example", "args": "({'a': 5, 'b': 9, 'c': 12, 'd': 13, 'e': 16, 'f': 45},)", "expr": HCHECK,
     "show": f"huffman({{'a': 5, 'b': 9, 'c': 12, 'd': 13, 'e': 16, 'f': 45}}): {SHOWH}",
     "why": "224 bits, as in the lesson. Any codes with this total are accepted; equal weights can give different trees."},
    {"name": "Two letters", "args": "({'x': 3, 'y': 100},)", "expr": HCHECK, "show": f"huffman({{'x': 3, 'y': 100}}): {SHOWH}",
     "why": "103: one bit each, '0' and '1'."},
    {"name": "One letter", "args": "({'z': 7},)", "expr": HCHECK, "show": f"huffman({{'z': 7}}): {SHOWH}",
     "why": "7: a single letter still needs a code of at least one bit. Give it '0' (an empty code fails)."},
    {"name": "All equal", "args": "({'a': 1, 'b': 1, 'c': 1, 'd': 1, 'e': 1, 'f': 1, 'g': 1, 'h': 1},)", "expr": HCHECK,
     "show": f"huffman(8 letters, each once): {SHOWH}", "why": "24: eight letters with equal counts get 3 bits each."},
    {"name": "Doubling counts", "args": "({'a': 1, 'b': 1, 'c': 2, 'd': 4, 'e': 8, 'f': 16, 'g': 32},)", "expr": HCHECK,
     "show": f"huffman({{'a': 1, 'b': 1, 'c': 2, 'd': 4, 'e': 8, 'f': 16, 'g': 32}}): {SHOWH}",
     "why": "126: each new tree is lighter than the next letter, so the tree is a long path and a gets 6 bits."},
    {"name": "Codes must not start each other", "args": "({'a': 10, 'b': 10, 'c': 1, 'd': 1, 'e': 1},)", "expr": HCHECK,
     "show": f"huffman({{'a': 10, 'b': 10, 'c': 1, 'd': 1, 'e': 1}}): {SHOWH}",
     "why": "If one code is the start of another (say '1' and '10'), the bits cannot be read back. Read the codes off the leaves of one tree."},
    {"name": "Words as letters", "args": "({'the': 50, 'cat': 7, 'sat': 7, 'on': 20, 'mat': 3, 'a': 13},)", "expr": HCHECK,
     "show": f"huffman({{'the': 50, 'cat': 7, 'sat': 7, 'on': 20, 'mat': 3, 'a': 13}}): {SHOWH}",
     "why": "The keys can be any strings. Keep them apart from the trees in the heap: compare by weight, then by a counter."},
    {"name": "50,000 letters", "args": f"({BIG_COUNTS},)", "expr": HCHECK, "timeout": 4000,
     "show": f"50,000 different letters with counts up to 100,000: {SHOWH}",
     "why": "Use a heap: O(k log k). Sorting the list again after every join, or scanning it for the two smallest, costs O(k) or more per join."},
], trusted=HUFF)

COINS = """
def first_failure(coins):
    coins = sorted(coins)
    if len(coins) < 2:
        return None
    big = coins[::-1]
    limit = coins[-1] + coins[-2]
    fewest = [0] * limit
    for x in range(1, limit):
        best = x
        for c in coins:
            if c > x:
                break
            if fewest[x - c] < best:
                best = fewest[x - c]
        fewest[x] = best + 1
        g, y = 0, x
        for c in big:
            g += y // c
            y %= c
        if g > fewest[x]:
            return x
    return None
"""

build(S, 6, "first_failure", [
    {"name": "Coins 1, 3, 4", "args": "([1, 3, 4],)", "show": "first_failure([1, 3, 4])", "why": "6: greedy gives 4 + 1 + 1, but 3 + 3 is two coins. Every smaller amount is fine."},
    {"name": "India's coins and notes", "args": "([1, 2, 5, 10, 20, 50, 100, 200, 500],)", "show": "first_failure([1, 2, 5, 10, 20, 50, 100, 200, 500])", "why": "None: this system is canonical."},
    {"name": "Coins 1, 10, 25", "args": "([1, 10, 25],)", "show": "first_failure([1, 10, 25])",
     "why": "30: greedy gives 25 + five 1s (6 coins), but 10 + 10 + 10 is 3. The first failure is above the largest coin, so checking only up to 25 misses it."},
    {"name": "Only the 1", "args": "([1],)", "show": "first_failure([1])", "why": "None: with one coin there is only one way to pay."},
    {"name": "Two coins", "args": "([1, 7],)", "show": "first_failure([1, 7])", "why": "None: with coins 1 and c, the largest coin first is always best."},
    {"name": "Coins 1, 5, 12", "args": "([1, 5, 12],)", "show": "first_failure([1, 5, 12])", "why": "15: greedy gives 12 + 1 + 1 + 1, but 5 + 5 + 5 is three coins."},
    {"name": "Powers of two", "args": "([1, 2, 4, 8, 16, 32],)", "show": "first_failure([1, 2, 4, 8, 16, 32])", "why": "None: when each coin is double the one before, the largest coin first is always best, so no amount fails."},
    {"name": "Not in order", "args": "([4, 1, 3],)", "show": "first_failure([4, 1, 3])", "why": "6: sort the coins first; the list may come in any order."},
    {"name": "A failure far away", "args": "([1, 10000, 10001],)", "show": "first_failure([1, 10000, 10001])", "timeout": 3000,
     "why": "20000: greedy takes 10001 and then 9,999 coins of 1; two 10000s are enough. Below 20000 greedy is always best. Fill a table of the fewest coins for each amount; searching each amount separately is far too slow."},
    {"name": "A large canonical system", "args": "([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],)", "timeout": 4000,
     "show": "first_failure([1, 2, 5, 10, 20, 50, ..., 50000, 100000])",
     "why": "None. Every amount below 150,000 (the two largest coins) must be checked, so the table has 150,000 entries. Checking further, for example up to the largest coin squared, is far too slow."},
], trusted=COINS)
