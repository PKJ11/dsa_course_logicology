from tb import build

S = "bigo"

# P1 has_pair_sum
build(S, 1, "has_pair_sum", [
    {"name": "A pair exists", "args": "([40, 25, 60, 15], 75)", "show": "a = [40, 25, 60, 15], target = 75", "trace": [40, 25, 60, 15],
     "why": "60 + 15 = 75, so the answer is True. If you got False, check that every value is compared with the values before it, not only with its neighbour."},
    {"name": "No pair", "args": "([40, 25, 60, 15], 50)", "show": "a = [40, 25, 60, 15], target = 50",
     "why": "No two loads add up to 50. If you got True, the code may be pairing a value with itself: 25 + 25 = 50, but there is only one 25."},
    {"name": "The same value twice", "args": "([5, 3, 5], 10)", "show": "a = [5, 3, 5], target = 10",
     "why": "The two 5s are at different positions, so they make a pair. If you got False, the code may add every value to the set before checking, or check a set built from the whole list without counting copies. Check first, then add."},
    {"name": "One value cannot pair with itself", "args": "([5, 1], 10)", "show": "a = [5, 1], target = 10",
     "why": "5 + 5 = 10, but there is only one 5. If you got True, the set already held 5 when you checked it. Check whether target - x is in the set before you add x."},
    {"name": "Empty and single", "args": "()", "expr": "[has_pair_sum([], 0), has_pair_sum([7], 7)]", "expect": "[False, False]", "show": "has_pair_sum([], 0) and has_pair_sum([7], 7)",
     "why": "With fewer than two values there is no pair. An IndexError means the code reads a[0] or a[1] without checking the length first."},
    {"name": "Negative values", "args": "([-4, 9, 13], 5)", "show": "a = [-4, 9, 13], target = 5",
     "why": "-4 + 9 = 5. Loads here can be negative (they are changes in weight). The set method works for any whole numbers, so nothing special is needed."},
    {"name": "100,000 values, no pair", "args": "(list(range(0, 200_000, 2)), 1)", "expect": "False", "timeout": 4000, "show": "a = [0, 2, 4, …, 199998], target = 1 (all even, so no pair)",
     "why": "Checking every pair is about 5 billion additions. Keep a set of the values seen so far: for each x, check whether target - x is already in it. One pass, O(n) on average."},
    {"name": "100,000 values, pair at the end", "args": "(list(range(0, 200_000, 2)) + [-199_997], 1)", "expect": "True", "timeout": 4000, "show": "a = [0, 2, …, 199998, -199997], target = 1",
     "why": "199998 + (-199997) = 1. The pair uses the very last value. If this timed out, the code compares pairs one by one."},
], trusted="""
def has_pair_sum(a, target):
    seen = set()
    for x in a:
        if target - x in seen:
            return True
        seen.add(x)
    return False
""")

# P2 count_steps
build(S, 2, "count_steps", [
    {"name": "n = 0", "args": "(0,)", "show": "count_steps(0)", "why": "No loop runs, so work(0) returns 0. Check that your formula gives 0 here."},
    {"name": "n = 1", "args": "(1,)", "show": "count_steps(1)", "why": "The first part runs once (adding 1) and the second part once (adding 2): 3. If you got 2 or 4, check where the inner loop starts: j starts at i, not at i + 1."},
    {"name": "n = 3", "args": "(3,)", "show": "count_steps(3)",
     "why": "First part: the inner loop runs 3, 2, 1 times, which is 6. Second part: 3 passes adding 2 each, which is 6. Total 12. If you got 9, you counted the inner loop as n(n - 1)/2: j starts at i, so it is n(n + 1)/2."},
    {"name": "n = 10", "args": "(10,)", "show": "count_steps(10)",
     "why": "55 + 20 = 75. If you got 70 or 65, the second loop adds 2 each pass, not 1."},
    {"name": "Whole-number answer", "args": "(7,)", "expr": "type(count_steps(args[0])).__name__", "expect": "'int'", "show": "the type of count_steps(7)",
     "why": "The answer must be an int. n * (n + 1) / 2 gives a float such as 28.0. Use // for whole-number division: n * (n + 1) is always even, so nothing is lost."},
    {"name": "n = 1,000,000", "args": "(1_000_000,)", "timeout": 2000, "show": "count_steps(1000000)",
     "why": "Running the loops takes about 500 billion steps. Work out the count with a formula instead: 1 + 2 + … + n = n(n + 1)/2, plus 2n for the second loop."},
    {"name": "n = 10¹⁸", "args": "(10 ** 18,)", "timeout": 2000, "show": "count_steps(10**18)",
     "why": "A float cannot hold this answer exactly, so n * (n + 1) / 2 is wrong in the last digits. Python ints have no size limit: use n * (n + 1) // 2."},
], trusted="""
def count_steps(n):
    return n * (n + 1) // 2 + 2 * n
""")

# P3 dedupe
build(S, 3, "dedupe", [
    {"name": "Repeats", "args": "(['BCT', 'HWH', 'BCT', 'MAS', 'HWH'],)", "show": "codes = ['BCT', 'HWH', 'BCT', 'MAS', 'HWH']", "trace": ["BCT", "HWH", "BCT", "MAS", "HWH"],
     "why": "Keep each code the first time it appears, in the order it appears: BCT, HWH, MAS. If the order is different, you may have used list(set(codes)), which loses the order."},
    {"name": "No repeats", "args": "(['A', 'B', 'C'],)", "show": "codes = ['A', 'B', 'C']",
     "why": "Nothing repeats, so the answer is a copy of the input. If a code is missing, the check that decides whether a code was seen is wrong, for example it looks at the code itself after adding it."},
    {"name": "All the same", "args": "(['X', 'X', 'X'],)", "show": "codes = ['X', 'X', 'X']",
     "why": "Only the first X is kept: ['X']. If you got [] or all three, the seen-check runs at the wrong time: check first, then add the code to the set."},
    {"name": "Empty", "args": "([],)", "show": "codes = []", "why": "No codes in, no codes out: []. If this failed, the code probably reads codes[0] before checking that the list has any codes."},
    {"name": "Input not changed", "args": "(['A', 'B', 'A'],)", "expr": "(lambda a: [dedupe(a), a])(args[0])", "show": "a = ['A', 'B', 'A']; returns [dedupe(a), a]",
     "why": "Return a new list and leave the input alone. If the second list changed, the code removed values from the input."},
    {"name": "100,000 codes, half repeated", "args": "([f'C{(i * 7919) % 50_000}' for i in range(100_000)],)", "timeout": 4000, "show": "codes = 100,000 codes, 50,000 different ones",
     "why": "Checking `if c not in out` on a list checks out value by value, which is about 2.5 billion checks here. Keep a set of the codes kept so far beside the output list."},
], trusted="""
def dedupe(codes):
    seen = set()
    out = []
    for c in codes:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return out
""")

# P4 DynArray
def fill(n_expr):
    return f"(lambda d: [[d.append(x) for x in args[0]], {n_expr}][1])(DynArray())"

STATE = fill("[d.size, d.capacity, d.copies]")
build(S, 4, "DynArray", [
    {"name": "A new list", "args": "([],)", "expr": STATE, "show": "d = DynArray(); [d.size, d.capacity, d.copies]",
     "why": "A new DynArray holds nothing, has room for 1, and has copied nothing: [0, 1, 0]. Check the starting values in __init__."},
    {"name": "Five appends", "args": "([10, 20, 30, 40, 50],)", "expr": STATE, "show": "append 10, 20, 30, 40, 50; then [size, capacity, copies]",
     "why": "Room goes 1 → 2 → 4 → 8. The copies are 1 + 2 + 4 = 7. If capacity is 5 or 6, the room grows by a fixed amount instead of doubling. If copies is wrong, add the number of values moved on each copy."},
    {"name": "Values read back", "args": "([10, 20, 30, 40, 50],)", "expr": fill("[d.get(i) for i in range(d.size)]"), "show": "append 10, 20, 30, 40, 50; then d.get(0) … d.get(4)",
     "why": "Each value must still be there after the copies. If you see None, a copy left values behind: copy every slot from 0 to size - 1 into the new list."},
    {"name": "Exactly full", "args": "(list(range(8)),)", "expr": STATE, "show": "append 8 values; [size, capacity, copies]",
     "why": "8 values fit exactly in room for 8, so no ninth copy happens: [8, 8, 7]. If capacity is 16, the code doubles one append too early. Grow only when an append finds the list full."},
    {"name": "One more than full", "args": "(list(range(9)),)", "expr": STATE, "show": "append 9 values; [size, capacity, copies]",
     "why": "The ninth append finds the list full, doubles to 16 and copies 8: 7 + 8 = 15 copies."},
    {"name": "Real storage", "args": "(list(range(5)),)", "expr": fill("[len(d.slots), d.slots[:d.size]]"), "show": "append 0 … 4; [len(d.slots), d.slots[:d.size]]",
     "why": "slots must be a list whose length is the capacity, with the values at the front. If its length equals the size, you are using append on slots: make it [None] * capacity and write into it by index."},
    {"name": "200,000 appends", "args": "(list(range(200_000)),)", "expr": STATE, "timeout": 5000, "show": "append 0 … 199,999; [size, capacity, copies]",
     "why": "Doubling copies fewer than 2n values in total. If this timed out, the room grows by a fixed amount, so the copies add up to about n² / 2 (n times n, halved): 20 billion for this test."},
], trusted="""
class DynArray:
    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.copies = 0
        self.slots = [None]
    def append(self, x):
        if self.size == self.capacity:
            new = [None] * (2 * self.capacity)
            for i in range(self.size):
                new[i] = self.slots[i]
            self.copies += self.size
            self.slots = new
            self.capacity *= 2
        self.slots[self.size] = x
        self.size += 1
    def get(self, i):
        return self.slots[i]
""")

# P5 master theorem
build(S, 5, "master", [
    {"name": "Merge sort: 2, 2, 1", "args": "(2, 2, 1)", "show": "master(2, 2, 1)",
     "why": "a = 2 and bᵈ (d copies of b multiplied together) = 2¹ = 2, so every level does the same work: n log n, which is (1, 1). If you got (1, 0), the equal case is missing its log."},
    {"name": "Binary search: 1, 2, 0", "args": "(1, 2, 0)", "show": "master(1, 2, 0)",
     "why": "a = 1 and bᵈ = 2⁰ = 1: equal, so Θ(n⁰ log n) = Θ(log n), which is (0, 1). Check that the code handles d = 0."},
    {"name": "Leaves decide: 4, 2, 1", "args": "(4, 2, 1)", "show": "master(4, 2, 1)",
     "why": "a = 4 is more than bᵈ = 2, so the bottom level decides: p = log₂ 4 = 2. If you got (1, 0), the cases are the wrong way round: when a is more than bᵈ, the leaves decide."},
    {"name": "Karatsuba: 3, 2, 1", "args": "(3, 2, 1)", "show": "master(3, 2, 1)",
     "why": "a = 3 is more than 2, so p = log₂ 3, about 1.585. Use math.log(a, b) and round it to 3 decimal places with round(p, 3)."},
    {"name": "Top level decides: 2, 2, 2", "args": "(2, 2, 2)", "show": "master(2, 2, 2)",
     "why": "a = 2 is less than bᵈ = 4, so the top level decides: Θ(n²), which is (2, 0). If you got (1, 1) or (2, 1), the code treats this as the equal case: compare a with b ** d."},
    {"name": "Top level decides: 1, 2, 1", "args": "(1, 2, 1)", "show": "master(1, 2, 1)",
     "why": "One half-size call plus n work: n + n/2 + n/4 + … stays below 2n, so Θ(n), which is (1, 0)."},
    {"name": "Base 3: 9, 3, 2", "args": "(9, 3, 2)", "show": "master(9, 3, 2)",
     "why": "3² = 9, so this is the equal case: (2, 1). Compare a with b ** d using whole numbers. Comparing log values as floats can be off by a tiny amount."},
    {"name": "Base 5: 125, 5, 3", "args": "(125, 5, 3)", "show": "master(125, 5, 3)",
     "why": "5³ = 125, so this is the equal case: (3, 1). In floating point, math.log(125, 5) is 3.0000000000000004, which is not equal to 3. Compare a with b ** d as whole numbers instead."},
    {"name": "Odd one: 7, 2, 2", "args": "(7, 2, 2)", "show": "master(7, 2, 2)",
     "why": "7 is more than 4, so p = log₂ 7, about 2.807. This is Strassen's matrix method from the DVCQ station."},
], trusted="""
import math
def master(a, b, d):
    if a < b ** d:
        return (d, 0)
    if a == b ** d:
        return (d, 1)
    return (round(math.log(a, b), 3), 0)
""")
