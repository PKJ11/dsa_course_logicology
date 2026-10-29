import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_dynp import DECODE, EDIT, EXCHANGE, NEST, PACK, SHAPES, SQUARE, TICKETS, WAYS

S = "dynp"

# Pseudo-random numbers built inside a test's args (no random module, so CPython and Pyodide agree).
def nums(n, m, mod, add=0, seed=13):
    return f"[(k * k * {m} + k * 104729 + {seed}) % {mod} + {add} for k in range({n})]"


DEEP = ("Memoised recursion fails here: this input needs far more nested calls than Python allows (about 1,000, and only a few hundred "
        "with functools.cache in the browser). Fill a table with a loop instead (lesson 3).")


# ---------- P1: shapes of a search tree ----------

build(S, 1, "shapes", [
    {"name": "The example", "args": "(3,)", "show": "shapes(3)",
     "why": "5: with root 1, the keys 2 and 3 make 2 shapes on the right; with root 2, one key on each side makes 1; with root 3, 2 shapes on the left. 2 + 1 + 2 = 5."},
    {"name": "No keys", "args": "(0,)", "show": "shapes(0)",
     "why": "1: the empty tree is one shape. This base case makes the sum work: a root with nothing on one side multiplies by shapes(0) = 1."},
    {"name": "One key", "args": "(1,)", "show": "shapes(1)", "why": "1: a single node."},
    {"name": "Two keys", "args": "(2,)", "show": "shapes(2)", "why": "2: the root is 1 (with 2 on its right) or 2 (with 1 on its left)."},
    {"name": "Four keys", "args": "(4,)", "show": "shapes(4)",
     "why": "14 = 5 + 2 + 2 + 5: for each root, multiply the number of left shapes by the number of right shapes, then add."},
    {"name": "Ten keys", "args": "(10,)", "show": "shapes(10)", "why": "16,796. For each choice of root, multiply the number of shapes for the keys on its left by the number for the keys on its right, and add these up over all roots."},
    {"name": "25 keys", "args": "(25,)", "timeout": 2000, "show": "shapes(25)",
     "why": "Plain recursion asks for the same smaller counts again and again: about 3²⁵ calls here, which never finishes. "
            "There are only 26 different questions (0 to 25 keys). Remember each answer, or fill a list from 0 keys upwards."},
    {"name": "120 keys", "args": "(120,)", "timeout": 3000, "show": "shapes(120)",
     "why": "A number with 69 digits. Python's whole numbers hold it exactly. The work is about 120²/2 = 7,200 multiplications."},
    {"name": "200 keys", "args": "(200,)", "timeout": 3000, "show": "shapes(200)",
     "why": "A number with 117 digits. Memoised recursion is fine at this size: it goes at most 200 calls deep."},
], trusted=SHAPES)


# ---------- P2: exchanging a coin ----------

build(S, 2, "exchange", [
    {"name": "The example", "args": "(12,)", "show": "exchange(12)",
     "why": "13: exchange 12 for 6, 4 and 3, then sell all three, because none of them is worth exchanging. 6 + 4 + 3 = 13 is more than 12."},
    {"name": "Zero", "args": "(0,)", "show": "exchange(0)", "why": "0: a coin with 0 on it is worth nothing."},
    {"name": "Selling is better", "args": "(11,)", "show": "exchange(11)", "why": "11: exchanging gives 5 + 3 + 2 = 10, so sell the coin."},
    {"name": "Twice", "args": "(24,)", "show": "exchange(24)",
     "why": "27: 24 becomes 12, 8 and 6. Exchange the 12 again (13 rupees) and sell 8 and 6: 13 + 8 + 6 = 27."},
    {"name": "Every n below 40", "args": "()", "expr": "[exchange(n) for n in range(40)]", "show": "[exchange(n) for n in range(40)]",
     "why": "Every small case, one after another. If your memo is a global dict, it must still give the right answers when the function is called many times."},
    {"name": "One million", "args": "(1_000_000,)", "show": "exchange(1_000_000)", "why": "2,566,393. Plain recursion asks for the same amounts again and again and makes millions of calls here; a memo works out each amount once, a few hundred amounts in all."},
    {"name": "One billion", "args": "(1_000_000_000,)", "timeout": 2000, "show": "exchange(1_000_000_000)",
     "why": "Plain recursion makes billions of calls here. With a memo, only a few hundred different values are ever reached "
            "(n divided by products of 2, 3 and 4), so it is instant."},
    {"name": "10¹²", "args": "(10 ** 12,)", "timeout": 2000, "show": "exchange(10 ** 12)",
     "why": "A table with one entry for every amount up to n would need a million million entries. "
            "Memoisation stores only the values the recursion reaches: this is where top-down beats a table."},
    {"name": "10¹⁸", "args": "(10 ** 18,)", "timeout": 2000, "show": "exchange(10 ** 18)",
     "why": "Still only a few thousand different values, and about 60 calls deep (each call at least halves n)."},
], trusted=EXCHANGE)


# ---------- P3: ways to decode ----------

TOKENS = '["1", "2", "10", "20", "26", "7", "12", "21", "9", "15"]'
LONG = f"(''.join({TOKENS}[(k * k * 7 + k * 13 + 5) % 10] for k in range(70_000))[:100_000],)"
LONG_BAD = f"(''.join({TOKENS}[(k * k * 7 + k * 13 + 5) % 10] for k in range(70_000))[:99_990] + '30' + '1' * 8,)"
build(S, 3, "decode_ways", [
    {"name": "The example", "args": "('226',)", "show": "decode_ways('226')",
     "why": "3: 2 2 6 (BBF), 22 6 (VF) and 2 26 (BZ)."},
    {"name": "Two digits", "args": "('12',)", "show": "decode_ways('12')", "why": "2: 1 2 (AB) or 12 (L)."},
    {"name": "Only a zero", "args": "('0',)", "show": "decode_ways('0')", "why": "0: no letter has the number 0."},
    {"name": "Ten", "args": "('10',)", "show": "decode_ways('10')",
     "why": "1: only 10 (J). The 0 cannot stand alone, so it must join the digit before it."},
    {"name": "Two zeros", "args": "('100',)", "show": "decode_ways('100')",
     "why": "0: 10 uses the first 0, and the second 0 cannot stand alone or make 00."},
    {"name": "Too big to pair", "args": "('27',)", "show": "decode_ways('27')", "why": "1: 27 is not a letter, so only 2 7 (BG)."},
    {"name": "A leading zero", "args": "('06',)", "show": "decode_ways('06')", "why": "0: 06 is not a letter; only 1 to 26 without a leading zero."},
    {"name": "Zeros inside", "args": "('1201234',)", "show": "decode_ways('1201234')",
     "why": "3: the 0 forces 20, which forces 1 to stand alone; then 1 2 3 4 can be read as 1 2 3 4, 12 3 4 or 1 23 4."},
    {"name": "Forty ones", "args": "('1' * 40,)", "timeout": 2000, "show": "decode_ways('1111…1', 40 ones)",
     "why": "165,580,141. Plain recursion makes about that many calls (the counts follow the Fibonacci numbers), which is too slow. "
            "Each position needs only two earlier answers."},
    {"name": "100,000 digits", "args": LONG, "timeout": 3000, "show": "decode_ways(a string of 100,000 digits)",
     "why": "The count is a number with thousands of digits, so return it modulo 1,000,000,007. " + DEEP},
    {"name": "A bad zero near the end", "args": LONG_BAD, "timeout": 3000, "show": "decode_ways(99,990 digits, then '30', then 8 ones)",
     "why": "0: the 0 after a 3 cannot be read in any way, so there are no decodings at all, however many there were before it."},
], trusted=DECODE)


# ---------- P4: season tickets ----------

CLUSTER = "[(k // 50) * 1_000_003 + (k % 50) * ((k // 50) % 9 + 1) + 1 for k in range(100_000)]"
DENSE = "list(range(1, 100_001))"
build(S, 4, "season_tickets", [
    {"name": "The example", "args": "([1, 4, 6, 7, 8, 20], [(1, 2), (7, 7), (30, 15)])",
     "show": "season_tickets([1, 4, 6, 7, 8, 20], [(1, 2), (7, 7), (30, 15)])",
     "why": "11: a 1-day ticket on day 1 (2), a 7-day pass from day 4 that covers 4, 6, 7 and 8 (7), and a 1-day ticket on day 20 (2)."},
    {"name": "No trips", "args": "([], [(1, 2), (7, 7)])", "show": "season_tickets([], [(1, 2), (7, 7)])", "why": "0: nothing to pay for."},
    {"name": "A long pass can be cheaper", "args": "([5], [(1, 3), (7, 2)])", "show": "season_tickets([5], [(1, 3), (7, 2)])",
     "why": "2: the 7-day pass costs less than the 1-day ticket, so buy it even for one trip. Try every pass at every step."},
    {"name": "Far apart", "args": "([1, 100, 1000], [(1, 4), (30, 10)])", "show": "season_tickets([1, 100, 1000], [(1, 4), (30, 10)])",
     "why": "12: three 1-day tickets. No pass covers two of these trips."},
    {"name": "The last day of a pass", "args": "([1, 7, 8], [(7, 5), (1, 3)])", "show": "season_tickets([1, 7, 8], [(7, 5), (1, 3)])",
     "why": "8: a 7-day pass bought on day 1 covers days 1 to 7, not day 8. If you got 5, your pass covers one day too many."},
    {"name": "Passes in any order", "args": "([2, 3, 4, 10, 11, 12, 40], [(30, 20), (1, 4), (3, 7)])",
     "show": "season_tickets([2, 3, 4, 10, 11, 12, 40], [(30, 20), (1, 4), (3, 7)])",
     "why": "18: a 3-day pass from day 2 and one from day 10 (7 each), and a 1-day ticket on day 40 (4)."},
    {"name": "100,000 trips in clusters", "args": f"({CLUSTER}, [(1, 2), (7, 9), (30, 25), (365, 200)])", "timeout": 3000,
     "show": "season_tickets(100,000 trips spread over 2 × 10⁹ days, 4 passes)",
     "why": "The days go up to about 2,000,000,000, so a table with one entry per calendar day is far too big. Keep one entry per trip, "
            "and find the first trip a pass does not cover with binary search (bisect) or a pointer per pass. " + DEEP},
    {"name": "100,000 trips in a row", "args": f"({DENSE}, [(1, 2), (7, 9), (30, 25), (100_000, 150_000)])", "timeout": 3000,
     "show": "season_tickets(days 1 to 100,000, with a 100,000-day pass)",
     "why": "Walking forward one trip at a time to find where a pass ends costs up to 100,000 steps per trip with the long pass: "
            "about 5 × 10⁹ steps in all. Use binary search, or keep a pointer per pass that only moves forward."},
], trusted=TICKETS)


# ---------- P5: the largest free square ----------

YARD = ('["".join("#" if (r * 31 + c * 17 + r * c) % 23 == 0 or (r // 70 + c // 90) % 5 == 0 and (r + c) % 4 == 0 else "." '
        'for c in range(700)) for r in range(700)]')
build(S, 5, "largest_square", [
    {"name": "The example", "args": "(['#..#.', '.....', '.#...', '.#...'],)", "show": "largest_square(['#..#.', '.....', '.#...', '.#...'])",
     "why": "3: rows 1 to 3, columns 2 to 4 (counting from 0). No 4 × 4 square is free."},
    {"name": "All track", "args": "(['##', '##'],)", "show": "largest_square(['##', '##'])", "why": "0: no free cell at all."},
    {"name": "One free cell", "args": "(['###', '#.#', '###'],)", "show": "largest_square(['###', '#.#', '###'])", "why": "1: the single free cell in the middle is a square of side 1."},
    {"name": "No rows", "args": "([],)", "show": "largest_square([])", "why": "0: an empty yard."},
    {"name": "One row", "args": "(['..#...'],)", "show": "largest_square(['..#...'])",
     "why": "1: a row of free cells is not a square. Only 1 × 1 fits in one row."},
    {"name": "A long strip is not a square", "args": "(['......', '......', '#.#.#.'],)", "show": "largest_square(['......', '......', '#.#.#.'])",
     "why": "2: the free area 6 wide and 2 tall holds a 2 × 2 square, not more. Count squares, not rectangles."},
    {"name": "In the bottom-right corner", "args": "(['#....', '#.#..', '##...', '#....', '.#...'],)",
     "show": "largest_square(['#....', '#.#..', '##...', '#....', '.#...'])",
     "why": "3: rows 2 to 4, columns 2 to 4. A cell's square reaches up and to the left, so the biggest one ends in the bottom-right part of the grid."},
    {"name": "700 × 700, all free", "args": "(['.' * 700] * 700,)", "timeout": 4000, "show": "largest_square(700 rows of 700 free cells)",
     "why": "700. Growing a square from every cell and checking it costs about n³ = 343 million steps here. "
            "The table needs one step per cell: 490,000."},
    {"name": "700 × 700 yard", "args": f"({YARD},)", "timeout": 4000, "show": "largest_square(a 700 × 700 yard with scattered track)",
     "why": "One pass over the cells with the rule 1 + the smallest of the three neighbours above, to the left and above-left."},
], trusted=SQUARE)


# ---------- P6: nesting boxes ----------

BOXES = f"list(zip({nums(100_000, 7919, 1_000_000, 1)}, {nums(100_000, 104723, 999_983, 1, 7)}))"
build(S, 6, "nest", [
    {"name": "The example", "args": "([(5, 4), (6, 4), (6, 7), (2, 3)],)", "show": "nest([(5, 4), (6, 4), (6, 7), (2, 3)])",
     "why": "3: (2, 3) inside (5, 4) inside (6, 7). (6, 4) cannot hold (5, 4): the heights are equal."},
    {"name": "Same width", "args": "([(3, 1), (3, 2), (3, 3)],)", "show": "nest([(3, 1), (3, 2), (3, 3)])",
     "why": "1: boxes with the same width never nest. If you sorted by width and then by height, both rising, the heights 1, 2, 3 look like "
            "a chain of 3. Sort equal widths by height, falling."},
    {"name": "Same height", "args": "([(1, 5), (2, 5), (3, 5)],)", "show": "nest([(1, 5), (2, 5), (3, 5)])",
     "why": "1: the heights must be strictly smaller too."},
    {"name": "No boxes", "args": "([],)", "show": "nest([])", "why": "0: with no boxes there is nothing to nest."},
    {"name": "One box", "args": "([(4, 4)],)", "show": "nest([(4, 4)])", "why": "1: a single box is a chain of one."},
    {"name": "Equal boxes", "args": "([(2, 3), (2, 3), (2, 3)],)", "show": "nest([(2, 3), (2, 3), (2, 3)])", "why": "1: a box does not fit inside an equal box."},
    {"name": "No turning", "args": "([(2, 5), (4, 3)],)", "show": "nest([(2, 5), (4, 3)])",
     "why": "1: (2, 5) would fit inside (4, 3) only if you turned it, and boxes keep their direction."},
    {"name": "Ten in a chain", "args": "([(7, 8), (1, 2), (9, 10), (3, 4), (2, 3), (10, 11), (5, 6), (4, 5), (8, 9), (6, 7)],)",
     "show": "nest([(7, 8), (1, 2), (9, 10), (3, 4), (2, 3), (10, 11), (5, 6), (4, 5), (8, 9), (6, 7)])",
     "why": "10: every box fits in the next larger one. The input order does not matter."},
    {"name": "100,000 boxes", "args": f"({BOXES},)", "timeout": 3000, "show": "nest(100,000 boxes with scattered sizes)",
     "why": "The O(n²) table compares every pair: 5 × 10⁹ comparisons here. Sort, then find the longest rising run of heights with binary search (lesson 6): O(n log n)."},
    {"name": "100,000 boxes that all nest", "args": "([(k, 2 * k) for k in range(100_000, 0, -1)],)", "timeout": 3000,
     "show": "nest([(100000, 200000), (99999, 199998), ..., (1, 2)])", "why": "100000: one chain of every box."},
], trusted=NEST)


# ---------- P7: edit distance ----------

def letters(n, m, add, mod=11):
    return f"''.join('abcd'[(k * k * {m} + k * {add} + 1) % {mod} % 4] for k in range({n}))"


build(S, 7, "edit_distance", [
    {"name": "The example", "args": "('kitten', 'sitting')", "show": "edit_distance('kitten', 'sitting')",
     "why": "3: replace k with s, replace e with i, insert g at the end."},
    {"name": "From nothing", "args": "('', 'abc')", "show": "edit_distance('', 'abc')", "why": "3: insert all three letters. This is row 0 of the table."},
    {"name": "To nothing", "args": "('abc', '')", "show": "edit_distance('abc', '')", "why": "3: delete all three letters. This is column 0 of the table."},
    {"name": "The same", "args": "('same', 'same')", "show": "edit_distance('same', 'same')", "why": "0: the words are already equal, so no change is needed."},
    {"name": "Horse to ros", "args": "('horse', 'ros')", "show": "edit_distance('horse', 'ros')",
     "why": "3: replace h with r, delete r, delete e."},
    {"name": "Intention to execution", "args": "('intention', 'execution')", "show": "edit_distance('intention', 'execution')", "why": "5: for example delete i, change n to e, change t to x, insert c, change n to u. Each delete, insert or change costs 1."},
    {"name": "Shifted by one", "args": "('abcdefghijklmnop', 'bcdefghijklmnopq')", "show": "edit_distance('abcdefghijklmnop', 'bcdefghijklmnopq')",
     "why": "2: delete a at the front and insert q at the end. Replacing all 16 letters would cost 16."},
    {"name": "Nothing in common, 14 letters", "args": "('a' * 14, 'b' * 14)", "timeout": 2000, "show": "edit_distance('aaaaaaaaaaaaaa', 'bbbbbbbbbbbbbb')",
     "why": "14: replace every letter. Plain recursion tries three choices at every mismatch, millions of calls for 14 letters. "
            "There are only 15 × 15 different pairs of prefixes."},
    {"name": "1,000 letters each", "args": f"({letters(1000, 7, 3)}, {letters(1000, 13, 5)})", "timeout": 4000,
     "show": "edit_distance(two strings of 1,000 letters)",
     "why": "A table of 1,001 × 1,001 cells, filled row by row. Keep two rows if you like; the answer is the bottom-right cell. " + DEEP},
    {"name": "Different lengths", "args": f"({letters(1000, 5, 1)}, {letters(400, 3, 7)})", "timeout": 4000,
     "show": "edit_distance(1,000 letters, 400 letters)", "why": "At least 600: the longer string must lose 600 letters."},
], trusted=EDIT)


# ---------- P8: ways to pay ----------

build(S, 8, "ways_to_pay", [
    {"name": "The example", "args": "(5, [1, 2, 5])", "show": "ways_to_pay(5, [1, 2, 5])",
     "why": "4: 5, 2 + 2 + 1, 2 + 1 + 1 + 1 and 1 + 1 + 1 + 1 + 1."},
    {"name": "Order does not matter", "args": "(4, [1, 2, 3])", "show": "ways_to_pay(4, [1, 2, 3])",
     "why": "4: 1+1+1+1, 1+1+2, 2+2 and 1+3. If you got 7, you counted 1+1+2, 1+2+1 and 2+1+1 as different: "
            "loop over the coins on the outside and the amounts on the inside."},
    {"name": "Cannot be paid", "args": "(3, [2])", "show": "ways_to_pay(3, [2])", "why": "0: only even amounts can be made from 2s."},
    {"name": "Amount 0", "args": "(0, [7])", "show": "ways_to_pay(0, [7])", "why": "1: pay with no coins at all. This is the base case ways[0] = 1."},
    {"name": "One coin, exactly", "args": "(10, [10])", "show": "ways_to_pay(10, [10])", "why": "1: the one way is a single 10 coin."},
    {"name": "Coins in any order", "args": "(11, [5, 1, 2])", "show": "ways_to_pay(11, [5, 1, 2])",
     "why": "11. The order of the coins in the list does not change the count."},
    {"name": "A dollar in cents", "args": "(100, [1, 5, 10, 25, 50])", "show": "ways_to_pay(100, [1, 5, 10, 25, 50])",
     "why": "292: a well-known count of the ways to change a dollar."},
    {"name": "₹100,000 in Indian coins and notes", "args": "(100_000, [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000])", "timeout": 3000,
     "show": "ways_to_pay(100000, [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000])",
     "why": "A 25-digit number. One list of 100,001 counts, updated once per coin. " + DEEP},
    {"name": "50,000 with 30 odd coins", "args": "(50_000, list(range(3, 63, 2)))", "timeout": 3000,
     "show": "ways_to_pay(50000, [3, 5, 7, ..., 61])", "why": "A 64-digit number: 30 passes over 50,001 counts."},
], trusted=WAYS)


# ---------- P9: which items to pack ----------

PACK_CHECK = ("(lambda it, cap: (lambda r: (lambda ok: [ok, ok and sum(it[i][0] for i in r) <= cap, sum(it[i][1] for i in r) if ok else None])"
              "(len(set(r)) == len(r) and all(type(i) is int and 0 <= i < len(it) for i in r)))(list(pack(list(it), cap))))(*args)")
PACK_SHOW = "[valid positions?, within the bag?, total value]"
BIG_ITEMS = "[((k * 37 + 11) % 97 + 3, (k * k * 13 + 7) % 200 + 1) for k in range(100)]"
MANY_ITEMS = "[((k * k * 7 + 3) % 61 + 20, (k * 31 + 5) % 90 + 10) for k in range(200)]"
build(S, 9, "pack", [
    {"name": "The example", "args": "([(3, 4), (4, 5), (2, 3)], 7)", "expr": PACK_CHECK, "show": f"pack([(3, 4), (4, 5), (2, 3)], 7): {PACK_SHOW}",
     "why": "[True, True, 9]: items 0 and 1 weigh 7 and are worth 9. The answer [0, 1] is checked by its facts, so any best choice passes."},
    {"name": "Nothing fits", "args": "([(5, 10)], 4)", "expr": PACK_CHECK, "show": f"pack([(5, 10)], 4): {PACK_SHOW}", "why": "[True, True, 0]: return []."},
    {"name": "No items", "args": "([], 10)", "expr": PACK_CHECK, "show": f"pack([], 10): {PACK_SHOW}", "why": "[True, True, 0]: return []."},
    {"name": "Everything fits", "args": "([(1, 2), (2, 3), (3, 4)], 6)", "expr": PACK_CHECK, "show": f"pack([(1, 2), (2, 3), (3, 4)], 6): {PACK_SHOW}",
     "why": "[True, True, 9]: take all three."},
    {"name": "Greedy fails", "args": "([(6, 30), (3, 14), (4, 16), (2, 9)], 10)", "expr": PACK_CHECK,
     "show": f"pack([(6, 30), (3, 14), (4, 16), (2, 9)], 10): {PACK_SHOW}",
     "why": "[True, True, 46]: items 0 and 2 weigh 10 exactly. Taking the best value per kilogram first gives items 0 and 1, worth only 44."},
    {"name": "Equal weights", "args": "([(2, 1), (2, 5), (2, 3), (2, 4)], 4)", "expr": PACK_CHECK,
     "show": f"pack([(2, 1), (2, 5), (2, 3), (2, 4)], 4): {PACK_SHOW}", "why": "[True, True, 9]: room for two items, so take the two most valuable."},
    {"name": "Each item once", "args": "([(1, 10), (5, 12)], 3)", "expr": PACK_CHECK, "show": f"pack([(1, 10), (5, 12)], 3): {PACK_SHOW}",
     "why": "[True, True, 10]: item 0 can be taken only once. A list with 0 three times is not a valid answer."},
    {"name": "100 items, bag of 2,500", "args": f"({BIG_ITEMS}, 2500)", "expr": PACK_CHECK, "timeout": 3000,
     "show": f"pack(100 items, 2500): {PACK_SHOW}",
     "why": "Trying all 2¹⁰⁰ choices is impossible. Fill the table, keep every row (or a record of each choice), then walk back from the last row (lesson 9)."},
    {"name": "200 items, bag of 3,000", "args": f"({MANY_ITEMS}, 3000)", "expr": PACK_CHECK, "timeout": 4000,
     "show": f"pack(200 items, 3000): {PACK_SHOW}",
     "why": "201 rows of 3,001 cells. To walk back, compare each row with the one above: a change means the item was taken."},
], trusted=PACK)
