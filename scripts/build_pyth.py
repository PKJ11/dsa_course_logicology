from tb import build

S = "pyth"

# P1 rotate
build(S, 1, "rotate", [
    {"name": "Rotate by 1", "args": '(["BCT", "HWH", "MAS", "SBC"], 1)', "show": 'board = ["BCT", "HWH", "MAS", "SBC"], k = 1', "trace": ["BCT", "HWH", "MAS", "SBC"],
     "why": "The simplest case failed. The first value should move to the end. Check that you return board[k:] + board[:k], in that order. board[:k] + board[k:] gives back the board unchanged."},
    {"name": "Rotate by 2", "args": '(["BCT", "HWH", "MAS", "SBC"], 2)', "show": 'board = ["BCT", "HWH", "MAS", "SBC"], k = 2', "trace": ["BCT", "HWH", "MAS", "SBC"],
     "why": "Rotating by 2 moves the first two values to the end, keeping their order. If you got them reversed, you moved them one at a time to the front instead of the back."},
    {"name": "Rotate by 0", "args": '(["BCT", "HWH", "MAS"], 0)', "show": 'board = ["BCT", "HWH", "MAS"], k = 0',
     "why": "With k = 0 nothing moves. A loop that always runs at least once, or an off-by-one in a slice, would move one value."},
    {"name": "k equals the length", "args": '(["BCT", "HWH", "MAS"], 3)', "show": 'board = ["BCT", "HWH", "MAS"], k = 3',
     "why": "Rotating by the full length gives the same board back. Your answer is probably right only by luck for small k. Use k % len(board), the remainder after dividing, which here is 0."},
    {"name": "k bigger than the length", "args": '(["BCT", "HWH", "MAS", "SBC"], 6)', "show": 'board = ["BCT", "HWH", "MAS", "SBC"], k = 6',
     "why": "Rotating by 6 on a board of 4 is the same as rotating by 6 % 4 = 2. Without the %, board[6:] is empty and board[:6] is the whole board, so nothing moves."},
    {"name": "Empty board", "args": "([], 3)", "show": "board = [], k = 3",
     "why": "With an empty board, k % len(board) divides by zero and raises ZeroDivisionError. Check for an empty board first, and return []."},
    {"name": "One value", "args": '(["NDLS"], 5)', "show": 'board = ["NDLS"], k = 5',
     "why": "One value rotated by any amount is unchanged. If this fails but larger boards pass, look at how you handle the remainder when the length is 1."},
    {"name": "The input is not changed", "args": '([1, 2, 3, 4],)', "expr": "(lambda b: [rotate(b, 1), b])(args[0])", "show": "b = [1, 2, 3, 4]; returns [rotate(b, 1), b]",
     "why": "The function must return a new list and leave the board it was given as it was. If the second list is changed, you used pop, insert or append on the input. Work on a slice, which is a copy."},
    {"name": "A million entries, k = 999,999", "args": "(list(range(1_000_000)), 999_999)", "expect": "[999_999] + list(range(999_999))", "timeout": 6000,
     "show": "board = [0, 1, 2, …, 999999], k = 999999",
     "why": "Moving one value at a time, k times, with pop(0) and append is far too slow here: each pop(0) moves every other value. Two slices do the whole job in one pass."},
], trusted="""
def rotate(board, k):
    if not board:
        return []
    k %= len(board)
    return board[k:] + board[:k]
""")

# P2 running totals
build(S, 2, "running_totals", [
    {"name": "Three values", "args": "([4, 9, 2],)", "show": "a = [4, 9, 2]", "trace": [4, 9, 2],
     "why": "The simplest case failed. Entry i of the answer is a[0] + a[1] + … + a[i]. Check that you add each value to a running total and append the total, not the value."},
    {"name": "Starts the total at zero", "args": "([5, 5, 5, 5],)", "show": "a = [5, 5, 5, 5]", "trace": [5, 5, 5, 5],
     "why": "If every entry is off by the same amount, the running total did not start at 0. If the answer is one entry short or long, the loop range is off by one."},
    {"name": "Negative values", "args": "([3, -5, 4, -1],)", "show": "a = [3, -5, 4, -1]", "trace": [3, -5, 4, -1],
     "why": "Totals can go down. If this fails, your code probably skips or changes negative values."},
    {"name": "One value", "args": "([7],)", "show": "a = [7]",
     "why": "With one value the answer is [7]. Code that treats a[0] specially and then loops from index 1 often breaks here or on the empty list."},
    {"name": "Empty list", "args": "([],)", "show": "a = []",
     "why": "An empty list has no totals, so return []. An IndexError means the code reads a[0] before checking that the list is not empty."},
    {"name": "The input is not changed", "args": "([1, 2, 3],)", "expr": "(lambda a: [running_totals(a), a])(args[0])", "show": "a = [1, 2, 3]; returns [running_totals(a), a]",
     "why": "Build a new list. If the second list changed, your code wrote the totals into the input (for example a[i] += a[i - 1]). That changes the caller's data."},
    {"name": "200,000 values", "args": "([i % 7 - 3 for i in range(200_000)],)", "expect": "list(__import__('itertools').accumulate([i % 7 - 3 for i in range(200_000)]))", "timeout": 4000,
     "show": "a = [-3, -2, -1, 0, 1, 2, 3, -3, …] (200,000 values)",
     "why": "Computing each entry with sum(a[:i + 1]) adds up the same values again and again: about 20 billion additions here. Keep one running total and add one value per step instead."},
], trusted="""
def running_totals(a):
    out, s = [], 0
    for x in a:
        s += x
        out.append(s)
    return out
""")

# P3 first repeat
build(S, 3, "first_repeat", [
    {"name": "A repeat in the middle", "args": '(["BCT", "HWH", "MAS", "HWH", "BCT"],)', "show": 'codes = ["BCT", "HWH", "MAS", "HWH", "BCT"]', "trace": ["BCT", "HWH", "MAS", "HWH", "BCT"],
     "why": "HWH is seen a second time at index 3, before BCT is seen again at index 4. So the answer is HWH. Keep a set of codes seen so far, and stop at the first code already in it."},
    {"name": "First to repeat, not first to appear", "args": '(["A", "B", "B", "A"],)', "show": 'codes = ["A", "B", "B", "A"]', "trace": ["A", "B", "B", "A"],
     "why": "A appears first, but B is the first code to appear a second time. If you returned A, your code finds the first code that has a repeat somewhere later. Scan once, left to right, and return as soon as a code is already in the set."},
    {"name": "Two in a row", "args": '(["NDLS", "NDLS"],)', "show": 'codes = ["NDLS", "NDLS"]',
     "why": "The repeat is right next to the first copy. If this fails, the check happens after adding the code to the set, so every code looks seen. Check first, then add."},
    {"name": "No repeats", "args": '(["BCT", "HWH", "MAS"],)', "show": 'codes = ["BCT", "HWH", "MAS"]',
     "why": "With no repeats, return None. If you got an error, the code reads past the end. If you got a code, the check is wrong."},
    {"name": "Empty list", "args": "([],)", "show": "codes = []",
     "why": "No codes means no repeats: return None. If this failed with an error, the code reads codes[0] before checking that the list has any codes. If it returned something else, check what the function returns after the loop ends."},
    {"name": "Case matters", "args": '(["bct", "BCT", "bct"],)', "show": 'codes = ["bct", "BCT", "bct"]',
     "why": "'bct' and 'BCT' are different strings. Do not change the case of the codes."},
    {"name": "100,000 codes, repeat at the end", "args": '([f"S{i}" for i in range(100_000)] + ["S5"],)', "expect": "'S5'", "timeout": 4000,
     "show": 'codes = ["S0", "S1", …, "S99999", "S5"]',
     "why": "Checking `code in codes[:i]` or `code in seen_list` searches a list each time: about 5 billion checks here. A set answers `in` without searching, so the whole scan is fast."},
], trusted="""
def first_repeat(codes):
    seen = set()
    for c in codes:
        if c in seen:
            return c
        seen.add(c)
    return None
""")

# P4 codes seen once (re-posed 2026-10-26: counting itself is lesson 4's own figure)
build(S, 4, "single_codes", [
    {"name": "A few codes", "args": '(["BCT", "HWH", "BCT", "MAS", "HWH", "SBC"],)', "show": 'codes = ["BCT", "HWH", "BCT", "MAS", "HWH", "SBC"]',
     "why": "MAS and SBC appear once each, in that order. If BCT or HWH is in your answer too, the code kept a code the first time it was seen, before knowing whether it comes again. Count every code first, then make a second pass."},
    {"name": "Order kept", "args": '(["SBC", "MAS", "NDLS", "MAS"],)', "show": 'codes = ["SBC", "MAS", "NDLS", "MAS"]',
     "why": "Keep the codes in the order they appear: SBC, then NDLS. If the order is different, the answer was built from a set, which keeps no order. Go through codes again, or through the dictionary's keys, which keep the order they were added in."},
    {"name": "All repeated", "args": '(["A", "B", "A", "B"],)', "show": 'codes = ["A", "B", "A", "B"]',
     "why": "Every code appears twice, so none is kept: []. If you got ['A', 'B'], the code removed the repeats instead of keeping only the codes seen once."},
    {"name": "No repeats", "args": '(["X", "Y", "Z"],)', "show": 'codes = ["X", "Y", "Z"]',
     "why": "Each code appears once, so all three are kept, in order. If one is missing, the check is wrong: keep a code when its count is exactly 1."},
    {"name": "Empty list", "args": "([],)", "show": "codes = []",
     "why": "No codes: return an empty list, []. Returning None or {} fails this test."},
    {"name": "Three times", "args": '(["Q", "Q", "Q", "R"],)', "show": 'codes = ["Q", "Q", "Q", "R"]',
     "why": "Q appears three times, so only R is kept. If Q is in your answer, the code switches a code between 'seen once' and 'seen again' at each sighting, so the third Q switches it back. Count the sightings instead."},
    {"name": "300,000 codes", "args": '(["ONE"] + [f"S{i % 1000}" for i in range(300_000)] + ["TWO"],)', "timeout": 4000,
     "show": 'codes = ["ONE", "S0", "S1", …, "S999", "S0", …, "TWO"] (300,002 codes)',
     "why": "codes.count(c) goes through the whole list. Calling it once for every code is about 300,000 × 300,000 checks. Count the codes with a dictionary in one pass, then make one more pass to pick the codes whose count is 1."},
], trusted="""
def single_codes(codes):
    counts = {}
    for c in codes:
        counts[c] = counts.get(c, 0) + 1
    return [c for c in codes if counts[c] == 1]
""")

# P5 build a train
NODE = """
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
"""
build(S, 5, "make_train", [
    {"name": "Three coaches", "args": "([3, 8, 5],)", "expr": "walk(make_train(*args))", "show": "make_train([3, 8, 5]), then walk along .next",
     "why": "Walking from the head should give 3, 8, 5. If the order is reversed, each new node was put in front of the head instead of after the last node."},
    {"name": "Returns the first node", "args": "([3, 8, 5],)", "expr": "(lambda h: [type(h).__name__, h.value])(make_train(*args))", "show": "make_train([3, 8, 5]); checks the type and value of what is returned",
     "why": "Return the head: the Node that holds the first value. Returning a list, or the last node, fails here."},
    {"name": "One coach", "args": "([42],)", "expr": "(lambda h: [h.value, h.next])(make_train(*args))", "show": "make_train([42]); returns [head.value, head.next]",
     "why": "A single node holds 42, and its next is None. If next is something else, a node was linked to itself or to a leftover node."},
    {"name": "No coaches", "args": "([],)", "show": "make_train([])",
     "why": "An empty list has no nodes, so return None. An IndexError means the code makes values[0] into a node before checking the list is empty."},
    {"name": "Each node is a new object", "args": "([1, 1, 1],)", "expr": "(lambda h: [h is h.next, h.next is h.next.next, walk(h)])(make_train(*args))", "show": "make_train([1, 1, 1]); are the nodes different objects?",
     "why": "Make a new Node for every value. If one Node object is reused, its next points to itself, and the chain never ends."},
    {"name": "The input is not changed", "args": "([4, 5, 6],)", "expr": "(lambda v: [walk(make_train(v)), v])(args[0])", "show": "v = [4, 5, 6]; returns [walk(make_train(v)), v]",
     "why": "Read the list; do not pop from it. If the second list is shorter, the code removed values from the input."},
    {"name": "100,000 coaches", "args": "(list(range(100_000)),)", "expr": "walk(make_train(*args)) == list(range(100_000))", "expect": "True", "timeout": 5000,
     "show": "make_train([0, 1, …, 99999]), then walk along .next",
     "why": "Walking from the head to the end before adding each node takes about 5 billion steps here. Keep a second name, tail, that always refers to the last node, and link each new node to it."},
], trusted=NODE + """
def make_train(values):
    head = tail = None
    for v in values:
        node = Node(v)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head
""")
